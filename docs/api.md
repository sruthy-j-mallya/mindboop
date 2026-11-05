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

| Method | Path                       | Body                                         | Success                     |
| ------ | -------------------------- | -------------------------------------------- | --------------------------- |
| GET    | `/api/session`             | –                                            | 200 `{ user }`              |
| POST   | `/api/session`             | `email_address`, `password`                  | 201 `{ user }`, sets cookie |
| DELETE | `/api/session`             | –                                            | 204                         |
| POST   | `/api/email_confirmations` | `email_address`                              | 202 `{ message }`           |
| POST   | `/api/registration`        | `token`, `password`, `password_confirmation` | 201 `{ user }`, sets cookie |
| POST   | `/api/passwords`           | `email_address`                              | 202 `{ message }`           |
| PATCH  | `/api/passwords/:token`    | `password`, `password_confirmation`          | 204, signs out everywhere   |
| GET    | `/api/tasks`               | `page` query param (optional)                | 200 `{ tasks, … }`          |
| GET    | `/api/tasks/:id`           | –                                            | 200 `{ task }`              |
| POST   | `/api/tasks`               | Task fields (`title` required)               | 201 `{ task }`              |
| PATCH  | `/api/tasks/:id`           | Task fields                                  | 200 `{ task }`              |
| DELETE | `/api/tasks/:id`           | –                                            | 204, soft delete            |

`user` is `{ id, email_address }` (`app/views/api/users/_user.json.jbuilder`). All ids are UUIDs.

## Tasks

Tasks belong to the signed-in user. `GET /api/tasks` lists only their undeleted tasks, oldest first. Another user's task
gets a 403. A deleted or unknown task gets a 404.

The list returns 20 tasks per page, as `{ tasks, tasks_count, page, total_pages }`. `tasks_count` is the total across all
pages. A missing or invalid `page` returns the first page, and a page past the end returns an empty `tasks`.

The writable task fields are `title`, `description`, `estimated_minutes`, `is_duration`, `is_all_day`, `is_completed`,
`starts_at` and `ends_at`.

`task` also includes `id`, `created_at`, `updated_at` and `checklist_items`, each `{ id, title, is_completed }`, oldest
first (`app/views/api/tasks/_task.json.jbuilder`).

`POST /api/tasks` also accepts `checklist_items_attributes`, an array of `{ title, is_completed }` (`title` required), and
creates the items with the task. If any item is invalid, the request gets a 422 and nothing is saved. Checklist items
can't be changed after that for now: `PATCH /api/tasks/:id` ignores them.

## Sign-up

An account can only be created for a confirmed email address:

1. `POST /api/email_confirmations` emails a link to `/signup/:token` (Rails route `complete_signup`). It creates
   no user. If the address already has an account, it sends a "you already have an account" email instead, and
   the response is the same either way. An address that isn't a valid email gets a 422.
2. `POST /api/registration` reads the email address from the signed `token` (valid for 1 day,
   `User::SIGNUP_TOKEN_EXPIRES_IN`), creates the user and signs them in. An invalid or expired token gets a 404.
   Reusing a token after its account exists gets a 422 ("Email address has already been taken").
