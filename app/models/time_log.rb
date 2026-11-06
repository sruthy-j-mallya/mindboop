class TimeLog < ApplicationRecord
  include Discard::Model

  # Deleting a task keeps its time logs in the database, but hides them along with the task.
  scope :active, -> { kept.joins(:task).merge(Task.kept) }
  scope :in_progress, -> { where(completed_at: nil) }

  enum :mode, { timer: "timer", stopwatch: "stopwatch" }, validate: true

  belongs_to :task

  validates :started_at, presence: true
  validates :timer_preset, numericality: { only_integer: true, greater_than: 0 }, allow_nil: true
  validates :accumulated_elapsed_seconds, :pause_count, numericality: { only_integer: true, greater_than_or_equal_to: 0 }
  validates :is_running, inclusion: { in: [ true, false ] }

  def complete!
    now = Time.current
    update!(
      accumulated_elapsed_seconds: elapsed_seconds_at(now),
      is_running: false,
      current_run_started_at: nil,
      completed_at: now
    )
  end

  # Only a timer has a target to beat, so a stopwatch never finishes early.
  def finished_early?
    completed_at? && timer? && timer_preset? && accumulated_elapsed_seconds < timer_preset.minutes.to_i
  end

  private
    def elapsed_seconds_at(time)
      return accumulated_elapsed_seconds unless is_running? && current_run_started_at?

      accumulated_elapsed_seconds + [ (time - current_run_started_at).floor, 0 ].max
    end
end
