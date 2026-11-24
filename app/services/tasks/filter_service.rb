module Tasks
  class FilterService
    def initialize(scope, filters)
      @scope = scope
      @filters = filters
    end

    # Returns the scope narrowed by whichever filters were given.
    def process
      filter_by_search_term(filter_by_completion(@scope))
    end

    private
      # The Inbox asks for `is_completed=false`; leaving it out lists every task.
      def filter_by_completion(scope)
        return scope if @filters[:is_completed].blank?

        scope.where(is_completed: ActiveModel::Type::Boolean.new.cast(@filters[:is_completed]))
      end

      # The Timer's task picker and the Calendar's time log popover search by title, matching any part of it and ignoring case.
      def filter_by_search_term(scope)
        return scope if @filters[:search_term].blank?

        scope.where("tasks.title ILIKE ?", "%#{Task.sanitize_sql_like(@filters[:search_term].strip)}%")
      end
  end
end
