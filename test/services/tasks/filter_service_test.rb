require "test_helper"

class Tasks::FilterServiceTest < ActiveSupport::TestCase
  def setup
    @open_task = create(:task, title: "Write the quarterly report")
    @completed_task = create(:task, title: "Book a dentist appointment", is_completed: true)
  end

  def test_that_the_scope_is_returned_unchanged_without_filters
    assert_equal [ @open_task, @completed_task ].sort_by(&:id), filter({}).sort_by(&:id)
  end

  def test_that_tasks_can_be_filtered_by_completion
    assert_equal [ @open_task ], filter(is_completed: "false").to_a
    assert_equal [ @completed_task ], filter(is_completed: "true").to_a
  end

  def test_that_tasks_can_be_searched_by_part_of_the_title_ignoring_case
    assert_equal [ @open_task ], filter(search_term: "  QUARTERLY ").to_a
  end

  def test_that_like_wildcards_in_the_search_term_are_matched_literally
    assert_empty filter(search_term: "%").to_a
  end

  def test_that_filters_combine
    assert_empty filter(search_term: "dentist", is_completed: "false").to_a
  end

  private
    def filter(filters)
      Tasks::FilterService.new(Task.all, filters).process
    end
end
