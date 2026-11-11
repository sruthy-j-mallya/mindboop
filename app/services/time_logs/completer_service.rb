module TimeLogs
  class CompleterService
    def initialize(time_log)
      @time_log = time_log
    end

    def process!
      @time_log.with_lock do
        # A repeated request (double click, second tab) must not count the achievement twice.
        next if @time_log.completed_at?

        @time_log.complete!
        @time_log.task.update!(is_completed: true)
        award_early_finish if @time_log.finished_early?
      end
    end

    private
      def award_early_finish
        @time_log.task.user.achievements.find_or_create_by!(kind: :early_finish).increment!(:count, touch: true)
      end
  end
end
