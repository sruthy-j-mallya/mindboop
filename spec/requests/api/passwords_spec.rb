require "rails_helper"

RSpec.describe "Api::Passwords", type: :request do
  let(:user) { create(:user) }

  describe "POST /api/passwords" do
    it "enqueues a reset email for a known user" do
      expect {
        post api_passwords_path, params: { email_address: user.email_address }, as: :json
      }.to have_enqueued_mail(PasswordsMailer, :reset)

      expect(response).to have_http_status(:accepted)
    end

    it "responds the same for an unknown email" do
      post api_passwords_path, params: { email_address: "nobody@example.com" }, as: :json

      expect(response).to have_http_status(:accepted)
    end
  end

  describe "PATCH /api/passwords/:token" do
    it "resets the password with a valid token" do
      patch api_password_path(user.password_reset_token), params: { password: "newpassword", password_confirmation: "newpassword" }, as: :json

      expect(response).to have_http_status(:no_content)
      expect(user.reload.authenticate("newpassword")).to be_truthy
    end

    it "rejects an invalid token" do
      patch api_password_path("invalid"), params: { password: "newpassword", password_confirmation: "newpassword" }, as: :json

      expect(response).to have_http_status(:not_found)
    end
  end
end
