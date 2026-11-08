import { chromium } from 'playwright'
const b = await chromium.launch()
b.on('disconnected', () => console.log('BROWSER DISCONNECTED'))
const ctxA = await b.newContext({viewport:{width:1440,height:900}})
const pa = await ctxA.newPage()
pa.on('close', ()=>console.log('A PAGE CLOSE'))
pa.on('framenavigated', f => { if (f === pa.mainFrame()) console.log('A NAV:', f.url().slice(0,80)) })
pa.on('crash', ()=>console.log('A RENDERER CRASH'))
pa.on('console', m=>{ if(m.type()==='error') console.log('A-C:', m.text().slice(0,120)) })
pa.on('pageerror', e=>console.log('A-PE:', e.message.slice(0,160)))
await pa.goto('http://localhost:5180/', {waitUntil:'domcontentloaded'}); await pa.waitForTimeout(900)
await pa.getByRole('button',{name:'Sunucu Oluştur'}).first().click(); await pa.waitForTimeout(350)
const d = pa.locator('[role="dialog"]')
await d.getByLabel('Sunucu adı').fill('Crash2'); await pa.waitForTimeout(350)
await d.getByRole('button',{name:'Sunucu Oluştur'}).click(); await pa.waitForTimeout(2000)
const url = await pa.evaluate(()=>location.href)
const ctxB = await b.newContext({viewport:{width:1440,height:900}})
const pb = await ctxB.newPage()
pb.on('crash', ()=>console.log('B RENDERER CRASH'))
pb.on('close', ()=>console.log('B PAGE CLOSE'))
await pb.goto(url, {waitUntil:'domcontentloaded'}); await pb.waitForTimeout(4000)
const ta = pa.locator('textarea').first(); await ta.fill('Selam P2P mesaj'); await pa.waitForTimeout(400)
console.log('typed; now enter')
try { await pa.keyboard.press('Enter'); console.log('enter ok') } catch(e) { console.log('enter fail:', e.message.slice(0,60)) }
for (let i=0;i<6;i++) {
  await new Promise(r=>setTimeout(r,700))
  try { const s = await pa.evaluate(()=>({ready:document.readyState, msgs:Object.values(window.__pc.useAppStore.getState().messages).reduce((a,b)=>a+b.length,0)})); console.log(i, s) }
  catch(e){ console.log(i, 'eval fail', e.message.slice(0,50)); break }
}
await b.close()
