require "test_helper"

class UserTest < ActiveSupport::TestCase
  def setup
    @email_address = Faker::Internet.email
  end

  def test_that_email_address_is_normalized
    assert_equal @email_address.downcase, User.new(email_address: " #{@email_address.upcase} ").email_address
  end

  def test_that_email_address_must_be_unique
    create(:user, email_address: @email_address)

    assert_not build(:user, email_address: @email_address.upcase).valid?
  end

  def test_that_password_must_have_at_least_8_characters
    assert_not build(:user, password: Faker::Internet.password(min_length: 2, max_length: 7)).valid?
  end

  def test_that_signup_token_round_trips_the_normalized_email_address
    token = User.signup_token_for(" #{@email_address.upcase} ")

    assert_equal @email_address.downcase, User.email_address_from_signup_token(token)
  end

  def test_that_a_tampered_signup_token_is_rejected
    assert_nil User.email_address_from_signup_token("#{User.signup_token_for(@email_address)}x")
    assert_nil User.email_address_from_signup_token(nil)
  end
end
