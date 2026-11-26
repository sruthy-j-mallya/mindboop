module SampleData
  module Seeders
    # Tasks in every state the lists, Home and the Calendar show: in the Inbox or an area; undated, due on a day, at a
    # time, or over a span (overdue, today, upcoming); with an estimate and a Markdown description; completed; deleted.
    # Steps, sessions and breadcrumbs come from the seeders after this one.
    class TasksSeeder < BaseSeeder
      SCHEDULE_ATTRIBUTES = %i[ is_all_day is_duration starts_at ends_at ].freeze

      def process!
        { demo: demo_tasks, focus: focus_tasks }.each do |user_key, tasks|
          user = context.users.fetch(user_key)
          tasks.each do |key, attributes|
            life_area = context.life_areas[attributes[:life_area]]
            context.tasks[key] = create_task(user, attributes, life_area)
          end
        end
        delete_side_project
      end

      private
        # A task only becomes overdue after it was scheduled, and a new start can't be in the past
        # (Task#starts_at_is_not_in_the_past). So a past schedule is written after the task is saved, as time would have.
        def create_task(user, attributes, life_area)
          return user.tasks.create!(**attributes, life_area:) unless starts_in_the_past?(attributes)

          schedule = attributes.slice(*SCHEDULE_ATTRIBUTES)
          user.tasks.create!(**attributes.except(*SCHEDULE_ATTRIBUTES), life_area:).tap { |task| task.update_columns(schedule) }
        end

        def starts_in_the_past?(attributes)
          attributes[:starts_at].present? && attributes[:starts_at] < Time.current
        end

        def demo_tasks
          [ inbox_tasks, work_tasks, health_tasks, home_tasks, learning_tasks, family_tasks, side_project_tasks ].reduce(:merge)
        end

        # Without an area, a task is in the Inbox.
        def inbox_tasks
          {
            call_plumber: { title: "Call the plumber about the dripping tap" },
            weekend_trip: {
              title: "Plan the weekend trip",
              estimated_minutes: 30,
              description: <<~MARKDOWN
                Somewhere **less than two hours** away by train.

                - Check the weather first
                - Book a place that allows dogs
              MARKDOWN
            }
          }
        end

        def work_tasks
          {
            # On Home in "Today's agenda", and in "Pick up where you left off" after this morning's bail-out.
            quarterly_report: {
              title: "Write the quarterly report",
              life_area: :work,
              estimated_minutes: 120,
              description: "Revenue, costs and *next quarter's goals*. Template: [Q3 report](https://example.com/q3).",
              **duration(0, "14:00", "16:00")
            },
            # Timed earlier today: the agenda shows it in red once the time has passed.
            review_pull_request: {
              title: "Review Sam's pull request", life_area: :work, estimated_minutes: 30, **timed(0, "09:00")
            },
            team_sync_slides: {
              title: "Prepare slides for the team sync", life_area: :work, estimated_minutes: 45, **all_day(0)
            },
            # Overdue: a date, and a span, both in the past.
            expense_report: { title: "Submit the expense report", life_area: :work, **all_day(-3) },
            client_proposal: { title: "Send the client proposal", life_area: :work, **duration(-5, "09:00", "11:00") },
            # Upcoming, over several whole days.
            onboarding_doc: { title: "Update the onboarding doc", life_area: :work, **all_day_span(2, 4) },
            # Done with a timer that finished early, which earns an achievement.
            email_backlog: {
              title: "Clear the email backlog", life_area: :work, estimated_minutes: 45, is_completed: true
            },
            # Deleted after a session on it: the session still shows on the Calendar.
            meeting_notes: {
              title: "Tidy up old meeting notes", life_area: :work, is_completed: true, discarded_at: ago(24 * 60)
            }
          }
        end

        def health_tasks
          {
            dentist: { title: "Dentist appointment", life_area: :health, **duration(1, "15:30", "16:30") },
            run_5k: { title: "Go for a 5k run", life_area: :health, is_completed: true },
            meal_plan: { title: "Plan meals for the week", life_area: :health, estimated_minutes: 20 }
          }
        end

        def home_tasks
          {
            # Bailed out of twice, so it has two breadcrumbs.
            declutter_garage: { title: "Declutter the garage", life_area: :home, estimated_minutes: 90 },
            fold_laundry: { title: "Fold the laundry", life_area: :home, is_completed: true },
            electricity_bill: { title: "Pay the electricity bill", life_area: :home, **timed(-1, "18:00") }
          }
        end

        def learning_tasks
          {
            spanish_lesson: {
              title: "Spanish lesson 12", life_area: :learning, estimated_minutes: 30, **timed(7, "19:00")
            },
            rails_course: {
              title: "Finish the Rails course chapter on caching", life_area: :learning, estimated_minutes: 45
            },
            deep_work: { title: "Read chapter 3 of Deep Work", life_area: :learning, is_completed: true }
          }
        end

        def family_tasks
          {
            birthday_gift: { title: "Buy Mum's birthday gift", life_area: :family, **all_day(5) },
            call_grandma: { title: "Call Grandma", life_area: :family, **duration(0, "19:00", "19:30") }
          }
        end

        # The area is deleted below: the completed task stays with it, the open one moves to the Inbox.
        def side_project_tasks
          {
            landing_page: { title: "Design the landing page", life_area: :side_project, is_completed: true },
            launch_post: { title: "Write the launch blog post", life_area: :side_project }
          }
        end

        def focus_tasks
          {
            # The task on the clock.
            roadmap: { title: "Draft the product roadmap", life_area: :focus_work, estimated_minutes: 50 },
            standup_notes: { title: "Post stand-up notes", life_area: :focus_work, **all_day(0) }
          }
        end

        def delete_side_project
          LifeAreas::DiscarderService.new(context.life_areas.fetch(:side_project)).process!
        end

        # Schedules, saved the way the client's schedule picker saves them.
        def all_day(day_offset)
          { is_all_day: true, starts_at: day(day_offset) }
        end

        def all_day_span(from_offset, to_offset)
          { is_all_day: true, is_duration: true, starts_at: day(from_offset), ends_at: day(to_offset) }
        end

        def timed(day_offset, time)
          { starts_at: at(day_offset, time) }
        end

        def duration(day_offset, from, to)
          { is_duration: true, starts_at: at(day_offset, from), ends_at: at(day_offset, to) }
        end
    end
  end
end
