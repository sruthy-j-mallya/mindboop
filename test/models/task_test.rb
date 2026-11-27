require "test_helper"

class TaskTest < ActiveSupport::TestCase
  def setup
    @task = create(:task)
  end

  def test_that_title_is_required
    assert_not build(:task, title: "").valid?
  end

  def test_that_a_blank_description_is_saved_as_nil
    assert_nil build(:task, description: "  \n ").description
  end

  def test_that_description_is_stripped
    assert_equal "**Focus**", build(:task, description: "  **Focus**\n").description
  end

  def test_that_description_cannot_exceed_the_maximum_length
    assert build(:task, description: "a" * Task::MAX_DESCRIPTION_LENGTH).valid?
    assert_not build(:task, description: "a" * (Task::MAX_DESCRIPTION_LENGTH + 1)).valid?
  end

  def test_that_estimated_minutes_must_be_a_positive_integer
    assert_not build(:task, estimated_minutes: 0).valid?
    assert_not build(:task, estimated_minutes: 1.5).valid?
    assert_not build(:task, estimated_minutes: Task::MAX_ESTIMATED_MINUTES + 1).valid?
    assert build(:task, estimated_minutes: Task::MAX_ESTIMATED_MINUTES).valid?
    assert build(:task, estimated_minutes: nil).valid?
  end

  def test_that_flags_cannot_be_null
    assert_not build(:task, is_completed: nil).valid?
  end

  def test_that_a_task_can_be_scheduled_for_a_date
    assert build(:task, starts_at: 1.day.from_now, is_all_day: true).valid?
  end

  def test_that_a_duration_needs_a_start_and_an_end
    starts_at = 1.day.from_now

    assert build(:task, is_duration: true, starts_at:, ends_at: starts_at + 1.hour).valid?
    assert_not build(:task, is_duration: true, starts_at:).valid?
    assert_not build(:task, is_duration: true, ends_at: starts_at).valid?
  end

  def test_that_only_a_duration_has_an_end
    starts_at = 1.day.from_now

    assert_not build(:task, starts_at:, ends_at: starts_at + 1.hour).valid?
  end

  def test_that_a_duration_cannot_end_before_it_starts
    starts_at = 1.day.from_now

    assert build(:task, is_duration: true, starts_at:, ends_at: starts_at).valid?
    assert_not build(:task, is_duration: true, starts_at:, ends_at: starts_at - 1.minute).valid?
  end

  def test_that_a_timed_start_cannot_be_in_the_past
    freeze_time

    assert build(:task, starts_at: Time.current).valid?
    assert build(:task, starts_at: Task::TIMED_START_GRACE.ago).valid?

    task = build(:task, starts_at: Task::TIMED_START_GRACE.ago - 1.minute)
    assert_not task.valid?
    assert_includes task.errors[:starts_at], "can't be in the past"
  end

  def test_that_an_all_day_start_may_be_earlier_today_where_the_user_is
    freeze_time

    assert build(:task, is_all_day: true, starts_at: 12.hours.ago).valid?
    assert_not build(:task, is_all_day: true, starts_at: Task::ALL_DAY_START_GRACE.ago - 1.minute).valid?
  end

  def test_that_an_overdue_task_can_be_edited_without_moving_its_start
    task = create(:task, :backdated, is_duration: true, starts_at: 2.days.ago, ends_at: 1.day.ago)

    assert task.update(title: Faker::Lorem.sentence, ends_at: 1.day.from_now, is_completed: true)
    assert_not task.update(starts_at: 1.day.ago)
  end

  def test_that_discarding_sets_discarded_at_and_keeps_the_checklist_items
    item = create(:checklist_item, task: @task)

    @task.discard!

    assert @task.reload.discarded_at.present?
    assert_not_includes Task.kept, @task
    assert ChecklistItem.exists?(item.id)
  end

  def test_that_a_task_with_invalid_data_can_still_be_discarded
    @task.update_column(:title, "")

    @task.discard!

    assert @task.reload.discarded?
  end

  def test_that_checklist_items_are_ordered_by_position_not_creation_time
    second = create(:checklist_item, task: @task, position: 1, created_at: 1.hour.ago)
    first = create(:checklist_item, task: @task, position: 0, created_at: 1.hour.from_now)

    assert_equal [ first, second ], @task.checklist_items.to_a
  end

  def test_that_checklist_items_leave_out_discarded_ones
    kept = create(:checklist_item, task: @task)
    create(:checklist_item, task: @task).discard!

    assert_equal [ kept ], @task.reload.checklist_items.to_a
  end

  def test_that_destroying_a_user_destroys_their_tasks_and_checklist_items
    create(:checklist_item, task: @task)
    create(:checklist_item, task: @task).discard!

    assert_difference "Task.count", -1 do
      assert_difference "ChecklistItem.count", -2 do
        @task.user.destroy!
      end
    end
  end

  def test_that_deleting_a_task_logs_its_running_session
    freeze_time
    time_log = create(:time_log, task: @task, started_at: 10.minutes.ago, is_running: true,
      current_run_started_at: 10.minutes.ago)

    @task.discard!

    time_log.reload
    assert time_log.kept?
    assert_not time_log.is_running?
    assert_equal Time.current, time_log.completed_at
    assert_equal 10.minutes.to_i, time_log.accumulated_elapsed_seconds
    assert_not @task.reload.is_completed?
  end

  def test_that_deleting_a_task_discards_a_running_session_too_short_to_log
    time_log = create(:time_log, task: @task, started_at: 1.minute.ago, is_running: true,
      current_run_started_at: 1.minute.ago)

    @task.discard!

    assert time_log.reload.discarded?
  end

  def test_that_deleting_a_task_keeps_its_finished_time_logs
    time_log = create(:time_log, task: @task, started_at: 2.hours.ago, completed_at: 1.hour.ago)

    @task.discard!

    assert time_log.reload.kept?
    assert_equal 1.hour.ago.to_i, time_log.completed_at.to_i
  end

  def test_that_a_task_can_be_in_one_of_its_users_areas
    task = create(:task)
    task.life_area = create(:life_area, user: task.user)

    assert task.valid?
  end

  def test_that_a_task_cannot_be_in_another_users_area
    task = create(:task)
    task.life_area = create(:life_area)

    assert_not task.valid?
    assert_includes task.errors[:life_area], "must exist"
  end

  def test_that_a_task_cannot_be_put_in_a_deleted_area
    task = create(:task)
    task.life_area = create(:life_area, user: task.user, discarded_at: Time.current)

    assert_not task.valid?
    assert_equal [ "must exist" ], task.errors[:life_area]
  end

  def test_that_a_completed_task_stays_in_its_deleted_area
    life_area = create(:life_area)
    task = create(:task, user: life_area.user, life_area:, is_completed: true)
    life_area.discard!

    task.reload.update!(title: Faker::Lorem.sentence)

    assert_equal life_area, task.reload.life_area
  end

  def test_that_a_task_reopened_after_its_area_was_deleted_goes_to_the_inbox
    life_area = create(:life_area)
    task = create(:task, user: life_area.user, life_area:, is_completed: true)
    life_area.discard!

    task.reload.update!(is_completed: false)

    assert_nil task.reload.life_area_id
  end

  def test_that_a_task_restored_after_its_area_was_deleted_goes_to_the_inbox
    life_area = create(:life_area)
    task = create(:task, user: life_area.user, life_area:)
    task.discard!
    life_area.discard!

    task.reload.undiscard!

    assert_nil task.reload.life_area_id
  end

  def test_that_a_task_cannot_be_in_an_unknown_area
    task = create(:task)
    task.life_area_id = SecureRandom.uuid

    assert_not task.valid?
    assert_includes task.errors[:life_area], "must exist"
  end

  def test_that_due_between_and_overdue_at_never_share_a_task
    from = Time.zone.local(2026, 11, 25)
    to = from + 1.day
    today = create(:task, :backdated, starts_at: from, is_all_day: true)
    ends_today = create(:task, :backdated, is_duration: true, starts_at: from - 3.days, ends_at: from)
    late_today = create(:task, :backdated, starts_at: to - 1.second)
    yesterday = create(:task, :backdated, starts_at: from - 1.day, is_all_day: true)
    tomorrow = create(:task, :backdated, starts_at: to)

    assert_equal [ today, ends_today, late_today ].to_set, Task.due_between(from, to).to_set
    assert_equal [ yesterday ], Task.overdue_at(from).to_a
    assert_not_includes Task.due_between(from, to), tomorrow
  end

  def test_that_by_end_puts_the_task_that_ended_first_first
    due_later = create(:task, :backdated, starts_at: 2.days.ago)
    ended_earlier = create(:task, :backdated, is_duration: true, starts_at: 6.days.ago, ends_at: 4.days.ago)
    due_between = create(:task, :backdated, starts_at: 3.days.ago)

    assert_equal [ ended_earlier, due_between, due_later ], Task.where.not(starts_at: nil).by_end.to_a
  end

  def test_that_by_latest_breadcrumb_lists_tasks_with_breadcrumbs_once_newest_first
    other = create(:task)
    create(:breadcrumb, task: @task, created_at: 5.days.ago)
    create(:breadcrumb, task: other, created_at: 2.days.ago)
    create(:breadcrumb, task: @task, created_at: 1.day.ago)
    create(:task)

    assert_equal [ @task, other ], Task.by_latest_breadcrumb.to_a
  end
end
