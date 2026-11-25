import { randomUUID } from 'node:crypto'
import { expect, test, type Page } from '@playwright/test'
import type { Payload } from 'payload'

import type { Customer, Order } from '../../src/payload-types.js'
import { getLocalTestPayload } from '../helpers/seedUser'

const system = { overrideAccess: true, context: { shopSystem: true } } as const
const snapshot = {
  serviceTitle: 'Website',
  serviceSlug: 'websites',
  baseName: 'Simple website',
  basePrice: 20000,
  baseDays: 7,
  extras: [{ extraId: 'cms', title: 'CMS', price: 35000, days: 5 }],
  subtotal: 55000,
  vatRate: 19,
  vat: 10450,
  total: 65450,
  depositPercent: 0,
  depositNet: 0,
  deliveryDays: 12,
}

async function seedCustomer(payload: Payload) {
  const password = `Account orders test ${randomUUID()}!`
  const customer = await payload.create({
    collection: 'customers',
    data: {
      email: `e2e-orders-${randomUUID()}@example.test`,
      password,
      firstName: 'Order',
      lastName: 'Tester',
      businessConfirmedAt: new Date().toISOString(),
      _verified: true,
    },
    disableVerificationEmail: true,
  })
  return { customer, password }
}

async function seedOrder(payload: Payload, customer: Customer, data: Partial<Order>) {
  return payload.create({
    collection: 'orders',
    data: { customer: customer.id, locale: 'en', status: 'awaiting_payment', snapshot, ...data },
    ...system,
  })
}

const payment = (
  status: 'open' | 'paid' | 'expired',
  amount = 65450,
  kind: 'full' | 'deposit' = 'full',
) => ({
  kind,
  status,
  amount,
  refunded: 0,
  checkoutSessionId: `cs_test_${randomUUID()}`,
  checkoutUrl: 'https://checkout.stripe.com/c/pay/cs_test_example',
  expiresAt: new Date(Date.now() + (status === 'expired' ? -1 : 1) * 3_600_000).toISOString(),
})

async function signIn(page: Page, email: string, password: string) {
  await page.goto('/en/login')
  await page.getByLabel('Email address').fill(email)
  await page.getByLabel('Password', { exact: true }).fill(password)
  await page.getByRole('button', { name: 'Sign in', exact: true }).click()
  await expect(page).toHaveURL(/\/en\/account$/)
}

test.describe('Account orders', () => {
  test.describe.configure({ mode: 'serial' })
  let payload: Payload
  const customers: number[] = []

  test.beforeAll(async () => {
    payload = await getLocalTestPayload()
  })

  test.afterAll(async () => {
    if (customers.length) {
      await payload.delete({ collection: 'orders', where: { customer: { in: customers } } })
      await payload.delete({ collection: 'customers', where: { id: { in: customers } } })
    }
    await payload.destroy()
  })

  test('lists paid and open orders, hides expired ones, and keeps other customers out', async ({
    page,
  }) => {
    const { customer, password } = await seedCustomer(payload)
    const { customer: other } = await seedCustomer(payload)
    customers.push(customer.id, other.id)
    const paid = await seedOrder(payload, customer, { payments: [payment('paid')] })
    const open = await seedOrder(payload, customer, { payments: [payment('open')] })
    const expired = await seedOrder(payload, customer, {
      payments: [payment('expired')],
      status: 'cancelled',
    })
    const foreign = await seedOrder(payload, other, { payments: [payment('paid')] })

    await signIn(page, customer.email, password)
    await page.getByRole('link', { name: 'Orders' }).click()
    await expect(page).toHaveURL(/\/en\/account\/orders$/)
    await expect(page.getByRole('link', { name: 'Orders' })).toHaveAttribute('aria-current', 'page')
    await expect(page.getByText(paid.number!)).toBeVisible()
    await expect(page.getByText(open.number!)).toBeVisible()
    await expect(page.getByText(expired.number!)).toHaveCount(0)
    await expect(page.getByRole('link', { name: 'Continue payment' })).toHaveAttribute(
      'href',
      'https://checkout.stripe.com/c/pay/cs_test_example',
    )

    await page.getByRole('link', { name: `View order ${paid.number}` }).click()
    await expect(page.getByRole('heading', { name: `Order ${paid.number}` })).toBeVisible()
    await expect(page.getByText('€654.50').first()).toBeVisible()

    const response = await page.goto(`/en/account/orders/${foreign.id}`)
    expect(response?.status()).toBe(404)
  })

  test('the return page waits for Stripe to confirm the payment', async ({ page }) => {
    const { customer, password } = await seedCustomer(payload)
    customers.push(customer.id)
    const order = await seedOrder(payload, customer, { payments: [payment('open')] })
    await signIn(page, customer.email, password)
    await page.goto(`/en/account/orders/${order.id}?checkout=return`)
    await expect(page.getByText("We're confirming your payment with Stripe")).toBeVisible()

    const current = await payload.findByID({ collection: 'orders', id: order.id, depth: 0 })
    await payload.update({
      collection: 'orders',
      id: order.id,
      data: { payments: current.payments!.map((entry) => ({ ...entry, status: 'paid' as const })) },
      ...system,
    })
    await expect(page.getByText('Payment received')).toBeVisible({ timeout: 15_000 })
  })

  test('shows the balance button only after the balance is requested', async ({ page }) => {
    const { customer, password } = await seedCustomer(payload)
    customers.push(customer.id)
    const order = await seedOrder(payload, customer, {
      snapshot: { ...snapshot, depositPercent: 30, depositNet: 16500 },
      payments: [payment('paid', 19635, 'deposit')],
    })
    await signIn(page, customer.email, password)
    await page.goto(`/en/account/orders/${order.id}`)
    await expect(page.getByText('Deposit paid').first()).toBeVisible()
    await expect(page.getByRole('button', { name: /Pay remaining/ })).toHaveCount(0)

    await payload.update({ collection: 'orders', id: order.id, data: { balanceRequested: true } })
    await page.reload()
    await expect(page.getByRole('button', { name: 'Pay remaining €458.15' })).toBeVisible()
  })

  test('after a balance payment the return page still waits for Stripe', async ({ page }) => {
    const { customer, password } = await seedCustomer(payload)
    customers.push(customer.id)
    const order = await seedOrder(payload, customer, {
      snapshot: { ...snapshot, depositPercent: 30, depositNet: 16500 },
      payments: [payment('paid', 19635, 'deposit')],
    })
    await payload.update({ collection: 'orders', id: order.id, data: { balanceRequested: true } })
    const deposit = await payload.findByID({ collection: 'orders', id: order.id, depth: 0 })
    await payload.update({
      collection: 'orders',
      id: order.id,
      data: {
        payments: [...deposit.payments!, { ...payment('open', 45815), kind: 'balance' as const }],
      },
      ...system,
    })
    await signIn(page, customer.email, password)
    await page.goto(`/en/account/orders/${order.id}?checkout=return`)
    await expect(page.getByText("We're confirming your payment with Stripe")).toBeVisible()
    await expect(page.getByText('Payment received')).toHaveCount(0)

    const open = await payload.findByID({ collection: 'orders', id: order.id, depth: 0 })
    await payload.update({
      collection: 'orders',
      id: order.id,
      data: {
        payments: open.payments!.map((entry) =>
          entry.kind === 'balance' ? { ...entry, status: 'paid' as const } : entry,
        ),
      },
      ...system,
    })
    await expect(page.getByText('Payment received')).toBeVisible({ timeout: 15_000 })
    await expect(page.getByRole('button', { name: /Pay remaining/ })).toHaveCount(0)
  })
})
