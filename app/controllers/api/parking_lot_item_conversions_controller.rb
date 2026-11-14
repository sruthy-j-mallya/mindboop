module Api
  # Adds a parked thought to the Inbox as a task.
  class ParkingLotItemConversionsController < BaseController
    before_action :set_parking_lot_item

    def create
      @parking_lot_item.convert_to_task!
      render "api/parking_lot_items/show", status: :created
    end

    private
      def set_parking_lot_item
        @parking_lot_item = ParkingLotItem.kept.parked.find(params[:parking_lot_item_id])
        authorize @parking_lot_item, :update?
      end
  end
end
