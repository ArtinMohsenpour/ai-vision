'use server'

import { getPayload } from 'payload'
import { redirect } from 'next/navigation'

import { isSlug } from '@/fields/slug'
import { localizedPath, type Locale } from '@/i18n/routing'
import { allowAuthRequest } from '@/lib/customer-auth/rate-limit'
import { customerRequest } from '@/lib/customer-auth/request'
import { getCustomerSession } from '@/lib/customer-auth/session'
import { orderPath } from '@/lib/pages'
import config from '@/payload.config'
import { createCheckout, type CheckoutInput } from './checkout'
import type { CheckoutState } from './checkout-state'
import { parseExtraIds } from './pricing'
import { stripeGateway } from './stripe'

type Request =
  | { kind: 'new'; slug: string; extraIds: string[]; termsAccepted: boolean }
  | { kind: 'balance'; orderId: number }

async function checkout(
  locale: Locale,
  request: Request,
  loginPath: string,
): Promise<CheckoutState> {
  if (locale !== 'de' && locale !== 'en') return { error: 'unavailable' }
  const origin = await customerRequest()
  if (!origin) return { error: 'unavailable' }
  const session = await getCustomerSession()
  if (!session) redirect(localizedPath(locale, `/login?next=${encodeURIComponent(loginPath)}`))
  const payload = await getPayload({ config })
  if (!(await allowAuthRequest(payload, 'checkout', origin.requestHeaders, session.user.email)))
    return { error: 'rateLimited' }
  // Without Stripe, checkout still reports a changed offer before saying payment is unavailable.
  const stripe = stripeGateway()

  let url: string
  try {
    const result = await createCheckout({ payload, stripe }, {
      ...request,
      customer: session.user,
      locale,
      origin: origin.canonical,
    } as CheckoutInput)
    if ('error' in result) return { error: result.error }
    url = result.url
  } catch (error) {
    payload.logger.error({ err: error, kind: request.kind }, 'Checkout could not be started')
    return { error: 'unavailable' }
  }
  redirect(url)
}

/** "Continue to payment" on the order page. Prices are read on the server only. */
export async function startCheckout(
  locale: Locale,
  slug: string,
  _state: CheckoutState,
  form: FormData,
): Promise<CheckoutState> {
  if (!isSlug(slug)) return { error: 'offerChanged' }
  const extraIds = parseExtraIds(form.get('extras'))
  const back = `${orderPath(slug)}${extraIds.length ? `?extras=${extraIds.join(',')}` : ''}`
  return checkout(
    locale,
    { kind: 'new', slug, extraIds, termsAccepted: form.get('terms') === 'accepted' },
    back,
  )
}

/** "Pay remaining balance" on an order in the customer account. */
export async function payBalance(
  locale: Locale,
  orderId: number,
  _state: CheckoutState,
  _form: FormData,
): Promise<CheckoutState> {
  if (!Number.isSafeInteger(orderId) || orderId < 1) return { error: 'notFound' }
  return checkout(locale, { kind: 'balance', orderId }, `/account/orders/${orderId}`)
}
