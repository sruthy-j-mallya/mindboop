module Api
  class BreaksController < BaseController
    before_action :set_time_log

    def create
      @time_log.pause!(break_params)
      render "api/time_logs/show", status: :created
    end

    def update
      @time_log.resume!
      render "api/time_logs/show"
    end

    private
      def set_time_log
        @time_log = TimeLog.active.find(params[:time_log_id])
        authorize @time_log, :update?
      end

      def break_params
        params.permit(:intention, :duration_minutes)
      end
  end
end
