# 051 — Breaks in time logs on the Calendar

Status: done
Date: 2026-11-25
Issue: #67

## Goal

Show where a session paused for a break, inside its time log on the Calendar, in the calm "gentle wave" style picked
on the design canvas (option C · Ripple).

## Decisions

| Area | Choice |
| --- | --- |
| Data | The time log JSON gains `breaks`, every break oldest first, as `{ id, intention, duration_minutes, started_at, ends_at, ended_at }`. `started_at` is the break's `created_at`. The Calendar and routine logs endpoints preload them |
| Placement | `getBreakBands` (`Calendar/utils.ts`) turns each break into a band in percent of the log's height, clipped to the log. An open break reaches the log's end (now, for a running session) |
| Look | The log lightens over the break, with a coral wave across it. Time past the planned end (`ends_at`) shows as a fainter dashed wave under it. A cup in a circle shows once the band is 18px tall (a container query) |
| Wave | A repeating wave-shaped CSS mask over a coral fill, so crests keep their shape at any column width, instead of one SVG stretched across the column |
| Views | Day, multi-day and week (react-big-calendar's per-view `event` component). The month and year views stay as they were |
| Across midnight | A log split across two columns shows no waves: react-big-calendar doesn't tell the event component which part it draws |
| Accessibility | Each band has a tooltip and screen reader text: "Break: Stretch · 10 min" |
