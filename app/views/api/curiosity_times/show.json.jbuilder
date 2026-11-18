if @parking_lot_item
  json.parking_lot_item do
    json.partial! "api/parking_lot_items/parking_lot_item", parking_lot_item: @parking_lot_item
  end
else
  json.parking_lot_item nil
end
