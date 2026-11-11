class CreateTasks < ActiveRecord::Migration[8.1]
  def change
    create_table :tasks, id: :uuid do |t|
      t.references :user, null: false, foreign_key: true, type: :uuid
      t.string :title, null: false
      t.text :description
      t.integer :estimated_minutes
      t.boolean :is_duration, null: false, default: false
      t.boolean :is_all_day, null: false, default: false
      t.boolean :is_completed, null: false, default: false
      t.datetime :starts_at
      t.datetime :ends_at
      t.datetime :discarded_at

      t.timestamps
    end

    add_index :tasks, :is_completed
    add_index :tasks, :discarded_at
  end
end
