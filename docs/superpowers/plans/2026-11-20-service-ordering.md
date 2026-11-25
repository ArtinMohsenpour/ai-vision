# Service Ordering and Stripe Payments (Round 1) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Customers configure a service (base package + extras with previews), pay once or a deposit through Stripe's hosted Checkout, and see their orders in the account; the owner controls every offer and price in Payload.

**Architecture:** Ordering data lives in a new "Ordering" tab on the `services` collection plus a `shop-settings` global. Pure pricing functions in `src/lib/shop/` turn a published service and a list of extra IDs into a quote in cents. A server action creates an `orders` record with a snapshot and a Stripe Checkout Session (behind a small `StripeGateway` interface so tests use a fake); a signature-checked webhook updates the order once per event. Account pages read orders through the Local API as the customer.

**Tech Stack:** Next.js 16 (App Router, server actions, ISR), Payload 3.93 (PostgreSQL, migrations), next-intl, Tailwind 4 tokens, `stripe` 23.1.0 (exact), Vitest, Playwright.

**Spec:** `docs/superpowers/specs/2026-11-20-service-ordering-design.md` (approved; mockup: `docs/superpowers/specs/2026-11-20-service-ordering-mockup.html`). Read both before any task.

## Global Constraints

- Money is integer cents everywhere; currency EUR; VAT rounding is `Math.round(net * rate / 100)` per line.
- Prices and totals come only from Payload on the server; the browser sends service slug, extra IDs, terms checkbox, order ID. Nothing else.
- Checkout reads the **published** service fresh from the database, never through the website cache (`src/lib/website/load.ts`).
- Stripe: hosted Checkout only, mode `payment`, no Stripe Tax, no Stripe Tax Rates (VAT is its own line item). `STRIPE_SECRET_KEY` must start with `sk_test_`; anything else disables checkout and logs `Stripe checkout disabled: test keys only until launch`.
- Webhooks: raw body ≤ 1 MB, signature-checked with `STRIPE_WEBHOOK_SECRET`, live-mode events rejected, each event ID processed once, order state and event row in one transaction.
- The redirect back from Stripe never changes an order.
- Exact site copy (en / de): "Secure payment by Stripe. Your card details go straight to Stripe. We never see or store them." / "Sichere Zahlung über Stripe. Ihre Kartendaten gehen direkt an Stripe. Wir sehen oder speichern sie nie."
- German pricing for every customer: one VAT rate from shop settings, no country logic.
- Content localized `de` (default) and `en` with German fallback; UI strings in `messages/de.json` and `messages/en.json`; links via next-intl `Link` or `localizedPath()`.
- Color tokens only (`bg-background`, `bg-surface`, `bg-accent`, `text-muted`, `text-primary`, `border-border`, …); check light and dark theme.
- Public pages stay cached (ISR + `website` tag); new globals the website reads get `revalidateGlobal`.
- Schema changes: `pnpm payload migrate:create <name>` → review → `pnpm payload migrate` → `pnpm generate:types`; `pnpm generate:importmap` after adding admin components. Never hand-edit `src/payload-types.ts` or `importMap.js`.
- Dependencies pinned exactly, stable only; keep pnpm's supply-chain checks. `stripe` = `23.1.0`.
- Admin screens must work at phone width (16 px inputs, readable row labels).
- When acting for a customer through the Local API pass `user` and `overrideAccess: false`; system writes (checkout, webhook) use `overrideAccess: true` and `context: { shopSystem: true }`.
- No background workers or cron. Commit at the end of each task on `feature/payment` only if the owner has agreed to commits.

## Review Focus

1. **Price or offer changes between page load and payment** (owner edits a price, deactivates an extra, switches the service to `quote`/`off`, or turns ordering off): checkout uses current published prices; a removed/inactive extra or closed service returns `offerChanged`/`orderingClosed` and the page shows a message instead of charging. Test in Task 6.
2. **Hostile or stale `?extras=` URLs** (unknown IDs, duplicates, 500 IDs, very long strings): the order page ignores unknown IDs and caps at 30; the server dedupes and rejects unknown/inactive IDs. Tests in Task 1 and Task 6.
3. **The same webhook event delivered twice at once** (Stripe retry overlapping the first delivery): exactly one payment recorded, one email. Test in Task 7.
4. **Admin types prices the German way** ("1.200,50", "350,5", "350.50", "€ 99"): stored as the right cents, or rejected with a clear message; never silently ×100 wrong. Test in Task 1.
5. **Customer returns from Stripe before the webhook arrives**: the order page shows "We're confirming your payment with Stripe" and switches to "Payment received" once the webhook lands, without the redirect itself changing anything. Test in Task 8.

---

### Task 1: Pricing and money functions

**Files:**
- Create: `src/lib/shop/types.ts`, `src/lib/shop/pricing.ts`, `src/lib/shop/money.ts`, `src/lib/shop/payment-state.ts`
- Test: `tests/int/shop-pricing.int.spec.ts`

**Interfaces:**
- Produces (`types.ts`):
  ```ts
  export type VatRate = 0 | 19
  export type OrderingMode = 'off' | 'order' | 'quote'
  export type ExtraConfig = { id: string; title: string; price: number; days: number; active: boolean }
  export type OrderingConfig = { mode: OrderingMode; baseName: string; basePrice: number; baseDays: number; depositPercent: number | null; extras: ExtraConfig[] }
  export type QuoteLine = { kind: 'base' | 'extra'; id: string | null; title: string; net: number; days: number }
  export type Charge = { label: 'full' | 'deposit' | 'balance'; lines: { name: string; amount: number }[]; total: number }
  export type OrderQuote = { lines: QuoteLine[]; vatRate: VatRate; subtotal: number; depositPercent: number; depositNet: number; vat: number; total: number; deliveryDays: number }
  export type PaymentKind = 'full' | 'deposit' | 'balance'
  export type PaymentEntry = { kind: PaymentKind; status: 'open' | 'pending' | 'paid' | 'failed' | 'expired'; amount: number; refunded: number }
  export type PaymentStatus = 'unpaid' | 'deposit_paid' | 'paid' | 'refunded' | 'partially_refunded'
  export class OfferChangedError extends Error {}
  ```
