FactoryBot.define do
  factory :checklist_item do
    task
    title { Faker::Lorem.sentence }
  end
end
