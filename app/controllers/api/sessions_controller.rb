module Api
  class SessionsController < BaseController
    allow_unauthenticated_access only: :create
    # Acts on the caller's own session, so there is no record to authorize.
    skip_after_action :verify_authorized
    rate_limit to: 10, within: 3.minutes, only: :create, with: :too_many_requests

    def show
      @user = Current.user
    end

    def create
      if @user = User.authenticate_by(session_params)
        start_new_session_for @user
        render :show, status: :created
      else
        render json: { error: "Try another email address or password." }, status: :unauthorized
      end
    end

    def destroy
      terminate_session
      head :no_content
    end

    private
      def session_params
        params.permit(:email_address, :password)
      end
  end
end
