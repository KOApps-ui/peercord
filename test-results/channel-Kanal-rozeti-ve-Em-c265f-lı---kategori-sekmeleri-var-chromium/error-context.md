# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: channel.spec.ts >> Kanal rozeti ve EmojiPicker >> Emoji picker açılır -> boyut 360x420'den büyük DEĞİL olmalı -> kategori sekmeleri var
- Location: .qa/channel.spec.ts:99:3

# Error details

```
Error: expect(received).toBeLessThanOrEqual(expected)

Expected: <= 420
Received:    720
```

# Page snapshot

```yaml
- generic [ref=e3]:
  - generic [ref=e4]:
    - generic [ref=e5]:
      - generic [ref=e6]:
        - button "Sunucu ayarları" [ref=e7] [cursor=pointer]
        - button "Test Sunucusu" [ref=e13] [cursor=pointer]:
          - generic [ref=e14]: TS
        - button "Yeni sunucu oluştur" [ref=e16] [cursor=pointer]
      - generic [ref=e18]:
        - generic [ref=e19]: GA
        - button "Kullanıcı ayarları" [ref=e24] [cursor=pointer]
    - generic [ref=e28]:
      - complementary [ref=e29]:
        - generic [ref=e30]:
          - button "Test Sunucusu sunucu ayarları" [ref=e32] [cursor=pointer]:
            - generic [ref=e33]: T
            - generic [ref=e35]:
              - paragraph [ref=e36]: Test Sunucusu
              - paragraph [ref=e37]: 1 üye
          - button "Davet linki oluştur" [ref=e40] [cursor=pointer]: Davet et
          - generic [ref=e47]:
            - generic [ref=e48]:
              - generic [ref=e49]:
                - paragraph [ref=e50]: GENEL
                - button "GENEL kategorisine kanal ekle" [ref=e51] [cursor=pointer]
              - button "genel" [ref=e53] [cursor=pointer]
              - button "rastgele" [ref=e58] [cursor=pointer]
            - generic [ref=e63]:
              - generic [ref=e64]:
                - paragraph [ref=e65]: SES
                - button "SES kategorisine kanal ekle" [ref=e66] [cursor=pointer]
              - button "Genel Ses" [ref=e68] [cursor=pointer]
              - button "Oyun Odası" [ref=e73] [cursor=pointer]
          - button "Üye listesini aç/kapa" [ref=e78] [cursor=pointer]: Üyeler
          - generic [ref=e86]:
            - generic [ref=e87]:
              - generic [ref=e88]: GA
              - generic [ref=e92]:
                - paragraph [ref=e93]: Gezgin-A88BE4D6
                - generic [ref=e94]: Çevrimiçi
            - generic [ref=e97]:
              - button "Mikrofonu kapat" [ref=e98] [cursor=pointer]
              - button "Kulaklığı kapat" [ref=e102] [cursor=pointer]
              - button [ref=e105] [cursor=pointer]:
                - button "Kullanıcı ayarları" [ref=e106]
      - main [ref=e110]:
        - generic [ref=e111]:
          - generic [ref=e113]:
            - paragraph [ref=e114]: "#genel"
            - paragraph [ref=e115]: Hoş geldiniz! Burası genel sohbet kanalı.
          - generic [ref=e116]:
            - textbox "Ara…" [ref=e120]
            - button "Üye listesini aç/kapa" [ref=e121] [cursor=pointer]
            - button "Bildirimler" [ref=e127] [cursor=pointer]
            - button "Kanal ayarları" [ref=e131] [cursor=pointer]
        - generic [ref=e135]:
          - log "Mesajlar" [ref=e136]:
            - generic [ref=e137]:
              - heading "Henüz mesaj yok" [level=3] [ref=e141]
              - paragraph [ref=e142]: Mesajlaşmaya başlayın veya bir kanala geçin.
          - generic [ref=e144]:
            - button "Emoji seçici" [expanded] [ref=e145] [cursor=pointer]: 😀
            - dialog [ref=e147]:
              - textbox "Emoji ara..." [active] [ref=e153]
              - generic [ref=e154]:
                - button "Gülümler & Duygular" [ref=e155] [cursor=pointer]
                - button "İnsanlar & Vücut" [ref=e156] [cursor=pointer]
                - button "Hayvanlar & Doğa" [ref=e157] [cursor=pointer]
                - button "Yemek & İçecek" [ref=e158] [cursor=pointer]
                - button "Etkinlik" [ref=e159] [cursor=pointer]
                - button "Seyahat & Yerler" [ref=e160] [cursor=pointer]
                - button "Nesneler" [ref=e161] [cursor=pointer]
                - button "Semboller" [ref=e162] [cursor=pointer]
                - button "Bayraklar" [ref=e163] [cursor=pointer]
            - textbox "Mesajınız…" [ref=e168]
            - button "Gönder" [ref=e169] [cursor=pointer]
      - generic [ref=e171]:
        - paragraph [ref=e177]: Üyeler (1)
        - generic [ref=e179]:
          - generic [ref=e180]:
            - generic [ref=e181]:
              - paragraph [ref=e183]: Yönetici
              - generic [ref=e184]: "1"
            - generic [ref=e185]:
              - generic [ref=e186]: GA
              - generic "Gezgin-A88BE4D6" [ref=e191]
          - generic [ref=e194]:
            - paragraph [ref=e196]: "@everyone"
            - generic [ref=e197]: "0"
  - button [ref=e198] [cursor=pointer]
  - generic:
    - alert:
      - generic:
        - paragraph: Yeni sürüm hazır
        - paragraph: Yeni sürüm yayınlandı
      - button "Bildirimi kapat"
    - alert:
      - generic:
        - paragraph: Yeni sürüm hazır
        - paragraph: Yeni sürüm yayınlandı
      - button "Bildirimi kapat"
    - alert:
      - generic:
        - paragraph: Sunucu oluşturuldu
        - paragraph: Yeni sunucunuz hazır.
      - button "Bildirimi kapat"
  - generic [ref=e204]:
    - generic [ref=e205]:
      - heading "Yeni sürüm hazır" [level=3] [ref=e213]
      - button "Kapat" [ref=e214] [cursor=pointer]
    - generic [ref=e218]: vlocal → v0dbc669
    - generic [ref=e219]: Yeni sürüm yayınlandı
    - generic [ref=e220]:
      - button "Şimdi güncelle" [ref=e221] [cursor=pointer]
      - button "Sonra" [ref=e224] [cursor=pointer]
    - generic [ref=e225]: Otomatik güncellenmesi 25 saniye kaldı
```

