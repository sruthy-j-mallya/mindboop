require "rails_helper"

RSpec.describe "Api::Registrations", type: :request do
  describe "POST /api/registration" do
    it "creates a user and signs them in" do
      expect {
        post api_registration_path, params: { email_address: "new@example.com", password: "password123", password_confirmation: "password123" }, as: :json
      }.to change(User, :count).by(1)

      expect(response).to have_http_status(:created)
      expect(cookies[:session_id]).to be_present
    end

    it "returns validation errors" do
      post api_registration_path, params: { email_address: "new@example.com", password: "password123", password_confirmation: "nope" }, as: :json

      expect(response).to have_http_status(:unprocessable_content)
      expect(response.parsed_body["errors"]).to include("Password confirmation doesn't match Password")
    end
  end
end
