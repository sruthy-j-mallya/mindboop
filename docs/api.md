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
| 404    | Record or token not found                         |
| 422    | Validation failed (`full_messages.to_sentence`)   |
| 429    | Rate limit hit (sign in, sign up, password reset) |

## Endpoints

| Method | Path                    | Body                                                 | Success                     |
| ------ | ----------------------- | ---------------------------------------------------- | --------------------------- |
| GET    | `/api/session`          | –                                                    | 200 `{ user }`              |
| POST   | `/api/session`          | `email_address`, `password`                          | 201 `{ user }`, sets cookie |
| DELETE | `/api/session`          | –                                                    | 204                         |
| POST   | `/api/registration`     | `email_address`, `password`, `password_confirmation` | 201 `{ user }`, sets cookie |
| POST   | `/api/passwords`        | `email_address`                                      | 202 `{ message }`           |
| PATCH  | `/api/passwords/:token` | `password`, `password_confirmation`                  | 204, signs out everywhere   |

`user` is `{ id, email_address }` (`app/views/api/users/_user.json.jbuilder`).
