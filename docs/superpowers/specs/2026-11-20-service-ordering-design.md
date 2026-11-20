# Service ordering and Stripe payments — design (round 1)

Status: ready for owner approval · 2026-11-20

## Intent

Rheino sells fixed-price services online. Every service (website, AI chat assistant, automation, …) has a **base package** with a price and any number of **extras** (CMS, customer portal, AI chatbot, payment page, …), each with its own price. The owner controls all of it in the Payload admin. A business customer opens a service, ticks extras, sees what each extra gives them in a preview, sees the total and the delivery estimate, and pays through Stripe.

Why: transparent "from €200" pricing turns visitors into paying customers without a sales call for standard work, while the owner can change offers and prices any time without a developer. The page must look professional and trustworthy, including a clear statement that card details go only to Stripe.

## Goals (round 1)

1. Per service, the admin edits: ordering mode, base package, optional deposit, and a list of extras with title, texts, price, extra delivery days and preview content.
2. A pricing page lists every orderable service with its "from" price.
3. An order page per service: extras on the left, a preview of the focused extra and the live order summary on the right (approved mockup, see "Order page").
4. Checkout through Stripe's hosted payment page with prices calculated only on the server.
5. Orders with a full price snapshot, confirmed only by Stripe webhooks.
6. Deposits: pay a percentage first, the rest later from the customer account.
7. Customer account: Orders list and order detail.
8. Emails to the customer and the owner when a payment is confirmed.

## Non-goals (round 1)

- **Monthly items and subscriptions.** Round 2: Stripe subscriptions, subscription webhooks, Stripe Customer Portal link, `subscriptions` and `grants` collections. Round 1 builds nothing for them except keeping the data model open to a `billing` field later.
- Quantities on extras (every extra is on or off).
- Quotes as a priced flow (inquiry → quote → accept → pay). Round 1 only offers a "Request a quote" link to the contact page for services set to quote mode.
- Coupons and promotion codes.
- Invoices. Stripe receipts only; invoices come from an invoicing tool later (PLAN.md §9).
- Refunds UI. The owner refunds in the Stripe dashboard; a webhook updates the order.
- Admin dashboard widgets and customer-list columns (phase F).

## Anti-goals (a failure even if it works)

- Card or bank details touching our server or database.
- Any price or total coming from the browser.
- Marking anything paid because the customer was redirected back from Stripe.
- A total on our page that differs from what Stripe charges, without the customer seeing the Stripe amount before paying.
- An admin screen that is hard to use on a phone (the owner edits on a phone).
- Fixed colors that break the dark theme.

## Constraints

From CLAUDE.md and PLAN.md: money as integer cents, prices read on the server from Payload, orders keep a snapshot, hosted Checkout only, webhooks signature-checked and processed once, content localized (`de` default, `en`, German fallback), color tokens only and both themes, public pages cached with the `website` tag, reviewed migrations (no schema push), GraphQL off, no background workers or cron, Stripe in test mode until the business registration. Customers are businesses only (§14 BGB).

## Approaches considered

| Approach | Trade-off | Decision |
| --- | --- | --- |
| Stripe hosted Checkout, line items sent as `price_data` from Payload per order | No product sync; least code; card data never reaches us | **Chosen** (already in PLAN.md) |
| Embedded Stripe Elements on our own page (Taxful pattern) | More code and security surface; PLAN.md forbids a custom checkout | Rejected |
| Sync Products/Prices to Stripe on every admin save | Extra moving part; every order is a unique combination anyway | Rejected |
| Build one-off and monthly in one round | About twice the size; recurring billing mixed into the first review | Rejected: the owner chose **round by round** |
| Extras stored inside each service vs. one shared extras list | Inside: one screen per service, easy on a phone, per-service prices; an extra used by two services is entered twice | **Inside each service**, approved by the owner |

## Decided by the owner

