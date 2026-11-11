json.tasks @tasks, partial: "api/tasks/task", as: :task
json.tasks_count @pagy.count
json.page @pagy.page
json.total_pages @pagy.last
