require "test_helper"

class ParkingLotItemPolicyTest < ActiveSupport::TestCase
  def setup
    @user = create(:user)
    @item = create(:parking_lot_item, user: @user)
    @other_item = create(:parking_lot_item)
  end

  def test_that_the_owner_can_update_and_destroy_their_item
    policy = ParkingLotItemPolicy.new(@user, @item)

    assert policy.update?
    assert policy.destroy?
  end

  def test_that_other_users_cannot_update_or_destroy_the_item
    policy = ParkingLotItemPolicy.new(@user, @other_item)

    assert_not policy.update?
    assert_not policy.destroy?
  end

  def test_that_any_user_can_list_and_create_items
    policy = ParkingLotItemPolicy.new(@user, ParkingLotItem)

    assert policy.index?
    assert policy.create?
  end

  def test_that_scope_returns_only_the_users_items
    assert_equal [ @item ], ParkingLotItemPolicy::Scope.new(@user, ParkingLotItem).resolve.to_a
  end
end
