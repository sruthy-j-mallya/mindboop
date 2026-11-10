require "test_helper"

class TimeLogPolicyTest < ActiveSupport::TestCase
  def setup
    @user = create(:user)
    @time_log = create(:time_log, task: create(:task, user: @user))
    @other_time_log = create(:time_log)
  end

  def test_that_the_task_owner_can_create_update_and_destroy_the_time_log
    policy = TimeLogPolicy.new(@user, @time_log)

    assert policy.create?
    assert policy.update?
    assert policy.destroy?
  end

  def test_that_other_users_cannot_create_update_or_destroy_the_time_log
    policy = TimeLogPolicy.new(@user, @other_time_log)

    assert_not policy.create?
    assert_not policy.update?
    assert_not policy.destroy?
  end

  def test_that_scope_returns_only_time_logs_of_the_users_tasks
    assert_equal [ @time_log ], TimeLogPolicy::Scope.new(@user, TimeLog).resolve.to_a
  end
end
