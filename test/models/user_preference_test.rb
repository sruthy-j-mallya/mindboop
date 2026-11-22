require "test_helper"

class UserPreferenceTest < ActiveSupport::TestCase
  def setup
    @user_preference = build(:user_preference)
  end

  def test_that_a_new_preference_uses_the_defaults
    assert_equal "system", @user_preference.theme
    assert_equal "rising", @user_preference.completion_sound
    assert_equal "classic", @user_preference.break_alarm_sound
    assert_equal 1, @user_preference.week_starts_on
    assert @user_preference.valid?
  end

  def test_that_an_unknown_theme_is_invalid
    @user_preference.theme = "sepia"

    assert_not @user_preference.valid?
    assert_includes @user_preference.errors[:theme], "is not included in the list"
  end

  def test_that_an_unknown_completion_sound_is_invalid
    @user_preference.completion_sound = "kazoo"

    assert_not @user_preference.valid?
    assert_includes @user_preference.errors[:completion_sound], "is not included in the list"
  end

  def test_that_an_unknown_break_alarm_sound_is_invalid
    @user_preference.break_alarm_sound = "siren"

    assert_not @user_preference.valid?
    assert_includes @user_preference.errors[:break_alarm_sound], "is not included in the list"
  end

  def test_that_any_day_of_the_week_can_start_the_week
    UserPreference::WEEK_START_DAYS.each do |day|
      @user_preference.week_starts_on = day

      assert @user_preference.valid?, "expected #{day} to be valid"
    end
  end

  def test_that_a_week_start_outside_the_week_is_invalid
    @user_preference.week_starts_on = 7

    assert_not @user_preference.valid?
    assert_includes @user_preference.errors[:week_starts_on], "must be in 0..6"
  end

  def test_that_a_week_start_that_is_not_a_whole_number_is_invalid
    @user_preference.week_starts_on = "monday"

    assert_not @user_preference.valid?
    assert_includes @user_preference.errors[:week_starts_on], "is not a number"
  end

  def test_that_a_user_has_only_one_preference
    create(:user_preference, user: @user_preference.user)

    assert_raises(ActiveRecord::RecordNotUnique) { @user_preference.save! }
  end
end
