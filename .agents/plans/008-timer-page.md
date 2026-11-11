# 008 — Timer page

Status: done
Date: 2026-11-05

## Goal

Make Begin on Quick start create a task and a time log, then open a Timer page that counts down from the time log.

## Decisions

| Area | Choice |
| --- | --- |
| Begin | Two requests from the client: `POST /api/tasks`, then `POST /api/time_logs` with the new task's id. Navigates to `/timer` only when both succeed |
| Failed time log | The new task is deleted (best effort) and the error is shown, so trying again doesn't leave a duplicate task |
| Estimate | Saved as `estimated_minutes` on the task and `timer_preset` on the time log |
| Timer state | Derived from the time log on every tick: `accumulated_elapsed_seconds` plus the time since `current_run_started_at`. Nothing is counted on the client, so a reload keeps the time |
| Finding the session | `GET /api/current_time_log` returns the user's most recently started log that isn't completed or deleted, or `null`. `/timer` has no id so the sidebar link can always reach it |
| Several sessions | Not prevented. Beginning again makes the new log the current one, since there's no way to end a session yet |
| Time running out | The countdown stops at 00:00 and the log stays current until Done is wired |
| Checklist | Read-only on the Timer page, because the API can't change checklist items yet |
| Left for later | Extend, Pause, Bail and Done are rendered but not wired. Parking lot, ambience and the collapse control aren't rendered |
