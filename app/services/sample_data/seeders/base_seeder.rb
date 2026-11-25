module SampleData
  module Seeders
    # A seeder makes the sample records of one resource. Subclasses implement `#process!`.
    class BaseSeeder
      attr_reader :context

      def initialize(context)
        @context = context
      end

      def process!
        raise NotImplementedError, "#{self.class.name} must implement #process!"
      end

      private
        # A clock time on a day relative to today: `at(-2, "09:30")` is half past nine the day before yesterday. Past
        # days keep to daytime hours, so they never reach the sessions logged earlier today (see `ago`).
        def at(day_offset, time)
          hour, min = time.split(":").map(&:to_i)
          day(day_offset).change(hour:, min:)
        end

        # The start of a day relative to today, as an all-day task stores it.
        def day(day_offset)
          Date.current.advance(days: day_offset).in_time_zone
        end

        # Minutes before the seeding clock. Today's sessions use it, so they're always in the past whatever the time.
        def ago(minutes)
          context.now - minutes.minutes
        end

        def from_now(minutes)
          context.now + minutes.minutes
        end
    end
  end
end
