namespace :sample_data do
  desc "Replace the sample users and their data (development only). bin/setup runs it."
  task load: :environment do
    SampleData::SeederService.new.process!

    password = SampleData::Seeders::UsersSeeder::PASSWORD
    puts "Sample data loaded. Sign in with password #{password} as:"
    SampleData::Seeders::UsersSeeder::EMAIL_ADDRESSES.each_value { |email_address| puts "  #{email_address}" }
  end
end
