import type { Metadata } from 'next'
import { getTranslations, setRequestLocale } from 'next-intl/server'
import { notFound } from 'next/navigation'

import { buttonClass } from '@/components/site/cms-link'
import { JsonLd } from '@/components/site/json-ld'
import { isPublicMedia, MediaImage } from '@/components/site/media-image'
import { Sections } from '@/components/site/sections'
import { ServiceHero } from '@/components/site/service-hero'
import { isSlug } from '@/fields/slug'
import { Link } from '@/i18n/navigation'
import { orderPath, servicePath, type WebsiteLocale } from '@/lib/pages'
import { orderingConfig } from '@/lib/shop/config'
import { loadService, loadServices, loadShopSettings, usesServiceCards } from '@/lib/website/load'
import { SITE_NAME, seoMetadata } from '@/lib/website/metadata'
import { faqJsonLd } from '@/lib/website/structured-data'

type Props = { params: Promise<{ locale: string; slug: string }> }

// Rendered on first visit, then cached until content is published (see the locale layout).
export function generateStaticParams() {
  return []
}

async function serviceFor(params: Props['params']) {
  const { locale, slug } = await params
  if (!isSlug(slug)) return { locale: locale as WebsiteLocale, service: null }
  return {
    locale: locale as WebsiteLocale,
    service: await loadService(slug, locale as WebsiteLocale),
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, service } = await serviceFor(params)
  if (!service) return {}
  return seoMetadata({
    path: servicePath(service.slug),
    seo: service.seo,
    fallbackTitle: `${service.title} | ${SITE_NAME}`,
    fallbackDescription: service.summary,
    locale,
  })
}

export default async function ServicePage({ params }: Props) {
  const { locale, service } = await serviceFor(params)
  setRequestLocale(locale)
  if (!service) notFound()
  const [t, shop, services, settings] = await Promise.all([
    getTranslations({ locale, namespace: 'Services' }),
    getTranslations({ locale, namespace: 'Shop' }),
    usesServiceCards(service.sections) ? loadServices(locale) : Promise.resolve([]),
    loadShopSettings(locale),
  ])
  const orderable = settings.orderingEnabled && orderingConfig(service).mode === 'order'
  const image = isPublicMedia(service.image) ? service.image : null
  return (
    <>
      <ServiceHero title={service.title} heroFeatures={service.heroFeatures} />
      <div className="mx-auto w-full max-w-6xl px-4 sm:px-6">
        <nav aria-label={t('breadcrumb')} className="pt-4 text-sm text-muted">
          <Link href="/services" className="hover:text-foreground">
            {t('overview')}
          </Link>
          <span aria-hidden="true"> / </span>
          <span aria-current="page">{service.title}</span>
        </nav>
        <header
          className={`grid items-center gap-10 py-8 sm:py-12 ${image ? 'lg:grid-cols-2' : ''}`}
        >
          <div className="max-w-2xl">
            <p className="text-lg leading-relaxed text-pretty text-muted">{service.summary}</p>
            {service.keyPoints?.length ? (
              <ul className="mt-6 space-y-2">
                {service.keyPoints.map((point) => (
                  <li key={point.id} className="flex gap-3">
                    <span
                      aria-hidden="true"
                      className="mt-2 size-1.5 shrink-0 rounded-full bg-primary"
                    />
                    {point.text}
                  </li>
                ))}
              </ul>
            ) : null}
            <Link
              href={orderable ? orderPath(service.slug) : '/contact'}
              className={`mt-8 ${buttonClass('primary')}`}
            >
              {orderable ? shop('configureAndOrder') : t('cta')}
            </Link>
          </div>
          <MediaImage media={image} fit="landscape" />
        </header>
        <Sections sections={service.sections} locale={locale} services={services} />
        <JsonLd data={faqJsonLd(service.sections)} />
      </div>
    </>
  )
}
