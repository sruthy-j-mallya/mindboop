require "test_helper"

class UserPreferencePolicyTest < ActiveSupport::TestCase
  def setup
    @user = create(:user)
  end

  def test_that_users_can_see_and_change_their_own_preference
    policy = UserPreferencePolicy.new(@user, build(:user_preference, user: @user))

    assert policy.show?
    assert policy.update?
  end

  def test_that_users_cannot_see_or_change_another_users_preference
    policy = UserPreferencePolicy.new(@user, create(:user_preference))

    assert_not policy.show?
    assert_not policy.update?
  end
end
