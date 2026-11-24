class CreateLifeAreas < ActiveRecord::Migration[8.1]
  def change
    create_table :life_areas, id: :uuid do |t|
      # Not indexed alone: the user_id + position index below covers lookups by user.
      t.references :user, null: false, foreign_key: true, type: :uuid, index: false
      t.string :name, null: false
      t.string :color, null: false
      t.string :emoji, null: false
      # The background sound a session on one of the area's tasks starts with ("none" keeps the one picked last).
      t.string :default_sound, null: false, default: "none"
      t.integer :position, null: false
      t.datetime :discarded_at, index: true

      t.timestamps
    end

    add_index :life_areas, %i[ user_id position ]
    # Names are unique per user, ignoring case; a deleted area's name can be used again.
    add_index :life_areas, "user_id, lower(name)", unique: true, where: "discarded_at IS NULL",
      name: "index_life_areas_on_user_id_and_lower_name"
  end
end
