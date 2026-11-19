# A part of the user's life (Work, Health, …) that groups their tasks. Tasks without one are in the Inbox.
class LifeArea < ApplicationRecord
  MAX_NAME_LENGTH = 40
  # Keys into the client's palette and icon set (`components/commons/LifeArea/constants.ts`).
  COLORS = %w[ rose orange amber lime emerald teal sky indigo violet slate ].freeze
  ICONS = %w[
    briefcase heart users house dumbbell heart-pulse gamepad-2 palette book-open sprout wallet plane music coffee
    brain sparkles paw-print baby laptop smile
  ].freeze
  # The Ambience sounds (`components/commons/Ambience/constants.ts`); "none" leaves the sound as it was.
  SOUNDS = %w[ none clock bells piano harp flute rain waves wind morning campfire night ].freeze

  # The order the areas sidebar lists them in: the oldest first, so a new one goes at the bottom.
  scope :in_created_order, -> { order(:created_at, :id) }

  normalizes :name, with: ->(name) { name.squish }

  belongs_to :user
  # The foreign key nullifies too (on_delete: :nullify), which also covers discarded tasks.
  has_many :tasks, dependent: :nullify

  validates :name, presence: true, length: { maximum: MAX_NAME_LENGTH },
    uniqueness: { scope: :user_id, case_sensitive: false }
  validates :color, inclusion: { in: COLORS }
  validates :icon, inclusion: { in: ICONS }
  validates :default_sound, inclusion: { in: SOUNDS }
end
