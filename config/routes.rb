Rails.application.routes.draw do
  namespace :api, defaults: { format: :json } do
    resource :session, only: %i[ show create destroy ]
    resource :registration, only: :create
    resources :passwords, param: :token, only: %i[ create update ]
  end

  # Reveal health status on /up that returns 200 if the app boots with no exceptions, otherwise 500.
  # Can be used by load balancers and uptime monitors to verify that the app is live.
  get "up" => "rails/health#show", as: :rails_health_check

  # Rendered by React; named so mailers can link to it.
  get "passwords/:token/edit", to: "spa#show", as: :edit_password

  root "spa#show"
  get "*path", to: "spa#show", constraints: ->(req) { req.format.html? && !req.path.start_with?("/rails/") }
end
