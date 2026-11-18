module TimeLogs
  class BailerService
    def initialize(time_log, breadcrumb_attributes, discard_overrun: false)
      @time_log = time_log
      @breadcrumb_attributes = breadcrumb_attributes
      @discard_overrun = discard_overrun
    end

    def process!
      @time_log.with_lock do
        # A repeated request (double click, second tab) must not leave a second breadcrumb.
        next if @time_log.completed_at?

        @time_log.task.breadcrumbs.create!(@breadcrumb_attributes)
        @time_log.bail_out!(discard_overrun: @discard_overrun)
      end
    end
  end
end
