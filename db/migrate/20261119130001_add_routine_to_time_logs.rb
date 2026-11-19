class AddRoutineToTimeLogs < ActiveRecord::Migration[8.1]
  def change
    # A session started from a routine runs without a task. Routines are only soft deleted, so their sessions keep them.
    add_reference :time_logs, :routine, type: :uuid, foreign_key: true
  end
end
