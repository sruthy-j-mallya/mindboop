ENV["RAILS_ENV"] ||= "test"
require_relative "../config/environment"
require "rails/test_help"

Rails.root.glob("test/support/**/*.rb").sort.each { |file| require file }

module ActiveSupport
  class TestCase
    include FactoryBot::Syntax::Methods

    parallelize(workers: :number_of_processors)
  end
end

module ActionDispatch
  class IntegrationTest
    include AuthHelpers
  end
end
