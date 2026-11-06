class Achievement < ApplicationRecord
  enum :kind, { early_finish: "early_finish" }, validate: true

  belongs_to :user

  validates :count, numericality: { only_integer: true, greater_than_or_equal_to: 0 }
end
