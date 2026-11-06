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

| Method | Path                                     | Body                                         | Success                      |
| ------ | ---------------------------------------- | -------------------------------------------- | ---------------------------- |
| GET    | `/api/session`                           | –                                            | 200 `{ user }`               |
| POST   | `/api/session`                           | `email_address`, `password`                  | 201 `{ user }`, sets cookie  |
| DELETE | `/api/session`                           | –                                            | 204                          |
| POST   | `/api/email_confirmations`               | `email_address`                              | 202 `{ message }`            |
| POST   | `/api/registration`                      | `token`, `password`, `password_confirmation` | 201 `{ user }`, sets cookie  |
| POST   | `/api/passwords`                         | `email_address`                              | 202 `{ message }`            |
| PATCH  | `/api/passwords/:token`                  | `password`, `password_confirmation`          | 204, signs out everywhere    |
| GET    | `/api/tasks`                             | `page` query param (optional)                | 200 `{ tasks, … }`           |
| GET    | `/api/tasks/:id`                         | –                                            | 200 `{ task }`               |
| POST   | `/api/tasks`                             | Task fields (`title` required)               | 201 `{ task }`               |
| PATCH  | `/api/tasks/:id`                         | Task fields                                  | 200 `{ task }`               |
| DELETE | `/api/tasks/:id`                         | –                                            | 204, soft delete             |
| GET    | `/api/time_logs`                         | `page`, `task_id` query params (optional)    | 200 `{ time_logs, … }`       |
| GET    | `/api/time_logs/:id`                     | –                                            | 200 `{ time_log }`           |
| POST   | `/api/time_logs`                         | `task_id`, Time log fields                   | 201 `{ time_log }`           |
| PATCH  | `/api/time_logs/:id`                     | Time log fields                              | 200 `{ time_log }`           |
| DELETE | `/api/time_logs/:id`                     | –                                            | 204, soft delete             |
| POST   | `/api/time_logs/:time_log_id/completion` | –                                            | 201 `{ time_log }`           |
| POST   | `/api/time_logs/:time_log_id/extension`  | `minutes`                                    | 201 `{ time_log }`           |
| POST   | `/api/time_logs/:time_log_id/break`      | `intention`, `duration_minutes`              | 201 `{ time_log }`           |
| PATCH  | `/api/time_logs/:time_log_id/break`      | –                                            | 200 `{ time_log }`           |
| GET    | `/api/current_time_log`                  | –                                            | 200 `{ time_log }` or `null` |

`user` is `{ id, email_address }` (`app/views/api/users/_user.json.jbuilder`). All ids are UUIDs.

## Tasks

Tasks belong to the signed-in user. `GET /api/tasks` lists only their undeleted tasks, oldest first. Another user's task
gets a 403. A deleted or unknown task gets a 404.

The list returns 20 tasks per page, as `{ tasks, tasks_count, page, total_pages }`. `tasks_count` is the total across all
pages. A missing or invalid `page` returns the first page, and a page past the end returns an empty `tasks`.

The writable task fields are `title`, `description`, `estimated_minutes`, `is_duration`, `is_all_day`, `is_completed`,
`starts_at` and `ends_at`.

`task` also includes `id`, `created_at`, `updated_at` and `checklist_items`, each `{ id, title, is_completed }`, in
position order (`app/views/api/tasks/_task.json.jbuilder`).

`POST /api/tasks` also accepts `checklist_items_attributes`, an array of `{ title, is_completed }` (`title` required), and
creates the items with the task, positioned in array order. If any item is invalid, the request gets a 422 and nothing
is saved. Checklist items can't be changed after that for now: `PATCH /api/tasks/:id` ignores them.

## Time logs

A time log belongs to a task, and through it to the task's owner. `GET /api/time_logs` lists only the signed-in user's
undeleted time logs, oldest first, and `task_id` narrows them to one task. Another user's time log gets a 403. A deleted
or unknown time log gets a 404, and so does a time log whose task was deleted.

The list returns 20 time logs per page, as `{ time_logs, time_logs_count, page, total_pages }`, with the same page handling
as tasks.

The writable fields are:

| Field                         | Notes                                      |
| ----------------------------- | ------------------------------------------ |
| `mode`                        | Required, `timer` or `stopwatch`           |
| `started_at`                  | Required, datetime                         |
| `timer_preset`                | Optional, positive whole number of minutes |
| `accumulated_elapsed_seconds` | Defaults to 0, can't be negative           |
| `pause_count`                 | Defaults to 0, can't be negative           |
| `is_running`                  | Defaults to `false`                        |
| `current_run_started_at`      | Optional, datetime                         |
| `completed_at`                | Optional, datetime                         |

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
a deleted or unknown one gets a 404. `PATCH /api/time_logs/:id` with `completed_at` doesn't touch the task or achievements.

`POST /api/time_logs/:time_log_id/extension` adds `minutes` (a positive whole number) to a timer's `buffer_minutes`, which
starts at 0. A session runs for `timer_preset` + `buffer_minutes`:

- The buffer can reach 60 minutes per session. Going past that gets a 422, and so does a completed time log or a stopwatch.
- `accumulated_elapsed_seconds` is capped at the old total, and a running log's `current_run_started_at` restarts, so a
  timer that ran past zero gets all the added minutes.
- `is_finished_early` still compares against `timer_preset` alone, so finishing inside the buffer isn't finishing early.

Another user's time log gets a 403, and a deleted or unknown one gets a 404. `PATCH /api/time_logs/:id` ignores
`buffer_minutes`.

`POST /api/time_logs/:time_log_id/break` pauses a session, in one transaction:

- A break is created with `intention` (required, up to 100 characters) and `duration_minutes` (1–15), and `ends_at` is set
  from the duration. Invalid values get a 422, and so does a completed time log.
- The time log stops: its elapsed time moves into `accumulated_elapsed_seconds`, `is_running` becomes `false`,
  `current_run_started_at` is cleared and `pause_count` goes up by 1.

`PATCH /api/time_logs/:time_log_id/break` ends the break: `ended_at` is set, `is_running` becomes `true` and
`current_run_started_at` restarts. The time log stays paused after `ends_at` until this is called.

Pausing during a break, or ending a break when none is open, changes nothing and returns the time log. Completing a time
log also ends its break. Another user's time log gets a 403, and a deleted or unknown one gets a 404.

`GET /api/current_time_log` returns the signed-in user's most recently started time log that isn't completed or deleted.
With no such log, it returns 200 with `{ "time_log": null }`.

`POST /api/time_logs` requires a `task_id`. A missing, unknown or deleted task gets a 404, and another user's task gets a 403. A time log can't move to another task: `PATCH /api/time_logs/:id` ignores `task_id`.

## Sign-up

An account can only be created for a confirmed email address:

1. `POST /api/email_confirmations` emails a link to `/signup/:token` (Rails route `complete_signup`). It creates
   no user. If the address already has an account, it sends a "you already have an account" email instead, and
   the response is the same either way. An address that isn't a valid email gets a 422.
2. `POST /api/registration` reads the email address from the signed `token` (valid for 1 day,
   `User::SIGNUP_TOKEN_EXPIRES_IN`), creates the user and signs them in. An invalid or expired token gets a 404.
   Reusing a token after its account exists gets a 422 ("Email address has already been taken").
