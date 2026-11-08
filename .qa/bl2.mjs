import { chromium } from 'playwright'
const b = await chromium.launch(); const p = await b.newPage({ viewport:{width:1440,height:900} })
await p.goto('http://localhost:5180/', {waitUntil:'domcontentloaded'}); await p.waitForTimeout(900)
await p.getByRole('button', { name: 'Sunucu Oluştur' }).first().click(); await p.waitForTimeout(350)
const d = p.locator('[role="dialog"]'); await d.getByLabel('Sunucu adı').fill('BL'); await p.waitForTimeout(300)
await d.getByRole('button',{name:'Sunucu Oluştur'}).click(); await p.waitForTimeout(2000)
console.log(await p.evaluate(()=>{
  const el=[...document.querySelectorAll('button[aria-haspopup="dialog"]')][0]
  if(!el) return 'yok'
  const chain=[]; let cur=el
  for(let i=0;i<6 && cur;i++){ chain.push(cur.tagName+'.'+String(cur.className).slice(0,70)); cur=cur.parentElement }
  return { html: el.outerHTML.slice(0,300), chain }
}))
await b.close()
