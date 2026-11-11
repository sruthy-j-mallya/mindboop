# 007 — Time logs

Status: done
Date: 2026-11-05

## Goal

Add time logs for tasks to the backend, and a CRUD API with TanStack Query hooks for the frontend. No UI yet.

## Decisions

| Area | Choice |
| --- | --- |
| Schema | Adapted from a SQLite reference: `TEXT` ids become `uuid`, `is_running` becomes `boolean`, `TEXT` dates and the `INTEGER` `current_run_started_at` become `datetime`, `deleted_at` becomes Discard's `discarded_at`. `task_id` gets a foreign key |
| Mode | `enum` on a string column: `timer` or `stopwatch`. The reference didn't list its values, so these are inferred from the nullable `timer_preset` |
| Timer preset | Whole minutes, matching `TIMER_PRESETS` in `QuickStart/constants.ts`. Only checked to be positive, since custom values are allowed |
| Ownership | Through the task, with no `user_id` on the table. The policy scope joins `tasks` |
| Routes | Flat `/api/time_logs`, with an optional `task_id` filter on the list and `task_id` required on create |
| Moving logs | `task_id` is read only on create, so a time log can't move to another task |
| Delete | Discard gem. `DELETE /api/time_logs/:id` discards the time log. Destroying a task removes its time logs for real |
| Deleted tasks | Discarding a task keeps its time logs in the database, but they leave the list and return 404 (`TimeLog.active`). `useDeleteTask` invalidates the time log lists too |
| Timer state | The client owns it and writes it through `PATCH`; the server doesn't derive elapsed time or enforce one running log |
