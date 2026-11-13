require "test_helper"

class Api::ChecklistItemsControllerTest < ActionDispatch::IntegrationTest
  def setup
    @user = create(:user)
    @task = create(:task, user: @user)
    @item = create(:checklist_item, task: @task)
    @other_item = create(:checklist_item, task: @task)
    @foreign_task = create(:task)
    @foreign_item = create(:checklist_item, task: @foreign_task)
    @title = Faker::Lorem.sentence
  end

  def test_that_user_can_add_a_checklist_item_to_their_task
    sign_in @user

    assert_difference "ChecklistItem.count", 1 do
      post api_task_checklist_items_path(@task), params: { title: @title }, as: :json
    end

    assert_response :created
    items = response.parsed_body["task"]["checklist_items"]
    assert_equal [ @item.title, @other_item.title, @title ], items.pluck("title")
    assert_equal false, items.last["is_completed"]
  end

  def test_that_create_adds_the_item_at_the_given_position
    sign_in @user

    post api_task_checklist_items_path(@task), params: { title: @title, position: 1 }, as: :json

    assert_response :created
    titles = response.parsed_body["task"]["checklist_items"].pluck("title")
    assert_equal [ @item.title, @title, @other_item.title ], titles
  end

  def test_that_create_rejects_an_invalid_position_and_saves_nothing
    sign_in @user

    assert_no_difference "ChecklistItem.count" do
      post api_task_checklist_items_path(@task), params: { title: @title, position: -1 }, as: :json
    end

    assert_response :unprocessable_content
  end

  def test_that_create_rejects_a_blank_title
    sign_in @user

    assert_no_difference "ChecklistItem.count" do
      post api_task_checklist_items_path(@task), params: { title: "" }, as: :json
    end

    assert_response :unprocessable_content
    assert_equal "Title can't be blank", response.parsed_body["error"]
  end

  def test_that_create_returns_401_when_signed_out
    assert_no_difference "ChecklistItem.count" do
      post api_task_checklist_items_path(@task), params: { title: @title }, as: :json
    end

    assert_response :unauthorized
  end

  def test_that_create_returns_403_for_another_users_task
    sign_in @user

    assert_no_difference "ChecklistItem.count" do
      post api_task_checklist_items_path(@foreign_task), params: { title: @title }, as: :json
    end

    assert_response :forbidden
  end

  def test_that_create_returns_404_for_a_deleted_task
    @task.discard!
    sign_in @user

    post api_task_checklist_items_path(@task), params: { title: @title }, as: :json

    assert_response :not_found
  end

  def test_that_user_can_rename_and_complete_a_checklist_item
    sign_in @user

    patch api_task_checklist_item_path(@task, @item), params: { title: @title, is_completed: true }, as: :json

    assert_response :ok
    assert_equal @title, @item.reload.title
    assert @item.is_completed
    assert_equal({ "id" => @item.id, "title" => @title, "is_completed" => true },
      response.parsed_body["task"]["checklist_items"].first)
  end

  def test_that_update_moves_a_checklist_item
    sign_in @user

    patch api_task_checklist_item_path(@task, @other_item), params: { position: 0 }, as: :json

    assert_response :ok
    assert_equal [ @other_item.id, @item.id ], response.parsed_body["task"]["checklist_items"].pluck("id")
  end

  def test_that_update_rejects_a_blank_title
    sign_in @user

    patch api_task_checklist_item_path(@task, @item), params: { title: "" }, as: :json

    assert_response :unprocessable_content
    assert_equal "Title can't be blank", response.parsed_body["error"]
    assert_not_equal "", @item.reload.title
  end

  def test_that_update_rejects_an_invalid_position_and_saves_nothing
    sign_in @user

    patch api_task_checklist_item_path(@task, @item), params: { title: @title, position: "last" }, as: :json

    assert_response :unprocessable_content
    assert_equal "Position must be a whole number of 0 or more", response.parsed_body["error"]
    assert_not_equal @title, @item.reload.title
  end

  def test_that_update_returns_401_when_signed_out
    patch api_task_checklist_item_path(@task, @item), params: { title: @title }, as: :json

    assert_response :unauthorized
    assert_not_equal @title, @item.reload.title
  end

  def test_that_update_returns_403_for_another_users_task
    sign_in @user

    patch api_task_checklist_item_path(@foreign_task, @foreign_item), params: { title: @title }, as: :json

    assert_response :forbidden
    assert_not_equal @title, @foreign_item.reload.title
  end

  def test_that_update_returns_404_for_an_item_of_another_task
    sign_in @user

    patch api_task_checklist_item_path(@task, @foreign_item), params: { title: @title }, as: :json

    assert_response :not_found
    assert_not_equal @title, @foreign_item.reload.title
  end

  def test_that_destroy_soft_deletes_the_checklist_item
    sign_in @user

    assert_no_difference "ChecklistItem.count" do
      delete api_task_checklist_item_path(@task, @item), as: :json
    end

    assert_response :ok
    assert @item.reload.discarded?
    assert_equal [ @other_item.id ], response.parsed_body["task"]["checklist_items"].pluck("id")
  end

  def test_that_destroy_returns_404_for_a_discarded_item
    @item.discard!
    sign_in @user

    delete api_task_checklist_item_path(@task, @item), as: :json

    assert_response :not_found
  end

  def test_that_destroy_returns_401_when_signed_out
    delete api_task_checklist_item_path(@task, @item), as: :json

    assert_response :unauthorized
    assert_not @item.reload.discarded?
  end

  def test_that_destroy_returns_403_for_another_users_task
    sign_in @user

    delete api_task_checklist_item_path(@foreign_task, @foreign_item), as: :json

    assert_response :forbidden
    assert_not @foreign_item.reload.discarded?
  end
end
