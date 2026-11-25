import { expect, test, type Page } from '@playwright/test'

import { shopFixture, websiteOrdering } from '../helpers/shop'

type Fixture = Awaited<ReturnType<typeof shopFixture>>

/** A published service page using every new content item, with a package item for `target`. */
async function contentPage(shop: Fixture) {
  const target = await shop.createService(websiteOrdering(), 'Package target')
  const page = await shop.createService({ mode: 'off' }, 'Content items page')
  const offer = (layout: string) => ({
    type: 'offer',
    offerService: target.id,
    offerLayout: layout,
  })
  await shop.updateService(page.id, {
    sections: [
      {
        blockType: 'fullWidth',
        tone: 'plain',
        alignment: 'top',
        column1: {
          content: [
            {
              type: 'facts',
              facts: [
                { value: 'DE · EN', label: 'Two languages' },
                { value: 'Stripe', label: 'Secure payment' },
              ],
            },
            {
              type: 'cards',
              cards: [{ title: 'Fast pages', text: 'Short load times.', icon: 'speed' }],
            },
            {
              type: 'steps',
              steps: [
                { title: 'Configure', note: 'online' },
                { title: 'Kick-off' },
                { title: 'Launch' },
              ],
            },
            offer('extras'),
          ],
        },
      },
      {
        blockType: 'fullWidth',
        tone: 'accent',
        alignment: 'top',
        column1: { content: [offer('compact')] },
      },
    ] as never,
  })
  return { target, page }
}

const offerCard = (page: Page) => page.locator('[data-offer="extras"]')
const compact = (page: Page) => page.locator('[data-offer="compact"]')

test.describe('Page content items', () => {
  test.describe.configure({ mode: 'serial' })

  test('shows key facts, icon cards, a timeline and the live package while ordering is closed', async ({
    page,
    request,
  }) => {
    const shop = await shopFixture(request)
    try {
      await shop.settings({ orderingEnabled: false, priceNote: 'Test price note' })
      const { target, page: service } = await contentPage(shop)
      await page.goto(`/en/services/${service.slug}`)

      await expect(page.locator('[data-facts]')).toContainText('DE · EN')
      await expect(page.locator('[data-facts]')).toContainText('Two languages')
      await expect(page.locator('li', { hasText: 'Fast pages' }).locator('svg')).toHaveCount(1)
      await expect(page.locator('[data-timeline] > li')).toHaveCount(3)
      await expect(page.locator('[data-timeline]')).toContainText('online')

      const card = offerCard(page)
      await expect(card).toContainText('Simple website')
      await expect(card).toContainText('from €200')
      await expect(card).toContainText('Up to 5 pages')
      await expect(card).toContainText('CMS')
      await expect(card).toContainText('+€350')
      await expect(card).toContainText('Online ordering is closed right now')
      await expect(card).toContainText('Test price note')
      await expect(card.getByRole('link', { name: 'Configure and order' })).toHaveCount(0)
      await expect(card.getByRole('link', { name: 'Start a project' })).toHaveAttribute(
        'href',
        `/en/contact?service=${target.slug}`,
      )
      await expect(compact(page)).toContainText('from €200')
      await expect(compact(page).getByRole('link', { name: 'Start a project' })).toBeVisible()
    } finally {
      await shop.cleanup()
    }
  })

  test('leads to the order page once ordering is open', async ({ page, request }) => {
    const shop = await shopFixture(request)
    try {
      await shop.settings({ orderingEnabled: true })
      const { target, page: service } = await contentPage(shop)
      await page.goto(`/en/services/${service.slug}`)
      const orderHref = `/en/services/${target.slug}/order`

      await expect(
        offerCard(page).getByRole('link', { name: 'Configure and order' }),
      ).toHaveAttribute('href', orderHref)
      await expect(
        offerCard(page).getByRole('link', { name: 'Ask for a custom quote' }),
      ).toHaveAttribute('href', `/en/contact?service=${target.slug}`)
      await expect(offerCard(page)).not.toContainText('Online ordering is closed')
      await compact(page).getByRole('link', { name: 'Configure and order' }).click()
      await expect(page).toHaveURL(new RegExp(`${orderHref}$`))
      await expect(page.getByRole('heading', { level: 1 })).toContainText('Package target')
    } finally {
      await shop.cleanup()
    }
  })

  test('uses the theme colors in light and dark and fits a 375 px phone', async ({
    page,
    request,
  }) => {
    const shop = await shopFixture(request)
    try {
      await shop.settings({ orderingEnabled: true })
      const { page: service } = await contentPage(shop)
      await page.setViewportSize({ width: 375, height: 812 })
      await page.goto(`/en/services/${service.slug}`)
      await expect(offerCard(page)).toBeVisible()

      const colors: Record<string, string> = {}
      for (const theme of ['light', 'dark']) {
        const [card, surface] = await page.evaluate((value) => {
          document.documentElement.dataset.theme = value
          const probe = document.createElement('div')
          probe.style.backgroundColor = 'var(--surface)'
          document.body.append(probe)
          const result = [
            getComputedStyle(document.querySelector('[data-offer="extras"]')!).backgroundColor,
            getComputedStyle(probe).backgroundColor,
          ]
          probe.remove()
          return result
        }, theme)
        expect(card).toBe(surface)
        colors[theme] = card
      }
      expect(colors.light).not.toBe(colors.dark)

      const overflow = await page.evaluate(
        () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
      )
      expect(overflow).toBeLessThanOrEqual(0)
      // On a phone the timeline runs vertically: each step sits below the previous one.
      const steps = page.locator('[data-timeline] > li')
      const [first, second] = [await steps.nth(0).boundingBox(), await steps.nth(1).boundingBox()]
      expect(second!.y).toBeGreaterThan(first!.y + first!.height - 1)
    } finally {
      await shop.cleanup()
    }
  })
})
