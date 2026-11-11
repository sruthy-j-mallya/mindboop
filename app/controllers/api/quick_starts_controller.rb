module Api
  class QuickStartsController < BaseController
    def create
      authorize Task, :create?
      @time_log = QuickStarts::CreatorService.new(Current.user, quick_start_params).process!
      render :show, status: :created
    end

    private
      def quick_start_params
        params.permit(:title, :description, :estimated_minutes, checklist_items_attributes: %i[ title is_completed ])
      end
  end
end
