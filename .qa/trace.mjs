import { chromium } from 'playwright'
const b = await chromium.launch()
const p = await b.newPage()
p.on('pageerror', e => console.log('PAGEERROR:', e.message, '\n', e.stack?.split('\n').slice(0,25).join('\n')))
p.on('console', m => { if (m.type()==='error') console.log('CONSOLE:', m.text().slice(0,300)) })
await p.goto('http://localhost:5180/', { waitUntil: 'networkidle' })
await p.waitForTimeout(3000)
await b.close()
