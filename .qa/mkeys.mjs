import { chromium } from 'playwright'
const b = await chromium.launch()
const p = await b.newPage({ viewport: { width: 1440, height: 900 } })
await p.goto('http://localhost:5180/', { waitUntil: 'domcontentloaded' }); await p.waitForTimeout(1000)
await p.getByRole('button', { name: 'Sunucu Oluştur' }).first().click(); await p.waitForTimeout(400)
const d = p.locator('[role="dialog"]')
await d.getByLabel('Sunucu adı').fill('Anahtar Testi'); await p.waitForTimeout(400)
await d.getByRole('button', { name: 'Sunucu Oluştur' }).click(); await p.waitForTimeout(2500)
const ta = p.locator('textarea').first()
await ta.click(); await ta.fill('test mesajı'); await ta.press('Enter'); await p.waitForTimeout(1500)
console.log(JSON.stringify(await p.evaluate(() => {
  const s = window.__pc.useAppStore.getState()
  return { active: s.activeChannelId, channels: s.channels.map(c=>({id:c.id,name:c.name})), msgKeys: Object.keys(s.messages), msg: Object.entries(s.messages).map(([k,v])=>[k, v.length, v[0]?.content]) }
}), null, 1))
const rows = await p.locator('main').innerText()
console.log('MAIN:', rows.replace(/\n/g,' | ').slice(0,300))
await b.close()
