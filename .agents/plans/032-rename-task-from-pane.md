# 032 — Rename a task from its pane

Status: done
Date: 2026-11-17

## Goal

Edit a task's title inline in the task pane (`/inbox/:taskId`), the same way as in its Inbox row (plan 025). Until now
the pane's title was a static heading.

## Decisions

| Area | Choice |
| --- | --- |
| Backend | None: `PATCH /api/tasks/:id` already accepts `title` |
| Shared field | `TitleInput` moves from `Inbox/TaskList/` to `Inbox/`, now that the list and the pane both use it. It takes a `label` (its accessible name) and a `className` merged over its base styles; `isSelected` and `onFocus` become optional, since only the row needs them |
| Shared saving | `Inbox/useRenameTask` holds the rename mutation, the optimistic title (`variables.title` while saving) and the blank/unchanged guard, for both the row and the pane |
| Pane title | An `h2` named after the title (`aria-label`) wraps the field, so the pane still exposes the task's title as its heading. The field is labelled "Task title", so it can't be mistaken for the row's field, which is named after the title |
| Look | Reads as the heading (`text-xl font-semibold`, no border). It takes the muted background on hover and focus, since it has no outline |
| Saving | As in the row: Enter or blur saves, Escape puts the saved title back, a blank or unchanged title isn't saved, line breaks in pasted text become spaces. The list updates through the `LISTS` invalidation in `useUpdateTask`. Errors show in the pane header's alert slot |
