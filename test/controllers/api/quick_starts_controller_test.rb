require "test_helper"

class Api::QuickStartsControllerTest < ActionDispatch::IntegrationTest
  def setup
    @user = create(:user)
    @title = Faker::Lorem.sentence
  end

  def test_that_user_can_start_a_timer_on_a_new_task
    freeze_time
    sign_in @user
    step = Faker::Lorem.sentence

    assert_difference [ "@user.tasks.count", "TimeLog.count" ], 1 do
      post api_quick_starts_path, params: {
        title: @title, estimated_minutes: 25, checklist_items_attributes: [ { title: step, is_completed: true } ]
      }, as: :json
    end

    assert_response :created
    task = response.parsed_body["task"]
    time_log = response.parsed_body["time_log"]
    assert_equal @title, task["title"]
    assert_equal 25, task["estimated_minutes"]
    assert_equal [ step ], task["checklist_items"].pluck("title")
    assert_equal task["id"], time_log["task_id"]
    assert_equal "timer", time_log["mode"]
    assert_equal 25, time_log["timer_preset"]
    assert_equal true, time_log["is_running"]
    assert_equal Time.current, Time.zone.parse(time_log["started_at"])
    assert_equal Time.current, Time.zone.parse(time_log["current_run_started_at"])
  end

  def test_that_create_ignores_time_log_and_owner_fields_from_the_client
    sign_in @user
    other_user = create(:user)

    post api_quick_starts_path, params: {
      title: @title, estimated_minutes: 25, user_id: other_user.id, is_completed: true,
      mode: "stopwatch", timer_preset: 5, is_running: false
    }, as: :json

    assert_response :created
    task = Task.find(response.parsed_body.dig("task", "id"))
    time_log = task.time_logs.sole
    assert_equal @user.id, task.user_id
    assert_not task.is_completed
    assert time_log.timer?
    assert_equal 25, time_log.timer_preset
    assert time_log.is_running?
  end

  def test_that_create_saves_a_markdown_description
    sign_in @user
    description = "Start with the *intro*\n\n1. Outline\n2. Draft"

    post api_quick_starts_path, params: { title: @title, estimated_minutes: 25, description: }, as: :json

    assert_response :created
    assert_equal description, response.parsed_body.dig("task", "description")
  end

  def test_that_create_rejects_a_description_that_is_too_long
    sign_in @user

    assert_no_difference [ "Task.count", "TimeLog.count" ] do
      post api_quick_starts_path, params: {
        title: @title, estimated_minutes: 25, description: "a" * (Task::MAX_DESCRIPTION_LENGTH + 1)
      }, as: :json
    end

    assert_response :unprocessable_content
    assert_equal "Description is too long (maximum is 10000 characters)", response.parsed_body["error"]
  end

  def test_that_create_rejects_a_task_without_an_estimate
    sign_in @user

    assert_no_difference [ "Task.count", "TimeLog.count" ] do
      post api_quick_starts_path, params: { title: @title }, as: :json
    end

    assert_response :unprocessable_content
    assert_equal "Estimated minutes can't be blank", response.parsed_body["error"]
  end

  def test_that_create_saves_nothing_when_a_checklist_item_is_invalid
    sign_in @user

    assert_no_difference [ "Task.count", "ChecklistItem.count", "TimeLog.count" ] do
      post api_quick_starts_path, params: {
        title: @title, estimated_minutes: 25, checklist_items_attributes: [ { title: "" } ]
      }, as: :json
    end

    assert_response :unprocessable_content
    assert_equal "Checklist items title can't be blank", response.parsed_body["error"]
  end

  def test_that_create_returns_401_when_signed_out
    assert_no_difference [ "Task.count", "TimeLog.count" ] do
      post api_quick_starts_path, params: { title: @title, estimated_minutes: 25 }, as: :json
    end

    assert_response :unauthorized
  end
end
