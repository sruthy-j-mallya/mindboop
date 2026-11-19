require "test_helper"

class RoutinePolicyTest < ActiveSupport::TestCase
  def setup
    @user = create(:user)
    @routine = create(:routine, user: @user)
    @other_routine = create(:routine)
  end

  def test_that_the_owner_can_show_update_and_destroy_their_routine
    policy = RoutinePolicy.new(@user, @routine)

    assert policy.show?
    assert policy.update?
    assert policy.destroy?
  end

  def test_that_other_users_cannot_show_update_or_destroy_the_routine
    policy = RoutinePolicy.new(@user, @other_routine)

    assert_not policy.show?
    assert_not policy.update?
    assert_not policy.destroy?
  end

  def test_that_any_user_can_list_and_create_routines
    assert RoutinePolicy.new(@user, Routine).index?
    assert RoutinePolicy.new(@user, Routine).create?
  end

  def test_that_scope_returns_only_the_users_routines
    assert_equal [ @routine ], RoutinePolicy::Scope.new(@user, Routine).resolve.to_a
  end
end
