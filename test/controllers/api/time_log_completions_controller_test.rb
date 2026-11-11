require "test_helper"

class Api::TimeLogCompletionsControllerTest < ActionDispatch::IntegrationTest
  def setup
    @user = create(:user)
    @task = create(:task, user: @user)
    @time_log = create(
      :time_log, task: @task, mode: "timer", timer_preset: 25, is_running: true, current_run_started_at: 1.minute.ago
    )
  end

  def test_that_user_can_complete_their_time_log_early
    sign_in @user

    assert_difference "Achievement.count", 1 do
      post api_time_log_completion_path(@time_log)
    end

    assert_response :created
    time_log = response.parsed_body["time_log"]
    assert_equal @time_log.id, time_log["id"]
    assert_not_nil time_log["completed_at"]
    assert_equal false, time_log["is_running"]
    assert_equal true, time_log["is_finished_early"]
    assert @task.reload.is_completed
    assert_equal 1, @user.achievements.early_finish.sole.count
  end

  def test_that_completing_after_the_time_runs_out_is_not_early
    @time_log.update!(current_run_started_at: 26.minutes.ago)
    sign_in @user

    assert_no_difference "Achievement.count" do
      post api_time_log_completion_path(@time_log)
    end

    assert_response :created
    assert_equal false, response.parsed_body["time_log"]["is_finished_early"]
    assert @task.reload.is_completed
  end

  def test_that_a_completed_time_log_is_no_longer_current
    sign_in @user

    post api_time_log_completion_path(@time_log)
    get api_current_time_log_path

    assert_nil response.parsed_body["time_log"]
  end

  def test_that_create_returns_401_when_signed_out
    post api_time_log_completion_path(@time_log)

    assert_response :unauthorized
    assert_nil @time_log.reload.completed_at
  end

  def test_that_create_returns_403_for_another_users_time_log
    sign_in create(:user)

    assert_no_difference "Achievement.count" do
      post api_time_log_completion_path(@time_log)
    end

    assert_response :forbidden
    assert_nil @time_log.reload.completed_at
    assert_not @task.reload.is_completed
  end

  def test_that_create_returns_404_for_a_deleted_time_log
    @time_log.discard!
    sign_in @user

    post api_time_log_completion_path(@time_log)

    assert_response :not_found
  end
end
