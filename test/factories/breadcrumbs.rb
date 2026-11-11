FactoryBot.define do
  factory :breadcrumb do
    task
    completed_description { Faker::Lorem.sentence }
    restart_description { Faker::Lorem.sentence }
  end
end
