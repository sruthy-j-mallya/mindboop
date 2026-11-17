require "test_helper"

class TimeLogs::CompleterServiceTest < ActiveSupport::TestCase
  def setup
    @user = create(:user)
    @task = create(:task, user: @user)
  end

  def test_that_a_running_time_log_is_stopped_and_completed
    freeze_time do
      time_log = create_timer(accumulated_elapsed_seconds: 150, current_run_started_at: 30.seconds.ago)

      process(time_log)

      time_log.reload
      assert_equal Time.current, time_log.completed_at
      assert_equal 180, time_log.accumulated_elapsed_seconds
      assert_not time_log.is_running
      assert_nil time_log.current_run_started_at
    end
  end

  def test_that_a_paused_time_log_keeps_its_elapsed_time
    time_log = create_timer(accumulated_elapsed_seconds: 150, is_running: false, current_run_started_at: nil)

    process(time_log)

    assert_equal 150, time_log.reload.accumulated_elapsed_seconds
  end

  def test_that_the_task_is_marked_as_done
    process(create_timer)

    assert @task.reload.is_completed
  end

  def test_that_finishing_before_the_preset_counts_an_early_finish
    process(create_timer)
    process(create_timer)

    assert_equal 2, @user.achievements.early_finish.sole.count
  end

  def test_that_finishing_after_the_preset_is_not_an_early_finish
    process(create_timer(current_run_started_at: 26.minutes.ago))

    assert_empty @user.achievements
  end

  def test_that_finishing_exactly_on_the_preset_is_not_an_early_finish
    freeze_time do
      process(create_timer(current_run_started_at: 25.minutes.ago))
    end

    assert_empty @user.achievements
  end

  def test_that_a_stopwatch_is_not_an_early_finish
    process(create(:time_log, task: @task, mode: "stopwatch", is_running: true, current_run_started_at: 3.minutes.ago))

    assert_empty @user.achievements
  end

  def test_that_an_overrun_is_kept_by_default
    freeze_time do
      time_log = create_timer(buffer_minutes: 5, current_run_started_at: 33.minutes.ago)

      process(time_log)

      assert_equal 33.minutes.to_i, time_log.reload.accumulated_elapsed_seconds
    end
  end

  def test_that_a_discarded_overrun_logs_the_planned_time_with_the_buffer
    freeze_time do
      time_log = create_timer(buffer_minutes: 5, current_run_started_at: 33.minutes.ago)

      process(time_log, discard_overrun: true)

      assert_equal 30.minutes.to_i, time_log.reload.accumulated_elapsed_seconds
    end
  end

  def test_that_discarding_the_overrun_keeps_time_short_of_the_plan
    freeze_time do
      time_log = create_timer

      process(time_log, discard_overrun: true)

      assert_equal 3.minutes.to_i, time_log.reload.accumulated_elapsed_seconds
    end
  end

  def test_that_a_stopwatch_has_no_overrun_to_discard
    freeze_time do
      time_log = create(
        :time_log, task: @task, mode: "stopwatch", is_running: true, current_run_started_at: 40.minutes.ago
      )

      process(time_log, discard_overrun: true)

      assert_equal 40.minutes.to_i, time_log.reload.accumulated_elapsed_seconds
    end
  end

  def test_that_completing_twice_counts_once_and_keeps_the_first_completion
    time_log = create_timer
    process(time_log)
    completed_at = time_log.reload.completed_at

    travel 1.minute do
      process(time_log)
    end

    assert_equal completed_at, time_log.reload.completed_at
    assert_equal 1, @user.achievements.early_finish.sole.count
  end

  def test_that_a_session_under_two_minutes_of_focus_cannot_be_completed
    freeze_time do
      time_log = create_timer(current_run_started_at: 119.seconds.ago)

      error = assert_raises(ActiveRecord::RecordInvalid) { process(time_log) }

      assert_includes error.message, "Focus for at least 2 minutes"
      time_log.reload
      assert_nil time_log.completed_at
      assert time_log.is_running
      assert_not @task.reload.is_completed
      assert_empty @user.achievements
    end
  end

  def test_that_exactly_two_minutes_of_focus_can_be_completed
    freeze_time do
      time_log = create_timer(current_run_started_at: 2.minutes.ago)

      process(time_log)

      assert_not_nil time_log.reload.completed_at
    end
  end

  def test_that_a_stopwatch_under_two_minutes_cannot_be_completed
    time_log = create(:time_log, task: @task, mode: "stopwatch", is_running: true, current_run_started_at: 1.minute.ago)

    assert_raises(ActiveRecord::RecordInvalid) { process(time_log) }
    assert_nil time_log.reload.completed_at
  end

  def test_that_time_on_a_break_does_not_count_towards_the_two_minutes
    time_log = create_timer(accumulated_elapsed_seconds: 60, is_running: false, current_run_started_at: nil)
    time_log.breaks.create!(intention: "Delivery", duration_minutes: 5, created_at: 10.minutes.ago)

    assert_raises(ActiveRecord::RecordInvalid) { process(time_log) }
    assert_nil time_log.breaks.sole.ended_at
  end

  private
    def process(time_log, **options)
      TimeLogs::CompleterService.new(time_log, **options).process!
    end

    def create_timer(**attributes)
      create(
        :time_log,
        task: @task,
        mode: "timer",
        timer_preset: 25,
        is_running: true,
        current_run_started_at: 3.minutes.ago,
        **attributes
      )
    end
end
