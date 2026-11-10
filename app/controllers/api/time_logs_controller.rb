module Api
  class TimeLogsController < BaseController
    before_action :set_time_log, only: %i[ show update destroy ]

    def index
      # id breaks created_at ties, so a time log can't repeat or go missing across pages.
      @pagy, @time_logs = pagy(filter_by_task(policy_scope(TimeLog).active).preload(:current_break).order(:created_at, :id))
    end

    def show
    end

    def create
      @time_log = Task.kept.find(params[:task_id]).time_logs.new(time_log_params)
      authorize @time_log
      @time_log.save!
      render :show, status: :created
    end

    def update
      @time_log.update!(time_log_params)
      render :show
    end

    def destroy
      @time_log.discard!
      head :no_content
    end

    private
      def set_time_log
        @time_log = TimeLog.active.find(params[:id])
        authorize @time_log
      end

      def filter_by_task(scope)
        return scope if params[:task_id].blank?

        scope.where(task_id: params[:task_id])
      end

      # task_id is left out on purpose: it's only read on create, so a log can't move to another task.
      def time_log_params
        params.permit(
          :mode, :timer_preset, :accumulated_elapsed_seconds, :is_running, :current_run_started_at,
          :started_at, :completed_at
        )
      end
  end
end
