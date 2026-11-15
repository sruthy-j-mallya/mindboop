require "test_helper"

class Api::TaskRestorationsControllerTest < ActionDispatch::IntegrationTest
  def setup
    @user = create(:user)
    @task = create(:task, user: @user, discarded_at: Time.current)
    @other_task = create(:task, discarded_at: Time.current)
  end

  def test_that_create_restores_a_deleted_task
    sign_in @user

    post api_task_restoration_path(@task)

    assert_response :created
    assert_nil @task.reload.discarded_at
    assert_equal @task.id, response.parsed_body.dig("task", "id")
  end

  def test_that_create_returns_404_for_a_task_that_is_not_deleted
    task = create(:task, user: @user)
    sign_in @user

    post api_task_restoration_path(task)

    assert_response :not_found
    assert response.parsed_body["error"].present?
  end

  def test_that_create_returns_401_when_signed_out
    post api_task_restoration_path(@task)

    assert_response :unauthorized
    assert @task.reload.discarded?
  end

  def test_that_create_returns_403_for_another_users_task
    sign_in @user

    post api_task_restoration_path(@other_task)

    assert_response :forbidden
    assert @other_task.reload.discarded?
  end
end
