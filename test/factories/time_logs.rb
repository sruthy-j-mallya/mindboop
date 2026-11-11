FactoryBot.define do
  factory :time_log do
    task
    mode { "stopwatch" }
    started_at { Time.current }
  end
end
