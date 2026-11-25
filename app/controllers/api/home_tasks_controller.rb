module Api
  # The lists on the Home page. The server has no user time zone, so the browser sends where its day starts (`from`) and
  # ends (`to`). Not paged.
  class HomeTasksController < BaseController
    # The longest day, when clocks go back.
    MAX_RANGE_HOURS = 25

    before_action :set_range

    def index
      tasks = policy_scope(Task).kept.where(is_completed: false).includes(:checklist_items, :breadcrumbs)
      @today = tasks.due_between(@from, @to).order(is_all_day: :desc, starts_at: :asc, id: :asc)
      @overdue = tasks.overdue_at(@from).by_end
      @resumable = tasks.by_latest_breadcrumb
    end

    private
      def set_range
        @from = parse_time(params[:from])
        @to = parse_time(params[:to])
        return if @from && @to && @from < @to && @to - @from <= MAX_RANGE_HOURS.hours

        render json: { error: "Pick a range of up to #{MAX_RANGE_HOURS} hours, with from before to." }, status: :unprocessable_content
      end
  end
end
