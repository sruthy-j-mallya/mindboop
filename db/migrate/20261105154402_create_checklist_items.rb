class CreateChecklistItems < ActiveRecord::Migration[8.1]
  def change
    create_table :checklist_items, id: :uuid do |t|
      # Cascades because Task#checklist_items only sees kept items, so dependent: :destroy would skip discarded ones.
      t.references :task, null: false, foreign_key: { on_delete: :cascade }, type: :uuid
      t.string :title, null: false
      t.boolean :is_completed, null: false, default: false
      t.datetime :discarded_at

      t.timestamps
    end
  end
end
