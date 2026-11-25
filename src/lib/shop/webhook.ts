import { NotFound, type Payload, type PayloadRequest } from 'payload'
import type Stripe from 'stripe'

import { authTransaction } from '@/lib/customer-auth/transaction'
import type { Order } from '@/payload-types'
import { deferAfterCommit } from './defer'
import { sendPaymentEmails } from './email'

type Payment = NonNullable<Order['payments']>[number]
type Outcome = 'processed' | 'duplicate' | 'ignored'

const system = { overrideAccess: true, context: { shopSystem: true } } as const

function billingFrom(session: Stripe.Checkout.Session): Order['billing'] {
  const details = session.customer_details
  if (!details) return undefined
  return {
    name: details.name ?? null,
    company: details.business_name ?? null,
    line1: details.address?.line1 ?? null,
    line2: details.address?.line2 ?? null,
    postalCode: details.address?.postal_code ?? null,
    city: details.address?.city ?? null,
    country: details.address?.country ?? null,
    vatId: details.tax_ids?.[0]?.value ?? null,
  }
}

async function orderForSession(req: PayloadRequest, session: Stripe.Checkout.Session) {
  const id = Number(session.metadata?.orderId)
  if (!Number.isSafeInteger(id) || id < 1) return null
  // Only a missing order counts as "unknown"; database errors must reach the route's 500.
  const order = await req.payload
    .findByID({ collection: 'orders', id, depth: 0, req, overrideAccess: true })
    .catch((error: unknown) => {
      if (error instanceof NotFound) return null
      throw error
    })
  // The session must be one this order opened; metadata alone never selects an order.
  return order?.payments?.some((payment) => payment.checkoutSessionId === session.id) ? order : null
}

async function applySessionEvent(req: PayloadRequest, event: Stripe.Event) {
  const session = event.data.object as Stripe.Checkout.Session
  const order = await orderForSession(req, session)
  if (!order) return { outcome: 'ignored' as const, confirmed: null }

  const now = new Date().toISOString()
  let confirmed = false
  const settle = (payment: Payment): Payment => {
    if (payment.checkoutSessionId !== session.id || payment.status === 'paid') return payment
    switch (event.type) {
      case 'checkout.session.completed':
      case 'checkout.session.async_payment_succeeded':
        if (event.type === 'checkout.session.completed' && session.payment_status !== 'paid')
          return { ...payment, status: 'pending' }
        if (typeof session.amount_total === 'number' && session.amount_total !== payment.amount)
          req.payload.logger.warn(`Stripe charged a different amount for order ${order.id}`)
        confirmed = true
        return {
          ...payment,
          status: 'paid',
          amount: session.amount_total ?? payment.amount,
          paymentIntentId:
            typeof session.payment_intent === 'string'
              ? session.payment_intent
              : (session.payment_intent?.id ?? null),
          paidAt: now,
        }
      case 'checkout.session.async_payment_failed':
        return { ...payment, status: 'failed' }
      case 'checkout.session.expired':
        return payment.status === 'pending' ? payment : { ...payment, status: 'expired' }
      default:
        return payment
    }
  }
  const payments = (order.payments ?? []).map(settle)
  const stillLive = payments.some((payment) => ['paid', 'pending', 'open'].includes(payment.status))
  const manual = (order.manualPayments ?? []).reduce((sum, entry) => sum + (entry.amount ?? 0), 0)
  const data: Partial<Order> = { payments }
  if (confirmed) data.billing = billingFrom(session)
  if (!stillLive && manual === 0 && order.status === 'awaiting_payment') data.status = 'cancelled'

  await req.payload.update({ collection: 'orders', id: order.id, data, req, ...system })
  return { outcome: 'processed' as const, confirmed: confirmed ? order.id : null }
}

async function applyRefund(req: PayloadRequest, event: Stripe.Event) {
  const charge = event.data.object as Stripe.Charge
  const intent =
    typeof charge.payment_intent === 'string' ? charge.payment_intent : charge.payment_intent?.id
  if (!intent) return { outcome: 'ignored' as const, confirmed: null }
  const { docs } = await req.payload.find({
    collection: 'orders',
    where: { 'payments.paymentIntentId': { equals: intent } },
    depth: 0,
    limit: 1,
    req,
    overrideAccess: true,
  })
  const order = docs[0]
  if (!order) return { outcome: 'ignored' as const, confirmed: null }
  const payments = (order.payments ?? []).map((payment) =>
    payment.paymentIntentId === intent ? { ...payment, refunded: charge.amount_refunded } : payment,
  )
  await req.payload.update({
    collection: 'orders',
    id: order.id,
    data: { payments },
    req,
    ...system,
  })
  return { outcome: 'processed' as const, confirmed: null }
}

/**
 * Applies one verified Stripe event exactly once: the event row and the order change commit
 * together, and a repeated event ID is reported as a duplicate. Emails go out after the commit.
 */
export async function handleStripeEvent(payload: Payload, event: Stripe.Event): Promise<Outcome> {
  let result: { outcome: Outcome; confirmed: number | null }
  try {
    result = await authTransaction(payload, async (req) => {
      await payload.create({
        collection: 'stripe-events',
        data: { eventId: event.id, type: event.type, processedAt: new Date().toISOString() },
        req,
        overrideAccess: true,
      })
      if (event.type.startsWith('checkout.session.')) return applySessionEvent(req, event)
      if (event.type === 'charge.refunded') return applyRefund(req, event)
      return { outcome: 'ignored' as const, confirmed: null }
    })
  } catch (error) {
    // A concurrent delivery of the same event commits first; this one then finds its row.
    const { totalDocs } = await payload.count({
      collection: 'stripe-events',
      where: { eventId: { equals: event.id } },
      overrideAccess: true,
    })
    if (totalDocs > 0) return 'duplicate'
    throw error
  }

  if (result.outcome === 'ignored')
    payload.logger.warn(
      { eventId: event.id, type: event.type },
      'Stripe event did not match an order',
    )
  if (result.confirmed) {
    const order = await payload.findByID({
      collection: 'orders',
      id: result.confirmed,
      depth: 1,
      overrideAccess: true,
    })
    await deferAfterCommit(() => sendPaymentEmails(payload, order), payload.logger)
  }
  return result.outcome
}
