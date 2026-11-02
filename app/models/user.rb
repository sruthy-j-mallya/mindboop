class User < ApplicationRecord
  has_secure_password

  EMAIL_ADDRESS_FORMAT = URI::MailTo::EMAIL_REGEXP
  SIGNUP_TOKEN_EXPIRES_IN = 1.day

  normalizes :email_address, with: ->(e) { e.strip.downcase }

  has_many :sessions, dependent: :destroy

  validates :email_address, presence: true, uniqueness: true, format: { with: EMAIL_ADDRESS_FORMAT }
  validates :password, length: { minimum: 8 }, allow_nil: true

  # Sign-up links carry the confirmed email address, so no user row exists until the link is used.
  def self.signup_token_for(email_address)
    signup_token_verifier.generate(normalize_value_for(:email_address, email_address), expires_in: SIGNUP_TOKEN_EXPIRES_IN)
  end

  # Returns nil when the token is tampered with or expired.
  def self.email_address_from_signup_token(token)
    signup_token_verifier.verified(token.to_s)
  end

  def self.signup_token_verifier
    # url_safe: the token goes in the /signup/:token path.
    @signup_token_verifier ||= ActiveSupport::MessageVerifier.new(
      Rails.application.key_generator.generate_key("user/signup"), url_safe: true
    )
  end
  private_class_method :signup_token_verifier
end
