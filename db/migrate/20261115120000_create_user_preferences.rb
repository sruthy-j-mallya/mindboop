class CreateUserPreferences < ActiveRecord::Migration[8.1]
  def change
    create_table :user_preferences, id: :uuid do |t|
      t.references :user, null: false, foreign_key: true, type: :uuid, index: { unique: true }
      t.string :theme, null: false, default: "system"
      t.string :completion_sound, null: false, default: "rising"
      t.string :break_alarm_sound, null: false, default: "classic"

      t.timestamps
    end
  end
end
