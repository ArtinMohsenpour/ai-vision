/**
 * Publishes bilingual starter content: the six service pages, every page global, the navbar and
 * the footer. Each area is seeded only while it is empty (no versions / no service pages), so it
 * is safe to run again and never overwrites edits.
 *
 *   pnpm content:seed
 */
import config from '@payload-config'
import { getPayload, type GlobalSlug, type Payload } from 'payload'

import { websitePages } from '../src/lib/pages'
import { footerData, navbarData, pageData, serviceData, serviceSeeds } from './seed/content'

type Row = Record<string, unknown>

// Localized blocks and arrays keep their own rows per language; every other array is shared,
// so the English update reuses the German row ids.
const LOCALIZED_ARRAYS = new Set(['sections', 'keyPoints'])

function withRowIds(shared: unknown, translated: unknown): unknown {
  if (Array.isArray(translated) && Array.isArray(shared)) {
    return translated.map((row, index) => {
      const existing = shared[index] as Row | undefined
      return existing && row && typeof row === 'object'
        ? { ...(withRowIds(existing, row) as Row), id: existing.id }
        : row
    })
  }
  if (translated && typeof translated === 'object' && shared && typeof shared === 'object') {
    return Object.fromEntries(
      Object.entries(translated as Row).map(([key, value]) => [
        key,
        LOCALIZED_ARRAYS.has(key) ? value : withRowIds((shared as Row)[key], value),
      ]),
    )
  }
  return translated
}

async function isEmptyGlobal(payload: Payload, slug: GlobalSlug) {
  const versions = await payload.findGlobalVersions({ slug, limit: 1, depth: 0 })
  return versions.totalDocs === 0
}

async function publishGlobal(payload: Payload, slug: GlobalSlug, de: Row, en: Row) {
  if (!(await isEmptyGlobal(payload, slug))) {
    payload.logger.info(`Skipped ${slug}: it already has content.`)
    return
  }
  await payload.updateGlobal({ slug, locale: 'de', data: { ...de, _status: 'published' } as never })
  const saved = await payload.findGlobal({ slug, locale: 'de', depth: 0 })
  await payload.updateGlobal({
    slug,
    locale: 'en',
    data: { ...(withRowIds(saved, en) as Row), _status: 'published' } as never,
  })
  payload.logger.info(`Published ${slug}.`)
}

async function seedServices(payload: Payload) {
  const existing = await payload.find({ collection: 'services', limit: 0, depth: 0 })
  if (existing.totalDocs === 0) {
    for (const seed of serviceSeeds) {
      const created = await payload.create({
        collection: 'services',
        locale: 'de',
        data: { ...serviceData(seed, 'de'), _status: 'published' } as never,
      })
      await payload.update({
        collection: 'services',
        id: created.id,
        locale: 'en',
        data: { ...(withRowIds(created, serviceData(seed, 'en')) as Row), _status: 'published' } as never,
      })
    }
    payload.logger.info(`Published ${serviceSeeds.length} service pages.`)
  } else {
    payload.logger.info('Skipped service pages: some already exist.')
  }
  const load = async (locale: 'de' | 'en') =>
    (
      await payload.find({
        collection: 'services',
        locale,
        depth: 0,
        limit: 20,
        sort: 'sortOrder',
        where: { _status: { equals: 'published' } },
      })
    ).docs.map(({ id, title, summary }) => ({ id, title, summary }))
  return { de: await load('de'), en: await load('en') }
}

const payload = await getPayload({ config })
const services = await seedServices(payload)

const de = pageData('de')
const en = pageData('en')
for (const { slug } of websitePages) {
  await publishGlobal(payload, slug, de[slug], en[slug])
}
await publishGlobal(payload, 'navbar', navbarData('de', services.de), navbarData('en', services.en))
await publishGlobal(payload, 'footer', footerData('de', services.de), footerData('en', services.en))

payload.logger.info('Starter content done.')
process.exit(0)
