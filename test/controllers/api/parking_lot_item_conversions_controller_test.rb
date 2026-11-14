require "test_helper"

class Api::ParkingLotItemConversionsControllerTest < ActionDispatch::IntegrationTest
  def setup
    @user = create(:user)
    @item = create(:parking_lot_item, user: @user)
    @other_item = create(:parking_lot_item)
  end

  def test_that_create_adds_the_item_to_the_inbox_as_a_task
    sign_in @user

    assert_difference "@user.tasks.count", 1 do
      post api_parking_lot_item_conversion_path(@item)
    end

    assert_response :created
    item = response.parsed_body["parking_lot_item"]
    assert_equal "converted", item["status"]
    assert_equal @item.content, Task.find(item["task_id"]).title
  end

  def test_that_create_returns_404_for_an_item_that_is_not_parked
    @item.update!(status: :addressed)
    sign_in @user

    assert_no_difference "Task.count" do
      post api_parking_lot_item_conversion_path(@item)
    end

    assert_response :not_found
  end

  def test_that_create_returns_401_when_signed_out
    assert_no_difference "Task.count" do
      post api_parking_lot_item_conversion_path(@item)
    end

    assert_response :unauthorized
  end

  def test_that_create_returns_403_for_another_users_item
    sign_in @user

    assert_no_difference "Task.count" do
      post api_parking_lot_item_conversion_path(@other_item)
    end

    assert_response :forbidden
    assert @other_item.reload.parked?
  end
end
