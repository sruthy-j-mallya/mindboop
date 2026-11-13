class Task < ApplicationRecord
  include Discard::Model

  MAX_DESCRIPTION_LENGTH = 10_000

  # The description is Markdown written in the rich-text editor; an empty editor saves as nil.
  normalizes :description, with: ->(description) { description.strip.presence }

  belongs_to :user
  # Discarded items stay hidden. The database deletes them with their task (on_delete: :cascade).
  has_many :checklist_items, -> { kept.order(:position) }, inverse_of: :task
  has_many :time_logs, dependent: :destroy
  has_many :breadcrumbs, dependent: :destroy
  accepts_nested_attributes_for :checklist_items

  validates :title, presence: true
  validates :description, length: { maximum: MAX_DESCRIPTION_LENGTH }
  validates :estimated_minutes, numericality: { only_integer: true, greater_than: 0 }, allow_nil: true
  # A quick start runs a timer, which needs a target.
  validates :estimated_minutes, presence: true, on: :quick_start
  validates :is_duration, :is_all_day, :is_completed, inclusion: { in: [ true, false ] }
  # A task is scheduled for a date (starts_at only) or a duration (starts_at to ends_at). All-day ones keep the start
  # of each day in the user's time zone.
  validates :starts_at, presence: true, if: -> { is_duration || ends_at.present? }
  validates :ends_at, presence: true, if: :is_duration
  validates :ends_at, absence: true, unless: :is_duration
  validates :ends_at, comparison: { greater_than_or_equal_to: :starts_at }, if: -> { starts_at? && ends_at? }
end
