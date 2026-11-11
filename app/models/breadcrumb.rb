class Breadcrumb < ApplicationRecord
  MAX_DESCRIPTION_LENGTH = 1000

  normalizes :completed_description, with: ->(description) { description.strip.presence }

  belongs_to :task

  validates :completed_description, length: { maximum: MAX_DESCRIPTION_LENGTH }
  validates :restart_description, presence: true, length: { maximum: MAX_DESCRIPTION_LENGTH }
end
