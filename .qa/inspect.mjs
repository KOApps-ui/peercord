import { chromium } from 'playwright'

async function main() {
  const browser = await chromium.launch()
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } })
  const page = await context.newPage()

  await page.goto('http://localhost:5180', { waitUntil: 'networkidle' })
  await page.waitForTimeout(3000)

  const attrs = await page.evaluate(() => {
    const els = document.querySelectorAll('[data-rail], [data-sidebar], [data-members]')
    return Array.from(els).map(el => ({
      tag: el.tagName,
      'data-rail': el.getAttribute('data-rail'),
      'data-sidebar': el.getAttribute('data-sidebar'),
      'data-members': el.getAttribute('data-members'),
      className: el.className,
      style: el.getAttribute('style'),
    }))
  })
  console.log('Data elements:', JSON.stringify(attrs, null, 2))

  const allDivs = await page.evaluate(() => {
    const els = document.querySelectorAll('div')
    return Array.from(els).slice(0, 30).map(el => el.className)
  })
  console.log('First 30 div classes:', JSON.stringify(allDivs, null, 2))

  await page.screenshot({ path: '/tmp/pc-inspect.png', fullPage: false })
  await browser.close()
}
main()