- "Value" of an extra means its price. Extras are on/off checkboxes.
- Each extra has a title, description, price, extra delivery time and preview content, all edited in the admin.
- Extras live on the service, in a new **Ordering** tab.
- Order page layout as in the approved mockup ([2026-11-20-service-ordering-mockup.html](2026-11-20-service-ordering-mockup.html); its colors are mockup-only): base package card, extras list, preview panel, order summary with total, delivery estimate, payment button and the Stripe note.
- Preview content per extra: an image (or icon), a description and a "what you get" list, as shown in the mockup.
- One-off payments and deposits in round 1; monthly items in round 2.
- **German pricing for everyone.** Every customer pays the same price and the same VAT, whatever their country. There is no separate handling for EU or non-EU customers and no country restriction. (Note for launch: confirm with the tax advisor. A business customer in another EU country is normally reverse-charged by law, §13b UStG, so the rare foreign EU order may have to go through a quote instead.)
- Wording on the site: *"Secure payment by Stripe. Your card details go straight to Stripe. We never see or store them."* We do store the account and the order (German law requires keeping invoice records), so we never claim to store no information at all.

## Design

### 1. Admin: Ordering tab on `services`

A new tab **Ordering** on the existing `services` collection (which already has drafts and versions; ordering changes take effect when the service is published).

| Field | Type | Notes |
| --- | --- | --- |
| `ordering.mode` | select: `off` · `order` · `quote` | Default `off`. `quote` shows "Request a quote" (link to `/contact?service=<slug>`) instead of a price button |
| `ordering.baseName` | text, localized, required if mode = `order` | e.g. "Simple website" |
| `ordering.baseDescription` | textarea, localized | One or two sentences |
| `ordering.baseIncludes` | array of text, localized, max 8 | "Included in every order" list |
| `ordering.basePrice` | integer cents, required if mode = `order` | Edited as euros (see money field) |
| `ordering.baseDays` | integer, working days, required if mode = `order` | |
| `ordering.depositPercent` | integer 0–100, optional | Empty or 0 = pay in full |
| `ordering.extras` | array, max 30 | Drag to reorder; row label = title |
| `extras[].title` | text, localized, required | |
| `extras[].summary` | text, localized, max 120 | One line under the title in the list |
| `extras[].description` | textarea, localized | Preview panel text |
| `extras[].includes` | array of text, localized, max 8 | Preview "what you get" list |
| `extras[].image` | upload → `media`, optional | Preview image or screenshot |
| `extras[].icon` | select from a fixed set (cms, portal, chatbot, payment, seo, language, design, analytics, automation, generic) | Shown when no image is set |
| `extras[].price` | integer cents, required | |
| `extras[].days` | integer ≥ 0, required | Extra working days |
| `extras[].active` | checkbox, default true | Hide without deleting |

Validation: when mode is `order`, base name, price and days are required; prices 0 < price ≤ €100,000; at most 30 extras. Array row IDs are the stable extra IDs used in URLs and order snapshots.

**Money field (builder's call on implementation, owner's need):** prices are stored as integer cents but edited as euros ("350" or "350,00"), with a custom admin field component that converts. It must work at phone width.

**Shop settings global** (`shop-settings`, sidebar group Shop, no drafts, `revalidate` hook):

| Field | Notes |
| --- | --- |
| `vatRate` | select: `0` (small business, §19 UStG) · `19`. Default `0` until the business registration decides |
| `priceNote` | text, localized, e.g. "All prices net plus 19% VAT" or the §19 note; shown under totals |
| `orderNotificationEmail` | email; where owner order emails go |
| `orderingEnabled` | checkbox master switch; off hides all order buttons and blocks checkout |

### 2. Pricing page (`/pricing`, `/en/pricing`)

The existing `pricing` global keeps its heading and sections. Between the heading and the sections the page renders a grid of every published service whose mode is `order` or `quote`, in service sort order: title, summary, "from €X" (base price) or "Price on request", up to three extra titles as a teaser ("+ CMS, AI chatbot, payment page"), and a button: "Configure" → order page, or "Request a quote" → contact. Cards follow the Taxful plan-card look with Rheino tokens. The page stays cached (ISR + `website` tag); the existing `revalidateDocument` hook on services and the new global's hook expire it on publish.

The service page's existing "Contact" button becomes "Configure and order" when the service mode is `order`.

### 3. Order page (`/services/<slug>/order`, `/en/services/<slug>/order`)

Layout as in the approved mockup:

