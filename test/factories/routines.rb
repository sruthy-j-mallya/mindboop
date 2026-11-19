FactoryBot.define do
  factory :routine do
    user
    title { Faker::Lorem.words(number: 2).join(" ").capitalize }
    icon { Routine::ICONS.sample }
    color { LifeArea::COLORS.sample }
    duration_minutes { rand(Routine::MIN_DURATION_MINUTES..60) }

    trait :with_reminder do
      reminder_time { "08:30" }
      reminder_days { [ 1, 3, 5 ] }
    end
  end
end
