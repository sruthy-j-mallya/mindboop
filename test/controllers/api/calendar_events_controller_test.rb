require "test_helper"

class Api::CalendarEventsControllerTest < ActionDispatch::IntegrationTest
  def setup
    freeze_time
    @user = create(:user)
    @from = Time.current.beginning_of_week
    @to = @from + 1.week
    @task = create(:task, user: @user, starts_at: @from + 1.day)
    @time_log = create(:time_log, :manual, user: @user, started_at: 2.hours.ago, completed_at: 1.hour.ago)
  end

  def test_that_it_lists_the_open_tasks_and_time_logs_in_the_range
    task_log = create(:time_log, task: @task, started_at: 30.minutes.ago)
    create(:task, user: @user, starts_at: @to + 1.day)
    create(:task, user: @user)
    create(:task, user: @user, starts_at: @from + 2.days, is_completed: true)
    create(:time_log, :manual, user: @user, started_at: 4.hours.ago, completed_at: 3.hours.ago).discard!
    sign_in @user

    get api_calendar_events_path, params: { from: @from.iso8601, to: @to.iso8601 }

    assert_response :ok
    assert_equal [ @task.id ], response.parsed_body["tasks"].pluck("id")
    assert_equal [ @time_log.id, task_log.id ].sort, response.parsed_body["time_logs"].pluck("id").sort
  end

  def test_that_time_logs_of_a_deleted_task_are_listed
    task = create(:task, user: @user)
    time_log = create(:time_log, task:, started_at: 4.hours.ago, completed_at: 3.hours.ago)
    task.discard!
    sign_in @user

    get api_calendar_events_path, params: { from: @from.iso8601, to: @to.iso8601 }

    listed = response.parsed_body["time_logs"].find { |log| log["id"] == time_log.id }
    assert_equal task.title, listed["task_title"]
    assert_equal true, listed["is_task_deleted"]
  end

  def test_that_a_duration_started_before_the_range_is_listed
    task = create(:task, user: @user, is_duration: true, starts_at: @from - 2.days, ends_at: @from + 1.day)
    sign_in @user

    get api_calendar_events_path, params: { from: @from.iso8601, to: @to.iso8601 }

    assert_includes response.parsed_body["tasks"].pluck("id"), task.id
  end

  def test_that_it_leaves_out_other_users_events
    create(:task, starts_at: @from + 1.day)
    create(:time_log, :manual, started_at: 2.hours.ago, completed_at: 1.hour.ago)
    sign_in @user

    get api_calendar_events_path, params: { from: @from.iso8601, to: @to.iso8601 }

    assert_equal [ @task.id ], response.parsed_body["tasks"].pluck("id")
    assert_equal [ @time_log.id ], response.parsed_body["time_logs"].pluck("id")
  end

  def test_that_an_invalid_range_is_rejected
    sign_in @user

    get api_calendar_events_path, params: { from: @to.iso8601, to: @from.iso8601 }

    assert_response :unprocessable_content
    assert_equal "Pick a range of up to 1100 days, with from before to.", response.parsed_body["error"]
  end

  def test_that_a_range_over_1100_days_is_rejected
    sign_in @user

    get api_calendar_events_path, params: { from: @from.iso8601, to: (@from + 1101.days).iso8601 }

    assert_response :unprocessable_content
  end

  def test_that_it_returns_401_when_signed_out
    get api_calendar_events_path, params: { from: @from.iso8601, to: @to.iso8601 }

    assert_response :unauthorized
  end
end
