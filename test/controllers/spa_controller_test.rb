require "test_helper"

class SpaControllerTest < ActionDispatch::IntegrationTest
  def test_that_client_routes_render_the_react_root
    get "/login"

    assert_response :ok
    assert_includes response.body, '<div id="root"></div>'
  end
end
