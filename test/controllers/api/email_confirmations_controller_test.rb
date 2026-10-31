require "test_helper"

class Api::EmailConfirmationsControllerTest < ActionDispatch::IntegrationTest
  def setup
    @email_address = Faker::Internet.email
  end

  def test_that_a_sign_up_link_is_enqueued_without_creating_a_user
    assert_no_difference "User.count" do
      assert_enqueued_email_with RegistrationsMailer, :confirm_email, args: [ @email_address.downcase ] do
        post api_email_confirmations_path, params: { email_address: " #{@email_address.upcase} " }, as: :json
      end
    end

    assert_response :accepted
  end

  def test_that_a_registered_email_gets_the_same_response_and_a_notice
    user = create(:user)

    assert_enqueued_email_with RegistrationsMailer, :already_registered, args: [ user ] do
      post api_email_confirmations_path, params: { email_address: user.email_address }, as: :json
    end

    assert_response :accepted
  end

  def test_that_an_invalid_email_address_is_rejected
    assert_no_enqueued_emails do
      post api_email_confirmations_path, params: { email_address: "not-an-email" }, as: :json
    end

    assert_response :unprocessable_content
    assert_equal "Email address is invalid", response.parsed_body["error"]
  end
end
