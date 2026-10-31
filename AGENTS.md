# Agent notes

Read `README.md` for the stack and commands. Agent config lives in `.agents/` (`.claude` is a symlink to it).

## Conventions

- Plans go in `.agents/plans/NNN-slug.md` (one file per plan, no folder); update the plan's status when work lands.
- Toolchain is pinned in `mise.toml`; run commands through mise (`mise exec -- …` or an activated shell).
- Use pnpm, never npm/yarn. New build-script deps must be added to `allowBuilds` in `pnpm-workspace.yaml`.
- TypeScript is pinned to 6.x until typescript-eslint supports TS 7.
- Coding standards (frontend + Rails) are in `.agents/rules/code-standards.md`; follow them.
- Backend endpoints for the SPA go under `Api::` (inherit `Api::BaseController`, authorize with Pundit, render
  Jbuilder). Client routes are served by `SpaController#show` via the HTML catch-all in `config/routes.rb`.
- Frontend: `@/` aliases `app/frontend`. HTTP goes through `apis/` (the axios client in `apis/axios.ts` sends the
  CSRF token and converts camelCase ↔ snake_case); server state through TanStack Query hooks in `hooks/reactQuery`.
- shadcn components live in `app/frontend/components/ui` (add with `pnpm dlx shadcn@latest add <name>`).
- API endpoints are documented in `docs/api.md`; update it when endpoints change.

## Before finishing a change

`bin/rubocop && pnpm lint && pnpm typecheck && bin/rails test && pnpm test` (and `pnpm e2e` for UI flows).
