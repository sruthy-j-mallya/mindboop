require "rails_helper"

RSpec.describe "Api::Sessions", type: :request do
  let(:user) { create(:user) }

  describe "GET /api/session" do
    it "returns 401 when signed out" do
      get api_session_path

      expect(response).to have_http_status(:unauthorized)
    end

    it "returns the current user when signed in" do
      sign_in user
      get api_session_path

      expect(response.parsed_body["user"]).to include("id" => user.id, "email_address" => user.email_address)
    end
  end

  describe "POST /api/session" do
    it "signs in with valid credentials" do
      sign_in user

      expect(response).to have_http_status(:created)
      expect(cookies[:session_id]).to be_present
    end

    it "rejects invalid credentials" do
      sign_in user, password: "wrong-password"

      expect(response).to have_http_status(:unauthorized)
      expect(response.parsed_body["error"]).to be_present
    end
  end

  describe "DELETE /api/session" do
    it "signs out" do
      sign_in user

      expect { delete api_session_path }.to change(Session, :count).by(-1)
      expect(response).to have_http_status(:no_content)
    end
  end
end
