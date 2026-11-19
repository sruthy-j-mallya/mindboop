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

    # A user does one thing at a time: no two of their kept logs share a moment. A running log has no end, so its range
    # is open-ended. Ranges are [start, end), so one log may end as the next starts. btree_gist lets the GiST index
    # compare user_id by equality.
    enable_extension "btree_gist"
    add_exclusion_constraint :time_logs, "user_id WITH =, tsrange(started_at, completed_at) WITH &&",
      using: :gist, where: "discarded_at IS NULL", name: "time_logs_no_overlap"
  end

  def down
    remove_exclusion_constraint :time_logs, name: "time_logs_no_overlap"
    disable_extension "btree_gist"
    remove_index :time_logs, %i[ user_id started_at ]
    remove_column :time_logs, :title
    execute "DELETE FROM time_logs WHERE task_id IS NULL"
    change_column_null :time_logs, :task_id, false
    remove_reference :time_logs, :user
  end
end
