module Api
  # Which first steps the user has taken, for the checklist a new account sees on Home. Deleted tasks and areas count, as
  # they show the step is known.
  class OnboardingsController < BaseController
    # Only looks at the caller's own records, through their policy scopes, so there is no record to authorize.
    skip_after_action :verify_authorized

    def show
      @has_life_areas = policy_scope(LifeArea).exists?
      @has_tasks = policy_scope(Task).exists?
      @has_sessions = policy_scope(TimeLog).kept.exists?
    end
  end
end
