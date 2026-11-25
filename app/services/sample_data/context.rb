module SampleData
  # What the seeders share: one clock, so every relative time lines up, and the records made so far, by key
  # (`context.tasks[:quarterly_report]`), so a later seeder can point at what an earlier one made.
  class Context
    attr_reader :now, :users, :life_areas, :tasks, :routines, :time_logs

    def initialize
      @now = Time.current
      @users = {}
      @life_areas = {}
      @tasks = {}
      @routines = {}
      @time_logs = {}
    end
  end
end
