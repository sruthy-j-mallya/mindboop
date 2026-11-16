# 027 — Start a timer from the Timer page

Status: done
Date: 2026-11-16

## Goal

With nothing on the clock, let the Timer page start a session on an existing task (a timer or a stopwatch) instead of
sending the user to Quick Start.

## Decisions

| Area | Choice |
| --- | --- |
| Layout | The setup reuses the session's card (`Timer/SessionCard`): the clock side holds the task search, Stopwatch / Timer tabs, the dial and Start; the other side shows the picked task's steps and description (`Timer/TaskDetails`, shared with `Session`), editable as mid-session |
| Tasks | A search combobox (`Timer/Setup/TaskSearch`), not a select, so a long Inbox stays reachable. Focus lists the open tasks; typing searches titles on the server with `GET /api/tasks?is_completed=false&search_term=…` (case-insensitive substring, `%`/`_` literal), debounced 250 ms, keeping the previous matches while the next load. Arrows move the highlight, Enter picks (only once the matches for what's typed have loaded), Escape closes and keeps the picked task. One page (20) of matches, with a "keep typing" note when there are more. With no open tasks, it links to the Inbox |
| Modes | Timer is the default, preset 5 minutes. The minutes are edited in place on the dial: digits only, 1–240, applied on blur or Enter; blank or zero puts the last value back, Escape too, and more than 240 is capped. A stopwatch shows a static 00:00 |
| Start | `POST /api/time_logs` (unchanged). `useCreateTimeLog` seeds the current time log, so the page swaps to the running session and the parking lot. A stopwatch is sent without `timer_preset` |
| Running stopwatch | The clock (`Timer/Clock`, was `Countdown`) counts up with an "elapsed" caption and no progress arc (`Dial` draws none without `progress`; at 0 its round cap would show a dot), on the setup tab too. Extend is hidden, as the API rejects extending a stopwatch |
| Heading | The page's heading with nothing on the clock is now "Start a session" (was "Nothing on the clock" with a link to Quick Start) |
| Finished dialog | "Move on to next" (to Quick Start) is gone. While anything is parked (`GET /api/parking_lot_items?status=parked`, any session) it shows "Review parking lot · N", linking to `/parking-lot`. Otherwise it fades away by itself after 4 seconds (a slower 700 ms fade-out), waiting while the pointer is over it; the X and Escape still close it at once. The parent drops it once the fade-out ends (`onCloseAutoFocus`) |
| Minimum to log | A session needs 2 minutes of focus (breaks don't count) to be logged, timer or stopwatch. The server enforces it: `TimeLog::MIN_LOGGED_MINUTES` with a `long_enough_to_log` validation in the `:end` context, run by `complete!` (so completion and bail-out both get a 422 and change nothing). On the client, Done under 2 minutes opens the discard dialog, as Bail already did (`DISCARD_BELOW_MINUTES` mirrors the server constant). E2E specs reach 2 minutes by backdating the session on the server (`backdateSession` in `e2e/helpers.ts`), since the browser clock doesn't move the server's |
| Left for later | Scrolling past the first 20 matches; prefilling the minutes from the task's estimate |
