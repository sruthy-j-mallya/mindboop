# Mindboop

Rails 8.1 + React 19 monorepo. Rails serves a JSON API and an SPA shell; the React app lives in
`app/frontend` and is bundled by Vite via [vite_ruby](https://vite-ruby.netlify.app/).

## Stack

- **Backend:** Rails 8.1, PostgreSQL, Rails 8 cookie-session auth (JSON endpoints under `/api`)
- **Frontend:** React 19, TypeScript, React Router, TanStack Query, Tailwind CSS v4, shadcn/ui
- **Tooling:** mise (Ruby/Node/pnpm), pnpm workspaces (`packages/*`), foreman, Lefthook
- **Tests:** RSpec + FactoryBot, Vitest + Testing Library, Playwright
- **Lint:** RuboCop (omakase), ESLint, Prettier, Brakeman, bundler-audit

## Setup

Requires [mise](https://mise.jdx.dev) and a local PostgreSQL server.

```sh
mise install
bin/setup        # bundle, pnpm install, db:prepare, then starts bin/dev
```

## Common commands

| Command                                                           | What it does                                               |
| ----------------------------------------------------------------- | ---------------------------------------------------------- |
| `bin/dev`                                                         | Rails on :3000 + Vite dev server (HMR)                     |
| `bundle exec rspec`                                               | Backend specs                                              |
| `pnpm test`                                                       | Vitest component/unit tests                                |
| `pnpm e2e`                                                        | Playwright end-to-end tests (boots a test server on :5100) |
| `bin/rubocop`, `pnpm lint`, `pnpm format:check`, `pnpm typecheck` | Linters                                                    |
| `bin/ci`                                                          | Run every CI step locally                                  |

## Layout

```
app/controllers/api/     JSON API controllers
app/controllers/spa_controller.rb   Serves the React shell for client routes
app/frontend/            React app (entrypoints, routes, components, lib)
packages/                Shared JS workspace packages
spec/                    RSpec
e2e/                     Playwright
.agents/                 Agent config and plans (.claude symlinks here)
```

## Adding shadcn components

```sh
pnpm dlx shadcn@latest add dialog
```
