require "test_helper"

class SpaControllerTest < ActionDispatch::IntegrationTest
  def test_that_client_routes_render_the_react_root
    get "/login"

    assert_response :ok
    assert_includes response.body, '<div id="root"></div>'
  end

  def test_that_the_page_follows_the_os_theme_when_signed_out
    get "/login"

    assert_includes response.body, 'const theme = "system";'
  end

  def test_that_the_page_applies_the_signed_in_users_theme
    user = create(:user)
    create(:user_preference, user: user, theme: "dark")
    sign_in user

    get "/settings"

    assert_includes response.body, 'const theme = "dark";'
  end
end
