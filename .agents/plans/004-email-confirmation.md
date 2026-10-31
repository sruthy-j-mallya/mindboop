# 004 — Email confirmation before sign-up

Status: done
Date: 2026-10-31

## Goal

Make confirming an email address a prerequisite for creating an account.

## Decisions

| Area | Choice |
| --- | --- |
| Flow | Confirm first, then create. No `users` row exists until the emailed link is used, so there are no unconfirmed accounts and no `confirmed_at` column |
| Token | `User.signup_token_for(email)`: a signed `ActiveSupport::MessageVerifier` token (`url_safe: true`, own key `user/signup`) carrying the normalized email, expiring after `User::SIGNUP_TOKEN_EXPIRES_IN` (1 day) |
| Endpoints | `POST /api/email_confirmations { email_address }` → 202; `POST /api/registration { token, password, password_confirmation }` → 201 + session |
| Enumeration | `email_confirmations#create` always returns 202. Registered addresses get `RegistrationsMailer#already_registered` instead of a link |
| Frontend | `/signup` asks only for email and then shows "Check your email"; `/signup/:token` (`CompleteSignup`) sets the password. `routes.signup` is now `{ new, complete }` |

## Outcome / deviations

- A token stays valid until it expires. Once its account exists, reusing it fails the uniqueness validation (422).
- `renderWithProviders` takes an optional `initialPath` so route-param screens can be tested.
- Playwright can't read the test server's mail, so `e2e/auth.spec.ts` mints the token with `bin/rails runner`.
- Verified: RuboCop, ESLint, Prettier, tsc, Minitest (26), Vitest (11), Playwright (1) green.
