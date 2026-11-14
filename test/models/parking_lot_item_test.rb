require "test_helper"

class ParkingLotItemTest < ActiveSupport::TestCase
  def setup
    @item = create(:parking_lot_item)
  end

  def test_that_content_is_required
    assert build(:parking_lot_item, content: "  ").invalid?
  end

  def test_that_content_is_stripped
    assert_equal "Call mum", build(:parking_lot_item, content: "  Call mum\n").content
  end

  def test_that_content_cannot_exceed_the_maximum_length
    assert build(:parking_lot_item, content: "a" * ParkingLotItem::MAX_CONTENT_LENGTH).valid?
    assert build(:parking_lot_item, content: "a" * (ParkingLotItem::MAX_CONTENT_LENGTH + 1)).invalid?
  end

  def test_that_a_new_item_is_a_parked_idea
    assert @item.parked?
    assert @item.kind_idea?
  end

  def test_that_an_unknown_kind_or_status_is_invalid
    assert build(:parking_lot_item, kind: "worry").invalid?
    assert build(:parking_lot_item, status: "snoozed").invalid?
  end

  def test_that_only_a_converted_item_has_a_task
    task = create(:task, user: @item.user)

    assert build(:parking_lot_item, status: :converted).invalid?
    assert build(:parking_lot_item, task:).invalid?
    assert build(:parking_lot_item, status: :converted, task:).valid?
  end

  def test_that_convert_to_task_adds_a_task_titled_with_the_content
    assert_difference "@item.user.tasks.count", 1 do
      @item.convert_to_task!
    end

    assert @item.reload.converted?
    assert_equal @item.content, @item.task.title
  end

  def test_that_converting_twice_adds_one_task
    @item.convert_to_task!

    assert_no_difference "Task.count" do
      @item.convert_to_task!
    end
  end
end
