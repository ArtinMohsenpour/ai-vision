import { getFormatter, getTranslations } from 'next-intl/server'

import { Link } from '@/i18n/navigation'
import { payBalance } from '@/lib/shop/actions'
import { formatEuros } from '@/lib/shop/money'
import { awaitingStripe, balancePayable } from '@/lib/shop/order-visibility'
import type { Order } from '@/payload-types'
import { CheckoutReturn } from './checkout-return'
import { PaymentBadge } from './order-status'
import { PayBalance } from './pay-balance'
import styles from './portal.module.css'

export async function PortalOrder({
  order,
  locale,
  returning,
}: {
  order: Order
  locale: 'de' | 'en'
  returning: boolean
}) {
  const t = await getTranslations('CustomerPortal')
  const format = await getFormatter()
  const euros = (cents: number | null | undefined) => formatEuros(cents ?? 0, locale)
  const date = (value: string | null | undefined) =>
    value ? format.dateTime(new Date(value), { dateStyle: 'medium' }) : ''
  const { snapshot } = order
  const number = order.number ?? String(order.id)
  const balanceDue = balancePayable(order)
  const payments = [
    ...(order.payments ?? [])
      // Abandoned or expired Stripe sessions are not payments.
      .filter((payment) => ['paid', 'pending', 'failed'].includes(payment.status))
      .map((payment) => ({
        key: payment.id ?? payment.checkoutSessionId ?? '',
        label: t(`paymentKind.${payment.kind}`),
        status: t(`entryStatus.${payment.status}`),
        amount: payment.amount,
        date: date(payment.paidAt),
      })),
    ...(order.manualPayments ?? []).map((payment) => ({
      key: payment.id ?? payment.date,
      label: t(`paymentKind.${payment.method ?? 'other'}`),
      status: t('entryStatus.paid'),
      amount: payment.amount,
      date: date(payment.date),
    })),
  ]
  const billing = order.billing
  const address = [
    billing?.name,
    billing?.company,
    billing?.line1,
    billing?.line2,
    [billing?.postalCode, billing?.city].filter(Boolean).join(' '),
    billing?.country,
    billing?.vatId,
  ].filter(Boolean)

  return (
    <section className={styles.card} aria-labelledby="order-heading">
      {returning && (
        <CheckoutReturn paid={order.paymentStatus !== 'unpaid' && !awaitingStripe(order)} />
      )}
      <Link href="/account/orders" className="text-sm text-muted hover:text-foreground">
        ← {t('backToOrders')}
      </Link>
      <div className={`${styles.cardHeading} mt-3`}>
        <h2 id="order-heading">{t('orderHeading', { number })}</h2>
        <p>
          {snapshot.serviceTitle} · {t('orderDate', { date: date(order.createdAt) })}
        </p>
      </div>
      <div className="mt-4 flex flex-wrap items-center gap-3">
        <PaymentBadge status={order.paymentStatus} />
        <span className="text-sm text-muted">{t(`workStatus.${order.status}`)}</span>
      </div>

      {balanceDue && !(returning && awaitingStripe(order)) && (
        <PayBalance
          amount={euros(order.balanceDue)}
          action={payBalance.bind(null, locale, order.id)}
        />
      )}

      <h3 className="mt-8 text-sm font-semibold tracking-wide text-muted uppercase">
        {t('items')}
      </h3>
      <dl className="mt-3 space-y-1.5 text-sm">
        <div className="flex justify-between gap-4">
          <dt>{snapshot.baseName}</dt>
          <dd className="tabular-nums">{euros(snapshot.basePrice)}</dd>
        </div>
        {(snapshot.extras ?? []).map((extra) => (
          <div key={extra.id ?? extra.extraId} className="flex justify-between gap-4 text-muted">
            <dt>+ {extra.title}</dt>
            <dd className="tabular-nums">{euros(extra.price)}</dd>
          </div>
        ))}
        {(snapshot.vat ?? 0) > 0 && (
          <div className="flex justify-between gap-4 text-muted">
            <dt>{t('vat', { rate: snapshot.vatRate ?? 0 })}</dt>
            <dd className="tabular-nums">{euros(snapshot.vat)}</dd>
          </div>
        )}
      </dl>
      <dl className="mt-3 space-y-1.5 border-t border-border pt-3 text-sm">
        <div className="flex justify-between gap-4 text-base font-semibold">
          <dt>{t('total')}</dt>
          <dd className="tabular-nums">{euros(snapshot.total)}</dd>
        </div>
        <div className="flex justify-between gap-4">
          <dt>{t('paid')}</dt>
          <dd className="tabular-nums">{euros(order.amountPaid)}</dd>
        </div>
        {(order.amountRefunded ?? 0) > 0 && (
          <div className="flex justify-between gap-4">
            <dt>{t('refunded')}</dt>
            <dd className="tabular-nums">{euros(order.amountRefunded)}</dd>
          </div>
        )}
        {(order.balanceDue ?? 0) > 0 && order.paymentStatus !== 'unpaid' && (
          <div className="flex justify-between gap-4">
            <dt>{t('balanceDue')}</dt>
            <dd className="tabular-nums">{euros(order.balanceDue)}</dd>
          </div>
        )}
        <div className="flex justify-between gap-4 text-muted">
          <dt>{t('delivery')}</dt>
          <dd>{t('deliveryDays', { days: snapshot.deliveryDays ?? 0 })}</dd>
        </div>
      </dl>

      {payments.length > 0 && (
        <>
          <h3 className="mt-8 text-sm font-semibold tracking-wide text-muted uppercase">
            {t('paymentsTitle')}
          </h3>
          <ul className="mt-3 divide-y divide-border rounded-2xl border border-border text-sm">
            {payments.map((payment) => (
              <li key={payment.key} className="flex flex-wrap justify-between gap-2 p-3">
                <span>
                  {payment.label} <span className="text-muted">· {payment.status}</span>
                  {payment.date && <span className="text-muted"> · {payment.date}</span>}
                </span>
                <span className="tabular-nums">{euros(payment.amount)}</span>
              </li>
            ))}
          </ul>
        </>
      )}

      {address.length > 0 && (
        <>
          <h3 className="mt-8 text-sm font-semibold tracking-wide text-muted uppercase">
            {t('billingTitle')}
          </h3>
          <address className="mt-3 text-sm leading-relaxed not-italic">
            {address.map((line) => (
              <span key={line} className="block">
                {line}
              </span>
            ))}
          </address>
        </>
      )}
    </section>
  )
}
