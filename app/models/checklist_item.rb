class ChecklistItem < ApplicationRecord
  include Discard::Model

  belongs_to :task

  validates :title, presence: true
  validates :is_completed, inclusion: { in: [ true, false ] }

  before_create :set_position

  private
    # Runs at save time, not validation, because nested items are validated before their task exists.
    # Counts discarded items too, so a new item never shares a position with one that could come back.
    def set_position
      self.position ||= (ChecklistItem.where(task_id: task.id).maximum(:position) || -1) + 1
    end
end
