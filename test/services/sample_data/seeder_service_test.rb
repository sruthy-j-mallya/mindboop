require "test_helper"

class SampleData::SeederServiceTest < ActiveSupport::TestCase
  def setup
    @email_addresses = SampleData::Seeders::UsersSeeder::EMAIL_ADDRESSES
  end

  def test_that_every_sample_user_is_created_and_can_sign_in
    SampleData::SeederService.new.process!

    @email_addresses.each_value do |email_address|
      user = User.find_by!(email_address:)
      assert user.authenticate(SampleData::Seeders::UsersSeeder::PASSWORD)
    end
  end

  def test_that_running_it_again_replaces_the_sample_users_instead_of_adding_to_them
    SampleData::SeederService.new.process!

    assert_no_difference [ "User.count", "Task.count", "TimeLog.count", "ParkingLotItem.count", "Breadcrumb.count" ] do
      SampleData::SeederService.new.process!
    end
  end

  def test_that_other_users_are_left_alone
    user = create(:user)
    create(:task, user:)

    SampleData::SeederService.new.process!

    assert_equal 1, user.tasks.count
  end

  def test_that_the_demo_user_covers_the_task_scenarios
    demo = SampleData::SeederService.new.process!.users.fetch(:demo)

    tasks = demo.tasks.kept
    assert tasks.exists?(life_area_id: nil, is_completed: false), "an Inbox task"
    assert tasks.exists?(is_completed: true), "a completed task"
    assert demo.tasks.discarded.exists?, "a deleted task"
    assert tasks.where(is_completed: false).overdue_at(Date.current.in_time_zone).exists?, "an overdue task"
    assert tasks.exists?(is_all_day: true, is_duration: true), "a task over several days"
    assert tasks.where(is_completed: false).by_latest_breadcrumb.exists?, "a task to pick up"
    assert ChecklistItem.discarded.exists?(task: demo.tasks), "a deleted step"
    assert demo.life_areas.discarded.exists?, "a deleted area"
  end

  def test_that_the_demo_user_covers_the_session_scenarios
    demo = SampleData::SeederService.new.process!.users.fetch(:demo)

    time_logs = demo.time_logs.kept
    assert_equal %w[ manual stopwatch timer ], time_logs.distinct.pluck(:mode).sort
    assert time_logs.exists?(is_bailed_out: true), "a bail-out"
    assert time_logs.where.not(buffer_minutes: 0).exists?, "an extended timer"
    assert time_logs.where.not(routine_id: nil).exists?, "a routine session"
    assert time_logs.exists?(mode: :manual, task_id: nil, routine_id: nil), "a log with only a title"
    assert demo.time_logs.discarded.exists?, "a deleted session"
    assert_empty time_logs.in_progress, "nothing on the clock"
    assert_equal time_logs.count(&:finished_early?), demo.achievements.find_by!(kind: :early_finish).count
  end

  def test_that_the_focus_user_is_in_the_middle_of_a_session
    focus = SampleData::SeederService.new.process!.users.fetch(:focus)

    time_log = focus.time_logs.in_progress.sole
    assert time_log.is_running?
    assert time_log.breaks.where.not(ended_at: nil).exists?
    assert focus.parking_lot_items.in_curiosity_time.exists?
  end

  def test_that_the_new_user_has_no_data
    new_user = SampleData::SeederService.new.process!.users.fetch(:new)

    assert_nil new_user.preference
    assert_empty new_user.tasks
    assert_empty new_user.life_areas
    assert_empty new_user.time_logs
  end

  def test_that_it_refuses_to_run_in_production
    in_production do
      assert_no_difference "User.count" do
        assert_raises(RuntimeError) { SampleData::SeederService.new.process! }
      end
    end
  end

  private
    def in_production
      original_env = Rails.env
      Rails.env = "production"
      yield
    ensure
      Rails.env = original_env
    end
end
