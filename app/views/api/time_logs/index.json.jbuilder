json.time_logs @time_logs, partial: "api/time_logs/time_log", as: :time_log
json.time_logs_count @pagy.count
json.page @pagy.page
json.total_pages @pagy.last
