Rails.application.routes.draw do
  namespace :api, defaults: { format: :json } do
    resource :session, only: %i[ show create destroy ]
    resources :email_confirmations, only: :create
    resource :registration, only: :create
    resources :passwords, param: :token, only: %i[ create update ]
    resources :tasks, only: %i[ index show create update destroy ] do
      resources :checklist_items, only: %i[ create update destroy ]
      resource :restoration, only: :create, controller: "task_restorations"
    end
    resources :task_counts, only: :index
    resources :life_areas, only: %i[ index create update destroy ]
    resources :routines, only: %i[ index create update destroy ] do
      resources :time_logs, only: :index, controller: "routine_time_logs"
    end
    resources :quick_starts, only: :create
    resources :time_logs, only: %i[ create update destroy ] do
      resource :completion, only: :create, controller: "time_log_completions"
      resource :extension, only: :create, controller: "time_log_extensions"
      resource :bail_out, only: :create, controller: "time_log_bail_outs"
      resource :restoration, only: :create, controller: "time_log_restorations"
      resource :break, only: %i[ create update ]
    end
    resource :current_time_log, only: :show
    resources :calendar_events, only: :index
    resource :user_preference, only: %i[ show update ]
    resource :curiosity_time, only: %i[ show create update destroy ]
    resources :parking_lot_items, only: %i[ index create update destroy ] do
      resource :conversion, only: :create, controller: "parking_lot_item_conversions"
      resource :restoration, only: :create, controller: "parking_lot_item_restorations"
    end
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
