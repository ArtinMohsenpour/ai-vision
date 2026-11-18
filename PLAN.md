# Company website — build plan

The public website for a small software and AI studio in Cologne, Germany. It presents services, sells fixed-price packages with optional add-ons, takes custom requests through quotes, and gives customers an account area. Payload CMS controls all content, prices and customer data. Running costs must stay at about €10–15 per month.

## 1. Requirements

- **Content.** Every text, image, page, the navbar, the footer, every package, add-on and price is editable in the Payload admin, in German (default) and English.
- **Admin.** One admin (the owner) logs into the Payload admin at `/admin`. They manage content, customers, orders, quotes, inquiries and free grants.
- **Customers.** Customers have accounts on the website, never in the admin. They can register, verify their email, log in, reset or change their password, edit their profile and company details, order packages, pay, see orders and quotes, accept quotes, and manage subscriptions through Stripe's customer portal.
- **Customer type.** Business customers only (§14 BGB): freelancers, small companies, shops, restaurants. Registration requires a company or trade name and a confirmation checkbox.
- **Pricing model.** Packages have a "from" base price, for example a website from €200. Customers can add add-ons. Custom work goes through an inquiry, then a quote, then payment.
- **Constraints.** Low cost: no background workers, no external file storage, no custom checkout UI, no custom billing screens.

## 2. Stack

| Layer            | Choice                                                                                                                              |
| ---------------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| App              | Next.js (App Router) + Payload 3 in one app, TypeScript strict, Tailwind CSS                                                        |
| Database         | PostgreSQL via `@payloadcms/db-postgres`; reviewed migrations, schema push disabled in production                                   |
| Languages        | Payload localization (`de` default, `en`, German fallback) and next-intl for UI strings; German routes without a prefix (`/...`), English under `/en/...`             |
| Rich text        | Lexical                                                                                                                             |
| Images           | Payload `media` collection on a server volume (local disk) and Sharp; alt text required and localized                               |
| Logins           | Payload auth with **two separate auth collections**: `users` (admin only, `admin.user: 'users'`) and `customers` (website accounts) |
| Payments         | Stripe Checkout (hosted) + Stripe Customer Portal + webhooks; line items sent as `price_data` from Payload prices                   |
| Email            | `@payloadcms/email-nodemailer` with Brevo SMTP (free plan)                                                                          |
| Analytics        | Umami, self-hosted, no cookies                                                                                                      |
| Hosting          | One Hetzner CX23 VPS in Germany, Docker Compose: app, PostgreSQL, Caddy (TLS), Umami                                                |
| Deploy           | GitHub Actions builds the image → GHCR → SSH to the server → `docker compose pull && up -d`                                         |
| Admin protection | Caddy allows `/admin` and the `users` login API only from the owner's IP or Tailscale network                                       |

Rules:

- Keep `payload` and all `@payloadcms/*` packages on exactly the same version, with a Next.js version Payload supports.
- Turn GraphQL off.
- Generate types after every schema change.
- Store money as integer cents.

## 3. Payload model

### Globals

Every fixed website page is its own global, with its own editor in the admin sidebar (the Taxful pattern). All pages, including the service pages collection, sit in one **Pages** sidebar group and share one model: heading (eyebrow, H1, subtitle, up to two buttons; on Home the **Hero** tab, a placeholder until the hero is designed), page sections and SEO, with drafts and the last 25 versions. Pages are cached and refreshed on publish. See `docs/cms.md`.

| Global              | Route         | Sidebar group | Fields                                                                                                            |
| ------------------- | ------------- | ------------- | ----------------------------------------------------------------------------------------------------------------- |
| `home`              | `/`           | Pages         | Page model                                                                                                        |
| `services-overview` | `/services`   | Pages         | Page model                                                                                                        |
| `pricing`           | `/pricing`    | Pages         | Page model (packages grid added in phase C)                                                                       |
| `about`             | `/about`      | Pages         | Page model                                                                                                        |
| `how-it-works`      | `/how-it-works` | Pages       | Page model                                                                                                        |
| `faq`               | `/faq`        | Pages         | Page model                                                                                                        |
| `contact`           | `/contact`    | Pages         | Page model (contact form added with `inquiries` in phase E)                                                       |
| `impressum`         | `/impressum`  | Pages         | Page model                                                                                                        |
| `privacy`           | `/privacy`    | Pages         | Page model                                                                                                        |
| `terms`             | `/terms`      | Pages         | Page model (AGB for business customers)                                                                           |
| `navbar`            | every page    | Site settings | Logo, items (link or dropdown, text or button), internal links (one grouped picker: website pages and service pages) or external URLs; drafts and versions |
| `footer`            | every page    | Site settings | Logo, tagline, contact block, link columns, social profiles, copyright, legal links; drafts and versions          |
| `site-settings`     | –             | Site settings | Not built yet: company name, opening hours, Impressum company data, default SEO image, tax note                   |

