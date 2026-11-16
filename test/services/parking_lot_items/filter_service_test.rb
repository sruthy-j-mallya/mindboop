require "test_helper"

class ParkingLotItems::FilterServiceTest < ActiveSupport::TestCase
  def setup
    @old_item = create(:parking_lot_item, created_at: 1.hour.ago)
    @addressed_item = create(:parking_lot_item, status: :addressed)
  end

  def test_that_the_scope_is_returned_unchanged_without_filters
    assert_equal [ @old_item, @addressed_item ].sort_by(&:id), filter({}).sort_by(&:id)
  end

  def test_that_items_can_be_filtered_by_status
    assert_equal [ @addressed_item ], filter(status: "addressed").to_a
    assert_equal [ @old_item ], filter(status: "parked").to_a
  end

  def test_that_items_can_be_filtered_by_time_log
    time_log = create(:time_log, task: create(:task, user: @old_item.user))
    @old_item.update!(time_log:)

    assert_equal [ @old_item ], filter(time_log_id: time_log.id).to_a
  end

  private
    def filter(filters)
      ParkingLotItems::FilterService.new(ParkingLotItem.all, filters).process
    end
end
