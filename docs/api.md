# API

JSON endpoints under `/api`, served by `Api::` controllers. Auth is a signed `session_id` cookie; non-GET
requests need the `X-CSRF-Token` header (the frontend axios client in `app/frontend/apis/axios.ts` adds it).

Keys are snake_case on the wire. The frontend converts them to camelCase in axios interceptors.

## Errors

Every error response has one shape:

```json
{ "error": "Email address has already been taken and Password is too short" }
```

| Status | When                                              |
| ------ | ------------------------------------------------- |
| 401    | Not signed in                                     |
| 403    | Pundit policy denied the action                   |
| 404    | Record or token not found (or token expired)      |
| 422    | Validation failed (`full_messages.to_sentence`)   |
| 429    | Rate limit hit (sign in, sign up, password reset) |

## Endpoints

| Method | Path                                      | Body                                                                                                | Success                           |
| ------ | ----------------------------------------- | --------------------------------------------------------------------------------------------------- | --------------------------------- |
| GET    | `/api/session`                            | –                                                                                                   | 200 `{ user }`                    |
| POST   | `/api/session`                            | `email_address`, `password`                                                                         | 201 `{ user }`, sets cookie       |
| DELETE | `/api/session`                            | –                                                                                                   | 204                               |
| POST   | `/api/email_confirmations`                | `email_address`                                                                                     | 202 `{ message }`                 |
| POST   | `/api/registration`                       | `token`, `password`, `password_confirmation`                                                        | 201 `{ user }`, sets cookie       |
| POST   | `/api/passwords`                          | `email_address`                                                                                     | 202 `{ message }`                 |
| PATCH  | `/api/passwords/:token`                   | `password`, `password_confirmation`                                                                 | 204, signs out everywhere         |
| GET    | `/api/tasks`                              | `page`, `is_completed`, `search_term`, `is_searching_details`, `is_in_inbox`, `life_area_id` (opt.) | 200 `{ tasks, … }`                |
| GET    | `/api/tasks/:id`                          | –                                                                                                   | 200 `{ task }`                    |
| POST   | `/api/tasks`                              | Task fields (`title` required)                                                                      | 201 `{ task }`                    |
| PATCH  | `/api/tasks/:id`                          | Task fields                                                                                         | 200 `{ task }`                    |
| DELETE | `/api/tasks/:id`                          | –                                                                                                   | 204, soft delete                  |
| POST   | `/api/tasks/:task_id/restoration`         | –                                                                                                   | 201 `{ task }`, undoes delete     |
| POST   | `/api/tasks/:task_id/checklist_items`     | `title`, `is_completed`, `position` (optional)                                                      | 201 `{ task }`                    |
| PATCH  | `/api/tasks/:task_id/checklist_items/:id` | `title`, `is_completed`, `position` (all optional)                                                  | 200 `{ task }`                    |
| DELETE | `/api/tasks/:task_id/checklist_items/:id` | –                                                                                                   | 200 `{ task }`, soft delete       |
| GET    | `/api/task_counts`                        | –                                                                                                   | 200 `{ task_counts }`             |
| GET    | `/api/life_areas`                         | –                                                                                                   | 200 `{ life_areas }`              |
| POST   | `/api/life_areas`                         | `name`, `color`, `emoji`, `default_sound` (optional)                                                | 201 `{ life_area }`               |
| PATCH  | `/api/life_areas/:id`                     | `name`, `color`, `emoji`, `default_sound`, `position` (any)                                         | 200 `{ life_area }`               |
| DELETE | `/api/life_areas/:id`                     | `tasks_life_area_id` query param (optional)                                                         | 204, soft delete                  |
| GET    | `/api/routines`                           | –                                                                                                   | 200 `{ routines }`                |
| POST   | `/api/routines`                           | Routine fields (see below)                                                                          | 201 `{ routine }`                 |
| PATCH  | `/api/routines/:id`                       | Routine fields (any)                                                                                | 200 `{ routine }`                 |
| DELETE | `/api/routines/:id`                       | –                                                                                                   | 204, soft delete                  |
| GET    | `/api/routines/:routine_id/time_logs`     | `from`, `to` query params (ISO 8601)                                                                | 200 `{ time_logs }`               |
| POST   | `/api/quick_starts`                       | Task fields, `estimated_minutes` required                                                           | 201 `{ task, time_log }`          |
| POST   | `/api/time_logs`                          | `task_id` or `routine_id`, Time log fields                                                          | 201 `{ time_log }`                |
| PATCH  | `/api/time_logs/:id`                      | `started_at`, `completed_at`                                                                        | 200 `{ time_log }`                |
| DELETE | `/api/time_logs/:id`                      | –                                                                                                   | 204, soft delete                  |
| POST   | `/api/time_logs/:time_log_id/restoration` | –                                                                                                   | 201 `{ time_log }`, undoes delete |
| POST   | `/api/time_logs/:time_log_id/completion`  | `discard_overrun` (optional)                                                                        | 201 `{ time_log }`                |
| POST   | `/api/time_logs/:time_log_id/extension`   | `minutes`                                                                                           | 201 `{ time_log }`                |
| POST   | `/api/time_logs/:time_log_id/bail_out`    | `restart_description`, `completed_description`, `discard_overrun` (optional)                        | 201 `{ time_log }`                |
| POST   | `/api/time_logs/:time_log_id/break`       | `intention`, `duration_minutes`                                                                     | 201 `{ time_log }`                |
| PATCH  | `/api/time_logs/:time_log_id/break`       | –                                                                                                   | 200 `{ time_log }`                |
| GET    | `/api/current_time_log`                   | –                                                                                                   | 200 `{ time_log }` or `null`      |
| GET    | `/api/calendar_events`                    | `from`, `to` query params (ISO 8601)                                                                | 200 `{ tasks, time_logs }`        |
| GET    | `/api/user_preference`                    | –                                                                                                   | 200 `{ user_preference }`         |
| PATCH  | `/api/user_preference`                    | `theme`, `completion_sound`, `break_alarm_sound`, `week_starts_on` (any)                            | 200 `{ user_preference }`         |
| GET    | `/api/parking_lot_items`                  | `page`, `status`, `time_log_id` query params (optional)                                             | 200 list (see below)              |
| POST   | `/api/parking_lot_items`                  | `content`, `time_log_id` (optional)                                                                 | 201 `{ parking_lot_item }`        |
| PATCH  | `/api/parking_lot_items/:id`              | `content`, `status` (both optional)                                                                 | 200 `{ parking_lot_item }`        |
| DELETE | `/api/parking_lot_items/:id`              | –                                                                                                   | 204, soft delete                  |
| POST   | `/api/parking_lot_items/:id/conversion`   | Task schedule fields (optional)                                                                     | 201, adds a task                  |
| POST   | `/api/parking_lot_items/:id/restoration`  | –                                                                                                   | 201, undoes discard               |
| GET    | `/api/curiosity_time`                     | –                                                                                                   | 200 `{ parking_lot_item }`        |
| POST   | `/api/curiosity_time`                     | `parking_lot_item_id`                                                                               | 201 `{ parking_lot_item }`        |
| PATCH  | `/api/curiosity_time`                     | –                                                                                                   | 200, adds more time once          |
| DELETE | `/api/curiosity_time`                     | –                                                                                                   | 200 `{ parking_lot_item }`        |

