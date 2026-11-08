import { chromium } from 'playwright'
const b = await chromium.launch()
const p = await b.newPage({ viewport: { width: 1440, height: 900 } })
const errs = []
p.on('pageerror', e => errs.push('PE: ' + e.message))
await p.goto('http://localhost:5180/', { waitUntil: 'networkidle' })
await p.waitForTimeout(1500)
// taze oda
await p.getByRole('button', { name: 'Sunucu Oluştur' }).first().click()
await p.waitForTimeout(500)
await p.getByLabel('Sunucu adı').fill('Gece Kulübü')
await p.getByRole('button', { name: 'Sunucu Oluştur' }).last().click()
await p.waitForTimeout(3000)
await p.keyboard.press('Escape')
await p.waitForTimeout(1000)
await p.screenshot({ path: '/tmp/pc-shell-1440.png' })
const box = async (sel) => { const l = p.locator(sel).first(); return await l.boundingBox().catch(()=>null) }
console.log('aside/sidebar boxes:', JSON.stringify(await p.locator('aside, [class*="sidebar"], nav').evaluateAll(els => els.slice(0,6).map(e => ({ tag:e.tagName, cls:e.className.slice(0,80), r:e.getBoundingClientRect().toJSON() })))))
console.log('BODY TEXT:', (await p.locator('body').innerText()).slice(0,300).replace(/\n/g,' | '))
console.log('ERRS:', errs.slice(0,5))
await b.close()
