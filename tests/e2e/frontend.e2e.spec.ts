import { expect, test } from '@playwright/test'

test.describe('Frontend', () => {
  test('serves the German start page at / and redirects /de there', async ({ page }) => {
    await page.goto('http://localhost:3000/de')
    await expect(page).toHaveURL('http://localhost:3000/')
    await expect(page.locator('html')).toHaveAttribute('lang', 'de')
    await expect(page.locator('h1').first()).toHaveText(
      'Rheino — Software, Websites und KI für Ihr Unternehmen',
    )
  })

  test('serves the English start page', async ({ page }) => {
    await page.goto('http://localhost:3000/en')
    await expect(page.locator('html')).toHaveAttribute('lang', 'en')
    await expect(page.locator('h1').first()).toHaveText(
      'Rheino — Software, websites and AI for your business',
    )
  })

  test('offers published services as localized links on a reduced-motion phone', async ({
    page,
    request,
  }) => {
    await page.setViewportSize({ width: 375, height: 812 })
    await page.emulateMedia({ reducedMotion: 'reduce' })
    for (const locale of ['de', 'en']) {
      const prefix = locale === 'de' ? '' : '/en'
      const response = await request.get('http://localhost:3000/api/services', {
        params: { locale, depth: 0, sort: 'sortOrder', limit: 50 },
      })
      expect(response.ok()).toBeTruthy()
      const { docs } = (await response.json()) as { docs: { title: string; slug: string }[] }
      await page.goto(`http://localhost:3000${prefix}/`)
      const hero = page.locator('[data-home-hero]')
      const links = hero.getByRole('navigation').getByRole('link')
      await expect(links).toHaveText(docs.map(({ title }) => title))
      expect(
        await links.evaluateAll((items) => items.map((item) => item.getAttribute('href'))),
      ).toEqual(docs.map(({ slug }) => `${prefix}/services/${slug}`))
      await expect(hero.locator('img')).toBeVisible()
      await expect(hero.locator('video')).toBeHidden()
      await expect(hero.locator('video')).not.toHaveAttribute('src')
      await expect(
        page.getByRole('heading', {
          name: locale === 'de' ? 'Was wir für Sie tun' : 'What we do for you',
        }),
      ).toHaveCount(0)
      await expect(
        page.getByRole('button', {
          name: locale === 'de' ? 'Animation pausieren' : 'Pause animation',
        }),
      ).toBeHidden()
      expect(
        await hero.evaluate((section) => section.getAnimations({ subtree: true }).length),
      ).toBe(0)
      expect(
        await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth),
      ).toBe(true)
    }
  })

  test('pauses the moving connections and opens a service directly from the map', async ({
    page,
  }) => {
    await page.emulateMedia({ reducedMotion: 'no-preference' })
    await page.goto('http://localhost:3000/en')
    const hero = page.locator('[data-home-hero]')
    const video = hero.locator('video')
    const states = () =>
      hero.evaluate((el) => el.getAnimations({ subtree: true }).map((a) => a.playState))
    await expect.poll(states).toContain('running')
    await expect(video).toBeVisible()
    await expect(video).toHaveJSProperty('paused', false)
    await hero.getByRole('button', { name: 'Pause animation' }).click()
    await expect.poll(states).toContain('paused')
    expect(await states()).not.toContain('running')
    await expect(video).toHaveJSProperty('paused', true)
    await hero.getByRole('button', { name: 'Play animation' }).click()
    await expect.poll(states).toContain('running')
    await expect(video).toHaveJSProperty('paused', false)
    await hero.getByRole('link', { name: 'Websites', exact: true }).click()
    await expect(page).toHaveURL('http://localhost:3000/en/services/websites')
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Websites')
  })

  test('plays the rain loop with the matching landscape crop', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'no-preference' })
    await page.setViewportSize({ width: 375, height: 812 })
    await page.goto('http://localhost:3000/')
    const video = page.locator('[data-home-hero] video')
    await expect(video).toHaveAttribute('src', '/hero/rhine-rain-phone.mp4')
    await expect(video).toBeVisible()
    await expect(video).toHaveJSProperty('loop', true)
    await expect(video).toHaveJSProperty('duration', 6)
    await video.evaluate((element) => {
      ;(element as HTMLVideoElement).currentTime = 5.85
    })
    await expect
      .poll(() => video.evaluate((element) => (element as HTMLVideoElement).currentTime))
      .toBeLessThan(2)

    await page.setViewportSize({ width: 1280, height: 820 })
    await expect(video).toHaveAttribute('src', '/hero/rhine-rain-wide.mp4')
    await expect(video).toBeVisible()
    await expect(video).toHaveJSProperty('paused', false)
  })

  test('fits the German service labels on single lines without overlaps', async ({ page }) => {
    await page.goto('http://localhost:3000/')
    const links = page.locator('[data-home-hero] nav a')
    await expect(links.first()).toBeVisible()
    for (const width of [320, 375, 430, 639, 640, 768, 1024, 1440]) {
      await page.setViewportSize({ width, height: 900 })
      const issues = await links.evaluateAll((items) => {
        const boxes = items.map((item) => item.getBoundingClientRect())
        return items.flatMap((item, index) => {
          const label = item.lastElementChild!
          const range = document.createRange()
          range.selectNodeContents(label)
          const box = boxes[index]
          const text = range.getBoundingClientRect()
          const overlaps = boxes.some(
            (other, i) =>
              i !== index &&
              box.left < other.right &&
              box.right > other.left &&
              box.top < other.bottom &&
              box.bottom > other.top,
          )
          const fits =
            range.getClientRects().length === 1 &&
            text.left >= box.left &&
            text.right <= box.right &&
            box.left >= 0 &&
            box.right <= document.documentElement.clientWidth
          return fits && !overlaps ? [] : [label.textContent]
        })
      })
      expect(issues, `Service layout at ${width}px`).toEqual([])
    }
  })

  test('animates each knot only along its connector', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'no-preference' })
    await page.goto('http://localhost:3000/')
    const nodes = page.locator('[data-home-hero] li[data-slot]')
    await expect(nodes).toHaveCount(6)
    const knotsOnly = () =>
      nodes.evaluateAll((items) =>
        items.every((node) => {
          const connector = node.querySelector('defs path')!
          const knot = node.querySelector('[data-knot]')!
          const animations = node.getAnimations({ subtree: true })
          return (
            knot.getAttribute('href') === `#${connector.id}` &&
            animations.length === 1 &&
            (animations[0].effect as KeyframeEffect).target === knot &&
            animations[0].playState === 'running'
          )
        }),
      )
    for (const width of [375, 1280]) {
      await page.setViewportSize({ width, height: 860 })
      await expect.poll(knotsOnly).toBe(true)
    }
  })

  test('connects the wordmark to the facing edge centers in both languages', async ({ page }) => {
    for (const locale of ['/', '/en']) {
      await page.goto(`http://localhost:3000${locale}`)
      const hero = page.locator('[data-home-hero]')
      await expect(hero.locator('li[data-slot]')).toHaveCount(6)
      for (const width of [320, 375, 639, 640, 768, 1024, 1440]) {
        await page.setViewportSize({ width, height: 900 })
        await expect
          .poll(
            () =>
              hero.evaluate((section, phone) => {
                const word = section.querySelector('#hero-title span')!.getBoundingClientRect()
                const map = section.querySelector('nav')!.getBoundingClientRect()
                const nodes = [...section.querySelectorAll<HTMLElement>('li[data-slot]')]
                const buttons = nodes.map((node) =>
                  node.querySelector('a')!.getBoundingClientRect(),
                )
                return nodes.flatMap((node, index) => {
                  const svg = node.querySelector('svg')!
                  const path = svg.querySelector<SVGPathElement>('defs path')!
                  if (!path.getAttribute('d')) return ['missing curve']
                  const box = buttons[index]
                  const label = node.querySelector('a')!.textContent
                  // Phones stack the buttons in the middle: the top three are entered from the left,
                  // the bottom three from the right. Wider screens enter the side buttons from the
                  // side facing the name and the others from above or below.
                  if (phone && Math.abs(box.left + box.width / 2 - (map.left + map.width / 2)) > 1)
                    return [`${label}: not centered`]
                  const onLeft = box.left + box.width / 2 < word.left + word.width / 2
                  const edge = phone
                    ? index < 3
                      ? 'left'
                      : 'right'
                    : index === 2 || index === 3
                      ? onLeft
                        ? 'right'
                        : 'left'
                      : index < 2
                        ? 'bottom'
                        : 'top'
                  const side = edge === 'left' || edge === 'right'
                  const x =
                    edge === 'left'
                      ? box.left + 0.5
                      : edge === 'right'
                        ? box.right - 0.5
                        : box.left + box.width / 2
                  const y =
                    edge === 'top'
                      ? box.top + 0.5
                      : edge === 'bottom'
                        ? box.bottom - 0.5
                        : box.top + box.height / 2
                  const length = path.getTotalLength()
                  const point = (distance: number) =>
                    path.getPointAtLength(distance).matrixTransform(svg.getScreenCTM()!)
                  const start = point(0)
                  const end = point(length)
                  const before = point(length - 1)
                  if (
                    Math.abs(start.y - (word.top + word.height / 2)) > 1 ||
                    Math.min(Math.abs(start.x - word.left), Math.abs(start.x - word.right)) >
                      word.width * 0.12
                  )
                    return [`${label}: detached from name`]
                  if (
                    Math.hypot(end.x - x, end.y - y) > 0.8 ||
                    Math.abs(side ? end.y - before.y : end.x - before.x) > 0.15
                  )
                    return [`${label}: missed edge midpoint or approach angle`]

                  for (let d = 0; d < length - 1; d += 3) {
                    const p = point(d)
                    if (
                      buttons.some((b) => {
                        const r = b.height / 2
                        const axisX = Math.max(b.left + r, Math.min(b.right - r, p.x))
                        return Math.hypot(p.x - axisX, p.y - b.top - r) < r - 1
                      })
                    )
                      return [`${label}: crossed a button`]
                  }
                  return []
                })
              }, width < 640),
            { message: `Connector geometry on ${locale} at ${width}px` },
          )
          .toEqual([])
      }
    }
  })

  test('shows the Rheino logo in the navbar and as the favicon', async ({ page, request }) => {
    await page.goto('http://localhost:3000/en')
    const home = page.getByRole('banner').getByRole('link', { name: 'Go to the home page' })
    await expect(home.getByRole('img', { name: 'Rheino' })).toBeVisible()
    const icon = await page.locator('link[rel="icon"]').getAttribute('href')
    const response = await request.get(`http://localhost:3000${icon}`)
    expect(response.headers()['content-type']).toContain('image/svg+xml')
  })

  test('lets the navbar fade into the hero until the page scrolls', async ({ page }) => {
    const clear = 'rgba(0, 0, 0, 0)'
    const header = page.locator('[data-site-header]')
    await page.goto('http://localhost:3000/')
    // The landscape starts at the top of the window, behind the clear bar.
    expect((await page.locator('[data-home-hero] img').boundingBox())?.y).toBe(0)
    await expect(header).toHaveCSS('background-color', clear)
    await page.evaluate(() => scrollTo(0, 400))
    await expect(header).not.toHaveCSS('background-color', clear)
    await page.evaluate(() => scrollTo(0, 0))
    await expect(header).toHaveCSS('background-color', clear)
    // Pages without the hero keep the frosted bar.
    await page.goto('http://localhost:3000/en/services/websites')
    await expect(header).not.toHaveCSS('background-color', clear)
  })
})
