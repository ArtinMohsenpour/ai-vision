import { createLocalReq, getPayload, initTransaction, killTransaction, type Payload } from 'payload'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'

import config from '@/payload.config'
import type { Customer, User } from '@/payload-types'

let payload: Payload
const stamp = Date.now()
let customer: Customer
let admin: User

const asCustomer = (c: Customer) => ({ ...c, collection: 'customers' as const })
const asAdmin = (u: User) => ({ ...u, collection: 'users' as const })

const serviceData = (slug: string, status: 'draft' | 'published') => ({
  slug,
  title: `Test service ${slug}`,
  summary: 'Test summary',
  sortOrder: 999,
  _status: status,
})

describe('website content access', () => {
  beforeAll(async () => {
    payload = await getPayload({ config: await config })
    customer = await payload.create({
      collection: 'customers',
      data: {
        email: `content.customer.${stamp}@content.test`,
        password: `test-password-${stamp}`,
        firstName: 'Test',
        lastName: 'Customer',
        company: 'Test GmbH',
        businessConfirmedAt: new Date().toISOString(),
        _verified: true,
      },
    })
    admin = await payload.create({
      collection: 'users',
      data: { email: `content.admin.${stamp}@content.test`, password: `admin-password-${stamp}` },
    })
  })

  afterAll(async () => {
    await payload.delete({ collection: 'services', where: { slug: { like: `test-${stamp}` } } })
    await payload.delete({ collection: 'customers', where: { id: { equals: customer.id } } })
    await payload.delete({ collection: 'users', where: { id: { equals: admin.id } } })
  })

  describe('page globals, navbar and footer', () => {
    it.each(['about', 'navbar', 'footer'] as const)('a visitor can read the published %s', async (slug) => {
      const doc = await payload.findGlobal({ slug, overrideAccess: false })
      expect(doc._status).toBe('published')
    })

    it.each(['about', 'navbar'] as const)('a visitor cannot update %s', async (slug) => {
      await expect(
        payload.updateGlobal({ slug, data: {}, overrideAccess: false }),
      ).rejects.toThrow()
    })

    it('a customer cannot update a page', async () => {
      await expect(
        payload.updateGlobal({
          slug: 'contact',
          data: { title: 'Hacked' },
          overrideAccess: false,
          user: asCustomer(customer),
        }),
      ).rejects.toThrow()
    })

    it('a visitor cannot request drafts', async () => {
      await expect(
        payload.findGlobal({ slug: 'home', draft: true, overrideAccess: false }),
      ).rejects.toThrow()
    })

    it('a visitor cannot read version history', async () => {
      await expect(
        payload.findGlobalVersions({ slug: 'home', overrideAccess: false }),
      ).rejects.toThrow()
    })

    it('the admin can update a page and read drafts (rolled back)', async () => {
      const req = await createLocalReq({ user: asAdmin(admin) }, payload)
      await initTransaction(req)
      try {
        await payload.updateGlobal({
          slug: 'faq',
          locale: 'en',
          data: { title: `Draft ${stamp}` },
          draft: true,
          overrideAccess: false,
          user: asAdmin(admin),
          req,
        })
        const draft = await payload.findGlobal({
          slug: 'faq',
          locale: 'en',
          draft: true,
          overrideAccess: false,
          user: asAdmin(admin),
          req,
        })
        expect(draft.title).toBe(`Draft ${stamp}`)
      } finally {
        await killTransaction(req)
      }
      const published = await payload.findGlobal({ slug: 'faq', locale: 'en', overrideAccess: false })
      expect(published.title).not.toBe(`Draft ${stamp}`)
    })
  })

  describe('service pages', () => {
    it('a visitor and a customer cannot create a service page', async () => {
      await expect(
        payload.create({
          collection: 'services',
          data: serviceData(`test-${stamp}-visitor`, 'published'),
          overrideAccess: false,
        }),
      ).rejects.toThrow()
      await expect(
        payload.create({
          collection: 'services',
          data: serviceData(`test-${stamp}-customer`, 'published'),
          overrideAccess: false,
          user: asCustomer(customer),
        }),
      ).rejects.toThrow()
    })

    it('drafts are visible to the admin only', async () => {
      const draft = await payload.create({
        collection: 'services',
        data: serviceData(`test-${stamp}-draft`, 'draft'),
        draft: true,
        overrideAccess: false,
        user: asAdmin(admin),
      })
      const visitor = await payload.find({
        collection: 'services',
        where: { id: { equals: draft.id } },
        overrideAccess: false,
      })
      expect(visitor.totalDocs).toBe(0)
      const adminView = await payload.find({
        collection: 'services',
        where: { id: { equals: draft.id } },
        draft: true,
        overrideAccess: false,
        user: asAdmin(admin),
      })
      expect(adminView.totalDocs).toBe(1)
    })

    it('a visitor reads published service pages', async () => {
      const created = await payload.create({
        collection: 'services',
        data: serviceData(`test-${stamp}-live`, 'published'),
        overrideAccess: false,
        user: asAdmin(admin),
      })
      const visitor = await payload.find({
        collection: 'services',
        where: { id: { equals: created.id } },
        overrideAccess: false,
      })
      expect(visitor.totalDocs).toBe(1)
    })

    it('a customer cannot delete a service page', async () => {
      const { docs } = await payload.find({ collection: 'services', limit: 1 })
      await expect(
        payload.delete({
          collection: 'services',
          id: docs[0].id,
          overrideAccess: false,
          user: asCustomer(customer),
        }),
      ).rejects.toThrow()
    })

    it('rejects an invalid slug', async () => {
      await expect(
        payload.create({ collection: 'services', data: serviceData('Not A Slug', 'published') }),
      ).rejects.toThrow()
    })
  })
})
