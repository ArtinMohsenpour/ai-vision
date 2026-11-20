import Stripe from 'stripe'

import type { PaymentKind } from './types'

export type CheckoutSessionInput = {
  stripeCustomerId: string
  lines: { name: string; amount: number }[]
  orderId: number
  kind: PaymentKind
  locale: 'de' | 'en'
  successUrl: string
  cancelUrl: string
  /** Unix seconds. */
  expiresAt: number
}

/** The two Stripe calls checkout needs. Tests use a fake; production uses the Stripe SDK. */
export interface StripeGateway {
  ensureCustomer(input: {
    email: string
    name: string
    customerId: number
    existing: string | null
  }): Promise<string>
  createCheckoutSession(
    input: CheckoutSessionInput,
    idempotencyKey: string,
  ): Promise<{ id: string; url: string; expiresAt: number }>
}

let cached: { key: string; client: Stripe } | null = null
let warned = false

/** Test keys only until the business registration (PLAN.md §5). */
function stripeClient(): Stripe | null {
  const key = process.env.STRIPE_SECRET_KEY
  if (!key?.startsWith('sk_test_')) {
    if (key && !warned) {
      warned = true
      console.error('Stripe checkout disabled: test keys only until launch')
    }
    return null
  }
  if (cached?.key !== key)
    cached = { key, client: new Stripe(key, { maxNetworkRetries: 2, timeout: 20_000 }) }
  return cached.client
}

export function stripeGateway(): StripeGateway | null {
  const stripe = stripeClient()
  if (!stripe) return null
  return {
    async ensureCustomer({ email, name, customerId, existing }) {
      if (existing) return existing
      const created = await stripe.customers.create(
        { email, name, metadata: { rheinoCustomerId: String(customerId) } },
        { idempotencyKey: `customer-${customerId}` },
      )
      return created.id
    },
    async createCheckoutSession(input, idempotencyKey) {
      const metadata = { orderId: String(input.orderId), kind: input.kind }
      const session = await stripe.checkout.sessions.create(
        {
          mode: 'payment',
          currency: 'eur',
          customer: input.stripeCustomerId,
          customer_update: { name: 'auto', address: 'auto' },
          billing_address_collection: 'required',
          tax_id_collection: { enabled: true },
          line_items: input.lines.map((line) => ({
            quantity: 1,
            price_data: {
              currency: 'eur',
              unit_amount: line.amount,
              product_data: { name: line.name },
            },
          })),
          client_reference_id: String(input.orderId),
          metadata,
          payment_intent_data: { metadata },
          locale: input.locale,
          expires_at: input.expiresAt,
          success_url: input.successUrl,
          cancel_url: input.cancelUrl,
        },
        { idempotencyKey },
      )
      if (!session.url) throw new Error('Stripe returned a Checkout Session without a URL')
      return { id: session.id, url: session.url, expiresAt: session.expires_at }
    },
  }
}

/**
 * Verifies a webhook's signature on the raw body. Throws on a missing or wrong signature, a
 * missing secret, or a live-mode event while Stripe is in test mode.
 */
export function verifyStripeEvent(rawBody: string, signature: string | null): Stripe.Event {
  const secret = process.env.STRIPE_WEBHOOK_SECRET
  if (!secret || !signature) throw new Error('Missing Stripe webhook signature or secret')
  const event = Stripe.webhooks.constructEvent(rawBody, signature, secret)
  if (event.livemode) throw new Error('Live Stripe events are not accepted before launch')
  return event
}
