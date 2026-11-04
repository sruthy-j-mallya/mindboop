# 005 — Railway deployment

Status: done (code); first Railway deploy pending
Date: 2026-11-03

## Goal

Make the app deployable to Railway with Postgres, durable mail delivery and HTTPS on the purchased domain.

## Decisions

| Area | Choice |
| --- | --- |
| Host | Railway (usage-based; ~₹440–530/month for one user), Singapore region. Compared against Render, Fly, Heroku, and Kamal on Hetzner/DigitalOcean; Railway was the lowest barrier to entry |
| Jobs | Solid Queue in the primary database (tables via migration, no separate `queue` DB), run inside Puma with `SOLID_QUEUE_IN_PUMA` so no worker service is needed |
| Mail | Resend's HTTP API through the `resend` gem, configured from env vars; no self-hosted mail server. Temporary failures retry through `Mailers::DeliveryJob` |
| Image | New `frontend` Docker stage (Node + pnpm) runs `pnpm build`; the final stage copies `public/vite` |
| Config | `railway.json` for the Dockerfile builder and `/up` health check; runbook in `docs/deployment.md` |

## Outcome / deviations

- Verified locally: the image builds; against Postgres 18 + Mailpit it migrates, serves `/up`, the SPA and
  hashed assets, and delivers a queued confirmation email with an `https://APP_HOST` link. Idle memory is about
  240 MB (app) + 60 MB (Postgres).
- SMTP was dropped before the first deploy: Railway blocks outbound SMTP on the Free, Trial and Hobby plans, so
  mail would have timed out while signup still reported success. `MAILER_FROM` is now required in production.
- pnpm is installed in the build stage with `npm install --global` (Node 26 ships without Corepack); the
  project's packages still install through pnpm.
