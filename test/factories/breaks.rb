FactoryBot.define do
  factory :break do
    time_log
    intention { Faker::Lorem.word }
    duration_minutes { 5 }
  end
end
