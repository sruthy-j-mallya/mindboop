module Api
  class LifeAreasController < BaseController
    before_action :set_life_area, only: %i[ update destroy ]

    # Not paged: a user keeps a handful of areas, and the sidebar shows them all. Deleted ones are listed too, as
    # completed tasks and time logs still show theirs.
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

    # The area's uncompleted tasks move to the area given, or to the Inbox without one.
    def destroy
      LifeAreas::DiscarderService.new(@life_area, tasks_life_area:).process!
      head :no_content
    end

    private
      def set_life_area
        @life_area = LifeArea.kept.find(params[:id])
        authorize @life_area
      end

      # One of the user's other areas; anything else isn't found, so nothing is deleted.
      def tasks_life_area
        return if params[:tasks_life_area_id].blank?

        policy_scope(LifeArea).kept.excluding(@life_area).find(params[:tasks_life_area_id])
      end

      def life_area_params
        params.permit(:name, :color, :emoji, :default_sound)
      end
  end
end
