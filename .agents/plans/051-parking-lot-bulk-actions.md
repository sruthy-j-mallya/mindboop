# 051 — Bulk actions on the Parking lot page

Status: done
Date: 2026-11-25
Issue: #69

## Goal

Clearing a pile of parked thoughts one row at a time is tedious. Let the user pick several thoughts and mark them
addressed, or let them go, in one step, with the same Undo the row actions have.

## Decisions

| Area | Choice |
| --- | --- |
| API | A singular `resource :parking_lot_item_batch, only: %i[ update destroy ]` (`Api::ParkingLotItemBatchesController`) plus a nested `restoration` (`Api::ParkingLotItemBatchRestorationsController`) for undoing a bulk let go. RESTful resources instead of custom actions, per the code standards |
| Params | `ids` (JSON array) read with `params.expect(ids: [])`; `PATCH` also takes `status`. A missing or empty `ids` is a 400, rendered as `{ error }` by a new `ActionController::ParameterMissing` handler in `Api::BaseController` |
| All or none | Items load with `find(ids)` (404 if any is unknown or in the wrong discard state) and each is authorised (403 if any is another user's). Changes run in one transaction through the model, so validations and the curiosity-time callback still apply |
| Page | Each row gets a checkbox beside its card. A toolbar above the list has Select all (a dash when some are selected), "N thoughts selected", and once something is selected: **Mark addressed** (Parked tab only) and **Let it go** (every tab). Selection is per tab and resets when the tab changes; thoughts that leave the list drop out of it |
| Feedback | Selected rows dim while the action runs. Toasts "N thoughts marked as addressed" / "Let go of N thoughts" with Undo (batch update back to parked / batch restoration). A failure shows under the toolbar and keeps the selection |

## Tests

- Minitest: `test/controllers/api/parking_lot_item_batches_controller_test.rb` and
  `parking_lot_item_batch_restorations_controller_test.rb` (success, validation failure and rollback, missing ids,
  404, unauthenticated, Pundit denial).
- Vitest: bulk mark addressed + undo, select all + let go + undo, failure keeps the selection, tabs other than
  Parked only offer Let it go.
- Playwright: select two → mark addressed → select all on Addressed → let go → undo.
