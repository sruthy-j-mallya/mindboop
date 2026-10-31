# Agent notes

Read `README.md` for the stack and commands. Agent config lives in `.agents/` (`.claude` is a symlink to it).

## Conventions

- Plans go in `.agents/plans/NNN-slug.md` (one file per plan, no folder); update the plan's status when work lands.
- Toolchain is pinned in `mise.toml`; run commands through mise (`mise exec -- …` or an activated shell).
- Use pnpm, never npm/yarn. New build-script deps must be added to `allowBuilds` in `pnpm-workspace.yaml`.
- TypeScript is pinned to 6.x until typescript-eslint supports TS 7.
- Backend endpoints for the SPA go under `Api::` (inherit `Api::BaseController`) and return JSON.
  Client routes are served by `SpaController#show` via the HTML catch-all in `config/routes.rb`.
- Frontend: `@/` aliases `app/frontend`. Server state goes through TanStack Query hooks in `app/frontend/lib`.
  The `api()` helper sends the CSRF token from the layout's meta tag.
- shadcn components live in `app/frontend/components/ui` (add with `pnpm dlx shadcn@latest add <name>`).

## Before finishing a change

`bin/rubocop && pnpm lint && pnpm typecheck && bundle exec rspec && pnpm test` (and `pnpm e2e` for UI flows).
