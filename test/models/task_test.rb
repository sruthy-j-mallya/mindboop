require "test_helper"

class TaskTest < ActiveSupport::TestCase
  def setup
    @task = create(:task)
  end

  def test_that_title_is_required
    assert_not build(:task, title: "").valid?
  end

  def test_that_estimated_minutes_must_be_a_positive_integer
    assert_not build(:task, estimated_minutes: 0).valid?
    assert_not build(:task, estimated_minutes: 1.5).valid?
    assert build(:task, estimated_minutes: nil).valid?
  end

  def test_that_flags_cannot_be_null
    assert_not build(:task, is_completed: nil).valid?
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

  def test_that_destroying_a_user_destroys_their_tasks_and_checklist_items
    create(:checklist_item, task: @task)

    assert_difference [ "Task.count", "ChecklistItem.count" ], -1 do
      @task.user.destroy!
    end
  end
end
