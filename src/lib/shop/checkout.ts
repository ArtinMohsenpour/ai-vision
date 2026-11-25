import type { Payload } from 'payload'

import { localizedPath } from '@/i18n/routing'
import { orderPath } from '@/lib/pages'
import type { Customer, Order } from '@/payload-types'
import type { CheckoutError } from './checkout-state'
import { orderingConfig, readShopSettings, vatRateOf } from './config'
import { chargeLabels } from './labels'
import { chargeFor, quoteOrder } from './pricing'
import type { StripeGateway } from './stripe'
import { OfferChangedError, type OrderQuote, type PaymentKind } from './types'

export type CheckoutInput = { customer: Customer; locale: 'de' | 'en'; origin: string } & (
  | { kind: 'new'; slug: string; extraIds: string[]; termsAccepted: boolean }
  | { kind: 'balance'; orderId: number }
)

export type CheckoutResult = { url: string } | { error: CheckoutError }

/** `stripe` is null when Stripe is not configured: offer problems are still reported first. */
type Deps = { payload: Payload; stripe: StripeGateway | null; now?: () => Date }
type ReadyDeps = Deps & { stripe: StripeGateway }

const SESSION_SECONDS = 60 * 60
const system = { overrideAccess: true, context: { shopSystem: true } } as const

/** Only the fields chargeFor reads for a balance payment. */
function quoteFromSnapshot(order: Order): OrderQuote {
  const snapshot = order.snapshot
  return {
    lines: [],
    vatRate: vatRateOf(String(snapshot.vatRate ?? 0)),
    subtotal: snapshot.subtotal ?? 0,
    depositPercent: snapshot.depositPercent ?? 0,
    depositNet: snapshot.depositNet ?? 0,
    vat: snapshot.vat ?? 0,
    total: snapshot.total,
    deliveryDays: snapshot.deliveryDays ?? 0,
  }
}

async function stripeCustomerFor(deps: ReadyDeps, customer: Customer) {
  // The session user cannot read this admin-only field, so read it as the system.
  const stored = await deps.payload.findByID({
    collection: 'customers',
    id: customer.id,
    depth: 0,
    overrideAccess: true,
    select: { stripeCustomerId: true },
  })
  const existing = stored.stripeCustomerId || null
  const id = await deps.stripe.ensureCustomer({
    email: customer.email,
    name: `${customer.firstName} ${customer.lastName}`.trim(),
    customerId: customer.id,
    existing,
  })
  if (id !== existing)
    await deps.payload.update({
      collection: 'customers',
      id: customer.id,
      data: { stripeCustomerId: id },
      overrideAccess: true,
    })
  return id
}

async function openSession(
  deps: ReadyDeps,
  input: CheckoutInput,
  order: Order,
  kind: PaymentKind,
  lines: { name: string; amount: number }[],
  cancelPath: string,
) {
  const now = deps.now?.() ?? new Date()
  const stripeCustomerId = await stripeCustomerFor(deps, input.customer)
  const attempt = order.payments?.length ?? 0
  const session = await deps.stripe.createCheckoutSession(
    {
      stripeCustomerId,
      lines,
      orderId: order.id,
      kind,
      locale: input.locale,
      successUrl: `${input.origin}${localizedPath(input.locale, `/account/orders/${order.id}`)}?checkout=return`,
      cancelUrl: `${input.origin}${localizedPath(input.locale, cancelPath)}`,
      expiresAt: Math.floor(now.getTime() / 1000) + SESSION_SECONDS,
    },
    `order-${order.id}-${kind}-${attempt}`,
  )
  await deps.payload.update({
    collection: 'orders',
    id: order.id,
    data: {
      payments: [
        ...(order.payments ?? []),
        {
          kind,
          status: 'open',
          amount: lines.reduce((sum, line) => sum + line.amount, 0),
          refunded: 0,
          checkoutSessionId: session.id,
          checkoutUrl: session.url,
          expiresAt: new Date(session.expiresAt * 1000).toISOString(),
        },
      ],
    },
    ...system,
  })
  return { url: session.url }
}

