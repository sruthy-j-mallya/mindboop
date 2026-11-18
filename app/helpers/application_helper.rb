module ApplicationHelper
  # The signed-in user's saved theme, so the layout can apply it before first paint. Signed out, the OS decides.
  def theme_preference
    (authenticated? && Current.user.preference&.theme) || "system"
  end
end
