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

  await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
  await expect(page.locator('.brand-photo-mark img')).toHaveAttribute('src', /shanto-mathew-headshot\.jpeg$/)
  await expect(page.getByRole('img', { name: /Shanto Mathew smiling in a suit/i })).toHaveAttribute(
    'src',
    /shanto-mathew-headshot\.jpeg$/,
  )
  await expect(page.getByRole('link', { name: /Explore the work/i })).toBeVisible()
  await expect(page.getByRole('link', { name: /Start a conversation/i })).toBeVisible()

  if (!isMobile) {
    for (const section of ['Work', 'Skills', 'Method', 'Contact']) {
      await page.getByRole('navigation', { name: 'Primary navigation' }).getByRole('link', { name: section, exact: true }).click()
      await expect(page).toHaveURL(new RegExp(`#${section.toLowerCase()}`))
    }
  }

  await page.getByRole('link', { name: /Explore the work/i }).click()
  await expect(page.getByRole('heading', { name: /Open systems/i })).toBeInViewport()

  const stageTabs = page.getByRole('tab', { name: /Discover|Design|Deploy|Observe/ })
  await expect(stageTabs).toHaveCount(4)
  for (const label of ['Discover', 'Design', 'Deploy', 'Observe']) {
    await page.getByRole('tab', { name: new RegExp(label) }).click()
    await expect(page.getByRole('tab', { name: new RegExp(label) })).toHaveAttribute('aria-selected', 'true')
  }

  const relayTabs = page.getByRole('tab', { name: /Grok Bot|Claude Code|Codex|OpenClaw|Hermes agents/ })
  await expect(relayTabs).toHaveCount(5)
  for (const label of ['Grok Bot', 'Claude Code', 'Codex', 'OpenClaw', 'Hermes agents']) {
    await page.getByRole('tab', { name: new RegExp(label) }).click()
    await expect(page.getByRole('tab', { name: new RegExp(label) })).toHaveAttribute('aria-selected', 'true')
  }

  const skillTabs = page.getByRole('tab', { name: /AI\/ML|Security Automation|Python & Cloud|Data & Backends/ })
  await expect(skillTabs).toHaveCount(4)
  for (const label of ['AI/ML', 'Security Automation', 'Python & Cloud', 'Data & Backends']) {
    await page.getByRole('tab', { name: new RegExp(label.replace('&', '\\&')) }).click()
  }

  const principleTabs = page.getByRole('tab', { name: /Ship proof|Keep humans|Automate|Make systems/ })
  await expect(principleTabs).toHaveCount(4)
  for (const label of ['Ship proof', 'Keep humans', 'Automate the repetitive path', 'Make systems inspectable']) {
    await page.getByRole('tab', { name: new RegExp(label) }).click()
  }

  await page.getByRole('button', { name: /Security AI/ }).click()
  const demoGrid = page.locator('.demo-grid')
  await expect(demoGrid.getByRole('heading', { name: 'SOC AI Agent Demo' })).toBeVisible()
  await expect(demoGrid.getByRole('heading', { name: 'Grok Medical Front Desk' })).toHaveCount(0)

  await page.getByRole('button', { name: /Voice AI/ }).click()
  await expect(demoGrid.getByRole('heading', { name: 'Grok Medical Front Desk' })).toBeVisible()
  await expect(demoGrid.getByRole('heading', { name: 'SOC AI Agent Demo' })).toHaveCount(0)

  await page.getByRole('button', { name: /Revenue AI/ }).click()
  await expect(demoGrid.getByRole('heading', { name: 'Agentic Marketing Operations Workbench' })).toBeVisible()
  await expect(demoGrid.getByRole('heading', { name: 'Flux Atlas' })).toHaveCount(0)

  await page.getByRole('button', { name: /Creative Systems/ }).click()
  await expect(demoGrid.getByRole('heading', { name: 'Flux Atlas' })).toBeVisible()
  await expect(demoGrid.getByRole('heading', { name: 'SOC AI Agent Demo' })).toHaveCount(0)

  await page.getByRole('button', { name: /All/ }).click()
  await expect(demoGrid.getByRole('heading', { name: 'SOC AI Agent Demo' })).toBeVisible()

  const liveLinks = demoGrid.getByRole('link', { name: /Open live demo/i })
  await expect(liveLinks).toHaveCount(9)
  await expect(liveLinks.first()).toHaveAttribute('href', /https:\/\/.+\.netlify\.app/)
  if (productionTarget) {
    const demoUrls = await liveLinks.evaluateAll((links) => links.map((link) => (link as HTMLAnchorElement).href))
    for (const url of demoUrls) {
      const response = await page.request.get(url, { timeout: 20000 })
      expect(response.status(), `${url} should be reachable`).toBeLessThan(400)
    }
  }

  await page.getByRole('link', { name: /Start a conversation/i }).click()
  await expect(page.getByRole('heading', { name: /Have a hard problem/i })).toBeInViewport()
  for (const label of ['Security automation', 'Agent workflow', 'AI product', 'Voice systems']) {
    await page.getByRole('button', { name: label, exact: true }).click()
    await expect(page.getByRole('button', { name: label, exact: true })).toHaveAttribute('aria-pressed', 'true')
  }
  await page.getByLabel('Name').fill('Avery Recruiter')
  await page.getByLabel('Email').fill('avery@example.com')
  await page.getByLabel('Context').fill('Security platform role')
  await page.getByLabel('Message').fill('I would like to discuss an AI security automation role with Shanto.')
  await page.getByRole('button', { name: /Send the signal/i }).click()
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
