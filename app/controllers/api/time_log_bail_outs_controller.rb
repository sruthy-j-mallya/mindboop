module Api
  class TimeLogBailOutsController < BaseController
    before_action :set_time_log

    def create
      TimeLogs::BailerService.new(@time_log, breadcrumb_params, discard_overrun:).process!
      render "api/time_logs/show", status: :created
    end

    private
      def set_time_log
        @time_log = TimeLog.kept.find(params[:time_log_id])
        authorize @time_log, :update?
      end

      def discard_overrun
        ActiveModel::Type::Boolean.new.cast(params[:discard_overrun]) || false
      end

      def breadcrumb_params
        params.permit(:completed_description, :restart_description)
      end
  end
end
