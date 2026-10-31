module AuthHelpers
  def sign_in(user, password: user.password)
    post api_session_path, params: { email_address: user.email_address, password: password }, as: :json
  end
end
