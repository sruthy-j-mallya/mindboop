module Api
  class RegistrationsController < BaseController
    allow_unauthenticated_access
    rate_limit to: 10, within: 3.minutes, only: :create, with: :too_many_requests

    def create
      user = User.create!(params.permit(:email_address, :password, :password_confirmation))
      start_new_session_for user
      render json: { user: user_json(user) }, status: :created
    end
  end
end
