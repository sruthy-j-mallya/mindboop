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

  def test_that_index_paginates_the_tasks_newest_first
    tasks = [ @task, *create_list(:task, Pagy::DEFAULT[:limit], user: @user) ].reverse
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

  def test_that_index_orders_tasks_by_due_date_then_newest_first
    later = create(:task, user: @user, starts_at: 2.days.from_now)
    sooner = create(:task, user: @user, starts_at: 1.day.from_now)
    undated = create(:task, user: @user)
    sign_in @user

    get api_tasks_path

    assert_response :ok
    assert_equal [ sooner.id, later.id, undated.id, @task.id ], response.parsed_body["tasks"].pluck("id")
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

  def test_that_index_can_search_titles
    match = create(:task, user: @user, title: "Write the Quarterly report")
    create(:task, user: @user, title: "Water the plants")
    sign_in @user

    get api_tasks_path, params: { search_term: " quarterly " }

    assert_equal [ match.id ], response.parsed_body["tasks"].pluck("id")
  end

  def test_that_index_search_treats_wildcards_as_text
    create(:task, user: @user, title: "Plain title")
    sign_in @user

    get api_tasks_path, params: { search_term: "%" }

    assert_empty response.parsed_body["tasks"]
  end

  def test_that_index_can_list_only_incomplete_tasks
    completed_task = create(:task, user: @user, is_completed: true)
    sign_in @user

    get api_tasks_path, params: { is_completed: false }

    assert_response :ok
    assert_equal [ @task.id ], response.parsed_body["tasks"].pluck("id")
    assert_equal 1, response.parsed_body["tasks_count"]

    get api_tasks_path, params: { is_completed: true }

    assert_equal [ completed_task.id ], response.parsed_body["tasks"].pluck("id")

    get api_tasks_path

    assert_equal [ completed_task.id, @task.id ], response.parsed_body["tasks"].pluck("id")
  end

  def test_that_index_orders_completed_tasks_by_their_latest_change
    older = create(:task, :backdated, user: @user, is_completed: true, starts_at: 1.day.ago, updated_at: 2.days.ago)
    latest = create(:task, user: @user, is_completed: true, updated_at: 1.day.ago)
    sign_in @user

    get api_tasks_path, params: { is_completed: true }

    assert_equal [ latest.id, older.id ], response.parsed_body["tasks"].pluck("id")
  end

  def test_that_index_can_list_only_deleted_tasks_latest_first
    older = create(:task, user: @user, discarded_at: 2.days.ago)
    latest = create(:task, user: @user, is_completed: true, discarded_at: 1.day.ago)
    create(:task, discarded_at: 1.hour.ago)
    sign_in @user

    get api_tasks_path, params: { is_deleted: true }

    assert_response :ok
    assert_equal [ latest.id, older.id ], response.parsed_body["tasks"].pluck("id")
    assert_equal latest.reload.discarded_at.as_json, response.parsed_body["tasks"].first["discarded_at"]
  end

  def test_that_index_can_list_the_inbox_or_one_area
    life_area = create(:life_area, user: @user)
    task_in_area = create(:task, user: @user, life_area:)
    sign_in @user

    get api_tasks_path, params: { is_in_inbox: true }

    assert_equal [ @task.id ], response.parsed_body["tasks"].pluck("id")

    get api_tasks_path, params: { life_area_id: life_area.id }

    assert_equal [ task_in_area.id ], response.parsed_body["tasks"].pluck("id")
    assert_equal life_area.id, response.parsed_body["tasks"].first["life_area_id"]
  end

  def test_that_index_can_search_tasks_by_title
    @task.update!(title: "Draft the permission letter")
    other_match = create(:task, user: @user, title: "Read the DRAFT notes")
    create(:task, user: @user, title: "Call the bank")
    create(:task, title: "Draft someone else's plan")
    sign_in @user

    get api_tasks_path, params: { search_term: "  draft " }

    assert_response :ok
    assert_equal [ other_match.id, @task.id ], response.parsed_body["tasks"].pluck("id")
    assert_equal 2, response.parsed_body["tasks_count"]
  end

  def test_that_index_can_search_descriptions_and_steps
    @task.update!(title: "Errands", description: "Return the umbrella")
    stepped = create(:task, user: @user, title: "Pack")
    create(:checklist_item, task: stepped, title: "Fold the umbrella")
    someone_elses = create(:task, description: "Another umbrella")
    create(:checklist_item, task: someone_elses, title: "Open the umbrella")
    sign_in @user

    get api_tasks_path, params: { search_term: "umbrella", is_searching_details: true }

    assert_response :ok
    assert_equal [ stepped.id, @task.id ], response.parsed_body["tasks"].pluck("id")
    assert_equal 2, response.parsed_body["tasks_count"]
  end

  def test_that_index_treats_like_wildcards_in_the_search_as_text
    @task.update!(title: "Raise to 100%")
    create(:task, user: @user, title: "Raise to 1000")
    sign_in @user

    get api_tasks_path, params: { search_term: "100%" }

    assert_equal [ @task.id ], response.parsed_body["tasks"].pluck("id")
  end

  def test_that_index_combines_search_with_the_completion_filter
    @task.update!(title: "Draft A")
    create(:task, user: @user, title: "Draft B", is_completed: true)
    sign_in @user

    get api_tasks_path, params: { search_term: "draft", is_completed: false }

    assert_equal [ @task.id ], response.parsed_body["tasks"].pluck("id")
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

  def test_that_show_returns_the_tasks_breadcrumbs_newest_first
    older = create(:breadcrumb, task: @task, created_at: 1.day.ago)
    newer = create(:breadcrumb, task: @task)
    create(:breadcrumb, task: @other_task)
    sign_in @user

    get api_task_path(@task)

    assert_response :ok
    breadcrumbs = response.parsed_body.dig("task", "breadcrumbs")
    assert_equal [ newer.id, older.id ], breadcrumbs.pluck("id")
    assert_equal newer.restart_description, breadcrumbs.first["restart_description"]
    assert_equal newer.completed_description, breadcrumbs.first["completed_description"]
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

  def test_that_user_can_create_a_task_in_an_area
    life_area = create(:life_area, user: @user)
    sign_in @user

    post api_tasks_path, params: { title: @title, life_area_id: life_area.id }, as: :json

    assert_response :created
    assert_equal life_area, Task.find(response.parsed_body.dig("task", "id")).life_area
  end

  def test_that_user_can_move_a_task_between_areas_and_back_to_the_inbox
    life_area = create(:life_area, user: @user)
    sign_in @user

    patch api_task_path(@task), params: { life_area_id: life_area.id }, as: :json

    assert_response :ok
    assert_equal life_area.id, @task.reload.life_area_id

    patch api_task_path(@task), params: { life_area_id: nil }, as: :json

    assert_response :ok
    assert_nil @task.reload.life_area_id
  end

  def test_that_a_task_cannot_be_moved_into_another_users_area
    sign_in @user

    patch api_task_path(@task), params: { life_area_id: create(:life_area).id }, as: :json

    assert_response :unprocessable_content
    assert_equal "Life area must exist", response.parsed_body["error"]
    assert_nil @task.reload.life_area_id
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

  def test_that_update_saves_a_markdown_description
    sign_in @user
    description = "## Plan\n\n- **#{Faker::Lorem.word}**\n- [docs](https://example.com)"

    patch api_task_path(@task), params: { description: }, as: :json

    assert_response :ok
    assert_equal description, response.parsed_body.dig("task", "description")
    assert_equal description, @task.reload.description
  end

  def test_that_update_rejects_a_description_that_is_too_long
    sign_in @user

    patch api_task_path(@task), params: { description: "a" * (Task::MAX_DESCRIPTION_LENGTH + 1) }, as: :json

    assert_response :unprocessable_content
    assert_equal "Description is too long (maximum is 10000 characters)", response.parsed_body["error"]
  end

  def test_that_update_rejects_invalid_values
    sign_in @user

    patch api_task_path(@task), params: { is_completed: nil }, as: :json

    assert_response :unprocessable_content
    assert response.parsed_body["error"].present?
  end

  def test_that_user_can_set_and_clear_their_tasks_estimate
    sign_in @user

    patch api_task_path(@task), params: { estimated_minutes: 45 }, as: :json

    assert_response :ok
    assert_equal 45, response.parsed_body.dig("task", "estimated_minutes")

    patch api_task_path(@task), params: { estimated_minutes: nil }, as: :json

    assert_response :ok
    assert_nil response.parsed_body.dig("task", "estimated_minutes")
    assert_nil @task.reload.estimated_minutes
  end

  def test_that_update_rejects_an_estimate_over_a_day
    sign_in @user

    patch api_task_path(@task), params: { estimated_minutes: Task::MAX_ESTIMATED_MINUTES + 1 }, as: :json

    assert_response :unprocessable_content
    assert_equal "Estimated minutes must be less than or equal to 1440", response.parsed_body["error"]
  end

  def test_that_user_can_schedule_their_task_for_a_duration
    sign_in @user
    starts_at = 1.day.from_now.change(usec: 0)
    ends_at = starts_at + 90.minutes

    patch api_task_path(@task), params: { is_duration: true, is_all_day: false, starts_at:, ends_at: }, as: :json

    assert_response :ok
    @task.reload
    assert @task.is_duration
    assert_equal [ starts_at, ends_at ], [ @task.starts_at, @task.ends_at ]
  end

  def test_that_user_can_clear_their_tasks_schedule
    starts_at = 1.day.from_now
    @task.update!(is_duration: true, starts_at:, ends_at: starts_at + 1.hour)
    sign_in @user

    patch api_task_path(@task), params: { is_duration: false, is_all_day: false, starts_at: nil, ends_at: nil }, as: :json

    assert_response :ok
    assert_nil @task.reload.starts_at
    assert_nil @task.ends_at
  end

  def test_that_update_rejects_a_duration_that_ends_before_it_starts
    sign_in @user
    starts_at = 1.day.from_now

    patch api_task_path(@task), params: { is_duration: true, starts_at:, ends_at: starts_at - 1.hour }, as: :json

    assert_response :unprocessable_content
    assert_match "Ends at", response.parsed_body["error"]
  end

  def test_that_create_rejects_a_start_in_the_past
    sign_in @user

    assert_no_difference "Task.count" do
      post api_tasks_path, params: { title: @title, starts_at: 1.day.ago }, as: :json
    end

    assert_response :unprocessable_content
    assert_equal "Starts at can't be in the past", response.parsed_body["error"]
  end

  def test_that_update_rejects_moving_the_start_into_the_past
    sign_in @user

    patch api_task_path(@task), params: { starts_at: 2.hours.ago }, as: :json

    assert_response :unprocessable_content
    assert_equal "Starts at can't be in the past", response.parsed_body["error"]
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
