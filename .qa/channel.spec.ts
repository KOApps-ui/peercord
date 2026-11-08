/* ------------------------------------------------------------------ *
 * PeerCord — QA: Kanal kimliği ve emoji picker testi
 * ------------------------------------------------------------------ */
import { test, expect } from '@playwright/test'

const BASE = 'http://localhost:5181'

test.describe('Kanal rozeti ve EmojiPicker', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(BASE)
    // Sunucu oluşturma sayfasını bekle
    await page.waitForSelector('button:has-text("Sunucu Oluştur")', { timeout: 30000 })
    await page.waitForTimeout(1000)

    // Sunucu oluştur
    await page.click('button:has-text("Sunucu Oluştur")')
    await page.waitForSelector('[role="dialog"]', { timeout: 10000 })
    
    const createModal = page.locator('[role="dialog"]').filter({ hasText: /Sunucu Oluştur/i })
    await expect(createModal).toBeVisible()
    
    await createModal.locator('input[placeholder*="isim" i], input[placeholder*="ad" i]').first().fill('Test Sunucusu')
    await createModal.locator('button:has-text("Oluştur")').click()
    
    // Sunucunun yüklenmesini bekle - sidebar görünene kadar
    await page.waitForSelector('[data-sidebar]', { timeout: 30000 })
    await page.waitForTimeout(2000)
  })

  test('yeni kanal oluştur (emoji logolu) -> mesaj at -> rozet görünmeli -> tıkla -> profil açılmalı', async ({ page }) => {
    // 1. Sidebar'da kanal ekle butonunu bul (ilk kategorideki + butonu)
    const createChannelBtn = page.locator('[data-sidebar] button[aria-label*="kanal ekle"], [data-sidebar] button[aria-label*="Kanal ekle"]').first()
    await expect(createChannelBtn).toBeVisible({ timeout: 10000 })
    await createChannelBtn.click()
    await page.waitForTimeout(500)

    // 2. Kanal oluşturma modalı açılmalı
    const modal = page.locator('[role="dialog"]').filter({ hasText: /Yeni kanal oluştur/i })
    await expect(modal).toBeVisible({ timeout: 5000 })

    // 3. Kanal adı gir
    await modal.locator('input[placeholder*="kanal" i]').first().fill('test-kanal')

    // 4. Emoji logo seç (ilk emoji - 💬)
    // Emoji picker butonuna tıkla
    const emojiPickerBtn = modal.locator('button:has-text("💬")').first()
    if (await emojiPickerBtn.count() > 0) {
      await emojiPickerBtn.click()
      await page.waitForTimeout(300)
      // İlk emojiyi seç (😀)
      const firstEmoji = modal.locator('button:has-text("😀")').first()
      if (await firstEmoji.count() > 0) {
        await firstEmoji.click()
      }
    }

    // 5. Oluştur butonuna bas
    await modal.locator('button:has-text("Oluştur")').click()
    await page.waitForTimeout(1500)

    // 6. Yeni kanalın listede görünmesini bekle ve tıkla
    const newChannelItem = page.locator('[data-sidebar] >> text=test-kanal').first()
    await expect(newChannelItem).toBeVisible({ timeout: 5000 })
    await newChannelItem.click()
    await page.waitForTimeout(500)

    // 7. Mesaj gönder
    const msgInput = page.locator('textarea[placeholder*="mesaj" i], textarea[placeholder*="yaz" i], div[contenteditable="true"]').first()
    await expect(msgInput).toBeVisible({ timeout: 5000 })
    await msgInput.fill('Test mesajı kanal rozeti için')
    await msgInput.press('Enter')
    await page.waitForTimeout(1000)

    // 8. Mesajda yazar adı yanında rozet (kanal logosu) olmalı
    const message = page.locator('[id^="msg-"]').last()
    await expect(message).toBeVisible()

    // Rozet: kanal logosu (emoji) yazar adı yanında
    const badge = message.locator('button[aria-label*="test-kanal"]').first()
    await expect(badge).toBeVisible({ timeout: 5000 })
    console.log('✅ Rozet (kanal logosu) mesajda yazar adı yanında görünüyor')

    // 9. Rozete tıkla -> kanal profili açılmalı
    await badge.click()
    await page.waitForTimeout(500)

    const channelProfileModal = page.locator('[role="dialog"]').filter({ hasText: /test-kanal/i })
    await expect(channelProfileModal).toBeVisible({ timeout: 5000 })
    console.log('✅ Kanal profili modalı açıldı')

    // Profilde beklenen öğeler
    await expect(channelProfileModal.locator('button:has-text("Kanala git")')).toBeVisible()
    
    // Modalı kapat
    await channelProfileModal.locator('button:has-text("Kapat")').click()
    await page.waitForTimeout(300)
  })

  test('Emoji picker açılır -> boyut 360x420\'den büyük DEĞİL olmalı -> kategori sekmeleri var', async ({ page }) => {
    // Mesaj input alanını bul
    const msgInput = page.locator('textarea[placeholder*="mesaj" i], textarea[placeholder*="yaz" i], div[contenteditable="true"]').first()
    await expect(msgInput).toBeVisible({ timeout: 5000 })

    // Emoji picker trigger butonunu bul (genelde 😀 butonu)
    const emojiTrigger = page.locator('button[aria-label="Emoji seçici"], button:has-text("😀")').first()
    await expect(emojiTrigger).toBeVisible({ timeout: 5000 })
    await emojiTrigger.click()
    await page.waitForTimeout(300)

    // Popover content görünmeli
    const pickerContent = page.locator('[role="dialog"] >> .. >> div[class*="grid"], div[class*="PopoverContent"] >> ..').first()
    
    // Bounding box ölçümü - popover content'i bul
    const popover = page.locator('div[style*="340"], div[class*="w-["]').first()
    const box = await popover.boundingBox().catch(() => null)

    if (box) {
      console.log(`Emoji picker boyutu: ${Math.round(box.width)}x${Math.round(box.height)}`)
      expect(box.width).toBeLessThanOrEqual(360)
      expect(box.height).toBeLessThanOrEqual(420)
    } else {
      // Alternatif ölçüm
      const content = page.locator('div:has(button:has-text("😀")) >> ..').first()
      const box2 = await content.boundingBox()
      if (box2) {
        console.log(`Emoji picker boyutu (alt): ${Math.round(box2.width)}x${Math.round(box2.height)}`)
        expect(box2.width).toBeLessThanOrEqual(360)
        expect(box2.height).toBeLessThanOrEqual(420)
      }
    }

    // Kategori sekmeleri var mı?
    const categories = ['Gülümler', 'İnsanlar', 'Hayvanlar', 'Yemek', 'Etkinlik', 'Seyahat', 'Nesneler', 'Semboller', 'Bayraklar']
    let foundCategories = 0
    for (const cat of categories) {
      const tab = page.locator(`button:has-text("${cat}")`).first()
      if (await tab.count() > 0) {
        console.log(`✅ Kategori sekmesi bulundu: ${cat}`)
        foundCategories++
      }
    }
    expect(foundCategories).toBeGreaterThan(5)

    // Arama inputu var mı?
    const searchInput = page.locator('input[placeholder*="ara" i], input[placeholder*="Emoji ara"]').first()
    await expect(searchInput).toBeVisible({ timeout: 3000 })
    console.log('✅ Emoji arama inputu var')

    // Kapat (ESC)
    await page.keyboard.press('Escape')
    await page.waitForTimeout(200)
  })
})

