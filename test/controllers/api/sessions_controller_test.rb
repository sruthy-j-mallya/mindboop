require "test_helper"

class Api::SessionsControllerTest < ActionDispatch::IntegrationTest
  def setup
    @user = create(:user)
  end

  def test_that_show_returns_401_when_signed_out
    get api_session_path

    assert_response :unauthorized
  end

  def test_that_show_returns_the_current_user_when_signed_in
    sign_in @user
    get api_session_path

    assert_response :ok
    assert_equal({ "id" => @user.id, "email_address" => @user.email_address }, response.parsed_body["user"])
  end

  def test_that_user_can_sign_in_with_valid_credentials
    sign_in @user

    assert_response :created
    assert_equal @user.email_address, response.parsed_body.dig("user", "email_address")
    assert cookies[:session_id].present?
  end

  def test_that_invalid_credentials_are_rejected
    sign_in @user, password: "#{@user.password}x"

    assert_response :unauthorized
    assert response.parsed_body["error"].present?
  end

  def test_that_user_can_sign_out
    sign_in @user

    assert_difference "Session.count", -1 do
      delete api_session_path
    end
    assert_response :no_content
  end
end