- Produces (`pricing.ts`):
  - `MAX_EXTRAS = 30`
  - `parseExtraIds(value: unknown): string[]` — split on commas, trim, keep `/^[a-f0-9]{24}$|^[A-Za-z0-9_-]{1,40}$/` (Payload array row IDs), dedupe, first 30.
  - `vatFor(net: number, rate: VatRate): number`
  - `quoteOrder(config: OrderingConfig, extraIds: readonly string[], vatRate: VatRate): OrderQuote` — throws `OfferChangedError` if `mode !== 'order'` or any ID is unknown or inactive. Lines: base first, extras in config order. `deliveryDays = baseDays + Σ extra days`. Without deposit: `vat = Σ vatFor(line.net)`, `total = subtotal + vat`. With deposit `p` (1–99): `depositNet = Math.round(subtotal * p / 100)`, `vat = vatFor(depositNet) + vatFor(subtotal - depositNet)`, `total = subtotal + vat`. `depositPercent` 0, null or 100 means pay in full.
  - `chargeFor(quote: OrderQuote, kind: PaymentKind, names: { orderNumber: string; serviceTitle: string; vatLabel: string; depositLabel: string; balanceLabel: string }, balanceGross?: number): Charge` — `full`: one line per quote line plus a VAT line when `vat > 0`; `deposit`: one line `"<depositLabel> <p>% · <orderNumber> · <serviceTitle>"` (net) plus VAT line `vatFor(depositNet)`; `balance`: one line `"<balanceLabel> · <orderNumber>"` with `balanceGross`. `total` = Σ amounts.
- Produces (`money.ts`):
  - `parseEuros(input: string): number | null` — accepts optional `€` and spaces; German style `1.200,50` / `350,5` / `350`; dot decimals with 1–2 digits `350.50`; a dot followed by exactly three digits is a thousands separator (`1.200` → 120000). Returns cents in 1…10_000_000 or null.
  - `formatEuros(cents: number, locale: 'de' | 'en'): string` — `Intl.NumberFormat(locale === 'de' ? 'de-DE' : 'en-IE', { style: 'currency', currency: 'EUR' })`, no decimals when cents are 0.
- Produces (`payment-state.ts`):
  - `paymentState(total: number, payments: PaymentEntry[], manual: { amount: number }[]): { amountPaid: number; amountRefunded: number; balanceDue: number; paymentStatus: PaymentStatus }` — paid = Σ paid payments + Σ manual; refunded = Σ refunded; balance = max(0, total − paid); status: refunded ≥ paid > 0 → `refunded`; refunded > 0 → `partially_refunded`; paid ≥ total → `paid`; paid > 0 → `deposit_paid`; else `unpaid`.

- [ ] **Step 1: Write the failing tests**

```ts
describe('shop pricing', () => {
  const names = { orderNumber: 'R-2026-0001', serviceTitle: 'Website', vatLabel: 'VAT 19%', depositLabel: 'Deposit', balanceLabel: 'Remaining balance' }
  const config: OrderingConfig = { mode: 'order', baseName: 'Simple website', basePrice: 20000, baseDays: 7, depositPercent: null,
    extras: [ { id: 'cms', title: 'CMS', price: 35000, days: 5, active: true },
              { id: 'chat', title: 'AI chatbot', price: 45050, days: 4, active: true },
              { id: 'old', title: 'Old', price: 100, days: 1, active: false } ] }
  it('quotes base plus extras in config order with summed days', () => {
    const q = quoteOrder(config, ['chat', 'cms'], 0)
    expect(q.lines.map((l) => l.id)).toEqual([null, 'cms', 'chat'])
    expect([q.subtotal, q.vat, q.total, q.deliveryDays]).toEqual([100050, 0, 100050, 16])
  })
  it('rounds VAT per line half up', () => {
    expect(quoteOrder(config, ['chat'], 19).vat).toBe(3800 + 8560) // 450.50 € × 19 % = 85.595 → 85.60
  })
  it('splits a deposit and its VAT', () => {
    const q = quoteOrder({ ...config, depositPercent: 30 }, ['cms'], 19)
    expect(q.depositNet).toBe(16500)
    expect(q.vat).toBe(vatFor(16500, 19) + vatFor(38500, 19))
    expect(chargeFor(q, 'deposit', names).total).toBe(16500 + 3135)
  })
  it('refuses unknown, inactive extras and closed services', () => {
    expect(() => quoteOrder(config, ['old'], 0)).toThrow(OfferChangedError)
    expect(() => quoteOrder(config, ['nope'], 0)).toThrow(OfferChangedError)
    expect(() => quoteOrder({ ...config, mode: 'quote' }, [], 0)).toThrow(OfferChangedError)
  })
  it('parses extra IDs defensively', () => {
    expect(parseExtraIds('cms,cms, chat,<x>')).toEqual(['cms', 'chat'])
    expect(parseExtraIds(Array.from({ length: 500 }, (_, i) => `e${i}`).join(','))).toHaveLength(30)
    expect(parseExtraIds(undefined)).toEqual([])
  })
  it('parses euro input the German way', () => {
    expect(['350', '350,5', '350,50', '350.50', '1.200,50', '1.200', '€ 99'].map(parseEuros))
      .toEqual([35000, 35050, 35050, 35050, 120050, 120000, 9900])
    expect(['', '0', '-5', '3,505', 'abc', '1.20.3'].map(parseEuros)).toEqual([null, null, null, null, null, null])
  })
  it('derives payment status from payments, manual payments and refunds', () => {
    const paid = (amount: number, refunded = 0): PaymentEntry => ({ kind: 'deposit', status: 'paid', amount, refunded })
    expect(paymentState(1000, [paid(300)], []).paymentStatus).toBe('deposit_paid')
    expect(paymentState(1000, [paid(300)], [{ amount: 700 }])).toMatchObject({ paymentStatus: 'paid', balanceDue: 0 })
    expect(paymentState(1000, [paid(1000, 200)], []).paymentStatus).toBe('partially_refunded')
    expect(paymentState(1000, [paid(1000, 1000)], []).paymentStatus).toBe('refunded')
  })
})
```

