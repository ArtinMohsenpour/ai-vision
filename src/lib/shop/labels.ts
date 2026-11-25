import type { ChargeNames } from './pricing'
import type { VatRate } from './types'

/** Line item names on the Stripe payment page and receipt, in the customer's language. */
export function chargeLabels(
  locale: 'de' | 'en',
  vatRate: VatRate,
): Omit<ChargeNames, 'orderNumber' | 'serviceTitle'> {
  return locale === 'de'
    ? { vatLabel: `USt. ${vatRate} %`, depositLabel: 'Anzahlung', balanceLabel: 'Restbetrag' }
    : { vatLabel: `VAT ${vatRate}%`, depositLabel: 'Deposit', balanceLabel: 'Remaining balance' }
}
