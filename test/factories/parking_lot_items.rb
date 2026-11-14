FactoryBot.define do
  factory :parking_lot_item do
    user
    content { Faker::Lorem.sentence }
  end
end
