FactoryBot.define do
  factory :life_area do
    user
    sequence(:name) { |n| "#{Faker::Lorem.word.capitalize} #{n}" }
    color { LifeArea::COLORS.sample }
    emoji { LifeArea::EMOJIS.sample }
  end
end
