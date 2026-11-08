import { chromium } from 'playwright'
const b = await chromium.launch({ headless: true })
const p = await b.newPage({ viewport: { width: 1440, height: 900 } })
await p.goto('http://localhost:5180/', { waitUntil: 'networkidle' })
await p.waitForTimeout(4000)
await p.screenshot({ path: '/tmp/dbg-wait.png' })
console.log('BODY:', (await p.locator('body').innerText()).slice(0, 1500))
await b.close()
