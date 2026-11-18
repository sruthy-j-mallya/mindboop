module Api
  class UserPreferencesController < BaseController
    before_action :set_user_preference

    def show
    end

    def update
      @user_preference.update!(user_preference_params)
      render :show
    end

    private
      def set_user_preference
        @user_preference = Current.user.preference || Current.user.build_preference
        authorize @user_preference
      end

      def user_preference_params
        params.permit(:theme, :completion_sound, :break_alarm_sound)
      end
  end
end
