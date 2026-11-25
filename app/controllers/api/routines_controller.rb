module Api
  class RoutinesController < BaseController
    before_action :set_routine, only: %i[ update destroy ]

    # Not paged: a user keeps a handful of routines, and the page shows them all with their stats.
    def index
      @routines = policy_scope(Routine).kept.with_stats.in_created_order
    end

    def create
      authorize Routine
      @routine = Current.user.routines.create!(routine_params)
      render :show, status: :created
    end

    def update
      @routine.update!(routine_params)
      render :show
    end

    # A soft delete: the routine's sessions stay on the Calendar.
    def destroy
      @routine.discard!
      head :no_content
    end

    private
      def set_routine
        @routine = Routine.kept.find(params[:id])
        authorize @routine
      end

      def routine_params
        params.permit(:title, :emoji, :color, :sound, :duration_minutes, :reminder_time, reminder_days: [])
      end
  end
end
