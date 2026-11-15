class CreateParkingLotItems < ActiveRecord::Migration[8.1]
  def change
    create_table :parking_lot_items, id: :uuid do |t|
      t.references :user, null: false, foreign_key: true, type: :uuid
      # Set once the item is added as a task. The item outlives a task that's later removed for good.
      t.references :task, foreign_key: { on_delete: :nullify }, type: :uuid
      t.text :content, null: false
      t.string :status, null: false, default: "parked"
      # Set while a curiosity time (a short timeboxed look-up) runs on this item.
      t.datetime :curiosity_ends_at
      t.boolean :is_curiosity_extended, null: false, default: false
      t.datetime :discarded_at

      t.timestamps
    end

    add_index :parking_lot_items, :status
    add_index :parking_lot_items, :discarded_at
  end
end
