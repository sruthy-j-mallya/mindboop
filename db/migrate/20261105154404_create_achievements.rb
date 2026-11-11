class CreateAchievements < ActiveRecord::Migration[8.1]
  def change
    create_table :achievements, id: :uuid do |t|
      t.references :user, null: false, foreign_key: true, type: :uuid, index: false
      t.string :kind, null: false
      t.integer :count, null: false, default: 0

      t.timestamps
    end

    add_index :achievements, %i[ user_id kind ], unique: true
  end
end
