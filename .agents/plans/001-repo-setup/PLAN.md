# 001 — Repo setup: Rails + React monorepo

Status: done
Date: 2026-10-31

## Goal

Bootstrap `mindboop` as a single Rails app at the repo root serving a React SPA through
vite_ruby, with a pnpm workspace (`packages/*`) for shared JS packages.

## Decisions (from setup interview)

| Area | Choice |
| --- | --- |
| Architecture | One Rails app; React mounted via `vite_rails` |
| Layout | Rails at repo root, React in `app/frontend`, pnpm workspace `packages/*` |
| Versions | mise (`mise.toml`): Ruby 4.0.x, Node 26 (LTS), pnpm 12 |
| Framework | Rails 8.1 |
| Database | PostgreSQL (local Homebrew Postgres 18) |
| Frontend | TypeScript, Vite, pnpm |
| Routing / data | React Router + TanStack Query, JSON from Rails controllers |
| Styling | Tailwind CSS v4 (`@tailwindcss/vite`) + shadcn/ui |
| Backend tests | RSpec + FactoryBot |
| Frontend tests | Vitest + React Testing Library (jsdom) |
| E2E tests | Playwright |
| Linting | RuboCop (`rubocop-rails-omakase`), ESLint (flat config) + Prettier |
| Auth | Rails 8 authentication generator (cookie session), exposed as JSON endpoints |
| Background/Solid stack | Skipped for now (`--skip-solid`) |
| Dev runner | `bin/dev` + foreman, `Procfile.dev` runs Rails + Vite |
| Git hooks | Lefthook (pre-commit lint) |
| CI | GitHub Actions: lint + RSpec + Vitest + Playwright |

## Agent config

- `.agents/` is the canonical directory for agent config (plans, skills, settings).
- `.claude -> .agents` symlink so Claude Code picks it up.
- Plans live in `.agents/plans/NNN-slug/PLAN.md`.

## Target layout

```
.
├── .agents/plans/001-repo-setup/PLAN.md
├── .claude -> .agents
├── .github/workflows/ci.yml
├── app/
│   ├── controllers/            # Rails; api/* JSON controllers
│   ├── frontend/               # React (vite_ruby sourceCodeDir)
│   │   ├── entrypoints/application.tsx
│   │   ├── components/ui/      # shadcn components
│   │   ├── lib/                # api client, utils
│   │   ├── routes/             # React Router pages
│   │   └── styles/application.css
│   └── views/layouts/application.html.erb
├── e2e/                        # Playwright specs
├── packages/                   # shared JS workspace packages
├── spec/                       # RSpec
├── Procfile.dev
├── lefthook.yml
├── mise.toml
├── package.json / pnpm-workspace.yaml
└── vite.config.mts / config/vite.json
```

## Steps

1. **Toolchain** — `mise.toml` pinning ruby, node, pnpm; `mise install`; `gem install rails`.
2. **Rails app** — `rails new . -d postgresql --skip-test --skip-system-test --skip-javascript
   --skip-asset-pipeline --skip-solid --skip-kamal --skip-thruster --skip-jbuilder --skip-git`
   (keep RuboCop omakase, brakeman, CI later replaced). Skip rails' own `.github` CI in favour of ours.
3. **vite_ruby** — add `vite_rails`, run `bundle exec vite install`, set `sourceCodeDir: app/frontend`,
   switch entrypoint to `application.tsx`, `vite_react_refresh_tag` in layout.
4. **pnpm workspace** — root `package.json` (private), `pnpm-workspace.yaml` with `packages/*`;
   add react, react-dom, react-router, @tanstack/react-query, typescript, @vitejs/plugin-react.
5. **Tailwind + shadcn** — `tailwindcss` + `@tailwindcss/vite`, `@/` path alias, `components.json`,
   add `button` as a smoke-test component.
6. **SPA shell** — Rails `PagesController#app` catch-all route (HTML only) renders the layout;
   React Router handles client routes; TanStack Query client with fetch wrapper that sends CSRF token.
7. **Auth** — `bin/rails generate authentication`; add `Api::SessionsController` (create/destroy/show)
   and `Api::RegistrationsController` returning JSON; React login/signup pages.
8. **Testing** — rspec-rails + factory_bot_rails (`rails g rspec:install`), request specs for auth;
   Vitest + RTL + jsdom with one component test; Playwright with a smoke e2e (home page loads).
9. **Linting** — RuboCop omakase; ESLint flat config (typescript-eslint, react-hooks, react-refresh)
   + Prettier (with tailwind plugin) and `eslint-config-prettier`.
10. **Dev runner** — `Procfile.dev` (`web: bin/rails s`, `vite: bin/vite dev`), `bin/dev` via foreman.
11. **Lefthook** — pre-commit: rubocop on staged rb, eslint + prettier --check on staged ts/tsx.
12. **CI** — `.github/workflows/ci.yml`: postgres service, mise-action, jobs lint / test / e2e.
13. **Verify** — `bin/rails db:prepare`, `bundle exec rspec`, `pnpm test`, `pnpm lint`,
    `bundle exec rubocop`, `pnpm e2e`; boot `bin/dev` and confirm page renders.
14. **Docs + commit** — README with setup commands, `CLAUDE.md`/`AGENTS.md` notes; initial commit.

## Out of scope (later plans)

- Solid Queue/Cache/Cable, deployment (Kamal/other), Docker, error tracking.

## Outcome / deviations

- Versions: Ruby 4.0.9, Rails 8.1.4, Node 26, pnpm 12, React 19, Vite 8, Tailwind 4.3.
- TypeScript pinned to 6.x: typescript-eslint does not yet support TS 7.
- Password reset kept from the generator as JSON (`Api::PasswordsController`) + React pages; the mailer
  links to `/passwords/:token/edit`, which the SPA renders.
- The SPA catch-all only matches HTML requests (`Accept: text/html`), so unknown `/api` paths still 404.
- Rails' generated `Dockerfile` is untouched and doesn't install Node yet — fix it in the deployment plan.
- Added `AGENTS.md` with `CLAUDE.md` symlinked to it.
- Verified: RSpec (15), Vitest (1), Playwright (1), RuboCop, ESLint, Prettier, tsc, Brakeman all green; `bin/dev` serves the app with Vite HMR.
