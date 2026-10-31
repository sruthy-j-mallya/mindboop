module Api
  class EmailConfirmationsController < BaseController
    allow_unauthenticated_access
    # Anyone may ask for a sign-up link, so there is no record to authorize.
    skip_after_action :verify_authorized
    rate_limit to: 10, within: 3.minutes, only: :create, with: :too_many_requests

    def create
      email_address = User.normalize_value_for(:email_address, params[:email_address].to_s)
      return render json: { error: "Email address is invalid" }, status: :unprocessable_content unless email_address.match?(User::EMAIL_ADDRESS_FORMAT)

      # Same response either way, so the endpoint doesn't reveal which addresses have accounts.
      if user = User.find_by(email_address: email_address)
        RegistrationsMailer.already_registered(user).deliver_later
      else
        RegistrationsMailer.confirm_email(email_address).deliver_later
      end

      render json: { message: "Sign-up link sent." }, status: :accepted
    end
  end
end