`user` is `{ id, email_address }` (`app/views/api/users/_user.json.jbuilder`). All ids are UUIDs.

## Tasks

Tasks belong to the signed-in user. `GET /api/tasks` lists only their undeleted tasks, soonest `starts_at` first
with undated tasks last; ties go to the newest task. Another user's task gets a 403. A deleted or unknown task gets a 404.

`DELETE /api/tasks/:id` soft deletes the task. Its time logs stay: work done before the delete still counts, and they
stay on the Calendar. A session still running on it ends at that moment, the way a completion ends it but without
completing the task. One with under 2 minutes of focus is discarded instead.

`POST /api/tasks/:task_id/restoration` brings back a deleted task (the Inbox's Undo). A task that isn't deleted gets a 404.
A session that ended when the task was deleted stays ended.

The list returns 20 tasks per page, as `{ tasks, tasks_count, page, total_pages }`. `tasks_count` is the total across all
pages. A missing or invalid `page` returns the first page, and a page past the end returns an empty `tasks`.

`GET /api/task_counts` counts the signed-in user's undeleted, incomplete tasks by area of life, as
`{ task_counts: [{ life_area_id, tasks_count }] }`. A `null` `life_area_id` is the Inbox; an area (or Inbox) with no such
tasks is left out.

`is_completed=false` lists only incomplete tasks (the Inbox and area lists), and `is_completed=true` only completed ones.
Leaving it out lists every task.

`is_in_inbox=true` lists only tasks in no area of life (the Inbox), and `life_area_id` only the tasks in that area. Both
combine with the other filters and paging; leaving them out lists tasks from every area.

`search_term` lists only tasks whose title contains it, ignoring case and surrounding spaces (`%` and `_` match
literally). A blank one is ignored. It combines with the other filters and paging (the Timer's
task picker, and the Calendar's time log popover to link a task). With `is_searching_details=true` it also matches
descriptions (their Markdown) and the titles of undeleted checklist items (the global search).

The writable task fields are `title`, `description`, `estimated_minutes`, `is_duration`, `is_all_day`, `is_completed`,
`starts_at`, `ends_at` and `life_area_id`.

`life_area_id` puts the task in one of the user's areas of life; `null` puts it back in the Inbox. Another user's area, or
an unknown one, gets a 422 ("Life area must exist").

`estimated_minutes` is a whole number from 1 to 1,440 (24 hours), or `null` for no estimate; send `null` to clear it.
Anything else gets a 422.

A task's schedule is either a date or a duration. A date has only `starts_at` (`is_duration: false`, `ends_at: null`).
A duration has both, with `is_duration: true` and `ends_at` no earlier than `starts_at`. `is_all_day` marks a schedule
with days but no times; the client then sends the start of each day in the user's time zone. Any other combination gets a
422 (for example an `ends_at` without `is_duration`, or a duration that ends before it starts). Send `starts_at: null`,
`ends_at: null` and `is_duration: false` to clear the schedule.

`description` is Markdown, as written in the rich-text editor, up to 10,000 characters (longer gets a 422). It's stripped,
and a blank description is saved as `null`. The API stores it as given; the client renders it through the editor's schema,
which leaves out anything the editor can't write, such as raw HTML.

`task` also includes `id`, `life_area_id`, `created_at`, `updated_at` and `checklist_items`, each `{ id, title, is_completed }`, in
position order (`app/views/api/tasks/_task.json.jbuilder`). Checklist items are soft-deleted (Discard), and discarded
items are left out. It also includes `breadcrumbs`, each `{ id, completed_description, restart_description, created_at }`,
newest first: the notes left each time a session on the task was bailed out of.

`POST /api/tasks` also accepts `checklist_items_attributes`, an array of `{ title, is_completed }` (`title` required), and
creates the items with the task, positioned in array order. If any item is invalid, the request gets a 422 and nothing
is saved. `PATCH /api/tasks/:id` ignores them; change items one at a time through the checklist item endpoints.

## Life areas

Areas of life (Work, Health, …) group a user's tasks; a task in none is in the Inbox. `GET /api/life_areas` lists the
signed-in user's areas, in the user's order, unpaged, as `{ life_areas }`, deleted ones (`is_deleted`) too: completed tasks and
time logs still show theirs. Another user's area gets a 403, and an unknown one a 404.

Each `life_area` is `{ id, name, color, emoji, default_sound, is_deleted, created_at, updated_at }`
(`app/views/api/life_areas/_life_area.json.jbuilder`).

- `name` is required, up to 40 characters, with runs of spaces squished. It's unique among a user's undeleted
  areas, ignoring case ("Name has already been taken").
- `color` is one of `rose`, `orange`, `amber`, `lime`, `emerald`, `teal`, `sky`, `indigo`, `violet`, `slate`.
- `emoji` is one of `LifeArea::EMOJIS` (the emoji itself, such as `💼`), listed by category in
  `app/frontend/components/commons/LifeArea/emojis.json`.
- `default_sound` is one of the Ambience sounds (`none`, `clock`, `bells`, `piano`, `harp`, `flute`, `rain`, `waves`,
  `wind`, `morning`, `campfire`, `night`) and defaults to `none`. A session on one of the area's tasks starts with that
  background sound; `none` is silence.

Anything else gets a 422.

A new area goes last. `PATCH` with `position` moves the area to that index (0-based) among the user's undeleted areas; one
past the end goes last. Anything but a whole number of 0 or more gets a 422 and nothing is saved. `position` isn't
returned: the list's order is the order.

`DELETE /api/life_areas/:id` soft-deletes the area (Discard). Its uncompleted tasks move to the area in
`tasks_life_area_id`, or to the Inbox without one; completed and deleted tasks stay with it. If that isn't another of the
user's undeleted areas, it gets a 404 and nothing changes. A deleted area can't be changed or deleted again (404), and
putting a task in one gets a 422 ("Life area must exist"). A task reopened or restored once its area is deleted goes to
the Inbox.

## Routines

Routines are timers a user starts again and again (a shower, meditation, folding clothes). `GET /api/routines` lists the
signed-in user's undeleted routines, oldest first, unpaged, as `{ routines }`. Another user's routine gets a 403, and a
deleted or unknown one a 404.

Each `routine` is `{ id, title, icon, color, sound, duration_minutes, reminder_time, reminder_days, sessions_count,
total_seconds, last_done_at, created_at, updated_at }` (`app/views/api/routines/_routine.json.jbuilder`).

- `title` is required, up to 60 characters, with runs of spaces squished.
- `duration_minutes` is a whole number from 5 to 240: what a session on the routine is timed for.
- `icon` is one of `Routine::ICONS` (lucide icon names such as `toothbrush`, `shower-head`, `flower-2`).
- `color` and `sound` take the same values as a life area's `color` and `default_sound`; `sound` defaults to `none`.
- `reminder_time` is optional, `"HH:MM"` in the user's local time. Without it there's no reminder and `reminder_days` is
  cleared. With it, `reminder_days` must list at least one weekday, 0 (Sunday) to 6; it's stored sorted without repeats.
  Reminders are shown by the client while the app is open.
- `sessions_count`, `total_seconds` and `last_done_at` count the routine's finished, undeleted sessions. They're read-only.

Anything else gets a 422. `DELETE /api/routines/:id` soft deletes the routine; its sessions stay, and keep its title on the
Calendar.

`GET /api/routines/:routine_id/time_logs?from=…&to=…` lists the routine's finished, undeleted sessions that started in
that range (up to 400 days), oldest first, as `{ time_logs }` in the time log shape. A missing or bad range gets a 422.

## Checklist items

`/api/tasks/:task_id/checklist_items` adds, changes and removes a task's checklist items (the Steps on the Timer page).
Each needs permission to update the task: another user's task gets a 403, and a deleted or unknown task, or an item
that's discarded or belongs to another task, gets a 404. Every response is the whole task, as `{ task }` in the same
shape as `GET /api/tasks/:id`, since a move also changes the other items' order.

- `POST` adds an item at the end, or at `position` when it's given (the same 0-based index `PATCH` takes, with the same
  rules). `title` is required (blank gets a 422).
- `PATCH` changes `title` and `is_completed`, and moves the item when `position` is given: the 0-based index it should
  land on among the task's items. An index past the end moves it last, and a negative or non-integer one gets a 422 with
  nothing saved. Items keep their stored positions among themselves, so a discarded item never shares one with a kept item.
- `DELETE` soft-deletes the item (Discard).

## Quick starts

`POST /api/quick_starts` creates a task and starts a timer on it, in one transaction. It's what Begin on the Quick Start
page calls. `POST /api/tasks` and `POST /api/time_logs` still do each step on its own.

- It accepts `title`, `description`, `estimated_minutes` and `checklist_items_attributes`, with the same rules as
  `POST /api/tasks`, except that `estimated_minutes` is required and at least 2. Other task fields are ignored.
- The time log is a running `timer` whose `timer_preset` is the task's `estimated_minutes`. It starts the same way as one
  from `POST /api/time_logs`, and time log fields sent by the client are ignored.
- If the task, a checklist item or the time log is invalid, the request gets a 422 and nothing is saved.

It returns `{ task, time_log }`, in the same shapes as the task and time log endpoints.

## Parking lot

Parking lot items are stray thoughts parked during focus, and belong to the signed-in user. Another user's item gets
a 403, and a discarded or unknown item gets a 404. The conversion and restoration endpoints return `{ parking_lot_item }`.

An item is `{ id, content, status, task_id, time_log_id, curiosity_ends_at, is_curiosity_extended, created_at, updated_at }`.

- `content` is required, up to 1,000 characters (stripped).
- `time_log_id` links the item to the focus session it was parked during (the Timer's panel sends it). It must be one
  of the user's own time logs (422 otherwise), and is cleared if that time log is deleted.
- `status` starts as `parked`. `PATCH` moves it between `parked` and `addressed`. `converted` is set only by the
  conversion endpoint, which also sets `task_id`; any other combination gets a 422.
- `GET` lists undeleted items oldest first, 20 a page, as `{ parking_lot_items, parking_lot_items_count, page,
total_pages }`. `status` lists one status. `time_log_id` lists the items parked during that session (the Timer's
  panel and its Finished dialog use it).
- `POST /api/parking_lot_items/:id/conversion` adds a parked item to the Inbox as a task titled with its `content`, and
  marks it `converted`, in one transaction. It optionally takes the task's schedule (`starts_at`, `ends_at`,
  `is_duration`, `is_all_day`, with the same rules as tasks); without one the task is undated, and an invalid one gets a
  422 with nothing saved. An item that isn't parked gets a 404; a repeated request makes no second task.
- `DELETE` soft-deletes (discards) the item. `POST /api/parking_lot_items/:id/restoration` brings it back; an item that
  isn't discarded gets a 404.
- Marking an item addressed, converting it or discarding it ends its curiosity time.

### Curiosity time

`/api/curiosity_time` is the signed-in user's curiosity time: a short, timeboxed look-up on one parked item, so a quick
question doesn't turn into a rabbit hole. At most one runs at a time. While it runs, the item's `curiosity_ends_at` is
set. Every response is `{ parking_lot_item }`: the item, or `null` when none is running.

- `GET` returns the running one.
- `POST` starts one on `parking_lot_item_id`, ending 5 minutes from now. An item that isn't parked (or is discarded or
  unknown) gets a 404, another user's item a 403, and starting one while another runs gets a 422 ("Finish your current
  curiosity time first").
