# Rheino

Company website: Next.js 16 + Payload 3 + PostgreSQL 18, in German and English. Payload controls content, packages and prices, and also holds the customer accounts, orders and quotes. Stripe handles payments.

- Build plan: [`PLAN.md`](PLAN.md)
- Rules for developers and AI tools: [`CLAUDE.md`](CLAUDE.md)
- Editing pages, navigation and footer: [`docs/cms.md`](docs/cms.md)
- Prices, ordering and Stripe payments (including the Stripe test setup): [`docs/shop.md`](docs/shop.md)

## Local setup

```bash
cp .env.example .env              # then set a strong POSTGRES_PASSWORD (also in DATABASE_URL) and a PAYLOAD_SECRET
pnpm install                      # pnpm 12; downloads Node 26.13.1 for this project
pnpm db:up                        # PostgreSQL 18 on 127.0.0.1:5437
docker compose up -d mailpit       # local email inbox on http://localhost:8025
pnpm payload migrate              # apply database migrations
pnpm content:seed                 # bilingual starter content (only fills empty areas)
pnpm dev
```

- Website: http://localhost:3000 (German; English at `/en`)
- Admin: http://localhost:3000/admin. The first visit asks you to create the admin account.

If you run the development server on another port, set `NEXT_PUBLIC_SERVER_URL`
in `.env` to the exact origin you open in the browser and restart the server.
Payload uses that origin when validating the admin session on writes.

## Customer accounts

Customers use `/login` or `/signup` in German and under `/en` in English. In development,
`RHEINO_MAILPIT=1` delivers account emails to the [Mailpit inbox](http://localhost:8025)
when real SMTP settings are absent. Open the newest message and click the verification
or password reset link. A resend replaces the previous verification link.
With Mailpit disabled, development falls back to the private, git-ignored
`.next/customer-mail/` outbox. Restart the dev server after changing the mail settings.

In production, use an HTTPS `NEXT_PUBLIC_SERVER_URL`, configure the `SMTP_*` values from
`.env.example`, and apply the migrations before starting the site. Authentication uses the
existing Payload customer collection and a separate secure session cookie. Configure
`CUSTOMER_AUTH_IP_HEADER` only behind a reverse proxy that strips the incoming value and
sets a single verified client IP. Database-backed shared limits and account lockouts apply
even when that header is unset.

The customer portal is at `/account`, with password and authenticator settings at
`/account/security`. Authenticator setup codes are generated locally, recovery codes
are displayed once, and email password resets preserve two-step verification. Apply the
auth migrations before deploying portal code. Authenticator secrets are encrypted with a
key derived from `PAYLOAD_SECRET`, so keep that secret stable across deployments.