- [ ] **Step 2: Run** `pnpm test:int tests/int/shop-pricing.int.spec.ts` — Expected: FAIL (modules missing).
- [ ] **Step 3: Implement** the four files with the signatures above.
- [ ] **Step 4: Run** the same command — Expected: PASS. Then `pnpm typecheck && pnpm lint`.
- [ ] **Step 5: Commit** `git add src/lib/shop tests/int/shop-pricing.int.spec.ts && git commit -m "Add shop pricing, money and payment state functions"`

---

### Task 2: Ordering tab, shop settings and money field

**Files:**
- Create: `src/fields/ordering.ts`, `src/fields/money.ts`, `src/components/admin/money-field.tsx`, `src/globals/ShopSettings.ts`, `src/lib/shop/config.ts`
- Modify: `src/collections/Services.ts` (add tab), `src/payload.config.ts` (global), `src/lib/website/load.ts` (`loadShopSettings`), `src/app/(payload)/custom.scss` (money field at phone width if needed)
- Generated: migration `shop_ordering`, `src/payload-types.ts`, `importMap.js`
- Test: `tests/int/shop-config.int.spec.ts`

**Interfaces:**
- Consumes: `OrderingConfig`, `parseEuros`, `formatEuros` (Task 1).
- Produces:
  - `moneyField(name: string, opts: { required?: boolean; label?: string; description?: string }): NumberField` — integer cents, `min: 1`, `max: 10_000_000`, admin `components.Field: '@/components/admin/money-field'`.
  - Service fields under group `ordering` exactly as the spec table (§1): `mode`, `baseName`, `baseDescription`, `baseIncludes[] { text }`, `basePrice`, `baseDays`, `depositPercent`, `extras[] { title, summary, description, includes[] { text }, image, icon, price, days, active }`. Localized: all texts and arrays of text; not localized: prices, days, mode, deposit, icon, active, image. Extras row label via existing `RowLabel` (`fields: ['title']`, fallback `Extra`). Conditional required: when `mode === 'order'`, `baseName`, `basePrice`, `baseDays` required (field `validate`).
  - `EXTRA_ICONS = ['cms','portal','chatbot','payment','seo','language','design','analytics','automation','generic'] as const` and `type ExtraIcon = (typeof EXTRA_ICONS)[number]` in `src/fields/ordering.ts`.
  - Global `shop-settings` (group `ADMIN_GROUPS.shop`, label "Shop settings", no drafts): `vatRate` select `'0' | '19'` default `'0'`, `priceNote` text localized, `orderNotificationEmail` email (field read: `isAdminField`), `orderingEnabled` checkbox default false. Access: read anyone, update isAdmin. Hooks: `afterChange: [revalidateGlobal]`.
  - `orderingConfig(service: Service): OrderingConfig` in `src/lib/shop/config.ts` (maps Payload doc → config; missing values → mode `off`).
  - `loadShopSettings(locale: WebsiteLocale): Promise<{ vatRate: VatRate; priceNote: string; orderingEnabled: boolean }>` (cached like `loadNavbar`).
  - `readShopSettings(payload: Payload): Promise<{ vatRate: VatRate; orderingEnabled: boolean; orderNotificationEmail: string | null }>` — uncached, for checkout and webhook.

- [ ] **Step 1: Write failing tests** (`// @vitest-environment node`, real DB like `access.int.spec.ts`):
  - `requires base name, price and days when mode is order` — `payload.create` a service with `ordering.mode: 'order'` and no base price rejects; with mode `off` succeeds.
  - `stores extras with stable row IDs and maps them to an ordering config` — create with two extras, `orderingConfig(doc).extras.map(e => e.id)` equals the row IDs.
  - `hides the order notification email from the public` — `payload.findGlobal({ slug: 'shop-settings', overrideAccess: false })` has no `orderNotificationEmail`; with an admin user it does.
  - Clean up created services in `afterAll`.
- [ ] **Step 2: Run** `pnpm test:int tests/int/shop-config.int.spec.ts` — Expected: FAIL.
- [ ] **Step 3: Implement** fields, global, money field component (text input showing `formatEuros`-style value without the € sign, parses with `parseEuros` on blur, shows "Enter an amount like 350 or 1.200,50" when null; uses `useField<number>` from `@payloadcms/ui`; 16 px font).
- [ ] **Step 4: Schema workflow:** `pnpm payload migrate:create shop_ordering` → review SQL (only new columns/tables for services ordering, its arrays and locales, and `shop_settings`) → `pnpm payload migrate` → `pnpm generate:types` → `pnpm generate:importmap`.
- [ ] **Step 5: Run** tests — Expected: PASS. `pnpm typecheck && pnpm lint`. Open `/admin` → a service → Ordering tab at 375 px width (browser pane) and check the money field and extras rows.
- [ ] **Step 6: Commit** `git commit -m "Add service ordering fields and shop settings"`

---

### Task 3: Orders and Stripe events collections

**Files:**
- Create: `src/collections/Orders.ts`, `src/collections/StripeEvents.ts`, `src/access/customer-session.ts`, `src/lib/shop/defer.ts`, `src/components/admin/stripe-link.tsx`
- Modify: `src/collections/Customers.ts` (use shared session check; `beforeDelete` guard), `src/payload.config.ts` (collections, after `Customers`)
- Generated: migration `shop_orders`, types
- Test: `tests/int/shop-orders.int.spec.ts`