# Test source

```ts
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
  39  |     await expect(modal).toBeVisible({ timeout: 5000 })
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
> 120 |       expect(box.height).toBeLessThanOrEqual(420)
      |                          ^ Error: expect(received).toBeLessThanOrEqual(expected)
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
  140 |       }
  141 |     }
  142 |     expect(foundCategories).toBeGreaterThan(5)
  143 | 
  144 |     // Arama inputu var mı?
  145 |     const searchInput = page.locator('input[placeholder*="ara" i], input[placeholder*="Emoji ara"]').first()
  146 |     await expect(searchInput).toBeVisible({ timeout: 3000 })
  147 |     console.log('✅ Emoji arama inputu var')
  148 | 
  149 |     // Kapat (ESC)
  150 |     await page.keyboard.press('Escape')
  151 |     await page.waitForTimeout(200)
  152 |   })
  153 | })
  154 | 
  155 | test.describe('Ekran görüntüleri', () => {
  156 |   test('Kanal rozeti ve EmojiPicker ekran görüntüsü', async ({ page }) => {
  157 |     await page.goto(BASE)
  158 |     await page.waitForSelector('button:has-text("Sunucu Oluştur")', { timeout: 30000 })
  159 |     await page.waitForTimeout(1000)
  160 | 
  161 |     // Sunucu oluştur
  162 |     await page.click('button:has-text("Sunucu Oluştur")')
  163 |     await page.waitForSelector('[role="dialog"]', { timeout: 10000 })
  164 |     
  165 |     const createModal = page.locator('[role="dialog"]').filter({ hasText: /Sunucu Oluştur/i })
  166 |     await createModal.locator('input[placeholder*="isim" i], input[placeholder*="ad" i]').first().fill('SS Test Sunucusu')
  167 |     await createModal.locator('button:has-text("Oluştur")').click()
  168 |     
  169 |     await page.waitForSelector('[data-sidebar]', { timeout: 30000 })
  170 |     await page.waitForTimeout(2000)
  171 | 
  172 |     // Kanal oluştur ve mesaj at
  173 |     const createBtn = page.locator('[data-sidebar] button[aria-label*="kanal ekle"]').first()
  174 |     if (await createBtn.count() > 0) {
  175 |       await createBtn.click()
  176 |       const modal = page.locator('[role="dialog"]').filter({ hasText: /Yeni kanal/i })
  177 |       await expect(modal).toBeVisible({ timeout: 5000 })
  178 |       await modal.locator('input[placeholder*="kanal" i]').first().fill('ss-kanal')
  179 |       await modal.locator('button:has-text("Oluştur")').click()
  180 |       await page.waitForTimeout(1500)
  181 | 
  182 |       const chItem = page.locator('[data-sidebar] >> text=ss-kanal').first()
  183 |       await chItem.click()
  184 |       await page.waitForTimeout(500)
  185 | 
  186 |       const msgInput = page.locator('textarea[placeholder*="mesaj" i], div[contenteditable="true"]').first()
  187 |       await msgInput.fill('Test mesajı rozet için')
  188 |       await msgInput.press('Enter')
  189 |       await page.waitForTimeout(1000)
  190 | 
  191 |       // Ekran görüntüsü 1: Kanal rozeti
  192 |       await page.screenshot({ path: '/tmp/pc-channel-1440.png', fullPage: false })
  193 |       console.log('📸 /tmp/pc-channel-1440.png kaydedildi')
  194 |     }
  195 | 
  196 |     // Emoji picker aç
  197 |     const emojiTrigger = page.locator('button[aria-label="Emoji seçici"], button:has-text("😀")').first()
  198 |     await emojiTrigger.click()
  199 |     await page.waitForTimeout(300)
  200 | 
  201 |     // Ekran görüntüsü 2: Emoji picker
  202 |     await page.screenshot({ path: '/tmp/pc-emoji-1440.png', fullPage: false })
  203 |     console.log('📸 /tmp/pc-emoji-1440.png kaydedildi')
  204 |   })
  205 | })
```