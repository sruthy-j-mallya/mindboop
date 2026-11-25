module Api
  # Brings back several discarded parking lot items, so a bulk let go can be undone.
  class ParkingLotItemBatchRestorationsController < BaseController
    before_action :set_parking_lot_items

    def create
      ParkingLotItem.transaction { @parking_lot_items.each(&:undiscard!) }
      render "api/parking_lot_item_batches/show", status: :created
    end

    private
      def set_parking_lot_items
        @parking_lot_items = ParkingLotItem.discarded.find(params.expect(ids: []))
        @parking_lot_items.each { |item| authorize item, :update? }
      end
  end
end
