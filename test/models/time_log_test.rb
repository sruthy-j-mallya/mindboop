require "test_helper"

class TimeLogTest < ActiveSupport::TestCase
  def setup
    @time_log = create(:time_log)
  end

  def test_that_a_task_is_required
    assert_not build(:time_log, task: nil).valid?
  end

  def test_that_mode_must_be_timer_stopwatch_or_manual
    assert build(:time_log, mode: "timer").valid?
    assert build(:time_log, mode: "stopwatch").valid?
    assert build(:time_log, :manual).valid?
    assert_not build(:time_log, mode: "countdown").valid?
    assert_not build(:time_log, mode: nil).valid?
  end

  def test_that_started_at_is_required
    assert_not build(:time_log, started_at: nil).valid?
  end

  def test_that_timer_preset_must_be_a_whole_number_of_at_least_the_minimum_logged_minutes_when_present
    assert_not build(:time_log, timer_preset: 0).valid?
    assert_not build(:time_log, timer_preset: TimeLog::MIN_LOGGED_MINUTES - 1).valid?
    assert_not build(:time_log, timer_preset: 2.5).valid?
    assert build(:time_log, timer_preset: TimeLog::MIN_LOGGED_MINUTES).valid?
    assert build(:time_log, timer_preset: nil).valid?
  end

  def test_that_accumulated_elapsed_seconds_defaults_to_zero_and_cannot_be_negative
    assert_equal 0, @time_log.accumulated_elapsed_seconds
    assert_not build(:time_log, accumulated_elapsed_seconds: -1).valid?
  end

  def test_that_is_running_defaults_to_false_and_cannot_be_null
    assert_equal false, @time_log.is_running
    assert_not build(:time_log, is_running: nil).valid?
  end

  def test_that_active_excludes_discarded_time_logs
    @time_log.discard!

    assert_not_includes TimeLog.active, @time_log
  end

  def test_that_active_excludes_time_logs_of_a_discarded_task
    @time_log.task.discard!

    assert_not_includes TimeLog.active, @time_log
    assert TimeLog.exists?(@time_log.id)
  end

  def test_that_destroying_a_task_destroys_its_time_logs
    assert_difference "TimeLog.count", -1 do
      @time_log.task.destroy!
    end
  end

  def test_that_the_user_comes_from_the_task
    assert_equal @time_log.task.user, @time_log.user
  end

  def test_that_a_manual_log_needs_a_title_without_a_task
    assert_not build(:time_log, :manual, title: nil).valid?
    assert build(:time_log, :manual, title: nil, task: create(:task)).valid?
  end

  def test_that_a_manual_log_needs_an_end
    assert_not build(:time_log, :manual, completed_at: nil).valid?
  end

  def test_that_log_saves_a_finished_session_within_the_last_24_hours
    freeze_time
    time_log = build(:time_log, :manual, started_at: 90.minutes.ago, completed_at: 30.minutes.ago)

    time_log.log!

    assert_not time_log.is_running?
    assert_equal 1.hour.to_i, time_log.accumulated_elapsed_seconds
  end

  def test_that_log_rejects_an_end_before_the_start
    time_log = build(:time_log, :manual, started_at: 1.hour.ago, completed_at: 2.hours.ago)

    assert_raises(ActiveRecord::RecordInvalid) { time_log.log! }
    assert_includes time_log.errors[:completed_at], "must be after the start"
  end

  def test_that_reschedule_moves_a_finished_session
    freeze_time
    time_log = create(:time_log, :manual)

    time_log.reschedule!(started_at: 10.hours.ago, completed_at: 9.hours.ago)

    assert_equal 10.hours.ago, time_log.reload.started_at
  end

  def test_that_reschedule_rejects_a_running_session
    assert_raises(ActiveRecord::RecordInvalid) do
      @time_log.reschedule!(started_at: 2.hours.ago, completed_at: 1.hour.ago)
    end
  end
end
