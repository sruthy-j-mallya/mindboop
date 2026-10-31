module Api
  class BaseController < ApplicationController
    include Pundit::Authorization

    # Conditions instead of only/except: Rails raises when a listed action doesn't exist on the controller.
    after_action :verify_authorized, unless: -> { action_name == "index" }
    after_action :verify_policy_scoped, if: -> { action_name == "index" }

    rescue_from ActiveRecord::RecordInvalid do |error|
      render json: { error: error.record.errors.full_messages.to_sentence }, status: :unprocessable_content
    end

    rescue_from Pundit::NotAuthorizedError do
      render json: { error: "You are not allowed to do that." }, status: :forbidden
    end

    private
      def pundit_user
        Current.user
      end

      def request_authentication
        render json: { error: "Not authenticated" }, status: :unauthorized
      end

      def too_many_requests
        render json: { error: "Try again later." }, status: :too_many_requests
      end
  end
end
