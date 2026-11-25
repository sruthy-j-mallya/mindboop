module Api
  # Changes the status of, or lets go of, several parking lot items at once: all of them or none.
  class ParkingLotItemBatchesController < BaseController
    before_action :set_parking_lot_items

    def update
      ParkingLotItem.transaction do
        @parking_lot_items.each { |item| item.update!(params.permit(:status)) }
      end
      render :show
    end

    def destroy
      ParkingLotItem.transaction { @parking_lot_items.each(&:discard!) }
      head :no_content
    end

    private
      def set_parking_lot_items
        @parking_lot_items = ParkingLotItem.kept.find(params.expect(ids: []))
        @parking_lot_items.each { |item| authorize item }
      end
  end
end
