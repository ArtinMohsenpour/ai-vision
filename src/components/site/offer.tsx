import { getTranslations } from 'next-intl/server'

import { Link } from '@/i18n/navigation'
import { orderPath, type WebsiteLocale } from '@/lib/pages'
import { formatEuros } from '@/lib/shop/money'
import { offerView, type OfferView } from '@/lib/shop/offer'
import { loadServices, loadShopSettings } from '@/lib/website/load'
import type { Service } from '@/payload-types'
import { buttonClass } from './cms-link'

export type OfferLayout = 'extras' | 'package' | 'compact'

function Check() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      width="16"
      height="16"
      className="mt-1 shrink-0 text-primary"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m5 12 4 4 10-10" />
    </svg>
  )
}

const contactHref = (slug: string) => ({ pathname: '/contact', query: { service: slug } })

/**
 * "Package and price" content item: the live base price, included points, delivery time and
 * extras of one service, read from its published Ordering tab (never typed into the page), with
 * the same order button logic as the service page heading.
 */
export async function Offer({
  service: selected,
  layout,
  locale,
  wide,
}: {
  service: number | Service | null | undefined
  layout: OfferLayout
  locale: WebsiteLocale
  /** True in a full-width section: the extras sit beside the package on large screens. */
  wide: boolean
}) {
  const id = typeof selected === 'object' ? selected?.id : selected
  if (!id) return null
  const [services, settings] = await Promise.all([loadServices(locale), loadShopSettings(locale)])
  const service = services.find((entry) => entry.id === id)
  const view = service ? offerView(service, settings) : null
  if (!view) return null
  const [t, shop] = await Promise.all([
    getTranslations({ locale, namespace: 'Services' }),
    getTranslations({ locale, namespace: 'Shop' }),
  ])

  const actions = (
    <div className="flex flex-wrap items-center gap-x-5 gap-y-3">
      {view.kind === 'order' ? (
        <>
          <Link href={orderPath(view.slug)} className={buttonClass('primary')}>
            {shop('configureAndOrder')}
          </Link>
          <Link
            href={contactHref(view.slug)}
            className="text-sm font-semibold text-primary underline-offset-4 hover:underline"
          >
            {t('offerCustom')}
          </Link>
        </>
      ) : (
        <Link href={contactHref(view.slug)} className={buttonClass('primary')}>
          {view.kind === 'quote' ? shop('requestQuote') : t('cta')}
        </Link>
      )}
    </div>
  )
  const notes = <OfferNotes view={view} closedNote={t('offerClosed')} />

  if (view.kind === 'quote') {
    return (
      <div
        data-offer="quote"
        className="rounded-3xl border border-dashed border-border bg-surface p-6 sm:p-8"
      >
        <p className="font-semibold tracking-tight">{view.title}</p>
        <p className="mt-2 text-2xl font-semibold tracking-tight">{shop('priceOnRequest')}</p>
        <div className="mt-6">{actions}</div>
      </div>
    )
  }

  const price = (
    <>
      <span className="text-base font-medium text-muted">{shop('from')}</span>{' '}
      {formatEuros(view.base.price, locale)}
    </>
  )

  if (layout === 'compact') {
    return (
      <div data-offer="compact" className="rounded-3xl border border-border bg-surface p-5 sm:p-6">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="font-semibold tracking-tight">{view.base.name}</p>
            <p className="mt-1 text-2xl font-semibold tracking-tight tabular-nums">{price}</p>
            <p className="mt-1 text-sm text-muted">{shop('baseDays', { days: view.base.days })}</p>
          </div>
          {actions}
        </div>
        {notes}
      </div>
    )
  }

  const extras = layout === 'extras' ? view.extras : []
  return (
    <div
      data-offer={layout}
      className="relative overflow-hidden rounded-[2rem] border border-border bg-surface"
    >
      {/* A thin light line along the top edge, in the brand color. */}
      <span
        aria-hidden="true"
        className="absolute inset-x-8 top-0 h-px bg-linear-to-r from-transparent via-primary to-transparent"
      />
      <div className={`grid ${extras.length && wide ? 'lg:grid-cols-[1.1fr_1fr]' : ''}`}>
        <div className="p-6 sm:p-8">
          <p className="text-xs font-semibold tracking-[0.16em] text-primary uppercase">
            {shop('basePackage')}
          </p>
          <h3 className="mt-2 text-2xl font-semibold tracking-tight text-balance">
            {view.base.name}
          </h3>
          {view.base.description && (
            <p className="mt-2 leading-relaxed whitespace-pre-line text-muted">
              {view.base.description}
            </p>
          )}
          <p className="mt-6 text-4xl font-semibold tracking-tight tabular-nums">{price}</p>
          <p className="mt-1 text-sm text-muted">{shop('baseDays', { days: view.base.days })}</p>
          {view.base.includes.length > 0 && (
            <>
              <p className="mt-6 text-sm font-semibold">{shop('includedTitle')}</p>
              <ul className="mt-3 space-y-2 text-sm">
                {view.base.includes.map((text, index) => (
                  <li key={index} className="flex gap-2.5">
                    <Check />
                    <span>{text}</span>
                  </li>
                ))}
              </ul>
            </>
          )}
          <div className="mt-8">{actions}</div>
          {notes}
        </div>
        {extras.length > 0 && (
          <div
            className={`border-t border-border bg-accent/50 p-6 sm:p-8 ${wide ? 'lg:border-t-0 lg:border-l' : ''}`}
          >
            <h3 className="font-semibold tracking-tight">{t('offerExtras')}</h3>
            {view.kind === 'order' && (
              <p className="mt-1 text-sm text-muted">{t('offerExtrasHint')}</p>
            )}
            <ul className="mt-4 divide-y divide-border">
              {extras.map((extra) => (
                <li key={extra.id} className="flex items-start justify-between gap-4 py-3">
                  <div className="min-w-0">
                    <p className="font-medium">{extra.title}</p>
                    {extra.summary && (
                      <p className="mt-0.5 text-sm leading-relaxed text-muted">{extra.summary}</p>
                    )}
                  </div>
                  <p className="shrink-0 text-sm font-semibold tabular-nums">
                    {shop('extraPrice', { price: formatEuros(extra.price, locale) })}
                  </p>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  )
}

function OfferNotes({ view, closedNote }: { view: OfferView; closedNote: string }) {
  const lines = [view.kind === 'inquiry' ? closedNote : '', view.priceNote].filter(Boolean)
  if (!lines.length) return null
  return (
    <div className="mt-4 space-y-1 text-xs leading-relaxed text-muted">
      {lines.map((line) => (
        <p key={line}>{line}</p>
      ))}
    </div>
  )
}
