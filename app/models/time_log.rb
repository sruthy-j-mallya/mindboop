class TimeLog < ApplicationRecord
  include Discard::Model

  MAX_BUFFER_MINUTES = 60
  # A session shorter than this is too short to log: it can only be discarded, not completed or bailed out of.
  MIN_LOGGED_MINUTES = 2

  # Deleting a task keeps its time logs in the database, but hides them along with the task.
  scope :active, -> { kept.joins(:task).merge(Task.kept) }
  scope :in_progress, -> { where(completed_at: nil) }

  # The minutes of one extension. Not stored: they only add to buffer_minutes.
  attribute :extension_minutes, :integer

  enum :mode, { timer: "timer", stopwatch: "stopwatch" }, validate: true

  belongs_to :task
  has_many :breaks, dependent: :destroy
  has_one :current_break, -> { open }, class_name: "Break"
  has_many :parking_lot_items, dependent: :nullify

  validates :started_at, presence: true
  # A timer shorter than the least that can be logged could only ever be discarded.
  validates :timer_preset,
    numericality: { only_integer: true, greater_than_or_equal_to: MIN_LOGGED_MINUTES }, allow_nil: true
  validates :accumulated_elapsed_seconds, numericality: { only_integer: true, greater_than_or_equal_to: 0 }
  validates :is_running, :is_bailed_out, inclusion: { in: [ true, false ] }
  validates :buffer_minutes,
    numericality: { only_integer: true, greater_than_or_equal_to: 0, less_than_or_equal_to: MAX_BUFFER_MINUTES }
  validates :extension_minutes, numericality: { only_integer: true, greater_than: 0 }, on: :extend
  validate :session_can_be_extended, on: :extend
  validate :long_enough_to_log, on: :end

  # A new time log always starts running now, so its timing fields never come from the client.
  def start
    now = Time.current
    assign_attributes(is_running: true, started_at: now, current_run_started_at: now)
  end

  # Raises (RecordInvalid) for a session under MIN_LOGGED_MINUTES of focus, with nothing changed. With
  # `discard_overrun`, a timer that ran past zero logs only its planned time (preset plus buffer).
  def complete!(discard_overrun: false)
    now = Time.current
    elapsed_seconds = elapsed_seconds_at(now)
    elapsed_seconds = [ elapsed_seconds, planned_seconds ].min if discard_overrun && timer? && timer_preset?
    assign_attributes(
      accumulated_elapsed_seconds: elapsed_seconds,
      is_running: false,
      current_run_started_at: nil,
      completed_at: now
    )
    save!(context: :end)
    end_current_break(now)
  end

  def bail_out!(discard_overrun: false)
    self.is_bailed_out = true
    complete!(discard_overrun:)
  end

  def pause!(break_attributes)
    with_lock do
      # A repeated request (double click, second tab) must not count a second pause.
      next if current_break

      breaks.create!(break_attributes)
      update!(
        accumulated_elapsed_seconds: elapsed_seconds_at(Time.current),
        is_running: false,
        current_run_started_at: nil
      )
      reset_current_break
    end
  end

  def resume!
    with_lock do
      next unless current_break

      now = Time.current
      end_current_break(now)
      update!(is_running: true, current_run_started_at: now)
    end
  end

  def extend_by!(minutes)
    with_lock do
      self.extension_minutes = minutes
      validate!(:extend)

      # Capped so a timer that ran past zero gets all the added minutes, instead of still showing 00:00.
      now = Time.current
      update!(
        buffer_minutes: buffer_minutes + extension_minutes,
        accumulated_elapsed_seconds: [ elapsed_seconds_at(now), planned_seconds ].min,
        current_run_started_at: (now if is_running?)
      )
    end
  end

  # Only a timer has a target to beat, so a stopwatch never finishes early. The target is the original plan, so
  # finishing inside the buffer doesn't count. Bailing out ends the session without finishing it.
  def finished_early?
    completed_at? && !is_bailed_out? && timer? && timer_preset? && accumulated_elapsed_seconds < timer_preset.minutes.to_i
  end

  private
    def end_current_break(time)
      current_break&.update!(ended_at: time)
      reset_current_break
    end

    def elapsed_seconds_at(time)
      return accumulated_elapsed_seconds unless is_running? && current_run_started_at?

      accumulated_elapsed_seconds + [ (time - current_run_started_at).floor, 0 ].max
    end

    # Where a timer reaches zero, read before buffer_minutes changes.
    def planned_seconds
      (timer_preset + buffer_minutes).minutes.to_i
    end

    # Only focus counts: time on a break isn't in accumulated_elapsed_seconds.
    def long_enough_to_log
      return if accumulated_elapsed_seconds >= MIN_LOGGED_MINUTES.minutes.to_i

      errors.add(:base, "Focus for at least #{MIN_LOGGED_MINUTES} minutes to log a session. Discard it instead.")
    end

    def session_can_be_extended
      errors.add(:base, "This session is already finished.") if completed_at?
      errors.add(:base, "Only a timer can be extended.") unless timer? && timer_preset?
    end
end
