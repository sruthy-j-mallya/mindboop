# Something the user does again and again with a timer (a shower, meditation, folding clothes), saved so it starts with
# one click. Nothing is ever due: a routine only counts what was done.
class Routine < ApplicationRecord
  include Discard::Model

  MAX_TITLE_LENGTH = 60
  # A routine is worth a timer; quicker habits are out of scope.
  MIN_DURATION_MINUTES = 5
  MAX_DURATION_MINUTES = 240
  REMINDER_TIME_FORMAT = /\A([01]\d|2[0-3]):[0-5]\d\z/
  WEEKDAYS = (0..6)

  # Oldest first, so a new routine goes at the bottom of the list.
  scope :in_created_order, -> { order(:created_at, :id) }
  # Adds `sessions_count`, `total_seconds` and `last_done_at`, counting only finished, undeleted sessions.
  scope :with_stats, -> {
    left_outer_joins(:finished_time_logs).group(:id).select(
      "routines.*",
      "COUNT(time_logs.id) AS sessions_count",
      "COALESCE(SUM(time_logs.accumulated_elapsed_seconds), 0) AS total_seconds",
      "MAX(time_logs.completed_at) AS last_done_at"
    )
  }

  normalizes :title, with: ->(title) { title.squish }
  normalizes :reminder_time, with: ->(time) { time.strip.presence }
  normalizes :reminder_days, with: ->(days) { days.map(&:to_i).uniq.sort }

  belongs_to :user
  # Routines are only soft deleted, so their sessions keep them; a hard delete goes with the user.
  has_many :time_logs, dependent: :destroy
  has_many :finished_time_logs, -> { kept.where.not(completed_at: nil) }, class_name: "TimeLog"
  has_many :steps, -> { kept.in_position_order }, class_name: "RoutineStep", inverse_of: :routine

  validates :title, presence: true, length: { maximum: MAX_TITLE_LENGTH }
  validates :emoji, inclusion: { in: LifeArea::EMOJIS }
  validates :color, inclusion: { in: LifeArea::COLORS }
  validates :sound, inclusion: { in: LifeArea::SOUNDS }
  validates :duration_minutes, numericality: {
    only_integer: true, greater_than_or_equal_to: MIN_DURATION_MINUTES, less_than_or_equal_to: MAX_DURATION_MINUTES
  }
  validates :reminder_time, format: { with: REMINDER_TIME_FORMAT, message: "must be a time like 08:30" }, allow_nil: true
  validate :reminder_days_are_weekdays
  validate :reminder_has_days, if: :reminder_time?

  # Without a time there's no reminder, so no days are kept either.
  before_validation :clear_reminder_days, unless: :reminder_time?

  private
    def clear_reminder_days
      self.reminder_days = []
    end

    def reminder_days_are_weekdays
      errors.add(:reminder_days, "must be weekdays from 0 (Sunday) to 6") unless reminder_days.all? { WEEKDAYS.cover?(it) }
    end

    def reminder_has_days
      errors.add(:reminder_days, "can't be empty when there's a reminder") if reminder_days.empty?
    end
end
