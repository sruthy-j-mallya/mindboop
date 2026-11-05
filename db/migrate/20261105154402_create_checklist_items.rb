class CreateChecklistItems < ActiveRecord::Migration[8.1]
  def change
    create_table :checklist_items, id: :uuid do |t|
      t.references :task, null: false, foreign_key: true, type: :uuid
      t.string :title, null: false
      t.boolean :is_completed, null: false, default: false

      t.timestamps
    end
  end
end
