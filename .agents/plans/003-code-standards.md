# 003 — Code standards

Status: done
Date: 2026-10-31

## Goal

Adopt coding standards adapted from neeto-auth-web (minus private `@bigbinary/*`/`neeto*` packages), record them
as a Claude rule in `.agents/rules/code-standards.md`, and migrate the existing code to them.

## Decisions (conflicts between the neeto standard and this repo)

| Area | Choice |
| --- | --- |
| Frontend layout | Neeto layout under `app/frontend`: `apis/`, `hooks/reactQuery/`, `stores/`, `constants/`, `utils/`, `components/{commons,ui,<Feature>}`, `routes.ts`, `Main.tsx` |
| Aliases | Keep the single `@/` alias |
| HTTP | axios (`apis/axios.ts`) with CSRF header and interceptors; one `apis/<resource>.ts` per Rails resource |
| Casing | camelCase on the client, snake_case on the server, converted by axios interceptors |
| Query keys | One central `QUERY_KEYS` in `constants/query.ts` |
| Hook names | Verb-first (`useCurrentUser`, `useLogin`, `useCreateNote`) |
| Components | Arrow functions + default export (shadcn `components/ui` stays as generated) |
| Import order | Enforced by ESLint (`simple-import-sort`), blank lines between groups; no JSX prop sorting |
| Forms | React Hook Form + Zod; `<ENTITY>_VALIDATION_SCHEMA` / `INITIAL_FORM_VALUES` in `constants.ts` |
| Route paths | Central `routes` object in `app/frontend/routes.ts` |
| i18n | Deferred |
| Client state | Zustand conventions documented; add the dependency only when needed |
| Test selectors | Role/label first; `data-testid` only as a fallback |
| API versioning | Unversioned `Api::` |
| Serialization | Jbuilder views under `app/views/api/` |
| Error shape | Always `{ error: "…" }`; validation errors use `full_messages.to_sentence` with `:unprocessable_content` |
| Authorization | Pundit from the start, `verify_authorized` / `verify_policy_scoped` in `Api::BaseController` |
| Backend tests | Minitest + FactoryBot (replaces RSpec) |
| Ruby style | Omakase + `Rails/TimeZone`, `Rails/Date`, `Layout/ClassStructure`, `Bundler/OrderedGems`; no `frozen_string_literal` |
| Services | `#process!` (raises) / `#process` (doesn't), grouped by domain |
| Tooling | Add `.editorconfig`, ESLint sonarjs/security/no-unsanitized/promise, Lefthook auto-fix, `docs/` folder |

## Steps

1. Rule file `.agents/rules/code-standards.md`; pointer in `AGENTS.md`.
2. Frontend deps: axios, react-hook-form, zod, @hookform/resolvers; ESLint plugins.
3. Restructure `app/frontend` (apis, hooks, constants, utils, components, routes.ts, Main.tsx), convert
   components to arrow + default export, forms to RHF + Zod, paths to `routes`.
4. Backend: jbuilder + pundit gems; Jbuilder views for users; single error shape; Pundit in `BaseController`.
5. Replace RSpec with Minitest (`test/`), port all specs; update CI, `config/ci.rb`, README, AGENTS.md.
6. RuboCop extra cops, Gemfile ordering; `.editorconfig`; Lefthook auto-fix; `docs/api.md`.
7. Verify: rubocop, lint, typecheck, rails test, vitest, playwright.

## Outcome / deviations

- `Api::BaseController` uses `if:`/`unless:` conditions for the Pundit `after_action`s: `only: :index` raises in
  Rails 7.1+ on controllers without an `index` action.
- The auth controllers (session, registration, passwords) skip `verify_authorized` with a comment: they act on the
  caller's own session or a reset token, not a policy-guarded record.
- `@hookform/resolvers` resolved to 6.x (7.x not yet installable); it supports Zod 4.
- `lib/utils.ts` (`cn`) was unused — shadcn components import `cn` from the `cn` package — so it was removed and
  `components.json` aliases point at `@/utils`.
- Vitest stubs the API modules (`vi.spyOn(sessionsApi, …)`) instead of `fetch`; interceptor behaviour is covered
  by `apis/axios.test.ts` with a stub adapter.
- Verified: RuboCop, ESLint, Prettier, tsc, Minitest (15), Vitest (8), Playwright (1) green.
