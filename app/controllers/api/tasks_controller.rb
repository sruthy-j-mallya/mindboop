module Api
  class TasksController < BaseController
    before_action :set_task, only: %i[ show update destroy ]

    def index
      tasks = Tasks::FilterService.new(policy_scope(Task).kept, params.slice(*Tasks::FilterService::FILTERS)).process
      @pagy, @tasks = pagy(tasks.includes(:checklist_items, :breadcrumbs).by_due_date)
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
        @task = Task.kept.includes(:checklist_items, :breadcrumbs).find(params[:id])
        authorize @task
      end

      def task_params
        params.permit(
          :title, :description, :estimated_minutes, :is_duration, :is_all_day, :is_completed, :starts_at, :ends_at,
          :life_area_id
        )
      end

      def new_task_params
        task_params.merge(params.permit(checklist_items_attributes: %i[ title is_completed ]))
      end
  end
end
