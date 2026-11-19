require "test_helper"

class LifeAreaPolicyTest < ActiveSupport::TestCase
  def setup
    @user = create(:user)
    @life_area = create(:life_area, user: @user)
    @other_life_area = create(:life_area)
  end

  def test_that_the_owner_can_update_and_destroy_their_area
    policy = LifeAreaPolicy.new(@user, @life_area)

    assert policy.update?
    assert policy.destroy?
  end

  def test_that_other_users_cannot_update_or_destroy_the_area
    policy = LifeAreaPolicy.new(@user, @other_life_area)

    assert_not policy.update?
    assert_not policy.destroy?
  end

  def test_that_any_user_can_list_and_create_areas
    assert LifeAreaPolicy.new(@user, LifeArea).index?
    assert LifeAreaPolicy.new(@user, LifeArea).create?
  end

  def test_that_scope_returns_only_the_users_areas
    assert_equal [ @life_area ], LifeAreaPolicy::Scope.new(@user, LifeArea).resolve.to_a
  end
end
