# One thing to do in a routine, in the order the user sets. Ticking a step off belongs to a session
# (`TimeLog#checked_routine_step_ids`), so each session starts with none ticked.
class RoutineStep < ApplicationRecord
  include Discard::Model
  include Positionable

  MAX_TITLE_LENGTH = 255

  positioned_within :routine_id

  normalizes :title, with: ->(title) { title.squish }

  belongs_to :routine

  validates :title, presence: true, length: { maximum: MAX_TITLE_LENGTH }
end
