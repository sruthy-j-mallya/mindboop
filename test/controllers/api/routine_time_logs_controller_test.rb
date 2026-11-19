require "test_helper"

class Api::RoutineTimeLogsControllerTest < ActionDispatch::IntegrationTest
  def setup
    @user = create(:user)
    @routine = create(:routine, user: @user)
    @range = { from: 1.day.ago.iso8601, to: 1.minute.from_now.iso8601 }
  end

  def test_that_index_returns_the_routines_finished_sessions_in_the_range
    finished = create(:time_log, :routine, routine: @routine, started_at: 3.hours.ago, completed_at: 2.hours.ago,
      accumulated_elapsed_seconds: 3600)
    create(:time_log, :routine, routine: @routine, started_at: 3.days.ago, completed_at: 3.days.ago + 10.minutes,
      accumulated_elapsed_seconds: 600)
    create(:time_log, :routine, routine: @routine, started_at: 90.minutes.ago, completed_at: 80.minutes.ago,
      accumulated_elapsed_seconds: 600).discard!
    create(:time_log, :routine, routine: @routine, started_at: 10.minutes.ago)
    create(:time_log, :routine, routine: create(:routine, user: @user), started_at: 70.minutes.ago,
      completed_at: 60.minutes.ago, accumulated_elapsed_seconds: 600)
    sign_in @user

    get api_routine_time_logs_path(@routine), params: @range

    assert_response :ok
    time_logs = response.parsed_body["time_logs"]
    assert_equal [ finished.id ], time_logs.pluck("id")
    assert_equal [ @routine.id, @routine.title ], time_logs.first.values_at("routine_id", "routine_title")
  end

  def test_that_index_rejects_a_missing_range
    sign_in @user

    get api_routine_time_logs_path(@routine)

    assert_response :unprocessable_content
  end

  def test_that_index_returns_401_when_signed_out
    get api_routine_time_logs_path(@routine), params: @range

    assert_response :unauthorized
  end

  def test_that_index_returns_403_for_another_users_routine
    sign_in @user

    get api_routine_time_logs_path(create(:routine)), params: @range

    assert_response :forbidden
  end
end
