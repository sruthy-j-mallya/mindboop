# 037 — Delete time logs from the Calendar

Status: done
Date: 2026-11-21

## Goal

Delete a time log added by mistake from the Calendar, with a toast that offers to undo it.

## Decisions

| Area | Choice |
| --- | --- |
| Backend | `DELETE /api/time_logs/:id` already soft deleted (Discard). Undo is a new resource, `POST /api/time_logs/:time_log_id/restoration` (`TimeLogRestorationsController`), which finds the log among discarded, finished logs, authorizes `update?` and calls `TimeLog#restore!`. `restore!` saves on a `:restore` context that runs the overlap check, so a log whose time another session has taken since gets the usual overlap 422. A log that isn't deleted, or was discarded while running (the Timer's discard), gets a 404 |
| Popover | Clicking any time log now opens `Calendar/TimeLogPopover/Show` ("Logged time"; it replaces `TaskPopover/Show`): the time range, a ghost trash button ("Delete time log"), then the task read only (`ReadOnlyDetails`) or, for a title-only log or one whose task was deleted, its title. Before, those two opened nothing |
| Which logs | Any finished log, however old: deleting doesn't fake past work the way logging or moving it would, so the 24-hour window doesn't apply. A running session has no delete button; it's ended or discarded from the Timer |
| Delete | At once, no confirmation (the toast's Undo covers slips, as on an Inbox row). The popover closes on click; `useDeleteTimeLogWithUndo` then shows “Deleted “title”” with the undo icon for `UNDO_TOAST_DURATION`. A failed delete or restore shows an error toast |
| Out of scope | Deleting by keyboard (Delete/Backspace on a focused event), and a trash view for logs |
