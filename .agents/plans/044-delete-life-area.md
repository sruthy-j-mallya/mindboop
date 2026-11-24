# 044 — Delete an area of life

Status: done
Date: 2026-11-25

## Goal

Soft-delete areas of life. If one has uncompleted tasks, ask which list to move them to; its completed and deleted tasks
stay with it.

## Decisions

| Area | Choice |
| --- | --- |
| Model | `LifeArea` includes `Discard::Model` (`discarded_at`, added to the branch's own `create_life_areas` migration). Names are unique among undeleted areas, so a deleted one's can be reused |
| Question | A "Move tasks to" select in `AreaDialog/Delete`: the Inbox (the default), then the other areas. With no other area, it only says they move to the Inbox; with no uncompleted tasks, it says so. The tasks are counted afresh when the dialog opens (`GET /api/tasks`); if that fails, it asks anyway |
| Edit dialog | Its "Delete area" button opens the same dialog, replacing the second click |
| API | `DELETE /api/life_areas/:id?tasks_life_area_id=` (`LifeAreas::DiscarderService`, one transaction). Without it, the Inbox. Anything but another of the user's undeleted areas is a 404 and changes nothing |
| Deleted area | Can't be opened, edited or given tasks. `GET /api/life_areas` still lists it as `is_deleted`, so completed tasks and time logs keep its colour and name: `useLifeAreas` leaves deleted ones out, `useAllLifeAreas` doesn't |
| Reopened and restored tasks | A completed task reopened, or a deleted one restored, after its area was deleted goes to the Inbox, as it would be in no list otherwise (`Task#return_to_inbox`) |
| After | If the deleted area was open, the list its tasks moved to opens (the Inbox when there were none) |
| Out of scope | Restoring a deleted area |