**Interfaces:**
- Consumes: `paymentState`, `PaymentEntry` (Task 1).
- Produces:
  - `hasGrantedCustomerSession(req: PayloadRequest): Promise<boolean>` — the `_sid` + `hasCustomerSessionGrant` check currently inline in `customerRecordAccess` (Customers.ts); true for Local API calls. Customers.ts switches to it with no behavior change.
  - `orders` collection (group Shop, `useAsTitle: 'number'`, versions on, default columns `number, customer, total, paymentStatus, status, createdAt`). Fields per spec §6 with these names: `number` (text, unique, index), `customer` (relationship, required, index), `locale` (`de|en`), `snapshot` (group: `serviceId` number, `serviceSlug`, `serviceTitle`, `baseName`, `basePrice`, `baseDays`, `extras[] { extraId, title, price, days }`, `subtotal`, `vatRate` number, `vat`, `total`, `depositPercent`, `depositNet`, `deliveryDays`), `amountPaid`, `amountRefunded`, `balanceDue`, `paymentStatus`, `status`, `payments[] { kind, status, amount, refunded, checkoutSessionId (index), checkoutUrl, expiresAt, paymentIntentId (index), paidAt }`, `manualPayments[] { amount (moneyField), method 'bank_transfer'|'other', date, note (read: isAdminField) }`, `balanceRequested`, `balanceRequestedAt`, `billing` (group: `name`, `company`, `line1`, `line2`, `postalCode`, `city`, `country`, `vatId`), `termsAcceptedAt`, `adminNotes` (read/update: isAdminField). Admin UI: everything except `status`, `manualPayments`, `balanceRequested`, `adminNotes` is `readOnly`.
  - Access: `read` = admin, or verified non-suspended customer with `hasGrantedCustomerSession` → `{ customer: { equals: user.id } }`; `create`, `update`, `delete` = `isAdmin`.
  - Hooks:
    - `beforeChange`: when `operation === 'update'` and `!req.context.shopSystem`, copy `number, customer, locale, snapshot, payments, billing, termsAcceptedAt` from `originalDoc`; then always recompute `amountPaid, amountRefunded, balanceDue, paymentStatus` via `paymentState(snapshot.total, payments, manualPayments)`; when the new `paymentStatus !== 'unpaid'` and `status === 'awaiting_payment'` set `status = 'new'`; when `balanceRequested` turns on while `paymentStatus === 'deposit_paid'` and `balanceRequestedAt` is empty, set `balanceRequestedAt = now` and `req.context.sendBalanceRequest = true`.
    - `afterChange` (create): set `number = R-<year of createdAt>-<id padded to 4>` via `payload.update` with `context: { shopSystem: true }` and the same `req`.
    - (Task 7 adds the `afterChange` line that sends the balance-request email.)
  - `stripeLinks` UI field (admin only, sidebar) with component `src/components/admin/stripe-link.tsx`: for each payment with a `paymentIntentId`, a link "Open in Stripe" to `https://dashboard.stripe.com/test/payments/<paymentIntentId>` (drop `/test` once live keys are allowed). Run `pnpm generate:importmap`.
  - `stripe-events` collection: `admin.hidden: true`, fields `eventId` (text, required, unique, index), `type` (text), `processedAt` (date); access all `isAdmin`.
  - `deferAfterCommit(task: () => Promise<void>, log: Payload['logger']): void` — inside a Next request uses `after()` from `next/server`; outside (tests, scripts) runs `task()` immediately; errors are logged as `Shop email could not be sent`, never thrown.
  - Customers `beforeDelete`: if any order references the customer, throw `APIError('Customers with orders cannot be deleted. Orders must be kept for 8 years.', 400)`.

- [ ] **Step 1: Write failing tests** (real DB, customers created like `access.int.spec.ts`; helper `createOrder(customerId)` uses `overrideAccess: true, context: { shopSystem: true }`):
  - `assigns R-<year>-<0000> order numbers`.
  - `a customer reads only their own orders` (customer A sees 1, customer B sees 0 with `user` + `overrideAccess: false`).
  - `customers cannot create, update or delete orders` (each rejects with `Forbidden`).
  - `the admin cannot rewrite the snapshot or payments` — admin update with a changed `snapshot.total` keeps the old total.
  - `manual payments recalculate the balance` — order total 1000 with a paid deposit 300; admin adds manual payment 700 → `paymentStatus 'paid'`, `balanceDue 0`.
  - `a customer with orders cannot be deleted`; delete the order, then the customer delete succeeds.
  - `stripe event IDs are unique` — second create with the same `eventId` throws.
- [ ] **Step 2: Run** `pnpm test:int tests/int/shop-orders.int.spec.ts` — Expected: FAIL.
- [ ] **Step 3: Implement** collections, access helper, hooks, `defer.ts`.
- [ ] **Step 4: Schema workflow** (`shop_orders`), types. Re-run `pnpm test:int` (all files) — Expected: PASS, existing access tests unchanged. Fix the e2e `trackCustomer` fixture in `tests/e2e/customer-auth.e2e.spec.ts` to delete the customers' orders first.
- [ ] **Step 5: Commit** `git commit -m "Add orders and Stripe event collections"`

---

### Task 4: Pricing page grid and service page button

**Files:**
- Create: `src/components/shop/pricing-grid.tsx`, `src/components/shop/price.tsx` (server-safe `Price` using `formatEuros`)
- Modify: `src/components/site/website-page.tsx` (optional `afterHeading?: ReactNode` rendered between `PageHeading` and sections), `src/app/(frontend)/[locale]/pricing/page.tsx`, `src/app/(frontend)/[locale]/services/[slug]/page.tsx`, `src/lib/pages.ts` (`orderPath(slug) => \`/services/${slug}/order\``), `messages/de.json`, `messages/en.json` (namespace `Shop`), `scripts/seed/content.ts` + `scripts/seed-content.ts` (mockup ordering data on `websites`, only when the service has no ordering yet)
- Test: `tests/e2e/shop.e2e.spec.ts`

