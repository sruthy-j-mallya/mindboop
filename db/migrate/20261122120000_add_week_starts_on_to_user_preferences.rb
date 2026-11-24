class AddWeekStartsOnToUserPreferences < ActiveRecord::Migration[8.1]
  def change
    # 0 is Sunday and 6 Saturday, as in date-fns's `weekStartsOn`; 1 is Monday.
    add_column :user_preferences, :week_starts_on, :integer, null: false, default: 1
  end
end
