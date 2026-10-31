module AuthHelpers
  def sign_in(user, password: "password123")
    post api_session_path, params: { email_address: user.email_address, password: password }, as: :json
  end
end

RSpec.configure do |config|
  config.include AuthHelpers, type: :request
end
