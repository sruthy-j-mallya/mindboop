# 047 — Routines

Status: done
Date: 2026-11-19

## Goal

Save the timers people start again and again (brushing teeth, a shower, meditation, washing the dishes, folding
clothes, a short walk) as **Routines**: a title, an emoji, a background sound and a duration, started with one click.
A mix of a timer preset and a habit tracker, but gentle: nothing is due, a missed day costs nothing, and the stats
only ever count what was done.

## Decisions

| Area | Choice |
| --- | --- |
| Name | "Routines": plain enough to scan in the sidebar (`SunMoon` icon: daily rhythm and care; `Repeat` is kept for recurring tasks later). The copy around it carries the gentleness ("Every time counts. Missed days don’t undo anything.") |
| Model | `Routine` (`routines`: `user_id`, `title`, `emoji`, `color`, `sound` default `"none"`, `duration_minutes`, `reminder_time`, `reminder_days`, `discarded_at`). `title` required, up to 60 characters, squished. `duration_minutes` 5–240: a routine is something worth a timer, so quick one-tap habits are out. `emoji`, `color` and `sound` reuse `LifeArea::EMOJIS`/`COLORS`/`SOUNDS` (emojis replaced a lucide icon set; see `040-life-area-emojis.md`) |
| Reminders | Optional. `reminder_time` (`"HH:MM"`, the browser's local time) and `reminder_days` (0 = Sunday … 6). No time means no reminder (days are cleared). The form offers Off / Daily / Weekly (one day) / Custom (any days); the frequency is read back from the days, so nothing extra is stored. They fire in the app while a tab is open (`AppLayout/RoutineReminder`): a toast with Start and Not now, plus a system notification when permitted, once per day per routine, up to 30 minutes late. Web push (reminders with no tab open) is left for later |
| Sessions | A routine session is an ordinary timer: `time_logs.routine_id` (nullable FK). `POST /api/time_logs` takes `routine_id` instead of `task_id`; `timer_preset` defaults to the routine's duration. A time log needs a task unless it's manual or on a routine. Pause, extend, the parking lot and the background sound all work as for a task. Done logs whatever was done (any time counts, even 3 of 10 minutes); there's no Bail, since there's no task to leave breadcrumbs on. Discard takes its place and works at any time, not only under 2 minutes: nothing is saved or counted (`DELETE /api/time_logs/:id`). The switch-session dialog offers Discard too. Done doesn't complete anything or award the early-finish achievement |
| Sound | A routine session starts with the routine's sound, once, the way an area's sound works (`useStartingSound`, generalised from `useLifeAreaSound`). As with areas, `none` (shown as "None") starts the session in silence. Picking a sound in the routine or area form plays 4 seconds of it at the user's ambience volume (`useSoundPreview`) |
| Stats | Positive only, no streaks (a broken streak is a reason to feel bad). Each routine in `GET /api/routines` carries `sessions_count`, `total_seconds` and `last_done_at` (one grouped query, `Routine.with_stats`). The pane adds days done this month and a month grid that marks the days it was done in the routine's colour; other days stay plain, never red or crossed out. "Last time" reads neutrally ("3 days ago"); never done reads "Not yet — whenever you’re ready" |
| History | `GET /api/routines/:routine_id/time_logs?from&to` (finished sessions only, range capped at 400 days) feeds the month grid. Days are grouped in the browser, in its time zone |
| Deleting | Soft delete (Discard): the routine leaves the list, its sessions stay on the Calendar under its title. A running session on it carries on and can still be finished |
| Navigation | Sidebar item "Routines" just above Timer. `/routines` (list + "pick a routine" placeholder) and `/routines/:routineId` (list + pane), like the TickTick layout: the list on the left, the pane on the right (stacked on small screens) |
| Managing | `+` opens the New dialog (`RoutineForm`: title, duration, colour, emoji, sound, reminder). The pane's `…` menu has Edit and Delete, and so does a right click (or long press) on a row in the list (shadcn `context-menu`, as on the areas). Deleting goes back to the list only when the deleted routine was open. Until the user has a routine, the list shows suggestions (Brush & floss, Shower, Meditation, Wash the dishes, Fold clothes, Quick stretch, Short walk, Reading, Tidy up, Exercise) as toggles: pick any number, then one Add button adds them, one after another in the order shown so the list keeps it. Any that fail stay picked, with an error toast |
| Starting | Play on a row or the pane starts the session and opens the Timer. With a session already running, Play leads to the Timer instead (one thing at a time) |
| Shared pieces | `ChoiceField` and `EmojiField` move from `LifeAreas/AreaDialog` to `commons/` now a second form uses them |
| Calendar | A routine's session is titled with the routine's name. It keeps the default colour (colouring by routine is left for later) |
| Out of scope | Archiving (delete covers it for now), reordering, routines in the Timer's setup picker, web push |
