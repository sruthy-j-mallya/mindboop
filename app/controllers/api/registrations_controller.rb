module Api
  class RegistrationsController < BaseController
    allow_unauthenticated_access
    # Sign-up is open to everyone, so there is no record to authorize.
    skip_after_action :verify_authorized
    rate_limit to: 10, within: 3.minutes, only: :create, with: :too_many_requests

    def create
      @user = User.create!(registration_params)
      start_new_session_for @user
      render "api/sessions/show", status: :created
    end

    private
      def registration_params
        params.permit(:email_address, :password, :password_confirmation)
      end
  end
end
