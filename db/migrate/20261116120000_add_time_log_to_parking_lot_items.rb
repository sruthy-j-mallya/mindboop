class AddTimeLogToParkingLotItems < ActiveRecord::Migration[8.1]
  def change
    add_reference :parking_lot_items, :time_log, type: :uuid, foreign_key: { on_delete: :nullify }
  end
end
