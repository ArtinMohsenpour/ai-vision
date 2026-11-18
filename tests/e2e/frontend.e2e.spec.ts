import { expect, test } from '@playwright/test'

test.describe('Frontend', () => {
  test('redirects / to the German start page', async ({ page }) => {
    await page.goto('http://localhost:3000/')
    await expect(page).toHaveURL('http://localhost:3000/de')
    await expect(page.locator('html')).toHaveAttribute('lang', 'de')
    await expect(page.locator('h1').first()).toHaveText(
      'Software, Websites und KI für Ihr Unternehmen',
    )
  })

  test('serves the English start page', async ({ page }) => {
    await page.goto('http://localhost:3000/en')
    await expect(page.locator('html')).toHaveAttribute('lang', 'en')
    await expect(page.locator('h1').first()).toHaveText(
      'Software, websites and AI for your business',
    )
  })
})
