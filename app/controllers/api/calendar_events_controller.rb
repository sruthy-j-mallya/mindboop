module Api
  # What the Calendar shows between `from` and `to`: the open tasks scheduled then and the time logged then. Not paged,
  # so the range is capped instead: at three years, as the year view shows the year in view and one either side.
  class CalendarEventsController < BaseController
    MAX_RANGE_DAYS = 1100

    before_action :set_range

    def index
      @tasks = policy_scope(Task).kept.where(is_completed: false).scheduled_between(@from, @to)
        .includes(:checklist_items).by_due_date
      @time_logs = policy_scope(TimeLog).active.overlapping(@from, @to).includes(:task, :current_break)
        .order(:started_at, :id)
    end

    private
      def set_range
        @from = parse_time(params[:from])
        @to = parse_time(params[:to])
        return if @from && @to && @from < @to && @to - @from <= MAX_RANGE_DAYS.days

        render json: { error: "Pick a range of up to #{MAX_RANGE_DAYS} days, with from before to." }, status: :unprocessable_content
      end

      def parse_time(value)
        Time.zone.iso8601(value.to_s)
      rescue ArgumentError
        nil
      end
  end
end
