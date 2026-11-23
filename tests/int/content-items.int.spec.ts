// @vitest-environment node
import { randomUUID } from 'node:crypto'
import { getPayload, type Payload } from 'payload'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'

import { isSiteIcon, SITE_ICONS } from '@/fields/icons'
import { offerView } from '@/lib/shop/offer'
import config from '@/payload.config'
import type { Service } from '@/payload-types'

let payload: Payload
const stamp = randomUUID().slice(0, 8)
const created: number[] = []

const ordering = (overrides: Partial<NonNullable<Service['ordering']>> = {}) =>
  ({
    mode: 'order',
    baseName: 'Simple website',
    baseDescription: 'Up to 5 pages.',
    baseIncludes: [{ text: 'Up to 5 pages' }],
    basePrice: 20000,
    baseDays: 3,
    depositPercent: 20,
    extras: [
      {
        id: 'cms',
        title: 'CMS',
        summary: 'Edit content yourself.',
        price: 60000,
        days: 5,
        active: true,
      },
      { id: 'old', title: 'Retired extra', price: 10000, days: 1, active: false },
    ],
    ...overrides,
  }) as NonNullable<Service['ordering']>

const service = (data: Partial<Service>) =>
  ({ id: 1, slug: 'websites', title: 'Websites', summary: '', sortOrder: 1, ...data }) as Service

/** The invalid field paths of a rejected save ("saved" when it went through). */
async function invalidPaths(save: Promise<unknown>) {
  try {
    await save
    return 'saved'
  } catch (error) {
    const errors = (error as { data?: { errors?: { path: string }[] } }).data?.errors
    return errors?.map((entry) => entry.path).join(', ') ?? String(error)
  }
}

const open = { vatRate: 0 as const, priceNote: 'Note', orderingEnabled: true }
const closed = { ...open, orderingEnabled: false }

describe('package and price item (offerView)', () => {
  it('shows the live base package and only active extras when ordering is open', () => {
    const view = offerView(service({ ordering: ordering() }), open)
    expect(view?.kind).toBe('order')
    if (view?.kind !== 'order') return
    expect(view.base).toMatchObject({
      name: 'Simple website',
      price: 20000,
      days: 3,
      includes: ['Up to 5 pages'],
    })
    expect(view.extras.map((extra) => [extra.title, extra.price])).toEqual([['CMS', 60000]])
    expect(view.priceNote).toBe('Note')
  })

  it('keeps package and prices but asks for an inquiry while the shop is closed', () => {
    expect(offerView(service({ ordering: ordering() }), closed)?.kind).toBe('inquiry')
  })

  it('shows price on request for quote services, whether the shop is open or not', () => {
    expect(offerView(service({ ordering: { mode: 'quote' } }), open)?.kind).toBe('quote')
    expect(offerView(service({ ordering: { mode: 'quote' } }), closed)?.kind).toBe('quote')
  })

  it('shows nothing for services without ordering or with incomplete ordering', () => {
    expect(offerView(service({ ordering: { mode: 'off' } }), open)).toBeNull()
    expect(offerView(service({}), open)).toBeNull()
    expect(offerView(service({ ordering: ordering({ basePrice: null }) }), open)).toBeNull()
  })
})

describe('card icons', () => {
  it('accepts only known icon names', () => {
    expect(isSiteIcon('speed')).toBe(true)
    expect(isSiteIcon('toString')).toBe(false)
    expect(isSiteIcon('<svg>')).toBe(false)
    expect(isSiteIcon(null)).toBe(false)
    expect(Object.keys(SITE_ICONS).length).toBeGreaterThan(20)
  })
})

describe('new content items in page sections', () => {
  let offerTarget: Service

  const sectionsWith = (...content: Record<string, unknown>[]) => [
    { blockType: 'fullWidth', tone: 'plain', alignment: 'top', column1: { content } },
  ]
  const steps = (count: number) => ({
    type: 'steps',
    steps: Array.from({ length: count }, (_, index) => ({
      title: `Step ${index + 1}`,
      note: 'online',
    })),
  })
  const facts = (count: number) => ({
    type: 'facts',
    facts: Array.from({ length: count }, (_, index) => ({
      value: `V${index}`,
      label: `Label ${index}`,
    })),
  })
  const save = (label: string, sections: unknown, overrideAccess = true) =>
    payload.create({
      collection: 'services',
      locale: 'de',
      overrideAccess,
      data: {
        slug: `content-items-${label}-${stamp}`,
        sortOrder: 950,
        title: `Content items ${label}`,
        summary: 'Test service for content items.',
        sections,
        _status: 'published',
      } as never,
    })

  beforeAll(async () => {
    payload = await getPayload({ config: await config })
    offerTarget = await save('target', [])
    created.push(offerTarget.id)
  })

  afterAll(async () => {
    for (const id of created) await payload.delete({ collection: 'services', id })
  })

  it('saves a timeline, key facts, icon cards and a package item, and visitors read them', async () => {
    const doc = await save(
      'valid',
      sectionsWith(
        steps(3),
        facts(4),
        { type: 'cards', cards: [{ title: 'Fast', icon: 'speed' }, { title: 'Plain' }] },
        { type: 'offer', offerService: offerTarget.id, offerLayout: 'compact' },
      ),
    )
    created.push(doc.id)
    const read = await payload.findByID({
      collection: 'services',
      id: doc.id,
      depth: 0,
      overrideAccess: false,
    })
    const items = read.sections?.[0]?.column1?.content ?? []
    expect(items.map((item) => item.type)).toEqual(['steps', 'facts', 'cards', 'offer'])
    expect(items[0].steps?.map((step) => step.title)).toEqual(['Step 1', 'Step 2', 'Step 3'])
    expect(items[1].facts).toHaveLength(4)
    expect(items[2].cards?.map((card) => card.icon ?? null)).toEqual(['speed', null])
    expect(items[3]).toMatchObject({ offerService: offerTarget.id, offerLayout: 'compact' })
  })

  it('needs at least two timeline steps', async () => {
    expect(await invalidPaths(save('one-step', sectionsWith(steps(1))))).toMatch(
      /content\.0\.steps/,
    )
  })

  it('allows at most four key facts', async () => {
    expect(await invalidPaths(save('five-facts', sectionsWith(facts(5))))).toMatch(
      /content\.0\.facts/,
    )
  })

  it('needs a service for a package item', async () => {
    expect(
      await invalidPaths(
        save('no-service', sectionsWith({ type: 'offer', offerLayout: 'extras' })),
      ),
    ).toMatch(/content\.0\.offerService/)
  })

  it('rejects an unknown card icon', async () => {
    expect(
      await invalidPaths(
        save(
          'bad-icon',
          sectionsWith({ type: 'cards', cards: [{ title: 'Bad', icon: 'rocket-ship' }] }),
        ),
      ),
    ).toMatch(/cards\.0\.icon/)
  })

  it('a visitor cannot create a page with these items', async () => {
    await expect(save('visitor', sectionsWith(steps(2)), false)).rejects.toThrow(/not allowed/)
  })
})
