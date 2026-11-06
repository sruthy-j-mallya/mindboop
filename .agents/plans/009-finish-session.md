# 009 — Finish a session

Status: done
Date: 2026-11-05

## Goal

Make Done on the Timer page end the session, mark its task as done and count an early finish.

## Decisions

| Area | Choice |
| --- | --- |
| Endpoint | `POST /api/time_logs/:time_log_id/completion`, a new resource instead of a custom action. Authorized with `TimeLogPolicy#update?` |
| Workflow | `TimeLogs::CompleterService` updates the time log, task and achievement in one transaction, with the time log row locked |
| Repeated requests | Completing a completed log changes nothing, so a double click or second tab can't count twice |
| Elapsed time | Worked out on the server when Done is pressed, and not capped at the preset |
| Early finish | A `timer` log with a `timer_preset` and less elapsed time than the preset. Exactly on the preset isn't early. A stopwatch never is |
| Achievements | `achievements` table with one row per user and `kind`, and a `count`. `early_finish` is the only kind so far. No read endpoint yet |
| Dialog | Rendered from `Timer`, not `Session`, because `Session` unmounts once the log stops being current. Its state is the mutation's `data` |
| Not finished early | The same dialog titled "Finished!", without the boost card |
| Move on to next | Links to Quick start. Replaces the design's "Review parking lot" |
| Left for later | "Add a progress screenshot" is rendered but not wired. Extend, Pause and Bail are still not wired |
