class TaskPolicy < ApplicationPolicy
  def index?
    true
  end

  def show?
    owner?
  end

  def create?
    true
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
    def owner?
      record.user_id == user.id
    end
end
