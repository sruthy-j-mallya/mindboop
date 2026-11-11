module Api
  class TasksController < BaseController
    before_action :set_task, only: %i[ show update destroy ]

    def index
      # id breaks created_at ties, so a task can't repeat or go missing across pages.
      @pagy, @tasks = pagy(policy_scope(Task).kept.includes(:checklist_items).order(:created_at, :id))
    end

    def show
    end

    def create
      authorize Task
      @task = Current.user.tasks.create!(new_task_params)
      render :show, status: :created
    end

    def update
      @task.update!(task_params)
      render :show
    end

    def destroy
      @task.discard!
      head :no_content
    end

    private
      def set_task
        @task = Task.kept.includes(:checklist_items).find(params[:id])
        authorize @task
      end

      def task_params
        params.permit(
          :title, :description, :estimated_minutes, :is_duration, :is_all_day, :is_completed, :starts_at, :ends_at
        )
      end

      def new_task_params
        task_params.merge(params.permit(checklist_items_attributes: %i[ title is_completed ]))
      end
  end
end
