'use client'

import { useLocale, useTranslations } from 'next-intl'
import { useRouter, useSearchParams } from 'next/navigation'
import { Fragment, Suspense, useActionState, useEffect, useMemo, useState } from 'react'

import { buttonClass } from '@/components/site/cms-link'
import { Link } from '@/i18n/navigation'
import type { CheckoutState } from '@/lib/shop/checkout-state'
import { formatEuros } from '@/lib/shop/money'
import { displayConfig, type OrderPageData } from '@/lib/shop/order-page'
import { parseExtraIds, quoteOrder, vatFor } from '@/lib/shop/pricing'
import { ExtraIcon } from './extra-icons'
import { ExtraPreview } from './extra-preview'

type Props = {
  data: OrderPageData
  action: (state: CheckoutState, form: FormData) => Promise<CheckoutState>
}

/** Reads the selection from `?extras=` so the page itself stays static and cached. */
export function OrderConfigurator(props: Props) {
  return (
    <Suspense fallback={<Configurator {...props} initial={[]} />}>
      <ConfiguratorFromUrl {...props} />
    </Suspense>
  )
}

function ConfiguratorFromUrl(props: Props) {
  const params = useSearchParams()
  const known = new Set(props.data.extras.map((extra) => extra.id))
  const initial = parseExtraIds(params.get('extras')).filter((id) => known.has(id))
  return <Configurator {...props} initial={initial} />
}

