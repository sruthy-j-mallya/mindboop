# 023 — Delete tasks from the Inbox

Status: done
Date: 2026-11-14

## Goal

Delete a task from its Inbox list row or its pane, with a toast that offers to undo it.

## Decisions

| Area | Choice |
| --- | --- |
| Backend | `DELETE /api/tasks/:id` already soft deleted (Discard). Undo is a new resource, `POST /api/tasks/:task_id/restoration` (`TaskRestorationsController`), which finds the task in `Task.discarded`, authorizes `update?` and `undiscard!`s it. A task that isn't deleted gets a 404 |
| Row | A ghost trash button at the end of each row, deleting at once (no confirmation; the toast's Undo covers slips). With a fine pointer it shows on hover or focus; on touch screens it always shows |
| Pane | A trash button (`Inbox/TaskPane/DeleteTaskButton`) in the header's top-right corner, beside the add-step button |
| Confirmation | `Inbox/TaskPane/DeleteTaskDialog`, styled like the Timer's `DiscardDialog`: "Delete this task?" with Cancel and a destructive "Delete task". A failed delete shows its error in the dialog and keeps it open |
| After delete | `Inbox/useDeleteTaskWithUndo.tsx` (shared by the row and the pane) closes the pane if the task was open, and shows a “Deleted “title”” toast with an undo icon button (Undo2, named "Undo" for screen readers) for 8 seconds. Undo calls `useRestoreTask`; a failed restore shows an error toast |
| Toasts | shadcn Sonner (`components/ui/sonner.tsx`), mounted in `AppLayout`. Sonner's own styling is off (`unstyled`) so toasts follow the design system: a `popover` card with the app's border, `rounded-xl` and shadow, and action buttons from `buttonVariants` (the undo icon is a ghost `icon-sm` button in `text-primary`, not Sonner's black button). The generated `next-themes` import was dropped, since the tokens follow the `.dark` class |
| Out of scope | A trash view for restoring deleted tasks after the toast is gone |
