class UserPreferencePolicy < ApplicationPolicy
  def show?
    owner?
  end

  def update?
    owner?
  end

  private
    def owner?
      record.user_id == user.id
    end
end
