class CreateRoutines < ActiveRecord::Migration[8.1]
  def change
    create_table :routines, id: :uuid do |t|
      t.references :user, null: false, foreign_key: true, type: :uuid
      t.string :title, null: false
      t.string :icon, null: false
      t.string :color, null: false
      # The background sound a session on the routine starts with ("none" keeps the one picked last).
      t.string :sound, null: false, default: "none"
      t.integer :duration_minutes, null: false
      # "HH:MM" in the browser's time zone; without one, the routine has no reminder.
      t.string :reminder_time
      # Weekdays to remind on, 0 (Sunday) to 6.
      t.integer :reminder_days, array: true, null: false, default: []
      t.datetime :discarded_at, index: true

      t.timestamps
    end
  end
end
