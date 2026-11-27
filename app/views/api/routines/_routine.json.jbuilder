json.extract! routine, :id, :title, :emoji, :color, :sound, :duration_minutes, :reminder_time, :reminder_days,
  :created_at, :updated_at
json.steps routine.steps, partial: "api/routine_steps/routine_step", as: :routine_step
# Loaded by `Routine.with_stats` in the list; a routine just saved is counted afresh.
stats = routine.has_attribute?(:sessions_count) ? routine : Routine.with_stats.find(routine.id)
json.sessions_count stats.sessions_count
json.total_seconds stats.total_seconds
json.last_done_at stats.last_done_at
