require "test_helper"

class Api::UserPreferencesControllerTest < ActionDispatch::IntegrationTest
  def setup
    @user = create(:user)
  end

  def test_that_show_returns_401_when_signed_out
    get api_user_preference_path

    assert_response :unauthorized
  end

  def test_that_update_returns_401_when_signed_out
    patch api_user_preference_path, params: { theme: "dark" }, as: :json

    assert_response :unauthorized
  end

  def test_that_show_returns_the_defaults_without_saving_a_preference
    sign_in @user

    assert_no_difference "UserPreference.count" do
      get api_user_preference_path
    end

    assert_response :ok
    assert_equal(
      { "theme" => "system", "completion_sound" => "rising", "break_alarm_sound" => "classic" },
      response.parsed_body["user_preference"]
    )
  end

  def test_that_show_returns_the_saved_preference
    create(:user_preference, user: @user, theme: "dark", completion_sound: "bell")
    sign_in @user

    get api_user_preference_path

    assert_response :ok
    assert_equal "dark", response.parsed_body["user_preference"]["theme"]
    assert_equal "bell", response.parsed_body["user_preference"]["completion_sound"]
  end

  def test_that_the_first_update_saves_a_preference
    sign_in @user

    assert_difference "UserPreference.count", 1 do
      patch api_user_preference_path, params: { completion_sound: "wood" }, as: :json
    end

    assert_response :ok
    assert_equal "wood", response.parsed_body["user_preference"]["completion_sound"]
    assert_equal "wood", @user.reload.preference.completion_sound
  end

  def test_that_update_changes_only_the_given_fields
    create(:user_preference, user: @user, theme: "dark")
    sign_in @user

    assert_no_difference "UserPreference.count" do
      patch api_user_preference_path, params: { break_alarm_sound: "chimes" }, as: :json
    end

    assert_response :ok
    preference = @user.reload.preference
    assert_equal "chimes", preference.break_alarm_sound
    assert_equal "dark", preference.theme
  end

  def test_that_update_rejects_an_unknown_sound
    sign_in @user

    patch api_user_preference_path, params: { completion_sound: "kazoo" }, as: :json

    assert_response :unprocessable_content
    assert_equal "Completion sound is not included in the list", response.parsed_body["error"]
    assert_nil @user.reload.preference
  end

  def test_that_update_only_changes_the_signed_in_users_preference
    other_preference = create(:user_preference, theme: "light")
    sign_in @user

    patch api_user_preference_path, params: { theme: "dark" }, as: :json

    assert_response :ok
    assert_equal "light", other_preference.reload.theme
    assert_equal "dark", @user.reload.preference.theme
  end
end
