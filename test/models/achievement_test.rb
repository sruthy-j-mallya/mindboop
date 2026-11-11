require "test_helper"

class AchievementTest < ActiveSupport::TestCase
  def test_that_count_starts_at_zero
    assert_equal 0, create(:achievement).count
  end

  def test_that_an_unknown_kind_is_invalid
    assert_not build(:achievement, kind: "unknown").valid?
  end

  def test_that_a_negative_count_is_invalid
    assert_not build(:achievement, count: -1).valid?
  end

  def test_that_a_user_has_one_row_per_kind
    achievement = create(:achievement)

    assert_raises(ActiveRecord::RecordNotUnique) { create(:achievement, user: achievement.user) }
  end
end
