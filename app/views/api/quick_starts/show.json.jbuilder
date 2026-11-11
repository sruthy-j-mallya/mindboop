json.task do
  json.partial! "api/tasks/task", task: @time_log.task
end
json.time_log do
  json.partial! "api/time_logs/time_log", time_log: @time_log
end
