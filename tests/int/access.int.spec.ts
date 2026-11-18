import { getPayload, type Payload } from 'payload'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'

import config from '@/payload.config'
import type { Customer, User } from '@/payload-types'

let payload: Payload
const stamp = Date.now()
let customerA: Customer
let customerB: Customer
let admin: User

const asCustomer = (c: Customer) => ({ ...c, collection: 'customers' as const })
const asAdmin = (u: User) => ({ ...u, collection: 'users' as const })

const customerData = (label: string) => ({
  email: `test-${label}-${stamp}@example.test`,
  password: `test-password-${stamp}`,
  firstName: 'Test',
  lastName: label,
  company: `Test ${label} GmbH`,
  businessConfirmedAt: new Date().toISOString(),
  _verified: true,
})

describe('access control', () => {
  beforeAll(async () => {
    payload = await getPayload({ config: await config })
    customerA = await payload.create({
      collection: 'customers',
      data: { ...customerData('a'), stripeCustomerId: 'cus_test_a', adminNotes: 'internal' },
    })
    customerB = await payload.create({ collection: 'customers', data: customerData('b') })
    admin = await payload.create({
      collection: 'users',
      data: { email: `admin-${stamp}@example.test`, password: `admin-password-${stamp}` },
    })
  })

  afterAll(async () => {
    await payload.delete({
      collection: 'customers',
      where: { email: { like: `-${stamp}@example.test` } },
    })
    await payload.delete({
      collection: 'users',
      where: { email: { equals: `admin-${stamp}@example.test` } },
    })
  })

  it('a customer sees only their own record', async () => {
    const result = await payload.find({
      collection: 'customers',
      overrideAccess: false,
      user: asCustomer(customerA),
    })
    expect(result.docs.map((d) => d.id)).toEqual([customerA.id])
  })

  it('a customer cannot read another customer by id', async () => {
    await expect(
      payload.findByID({
        collection: 'customers',
        id: customerB.id,
        overrideAccess: false,
        user: asCustomer(customerA),
      }),
    ).rejects.toThrow()
  })

  it('admin-only fields are hidden from the customer', async () => {
    const own = await payload.findByID({
      collection: 'customers',
      id: customerA.id,
      overrideAccess: false,
      user: asCustomer(customerA),
    })
    expect(own.stripeCustomerId).toBeUndefined()
    expect(own.adminNotes).toBeUndefined()
    expect(own.suspended).toBeUndefined()
  })

  it('a customer cannot change admin-only fields', async () => {
    await payload.update({
      collection: 'customers',
      id: customerA.id,
      data: { suspended: true, stripeCustomerId: 'cus_forged' },
      overrideAccess: false,
      user: asCustomer(customerA),
    })
    const stored = await payload.findByID({ collection: 'customers', id: customerA.id })
    expect(stored.suspended).toBe(false)
    expect(stored.stripeCustomerId).toBe('cus_test_a')
  })

  it('a customer cannot read admin accounts', async () => {
    await expect(
      payload.find({ collection: 'users', overrideAccess: false, user: asCustomer(customerA) }),
    ).rejects.toThrow()
  })

  it('a visitor who is not logged in cannot list customers', async () => {
    await expect(payload.find({ collection: 'customers', overrideAccess: false })).rejects.toThrow()
  })

  it('the admin can read every customer and admin-only fields', async () => {
    const result = await payload.find({
      collection: 'customers',
      overrideAccess: false,
      user: asAdmin(admin),
      where: { email: { like: `-${stamp}@example.test` } },
    })
    expect(result.totalDocs).toBe(2)
    expect(result.docs.find((d) => d.id === customerA.id)?.stripeCustomerId).toBe('cus_test_a')
  })
})
