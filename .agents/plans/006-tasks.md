# 006 — Tasks and checklist items

Status: done
Date: 2026-11-05

## Goal

Add tasks with checklist items to the backend, and a CRUD API with TanStack Query hooks for the frontend. No UI yet.

## Decisions

| Area | Choice |
| --- | --- |
| Schema | Adapted from a SQLite reference: `TEXT` ids become `uuid`, `INTEGER` flags become `boolean`, `TEXT` dates become `datetime` |
| Ownership | Added `tasks.user_id`, which the reference didn't have, so Pundit can limit tasks to their owner |
| Ids | UUID primary keys on all app tables, server-generated with `gen_random_uuid()`; clients can't supply them. `users` and `sessions` were converted in place, keeping their rows. `ApplicationRecord` orders `.first`/`.last` by `created_at`, since UUIDs aren't sequential |
| Solid Queue | Stays on `bigint`: it orders jobs by `job_id`, so random ids would break FIFO, and the gem owns those tables |
| Delete | Discard gem. `DELETE /api/tasks/:id` discards the task and keeps the checklist items. Discarded tasks return 404. Destroying a user removes their tasks for real |
| Checklist items | Returned with the task on index and show (eager loaded). Created with the task through nested `checklist_items_attributes` on `POST /api/tasks` only. No other write endpoints yet |
| 404s | `Api::BaseController` now renders `ActiveRecord::RecordNotFound` as `{ error }`, as `docs/api.md` documents |
| Pagination | Pagy offset pagination on `GET /api/tasks`, at its default 20 per page with no client-set limit. Ordered by `created_at`, then `id`, so pages stay stable |
