# 051 — Routine steps

Status: done
Date: 2026-11-26

## Goal

Build longer routines (a morning routine of ten small things) as a checklist: the routine keeps its steps, and each
session ticks them off afresh.

## Decisions

| Area | Choice |
| --- | --- |
| Model | `RoutineStep` (`routine_steps`: `routine_id`, `title` up to 255 characters and squished, `position`, `discarded_at`), `Positionable` within the routine, soft deleted like checklist items. `Routine#steps` lists the kept ones in order. No description on the routine: the steps carry it |
| Ticks | Belong to the session, not the step: `time_logs.checked_routine_step_ids` (uuid array). A new session starts with none ticked, and a past session keeps what it ticked. Only kept steps of the session's own routine can be ticked; any step can be unticked |
| API | `POST/PATCH/DELETE /api/routines/:routine_id/steps[/:id]` (needs `update?` on the routine, answers with the whole routine, optional `position` as for checklist items). `POST /api/time_logs/:time_log_id/step_checks` (`routine_step_id`) and `DELETE …/step_checks/:routine_step_id` (needs `update?` on the log, answers with the log). `GET /api/routines` includes `steps` |
| Editing | The routine pane has a Steps section using `commons/Steps` without checkboxes (`showCheckboxes={false}`): add, rename, reorder and remove in place, as on a task. With no steps, an Add step button and a hint |
| Timer | A routine with steps shows them beside the clock with ticks for this session and "x of y done". Steps can be edited there too, which changes the routine. Without steps, the badge and "any time counts" stay, with an Add step button |
| Shared pieces | `commons/RoutineSteps` wraps `commons/Steps` for both places. Changes show at once (optimistic updates of the routine list and the current time log) and roll back on failure |
| Gentleness | Unticked steps never count against anything: Done logs the time whatever was ticked |
| Sample data | A "Morning routine" with seven steps |
| Out of scope | Steps in the New routine dialog (the pane opens right after adding one), stats on steps, a routine description |
