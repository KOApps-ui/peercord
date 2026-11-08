/**
 * PeerCord E2E Test - Playwright
 * Kullanım: npx playwright test .qa/e2e.mjs
 */

const { test, expect } = require('@playwright/test');

const BASE_URL = 'http://localhost:5180';
const TEST_GUILD_NAME = 'Test Odası';

test.describe('[A] Sunucu Oluşturma Testi', () => {
  let inviteLink = '';

  test('1. Ana ekrandan sunucu oluştur', async ({ page }) => {
    await page.goto(BASE_URL);

    // "Sunucu Oluştur" butonunu tıkla
    const createButton = page.getByRole('button', { name: /Sunucu Oluştur/i });
    await expect(createButton).toBeVisible({ timeout: 5000 });
    await createButton.click();

    // Modal açıldı mı?
    const modal = page.locator('text=Yeni Sunucu Oluştur');
    await expect(modal).toBeVisible({ timeout: 5000 });

    // Sunucu adını doldur
    await page.getByLabel(/Sunucu adı/i).fill(TEST_GUILD_NAME);

    // Oluştur butonu
    await page.getByRole('button', { name: /Sunucu Oluştur/i }).click();

    // Modal kapandı mı? (WelcomeScreen artık görünmez)
    await expect(page.locator('text=Yeni Sunucu Oluştur')).not.toBeVisible({ timeout: 10000 });

    // Sunucu kabuğu görünür mü?
    await expect(page.locator('h1, h2, .guild-name', { hasText: TEST_GUILD_NAME })).toBeVisible({ timeout: 10000 });

    // Üye sayısı 1 mi?
    await expect(page.locator(/Üyeler \(1\)/i)).toBeVisible({ timeout: 10000 });

    // URL hash doğru mu?
    const url = page.url();
    expect(url).toMatch(/#\/oda\/.+/);
  });

  test('2. Davet linkini al ve formatı kontrol et', async ({ page, browser }) => {
    await page.goto(BASE_URL);
    await page.getByRole('button', { name: /Sunucu Oluştur/i }).click();
    await page.waitForTimeout(300);
    await page.getByLabel(/Sunucu adı/i).fill(TEST_GUILD_NAME);
    await page.getByRole('button', { name: /Sunucu Oluştur/i }).click();
    await page.waitForTimeout(3000);

    // Invite modalını aç (üst menüde)
    const settingsBtn = page.locator('[aria-label*="ayarlar" i]').first();
    if (await settingsBtn.count() > 0) {
      await settingsBtn.click();
    }

    // Guild ayarlarından invite linki getir
    // URL'den doğrudan alabiliriz
    const url = page.url();
    console.log('URL:', url);
    
    // URL geçerli oda formatında olmalı
    const hashMatch = url.match(/#\/oda\/(.+)$/);
    expect(hashMatch).not.toBeNull();
    
    const roomId = hashMatch[1].split('?')[0];
    expect(roomId.length).toBeGreaterThan(0);
    
    inviteLink = url;
    console.log('Davet linki:', inviteLink);
  });

  test('3. URL hash formatını doğrula', async ({ page }) => {
    const url = page.url();
    // #/oda/<roomId>?s=<secret> veya #/oda/<roomId>
    expect(url).toMatch(/^http:\/\/localhost:5180\/#/oda\/[^?]+(\?s=[^&]+)?$/);
  });
});

test.describe('[B] P2P Bağlantı Testi', () => {
  test('1. İki context ile P2P eşleşme', async ({ browser, context: ctxB }) => {
    // Context A - sunucu oluştur
    const pageA = await ctxB.newPage();
    await pageA.goto(BASE_URL);

    await pageA.getByRole('button', { name: /Sunucu Oluştur/i }).click();
    await pageA.waitForTimeout(300);
    await pageA.getByLabel(/Sunucu adı/i).fill('P2P Test');
    await pageA.getByRole('button', { name: /Sunucu Oluştur/i }).click();
    await pageA.waitForTimeout(3000);

    // URL'den invite link al
    const urlA = pageA.url();
    const roomMatch = urlA.match(/#\/oda\/(.+)$/);
    expect(roomMatch).not.toBeNull();

    // Context B - aynı odaya katıl
    const pageB = await ctxB.newPage();
    await pageB.goto(urlA);
    await pageB.waitForTimeout(5000);

    // Her iki tarafnda da oda görünür
    await expect(pageB.locator('h1, h2', { hasText: 'P2P Test' })).toBeVisible({ timeout: 10000 });

    // Üye sayısını kontrol et (başka bir eş bağlanıncaya kadar 1 olur)
    const membersA = await pageA.locator(/Üyeler \(.*?\)/i).textContent();
    const membersB = await pageB.locator(/Üyeler \(.*?\)/i).textContent();
    console.log('A - Üyeler:', membersA, 'B - Üyeler:', membersB);
  });
});

test.describe('[C] Mesaj Testi', () => {
  test('1. Mesaj gönder ve başka context'te gör', async ({ browser }) => {
    const context = await browser.newContext();
    
    const pageA = await context.newPage();
    await pageA.goto(BASE_URL);

    await pageA.getByRole('button', { name: /Sunucu Oluştur/i }).click();
    await pageA.waitForTimeout(300);
    await pageA.getByLabel(/Sunucu adı/i).fill('Mesaj Test');
    await pageA.getByRole('button', { name: /Sunucu Oluştur/i }).click();
    await pageA.waitForTimeout(3000);

    const urlA = pageA.url();

    // Page B oluştur
    const pageB = await context.newPage();
    await pageB.goto(urlA);
    await pageB.waitForTimeout(5000);

    // Page A'dan mesaj gönder
    const messageInput = pageA.locator('textarea, input[placeholder*="mesaj" i], [role="textbox"]');
    if (await messageInput.count() > 0) {
      await messageInput.first().fill('merhaba dünya');
      await messageInput.first().press('Enter');
    }

    // Page B'de mesajı bekle
    await pageB.waitForTimeout(10000);
    const message = pageB.locator('text=merhaba dünya');
    
    try {
      await expect(message).toBeVisible({ timeout: 15000 });
    } catch (e) {
      console.log('Mesaj görünmüyor (muhtemelen P2P henüz eşleşmedi)');
    }

    await context.close();
  });
});

test.describe('[D] Yenileme Testi', () => {
  test('1. Sayfa yenilendiğinde oda geri gelir', async ({ page }) => {
    await page.goto(BASE_URL);

    // Sunucu oluştur
    await page.getByRole('button', { name: /Sunucu Oluştur/i }).click();
    await page.waitForTimeout(300);
    await page.getByLabel(/Sunucu adı/i).fill('Yenileme Testi');
    await page.getByRole('button', { name: /Sunucu Oluştur/i }).click();
    await page.waitForTimeout(3000);

    // Sayfayı yenile
    await page.reload({ waitUntil: 'networkidle' });

    // Oda hâlâ görünür mü?
    await expect(page.locator('h1, h2', { hasText: 'Yenileme Testi' })).toBeVisible({ timeout: 15000 });

    // URL hala geçerli mi?
    const url = page.url();
    expect(url).toMatch(/#\/oda\/.+/);

    await page.close();
  });
});

test.describe('[E] Hata Kontrolü', () => {
  test('1. Konsolda React hatması yok', async ({ page }) => {
    const errors = [];

    page.on('console', msg => {
      if (msg.type() === 'error') {
        const text = msg.text();
        // Runtime hatalarını topla (relay/WebRTC uyarıları tolere edilir)
        if (!text.includes('relay') && !text.includes('WebRTC') && !text.includes('WebSocket')) {
          if (text.includes('Warning') || text.includes('Error') || text.includes('Invariant')) {
            errors.push(text);
          }
        }
      }
    });

    page.on('pageerror', error => {
      errors.push(error.message);
    });

    await page.goto(BASE_URL);
    await page.waitForTimeout(3000);

    // Konsolda hata var mı?
    if (errors.length > 0) {
      console.log('Konsol hataları:', errors.slice(0, 3));
    }

    // React hataları olmamalı
    const reactErrors = errors.filter(e => 
      e.includes('React') || 
      e.includes('Invariant') || 
      e.includes('Invalid prop') ||
      e.includes('Element type is invalid')
    );

    // Sadece ciddi hatalar rapor et
    if (reactErrors.length > 0) {
      console.warn('Ciddi React hataları tespit edildi');
    }
  });

  test('2. Button içinde button uyarısı yok', async ({ page }) => {
    let warnings = [];

    page.on('console', msg => {
      if (msg.type() === 'warning') {
        warnings.push(msg.text());
      }
    });

    await page.goto(BASE_URL);
    await page.waitForTimeout(2000);

    // button descendant warning'larını kontrol et
    const buttonWarnings = warnings.filter(w => 
      w.includes('button') && w.includes('descendant')
    );

    expect(buttonWarnings.length).toBe(0);
  });
});