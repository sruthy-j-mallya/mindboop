require "test_helper"

class Api::RegistrationsControllerTest < ActionDispatch::IntegrationTest
  def setup
    @email_address = Faker::Internet.email
    @password = Faker::Internet.password(min_length: 8)
  end

  def test_that_signup_creates_a_user_and_signs_them_in
    assert_difference "User.count", 1 do
      post api_registration_path, params: { email_address: @email_address, password: @password, password_confirmation: @password }, as: :json
    end

    assert_response :created
    assert_equal @email_address.downcase, response.parsed_body.dig("user", "email_address")
    assert cookies[:session_id].present?
  end

  def test_that_signup_returns_validation_errors_as_a_sentence
    assert_no_difference "User.count" do
      post api_registration_path, params: { email_address: @email_address, password: @password, password_confirmation: "#{@password}x" }, as: :json
    end

    assert_response :unprocessable_content
    assert_equal "Password confirmation doesn't match Password", response.parsed_body["error"]
  end
end
