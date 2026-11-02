require "test_helper"

class Api::RegistrationsControllerTest < ActionDispatch::IntegrationTest
  def setup
    @email_address = Faker::Internet.email
    @token = User.signup_token_for(@email_address)
    @password = Faker::Internet.password(min_length: 8)
  end

  def test_that_signup_creates_a_user_for_the_confirmed_email_and_signs_them_in
    assert_difference "User.count", 1 do
      post api_registration_path, params: { token: @token, password: @password, password_confirmation: @password }, as: :json
    end

    assert_response :created
    assert_equal @email_address.downcase, response.parsed_body.dig("user", "email_address")
    assert cookies[:session_id].present?
  end

  def test_that_signup_ignores_an_email_address_outside_the_token
    post api_registration_path, params: { token: @token, email_address: Faker::Internet.unique.email, password: @password, password_confirmation: @password }, as: :json

    assert_response :created
    assert_equal @email_address.downcase, User.last.email_address
  end

  def test_that_signup_returns_validation_errors_as_a_sentence
    assert_no_difference "User.count" do
      post api_registration_path, params: { token: @token, password: @password, password_confirmation: "#{@password}x" }, as: :json
    end

    assert_response :unprocessable_content
    assert_equal "Password confirmation doesn't match Password", response.parsed_body["error"]
  end

  def test_that_signup_without_a_valid_token_is_rejected
    assert_no_difference "User.count" do
      post api_registration_path, params: { token: "#{@token}x", password: @password, password_confirmation: @password }, as: :json
    end

    assert_response :not_found
    assert_equal "Sign-up link is invalid or has expired.", response.parsed_body["error"]
  end

  def test_that_an_expired_token_is_rejected
    travel User::SIGNUP_TOKEN_EXPIRES_IN + 1.minute do
      post api_registration_path, params: { token: @token, password: @password, password_confirmation: @password }, as: :json
    end

    assert_response :not_found
  end

  def test_that_a_token_cannot_create_a_second_account
    create(:user, email_address: @email_address)

    assert_no_difference "User.count" do
      post api_registration_path, params: { token: @token, password: @password, password_confirmation: @password }, as: :json
    end

    assert_response :unprocessable_content
    assert_equal "Email address has already been taken", response.parsed_body["error"]
  end
end
