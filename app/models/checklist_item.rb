class ChecklistItem < ApplicationRecord
  belongs_to :task

  validates :title, presence: true
  validates :is_completed, inclusion: { in: [ true, false ] }

  before_create :set_position

  private
    # Runs at save time, not validation, because nested items are validated before their task exists.
    def set_position
      self.position ||= (task.checklist_items.maximum(:position) || -1) + 1
    end
end
