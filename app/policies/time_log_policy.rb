class TimeLogPolicy < ApplicationPolicy
  def index?
    true
  end

  def create?
    owner?
  end

  def update?
    owner?
  end

  def destroy?
    owner?
  end

  class Scope < ApplicationPolicy::Scope
    def resolve
      scope.where(user:)
    end
  end

  private
    # A log's task or routine, when it has one, must be the user's too.
    def owner?
      record.user_id == user.id &&
        (record.task.nil? || record.task.user_id == user.id) &&
        (record.routine.nil? || record.routine.user_id == user.id)
    end
end
