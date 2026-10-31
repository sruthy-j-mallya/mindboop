module Api
  class SessionsController < BaseController
    allow_unauthenticated_access only: :create
    rate_limit to: 10, within: 3.minutes, only: :create, with: :too_many_requests

    def show
      render json: { user: user_json(Current.user) }
    end

    def create
      if user = User.authenticate_by(params.permit(:email_address, :password))
        start_new_session_for user
        render json: { user: user_json(user) }, status: :created
      else
        render json: { error: "Try another email address or password." }, status: :unauthorized
      end
    end

    def destroy
      terminate_session
      head :no_content
    end
  end
end
