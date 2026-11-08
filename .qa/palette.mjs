import { chromium } from 'playwright'

async function runTest() {
  const b = await chromium.launch({ headless: true })
  const ctx = await b.newContext({ viewport: { width: 1440, height: 900 } })
  const p = await ctx.newPage()
  
  console.log('PeerCord CommandPalette Kanal Seçimi Testi')
  console.log('==========================================')
  
  await p.goto('http://localhost:5180/', { waitUntil: 'domcontentloaded' })
  await p.waitForTimeout(1500)
  
  await p.getByRole('button', { name: 'Sunucu Oluştur' }).first().click()
  await p.waitForTimeout(400)
  const d = p.locator('[role="dialog"]')
  await d.getByLabel('Sunucu adı').fill('Palette Test Sunusu')
  await p.waitForTimeout(500)
  await d.getByRole('button', { name: 'Sunucu Oluştur' }).click()
  await p.waitForTimeout(4000)
  
  const channels = await p.evaluate(() => {
    var s = window.__pc.useAppStore.getState()
    if (!s || !s.guild) return null
    return s.guild.channels.map(function(c) { return { id: c.id, name: c.name, type: c.type } })
  })
  
  if (!channels || channels.length === 0) {
    console.log('Hata: Kanal bulunamadi')
    await ctx.close()
    await b.close()
    process.exit(1)
  }
  
  console.log('Bulunan kanallar:', JSON.stringify(channels))
  
  var targetChannel = channels.find(function(c) { return c.type === 'text' })
  if (!targetChannel) targetChannel = channels[0]
  
  console.log('Hedef kanal:', targetChannel.name)
  
  // Baslangic aktif kanalini al
  const initialActiveId = await p.evaluate(() => {
    var s = window.__pc.useAppStore.getState()
    return s?.activeChannelId || null
  })
  console.log('Baslangic aktif kanal id:', initialActiveId)
  
  // CommandPalette ac
  await p.evaluate(() => {
    window.__pc.useAppStore.getState().actions.setCommandPaletteOpen(true)
  })
  await p.waitForTimeout(300)
  
  const hasPalette = await p.locator('text=Komut Paleti').isVisible({ timeout: 10000 }).catch(()=>false)
  console.log('Palette acik:', hasPalette)
  
  if (hasPalette) {
    const searchQuery = 'genel'
    const searchInput = p.locator('input[placeholder="Komut ara..."]').first()
    await searchInput.waitFor({ state: 'visible', timeout: 5000 }).catch(()=>{})
    await searchInput.fill(searchQuery)
    await p.waitForTimeout(300)
    
    console.log('Arama yapildi:', searchQuery)
    
    // Aktif kanal butonunu bul (aria-current=true)
    const activeChannelBtn = p.locator('button[aria-current="true"]').first()
    await p.waitForTimeout(200)
    
    if (await activeChannelBtn.isVisible({ timeout: 2000 }).catch(()=>false)) {
      const channelName = await activeChannelBtn.getAttribute('aria-label')
      console.log('Aktif kanal butonu:', channelName)
      
      // Butona tikla
      await p.locator('body').click({ position: { x: 10, y: 10 } }) // Once herhangi bir yer tikla
      await p.waitForTimeout(100)
      
      // Force click ile
      await p.evaluate(() => {
        var buttons = Array.from(document.querySelectorAll('button[aria-current="true"]'))
        if (buttons.length > 0) {
          buttons[0].click()
        }
      })
      await p.waitForTimeout(500)
    }
    
    // Kapat
    await p.evaluate(() => {
      window.__pc.useAppStore.getState().actions.setCommandPaletteOpen(false)
    })
    await p.waitForTimeout(300)
    
    // Aktif kanali kontrol et
    const finalActiveId = await p.evaluate(() => {
      var s = window.__pc.useAppStore.getState()
      return s?.activeChannelId || null
    })
    const finalActiveChannel = await p.evaluate(() => {
      var s = window.__pc.useAppStore.getState()
      return s?.activeChannel?.name || null
    })
    
    console.log('Son aktif kanal id:', finalActiveId)
    console.log('Son aktif kanal:', finalActiveChannel)
    
    // Eger hedef kanal ayni id'ye sahipse GECI
    const targetChannelId = targetChannel.id
    if (finalActiveId === targetChannelId) {
      console.log('TEST: KANAL SEÇİMİ GECI')
    } else {
      // State'de aktif kanal degistir, react hook guncel olmayabilir
      console.log('TEST: KANAL SEÇİMİ KALDI')
    }
  } else {
    console.log('TEST: KOMUT PALETİ KAPALI - KALDI')
  }
  
  await ctx.close()
  await b.close()
}

runTest().catch(function(e) { console.error(e); process.exit(1) })
