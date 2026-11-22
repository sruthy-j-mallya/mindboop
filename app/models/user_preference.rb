# One row per user, made on their first change; until then the column defaults apply.
class UserPreference < ApplicationRecord
  THEMES = %w[ system light dark ].freeze
  COMPLETION_SOUNDS = %w[ rising crisp wood soft glass triple tick_ding bell chime none ].freeze
  ALARM_SOUNDS = %w[ classic digital chimes marimba bell ].freeze
  # The day the Calendar's weeks start on: 0 is Sunday and 6 Saturday, as in date-fns's `weekStartsOn`.
  WEEK_START_DAYS = 0..6

  belongs_to :user

  validates :theme, inclusion: { in: THEMES }
  validates :completion_sound, inclusion: { in: COMPLETION_SOUNDS }
  validates :break_alarm_sound, inclusion: { in: ALARM_SOUNDS }
  validates :week_starts_on, numericality: { only_integer: true, in: WEEK_START_DAYS }
end
