FactoryBot.define do
  factory :time_log do
    task
    mode { "stopwatch" }
    started_at { Time.current }

    # A session logged by hand from the Calendar, with only a title.
    trait :manual do
      task { nil }
      user
      mode { "manual" }
      title { Faker::Lorem.sentence }
      started_at { 2.hours.ago }
      completed_at { 1.hour.ago }
      accumulated_elapsed_seconds { 1.hour.to_i }
    end
  end
end
