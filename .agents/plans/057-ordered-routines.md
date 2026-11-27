# 057 — Ordered routines

Status: done
Date: 2026-11-27

## Goal

Let users put their routines in the order they want by dragging them on the Routines page, instead of always oldest
first.

## Decisions

| Area | Choice |
| --- | --- |
| Model | `Routine` includes `Positionable`, `positioned_within :user_id`. A new routine goes last. `in_created_order` is gone; the list uses `in_position_order` |
| Migration | `routines.position` (integer, not null), backfilled per user oldest first (deleted ones included), so the existing order is kept. The `user_id` index becomes `user_id + position` |
| API | `PATCH /api/routines/:id` takes an optional `position` (index among the user's undeleted routines), saved with the other fields in one transaction, as for life areas. An invalid one is a 422 and nothing is saved |
| UI | `RoutineList` wraps the rows in a dnd-kit `DndContext` + `SortableContext` (vertical only, pointer and keyboard). Each `RoutineRow` has a grip handle (`Reorder <title>`) that shows on hover or focus, always on touch screens. Screen reader announcements name the routines |
| Server state | `useMoveRoutine` updates the list at once, rolls back on failure (with a toast), runs moves one at a time (`scope`) and refreshes when the last one settles, as `useMoveLifeArea` does |
| Smooth drop | The optimistic update lands a moment after the drop (`onMutate` awaits, and TanStack Query notifies on a timeout), so the row flashed back to its old place first. `RoutineList` renders the dropped order in the same render as the drop, until the cached routines change |
