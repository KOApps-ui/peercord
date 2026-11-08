import { chromium } from 'playwright'
const b = await chromium.launch()
const p1 = await b.newPage(); const p2 = await b.newPage()
for (const [n,p] of [['1',p1],['2',p2]]) {
  p.on('pageerror', e => console.log(n+' ERR', e.message))
  await p.goto('http://localhost:5180/p2p-test.html?room=delib-sabit')
}
await p1.waitForTimeout(15000)
console.log('--- LOG1 ---\n' + await p1.locator('#log').innerText())
console.log('--- LOG2 ---\n' + await p2.locator('#log').innerText())
await b.close()
