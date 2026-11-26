module Api
  # Every action answers with the whole routine, since a move also changes its siblings' order.
  class RoutineStepsController < BaseController
    before_action :set_routine
    before_action :set_step, only: %i[ update destroy ]

    def create
      RoutineStep.transaction do
        step = @routine.steps.create!(step_params)
        step.move_to!(params[:position]) if params.key?(:position)
      end
      render_routine status: :created
    end

    def update
      RoutineStep.transaction do
        @step.update!(step_params)
        @step.move_to!(params[:position]) if params.key?(:position)
      end
      render_routine
    end

    def destroy
      @step.discard!
      render_routine
    end

    private
      # Steps are part of their routine, so changing one needs permission to update the routine.
      def set_routine
        @routine = Routine.kept.find(params[:routine_id])
        authorize @routine, :update?
      end

      def set_step
        @step = @routine.steps.find(params[:id])
      end

      def step_params
        params.permit(:title)
      end

      def render_routine(status: :ok)
        @routine.steps.reset
        render "api/routines/show", status:
      end
  end
end
