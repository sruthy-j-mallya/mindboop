# One row per user, made on their first change; until then the column defaults apply.
class UserPreference < ApplicationRecord
  THEMES = %w[ system light dark ].freeze
  COMPLETION_SOUNDS = %w[ rising crisp wood soft glass triple tick_ding bell chime none ].freeze
  ALARM_SOUNDS = %w[ classic digital chimes marimba bell ].freeze

  belongs_to :user

  validates :theme, inclusion: { in: THEMES }
  validates :completion_sound, inclusion: { in: COMPLETION_SOUNDS }
  validates :break_alarm_sound, inclusion: { in: ALARM_SOUNDS }
end
