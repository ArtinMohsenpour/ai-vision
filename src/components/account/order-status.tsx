import { getTranslations } from 'next-intl/server'

import type { Order } from '@/payload-types'

const tones = {
  good: 'bg-accent text-primary',
  wait: 'border border-border text-muted',
  bad: 'border border-border text-[var(--error-text)]',
} as const

/** Payment status as a small badge; colors use the site tokens in both themes. */
export async function PaymentBadge({ status }: { status: Order['paymentStatus'] }) {
  const t = await getTranslations('CustomerPortal')
  const value = status ?? 'unpaid'
  const tone =
    value === 'paid' || value === 'deposit_paid'
      ? tones.good
      : value === 'unpaid'
        ? tones.wait
        : tones.bad
  return (
    <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${tone}`}>
      {t(`paymentStatus.${value}`)}
    </span>
  )
}
