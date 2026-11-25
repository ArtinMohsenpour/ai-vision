import { randomUUID } from 'node:crypto'
import { expect, test } from '@playwright/test'

import { getLocalTestPayload } from '../helpers/seedUser'

test('draws an editable service feature map at phone and desktop widths', async ({ page }) => {
  const payload = await getLocalTestPayload()
  const labels = [
    'Fast loading',
    'Responsive design',
    'Editing from a content management tool',
    'Built with accessibility in mind',
    'Privacy-friendly analytics',
    'Visibility in local search',
    'Available in multiple languages',
    'Room to grow',
  ]
  const service = await payload.create({
    collection: 'services',
    data: {
      slug: `service-hero-${randomUUID()}`,
      title: 'A longer service page title',
      summary: 'Page content below the feature map.',
      sortOrder: 999,
      heroFeatures: labels.map((label) => ({ label })),
      _status: 'published',
    },
  })

  try {
    await page.emulateMedia({ reducedMotion: 'no-preference' })
    await page.goto(`/en/services/${service.slug}`)
    const hero = page.locator('[data-service-hero]')
    const nodes = hero.getByRole('listitem')
    await expect(hero.getByRole('heading', { level: 1 })).toHaveText(service.title)
    await expect(nodes).toHaveText(labels)
    await expect(page.getByText(service.summary)).toBeVisible()

    for (const width of [320, 639, 640, 1440]) {
      await page.setViewportSize({ width, height: 900 })
      await expect.poll(() => nodes.locator('defs path[d]').count()).toBe(8)
      expect(
        await hero.evaluate((section) => {
          const heading = section.querySelector('h1')!.getBoundingClientRect()
          const badges = [...section.querySelectorAll('[data-glass-service]')].map((badge) =>
            badge.getBoundingClientRect(),
          )
          return badges.every(
            (badge, index) =>
              badge.left >= 0 &&
              badge.right <= window.innerWidth &&
              [heading, ...badges].every(
                (other, otherIndex) =>
                  otherIndex === index + 1 ||
                  badge.left >= other.right ||
                  badge.right <= other.left ||
                  badge.top >= other.bottom ||
                  badge.bottom <= other.top,
              ),
          )
        }),
        `Feature layout at ${width}px`,
      ).toBe(true)
    }

    const motion = () =>
      hero.evaluate((section) => section.getAnimations({ subtree: true }).map((a) => a.playState))
    await expect.poll(motion).toEqual(Array(8).fill('running'))
    await hero.getByRole('button', { name: 'Pause animation' }).click()
    await expect.poll(motion).toEqual(Array(8).fill('paused'))
    await hero.getByRole('button', { name: 'Play animation' }).click()
    await expect.poll(motion).toEqual(Array(8).fill('running'))

    await page.emulateMedia({ reducedMotion: 'reduce' })
    await expect(hero.getByRole('button', { name: 'Pause animation' })).toBeHidden()
    await expect.poll(motion).toEqual([])
    await expect(nodes).toHaveText(labels)
  } finally {
    await payload.delete({ collection: 'services', id: service.id })
  }
})
