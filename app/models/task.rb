class Task < ApplicationRecord
  include Discard::Model

  belongs_to :user
  # Discarded items stay hidden. The database deletes them with their task (on_delete: :cascade).
  has_many :checklist_items, -> { kept.order(:position) }, inverse_of: :task
  has_many :time_logs, dependent: :destroy
  has_many :breadcrumbs, dependent: :destroy
  accepts_nested_attributes_for :checklist_items

  validates :title, presence: true
  validates :estimated_minutes, numericality: { only_integer: true, greater_than: 0 }, allow_nil: true
  validates :is_duration, :is_all_day, :is_completed, inclusion: { in: [ true, false ] }
end
