// @vitest-environment node
import { randomUUID } from 'node:crypto'
import { mkdtemp, readFile, readdir, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { getPayload, type Payload } from 'payload'
import Stripe from 'stripe'
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest'

import { POST } from '@/app/(frontend)/api/stripe/webhook/route'
import config from '@/payload.config'
import type { Customer, Order, ShopSetting } from '@/payload-types'

let payload: Payload
let customer: Customer
let previousSettings: ShopSetting
let outbox: string
const stamp = randomUUID().slice(0, 8)
const secret = `whsec_test_${stamp}`
const ownerEmail = `owner-${stamp}@example.test`
const previousEnv = {
  secret: process.env.STRIPE_WEBHOOK_SECRET,
  mailDir: process.env.RHEINO_LOCAL_MAIL_DIR,
}

type Mail = { to: string; subject: string; html: string }
async function mails(to: string): Promise<Mail[]> {
  const files = await readdir(outbox).catch(() => [] as string[])
  const all = await Promise.all(
    files.map(async (file) => JSON.parse(await readFile(join(outbox, file), 'utf8')) as Mail),
  )
  return all.filter((mail) => mail.to === to)
}

let sequence = 0
const nextId = (prefix: string) => `${prefix}_${stamp}_${++sequence}`

async function createOrder(kind: 'full' | 'deposit', total = 65450, amount = total) {
  const sessionId = nextId('cs_test')
  const order: Order = await payload.create({
    collection: 'orders',
    data: {
      customer: customer.id,
      locale: 'en',
      status: 'awaiting_payment',
      snapshot: {
        serviceTitle: 'Website',
        baseName: 'Simple website',
        basePrice: 20000,
        extras: [{ extraId: 'cms', title: 'CMS', price: 35000, days: 5 }],
        subtotal: 55000,
        vatRate: 19,
        vat: 10450,
        total,
        depositPercent: kind === 'deposit' ? 30 : 0,
        depositNet: kind === 'deposit' ? 16500 : 0,
        deliveryDays: 12,
      },
      payments: [{ kind, status: 'open', amount, refunded: 0, checkoutSessionId: sessionId }],
    },
    overrideAccess: true,
    context: { shopSystem: true },
  })
  return { order, sessionId }
}

function sessionEvent(
  type: string,
  order: Order,
  sessionId: string,
  overrides: Record<string, unknown> = {},
) {
  return {
    id: nextId('evt_test'),
    object: 'event',
    type,
    livemode: false,
    created: Math.floor(Date.now() / 1000),
    data: {
      object: {
        id: sessionId,
        object: 'checkout.session',
        payment_status: 'paid',
        amount_total: order.payments?.find((p) => p.checkoutSessionId === sessionId)?.amount,
        payment_intent: `pi_${sessionId}`,
        metadata: { orderId: String(order.id) },
        customer_details: {
          name: 'Ada Muster',
          business_name: 'Muster GmbH',
          address: {
            line1: 'Rheinufer 1',
            line2: null,
            postal_code: '50667',
            city: 'Köln',
            country: 'DE',
          },
          tax_ids: [{ type: 'eu_vat', value: 'DE123456789' }],
        },
        ...overrides,
      },
    },
  }
}

async function deliver(event: object, signature?: string) {
  const body = JSON.stringify(event)
  const header = signature ?? Stripe.webhooks.generateTestHeaderString({ payload: body, secret })
  return POST(
    new Request('http://localhost/api/stripe/webhook', {
      method: 'POST',
      body,
      headers: { 'content-type': 'application/json', 'stripe-signature': header },
    }),
  )
}

const reload = (id: number) => payload.findByID({ collection: 'orders', id, depth: 0 })

describe('Stripe webhook', () => {
  beforeAll(async () => {
    outbox = await mkdtemp(join(tmpdir(), 'rheino-shop-mail-'))
    process.env.RHEINO_LOCAL_MAIL_DIR = outbox
    process.env.STRIPE_WEBHOOK_SECRET = secret
    payload = await getPayload({ config: await config })
    previousSettings = await payload.findGlobal({ slug: 'shop-settings' })
    await payload.updateGlobal({
      slug: 'shop-settings',
      data: { orderNotificationEmail: ownerEmail },
    })
    customer = await payload.create({
      collection: 'customers',
      data: {
        email: `shop-webhook-${stamp}@example.test`,
        password: `Shop webhook password ${stamp}!`,
        firstName: 'Ada',
        lastName: 'Muster',
        businessConfirmedAt: new Date().toISOString(),
        _verified: true,
      },
    })
  })

  afterAll(async () => {
    await payload.delete({ collection: 'orders', where: { customer: { equals: customer.id } } })
    await payload.delete({ collection: 'customers', id: customer.id })
    await payload.delete({ collection: 'stripe-events', where: { eventId: { like: stamp } } })
    await payload.updateGlobal({
      slug: 'shop-settings',
      data: { orderNotificationEmail: previousSettings.orderNotificationEmail ?? null },
    })
    await rm(outbox, { recursive: true, force: true })
    if (previousEnv.secret === undefined) delete process.env.STRIPE_WEBHOOK_SECRET
    else process.env.STRIPE_WEBHOOK_SECRET = previousEnv.secret
    if (previousEnv.mailDir === undefined) delete process.env.RHEINO_LOCAL_MAIL_DIR
    else process.env.RHEINO_LOCAL_MAIL_DIR = previousEnv.mailDir
  })

  it('rejects a bad signature with 400 and changes nothing', async () => {
    const { order, sessionId } = await createOrder('full')
    const response = await deliver(
      sessionEvent('checkout.session.completed', order, sessionId),
      't=1,v1=not-a-signature',
    )
    expect(response.status).toBe(400)
    expect((await reload(order.id)).paymentStatus).toBe('unpaid')
  })

  it('rejects live-mode events', async () => {
    const { order, sessionId } = await createOrder('full')
    const event = {
      ...sessionEvent('checkout.session.completed', order, sessionId),
      livemode: true,
    }
    expect((await deliver(event)).status).toBe(400)
    expect((await reload(order.id)).paymentStatus).toBe('unpaid')
  })

  it('marks a paid order, copies billing details and sends both emails', async () => {
    const { order, sessionId } = await createOrder('full')
    const response = await deliver(sessionEvent('checkout.session.completed', order, sessionId))
    expect(response.status).toBe(200)
    const paid = await reload(order.id)
    expect(paid).toMatchObject({
      paymentStatus: 'paid',
      status: 'new',
      amountPaid: 65450,
      balanceDue: 0,
    })
    expect(paid.payments?.[0]).toMatchObject({ status: 'paid', paymentIntentId: `pi_${sessionId}` })
    expect(paid.billing).toMatchObject({
      name: 'Ada Muster',
      company: 'Muster GmbH',
      city: 'Köln',
      vatId: 'DE123456789',
    })
    const customerMails = (await mails(customer.email)).filter((mail) =>
      mail.subject.includes(paid.number!),
    )
    expect(customerMails).toHaveLength(1)
    expect(customerMails[0].subject).toContain('Payment received')
    expect(customerMails[0].html).toContain(`/en/account/orders/${order.id}`)
    expect((await mails(ownerEmail)).some((mail) => mail.subject.includes(paid.number!))).toBe(true)
  })

  it('processes the same event once, even when delivered twice at the same time', async () => {
    const { order, sessionId } = await createOrder('full')
    const event = sessionEvent('checkout.session.completed', order, sessionId)
    const responses = await Promise.all([deliver(event), deliver(event)])
    expect(responses.map((response) => response.status)).toEqual([200, 200])
    const paid = await reload(order.id)
    expect(paid.payments?.filter((payment) => payment.status === 'paid')).toHaveLength(1)
    expect(paid.amountPaid).toBe(65450)
    const { totalDocs } = await payload.count({
      collection: 'stripe-events',
      where: { eventId: { equals: event.id } },
    })
    expect(totalDocs).toBe(1)
    expect(
      (await mails(customer.email)).filter((mail) => mail.subject.includes(paid.number!)),
    ).toHaveLength(1)
  })

  it('records a deposit, sends the balance request once, then settles the balance', async () => {
    const { order, sessionId } = await createOrder('deposit', 65450, 19635)
    await deliver(sessionEvent('checkout.session.completed', order, sessionId))
    const deposit = await reload(order.id)
    expect(deposit).toMatchObject({ paymentStatus: 'deposit_paid', balanceDue: 65450 - 19635 })

    await payload.update({ collection: 'orders', id: order.id, data: { balanceRequested: true } })
    await payload.update({
      collection: 'orders',
      id: order.id,
      data: { adminNotes: 'Called the customer.' },
    })
    const requestMails = (await mails(customer.email)).filter((mail) =>
      mail.subject.includes('Remaining balance due'),
    )
    expect(requestMails.filter((mail) => mail.subject.includes(deposit.number!))).toHaveLength(1)

    const balanceSession = nextId('cs_test')
    await payload.update({
      collection: 'orders',
      id: order.id,
      data: {
        payments: [
          ...(deposit.payments ?? []),
          {
            kind: 'balance',
            status: 'open',
            amount: 45815,
            refunded: 0,
            checkoutSessionId: balanceSession,
          },
        ],
      },
      overrideAccess: true,
      context: { shopSystem: true },
    })
    await deliver(
      sessionEvent('checkout.session.completed', await reload(order.id), balanceSession),
    )
    expect(await reload(order.id)).toMatchObject({ paymentStatus: 'paid', balanceDue: 0 })
  })

  it('waits for a pending bank payment, then marks it paid', async () => {
    const { order, sessionId } = await createOrder('full')
    await deliver(
      sessionEvent('checkout.session.completed', order, sessionId, { payment_status: 'unpaid' }),
    )
    const pending = await reload(order.id)
    expect(pending.payments?.[0].status).toBe('pending')
    expect(pending.paymentStatus).toBe('unpaid')
    await deliver(sessionEvent('checkout.session.async_payment_succeeded', order, sessionId))
    expect((await reload(order.id)).paymentStatus).toBe('paid')
  })

  it('cancels an unpaid order when its session expires', async () => {
    const { order, sessionId } = await createOrder('full')
    await deliver(
      sessionEvent('checkout.session.expired', order, sessionId, { payment_status: 'unpaid' }),
    )
    const expired = await reload(order.id)
    expect(expired.payments?.[0].status).toBe('expired')
    expect(expired.status).toBe('cancelled')
  })

  it('marks a partial refund', async () => {
    const { order, sessionId } = await createOrder('full')
    await deliver(sessionEvent('checkout.session.completed', order, sessionId))
    const refund = {
      id: nextId('evt_test'),
      object: 'event',
      type: 'charge.refunded',
      livemode: false,
      created: Math.floor(Date.now() / 1000),
      data: {
        object: {
          id: nextId('ch_test'),
          object: 'charge',
          payment_intent: `pi_${sessionId}`,
          amount_refunded: 10000,
        },
      },
    }
    expect((await deliver(refund)).status).toBe(200)
    expect(await reload(order.id)).toMatchObject({
      paymentStatus: 'partially_refunded',
      amountRefunded: 10000,
    })
  })

  it('answers 500 and records nothing when the database fails, so Stripe retries', async () => {
    const { order, sessionId } = await createOrder('full')
    const event = sessionEvent('checkout.session.completed', order, sessionId)
    const spy = vi
      .spyOn(payload, 'findByID')
      .mockRejectedValueOnce(new Error('database unavailable'))
    try {
      expect((await deliver(event)).status).toBe(500)
    } finally {
      spy.mockRestore()
    }
    const { totalDocs } = await payload.count({
      collection: 'stripe-events',
      where: { eventId: { equals: event.id } },
    })
    expect(totalDocs).toBe(0)
    expect((await reload(order.id)).paymentStatus).toBe('unpaid')
    // Stripe's retry then succeeds.
    expect((await deliver(event)).status).toBe(200)
    expect((await reload(order.id)).paymentStatus).toBe('paid')
  })

  it('ignores an event whose session does not belong to the order', async () => {
    const { order } = await createOrder('full')
    const response = await deliver(
      sessionEvent('checkout.session.completed', order, 'cs_test_someone_else'),
    )
    expect(response.status).toBe(200)
    expect((await reload(order.id)).paymentStatus).toBe('unpaid')
  })
})
