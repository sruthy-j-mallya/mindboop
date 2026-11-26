module Api
  # Changes to a task's items are made one at a time (the task is locked), so two can't work out the same position.
  # Every action answers with the whole task, since a move also changes its siblings' order.
  class ChecklistItemsController < BaseController
    before_action :set_task
    before_action :set_checklist_item, only: %i[ update destroy ]

    def create
      @task.with_lock do
        checklist_item = @task.checklist_items.create!(checklist_item_params)
        checklist_item.move_to!(params[:position]) if params.key?(:position)
      end
      render_task status: :created
    end

    def update
      @task.with_lock do
        @checklist_item.update!(checklist_item_params)
        @checklist_item.move_to!(params[:position]) if params.key?(:position)
      end
      render_task
    end

    def destroy
      @checklist_item.discard!
      render_task
    end

    private
      # Items are part of their task, so changing one needs permission to update the task.
      def set_task
        @task = Task.kept.find(params[:task_id])
        authorize @task, :update?
      end

      def set_checklist_item
        @checklist_item = @task.checklist_items.find(params[:id])
      end

      def checklist_item_params
        params.permit(:title, :is_completed)
      end

      def render_task(status: :ok)
        @task.checklist_items.reset
        render "api/tasks/show", status:
      end
  end
end
