class Task < ApplicationRecord
  include Discard::Model

  MAX_DESCRIPTION_LENGTH = 10_000
  MAX_ESTIMATED_MINUTES = 24 * 60
  # A task is scheduled from now on; only time logs go back in time. A timed start may sit in the quarter hour now falls
  # in, as on the Calendar, plus a little clock skew. An all-day start is midnight where the user is, which the server
  # doesn't know, so it may be up to a day back.
  TIMED_START_GRACE = 20.minutes
  ALL_DAY_START_GRACE = 1.day

  # Soonest due first, undated tasks last; ties go to the newest task. id breaks created_at ties, so a task can't repeat
  # or go missing across pages.
  scope :by_due_date, -> { order(arel_table[:starts_at].asc.nulls_last, created_at: :desc, id: :desc) }
  # Most recently changed first, the order completed tasks are listed in. id breaks ties.
  scope :by_latest_change, -> { order(updated_at: :desc, id: :desc) }
  scope :by_latest_deletion, -> { order(discarded_at: :desc, id: :desc) }
  # Scheduled tasks that overlap `from...to`. A task with only a date reaches a day past it, which covers the estimate the
  # Calendar draws it with.
  scope :scheduled_between, ->(from, to) {
    where(starts_at: ...to).where("COALESCE(tasks.ends_at, tasks.starts_at + INTERVAL '1 day') >= ?", from)
  }

  # Scheduled tasks that touch the day `from...to`. A date counts only on its own day, with no estimate added.
  scope :due_between, ->(from, to) {
    where(starts_at: ...to).where("COALESCE(tasks.ends_at, tasks.starts_at) >= ?", from)
  }
  # Scheduled tasks that ended (or were due) before `from`, so never the ones `due_between` finds from there.
  scope :overdue_at, ->(from) { where("COALESCE(tasks.ends_at, tasks.starts_at) < ?", from) }
  # Soonest to end (or due) first; id breaks ties.
  scope :by_end, -> { order(Arel.sql("COALESCE(tasks.ends_at, tasks.starts_at)"), :id) }
  # Only tasks with breadcrumbs, by their newest one.
  scope :by_latest_breadcrumb, -> {
    latest = Breadcrumb.group(:task_id).select(:task_id, "MAX(breadcrumbs.created_at) AS created_at")
    joins("INNER JOIN (#{latest.to_sql}) latest_breadcrumbs ON latest_breadcrumbs.task_id = tasks.id")
      .order("latest_breadcrumbs.created_at DESC", id: :desc)
  }

  # The description is Markdown written in the rich-text editor; an empty editor saves as nil.
  normalizes :description, with: ->(description) { description.strip.presence }

  belongs_to :user
  # Without an area, the task is in the Inbox.
  belongs_to :life_area, optional: true
  # Discarded items stay hidden. The database deletes them with their task (on_delete: :cascade).
  has_many :checklist_items, -> { kept.order(:position) }, inverse_of: :task
  has_many :time_logs, dependent: :destroy
  # Newest first, the order the task pane's timeline shows them in.
  has_many :breadcrumbs, -> { order(created_at: :desc, id: :desc) }, dependent: :destroy
  accepts_nested_attributes_for :checklist_items

  validates :title, presence: true
  validates :description, length: { maximum: MAX_DESCRIPTION_LENGTH }
  validates :estimated_minutes, numericality: { only_integer: true, greater_than: 0, less_than_or_equal_to: MAX_ESTIMATED_MINUTES },
    allow_nil: true
  # A quick start runs a timer, which needs a target.
  validates :estimated_minutes, presence: true, on: :quick_start
  validates :estimated_minutes, numericality: { greater_than_or_equal_to: TimeLog::MIN_LOGGED_MINUTES },
    allow_nil: true, on: :quick_start
  validates :is_duration, :is_all_day, :is_completed, inclusion: { in: [ true, false ] }
  # A task is scheduled for a date (starts_at only) or a duration (starts_at to ends_at). All-day ones keep the start
  # of each day in the user's time zone.
  validates :starts_at, presence: true, if: -> { is_duration || ends_at.present? }
  validates :ends_at, presence: true, if: :is_duration
  validates :ends_at, absence: true, unless: :is_duration
  validates :ends_at, comparison: { greater_than_or_equal_to: :starts_at }, if: -> { starts_at? && ends_at? }
  # Only a new or moved start is checked, so an overdue task can still be edited, completed or stretched at its end.
  validate :starts_at_is_not_in_the_past, if: -> { starts_at? && starts_at_changed? }
  validate :life_area_belongs_to_user, if: :life_area_id?
  validate :life_area_is_not_deleted, if: -> { life_area_id? && life_area_id_changed? }

  before_save :return_to_inbox, if: -> { undiscarded? && !is_completed && life_area&.discarded? }
  before_discard :stop_running_session

  private
    def starts_at_is_not_in_the_past
      grace = is_all_day ? ALL_DAY_START_GRACE : TIMED_START_GRACE
      errors.add(:starts_at, "can't be in the past") if starts_at < Time.current - grace
    end

    # An unknown area and another user's read the same, so an id gives nothing away.
    def life_area_belongs_to_user
      errors.add(:life_area, "must exist") if life_area&.user_id != user_id
    end

    # Reads like an unknown area: a deleted one takes no more tasks.
    def life_area_is_not_deleted
      errors.add(:life_area, "must exist") if life_area&.discarded? && errors[:life_area].empty?
    end

    # A task reopened or restored after its area was deleted has no list to go back to.
    def return_to_inbox
      self.life_area = nil
    end

    # Work done on a task still counts once it's deleted, but no more can be done on it, so a running session ends here.
    # Restoring the task doesn't restart it.
    def stop_running_session
      time_logs.kept.in_progress.each(&:stop!)
    end
end
