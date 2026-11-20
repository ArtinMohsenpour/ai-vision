import { randomUUID } from 'node:crypto'
import { expect, type APIRequestContext } from '@playwright/test'

import type { Service, ShopSetting } from '../../src/payload-types.js'
import { getLocalTestPayload, seedTestUser } from './seedUser'

type Ordering = NonNullable<Service['ordering']>

/**
 * Shop content for browser tests, written through the admin REST API so the running site's
 * cache hooks expire the cached pages (writes from the test process could not).
 */
export async function shopFixture(request: APIRequestContext) {
  const payload = await getLocalTestPayload()
  const admin = await seedTestUser(payload)
  const login = await request.post('/api/users/login', {
    data: { email: admin.email, password: admin.password },
  })
  expect(login.ok()).toBe(true)
  const headers = { Authorization: `JWT ${(await login.json()).token as string}` }
  const previous: ShopSetting = await payload.findGlobal({ slug: 'shop-settings' })
  const services: number[] = []

  async function settings(
    data: Partial<Pick<ShopSetting, 'orderingEnabled' | 'priceNote' | 'vatRate'>>,
  ) {
    const response = await request.post('/api/globals/shop-settings?locale=en', { headers, data })
    expect(response.ok()).toBe(true)
  }

  async function createService(
    ordering: Ordering,
    title = `Shop test ${randomUUID().slice(0, 6)}`,
  ) {
    const slug = `e2e-shop-${randomUUID().slice(0, 8)}`
    const response = await request.post('/api/services?locale=de&depth=0', {
      headers,
      data: {
        slug,
        sortOrder: 1,
        title,
        summary: 'A service for shop tests.',
        ordering,
        _status: 'published',
      },
    })
    expect(response.ok()).toBe(true)
    const doc = (await response.json()).doc as Service
    services.push(doc.id)
    return doc
  }

  async function updateService(id: number, data: Partial<Service>) {
    const response = await request.patch(`/api/services/${id}?locale=de&depth=0`, {
      headers,
      data: { ...data, _status: 'published' },
    })
    expect(response.ok()).toBe(true)
    return (await response.json()).doc as Service
  }

  async function cleanup() {
    try {
      for (const id of services) await request.delete(`/api/services/${id}`, { headers })
      await settings({
        orderingEnabled: previous.orderingEnabled ?? false,
        vatRate: previous.vatRate ?? '0',
      })
      await payload.delete({ collection: 'users', id: admin.id })
    } finally {
      await payload.destroy()
    }
  }

  return { payload, headers, settings, createService, updateService, cleanup }
}

/** The approved mockup's website offer, with the given extras active. */
export const websiteOrdering = (): Ordering => ({
  mode: 'order',
  baseName: 'Simple website',
  baseDescription: 'Up to 5 pages, mobile ready, contact form, SEO basics.',
  baseIncludes: [{ text: 'Up to 5 pages' }, { text: 'Contact form' }],
  basePrice: 20000,
  baseDays: 7,
  extras: [
    {
      title: 'CMS',
      summary: 'Edit texts, images and pages yourself.',
      description: 'An easy admin area where you change content without a developer.',
      includes: [{ text: 'Edit every text and image' }, { text: 'Drafts and version history' }],
      price: 35000,
      days: 5,
      icon: 'cms',
    },
    {
      title: 'AI chatbot',
      summary: 'Answers visitor questions 24/7.',
      description:
        'A chat assistant trained on your services that answers questions and collects leads.',
      includes: [{ text: 'Trained on your content' }, { text: 'Hands over to you by email' }],
      price: 45000,
      days: 4,
      icon: 'chatbot',
    },
  ],
})
