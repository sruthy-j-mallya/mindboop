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

  def test_that_a_new_item_is_parked
    assert @item.parked?
  end

  def test_that_an_unknown_status_is_invalid
    assert build(:parking_lot_item, status: "snoozed").invalid?
  end

  def test_that_an_item_can_belong_to_its_users_session_only
    assert build(:parking_lot_item, user: @item.user, time_log: create(:time_log, task: create(:task, user: @item.user))).valid?
    assert build(:parking_lot_item, user: @item.user, time_log: create(:time_log)).invalid?
  end

  def test_that_destroying_the_session_keeps_the_item
    time_log = create(:time_log, task: create(:task, user: @item.user))
    @item.update!(time_log:)

    time_log.destroy!

    assert_nil @item.reload.time_log_id
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

  def test_that_convert_to_task_can_schedule_the_task
    starts_at = 1.day.from_now.beginning_of_hour

    @item.convert_to_task!(starts_at:)

    assert_equal starts_at, @item.task.starts_at
  end

  def test_that_an_invalid_schedule_converts_nothing
    assert_raises ActiveRecord::RecordInvalid do
      @item.convert_to_task!(is_duration: true)
    end

    assert @item.reload.parked?
  end

  def test_that_start_curiosity_time_runs_for_the_curiosity_minutes
    freeze_time do
      @item.start_curiosity_time!

      assert_equal ParkingLotItem::CURIOSITY_MINUTES.minutes.from_now, @item.curiosity_ends_at
    end
  end

  def test_that_a_user_runs_one_curiosity_time_at_a_time
    @item.start_curiosity_time!
    other_item = create(:parking_lot_item, user: @item.user)

    assert_raises ActiveRecord::RecordInvalid do
      other_item.start_curiosity_time!
    end

    assert_includes other_item.errors.full_messages, "Finish your current curiosity time first"
  end

  def test_that_another_users_curiosity_time_does_not_block
    @item.start_curiosity_time!

    assert_nothing_raised { create(:parking_lot_item).start_curiosity_time! }
  end

  def test_that_curiosity_time_extends_once
    @item.start_curiosity_time!
    ends_at = @item.curiosity_ends_at

    @item.extend_curiosity_time!

    assert_equal ends_at + ParkingLotItem::CURIOSITY_MINUTES.minutes, @item.curiosity_ends_at
    assert_raises(ActiveRecord::RecordInvalid) { @item.extend_curiosity_time! }
  end

  def test_that_extending_after_the_time_is_up_counts_from_now
    @item.start_curiosity_time!

    travel 1.hour do
      @item.extend_curiosity_time!

      assert_equal ParkingLotItem::CURIOSITY_MINUTES.minutes.from_now.to_i, @item.curiosity_ends_at.to_i
    end
  end

  def test_that_dealing_with_an_item_ends_its_curiosity_time
    @item.start_curiosity_time!
    @item.update!(status: :addressed)

    assert_nil @item.curiosity_ends_at

    other_item = create(:parking_lot_item, user: @item.user)
    other_item.start_curiosity_time!
    other_item.discard!

    assert_nil other_item.reload.curiosity_ends_at
  end
end
