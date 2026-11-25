require "test_helper"

class Api::ParkingLotItemBatchesControllerTest < ActionDispatch::IntegrationTest
  def setup
    @user = create(:user)
    @items = create_list(:parking_lot_item, 2, user: @user)
    @ids = @items.map(&:id)
    @other_item = create(:parking_lot_item)
  end

  def test_that_update_changes_the_status_of_every_item
    sign_in @user

    patch api_parking_lot_item_batch_path, params: { ids: @ids, status: "addressed" }, as: :json

    assert_response :ok
    assert @items.all? { |item| item.reload.addressed? }
    assert_equal @ids.sort, response.parsed_body["parking_lot_items"].pluck("id").sort
  end

  def test_that_update_ends_a_curiosity_time_on_an_item
    @items.first.start_curiosity_time!
    sign_in @user

    patch api_parking_lot_item_batch_path, params: { ids: @ids, status: "addressed" }, as: :json

    assert_nil @items.first.reload.curiosity_ends_at
  end

  def test_that_update_changes_nothing_when_one_item_is_invalid
    converted_item = create(:parking_lot_item, user: @user)
    converted_item.convert_to_task!
    sign_in @user

    patch api_parking_lot_item_batch_path, params: { ids: [ *@ids, converted_item.id ], status: "parked" }, as: :json

    assert_response :unprocessable_content
    assert_equal "Task must be blank", response.parsed_body["error"]
    assert @items.all? { |item| item.reload.parked? }
  end

  def test_that_update_rejects_an_unknown_status
    sign_in @user

    patch api_parking_lot_item_batch_path, params: { ids: @ids, status: "forgotten" }, as: :json

    assert_response :unprocessable_content
    assert @items.all? { |item| item.reload.parked? }
  end

  def test_that_update_needs_ids
    sign_in @user

    patch api_parking_lot_item_batch_path, params: { ids: [], status: "addressed" }, as: :json

    assert_response :bad_request
    assert_match "ids", response.parsed_body["error"]
  end

  def test_that_update_returns_404_when_an_item_is_discarded
    @items.last.discard!
    sign_in @user

    patch api_parking_lot_item_batch_path, params: { ids: @ids, status: "addressed" }, as: :json

    assert_response :not_found
    assert @items.first.reload.parked?
  end

  def test_that_update_returns_401_when_signed_out
    patch api_parking_lot_item_batch_path, params: { ids: @ids, status: "addressed" }, as: :json

    assert_response :unauthorized
    assert @items.all? { |item| item.reload.parked? }
  end

  def test_that_update_returns_403_when_an_item_is_another_users
    sign_in @user

    patch api_parking_lot_item_batch_path, params: { ids: [ *@ids, @other_item.id ], status: "addressed" }, as: :json

    assert_response :forbidden
    assert @items.all? { |item| item.reload.parked? }
    assert @other_item.reload.parked?
  end

  def test_that_destroy_discards_every_item
    sign_in @user

    assert_difference "ParkingLotItem.kept.count", -2 do
      delete api_parking_lot_item_batch_path, params: { ids: @ids }, as: :json
    end

    assert_response :no_content
  end

  def test_that_destroy_needs_ids
    sign_in @user

    delete api_parking_lot_item_batch_path, as: :json

    assert_response :bad_request
  end

  def test_that_destroy_returns_401_when_signed_out
    assert_no_difference "ParkingLotItem.kept.count" do
      delete api_parking_lot_item_batch_path, params: { ids: @ids }, as: :json
    end

    assert_response :unauthorized
  end

  def test_that_destroy_returns_403_when_an_item_is_another_users
    sign_in @user

    assert_no_difference "ParkingLotItem.kept.count" do
      delete api_parking_lot_item_batch_path, params: { ids: [ *@ids, @other_item.id ] }, as: :json
    end

    assert_response :forbidden
  end
end
