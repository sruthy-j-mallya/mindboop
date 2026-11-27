require "test_helper"

class RoutineStepTest < ActiveSupport::TestCase
  def test_that_title_is_required_and_squished
    assert_not build(:routine_step, title: " ").valid?
    assert_equal "Make bed", build(:routine_step, title: "  Make   bed ").title
  end

  def test_that_title_cannot_exceed_the_maximum_length
    assert_not build(:routine_step, title: "a" * (RoutineStep::MAX_TITLE_LENGTH + 1)).valid?
  end

  def test_that_a_routine_is_required
    assert_not build(:routine_step, routine: nil).valid?
  end

  def test_that_position_counts_up_within_a_routine
    routine = create(:routine)

    assert_equal [ 0, 1 ], create_list(:routine_step, 2, routine:).map(&:position)
    assert_equal 0, create(:routine_step).position
  end

  def test_that_routine_steps_are_kept_ones_in_position_order
    routine = create(:routine)
    first, second = create_list(:routine_step, 2, routine:)
    create(:routine_step, routine:).discard!

    second.move_to!(0)

    assert_equal [ second, first ], routine.steps.reload.to_a
  end
end