- `PATCH` adds 5 more minutes, counted from the end or from now if that has passed, and sets `is_curiosity_extended`.
  A second extension gets a 422 ("You've already added more time").
- `DELETE` ends it; the item stays parked. `PATCH` and `DELETE` get a 404 when none is running.

## Time logs

A time log belongs to a user, and usually to one of their tasks. A `manual` log (time logged afterwards from the
Calendar) can go without a task; it then has a `title` of its own. So can a session on a routine: send `routine_id`
instead of `task_id` (another user's or a deleted routine gets a 404). Its `timer_preset` defaults to the routine's
`duration_minutes`. Completing it only logs the time, and bailing out of it leaves no breadcrumb. Time logs include
`routine_id` and `routine_title`. Another user's time log gets a 403. A deleted or
unknown time log gets a 404. A time log whose task was deleted is still listed, moved and deleted like any other, but
no new log can be started or logged on that task.

`POST /api/time_logs` accepts these fields:

| Field          | Notes                                                                                            |
| -------------- | ------------------------------------------------------------------------------------------------ |
| `mode`         | Required, `timer`, `stopwatch` or `manual`                                                       |
| `timer_preset` | Optional, whole number of minutes, at least 2 (the least a session can log; `timer`/`stopwatch`) |
| `title`        | `manual` only: required without a `task_id`, up to 255 characters                                |
| `started_at`   | `manual` only, required: no more than 24 hours ago                                               |
| `completed_at` | `manual` only, required: after `started_at`, and not in the future                               |

A `manual` log is saved finished: `is_running` is `false`, and `accumulated_elapsed_seconds` is the time from
`started_at` to `completed_at`. Its times allow 5 minutes of clock drift. A log that breaks these rules gets a 422.
`task_id` is optional for it; when given, the same task rules apply as for any other log.

A user does one thing at a time, so their time logs can't overlap. Creating a log (of any mode), or moving one with
`PATCH /api/time_logs/:id`, gets a 422 (`"This overlaps another session. You can only do one thing at a time."`) when
its span shares any moment with another of their time logs. Logs may touch, one ending as the next starts. A running log
has no end yet, so it blocks everything after its start: end it before starting another, or logging time after its
start. Deleted logs don't count, but the logs of a deleted task do. A database constraint
(`time_logs_no_overlap`) backs this up, so two requests at once can't both get in. `POST /api/quick_starts` follows the same rule.

A `timer` or `stopwatch` log starts running at once: the server sets `started_at` and `current_run_started_at` to the current time,
`is_running` to `true`, `accumulated_elapsed_seconds` to 0 and `completed_at` to `null`. Any of these sent by the client
are ignored.

`time_log` also includes `id`, `task_id` (`null` for a log with only a title), `title`, `task_title` (its task's title, or
`null`), `life_area_id` (its task's area of life, or `null`), `is_task_deleted` (whether its task was deleted), `buffer_minutes`, `is_finished_early`, `created_at`, `updated_at` and `current_break`, which is
`{ id, intention, duration_minutes, ends_at }` during a break and `null` otherwise
(`app/views/api/time_logs/_time_log.json.jbuilder`).

`POST /api/time_logs/:time_log_id/completion` ends a session, in one transaction:

- The time log stops: its elapsed time moves into `accumulated_elapsed_seconds`, `is_running` becomes `false`,
  `current_run_started_at` is cleared and `completed_at` is set.
- With `discard_overrun: true`, a `timer` that ran past zero logs only its planned time: `accumulated_elapsed_seconds`
  is capped at `(timer_preset + buffer_minutes)` minutes. Without it (the default), all the time is kept. A stopwatch,
  or a timer still short of zero, is unaffected.
- Its task gets `is_completed: true`.
- If the log is `is_finished_early`, the user's `early_finish` achievement count goes up by 1. A log is finished early
  when it's a `timer` with a `timer_preset` and less time elapsed than the preset. A stopwatch never is.

A session needs at least 2 minutes of focus (`TimeLog::MIN_LOGGED_MINUTES`, counted from `accumulated_elapsed_seconds`
plus the current run, so breaks don't count) to be logged, for a timer and a stopwatch alike. Under that, completing it
gets a 422 (`"Focus for at least 2 minutes to log a session. Discard it instead."`) and nothing changes; discard it with
`DELETE /api/time_logs/:id` instead. Bailing out has the same limit.

Completing a log that's already completed changes nothing and returns it again. Another user's time log gets a 403, and
a deleted or unknown one gets a 404.

`POST /api/time_logs/:time_log_id/extension` adds `minutes` (a positive whole number) to a timer's `buffer_minutes`, which
starts at 0. A session runs for `timer_preset` + `buffer_minutes`:

- The buffer can reach 60 minutes per session. Going past that gets a 422, and so does a completed time log or a stopwatch.
- `accumulated_elapsed_seconds` is capped at the old total, and a running log's `current_run_started_at` restarts, so a
  timer that ran past zero gets all the added minutes.
- `is_finished_early` still compares against `timer_preset` alone, so finishing inside the buffer isn't finishing early.

Another user's time log gets a 403, and a deleted or unknown one gets a 404. `POST /api/time_logs` ignores
`buffer_minutes`.

`POST /api/time_logs/:time_log_id/bail_out` ends a session without finishing it, in one transaction:

- Under 2 minutes of focus it gets the same 422 as completing, with no breadcrumb saved.
- A breadcrumb is saved on the time log's task, with `restart_description` (required) and `completed_description` (optional, blank
  is saved as `null`), each up to 1000 characters. Invalid values get a 422 and the session keeps going.
- The time log stops the same way as on completion, including `completed_at` and `discard_overrun`, and any open break
  ends.
- The task stays open, no achievement is awarded, and `is_finished_early` stays `false`.

Bailing out of a time log that has already ended changes nothing and returns it again. Another user's time log gets a 403,
and a deleted or unknown one gets a 404.

`POST /api/time_logs/:time_log_id/break` pauses a session, in one transaction:

- A break is created with `intention` (required, up to 100 characters) and `duration_minutes` (1–15), and `ends_at` is set
  from the duration. Invalid values get a 422, and so does a completed time log.
- The time log stops: its elapsed time moves into `accumulated_elapsed_seconds`, `is_running` becomes `false`,
  `current_run_started_at` is cleared.

`PATCH /api/time_logs/:time_log_id/break` ends the break: `ended_at` is set, `is_running` becomes `true` and
`current_run_started_at` restarts. The time log stays paused after `ends_at` until this is called.

Pausing during a break, or ending a break when none is open, changes nothing and returns the time log. Completing a time
log also ends its break. Another user's time log gets a 403, and a deleted or unknown one gets a 404.

`GET /api/current_time_log` returns the signed-in user's most recently started time log that isn't completed or deleted.
With no such log, it returns 200 with `{ "time_log": null }`.

`POST /api/time_logs` requires a `task_id`, except for a `manual` log. A missing, unknown or deleted task gets a 404, and
another user's task gets a 403.

`PATCH /api/time_logs/:id` moves a `manual` log, as when it's dragged on the Calendar. It takes `started_at` and
`completed_at`, with the same rules as logging one (no more than 24 hours ago, not in the future, the end after the
start), and sets `accumulated_elapsed_seconds` to the new span. A `timer` or `stopwatch` log, finished or running, gets a
422 ("Only a manually logged session can be moved."). Other fields are ignored.

`DELETE /api/time_logs/:id` soft deletes a session: the Timer's discard, or the Calendar's delete for one logged by
mistake. `POST /api/time_logs/:time_log_id/restoration` brings back a deleted finished session (the Calendar's Undo). A
session that isn't deleted, or was deleted while still running, gets a 404. One whose time another session has taken
since gets the overlap 422.

## Calendar events

`GET /api/calendar_events?from=…&to=…` returns what the Calendar shows between two ISO 8601 times, unpaged:

- `tasks`: the user's undeleted, incomplete tasks scheduled in the range: those starting before `to` and ending (`ends_at`,
  or a day after `starts_at` for a task with only a date) at or after `from`. Soonest first, in the task shape above.
- `time_logs`: the user's undeleted time logs overlapping the range (a running one reaches up to now), oldest first, in the
  time log shape above.

`from` must be before `to`, at most 1100 days apart (the year view asks for three years); anything else, or a missing or unparsable time, gets a 422.

## User preference

The signed-in user's settings, one per account (`UserPreference`), returned as
`{ theme, completion_sound, break_alarm_sound, week_starts_on }`.

| Field               | Values                                                                                     | Default   |
| ------------------- | ------------------------------------------------------------------------------------------ | --------- |
| `theme`             | `system` (follow the device), `light`, `dark`                                              | `system`  |
| `completion_sound`  | `rising`, `crisp`, `wood`, `soft`, `glass`, `triple`, `tick_ding`, `bell`, `chime`, `none` | `rising`  |
| `break_alarm_sound` | `classic`, `digital`, `chimes`, `marimba`, `bell`                                          | `classic` |
| `week_starts_on`    | `0` (Sunday) to `6` (Saturday): the day the Calendar's weeks start on                      | `1`       |

- `GET` returns the defaults until the user first changes something; no row is saved by reading.
- `PATCH` changes only the fields it's given, saving the row on the first change. An unknown value gets a 422 and
  nothing is saved.
- Both only ever touch the signed-in user's preference, so there's no id in the path.
- The layout (`application.html.erb`) also reads `theme` to apply it before first paint.

## Sign-up

An account can only be created for a confirmed email address:

1. `POST /api/email_confirmations` emails a link to `/signup/:token` (Rails route `complete_signup`). It creates
   no user. If the address already has an account, it sends a "you already have an account" email instead, and
   the response is the same either way. An address that isn't a valid email gets a 422.
2. `POST /api/registration` reads the email address from the signed `token` (valid for 1 day,
   `User::SIGNUP_TOKEN_EXPIRES_IN`), creates the user and signs them in. An invalid or expired token gets a 404.
   Reusing a token after its account exists gets a 422 ("Email address has already been taken").
