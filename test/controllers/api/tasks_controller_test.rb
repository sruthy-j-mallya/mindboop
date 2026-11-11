require "test_helper"

class Api::TasksControllerTest < ActionDispatch::IntegrationTest
  def setup
    @user = create(:user)
    @task = create(:task, user: @user)
    @other_task = create(:task)
    @title = Faker::Lorem.sentence
  end

  def test_that_index_returns_401_when_signed_out
    get api_tasks_path

    assert_response :unauthorized
  end

  def test_that_index_returns_only_the_users_undeleted_tasks
    deleted_task = create(:task, user: @user, discarded_at: Time.current)
    sign_in @user

    get api_tasks_path

    assert_response :ok
    ids = response.parsed_body["tasks"].pluck("id")
    assert_equal [ @task.id ], ids
    assert_not_includes ids, deleted_task.id
    assert_not_includes ids, @other_task.id
    assert_equal 1, response.parsed_body["tasks_count"]
  end

  def test_that_index_paginates_the_tasks_oldest_first
    tasks = [ @task, *create_list(:task, Pagy::DEFAULT[:limit], user: @user) ]
    sign_in @user

    get api_tasks_path

    assert_response :ok
    assert_equal tasks.first(Pagy::DEFAULT[:limit]).map(&:id), response.parsed_body["tasks"].pluck("id")
    assert_equal tasks.size, response.parsed_body["tasks_count"]
    assert_equal 1, response.parsed_body["page"]
    assert_equal 2, response.parsed_body["total_pages"]

    get api_tasks_path, params: { page: 2 }

    assert_equal [ tasks.last.id ], response.parsed_body["tasks"].pluck("id")
    assert_equal 2, response.parsed_body["page"]
  end

  def test_that_index_returns_no_tasks_for_a_page_past_the_end
    sign_in @user

    get api_tasks_path, params: { page: 2 }

    assert_response :ok
    assert_empty response.parsed_body["tasks"]
    assert_equal 1, response.parsed_body["tasks_count"]
  end

  def test_that_index_returns_the_first_page_for_an_invalid_page
    sign_in @user

    get api_tasks_path, params: { page: "abc" }

    assert_response :ok
    assert_equal [ @task.id ], response.parsed_body["tasks"].pluck("id")
    assert_equal 1, response.parsed_body["page"]
  end

  def test_that_show_leaves_out_discarded_checklist_items
    item = create(:checklist_item, task: @task)
    create(:checklist_item, task: @task).discard!
    sign_in @user

    get api_task_path(@task)

    assert_response :ok
    assert_equal [ item.id ], response.parsed_body.dig("task", "checklist_items").pluck("id")
  end

  def test_that_index_loads_checklist_items_with_each_task
    item = create(:checklist_item, task: @task)
    sign_in @user

    get api_tasks_path

    assert_equal [ item.id ], response.parsed_body["tasks"].first["checklist_items"].pluck("id")
  end

  def test_that_show_returns_the_task_with_its_checklist_items
    item = create(:checklist_item, task: @task)
    sign_in @user

    get api_task_path(@task)

    assert_response :ok
    task = response.parsed_body["task"]
    assert_equal @task.title, task["title"]
    assert_not task.key?("discarded_at")
    assert_equal [ { "id" => item.id, "title" => item.title, "is_completed" => false } ], task["checklist_items"]
  end

  def test_that_show_returns_401_when_signed_out
    get api_task_path(@task)

    assert_response :unauthorized
  end

  def test_that_show_returns_403_for_another_users_task
    sign_in @user

    get api_task_path(@other_task)

    assert_response :forbidden
    assert response.parsed_body["error"].present?
  end

  def test_that_show_returns_404_for_a_deleted_task
    @task.discard!
    sign_in @user

    get api_task_path(@task)

    assert_response :not_found
    assert response.parsed_body["error"].present?
  end

  def test_that_show_returns_404_for_a_malformed_id
    sign_in @user

    get api_task_path("not-a-uuid")

    assert_response :not_found
  end

  def test_that_user_can_create_a_task
    sign_in @user
    starts_at = 1.day.from_now.change(usec: 0)

    assert_difference "@user.tasks.count", 1 do
      post api_tasks_path, params: { title: @title, estimated_minutes: 30, is_all_day: true, starts_at: }, as: :json
    end

    assert_response :created
    task = response.parsed_body["task"]
    assert_equal @title, task["title"]
    assert_equal 30, task["estimated_minutes"]
    assert_equal true, task["is_all_day"]
    assert_equal starts_at, Time.zone.parse(task["starts_at"])
    assert_equal [], task["checklist_items"]
  end

  def test_that_user_can_create_a_task_with_checklist_items
    first_title, second_title = Faker::Lorem.unique.sentence, Faker::Lorem.unique.sentence
    sign_in @user

    assert_difference "ChecklistItem.count", 2 do
      post api_tasks_path, params: {
        title: @title,
        checklist_items_attributes: [ { title: first_title }, { title: second_title, is_completed: true } ]
      }, as: :json
    end

    assert_response :created
    items = response.parsed_body.dig("task", "checklist_items")
    assert_equal [ first_title, second_title ], items.pluck("title")
    assert_equal [ false, true ], items.pluck("is_completed")
    saved_items = Task.find(response.parsed_body.dig("task", "id")).checklist_items
    assert_equal [ first_title, second_title ], saved_items.map(&:title)
    assert_equal [ 0, 1 ], saved_items.map(&:position)
  end

  def test_that_create_ignores_a_client_supplied_position
    sign_in @user

    post api_tasks_url, params: {
      title: Faker::Lorem.sentence,
      checklist_items_attributes: [ { title: Faker::Lorem.sentence, position: 7 } ]
    }, as: :json

    assert_response :created
    assert_equal 0, Task.find(response.parsed_body.dig("task", "id")).checklist_items.sole.position
  end

  def test_that_create_saves_nothing_when_a_checklist_item_is_invalid
    sign_in @user

    assert_no_difference [ "Task.count", "ChecklistItem.count" ] do
      post api_tasks_path, params: {
        title: @title,
        checklist_items_attributes: [ { title: Faker::Lorem.sentence }, { title: "" } ]
      }, as: :json
    end

    assert_response :unprocessable_content
    assert_equal "Checklist items title can't be blank", response.parsed_body["error"]
  end

  def test_that_create_cannot_take_over_another_tasks_checklist_item
    item = create(:checklist_item, task: @other_task)
    sign_in @user

    post api_tasks_path, params: {
      title: @title,
      checklist_items_attributes: [ { id: item.id, task_id: @task.id, title: Faker::Lorem.unique.sentence } ]
    }, as: :json

    assert_response :created
    created_item = Task.find(response.parsed_body.dig("task", "id")).checklist_items.sole
    assert_not_equal item.id, created_item.id
    assert_equal @other_task.id, item.reload.task_id
    assert_not_equal created_item.title, item.title
  end

  def test_that_update_ignores_checklist_items
    sign_in @user

    assert_no_difference "ChecklistItem.count" do
      patch api_task_path(@task), params: {
        title: @title,
        checklist_items_attributes: [ { title: Faker::Lorem.sentence } ]
      }, as: :json
    end

    assert_response :ok
    assert_equal @title, @task.reload.title
  end

  def test_that_create_cannot_assign_the_task_to_another_user
    sign_in @user
    other_user = create(:user)

    post api_tasks_path, params: { title: @title, user_id: other_user.id }, as: :json

    assert_response :created
    assert_equal @user.id, Task.find(response.parsed_body.dig("task", "id")).user_id
  end

  def test_that_create_rejects_an_invalid_task
    sign_in @user

    assert_no_difference "Task.count" do
      post api_tasks_path, params: { title: "" }, as: :json
    end

    assert_response :unprocessable_content
    assert_equal "Title can't be blank", response.parsed_body["error"]
  end

  def test_that_create_returns_401_when_signed_out
    assert_no_difference "Task.count" do
      post api_tasks_path, params: { title: @title }, as: :json
    end

    assert_response :unauthorized
  end

  def test_that_user_can_update_their_task
    sign_in @user

    patch api_task_path(@task), params: { title: @title, is_completed: true }, as: :json

    assert_response :ok
    assert_equal @title, response.parsed_body.dig("task", "title")
    assert @task.reload.is_completed
  end

  def test_that_update_rejects_invalid_values
    sign_in @user

    patch api_task_path(@task), params: { is_completed: nil }, as: :json

    assert_response :unprocessable_content
    assert response.parsed_body["error"].present?
  end

  def test_that_update_returns_401_when_signed_out
    patch api_task_path(@task), params: { title: @title }, as: :json

    assert_response :unauthorized
    assert_not_equal @title, @task.reload.title
  end

  def test_that_update_returns_403_for_another_users_task
    sign_in @user

    patch api_task_path(@other_task), params: { title: @title }, as: :json

    assert_response :forbidden
    assert_not_equal @title, @other_task.reload.title
  end

  def test_that_destroy_soft_deletes_the_task
    sign_in @user

    assert_no_difference "Task.count" do
      delete api_task_path(@task)
    end

    assert_response :no_content
    assert @task.reload.discarded_at.present?
  end

  def test_that_destroy_returns_401_when_signed_out
    delete api_task_path(@task)

    assert_response :unauthorized
    assert_nil @task.reload.discarded_at
  end

  def test_that_destroy_returns_403_for_another_users_task
    sign_in @user

    delete api_task_path(@other_task)

    assert_response :forbidden
    assert_nil @other_task.reload.discarded_at
  end
end