### Content collections

| Collection     | Fields                                                                                                                                       |
| -------------- | -------------------------------------------------------------------------------------------------------------------------------------------- |
| `services`     | Slug, sort order, title, summary, key points, image, page sections, SEO; drafts and versions. Page at `/services/<slug>`. Related packages in phase C |
| `case-studies` | Not built yet: title, client type, problem, solution, results, images, related service                                                       |
| `media`        | File, alt text (localized). Public images only: PNG/JPEG are converted to WebP on upload (only WebP stored), SVG kept; WebP sizes 400/768/1600 px |

Page sections are blocks (full width, two columns, three columns) stored as JSONB (`blocksAsJSON`). Each column holds content items: rich text, image, cards, FAQ, service cards and buttons. Sections are localized per language; English falls back to German.

### Shop collections

| Collection         | Fields                                                                                                                                                                                                                                                                               |
| ------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `packages`         | Name, slug, service, short text, features, base price (cents), "from" flag, billing (`one_off` · `monthly`), deposit % (optional), delivery time, allowed add-ons, button type (`order` · `quote`), active, sort order                                                               |
| `addons`           | Name, description, price (cents), billing (`one_off` · `monthly`), quantity min/max (optional), active                                                                                                                                                                               |
| `customers` (auth) | Email, password, first name, last name, company or trade name, address, VAT ID (optional), phone, `businessConfirmedAt`, `stripeCustomerId`_, `suspended`_, `adminNotes`*                                                                                                            |
| `orders`           | Number, customer, snapshot of package, add-ons, quantities and prices at order time, totals, deposit, status (`pending_payment` · `paid` · `in_progress` · `delivered` · `completed` · `cancelled` · `refunded`), Stripe session ID and payment intent ID, admin notes*; versions on |
| `inquiries`        | Name, email, company, service, budget range, message, customer (optional), status (`new` · `contacted` · `quoted` · `closed`)                                                                                                                                                        |
| `quotes`           | Number, customer, inquiry, line items, total, deposit %, valid until, status (`draft` · `sent` · `accepted` · `paid` · `expired`)                                                                                                                                                    |
| `subscriptions`    | Customer, Stripe subscription ID, items, status, current period end. Updated only by webhooks                                                                                                                                                                                        |
| `grants`           | Customer, granted package or add-on or credit, reason, valid until, created by                                                                                                                                                                                                       |
| `stripe-events`    | Event ID (unique), type, processed at. Hidden from the admin menu                                                                                                                                                                                                                    |
| `users` (auth)     | Email, password, first name, last name. Admin only                                                                                                                                                                                                                                                    |

\* Admin-only fields: customers can't read or write them.

## 4. Access rules

- **Public:** read published pages, globals, services, case studies, active packages and add-ons, and media. Never read drafts or version history. Create inquiries (rate-limited).
- **Customer:**
  - Read and update their own `customers` record, except admin-only fields.
  - Read their own orders, quotes and subscriptions.
  - Accept their own quotes.
  - Start checkout through the server route.
  - Never create or edit orders directly. Never access `/admin`.
- **Admin:** everything.
- **Orders** are created only by the server checkout route, after it reloads every price from Payload.
- **Tests:** write integration tests for every rule, covering both allowed and denied cases.

## 5. Order and payment flow

1. **Package page.** Shows the base price and selectable add-ons from Payload. The running total in the browser is for display only.
2. **Order.** The customer must be logged in, with verified email, company details and business confirmation.
3. **Server.** Receives only IDs and quantities, reloads the prices from Payload, then calculates the totals in cents.
4. **Order record.** Created with a full price snapshot and status `pending_payment`.
5. **Stripe Checkout session.**
   - One-off items only: `payment` mode.
   - Any monthly item: `subscription` mode, with one-off items charged on the first invoice.
   - Deposit: charge only the deposit amount.
6. **Webhook `checkout.session.completed`.**
   - Verify the signature.
   - Skip events already in `stripe-events`.
   - Mark the order `paid` and store the subscription.
   - Email the customer and the admin.
7. **Subscription webhooks** keep `subscriptions` in sync. Customers manage cards and cancellations in the Stripe Customer Portal.
8. **Custom work:** inquiry form → the admin writes a quote in Payload → the customer accepts it in their account → steps 3–6.

