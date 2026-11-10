json.extract! time_log, :id, :task_id, :mode, :timer_preset, :buffer_minutes, :accumulated_elapsed_seconds, :is_running,
  :current_run_started_at, :started_at, :completed_at, :created_at, :updated_at
json.is_finished_early time_log.finished_early?
if time_log.current_break
  json.current_break do
    json.extract! time_log.current_break, :id, :intention, :duration_minutes, :ends_at
  end
else
  json.current_break nil
end
