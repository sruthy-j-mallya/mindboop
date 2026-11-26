module SampleData
  module Seeders
    # Routines with each kind of reminder (daily, weekly, custom days, none), and a deleted one. Their sessions, and so
    # their stats, come from TimeLogsSeeder; the weekly review has none yet.
    class RoutinesSeeder < BaseSeeder
      ROUTINES = {
        meditate: {
          title: "Meditate", emoji: "🧘", color: "violet", sound: "waves", duration_minutes: 10,
          reminder_time: "07:30", reminder_days: (0..6).to_a
        },
        # Monday, Wednesday and Friday.
        evening_walk: {
          title: "Evening walk", emoji: "👟", color: "emerald", sound: "wind", duration_minutes: 30,
          reminder_time: "18:00", reminder_days: [ 1, 3, 5 ]
        },
        # Sundays only.
        weekly_review: {
          title: "Weekly review", emoji: "📋", color: "sky", sound: "piano", duration_minutes: 30,
          reminder_time: "17:00", reminder_days: [ 0 ]
        },
        fold_clothes: { title: "Fold clothes", emoji: "🧺", color: "amber", duration_minutes: 15 },
        # Deleted, but its sessions still count on the Calendar.
        stretching: { title: "Stretching", emoji: "🌿", color: "lime", duration_minutes: 10, is_discarded: true }
      }.freeze

      def process!
        user = context.users.fetch(:demo)
        ROUTINES.each do |key, attributes|
          context.routines[key] = user.routines.create!(
            **attributes.except(:is_discarded), discarded_at: (context.now if attributes[:is_discarded])
          )
        end
      end
    end
  end
end
