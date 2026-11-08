import { chromium } from 'playwright'
const b = await chromium.launch(); const p = await b.newPage({ viewport:{width:1440,height:900} })
await p.goto('http://localhost:5180/', {waitUntil:'domcontentloaded'}); await p.waitForTimeout(900)
await p.getByRole('button', { name: 'Sunucu Oluştur' }).first().click(); await p.waitForTimeout(350)
const d = p.locator('[role="dialog"]'); await d.getByLabel('Sunucu adı').fill('PX'); await p.waitForTimeout(300)
await d.getByRole('button',{name:'Sunucu Oluştur'}).click(); await p.waitForTimeout(2000)
console.log(await p.evaluate(()=>{
  const e = document.elementFromPoint(24, 894)
  const chain=[]; let cur=e
  for(let i=0;i<7 && cur;i++){ chain.push({tag:cur.tagName, cls:String(cur.className).slice(0,90), y:Math.round(cur.getBoundingClientRect().y), h:Math.round(cur.getBoundingClientRect().height)}); cur=cur.parentElement }
  return { outer: e?.outerHTML?.slice(0,200), chain }
}))
await b.close()