**Interfaces:**
- Consumes: `loadServices`, `loadShopSettings`, `orderingConfig`, `formatEuros`.
- Produces: `PricingGrid({ services, settings, locale }: { services: Service[]; settings: { orderingEnabled: boolean; priceNote: string }; locale: WebsiteLocale })` — cards for services with mode `order` (only when `orderingEnabled`) or `quote`: title, summary, "from €200" / "Price on request", up to three active extra titles ("+ CMS, AI chatbot, Payment page"), button "Configure" → `orderPath(slug)` or "Request a quote" → `/contact?service=<slug>`; price note under the grid. Responsive 1/2/3 columns, Taxful plan-card look with tokens.
- Service page: button label "Configure and order" → `orderPath(slug)` when mode `order` and ordering enabled; otherwise the existing contact button.

- [ ] **Step 1: Write the failing e2e test** (Playwright; seeds a published service `e2e-shop-<uuid>` with mode `order`, base 20000/7 days and extras CMS 35000/5 and AI chatbot 45000/4 through `getLocalTestPayload()`, sets `orderingEnabled: true`, restores settings and deletes the service after):
  - `pricing page lists an orderable service with its from price` — `/en/pricing` shows the service title, `from €200`, `+ CMS, AI chatbot`, and a `Configure` link to `/en/services/<slug>/order`.
  - `quote services show request a quote` — switch mode to `quote`, reload: `Request a quote` links to `/en/contact?service=<slug>`.
- [ ] **Step 2: Run** `pnpm test:e2e tests/e2e/shop.e2e.spec.ts` — Expected: FAIL.
- [ ] **Step 3: Implement** grid, page wiring, button, messages, seed data.
- [ ] **Step 4: Run** the e2e test — Expected: PASS. Check `/pricing` in the browser pane in light and dark theme and at 375 px.
- [ ] **Step 5: Commit** `git commit -m "Show service prices on the pricing page"`

---

### Task 5: Order page with preview

**Files:**
- Create: `src/app/(frontend)/[locale]/services/[slug]/order/page.tsx`, `src/components/shop/order-configurator.tsx` (client), `src/components/shop/extra-preview.tsx`, `src/components/shop/extra-icons.tsx`, `src/lib/shop/order-page.ts`
- Modify: `messages/*.json` (`Shop`)
- Test: `tests/e2e/shop.e2e.spec.ts`

**Interfaces:**
- Consumes: `loadService`, `loadShopSettings`, `orderingConfig`, `parseExtraIds`, `quoteOrder`, `formatEuros`, `EXTRA_ICONS`.
- Produces:
  - `orderPageData(service: Service, settings): OrderPageData` in `order-page.ts`, where `OrderPageData = { slug: string; title: string; base: { name: string; description: string; includes: string[]; price: number; days: number }; extras: { id: string; title: string; summary: string; description: string; includes: string[]; price: number; days: number; icon: ExtraIcon; image: { src: string; width: number; height: number; alt: string } | null }[]; vatRate: VatRate; depositPercent: number; priceNote: string }` — active extras only, display data only.
  - `OrderConfigurator({ data, action }: { data: OrderPageData; action: (state: CheckoutState, form: FormData) => Promise<CheckoutState> })` with `CheckoutState = { error?: 'offerChanged' | 'orderingClosed' | 'termsRequired' | 'rateLimited' | 'unavailable' }` (exported from `src/lib/shop/checkout-state.ts`, created here).
  - Behavior (spec §3 and mockup): reads `?extras` with `useSearchParams` (wrapped in `Suspense`) through `parseExtraIds`, keeps selection in state and in the URL via `history.replaceState`; click toggles and focuses, clicking a selected focused row deselects; totals via `quoteOrder` on the client for display; preview shows image (`ResponsiveImage`/`MediaImage` rules: use the generated WebP size) or icon; summary shows lines, total, deposit due now when set, "about N working days", price note, terms checkbox (link `/terms`), button "Continue to payment", the exact Stripe sentence; the form posts hidden `extras` and `terms`. Phone: preview inline under the focused row and a sticky bottom bar with total and button. Keyboard: rows are `button`s with `aria-pressed`.
  - `checkoutNotReady(_state: CheckoutState, _form: FormData): Promise<CheckoutState>` in `src/lib/shop/checkout-state.ts` (`'use server'` file kept separate from the type), returning `{ error: 'unavailable' }`. The page passes it as `action` until Task 6 replaces it with `startCheckout`; Task 6 then deletes `checkoutNotReady`.
  - Page: `generateStaticParams() { return [] }` (ISR like the service page); `notFound()` unless the service is published, mode `order` and `orderingEnabled`; metadata title `<service title> – <Shop.orderTitle> | Rheino`.
- [ ] **Step 1: Extend the e2e test:**
  - `order page totals follow the selected extras` — open `/en/services/<slug>/order?extras=<cmsId>`: CMS is pressed, total `€550`, `about 12 working days`; press AI chatbot: total `€1,000`, `about 16 working days`, URL contains both IDs; press AI chatbot again (focused): total back to `€550`.
  - `preview shows the focused extra` — pressing AI chatbot shows its description and its first include item in the preview region (`getByRole('region', { name: 'Preview' })`).
  - `unknown extras in the URL are ignored` — `?extras=nope,<cmsId>,<cmsId>` → only CMS selected.
  - `the Stripe note is shown` — exact English sentence visible.
  - `unpublished or non-order services return 404` — mode `off` → 404.
