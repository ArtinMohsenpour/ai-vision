import type { Order } from '@/payload-types'

type Payment = NonNullable<Order['payments']>[number]

/** A Stripe checkout the customer can still continue. */
export function openCheckout(order: Order, now = new Date()): Payment | undefined {
  return order.payments?.find(
    (payment) =>
      payment.status === 'open' &&
      payment.checkoutUrl &&
      payment.expiresAt &&
      new Date(payment.expiresAt) > now,
  )
}

/** Orders with money attached, a bank payment in progress, or a checkout that is still open. */
export function isVisibleOrder(order: Order, now = new Date()) {
  if (order.paymentStatus && order.paymentStatus !== 'unpaid') return true
  if (order.payments?.some((payment) => payment.status === 'pending')) return true
  return Boolean(openCheckout(order, now))
}

/**
 * After the redirect back from Stripe: true while the newest Stripe payment is still open or
 * processing, so the page keeps waiting for the webhook (also for a balance after a deposit).
 */
export function awaitingStripe(order: Order) {
  const latest = order.payments?.at(-1)
  return latest?.status === 'open' || latest?.status === 'pending'
}

/** The owner requested the balance, something is due, and no balance payment is processing. */
export function balancePayable(order: Order) {
  return (
    order.paymentStatus === 'deposit_paid' &&
    order.balanceRequested === true &&
    (order.balanceDue ?? 0) > 0 &&
    !order.payments?.some((payment) => payment.kind === 'balance' && payment.status === 'pending')
  )
}
