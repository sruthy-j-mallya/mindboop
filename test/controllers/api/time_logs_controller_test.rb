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
    @time_log.update!(is_running: false, started_at: 1.hour.ago, completed_at: 1.minute.ago)
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
    @time_log.update!(is_running: false, started_at: 1.hour.ago, completed_at: 1.minute.ago)
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

  def test_that_user_can_log_a_past_session_with_only_a_title
    freeze_time
    sign_in @user
    title = Faker::Lorem.sentence

    assert_difference "@user.time_logs.count", 1 do
      post api_time_logs_path,
        params: { mode: "manual", title:, started_at: 3.hours.ago, completed_at: 2.hours.ago }, as: :json
    end

    assert_response :created
    time_log = response.parsed_body["time_log"]
    assert_nil time_log["task_id"]
    assert_equal title, time_log["title"]
    assert_equal false, time_log["is_running"]
    assert_equal 1.hour.to_i, time_log["accumulated_elapsed_seconds"]
    assert_equal 3.hours.ago, Time.zone.parse(time_log["started_at"])
    assert_equal 2.hours.ago, Time.zone.parse(time_log["completed_at"])
  end

  def test_that_user_can_log_a_past_session_on_a_task
    freeze_time
    sign_in @user

    assert_difference "@task.time_logs.count", 1 do
      post api_time_logs_path,
        params: { mode: "manual", task_id: @task.id, started_at: 30.minutes.ago, completed_at: 10.minutes.ago }, as: :json
    end

    assert_response :created
    assert_equal @task.id, response.parsed_body["time_log"]["task_id"]
    assert_equal @task.title, response.parsed_body["time_log"]["task_title"]
  end

  def test_that_a_session_cannot_be_logged_more_than_24_hours_back
    freeze_time
    sign_in @user

    assert_no_difference "TimeLog.count" do
      post api_time_logs_path,
        params: { mode: "manual", title: Faker::Lorem.word, started_at: 25.hours.ago, completed_at: 24.hours.ago }, as: :json
    end

    assert_response :unprocessable_content
    assert_equal "Started at can't be more than 24 hours ago", response.parsed_body["error"]
  end

  def test_that_a_session_cannot_be_logged_into_the_future
    freeze_time
    sign_in @user

    assert_no_difference "TimeLog.count" do
      post api_time_logs_path,
        params: { mode: "manual", title: Faker::Lorem.word, started_at: 1.hour.ago, completed_at: 1.hour.from_now }, as: :json
    end

    assert_response :unprocessable_content
    assert_equal "Completed at can't be in the future", response.parsed_body["error"]
  end

  def test_that_a_logged_session_needs_a_title_or_a_task
    sign_in @user

    assert_no_difference "TimeLog.count" do
      post api_time_logs_path, params: { mode: "manual", started_at: 2.hours.ago, completed_at: 1.hour.ago }, as: :json
    end

    assert_response :unprocessable_content
    assert_equal "Title can't be blank", response.parsed_body["error"]
  end

  def test_that_a_session_cannot_be_logged_on_another_users_task
    sign_in @user

    assert_no_difference "TimeLog.count" do
      post api_time_logs_path,
        params: { mode: "manual", task_id: @other_task.id, started_at: 2.hours.ago, completed_at: 1.hour.ago }, as: :json
    end

    assert_response :forbidden
  end

  def test_that_update_moves_a_finished_session
    freeze_time
    time_log = create(:time_log, :manual, user: @user)
    sign_in @user

    patch api_time_log_path(time_log), params: { started_at: 5.hours.ago, completed_at: 3.hours.ago }, as: :json

    assert_response :ok
    time_log.reload
    assert_equal 5.hours.ago, time_log.started_at
    assert_equal 3.hours.ago, time_log.completed_at
    assert_equal 2.hours.to_i, time_log.accumulated_elapsed_seconds
  end

  def test_that_update_moves_a_session_of_a_deleted_task
    freeze_time
    time_log = create(:time_log, task: @task, started_at: 6.hours.ago, completed_at: 5.hours.ago)
    @task.discard!
    sign_in @user

    patch api_time_log_path(time_log), params: { started_at: 4.hours.ago, completed_at: 3.hours.ago }, as: :json

    assert_response :ok
    assert_equal 4.hours.ago, time_log.reload.started_at
  end

  def test_that_update_rejects_a_move_past_24_hours
    time_log = create(:time_log, :manual, user: @user)
    sign_in @user

    patch api_time_log_path(time_log), params: { started_at: 30.hours.ago, completed_at: 29.hours.ago }, as: :json

    assert_response :unprocessable_content
    assert_equal "Started at can't be more than 24 hours ago", response.parsed_body["error"]
  end

  def test_that_update_rejects_a_running_session
    sign_in @user

    patch api_time_log_path(@time_log), params: { started_at: 2.hours.ago, completed_at: 1.hour.ago }, as: :json

    assert_response :unprocessable_content
    assert_equal "Only a finished session can be moved.", response.parsed_body["error"]
    assert_nil @time_log.reload.completed_at
  end

  def test_that_create_rejects_a_session_while_another_is_running
    sign_in @user

    assert_no_difference "TimeLog.count" do
      post api_time_logs_path, params: { task_id: @task.id, mode: "timer", timer_preset: 15 }, as: :json
    end

    assert_response :unprocessable_content
    assert_equal TimeLog::OVERLAP_ERROR, response.parsed_body["error"]
  end

  def test_that_a_logged_session_cannot_overlap_another
    freeze_time
    create(:time_log, :manual, user: @user, started_at: 3.hours.ago, completed_at: 2.hours.ago)
    sign_in @user

    assert_no_difference "TimeLog.count" do
      post api_time_logs_path,
        params: { mode: "manual", title: Faker::Lorem.sentence, started_at: 150.minutes.ago, completed_at: 90.minutes.ago },
        as: :json
    end

    assert_response :unprocessable_content
    assert_equal TimeLog::OVERLAP_ERROR, response.parsed_body["error"]
  end

  def test_that_update_rejects_a_move_onto_another_session
    freeze_time
    create(:time_log, :manual, user: @user, started_at: 3.hours.ago, completed_at: 2.hours.ago)
    time_log = create(:time_log, :manual, user: @user, started_at: 6.hours.ago, completed_at: 5.hours.ago)
    sign_in @user

    patch api_time_log_path(time_log), params: { started_at: 150.minutes.ago, completed_at: 90.minutes.ago }, as: :json

    assert_response :unprocessable_content
    assert_equal TimeLog::OVERLAP_ERROR, response.parsed_body["error"]
    assert_equal 6.hours.ago, time_log.reload.started_at
  end

  def test_that_update_returns_401_when_signed_out
    time_log = create(:time_log, :manual, user: @user)

    patch api_time_log_path(time_log), params: { started_at: 5.hours.ago, completed_at: 3.hours.ago }, as: :json

    assert_response :unauthorized
  end

  def test_that_update_returns_403_for_another_users_time_log
    time_log = create(:time_log, :manual)
    sign_in @user

    patch api_time_log_path(time_log), params: { started_at: 5.hours.ago, completed_at: 3.hours.ago }, as: :json

    assert_response :forbidden
  end
end
