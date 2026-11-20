import {
  OfferChangedError,
  type Charge,
  type OrderQuote,
  type OrderingConfig,
  type PaymentKind,
  type QuoteLine,
  type VatRate,
} from './types'

export const MAX_EXTRAS = 30

const EXTRA_ID = /^[A-Za-z0-9_-]{1,40}$/

/** Extra IDs from a URL or form value: trimmed, valid, unique, at most MAX_EXTRAS. */
export function parseExtraIds(value: unknown): string[] {
  if (typeof value !== 'string') return []
  const ids: string[] = []
  for (const part of value.split(',')) {
    const id = part.trim()
    if (EXTRA_ID.test(id) && !ids.includes(id)) ids.push(id)
    if (ids.length === MAX_EXTRAS) break
  }
  return ids
}

/** VAT on one net amount, rounded half up to whole cents. */
export function vatFor(net: number, rate: VatRate): number {
  return Math.round((net * rate) / 100)
}

/** Prices an order from the published configuration. Never trusts amounts from the browser. */
export function quoteOrder(
  config: OrderingConfig,
  extraIds: readonly string[],
  vatRate: VatRate,
): OrderQuote {
  if (config.mode !== 'order') throw new OfferChangedError('The service cannot be ordered online')
  const selected = new Set(extraIds)
  for (const id of selected) {
    if (!config.extras.some((extra) => extra.id === id && extra.active))
      throw new OfferChangedError(`Extra ${id} is not available`)
  }
  const lines: QuoteLine[] = [
    {
      kind: 'base',
      id: null,
      title: config.baseName,
      net: config.basePrice,
      days: config.baseDays,
    },
    ...config.extras
      .filter((extra) => selected.has(extra.id))
      .map((extra) => ({
        kind: 'extra' as const,
        id: extra.id,
        title: extra.title,
        net: extra.price,
        days: extra.days,
      })),
  ]
  const subtotal = lines.reduce((sum, line) => sum + line.net, 0)
  const percent = config.depositPercent ?? 0
  const depositPercent = percent > 0 && percent < 100 ? percent : 0
  const depositNet = depositPercent ? Math.round((subtotal * depositPercent) / 100) : 0
  const vat = depositPercent
    ? vatFor(depositNet, vatRate) + vatFor(subtotal - depositNet, vatRate)
    : lines.reduce((sum, line) => sum + vatFor(line.net, vatRate), 0)
  return {
    lines,
    vatRate,
    subtotal,
    depositPercent,
    depositNet,
    vat,
    total: subtotal + vat,
    deliveryDays: lines.reduce((sum, line) => sum + line.days, 0),
  }
}

export type ChargeNames = {
  orderNumber: string
  serviceTitle: string
  vatLabel: string
  depositLabel: string
  balanceLabel: string
}

/** The line items Stripe Checkout receives for one payment of an order. */
export function chargeFor(
  quote: OrderQuote,
  kind: PaymentKind,
  names: ChargeNames,
  balanceGross = 0,
): Charge {
  let lines: Charge['lines']
  if (kind === 'balance') {
    lines = [{ name: `${names.balanceLabel} · ${names.orderNumber}`, amount: balanceGross }]
  } else if (kind === 'deposit') {
    lines = [
      {
        name: `${names.depositLabel} ${quote.depositPercent}% · ${names.orderNumber} · ${names.serviceTitle}`,
        amount: quote.depositNet,
      },
    ]
    const vat = vatFor(quote.depositNet, quote.vatRate)
    if (vat > 0) lines.push({ name: names.vatLabel, amount: vat })
  } else {
    lines = quote.lines.map((line) => ({ name: line.title, amount: line.net }))
    if (quote.vat > 0) lines.push({ name: names.vatLabel, amount: quote.vat })
  }
  return { label: kind, lines, total: lines.reduce((sum, line) => sum + line.amount, 0) }
}
