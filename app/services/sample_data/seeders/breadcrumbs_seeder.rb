module SampleData
  module Seeders
    # The notes left when bailing out of a session (TimeLogsSeeder), dated when the session ended. They fill Home's "Pick
    # up where you left off" and the task pane's timeline. One leaves "what I did" empty, as it's optional.
    class BreadcrumbsSeeder < BaseSeeder
      def process!
        breadcrumbs.each do |task_key, task_breadcrumbs|
          task = context.tasks.fetch(task_key)
          task_breadcrumbs.each { |attributes| task.breadcrumbs.create!(attributes) }
        end
      end

      private
        def breadcrumbs
          {
            quarterly_report: [
              {
                completed_description: "Wrote the revenue section.",
                restart_description: "Start on the costs section. The numbers are in the shared sheet.",
                created_at: ago(135)
              }
            ],
            declutter_garage: [
              {
                completed_description: "Sorted the shelves on the left wall.",
                restart_description: "Start with the boxes by the door.",
                created_at: at(-4, "15:30")
              },
              {
                restart_description: "Take the donation bags to the car first.",
                created_at: at(-2, "14:40")
              }
            ],
            rails_course: [
              {
                completed_description: "Watched the video on fragment caching.",
                restart_description: "Do the exercise at the end of the chapter.",
                created_at: at(-3, "09:20")
              }
            ]
          }
        end
    end
  end
end
