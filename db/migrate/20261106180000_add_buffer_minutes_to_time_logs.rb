class AddBufferMinutesToTimeLogs < ActiveRecord::Migration[8.1]
  def change
    add_column :time_logs, :buffer_minutes, :integer, null: false, default: 0
  end
end
