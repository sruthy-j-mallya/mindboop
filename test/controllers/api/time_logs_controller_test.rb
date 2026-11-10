require "test_helper"

class Api::TimeLogsControllerTest < ActionDispatch::IntegrationTest
  def setup
    @user = create(:user)
    @task = create(:task, user: @user)
    @time_log = create(:time_log, task: @task)
    @other_task = create(:task)
    @other_time_log = create(:time_log, task: @other_task)
  end

  def test_that_user_can_create_a_running_time_log
    freeze_time
    sign_in @user

    assert_difference "@task.time_logs.count", 1 do
      post api_time_logs_path, params: { task_id: @task.id, mode: "timer", timer_preset: 15 }, as: :json
    end

    assert_response :created
    time_log = response.parsed_body["time_log"]
    assert_equal @task.id, time_log["task_id"]
    assert_equal "timer", time_log["mode"]
    assert_equal 15, time_log["timer_preset"]
    assert_equal true, time_log["is_running"]
    assert_equal 0, time_log["accumulated_elapsed_seconds"]
    assert_equal Time.current, Time.zone.parse(time_log["started_at"])
    assert_equal Time.current, Time.zone.parse(time_log["current_run_started_at"])
    assert_nil time_log["completed_at"]
  end

  def test_that_create_ignores_timing_fields_from_the_client
    freeze_time
    sign_in @user
    sent_at = 1.hour.ago

    post api_time_logs_path, params: {
      task_id: @task.id, mode: "timer", is_running: false, accumulated_elapsed_seconds: 600,
      started_at: sent_at, current_run_started_at: sent_at, completed_at: sent_at
    }, as: :json

    assert_response :created
    time_log = TimeLog.find(response.parsed_body["time_log"]["id"])
    assert time_log.is_running?
    assert_equal 0, time_log.accumulated_elapsed_seconds
    assert_equal Time.current, time_log.started_at
    assert_equal Time.current, time_log.current_run_started_at
    assert_nil time_log.completed_at
  end

  def test_that_create_rejects_an_invalid_time_log
    sign_in @user

    assert_no_difference "TimeLog.count" do
      post api_time_logs_path, params: { task_id: @task.id, mode: "countdown" }, as: :json
    end

    assert_response :unprocessable_content
    assert_equal "Mode is not included in the list", response.parsed_body["error"]
  end

  def test_that_create_returns_401_when_signed_out
    assert_no_difference "TimeLog.count" do
      post api_time_logs_path, params: { task_id: @task.id, mode: "timer" }, as: :json
    end

    assert_response :unauthorized
  end

  def test_that_create_returns_403_for_another_users_task
    sign_in @user

    assert_no_difference "TimeLog.count" do
      post api_time_logs_path, params: { task_id: @other_task.id, mode: "timer" }, as: :json
    end

    assert_response :forbidden
  end

  def test_that_create_returns_404_for_a_deleted_task
    @task.discard!
    sign_in @user

    assert_no_difference "TimeLog.count" do
      post api_time_logs_path, params: { task_id: @task.id, mode: "timer" }, as: :json
    end

    assert_response :not_found
  end

  def test_that_create_returns_404_without_a_task
    sign_in @user

    assert_no_difference "TimeLog.count" do
      post api_time_logs_path, params: { mode: "timer" }, as: :json
    end

    assert_response :not_found
  end

  def test_that_destroy_soft_deletes_the_time_log
    sign_in @user

    assert_no_difference "TimeLog.count" do
      delete api_time_log_path(@time_log)
    end

    assert_response :no_content
    assert @time_log.reload.discarded_at.present?
  end

  def test_that_destroy_returns_401_when_signed_out
    delete api_time_log_path(@time_log)

    assert_response :unauthorized
    assert_nil @time_log.reload.discarded_at
  end

  def test_that_destroy_returns_403_for_another_users_time_log
    sign_in @user

    delete api_time_log_path(@other_time_log)

    assert_response :forbidden
    assert_nil @other_time_log.reload.discarded_at
  end

  def test_that_destroy_returns_404_for_a_deleted_time_log
    @time_log.discard!
    sign_in @user

    delete api_time_log_path(@time_log)

    assert_response :not_found
    assert response.parsed_body["error"].present?
  end
end
