module Api
  class TimeLogCompletionsController < BaseController
    before_action :set_time_log

    def create
      TimeLogs::CompleterService.new(@time_log, discard_overrun:).process!
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
  end
end
