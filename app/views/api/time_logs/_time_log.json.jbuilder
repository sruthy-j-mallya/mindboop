json.extract! time_log, :id, :task_id, :routine_id, :title, :mode, :timer_preset, :buffer_minutes, :accumulated_elapsed_seconds,
  :is_running, :current_run_started_at, :started_at, :completed_at, :checked_routine_step_ids, :created_at, :updated_at
json.task_title time_log.task&.title
json.routine_title time_log.routine&.title
# The Calendar colours a log by its task's area.
json.life_area_id time_log.task&.life_area_id
json.is_task_deleted !!time_log.task&.discarded?
json.is_finished_early time_log.finished_early?
if time_log.current_break
  json.current_break do
    json.extract! time_log.current_break, :id, :intention, :duration_minutes, :ends_at
  end
else
  json.current_break nil
end