- Breadcrumb "Pricing / <service>", H1, short intro.
- **Left:** base package card (name, description, price, base days, "Included in every order" list), then the extras list. Each extra row: checkbox, title, price "+€350", summary, "+5 days". Clicking a row toggles it and focuses its preview; clicking a selected, focused row deselects it.
- **Right (sticky on desktop):** preview panel for the focused extra (image or icon, title, description, includes list with check marks), then the order summary: base line, one line per selected extra, total, estimated delivery ("about N working days" = base days + sum of selected extra days), price note, a required checkbox "I order as a business and accept the terms (AGB)" linking `/terms`, the button **"Continue to payment"**, and the Stripe note with a lock icon.
- **Phone:** single column; the preview opens inline under the tapped extra; the total and button sit in a sticky bottom bar.
- Selection lives in the URL (`?extras=<id>,<id>`) so it survives the login step, reloads and sharing. Unknown or inactive IDs in the URL are ignored.
- The page itself is public and cached; only the payment button needs a customer session. Prices shown in the browser are for display only.

### 4. Login handoff

"Continue to payment" submits a server action. If there is no valid customer session, it redirects to `/login?next=<order page path with extras>`; signup and login carry `next` through email verification and back. `next` must be a relative path on this site (starts with a single `/`, no `//`, no scheme) or it is dropped. Business confirmation is already required at signup. Billing name, address and optional VAT ID are collected by Stripe Checkout, not by our own form.

### 5. Checkout (server action)

Input: service slug, list of extra IDs (deduplicated, max 30), terms checkbox. Nothing else from the browser.

