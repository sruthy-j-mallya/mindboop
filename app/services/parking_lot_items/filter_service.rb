module ParkingLotItems
  class FilterService
    def initialize(scope, filters)
      @scope = scope
      @filters = filters
    end

    # Returns the scope narrowed by whichever filters were given. Unknown or invalid values are ignored.
    def process
      filter_by_since(filter_by_status(@scope))
    end

    private
      def filter_by_status(scope)
        return scope if @filters[:status].blank?

        scope.where(status: @filters[:status])
      end

      # The Timer lists only what was parked during the current session.
      def filter_by_since(scope)
        since = parse_time(@filters[:since])
        return scope if since.nil?

        scope.where(created_at: since..)
      end

      def parse_time(value)
        Time.zone.parse(value.to_s)
      rescue ArgumentError
        nil
      end
  end
end
