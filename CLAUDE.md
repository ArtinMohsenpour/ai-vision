# AI Vision — project instructions

Working name only; the company name is not decided yet.

## Start here

- `PLAN.md` is the build plan: requirements, stack, Payload model, access rules, order and payment flow, roadmap. Follow it, and update it when a decision changes.
- Before changing Payload configuration, collections, fields, hooks, access control, queries or endpoints, read `.claude/skills/payload/SKILL.md` and the relevant file in `.claude/skills/payload/reference/`.
- Next.js 16 differs from older versions (for example, `middleware.ts` is now `proxy.ts`). Check `node_modules/next/dist/docs/` before using a Next.js API you are unsure about.

## Versions

- Node 26.13.1 (LTS), pinned via `.node-version` and `devEngines` in `package.json`. pnpm downloads it for project scripts.
- pnpm 12. Keep its default supply-chain checks (minimum release age, build-script approval in `pnpm-workspace.yaml`). Don't bypass them.
- `payload` and every `@payloadcms/*` package stay on exactly the same version, with a Next.js version inside Payload's supported range. Pin exact versions, no `^` or `~`. Use stable releases only, never beta or canary.
- "Latest" means the newest stable versions that work together, not each package bumped on its own.

## Architecture rules

- Two separate login collections:
  - `users` is the admin only, and the only collection allowed into `/admin` (`admin.user`).
  - `customers` holds website accounts. Customers log in on website pages, never in the admin.
- Access helpers live in `src/access/`. Private collections deny by default.
- Admin-only fields (`stripeCustomerId`, `suspended`, `adminNotes`) use field-level access.
- The Local API bypasses access control by default. When acting for a user, pass `user` and `overrideAccess: false`.
- Prices come only from Payload, read on the server. Store money as integer cents. Orders keep a price snapshot.
- Stripe:
  - Use hosted Checkout and the Customer Portal; never build a custom checkout or billing screens.
  - Webhooks are signature-checked and processed only once.
  - The redirect back from Stripe never marks anything paid.
- Content is localized (`de` default, `en`, German fallback). UI strings live in `messages/de.json` and `messages/en.json`.
- Media is stored on local disk (server volume). Never store private files in `media`. PNG and JPEG uploads are converted to WebP (only WebP is stored); SVG is kept. Render images with `ResponsiveImage`/`MediaImage` (`src/components/site/media-image.tsx`), which use the generated WebP sizes.
- Public pages are cached (ISR + one `website` cache tag). New collections or globals that the website reads need the `revalidate` hooks from `src/hooks/revalidate.ts`.
- GraphQL is turned off.

## Database and generated files

- Schema push is off. After a schema change:
  1. `pnpm payload migrate:create <name>`
  2. Review the migration.
  3. `pnpm payload migrate`
  4. `pnpm generate:types`
- Never edit an applied migration.
- `src/payload-types.ts` and `src/app/(payload)/admin/importMap.js` are generated; don't hand-edit them. Run `pnpm generate:importmap` after adding admin components.
- `.env` holds local secrets and is git-ignored. Never print or commit its values.

## Commands

```bash
pnpm db:up          # start local PostgreSQL 18 (docker compose, port 5437)
pnpm dev            # http://localhost:3000 (website /de, /en; admin /admin)
pnpm typecheck
pnpm lint
pnpm test:int       # access-control tests (needs the database)
pnpm test:e2e       # Playwright (needs `pnpm exec playwright install chromium` once)
pnpm build
```

Before finishing a change, run typecheck, lint, the relevant tests and, for cross-cutting changes, the build. Test access rules with both allowed and denied cases.

## Product context

The site is for a small software and AI studio. Customers are businesses only (freelancers, small companies, shops, restaurants; §14 BGB). Keep running costs low: one Hetzner VPS, no background workers, no external storage. Payments go live only after the business registration, so Stripe stays in test mode until then.
