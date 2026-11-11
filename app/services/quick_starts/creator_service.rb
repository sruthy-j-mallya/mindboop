module QuickStarts
  class CreatorService
    def initialize(user, task_attributes)
      @user = user
      @task_attributes = task_attributes
    end

    # Returns the running time log. Raises, saving neither record, if the task or its time log is invalid.
    def process!
      Task.transaction do
        task = @user.tasks.new(@task_attributes)
        task.save!(context: %i[ create quick_start ])
        time_log = task.time_logs.new(mode: :timer, timer_preset: task.estimated_minutes)
        time_log.start
        time_log.save!
        time_log
      end
    end
  end
end
