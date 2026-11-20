import { getTranslations } from 'next-intl/server'

import { buttonClass } from '@/components/site/cms-link'
import { Link } from '@/i18n/navigation'
import { orderPath, type WebsiteLocale } from '@/lib/pages'
import { orderingConfig } from '@/lib/shop/config'
import { formatEuros } from '@/lib/shop/money'
import type { Service } from '@/payload-types'

/**
 * Every service with online ordering (when ordering is open) or a quote option, with its
 * "from" price and a teaser of the first extras. Prices come from the published services.
 */
export async function PricingGrid({
  services,
  settings,
  locale,
}: {
  services: Service[]
  settings: { orderingEnabled: boolean; priceNote: string }
  locale: WebsiteLocale
}) {
  const t = await getTranslations({ locale, namespace: 'Shop' })
  const offers = services
    .map((service) => ({ service, ordering: orderingConfig(service) }))
    .filter(
      ({ ordering }) =>
        ordering.mode === 'quote' || (ordering.mode === 'order' && settings.orderingEnabled),
    )
  if (!offers.length) return null

  return (
    <section aria-label={t('gridLabel')} className="pb-12">
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {offers.map(({ service, ordering }) => {
          const titleId = `price-${service.id}`
          const teaser = ordering.extras
            .filter((extra) => extra.active)
            .slice(0, 3)
            .map((extra) => extra.title)
          const orderable = ordering.mode === 'order'
          return (
            <article
              key={service.id}
              aria-labelledby={titleId}
              className={`flex flex-col rounded-3xl border bg-surface p-6 ${
                orderable ? 'border-border' : 'border-dashed border-border'
              }`}
            >
              <h2 id={titleId} className="text-xl font-semibold tracking-tight">
                {service.title}
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-muted">{service.summary}</p>
              <p className="mt-6 text-3xl font-semibold tracking-tight tabular-nums">
                {orderable ? (
                  <>
                    <span className="text-base font-medium text-muted">{t('from')}</span>{' '}
                    {formatEuros(ordering.basePrice, locale)}
                  </>
                ) : (
                  <span className="text-xl">{t('priceOnRequest')}</span>
                )}
              </p>
              {orderable && teaser.length > 0 && (
                <p className="mt-2 text-sm text-muted">
                  {t('extrasTeaser', { list: teaser.join(', ') })}
                </p>
              )}
              <div className="mt-auto pt-6">
                {orderable ? (
                  <Link href={orderPath(service.slug)} className={buttonClass('primary')}>
                    {t('configure')}
                  </Link>
                ) : (
                  <Link
                    href={{ pathname: '/contact', query: { service: service.slug } }}
                    className={buttonClass('secondary')}
                  >
                    {t('requestQuote')}
                  </Link>
                )}
              </div>
            </article>
          )
        })}
      </div>
      {settings.priceNote && <p className="mt-6 text-sm text-muted">{settings.priceNote}</p>}
    </section>
  )
}
