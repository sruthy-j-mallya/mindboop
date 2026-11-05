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
end
