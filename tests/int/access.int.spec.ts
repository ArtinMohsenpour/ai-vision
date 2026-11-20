// @vitest-environment node
import { sql } from '@payloadcms/db-postgres'
import { getPayload, type Payload } from 'payload'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'

import config from '@/payload.config'
import { allowAuthRequest } from '@/lib/customer-auth/rate-limit'
import { hasCustomerSessionGrant, issuedSessionId } from '@/lib/customer-auth/session-grants'
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
  lastName: 'Customer',
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
      data: {
        email: `admin-${stamp}@example.test`,
        password: `admin-password-${stamp}`,
        firstName: 'Test',
        lastName: 'Admin',
      },
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

  it('rejects customer creation outside the website registration flow', async () => {
    await expect(
      payload.create({
        collection: 'customers',
        data: customerData('untrusted'),
        overrideAccess: false,
        disableVerificationEmail: true,
      }),
    ).rejects.toThrow()
  })

  it('caps concurrent recovery requests for one email in the database', async () => {
    const requests = await Promise.all(
      Array.from({ length: 6 }, () =>
        allowAuthRequest(payload, 'forgot-password', new Headers(), `limit-${stamp}@example.test`),
      ),
    )
    expect(requests.filter(Boolean)).toHaveLength(4)
  })

  it('does not let one blocked client use up the site-wide login limit', async () => {
    const previous = process.env.CUSTOMER_AUTH_IP_HEADER
    process.env.CUSTOMER_AUTH_IP_HEADER = 'x-test-client-ip'
    const from = (ip: string) => new Headers({ 'x-test-client-ip': ip })
    const attacker = `2001:db8:a::${(stamp % 0xffff).toString(16)}`
    const customer = `2001:db8:b::${(stamp % 0xffff).toString(16)}`
    try {
      const attempts: boolean[] = []
      for (let i = 0; i < 160; i++)
        attempts.push(await allowAuthRequest(payload, 'login', from(attacker)))
      expect(attempts.filter(Boolean).length).toBeLessThanOrEqual(15)
      expect(await allowAuthRequest(payload, 'login', from(customer))).toBe(true)
    } finally {
      if (previous === undefined) delete process.env.CUSTOMER_AUTH_IP_HEADER
      else process.env.CUSTOMER_AUTH_IP_HEADER = previous
    }
  })

  it('revokes a suspended customer session and rejects subsequent login', async () => {
    const data = customerData('b')
    const credentials = { email: data.email, password: data.password }
    const { token } = await payload.login({ collection: 'customers', data: credentials })
    expect(token).toBeTruthy()
    await payload.update({
      collection: 'customers',
      id: customerB.id,
      data: { suspended: true },
      user: asAdmin(admin),
      overrideAccess: false,
    })
    await expect(payload.login({ collection: 'customers', data: credentials })).rejects.toThrow()
    await payload.update({
      collection: 'customers',
      id: customerB.id,
      data: { suspended: false },
      user: asAdmin(admin),
      overrideAccess: false,
    })
    const { user } = await payload.auth({
      headers: new Headers({ Authorization: `Bearer ${token}` }),
    })
    expect(user).toBeNull()
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

  it('allows an admin to change a customer password and revokes credentials from before the change', async () => {
    const original = customerData('a')
    const { token } = await payload.login({
      collection: 'customers',
      data: { email: original.email, password: original.password },
      context: { customerWebsiteLogin: true },
    })
    const sid = issuedSessionId(token!)
    expect(await hasCustomerSessionGrant(payload.db.drizzle, customerA.id, sid)).toBe(true)
    await expect(
      payload.forgotPassword({
        collection: 'customers',
        data: { email: original.email },
        disableEmail: true,
      }),
    ).resolves.toBeTruthy()

    const password = `Updated customer test passphrase ${stamp}!`
    await payload.update({
      collection: 'customers',
      id: customerA.id,
      data: { firstName: 'Updated', password },
      user: asAdmin(admin),
      overrideAccess: false,
    })
    expect(await hasCustomerSessionGrant(payload.db.drizzle, customerA.id, sid)).toBe(false)
    const { rows } = await payload.db.drizzle.execute(sql`
      SELECT 1 FROM customers WHERE id = ${customerA.id}
        AND reset_password_token IS NULL AND reset_password_expiration IS NULL
    `)
    expect(rows).toHaveLength(1)
    await expect(
      payload.login({
        collection: 'customers',
        data: { email: original.email, password: original.password },
      }),
    ).rejects.toThrow()
    const login = await payload.login({
      collection: 'customers',
      data: { email: original.email, password },
    })
    expect(login.user?.firstName).toBe('Updated')
  })
})
