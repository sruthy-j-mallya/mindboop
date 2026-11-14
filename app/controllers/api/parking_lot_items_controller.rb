module Api
  class ParkingLotItemsController < BaseController
    before_action :set_parking_lot_item, only: %i[ update destroy ]

    def index
      # Newest first; id breaks created_at ties, so an item can't repeat or go missing across pages.
      items = filter_by_since(filter_by_status(policy_scope(ParkingLotItem).kept))
      @pagy, @parking_lot_items = pagy(items.order(created_at: :desc, id: :desc))
    end

    def create
      authorize ParkingLotItem
      @parking_lot_item = Current.user.parking_lot_items.create!(params.permit(:content, :kind))
      render :show, status: :created
    end

    def update
      @parking_lot_item.update!(params.permit(:content, :kind, :status))
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

      def filter_by_status(scope)
        return scope if params[:status].blank?

        scope.where(status: params[:status])
      end

      # The Timer lists only what was parked during the current session.
      def filter_by_since(scope)
        since = parse_time(params[:since])
        return scope if since.nil?

        scope.where(created_at: since..)
      end

      def parse_time(value)
        Time.zone.parse(value.to_s)
      rescue ArgumentError
        nil
      end
  end
end
