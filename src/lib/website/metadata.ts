import type { Metadata } from 'next'

import { mediaPath } from '@/lib/media-url'
import type { WebsiteLocale } from '@/lib/pages'
import type { Media } from '@/payload-types'

export const SITE_NAME = 'AI Vision'

export function siteOrigin() {
  return new URL(process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3000').origin
}

type Seo = {
  title?: string | null
  description?: string | null
  image?: number | Media | null
  noIndex?: boolean | null
} | null | undefined

/** Title, description, canonical and language URLs, Open Graph and Twitter data for a page. */
export function seoMetadata({
  path,
  seo,
  fallbackTitle,
  fallbackDescription,
  locale,
}: {
  path: string
  seo: Seo
  fallbackTitle: string
  fallbackDescription?: string | null
  locale: WebsiteLocale
}): Metadata {
  const base = siteOrigin()
  const href = (language: string) => `${base}/${language}${path === '/' ? '' : path}`
  const title = seo?.title?.trim() || fallbackTitle
  const description = seo?.description?.trim() || fallbackDescription?.trim() || undefined
  const media = typeof seo?.image === 'object' ? seo.image : null
  // Sharing previews use the 1600 px WebP when it exists (Payload generates it on upload).
  const imageURL = mediaPath(media?.sizes?.wide?.url) ?? mediaPath(media?.url)
  const image = media && imageURL ? { url: imageURL, alt: media.alt } : null
  return {
    metadataBase: new URL(base),
    title,
    description,
    alternates: {
      canonical: href(locale),
      languages: { de: href('de'), en: href('en'), 'x-default': href('de') },
    },
    robots: seo?.noIndex ? { index: false, follow: false } : { index: true, follow: true },
    openGraph: {
      type: 'website',
      siteName: SITE_NAME,
      title,
      description,
      url: href(locale),
      locale: locale === 'de' ? 'de_DE' : 'en_GB',
      alternateLocale: locale === 'de' ? 'en_GB' : 'de_DE',
      images: image ? [image] : [],
    },
    twitter: {
      card: image ? 'summary_large_image' : 'summary',
      title,
      description,
      images: image ? [image.url] : [],
    },
  }
}
