require "test_helper"

class Api::PasswordsControllerTest < ActionDispatch::IntegrationTest
  def setup
    @user = create(:user)
    @new_password = Faker::Internet.password(min_length: 8)
  end

  def test_that_reset_email_is_enqueued_for_a_known_user
    assert_enqueued_email_with PasswordsMailer, :reset, args: [ @user ] do
      post api_passwords_path, params: { email_address: @user.email_address }, as: :json
    end

    assert_response :accepted
  end

  def test_that_unknown_email_gets_the_same_response
    assert_no_enqueued_emails do
      post api_passwords_path, params: { email_address: Faker::Internet.unique.email }, as: :json
    end

    assert_response :accepted
  end

  def test_that_password_is_reset_with_a_valid_token
    patch api_password_path(@user.password_reset_token), params: { password: @new_password, password_confirmation: @new_password }, as: :json

    assert_response :no_content
    assert @user.reload.authenticate(@new_password)
  end

  def test_that_invalid_token_is_rejected
    patch api_password_path(Faker::Alphanumeric.alphanumeric(number: 20)), params: { password: @new_password, password_confirmation: @new_password }, as: :json

    assert_response :not_found
  end
end
