module Api
  class TaskCountsController < BaseController
    # How many tasks are left to do in each area of life; the nil key counts the Inbox's.
    def index
      @task_counts = policy_scope(Task).kept.where(is_completed: false).group(:life_area_id).count
    end
  end
end
