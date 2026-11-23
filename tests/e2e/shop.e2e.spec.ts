import { randomUUID } from 'node:crypto'
import { expect, test } from '@playwright/test'

import { linkFromMail } from '../helpers/mail'
import { shopFixture, websiteOrdering } from '../helpers/shop'

test.describe('Shop', () => {
  test.describe.configure({ mode: 'serial' })

  test('pricing page lists an orderable service with its from price', async ({ page, request }) => {
    const shop = await shopFixture(request)
    try {
      await shop.settings({ orderingEnabled: true })
      const service = await shop.createService(websiteOrdering())
      await page.goto('/en/pricing')
      const card = page.getByRole('article', { name: service.title })
      await expect(card).toContainText('from €200')
      await expect(card).toContainText('+ CMS, AI chatbot')
      await expect(card.getByRole('link', { name: 'Configure' })).toHaveAttribute(
        'href',
        `/en/services/${service.slug}/order`,
      )

      await page.goto(`/en/services/${service.slug}`)
      await expect(page.getByRole('link', { name: 'Configure and order' })).toHaveAttribute(
        'href',
        `/en/services/${service.slug}/order`,
      )
    } finally {
      await shop.cleanup()
    }
  })

  test('quote services show request a quote', async ({ page, request }) => {
    const shop = await shopFixture(request)
    try {
      await shop.settings({ orderingEnabled: true })
      const service = await shop.createService({ mode: 'quote' })
      await page.goto('/en/pricing')
      const card = page.getByRole('article', { name: service.title })
      await expect(card).toContainText('Price on request')
      await expect(card.getByRole('link', { name: 'Request a quote' })).toHaveAttribute(
        'href',
        `/en/contact?service=${service.slug}`,
      )
    } finally {
      await shop.cleanup()
    }
  })

  test('closed ordering hides order buttons but keeps quotes', async ({ page, request }) => {
    const shop = await shopFixture(request)
    try {
      await shop.settings({ orderingEnabled: false })
      const orderable = await shop.createService(websiteOrdering())
      const quote = await shop.createService({ mode: 'quote' })
      await page.goto('/en/pricing')
      await expect(page.getByRole('article', { name: orderable.title })).toHaveCount(0)
      await expect(page.getByRole('article', { name: quote.title })).toBeVisible()
    } finally {
      await shop.cleanup()
    }
  })

  test('order page totals follow the selected extras', async ({ page, request }) => {
    const shop = await shopFixture(request)
    try {
      await shop.settings({ orderingEnabled: true })
      const service = await shop.createService(websiteOrdering())
      const [cms, chat] = service.ordering!.extras!.map((extra) => extra.id!)
      await page.goto(`/en/services/${service.slug}/order?extras=${cms}`)
      const summary = page.getByRole('region', { name: 'Your order' })
      const cmsRow = page.getByRole('button', { name: /^CMS/ })
      const chatRow = page.getByRole('button', { name: /^AI chatbot/ })
      await expect(cmsRow).toHaveAttribute('aria-pressed', 'true')
      await expect(summary.getByText('€550', { exact: true })).toBeVisible()
      await expect(summary).toContainText('about 12 working days')

      await chatRow.click()
      await expect(chatRow).toHaveAttribute('aria-pressed', 'true')
      await expect(summary.getByText('€1,000', { exact: true })).toBeVisible()
      await expect(summary).toContainText('about 16 working days')
      await expect(page).toHaveURL(new RegExp(`extras=${cms}(%2C|,)${chat}`))

      await chatRow.click()
      await expect(chatRow).toHaveAttribute('aria-pressed', 'false')
      await expect(summary.getByText('€550', { exact: true })).toBeVisible()
    } finally {
      await shop.cleanup()
    }
  })

  test('the preview shows the focused extra and the Stripe note', async ({ page, request }) => {
    const shop = await shopFixture(request)
    try {
      await shop.settings({ orderingEnabled: true })
      const service = await shop.createService(websiteOrdering())
      await page.goto(`/en/services/${service.slug}/order`)
      await page.getByRole('button', { name: /^AI chatbot/ }).click()
      const preview = page.getByRole('region', { name: 'Preview' })
      await expect(preview).toContainText('A chat assistant trained on your services')
      await expect(preview).toContainText('Trained on your content')
      await expect(
        page.getByText(
          'Secure payment by Stripe. Your card details go straight to Stripe. We never see or store them.',
        ),
      ).toBeVisible()
    } finally {
      await shop.cleanup()
    }
  })

  test('unknown and repeated extras in the URL are ignored', async ({ page, request }) => {
    const shop = await shopFixture(request)
    try {
      await shop.settings({ orderingEnabled: true })
      const service = await shop.createService(websiteOrdering())
      const [cms] = service.ordering!.extras!.map((extra) => extra.id!)
      await page.goto(`/en/services/${service.slug}/order?extras=nope,${cms},${cms},<b>`)
      await expect(page.getByRole('button', { name: /^CMS/ })).toHaveAttribute(
        'aria-pressed',
        'true',
      )
      await expect(page.getByRole('button', { name: /^AI chatbot/ })).toHaveAttribute(
        'aria-pressed',
        'false',
      )
      await expect(
        page.getByRole('region', { name: 'Your order' }).getByText('€550', { exact: true }),
      ).toBeVisible()
    } finally {
      await shop.cleanup()
    }
  })

  test('services that cannot be ordered online have no order page', async ({ page, request }) => {
    const shop = await shopFixture(request)
    try {
      await shop.settings({ orderingEnabled: true })
      const quote = await shop.createService({ mode: 'quote' })
      expect((await page.goto(`/en/services/${quote.slug}/order`))?.status()).toBe(404)
      await shop.settings({ orderingEnabled: false })
      const closed = await shop.createService(websiteOrdering())
      // The site refreshes its cached settings right after the save; allow that moment.
      await expect
        .poll(async () => (await page.goto(`/en/services/${closed.slug}/order`))?.status(), {
          timeout: 5_000,
        })
        .toBe(404)
    } finally {
      await shop.cleanup()
    }
  })

  test('a visitor configures without an account, signs in and returns to pay', async ({
    page,
    request,
  }) => {
    test.setTimeout(90_000)
    const shop = await shopFixture(request)
    const password = `Shop login test ${randomUUID()}!`
    const customer = await shop.payload.create({
      collection: 'customers',
      data: {
        email: `e2e-shop-${randomUUID()}@example.test`,
        password,
        firstName: 'Shop',
        lastName: 'Tester',
        businessConfirmedAt: new Date().toISOString(),
        _verified: true,
      },
      disableVerificationEmail: true,
    })
    try {
      await shop.settings({ orderingEnabled: true })
      const service = await shop.createService(websiteOrdering())
      const [cms, chat] = service.ordering!.extras!.map((extra) => extra.id!)
      await page.goto(`/en/services/${service.slug}`)
      await page.getByRole('link', { name: 'Configure and order' }).click()
      await page.getByRole('button', { name: /^CMS/ }).click()
      await page.getByRole('button', { name: /^AI chatbot/ }).click()

      // Signed out: a sign-in step instead of the payment button.
      const step = page.locator('[data-sign-in-step]')
      await expect(step).toContainText('Sign in to order')
      await expect(step).toContainText('Your selection is saved')
      await expect(page.getByRole('button', { name: 'Continue to payment' })).toHaveCount(0)
      await expect(page.getByRole('checkbox', { name: /I order as a business/ })).toHaveCount(0)

      await step.getByRole('link', { name: 'Sign in' }).click()
      await expect(page).toHaveURL(/\/en\/login\?next=/)
      await expect(page.getByRole('status')).toContainText('Your selection is saved')
      await page.getByLabel('Email address').fill(customer.email)
      await page.getByLabel('Password', { exact: true }).fill(password)
      await page.getByRole('button', { name: 'Sign in', exact: true }).click()

      // Back on the same page with the same selection, ready to pay.
      await expect(page).toHaveURL(
        new RegExp(`/en/services/${service.slug}/order\\?extras=${cms}(%2C|,)${chat}$`),
      )
      await expect(page.getByRole('button', { name: /^CMS/ })).toHaveAttribute(
        'aria-pressed',
        'true',
      )
      await expect(page.getByRole('button', { name: /^AI chatbot/ })).toHaveAttribute(
        'aria-pressed',
        'true',
      )
      await expect(page.locator('[data-sign-in-step]')).toHaveCount(0)
      await page.getByRole('checkbox', { name: /I order as a business/ }).check()
      await page.getByRole('button', { name: 'Continue to payment' }).click()
      if (process.env.STRIPE_SECRET_KEY?.startsWith('sk_test_')) {
        await page.waitForURL(/^https:\/\/checkout\.stripe\.com\//)
      } else {
        await expect(
          page.getByRole('alert').filter({ hasText: "Payment isn't available right now" }),
        ).toBeVisible()
      }
    } finally {
      await shop.payload.delete({
        collection: 'orders',
        where: { customer: { equals: customer.id } },
      })
      await shop.payload.delete({ collection: 'customers', id: customer.id })
      await shop.cleanup()
    }
  })

  test('a new visitor signs up, confirms the email and lands back on the selection', async ({
    page,
    request,
  }) => {
    test.skip(Boolean(process.env.SMTP_HOST), 'Uses the local mail outbox or Mailpit.')
    test.setTimeout(90_000)
    const shop = await shopFixture(request)
    const email = `e2e-shop-signup-${randomUUID()}@example.test`
    const password = 'River Lantern Order Test 26!'
    try {
      await shop.settings({ orderingEnabled: true })
      const service = await shop.createService(websiteOrdering())
      const [cms] = service.ordering!.extras!.map((extra) => extra.id!)
      await page.goto(`/en/services/${service.slug}/order?extras=${cms}`)
      await page
        .locator('[data-sign-in-step]')
        .getByRole('link', { name: 'Create account' })
        .click()
      await expect(page).toHaveURL(/\/en\/signup\?next=/)
      await expect(page.getByRole('status')).toContainText('Your selection is saved')
      await page.getByLabel('First name').fill('Nora')
      await page.getByLabel('Last name').fill('Neukunde')
      await page.getByLabel('Email address').fill(email)
      await page.getByLabel('Password', { exact: true }).fill(password)
      await page.getByLabel('Confirm password').fill(password)
      await page.getByRole('checkbox', { name: /registering on behalf/ }).check()
      await page.getByRole('button', { name: 'Create account' }).click()
      await expect(page.getByRole('heading', { name: 'Check your inbox' })).toBeVisible()

      await expect
        .poll(() => linkFromMail(email, '/en/verify-email'), { timeout: 20_000 })
        .not.toBe('')
      const verification = await linkFromMail(email, '/en/verify-email')
      expect(new URL(verification).searchParams.get('next')).toBe(
        `/services/${service.slug}/order?extras=${cms}`,
      )
      await page.goto(verification)
      await page.getByRole('button', { name: 'Verify email' }).click()
      await expect(page).toHaveURL(/\/en\/login\?status=verified&next=/)
      await page.getByLabel('Email address').fill(email)
      await page.getByLabel('Password', { exact: true }).fill(password)
      await page.getByRole('button', { name: 'Sign in', exact: true }).click()
      await expect(page).toHaveURL(
        new RegExp(`/en/services/${service.slug}/order\\?extras=${cms}$`),
      )
      await expect(page.getByRole('button', { name: /^CMS/ })).toHaveAttribute(
        'aria-pressed',
        'true',
      )
      await expect(page.getByRole('button', { name: 'Continue to payment' })).toBeVisible()
    } finally {
      await shop.payload.delete({
        collection: 'orders',
        where: { 'customer.email': { equals: email } },
      })
      await shop.payload.delete({ collection: 'customers', where: { email: { equals: email } } })
      await shop.cleanup()
    }
  })

  test('the browser remembers the selection when the visitor comes back', async ({
    page,
    request,
  }) => {
    const shop = await shopFixture(request)
    try {
      await shop.settings({ orderingEnabled: true })
      const service = await shop.createService(websiteOrdering())
      await page.goto(`/en/services/${service.slug}/order`)
      await page.getByRole('button', { name: /^AI chatbot/ }).click()
      await page.goto('/en/pricing')
      await page.goto(`/en/services/${service.slug}/order`)
      await expect(page.getByRole('button', { name: /^AI chatbot/ })).toHaveAttribute(
        'aria-pressed',
        'true',
      )
      await expect(page).toHaveURL(/\?extras=/)
      await expect(
        page.getByRole('region', { name: 'Your order' }).getByText('€650', { exact: true }),
      ).toBeVisible()
    } finally {
      await shop.cleanup()
    }
  })

  test('a changed offer refreshes the order page instead of charging', async ({
    page,
    request,
  }) => {
    test.setTimeout(60_000)
    const shop = await shopFixture(request)
    const password = `Shop offer test ${randomUUID()}!`
    const customer = await shop.payload.create({
      collection: 'customers',
      data: {
        email: `e2e-offer-${randomUUID()}@example.test`,
        password,
        firstName: 'Offer',
        lastName: 'Tester',
        businessConfirmedAt: new Date().toISOString(),
        _verified: true,
      },
      disableVerificationEmail: true,
    })
    try {
      await shop.settings({ orderingEnabled: true })
      const service = await shop.createService(websiteOrdering())
      const [cms, chat] = service.ordering!.extras!.map((extra) => extra.id!)
      await page.goto('/en/login')
      await page.getByLabel('Email address').fill(customer.email)
      await page.getByLabel('Password', { exact: true }).fill(password)
      await page.getByRole('button', { name: 'Sign in', exact: true }).click()
      await expect(page).toHaveURL(/\/en\/account$/)
      await page.goto(`/en/services/${service.slug}/order?extras=${cms},${chat}`)
      await expect(page.getByRole('button', { name: /^AI chatbot/ })).toHaveAttribute(
        'aria-pressed',
        'true',
      )

      await shop.updateService(service.id, {
        ordering: {
          ...service.ordering!,
          extras: service.ordering!.extras!.map((extra) =>
            extra.id === chat ? { ...extra, active: false } : extra,
          ),
        },
      })
      await page.getByRole('checkbox', { name: /I order as a business/ }).check()
      await page.getByRole('button', { name: 'Continue to payment' }).click()
      await expect(
        page.getByRole('alert').filter({ hasText: 'This offer has just changed' }),
      ).toBeVisible()
      await expect(page.getByRole('button', { name: /^AI chatbot/ })).toHaveCount(0)
      await expect(
        page.getByRole('region', { name: 'Your order' }).getByText('€550', { exact: true }),
      ).toBeVisible()
    } finally {
      await shop.payload.delete({
        collection: 'orders',
        where: { customer: { equals: customer.id } },
      })
      await shop.payload.delete({ collection: 'customers', id: customer.id })
      await shop.cleanup()
    }
  })
})
