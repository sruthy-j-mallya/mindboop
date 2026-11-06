require "test_helper"

class BreakTest < ActiveSupport::TestCase
  def test_that_ends_at_is_set_from_the_duration
    freeze_time do
      assert_equal 5.minutes.from_now, create(:break, duration_minutes: 5).ends_at
    end
  end

  def test_that_the_longest_break_is_allowed
    assert build(:break, duration_minutes: Break::MAX_DURATION_MINUTES).valid?
  end

  def test_that_a_break_longer_than_the_limit_is_invalid
    assert build(:break, duration_minutes: Break::MAX_DURATION_MINUTES + 1).invalid?
  end

  def test_that_duration_must_be_positive_and_whole
    assert build(:break, duration_minutes: 0).invalid?
    assert build(:break, duration_minutes: "1.5").invalid?
    assert build(:break, duration_minutes: nil).invalid?
  end

  def test_that_intention_is_required_and_limited
    assert build(:break, intention: " ").invalid?
    assert build(:break, intention: "a" * (Break::MAX_INTENTION_LENGTH + 1)).invalid?
  end

  def test_that_a_completed_time_log_cannot_get_a_break
    break_record = build(:break, time_log: create(:time_log, completed_at: Time.current))

    assert break_record.invalid?
    assert_includes break_record.errors.full_messages, "This session is already finished."
  end

  def test_that_a_time_log_cannot_have_two_open_breaks
    time_log = create(:time_log)
    create(:break, time_log:)

    assert_raises(ActiveRecord::RecordNotUnique) { create(:break, time_log:) }
  end
end
