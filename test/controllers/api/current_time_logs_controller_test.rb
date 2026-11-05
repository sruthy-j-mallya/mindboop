require "test_helper"

class Api::CurrentTimeLogsControllerTest < ActionDispatch::IntegrationTest
  def setup
    @user = create(:user)
    @task = create(:task, user: @user)
  end

  def test_that_show_returns_401_when_signed_out
    get api_current_time_log_path

    assert_response :unauthorized
  end

  def test_that_show_returns_the_most_recently_started_time_log
    create(:time_log, task: @task, started_at: 2.hours.ago)
    latest = create(:time_log, task: @task, started_at: 1.hour.ago)
    create(:time_log, task: @task, started_at: 3.hours.ago)
    sign_in @user

    get api_current_time_log_path

    assert_response :ok
    assert_equal latest.id, response.parsed_body["time_log"]["id"]
  end

  def test_that_show_returns_null_when_there_is_no_time_log
    sign_in @user

    get api_current_time_log_path

    assert_response :ok
    assert response.parsed_body.key?("time_log")
    assert_nil response.parsed_body["time_log"]
  end

  def test_that_show_skips_completed_and_deleted_time_logs
    create(:time_log, task: @task, completed_at: Time.current)
    create(:time_log, task: @task, discarded_at: Time.current)
    create(:time_log, task: create(:task, user: @user, discarded_at: Time.current))
    sign_in @user

    get api_current_time_log_path

    assert_response :ok
    assert_nil response.parsed_body["time_log"]
  end

  def test_that_show_ignores_other_users_time_logs
    create(:time_log)
    sign_in @user

    get api_current_time_log_path

    assert_response :ok
    assert_nil response.parsed_body["time_log"]
  end
end
