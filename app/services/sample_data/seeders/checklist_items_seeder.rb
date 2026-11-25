module SampleData
  module Seeders
    # Steps on tasks: some done, some not, and one deleted (hidden, but kept in the database).
    class ChecklistItemsSeeder < BaseSeeder
      CHECKLIST_ITEMS = {
        quarterly_report: [
          { title: "Collect the numbers from finance", is_completed: true },
          { title: "Write the summary", is_completed: true },
          { title: "Draw the charts" },
          { title: "Get sign-off from Lee" },
          { title: "Ask Jo for last year's template", is_discarded: true }
        ],
        meal_plan: [
          { title: "Check what's in the fridge", is_completed: true },
          { title: "Pick five dinners" },
          { title: "Write the shopping list" }
        ],
        onboarding_doc: [
          { title: "Update the laptop setup section" },
          { title: "Add the new team members" }
        ],
        roadmap: [
          { title: "List the themes", is_completed: true },
          { title: "Rank them by impact" },
          { title: "Share the draft" }
        ]
      }.freeze

      def process!
        CHECKLIST_ITEMS.each do |task_key, items|
          task = context.tasks.fetch(task_key)
          items.each do |item|
            ChecklistItem.create!(
              task:,
              title: item[:title],
              is_completed: item.fetch(:is_completed, false),
              discarded_at: (context.now if item[:is_discarded])
            )
          end
        end
      end
    end
  end
end
