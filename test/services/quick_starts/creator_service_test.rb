require "test_helper"

class QuickStarts::CreatorServiceTest < ActiveSupport::TestCase
  def setup
    @user = create(:user)
    @attributes = { title: Faker::Lorem.sentence, estimated_minutes: 25 }
  end

  def test_that_a_task_and_its_running_timer_are_created
    freeze_time do
      time_log = QuickStarts::CreatorService.new(@user, @attributes).process!

      assert time_log.persisted?
      assert_equal @user, time_log.task.user
      assert time_log.timer?
      assert_equal 25, time_log.timer_preset
      assert time_log.is_running?
      assert_equal Time.current, time_log.started_at
    end
  end

  def test_that_the_task_is_rolled_back_when_the_time_log_cannot_be_saved
    with_failing_time_log_save do
      assert_no_difference [ "Task.count", "TimeLog.count" ] do
        assert_raises(ActiveRecord::RecordInvalid) { QuickStarts::CreatorService.new(@user, @attributes).process! }
      end
    end
  end

  private
    # Any valid task makes a valid time log, so the second save is made to fail by hand. TimeLog doesn't define
    # save! itself, so removing the override restores the inherited one.
    def with_failing_time_log_save
      TimeLog.define_method(:save!) { |**| raise ActiveRecord::RecordInvalid, self }
      yield
    ensure
      TimeLog.remove_method(:save!)
    end
end
