require "test_helper"

class ChecklistItemTest < ActiveSupport::TestCase
  def test_that_title_is_required
    assert_not build(:checklist_item, title: "").valid?
  end

  def test_that_a_task_is_required
    assert_not build(:checklist_item, task: nil).valid?
  end

  def test_that_is_completed_defaults_to_false
    assert_equal false, create(:checklist_item).is_completed
  end

  def test_that_is_completed_cannot_be_null
    assert_not build(:checklist_item, is_completed: nil).valid?
  end

  def test_that_position_counts_up_within_a_task
    task = create(:task)
    other_task = create(:task)

    assert_equal [ 0, 1 ], create_list(:checklist_item, 2, task:).map(&:position)
    assert_equal 0, create(:checklist_item, task: other_task).position
  end

  def test_that_a_new_item_goes_after_the_highest_position
    task = create(:task)
    create(:checklist_item, task:, position: 5)

    assert_equal 6, create(:checklist_item, task:).position
  end
end
