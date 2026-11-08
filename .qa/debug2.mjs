import { chromium } from 'playwright'
const b = await chromium.launch()
const A = await b.newContext({ viewport: { width: 1440, height: 900 } })
const B = await b.newContext({ viewport: { width: 1440, height: 900 } })
const pa = await A.newPage(); const pb = await B.newPage()
const dump = async (p, tag) => {
  const s = await p.evaluate(() => {
    const st = window.__pc?.useAppStore?.getState?.()
    if (!st) return 'no-store'
    return { ready: st.ready, guild: st.guild?.name ?? null, roomId: st.roomId, peers: st.peers?.length, conn: st.connection, err: st.error, msgs: Object.keys(st.messages||{}).map(k=>[k, st.messages[k].length]) }
  })
  console.log(tag, JSON.stringify(s))
}
await pa.goto('http://localhost:5180/', { waitUntil: 'domcontentloaded' })
await pa.waitForTimeout(1200)
await pa.getByRole('button', { name: 'Sunucu Oluştur' }).first().click()
await pa.waitForTimeout(400)
await pa.locator('[role="dialog"]').getByLabel('Sunucu adı').fill('Debug Odası')
await pa.waitForTimeout(400)
await pa.locator('[role="dialog"]').getByRole('button', { name: 'Sunucu Oluştur' }).click()
await pa.waitForTimeout(3000)
await pa.keyboard.press('Escape')
await dump(pa, 'A@3s')
await pa.waitForTimeout(500)
const url = await pa.evaluate(() => location.href)
console.log('URL:', url)
await pb.goto(url, { waitUntil: 'domcontentloaded' })
for (let i=0;i<8;i++) { await pb.waitForTimeout(2500); await dump(pa, 'A'); await dump(pb, 'B') }
await pa.screenshot({ path: '/tmp/pc-vis-A.png' })
await pb.screenshot({ path: '/tmp/pc-vis-B.png' })
await b.close()