test.describe('Ekran görüntüleri', () => {
  test('Kanal rozeti ve EmojiPicker ekran görüntüsü', async ({ page }) => {
    await page.goto(BASE)
    await page.waitForSelector('button:has-text("Sunucu Oluştur")', { timeout: 30000 })
    await page.waitForTimeout(1000)

    // Sunucu oluştur
    await page.click('button:has-text("Sunucu Oluştur")')
    await page.waitForSelector('[role="dialog"]', { timeout: 10000 })
    
    const createModal = page.locator('[role="dialog"]').filter({ hasText: /Sunucu Oluştur/i })
    await createModal.locator('input[placeholder*="isim" i], input[placeholder*="ad" i]').first().fill('SS Test Sunucusu')
    await createModal.locator('button:has-text("Oluştur")').click()
    
    await page.waitForSelector('[data-sidebar]', { timeout: 30000 })
    await page.waitForTimeout(2000)

    // Kanal oluştur ve mesaj at
    const createBtn = page.locator('[data-sidebar] button[aria-label*="kanal ekle"]').first()
    if (await createBtn.count() > 0) {
      await createBtn.click()
      const modal = page.locator('[role="dialog"]').filter({ hasText: /Yeni kanal oluştur/i })
      await expect(modal).toBeVisible({ timeout: 5000 })
      await modal.locator('input[placeholder*="kanal" i]').first().fill('ss-kanal')
      await modal.locator('button:has-text("Oluştur")').click()
      await page.waitForTimeout(1500)

      const chItem = page.locator('[data-sidebar] >> text=ss-kanal').first()
      await chItem.click()
      await page.waitForTimeout(500)

      const msgInput = page.locator('textarea[placeholder*="mesaj" i], div[contenteditable="true"]').first()
      await msgInput.fill('Test mesajı rozet için')
      await msgInput.press('Enter')
      await page.waitForTimeout(1000)

      // Ekran görüntüsü 1: Kanal rozeti
      await page.screenshot({ path: '/tmp/pc-channel-1440.png', fullPage: false })
      console.log('📸 /tmp/pc-channel-1440.png kaydedildi')
    }

    // Emoji picker aç
    const emojiTrigger = page.locator('button[aria-label="Emoji seçici"], button:has-text("😀")').first()
    await emojiTrigger.click()
    await page.waitForTimeout(300)

    // Ekran görüntüsü 2: Emoji picker
    await page.screenshot({ path: '/tmp/pc-emoji-1440.png', fullPage: false })
    console.log('📸 /tmp/pc-emoji-1440.png kaydedildi')
  })
})