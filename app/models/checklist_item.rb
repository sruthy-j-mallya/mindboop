class ChecklistItem < ApplicationRecord
  belongs_to :task

  validates :title, presence: true
  validates :is_completed, inclusion: { in: [ true, false ] }
end
