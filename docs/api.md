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

| Method | Path                                      | Body                                                      | Success                       |
| ------ | ----------------------------------------- | --------------------------------------------------------- | ----------------------------- |
| GET    | `/api/session`                            | –                                                         | 200 `{ user }`                |
| POST   | `/api/session`                            | `email_address`, `password`                               | 201 `{ user }`, sets cookie   |
| DELETE | `/api/session`                            | –                                                         | 204                           |
| POST   | `/api/email_confirmations`                | `email_address`                                           | 202 `{ message }`             |
| POST   | `/api/registration`                       | `token`, `password`, `password_confirmation`              | 201 `{ user }`, sets cookie   |
| POST   | `/api/passwords`                          | `email_address`                                           | 202 `{ message }`             |
| PATCH  | `/api/passwords/:token`                   | `password`, `password_confirmation`                       | 204, signs out everywhere     |
| GET    | `/api/tasks`                              | `page`, `is_completed` query params (optional)            | 200 `{ tasks, … }`            |
| GET    | `/api/tasks/:id`                          | –                                                         | 200 `{ task }`                |
| POST   | `/api/tasks`                              | Task fields (`title` required)                            | 201 `{ task }`                |
| PATCH  | `/api/tasks/:id`                          | Task fields                                               | 200 `{ task }`                |
| DELETE | `/api/tasks/:id`                          | –                                                         | 204, soft delete              |
| POST   | `/api/tasks/:task_id/restoration`         | –                                                         | 201 `{ task }`, undoes delete |
| POST   | `/api/tasks/:task_id/checklist_items`     | `title`, `is_completed`, `position` (optional)            | 201 `{ task }`                |
| PATCH  | `/api/tasks/:task_id/checklist_items/:id` | `title`, `is_completed`, `position` (all optional)        | 200 `{ task }`                |
| DELETE | `/api/tasks/:task_id/checklist_items/:id` | –                                                         | 200 `{ task }`, soft delete   |
| POST   | `/api/quick_starts`                       | Task fields, `estimated_minutes` required                 | 201 `{ task, time_log }`      |
| POST   | `/api/time_logs`                          | `task_id`, Time log fields                                | 201 `{ time_log }`            |
| DELETE | `/api/time_logs/:id`                      | –                                                         | 204, soft delete              |
| POST   | `/api/time_logs/:time_log_id/completion`  | –                                                         | 201 `{ time_log }`            |
| POST   | `/api/time_logs/:time_log_id/extension`   | `minutes`                                                 | 201 `{ time_log }`            |
| POST   | `/api/time_logs/:time_log_id/bail_out`    | `restart_description`, `completed_description` (optional) | 201 `{ time_log }`            |
| POST   | `/api/time_logs/:time_log_id/break`       | `intention`, `duration_minutes`                           | 201 `{ time_log }`            |
| PATCH  | `/api/time_logs/:time_log_id/break`       | –                                                         | 200 `{ time_log }`            |
| GET    | `/api/current_time_log`                   | –                                                         | 200 `{ time_log }` or `null`  |
| GET    | `/api/parking_lot_items`                  | `page`, `status`, `since` query params (optional)         | 200 list (see below)          |
| POST   | `/api/parking_lot_items`                  | `content`, `kind` (optional)                              | 201 `{ parking_lot_item }`    |
| PATCH  | `/api/parking_lot_items/:id`              | `content`, `kind`, `status` (all optional)                | 200 `{ parking_lot_item }`    |
| DELETE | `/api/parking_lot_items/:id`              | –                                                         | 204, soft delete              |
| POST   | `/api/parking_lot_items/:id/conversion`   | –                                                         | 201, adds a task              |
| POST   | `/api/parking_lot_items/:id/restoration`  | –                                                         | 201, undoes discard           |

`user` is `{ id, email_address }` (`app/views/api/users/_user.json.jbuilder`). All ids are UUIDs.

## Tasks

Tasks belong to the signed-in user. `GET /api/tasks` lists only their undeleted tasks, oldest first. Another user's task
gets a 403. A deleted or unknown task gets a 404.

