module Tasks
  class FilterService
    FILTERS = %i[ is_completed search_term is_searching_details life_area_id is_in_inbox ].freeze

    def initialize(scope, filters)
      @scope = scope
      @filters = filters
    end

    # Returns the scope narrowed by whichever filters were given.
    def process
      scope = filter_by_completion(@scope)
      scope = filter_by_inbox(scope)
      scope = filter_by_life_area(scope)
      filter_by_search_term(scope)
    end

    private
      # The task lists ask for `is_completed=false`; leaving it out lists every task.
      def filter_by_completion(scope)
        return scope if @filters[:is_completed].blank?

        scope.where(is_completed: ActiveModel::Type::Boolean.new.cast(@filters[:is_completed]))
      end

      # The Inbox lists the tasks that aren't in any area.
      def filter_by_inbox(scope)
        return scope unless ActiveModel::Type::Boolean.new.cast(@filters[:is_in_inbox])

        scope.where(life_area_id: nil)
      end

      # An area's page lists the tasks in it.
      def filter_by_life_area(scope)
        return scope if @filters[:life_area_id].blank?

        scope.where(life_area_id: @filters[:life_area_id])
      end

      # Matches any part of the title, ignoring case. The Timer's task picker and the Calendar's time log popover search
      # titles only; the global search asks for descriptions and steps too.
      def filter_by_search_term(scope)
        return scope if @filters[:search_term].blank?

        pattern = "%#{Task.sanitize_sql_like(@filters[:search_term].strip)}%"
        in_title = scope.where("tasks.title ILIKE ?", pattern)
        return in_title unless ActiveModel::Type::Boolean.new.cast(@filters[:is_searching_details])

        in_title
          .or(scope.where("tasks.description ILIKE ?", pattern))
          .or(scope.where(id: ChecklistItem.kept.where("checklist_items.title ILIKE ?", pattern).select(:task_id)))
      end
  end
end
