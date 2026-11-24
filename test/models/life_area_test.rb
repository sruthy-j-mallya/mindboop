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

  def test_that_color_emoji_and_sound_must_be_known
    @life_area.assign_attributes(color: "plaid", emoji: "briefcase", default_sound: "thunder")

    assert_not @life_area.valid?
    assert_equal %i[ color emoji default_sound ], @life_area.errors.attribute_names
  end

  def test_that_emojis_outside_the_list_and_several_emojis_are_rejected
    [ nil, "", "💀", "💼💼", "💼\n" ].each do |emoji|
      @life_area.emoji = emoji

      assert_not @life_area.valid?, "#{emoji.inspect} should be invalid"
    end
  end

  def test_that_listed_emojis_of_several_code_points_are_kept_whole
    [ "💼", "❤️", "🧑‍💻" ].each do |emoji|
      @life_area.update!(emoji:)

      assert_equal emoji, @life_area.reload.emoji
    end
  end

  def test_that_each_emoji_is_listed_once
    assert_equal LifeArea::EMOJIS.uniq, LifeArea::EMOJIS
  end

  def test_that_the_default_sound_is_none
    assert_equal "none", @life_area.default_sound
  end

  def test_that_a_deleted_areas_name_can_be_used_again
    @life_area.discard!

    assert create(:life_area, user: @life_area.user, name: @life_area.name).persisted?
  end

  def test_that_a_new_area_goes_last_within_its_user
    newer = create(:life_area, user: @life_area.user)

    assert_equal [ 0, 1 ], [ @life_area, newer ].map(&:position)
    assert_equal 0, create(:life_area).position
  end

  def test_that_a_new_area_goes_after_a_deleted_one
    @life_area.discard!

    assert_equal 1, create(:life_area, user: @life_area.user).position
  end

  def test_that_move_to_moves_an_area_up_and_down
    second, third = create_list(:life_area, 2, user: @life_area.user)

    third.move_to!(0)

    assert_equal [ third, @life_area, second ], ordered_areas

    third.move_to!(1)

    assert_equal [ @life_area, third, second ], ordered_areas
  end

  def test_that_move_to_clamps_an_index_past_the_end
    second = create(:life_area, user: @life_area.user)

    @life_area.move_to!(10)

    assert_equal [ second, @life_area ], ordered_areas
  end

  def test_that_move_to_skips_deleted_areas
    deleted, third, fourth = create_list(:life_area, 3, user: @life_area.user)
    deleted.discard!

    fourth.move_to!(1)

    assert_equal [ @life_area, fourth, third ], ordered_areas
    assert_equal 1, deleted.reload.position
  end

  def test_that_move_to_rejects_an_invalid_index
    [ -1, "first", nil ].each do |index|
      assert_raises(ActiveRecord::RecordInvalid) { @life_area.move_to!(index) }
    end
  end

  private
    def ordered_areas
      @life_area.user.life_areas.kept.in_position_order.to_a
    end
end
