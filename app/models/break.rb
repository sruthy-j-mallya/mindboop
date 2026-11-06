class Break < ApplicationRecord
  MAX_DURATION_MINUTES = 15
  MAX_INTENTION_LENGTH = 100

  scope :open, -> { where(ended_at: nil) }

  belongs_to :time_log

  validates :intention, presence: true, length: { maximum: MAX_INTENTION_LENGTH }
  validates :duration_minutes,
    numericality: { only_integer: true, greater_than: 0, less_than_or_equal_to: MAX_DURATION_MINUTES }
  validates :ends_at, presence: true
  validate :time_log_is_in_progress, on: :create

  before_validation :set_ends_at, on: :create

  private
    def set_ends_at
      self.ends_at = duration_minutes.minutes.from_now if duration_minutes
    end

    def time_log_is_in_progress
      errors.add(:base, "This session is already finished.") if time_log&.completed_at?
    end
end
