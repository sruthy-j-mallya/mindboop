require "test_helper"

class LifeAreaTest < ActiveSupport::TestCase
  def setup
    @life_area = create(:life_area)
  end

  def test_that_name_is_required
    @life_area.name = " "

    assert_not @life_area.valid?
    assert_includes @life_area.errors[:name], "can't be blank"
  end

  def test_that_name_is_squished
    @life_area.update!(name: "  Side   projects ")

    assert_equal "Side projects", @life_area.name
  end

  def test_that_name_cannot_exceed_the_maximum_length
    @life_area.name = "a" * (LifeArea::MAX_NAME_LENGTH + 1)

    assert_not @life_area.valid?
  end

  def test_that_names_are_unique_per_user_ignoring_case
    duplicate = build(:life_area, user: @life_area.user, name: @life_area.name.upcase)
    other_users = build(:life_area, name: @life_area.name)

    assert_not duplicate.valid?
    assert_includes duplicate.errors[:name], "has already been taken"
    assert other_users.valid?
  end

  def test_that_color_icon_and_sound_must_be_known
    @life_area.assign_attributes(color: "plaid", icon: "rocket-ship", default_sound: "thunder")

    assert_not @life_area.valid?
    assert_equal %i[ color icon default_sound ], @life_area.errors.attribute_names
  end

  def test_that_the_default_sound_is_none
    assert_equal "none", @life_area.default_sound
  end

  def test_that_destroying_an_area_sends_its_tasks_to_the_inbox
    task = create(:task, user: @life_area.user, life_area: @life_area)
    deleted_task = create(:task, user: @life_area.user, life_area: @life_area, discarded_at: Time.current)

    @life_area.destroy!

    assert_nil task.reload.life_area_id
    assert_nil deleted_task.reload.life_area_id
  end

  def test_that_areas_are_listed_oldest_first
    newer = create(:life_area, user: @life_area.user)

    assert_equal [ @life_area, newer ], @life_area.user.life_areas.in_created_order.to_a
  end
end
