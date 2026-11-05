class Task < ApplicationRecord
  include Discard::Model

  belongs_to :user
  has_many :checklist_items, -> { order(:created_at) }, dependent: :destroy, inverse_of: :task
  accepts_nested_attributes_for :checklist_items

  validates :title, presence: true
  validates :estimated_minutes, numericality: { only_integer: true, greater_than: 0 }, allow_nil: true
  validates :is_duration, :is_all_day, :is_completed, inclusion: { in: [ true, false ] }
end
