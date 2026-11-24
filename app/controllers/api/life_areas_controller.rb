module Api
  class LifeAreasController < BaseController
    before_action :set_life_area, only: %i[ update destroy ]

    # Not paged: a user keeps a handful of areas, and the sidebar shows them all.
    def index
      @life_areas = policy_scope(LifeArea).in_created_order
    end

    def create
      authorize LifeArea
      @life_area = Current.user.life_areas.create!(life_area_params)
      render :show, status: :created
    end

    def update
      @life_area.update!(life_area_params)
      render :show
    end

    # The area's tasks go back to the Inbox.
    def destroy
      @life_area.destroy!
      head :no_content
    end

    private
      def set_life_area
        @life_area = LifeArea.find(params[:id])
        authorize @life_area
      end

      def life_area_params
        params.permit(:name, :color, :emoji, :default_sound)
      end
  end
end
