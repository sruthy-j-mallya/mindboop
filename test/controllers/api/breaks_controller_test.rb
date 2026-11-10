require "test_helper"

class Api::BreaksControllerTest < ActionDispatch::IntegrationTest
  def setup
    @user = create(:user)
    @time_log = create(
      :time_log,
      task: create(:task, user: @user),
      mode: "timer",
      timer_preset: 25,
      accumulated_elapsed_seconds: 60,
      is_running: true,
      current_run_started_at: 30.seconds.ago
    )
    @params = { intention: "Delivery", duration_minutes: 5 }
  end

  def test_that_user_can_pause_their_time_log
    sign_in @user

    freeze_time do
      @time_log.update!(current_run_started_at: 30.seconds.ago)

      assert_difference "Break.count", 1 do
        post api_time_log_break_path(@time_log), params: @params
      end

      assert_response :created
      time_log = response.parsed_body["time_log"]
      assert_equal false, time_log["is_running"]
      assert_nil time_log["current_run_started_at"]
      assert_equal 90, time_log["accumulated_elapsed_seconds"]
      assert_equal "Delivery", time_log["current_break"]["intention"]
      assert_equal 5, time_log["current_break"]["duration_minutes"]
      assert_equal 5.minutes.from_now, Time.zone.parse(time_log["current_break"]["ends_at"])
    end
  end

  def test_that_an_invalid_break_leaves_the_time_log_running
    sign_in @user

    assert_no_difference "Break.count" do
      post api_time_log_break_path(@time_log), params: @params.merge(duration_minutes: 16)
    end

    assert_response :unprocessable_content
    assert_equal "Duration minutes must be less than or equal to 15", response.parsed_body["error"]
    assert @time_log.reload.is_running
  end

  def test_that_a_completed_time_log_cannot_be_paused
    @time_log.complete!
    sign_in @user

    post api_time_log_break_path(@time_log), params: @params

    assert_response :unprocessable_content
    assert_equal "This session is already finished.", response.parsed_body["error"]
  end

  def test_that_pausing_twice_counts_once
    sign_in @user
    post api_time_log_break_path(@time_log), params: @params

    assert_no_difference "Break.count" do
      post api_time_log_break_path(@time_log), params: @params.merge(intention: "Snack")
    end

    assert_response :created
    assert_equal "Delivery", response.parsed_body["time_log"]["current_break"]["intention"]
    assert_equal 1, @time_log.breaks.count
  end

  def test_that_the_current_time_log_includes_the_break
    sign_in @user
    post api_time_log_break_path(@time_log), params: @params

    get api_current_time_log_path

    assert_equal "Delivery", response.parsed_body["time_log"]["current_break"]["intention"]
  end

  def test_that_user_can_end_their_break
    sign_in @user
    post api_time_log_break_path(@time_log), params: @params
    elapsed_seconds = @time_log.reload.accumulated_elapsed_seconds

    freeze_time do
      patch api_time_log_break_path(@time_log)

      assert_response :ok
      time_log = response.parsed_body["time_log"]
      assert_nil time_log["current_break"]
      assert_equal true, time_log["is_running"]
      assert_equal elapsed_seconds, time_log["accumulated_elapsed_seconds"]
      assert_equal Time.current, Time.zone.parse(time_log["current_run_started_at"])
      assert_equal Time.current, @time_log.breaks.sole.ended_at
    end
  end

  def test_that_ending_a_break_when_none_is_open_changes_nothing
    current_run_started_at = @time_log.current_run_started_at
    sign_in @user

    patch api_time_log_break_path(@time_log)

    assert_response :ok
    assert_in_delta current_run_started_at, @time_log.reload.current_run_started_at, 0.001
  end

  def test_that_completing_a_time_log_ends_its_break
    sign_in @user
    post api_time_log_break_path(@time_log), params: @params

    post api_time_log_completion_path(@time_log)

    assert_response :created
    assert_nil response.parsed_body["time_log"]["current_break"]
    assert_not_nil @time_log.breaks.sole.ended_at
  end

  def test_that_the_list_includes_the_current_break
    sign_in @user
    post api_time_log_break_path(@time_log), params: @params

    get api_time_logs_path

    assert_equal "Delivery", response.parsed_body["time_logs"].sole["current_break"]["intention"]
  end

  def test_that_create_and_update_return_401_when_signed_out
    post api_time_log_break_path(@time_log), params: @params
    assert_response :unauthorized

    patch api_time_log_break_path(@time_log)
    assert_response :unauthorized
  end

  def test_that_create_and_update_return_403_for_another_users_time_log
    sign_in create(:user)

    assert_no_difference "Break.count" do
      post api_time_log_break_path(@time_log), params: @params
    end
    assert_response :forbidden

    patch api_time_log_break_path(@time_log)
    assert_response :forbidden
  end

  def test_that_create_returns_404_for_a_deleted_time_log
    @time_log.discard!
    sign_in @user

    post api_time_log_break_path(@time_log), params: @params

    assert_response :not_found
  end
end
