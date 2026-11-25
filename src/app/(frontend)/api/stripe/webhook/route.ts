import { getPayload } from 'payload'

import { handleStripeEvent } from '@/lib/shop/webhook'
import { verifyStripeEvent } from '@/lib/shop/stripe'
import config from '@/payload.config'

export const dynamic = 'force-dynamic'

const MAX_BODY = 1_000_000

/** Stripe → Rheino. Signature-checked on the raw body; each event is applied once. */
export async function POST(request: Request) {
  if (Number(request.headers.get('content-length') ?? 0) > MAX_BODY)
    return new Response('Payload too large', { status: 413 })
  const body = await request.text()
  if (body.length > MAX_BODY) return new Response('Payload too large', { status: 413 })

  let event
  try {
    event = verifyStripeEvent(body, request.headers.get('stripe-signature'))
  } catch {
    return new Response('Invalid signature', { status: 400 })
  }

  const payload = await getPayload({ config })
  try {
    await handleStripeEvent(payload, event)
  } catch (error) {
    payload.logger.error(
      { err: error, eventId: event.id, type: event.type },
      'Stripe webhook could not be processed',
    )
    // Stripe retries on 5xx.
    return new Response('Processing failed', { status: 500 })
  }
  return Response.json({ received: true })
}
