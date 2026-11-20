FactoryBot.define do
  factory :life_area do
    user
    sequence(:name) { |n| "#{Faker::Lorem.word.capitalize} #{n}" }
    color { LifeArea::COLORS.sample }
    icon { LifeArea::ICONS.sample }
  end
end
