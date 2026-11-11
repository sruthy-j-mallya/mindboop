FactoryBot.define do
  factory :achievement do
    user
    kind { "early_finish" }
  end
end
