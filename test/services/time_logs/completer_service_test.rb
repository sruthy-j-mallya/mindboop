require "test_helper"

class TimeLogs::CompleterServiceTest < ActiveSupport::TestCase
  def setup
    @user = create(:user)
    @task = create(:task, user: @user)
  end

  def test_that_a_running_time_log_is_stopped_and_completed
    freeze_time do
      time_log = create_timer(accumulated_elapsed_seconds: 60, current_run_started_at: 30.seconds.ago)

      process(time_log)

      time_log.reload
      assert_equal Time.current, time_log.completed_at
      assert_equal 90, time_log.accumulated_elapsed_seconds
      assert_not time_log.is_running
      assert_nil time_log.current_run_started_at
    end
  end

  def test_that_a_paused_time_log_keeps_its_elapsed_time
    time_log = create_timer(accumulated_elapsed_seconds: 60, is_running: false, current_run_started_at: nil)

    process(time_log)

    assert_equal 60, time_log.reload.accumulated_elapsed_seconds
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
    process(create(:time_log, task: @task, mode: "stopwatch", is_running: true, current_run_started_at: Time.current))

    assert_empty @user.achievements
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

  private
    def process(time_log)
      TimeLogs::CompleterService.new(time_log).process!
    end

    def create_timer(**attributes)
      create(
        :time_log,
        task: @task,
        mode: "timer",
        timer_preset: 25,
        is_running: true,
        current_run_started_at: 1.minute.ago,
        **attributes
      )
    end
end
