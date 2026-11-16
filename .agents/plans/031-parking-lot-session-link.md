# 031 — Link parked thoughts to their session

Status: done
Date: 2026-11-16

## Goal

The Finished dialog offers "Review parking lot" only when thoughts parked during the session that just ended are still
parked. Otherwise it fades away as before. First step of "Remember where it came from" in plan 026's TODO.

## Decisions

| Area | Choice |
| --- | --- |
| Storage | `parking_lot_items.time_log_id` (uuid, null, indexed), FK `on_delete: :nullify`. A new migration, since `create_parking_lot_items` is on `main` |
| Model | `ParkingLotItem belongs_to :time_log, optional: true`, validated to be one of the user's own time logs ("Time log must be one of your sessions"). `TimeLog has_many :parking_lot_items, dependent: :nullify` |
| Linking | The client sends `time_log_id` on create: `ParkForm` takes an optional `timeLogId`, passed only by the Timer's panel. Thoughts parked from the Parking lot page stay unlinked |
| Filter | `time_log_id` replaces the `since` filter on `GET /api/parking_lot_items`; `since` had no other caller |
| Timer | The panel lists `{ status: "parked", timeLogId }`; the Finished dialog counts the same for the completed log, so its "Review parking lot · N" shows this session's thoughts |
| Left for later | Showing "Parked during: <task>" on the Parking lot page |
