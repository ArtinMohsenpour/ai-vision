// @vitest-environment node
import { randomUUID } from 'node:crypto'
import { getPayload, type Payload } from 'payload'
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest'

import { createCheckout } from '@/lib/shop/checkout'
import { stripeGateway, type CheckoutSessionInput, type StripeGateway } from '@/lib/shop/stripe'
import config from '@/payload.config'
import type { Customer, Order, Service, ShopSetting } from '@/payload-types'

let payload: Payload
let customer: Customer
let other: Customer
let service: Service
let previousSettings: ShopSetting
const stamp = randomUUID().slice(0, 8)
const origin = 'http://localhost:3000'

function fakeStripe() {
  const sessions: { input: CheckoutSessionInput; key: string }[] = []
  const gateway: StripeGateway = {
    async ensureCustomer({ customerId, existing }) {
      return existing ?? `cus_test_${customerId}`
    },
    async createCheckoutSession(input, key) {
      sessions.push({ input, key })
      const id = `cs_test_${stamp}_${sessions.length}`
      return { id, url: `https://checkout.stripe.com/c/pay/${id}`, expiresAt: input.expiresAt }
    },
  }
  return { gateway, sessions }
}

const customerData = (label: string) => ({
  email: `shop-checkout-${label}-${stamp}@example.test`,
  password: `Shop checkout password ${stamp}!`,
  firstName: 'Test',
  lastName: `Customer ${label}`,
  businessConfirmedAt: new Date().toISOString(),
  _verified: true,
})

const extraIds = () => service.ordering!.extras!.map((extra) => extra.id!)

async function settings(data: Partial<ShopSetting>) {
  await payload.updateGlobal({ slug: 'shop-settings', data })
}

async function order(id: number) {
  return payload.findByID({ collection: 'orders', id, depth: 0 })
}

async function newOrderId() {
  const { docs } = await payload.find({
    collection: 'orders',
    where: { customer: { equals: customer.id } },
    sort: '-createdAt',
    limit: 1,
    depth: 0,
  })
  return docs[0]?.id
}

