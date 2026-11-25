module SampleData
  module Seeders
    # Thoughts parked to deal with later, in each state: parked (on its own or during a session), addressed, converted
    # into an Inbox task (with and without a date), and let go (deleted). The focus user has one in curiosity time.
    class ParkingLotItemsSeeder < BaseSeeder
      def process!
        { demo: demo_items, focus: focus_items }.each do |user_key, items|
          user = context.users.fetch(user_key)
          items.each { |attributes| create_item(user, **attributes) }
        end
      end

      private
        def create_item(user, time_log: nil, convert_to_task: nil, **attributes)
          item = user.parking_lot_items.create!(**attributes, time_log: context.time_logs[time_log])
          item.convert_to_task!(convert_to_task) if convert_to_task
        end

        def demo_items
          [
            { content: "Check if the library book is due", created_at: ago(300) },
            { content: "Ask finance for the Q3 numbers", time_log: :quarterly_report_session, created_at: ago(150) },
            {
              content: "Book a haircut", status: :addressed,
              time_log: :email_backlog_session, created_at: at(-2, "10:10")
            },
            { content: "Research standing desks", convert_to_task: {}, created_at: at(-3, "09:10") },
            {
              content: "Renew the car insurance",
              convert_to_task: { is_all_day: true, starts_at: day(3) }, created_at: at(-4, "11:20")
            },
            { content: "Reorganise the bookshelf", discarded_at: context.now, created_at: at(-6, "17:10") }
          ]
        end

        def focus_items
          [
            { content: "Reply to Alex about Friday", time_log: :roadmap_session, created_at: ago(35) },
            # A 5-minute look-up started from the parking lot, with 3 minutes left.
            {
              content: "Look up OKR examples", time_log: :roadmap_session,
              curiosity_ends_at: from_now(3), created_at: ago(5)
            }
          ]
        end
    end
  end
end
