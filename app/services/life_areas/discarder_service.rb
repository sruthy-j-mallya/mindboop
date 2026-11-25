module LifeAreas
  class DiscarderService
    # Without `tasks_life_area`, the tasks go to the Inbox.
    def initialize(life_area, tasks_life_area: nil)
      @life_area = life_area
      @tasks_life_area = tasks_life_area
    end

    # Only tasks left to do move; completed and deleted ones stay with the area.
    def process!
      LifeArea.transaction do
        @life_area.tasks.kept.where(is_completed: false)
          .update_all(life_area_id: @tasks_life_area&.id, updated_at: Time.current)
        @life_area.discard!
      end
    end
  end
end
