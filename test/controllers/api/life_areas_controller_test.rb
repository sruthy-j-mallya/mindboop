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

  def test_that_index_returns_only_the_users_areas_oldest_first
    newer = create(:life_area, user: @user)
    sign_in @user

    get api_life_areas_path

    assert_response :ok
    assert_equal [ @life_area.id, newer.id ], response.parsed_body["life_areas"].pluck("id")
    assert_equal %w[ id name color icon default_sound created_at updated_at ].sort,
      response.parsed_body["life_areas"].first.keys.sort
  end

  def test_that_user_can_create_an_area
    sign_in @user

    assert_difference "@user.life_areas.count", 1 do
      post api_life_areas_path, params: { name: @name, color: "teal", icon: "house", default_sound: "rain" }, as: :json
    end

    assert_response :created
    body = response.parsed_body["life_area"]
    assert_equal [ @name, "teal", "house", "rain" ], body.values_at("name", "color", "icon", "default_sound")
  end

  def test_that_create_rejects_a_duplicate_name
    sign_in @user

    assert_no_difference "LifeArea.count" do
      post api_life_areas_path, params: { name: @life_area.name.downcase, color: "teal", icon: "house" }, as: :json
    end

    assert_response :unprocessable_content
    assert_equal "Name has already been taken", response.parsed_body["error"]
  end

  def test_that_create_cannot_assign_the_area_to_another_user
    sign_in @user

    post api_life_areas_path, params: { name: @name, color: "teal", icon: "house", user_id: @other_life_area.user_id },
      as: :json

    assert_response :created
    assert_equal @user, LifeArea.find(response.parsed_body["life_area"]["id"]).user
  end

  def test_that_create_returns_401_when_signed_out
    post api_life_areas_path, params: { name: @name, color: "teal", icon: "house" }, as: :json

    assert_response :unauthorized
  end

  def test_that_user_can_update_their_area
    sign_in @user

    patch api_life_area_path(@life_area), params: { name: @name, color: "rose", default_sound: "night" }, as: :json

    assert_response :ok
    assert_equal [ @name, "rose", "night" ], @life_area.reload.values_at(:name, :color, :default_sound)
  end

  def test_that_update_rejects_an_unknown_color
    sign_in @user

    patch api_life_area_path(@life_area), params: { color: "plaid" }, as: :json

    assert_response :unprocessable_content
    assert_equal "Color is not included in the list", response.parsed_body["error"]
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

  def test_that_destroy_removes_the_area_and_sends_its_tasks_to_the_inbox
    task = create(:task, user: @user, life_area: @life_area)
    sign_in @user

    assert_difference "LifeArea.count", -1 do
      delete api_life_area_path(@life_area)
    end

    assert_response :no_content
    assert_nil task.reload.life_area_id
  end

  def test_that_destroy_returns_401_when_signed_out
    delete api_life_area_path(@life_area)

    assert_response :unauthorized
  end

  def test_that_destroy_returns_403_for_another_users_area
    sign_in @user

    assert_no_difference "LifeArea.count" do
      delete api_life_area_path(@other_life_area)
    end

    assert_response :forbidden
  end

  def test_that_destroy_returns_404_for_an_unknown_area
    sign_in @user

    delete api_life_area_path(SecureRandom.uuid)

    assert_response :not_found
  end
end
