require "test_helper"

class Api::TaskCountsControllerTest < ActionDispatch::IntegrationTest
  def setup
    @user = create(:user)
    @life_area = create(:life_area, user: @user)
  end

  def test_that_index_returns_401_when_signed_out
    get api_task_counts_path

    assert_response :unauthorized
  end

  def test_that_index_counts_the_tasks_in_the_inbox_and_each_area
    create_list(:task, 2, user: @user)
    create_list(:task, 3, user: @user, life_area: @life_area)

    assert_equal({ nil => 2, @life_area.id => 3 }, fetch_counts)
  end

  def test_that_index_leaves_out_completed_and_deleted_tasks
    create(:task, user: @user, life_area: @life_area)
    create(:task, user: @user, life_area: @life_area, is_completed: true)
    create(:task, user: @user, life_area: @life_area).discard!

    assert_equal({ @life_area.id => 1 }, fetch_counts)
  end

  def test_that_index_leaves_out_other_users_tasks
    create(:task)
    create(:task, life_area: create(:life_area, user: @user), user: @user)
    other_life_area = create(:life_area)
    create(:task, user: other_life_area.user, life_area: other_life_area)

    assert_equal [ 1 ], fetch_counts.values
  end

  def test_that_index_is_empty_without_tasks
    assert_empty fetch_counts
  end

  private
    def fetch_counts
      sign_in @user
      get api_task_counts_path

      assert_response :ok
      response.parsed_body["task_counts"].to_h { |count| count.values_at("life_area_id", "tasks_count") }
    end
end
