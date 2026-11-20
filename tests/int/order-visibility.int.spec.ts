import { describe, expect, it } from 'vitest'

import {
  awaitingStripe,
  balancePayable,
  isVisibleOrder,
  openCheckout,
} from '@/lib/shop/order-visibility'
import type { Order } from '@/payload-types'

const now = new Date('2026-11-20T12:00:00Z')
const later = '2026-11-20T13:00:00Z'
const earlier = '2026-11-20T11:00:00Z'

type Payment = NonNullable<Order['payments']>[number]
const payment = (kind: Payment['kind'], status: Payment['status'], expiresAt = later): Payment => ({
  kind,
  status,
  amount: 1000,
  refunded: 0,
  checkoutUrl: 'https://checkout.stripe.com/c/pay/cs_test',
  expiresAt,
})
const order = (data: Partial<Order>) =>
  ({ paymentStatus: 'unpaid', payments: [], ...data }) as Order

describe('order visibility in the customer account', () => {
  it('shows paid orders and unpaid orders with an open checkout, hides abandoned ones', () => {
    expect(isVisibleOrder(order({ paymentStatus: 'paid' }), now)).toBe(true)
    expect(isVisibleOrder(order({ payments: [payment('full', 'open')] }), now)).toBe(true)
    expect(isVisibleOrder(order({ payments: [payment('full', 'open', earlier)] }), now)).toBe(false)
    expect(isVisibleOrder(order({ payments: [payment('full', 'expired')] }), now)).toBe(false)
  })

  it('keeps an order with a bank payment still processing visible', () => {
    expect(isVisibleOrder(order({ payments: [payment('full', 'pending')] }), now)).toBe(true)
  })

  it('finds only a still-open checkout to continue', () => {
    expect(openCheckout(order({ payments: [payment('full', 'open')] }), now)?.status).toBe('open')
    expect(
      openCheckout(order({ payments: [payment('full', 'open', earlier)] }), now),
    ).toBeUndefined()
  })

  it('waits for Stripe while the latest payment is open or processing, even after a deposit', () => {
    const deposit = payment('deposit', 'paid')
    expect(awaitingStripe(order({ paymentStatus: 'deposit_paid', payments: [deposit] }))).toBe(
      false,
    )
    expect(
      awaitingStripe(
        order({ paymentStatus: 'deposit_paid', payments: [deposit, payment('balance', 'open')] }),
      ),
    ).toBe(true)
    expect(
      awaitingStripe(
        order({
          paymentStatus: 'deposit_paid',
          payments: [deposit, payment('balance', 'pending')],
        }),
      ),
    ).toBe(true)
    expect(
      awaitingStripe(
        order({ paymentStatus: 'paid', payments: [deposit, payment('balance', 'paid')] }),
      ),
    ).toBe(false)
  })

  it('offers the balance only when requested, due and not already processing', () => {
    const base = {
      paymentStatus: 'deposit_paid' as const,
      balanceRequested: true,
      balanceDue: 500,
      payments: [payment('deposit', 'paid')],
    }
    expect(balancePayable(order(base))).toBe(true)
    expect(balancePayable(order({ ...base, balanceRequested: false }))).toBe(false)
    expect(balancePayable(order({ ...base, balanceDue: 0 }))).toBe(false)
    expect(
      balancePayable(
        order({ ...base, payments: [...base.payments, payment('balance', 'pending')] }),
      ),
    ).toBe(false)
    expect(
      balancePayable(order({ ...base, payments: [...base.payments, payment('balance', 'open')] })),
    ).toBe(true)
  })
})
