# Shop: service ordering and Stripe payments

Customers configure a service (base package plus extras), pay once or a deposit through Stripe's hosted payment page, and follow their orders in their account. Round 1 covers one-off payments and deposits; monthly items come in round 2. Design: `docs/superpowers/specs/2026-11-20-service-ordering-design.md`.

## Set up a service for ordering

1. In the admin, open **Pages → Service pages → (service) → Ordering**.
2. Choose **Order online** (or **Request a quote**, which shows a link to the contact page).
3. Fill in the base package: name, description, "Included in every order" points, **base price (net)** and delivery days. Optional: a **deposit %** (empty, 0 or 100 = pay everything at checkout).
4. Add extras: title, one-line summary, **price (net)**, extra working days and, under **Preview**, a description, "What you get" points and an image (or an icon when there is no image). Drag to reorder; switch off **Active** to hide an extra without deleting it.
5. Switch the language at the top to add English texts (English falls back to German).
6. **Publish.** Draft changes never reach the website or checkout.

Prices are typed in euros ("350" or "1.200,50") and stored as cents. Existing orders keep the prices they were ordered at.

## Shop settings

**Shop → Shop settings** applies to every service:

| Setting                  | Effect                                                                                                                                                                                                                                                                                                     |
| ------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Online ordering is open  | Off hides every order button and blocks checkout. Quote links stay.                                                                                                                                                                                                                                        |
| VAT                      | 0 % (small business, §19 UStG) or 19 %, added on top of net prices. Every customer pays the same, whatever their country. Before launch, confirm with the tax advisor: a business customer in another EU country is normally reverse-charged (§13b UStG), so such an order may have to go through a quote. |
| Price note               | Shown under totals, e.g. "All prices net plus 19% VAT".                                                                                                                                                                                                                                                    |
| Order notification email | Receives an email for every confirmed payment.                                                                                                                                                                                                                                                             |

## Orders

Checkout creates an order with a price snapshot and status **Awaiting payment**. Only Stripe's webhook confirms payments; the redirect back from Stripe changes nothing. Unpaid orders whose Stripe page expired (after 1 hour) are cancelled and hidden from the customer.

In **Shop → Orders** the owner:

- sets the **work status** (New → In progress → Delivered → Completed, or Cancelled);
- turns on **Request remaining balance** when the rest of a deposit order is due. The customer gets one email and a "Pay remaining" button in their account;
- records money received outside Stripe (for example a bank transfer) under **Payments outside Stripe**. Paid, balance and payment status update on save;
- opens a payment in the Stripe dashboard from the sidebar link;
- refunds in the Stripe dashboard. The webhook marks the order refunded or partly refunded.

Snapshot, Stripe payments and billing details are read-only. A customer with orders cannot be deleted (orders are kept for 8 years).

## What customers see

- `/pricing`: every service with ordering open (and quote services) with its "from" price.
- Any page with a **Package and price** content item (`docs/cms.md`): the live base package, extras and prices of the chosen service, with the order button while ordering is open.
- `/services/<slug>/order`: the configurator with preview, live total and delivery estimate. The selection stays in the URL (`?extras=…`), so it survives login and sign-up (including email verification).
- `/account/orders`: their orders; `/account/orders/<id>`: details, payments, billing details and the balance button.
- The site says: "Secure payment by Stripe. Your card details go straight to Stripe. We never see or store them." Rheino stores the account and the order, never card or bank details.

## Stripe test setup

Stripe stays in test mode until the business registration. Live keys are refused.

1. In the Stripe dashboard (test mode), copy the secret key into `.env` as `STRIPE_SECRET_KEY=sk_test_…`. No publishable key is needed.
2. Install the [Stripe CLI](https://docs.stripe.com/stripe-cli) and run:

   ```bash
   stripe listen --forward-to localhost:3000/api/stripe/webhook
   ```

   Copy the printed `whsec_…` value into `.env` as `STRIPE_WEBHOOK_SECRET`, then restart `pnpm dev`. Use your dev server's port if it is not 3000.

3. Order a service with the test card `4242 4242 4242 4242`, any future date and any CVC. The order turns **Paid** and both emails arrive (Mailpit at http://localhost:8025 when `RHEINO_MAILPIT=1`).

Webhook events used: `checkout.session.completed`, `checkout.session.async_payment_succeeded`, `checkout.session.async_payment_failed`, `checkout.session.expired`, `charge.refunded`. In production, create an endpoint for `https://<domain>/api/stripe/webhook` with these events and use its own signing secret.

## Code

| Area                  | Files                                                                                                       |
| --------------------- | ----------------------------------------------------------------------------------------------------------- |
| Prices, VAT, deposits | `src/lib/shop/pricing.ts`, `money.ts`, `payment-state.ts`                                                   |
| Admin fields          | `src/fields/ordering.ts`, `src/fields/money.ts`, `src/globals/ShopSettings.ts`, `src/collections/Orders.ts` |
| Checkout              | `src/lib/shop/checkout.ts`, `actions.ts`, `stripe.ts`                                                       |
| Webhook and emails    | `src/app/(frontend)/api/stripe/webhook/route.ts`, `src/lib/shop/webhook.ts`, `email.ts`                     |
| Pages                 | `src/components/shop/`, `src/components/account/portal-order*.tsx`                                          |
| Tests                 | `tests/int/shop-*.int.spec.ts`, `tests/e2e/shop.e2e.spec.ts`, `tests/e2e/account-orders.e2e.spec.ts`        |
