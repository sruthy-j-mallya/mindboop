require "test_helper"

class LifeAreas::DiscarderServiceTest < ActiveSupport::TestCase
  def setup
    @user = create(:user)
    @life_area = create(:life_area, user: @user)
    @target = create(:life_area, user: @user)
    @task = create(:task, user: @user, life_area: @life_area)
    @completed_task = create(:task, user: @user, life_area: @life_area, is_completed: true)
    @deleted_task = create(:task, user: @user, life_area: @life_area, discarded_at: Time.current)
  end

  def test_that_the_area_is_soft_deleted
    assert_no_difference "LifeArea.count" do
      LifeAreas::DiscarderService.new(@life_area).process!
    end

    assert @life_area.reload.discarded?
  end

  def test_that_only_uncompleted_tasks_move_to_the_given_area
    LifeAreas::DiscarderService.new(@life_area, tasks_life_area: @target).process!

    assert_equal @target, @task.reload.life_area
    assert_equal @life_area, @completed_task.reload.life_area
    assert_equal @life_area, @deleted_task.reload.life_area
  end

  def test_that_only_uncompleted_tasks_go_to_the_inbox_without_an_area
    LifeAreas::DiscarderService.new(@life_area).process!

    assert_nil @task.reload.life_area_id
    assert_equal @life_area, @completed_task.reload.life_area
    assert_equal @life_area, @deleted_task.reload.life_area
  end

  def test_that_tasks_in_other_areas_stay_put
    other_area = create(:life_area, user: @user)
    other_task = create(:task, user: @user, life_area: other_area)

    LifeAreas::DiscarderService.new(@life_area, tasks_life_area: @target).process!

    assert_equal other_area, other_task.reload.life_area
  end
end
