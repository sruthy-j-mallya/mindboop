module Api
  class TimeLogsController < BaseController
    before_action :set_time_log, only: %i[ update destroy ]

    def create
      @time_log = TimeLog.new(time_log_params.merge(user: Current.user, task: find_task, routine: find_routine))
      # A routine's session runs for the routine's duration unless told otherwise.
      @time_log.timer_preset ||= @time_log.routine.duration_minutes if @time_log.routine && @time_log.timer?
      authorize @time_log
      if @time_log.manual?
        @time_log.log!
      else
        @time_log.start
        @time_log.save!
      end
      render :show, status: :created
    end

    def update
      @time_log.reschedule!(started_at: reschedule_params[:started_at], completed_at: reschedule_params[:completed_at])
      render :show
    end

    def destroy
      @time_log.discard!
      head :no_content
    end

    private
      def set_time_log
        @time_log = TimeLog.kept.includes(:task).find(params[:id])
        authorize @time_log
      end

      # A manual log can be saved with only a title, and a routine's session runs on the routine; every other log runs on
      # a task.
      def find_task
        return if params[:task_id].blank? && (params[:mode] == "manual" || params[:routine_id].present?)

        Task.kept.find(params[:task_id])
      end

      # Another user's routine reads as unknown (404), so an id gives nothing away.
      def find_routine
        return if params[:routine_id].blank?

        Current.user.routines.kept.find(params[:routine_id])
      end

      # Only a manual log takes its times and title from the client; a timer or stopwatch starts now.
      def time_log_params
        return params.permit(:mode, :title, :started_at, :completed_at) if params[:mode] == "manual"

        params.permit(:mode, :timer_preset)
      end

      def reschedule_params
        params.permit(:started_at, :completed_at)
      end
  end
end
