module Api
  # A routine's finished sessions between `from` and `to`, for the month grid on its page. Not paged, so the range is
  # capped instead.
  class RoutineTimeLogsController < BaseController
    MAX_RANGE_DAYS = 400

    before_action :set_routine, :set_range

    def index
      @time_logs = policy_scope(TimeLog).kept.where(routine: @routine).where.not(completed_at: nil)
        .where(started_at: @from...@to).includes(:task, :routine, :current_break).order(:started_at, :id)
    end

    private
      def set_routine
        @routine = Routine.kept.find(params[:routine_id])
        authorize @routine, :show?
      end

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
