class AddIsBailedOutToTimeLogs < ActiveRecord::Migration[8.1]
  def change
    add_column :time_logs, :is_bailed_out, :boolean, default: false, null: false
  end
end
