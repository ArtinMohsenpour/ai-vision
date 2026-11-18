import config from '@payload-config'
import { unstable_cache } from 'next/cache'
import { getPayload } from 'payload'
import { cache } from 'react'

import type { Footer, Home, Media, Navbar, Service } from '@/payload-types'
import type { WebsiteLocale, WebsitePageSlug } from '@/lib/pages'
import { WEBSITE_CACHE_SECONDS, WEBSITE_CACHE_TAG } from './cache'

/** Every fixed page global has the same fields (see src/globals/pages.ts). */
export type WebsitePage = Omit<Home, 'id'> & { id: number }
export type ContentSection = NonNullable<WebsitePage['sections']>[number]

/**
 * Public reads only: no user and `overrideAccess: false`, so visitors get published content.
 *
 * Every read is cached under one tag. Pages render once and are then served from the cache
 * without touching the database; Payload's afterChange hooks expire the tag on publish
 * (src/hooks/revalidate.ts). `cache()` also dedupes calls within one render.
 */
const publicRead = () => getPayload({ config })

function cached<Args extends unknown[], Result>(key: string, fn: (...args: Args) => Promise<Result>) {
  return cache(
    unstable_cache(fn, ['website', key], {
      tags: [WEBSITE_CACHE_TAG],
      revalidate: WEBSITE_CACHE_SECONDS,
    }),
  )
}

const published = <T extends { _status?: string | null }>(doc: T): T | null =>
  doc._status === 'published' ? doc : null

export const loadPage = cached(
  'loadPage',
  async (slug: WebsitePageSlug, locale: WebsiteLocale): Promise<WebsitePage | null> => {
    const payload = await publicRead()
    const page = await payload.findGlobal({
      slug,
      locale,
      fallbackLocale: 'de',
      overrideAccess: false,
      depth: 1,
    })
    return published(page as WebsitePage)
  },
)

export const loadNavbar = cached(
  'loadNavbar',async (locale: WebsiteLocale): Promise<Navbar | null> => {
  const payload = await publicRead()
  const navbar = await payload.findGlobal({
    slug: 'navbar',
    locale,
    fallbackLocale: 'de',
    overrideAccess: false,
    depth: 1,
  })
  return published(navbar)
})

export const loadFooter = cached(
  'loadFooter',
  async (locale: WebsiteLocale): Promise<{ footer: Footer | null; logo: Media | null }> => {
    const payload = await publicRead()
    const [footer, navbar] = await Promise.all([
      payload.findGlobal({
        slug: 'footer',
        locale,
        fallbackLocale: 'de',
        overrideAccess: false,
        depth: 1,
      }),
      loadNavbar(locale),
    ])
    const own = published(footer)
    const logo = (typeof own?.logo === 'object' && own.logo) || (typeof navbar?.logo === 'object' && navbar.logo) || null
    return { footer: own, logo }
  },
)

/** Published services in their sort order (for service cards and the services overview). */
export const loadServices = cached(
  'loadServices',async (locale: WebsiteLocale): Promise<Service[]> => {
  const payload = await publicRead()
  const { docs } = await payload.find({
    collection: 'services',
    locale,
    fallbackLocale: 'de',
    overrideAccess: false,
    depth: 1,
    limit: 50,
    sort: 'sortOrder',
    where: { _status: { equals: 'published' } },
  })
  return docs
})

export const loadService = cached(
  'loadService',
  async (slug: string, locale: WebsiteLocale): Promise<Service | null> => {
    const payload = await publicRead()
    const { docs } = await payload.find({
      collection: 'services',
      locale,
      fallbackLocale: 'de',
      overrideAccess: false,
      depth: 1,
      limit: 1,
      where: { and: [{ slug: { equals: slug } }, { _status: { equals: 'published' } }] },
    })
    return docs[0] ?? null
  },
)

/** True when any section of the page contains a service-cards item. */
export function usesServiceCards(sections: WebsitePage['sections']) {
  return Boolean(
    sections?.some((section) =>
      [section.column1, 'column2' in section ? section.column2 : null, 'column3' in section ? section.column3 : null].some(
        (column) => column?.content?.some((item) => item.type === 'services'),
      ),
    ),
  )
}
