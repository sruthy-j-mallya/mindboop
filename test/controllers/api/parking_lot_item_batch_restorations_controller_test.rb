require "test_helper"

class Api::ParkingLotItemBatchRestorationsControllerTest < ActionDispatch::IntegrationTest
  def setup
    @user = create(:user)
    @items = create_list(:parking_lot_item, 2, user: @user, discarded_at: Time.current)
    @ids = @items.map(&:id)
    @other_item = create(:parking_lot_item, discarded_at: Time.current)
  end

  def test_that_create_restores_every_item
    sign_in @user

    post api_parking_lot_item_batch_restoration_path, params: { ids: @ids }, as: :json

    assert_response :created
    assert @items.all? { |item| item.reload.kept? }
    assert_equal @ids.sort, response.parsed_body["parking_lot_items"].pluck("id").sort
  end

  def test_that_create_needs_ids
    sign_in @user

    post api_parking_lot_item_batch_restoration_path, params: { ids: [] }, as: :json

    assert_response :bad_request
  end

  def test_that_create_returns_404_when_an_item_is_not_discarded
    kept_item = create(:parking_lot_item, user: @user)
    sign_in @user

    post api_parking_lot_item_batch_restoration_path, params: { ids: [ *@ids, kept_item.id ] }, as: :json

    assert_response :not_found
    assert @items.all? { |item| item.reload.discarded? }
  end

  def test_that_create_returns_401_when_signed_out
    post api_parking_lot_item_batch_restoration_path, params: { ids: @ids }, as: :json

    assert_response :unauthorized
    assert @items.all? { |item| item.reload.discarded? }
  end

  def test_that_create_returns_403_when_an_item_is_another_users
    sign_in @user

    post api_parking_lot_item_batch_restoration_path, params: { ids: [ *@ids, @other_item.id ] }, as: :json

    assert_response :forbidden
    assert @items.all? { |item| item.reload.discarded? }
  end
end
