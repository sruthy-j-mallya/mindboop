class AddTimeFormatToUserPreferences < ActiveRecord::Migration[8.1]
  def change
    add_column :user_preferences, :time_format, :string, null: false, default: "12h"
  end
end
