import { chromium } from 'playwright'

async function main() {
  const browser = await chromium.launch()
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } })
  const page = await context.newPage()

  await page.goto('http://localhost:5180', { waitUntil: 'networkidle' })
  await page.waitForTimeout(3000)

  // Check what buttons exist
  const buttons = await page.evaluate(() => {
    return Array.from(document.querySelectorAll('button')).map(b => ({
      text: b.textContent?.trim(),
      class: b.className,
      visible: b.offsetParent !== null,
    }))
  })
  console.log('Buttons:', JSON.stringify(buttons, null, 2))

  // Click first "Sunucu Oluştur"
  await page.click('button:has-text("Sunucu Oluştur")', { force: true })
  await page.waitForTimeout(2000)

  // Check after click
  const after = await page.evaluate(() => {
    const modals = document.querySelectorAll('[role="dialog"], [data-modal]')
    return Array.from(modals).map(m => ({
      role: m.getAttribute('role'),
      'data-modal': m.getAttribute('data-modal'),
      class: m.className,
      visible: m.offsetParent !== null,
    }))
  })
  console.log('After click modals:', JSON.stringify(after, null, 2))

  await page.screenshot({ path: '/tmp/pc-debug.png', fullPage: false })
  await browser.close()
}
main()
