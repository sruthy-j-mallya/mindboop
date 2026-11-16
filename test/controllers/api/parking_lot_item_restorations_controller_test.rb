require "test_helper"

class Api::ParkingLotItemRestorationsControllerTest < ActionDispatch::IntegrationTest
  def setup
    @user = create(:user)
    @item = create(:parking_lot_item, user: @user, discarded_at: Time.current)
    @other_item = create(:parking_lot_item, discarded_at: Time.current)
  end

  def test_that_create_restores_a_discarded_item
    sign_in @user

    post api_parking_lot_item_restoration_path(@item)

    assert_response :created
    assert @item.reload.kept?
    assert_equal @item.id, response.parsed_body.dig("parking_lot_item", "id")
  end

  def test_that_create_returns_404_for_an_item_that_is_not_discarded
    item = create(:parking_lot_item, user: @user)
    sign_in @user

    post api_parking_lot_item_restoration_path(item)

    assert_response :not_found
  end

  def test_that_create_returns_401_when_signed_out
    post api_parking_lot_item_restoration_path(@item)

    assert_response :unauthorized
    assert @item.reload.discarded?
  end

  def test_that_create_returns_403_for_another_users_item
    sign_in @user

    post api_parking_lot_item_restoration_path(@other_item)

    assert_response :forbidden
    assert @other_item.reload.discarded?
  end
end
