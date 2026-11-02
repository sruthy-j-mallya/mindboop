require "test_helper"

class RegistrationsMailerTest < ActionMailer::TestCase
  def setup
    @email_address = Faker::Internet.email.downcase
  end

  def test_that_confirm_email_links_to_a_sign_up_page_for_the_address
    mail = RegistrationsMailer.confirm_email(@email_address)
    token = mail.text_part.body.to_s[%r{/signup/(\S+)}, 1]

    assert_equal [ @email_address ], mail.to
    assert_equal @email_address, User.email_address_from_signup_token(token)
  end

  def test_that_already_registered_is_sent_to_the_existing_user
    user = create(:user)

    assert_equal [ user.email_address ], RegistrationsMailer.already_registered(user).to
  end
end
