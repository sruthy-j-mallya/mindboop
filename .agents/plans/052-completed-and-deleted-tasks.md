# 052 — Completed and deleted tasks

Status: done
Date: 2026-11-25

## Goal

Find completed and deleted tasks in one place each, and bring them back. Replaces the "Completed" section below each list
(issue 2 of 051), and adds the trash view 023 left out.

## Decisions

| Area | Choice |
| --- | --- |
| Navigation | "Completed" and "Deleted" under the Inbox in the areas' sidebar, at `/completed` and `/deleted`. Nothing can be dropped on them |
| Lists | Tasks from every list, with their area. Completed: most recently changed first (as in 051). Deleted: latest deletion first, with its date. 20 at a time, with "Load more" |
| Bringing back | Reopen puts a completed task back on its list. Restore undoes a delete through the existing `POST /api/tasks/:task_id/restoration`. A toast names the list it went to |
| Restored as it was | A task deleted while completed comes back under Completed. An uncompleted one whose area was deleted comes back to the Inbox (`Task#return_to_inbox`). A session that ended with the delete stays ended |
| Backend | `GET /api/tasks?is_deleted=true`, with `discarded_at` on deleted tasks. No migration |
| Kept | The Undo toasts after completing and deleting |
| Out of scope | Deleting for good, emptying the trash, opening a completed or deleted task, searching them |
