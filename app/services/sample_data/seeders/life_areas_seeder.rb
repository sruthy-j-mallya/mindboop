module SampleData
  module Seeders
    # Areas in the order the sidebar lists them. Each has its own color, emoji and default background sound.
    # `side_project` is deleted by TasksSeeder once its tasks exist, as a user would delete it.
    class LifeAreasSeeder < BaseSeeder
      LIFE_AREAS = {
        demo: {
          work: { name: "Work", emoji: "💼", color: "indigo", default_sound: "clock" },
          health: { name: "Health", emoji: "💪", color: "emerald", default_sound: "waves" },
          home: { name: "Home", emoji: "🏠", color: "amber", default_sound: "none" },
          learning: { name: "Learning", emoji: "📚", color: "sky", default_sound: "piano" },
          family: { name: "Family", emoji: "👪", color: "rose", default_sound: "campfire" },
          side_project: { name: "Side project", emoji: "🚀", color: "slate", default_sound: "rain" }
        },
        focus: {
          focus_work: { name: "Work", emoji: "💻", color: "violet", default_sound: "rain" }
        }
      }.freeze

      def process!
        LIFE_AREAS.each do |user_key, life_areas|
          user = context.users.fetch(user_key)
          life_areas.each { |key, attributes| context.life_areas[key] = user.life_areas.create!(attributes) }
        end
      end
    end
  end
end
