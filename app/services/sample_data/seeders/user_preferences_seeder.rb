module SampleData
  module Seeders
    # Preferences are only saved once a user changes one, so the new user has none and gets the defaults.
    class UserPreferencesSeeder < BaseSeeder
      PREFERENCES = {
        # Every setting changed: dark theme, other sounds, and weeks starting on Sunday.
        demo: { theme: "dark", completion_sound: "chime", break_alarm_sound: "marimba", week_starts_on: 0 },
        # Only the theme changed.
        focus: { theme: "light" }
      }.freeze

      def process!
        PREFERENCES.each do |user_key, attributes|
          context.users.fetch(user_key).create_preference!(attributes)
        end
      end
    end
  end
end
