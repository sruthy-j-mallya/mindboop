module SampleData
  module Seeders
    # Sessions over the last two weeks, for the Calendar, the routine stats and the task panes: timers finished early,
    # extended or run past zero; stopwatches; bail-outs; logs added by hand (with a task, a routine or just a title); a
    # deleted session; and, for the focus user, a timer still running.
    #
    # A user does one thing at a time, so no two sessions overlap. Past days use daytime hours; today's sessions are
    # counted back from now, so they're always over. A session's focus time is its span unless `focus_minutes` says
    # otherwise: time on a break (BreaksSeeder) doesn't count.
    class TimeLogsSeeder < BaseSeeder
      def process!
        { demo: demo_time_logs, focus: focus_time_logs }.each do |user_key, time_logs|
          user = context.users.fetch(user_key)
          time_logs.each { |key, attributes| context.time_logs[key] = create_time_log(user, attributes) }
        end
      end

      private
        def create_time_log(user, attributes)
          focus_minutes = attributes.delete(:focus_minutes)
          time_log = user.time_logs.new(
            **attributes,
            task: context.tasks[attributes[:task]],
            routine: context.routines[attributes[:routine]]
          )
          time_log.accumulated_elapsed_seconds = focus_minutes&.minutes&.to_i || span_seconds(time_log)
          time_log.save!
          time_log
        end

        def span_seconds(time_log)
          return 0 unless time_log.completed_at

          (time_log.completed_at - time_log.started_at).to_i
        end

        def demo_time_logs
          [ today_time_logs, task_time_logs, routine_time_logs, manual_time_logs ].reduce(:merge)
        end

        def today_time_logs
          {
            # Bailed out with a breadcrumb, and a thought parked on the way.
            quarterly_report_session: {
              task: :quarterly_report, mode: :timer, timer_preset: 50, is_bailed_out: true,
              started_at: ago(170), completed_at: ago(135)
            },
            coffee_chat: { mode: :manual, title: "Coffee chat with Priya", started_at: ago(120), completed_at: ago(95) },
            meditate_today: { routine: :meditate, mode: :timer, timer_preset: 10, started_at: ago(60), completed_at: ago(50) }
          }
        end

        def task_time_logs
          {
            run_session: { task: :run_5k, mode: :stopwatch, started_at: at(-1, "07:15"), completed_at: at(-1, "07:47") },
            # Extended by 10 minutes, then done inside the extra time.
            deep_work_session: {
              task: :deep_work, mode: :timer, timer_preset: 30, buffer_minutes: 10,
              started_at: at(-1, "09:00"), completed_at: at(-1, "09:38")
            },
            # 30 minutes of focus on a 45-minute timer, with a break in between: finished early.
            email_backlog_session: {
              task: :email_backlog, mode: :timer, timer_preset: 45, focus_minutes: 30,
              started_at: at(-2, "10:00"), completed_at: at(-2, "10:35")
            },
            # A stopwatch bailed out of, after a break that ran over its alarm.
            declutter_session: {
              task: :declutter_garage, mode: :stopwatch, is_bailed_out: true, focus_minutes: 27,
              started_at: at(-2, "14:00"), completed_at: at(-2, "14:40")
            },
            rails_course_session: {
              task: :rails_course, mode: :timer, timer_preset: 45, is_bailed_out: true,
              started_at: at(-3, "09:00"), completed_at: at(-3, "09:20")
            },
            # Ran 8 minutes past zero, and the overrun was kept.
            landing_page_session: {
              task: :landing_page, mode: :timer, timer_preset: 50,
              started_at: at(-3, "13:00"), completed_at: at(-3, "13:58")
            },
            meeting_notes_session: {
              task: :meeting_notes, mode: :stopwatch, started_at: at(-4, "11:00"), completed_at: at(-4, "11:45")
            },
            first_declutter_session: {
              task: :declutter_garage, mode: :timer, timer_preset: 60, is_bailed_out: true,
              started_at: at(-4, "15:00"), completed_at: at(-4, "15:30")
            }
          }
        end

        # Timers started from a routine, and past days filled in from its month grid (manual).
        def routine_time_logs
          meditations = [ -1, -2, -4, -5, -7 ].to_h do |day_offset|
            [ :"meditate_#{-day_offset}_days_ago", meditation(day_offset) ]
          end
          meditations.merge(
            meditate_12_days_ago: { **meditation(-12), mode: :manual, timer_preset: nil },
            evening_walk_3_days_ago: {
              routine: :evening_walk, mode: :timer, timer_preset: 30, started_at: at(-3, "17:00"), completed_at: at(-3, "17:30")
            },
            evening_walk_8_days_ago: {
              routine: :evening_walk, mode: :manual, started_at: at(-8, "17:00"), completed_at: at(-8, "17:30")
            },
            # Any time on a routine counts, even short of its duration.
            fold_clothes_session: {
              routine: :fold_clothes, mode: :timer, timer_preset: 15, started_at: at(-10, "18:00"), completed_at: at(-10, "18:12")
            },
            stretching_session: {
              routine: :stretching, mode: :timer, timer_preset: 10, started_at: at(-14, "07:30"), completed_at: at(-14, "07:40")
            }
          )
        end

        def meditation(day_offset)
          { routine: :meditate, mode: :timer, timer_preset: 10, started_at: at(day_offset, "07:00"), completed_at: at(day_offset, "07:10") }
        end

        # Logged by hand on the Calendar.
        def manual_time_logs
          {
            laundry_log: { task: :fold_laundry, mode: :manual, started_at: at(-1, "17:00"), completed_at: at(-1, "17:25") },
            groceries_log: { mode: :manual, title: "Grocery shopping", started_at: at(-6, "17:00"), completed_at: at(-6, "17:45") },
            # Deleted from the Calendar: hidden, and its time is free again.
            deleted_log: {
              mode: :manual, title: "Answered emails", discarded_at: context.now,
              started_at: at(-5, "16:00"), completed_at: at(-5, "16:30")
            }
          }
        end

        def focus_time_logs
          {
            planning_meeting: { mode: :manual, title: "Planning meeting", started_at: at(-1, "10:00"), completed_at: at(-1, "11:00") },
            # Running: 10 minutes of focus, a 5-minute break, then back on the clock for the last 25 minutes.
            roadmap_session: {
              task: :roadmap, mode: :timer, timer_preset: 50, focus_minutes: 10,
              started_at: ago(40), is_running: true, current_run_started_at: ago(25)
            }
          }
        end
    end
  end
end
