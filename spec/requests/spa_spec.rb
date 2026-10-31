require "rails_helper"

RSpec.describe "SPA shell", type: :request do
  it "renders the React root for client-side routes" do
    get "/login"

    expect(response).to have_http_status(:ok)
    expect(response.body).to include('<div id="root"></div>')
  end
end
