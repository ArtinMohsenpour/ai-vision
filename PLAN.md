# Company website — build plan

The public website for a small software and AI studio in Cologne, Germany. It presents services, sells fixed-price packages with optional add-ons, takes custom requests through quotes, and gives customers an account area. Payload CMS controls all content, prices and customer data. Running costs must stay at about €10–15 per month.

## 1. Requirements

- **Content.** Every text, image, page, the navbar, the footer, every package, add-on and price is editable in the Payload admin, in German (default) and English.
- **Admin.** One admin (the owner) logs into the Payload admin at `/admin`. They manage content, customers, orders, quotes, inquiries and free grants.
- **Customers.** Customers have accounts on the website, never in the admin. They can register, verify their email, log in, reset or change their password, edit their profile and company details, order packages, pay, see orders and quotes, accept quotes, and manage subscriptions through Stripe's customer portal.
- **Customer type.** Business customers only (§14 BGB): freelancers, small companies, shops, restaurants. Registration requires business confirmation. The company or trade name is optional at signup.
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

Every fixed website page is its own global, with its own editor in the admin sidebar (the Taxful pattern). All pages, including the service pages collection, sit in one **Pages** sidebar group and share one model: heading (eyebrow, H1, subtitle, up to two buttons; on Home the **Hero** tab also offers a background override for the Rheino service map), page sections and SEO, with drafts and the last 25 versions. Pages are cached and refreshed on publish. See `docs/cms.md`.

| Global              | Route         | Sidebar group | Fields                                                                                                            |
| ------------------- | ------------- | ------------- | ----------------------------------------------------------------------------------------------------------------- |
| `home`              | `/`           | Pages         | Page model                                                                                                        |
| `services-overview` | `/services`   | Pages         | Page model                                                                                                        |
| `pricing`           | `/pricing`    | Pages         | Page model; the price grid of orderable and quote services is rendered between heading and sections               |
| `about`             | `/about`      | Pages         | Page model                                                                                                        |
| `how-it-works`      | `/how-it-works` | Pages       | Page model                                                                                                        |
| `faq`               | `/faq`        | Pages         | Page model                                                                                                        |
| `contact`           | `/contact`    | Pages         | Page model (contact form added with `inquiries` in phase E)                                                       |
| `impressum`         | `/impressum`  | Pages         | Page model                                                                                                        |
| `privacy`           | `/privacy`    | Pages         | Page model                                                                                                        |
| `terms`             | `/terms`      | Pages         | Page model (AGB for business customers)                                                                           |
| `navbar`            | every page    | Site settings | Logo, items (link or dropdown, text or button), internal links (one grouped picker: website pages and service pages) or external URLs; drafts and versions |
| `footer`            | every page    | Site settings | Logo, tagline, contact block, link columns, social profiles, copyright, legal links; drafts and versions          |
| `shop-settings`     | –             | Shop          | Ordering open/closed, VAT (0 % §19 UStG or 19 %, same for every customer), price note, order notification email (admin-only) |
| `site-settings`     | –             | Site settings | Not built yet: company name, opening hours, Impressum company data, default SEO image                             |

### Content collections

| Collection     | Fields                                                                                                                                       |
| -------------- | -------------------------------------------------------------------------------------------------------------------------------------------- |
| `services`     | Slug, sort order, title, summary, key points, image, page sections, SEO; drafts and versions. Page at `/services/<slug>`. **Ordering** tab: mode (`off` · `order` · `quote`), base package (name, description, includes, price in cents, delivery days), deposit %, extras (title, summary, price, extra days, active, preview: description, "what you get", image or icon) |
| `case-studies` | Not built yet: title, client type, problem, solution, results, images, related service                                                       |
| `media`        | File, alt text (localized). Public images only: PNG/JPEG are converted to WebP on upload (only WebP stored), SVG kept; WebP sizes 400/768/1600 px |

Page sections are blocks (full width, two columns, three columns) stored as JSONB (`blocksAsJSON`). Each column holds content items: rich text, image, cards, FAQ, service cards and buttons. Sections are localized per language; English falls back to German.

### Shop collections

| Collection         | Fields                                                                                                                                                                                                                                                                               |
| ------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `customers` (auth) | Email, password, first name, last name, company or trade name, address, VAT ID (optional), phone, `businessConfirmedAt`, `stripeCustomerId`_, `suspended`_, `adminNotes`*                                                                                                            |
| `orders`           | Number (`R-<year>-<id>`), customer, locale, snapshot (service, base, extras, prices, VAT, total, deposit, delivery days), payment status (`unpaid` · `deposit_paid` · `paid` · `refunded` · `partially_refunded`, derived from payments), work status (`awaiting_payment` · `new` · `in_progress` · `delivered` · `completed` · `cancelled`), Stripe payments (session, payment intent, amount, refunds), payments outside Stripe, balance request, billing details from Stripe, terms accepted at, admin notes*; versions on |
| `inquiries`        | Name, email, company, service, budget range, message, customer (optional), status (`new` · `contacted` · `quoted` · `closed`)                                                                                                                                                        |
| `quotes`           | Number, customer, inquiry, line items, total, deposit %, valid until, status (`draft` · `sent` · `accepted` · `paid` · `expired`)                                                                                                                                                    |
| `subscriptions`    | Customer, Stripe subscription ID, items, status, current period end. Updated only by webhooks                                                                                                                                                                                        |
| `grants`           | Customer, granted package or add-on or credit, reason, valid until, created by                                                                                                                                                                                                       |
| `stripe-events`    | Event ID (unique), type, processed at. Hidden from the admin menu                                                                                                                                                                                                                    |
| `users` (auth)     | Email, password, first name, last name. Admin only                                                                                                                                                                                                                                                    |

