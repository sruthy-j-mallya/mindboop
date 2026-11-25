# Keeps a model's records in an order the user sets, within their owner's list (`positioned_within :task_id`). Needs a
# `position` column and Discard.
module Positionable
  extend ActiveSupport::Concern

  included do
    class_attribute :position_owner_key, instance_accessor: false

    scope :in_position_order, -> { order(:position, :created_at, :id) }

    before_create :set_position
  end

  class_methods do
    def positioned_within(owner_key)
      self.position_owner_key = owner_key
    end
  end

  # Moves the record to `index` in its owner's list (0-based, counting only kept records). The kept records swap their
  # existing positions among themselves, so a discarded one never ends up sharing a position with a kept one.
  def move_to!(index)
    index = Integer(index, exception: false)
    if index.nil? || index.negative?
      errors.add(:position, "must be a whole number of 0 or more")
      raise ActiveRecord::RecordInvalid, self
    end

    transaction do
      records = position_siblings.kept.in_position_order.lock.to_a
      positions = records.map(&:position)
      records.reject! { |record| record.id == id }
      records.insert(index.clamp(0, records.size), self)
      records.zip(positions).each { |record, position| record.update!(position:) unless record.position == position }
    end
  end

  private
    def position_siblings
      owner_key = self.class.position_owner_key
      self.class.where(owner_key => self[owner_key])
    end

    # Runs at save time, not validation, because nested records are validated before their owner exists.
    # Counts discarded records too, so a new one never shares a position with one that could come back.
    def set_position
      self.position ||= (position_siblings.maximum(:position) || -1) + 1
    end
end
