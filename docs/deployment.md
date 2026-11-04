# Deployment

Production runs on [Railway](https://railway.com) from the `Dockerfile`: one app service and one Postgres service.
Puma serves the API and the Vite-built SPA, and runs Solid Queue in-process for background jobs (mail). Railway
terminates TLS, so `assume_ssl`/`force_ssl` stay on. Mail goes out through Resend's HTTP API, because Railway blocks
outbound SMTP on the Free, Trial and Hobby plans.

## Image

The Dockerfile has three stages:

| Stage      | What it does                                                                |
| ---------- | --------------------------------------------------------------------------- |
| `build`    | Installs gems and precompiles bootsnap                                      |
| `frontend` | Node + pnpm, `pnpm install --frozen-lockfile`, `pnpm build` → `public/vite` |
| final      | Ruby runtime, gems, app code and `public/vite`; runs as a non-root user     |

`bin/docker-entrypoint` runs `db:prepare` before `rails server`, so migrations apply on every deploy. Keep
`NODE_VERSION` and `PNPM_VERSION` in the Dockerfile in sync with `mise.toml` and `packageManager`.

`railway.json` selects the Dockerfile builder and sets the health check to `/up`.

## Environment variables

Set these on the Railway app service.

| Variable              | Value                                                               |
| --------------------- | ------------------------------------------------------------------- |
| `DATABASE_URL`        | `${{Postgres.DATABASE_URL}}` (Railway reference variable)           |
| `RAILS_MASTER_KEY`    | Contents of `config/master.key`                                     |
| `SOLID_QUEUE_IN_PUMA` | `1`                                                                 |
| `APP_HOST`            | Public hostname, e.g. `app.example.com` (used in mail links)        |
| `MAILER_FROM`         | Sender on a verified domain, e.g. `Mindboop <no-reply@example.com>` |
| `RESEND_API_KEY`      | Resend API key with sending access                                  |

Railway sets `PORT`; Puma reads it. Production boot fails fast if `APP_HOST`, `MAILER_FROM` or `RESEND_API_KEY` is
missing.

## First deploy

1. In Resend, add the sending domain, create the DNS records it shows and wait for it to verify. Then create an API
   key.
2. Create a Railway project from the GitHub repo, region Singapore (closest to India).
3. Add a Postgres service named `Postgres` to the project.
4. Set the variables above on the app service and deploy.
5. Under the app service's networking settings, add the custom domain and create the DNS records Railway shows.
   An apex domain (`example.com`) needs a DNS provider with CNAME flattening or ALIAS records (Cloudflare has
   it); otherwise use a subdomain such as `app.example.com`.
6. Sign up with a real address and finish signup from the emailed link, then request a password reset.

## Mail failures

Signup and password reset respond before the mail is sent, so a failed delivery never reaches the user. Network errors,
Resend 5xx responses and rate limits retry up to 5 attempts (`Mailers::DeliveryJob`). Other failures, such as a bad API
key or an unverified domain, fail on the first attempt. Either way the failure ends up in Solid Queue, so check it from
a Rails console on the service:

```ruby
SolidQueue::FailedExecution.order(:id).last(5).map { |failure| [ failure.exception_class, failure.message ] }
```

## Caveats

- Active Storage uses the local disk, which Railway wipes on each deploy. Attach a volume at `/rails/storage`
  or switch to S3/R2 before adding uploads.
- Action Cable is configured for Redis in production but is unused; add Redis or Solid Cable before using it.
