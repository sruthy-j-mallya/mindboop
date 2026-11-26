FactoryBot.define do
  factory :routine_step do
    routine
    title { Faker::Lorem.sentence }
  end
end
