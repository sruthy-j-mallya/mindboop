module Api
  class ParkingLotItemsController < BaseController
    before_action :set_parking_lot_item, only: %i[ update destroy ]

    def index
      items = ParkingLotItems::FilterService.new(policy_scope(ParkingLotItem).kept, params.slice(:status, :time_log_id)).process
      # Oldest first; id breaks created_at ties, so an item can't repeat or go missing across pages.
      @pagy, @parking_lot_items = pagy(items.order(:created_at, :id))
    end

    def create
      authorize ParkingLotItem
      @parking_lot_item = Current.user.parking_lot_items.create!(params.permit(:content, :time_log_id))
      render :show, status: :created
    end

    def update
      @parking_lot_item.update!(params.permit(:content, :status))
      render :show
    end

    def destroy
      @parking_lot_item.discard!
      head :no_content
    end

    private
      def set_parking_lot_item
        @parking_lot_item = ParkingLotItem.kept.find(params[:id])
        authorize @parking_lot_item
      end
  end
end
