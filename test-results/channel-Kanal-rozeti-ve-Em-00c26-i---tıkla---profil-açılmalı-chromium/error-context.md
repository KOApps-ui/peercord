# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: channel.spec.ts >> Kanal rozeti ve EmojiPicker >> yeni kanal oluştur (emoji logolu) -> mesaj at -> rozet görünmeli -> tıkla -> profil açılmalı
- Location: .qa/channel.spec.ts:30:3

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: locator('[role="dialog"]').filter({ hasText: /Yeni kanal/i })
Expected: visible
Timeout: 5000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" locator('[role="dialog"]').filter({ hasText: /Yeni kanal/i }) with timeout 5000ms
  - waiting for locator('[role="dialog"]').filter({ hasText: /Yeni kanal/i })

```

```yaml
- button "Sunucu ayarları"
- button "Test Sunucusu": TS
- button "Yeni sunucu oluştur"
- text: G6
- button "Kullanıcı ayarları"
- complementary:
  - button "Test Sunucusu sunucu ayarları":
    - text: T
    - paragraph: Test Sunucusu
    - paragraph: 1 üye
  - button "Davet linki oluştur": Davet et
  - paragraph: GENEL
  - button "GENEL kategorisine kanal ekle"
  - button "genel"
  - button "rastgele"
  - paragraph: SES
  - button "SES kategorisine kanal ekle"
  - button "Genel Ses"
  - button "Oyun Odası"
  - button "Üye listesini aç/kapa": Üyeler
  - text: G6
  - paragraph: Gezgin-65425DF0
  - text: Çevrimiçi
  - button "Mikrofonu kapat"
  - button "Kulaklığı kapat"
  - button "Kullanıcı ayarları":
    - button "Kullanıcı ayarları"
- main:
  - paragraph: "#genel"
  - paragraph: Hoş geldiniz! Burası genel sohbet kanalı.
  - textbox "Ara…"
  - button "Üye listesini aç/kapa"
  - button "Bildirimler"
  - button "Kanal ayarları"
  - log "Mesajlar":
    - img
    - heading "Henüz mesaj yok" [level=3]
    - paragraph: Mesajlaşmaya başlayın veya bir kanala geçin.
  - button "Emoji seçici": 😀
  - textbox "Mesajınız…"
  - button "Gönder"
- paragraph: Üyeler (1)
- paragraph: Yönetici
- text: 1 G6 Gezgin-65425DF0
- paragraph: "@everyone"
- text: "0"
- button
- alert:
  - img
  - paragraph: Yeni sürüm hazır
  - paragraph: Yeni sürüm yayınlandı
  - button "Bildirimi kapat":
    - img
- alert:
  - img
  - paragraph: Yeni sürüm hazır
  - paragraph: Yeni sürüm yayınlandı
  - button "Bildirimi kapat":
    - img
- alert:
  - img
  - paragraph: Sunucu oluşturuldu
  - paragraph: Yeni sunucunuz hazır.
  - button "Bildirimi kapat":
    - img
