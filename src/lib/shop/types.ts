/** Shop types. All amounts are integer cents (EUR). */

export type VatRate = 0 | 19
export type OrderingMode = 'off' | 'order' | 'quote'

export type ExtraConfig = {
  id: string
  title: string
  price: number
  days: number
  active: boolean
}

/** The ordering settings of one published service, as the price calculation needs them. */
export type OrderingConfig = {
  mode: OrderingMode
  baseName: string
  basePrice: number
  baseDays: number
  depositPercent: number | null
  extras: ExtraConfig[]
}

export type QuoteLine = {
  kind: 'base' | 'extra'
  id: string | null
  title: string
  net: number
  days: number
}

export type OrderQuote = {
  lines: QuoteLine[]
  vatRate: VatRate
  /** Sum of all net line amounts. */
  subtotal: number
  /** 0 means the order is paid in full at checkout. */
  depositPercent: number
  depositNet: number
  vat: number
  /** What the customer pays in total: subtotal + vat. */
  total: number
  deliveryDays: number
}

export type PaymentKind = 'full' | 'deposit' | 'balance'

/** One Stripe payment: the line items sent to Checkout and their sum. */
export type Charge = {
  label: PaymentKind
  lines: { name: string; amount: number }[]
  total: number
}

export type PaymentEntry = {
  kind: PaymentKind
  status: 'open' | 'pending' | 'paid' | 'failed' | 'expired'
  amount: number
  refunded: number
}

export type PaymentStatus = 'unpaid' | 'deposit_paid' | 'paid' | 'refunded' | 'partially_refunded'

/** The service, an extra or ordering itself changed since the customer loaded the page. */
export class OfferChangedError extends Error {
  constructor(message = 'The offer changed') {
    super(message)
    this.name = 'OfferChangedError'
  }
}
