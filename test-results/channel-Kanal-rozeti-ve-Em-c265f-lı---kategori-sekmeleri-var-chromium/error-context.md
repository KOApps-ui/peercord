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
        - generic [ref=e19]: G1
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
              - paragraph [ref=e49]: GENEL
              - button "genel" [ref=e50] [cursor=pointer]
              - button "rastgele" [ref=e55] [cursor=pointer]
            - generic [ref=e60]:
              - paragraph [ref=e61]: SES
              - button "Genel Ses" [ref=e62] [cursor=pointer]
              - button "Oyun Odası" [ref=e67] [cursor=pointer]
          - generic [ref=e72]:
            - generic [ref=e74]:
              - textbox "Yeni kanal adı…" [ref=e77]
              - button "Kanal oluştur" [disabled]
            - button "Üye listesini aç/kapa" [ref=e78] [cursor=pointer]: Üyeler
          - generic [ref=e86]:
            - generic [ref=e87]:
              - generic [ref=e88]: G1
              - generic [ref=e92]:
                - paragraph [ref=e93]: Gezgin-15293D10
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
              - generic [ref=e149]:
                - button "Gülümler & Duygular" [active] [ref=e150] [cursor=pointer]
                - button "İnsanlar & Vücut" [ref=e151] [cursor=pointer]
                - button "Hayvanlar & Doğa" [ref=e152] [cursor=pointer]
                - button "Yemek & İçecek" [ref=e153] [cursor=pointer]
                - button "Etkinlik" [ref=e154] [cursor=pointer]
                - button "Seyahat & Yerin" [ref=e155] [cursor=pointer]
                - button "Nesneler" [ref=e156] [cursor=pointer]
              - generic [ref=e157]:
                - button "😀" [ref=e158] [cursor=pointer]
                - button "😁" [ref=e159] [cursor=pointer]
                - button "😂" [ref=e160] [cursor=pointer]
                - button "😃" [ref=e161] [cursor=pointer]
                - button "😄" [ref=e162] [cursor=pointer]
                - button "😅" [ref=e163] [cursor=pointer]
                - button "😆" [ref=e164] [cursor=pointer]
                - button "😉" [ref=e165] [cursor=pointer]
                - button "😊" [ref=e166] [cursor=pointer]
                - button "😋" [ref=e167] [cursor=pointer]
                - button "😎" [ref=e168] [cursor=pointer]
                - button "😍" [ref=e169] [cursor=pointer]
                - button "😘" [ref=e170] [cursor=pointer]
                - button "🥰" [ref=e171] [cursor=pointer]
                - button "😗" [ref=e172] [cursor=pointer]
                - button "😙" [ref=e173] [cursor=pointer]
                - button "😚" [ref=e174] [cursor=pointer]
                - button "😛" [ref=e175] [cursor=pointer]
                - button "😜" [ref=e176] [cursor=pointer]
                - button "😝" [ref=e177] [cursor=pointer]
                - button "🤑" [ref=e178] [cursor=pointer]
                - button "🤗" [ref=e179] [cursor=pointer]
                - button "🤠" [ref=e180] [cursor=pointer]
                - button "🤡" [ref=e181] [cursor=pointer]
                - button "🤢" [ref=e182] [cursor=pointer]
                - button "🤣" [ref=e183] [cursor=pointer]
                - button "🤤" [ref=e184] [cursor=pointer]
                - button "🥵" [ref=e185] [cursor=pointer]
                - button "🥶" [ref=e186] [cursor=pointer]
                - button "🥷" [ref=e187] [cursor=pointer]
                - button "👀" [ref=e188] [cursor=pointer]
                - button "👁️‍🗨️" [ref=e189] [cursor=pointer]
                - button "👂" [ref=e190] [cursor=pointer]
                - button "👃" [ref=e191] [cursor=pointer]
                - button "👄" [ref=e192] [cursor=pointer]
                - button "👅" [ref=e193] [cursor=pointer]
                - button "👆" [ref=e194] [cursor=pointer]
                - button "👇" [ref=e195] [cursor=pointer]
                - button "👈" [ref=e196] [cursor=pointer]
                - button "👉" [ref=e197] [cursor=pointer]
                - button "👊" [ref=e198] [cursor=pointer]
                - button "👋" [ref=e199] [cursor=pointer]
                - button "👍" [ref=e200] [cursor=pointer]
                - button "👎" [ref=e201] [cursor=pointer]
                - button "👏" [ref=e202] [cursor=pointer]
                - button "👑" [ref=e203] [cursor=pointer]
                - button "💋" [ref=e204] [cursor=pointer]
                - button "💌" [ref=e205] [cursor=pointer]
                - button "💐" [ref=e206] [cursor=pointer]
                - button "💓" [ref=e207] [cursor=pointer]
                - button "🐀" [ref=e208] [cursor=pointer]
                - button "🐁" [ref=e209] [cursor=pointer]
                - button "🐂" [ref=e210] [cursor=pointer]
                - button "🐃" [ref=e211] [cursor=pointer]
                - button "🐄" [ref=e212] [cursor=pointer]
                - button "🐅" [ref=e213] [cursor=pointer]
                - button "🐆" [ref=e214] [cursor=pointer]
                - button "🐇" [ref=e215] [cursor=pointer]
                - button "🐈" [ref=e216] [cursor=pointer]
                - button "🐉" [ref=e217] [cursor=pointer]
                - button "🐊" [ref=e218] [cursor=pointer]
                - button "🐋" [ref=e219] [cursor=pointer]
                - button "🐌" [ref=e220] [cursor=pointer]
                - button "🐍" [ref=e221] [cursor=pointer]
                - button "🐎" [ref=e222] [cursor=pointer]
                - button "🐏" [ref=e223] [cursor=pointer]
                - button "🐐" [ref=e224] [cursor=pointer]
                - button "🐑" [ref=e225] [cursor=pointer]
                - button "🐒" [ref=e226] [cursor=pointer]
                - button "🐓" [ref=e227] [cursor=pointer]
                - button "🐘" [ref=e228] [cursor=pointer]
                - button "🐕" [ref=e229] [cursor=pointer]
                - button "🐖" [ref=e230] [cursor=pointer]
                - button "🐗" [ref=e231] [cursor=pointer]
                - button "🐘" [ref=e232] [cursor=pointer]
                - button "🐙" [ref=e233] [cursor=pointer]
                - button "🐚" [ref=e234] [cursor=pointer]
                - button "🐛" [ref=e235] [cursor=pointer]
                - button "🐜" [ref=e236] [cursor=pointer]
                - button "🐝" [ref=e237] [cursor=pointer]
                - button "🐞" [ref=e238] [cursor=pointer]
                - button "🐟" [ref=e239] [cursor=pointer]
                - button "🐠" [ref=e240] [cursor=pointer]
                - button "🐡" [ref=e241] [cursor=pointer]
                - button "🐢" [ref=e242] [cursor=pointer]
                - button "🐡" [ref=e243] [cursor=pointer]
                - button "🐤" [ref=e244] [cursor=pointer]
                - button "🐥" [ref=e245] [cursor=pointer]
                - button "🐦" [ref=e246] [cursor=pointer]
                - button "🐧" [ref=e247] [cursor=pointer]
                - button "🐨" [ref=e248] [cursor=pointer]
                - button "🐪" [ref=e249] [cursor=pointer]
                - button "🐫" [ref=e250] [cursor=pointer]
                - button "🐬" [ref=e251] [cursor=pointer]
                - button "🐭" [ref=e252] [cursor=pointer]
                - button "🐮" [ref=e253] [cursor=pointer]
                - button "🐯" [ref=e254] [cursor=pointer]
                - button "🐰" [ref=e255] [cursor=pointer]
                - button "🐱" [ref=e256] [cursor=pointer]
                - button "🐲" [ref=e257] [cursor=pointer]
                - button "🍀" [ref=e258] [cursor=pointer]
                - button "🍁" [ref=e259] [cursor=pointer]
                - button "🍂" [ref=e260] [cursor=pointer]
                - button "🍃" [ref=e261] [cursor=pointer]
                - button "🍄" [ref=e262] [cursor=pointer]
                - button "🥑" [ref=e263] [cursor=pointer]
                - button "🍆" [ref=e264] [cursor=pointer]
                - button "🍇" [ref=e265] [cursor=pointer]
                - button "🍈" [ref=e266] [cursor=pointer]
                - button "🍉" [ref=e267] [cursor=pointer]
                - button "🍊" [ref=e268] [cursor=pointer]
                - button "🍋" [ref=e269] [cursor=pointer]
                - button "🍌" [ref=e270] [cursor=pointer]
                - button "🍍" [ref=e271] [cursor=pointer]
                - button "🍎" [ref=e272] [cursor=pointer]
                - button "🍏" [ref=e273] [cursor=pointer]
                - button "🥭" [ref=e274] [cursor=pointer]
                - button "🥝" [ref=e275] [cursor=pointer]
                - button "🥥" [ref=e276] [cursor=pointer]
                - button "🥦" [ref=e277] [cursor=pointer]
                - button "⚽" [ref=e278] [cursor=pointer]
                - button "⚾" [ref=e279] [cursor=pointer]
                - button "🎾" [ref=e280] [cursor=pointer]
                - button "🏀" [ref=e281] [cursor=pointer]
                - button "🏐" [ref=e282] [cursor=pointer]
                - button "🏈" [ref=e283] [cursor=pointer]
                - button "🏓" [ref=e284] [cursor=pointer]
                - button "🥊" [ref=e285] [cursor=pointer]
                - button "🚗" [ref=e286] [cursor=pointer]
                - button "🚖" [ref=e287] [cursor=pointer]
                - button "🚕" [ref=e288] [cursor=pointer]
                - button "🚙" [ref=e289] [cursor=pointer]
                - button "🚌" [ref=e290] [cursor=pointer]
                - button "🚐" [ref=e291] [cursor=pointer]
                - button "🚑" [ref=e292] [cursor=pointer]
                - button "🚒" [ref=e293] [cursor=pointer]
                - button "🚓" [ref=e294] [cursor=pointer]
                - button "🚔" [ref=e295] [cursor=pointer]
                - button "🚕" [ref=e296] [cursor=pointer]
                - button "🚗" [ref=e297] [cursor=pointer]
                - button "🏎️" [ref=e298] [cursor=pointer]
                - button "🚀" [ref=e299] [cursor=pointer]
                - button "✈️" [ref=e300] [cursor=pointer]
                - button "🛫" [ref=e301] [cursor=pointer]
                - button "🛬" [ref=e302] [cursor=pointer]
                - button "🚁" [ref=e303] [cursor=pointer]
                - button "🚂" [ref=e304] [cursor=pointer]
                - button "🚊" [ref=e305] [cursor=pointer]
                - button "💻" [ref=e306] [cursor=pointer]
                - button "📱" [ref=e307] [cursor=pointer]
                - button "💾" [ref=e308] [cursor=pointer]
                - button "💿" [ref=e309] [cursor=pointer]
                - button "📓" [ref=e310] [cursor=pointer]
                - button "📔" [ref=e311] [cursor=pointer]
                - button "📚" [ref=e312] [cursor=pointer]
                - button "📖" [ref=e313] [cursor=pointer]
                - button "📝" [ref=e314] [cursor=pointer]
                - button "🗒️" [ref=e315] [cursor=pointer]
                - button "📋" [ref=e316] [cursor=pointer]
                - button "📌" [ref=e317] [cursor=pointer]
                - button "📍" [ref=e318] [cursor=pointer]
                - button "🗛" [ref=e319] [cursor=pointer]
                - button "🗜️" [ref=e320] [cursor=pointer]
                - button "⌨️" [ref=e321] [cursor=pointer]
                - button "🖱️" [ref=e322] [cursor=pointer]
                - button "🖥️" [ref=e323] [cursor=pointer]
                - button "🖨️" [ref=e324] [cursor=pointer]
                - button "💽" [ref=e325] [cursor=pointer]
                - button "👕" [ref=e326] [cursor=pointer]
                - button "👖" [ref=e327] [cursor=pointer]
                - button "🥻" [ref=e328] [cursor=pointer]
                - button "👘" [ref=e329] [cursor=pointer]
                - button "🥽" [ref=e330] [cursor=pointer]
                - button "🎩" [ref=e331] [cursor=pointer]
                - button "🎓" [ref=e332] [cursor=pointer]
                - button "👓" [ref=e333] [cursor=pointer]
                - button "🧢" [ref=e334] [cursor=pointer]
                - button "🧤" [ref=e335] [cursor=pointer]
                - button "💯" [ref=e336] [cursor=pointer]
                - button "💠" [ref=e337] [cursor=pointer]
                - button "💡" [ref=e338] [cursor=pointer]
                - button "💢" [ref=e339] [cursor=pointer]
                - button "💦" [ref=e340] [cursor=pointer]
                - button "💧" [ref=e341] [cursor=pointer]
                - button "💨" [ref=e342] [cursor=pointer]
                - button "🕊️" [ref=e343] [cursor=pointer]
                - button "🕋" [ref=e344] [cursor=pointer]
                - button "🕌" [ref=e345] [cursor=pointer]
                - button "⛪" [ref=e346] [cursor=pointer]
                - button "🕍" [ref=e347] [cursor=pointer]
                - button "🕎" [ref=e348] [cursor=pointer]
                - button "⛩️" [ref=e349] [cursor=pointer]
                - button "⛲" [ref=e350] [cursor=pointer]
                - button "🗻" [ref=e351] [cursor=pointer]
                - button "🏔️" [ref=e352] [cursor=pointer]
                - button "🏕️" [ref=e353] [cursor=pointer]
                - button "🏖️" [ref=e354] [cursor=pointer]
                - button "🏝️" [ref=e355] [cursor=pointer]
                - button "🏘️" [ref=e356] [cursor=pointer]
                - button "🏚️" [ref=e357] [cursor=pointer]
                - button "🏠" [ref=e358] [cursor=pointer]
                - button "🏡" [ref=e359] [cursor=pointer]
                - button "🏢" [ref=e360] [cursor=pointer]
                - button "🏣" [ref=e361] [cursor=pointer]
                - button "🏤" [ref=e362] [cursor=pointer]
                - button "🏥" [ref=e363] [cursor=pointer]
                - button "🏦" [ref=e364] [cursor=pointer]
                - button "🏨" [ref=e365] [cursor=pointer]
                - button "🏩" [ref=e366] [cursor=pointer]
                - button "💒" [ref=e367] [cursor=pointer]
                - button "⛺" [ref=e368] [cursor=pointer]
                - button "🏯" [ref=e369] [cursor=pointer]
                - button "🏰" [ref=e370] [cursor=pointer]
                - button "🗿" [ref=e371] [cursor=pointer]
                - button "😺" [ref=e372] [cursor=pointer]
                - button "😸" [ref=e373] [cursor=pointer]
                - button "😹" [ref=e374] [cursor=pointer]
                - button "😻" [ref=e375] [cursor=pointer]
                - button "😼" [ref=e376] [cursor=pointer]
                - button "😽" [ref=e377] [cursor=pointer]
                - button "😾" [ref=e378] [cursor=pointer]
                - button "😿" [ref=e379] [cursor=pointer]
                - button "😸" [ref=e380] [cursor=pointer]
                - button "😹" [ref=e381] [cursor=pointer]
                - button "😺" [ref=e382] [cursor=pointer]
                - button "🐵" [ref=e383] [cursor=pointer]
                - button "🐒" [ref=e384] [cursor=pointer]
                - button "🐴" [ref=e385] [cursor=pointer]
                - button "🐮" [ref=e386] [cursor=pointer]
                - button "🐷" [ref=e387] [cursor=pointer]
                - button "🐸" [ref=e388] [cursor=pointer]
                - button "🐔" [ref=e389] [cursor=pointer]
                - button "🐧" [ref=e390] [cursor=pointer]
                - button "🐦" [ref=e391] [cursor=pointer]
                - button "🐥" [ref=e392] [cursor=pointer]
                - button "🐣" [ref=e393] [cursor=pointer]
                - button "🐒" [ref=e394] [cursor=pointer]
                - button "🐁" [ref=e395] [cursor=pointer]
                - button "😀" [ref=e396] [cursor=pointer]
                - button "😁" [ref=e397] [cursor=pointer]
                - button "😂" [ref=e398] [cursor=pointer]
                - button "😃" [ref=e399] [cursor=pointer]
                - button "😄" [ref=e400] [cursor=pointer]
                - button "😅" [ref=e401] [cursor=pointer]
                - button "😆" [ref=e402] [cursor=pointer]
                - button "😉" [ref=e403] [cursor=pointer]
                - button "😊" [ref=e404] [cursor=pointer]
                - button "😋" [ref=e405] [cursor=pointer]
                - button "😎" [ref=e406] [cursor=pointer]
                - button "😍" [ref=e407] [cursor=pointer]
                - button "😘" [ref=e408] [cursor=pointer]
                - button "🥰" [ref=e409] [cursor=pointer]
                - button "😗" [ref=e410] [cursor=pointer]
                - button "😙" [ref=e411] [cursor=pointer]
                - button "😚" [ref=e412] [cursor=pointer]
                - button "😛" [ref=e413] [cursor=pointer]
                - button "😜" [ref=e414] [cursor=pointer]
                - button "😝" [ref=e415] [cursor=pointer]
                - button "🤑" [ref=e416] [cursor=pointer]
                - button "🤗" [ref=e417] [cursor=pointer]
            - textbox "Mesajınız…" [ref=e421]
            - button "Gönder" [ref=e422] [cursor=pointer]
      - generic [ref=e424]:
        - paragraph [ref=e430]: Üyeler (1)
        - generic [ref=e432]:
          - generic [ref=e433]:
            - generic [ref=e434]:
              - paragraph [ref=e436]: Yönetici
              - generic [ref=e437]: "1"
            - generic [ref=e438]:
              - generic [ref=e439]: G1
              - generic "Gezgin-15293D10" [ref=e444]
          - generic [ref=e447]:
            - paragraph [ref=e449]: "@everyone"
            - generic [ref=e450]: "0"
  - button [ref=e451] [cursor=pointer]
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
  - generic [ref=e457]:
    - generic [ref=e458]:
      - heading "Yeni sürüm hazır" [level=3] [ref=e466]
      - button "Kapat" [ref=e467] [cursor=pointer]
    - generic [ref=e471]: vlocal → v0dbc669
    - generic [ref=e472]: Yeni sürüm yayınlandı
    - generic [ref=e473]:
      - button "Şimdi güncelle" [ref=e474] [cursor=pointer]
      - button "Sonra" [ref=e477] [cursor=pointer]
    - generic [ref=e478]: Otomatik güncellenmesi 25 saniye kaldı
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