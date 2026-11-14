json.parking_lot_items @parking_lot_items, partial: "api/parking_lot_items/parking_lot_item", as: :parking_lot_item
json.parking_lot_items_count @pagy.count
json.page @pagy.page
json.total_pages @pagy.last
