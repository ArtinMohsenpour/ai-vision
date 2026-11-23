import { randomUUID } from 'node:crypto'
import { expect, test as base } from '@playwright/test'
import { Secret, TOTP } from 'otpauth'

import { linkFromMail } from '../helpers/mail'
import { getLocalTestPayload } from '../helpers/seedUser'

const origin = new URL(
  process.env.RHEINO_TEST_ORIGIN || process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3000',
).origin

const test = base.extend<{ trackCustomer: (email: string) => string }>({
  trackCustomer: async ({ baseURL }, provide) => {
    if (baseURL !== origin)
      throw new Error('The browser and customer fixtures must use the same origin.')
    const emails: string[] = []
    try {
      await provide((email) => {
        emails.push(email)
        return email
      })
    } finally {
      if (emails.length) {
        const payload = await getLocalTestPayload()
        try {
          // Customers with orders cannot be deleted; remove test orders first.
          await payload.delete({
            collection: 'orders',
            where: { 'customer.email': { in: emails } },
          })
          const result = await payload.delete({
            collection: 'customers',
            where: { email: { in: emails } },
          })
          if (result.errors.length) throw new Error('Could not remove customer test fixtures')
        } finally {
          await payload.destroy()
        }
      }
    }
  },
})

test('verifies a new account, revokes sessions on reset, and signs out', async ({
  page,
  browser,
  request,
  trackCustomer,
}) => {
  test.skip(Boolean(process.env.SMTP_HOST), 'Customer email browser test uses the local outbox.')
  test.setTimeout(60_000)
  const email = trackCustomer(`e2e-${randomUUID()}@example.test`)
  const oldPassword = 'Copper Lantern by the Water 18!'
  const newPassword = 'Winter Bookshop near the Rhine 47!'
  await page.goto(`${origin}/en/account`)
  await expect(page).toHaveURL(`${origin}/en/login`)
  await page.goto(`${origin}/en/signup`)
  await page.getByLabel('First name').fill('Alex')
  await page.getByLabel('Last name').fill('Demo')
  await expect(page.getByLabel('Company or trade name (optional)')).toHaveJSProperty(
    'required',
    false,
  )
  await page.getByLabel('Email address').fill(email)
  await page.getByLabel('Password', { exact: true }).fill(oldPassword)
  await page.getByLabel('Confirm password').fill(oldPassword)
  await page.getByRole('checkbox', { name: /registering on behalf/ }).check()
  await page.getByRole('button', { name: 'Create account' }).click()
  await expect(page.getByRole('heading', { name: 'Check your inbox' })).toBeVisible()
  await expect.poll(() => linkFromMail(email, '/en/verify-email')).not.toBe('')

  const signIn = async (password: string) => {
    await page.getByLabel('Email address').fill(email)
    await page.getByLabel('Password', { exact: true }).fill(password)
    await page.getByRole('button', { name: 'Sign in', exact: true }).click()
  }
  await page.goto(`${origin}/en/login`)
  await signIn(oldPassword)
  await expect(page.getByRole('main').getByRole('alert')).toContainText('Verify your email')

  const originalVerification = await linkFromMail(email, '/en/verify-email')
  await page.getByRole('link', { name: 'Send a new verification link' }).click()
  await expect(page.getByRole('heading', { name: 'Get a verification link' })).toBeVisible()
  await page.getByLabel('Email address').fill(email)
  await page.getByRole('button', { name: 'Send verification link' }).click()
  await expect(page.getByRole('heading', { name: 'Check your inbox' })).toBeVisible()
  await expect
    .poll(async () => {
      const link = await linkFromMail(email, '/en/verify-email')
      return Boolean(link && link !== originalVerification)
    })
    .toBe(true)
  await page.goto(originalVerification)
  await page.getByRole('button', { name: 'Verify email' }).click()
  await expect(page).toHaveURL(`${origin}/en/verify-email?status=invalid-link`)
  await expect(page.getByRole('main').getByRole('alert')).toContainText('This link is invalid')
  await expect(page.getByLabel('Email address')).toBeVisible()

  const verification = await linkFromMail(email, '/en/verify-email')
  expect(new URL(verification).search).toBe('')
  await page.goto(verification)
  await page.getByRole('button', { name: 'Verify email' }).click()
  await expect(page.getByRole('status')).toContainText('Email confirmed')
  const otherTab = await page.context().newPage()
  await otherTab.goto(`${origin}/`)
  const otherNav = otherTab.getByRole('navigation', { name: 'Hauptnavigation' })
  await expect(otherNav.getByRole('link', { name: 'Anmelden', exact: true })).toBeVisible()
  const nav = page.getByRole('navigation', { name: 'Main navigation' })
  await expect(nav.getByRole('link', { name: 'Log in', exact: true })).toBeVisible()
  await signIn(oldPassword)
  await expect(page).toHaveURL(`${origin}/en/account`)
  await expect(page.getByRole('heading', { name: 'My account' })).toBeVisible()
  await expect(page.getByLabel('Company or trade name')).toHaveValue('')
  await expect(nav.getByRole('link', { name: 'My account' })).toHaveAttribute('href', '/en/account')
  await expect(otherNav.getByRole('link', { name: 'Mein Konto' })).toHaveAttribute(
    'href',
    '/account',
  )
  const sessionStatus = await page.request.get(`${origin}/api/customer-session`)
  expect(sessionStatus.headers()['cache-control']).toBe('private, no-store')
  expect(await sessionStatus.json()).toEqual({ authenticated: true })
  const original = (await page.context().cookies()).find(
    (cookie) => cookie.name === 'rheino-customer',
  )
  expect(original).toMatchObject({ httpOnly: true, sameSite: 'Lax' })
  expect(
    (
      await request.post(`${origin}/api/customers/login`, {
        data: { email, password: oldPassword },
      })
    ).status(),
  ).toBe(404)
  expect((await page.request.get(`${origin}/api/users/me`)).ok()).toBeTruthy()
  expect((await (await page.request.get(`${origin}/api/users/me`)).json()).user).toBeNull()

  const recovery = await browser.newPage()
  try {
    await recovery.goto(`${origin}/en/forgot-password`)
    await recovery.getByLabel('Email address').fill(email)
    await recovery.getByRole('button', { name: 'Send reset link' }).click()
    await expect(recovery.getByRole('heading', { name: 'Check your inbox' })).toBeVisible()
    await expect.poll(() => linkFromMail(email, '/en/reset-password')).not.toBe('')
    const reset = await linkFromMail(email, '/en/reset-password')
    const resetOn = async () => {
      await recovery.goto(reset)
      await recovery.getByLabel('New password', { exact: true }).fill(newPassword)
      await recovery.getByLabel('Confirm password').fill(newPassword)
      await recovery.getByRole('button', { name: 'Save new password' }).click()
    }
    await resetOn()
    await expect(recovery.getByRole('status')).toContainText('Password updated')
    await resetOn()
    await expect(recovery.getByRole('main').getByRole('alert')).toContainText(
      'This link is invalid',
    )
    await page.reload()
    await expect(page).toHaveURL(`${origin}/en/login`)
  } finally {
    await recovery.close()
  }

  await signIn(oldPassword)
  await expect(page.getByRole('main').getByRole('alert')).toContainText('We couldn’t sign you in')
  await signIn(newPassword)
  await expect(page).toHaveURL(`${origin}/en/account`)
  const session = (await page.context().cookies()).find(
    (cookie) => cookie.name === 'rheino-customer',
  )!
  await page.getByRole('button', { name: 'Sign out' }).click()
  await expect(page).toHaveURL(`${origin}/en/login`)
  await expect(nav.getByRole('link', { name: 'Log in', exact: true })).toBeVisible()
  await expect(otherNav.getByRole('link', { name: 'Anmelden', exact: true })).toBeVisible()
  await page.context().addCookies([session])
  await page.goto(`${origin}/en/account`)
  await expect(page).toHaveURL(`${origin}/en/login`)
  expect(await (await page.request.get(`${origin}/api/customer-session`)).json()).toEqual({
    authenticated: false,
  })
})

