require "test_helper"

class UserPreferenceTest < ActiveSupport::TestCase
  def setup
    @user_preference = build(:user_preference)
  end

  def test_that_a_new_preference_uses_the_defaults
    assert_equal "system", @user_preference.theme
    assert_equal "rising", @user_preference.completion_sound
    assert_equal "classic", @user_preference.break_alarm_sound
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

  def test_that_a_user_has_only_one_preference
    create(:user_preference, user: @user_preference.user)

    assert_raises(ActiveRecord::RecordNotUnique) { @user_preference.save! }
  end
end
