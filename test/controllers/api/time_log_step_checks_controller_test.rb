require "test_helper"

class Api::TimeLogStepChecksControllerTest < ActionDispatch::IntegrationTest
  def setup
    @user = create(:user)
    @routine = create(:routine, user: @user)
    @step = create(:routine_step, routine: @routine)
    @other_step = create(:routine_step, routine: @routine)
    @time_log = create(:time_log, :routine, routine: @routine)
    @foreign_time_log = create(:time_log, :routine)
    @foreign_step = create(:routine_step, routine: @foreign_time_log.routine)
  end

  def test_that_user_can_check_a_step_off_for_a_session
    sign_in @user

    post api_time_log_step_checks_path(@time_log), params: { routine_step_id: @step.id }, as: :json
    post api_time_log_step_checks_path(@time_log), params: { routine_step_id: @other_step.id }, as: :json

    assert_response :created
    assert_equal [ @step.id, @other_step.id ], response.parsed_body["time_log"]["checked_routine_step_ids"]
    assert_equal [ @step.id, @other_step.id ], @time_log.reload.checked_routine_step_ids
  end

  def test_that_checking_a_step_twice_keeps_one_tick
    @time_log.update!(checked_routine_step_ids: [ @step.id ])
    sign_in @user

    post api_time_log_step_checks_path(@time_log), params: { routine_step_id: @step.id }, as: :json

    assert_response :created
    assert_equal [ @step.id ], @time_log.reload.checked_routine_step_ids
  end

  def test_that_a_new_session_starts_with_no_steps_checked
    @time_log.update!(checked_routine_step_ids: [ @step.id ], completed_at: Time.current)

    assert_equal [], create(:time_log, :routine, routine: @routine, started_at: 1.minute.from_now).checked_routine_step_ids
  end

  def test_that_create_returns_404_for_a_step_of_another_routine
    sign_in @user

    post api_time_log_step_checks_path(@time_log), params: { routine_step_id: @foreign_step.id }, as: :json

    assert_response :not_found
    assert_equal [], @time_log.reload.checked_routine_step_ids
  end

  def test_that_create_returns_404_for_a_deleted_step
    @step.discard!
    sign_in @user

    post api_time_log_step_checks_path(@time_log), params: { routine_step_id: @step.id }, as: :json

    assert_response :not_found
  end

  def test_that_create_returns_404_for_a_session_without_a_routine
    @time_log.update!(completed_at: Time.current)
    time_log = create(:time_log, task: create(:task, user: @user), started_at: 1.minute.from_now)
    sign_in @user

    post api_time_log_step_checks_path(time_log), params: { routine_step_id: @step.id }, as: :json

    assert_response :not_found
  end

  def test_that_create_returns_401_when_signed_out
    post api_time_log_step_checks_path(@time_log), params: { routine_step_id: @step.id }, as: :json

    assert_response :unauthorized
    assert_equal [], @time_log.reload.checked_routine_step_ids
  end

  def test_that_create_returns_403_for_another_users_session
    sign_in @user

    post api_time_log_step_checks_path(@foreign_time_log), params: { routine_step_id: @foreign_step.id }, as: :json

    assert_response :forbidden
    assert_equal [], @foreign_time_log.reload.checked_routine_step_ids
  end

  def test_that_user_can_uncheck_a_step
    @time_log.update!(checked_routine_step_ids: [ @step.id, @other_step.id ])
    sign_in @user

    delete api_time_log_step_check_path(@time_log, @step.id), as: :json

    assert_response :ok
    assert_equal [ @other_step.id ], response.parsed_body["time_log"]["checked_routine_step_ids"]
  end

  def test_that_destroy_returns_401_when_signed_out
    @time_log.update!(checked_routine_step_ids: [ @step.id ])

    delete api_time_log_step_check_path(@time_log, @step.id), as: :json

    assert_response :unauthorized
    assert_equal [ @step.id ], @time_log.reload.checked_routine_step_ids
  end

  def test_that_destroy_returns_403_for_another_users_session
    @foreign_time_log.update!(checked_routine_step_ids: [ @foreign_step.id ])
    sign_in @user

    delete api_time_log_step_check_path(@foreign_time_log, @foreign_step.id), as: :json

    assert_response :forbidden
    assert_equal [ @foreign_step.id ], @foreign_time_log.reload.checked_routine_step_ids
  end
end
