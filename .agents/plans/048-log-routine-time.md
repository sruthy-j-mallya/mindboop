# 048 — Log a routine's time by hand

Status: done
Date: 2026-11-25

## Goal

Clicking a day in a routine's month grid logs time spent on it that day, without running its timer.

## Decisions

| Area | Choice |
| --- | --- |
| Days | Any day up to today, in any month, done or not (a done day gets another session). Future days are disabled |
| Dialog | Start time and minutes. Minutes default to the routine's duration; the start to 9:00, or today to that long before now |
| Server | `POST /api/time_logs` with `mode: "manual"` and `routine_id`. The 24-hour limit doesn't apply when logging on a routine without a task; moving a log keeps it. No overlaps and no future times, as for any log |
| Out of scope | Deleting from the grid: the Calendar already does it |
