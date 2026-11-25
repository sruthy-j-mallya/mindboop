module SampleData
  # Fills the database with sample users whose data covers every scenario the app has, so a new developer can sign in
  # and see each screen with something on it. `bin/setup` runs it through `bin/rails sample_data:load`.
  #
  # Each seeder handles one resource, in the order below: later ones point at the records earlier ones made, through
  # the shared Context. The sample users are replaced on every run, so it can run again at any time and the dates stay
  # relative to today.
  class SeederService
    SEEDERS = [
      Seeders::UsersSeeder,
      Seeders::UserPreferencesSeeder,
      Seeders::LifeAreasSeeder,
      Seeders::TasksSeeder,
      Seeders::ChecklistItemsSeeder,
      Seeders::RoutinesSeeder,
      Seeders::TimeLogsSeeder,
      Seeders::BreaksSeeder,
      Seeders::BreadcrumbsSeeder,
      Seeders::ParkingLotItemsSeeder,
      Seeders::AchievementsSeeder
    ].freeze

    # Returns the Context, holding every record made by key.
    def process!
      raise "Sample data is for development only; it replaces the sample users." if Rails.env.production?

      context = Context.new
      ActiveRecord::Base.transaction do
        SEEDERS.each { |seeder| seeder.new(context).process! }
      end
      context
    end
  end
end