- heading "Yeni sürüm hazır" [level=3]
- button "Kapat"
- text: vlocal → v0dbc669 Yeni sürüm yayınlandı
- button "Şimdi güncelle"
- button "Sonra"
- text: Otomatik güncellenmesi 25 saniye kaldı
```

# Test source

```ts
  1   | /* ------------------------------------------------------------------ *
  2   |  * PeerCord — QA: Kanal kimliği ve emoji picker testi
  3   |  * ------------------------------------------------------------------ */
  4   | import { test, expect } from '@playwright/test'
  5   | 
  6   | const BASE = 'http://localhost:5181'
  7   | 
  8   | test.describe('Kanal rozeti ve EmojiPicker', () => {
  9   |   test.beforeEach(async ({ page }) => {
  10  |     await page.goto(BASE)
  11  |     // Sunucu oluşturma sayfasını bekle
  12  |     await page.waitForSelector('button:has-text("Sunucu Oluştur")', { timeout: 30000 })
  13  |     await page.waitForTimeout(1000)
  14  | 
  15  |     // Sunucu oluştur
  16  |     await page.click('button:has-text("Sunucu Oluştur")')
  17  |     await page.waitForSelector('[role="dialog"]', { timeout: 10000 })
  18  |     
  19  |     const createModal = page.locator('[role="dialog"]').filter({ hasText: /Sunucu Oluştur/i })
  20  |     await expect(createModal).toBeVisible()
  21  |     
  22  |     await createModal.locator('input[placeholder*="isim" i], input[placeholder*="ad" i]').first().fill('Test Sunucusu')
  23  |     await createModal.locator('button:has-text("Oluştur")').click()
  24  |     
  25  |     // Sunucunun yüklenmesini bekle - sidebar görünene kadar
  26  |     await page.waitForSelector('[data-sidebar]', { timeout: 30000 })
  27  |     await page.waitForTimeout(2000)
  28  |   })
  29  | 
  30  |   test('yeni kanal oluştur (emoji logolu) -> mesaj at -> rozet görünmeli -> tıkla -> profil açılmalı', async ({ page }) => {
  31  |     // 1. Sidebar'da kanal ekle butonunu bul (ilk kategorideki + butonu)
  32  |     const createChannelBtn = page.locator('[data-sidebar] button[aria-label*="kanal ekle"], [data-sidebar] button[aria-label*="Kanal ekle"]').first()
  33  |     await expect(createChannelBtn).toBeVisible({ timeout: 10000 })
  34  |     await createChannelBtn.click()
  35  |     await page.waitForTimeout(500)
  36  | 
  37  |     // 2. Kanal oluşturma modalı açılmalı
  38  |     const modal = page.locator('[role="dialog"]').filter({ hasText: /Yeni kanal/i })
> 39  |     await expect(modal).toBeVisible({ timeout: 5000 })
      |                         ^ Error: expect(locator).toBeVisible() failed
  40  | 
  41  |     // 3. Kanal adı gir
  42  |     await modal.locator('input[placeholder*="kanal" i]').first().fill('test-kanal')
  43  | 
  44  |     // 4. Emoji logo seç (ilk emoji - 💬)
  45  |     // Emoji picker butonuna tıkla
  46  |     const emojiPickerBtn = modal.locator('button:has-text("💬")').first()
  47  |     if (await emojiPickerBtn.count() > 0) {
  48  |       await emojiPickerBtn.click()
  49  |       await page.waitForTimeout(300)
  50  |       // İlk emojiyi seç (😀)
  51  |       const firstEmoji = modal.locator('button:has-text("😀")').first()
  52  |       if (await firstEmoji.count() > 0) {
  53  |         await firstEmoji.click()
  54  |       }
  55  |     }
  56  | 
  57  |     // 5. Oluştur butonuna bas
  58  |     await modal.locator('button:has-text("Oluştur")').click()
  59  |     await page.waitForTimeout(1500)
  60  | 
  61  |     // 6. Yeni kanalın listede görünmesini bekle ve tıkla
  62  |     const newChannelItem = page.locator('[data-sidebar] >> text=test-kanal').first()
  63  |     await expect(newChannelItem).toBeVisible({ timeout: 5000 })
  64  |     await newChannelItem.click()
  65  |     await page.waitForTimeout(500)
  66  | 
  67  |     // 7. Mesaj gönder
  68  |     const msgInput = page.locator('textarea[placeholder*="mesaj" i], textarea[placeholder*="yaz" i], div[contenteditable="true"]').first()
  69  |     await expect(msgInput).toBeVisible({ timeout: 5000 })
  70  |     await msgInput.fill('Test mesajı kanal rozeti için')
  71  |     await msgInput.press('Enter')
  72  |     await page.waitForTimeout(1000)
  73  | 
  74  |     // 8. Mesajda yazar adı yanında rozet (kanal logosu) olmalı
  75  |     const message = page.locator('[id^="msg-"]').last()
  76  |     await expect(message).toBeVisible()
  77  | 
  78  |     // Rozet: kanal logosu (emoji) yazar adı yanında
  79  |     const badge = message.locator('button[aria-label*="test-kanal"]').first()
  80  |     await expect(badge).toBeVisible({ timeout: 5000 })
  81  |     console.log('✅ Rozet (kanal logosu) mesajda yazar adı yanında görünüyor')
  82  | 
  83  |     // 9. Rozete tıkla -> kanal profili açılmalı
  84  |     await badge.click()
  85  |     await page.waitForTimeout(500)
  86  | 
  87  |     const channelProfileModal = page.locator('[role="dialog"]').filter({ hasText: /test-kanal/i })
  88  |     await expect(channelProfileModal).toBeVisible({ timeout: 5000 })
  89  |     console.log('✅ Kanal profili modalı açıldı')
  90  | 
  91  |     // Profilde beklenen öğeler
  92  |     await expect(channelProfileModal.locator('button:has-text("Kanala git")')).toBeVisible()
  93  |     
  94  |     // Modalı kapat
  95  |     await channelProfileModal.locator('button:has-text("Kapat")').click()
  96  |     await page.waitForTimeout(300)
  97  |   })
  98  | 
  99  |   test('Emoji picker açılır -> boyut 360x420\'den büyük DEĞİL olmalı -> kategori sekmeleri var', async ({ page }) => {
  100 |     // Mesaj input alanını bul
  101 |     const msgInput = page.locator('textarea[placeholder*="mesaj" i], textarea[placeholder*="yaz" i], div[contenteditable="true"]').first()
  102 |     await expect(msgInput).toBeVisible({ timeout: 5000 })
  103 | 
  104 |     // Emoji picker trigger butonunu bul (genelde 😀 butonu)
  105 |     const emojiTrigger = page.locator('button[aria-label="Emoji seçici"], button:has-text("😀")').first()
  106 |     await expect(emojiTrigger).toBeVisible({ timeout: 5000 })
  107 |     await emojiTrigger.click()
  108 |     await page.waitForTimeout(300)
  109 | 
  110 |     // Popover content görünmeli
  111 |     const pickerContent = page.locator('[role="dialog"] >> .. >> div[class*="grid"], div[class*="PopoverContent"] >> ..').first()
  112 |     
  113 |     // Bounding box ölçümü - popover content'i bul
  114 |     const popover = page.locator('div[style*="340"], div[class*="w-["]').first()
  115 |     const box = await popover.boundingBox().catch(() => null)
  116 | 
  117 |     if (box) {
  118 |       console.log(`Emoji picker boyutu: ${Math.round(box.width)}x${Math.round(box.height)}`)
  119 |       expect(box.width).toBeLessThanOrEqual(360)
  120 |       expect(box.height).toBeLessThanOrEqual(420)
  121 |     } else {
  122 |       // Alternatif ölçüm
  123 |       const content = page.locator('div:has(button:has-text("😀")) >> ..').first()
  124 |       const box2 = await content.boundingBox()
  125 |       if (box2) {
  126 |         console.log(`Emoji picker boyutu (alt): ${Math.round(box2.width)}x${Math.round(box2.height)}`)
  127 |         expect(box2.width).toBeLessThanOrEqual(360)
  128 |         expect(box2.height).toBeLessThanOrEqual(420)
  129 |       }
  130 |     }
  131 | 
  132 |     // Kategori sekmeleri var mı?
  133 |     const categories = ['Gülümler', 'İnsanlar', 'Hayvanlar', 'Yemek', 'Etkinlik', 'Seyahat', 'Nesneler', 'Semboller', 'Bayraklar']
  134 |     let foundCategories = 0
  135 |     for (const cat of categories) {
  136 |       const tab = page.locator(`button:has-text("${cat}")`).first()
  137 |       if (await tab.count() > 0) {
  138 |         console.log(`✅ Kategori sekmesi bulundu: ${cat}`)
  139 |         foundCategories++
```