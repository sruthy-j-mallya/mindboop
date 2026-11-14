require "test_helper"

class Api::ParkingLotItemsControllerTest < ActionDispatch::IntegrationTest
  def setup
    @user = create(:user)
    @item = create(:parking_lot_item, user: @user, created_at: 1.hour.ago)
    @other_item = create(:parking_lot_item)
    @content = Faker::Lorem.sentence
  end

  def test_that_index_returns_only_the_users_kept_items_newest_first
    newer_item = create(:parking_lot_item, user: @user)
    create(:parking_lot_item, user: @user, discarded_at: Time.current)
    sign_in @user

    get api_parking_lot_items_path

    assert_response :ok
    assert_equal [ newer_item.id, @item.id ], response.parsed_body["parking_lot_items"].pluck("id")
    assert_equal 2, response.parsed_body["parking_lot_items_count"]
    assert_equal 1, response.parsed_body["total_pages"]
  end

  def test_that_index_can_filter_by_status
    addressed_item = create(:parking_lot_item, user: @user, status: :addressed)
    sign_in @user

    get api_parking_lot_items_path, params: { status: "addressed" }

    assert_equal [ addressed_item.id ], response.parsed_body["parking_lot_items"].pluck("id")

    get api_parking_lot_items_path, params: { status: "parked" }

    assert_equal [ @item.id ], response.parsed_body["parking_lot_items"].pluck("id")
  end

  def test_that_index_can_list_items_parked_since_a_time
    recent_item = create(:parking_lot_item, user: @user)
    sign_in @user

    get api_parking_lot_items_path, params: { since: 10.minutes.ago.iso8601 }

    assert_equal [ recent_item.id ], response.parsed_body["parking_lot_items"].pluck("id")
  end

  def test_that_index_ignores_an_invalid_since
    sign_in @user

    get api_parking_lot_items_path, params: { since: "2026-13-45" }

    assert_response :ok
    assert_equal [ @item.id ], response.parsed_body["parking_lot_items"].pluck("id")
  end

  def test_that_index_returns_401_when_signed_out
    get api_parking_lot_items_path

    assert_response :unauthorized
  end

  def test_that_user_can_park_a_thought
    sign_in @user

    assert_difference "@user.parking_lot_items.count", 1 do
      post api_parking_lot_items_path, params: { content: @content, kind: "question" }, as: :json
    end

    assert_response :created
    item = response.parsed_body["parking_lot_item"]
    assert_equal @content, item["content"]
    assert_equal "question", item["kind"]
    assert_equal "parked", item["status"]
    assert_nil item["task_id"]
    assert_not item.key?("discarded_at")
  end

  def test_that_create_cannot_set_the_status_or_owner
    other_user = create(:user)
    sign_in @user

    post api_parking_lot_items_path, params: { content: @content, status: "addressed", user_id: other_user.id }, as: :json

    assert_response :created
    item = ParkingLotItem.find(response.parsed_body.dig("parking_lot_item", "id"))
    assert item.parked?
    assert_equal @user.id, item.user_id
  end

  def test_that_create_rejects_an_empty_thought
    sign_in @user

    assert_no_difference "ParkingLotItem.count" do
      post api_parking_lot_items_path, params: { content: " " }, as: :json
    end

    assert_response :unprocessable_content
    assert_equal "Content can't be blank", response.parsed_body["error"]
  end

  def test_that_create_rejects_an_unknown_kind
    sign_in @user

    post api_parking_lot_items_path, params: { content: @content, kind: "worry" }, as: :json

    assert_response :unprocessable_content
    assert_equal "Kind is not included in the list", response.parsed_body["error"]
  end

  def test_that_create_returns_401_when_signed_out
    assert_no_difference "ParkingLotItem.count" do
      post api_parking_lot_items_path, params: { content: @content }, as: :json
    end

    assert_response :unauthorized
  end

  def test_that_user_can_mark_an_item_addressed_and_park_it_again
    sign_in @user

    patch api_parking_lot_item_path(@item), params: { status: "addressed" }, as: :json

    assert_response :ok
    assert_equal "addressed", response.parsed_body.dig("parking_lot_item", "status")
    assert @item.reload.addressed?

    patch api_parking_lot_item_path(@item), params: { status: "parked" }, as: :json

    assert @item.reload.parked?
  end

  def test_that_update_cannot_convert_an_item_without_a_task
    sign_in @user

    patch api_parking_lot_item_path(@item), params: { status: "converted" }, as: :json

    assert_response :unprocessable_content
    assert_equal "Task can't be blank", response.parsed_body["error"]
    assert @item.reload.parked?
  end

  def test_that_update_returns_401_when_signed_out
    patch api_parking_lot_item_path(@item), params: { status: "addressed" }, as: :json

    assert_response :unauthorized
    assert @item.reload.parked?
  end

  def test_that_update_returns_403_for_another_users_item
    sign_in @user

    patch api_parking_lot_item_path(@other_item), params: { status: "addressed" }, as: :json

    assert_response :forbidden
    assert @other_item.reload.parked?
  end

  def test_that_destroy_discards_the_item
    sign_in @user

    assert_no_difference "ParkingLotItem.count" do
      delete api_parking_lot_item_path(@item)
    end

    assert_response :no_content
    assert @item.reload.discarded?
  end

  def test_that_destroy_returns_404_for_a_discarded_item
    @item.discard!
    sign_in @user

    delete api_parking_lot_item_path(@item)

    assert_response :not_found
  end

  def test_that_destroy_returns_401_when_signed_out
    delete api_parking_lot_item_path(@item)

    assert_response :unauthorized
    assert @item.reload.kept?
  end

  def test_that_destroy_returns_403_for_another_users_item
    sign_in @user

    delete api_parking_lot_item_path(@other_item)

    assert_response :forbidden
    assert @other_item.reload.kept?
  end
end
