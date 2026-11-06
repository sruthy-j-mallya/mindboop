class AddPositionToChecklistItems < ActiveRecord::Migration[8.1]
  def change
    add_column :checklist_items, :position, :integer

    reversible do |dir|
      dir.up do
        execute <<~SQL.squish
          UPDATE checklist_items
          SET position = ranked.position
          FROM (
            SELECT id, ROW_NUMBER() OVER (PARTITION BY task_id ORDER BY created_at, id) - 1 AS position
            FROM checklist_items
          ) AS ranked
          WHERE checklist_items.id = ranked.id
        SQL
      end
    end

    change_column_null :checklist_items, :position, false
    add_index :checklist_items, %i[ task_id position ]
    remove_index :checklist_items, :task_id
  end
end
