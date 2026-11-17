class ParkingLotItem < ApplicationRecord
  include Discard::Model

  MAX_CONTENT_LENGTH = 1000
  # A curiosity time is a short look-up, timeboxed so it can't turn into a rabbit hole. It can be extended once.
  CURIOSITY_MINUTES = 5

  scope :in_curiosity_time, -> { kept.parked.where.not(curiosity_ends_at: nil) }

  normalizes :content, with: ->(content) { content.strip }

  # Parked until dealt with: addressed by hand, or converted into an Inbox task.
  enum :status, { parked: "parked", addressed: "addressed", converted: "converted" }, validate: true

  belongs_to :user
  belongs_to :task, optional: true
  # The focus session it was parked during, if any.
  belongs_to :time_log, optional: true

  validates :content, presence: true, length: { maximum: MAX_CONTENT_LENGTH }
  validates :task, presence: true, if: :converted?
  validates :task, absence: true, unless: :converted?
  validate :curiosity_time_is_the_only_one, if: :starting_curiosity_time?
  validate :time_log_is_the_users, if: :time_log

  # Dealing with the item, or letting it go, ends its curiosity time.
  before_save :clear_curiosity_time, if: -> { !parked? || discarded? }

  # Adds the thought to the Inbox as a task, scheduled when `task_attributes` carries a schedule. The lock makes a
  # repeated request (double click, second tab) a no-op instead of a second task.
  def convert_to_task!(task_attributes = {})
    with_lock do
      next if converted?

      update!(status: :converted, task: user.tasks.create!(title: content, **task_attributes))
    end
  end

  def start_curiosity_time!
    update!(curiosity_ends_at: CURIOSITY_MINUTES.minutes.from_now, is_curiosity_extended: false)
  end

  # Adds the minutes from now once the time is up, so asking for more after the alarm still gives the full amount.
  def extend_curiosity_time!
    if is_curiosity_extended?
      errors.add(:base, "You've already added more time")
      raise ActiveRecord::RecordInvalid, self
    end

    update!(curiosity_ends_at: [ curiosity_ends_at, Time.current ].max + CURIOSITY_MINUTES.minutes, is_curiosity_extended: true)
  end

  def end_curiosity_time!
    update!(curiosity_ends_at: nil, is_curiosity_extended: false)
  end

  private
    def starting_curiosity_time?
      curiosity_ends_at_changed? && curiosity_ends_at_was.nil? && curiosity_ends_at.present?
    end

    def curiosity_time_is_the_only_one
      return unless user.parking_lot_items.in_curiosity_time.where.not(id:).exists?

      errors.add(:base, "Finish your current curiosity time first")
    end

    def time_log_is_the_users
      return if time_log.task.user_id == user_id

      errors.add(:time_log, "must be one of your sessions")
    end

    def clear_curiosity_time
      self.curiosity_ends_at = nil
      self.is_curiosity_extended = false
    end
end