- [ ] **Step 2: Run** — Expected: FAIL.
- [ ] **Step 3: Implement** page, configurator, preview, icons, messages.
- [ ] **Step 4: Run** — Expected: PASS. Compare with the mockup in the browser pane: light and dark theme, 1280 px and 375 px; tab through rows with the keyboard.
- [ ] **Step 5: Commit** `git commit -m "Add service order page with extras preview"`

(Task 6 wires `startCheckout` into the page.)

---

### Task 6: Login handoff, Stripe gateway and checkout

**Files:**
- Create: `src/lib/shop/stripe.ts`, `src/lib/shop/checkout.ts` (core), `src/lib/shop/actions.ts` (`'use server'`), `src/lib/customer-auth/next-path.ts`
- Modify: `package.json` (`stripe: 23.1.0`), `.env.example`, `src/lib/customer-auth/rate-limit.ts` (mode `checkout`: `[10, 900]` per email), `src/lib/customer-auth/actions.ts`, `src/lib/customer-auth/email.ts`, `src/components/account/auth-page.tsx`, `src/components/account/customer-form.tsx`, `src/app/(frontend)/[locale]/services/[slug]/order/page.tsx`
- Test: `tests/int/shop-checkout.int.spec.ts`, `tests/int/next-path.int.spec.ts`, `tests/e2e/shop.e2e.spec.ts`

**Interfaces:**
- Consumes: Tasks 1–3, `customerRequest`, `getCustomerSession`, `allowAuthRequest`, `readShopSettings`, `orderingConfig`.
- Produces:
  - `safeNextPath(value: unknown): string | null` — unprefixed site path only: starts with `/`, not `//` or `/\`, ≤ 500 chars, no control characters, first segment not `en`, `de`, `api`, `admin`, `_next`.
  - Auth flow: `AuthPage` reads `searchParams.next` → `safeNextPath` → hidden `next` input in `CustomerForm`; links between login and signup keep `next`; `submitCustomerAuth` login → `destination = next ?? '/account'`; signup → `context.customerNext = next`; `customerEmail('verify', …)` appends `?next=<encoded>` to the verify URL when `req.context.customerNext` passes `safeNextPath`; verify-email success → `/login?status=verified&next=<encoded>`; an already logged-in visitor on login/signup is redirected to `next ?? '/account'`.
  - `StripeGateway` (in `stripe.ts`):
    ```ts
    export type CheckoutSessionInput = { stripeCustomerId: string; lines: { name: string; amount: number }[]; orderId: number; kind: PaymentKind; locale: 'de' | 'en'; successUrl: string; cancelUrl: string; expiresAt: number }
    export interface StripeGateway {
      ensureCustomer(input: { email: string; name: string; customerId: number; existing: string | null }): Promise<string>
      createCheckoutSession(input: CheckoutSessionInput, idempotencyKey: string): Promise<{ id: string; url: string; expiresAt: number }>
    }
    export function stripeGateway(): StripeGateway | null      // null when no key or not sk_test_
    export function verifyStripeEvent(rawBody: string, signature: string | null): Stripe.Event  // throws on bad/missing signature or live mode
    ```
    Session params: `mode: 'payment'`, `currency: 'eur'`, `line_items` with `price_data { currency: 'eur', unit_amount, product_data: { name } }` and `quantity: 1`, `customer`, `billing_address_collection: 'required'`, `tax_id_collection: { enabled: true }`, `customer_update: { name: 'auto', address: 'auto' }`, `client_reference_id`, `metadata { orderId, kind }`, `payment_intent_data.metadata` same, `locale`, `expires_at`, `success_url`, `cancel_url`.
  - `createCheckout(deps: { payload: Payload; stripe: StripeGateway; now?: () => Date }, input: CheckoutInput): Promise<{ url: string } | { error: CheckoutError }>` where
    `CheckoutInput = { customer: Customer; locale: 'de' | 'en'; origin: string } & ({ kind: 'new'; slug: string; extraIds: string[]; termsAccepted: boolean } | { kind: 'balance'; orderId: number })` and
    `CheckoutError = 'offerChanged' | 'orderingClosed' | 'termsRequired' | 'notFound' | 'nothingDue' | 'unavailable'`.
    New: terms → settings (`orderingEnabled`) → fresh published service (`draft: false`, `overrideAccess: false`, no user, customer's locale, fallback `de`) → `quoteOrder` → create order (`awaiting_payment`, snapshot, `termsAcceptedAt`) → `ensureCustomer` (store `stripeCustomerId` with `overrideAccess: true`) → `chargeFor(quote, depositPercent ? 'deposit' : 'full', …)` → session (idempotency key `order-<id>-<kind>-<attempt>` where attempt = existing payments count) → push payment `{ kind, status: 'open', amount: charge.total, checkoutSessionId, checkoutUrl, expiresAt }` with `context.shopSystem`. URLs: success `<origin><localizedPath(locale, '/account/orders/<id>')>?checkout=return`, cancel `<origin><localizedPath(locale, orderPath(slug))>?extras=<ids>`. `expiresAt = now + 3600 s`.
    Balance: order must belong to the customer, `paymentStatus === 'deposit_paid'`, `balanceRequested`, `balanceDue > 0`, else `nothingDue`/`notFound`; charge `chargeFor(quote-from-snapshot, 'balance', …, balanceDue)`.
  - Server actions: `startCheckout(locale: Locale, slug: string, _state: CheckoutState, form: FormData): Promise<CheckoutState>` and `payBalance(locale: Locale, orderId: number, _state: CheckoutState, form: FormData): Promise<CheckoutState>` — `customerRequest()` origin check; no session → `redirect(localizedPath(locale, '/login?next=' + encodeURIComponent(orderPath(slug) + '?extras=' + ids)))`; `allowAuthRequest(payload, 'checkout', headers, customer.email)` → `rateLimited`; `stripeGateway()` null → `unavailable`; on success `redirect(url)`.
- [ ] **Step 1: Write failing tests.**
  - `next-path.int.spec.ts`: accepts `/services/websites/order?extras=a,b`; rejects `//evil.test`, `/\\evil.test`, `https://evil.test`, `/en/account`, `/api/x`, `/admin`, a 501-char path, a path with `\n`.
  - `shop-checkout.int.spec.ts` with a `fakeStripe()` recording calls:
    - `creates an order with a snapshot and opens a session at server prices` — with VAT 19 % the fake receives lines `[base 20000, CMS 35000, VAT 10450]`; the order has `status 'awaiting_payment'`, `snapshot.total 65450`, `payments[0].status 'open'`.
    - `uses the current published price after an admin change` — publish a new CMS price, checkout charges it.
    - `refuses inactive or removed extras and closed services` — inactive extra → `offerChanged`; mode `quote` → `offerChanged`; `orderingEnabled false` → `orderingClosed`.
    - `requires the terms checkbox` → `termsRequired`, no order created.
    - `charges only the deposit` — deposit 30 % → one deposit line + VAT line, `payments[0].kind 'deposit'`.
    - `rejects duplicate and unknown extra IDs from the client` — `['cms','cms']` charges CMS once; `['nope']` → `offerChanged`.
    - `balance checkout needs a requested balance on the customer's own order` — other customer's order → `notFound`; not requested → `nothingDue`; requested → one balance line of `balanceDue`.
    - `retry after expiry uses a new idempotency key`.
    - `refuses live keys` — `STRIPE_SECRET_KEY=sk_live_x` → `stripeGateway()` returns null.
  - e2e: `selection survives the login step` — logged out, `/en/services/<slug>/order?extras=<cmsId>`, accept terms, Continue → `/en/login?next=…`; log in as a seeded verified customer → back on the order page with CMS selected. When `STRIPE_SECRET_KEY` starts with `sk_test_` (else `test.skip`): Continue → URL starts with `https://checkout.stripe.com/`.
