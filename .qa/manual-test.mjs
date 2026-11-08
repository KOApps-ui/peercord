import { chromium } from 'playwright'

const b = await chromium.launch({ headless: true })
const ctx = await b.newContext()
const p = await ctx.newPage()
await p.setViewportSize({ width: 1440, height: 900 })
await p.goto('http://localhost:5180/', { waitUntil: 'networkidle' })
await p.waitForTimeout(5000)
await p.screenshot({ path: '/tmp/pc-manual-test.png', fullPage: false })
console.log('Done')
await b.close()