1. Origin check (`customerRequest()`), customer session check, rate limit (new bucket, e.g. 10 per 15 minutes per customer and per IP), `orderingEnabled` and Stripe configured.
2. Load the **published** service with the Local API in the customer's locale (German fallback). Mode must be `order`. Every extra ID must exist and be active, otherwise return an error and re-render with the current prices.
3. Calculate in cents: subtotal = base + extras; VAT = round(subtotal × rate); total; amount due now = total, or round(total × deposit%) when a deposit is set; delivery days.
4. Create the order (`overrideAccess: true`, inside a transaction) with status `awaiting_payment`, the full snapshot (below) and the terms acceptance time.
5. Find or create the Stripe Customer for this customer (store `stripeCustomerId`, admin-only field). Stripe holds name and email only, plus what the customer types on Stripe's page.
6. Create a Checkout Session, mode `payment`, currency EUR, idempotency key derived from the order ID and payment kind:
   - Pay in full: one line item for the base and one per extra (`price_data`, `product_data.name` = localized title).
   - Deposit: one line item "Deposit 30% · Order R-2026-0042 · Website".
   - VAT 19%: one extra line item "VAT 19%" (USt. 19 %) with the amount we calculated. Not a Stripe Tax Rate (Stripe's own rounding could differ from ours by a cent) and not Stripe Tax (it costs 0.5% per transaction). This way Stripe charges exactly our total.
   - `billing_address_collection: required`, `tax_id_collection` enabled, `client_reference_id` and `metadata.orderId` = order ID, `metadata.kind` = `full` · `deposit` · `balance`, `locale` = de or en, `expires_at` = now + 1 hour.
   - `success_url` = `/account/orders/<id>?checkout=return`, `cancel_url` = the order page with the same extras.
7. Store the session ID on the order's payment entry and redirect to the session URL.

If an equal pending order already exists, a new order is created anyway; the old one expires with its session.

### 6. Orders collection (`orders`, sidebar group Shop)

| Field | Notes |
| --- | --- |
| `number` | `R-<year>-<id padded to 4>`; set in a hook after create |
| `customer` | relationship → `customers`, required |
| `locale` | `de` · `en` (language of the snapshot and emails) |
| `snapshot` | group, read-only in admin: service ID, slug and title; base name, price, days; extras [{ id, title, price, days }]; subtotal, vatRate, vat, total, depositPercent, deliveryDays |
| `amountPaid`, `balanceDue` | integer cents, recalculated by a `beforeChange` hook from `payments` and `manualPayments` |
| `paymentStatus` | `unpaid` · `deposit_paid` · `paid` · `refunded` · `partially_refunded`; recalculated by the same hook, never edited by hand |
| `balanceRequested` | checkbox, admin; see "Balance payment" |
| `balanceRequestedAt` | date, read-only; set when the request email is sent |
| `manualPayments` | array, admin: amount (cents), method (`bank_transfer` · `other`), date, note; for money received outside Stripe |
| `status` (work) | `awaiting_payment` · `new` · `in_progress` · `delivered` · `completed` · `cancelled`; admin edits from `new` on |
| `payments` | array, read-only: kind, checkout session ID, payment intent ID, amount, status, paid at |
| `billing` | group, read-only, copied from the Stripe session on payment: name, company, address, VAT ID |
| `termsAcceptedAt` | date |
| `adminNotes` | textarea, admin-only field access |

Access: admin all; a customer reads only their own orders, through the same session-grant check that `customers` uses; nobody creates, updates or deletes orders through the REST API except the admin. Versions on, so the admin sees changes. Admin list columns: number, customer, service, total, payment status, work status, created. An "Open in Stripe" link (test dashboard URL while in test mode) on the order.

This replaces PLAN.md's single `status` field with `paymentStatus` plus work `status`, because a deposit order can be in progress while the balance is still open. PLAN.md gets updated.

### 7. Webhook (`POST /api/stripe/webhook`)

- Next route handler. Read the raw body (bounded, e.g. 1 MB), verify with `STRIPE_WEBHOOK_SECRET`; reject bad signatures with 400. Reject live-mode events while Stripe is in test mode.
- Deduplicate in a `stripe-events` collection (unique event ID, type, processed at; hidden from the admin menu). Insert the event row and update the order in one transaction; a duplicate ID means "already processed" → 200.
- The order is found by `metadata.orderId` and must match the session ID stored on the order; client metadata never picks a different customer.
- Events:
  - `checkout.session.completed` with `payment_status = paid`, and `checkout.session.async_payment_succeeded`: record the payment, update `amountPaid`, `balanceDue`, `paymentStatus` (`deposit_paid` or `paid`), move work status from `awaiting_payment` to `new`, copy billing details.
  - `checkout.session.completed` with `payment_status = unpaid` (bank debit still pending): record as pending; no status change.
  - `checkout.session.async_payment_failed` and `checkout.session.expired`: mark that payment failed or expired; an order with nothing paid moves to `cancelled`.
  - `charge.refunded`: update `paymentStatus` to `refunded` or `partially_refunded` from the refunded amount.
- Emails are sent after the transaction commits (Next `after()`); an email failure never fails the webhook.
- Unknown order or mismatched session: log and return 200 (no retry storm); database errors: 500 so Stripe retries.

### 8. Balance payment

The owner decides when the rest is due, independent of the work status (for example before a website goes live):

- The order has a **"Request remaining balance"** switch in the admin. When it turns on while `paymentStatus = deposit_paid`, an `afterChange` hook sends the customer a "Remaining balance due" email with a link to the order (once; `balanceRequestedAt` records it) after the transaction commits.
- While the switch is on and a balance is open, the order detail page shows **"Pay remaining €X"**. It runs the checkout path with kind `balance`: one net line "Remaining balance · Order R-…" with the tax rate applied.
- If the customer pays by bank transfer, the owner adds an entry under `manualPayments`; the hook recalculates `amountPaid`, `balanceDue` and `paymentStatus`, and the button disappears.

### 9. Customer account

The portal sidebar gets **Orders** next to Profile and Security.

- `/account/orders`: list with number, service, date, total, payment status and work status. Orders still awaiting payment show "Continue payment" while their session is open; expired unpaid orders are hidden.
- `/account/orders/<id>`: snapshot lines, totals, price note, delivery estimate, payments, billing details, status, and the balance button when due.
- With `?checkout=return`: if the webhook has already confirmed payment, show "Payment received"; otherwise "We're confirming your payment with Stripe" and refresh every few seconds for about a minute, then "This can take a few minutes; we'll email you." The redirect itself changes nothing.

### 10. Emails

Localized, plain HTML like the existing account emails (`src/lib/customer-auth/email.ts`):

- Customer: "Payment received", order number, lines, amount paid, balance due if any, link to the order.
- Customer: "Remaining balance due", when the owner requests the balance, with the amount and a link to the order.
- Owner (`orderNotificationEmail`): new paid order or balance paid, with a link to the order in the admin.

### 11. Configuration

- `.env`: `STRIPE_SECRET_KEY` (must start with `sk_test_` until launch; anything else disables checkout with a clear log line), `STRIPE_WEBHOOK_SECRET`. No publishable key is needed for hosted Checkout.
- Local webhooks: `stripe listen --forward-to localhost:3000/api/stripe/webhook`, documented in `docs/shop.md`.
- New dependency: the official `stripe` package, exact version, respecting pnpm's minimum release age.

### 12. Tests

- Integration: price calculation (client values ignored; inactive, unknown and duplicate extras; deposit rounding; VAT 0 and 19), order access (own order allowed; other customer's order, REST create and update denied; admin allowed), webhook (bad signature, duplicate event, paid, deposit then balance, async pending then succeeded, expired, refund, mismatched session), balance request (email sent once; only for `deposit_paid`), manual payment recalculation, a customer with orders cannot be deleted.
- E2E: pricing page lists orderable services; order page toggles extras and updates total and days; selection survives login; the payment button needs the terms checkbox; account orders list and detail; light and dark theme; phone width.
- Manual: a full payment with Stripe CLI and test card 4242 4242 4242 4242, a deposit plus balance, an expired session and a refund. Stripe's hosted page is not automated.

### 13. Documentation

- `docs/shop.md`: how to set up ordering for a service, shop settings, Stripe test setup, testing payments.
- PLAN.md: replace `packages`/`addons` with the Ordering tab, the two order status fields, quote mode, round 2 scope.

### 14. Settled details (from the builder check)

- **VAT per line.** VAT is calculated and rounded (half up) per line item and sent to Stripe as its own line, so our total always equals Stripe's. A deposit is one net line (round(subtotal × deposit%)) plus its VAT line. The balance is one line with the remaining gross amount ("incl. VAT"), so manual part payments never need re-splitting. The order total of a deposit order is deposit gross + remaining net + VAT on the remaining net.
- **Idempotency keys** include the order ID, the payment kind and the attempt number, so a retry after an expired session creates a new session instead of returning the old one.
- **`next` through verification.** The verification email link carries the validated `next` path, so a new customer lands back on their order after confirming their email.
- **Order page caching.** The server renders every active extra; the client reads `?extras` and the selection, so the page stays fully cached.
- **Deleting customers.** A customer with orders cannot be deleted (a `beforeDelete` hook on `customers` refuses), because order records must be kept for the 8-year retention period. Account deletion requests stay manual (PLAN.md §6).
- **PLAN.md's "company details required before ordering"** is replaced by Stripe collecting billing name, address and VAT ID on its payment page.

## Left to the builder

- File layout under `src/lib/shop/`, component split, and exact class names, following existing patterns (`src/lib/customer-auth/`, `src/components/account/`).
- The money field component's implementation.
- Exact rate-limit numbers within the stated intent.
- How the order-page client component receives data (serialize only display data: IDs, titles, texts, prices, days, image URLs).
- Icon artwork for the fixed icon set.
- Copy for UI strings in `messages/de.json` and `messages/en.json`, in the existing tone.

## Calls made by Claude (not yet confirmed by the owner)

- Ordering mode `quote` links to the contact page.
- Delivery estimate adds base days and every selected extra's days.
- The pricing grid is rendered automatically on `/pricing` between heading and sections.
- Stripe collects billing address and VAT ID; our profile form stays as it is.
- A required terms checkbox above the payment button.
- The balance is requested with a separate admin switch that emails the customer; bank transfers are recorded as manual payments. (The owner didn't pick between this and "payable when delivered"; this is Claude's recommendation.)
- VAT is a shop setting, default 0% (§19) until the business registration; sent to Stripe as its own line, not Stripe Tax.
- Checkout sessions expire after 1 hour; expired unpaid orders are hidden from the customer.
- Order numbers come from the database ID (`R-2026-0042`), so numbers can skip.
