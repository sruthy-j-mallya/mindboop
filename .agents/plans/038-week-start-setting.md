# 038 — Week start setting

Status: done
Date: 2026-11-22

## Goal

Let people choose the day their week starts on in Settings (Monday by default), and lay out the Calendar's weeks and
the date pickers from that day.

## Decisions

| Area | Choice |
| --- | --- |
| Storage | `user_preferences.week_starts_on`, an integer from 0 (Sunday) to 6 (Saturday) as date-fns numbers days, default 1 (Monday). Validated with `numericality: { only_integer: true, in: 0..6 }` so a non-number isn't cast to Sunday. Read and written through the existing `GET`/`PATCH /api/user_preference` |
| Settings | A Calendar card with a "Week starts on" select listing Monday to Sunday. Saves optimistically like the other preferences |
| Calendar | `getLocalizer(weekStartsOn)` replaces the fixed `LOCALIZER`, so react-big-calendar's week and month views start on the chosen day; `getVisibleRange` takes the same day for the API range. The year view's mini-months follow it too, with weekday headings derived from the first week. The grid waits for the preference (falling back to Monday if it fails), so it never flashes Monday first; its wrapper stays mounted so wheel paging still attaches |
| Date pickers | The schedule picker's Date tab and the Duration tab's start and end date pickers read `useWeekStartsOn()` (`hooks/`), which falls back to Monday until the preference loads. `DEFAULT_WEEK_STARTS_ON` lives in `constants/index.ts`, shared by the Calendar and the pickers |
| Out of scope | The "this week" labels (`ScheduleLabel`, "Fri, Nov 5" for a date within this week) still count weeks from Monday |
