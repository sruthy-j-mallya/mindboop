class AddCheckedRoutineStepIdsToTimeLogs < ActiveRecord::Migration[8.1]
  def change
    # The routine's steps ticked off in this session, so each session starts with none ticked.
    add_column :time_logs, :checked_routine_step_ids, :uuid, array: true, default: [], null: false
  end
end
