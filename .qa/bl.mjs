import { chromium } from 'playwright'
const b = await chromium.launch(); const p = await b.newPage({ viewport:{width:1440,height:900} })
await p.goto('http://localhost:5180/', {waitUntil:'domcontentloaded'}); await p.waitForTimeout(900)
await p.getByRole('button', { name: 'Sunucu Oluştur' }).first().click(); await p.waitForTimeout(350)
const d = p.locator('[role="dialog"]'); await d.getByLabel('Sunucu adı').fill('BL'); await p.waitForTimeout(300)
await d.getByRole('button',{name:'Sunucu Oluştur'}).click(); await p.waitForTimeout(2000)
console.log(JSON.stringify(await p.evaluate(()=>{
  const els=[...document.querySelectorAll('*')].filter(e=>{const r=e.getBoundingClientRect();return r.y>860 && r.x<80 && r.width>10 && r.height>10}).slice(0,6)
  return els.map(e=>({tag:e.tagName, cls:e.className.toString().slice(0,110), y:Math.round(e.getBoundingClientRect().y), html:e.outerHTML.slice(0,120)}))
}),null,1))
await b.close()
