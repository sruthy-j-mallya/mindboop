# 021 — Task due dates and durations

Status: done
Date: 2026-11-14

## Goal

Set a date (optionally with a time) or a duration on an Inbox task from a date picker in its pane, and show it in words
in the list and the pane ("Today", "Today 5:30pm", "Tomorrow", "Fri, Nov 13", "12 Aug 12:00pm").

## Decisions

| Area | Choice |
| --- | --- |
| Storage | The existing `starts_at`, `ends_at`, `is_duration`, `is_all_day` columns; no migration. `Task` validates the combination: a duration needs both ends with `ends_at >= starts_at`, a date has no `ends_at`, and an `ends_at` needs a `starts_at`. All-day schedules store the start of each day in the browser's time zone |
| Picker | `Inbox/TaskPane/SchedulePicker`: a popover from a "Due date" button next to the pane's complete checkbox (the button shows the label once scheduled). Date and Duration tabs (shadcn `tabs`), Clear and OK. Edits stay in a `ScheduleDraft` until OK; closing any other way drops them, and reopening starts from the task again. Clear unschedules the task. The popover closes on save; a server error shows under the button |
| Date tab | A Monday-first month calendar (shadcn `calendar`, react-day-picker), and an optional time (native time input, with a remove button). No time means all day |
| Duration tab | Start and end, each a native date input plus a time input (hidden when all day), and an All day switch. Moving the start moves the end with it, keeping the length. Turning All day off starts at the next full hour today (9am on other days) for an hour. An end before the start shows "The end can't be before the start" and isn't saved. The browser's time zone is shown as a note |
| Label | `Inbox/utils.ts#formatSchedule` (date-fns): Today / Tomorrow / Yesterday; `EEE, MMM d` within the current Monday-first week; `d MMM` this year; `d MMM yyyy` otherwise. Times as `h:mmaaa` ("5:30pm"). Durations within a day show the day once ("Tomorrow 1:00am – 2:00am"); longer ones show both ends |
| Colour | `getScheduleTone`: red once overdue (a timed date or a duration's end has passed, or an all-day one's whole day), primary while it touches today, muted otherwise. `ScheduleLabel` refreshes every minute (`useCurrentTime` takes an optional interval) |
| Out of scope | Quick-pick icons (today, tomorrow, next week, tonight), reminders, repeats and a time-zone picker from the reference design |
