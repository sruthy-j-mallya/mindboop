class RegistrationsMailer < ApplicationMailer
  def confirm_email(email_address)
    @token = User.signup_token_for(email_address)
    mail subject: "Confirm your email to finish signing up", to: email_address
  end

  def already_registered(user)
    @user = user
    mail subject: "You already have an account", to: user.email_address
  end
end
