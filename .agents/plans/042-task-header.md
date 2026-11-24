# 042 — Task header: title first

Status: done
Date: 2026-11-24

## Goal

Declutter a task's header and make it the same everywhere a task is shown. Mockups:
https://claude.ai/artifact/LRXyRzE3e3uzL8oNFzo4ZC (option "Title first").

Today one row holds complete, date, estimate, area, menu and start, above the title. In the Calendar's 30rem popover the
row wraps. The Timer and two of the Calendar's popovers have their own versions of it.

## Decisions

| Area | Choice |
| --- | --- |
| Layout | Title on the first row; below it one quiet details line: date, area, estimate |
| Unset details | Hidden from the line. Offered in `⋯` as "Add due date", "Add estimate", "Move to area" (only if the user has areas) |
| Set details | On the line, each a button that opens its picker. Not repeated in `⋯` |
| `⋯` | The unset details, "Add step" (while there are no steps), "Delete task" (not on the Timer) |
| Picking from `⋯` | The detail's button appears on the line with its picker open. Closed without a value, it goes again |
| Failed save | The detail stays on the line with its error, even if unset |
| Icons | None on the date; the hourglass stays on the estimate (a bare "45m" is unclear) and the badge on the area |
| Removed | The separator after the checkbox (also in the logged session), and the compact icon-only estimate and Inbox buttons |
| Backend | No changes: deleting a task already records or discards its session, and a time log can be discarded on its own |

### By screen

| Screen | Checkbox | Title | Details line | `⋯` | Start |
| --- | --- | --- | --- | --- | --- |
| Areas of life / Inbox pane | Yes | Editable | Yes | Yes | Labelled |
| Calendar, scheduled task | Yes | Editable | Yes | Yes | Icon only |
| Calendar, new task | No | Field, first | All controls always shown, below the title | No | No |
| Calendar, logged session | Read only | Read only | Plain text, set ones only; gains the area | No | No |
| Timer, choosing a task | No | Editable | Yes; gains the area | Yes, without delete | No (the left column has it) |
| Timer, session running | No | Editable | Yes; gains the area | Yes, without delete | No (Done and Bail end it) |

- **New task:** date, estimate, area and "Add step" are all visible. Deleting is left out, as there is no task yet;
  leaving the popover without a title still drops it.
- **Timer title:** shown in the details column too, although the left column also names the task.

### Deleting a task that is on the clock

- **Timer page:** no "Delete task", neither while choosing a task nor while a session runs. With steps and every detail
  set, `⋯` would be empty, so it's hidden.
- **Everywhere else** (pane, Calendar popover, list row): if the task has the current session, running or paused, the
  dialog asks what to do with its time.

| Focus so far | Buttons |
| --- | --- |
| 2 minutes or more | "Record time and delete", "Discard time and delete", "Cancel" |
| Under 2 minutes (too short to log) | "Discard time and delete", "Cancel" |

- **Record:** delete the task; `Task#stop_running_session` logs the time. A timer past zero records the extra time too,
  as a delete does today.
- **Discard:** delete the time log, then the task. If the second request fails, the dialog stays open with the error and a
  retry only deletes the task.
- **List rows** delete at once, with an undo toast. They keep doing so, except for the task on the clock, which opens this
  dialog.
- **Undo** brings the task back, but not its session: recorded time stays recorded, discarded time stays discarded.

## Date format

Applies everywhere, list chips included. Changes in `ScheduleLabel/utils.ts`, so the header, the list chips and the logged-session popover agree:

| Now | New |
| --- | --- |
| `Thu, Nov 26 10:00am – 11:00am` | `Thu, Nov 26, 10 – 11am` |
| `Tomorrow 5:30pm – 7:00pm` | `Tomorrow, 5:30 – 7pm` |
| `Today 11:00am – 1:00pm` | `Today, 11am – 1pm` |
| `Today 11:00pm – Tomorrow 1:00am` | `Today, 11pm – Tomorrow, 1am` |
| `12 Aug 12:00pm` | `12 Aug, 12pm` |

Days without times are unchanged. On one day, am/pm shows once when both times share it.

## Implementation

1. `ScheduleLabel/utils.ts`: the shorter format.
2. `SchedulePicker`, `EstimatePicker`, `LifeAreaPicker`: optional controlled `isOpen`/`onOpenChange`. Uncontrolled use
   (list rows, Parking Lot, curiosity banner, new-task form) stays as it is.
3. `DueDatePicker`, `TaskEstimatePicker`, `TaskLifeAreaPicker`: the quiet button style; render nothing unless set, open,
   saving or failed.
4. `commons/TaskDetails`: title-first layout, with the open detail in its state. A prop hides the checkbox, Start and
   delete for the Timer.
5. `TaskActionsMenu`: the "Add …" items. The closing menu must not take focus back from the picker it opened.
6. Timer: use `commons/TaskDetails` in `Session` and `Setup`, and delete `Timer/TaskDetails.tsx`.
7. `DeleteTaskDialog`: the record/discard choice, also opened by `TaskRow` for the task on the clock. Its text also stops saying "from your Inbox", which is wrong
   for tasks in an area.
8. Calendar: `TaskForm` (title first, all controls visible) and `ReadOnlyDetails` (title first, area added).

## Tests

- Unit: `ScheduleLabel/utils`, `Calendar`, `Timer`, `LifeAreas`, `TaskBoard`. New cases: adding each detail from `⋯`, closing
  a picker without a value, a failed save, no delete on the
  Timer, and deleting the task on the clock from a pane and a row (record, discard, too short, failed delete).
- e2e: `schedule`, `inbox`, `estimate`, `timer`, `life_areas`, `calendar`.
- Existing Rails tests cover ending the session on delete; run them unchanged.

## Not changing

The log-time form, the Parking Lot, the contents of the pickers, steps, breadcrumbs, descriptions, and the list rows' layout.
