module Api
  class PasswordsController < BaseController
    allow_unauthenticated_access
    before_action :set_user_by_token, only: :update
    rate_limit to: 10, within: 3.minutes, only: :create, with: :too_many_requests

    def create
      if user = User.find_by(email_address: params[:email_address])
        PasswordsMailer.reset(user).deliver_later
      end

      render json: { message: "Password reset instructions sent (if user with that email address exists)." }, status: :accepted
    end

    def update
      @user.update!(params.permit(:password, :password_confirmation))
      @user.sessions.destroy_all
      head :no_content
    end

    private
      def set_user_by_token
        @user = User.find_by_password_reset_token!(params[:token])
      rescue ActiveSupport::MessageVerifier::InvalidSignature
        render json: { error: "Password reset link is invalid or has expired." }, status: :not_found
      end
  end
end
