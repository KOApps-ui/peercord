import { chromium } from 'playwright'

const b = await chromium.launch({ headless: true })
const ctx = await b.newContext()
const p = await ctx.newPage()
await p.setViewportSize({ width: 1440, height: 900 })
await p.goto('http://localhost:5180/', { waitUntil: 'networkidle' })
await p.waitForTimeout(8000)

const bootVisible = await p.locator('text=Sohbet et. Sunucu yok. Kayıt yok.').count()
console.log('Boot screen visible:', bootVisible > 0)

await p.screenshot({ path: '/tmp/pc-debug-boot2.png', fullPage: false })

// Try clicking the purple "Sunucu Oluştur" button
const btn = p.locator('button:has-text("Sunucu Oluştur")')
console.log('Button count:', await btn.count())
if ((await btn.count()) > 0) {
  await btn.first().click()
  console.log('Clicked button')
  await p.waitForTimeout(3000)
  await p.screenshot({ path: '/tmp/pc-debug-after-click.png', fullPage: false })
  
  const dialogCount = await p.locator('role=dialog').count()
  console.log('Dialog count:', dialogCount)
}

await b.close()
