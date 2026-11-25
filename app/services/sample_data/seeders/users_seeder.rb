module SampleData
  module Seeders
    # The sample users, each showing the app in a different state. They all sign in with PASSWORD.
    class UsersSeeder < BaseSeeder
      PASSWORD = "password123".freeze
      EMAIL_ADDRESSES = {
        # A few weeks in: every list, the Calendar, Home and the routine stats have something to show.
        demo: "demo@mindboop.test",
        # In the middle of a focus session: a timer running after a break, thoughts parked, a curiosity time on.
        focus: "focus@mindboop.test",
        # Just signed up: every empty state, and the default preferences.
        new: "new@mindboop.test"
      }.freeze

      # Deletes the sample users from an earlier run first, with all their data.
      def process!
        User.where(email_address: EMAIL_ADDRESSES.values).destroy_all
        EMAIL_ADDRESSES.each do |key, email_address|
          context.users[key] = User.create!(email_address:, password: PASSWORD)
        end
      end
    end
  end
end
