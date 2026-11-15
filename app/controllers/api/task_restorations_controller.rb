module Api
  # Brings back a deleted (discarded) task, so a delete can be undone.
  class TaskRestorationsController < BaseController
    before_action :set_task

    def create
      @task.undiscard!
      render "api/tasks/show", status: :created
    end

    private
      def set_task
        @task = Task.discarded.includes(:checklist_items).find(params[:task_id])
        authorize @task, :update?
      end
  end
end
