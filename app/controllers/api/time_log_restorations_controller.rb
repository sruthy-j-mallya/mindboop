module Api
  # Brings back a deleted session, so a delete from the Calendar can be undone. Only a finished session comes back: a
  # running one that was deleted was discarded from the Timer, and isn't restarted.
  class TimeLogRestorationsController < BaseController
    before_action :set_time_log

    def create
      @time_log.restore!
      render "api/time_logs/show", status: :created
    end

    private
      def set_time_log
        @time_log = TimeLog.discarded.where.not(completed_at: nil).includes(:task).find(params[:time_log_id])
        authorize @time_log, :update?
      end
  end
end
