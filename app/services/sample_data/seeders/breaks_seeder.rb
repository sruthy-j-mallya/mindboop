module SampleData
  module Seeders
    # Breaks taken during sessions: one back on time, one back late (after its alarm), and one in the running session.
    # Each sits in the gap TimeLogsSeeder left between the session's span and its focus time.
    class BreaksSeeder < BaseSeeder
      def process!
        breaks.each do |time_log_key, attributes|
          # Saved as they were: the model sets `ends_at` from now and only takes a break on a session in progress.
          context.time_logs.fetch(time_log_key).breaks.new(attributes).save!(validate: false)
        end
      end

      private
        def breaks
          {
            email_backlog_session: {
              intention: "Stretch my legs", duration_minutes: 5,
              created_at: at(-2, "10:15"), ends_at: at(-2, "10:20"), ended_at: at(-2, "10:20")
            },
            declutter_session: {
              intention: "Get a snack", duration_minutes: 10,
              created_at: at(-2, "14:20"), ends_at: at(-2, "14:30"), ended_at: at(-2, "14:33")
            },
            roadmap_session: {
              intention: "Refill my water", duration_minutes: 5,
              created_at: ago(30), ends_at: ago(25), ended_at: ago(25)
            }
          }
        end
    end
  end
end
