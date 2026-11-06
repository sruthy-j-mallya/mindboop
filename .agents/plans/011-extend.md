# 011 — Extend a session

Status: done
Date: 2026-11-06

## Goal

Make Extend on the Timer page add time to the running session, up to a limit per session.

## Decisions

| Area | Choice |
| --- | --- |
| Schema | `time_logs.buffer_minutes` (default 0). `timer_preset` stays the original plan, and the countdown runs for preset + buffer |
| Limit | 60 minutes in total per session, checked on the client and the server |
| Endpoint | `POST /api/time_logs/:time_log_id/extension` with `minutes`. A new resource, so `PATCH /api/time_logs/:id` can't write the buffer. Authorized with `TimeLogPolicy#update?` |
| Options | Always +5, +10, +15, +20, +30, +60. Any that no longer fit stay visible, disabled and struck through. All multiples of 5, so whatever is left can be used up |
| Past zero | Elapsed time is capped at the old total when extending, so all the added minutes are still ahead. Otherwise a timer that ran over would stay at 00:00 after extending |
| Finished early | Still measured against `timer_preset`, so finishing inside the buffer doesn't earn the early-finish boost |
| When it's off | Disabled during a break and once the 60 minutes are used. The server rejects a completed log and a stopwatch |
| Left for later | The guardrails in the design (next meal, sleep or task, and the room left before it), which don't exist yet. Bail is still not wired |
