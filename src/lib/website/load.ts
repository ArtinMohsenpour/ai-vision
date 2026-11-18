import config from '@payload-config'
import { connection } from 'next/server'
import { getPayload } from 'payload'
import { cache } from 'react'

import type { Footer, Home, Media, Navbar, Service } from '@/payload-types'
import type { WebsiteLocale, WebsitePageSlug } from '@/lib/pages'

/** Every fixed page global has the same fields (see src/globals/pages.ts). */
export type WebsitePage = Omit<Home, 'id'> & { id: number }
export type ContentSection = NonNullable<WebsitePage['sections']>[number]

/**
 * Public reads only: no user and `overrideAccess: false`, so visitors get published content.
 * `connection()` renders per request, so a publish in the admin shows up on the next page load.
 */
const publicRead = async () => {
  await connection()
  return getPayload({ config })
}

const published = <T extends { _status?: string | null }>(doc: T): T | null =>
  doc._status === 'published' ? doc : null

export const loadPage = cache(
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

export const loadNavbar = cache(async (locale: WebsiteLocale): Promise<Navbar | null> => {
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

export const loadFooter = cache(
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
export const loadServices = cache(async (locale: WebsiteLocale): Promise<Service[]> => {
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

export const loadService = cache(
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
