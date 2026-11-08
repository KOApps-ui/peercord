import { chromium } from 'playwright'

async function main() {
  const browser = await chromium.launch()
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } })
  const page = await context.newPage()

  await page.goto('http://localhost:5180', { waitUntil: 'networkidle' })
  await page.waitForTimeout(5000)

  // Sayfa içeriğini al
  const content = await page.evaluate(() => {
    return {
      title: document.title,
      bodyText: document.body.innerText?.substring(0, 500),
      buttons: Array.from(document.querySelectorAll('button')).map(b => b.textContent?.trim()).filter(Boolean),
      h1: Array.from(document.querySelectorAll('h1')).map(h => h.textContent?.trim()),
      url: window.location.href,
    }
  })
  console.log('Page content:', JSON.stringify(content, null, 2))

  await page.screenshot({ path: '/tmp/pc-debug2.png', fullPage: false })
  await browser.close()
}
main()
