# AI Vision (working name)

Company website: Next.js 16 + Payload 3 + PostgreSQL 18, in German and English. Payload controls content, packages and prices, and also holds the customer accounts, orders and quotes. Stripe handles payments.

- Build plan: [`PLAN.md`](PLAN.md)
- Rules for developers and AI tools: [`CLAUDE.md`](CLAUDE.md)
- Editing pages, navigation and footer: [`docs/cms.md`](docs/cms.md)

## Local setup

```bash
cp .env.example .env              # then set a strong POSTGRES_PASSWORD (also in DATABASE_URL) and a PAYLOAD_SECRET
pnpm install                      # pnpm 12; downloads Node 26.13.1 for this project
pnpm db:up                        # PostgreSQL 18 on 127.0.0.1:5437
pnpm payload migrate              # apply database migrations
pnpm content:seed                 # bilingual starter content (only fills empty areas)
pnpm dev
```

- Website: http://localhost:3000 (redirects to `/de`; English at `/en`)
- Admin: http://localhost:3000/admin. The first visit asks you to create the admin account.

Until an email adapter is configured, emails (verification, password reset) are written to the terminal.
