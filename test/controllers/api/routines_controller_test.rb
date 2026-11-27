require "test_helper"

class Api::RoutinesControllerTest < ActionDispatch::IntegrationTest
  def setup
    @user = create(:user)
    @routine = create(:routine, user: @user)
    @other_routine = create(:routine)
    @title = Faker::Lorem.words(number: 2).join(" ").capitalize
    @params = { title: @title, emoji: "🧘", color: "violet", sound: "rain", duration_minutes: 10 }
  end

  def test_that_index_returns_401_when_signed_out
    get api_routines_path

    assert_response :unauthorized
  end

  def test_that_index_returns_the_users_kept_routines_in_order_with_stats
    second_step, first_step = create_list(:routine_step, 2, routine: @routine)
    first_step.move_to!(0)
    create(:routine_step, routine: @routine).discard!
    create(:routine, user: @user).discard!
    newer = create(:routine, user: @user)
    newer.move_to!(0)
    create(:time_log, :routine, routine: @routine, started_at: 1.hour.ago, completed_at: 50.minutes.ago,
      accumulated_elapsed_seconds: 600)
    sign_in @user

    get api_routines_path

    assert_response :ok
    routines = response.parsed_body["routines"]
    assert_equal [ newer.id, @routine.id ], routines.pluck("id")
    assert_equal %w[
      id title emoji color sound duration_minutes reminder_time reminder_days steps sessions_count total_seconds
      last_done_at created_at updated_at
    ].sort, routines.second.keys.sort
    assert_equal [ { "id" => first_step.id, "title" => first_step.title }, { "id" => second_step.id, "title" => second_step.title } ],
      routines.second["steps"]
    assert_equal [], routines.first["steps"]
    assert_equal [ 1, 600 ], routines.second.values_at("sessions_count", "total_seconds")
    assert_equal [ 0, 0, nil ], routines.first.values_at("sessions_count", "total_seconds", "last_done_at")
  end

  def test_that_user_can_create_a_routine_with_a_reminder
    sign_in @user

    assert_difference "@user.routines.count", 1 do
      post api_routines_path, params: @params.merge(reminder_time: "07:30", reminder_days: [ 1, 2, 3, 4, 5 ]), as: :json
    end

    assert_response :created
    body = response.parsed_body["routine"]
    assert_equal [ @title, "🧘", "violet", "rain", 10, "07:30", [ 1, 2, 3, 4, 5 ], 0 ],
      body.values_at("title", "emoji", "color", "sound", "duration_minutes", "reminder_time", "reminder_days",
        "sessions_count")
  end

  def test_that_create_rejects_a_duration_under_five_minutes
    sign_in @user

    assert_no_difference "Routine.count" do
      post api_routines_path, params: @params.merge(duration_minutes: 2), as: :json
    end

    assert_response :unprocessable_content
    assert_equal "Duration minutes must be greater than or equal to 5", response.parsed_body["error"]
  end

  def test_that_create_cannot_assign_the_routine_to_another_user
    sign_in @user

    post api_routines_path, params: @params.merge(user_id: @other_routine.user_id), as: :json

    assert_response :created
    assert_equal @user, Routine.find(response.parsed_body["routine"]["id"]).user
  end

  def test_that_create_returns_401_when_signed_out
    post api_routines_path, params: @params, as: :json

    assert_response :unauthorized
  end

  def test_that_user_can_update_their_routine
    sign_in @user

    patch api_routine_path(@routine), params: { title: @title, duration_minutes: 25, reminder_time: nil }, as: :json

    assert_response :ok
    assert_equal [ @title, 25, nil ], @routine.reload.values_at(:title, :duration_minutes, :reminder_time)
  end

  def test_that_update_moves_the_routine_and_saves_its_fields
    newer = create(:routine, user: @user)
    sign_in @user

    assert_no_changes -> { @other_routine.reload.position } do
      patch api_routine_path(newer), params: { title: @title, position: 0 }, as: :json
    end

    assert_response :ok
    assert_equal @title, newer.reload.title
    assert_equal [ newer, @routine ], @user.routines.in_position_order.to_a
  end

  def test_that_update_saves_nothing_with_an_invalid_position
    sign_in @user

    patch api_routine_path(@routine), params: { title: @title, position: -1 }, as: :json

    assert_response :unprocessable_content
    assert_equal "Position must be a whole number of 0 or more", response.parsed_body["error"]
    assert_not_equal @title, @routine.reload.title
  end

  def test_that_update_returns_403_when_moving_another_users_routine
    sign_in @user

    assert_no_changes -> { @other_routine.reload.position } do
      patch api_routine_path(@other_routine), params: { position: 0 }, as: :json
    end

    assert_response :forbidden
  end

  def test_that_update_rejects_an_unknown_emoji
    sign_in @user

    patch api_routine_path(@routine), params: { emoji: "shower-head" }, as: :json

    assert_response :unprocessable_content
    assert_equal "Emoji is not included in the list", response.parsed_body["error"]
  end

  def test_that_update_returns_401_when_signed_out
    patch api_routine_path(@routine), params: { title: @title }, as: :json

    assert_response :unauthorized
  end

  def test_that_update_returns_403_for_another_users_routine
    sign_in @user

    patch api_routine_path(@other_routine), params: { title: @title }, as: :json

    assert_response :forbidden
    assert_not_equal @title, @other_routine.reload.title
  end

  def test_that_destroy_soft_deletes_the_routine_and_keeps_its_sessions
    time_log = create(:time_log, :routine, routine: @routine, started_at: 1.hour.ago, completed_at: 50.minutes.ago,
      accumulated_elapsed_seconds: 600)
    sign_in @user

    delete api_routine_path(@routine)

    assert_response :no_content
    assert @routine.reload.discarded?
    assert time_log.reload.kept?
  end

  def test_that_destroy_returns_401_when_signed_out
    delete api_routine_path(@routine)

    assert_response :unauthorized
  end

  def test_that_destroy_returns_403_for_another_users_routine
    sign_in @user

    delete api_routine_path(@other_routine)

    assert_response :forbidden
    assert @other_routine.reload.kept?
  end

  def test_that_destroy_returns_404_for_a_deleted_routine
    @routine.discard!
    sign_in @user

    delete api_routine_path(@routine)

    assert_response :not_found
  end
end
