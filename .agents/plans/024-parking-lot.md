# 024 — Parking lot

Status: done
Date: 2026-11-14

## Goal

Park stray thoughts (ideas, questions, things to do) during a focus session without chasing them, then deal with them
later from a Parking lot page: add one as a task, mark it addressed, or discard it.

## Decisions

| Area | Choice |
| --- | --- |
| Model | `ParkingLotItem` belongs to a user: `content` (required, up to 1,000 characters), `kind` (`idea`, `question`, `task`; default `idea`), `status` (`parked`, `addressed`, `converted`; default `parked`) and an optional `task` that is set only once converted. Soft deleted with Discard |
| List | `GET /api/parking_lot_items`, newest first, 20 a page like tasks. Optional `status` and `since` (ISO time) filters |
| Actions | Mark addressed (and park again) is `PATCH status`. Discard is `DELETE` (soft), undone by `POST …/restoration`, like tasks. Add as task is its own resource, `POST …/conversion` (`ParkingLotItemConversionsController`): it creates an Inbox task titled with the thought and marks the item `converted` in one transaction, under a row lock so a double click makes one task. Only a parked item can be converted (404 otherwise) |
| Timer | A Parking lot panel beside the session (stacked under it below `xl`): kind chips, an input, and the thoughts parked since the session started, oldest at the top like a chat, coloured by kind. Capture only, no actions, so it doesn't pull focus |
| Page | `/parking-lot` in the sidebar under Timer. The same park form, then tabs Parked / Addressed / Added as tasks. Parked rows offer Add as task, Mark addressed and Discard; addressed rows Park again and Discard; converted rows open their task and Discard. Discard and Mark addressed toast with Undo; Add as task toasts with a link to the task |
| Shared | The park form and kind styling live in `components/commons/ParkingLot`, used by the Timer panel and the page |
| Out of scope | Editing a parked thought's text, a `worry` kind, counts in the sidebar |
