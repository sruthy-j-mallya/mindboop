# A part of the user's life (Work, Health, …) that groups their tasks. Tasks without one are in the Inbox.
class LifeArea < ApplicationRecord
  MAX_NAME_LENGTH = 40
  # Keys into the client's palette (`components/commons/LifeArea/constants.ts`).
  COLORS = %w[ rose orange amber lime emerald teal sky indigo violet slate ].freeze
  # The emojis on offer, by category: the same file the client's picker lists.
  EMOJIS = JSON.parse(Rails.root.join("app/frontend/components/commons/LifeArea/emojis.json").read)
    .flat_map { |category| category["emojis"].pluck("emoji") }.freeze
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
  validates :emoji, inclusion: { in: EMOJIS }
  validates :default_sound, inclusion: { in: SOUNDS }
end
