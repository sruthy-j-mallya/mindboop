if @time_log
  json.time_log do
    json.partial! "api/time_logs/time_log", time_log: @time_log
  end
else
  json.time_log nil
end
