require "test_helper"

class Api::RoutineStepsControllerTest < ActionDispatch::IntegrationTest
  def setup
    @user = create(:user)
    @routine = create(:routine, user: @user)
    @step = create(:routine_step, routine: @routine)
    @other_step = create(:routine_step, routine: @routine)
    @foreign_routine = create(:routine)
    @foreign_step = create(:routine_step, routine: @foreign_routine)
    @title = Faker::Lorem.sentence
  end

  def test_that_user_can_add_a_step_to_their_routine
    sign_in @user

    assert_difference "RoutineStep.count", 1 do
      post api_routine_steps_path(@routine), params: { title: @title }, as: :json
    end

    assert_response :created
    assert_equal [ @step.title, @other_step.title, @title ], response.parsed_body["routine"]["steps"].pluck("title")
  end

  def test_that_create_adds_the_step_at_the_given_position
    sign_in @user

    post api_routine_steps_path(@routine), params: { title: @title, position: 1 }, as: :json

    assert_response :created
    assert_equal [ @step.title, @title, @other_step.title ], response.parsed_body["routine"]["steps"].pluck("title")
  end

  def test_that_create_rejects_a_blank_title
    sign_in @user

    assert_no_difference "RoutineStep.count" do
      post api_routine_steps_path(@routine), params: { title: " " }, as: :json
    end

    assert_response :unprocessable_content
    assert_equal "Title can't be blank", response.parsed_body["error"]
  end

  def test_that_create_rejects_an_invalid_position_and_saves_nothing
    sign_in @user

    assert_no_difference "RoutineStep.count" do
      post api_routine_steps_path(@routine), params: { title: @title, position: -1 }, as: :json
    end

    assert_response :unprocessable_content
  end

  def test_that_create_returns_401_when_signed_out
    assert_no_difference "RoutineStep.count" do
      post api_routine_steps_path(@routine), params: { title: @title }, as: :json
    end

    assert_response :unauthorized
  end

  def test_that_create_returns_403_for_another_users_routine
    sign_in @user

    assert_no_difference "RoutineStep.count" do
      post api_routine_steps_path(@foreign_routine), params: { title: @title }, as: :json
    end

    assert_response :forbidden
  end

  def test_that_create_returns_404_for_a_deleted_routine
    @routine.discard!
    sign_in @user

    post api_routine_steps_path(@routine), params: { title: @title }, as: :json

    assert_response :not_found
  end

  def test_that_user_can_rename_a_step
    sign_in @user

    patch api_routine_step_path(@routine, @step), params: { title: @title }, as: :json

    assert_response :ok
    assert_equal @title, @step.reload.title
    assert_equal({ "id" => @step.id, "title" => @title }, response.parsed_body["routine"]["steps"].first)
  end

  def test_that_update_moves_a_step
    sign_in @user

    patch api_routine_step_path(@routine, @other_step), params: { position: 0 }, as: :json

    assert_response :ok
    assert_equal [ @other_step.id, @step.id ], response.parsed_body["routine"]["steps"].pluck("id")
  end

  def test_that_update_rejects_a_blank_title
    sign_in @user

    patch api_routine_step_path(@routine, @step), params: { title: "" }, as: :json

    assert_response :unprocessable_content
    assert_equal "Title can't be blank", response.parsed_body["error"]
  end

  def test_that_update_returns_401_when_signed_out
    patch api_routine_step_path(@routine, @step), params: { title: @title }, as: :json

    assert_response :unauthorized
    assert_not_equal @title, @step.reload.title
  end

  def test_that_update_returns_403_for_another_users_routine
    sign_in @user

    patch api_routine_step_path(@foreign_routine, @foreign_step), params: { title: @title }, as: :json

    assert_response :forbidden
    assert_not_equal @title, @foreign_step.reload.title
  end

  def test_that_update_returns_404_for_a_step_of_another_routine
    sign_in @user

    patch api_routine_step_path(@routine, @foreign_step), params: { title: @title }, as: :json

    assert_response :not_found
    assert_not_equal @title, @foreign_step.reload.title
  end

  def test_that_destroy_soft_deletes_the_step
    sign_in @user

    assert_no_difference "RoutineStep.count" do
      delete api_routine_step_path(@routine, @step), as: :json
    end

    assert_response :ok
    assert @step.reload.discarded?
    assert_equal [ @other_step.id ], response.parsed_body["routine"]["steps"].pluck("id")
  end

  def test_that_destroy_returns_401_when_signed_out
    delete api_routine_step_path(@routine, @step), as: :json

    assert_response :unauthorized
    assert_not @step.reload.discarded?
  end

  def test_that_destroy_returns_403_for_another_users_routine
    sign_in @user

    delete api_routine_step_path(@foreign_routine, @foreign_step), as: :json

    assert_response :forbidden
    assert_not @foreign_step.reload.discarded?
  end
end
