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
  OVERLAP_ERROR = "This overlaps another session. You can only do one thing at a time.".freeze

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
  # A manual log can go without a task (it then has a title of its own, or a routine), and so can a session on a routine.
  belongs_to :task, optional: true
  belongs_to :routine, optional: true
  has_many :breaks, dependent: :destroy
  has_one :current_break, -> { open }, class_name: "Break"
  has_many :parking_lot_items, dependent: :nullify

  validates :task, presence: true, unless: -> { manual? || routine }
  validates :title, presence: true, if: -> { manual? && task.nil? && routine.nil? }
  validate :routine_belongs_to_user, if: :routine_id?
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
  validate :session_can_be_moved, on: :reschedule
  validate :times_fit_logging_window, on: %i[ log reschedule ]
  # A custom context replaces :create, so a manual log (saved on :log) needs listing on its own.
  validate :does_not_overlap_another_session, on: %i[ create log reschedule restore ]
  validate :long_enough_to_log, on: :end

  around_save :refuse_overlap_found_by_database

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

  # Moves a manual log to new times, as when it's dragged on the Calendar. The new span counts as time worked. A timer or
  # stopwatch log records time the app measured, so it can't be moved.
  def reschedule!(started_at:, completed_at:)
    with_lock do
      assign_attributes(started_at:, completed_at:)
      self.accumulated_elapsed_seconds = logged_seconds
      save!(context: :reschedule)
    end
  end

  # Brings back a deleted session, as when its delete is undone. Refused (RecordInvalid) when another session has taken
  # its time since.
  def restore!
    with_lock do
      self.discarded_at = nil
      save!(context: :restore)
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

  # Ends a session for good without finishing its task, as when the task is deleted: the time so far is logged, or the
  # session is discarded when it's too short to log.
  def stop!
    return discard! if elapsed_seconds_at(Time.current) < MIN_LOGGED_MINUTES.minutes.to_i

    complete!
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
  # finishing inside the buffer doesn't count. Bailing out ends the session without finishing it. A routine's timer is a
  # guide, not a target: any time on it counts the same.
  def finished_early?
    task_id? && completed_at? && !is_bailed_out? && timer? && timer_preset? && accumulated_elapsed_seconds < timer_preset.minutes.to_i
  end

  private
    # An unknown routine and another user's read the same, so an id gives nothing away.
    def routine_belongs_to_user
      errors.add(:routine, "must exist") if routine&.user_id != user_id
    end

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

    # A manual log is always finished, so this also refuses a running session.
    def session_can_be_moved
      errors.add(:base, "Only a manually logged session can be moved.") unless manual?
    end

    def times_fit_logging_window
      return unless started_at? && completed_at?

      now = Time.current
      if logging_window_applies? && started_at < now - LOGGING_WINDOW - CLOCK_DRIFT_ALLOWANCE
        errors.add(:started_at, "can't be more than 24 hours ago")
      end
      errors.add(:completed_at, "can't be in the future") if completed_at > now + CLOCK_DRIFT_ALLOWANCE
      errors.add(:completed_at, "must be after the start") unless completed_at > started_at
    end

    # A routine's past days can be filled in at any time, from its month grid. Moving a log is still limited.
    def logging_window_applies?
      validation_context != :log || routine.nil? || task.present?
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

    # A user does one thing at a time, so no two of their sessions share a moment. Sessions may touch end to start. A
    # running session has no end yet: it reaches on past now, so nothing can start or be logged after its start. A
    # deleted task's logs still count: that work was done. Times already refused aren't checked.
    def does_not_overlap_another_session
      return if errors.any? || user.nil? || !started_at?

      others = user.time_logs.kept.where.not(id:)
        .where("time_logs.completed_at IS NULL OR time_logs.completed_at > ?", started_at)
      others = others.where(started_at: ...completed_at) if completed_at?
      errors.add(:base, OVERLAP_ERROR) if others.exists?
    end

    # Two requests at once can both pass the validation; the database constraint then refuses the second. It's reported
    # like the validation, so the client gets the same 422.
    def refuse_overlap_found_by_database
      yield
    rescue ActiveRecord::ExclusionViolation
      errors.add(:base, OVERLAP_ERROR)
      raise ActiveRecord::RecordInvalid, self
    end

    def session_can_be_extended
      errors.add(:base, "This session is already finished.") if completed_at?
      errors.add(:base, "Only a timer can be extended.") unless timer? && timer_preset?
    end
end
