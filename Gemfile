source "https://rubygems.org"

# Use Active Model has_secure_password [https://guides.rubyonrails.org/active_model_basics.html#securepassword]
gem "bcrypt", "~> 3.1.7"
# Reduces boot times through caching; required in config/boot.rb
gem "bootsnap", require: false
# Use Active Storage variants [https://guides.rubyonrails.org/active_storage_overview.html#transforming-images]
gem "image_processing", "~> 1.2"
# JSON views for the API [https://github.com/rails/jbuilder]
gem "jbuilder", "~> 2.15"
# Use postgresql as the database for Active Record
gem "pg", "~> 1.1"
# Use the Puma web server [https://github.com/puma/puma]
gem "puma", ">= 5.0"
# Authorization policies [https://github.com/varvet/pundit]
gem "pundit", "~> 2.5"
# Bundle edge Rails instead: gem "rails", github: "rails/rails", branch: "main"
gem "rails", "~> 8.1.4"
# Production mail through Resend's HTTP API [https://resend.com/docs/send-with-rails]
gem "resend", "~> 1.0"
# Database-backed Active Job backend [https://github.com/rails/solid_queue]
gem "solid_queue", "~> 1.7"
# Windows does not include zoneinfo files, so bundle the tzinfo-data gem
gem "tzinfo-data", platforms: %i[ windows jruby ]
# Vite integration for the React frontend [https://vite-ruby.netlify.app/]
gem "vite_rails", "~> 3.11"

group :development, :test do
  # Static analysis for security vulnerabilities [https://brakemanscanner.org/]
  gem "brakeman", require: false
  # Audits gems for known security defects (use config/bundler-audit.yml to ignore issues)
  gem "bundler-audit", require: false
  # See https://guides.rubyonrails.org/debugging_rails_applications.html#debugging-with-the-debug-gem
  gem "debug", platforms: %i[ mri windows ], require: "debug/prelude"
  gem "factory_bot_rails", "~> 6.5"
  # Fake test data [https://github.com/faker-ruby/faker]
  gem "faker"
  # Omakase Ruby styling [https://github.com/rails/rubocop-rails-omakase/]
  gem "rubocop-rails-omakase", require: false
end

group :development do
  # Preview mail in the browser instead of sending it [https://github.com/ryanb/letter_opener]
  gem "letter_opener"
  # Use console on exceptions pages [https://github.com/rails/web-console]
  gem "web-console"
end
