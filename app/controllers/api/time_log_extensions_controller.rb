module Api
  class TimeLogExtensionsController < BaseController
    before_action :set_time_log

    def create
      @time_log.extend_by!(params[:minutes])
      render "api/time_logs/show", status: :created
    end

    private
      def set_time_log
        @time_log = TimeLog.active.find(params[:time_log_id])
        authorize @time_log, :update?
      end
  end
end
