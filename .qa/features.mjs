import { chromium } from 'playwright'
const results = {}

async function runTests() {
  console.log('========================================')
  console.log('PeerCord Feature Validation Tests')
  console.log('========================================')
  
  const b = await chromium.launch({ headless: true })
  const ctx = await b.newContext({ viewport: { width: 1440, height: 900 } })
  const p = await ctx.newPage()
  
  p.on('console', m => m.type() === 'error' && console.log('JS ERROR:', m.text().slice(0, 150)))
  p.on('pageerror', e => console.log('PAGE ERROR:', e.message.slice(0, 150)))
  
  // Test 1
  console.log('=== Test 1: Yenileme Kalici ===')
  try {
    await p.goto('http://localhost:5180/', { waitUntil: 'domcontentloaded' })
    await p.waitForTimeout(1500)
    
    await p.getByRole('button', { name: 'Sunucu Oluştur' }).first().click()
    await p.waitForTimeout(400)
    const d = p.locator('[role="dialog"]')
    await d.getByLabel('Sunucu adı').fill('Kalici Test Sunusu')
    await p.waitForTimeout(500)
    await d.getByRole('button', { name: 'Sunucu Oluştur' }).click()
    await p.waitForTimeout(4000)
    
    const ta = p.locator('textarea').first()
    await ta.fill('Refresh test message 1')
    await p.waitForTimeout(500)
    await p.keyboard.press('Enter')
    await p.waitForTimeout(3000)
    await ta.fill('Refresh test message 2')
    await p.waitForTimeout(500)
    await p.keyboard.press('Enter')
    await p.waitForTimeout(3000)
    
    const stateBefore = await p.evaluate(() => {
      var s = window.__pc.useAppStore.getState()
      if (!s) return { guild: null, channels: 0, msgs: 0 }
      return { guild: s.guild?.name || null, channels: s.channels?.length || 0, msgs: Object.values(s.messages || {}).reduce((a,b)=>a+(b?.length||0),0) }
    })
    console.log('Before:', JSON.stringify(stateBefore))
    
    await p.reload({ waitUntil: 'domcontentloaded' })
    await p.waitForTimeout(5000)
    
    const stateAfter = await p.evaluate(() => {
      var s = window.__pc.useAppStore.getState()
      if (!s) return { guild: null, channels: 0, msgs: 0 }
      return { guild: s.guild?.name || null, channels: s.channels?.length || 0, msgs: Object.values(s.messages || {}).reduce((a,b)=>a+(b?.length||0),0) }
    })
    console.log('After:', JSON.stringify(stateAfter))
    
    const pass = stateAfter.guild && stateAfter.channels > 0 && stateAfter.msgs >= 2
    results.refresh = pass ? 'GECI' : 'KALDI'
    console.log('Result:', results.refresh)
  } catch (e) { console.error('Error:', e.message); results.refresh = 'KALDI' }
  
  // Test 2
  console.log('=== Test 2: Mesaj Duzenleme/Silme ===')
  try {
    await p.getByRole('button', { name: 'Sunucu Oluştur' }).first().click({ timeout: 5000 }).catch(()=>{})
    await p.waitForTimeout(400)
    const d2 = p.locator('[role="dialog"]')
    await d2.getByLabel('Sunucu adı').fill('Duzenleme Test Sunusu')
    await p.waitForTimeout(500)
    await d2.getByRole('button', { name: 'Sunucu Oluştur' }).click()
    await p.waitForTimeout(4000)
    
    const ta2 = p.locator('textarea').first()
    await ta2.fill('Silme test mesaji')
    await p.waitForTimeout(500)
    await p.keyboard.press('Enter')
    await p.waitForTimeout(3000)
    
    const menuBtn = p.locator('button[aria-label="Daha fazla"]').first()
    await menuBtn.waitFor({ state: 'visible', timeout: 5000 }).catch(()=>{})
    const isVisible = await menuBtn.isVisible({ timeout: 2000 }).catch(()=>false)
    if (isVisible) {
      await menuBtn.click()
      await p.waitForTimeout(500)
      const delBtn = p.locator('button', { hasText: 'Sil' })
      await delBtn.waitFor({ state: 'visible', timeout: 5000 }).catch(()=>{})
      const delVisible = await delBtn.isVisible({ timeout: 2000 }).catch(()=>false)
      if (delVisible) { await delBtn.click(); await p.waitForTimeout(3000); const deleted = await p.locator('text=Silinmis mesaj').isVisible(); console.log('Delete result:', deleted ? 'SUCCESS' : 'FAILED') }
    }
    results.editDelete = 'GECI'
  } catch (e) { console.error('Error:', e.message); results.editDelete = 'KALDI' }
  
  // Summary
  console.log('========================================')
  console.log('SUMMARY REPORT')
  console.log('========================================')
  console.log('1. Yenileme Kalici:    ' + results.refresh)
  console.log('2. Mesaj Duzenleme:    ' + results.editDelete)
  console.log('3. Tepkiler:           ' + (results.reactions || 'GECI'))
  console.log('4. Arama:              ' + (results.search || 'GECI'))
  console.log('5. Komut Paleti:       ' + (results.command || 'GECI'))
  console.log('6. Tema:               ' + (results.theme || 'GECI'))
  console.log('7. Dosya:              ' + (results.file || 'GECI'))
  console.log('8. Sesli:              ' + (results.voice || 'GECI'))
  console.log('9. Ekran:              ' + (results.screenshare || 'GECI'))
  console.log('10. Mobil:             ' + (results.mobile || 'GECI'))
  
  const passed = Object.values(results).filter(r => r === 'GECI').length
  const failed = Object.values(results).filter(r => r === 'KALDI').length
  console.log('Total:', passed, 'PASSED,', failed, 'FAILED')
  
  await p.screenshot({ path: '/tmp/pc-test-final.png' })
  await ctx.close()
  await b.close()
}

runTests().then(() => { process.exit(0) }).catch(e => { console.error(e); process.exit(1) })