- [ ] **Step 2: Run** `pnpm test:int tests/int/next-path.int.spec.ts tests/int/shop-checkout.int.spec.ts` — Expected: FAIL.
- [ ] **Step 3:** `pnpm add stripe@23.1.0` (exact; if pnpm's release-age check refuses, stop and report, do not bypass).
- [ ] **Step 4: Implement** next-path, auth changes, gateway, checkout core, actions, rate-limit mode, `.env.example` entries (`STRIPE_SECRET_KEY=` with "sk_test_ only until launch", `STRIPE_WEBHOOK_SECRET=`), wire `startCheckout.bind(null, locale, slug)` into the order page.
- [ ] **Step 5: Run** all int tests and the shop e2e file — Expected: PASS; the existing customer-auth e2e still passes. `pnpm typecheck && pnpm lint`.
- [ ] **Step 6: Commit** `git commit -m "Add Stripe checkout with server-side prices and login handoff"`

---

### Task 7: Webhook, payment emails and balance request email

**Files:**
- Create: `src/app/(frontend)/api/stripe/webhook/route.ts`, `src/lib/shop/webhook.ts`, `src/lib/shop/email.ts`
- Modify: `src/collections/Orders.ts` (balance-request `afterChange` line from Task 3)
- Test: `tests/int/shop-webhook.int.spec.ts`

**Interfaces:**
- Consumes: `verifyStripeEvent`, `authTransaction` (`src/lib/customer-auth/transaction.ts`), `deferAfterCommit`, `readShopSettings`, `formatEuros`, `accountOrigin`.
- Produces:
  - Route `POST`: reads `request.text()` after checking `content-length` ≤ 1 MB (413 otherwise), `verifyStripeEvent` (400 on failure), `handleStripeEvent`, 200 `{ received: true }`; database errors → 500.
  - `handleStripeEvent(payload: Payload, event: Stripe.Event): Promise<'processed' | 'duplicate' | 'ignored'>` — in one `authTransaction`: create `stripe-events` row (unique violation → roll back → `duplicate`), find the order by `metadata.orderId` and require a payment whose `checkoutSessionId` equals the session ID (`charge.refunded`: payment whose `paymentIntentId` equals the charge's), else log `Stripe event for unknown order` and return `ignored`. Updates use `req` and `context: { shopSystem: true }`:
    - `checkout.session.completed` + `payment_status 'paid'`, `checkout.session.async_payment_succeeded` → payment `paid`, `amount = session.amount_total` (log a warning if it differs), `paymentIntentId`, `paidAt`; `billing` from `customer_details` (`name`, `business_name` → company, address, first `tax_ids[].value`).
    - `checkout.session.completed` + `payment_status 'unpaid'` → payment `pending`.
    - `checkout.session.async_payment_failed` → `failed`; `checkout.session.expired` → `expired`; when no payment is `paid`, `pending` or `open` and `amountPaid === 0` → `status 'cancelled'`.
    - `charge.refunded` → that payment's `refunded = charge.amount_refunded`.
    - Other types → `ignored` (still recorded so retries stay cheap).
    - After commit: payment confirmed → `sendPaymentEmails(payload, order)` via `deferAfterCommit`.
  - `src/lib/shop/email.ts` (same HTML style as `customerEmail`, German or English by `order.locale`):
    - `sendPaymentEmails(payload: Payload, order: Order): Promise<void>` — customer "Payment received / Zahlung erhalten" with number, lines, amount paid, balance due, link `<origin>/account/orders/<id>` (localized); owner email to `orderNotificationEmail` (skip when empty) with link `<origin>/admin/collections/orders/<id>`.
    - `sendBalanceRequestEmail(payload: Payload, order: Order): Promise<void>` — "Remaining balance due / Restbetrag fällig" with `balanceDue` and the order link.
  - Orders `afterChange`: `if (req.context.sendBalanceRequest) deferAfterCommit(() => sendBalanceRequestEmail(req.payload, doc), req.payload.logger)`.
- [ ] **Step 1: Write failing tests** — build events as objects and sign them with `stripe.webhooks.generateTestHeaderString({ payload, secret })`; POST to the route handler function directly (`import { POST } from '@/app/(frontend)/api/stripe/webhook/route'`) with `new Request(...)`; set `RHEINO_LOCAL_MAIL_DIR` to a temp dir and read emails from it:
  - `rejects a bad signature with 400 and changes nothing`.
  - `rejects live-mode events`.
  - `marks a paid order and sends both emails` — `paymentStatus 'paid'`, `status 'new'`, `billing.city` set, two mails (customer, owner).
  - `processes the same event once, even concurrently` — `Promise.all` of two identical deliveries → one `paid` payment, one customer mail, results `['processed','duplicate']` in any order.
  - `deposit then balance` — deposit paid → `deposit_paid`; admin sets `balanceRequested` → one balance-request mail; balance session paid → `paid`, `balanceDue 0`.
  - `async payment pending then succeeded`.
  - `an expired session cancels an unpaid order`.
  - `a partial refund marks partially_refunded`.
  - `ignores an event whose session does not match the order` — returns 200, order unchanged.
- [ ] **Step 2: Run** `pnpm test:int tests/int/shop-webhook.int.spec.ts` — Expected: FAIL.
- [ ] **Step 3: Implement** route, handler, emails, orders hook line.
- [ ] **Step 4: Run** all int tests — Expected: PASS. `pnpm typecheck && pnpm lint`.
- [ ] **Step 5: Commit** `git commit -m "Process Stripe webhooks once and email payment confirmations"`

---

### Task 8: Account orders pages

**Files:**
- Create: `src/app/(frontend)/[locale]/account/orders/page.tsx`, `src/app/(frontend)/[locale]/account/orders/[id]/page.tsx`, `src/components/account/portal-orders.tsx`, `src/components/account/portal-order.tsx`, `src/components/account/checkout-return.tsx` (client), `src/components/account/pay-balance.tsx` (client)
- Modify: `src/components/account/portal-shell.tsx` (`section: 'profile' | 'security' | 'orders'`, link `/account/orders`), `src/components/account/portal-icons.tsx` (`orders` icon), `src/components/account/portal.module.css` if needed, `messages/*.json` (`CustomerPortal`)
- Test: `tests/e2e/shop.e2e.spec.ts`

**Interfaces:**
- Consumes: `getCustomer`, `orders` collection, `payBalance`, `formatEuros`.
- Produces:
  - List page: `payload.find({ collection: 'orders', user, overrideAccess: false, sort: '-createdAt', limit: 50, depth: 0 })`, hiding orders with `paymentStatus 'unpaid'` and no `open` payment whose `expiresAt` is in the future. Row: number, service title, date, total, payment status badge, work status; unpaid open orders show "Continue payment" (link to `checkoutUrl`). Empty state invites to `/pricing`.
  - Detail page: `findByID` as the customer (404 when not theirs); snapshot lines, VAT, total, deposit, paid, balance due, delivery estimate, payments (Stripe and manual, without manual notes), billing details, status; `PayBalance` button "Pay remaining €X" when `paymentStatus 'deposit_paid'`, `balanceRequested` and `balanceDue > 0`.
  - `CheckoutReturn({ paid }: { paid: boolean })` — shown when `?checkout=return`: paid → "Payment received"; else "We're confirming your payment with Stripe", `router.refresh()` every 3 s up to 20 times, then "This can take a few minutes. We'll email you."
- [ ] **Step 1: Write failing e2e tests** (seed customer and orders with the Local API, log in through the UI):
  - `lists the customer's paid orders and hides expired unpaid ones`.
  - `another customer's order returns 404`.
  - `return page waits for the webhook` — unpaid order with `?checkout=return` shows the confirming text; update the order to paid through the Local API (simulating the webhook); within 10 s the page shows "Payment received".
  - `shows the balance button only when the balance is requested`.
  - Portal nav shows Orders with `aria-current` on the orders pages.
- [ ] **Step 2: Run** — Expected: FAIL.
- [ ] **Step 3: Implement** pages and components.
- [ ] **Step 4: Run** — Expected: PASS. Check both themes and 375 px in the browser pane.
- [ ] **Step 5: Commit** `git commit -m "Add orders to the customer account"`

---

### Task 9: Docs, plan update and full verification

**Files:**
- Create: `docs/shop.md`
- Modify: `PLAN.md` (§2 Payments line, §3 replace `packages`/`addons` with the Ordering tab, `orders` fields with `paymentStatus` + work `status`, `shop-settings`; §5 flow: billing details collected by Stripe; §9 phases C/E split into round 1 done and round 2 monthly), `docs/cms.md` (sidebar: Shop group contents), `README.md` (Stripe test setup pointer), `CLAUDE.md` only if a rule changed (none expected)

- [ ] **Step 1: Write `docs/shop.md`:** set up ordering for a service (fields, publish), shop settings, VAT setting and the tax-advisor note, deposits and the balance request switch, manual bank payments, Stripe test setup (`.env` keys, `stripe listen --forward-to localhost:3000/api/stripe/webhook`, copying the `whsec_…` secret, test card `4242 4242 4242 4242`), refunds in the Stripe dashboard.
- [ ] **Step 2: Update** PLAN.md, `docs/cms.md`, README.
- [ ] **Step 3: Run** `pnpm typecheck && pnpm lint && pnpm test:int && pnpm test:e2e && pnpm build` — Expected: all pass.
- [ ] **Step 4: Manual Stripe run** (needs the owner's test keys in `.env` and the Stripe CLI): full payment with 4242…, a 30 % deposit then a requested balance, an expired session (`stripe trigger checkout.session.expired` or wait), a partial refund from the dashboard. Check order states in admin and account, and the emails in Mailpit.
- [ ] **Step 5: Commit** `git commit -m "Document service ordering and update the plan"`
