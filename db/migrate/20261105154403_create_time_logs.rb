class CreateTimeLogs < ActiveRecord::Migration[8.1]
  def change
    create_table :time_logs, id: :uuid do |t|
      t.references :task, null: false, foreign_key: true, type: :uuid
      t.string :mode, null: false
      t.integer :timer_preset
      t.integer :accumulated_elapsed_seconds, null: false, default: 0
      t.boolean :is_running, null: false, default: false
      t.datetime :current_run_started_at
      t.datetime :started_at, null: false
      t.datetime :completed_at
      t.datetime :discarded_at

      t.timestamps
    end

    add_index :time_logs, :discarded_at
  end
end
