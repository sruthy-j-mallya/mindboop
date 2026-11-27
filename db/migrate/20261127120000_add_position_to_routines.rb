class AddPositionToRoutines < ActiveRecord::Migration[8.1]
  def up
    add_column :routines, :position, :integer

    # Existing routines keep the order they were listed in: oldest first, per user (deleted ones included, as
    # Positionable counts them).
    execute <<~SQL.squish
      UPDATE routines
      SET position = ordered.row_number - 1
      FROM (
        SELECT id, ROW_NUMBER() OVER (PARTITION BY user_id ORDER BY created_at, id) AS row_number
        FROM routines
      ) AS ordered
      WHERE routines.id = ordered.id
    SQL

    change_column_null :routines, :position, false
    # The user_id + position index covers lookups by user.
    remove_index :routines, :user_id
    add_index :routines, %i[ user_id position ]
  end

  def down
    remove_index :routines, %i[ user_id position ]
    add_index :routines, :user_id
    remove_column :routines, :position
  end
end
