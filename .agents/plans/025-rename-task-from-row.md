# 025 — Rename a task in its Inbox row

Status: done
Date: 2026-11-14

## Goal

Edit a task's title right in its Inbox list row, inline, with no edit button.

## Decisions

| Area | Choice |
| --- | --- |
| Backend | None: `PATCH /api/tasks/:id` already accepts `title` |
| Title field | `Inbox/TaskList/TitleInput` replaces the title link: a borderless one-row `textarea` that reads as plain text and grows (`field-sizing-content`) to wrap long titles. Its accessible name is the saved title, and it carries `aria-current="page"` while its task is open. Line breaks in pasted text become spaces |
| Saving | Enter or blur saves; Escape puts the saved title back. A blank or unchanged title isn't saved. A separate `useUpdateTask` instance; the row shows the mutation's `variables.title` while it saves so the old title doesn't flash back. The pane's heading updates through the detail cache. Errors show in the row's alert slot |
| Opening the task | On wide screens (`lg` and up), focusing the title opens the task beside the list. Below `lg` the Inbox shows the list or the task, not both, so focusing only edits; a chevron link ("Open <title>", `lg:hidden`) at the end of the row opens the task |
| Focus | The row takes the muted background while anything in it has focus, since the field has no outline |
