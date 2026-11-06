module Api
  class TimeLogBailOutsController < BaseController
    before_action :set_time_log

    def create
      TimeLogs::BailerService.new(@time_log, breadcrumb_params).process!
      render "api/time_logs/show", status: :created
    end

    private
      def set_time_log
        @time_log = TimeLog.active.find(params[:time_log_id])
        authorize @time_log, :update?
      end

      def breadcrumb_params
        params.permit(:completed_description, :restart_description)
      end
  end
end
