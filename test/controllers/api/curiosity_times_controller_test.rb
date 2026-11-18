require "test_helper"

class Api::CuriosityTimesControllerTest < ActionDispatch::IntegrationTest
  def setup
    @user = create(:user)
    @item = create(:parking_lot_item, user: @user)
    @other_item = create(:parking_lot_item)
  end

  def test_that_show_returns_the_running_curiosity_time
    @item.start_curiosity_time!
    @other_item.start_curiosity_time!
    sign_in @user

    get api_curiosity_time_path

    assert_response :ok
    assert_equal @item.id, response.parsed_body.dig("parking_lot_item", "id")
  end

  def test_that_show_returns_null_when_none_is_running
    sign_in @user

    get api_curiosity_time_path

    assert_response :ok
    assert_nil response.parsed_body["parking_lot_item"]
  end

  def test_that_create_starts_a_curiosity_time
    sign_in @user

    freeze_time do
      post api_curiosity_time_path, params: { parking_lot_item_id: @item.id }, as: :json

      assert_response :created
      assert_equal ParkingLotItem::CURIOSITY_MINUTES.minutes.from_now, @item.reload.curiosity_ends_at
    end
  end

  def test_that_create_rejects_a_second_curiosity_time
    @item.start_curiosity_time!
    other_item = create(:parking_lot_item, user: @user)
    sign_in @user

    post api_curiosity_time_path, params: { parking_lot_item_id: other_item.id }, as: :json

    assert_response :unprocessable_content
    assert_equal "Finish your current curiosity time first", response.parsed_body["error"]
    assert_nil other_item.reload.curiosity_ends_at
  end

  def test_that_create_returns_404_for_an_item_that_is_not_parked
    @item.update!(status: :addressed)
    sign_in @user

    post api_curiosity_time_path, params: { parking_lot_item_id: @item.id }, as: :json

    assert_response :not_found
  end

  def test_that_update_extends_the_curiosity_time_once
    @item.start_curiosity_time!
    sign_in @user

    patch api_curiosity_time_path

    assert_response :ok
    assert @item.reload.is_curiosity_extended?

    patch api_curiosity_time_path

    assert_response :unprocessable_content
    assert_equal "You've already added more time", response.parsed_body["error"]
  end

  def test_that_destroy_ends_the_curiosity_time
    @item.start_curiosity_time!
    sign_in @user

    delete api_curiosity_time_path

    assert_response :ok
    assert_nil @item.reload.curiosity_ends_at
    assert @item.parked?
  end

  def test_that_update_returns_404_when_none_is_running
    sign_in @user

    patch api_curiosity_time_path

    assert_response :not_found
  end

  def test_that_curiosity_time_returns_401_when_signed_out
    post api_curiosity_time_path, params: { parking_lot_item_id: @item.id }, as: :json

    assert_response :unauthorized
    assert_nil @item.reload.curiosity_ends_at
  end

  def test_that_create_returns_403_for_another_users_item
    sign_in @user

    post api_curiosity_time_path, params: { parking_lot_item_id: @other_item.id }, as: :json

    assert_response :forbidden
    assert_nil @other_item.reload.curiosity_ends_at
  end
end
