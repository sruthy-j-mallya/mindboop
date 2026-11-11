require "test_helper"

class Api::TimeLogExtensionsControllerTest < ActionDispatch::IntegrationTest
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
  end

  def test_that_user_can_extend_their_time_log
    sign_in @user

    post api_time_log_extension_path(@time_log), params: { minutes: 10 }

    assert_response :created
    assert_equal 10, response.parsed_body["time_log"]["buffer_minutes"]
    assert_equal 25, response.parsed_body["time_log"]["timer_preset"]
    assert_equal 10, @time_log.reload.buffer_minutes
  end

  def test_that_extensions_add_up
    sign_in @user

    post api_time_log_extension_path(@time_log), params: { minutes: 10 }
    post api_time_log_extension_path(@time_log), params: { minutes: 15 }

    assert_equal 25, response.parsed_body["time_log"]["buffer_minutes"]
  end

  def test_that_a_session_can_be_extended_up_to_the_limit
    sign_in @user

    post api_time_log_extension_path(@time_log), params: { minutes: 60 }

    assert_response :created
    assert_equal 60, @time_log.reload.buffer_minutes
  end

  def test_that_extending_past_the_limit_is_rejected
    @time_log.update!(buffer_minutes: 55)
    sign_in @user

    post api_time_log_extension_path(@time_log), params: { minutes: 10 }

    assert_response :unprocessable_content
    assert_equal "Buffer minutes must be less than or equal to 60", response.parsed_body["error"]
    assert_equal 55, @time_log.reload.buffer_minutes
  end

  def test_that_elapsed_time_is_kept_while_time_is_left
    sign_in @user

    freeze_time do
      @time_log.update!(current_run_started_at: 30.seconds.ago)

      post api_time_log_extension_path(@time_log), params: { minutes: 10 }

      time_log = response.parsed_body["time_log"]
      assert_equal 90, time_log["accumulated_elapsed_seconds"]
      assert_equal true, time_log["is_running"]
      assert_equal Time.current, Time.zone.parse(time_log["current_run_started_at"])
    end
  end

  def test_that_a_timer_past_zero_gets_all_the_added_time
    sign_in @user

    freeze_time do
      @time_log.update!(accumulated_elapsed_seconds: 40.minutes.to_i, current_run_started_at: 30.seconds.ago)

      post api_time_log_extension_path(@time_log), params: { minutes: 10 }

      assert_equal 25.minutes.to_i, response.parsed_body["time_log"]["accumulated_elapsed_seconds"]
      assert_equal Time.current, Time.zone.parse(response.parsed_body["time_log"]["current_run_started_at"])
    end
  end

  def test_that_invalid_minutes_are_rejected
    sign_in @user

    [ 0, -5, 1.5, "soon", nil ].each do |minutes|
      post api_time_log_extension_path(@time_log), params: { minutes: }, as: :json

      assert_response :unprocessable_content
      assert_match(/\AExtension minutes /, response.parsed_body["error"])
    end
    assert_equal 0, @time_log.reload.buffer_minutes
  end

  def test_that_a_completed_time_log_cannot_be_extended
    @time_log.complete!
    sign_in @user

    post api_time_log_extension_path(@time_log), params: { minutes: 10 }

    assert_response :unprocessable_content
    assert_equal "This session is already finished.", response.parsed_body["error"]
  end

  def test_that_a_stopwatch_cannot_be_extended
    @time_log.update!(mode: "stopwatch", timer_preset: nil)
    sign_in @user

    post api_time_log_extension_path(@time_log), params: { minutes: 10 }

    assert_response :unprocessable_content
    assert_equal "Only a timer can be extended.", response.parsed_body["error"]
  end

  def test_that_the_time_logs_endpoint_cannot_write_the_buffer
    sign_in @user

    patch api_time_log_path(@time_log), params: { buffer_minutes: 30 }

    assert_equal 0, @time_log.reload.buffer_minutes
  end

  def test_that_finishing_inside_the_buffer_is_not_finishing_early
    sign_in @user
    @time_log.update!(accumulated_elapsed_seconds: 30.minutes.to_i, is_running: false, current_run_started_at: nil)
    post api_time_log_extension_path(@time_log), params: { minutes: 10 }

    post api_time_log_completion_path(@time_log)

    assert_equal false, response.parsed_body["time_log"]["is_finished_early"]
  end

  def test_that_create_returns_401_when_signed_out
    post api_time_log_extension_path(@time_log), params: { minutes: 10 }

    assert_response :unauthorized
  end

  def test_that_create_returns_403_for_another_users_time_log
    sign_in create(:user)

    post api_time_log_extension_path(@time_log), params: { minutes: 10 }

    assert_response :forbidden
    assert_equal 0, @time_log.reload.buffer_minutes
  end

  def test_that_create_returns_404_for_a_deleted_time_log
    @time_log.discard!
    sign_in @user

    post api_time_log_extension_path(@time_log), params: { minutes: 10 }

    assert_response :not_found
  end
end