\* Admin-only fields: customers can't read or write them.

## 4. Access rules

- **Public:** read published pages, globals, services (including their ordering prices), case studies, shop settings (except the notification email), and media. Never read drafts or version history. Create inquiries (rate-limited).
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

Round 1 (built, see `docs/shop.md`; tested against Stripe test mode on 2026-11-20: full payment, deposit plus balance and expired session; refunds only with simulated events because the sandbox account cannot refund yet): one-off payments and deposits. Round 2: monthly items.

1. **Order page** (`/services/<slug>/order`). Shows the base package and the active extras with a preview. The running total in the browser is for display only. The selection lives in the URL.
2. **Order.** The customer must be logged in with a verified email (business confirmation happens at signup) and accept the AGB. Logged-out customers return to the same selection after login, signup and email verification. Billing name, address and VAT ID are collected on Stripe's page.
3. **Server.** Receives only the service, extra IDs and the terms checkbox, reloads the published prices from Payload (never the website cache), then calculates the totals in cents. VAT is rounded per line and sent to Stripe as its own line, so Stripe charges exactly our total.
4. **Order record.** Created with a full price snapshot and work status `awaiting_payment`.
5. **Stripe Checkout session** in `payment` mode, expiring after 1 hour. Deposit: only the deposit (plus its VAT). The rest is requested by the admin later ("Request remaining balance") and paid from the customer account, or recorded as a bank transfer.
6. **Webhooks** (`checkout.session.completed` · `async_payment_succeeded` · `async_payment_failed` · `expired`, `charge.refunded`).
   - Verify the signature on the raw body; reject live events before launch.
   - Record the event in `stripe-events` and update the order in one transaction; a repeated event ID is skipped.
   - The session must belong to the order; metadata alone never selects an order.
   - Email the customer and the admin after the commit.
7. **Round 2: subscription webhooks** keep `subscriptions` in sync. Customers manage cards and cancellations in the Stripe Customer Portal.
8. **Custom work:** inquiry form → the admin writes a quote in Payload → the customer accepts it in their account → steps 3–6.

Rules:

- The redirect back from Stripe never marks anything paid.
- Price changes never alter existing orders.
- Stripe stays in test mode until launch.

## 6. Customer account pages (website)

The website uses Payload customer authentication for registration, email verification,
sign-in, sign-out, and password recovery. The protected portal has Profile and Security pages.
Customers can update contact and business details, change their password, and set up
two-step verification with an authenticator app and single-use recovery codes.
Authenticator secrets and recovery codes depend on `PAYLOAD_SECRET`: changing or losing it breaks
every customer's two-step verification, so back it up together with the database.
Admin login remains on the separate `users` collection.

- Registration with email verification
- Login, logout, forgot password, reset password
- Profile and company details. The profile shows the verified sign-in email.
- Password changes require the current password and, when enabled, a second factor. Password changes end all existing sessions.
- A future email-change flow will require the current password and verification of the new address.
- Orders list and detail
- Quotes with accept and pay
- Subscriptions with a button to the Stripe Customer Portal
- Request account deletion. The admin completes it, keeping invoices for the 8-year retention period.

## 7. Admin tools (Payload)

- **Customer list:** columns for sign-up date, verified, company, active plan, payment status, suspended.
- **Password management:** admins can change a customer's password from their record in Payload. A password change ends customer sessions and invalidates outstanding reset links. A separate email-reset button is planned.
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
| C. Packages and configurator | Built (round 1): Ordering tab on services, shop settings, price grid, order page with preview, server-side price calculation, tests                                                                 | Totals are calculated only on the server; tests pass                             | ~25   |
| D. Customer accounts         | `customers` auth collection, registration, verification, login, reset, profile, business confirmation, account pages, access tests                                                                  | A customer can't reach `/admin` or other customers' data; tests pass             | ~25   |
| E. Orders and payments       | Round 1 built and tested in Stripe test mode: `orders` with snapshots, one-off and deposit Checkout, balance requests, idempotent webhooks, emails, account orders. Round 2: subscriptions, Customer Portal, inquiries, quotes, grants | A full purchase works in Stripe test mode, including subscription and deposit    | ~35   |
| F. Admin tools               | Customer list columns, reset-email button, suspend, Stripe links, dashboard                                                                                                                         | The admin can do every task in section 7                                         | ~12   |
| G. Hardening                 | Security headers, rate limits on login and forms, backups of the database and media with a tested restore, uptime monitoring, accessibility (WCAG 2.2 AA) and performance checks, draft legal texts | Restore test passed; Lighthouse ≥ 90                                             | ~20   |
| H. Launch                    | After the business registration: Stripe live keys, final legal texts, remove basic auth, Search Console, Google Business Profile                                                                    | The site is public and taking payments                                           | ~8    |

Later, optional: live preview in the admin, an AI chat assistant on the site (EU-hosted model with a daily cost cap, disclosed as AI), a blog, and automatic invoices through the invoicing tool's API.

## 10. Do not build

- A custom checkout or billing management UI
- External object storage
- A second auth library
- Two-factor methods beyond the optional authenticator app and recovery codes (no SMS, email codes or passkeys)
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