Rules:

- The redirect back from Stripe never marks anything paid.
- Price changes never alter existing orders.
- Stripe stays in test mode until launch.

## 6. Customer account pages (website)

- Registration with email verification
- Login, logout, forgot password, reset password
- Profile and company details
- Change password and change email. Both require the current password through a custom route, and email changes are re-verified.
- Orders list and detail
- Quotes with accept and pay
- Subscriptions with a button to the Stripe Customer Portal
- Request account deletion. The admin completes it, keeping invoices for the 8-year retention period.

## 7. Admin tools (Payload)

- **Customer list:** columns for sign-up date, verified, company, active plan, payment status, suspended.
- **Send password reset email:** a button that calls Payload's forgot-password operation. Hide the admin's ability to type a customer's password.
- **Suspend:** blocks login and ends active sessions.
- **Grant:** a free plan or bonus until a date. The website gives access if there's a paid subscription **or** an active grant.
- **"Open in Stripe" links** on customers and orders.
- **Dashboard:** new sign-ups, open orders, open inquiries.

## 8. Pages

- Home
- Services: one page per service (AI phone and chat assistants, AI automation with n8n, websites, SEO and AI search, custom software and apps, Web3 on request)
- Packages and prices
- Case studies
- About
- Contact
- Legal: Impressum, privacy policy, AGB for business customers
- Login and registration
- Account area

Each service page includes the problem, the solution, packages with prices, the process, an FAQ and a call to action.

## 9. Roadmap

| Phase                        | Tasks                                                                                                                                                                                               | Done when                                                                        | Hours |
| ---------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------- | ----- |
| A. Foundations               | Repo, Next.js + Payload + PostgreSQL, Docker Compose, Caddy with admin IP restriction, CI deploy, migration workflow, localization, Brevo SMTP (SPF/DKIM/DMARC), staging behind basic auth          | Staging is deployed via CI; the admin is reachable only from the allowed network | ~20   |
| B. Content and page builder  | Globals, `pages` blocks, `services`, `case-studies`, `media`, SEO fields, sitemap and hreflang, design system, frontend rendering for every block                                                   | Every public page is fully editable in both languages                            | ~40   |
| C. Packages and configurator | `packages`, `addons`, package pages, add-on picker, server-side price calculation, tests                                                                                                            | Totals are calculated only on the server; tests pass                             | ~25   |
| D. Customer accounts         | `customers` auth collection, registration, verification, login, reset, profile, business confirmation, account pages, access tests                                                                  | A customer can't reach `/admin` or other customers' data; tests pass             | ~25   |
| E. Orders and payments       | `orders` with snapshots, Checkout in all three modes, idempotent webhooks, Customer Portal, inquiries, quotes, grants, emails, Stripe CLI tests                                                     | A full purchase works in Stripe test mode, including subscription and deposit    | ~35   |
| F. Admin tools               | Customer list columns, reset-email button, suspend, Stripe links, dashboard                                                                                                                         | The admin can do every task in section 7                                         | ~12   |
| G. Hardening                 | Security headers, rate limits on login and forms, backups of the database and media with a tested restore, uptime monitoring, accessibility (WCAG 2.2 AA) and performance checks, draft legal texts | Restore test passed; Lighthouse ≥ 90                                             | ~20   |
| H. Launch                    | After the business registration: Stripe live keys, final legal texts, remove basic auth, Search Console, Google Business Profile                                                                    | The site is public and taking payments                                           | ~8    |

Later, optional: live preview in the admin, an AI chat assistant on the site (EU-hosted model with a daily cost cap, disclosed as AI), a blog, and automatic invoices through the invoicing tool's API.

## 10. Do not build

- A custom checkout or billing management UI
- External object storage
- A second auth library
- Two-factor login for customers
- Background workers or queues
- File uploads from customers
- An invoice engine (use an invoicing tool)
- Crypto payments

## 11. Running costs (net, per month)

| Item                                                         | Cost                                                                             |
| ------------------------------------------------------------ | -------------------------------------------------------------------------------- |
| Hetzner CX23 + IPv4 + backups                                | ≈ €7.10                                                                          |
| Off-site backup storage                                      | ≈ €1–4                                                                           |
| Domain + mailbox                                             | ≈ €2–4                                                                           |
| Brevo, Payload, PostgreSQL, Umami, GitHub Actions, Tailscale | €0                                                                               |
| Stripe                                                       | Per payment only: about 1.5% + €0.25 per standard EEA card; €0.35 per SEPA debit |
