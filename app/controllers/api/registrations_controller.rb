module Api
  class RegistrationsController < BaseController
    allow_unauthenticated_access
    # Access is granted by the sign-up token, not a policy.
    skip_after_action :verify_authorized
    before_action :set_email_address_by_token
    rate_limit to: 10, within: 3.minutes, only: :create, with: :too_many_requests

    def create
      @user = User.create!(registration_params.merge(email_address: @email_address))
      start_new_session_for @user
      render "api/sessions/show", status: :created
    end

    private
      def set_email_address_by_token
        @email_address = User.email_address_from_signup_token(params[:token])
        render json: { error: "Sign-up link is invalid or has expired." }, status: :not_found unless @email_address
      end

      def registration_params
        params.permit(:password, :password_confirmation)
      end
  end
end
