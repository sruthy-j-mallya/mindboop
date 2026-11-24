# 043 — Task counts

Status: done
Date: 2026-11-24

## Goal

Show how many tasks are in the Inbox and in each area of life, in the areas sidebar.

## Decisions

| Area | Choice |
| --- | --- |
| What counts | Undeleted, incomplete tasks: the ones each list shows. A search doesn't change it |
| Zero | No number |
| Endpoint | `GET /api/task_counts` → `{ task_counts: [{ life_area_id, tasks_count }] }`, in one grouped query. `life_area_id: null` is the Inbox |
| Refresh | `QUERY_KEYS.TASKS.COUNTS` sits under `TASKS.LISTS`, so whatever refreshes the task lists refreshes the counts |
| Accessibility | The count describes the link ("3 tasks"), so its name stays the area's |
