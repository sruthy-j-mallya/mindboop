# 015 — Edit steps and description on the Timer

Status: done
Date: 2026-11-12

## Goal

Let the user change a task's steps and description from the Timer page mid-session, not only on Quick Start
(follow-up to `014-task-description.md`).

## Decisions

| Area | Choice |
| --- | --- |
| API | Nested `resources :checklist_items, only: %i[ create update destroy ]` under tasks (`Api::ChecklistItemsController`), authorized as `update?` on the task. Each response renders the whole task, since a move changes siblings. Rejected: nested attributes on `PATCH /api/tasks/:id` (its `_destroy` hard-deletes, but items use Discard; and the client would have to sync ids for new rows) |
| Reorder | `PATCH … position: <index>` calls `ChecklistItem#move_to!`, which permutes the kept items' existing positions under a row lock, so gaps from discarded items are kept and nothing collides |
| Saving | Steps save on every change (tick, add, rename, remove, drag); no Save button mid-session. Updates are optimistic (a dragged row would otherwise jump back) and roll back on error. While several step changes are in flight, only the last response writes the cache |
| Description | Viewer with an edit (pencil) button, or "Add a description" when empty. Editing swaps in the rich-text editor with Save/Cancel (`Timer/Description/DescriptionForm`), saved with `PATCH /api/tasks/:id`. Superseded by `019-inline-description.md` (inline, autosaving) |
| Shared UI | `QuickStart/Steps` moved to `components/commons/Steps` and made presentational (steps + id-based callbacks). Quick Start wraps it with its field array; Timer wraps it with the checklist item mutations |
| Layout | The Timer's details column now always shows, so steps and a description can be added to a task that has none |