test('shows and clears actionable registration feedback and focuses the first invalid field', async ({
  page,
}) => {
  await page.goto(`${origin}/en/signup`)
  const firstName = page.getByLabel('First name')
  const lastName = page.getByLabel('Last name')
  const company = page.getByLabel('Company or trade name')
  const email = page.getByLabel('Email address')
  const password = page.getByLabel('Password', { exact: true })
  const confirmation = page.getByLabel('Confirm password')
  await firstName.fill('A'.repeat(76))
  await lastName.fill('D')
  await company.fill('E')
  await email.fill('incorrect-address')
  await password.fill('Copper Lantern by the Water 18')
  await confirmation.fill('Does not match')
  await page.getByRole('button', { name: 'Create account' }).click()
  await expect(firstName).toBeFocused()
  await expect(firstName).toHaveAttribute('aria-invalid', 'true')
  await expect(page.locator('#error-firstName')).toHaveText('Use 2–75 characters.')
  await expect(page.locator('#error-lastName')).toHaveText('Use 2–75 characters.')
  await expect(page.locator('#error-company')).toHaveText('Use 2–150 characters.')
  await expect(page.locator('#error-email')).toHaveText('Enter a valid email address.')
  await expect(page.locator('#error-password')).toHaveText(
    'Add a special character such as !, @ or #.',
  )
  await expect(page.locator('#error-confirmation')).toHaveText('The passwords don’t match.')
  await expect(page.locator('#password-hint [data-passed="true"]')).toHaveCount(4)
  await firstName.fill('Émilie')
  await lastName.fill('Demo')
  await company.fill('A'.repeat(151))
  await expect(company).toHaveAttribute('aria-invalid', 'true')
  await company.clear()
  await email.fill('sample+business@example.test')
  await password.fill('Copper Lantern by the Water 18!')
  await confirmation.fill('Copper Lantern by the Water 18!')
  await expect(firstName).toHaveAttribute('aria-invalid', 'false')
  await expect(lastName).toHaveAttribute('aria-invalid', 'false')
  await expect(company).toHaveAttribute('aria-invalid', 'false')
  await expect(email).toHaveAttribute('aria-invalid', 'false')
  await expect(confirmation).toHaveAttribute('aria-invalid', 'false')
  await expect(page.locator('#password-hint [data-passed="true"]')).toHaveCount(5)

  await page.goto(`${origin}/en/login`)
  await email.fill('incorrect-address')
  await page.getByRole('button', { name: 'Sign in', exact: true }).click()
  await expect(email).toBeFocused()
  await expect(page.locator('#error-email')).toHaveText('Enter a valid email address.')
  await expect(page.locator('#error-password')).toHaveText('Please fill in this field.')
})

