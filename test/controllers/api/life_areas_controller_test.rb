require "test_helper"

class Api::LifeAreasControllerTest < ActionDispatch::IntegrationTest
  def setup
    @user = create(:user)
    @life_area = create(:life_area, user: @user)
    @other_life_area = create(:life_area)
    @name = Faker::Lorem.unique.word.capitalize
  end

  def test_that_index_returns_401_when_signed_out
    get api_life_areas_path

    assert_response :unauthorized
  end

  def test_that_index_returns_only_the_users_areas_in_order
    newer = create(:life_area, user: @user)
    newer.move_to!(0)
    sign_in @user

    get api_life_areas_path

    assert_response :ok
    assert_equal [ newer.id, @life_area.id ], response.parsed_body["life_areas"].pluck("id")
    assert_equal %w[ id name color emoji default_sound is_deleted created_at updated_at ].sort,
      response.parsed_body["life_areas"].first.keys.sort
  end

  def test_that_index_marks_deleted_areas
    deleted = create(:life_area, user: @user, discarded_at: Time.current)
    sign_in @user

    get api_life_areas_path

    assert_equal({ @life_area.id => false, deleted.id => true },
      response.parsed_body["life_areas"].to_h { |area| area.values_at("id", "is_deleted") })
  end

  def test_that_user_can_create_an_area
    sign_in @user

    assert_difference "@user.life_areas.count", 1 do
      post api_life_areas_path, params: { name: @name, color: "teal", emoji: "🏠", default_sound: "rain" }, as: :json
    end

    assert_response :created
    body = response.parsed_body["life_area"]
    assert_equal [ @name, "teal", "🏠", "rain" ], body.values_at("name", "color", "emoji", "default_sound")
  end

  def test_that_create_rejects_a_duplicate_name
    sign_in @user

    assert_no_difference "LifeArea.count" do
      post api_life_areas_path, params: { name: @life_area.name.downcase, color: "teal", emoji: "🏠" }, as: :json
    end

    assert_response :unprocessable_content
    assert_equal "Name has already been taken", response.parsed_body["error"]
  end

  def test_that_create_cannot_assign_the_area_to_another_user
    sign_in @user

    post api_life_areas_path, params: { name: @name, color: "teal", emoji: "🏠", user_id: @other_life_area.user_id },
      as: :json

    assert_response :created
    assert_equal @user, LifeArea.find(response.parsed_body["life_area"]["id"]).user
  end

  def test_that_create_returns_401_when_signed_out
    post api_life_areas_path, params: { name: @name, color: "teal", emoji: "🏠" }, as: :json

    assert_response :unauthorized
  end

  def test_that_user_can_update_their_area
    sign_in @user

    patch api_life_area_path(@life_area), params: { name: @name, color: "rose", default_sound: "night" }, as: :json

    assert_response :ok
    assert_equal [ @name, "rose", "night" ], @life_area.reload.values_at(:name, :color, :default_sound)
  end

  def test_that_update_moves_the_area_and_saves_its_fields
    newer = create(:life_area, user: @user)
    sign_in @user

    assert_no_changes -> { @other_life_area.reload.position } do
      patch api_life_area_path(newer), params: { name: @name, position: 0 }, as: :json
    end

    assert_response :ok
    assert_equal @name, newer.reload.name
    assert_equal [ newer, @life_area ], @user.life_areas.in_position_order.to_a
  end

  def test_that_update_saves_nothing_with_an_invalid_position
    sign_in @user

    patch api_life_area_path(@life_area), params: { name: @name, position: -1 }, as: :json

    assert_response :unprocessable_content
    assert_equal "Position must be a whole number of 0 or more", response.parsed_body["error"]
    assert_not_equal @name, @life_area.reload.name
  end

  def test_that_update_returns_403_when_moving_another_users_area
    sign_in @user

    patch api_life_area_path(@other_life_area), params: { position: 0 }, as: :json

    assert_response :forbidden
  end

  def test_that_update_rejects_an_unknown_color
    sign_in @user

    patch api_life_area_path(@life_area), params: { color: "plaid" }, as: :json

    assert_response :unprocessable_content
    assert_equal "Color is not included in the list", response.parsed_body["error"]
  end

  def test_that_update_rejects_an_emoji_outside_the_list
    sign_in @user

    patch api_life_area_path(@life_area), params: { emoji: "💀" }, as: :json

    assert_response :unprocessable_content
    assert_equal "Emoji is not included in the list", response.parsed_body["error"]
  end

  def test_that_update_returns_401_when_signed_out
    patch api_life_area_path(@life_area), params: { name: @name }, as: :json

    assert_response :unauthorized
  end

  def test_that_update_returns_403_for_another_users_area
    sign_in @user

    patch api_life_area_path(@other_life_area), params: { name: @name }, as: :json

    assert_response :forbidden
    assert_not_equal @name, @other_life_area.reload.name
  end

  def test_that_destroy_soft_deletes_the_area_and_sends_its_tasks_to_the_inbox
    task = create(:task, user: @user, life_area: @life_area)
    sign_in @user

    assert_difference "LifeArea.kept.count", -1 do
      delete api_life_area_path(@life_area)
    end

    assert_response :no_content
    assert_nil task.reload.life_area_id
  end

  def test_that_destroy_moves_the_tasks_to_the_given_area
    target = create(:life_area, user: @user)
    task = create(:task, user: @user, life_area: @life_area)
    sign_in @user

    assert_difference "LifeArea.kept.count", -1 do
      delete api_life_area_path(@life_area, tasks_life_area_id: target.id)
    end

    assert_response :no_content
    assert_equal target, task.reload.life_area
  end

  def test_that_destroy_keeps_the_area_when_its_tasks_cannot_move_to_the_one_given
    task = create(:task, user: @user, life_area: @life_area)
    deleted = create(:life_area, user: @user, discarded_at: Time.current)
    sign_in @user

    [ @other_life_area.id, @life_area.id, deleted.id, SecureRandom.uuid ].each do |id|
      assert_no_difference "LifeArea.kept.count" do
        delete api_life_area_path(@life_area, tasks_life_area_id: id)
      end

      assert_response :not_found
    end

    assert_equal @life_area, task.reload.life_area
  end

  def test_that_destroy_returns_401_when_signed_out
    delete api_life_area_path(@life_area)

    assert_response :unauthorized
  end

  def test_that_destroy_returns_403_for_another_users_area
    sign_in @user

    assert_no_difference "LifeArea.kept.count" do
      delete api_life_area_path(@other_life_area)
    end

    assert_response :forbidden
  end

  def test_that_update_and_destroy_return_404_for_a_deleted_area
    @life_area.discard!
    sign_in @user

    patch api_life_area_path(@life_area), params: { name: @name }, as: :json

    assert_response :not_found

    delete api_life_area_path(@life_area)

    assert_response :not_found
  end

  def test_that_destroy_returns_404_for_an_unknown_area
    sign_in @user

    delete api_life_area_path(SecureRandom.uuid)

    assert_response :not_found
  end
end
