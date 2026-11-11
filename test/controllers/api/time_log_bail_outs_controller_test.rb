require "test_helper"

class Api::TimeLogBailOutsControllerTest < ActionDispatch::IntegrationTest
  def setup
    @user = create(:user)
    @task = create(:task, user: @user)
    @time_log = create(
      :time_log, task: @task, mode: "timer", timer_preset: 25, is_running: true, current_run_started_at: 1.minute.ago
    )
    @params = attributes_for(:breadcrumb)
  end

  def test_that_user_can_bail_out_of_their_time_log
    sign_in @user

    assert_difference "Breadcrumb.count", 1 do
      post api_time_log_bail_out_path(@time_log), params: @params
    end

    assert_response :created
    time_log = response.parsed_body["time_log"]
    assert_equal @time_log.id, time_log["id"]
    assert_not_nil time_log["completed_at"]
    assert_equal false, time_log["is_running"]
    assert_equal false, time_log["is_finished_early"]
    assert_equal @params[:completed_description], @task.breadcrumbs.sole.completed_description
    assert_equal @params[:restart_description], @task.breadcrumbs.sole.restart_description
    assert_not @task.reload.is_completed
    assert_empty @user.achievements
  end

  def test_that_a_bailed_out_time_log_is_no_longer_current
    sign_in @user

    post api_time_log_bail_out_path(@time_log), params: @params
    get api_current_time_log_path

    assert_nil response.parsed_body["time_log"]
  end

  def test_that_user_can_bail_out_without_saying_what_got_done
    sign_in @user

    assert_difference "Breadcrumb.count", 1 do
      post api_time_log_bail_out_path(@time_log), params: @params.except(:completed_description)
    end

    assert_response :created
    assert_nil @task.breadcrumbs.sole.completed_description
    assert_not_nil @time_log.reload.completed_at
  end

  def test_that_create_returns_422_when_the_next_step_is_missing
    sign_in @user

    assert_no_difference "Breadcrumb.count" do
      post api_time_log_bail_out_path(@time_log), params: @params.except(:restart_description)
    end

    assert_response :unprocessable_content
    assert_equal "Restart description can't be blank", response.parsed_body["error"]
    assert_nil @time_log.reload.completed_at
  end

  def test_that_create_returns_401_when_signed_out
    assert_no_difference "Breadcrumb.count" do
      post api_time_log_bail_out_path(@time_log), params: @params
    end

    assert_response :unauthorized
    assert_nil @time_log.reload.completed_at
  end

  def test_that_create_returns_403_for_another_users_time_log
    sign_in create(:user)

    assert_no_difference "Breadcrumb.count" do
      post api_time_log_bail_out_path(@time_log), params: @params
    end

    assert_response :forbidden
    assert_nil @time_log.reload.completed_at
  end

  def test_that_create_returns_404_for_a_deleted_time_log
    @time_log.discard!
    sign_in @user

    post api_time_log_bail_out_path(@time_log), params: @params

    assert_response :not_found
  end
end