`POST /api/tasks/:task_id/restoration` brings back a deleted task (the Inbox's Undo). A task that isn't deleted gets a 404.

The list returns 20 tasks per page, as `{ tasks, tasks_count, page, total_pages }`. `tasks_count` is the total across all
pages. A missing or invalid `page` returns the first page, and a page past the end returns an empty `tasks`.

`is_completed=false` lists only incomplete tasks (the Inbox), and `is_completed=true` only completed ones. Leaving it out
lists every task.

The writable task fields are `title`, `description`, `estimated_minutes`, `is_duration`, `is_all_day`, `is_completed`,
`starts_at` and `ends_at`.

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

`task` also includes `id`, `created_at`, `updated_at` and `checklist_items`, each `{ id, title, is_completed }`, in
position order (`app/views/api/tasks/_task.json.jbuilder`). Checklist items are soft-deleted (Discard), and discarded
items are left out.

`POST /api/tasks` also accepts `checklist_items_attributes`, an array of `{ title, is_completed }` (`title` required), and
creates the items with the task, positioned in array order. If any item is invalid, the request gets a 422 and nothing
is saved. `PATCH /api/tasks/:id` ignores them; change items one at a time through the checklist item endpoints.

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
  `POST /api/tasks`, except that `estimated_minutes` is required. Other task fields are ignored.
- The time log is a running `timer` whose `timer_preset` is the task's `estimated_minutes`. It starts the same way as one
  from `POST /api/time_logs`, and time log fields sent by the client are ignored.
- If the task, a checklist item or the time log is invalid, the request gets a 422 and nothing is saved.

It returns `{ task, time_log }`, in the same shapes as the task and time log endpoints.

## Parking lot

Parking lot items are stray thoughts parked during focus, and belong to the signed-in user. Another user's item gets
a 403, and a discarded or unknown item gets a 404. The conversion and restoration endpoints return `{ parking_lot_item }`.

An item is `{ id, content, kind, status, task_id, created_at, updated_at }`.

- `content` is required, up to 1,000 characters (stripped). `kind` is `idea` (the default), `question` or `task`.
- `status` starts as `parked`. `PATCH` moves it between `parked` and `addressed`. `converted` is set only by the
  conversion endpoint, which also sets `task_id`; any other combination gets a 422.
- `GET` lists undeleted items newest first, 20 a page, as `{ parking_lot_items, parking_lot_items_count, page,
total_pages }`. `status` lists one status. `since` (an ISO 8601 time) lists items created from then on (the Timer's
  panel passes the session's `started_at`); an unparsable `since` is ignored.
- `POST /api/parking_lot_items/:id/conversion` adds a parked item to the Inbox as a task titled with its `content`, and
  marks it `converted`, in one transaction. An item that isn't parked gets a 404; a repeated request makes no second task.
- `DELETE` soft-deletes (discards) the item. `POST /api/parking_lot_items/:id/restoration` brings it back; an item that
  isn't discarded gets a 404.

## Time logs

A time log belongs to a task, and through it to the task's owner. Another user's time log gets a 403. A deleted or
unknown time log gets a 404, and so does a time log whose task was deleted.

`POST /api/time_logs` accepts these fields:

| Field          | Notes                                      |
| -------------- | ------------------------------------------ |
| `mode`         | Required, `timer` or `stopwatch`           |
| `timer_preset` | Optional, positive whole number of minutes |

A new time log starts running at once: the server sets `started_at` and `current_run_started_at` to the current time,
`is_running` to `true`, `accumulated_elapsed_seconds` to 0 and `completed_at` to `null`. Any of these sent by the client
are ignored.

`time_log` also includes `id`, `task_id`, `buffer_minutes`, `is_finished_early`, `created_at`, `updated_at` and `current_break`, which is
`{ id, intention, duration_minutes, ends_at }` during a break and `null` otherwise
(`app/views/api/time_logs/_time_log.json.jbuilder`).

`POST /api/time_logs/:time_log_id/completion` ends a session, in one transaction:

- The time log stops: its elapsed time moves into `accumulated_elapsed_seconds`, `is_running` becomes `false`,
  `current_run_started_at` is cleared and `completed_at` is set.
- Its task gets `is_completed: true`.
- If the log is `is_finished_early`, the user's `early_finish` achievement count goes up by 1. A log is finished early
  when it's a `timer` with a `timer_preset` and less time elapsed than the preset. A stopwatch never is.

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

- A breadcrumb is saved on the time log's task, with `restart_description` (required) and `completed_description` (optional, blank
  is saved as `null`), each up to 1000 characters. Invalid values get a 422 and the session keeps going.
- The time log stops the same way as on completion, including `completed_at`, and any open break ends.
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

`POST /api/time_logs` requires a `task_id`. A missing, unknown or deleted task gets a 404, and another user's task gets a 403.

## Sign-up

An account can only be created for a confirmed email address:

1. `POST /api/email_confirmations` emails a link to `/signup/:token` (Rails route `complete_signup`). It creates
   no user. If the address already has an account, it sends a "you already have an account" email instead, and
   the response is the same either way. An address that isn't a valid email gets a 422.
2. `POST /api/registration` reads the email address from the signed `token` (valid for 1 day,
   `User::SIGNUP_TOKEN_EXPIRES_IN`), creates the user and signs them in. An invalid or expired token gets a 404.
   Reusing a token after its account exists gets a 422 ("Email address has already been taken").
