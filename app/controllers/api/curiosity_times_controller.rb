module Api
  # The signed-in user's curiosity time: a short timeboxed look-up on one parked thought. At most one runs at a time.
  class CuriosityTimesController < BaseController
    before_action :set_running_item, only: %i[ update destroy ]

    def show
      authorize ParkingLotItem, :index?
      @parking_lot_item = policy_scope(ParkingLotItem).in_curiosity_time.first
    end

    def create
      @parking_lot_item = ParkingLotItem.kept.parked.find(params[:parking_lot_item_id])
      authorize @parking_lot_item, :update?
      @parking_lot_item.start_curiosity_time!
      render :show, status: :created
    end

    def update
      @parking_lot_item.extend_curiosity_time!
      render :show
    end

    def destroy
      @parking_lot_item.end_curiosity_time!
      render :show
    end

    private
      def set_running_item
        @parking_lot_item = policy_scope(ParkingLotItem).in_curiosity_time.first!
        authorize @parking_lot_item, :update?
      end
  end
end
