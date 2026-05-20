import { expect, test } from '@playwright/test'
import type { Page } from '@playwright/test'

const productionTarget = Boolean(process.env.PLAYWRIGHT_BASE_URL)

function collectFailures(page: Page) {
  const failures: string[] = []
  page.on('pageerror', (error) => failures.push(`pageerror: ${error.message}`))
  page.on('console', (message) => {
    if (message.type() !== 'error') return
    if (!productionTarget && message.text().includes('Failed to load resource')) return
    failures.push(`console: ${message.text()}`)
  })
  page.on('requestfailed', (request) => {
    const url = new URL(request.url())
    if (!productionTarget && ['/api/health', '/'].includes(url.pathname)) return
    failures.push(`requestfailed: ${request.url()} ${request.failure()?.errorText ?? ''}`)
  })
  page.on('response', (response) => {
    const current = page.url() ? new URL(page.url()) : null
    const target = new URL(response.url())
    if (!productionTarget && ['/api/health', '/api/contact', '/'].includes(target.pathname)) return
    if (current && current.origin === target.origin && response.status() >= 400) {
      failures.push(`http ${response.status()}: ${response.url()}`)
    }
  })
  return failures
}

test('portfolio primary controls, layout, and contact workflow work', async ({ page, isMobile }) => {
  const failures = collectFailures(page)
  await page.goto('/')

  await expect(page.getByRole('heading', { name: 'Shanto Mathew' })).toBeVisible()
  await expect(page.getByRole('link', { name: /View demo gallery/i })).toBeVisible()
  await expect(page.getByRole('link', { name: /Get in touch/i })).toBeVisible()

  await page.getByRole('link', { name: /View demo gallery/i }).click()
  await expect(page.getByRole('heading', { name: /Live Netlify demo gallery/i })).toBeInViewport()
  await page.getByRole('button', { name: 'Voice AI' }).click()
  await expect(page.getByRole('heading', { name: 'Grok Medical Front Desk' })).toBeVisible()
  await expect(page.getByRole('heading', { name: 'SOC AI Agent Demo' })).toHaveCount(0)
  await page.getByRole('button', { name: 'All' }).click()
  await expect(page.getByRole('heading', { name: 'SOC AI Agent Demo' })).toBeVisible()

  const liveLinks = page.getByRole('link', { name: /Open live demo/i })
  await expect(liveLinks.first()).toHaveAttribute('href', /https:\/\/.+\.netlify\.app/)

  await page.getByRole('link', { name: /Get in touch/i }).click()
  await expect(page.getByRole('heading', { name: /Let us build something inspectable/i })).toBeInViewport()
  await page.getByLabel('Name').fill('Avery Recruiter')
  await page.getByLabel('Email').fill('avery@example.com')
  await page.getByLabel('Company or context').fill('Security platform role')
  await page.getByLabel('Message').fill('I would like to discuss an AI security automation role with Shanto.')
  await page.getByRole('button', { name: /Send message/i }).click()
  await expect(page.getByRole('status')).toContainText(/Message validated|Netlify form capture|production/i)

  const overflow = await page.evaluate(() => ({
    scrollWidth: document.documentElement.scrollWidth,
    innerWidth: window.innerWidth,
  }))
  expect(overflow.scrollWidth).toBeLessThanOrEqual(overflow.innerWidth)

  const targetSizes = await page.locator('a, button, input, textarea').evaluateAll((elements) =>
    elements
      .filter((element) => {
        const style = window.getComputedStyle(element)
        const rect = element.getBoundingClientRect()
        return style.display !== 'none' && style.visibility !== 'hidden' && rect.width > 0 && rect.height > 0
      })
      .map((element) => {
        const rect = element.getBoundingClientRect()
        return { width: rect.width, height: rect.height, tag: element.tagName }
      }),
  )
  for (const target of targetSizes) {
    if (target.tag === 'TEXTAREA') {
      expect(target.height).toBeGreaterThanOrEqual(44)
    } else {
      expect(target.width).toBeGreaterThanOrEqual(isMobile ? 36 : 34)
      expect(target.height).toBeGreaterThanOrEqual(36)
    }
  }

  expect(failures).toEqual([])
})