function Configurator({ data, action, initial }: Props & { initial: string[] }) {
  const t = useTranslations('Shop')
  const locale = useLocale() === 'de' ? 'de' : 'en'
  const [state, formAction, pending] = useActionState(action, {})
  const [chosen, setSelected] = useState<string[]>(initial)
  const router = useRouter()
  // After a refresh with a changed offer, drop extras that no longer exist.
  const selected = chosen.filter((id) => data.extras.some((extra) => extra.id === id))
  useEffect(() => {
    // The owner changed this offer: load the current prices and extras.
    if (state.error === 'offerChanged') router.refresh()
  }, [state, router])
  const [focused, setFocused] = useState<string | undefined>(initial[0] ?? data.extras[0]?.id)
  const config = useMemo(() => displayConfig(data), [data])
  const quote = quoteOrder(config, selected, data.vatRate)
  const euros = (cents: number) => formatEuros(cents, locale)
  const focusedExtra = data.extras.find((extra) => extra.id === focused)
  const extrasParam = quote.lines.flatMap((line) => (line.id ? [line.id] : [])).join(',')

  function toggle(id: string) {
    const next =
      selected.includes(id) && focused === id
        ? selected.filter((entry) => entry !== id)
        : selected.includes(id)
          ? selected
          : [...selected, id]
    setSelected(next)
    setFocused(id)
    const url = new URL(window.location.href)
    const ordered = data.extras.filter((extra) => next.includes(extra.id)).map((extra) => extra.id)
    if (ordered.length) url.searchParams.set('extras', ordered.join(','))
    else url.searchParams.delete('extras')
    window.history.replaceState(null, '', url)
  }

  const dueNow = quote.depositPercent
    ? quote.depositNet + vatFor(quote.depositNet, quote.vatRate)
    : quote.total

  return (
    <div className="py-8 pb-28 lg:pb-16">
      <nav aria-label={t('breadcrumbPricing')} className="text-sm text-muted">
        <Link href="/pricing" className="hover:text-foreground">
          {t('breadcrumbPricing')}
        </Link>
        <span aria-hidden="true"> / </span>
        <span aria-current="page">{data.title}</span>
      </nav>
      <h1 className="mt-4 text-3xl font-semibold tracking-tight text-balance sm:text-4xl">
        {t('heading', { service: data.title })}
      </h1>
      <p className="mt-3 max-w-2xl text-lg text-muted">{t('intro')}</p>

      <div className="mt-10 grid gap-8 lg:grid-cols-[minmax(0,1.25fr)_minmax(0,1fr)]">
        <div>
          <section aria-labelledby="base-package" className="rounded-3xl bg-accent p-6">
            <p className="text-xs font-semibold tracking-wide text-primary uppercase">
              {t('basePackage')}
            </p>
            <div className="mt-1 flex items-baseline justify-between gap-4">
              <h2 id="base-package" className="text-xl font-semibold">
                {data.base.name}
              </h2>
              <span className="text-xl font-semibold tabular-nums">{euros(data.base.price)}</span>
            </div>
            {data.base.description && (
              <p className="mt-2 text-sm leading-relaxed text-muted">{data.base.description}</p>
            )}
            {data.base.includes.length > 0 && (
              <ul className="mt-4 grid gap-1.5 text-sm sm:grid-cols-2">
                {data.base.includes.map((item) => (
                  <li key={item} className="flex gap-2">
                    <span aria-hidden="true" className="text-primary">
                      ✓
                    </span>
                    {item}
                  </li>
                ))}
              </ul>
            )}
            <p className="mt-4 text-sm text-muted">{t('baseDays', { days: data.base.days })}</p>
          </section>

          {data.extras.length > 0 && (
            <section aria-labelledby="extras-title" className="mt-8">
              <h2
                id="extras-title"
                className="text-sm font-semibold tracking-wide text-muted uppercase"
              >
                {t('extrasTitle')}
              </h2>
              <ul className="mt-3 space-y-3">
                {data.extras.map((extra) => {
                  const on = selected.includes(extra.id)
                  const isFocused = focused === extra.id
                  return (
                    <li key={extra.id}>
                      <button
                        type="button"
                        aria-pressed={on}
                        aria-controls="extra-preview"
                        onClick={() => toggle(extra.id)}
                        className={`flex w-full cursor-pointer items-start gap-4 rounded-2xl border p-4 text-left transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary motion-reduce:transition-none ${
                          on
                            ? 'border-primary bg-accent ring-1 ring-primary'
                            : 'border-border bg-surface hover:border-foreground/30'
                        }`}
                      >
                        <span
                          aria-hidden="true"
                          className={`mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-md border text-xs ${
                            on
                              ? 'border-primary bg-primary text-primary-foreground'
                              : 'border-muted text-transparent'
                          }`}
                        >
                          ✓
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="flex items-baseline justify-between gap-3">
                            <span className="font-semibold">{extra.title}</span>
                            <span className="font-semibold tabular-nums">
                              {t('extraPrice', { price: euros(extra.price) })}
                            </span>
                          </span>
                          {extra.summary && (
                            <span className="mt-0.5 block text-sm text-muted">{extra.summary}</span>
                          )}
                          <span className="mt-1 block text-xs text-muted">
                            {t('extraDays', { days: extra.days })}
                          </span>
                        </span>
                        <span aria-hidden="true" className="hidden text-muted sm:block">
                          <ExtraIcon name={extra.icon} size={20} />
                        </span>
                      </button>
                      {isFocused && (
                        <div className="mt-2 overflow-hidden rounded-2xl border border-border bg-surface lg:hidden">
                          <ExtraPreview extra={extra} />
                        </div>
                      )}
                    </li>
                  )
                })}
              </ul>
            </section>
          )}
        </div>

        <div className="lg:sticky lg:top-[calc(var(--navbar-height)+1.5rem)] lg:self-start">
          {data.extras.length > 0 && (
            <section
              id="extra-preview"
              aria-label={t('previewLabel')}
              aria-live="polite"
              className="mb-4 hidden overflow-hidden rounded-3xl border border-border bg-surface lg:block"
            >
              <p className="px-5 pt-4 text-xs font-semibold tracking-wide text-muted uppercase">
                {t('previewLabel')}
              </p>
              <ExtraPreview extra={focusedExtra} />
            </section>
          )}

          <section
            id="order-summary"
            aria-label={t('summaryLabel')}
            className="rounded-3xl border border-border bg-surface p-5"
          >
            <h2 className="text-xs font-semibold tracking-wide text-muted uppercase">
              {t('summaryLabel')}
            </h2>
            <dl className="mt-3 space-y-1.5 text-sm">
              {quote.lines.map((line) => (
                <div key={line.id ?? 'base'} className="flex justify-between gap-4">
                  <dt className={line.kind === 'extra' ? 'text-muted' : undefined}>
                    {line.kind === 'extra' ? `+ ${line.title}` : line.title}
                  </dt>
                  <dd className="tabular-nums">{euros(line.net)}</dd>
                </div>
              ))}
              {quote.vat > 0 && (
                <div className="flex justify-between gap-4 text-muted">
                  <dt>{t('vatLine', { rate: quote.vatRate })}</dt>
                  <dd className="tabular-nums">{euros(quote.vat)}</dd>
                </div>
              )}
            </dl>
            <dl className="mt-3 space-y-1.5 border-t border-border pt-3 text-sm">
              <div className="flex justify-between gap-4 text-base font-semibold">
                <dt>{t('total')}</dt>
                <dd className="tabular-nums">{euros(quote.total)}</dd>
              </div>
              {quote.depositPercent > 0 && (
                <div className="flex justify-between gap-4">
                  <dt>{t('dueNow', { percent: quote.depositPercent })}</dt>
                  <dd className="font-semibold tabular-nums">{euros(dueNow)}</dd>
                </div>
              )}
              <div className="flex justify-between gap-4 text-muted">
                <dt>{t('estimatedDelivery')}</dt>
                <dd>{t('deliveryDays', { days: quote.deliveryDays })}</dd>
              </div>
            </dl>
            {quote.depositPercent > 0 && <p className="mt-2 text-xs text-muted">{t('dueLater')}</p>}
            {data.priceNote && <p className="mt-2 text-xs text-muted">{data.priceNote}</p>}

            <form action={formAction} className="mt-5">
              <input type="hidden" name="extras" value={extrasParam} />
              <label className="flex cursor-pointer gap-2.5 text-sm">
                <input
                  type="checkbox"
                  name="terms"
                  value="accepted"
                  required
                  className="mt-0.5 size-4 shrink-0 accent-primary"
                />
                <span>
                  {t.rich('terms', {
                    link: (chunks) => (
                      <Link
                        href="/terms"
                        target="_blank"
                        className="font-medium underline underline-offset-2"
                      >
                        {chunks}
                      </Link>
                    ),
                  })}
                </span>
              </label>
              {state.error && (
                <p role="alert" className="mt-3 text-sm text-[var(--error-text)]">
                  {t(`errors.${state.error}`)}
                </p>
              )}
              <button
                type="submit"
                disabled={pending}
                className={`mt-4 w-full ${buttonClass('primary')} py-3 disabled:opacity-60`}
              >
                {pending ? t('redirecting') : t('continue')}
              </button>
            </form>
            <p className="mt-3 flex gap-2 text-xs leading-relaxed text-muted">
              <svg
                aria-hidden="true"
                viewBox="0 0 24 24"
                width="14"
                height="14"
                className="mt-0.5 shrink-0"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M7 11V8a5 5 0 0 1 10 0v3M6 11h12v9H6z" />
              </svg>
              <span>{t('stripeNote')}</span>
            </p>
          </section>
        </div>
      </div>

      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-border bg-surface/95 px-4 py-3 backdrop-blur lg:hidden">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4">
          <div>
            <p className="text-xs text-muted">{t('total')}</p>
            <p className="text-lg font-semibold tabular-nums">
              {quote.depositPercent > 0 ? (
                <Fragment>
                  {euros(dueNow)}{' '}
                  <span className="text-xs font-normal text-muted">/ {euros(quote.total)}</span>
                </Fragment>
              ) : (
                euros(quote.total)
              )}
            </p>
          </div>
          <a href="#order-summary" className={buttonClass('primary')}>
            {t('reviewOrder')}
          </a>
        </div>
      </div>
    </div>
  )
}
