module Api
  class TimeLogCompletionsController < BaseController
    before_action :set_time_log

    def create
      TimeLogs::CompleterService.new(@time_log).process!
      render "api/time_logs/show", status: :created
    end

    private
      def set_time_log
        @time_log = TimeLog.active.find(params[:time_log_id])
        authorize @time_log, :update?
      end
  end
end
