json.extract! task, :id, :title, :description, :estimated_minutes, :is_duration, :is_all_day, :is_completed,
  :starts_at, :ends_at, :life_area_id, :created_at, :updated_at
# Only the list of deleted tasks shows any.
json.discarded_at task.discarded_at if task.discarded?
json.checklist_items task.checklist_items, partial: "api/checklist_items/checklist_item", as: :checklist_item
json.breadcrumbs task.breadcrumbs, partial: "api/breadcrumbs/breadcrumb", as: :breadcrumb
