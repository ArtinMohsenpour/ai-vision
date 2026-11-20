import type { PaymentEntry, PaymentStatus } from './types'

/**
 * The money state of an order, derived only from its Stripe payments and the owner's manual
 * payments (for example a bank transfer). Never edited by hand.
 */
export function paymentState(
  total: number,
  payments: readonly PaymentEntry[],
  manual: readonly { amount: number }[],
): {
  amountPaid: number
  amountRefunded: number
  balanceDue: number
  paymentStatus: PaymentStatus
} {
  const settled = payments.filter((payment) => payment.status === 'paid')
  const amountPaid =
    settled.reduce((sum, payment) => sum + payment.amount, 0) +
    manual.reduce((sum, payment) => sum + payment.amount, 0)
  const amountRefunded = settled.reduce((sum, payment) => sum + (payment.refunded ?? 0), 0)
  let paymentStatus: PaymentStatus = 'unpaid'
  if (amountRefunded > 0)
    paymentStatus = amountRefunded >= amountPaid ? 'refunded' : 'partially_refunded'
  else if (amountPaid >= total && amountPaid > 0) paymentStatus = 'paid'
  else if (amountPaid > 0) paymentStatus = 'deposit_paid'
  return { amountPaid, amountRefunded, balanceDue: Math.max(0, total - amountPaid), paymentStatus }
}
