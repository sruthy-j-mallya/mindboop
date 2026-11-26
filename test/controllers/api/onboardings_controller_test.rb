require "test_helper"

class Api::OnboardingsControllerTest < ActionDispatch::IntegrationTest
  def setup
    @user = create(:user)
  end

  def test_that_show_returns_401_when_signed_out
    get api_onboarding_path

    assert_response :unauthorized
  end

  def test_that_a_new_user_has_taken_no_steps_whatever_others_have
    create(:life_area)
    create(:time_log)
    sign_in @user

    get api_onboarding_path

    assert_response :ok
    assert_equal({ "has_life_areas" => false, "has_tasks" => false, "has_sessions" => false }, onboarding)
  end

  def test_that_show_returns_the_steps_the_user_has_taken
    create(:life_area, user: @user)
    create(:time_log, task: create(:task, user: @user))
    sign_in @user

    get api_onboarding_path

    assert_equal({ "has_life_areas" => true, "has_tasks" => true, "has_sessions" => true }, onboarding)
  end

  def test_that_a_discarded_session_does_not_count
    create(:time_log, task: create(:task, user: @user), discarded_at: Time.current)
    sign_in @user

    get api_onboarding_path

    assert_not onboarding["has_sessions"]
  end

  private
    def onboarding
      response.parsed_body["onboarding"]
    end
end
