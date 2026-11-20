// @vitest-environment node
import { randomUUID } from 'node:crypto'
import { getPayload, type Payload } from 'payload'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'

import config from '@/payload.config'
import type { Customer, Order, User } from '@/payload-types'

let payload: Payload
let customerA: Customer
let customerB: Customer
let admin: User
const stamp = randomUUID().slice(0, 8)
const orders: number[] = []

const asCustomer = (customer: Customer) => ({ ...customer, collection: 'customers' as const })
const asAdmin = (user: User) => ({ ...user, collection: 'users' as const })
const system = { overrideAccess: true, context: { shopSystem: true } } as const

const snapshot = {
  serviceId: 1,
  serviceSlug: 'websites',
  serviceTitle: 'Website',
  baseName: 'Simple website',
  basePrice: 1000,
  baseDays: 7,
  extras: [],
  subtotal: 1000,
  vatRate: 0,
  vat: 0,
  total: 1000,
  depositPercent: 30,
  depositNet: 300,
  deliveryDays: 7,
}

async function createOrder(customer: Customer, payments: Order['payments'] = []) {
  const order = await payload.create({
    collection: 'orders',
    data: { customer: customer.id, locale: 'de', snapshot, status: 'awaiting_payment', payments },
    ...system,
  })
  orders.push(order.id)
  return order
}

const customerData = (label: string) => ({
  email: `shop-orders-${label}-${stamp}@example.test`,
  password: `Shop orders password ${stamp}!`,
  firstName: 'Test',
  lastName: 'Customer',
  businessConfirmedAt: new Date().toISOString(),
  _verified: true,
})

describe('orders', () => {
  beforeAll(async () => {
    payload = await getPayload({ config: await config })
    customerA = await payload.create({ collection: 'customers', data: customerData('a') })
    customerB = await payload.create({ collection: 'customers', data: customerData('b') })
    admin = await payload.create({
      collection: 'users',
      data: {
        email: `shop-orders-admin-${stamp}@example.test`,
        password: `Shop orders admin ${stamp}!`,
        firstName: 'Shop',
        lastName: 'Admin',
      },
    })
  })

  afterAll(async () => {
    if (orders.length) await payload.delete({ collection: 'orders', where: { id: { in: orders } } })
    await payload.delete({
      collection: 'customers',
      where: { id: { in: [customerA.id, customerB.id] } },
    })
    await payload.delete({ collection: 'users', id: admin.id })
  })

  it('assigns R-<year>-<0000> order numbers', async () => {
    const order = await createOrder(customerA)
    const year = new Date(order.createdAt).getFullYear()
    expect(order.number).toBe(`R-${year}-${String(order.id).padStart(4, '0')}`)
    const stored = await payload.findByID({ collection: 'orders', id: order.id })
    expect(stored.number).toBe(order.number)
  })

  it('a customer reads only their own orders', async () => {
    const own = await createOrder(customerA)
    const asA = await payload.find({
      collection: 'orders',
      user: asCustomer(customerA),
      overrideAccess: false,
    })
    expect(asA.docs.map((order) => order.id)).toContain(own.id)
    const asB = await payload.find({
      collection: 'orders',
      user: asCustomer(customerB),
      overrideAccess: false,
    })
    expect(asB.docs.map((order) => order.id)).not.toContain(own.id)
    await expect(
      payload.findByID({
        collection: 'orders',
        id: own.id,
        user: asCustomer(customerB),
        overrideAccess: false,
      }),
    ).rejects.toThrow()
  })

  it("customers cannot read the version history of anyone's orders", async () => {
    await createOrder(customerB)
    await expect(
      payload.findVersions({
        collection: 'orders',
        user: asCustomer(customerA),
        overrideAccess: false,
      }),
    ).rejects.toThrow()
    const adminView = await payload.findVersions({
      collection: 'orders',
      user: asAdmin(admin),
      overrideAccess: false,
      limit: 1,
    })
    expect(adminView.totalDocs).toBeGreaterThan(0)
  })

  it('customers cannot create, update or delete orders', async () => {
    const order = await createOrder(customerA)
    const user = asCustomer(customerA)
    await expect(
      payload.create({
        collection: 'orders',
        data: { customer: customerA.id, snapshot, status: 'new' },
        user,
        overrideAccess: false,
      }),
    ).rejects.toThrow()
    await expect(
      payload.update({
        collection: 'orders',
        id: order.id,
        data: { status: 'completed' },
        user,
        overrideAccess: false,
      }),
    ).rejects.toThrow()
    await expect(
      payload.delete({ collection: 'orders', id: order.id, user, overrideAccess: false }),
    ).rejects.toThrow()
  })

  it('the admin cannot rewrite the snapshot or payments', async () => {
    const order = await createOrder(customerA)
    const updated = await payload.update({
      collection: 'orders',
      id: order.id,
      data: {
        snapshot: { ...snapshot, total: 1 },
        payments: [{ kind: 'full', status: 'paid', amount: 1, refunded: 0 }],
        paymentStatus: 'paid',
        status: 'in_progress',
      },
      user: asAdmin(admin),
      overrideAccess: false,
    })
    expect(updated.snapshot.total).toBe(1000)
    expect(updated.payments ?? []).toHaveLength(0)
    expect(updated.paymentStatus).toBe('unpaid')
    expect(updated.status).toBe('in_progress')
  })

  it('a paid deposit opens the order and manual payments settle the balance', async () => {
    const order = await createOrder(customerA, [
      { kind: 'deposit', status: 'paid', amount: 300, refunded: 0, checkoutSessionId: 'cs_test_a' },
    ])
    expect(order).toMatchObject({
      paymentStatus: 'deposit_paid',
      status: 'new',
      amountPaid: 300,
      balanceDue: 700,
    })
    const requested = await payload.update({
      collection: 'orders',
      id: order.id,
      data: { balanceRequested: true },
      user: asAdmin(admin),
      overrideAccess: false,
    })
    expect(requested.balanceRequestedAt).toBeTruthy()
    const settled = await payload.update({
      collection: 'orders',
      id: order.id,
      data: {
        manualPayments: [{ amount: 700, method: 'bank_transfer', date: new Date().toISOString() }],
      },
      user: asAdmin(admin),
      overrideAccess: false,
    })
    expect(settled).toMatchObject({ paymentStatus: 'paid', balanceDue: 0, amountPaid: 1000 })
  })

  it('a customer with orders cannot be deleted', async () => {
    const customer = await payload.create({ collection: 'customers', data: customerData('c') })
    const order = await payload.create({
      collection: 'orders',
      data: { customer: customer.id, locale: 'en', snapshot, status: 'awaiting_payment' },
      ...system,
    })
    await expect(payload.delete({ collection: 'customers', id: customer.id })).rejects.toThrow(
      /cannot be deleted/,
    )
    await payload.delete({ collection: 'orders', id: order.id })
    await payload.delete({ collection: 'customers', id: customer.id })
    await expect(payload.findByID({ collection: 'customers', id: customer.id })).rejects.toThrow()
  })

  it('stripe event IDs are unique', async () => {
    const eventId = `evt_test_${stamp}`
    const event = await payload.create({
      collection: 'stripe-events',
      data: { eventId, type: 'checkout.session.completed', processedAt: new Date().toISOString() },
    })
    try {
      await expect(
        payload.create({
          collection: 'stripe-events',
          data: {
            eventId,
            type: 'checkout.session.completed',
            processedAt: new Date().toISOString(),
          },
        }),
      ).rejects.toThrow()
    } finally {
      await payload.delete({ collection: 'stripe-events', id: event.id })
    }
  })
})
