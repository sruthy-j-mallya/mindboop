# Serves the React app shell; React Router handles client-side routes.
class SpaController < ApplicationController
  allow_unauthenticated_access

  def show
  end
end
