import { chromium } from 'playwright'
const b = await chromium.launch()
const p = await b.newPage({ viewport: { width: 1440, height: 900 } })
const errs = []
p.on('console', m => { if (m.type() === 'error') errs.push(m.text()) })
p.on('pageerror', e => errs.push('PAGEERROR: ' + e.message))
await p.goto('http://localhost:5180/', { waitUntil: 'networkidle' })
await p.waitForTimeout(2500)
await p.screenshot({ path: '/tmp/pc-1-onboarding.png' })
console.log('TITLE:', await p.title())
console.log('BODY:', (await p.locator('body').innerText()).slice(0, 800))
console.log('BUTTONS:', await p.locator('button').allInnerTexts())
console.log('ERRORS:', errs.slice(0, 10))
await b.close()
