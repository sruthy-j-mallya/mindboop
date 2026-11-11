# 013 — Quick start endpoint

Status: done
Date: 2026-11-11

## Goal

Make Begin on the Quick Start page create the task and its running timer in one request and one transaction, instead of
two client calls with a compensating delete when the second one fails.

## Decisions

| Area | Choice |
| --- | --- |
| Endpoint | `POST /api/quick_starts`, a new resource (`Api::QuickStartsController#create`) handled by `QuickStarts::CreatorService`. `POST /api/tasks` and `POST /api/time_logs` stay as they are, for creating a standalone task or starting a timer on an existing task later |
| Body | `title`, `description`, `estimated_minutes` and `checklist_items_attributes`. The other task fields (completion, scheduling) don't make sense for a task you're starting now, and no time log fields are taken |
| Time log | Always a `timer`, with `timer_preset` taken from the task's `estimated_minutes`, so the client no longer copies one into the other |
| Estimate | Required here (a timer needs a target), through a `:quick_start` validation context on `Task`. `POST /api/tasks` still allows a task without one |
| Atomicity | The service creates both records in one transaction, so a failure in either saves nothing and the client has nothing to clean up |
| Start fields | `TimeLog#start` sets `is_running`, `started_at` and `current_run_started_at`, shared by both create endpoints instead of living in `TimeLogsController` |
| Authorization | `TaskPolicy#create?`. The time log's task is created for the signed-in user in the same request, so it can't belong to anyone else |
| Response | 201 `{ task, time_log }`. `useCreateQuickStart` seeds the task detail and the current time log, and invalidates the task lists |
