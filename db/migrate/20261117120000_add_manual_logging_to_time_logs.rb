class AddManualLoggingToTimeLogs < ActiveRecord::Migration[8.1]
  def up
    add_reference :time_logs, :user, type: :uuid, foreign_key: true, index: false
    execute <<~SQL.squish
      UPDATE time_logs SET user_id = tasks.user_id FROM tasks WHERE tasks.id = time_logs.task_id
    SQL
    change_column_null :time_logs, :user_id, false
    change_column_null :time_logs, :task_id, true
    add_column :time_logs, :title, :string
    add_index :time_logs, %i[ user_id started_at ]
  end

  def down
    remove_index :time_logs, %i[ user_id started_at ]
    remove_column :time_logs, :title
    execute "DELETE FROM time_logs WHERE task_id IS NULL"
    change_column_null :time_logs, :task_id, false
    remove_reference :time_logs, :user
  end
end
