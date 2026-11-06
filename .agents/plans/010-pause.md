# 010 — Pause a session

Status: done
Date: 2026-11-06

## Goal

Make Pause on the Timer page record a plan for the break (what and how long), pause the time log, and ring an alarm if the
user isn't back in time.

## Decisions

| Area | Choice |
| --- | --- |
| Schema | `breaks` table: `time_log_id`, `intention`, `duration_minutes`, `ends_at`, `ended_at`. A partial unique index allows one open break per time log |
| Limit | 1–15 whole minutes, checked on the client and the server |
| Endpoints | `POST` and `PATCH /api/time_logs/:time_log_id/break`, a singular resource for the current break. Both return the time log. Authorized with `TimeLogPolicy#update?`, because a break is only reached through its time log |
| Timer state | The server pauses and resumes the log in one locked transaction, instead of the client writing it through `PATCH /api/time_logs/:id` |
| Repeated requests | Pausing during a break or resuming with no open break changes nothing, so a double click can't count twice |
| Done during a break | Completing the log closes the break, so it can't ring on a finished session |
| Alarm source of truth | `ends_at` on the server. The client derives the alarm state from it, so a reload or route change keeps the alarm |
| Alarm location | `BreakAlarm` in `AppLayout`, so it runs on every signed-in page. Outside the Timer page it also shows a banner with I'm back once the break is over |
| Alarm behaviour | Rings for one minute from `ends_at`, then goes quiet and shows a desktop notification. The timer stays paused until I'm back is pressed |
| Timing | One-shot `setTimeout` to the next alarm change, rechecked when the tab regains focus. Not a ticking interval, which browsers throttle harder in hidden tabs |
| Sound | Web Audio, unlocked by the Pause click and by the next click or key press after a reload. No audio file |
| Notification | Permission is requested when pressing Pause & set reminder. Denying it doesn't block pausing. Closed by I'm back. Skipped if the page opens after the ringing minute has passed, since the user is already looking at the page |
| Left for later | Alarm with the tab closed, on an inactive page or on other devices (Web Push + a Solid Queue job). `ends_at` is already what such a job would need. Extend and Bail are still not wired |
