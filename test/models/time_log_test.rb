require "test_helper"

class TimeLogTest < ActiveSupport::TestCase
  def setup
    @time_log = create(:time_log)
  end

  def test_that_a_task_is_required
    assert_not build(:time_log, task: nil).valid?
  end

  def test_that_mode_must_be_timer_or_stopwatch
    assert build(:time_log, mode: "timer").valid?
    assert build(:time_log, mode: "stopwatch").valid?
    assert_not build(:time_log, mode: "countdown").valid?
    assert_not build(:time_log, mode: nil).valid?
  end

  def test_that_started_at_is_required
    assert_not build(:time_log, started_at: nil).valid?
  end

  def test_that_timer_preset_must_be_a_positive_integer_when_present
    assert_not build(:time_log, timer_preset: 0).valid?
    assert_not build(:time_log, timer_preset: 1.5).valid?
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
end
