require "test_helper"

class Api::TimeLogRestorationsControllerTest < ActionDispatch::IntegrationTest
  def setup
    @user = create(:user)
    @time_log = create(:time_log, :manual, user: @user, discarded_at: Time.current)
    @other_time_log = create(:time_log, :manual, discarded_at: Time.current)
  end

  def test_that_create_restores_a_deleted_session
    sign_in @user

    post api_time_log_restoration_path(@time_log)

    assert_response :created
    assert_nil @time_log.reload.discarded_at
    assert_equal @time_log.id, response.parsed_body.dig("time_log", "id")
  end

  def test_that_create_refuses_a_session_whose_time_was_taken_since
    create(:time_log, :manual, user: @user, started_at: @time_log.started_at, completed_at: @time_log.completed_at)
    sign_in @user

    post api_time_log_restoration_path(@time_log)

    assert_response :unprocessable_content
    assert_equal TimeLog::OVERLAP_ERROR, response.parsed_body["error"]
    assert @time_log.reload.discarded?
  end

  def test_that_create_returns_404_for_a_session_that_is_not_deleted
    @time_log.undiscard!
    sign_in @user

    post api_time_log_restoration_path(@time_log)

    assert_response :not_found
    assert response.parsed_body["error"].present?
  end

  def test_that_create_returns_404_for_a_discarded_running_session
    running_log = create(:time_log, task: create(:task, user: @user), discarded_at: Time.current)
    sign_in @user

    post api_time_log_restoration_path(running_log)

    assert_response :not_found
    assert running_log.reload.discarded?
  end

  def test_that_create_returns_401_when_signed_out
    post api_time_log_restoration_path(@time_log)

    assert_response :unauthorized
    assert @time_log.reload.discarded?
  end

  def test_that_create_returns_403_for_another_users_session
    sign_in @user

    post api_time_log_restoration_path(@other_time_log)

    assert_response :forbidden
    assert @other_time_log.reload.discarded?
  end
end
