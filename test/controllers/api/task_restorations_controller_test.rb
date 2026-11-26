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

  def test_that_a_restored_task_whose_area_was_deleted_goes_to_the_inbox
    @task.update!(life_area: create(:life_area, user: @user))
    @task.life_area.discard!
    sign_in @user

    post api_task_restoration_path(@task)

    assert_response :created
    assert_nil response.parsed_body.dig("task", "life_area_id")
  end

  def test_that_a_task_completed_before_it_was_deleted_is_still_completed_once_restored
    @task.update!(is_completed: true)
    sign_in @user

    post api_task_restoration_path(@task)

    assert response.parsed_body.dig("task", "is_completed")
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
