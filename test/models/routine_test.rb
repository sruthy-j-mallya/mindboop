require "test_helper"

class RoutineTest < ActiveSupport::TestCase
  def setup
    @routine = create(:routine)
  end

  def test_that_title_is_required_and_squished
    @routine.title = " "

    assert_not @routine.valid?
    assert_includes @routine.errors[:title], "can't be blank"

    @routine.update!(title: "  Fold   clothes ")

    assert_equal "Fold clothes", @routine.title
  end

  def test_that_title_cannot_exceed_the_maximum_length
    @routine.title = "a" * (Routine::MAX_TITLE_LENGTH + 1)

    assert_not @routine.valid?
  end

  def test_that_duration_must_be_within_the_limits
    @routine.duration_minutes = Routine::MIN_DURATION_MINUTES - 1
    assert_not @routine.valid?

    @routine.duration_minutes = Routine::MAX_DURATION_MINUTES + 1
    assert_not @routine.valid?

    @routine.duration_minutes = Routine::MIN_DURATION_MINUTES
    assert @routine.valid?
  end

  def test_that_icon_color_and_sound_must_be_known
    @routine.assign_attributes(icon: "rocket-ship", color: "plaid", sound: "thunder")

    assert_not @routine.valid?
    assert_equal %i[ icon color sound ], @routine.errors.attribute_names
  end

  def test_that_a_reminder_needs_a_valid_time_and_days
    @routine.assign_attributes(reminder_time: "25:00", reminder_days: [ 1 ])
    assert_not @routine.valid?
    assert_includes @routine.errors[:reminder_time], "must be a time like 08:30"

    @routine.assign_attributes(reminder_time: "07:15", reminder_days: [])
    assert_not @routine.valid?
    assert_includes @routine.errors[:reminder_days], "can't be empty when there's a reminder"

    @routine.assign_attributes(reminder_days: [ 7 ])
    assert_not @routine.valid?
    assert_includes @routine.errors[:reminder_days], "must be weekdays from 0 (Sunday) to 6"
  end

  def test_that_reminder_days_are_sorted_without_repeats
    @routine.update!(reminder_time: "07:15", reminder_days: [ 5, 1, 5, 3 ])

    assert_equal [ 1, 3, 5 ], @routine.reminder_days
  end

  def test_that_clearing_the_reminder_time_clears_its_days
    @routine.update!(reminder_time: "07:15", reminder_days: [ 1 ])
    @routine.update!(reminder_time: "")

    assert_nil @routine.reminder_time
    assert_empty @routine.reminder_days
  end

  def test_that_stats_count_only_finished_and_kept_sessions
    other = create(:routine, user: @routine.user)
    started_at = 3.hours.ago
    create(:time_log, :routine, routine: @routine, started_at:, completed_at: started_at + 10.minutes,
      accumulated_elapsed_seconds: 600)
    last = create(:time_log, :routine, routine: @routine, started_at: 2.hours.ago, completed_at: 1.hour.ago,
      accumulated_elapsed_seconds: 300)
    create(:time_log, :routine, routine: @routine, started_at: 50.minutes.ago, completed_at: 40.minutes.ago,
      accumulated_elapsed_seconds: 600).discard!
    create(:time_log, :routine, routine: @routine, started_at: 30.minutes.ago)

    stats = Routine.with_stats.index_by(&:id)

    assert_equal [ 2, 900 ], stats[@routine.id].values_at(:sessions_count, :total_seconds)
    assert_equal last.completed_at.to_i, stats[@routine.id].last_done_at.to_i
    assert_equal [ 0, 0, nil ], stats[other.id].values_at(:sessions_count, :total_seconds, :last_done_at)
  end
end
