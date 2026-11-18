class TimeLog < ApplicationRecord
  include Discard::Model

  MAX_BUFFER_MINUTES = 60
  # How far back a session can be logged by hand, or moved to. Keep in sync with TIME_LOG_WINDOW_HOURS on the client.
  LOGGING_WINDOW = 24.hours
  # Room for the clock drift between the browser and the server, so a log ending "now" isn't refused.
  CLOCK_DRIFT_ALLOWANCE = 5.minutes
  MAX_TITLE_LENGTH = 255
  # A session shorter than this is too short to log: it can only be discarded, not completed or bailed out of.
  MIN_LOGGED_MINUTES = 2

  # Deleting a task keeps its time logs in the database, but hides them along with the task. Logs saved with only a
  # title have no task to hide them.
  scope :active, -> { kept.left_joins(:task).where(tasks: { discarded_at: nil }) }
  scope :in_progress, -> { where(completed_at: nil) }
  # Logs that overlap `from...to`. A running log reaches up to now.
  scope :overlapping, ->(from, to) {
    where(started_at: ...to).where("COALESCE(time_logs.completed_at, ?) >= ?", Time.current, from)
  }

  # The minutes of one extension. Not stored: they only add to buffer_minutes.
  attribute :extension_minutes, :integer

  # A manual log records a session after the fact, from the Calendar: it never runs.
  enum :mode, { timer: "timer", stopwatch: "stopwatch", manual: "manual" }, validate: true

  belongs_to :user, default: -> { task&.user }
  # Only a manual log can go without a task; it then has a title of its own.
  belongs_to :task, optional: true
  has_many :breaks, dependent: :destroy
  has_one :current_break, -> { open }, class_name: "Break"
  has_many :parking_lot_items, dependent: :nullify

  validates :task, presence: true, unless: :manual?
  validates :title, presence: true, if: -> { manual? && task.nil? }
  validates :title, length: { maximum: MAX_TITLE_LENGTH }
  validates :started_at, presence: true
  validates :completed_at, presence: true, if: :manual?
  # A timer shorter than the least that can be logged could only ever be discarded.
  validates :timer_preset,
    numericality: { only_integer: true, greater_than_or_equal_to: MIN_LOGGED_MINUTES }, allow_nil: true
  validates :accumulated_elapsed_seconds, numericality: { only_integer: true, greater_than_or_equal_to: 0 }
  validates :is_running, :is_bailed_out, inclusion: { in: [ true, false ] }
  validates :buffer_minutes,
    numericality: { only_integer: true, greater_than_or_equal_to: 0, less_than_or_equal_to: MAX_BUFFER_MINUTES }
  validates :extension_minutes, numericality: { only_integer: true, greater_than: 0 }, on: :extend
  validate :session_can_be_extended, on: :extend
  validate :session_is_finished, on: :reschedule
  validate :times_fit_logging_window, on: %i[ log reschedule ]
  validate :long_enough_to_log, on: :end

  # A new time log always starts running now, so its timing fields never come from the client.
  def start
    now = Time.current
    assign_attributes(is_running: true, started_at: now, current_run_started_at: now)
  end

  # Saves a session that already happened, from `started_at` to `completed_at`.
  def log!
    assign_attributes(is_running: false, current_run_started_at: nil, accumulated_elapsed_seconds: logged_seconds)
    save!(context: :log)
  end

  # Moves a finished session to new times, as when it's dragged on the Calendar. The new span counts as time worked.
  def reschedule!(started_at:, completed_at:)
    with_lock do
      assign_attributes(started_at:, completed_at:)
      self.accumulated_elapsed_seconds = logged_seconds
      save!(context: :reschedule)
    end
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

    def logged_seconds
      return accumulated_elapsed_seconds unless started_at? && completed_at?

      [ (completed_at - started_at).floor, 0 ].max
    end

    def session_is_finished
      errors.add(:base, "Only a finished session can be moved.") if completed_at_in_database.nil?
    end

    def times_fit_logging_window
      return unless started_at? && completed_at?

      now = Time.current
      errors.add(:started_at, "can't be more than 24 hours ago") if started_at < now - LOGGING_WINDOW - CLOCK_DRIFT_ALLOWANCE
      errors.add(:completed_at, "can't be in the future") if completed_at > now + CLOCK_DRIFT_ALLOWANCE
      errors.add(:completed_at, "must be after the start") unless completed_at > started_at
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
