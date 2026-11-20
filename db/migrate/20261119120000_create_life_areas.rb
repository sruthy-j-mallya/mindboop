class CreateLifeAreas < ActiveRecord::Migration[8.1]
  def change
    create_table :life_areas, id: :uuid do |t|
      t.references :user, null: false, foreign_key: true, type: :uuid
      t.string :name, null: false
      t.string :color, null: false
      t.string :icon, null: false
      # The background sound a session on one of the area's tasks starts with ("none" keeps the one picked last).
      t.string :default_sound, null: false, default: "none"

      t.timestamps
    end

    # Names are unique per user, ignoring case.
    add_index :life_areas, "user_id, lower(name)", unique: true, name: "index_life_areas_on_user_id_and_lower_name"
  end
end
