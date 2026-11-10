Rails.application.routes.draw do
  namespace :api, defaults: { format: :json } do
    resource :session, only: %i[ show create destroy ]
    resources :email_confirmations, only: :create
    resource :registration, only: :create
    resources :passwords, param: :token, only: %i[ create update ]
    resources :tasks, only: %i[ index show create update destroy ]
    resources :time_logs, only: %i[ create destroy ] do
      resource :completion, only: :create, controller: "time_log_completions"
      resource :extension, only: :create, controller: "time_log_extensions"
      resource :bail_out, only: :create, controller: "time_log_bail_outs"
      resource :break, only: %i[ create update ]
    end
    resource :current_time_log, only: :show
  end

  # Reveal health status on /up that returns 200 if the app boots with no exceptions, otherwise 500.
  # Can be used by load balancers and uptime monitors to verify that the app is live.
  get "up" => "rails/health#show", as: :rails_health_check

  # Rendered by React; named so mailers can link to it.
  get "passwords/:token/edit", to: "spa#show", as: :edit_password
  get "signup/:token", to: "spa#show", as: :complete_signup

  root "spa#show"
  get "*path", to: "spa#show", constraints: ->(req) { req.format.html? && !req.path.start_with?("/rails/") }
end
