class ChecklistItem < ApplicationRecord
  include Discard::Model
  include Positionable

  positioned_within :task_id

  belongs_to :task

  validates :title, presence: true
  validates :is_completed, inclusion: { in: [ true, false ] }
end
