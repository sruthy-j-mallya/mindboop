# 055 — Tasks are scheduled from now on

Status: done
Date: 2026-11-26

## Goal

A task can be scheduled only from now on, never backwards. Only time logs go back in time (up to 24 hours). The
Calendar already worked this way; the shared date picker (SchedulePicker) and the server now do too.

## Decisions

- **Earliest start**: an all-day task from today; a timed one from the quarter hour now falls in (the Calendar's slot),
  so a time picked a moment ago still counts. One helper, `getEarliestTaskStart` in `utils/dateTime.ts`, used by the
  Calendar's move check and the picker.
- **Picker**: days before today are disabled (Date tab and the Duration tab's start); the end date can't be before the
  start's day; time slots before the current quarter hour are greyed out today. A typed past time shows "Tasks can only
  be scheduled from now on" under the tabs and OK does nothing. The check reruns on OK, in case the picker stayed open.
- **Overdue tasks**: a start left where it was saved isn't checked, so an overdue task can still be edited, completed,
  or have its end moved (matching the Calendar's resize rule).
- **Server**: `Task` validates a new or changed `starts_at` (`starts_at_is_not_in_the_past`). The server doesn't know
  the user's time zone, so an all-day start may be up to a day back; a timed one up to 20 minutes (quarter hour plus
  clock skew).
- **Tests**: a `:backdated` task factory trait saves without validation, for tasks that became overdue.
