require "test_helper"

class Api::HomeTasksControllerTest < ActionDispatch::IntegrationTest
  def setup
    @user = create(:user)
    @from = Time.zone.local(2026, 11, 25)
    @to = @from + 1.day
    travel_to @from + 12.hours
  end

  def test_that_tasks_due_or_scheduled_today_are_listed_all_day_first_then_by_start
    afternoon = create_task(starts_at: @from + 15.hours)
    earlier_today = create_task(starts_at: @from + 9.hours)
    multi_day = create_task(is_duration: true, starts_at: @from - 2.days, ends_at: @from + 2.days)
    all_day = create_task(is_all_day: true, starts_at: @from)
    last_day = create_task(is_duration: true, is_all_day: true, starts_at: @from - 1.day, ends_at: @from)
    create_task(starts_at: @to)
    create_task

    fetch_home

    assert_equal [ last_day, all_day, multi_day, earlier_today, afternoon ].map(&:id), listed("today")
    assert_empty listed("overdue")
  end

  def test_that_tasks_that_ended_before_today_are_overdue_oldest_first
    yesterday = create_task(starts_at: @from - 1.second)
    long_ago = create_task(is_all_day: true, starts_at: @from - 10.days)
    ended = create_task(is_duration: true, starts_at: @from - 20.days, ends_at: @from - 3.days)

    fetch_home

    assert_equal [ long_ago, ended, yesterday ].map(&:id), listed("overdue")
    assert_empty listed("today")
  end

  def test_that_tasks_with_breadcrumbs_are_resumable_latest_breadcrumb_first
    older = create_task
    newer = create_task(starts_at: @from)
    create(:breadcrumb, task: older, created_at: 2.days.ago)
    create(:breadcrumb, task: newer, created_at: 3.days.ago)
    latest = create(:breadcrumb, task: newer, created_at: 1.hour.ago)
    create_task

    fetch_home

    assert_equal [ newer.id, older.id ], listed("resumable")
    assert_equal [ newer.id ], listed("today")
    assert_equal latest.id, response.parsed_body["resumable"].first["breadcrumbs"].first["id"]
  end

  def test_that_completed_deleted_and_other_users_tasks_are_left_out
    tasks = [ @from, @from - 1.day ].flat_map do |starts_at|
      [ create_task(starts_at:, is_completed: true), create_task(starts_at:), create(:task, :backdated, starts_at:) ]
    end
    tasks.each { |task| create(:breadcrumb, task:) }
    tasks.values_at(1, 4).each(&:discard!)

    fetch_home

    assert_equal({ "today" => [], "overdue" => [], "resumable" => [] }, response.parsed_body)
  end

  def test_that_a_25_hour_day_is_accepted
    fetch_home(to: @from + 25.hours)

    assert_response :ok
  end

  def test_that_invalid_ranges_are_rejected
    invalid_ranges = [
      { to: @from + 25.hours + 1.second }, { to: @from }, { to: @from - 1.hour }, { from: "today" }, { from: nil }, { to: nil }
    ]

    invalid_ranges.each do |range|
      fetch_home(**range)

      assert_response :unprocessable_content
      assert_equal "Pick a range of up to 25 hours, with from before to.", response.parsed_body["error"]
    end
  end

  def test_that_it_returns_401_when_signed_out
    get api_home_tasks_path, params: { from: @from.iso8601, to: @to.iso8601 }

    assert_response :unauthorized
  end

  private
    def create_task(**attributes)
      create(:task, :backdated, user: @user, **attributes)
    end

    def fetch_home(from: @from, to: @to)
      sign_in @user
      get api_home_tasks_path, params: { from: from.try(:iso8601) || from, to: to.try(:iso8601) || to }.compact
    end

    def listed(name)
      response.parsed_body[name].pluck("id")
    end
end
