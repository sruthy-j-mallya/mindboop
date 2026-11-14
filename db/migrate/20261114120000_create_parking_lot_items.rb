class CreateParkingLotItems < ActiveRecord::Migration[8.1]
  def change
    create_table :parking_lot_items, id: :uuid do |t|
      t.references :user, null: false, foreign_key: true, type: :uuid
      # Set once the item is added as a task. The item outlives a task that's later removed for good.
      t.references :task, foreign_key: { on_delete: :nullify }, type: :uuid
      t.text :content, null: false
      t.string :kind, null: false, default: "idea"
      t.string :status, null: false, default: "parked"
      t.datetime :discarded_at

      t.timestamps
    end

    add_index :parking_lot_items, :status
    add_index :parking_lot_items, :discarded_at
  end
end
