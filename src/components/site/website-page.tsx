import type { Metadata } from 'next'
import { getTranslations, setRequestLocale } from 'next-intl/server'
import { notFound } from 'next/navigation'

import { websitePage, type WebsiteLocale, type WebsitePageSlug } from '@/lib/pages'
import { loadPage, loadServices, usesServiceCards, type WebsitePage } from '@/lib/website/load'
import { SITE_NAME, seoMetadata } from '@/lib/website/metadata'
import { faqJsonLd } from '@/lib/website/structured-data'
import { Hero } from './hero'
import { JsonLd } from './json-ld'
import { PageHeading } from './page-heading'
import { Sections } from './sections'

export type PageProps = { params: Promise<{ locale: string }> }

export async function websitePageMetadata(
  slug: WebsitePageSlug,
  { params }: PageProps,
): Promise<Metadata> {
  const locale = (await params).locale as WebsiteLocale
  const page = await loadPage(slug, locale)
  const definition = websitePage(slug)!
  if (!page && slug !== 'home') return {}
  const t = await getTranslations({ locale, namespace: 'Meta' })
  return seoMetadata({
    path: definition.path,
    seo: page?.seo,
    fallbackTitle:
      slug === 'home' ? t('title') : `${page?.title?.trim() || definition[locale]} | ${SITE_NAME}`,
    fallbackDescription: page?.subtitle || (slug === 'home' ? t('description') : undefined),
    locale,
  })
}

/** Renders a fixed page from its Payload global. Unpublished pages return 404 (except Home). */
export async function WebsitePageView({
  slug,
  params,
  fallback,
}: PageProps & { slug: WebsitePageSlug; fallback?: Partial<WebsitePage> }) {
  const locale = (await params).locale as WebsiteLocale
  // Lets next-intl render this page statically (no request headers needed).
  setRequestLocale(locale)
  const publishedPage = await loadPage(slug, locale)
  const page = publishedPage ?? (fallback ? (fallback as WebsitePage) : null)
  if (!page) notFound()
  const isHome = slug === 'home'
  const services =
    (isHome && publishedPage) || usesServiceCards(page.sections) ? await loadServices(locale) : []
  const sections = <Sections sections={page.sections} locale={locale} services={services} />
  return (
    <>
      {isHome ? (
        <>
          <Hero
            eyebrow={page.eyebrow}
            title={page.title}
            subtitle={page.subtitle}
            actions={page.actions}
            heroArtwork={page.heroArtwork}
            services={services}
          />
          <div className="mx-auto max-w-6xl px-4 sm:px-6">{sections}</div>
        </>
      ) : (
        <>
          <PageHeading
            eyebrow={page.eyebrow}
            title={page.title}
            subtitle={page.subtitle}
            actions={page.actions}
          />
          {sections}
        </>
      )}
      <JsonLd data={faqJsonLd(page.sections)} />
    </>
  )
}
