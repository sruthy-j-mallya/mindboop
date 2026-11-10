module Api
  class TimeLogsController < BaseController
    before_action :set_time_log, only: :destroy

    def create
      @time_log = Task.kept.find(params[:task_id]).time_logs.new(time_log_params.merge(start_attributes))
      authorize @time_log
      @time_log.save!
      render :show, status: :created
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

      # task_id is read separately in create to find the task.
      def time_log_params
        params.permit(:mode, :timer_preset)
      end

      # A new time log always starts running now, so the client doesn't send its timing fields.
      def start_attributes
        now = Time.current
        { is_running: true, started_at: now, current_run_started_at: now }
      end
  end
end
