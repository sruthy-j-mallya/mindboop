# Preview at http://localhost:3000/rails/mailers/registrations_mailer
class RegistrationsMailerPreview < ActionMailer::Preview
  def confirm_email
    RegistrationsMailer.confirm_email("new-user@example.com")
  end

  def already_registered
    RegistrationsMailer.already_registered(User.take!)
  end
end
