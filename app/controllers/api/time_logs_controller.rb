module Api
  class TimeLogsController < BaseController
    before_action :set_time_log, only: :destroy

    def create
      @time_log = Task.kept.find(params[:task_id]).time_logs.new(time_log_params)
      @time_log.start
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
  end
end
