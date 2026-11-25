'use client'

import { useFormFields } from '@payloadcms/ui'

const PAYMENT_INTENT = /^payments\.\d+\.paymentIntentId$/

/** "Open in Stripe" links for an order's confirmed payments (Stripe test dashboard until launch). */
export default function StripeLink() {
  const intents = useFormFields(([fields]) =>
    Object.entries(fields)
      .filter(([path, field]) => PAYMENT_INTENT.test(path) && typeof field.value === 'string')
      .map(([, field]) => field.value as string),
  )
  if (!intents.length) return null
  return (
    <div className="field-type">
      <span className="field-label">Stripe</span>
      <ul style={{ margin: 0, paddingLeft: '1rem' }}>
        {intents.map((intent) => (
          <li key={intent}>
            <a
              href={`https://dashboard.stripe.com/test/payments/${encodeURIComponent(intent)}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              Open in Stripe
            </a>
          </li>
        ))}
      </ul>
    </div>
  )
}
