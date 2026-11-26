module Api
  # Ticks a routine's step off (or back on) for one session. Both answer with the session.
  class TimeLogStepChecksController < BaseController
    before_action :set_time_log

    def create
      @time_log.check_routine_step!(params[:routine_step_id])
      render "api/time_logs/show", status: :created
    end

    def destroy
      @time_log.uncheck_routine_step!(params[:routine_step_id])
      render "api/time_logs/show"
    end

    private
      def set_time_log
        @time_log = TimeLog.kept.find(params[:time_log_id])
        authorize @time_log, :update?
      end
  end
end
