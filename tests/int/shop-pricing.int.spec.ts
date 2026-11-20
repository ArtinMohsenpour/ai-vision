import { describe, expect, it } from 'vitest'

import { formatEuros, parseEuros } from '@/lib/shop/money'
import { paymentState } from '@/lib/shop/payment-state'
import { chargeFor, parseExtraIds, quoteOrder, vatFor } from '@/lib/shop/pricing'
import { OfferChangedError, type OrderingConfig, type PaymentEntry } from '@/lib/shop/types'

const names = {
  orderNumber: 'R-2026-0001',
  serviceTitle: 'Website',
  vatLabel: 'VAT 19%',
  depositLabel: 'Deposit',
  balanceLabel: 'Remaining balance',
}

const config: OrderingConfig = {
  mode: 'order',
  baseName: 'Simple website',
  basePrice: 20000,
  baseDays: 7,
  depositPercent: null,
  extras: [
    { id: 'cms', title: 'CMS', price: 35000, days: 5, active: true },
    { id: 'chat', title: 'AI chatbot', price: 45050, days: 4, active: true },
    { id: 'old', title: 'Old', price: 100, days: 1, active: false },
  ],
}

describe('shop pricing', () => {
  it('quotes base plus extras in config order with summed days', () => {
    const quote = quoteOrder(config, ['chat', 'cms'], 0)
    expect(quote.lines.map((line) => line.id)).toEqual([null, 'cms', 'chat'])
    expect([quote.subtotal, quote.vat, quote.total, quote.deliveryDays]).toEqual([
      100050, 0, 100050, 16,
    ])
  })

  it('rounds VAT per line half up', () => {
    // 450.50 € × 19 % = 85.595 € → 85.60 €
    expect(quoteOrder(config, ['chat'], 19).vat).toBe(3800 + 8560)
  })

  it('charges every line plus one VAT line when paying in full', () => {
    const charge = chargeFor(quoteOrder(config, ['cms'], 19), 'full', names)
    expect(charge.lines).toEqual([
      { name: 'Simple website', amount: 20000 },
      { name: 'CMS', amount: 35000 },
      { name: 'VAT 19%', amount: 10450 },
    ])
    expect(charge.total).toBe(65450)
    expect(chargeFor(quoteOrder(config, ['cms'], 0), 'full', names).lines).toHaveLength(2)
  })

  it('splits a deposit and its VAT', () => {
    const quote = quoteOrder({ ...config, depositPercent: 30 }, ['cms'], 19)
    expect(quote.depositNet).toBe(16500)
    expect(quote.vat).toBe(vatFor(16500, 19) + vatFor(38500, 19))
    expect(quote.total).toBe(55000 + quote.vat)
    const charge = chargeFor(quote, 'deposit', names)
    expect(charge.lines).toEqual([
      { name: 'Deposit 30% · R-2026-0001 · Website', amount: 16500 },
      { name: 'VAT 19%', amount: 3135 },
    ])
    expect(charge.total).toBe(16500 + 3135)
  })

  it('treats 0, 100 and no deposit as paying in full', () => {
    for (const depositPercent of [0, 100, null])
      expect(quoteOrder({ ...config, depositPercent }, [], 19).depositPercent).toBe(0)
  })

  it('charges the remaining gross amount as one balance line', () => {
    const quote = quoteOrder({ ...config, depositPercent: 30 }, ['cms'], 19)
    expect(chargeFor(quote, 'balance', names, 45815)).toEqual({
      label: 'balance',
      lines: [{ name: 'Remaining balance · R-2026-0001', amount: 45815 }],
      total: 45815,
    })
  })

  it('refuses unknown, inactive extras and closed services', () => {
    expect(() => quoteOrder(config, ['old'], 0)).toThrow(OfferChangedError)
    expect(() => quoteOrder(config, ['nope'], 0)).toThrow(OfferChangedError)
    expect(() => quoteOrder({ ...config, mode: 'quote' }, [], 0)).toThrow(OfferChangedError)
    expect(() => quoteOrder({ ...config, mode: 'off' }, [], 0)).toThrow(OfferChangedError)
  })

  it('parses extra IDs defensively', () => {
    expect(parseExtraIds('cms,cms, chat,<x>')).toEqual(['cms', 'chat'])
    expect(parseExtraIds(Array.from({ length: 500 }, (_, i) => `e${i}`).join(','))).toHaveLength(30)
    expect(parseExtraIds(undefined)).toEqual([])
    expect(parseExtraIds('x'.repeat(5000))).toEqual([])
  })
})

describe('shop money', () => {
  it('parses euro input the German way', () => {
    expect(
      ['350', '350,5', '350,50', '350.50', '1.200,50', '1.200', '€ 99'].map(parseEuros),
    ).toEqual([35000, 35050, 35050, 35050, 120050, 120000, 9900])
  })

  it('rejects input it cannot read safely', () => {
    expect(['', '0', '-5', '3,505', 'abc', '1.20.3', '100001'].map(parseEuros)).toEqual([
      null,
      null,
      null,
      null,
      null,
      null,
      null,
    ])
  })

  it('formats euros without needless decimals', () => {
    expect(formatEuros(20000, 'en')).toBe('€200')
    expect(formatEuros(100000, 'en')).toBe('€1,000')
    expect(formatEuros(35050, 'en')).toBe('€350.50')
    // German formatting keeps the amount and the sign together with a non-breaking space.
    expect(formatEuros(120050, 'de')).toBe('1.200,50 €')
  })
})

describe('shop payment state', () => {
  const paid = (amount: number, refunded = 0): PaymentEntry => ({
    kind: 'deposit',
    status: 'paid',
    amount,
    refunded,
  })

  it('derives payment status from payments, manual payments and refunds', () => {
    expect(paymentState(1000, [], []).paymentStatus).toBe('unpaid')
    expect(paymentState(1000, [paid(300)], []).paymentStatus).toBe('deposit_paid')
    expect(paymentState(1000, [paid(300)], [{ amount: 700 }])).toMatchObject({
      paymentStatus: 'paid',
      balanceDue: 0,
      amountPaid: 1000,
    })
    expect(paymentState(1000, [paid(1000, 200)], []).paymentStatus).toBe('partially_refunded')
    expect(paymentState(1000, [paid(1000, 1000)], []).paymentStatus).toBe('refunded')
  })

  it('ignores payments that are not paid', () => {
    const open: PaymentEntry = { kind: 'full', status: 'open', amount: 1000, refunded: 0 }
    expect(paymentState(1000, [open], [])).toMatchObject({
      paymentStatus: 'unpaid',
      balanceDue: 1000,
    })
  })
})
