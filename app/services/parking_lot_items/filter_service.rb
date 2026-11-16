module ParkingLotItems
  class FilterService
    def initialize(scope, filters)
      @scope = scope
      @filters = filters
    end

    # Returns the scope narrowed by whichever filters were given.
    def process
      filter_by_time_log(filter_by_status(@scope))
    end

    private
      def filter_by_status(scope)
        return scope if @filters[:status].blank?

        scope.where(status: @filters[:status])
      end

      # The Timer lists only what was parked during the session.
      def filter_by_time_log(scope)
        return scope if @filters[:time_log_id].blank?

        scope.where(time_log_id: @filters[:time_log_id])
      end
  end
end
