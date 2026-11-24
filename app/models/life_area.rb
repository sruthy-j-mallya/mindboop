# A part of the user's life (Work, Health, …) that groups their tasks. Tasks without one are in the Inbox.
# A deleted (discarded) area keeps its completed and deleted tasks.
class LifeArea < ApplicationRecord
  include Discard::Model
  include Positionable

  positioned_within :user_id

  MAX_NAME_LENGTH = 40
  # Keys into the client's palette (`components/commons/LifeArea/constants.ts`).
  COLORS = %w[ rose orange amber lime emerald teal sky indigo violet slate ].freeze
  # The emojis on offer, by category: the same file the client's picker lists.
  EMOJIS = JSON.parse(Rails.root.join("app/frontend/components/commons/LifeArea/emojis.json").read)
    .flat_map { |category| category["emojis"].pluck("emoji") }.freeze
  # The Ambience sounds (`components/commons/Ambience/constants.ts`); "none" leaves the sound as it was.
  SOUNDS = %w[ none clock bells piano harp flute rain waves wind morning campfire night ].freeze

  normalizes :name, with: ->(name) { name.squish }

  belongs_to :user
  has_many :tasks, dependent: :nullify

  validates :name, presence: true, length: { maximum: MAX_NAME_LENGTH },
    uniqueness: { scope: :user_id, case_sensitive: false, conditions: -> { kept } }
  validates :color, inclusion: { in: COLORS }
  validates :emoji, inclusion: { in: EMOJIS }
  validates :default_sound, inclusion: { in: SOUNDS }
end
