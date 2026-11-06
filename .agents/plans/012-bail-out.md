# 012 — Bail out of a session

Status: done
Date: 2026-11-06

## Goal

Make Bail on the Timer page end the running session and save breadcrumbs, so the task can be picked up again later.

## Decisions

| Area | Choice |
| --- | --- |
| Schema | `breadcrumbs` belongs to a task, with `completed_description` and `restart_description`. Only the restart one is required, since nothing may have got done. Each up to 1000 characters |
| Endpoint | `POST /api/time_logs/:time_log_id/bail_out`. A new resource, handled by `TimeLogs::BailerService`. Authorized with `TimeLogPolicy#update?` |
| Ending the log | Same as completing it (stops the clock, ends any open break, sets `completed_at`), so it stops being the current log and can't be paused or extended |
| Not a finish | `time_logs.is_bailed_out` keeps a bailed log from counting as finished early. The task stays open and no achievement is awarded |
| Repeats | Bailing out of an ended log changes nothing and returns it, as completing does, so there is no second breadcrumb |
| Under 2 minutes of focus | Bail warns instead of asking for breadcrumbs, and confirming soft-deletes the log with the existing `DELETE /api/time_logs/:id`. No breadcrumb is saved and the task stays open. Checked on the client when Bail is clicked, and breaks don't count towards the 2 minutes |
| Afterwards | The Timer page falls back to "Nothing on the clock" |
| Left for later | Showing breadcrumbs anywhere, and a way back to the open task. Nothing reads them yet |
