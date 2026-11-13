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

  def test_that_discarding_keeps_the_item
    item = create(:checklist_item)

    item.discard!

    assert item.reload.discarded?
    assert_not_includes ChecklistItem.kept, item
  end

  def test_that_a_new_item_goes_after_a_discarded_one
    task = create(:task)
    create(:checklist_item, task:).discard!

    assert_equal 1, create(:checklist_item, task:).position
  end

  def test_that_move_to_reorders_the_kept_items_and_keeps_their_positions
    task = create(:task)
    first, second, third = create_list(:checklist_item, 3, task:)
    discarded = create(:checklist_item, task:)
    discarded.discard!

    third.move_to!(0)

    assert_equal [ third, first, second ], task.checklist_items.reload.to_a
    assert_equal [ 0, 1, 2 ], task.checklist_items.map(&:position)
    assert_equal 3, discarded.reload.position
  end

  def test_that_move_to_clamps_an_index_past_the_end
    task = create(:task)
    first, second = create_list(:checklist_item, 2, task:)

    first.move_to!(10)

    assert_equal [ second, first ], task.checklist_items.reload.to_a
  end

  def test_that_move_to_rejects_an_invalid_index
    item = create(:checklist_item)

    error = assert_raises(ActiveRecord::RecordInvalid) { item.move_to!("first") }
    assert_equal "Position must be a whole number of 0 or more", error.record.errors.full_messages.to_sentence
  end
end
