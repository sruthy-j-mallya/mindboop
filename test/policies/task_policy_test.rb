require "test_helper"

class TaskPolicyTest < ActiveSupport::TestCase
  def setup
    @user = create(:user)
    @task = create(:task, user: @user)
    @other_task = create(:task)
  end

  def test_that_the_owner_can_read_update_and_destroy_their_task
    policy = TaskPolicy.new(@user, @task)

    assert policy.show?
    assert policy.update?
    assert policy.destroy?
  end

  def test_that_other_users_cannot_read_update_or_destroy_the_task
    policy = TaskPolicy.new(@user, @other_task)

    assert_not policy.show?
    assert_not policy.update?
    assert_not policy.destroy?
  end

  def test_that_any_user_can_create_a_task
    assert TaskPolicy.new(@user, Task).create?
  end

  def test_that_scope_returns_only_the_users_tasks
    assert_equal [ @task ], TaskPolicy::Scope.new(@user, Task).resolve.to_a
  end
end
