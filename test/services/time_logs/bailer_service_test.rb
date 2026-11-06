require "test_helper"

class TimeLogs::BailerServiceTest < ActiveSupport::TestCase
  def setup
    @user = create(:user)
    @task = create(:task, user: @user)
    @time_log = create(
      :time_log,
      task: @task,
      mode: "timer",
      timer_preset: 25,
      is_running: true,
      current_run_started_at: 1.minute.ago
    )
    @attributes = attributes_for(:breadcrumb)
  end

  def test_that_a_breadcrumb_is_saved_on_the_task
    process

    breadcrumb = @task.breadcrumbs.sole
    assert_equal @attributes[:completed_description], breadcrumb.completed_description
    assert_equal @attributes[:restart_description], breadcrumb.restart_description
  end

  def test_that_the_time_log_is_stopped_and_ended
    freeze_time do
      @time_log.update!(accumulated_elapsed_seconds: 60, current_run_started_at: 30.seconds.ago)

      process

      @time_log.reload
      assert_equal Time.current, @time_log.completed_at
      assert_equal 90, @time_log.accumulated_elapsed_seconds
      assert_not @time_log.is_running
      assert_nil @time_log.current_run_started_at
      assert @time_log.is_bailed_out
    end
  end

  def test_that_the_task_stays_open
    process

    assert_not @task.reload.is_completed
  end

  def test_that_bailing_out_before_the_preset_is_not_an_early_finish
    process

    assert_not @time_log.reload.finished_early?
    assert_empty @user.achievements
  end

  def test_that_an_open_break_is_ended
    current_break = create(:break, time_log: @time_log)

    process

    assert_not_nil current_break.reload.ended_at
  end

  def test_that_bailing_out_twice_leaves_one_breadcrumb_and_keeps_the_first_end
    process
    completed_at = @time_log.reload.completed_at

    travel 1.minute do
      process
    end

    assert_equal completed_at, @time_log.reload.completed_at
    assert_equal 1, @task.breadcrumbs.count
  end

  def test_that_invalid_breadcrumbs_leave_the_session_running
    assert_raises(ActiveRecord::RecordInvalid) do
      TimeLogs::BailerService.new(@time_log, @attributes.merge(restart_description: " ")).process!
    end

    @time_log.reload
    assert_nil @time_log.completed_at
    assert @time_log.is_running
    assert_empty @task.breadcrumbs
  end

  private
    def process
      TimeLogs::BailerService.new(@time_log, @attributes).process!
    end
end
