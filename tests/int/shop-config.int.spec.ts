// @vitest-environment node
import { randomUUID } from 'node:crypto'
import { getPayload, type Payload } from 'payload'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'

import { orderingConfig, readShopSettings } from '@/lib/shop/config'
import config from '@/payload.config'
import type { Service, ShopSetting, User } from '@/payload-types'

let payload: Payload
let admin: User
let previousSettings: ShopSetting
const createdServices: number[] = []
const stamp = randomUUID().slice(0, 8)

const serviceData = (label: string, ordering: NonNullable<Service['ordering']>) => ({
  slug: `shop-config-${label}-${stamp}`,
  sortOrder: 900,
  title: `Shop config ${label}`,
  summary: 'Test service for ordering fields.',
  ordering,
  _status: 'published' as const,
})

describe('shop configuration', () => {
  beforeAll(async () => {
    payload = await getPayload({ config: await config })
    previousSettings = await payload.findGlobal({ slug: 'shop-settings' })
    admin = await payload.create({
      collection: 'users',
      data: {
        email: `shop-config-${stamp}@example.test`,
        password: `Shop config password ${stamp}!`,
        firstName: 'Shop',
        lastName: 'Admin',
      },
    })
  })

  afterAll(async () => {
    for (const id of createdServices) await payload.delete({ collection: 'services', id })
    await payload.delete({ collection: 'users', id: admin.id })
    const { id: _id, updatedAt: _u, createdAt: _c, ...restore } = previousSettings
    await payload.updateGlobal({ slug: 'shop-settings', data: restore })
  })

  it('requires base name, price and days when the service can be ordered online', async () => {
    await expect(
      payload.create({ collection: 'services', data: serviceData('missing', { mode: 'order' }) }),
    ).rejects.toThrow()
    const off = await payload.create({
      collection: 'services',
      data: serviceData('off', { mode: 'off' }),
    })
    createdServices.push(off.id)
    expect(orderingConfig(off).mode).toBe('off')
  })

  it('stores extras with stable row IDs and maps them to an ordering config', async () => {
    const service = await payload.create({
      collection: 'services',
      data: serviceData('extras', {
        mode: 'order',
        baseName: 'Simple website',
        basePrice: 20000,
        baseDays: 7,
        depositPercent: 30,
        extras: [
          { title: 'CMS', price: 35000, days: 5, icon: 'cms' },
          { title: 'AI chatbot', price: 45000, days: 4, icon: 'chatbot', active: false },
        ],
      }),
    })
    createdServices.push(service.id)
    const mapped = orderingConfig(service)
    expect(mapped).toMatchObject({
      mode: 'order',
      baseName: 'Simple website',
      basePrice: 20000,
      baseDays: 7,
      depositPercent: 30,
    })
    expect(mapped.extras.map((extra) => extra.id)).toEqual(
      service.ordering?.extras?.map((row) => row.id),
    )
    expect(mapped.extras.map((extra) => [extra.title, extra.active])).toEqual([
      ['CMS', true],
      ['AI chatbot', false],
    ])
  })

  it('hides the order notification email from the public', async () => {
    await payload.updateGlobal({
      slug: 'shop-settings',
      data: { orderNotificationEmail: 'owner@example.test', vatRate: '19' },
    })
    const publicView = await payload.findGlobal({ slug: 'shop-settings', overrideAccess: false })
    expect(publicView.orderNotificationEmail).toBeUndefined()
    const adminView = await payload.findGlobal({
      slug: 'shop-settings',
      overrideAccess: false,
      user: { ...admin, collection: 'users' },
    })
    expect(adminView.orderNotificationEmail).toBe('owner@example.test')
    expect(await readShopSettings(payload)).toMatchObject({
      vatRate: 19,
      orderNotificationEmail: 'owner@example.test',
    })
  })
})
