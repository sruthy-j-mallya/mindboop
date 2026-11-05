class TimeLog < ApplicationRecord
  include Discard::Model

  # Deleting a task keeps its time logs in the database, but hides them along with the task.
  scope :active, -> { kept.joins(:task).merge(Task.kept) }

  enum :mode, { timer: "timer", stopwatch: "stopwatch" }, validate: true

  belongs_to :task

  validates :started_at, presence: true
  validates :timer_preset, numericality: { only_integer: true, greater_than: 0 }, allow_nil: true
  validates :accumulated_elapsed_seconds, :pause_count, numericality: { only_integer: true, greater_than_or_equal_to: 0 }
  validates :is_running, inclusion: { in: [ true, false ] }
end
