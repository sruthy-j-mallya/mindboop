# 030 — Timer overrun

Status: done
Date: 2026-11-16

## Goal

When a timer reaches 00:00 and keeps running, show how far past zero it is and let the user end the session with or
without that extra time logged.

## Decisions

| Area | Choice |
| --- | --- |
| Overrun | `getOverrunSeconds` in `utils/timeLogs.ts`: elapsed time past preset + buffer, for a timer only. The clock stays at 00:00 |
| Controls | Once overrun, Extend and Pause are hidden; only Bail and Done remain (two columns) |
| Overrun toggle | `Timer/OverrunToggle`, in place of the "remaining" caption: a pill `+MM:SS extra` that counts up, with `aria-pressed`. Pressed (default) logs the extra time; unpressed strikes it through and logs the session at its planned time. A caption says which |
| API | `discard_overrun` (optional boolean) on `POST …/completion` and `POST …/bail_out`. `TimeLog#complete!(discard_overrun:)` caps `accumulated_elapsed_seconds` at the planned seconds for a timer; default keeps everything, so other callers (Inbox switch) are unchanged |
| Too short | With the extra time left out, the 2-minute minimum is checked against the capped time, so a 1-minute timer still offers only Discard |
| Left for later | Overrun in the mini timer (it shows 00:00); a chime when the timer reaches zero |
