class CreateRoutineSteps < ActiveRecord::Migration[8.1]
  def change
    create_table :routine_steps, id: :uuid do |t|
      # Cascades because Routine#steps only sees kept steps, so dependent: :destroy would skip discarded ones.
      # Not indexed alone: the routine_id + position index below covers lookups by routine.
      t.references :routine, null: false, foreign_key: { on_delete: :cascade }, type: :uuid, index: false
      t.string :title, null: false
      t.integer :position, null: false
      t.datetime :discarded_at

      t.timestamps
    end

    add_index :routine_steps, %i[ routine_id position ]
  end
end
