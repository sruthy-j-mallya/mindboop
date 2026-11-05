json.extract! task, :id, :title, :description, :estimated_minutes, :is_duration, :is_all_day, :is_completed,
  :starts_at, :ends_at, :created_at, :updated_at
json.checklist_items task.checklist_items, partial: "api/checklist_items/checklist_item", as: :checklist_item
