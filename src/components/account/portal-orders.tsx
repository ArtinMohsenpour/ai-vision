import { getFormatter, getTranslations } from 'next-intl/server'

import { buttonClass } from '@/components/site/cms-link'
import { Link } from '@/i18n/navigation'
import { formatEuros } from '@/lib/shop/money'
import type { Order } from '@/payload-types'
import { openCheckout } from '@/lib/shop/order-visibility'
import { PaymentBadge } from './order-status'
import styles from './portal.module.css'

export async function PortalOrders({ orders, locale }: { orders: Order[]; locale: 'de' | 'en' }) {
  const t = await getTranslations('CustomerPortal')
  const format = await getFormatter()
  return (
    <section className={styles.card} aria-labelledby="orders-heading">
      <div className={styles.cardHeading}>
        <h2 id="orders-heading">{t('ordersTitle')}</h2>
        <p>{t('ordersIntro')}</p>
      </div>
      {orders.length === 0 ? (
        <div className="mt-6 rounded-2xl border border-dashed border-border p-6">
          <p className="font-semibold">{t('emptyTitle')}</p>
          <p className="mt-1 text-sm text-muted">{t('emptyBody')}</p>
          <Link href="/pricing" className={`mt-4 ${buttonClass('primary')}`}>
            {t('browsePricing')}
          </Link>
        </div>
      ) : (
        <ul className="mt-6 divide-y divide-border rounded-2xl border border-border">
          {orders.map((order) => {
            const open = openCheckout(order)
            return (
              <li key={order.id} className="flex flex-wrap items-center gap-x-6 gap-y-3 p-4 sm:p-5">
                <div className="min-w-0 flex-1">
                  <p className="font-semibold">
                    {order.snapshot.serviceTitle}{' '}
                    <span className="font-normal text-muted">· {order.number}</span>
                  </p>
                  <p className="mt-0.5 text-sm text-muted">
                    {t('orderDate', {
                      date: format.dateTime(new Date(order.createdAt), { dateStyle: 'medium' }),
                    })}{' '}
                    · {t(`workStatus.${order.status}`)}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-semibold tabular-nums">
                    {formatEuros(order.snapshot.total, locale)}
                  </p>
                  <PaymentBadge status={order.paymentStatus} />
                </div>
                <div className="flex w-full gap-3 sm:w-auto">
                  {open?.checkoutUrl && (
                    <a href={open.checkoutUrl} className={buttonClass('primary', 'compact')}>
                      {t('continuePayment')}
                    </a>
                  )}
                  <Link
                    href={`/account/orders/${order.id}`}
                    aria-label={t('viewOrder', { number: order.number ?? String(order.id) })}
                    className={buttonClass('secondary', 'compact')}
                  >
                    {t('view')}
                  </Link>
                </div>
              </li>
            )
          })}
        </ul>
      )}
    </section>
  )
}
