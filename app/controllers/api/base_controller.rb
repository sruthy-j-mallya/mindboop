module Api
  class BaseController < ApplicationController
    rescue_from ActiveRecord::RecordInvalid do |error|
      render json: { errors: error.record.errors.full_messages }, status: :unprocessable_content
    end

    private
      def request_authentication
        render json: { error: "Not authenticated" }, status: :unauthorized
      end

      def user_json(user)
        { id: user.id, email_address: user.email_address }
      end

      def too_many_requests
        render json: { error: "Try again later." }, status: :too_many_requests
      end
  end
end