test('the server validates registration when JavaScript is disabled', async ({ browser }) => {
  const page = await browser.newPage({ javaScriptEnabled: false })
  try {
    await page.goto(`${origin}/en/signup`)
    await page.getByLabel('First name').fill('<script>')
    await page.getByLabel('Last name').fill('D')
    await page.getByLabel('Company or trade name').fill('E')
    await page.getByLabel('Email address').fill('example@example.test')
    await page.getByLabel('Password', { exact: true }).fill('Missing a special character 26')
    await page.getByLabel('Confirm password').fill('Missing a special character 26')
    await page.getByRole('checkbox').check()
    await page.getByRole('button', { name: 'Create account' }).click()
    await expect(page.locator('#error-firstName')).toHaveText(
      'Remove markup or unsupported characters.',
    )
    await expect(page.locator('#error-lastName')).toHaveText('Use 2–75 characters.')
    await expect(page.locator('#error-company')).toHaveText('Use 2–150 characters.')
    await expect(page.locator('#error-password')).toHaveText(
      'Add a special character such as !, @ or #.',
    )
  } finally {
    await page.close()
  }
})

test('edits a profile, enables an authenticator, changes the password and uses recovery codes', async ({
  page,
  trackCustomer,
}) => {
  test.skip(Boolean(process.env.SMTP_HOST), 'Customer portal browser test uses local email.')
  test.setTimeout(75_000)
  const email = trackCustomer(`alex.portal+${randomUUID().slice(0, 8)}@example.test`)
  const password = 'Porcelain Studio on the Rhine 26!'
  const newPassword = 'Evening Studio on the Rhine 49!'
  const recoveredPassword = 'Morning Studio on the Rhine 62!'

  await page.goto(`${origin}/en/account/security`)
  await expect(page).toHaveURL(`${origin}/en/login`)
  await page.goto(`${origin}/en/signup`)
  await page.getByLabel('First name').fill('Alex')
  await page.getByLabel('Last name').fill('Hoffmann')
  await page.getByLabel('Email address').fill(email)
  await page.getByLabel('Password', { exact: true }).fill(password)
  await page.getByLabel('Confirm password').fill(password)
  await page.getByRole('checkbox', { name: /registering on behalf/ }).check()
  await page.getByRole('button', { name: 'Create account' }).click()
  await expect(page.getByRole('heading', { name: 'Check your inbox' })).toBeVisible()
  await expect.poll(async () => Boolean(await linkFromMail(email, '/en/verify-email'))).toBe(true)
  await page.goto(await linkFromMail(email, '/en/verify-email'))
  await page.getByRole('button', { name: 'Verify email' }).click()
  await expect(page).toHaveURL(`${origin}/en/login?status=verified`)

  const signIn = async (value: string) => {
    await page.getByLabel('Email address').fill(email)
    await page.getByLabel('Password', { exact: true }).fill(value)
    await page.getByRole('button', { name: 'Sign in', exact: true }).click()
  }
  const verify = async (code: string) => {
    await page.getByLabel('Authenticator or recovery code').fill(code)
    await page.getByRole('button', { name: 'Verify and sign in' }).click()
  }
  await signIn(password)
  await expect(page).toHaveURL(`${origin}/en/account`)
  await page.getByLabel('First name').fill('A')
  await page.getByRole('button', { name: 'Save changes' }).click()
  await expect(page.locator('#error-firstName')).toHaveText('Use 2–75 characters.')
  await page.getByLabel('First name').fill('Alexandra')
  await page.getByLabel('Phone number').fill('+49 221 555 0123')
  await page.getByLabel('Company or trade name').fill('Rhine Studio')
  await page.getByRole('button', { name: 'Save changes' }).click()
  await expect(page.getByRole('status')).toContainText('Your changes were saved')
  await page.reload()
  await expect(page.getByLabel('First name')).toHaveValue('Alexandra')
  await expect(page.getByLabel('Phone number')).toHaveValue('+49 221 555 0123')

  const openSecurity = () =>
    page
      .getByRole('navigation', { name: 'Account menu' })
      .getByRole('link', { name: 'Security' })
      .click()
  await openSecurity()
  await expect(page).toHaveURL(`${origin}/en/account/security`)
  const mfa = page.getByRole('region', { name: 'Two-step verification' })
  await mfa.getByRole('button', { name: 'Set up authenticator' }).click()
  await mfa.getByLabel('Current password').fill('Wrong test password')
  await mfa.getByRole('button', { name: 'Continue setup' }).click()
  await expect(mfa.getByRole('alert')).toContainText('Your current password could not be verified')
  await mfa.getByLabel('Current password').fill(password)
  await mfa.getByRole('button', { name: 'Continue setup' }).click()
  await expect(
    mfa.getByRole('img', { name: 'QR code for your Rheino authenticator setup' }),
  ).toBeVisible()
  const key = (await mfa.locator('code').textContent())!
  const totp = new TOTP({ secret: Secret.fromBase32(key) })
  const enrollmentCode = totp.generate({ timestamp: Date.now() - 30_000 })
  await mfa.getByLabel('Six-digit authenticator code').fill(enrollmentCode)
  await mfa.getByRole('button', { name: 'Turn on verification' }).click()
  await expect(
    mfa.getByRole('list', { name: 'Save your recovery codes' }).getByRole('listitem'),
  ).toHaveCount(8)
  const codes = await mfa
    .getByRole('list', { name: 'Save your recovery codes' })
    .locator('code')
    .allTextContents()
  await mfa.getByRole('button', { name: 'Done' }).click()
  await expect(mfa.getByRole('button', { name: 'Turn off verification' })).toBeVisible()
  await expect(mfa.getByRole('list', { name: 'Save your recovery codes' })).toHaveCount(0)

  await page.getByRole('button', { name: 'Sign out' }).click()
  await signIn(password)
  await expect(page.getByRole('heading', { name: 'Verify your sign-in' })).toBeVisible()
  expect(await (await page.request.get(`${origin}/api/customer-session`)).json()).toEqual({
    authenticated: false,
  })
  await verify(enrollmentCode)
  await expect(page.locator('#error-login-factor')).toContainText('That code couldn’t be verified')
  await verify(totp.generate())
  await expect(page).toHaveURL(`${origin}/en/account`)

  const session = (await page.context().cookies()).find(
    (cookie) => cookie.name === 'rheino-customer',
  )!
  await openSecurity()
  const passwordCard = page.getByRole('region', { name: 'Password', exact: true })
  await passwordCard.getByRole('button', { name: 'Change password' }).click()
  await passwordCard.getByLabel('Current password').fill(password)
  await passwordCard.getByLabel('New password', { exact: true }).fill(newPassword)
  await passwordCard.getByLabel('Confirm password').fill(newPassword)
  await passwordCard.getByLabel('Authenticator or recovery code').fill(codes[0])
  await passwordCard.getByRole('button', { name: 'Change password' }).click()
  await expect(page).toHaveURL(`${origin}/en/login?status=reset`)
  await page.context().addCookies([session])
  expect(await (await page.request.get(`${origin}/api/customer-session`)).json()).toEqual({
    authenticated: false,
  })
  await signIn(password)
  await expect(page.getByRole('main').getByRole('alert')).toContainText('We couldn’t sign you in')
  await signIn(newPassword)
  await expect(page.getByRole('heading', { name: 'Verify your sign-in' })).toBeVisible()
  await verify(codes[0])
  await expect(page.locator('#error-login-factor')).toContainText('That code couldn’t be verified')
  await verify(codes[1])
  await expect(page).toHaveURL(`${origin}/en/account`)
  await page.getByRole('button', { name: 'Sign out' }).click()
  await page.goto(`${origin}/en/forgot-password`)
  await page.getByLabel('Email address').fill(email)
  await page.getByRole('button', { name: 'Send reset link' }).click()
  await expect(page.getByRole('heading', { name: 'Check your inbox' })).toBeVisible()
  await expect.poll(async () => Boolean(await linkFromMail(email, '/en/reset-password'))).toBe(true)
  await page.goto(await linkFromMail(email, '/en/reset-password'))
  await page.getByLabel('New password', { exact: true }).fill(recoveredPassword)
  await page.getByLabel('Confirm password').fill(recoveredPassword)
  await page.getByRole('button', { name: 'Save new password' }).click()
  await expect(page).toHaveURL(`${origin}/en/login?status=reset`)
  await signIn(recoveredPassword)
  await expect(page.getByRole('heading', { name: 'Verify your sign-in' })).toBeVisible()
  await verify(codes[2])
  await expect(page).toHaveURL(`${origin}/en/account`)

  await openSecurity()
  await mfa.getByRole('button', { name: 'Turn off verification' }).click()
  await mfa.getByLabel('Current password').fill(recoveredPassword)
  await mfa.getByLabel('Authenticator or recovery code').fill(codes[3])
  await mfa.getByRole('button', { name: 'Turn off verification' }).click()
  await expect(mfa.getByText('Two-step verification is off.')).toBeVisible()
  await page.getByRole('button', { name: 'Sign out' }).click()
  await signIn(recoveredPassword)
  await expect(page).toHaveURL(`${origin}/en/account`)
})
