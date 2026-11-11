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
      scope.joins(:task).where(tasks: { user_id: user.id })
    end
  end

  private
    def owner?
      record.task.user_id == user.id
    end
end
