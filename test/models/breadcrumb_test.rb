require "test_helper"

class BreadcrumbTest < ActiveSupport::TestCase
  def test_that_a_task_is_required
    assert build(:breadcrumb, task: nil).invalid?
  end

  def test_that_restart_description_is_required
    assert build(:breadcrumb, restart_description: " ").invalid?
  end

  def test_that_completed_description_is_optional
    assert build(:breadcrumb, completed_description: nil).valid?
  end

  def test_that_a_blank_completed_description_is_saved_as_nil
    assert_nil create(:breadcrumb, completed_description: "  ").completed_description
  end

  def test_that_the_longest_descriptions_are_allowed
    description = "a" * Breadcrumb::MAX_DESCRIPTION_LENGTH

    assert build(:breadcrumb, completed_description: description, restart_description: description).valid?
  end

  def test_that_descriptions_over_the_limit_are_invalid
    description = "a" * (Breadcrumb::MAX_DESCRIPTION_LENGTH + 1)

    assert build(:breadcrumb, completed_description: description).invalid?
    assert build(:breadcrumb, restart_description: description).invalid?
  end
end