describe('checkout', () => {
  beforeAll(async () => {
    payload = await getPayload({ config: await config })
    previousSettings = await payload.findGlobal({ slug: 'shop-settings' })
    customer = await payload.create({ collection: 'customers', data: customerData('a') })
    other = await payload.create({ collection: 'customers', data: customerData('b') })
    service = await payload.create({
      collection: 'services',
      data: {
        slug: `shop-checkout-${stamp}`,
        sortOrder: 900,
        title: 'Website',
        summary: 'Checkout test service.',
        ordering: {
          mode: 'order',
          baseName: 'Simple website',
          basePrice: 20000,
          baseDays: 7,
          extras: [
            { title: 'CMS', price: 35000, days: 5 },
            { title: 'AI chatbot', price: 45000, days: 4 },
          ],
        },
        _status: 'published',
      },
    })
  })

  beforeEach(async () => {
    await settings({ orderingEnabled: true, vatRate: '19' })
  })

  afterAll(async () => {
    await payload.delete({
      collection: 'orders',
      where: { customer: { in: [customer.id, other.id] } },
    })
    await payload.delete({
      collection: 'customers',
      where: { id: { in: [customer.id, other.id] } },
    })
    await payload.delete({ collection: 'services', id: service.id })
    await settings({
      orderingEnabled: previousSettings.orderingEnabled,
      vatRate: previousSettings.vatRate,
    })
  })

  const start = (stripe: StripeGateway, ids: string[], termsAccepted = true) =>
    createCheckout(
      { payload, stripe },
      {
        customer,
        locale: 'en',
        origin,
        kind: 'new',
        slug: service.slug,
        extraIds: ids,
        termsAccepted,
      },
    )

  it('creates an order with a snapshot and opens a session at server prices', async () => {
    const { gateway, sessions } = fakeStripe()
    const result = await start(gateway, [extraIds()[0]])
    expect(result).toEqual({ url: expect.stringContaining('https://checkout.stripe.com/') })
    expect(sessions[0].input.lines.map((line) => line.amount)).toEqual([20000, 35000, 10450])
    expect(sessions[0].input).toMatchObject({
      kind: 'full',
      locale: 'en',
      stripeCustomerId: `cus_test_${customer.id}`,
    })
    const created = await order(sessions[0].input.orderId)
    expect(created).toMatchObject({
      status: 'awaiting_payment',
      paymentStatus: 'unpaid',
      locale: 'en',
    })
    expect(created.snapshot.total).toBe(65450)
    expect(created.snapshot.extras?.map((extra) => extra.title)).toEqual(['CMS'])
    expect(created.termsAcceptedAt).toBeTruthy()
    expect(created.payments?.[0]).toMatchObject({ kind: 'full', status: 'open', amount: 65450 })
    expect(sessions[0].input.successUrl).toBe(
      `${origin}/en/account/orders/${created.id}?checkout=return`,
    )
    expect(sessions[0].input.cancelUrl).toBe(
      `${origin}/en/services/${service.slug}/order?extras=${extraIds()[0]}`,
    )
    const stored = await payload.findByID({ collection: 'customers', id: customer.id })
    expect(stored.stripeCustomerId).toBe(`cus_test_${customer.id}`)
  })

  it('uses the current published price after an admin change', async () => {
    const [cms, chat] = service.ordering!.extras!
    await payload.update({
      collection: 'services',
      id: service.id,
      data: {
        ordering: { ...service.ordering!, extras: [{ ...cms, price: 39900 }, chat] },
        _status: 'published',
      },
    })
    try {
      const { gateway, sessions } = fakeStripe()
      await start(gateway, [cms.id!])
      expect(sessions[0].input.lines[1].amount).toBe(39900)
    } finally {
      await payload.update({
        collection: 'services',
        id: service.id,
        data: { ordering: service.ordering!, _status: 'published' },
      })
    }
  })

  it('refuses inactive or removed extras and closed services', async () => {
    const { gateway, sessions } = fakeStripe()
    expect(await start(gateway, ['not-an-extra'])).toEqual({ error: 'offerChanged' })
    const [cms, chat] = service.ordering!.extras!
    await payload.update({
      collection: 'services',
      id: service.id,
      data: {
        ordering: { ...service.ordering!, extras: [cms, { ...chat, active: false }] },
        _status: 'published',
      },
    })
    try {
      expect(await start(gateway, [chat.id!])).toEqual({ error: 'offerChanged' })
    } finally {
      await payload.update({
        collection: 'services',
        id: service.id,
        data: { ordering: service.ordering!, _status: 'published' },
      })
    }
    await settings({ orderingEnabled: false })
    expect(await start(gateway, [])).toEqual({ error: 'orderingClosed' })
    expect(sessions).toHaveLength(0)
  })

  it('reports a changed offer even when Stripe is not configured', async () => {
    const before = await newOrderId()
    const result = await createCheckout(
      { payload, stripe: null },
      {
        customer,
        locale: 'en',
        origin,
        kind: 'new',
        slug: service.slug,
        extraIds: ['gone'],
        termsAccepted: true,
      },
    )
    expect(result).toEqual({ error: 'offerChanged' })
    expect(
      await createCheckout(
        { payload, stripe: null },
        {
          customer,
          locale: 'en',
          origin,
          kind: 'new',
          slug: service.slug,
          extraIds: [],
          termsAccepted: true,
        },
      ),
    ).toEqual({ error: 'unavailable' })
    expect(await newOrderId()).toBe(before)
  })

  it('requires the terms checkbox and creates no order without it', async () => {
    const before = await newOrderId()
    const { gateway } = fakeStripe()
    expect(await start(gateway, [], false)).toEqual({ error: 'termsRequired' })
    expect(await newOrderId()).toBe(before)
  })

  it('charges only the deposit', async () => {
    await payload.update({
      collection: 'services',
      id: service.id,
      data: { ordering: { ...service.ordering!, depositPercent: 30 }, _status: 'published' },
    })
    try {
      const { gateway, sessions } = fakeStripe()
      await start(gateway, [extraIds()[0]])
      expect(sessions[0].input.kind).toBe('deposit')
      expect(sessions[0].input.lines.map((line) => line.amount)).toEqual([16500, 3135])
      const created = await order(sessions[0].input.orderId)
      expect(created.payments?.[0]).toMatchObject({ kind: 'deposit', amount: 19635 })
    } finally {
      await payload.update({
        collection: 'services',
        id: service.id,
        data: { ordering: service.ordering!, _status: 'published' },
      })
    }
  })

  it('charges a repeated extra once', async () => {
    const { gateway, sessions } = fakeStripe()
    const [cms] = extraIds()
    await start(gateway, [cms, cms])
    expect(sessions[0].input.lines.map((line) => line.amount)).toEqual([20000, 35000, 10450])
  })

  describe('balance', () => {
    async function depositOrder(owner: Customer, requested: boolean) {
      const created: Order = await payload.create({
        collection: 'orders',
        data: {
          customer: owner.id,
          locale: 'en',
          status: 'awaiting_payment',
          snapshot: {
            serviceTitle: 'Website',
            serviceSlug: service.slug,
            subtotal: 55000,
            vatRate: 19,
            vat: 10450,
            total: 65450,
            depositPercent: 30,
            depositNet: 16500,
          },
          payments: [
            {
              kind: 'deposit',
              status: 'paid',
              amount: 19635,
              refunded: 0,
              checkoutSessionId: `cs_test_dep_${stamp}`,
            },
          ],
        },
        overrideAccess: true,
        context: { shopSystem: true },
      })
      if (!requested) return created
      return payload.update({
        collection: 'orders',
        id: created.id,
        data: { balanceRequested: true },
      })
    }

    const pay = (stripe: StripeGateway, orderId: number, owner = customer) =>
      createCheckout(
        { payload, stripe },
        { customer: owner, locale: 'en', origin, kind: 'balance', orderId },
      )

    it("needs a requested balance on the customer's own order", async () => {
      const { gateway, sessions } = fakeStripe()
      const notRequested = await depositOrder(customer, false)
      expect(await pay(gateway, notRequested.id)).toEqual({ error: 'nothingDue' })
      const requested = await depositOrder(customer, true)
      expect(await pay(gateway, requested.id, other)).toEqual({ error: 'notFound' })
      expect(await pay(gateway, 99_999_999)).toEqual({ error: 'notFound' })
      expect(await pay(gateway, requested.id)).toEqual({ url: expect.any(String) })
      expect(sessions).toHaveLength(1)
      expect(sessions[0].input.kind).toBe('balance')
      expect(sessions[0].input.lines).toEqual([
        { name: `Remaining balance · ${requested.number}`, amount: 65450 - 19635 },
      ])
    })

    it('reuses an open balance session and uses a new key after it expires', async () => {
      const { gateway, sessions } = fakeStripe()
      const requested = await depositOrder(customer, true)
      const first = await pay(gateway, requested.id)
      expect(await pay(gateway, requested.id)).toEqual(first)
      expect(sessions).toHaveLength(1)
      const current = await order(requested.id)
      await payload.update({
        collection: 'orders',
        id: requested.id,
        data: {
          payments: current.payments!.map((payment) =>
            payment.kind === 'balance' ? { ...payment, status: 'expired' } : payment,
          ),
        },
        overrideAccess: true,
        context: { shopSystem: true },
      })
      await pay(gateway, requested.id)
      expect(sessions).toHaveLength(2)
      expect(sessions[1].key).not.toBe(sessions[0].key)
    })
  })

  it('refuses live keys', () => {
    const previous = process.env.STRIPE_SECRET_KEY
    try {
      process.env.STRIPE_SECRET_KEY = 'sk_live_not_allowed'
      expect(stripeGateway()).toBeNull()
      delete process.env.STRIPE_SECRET_KEY
      expect(stripeGateway()).toBeNull()
      process.env.STRIPE_SECRET_KEY = 'sk_test_example'
      expect(stripeGateway()).not.toBeNull()
    } finally {
      if (previous === undefined) delete process.env.STRIPE_SECRET_KEY
      else process.env.STRIPE_SECRET_KEY = previous
    }
  })
})
