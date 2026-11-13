# Mindboop

Rails 8.1 + React 19 monorepo. Rails serves a JSON API and an SPA shell; the React app lives in
`app/frontend` and is bundled by Vite via [vite_ruby](https://vite-ruby.netlify.app/).

## Stack

- **Backend:** Rails 8.1, PostgreSQL, Rails 8 cookie-session auth (JSON endpoints under `/api`)
- **Backend extras:** Pundit (authorization), Jbuilder (JSON views)
- **Frontend:** React 19, TypeScript, React Router, TanStack Query, axios, React Hook Form + Zod, Tailwind CSS v4,
  shadcn/ui, Tiptap (rich-text task descriptions, stored as Markdown)
- **Tooling:** mise (Ruby/Node/pnpm), pnpm workspaces (`packages/*`), foreman, Lefthook
- **Tests:** Minitest + FactoryBot, Vitest + Testing Library, Playwright
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
| `bin/rails test`                                                  | Backend tests (Minitest)                                   |
| `pnpm test`                                                       | Vitest component/unit tests                                |
| `pnpm e2e`                                                        | Playwright end-to-end tests (boots a test server on :5100) |
| `bin/rubocop`, `pnpm lint`, `pnpm format:check`, `pnpm typecheck` | Linters                                                    |
| `bin/ci`                                                          | Run every CI step locally                                  |

## Deployment

Railway (Docker + Postgres, Solid Queue in Puma, Resend mail). See [docs/deployment.md](docs/deployment.md).

## Layout

```
app/controllers/api/     JSON API controllers
app/controllers/spa_controller.rb   Serves the React shell for client routes
app/policies/            Pundit policies
app/views/api/           Jbuilder JSON views
app/frontend/            React app (apis, hooks/reactQuery, components, constants, utils, routes.ts)
packages/                Shared JS workspace packages
test/                    Minitest
docs/                    API and architecture notes
e2e/                     Playwright
.agents/                 Agent config, rules and plans (.claude symlinks here)
```

## Adding shadcn components

```sh
pnpm dlx shadcn@latest add dialog
```
