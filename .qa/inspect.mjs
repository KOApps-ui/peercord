import { chromium } from 'playwright'
const b = await chromium.launch(); const p = await b.newPage({ viewport:{width:1440,height:900} })
await p.goto('http://localhost:5180/', {waitUntil:'domcontentloaded'}); await p.waitForTimeout(1000)
await p.getByRole('button', { name: 'Sunucu Oluştur' }).first().click(); await p.waitForTimeout(400)
const d = p.locator('[role="dialog"]')
await d.getByLabel('Sunucu adı').fill('İnceleme'); await p.waitForTimeout(400)
await d.getByRole('button', { name: 'Sunucu Oluştur' }).click(); await p.waitForTimeout(2500)
console.log(JSON.stringify(await p.evaluate(()=>{
  const s = window.__pc.useAppStore.getState()
  return {
    members: Object.keys(s.members).length,
    peerIds: s.peers.length,
    channels: s.channels.map(c=>({id:c.id.slice(-4), name:c.name, cat:c.categoryId?.slice(-4)})),
    categories: s.categories.map(c=>({id:c.id.slice(-4), name:c.name})),
    groups: (()=>{ try { return null } catch { return null } })(),
  }
}), null, 1))
console.log('SIDEBAR TEXT:', (await p.locator('aside').first().innerText()).replace(/\n/g,' | ').slice(0,400))
console.log('RAIL BUTTONS:', await p.locator('div[data-rail="true"] button, nav button').count())
await b.close()
