class ChecklistItem < ApplicationRecord
  include Discard::Model

  belongs_to :task

  validates :title, presence: true
  validates :is_completed, inclusion: { in: [ true, false ] }

  before_create :set_position

  # Moves the item to `index` in its task's list (0-based, counting only kept items). The kept items swap their existing
  # positions among themselves, so a discarded item never ends up sharing a position with a kept one.
  def move_to!(index)
    index = Integer(index, exception: false)
    if index.nil? || index.negative?
      errors.add(:position, "must be a whole number of 0 or more")
      raise ActiveRecord::RecordInvalid, self
    end

    transaction do
      items = ChecklistItem.kept.where(task_id:).order(:position).lock.to_a
      positions = items.map(&:position)
      items.reject! { |item| item.id == id }
      items.insert(index.clamp(0, items.size), self)
      items.zip(positions).each { |item, position| item.update!(position:) unless item.position == position }
    end
  end

  private
    # Runs at save time, not validation, because nested items are validated before their task exists.
    # Counts discarded items too, so a new item never shares a position with one that could come back.
    def set_position
      self.position ||= (ChecklistItem.where(task_id: task.id).maximum(:position) || -1) + 1
    end
end
