module SampleData
  module Seeders
    # Achievements counted from the sessions seeded, as finishing them would have counted them.
    class AchievementsSeeder < BaseSeeder
      def process!
        context.users.each_value do |user|
          early_finishes = user.time_logs.kept.count(&:finished_early?)
          next if early_finishes.zero?

          user.achievements.create!(kind: :early_finish, count: early_finishes)
        end
      end
    end
  end
end
