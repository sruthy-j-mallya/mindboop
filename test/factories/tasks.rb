FactoryBot.define do
  factory :task do
    user
    title { Faker::Lorem.sentence }

    # A task scheduled back when its start was still ahead, which has since passed. Saved without validation, since a
    # new start can't be in the past.
    trait :backdated do
      to_create { |task| task.save!(validate: false) }
    end
  end
end