async function startNewOrder(deps: Deps, input: Extract<CheckoutInput, { kind: 'new' }>) {
  if (!input.termsAccepted) return { error: 'termsRequired' } as const
  const settings = await readShopSettings(deps.payload)
  if (!settings.orderingEnabled) return { error: 'orderingClosed' } as const

  // Fresh published prices, never the website cache.
  const { docs } = await deps.payload.find({
    collection: 'services',
    where: { and: [{ slug: { equals: input.slug } }, { _status: { equals: 'published' } }] },
    draft: false,
    overrideAccess: false,
    locale: input.locale,
    fallbackLocale: 'de',
    depth: 0,
    limit: 1,
  })
  const service = docs[0]
  if (!service) return { error: 'offerChanged' } as const
  let quote: OrderQuote
  try {
    quote = quoteOrder(orderingConfig(service), input.extraIds, settings.vatRate)
  } catch (error) {
    if (error instanceof OfferChangedError) return { error: 'offerChanged' } as const
    throw error
  }

  if (!deps.stripe) return { error: 'unavailable' } as const
  const ready = deps as ReadyDeps
  const now = deps.now?.() ?? new Date()
  const order = await deps.payload.create({
    collection: 'orders',
    data: {
      customer: input.customer.id,
      locale: input.locale,
      status: 'awaiting_payment',
      termsAcceptedAt: now.toISOString(),
      snapshot: {
        serviceId: service.id,
        serviceSlug: service.slug,
        serviceTitle: service.title,
        baseName: quote.lines[0].title,
        basePrice: quote.lines[0].net,
        baseDays: quote.lines[0].days,
        extras: quote.lines
          .filter((line) => line.kind === 'extra')
          .map((line) => ({
            extraId: line.id,
            title: line.title,
            price: line.net,
            days: line.days,
          })),
        subtotal: quote.subtotal,
        vatRate: quote.vatRate,
        vat: quote.vat,
        total: quote.total,
        depositPercent: quote.depositPercent,
        depositNet: quote.depositNet,
        deliveryDays: quote.deliveryDays,
      },
    },
    ...system,
  })
  const kind: PaymentKind = quote.depositPercent ? 'deposit' : 'full'
  const charge = chargeFor(quote, kind, {
    orderNumber: order.number ?? `#${order.id}`,
    serviceTitle: service.title,
    ...chargeLabels(input.locale, quote.vatRate),
  })
  const extras = quote.lines.flatMap((line) => (line.id ? [line.id] : [])).join(',')
  return openSession(
    ready,
    input,
    order,
    kind,
    charge.lines,
    `${orderPath(service.slug)}${extras ? `?extras=${extras}` : ''}`,
  )
}

async function startBalance(deps: Deps, input: Extract<CheckoutInput, { kind: 'balance' }>) {
  const order = await deps.payload
    .findByID({ collection: 'orders', id: input.orderId, depth: 0, overrideAccess: true })
    .catch(() => null)
  const owner = order && (typeof order.customer === 'object' ? order.customer.id : order.customer)
  if (!order || owner !== input.customer.id) return { error: 'notFound' } as const
  if (order.paymentStatus !== 'deposit_paid' || !order.balanceRequested || !order.balanceDue)
    return { error: 'nothingDue' } as const

  const now = deps.now?.() ?? new Date()
  const open = order.payments?.find(
    (payment) =>
      payment.kind === 'balance' &&
      payment.status === 'open' &&
      payment.checkoutUrl &&
      payment.expiresAt &&
      new Date(payment.expiresAt) > now,
  )
  if (open?.checkoutUrl) return { url: open.checkoutUrl }

  if (!deps.stripe) return { error: 'unavailable' } as const
  const quote = quoteFromSnapshot(order)
  const charge = chargeFor(
    quote,
    'balance',
    {
      orderNumber: order.number ?? `#${order.id}`,
      serviceTitle: order.snapshot.serviceTitle ?? '',
      ...chargeLabels(input.locale, quote.vatRate),
    },
    order.balanceDue,
  )
  return openSession(
    deps as ReadyDeps,
    input,
    order,
    'balance',
    charge.lines,
    `/account/orders/${order.id}`,
  )
}

/**
 * Creates the order (for a new purchase) and a Stripe Checkout Session at the current published
 * prices. The browser only supplies the service, extra IDs, the terms checkbox or an order ID.
 */
export async function createCheckout(deps: Deps, input: CheckoutInput): Promise<CheckoutResult> {
  return input.kind === 'new' ? startNewOrder(deps, input) : startBalance(deps, input)
}
