import { randomUUID } from 'node:crypto'
import { expect, test } from '@playwright/test'

import { login } from '../helpers/login'
import { getLocalTestPayload, seedTestUser } from '../helpers/seedUser'

test('allows the signed-in admin to edit accounts, change passwords, and delete records', async ({
  page,
  baseURL,
  request,
}) => {
  test.setTimeout(60_000)
  page.setDefaultTimeout(10_000)
  const payload = await getLocalTestPayload()
  const admins: number[] = []
  const customers: number[] = []

  async function save(
    collection: 'users' | 'customers',
    id: number,
    firstName: string,
    password: string,
  ) {
    await page.locator('#field-firstName').fill(firstName)
    await page.getByRole('button', { name: 'Change Password', exact: true }).click()
    await page.locator('#field-password').pressSequentially(password, { delay: 12 })
    const recordPath = new URL(page.url()).pathname
    const formState = page.waitForResponse(
      (res) => res.request().method() === 'POST' && new URL(res.url()).pathname === recordPath,
    )
    const confirmation = page.locator('#field-confirm-password')
    await confirmation.pressSequentially(password, { delay: 12 })
    await confirmation.blur()
    await (await formState).finished()
    const response = page.waitForResponse(
      (res) =>
        res.request().method() === 'PATCH' &&
        new URL(res.url()).pathname === `/api/${collection}/${id}`,
    )
    await page.getByRole('button', { name: 'Save', exact: true }).click()
    expect((await response).status()).toBe(200)
  }

  async function remove(collection: 'users' | 'customers', id: number) {
    await page.locator('.doc-controls__popup .popup__trigger-wrap button').click()
    await page.locator('#action-delete').click()
    const response = page.waitForResponse(
      (res) =>
        res.request().method() === 'DELETE' &&
        new URL(res.url()).pathname === `/api/${collection}/${id}`,
    )
    await page.locator('#confirm-action').click()
    expect((await response).status()).toBe(200)
    await expect(page).toHaveURL((url) => url.pathname === `/admin/collections/${collection}`)
  }

  try {
    const owner = await seedTestUser(payload)
    admins.push(owner.id)
    const otherAdmin = await seedTestUser(payload)
    admins.push(otherAdmin.id)

    const suffix = randomUUID()
    const customer = await payload.create({
      collection: 'customers',
      data: {
        email: `cms-customer-${suffix}@example.test`,
        password: `Temporary customer test password ${suffix}!`,
        firstName: 'Test',
        lastName: 'Customer',
        businessConfirmedAt: new Date().toISOString(),
        _verified: true,
      },
      disableVerificationEmail: true,
    })
    customers.push(customer.id)

    await login({ page, user: owner, serverURL: baseURL })
    await page.goto('/admin/account')
    const ownerPassword = `Updated owner test passphrase ${suffix}!`
    await save('users', owner.id, 'Updated', ownerPassword)
    expect((await payload.findByID({ collection: 'users', id: owner.id })).firstName).toBe(
      'Updated',
    )
    const adminLogin = await request.post('/api/users/login', {
      data: { email: owner.email, password: ownerPassword },
    })
    expect(adminLogin.ok()).toBe(true)

    await page.goto(`/admin/collections/customers/${customer.id}`)
    const customerPassword = `Updated customer test passphrase ${suffix}!`
    await save('customers', customer.id, 'Updated', customerPassword)
    const verified = await payload.login({
      collection: 'customers',
      data: { email: customer.email, password: customerPassword },
    })
    expect(verified.user?.firstName).toBe('Updated')
    await remove('customers', customer.id)
    await expect(payload.findByID({ collection: 'customers', id: customer.id })).rejects.toThrow()

    await page.goto(`/admin/collections/users/${otherAdmin.id}`)
    const otherPassword = `Updated admin test passphrase ${suffix}!`
    await save('users', otherAdmin.id, 'Updated', otherPassword)
    const updatedAdminLogin = await request.post('/api/users/login', {
      data: { email: otherAdmin.email, password: otherPassword },
    })
    expect(updatedAdminLogin.ok()).toBe(true)
    await remove('users', otherAdmin.id)
    await expect(payload.findByID({ collection: 'users', id: otherAdmin.id })).rejects.toThrow()
  } finally {
    if (customers.length)
      await payload.delete({ collection: 'customers', where: { id: { in: customers } } })
    if (admins.length) await payload.delete({ collection: 'users', where: { id: { in: admins } } })
    await payload.destroy()
  }
})
