module Api
  # Brings back a discarded parking lot item, so a discard can be undone.
  class ParkingLotItemRestorationsController < BaseController
    before_action :set_parking_lot_item

    def create
      @parking_lot_item.undiscard!
      render "api/parking_lot_items/show", status: :created
    end

    private
      def set_parking_lot_item
        @parking_lot_item = ParkingLotItem.discarded.find(params[:parking_lot_item_id])
        authorize @parking_lot_item, :update?
      end
  end
end
