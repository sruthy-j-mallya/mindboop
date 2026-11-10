require "test_helper"

class Api::TimeLogsControllerTest < ActionDispatch::IntegrationTest
  def setup
    @user = create(:user)
    @task = create(:task, user: @user)
    @time_log = create(:time_log, task: @task)
    @other_task = create(:task)
    @other_time_log = create(:time_log, task: @other_task)
    @started_at = 1.hour.ago.change(usec: 0)
  end

  def test_that_index_returns_401_when_signed_out
    get api_time_logs_path

    assert_response :unauthorized
  end

  def test_that_index_returns_only_the_users_undeleted_time_logs
    deleted_time_log = create(:time_log, task: @task, discarded_at: Time.current)
    deleted_task_time_log = create(:time_log, task: create(:task, user: @user, discarded_at: Time.current))
    sign_in @user

    get api_time_logs_path

    assert_response :ok
    ids = response.parsed_body["time_logs"].pluck("id")
    assert_equal [ @time_log.id ], ids
    assert_not_includes ids, deleted_time_log.id
    assert_not_includes ids, deleted_task_time_log.id
    assert_not_includes ids, @other_time_log.id
    assert_equal 1, response.parsed_body["time_logs_count"]
  end

  def test_that_index_filters_by_task
    other_task_time_log = create(:time_log, task: create(:task, user: @user))
    sign_in @user

    get api_time_logs_path, params: { task_id: other_task_time_log.task_id }

    assert_response :ok
    assert_equal [ other_task_time_log.id ], response.parsed_body["time_logs"].pluck("id")
  end

  def test_that_index_returns_nothing_when_filtering_by_another_users_task
    sign_in @user

    get api_time_logs_path, params: { task_id: @other_task.id }

    assert_response :ok
    assert_empty response.parsed_body["time_logs"]
  end

  def test_that_index_paginates_the_time_logs_oldest_first
    time_logs = [ @time_log, *create_list(:time_log, Pagy::DEFAULT[:limit], task: @task) ]
    sign_in @user

    get api_time_logs_path

    assert_response :ok
    assert_equal time_logs.first(Pagy::DEFAULT[:limit]).map(&:id), response.parsed_body["time_logs"].pluck("id")
    assert_equal time_logs.size, response.parsed_body["time_logs_count"]
    assert_equal 1, response.parsed_body["page"]
    assert_equal 2, response.parsed_body["total_pages"]

    get api_time_logs_path, params: { page: 2 }

    assert_equal [ time_logs.last.id ], response.parsed_body["time_logs"].pluck("id")
    assert_equal 2, response.parsed_body["page"]
  end

  def test_that_show_returns_the_time_log
    sign_in @user

    get api_time_log_path(@time_log)

    assert_response :ok
    time_log = response.parsed_body["time_log"]
    assert_equal @task.id, time_log["task_id"]
    assert_equal "stopwatch", time_log["mode"]
    assert_equal false, time_log["is_running"]
    assert_not time_log.key?("discarded_at")
  end

  def test_that_show_returns_401_when_signed_out
    get api_time_log_path(@time_log)

    assert_response :unauthorized
  end

  def test_that_show_returns_403_for_another_users_time_log
    sign_in @user

    get api_time_log_path(@other_time_log)

    assert_response :forbidden
    assert response.parsed_body["error"].present?
  end

  def test_that_show_returns_404_for_a_deleted_time_log
    @time_log.discard!
    sign_in @user

    get api_time_log_path(@time_log)

    assert_response :not_found
    assert response.parsed_body["error"].present?
  end

  def test_that_show_returns_404_when_the_task_is_deleted
    @task.discard!
    sign_in @user

    get api_time_log_path(@time_log)

    assert_response :not_found
  end

  def test_that_show_returns_404_for_a_malformed_id
    sign_in @user

    get api_time_log_path("not-a-uuid")

    assert_response :not_found
  end

  def test_that_user_can_create_a_time_log
    sign_in @user

    assert_difference "@task.time_logs.count", 1 do
      post api_time_logs_path, params: {
        task_id: @task.id, mode: "timer", timer_preset: 15, is_running: true,
        started_at: @started_at, current_run_started_at: @started_at
      }, as: :json
    end

    assert_response :created
    time_log = response.parsed_body["time_log"]
    assert_equal @task.id, time_log["task_id"]
    assert_equal "timer", time_log["mode"]
    assert_equal 15, time_log["timer_preset"]
    assert_equal true, time_log["is_running"]
    assert_equal @started_at, Time.zone.parse(time_log["started_at"])
    assert_equal @started_at, Time.zone.parse(time_log["current_run_started_at"])
  end

  def test_that_create_rejects_an_invalid_time_log
    sign_in @user

    assert_no_difference "TimeLog.count" do
      post api_time_logs_path, params: { task_id: @task.id, mode: "countdown", started_at: @started_at }, as: :json
    end

    assert_response :unprocessable_content
    assert_equal "Mode is not included in the list", response.parsed_body["error"]
  end

  def test_that_create_returns_401_when_signed_out
    assert_no_difference "TimeLog.count" do
      post api_time_logs_path, params: { task_id: @task.id, mode: "timer", started_at: @started_at }, as: :json
    end

    assert_response :unauthorized
  end

  def test_that_create_returns_403_for_another_users_task
    sign_in @user

    assert_no_difference "TimeLog.count" do
      post api_time_logs_path, params: { task_id: @other_task.id, mode: "timer", started_at: @started_at }, as: :json
    end

    assert_response :forbidden
  end

  def test_that_create_returns_404_for_a_deleted_task
    @task.discard!
    sign_in @user

    assert_no_difference "TimeLog.count" do
      post api_time_logs_path, params: { task_id: @task.id, mode: "timer", started_at: @started_at }, as: :json
    end

    assert_response :not_found
  end

  def test_that_create_returns_404_without_a_task
    sign_in @user

    assert_no_difference "TimeLog.count" do
      post api_time_logs_path, params: { mode: "timer", started_at: @started_at }, as: :json
    end

    assert_response :not_found
  end

  def test_that_user_can_update_their_time_log
    completed_at = Time.current.change(usec: 0)
    sign_in @user

    patch api_time_log_path(@time_log), params: {
      accumulated_elapsed_seconds: 90, is_running: false, completed_at:
    }, as: :json

    assert_response :ok
    assert_equal 90, response.parsed_body.dig("time_log", "accumulated_elapsed_seconds")
    @time_log.reload
    assert_not @time_log.is_running
    assert_equal completed_at, @time_log.completed_at
  end

  def test_that_update_cannot_move_the_time_log_to_another_task
    sign_in @user

    patch api_time_log_path(@time_log), params: { task_id: @other_task.id, accumulated_elapsed_seconds: 1 }, as: :json

    assert_response :ok
    assert_equal @task.id, @time_log.reload.task_id
  end

  def test_that_update_rejects_invalid_values
    sign_in @user

    patch api_time_log_path(@time_log), params: { accumulated_elapsed_seconds: -1 }, as: :json

    assert_response :unprocessable_content
    assert response.parsed_body["error"].present?
  end

  def test_that_update_returns_401_when_signed_out
    patch api_time_log_path(@time_log), params: { accumulated_elapsed_seconds: 1 }, as: :json

    assert_response :unauthorized
    assert_equal 0, @time_log.reload.accumulated_elapsed_seconds
  end

  def test_that_update_returns_403_for_another_users_time_log
    sign_in @user

    patch api_time_log_path(@other_time_log), params: { accumulated_elapsed_seconds: 1 }, as: :json

    assert_response :forbidden
    assert_equal 0, @other_time_log.reload.accumulated_elapsed_seconds
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
end
