import { chromium } from 'playwright'
const b = await chromium.launch()
const A = await b.newContext({ viewport: { width: 1440, height: 900 } })
const B = await b.newContext({ viewport: { width: 1200, height: 800 } })
const pa = await A.newPage(); const pb = await B.newPage()
const errs = []
for (const [n,p] of [['A',pa],['B',pb]]) {
  p.on('pageerror', e => errs.push(n+' PE: '+e.message))
}
await pa.goto('http://localhost:5180/', { waitUntil: 'domcontentloaded' })
await pa.waitForTimeout(1200)
await pa.getByRole('button', { name: 'Sunucu Oluştur' }).first().click()
await pa.waitForTimeout(400)
await pa.getByLabel('Sunucu adı').fill('Test Odası')
await pa.getByRole('button', { name: 'Sunucu Oluştur' }).last().click()
await pa.waitForTimeout(3500)
await pa.keyboard.press('Escape')
// davet linkini aç
await pa.getByRole('button', { name: /Davet/ }).first().click().catch(async () => {
  await pa.getByText('Davet et').click()
})
await pa.waitForTimeout(900)
const inv = await pa.locator('input').evaluateAll(els => els.map(e => e.value).filter(v => v && v.includes('oda')))
const text = await pa.locator('body').innerText()
const m = text.match(/https?:\/\/[^\s]*#\/oda\/[^\s]*/)
console.log('INVITE(input):', inv)
console.log('INVITE(text):', m && m[0])
const url = (m && m[0]) || inv[0]
if (!url) { console.log('DAVET BULUNAMADI'); await pa.screenshot({path:'/tmp/pc-invite-fail.png'}); await b.close(); process.exit(0) }
await pa.keyboard.press('Escape')
await pb.goto(url, { waitUntil: 'domcontentloaded' })
await pb.waitForTimeout(6000)
await pb.keyboard.press('Escape')
const bodyB = await pb.locator('body').innerText()
console.log('B body:', bodyB.slice(0,250).replace(/\n/g,' | '))
// üye sayısı
const countA = (await pa.locator('body').innerText()).match(/(\d+)\s*üye/)
const countB = bodyB.match(/(\d+)\s*üye/)
console.log('A üye:', countA && countA[1], 'B üye:', countB && countB[1])
await pa.screenshot({ path: '/tmp/pc-A.png' })
await pb.screenshot({ path: '/tmp/pc-B.png' })
console.log('ERRS:', errs.slice(0,6))
await b.close()
