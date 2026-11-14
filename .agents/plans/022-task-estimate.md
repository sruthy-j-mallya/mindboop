# 022 — Task estimates in the Inbox

Status: done
Date: 2026-11-14

## Goal

Set how long an Inbox task should take from its pane, change it, or clear it (an estimate is optional), and show it in the
list and the pane ("45 min", "2 h", "1 h 30 min").

## Decisions

| Area | Choice |
| --- | --- |
| Storage | The existing nullable `estimated_minutes`; no migration. `Task` now caps it at `MAX_ESTIMATED_MINUTES` (24 hours) so an oversized value gets a 422 instead of overflowing the integer column. `TASK_ESTIMATE_MAX_MINUTES` mirrors it on the client |
| Picker | `Inbox/TaskPane/EstimatePicker`: a popover from an "Estimate" button beside the due date (the button shows the estimate once set). Hours (0–24) and Minutes (0–59) fields, either left blank for 0, add up to the estimate; React Hook Form + Zod validate each field and a total of 1 min to 24 h, with one error line under both. Nothing saves until OK; reopening starts from the task again. Clear sends `estimated_minutes: null` |
| Label | `formatMinutes` moved from `QuickStart/utils.ts` to `@/utils`, now that the Inbox uses it too. The list row shows it muted, before the schedule |
| Out of scope | Comparing the estimate with logged time, and starting a timer from the Inbox |
