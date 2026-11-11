module Api
  class CurrentTimeLogsController < BaseController
    def show
      authorize TimeLog, :index?
      # id breaks started_at ties, so the same log comes back every time.
      @time_log = policy_scope(TimeLog).active.in_progress.order(started_at: :desc, id: :desc).first
    end
  end
end
