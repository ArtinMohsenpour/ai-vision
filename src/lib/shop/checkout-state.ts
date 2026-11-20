/** What the checkout and balance forms show after a failed attempt. Success redirects to Stripe. */
export type CheckoutError =
  | 'offerChanged'
  | 'orderingClosed'
  | 'termsRequired'
  | 'rateLimited'
  | 'unavailable'
  | 'notFound'
  | 'nothingDue'

export type CheckoutState = { error?: CheckoutError }
