/* ------------------------------------------------------------------ *
 * PeerCord — QA: profil fotoğrafı / banner / GIF yükleme testi
 * Akış: oda oluştur → kullanıcı ayarlarını aç → avatar PNG yükle →
 * banner PNG yükle → anim.gif yükle → DOM'da  doğrula.
 * ------------------------------------------------------------------ */
import { chromium } from 'playwright'

const b = await chromium.launch()
const p = await b.newPage({ viewport: { width: 1440, height: 900 } })
p.on('console', m => console.log(m.type().toUpperCase()+':', m.text().slice(0, 200)))
p.on('pageerror', e => console.log('PE:', e.message))

await p.goto('http://localhost:5180/', { waitUntil: 'domcontentloaded' })
await p.waitForTimeout(3500)
console.log('title:', await p.title())

// --- Oda oluştur ---
await p.getByRole('button', { name: 'Sunucu Oluştur' }).first().click()
await p.waitForTimeout(400)
const d = p.locator('[role="dialog"]')
await d.getByLabel('Sunucu adı').fill('Profil Testi')
await p.waitForTimeout(300)
await d.getByRole('button', { name: 'Sunucu Oluştur' }).click()
await p.waitForTimeout(3000)

// --- Kullanıcı ayarlarını aç ---
await p.getByLabel('Kullanıcı ayarları').first().click()
await p.waitForTimeout(1500)
console.log('menu count:', await p.locator('[role="menu"]').count())
await p.getByText('Ayarları aç').first().click()
await p.waitForTimeout(800)

// --- Banner yükle (PNG) ---
await p.setInputFiles('input[aria-label="Profil arkaplanı seç"]', '.qa/fixtures/avatar.png')
await p.waitForTimeout(1500)

// --- Avatar yükle (PNG) ---
await p.setInputFiles('input[aria-label="Profil fotoğrafı seç"]', '.qa/fixtures/avatar.png')
await p.waitForTimeout(1500)

// --- Avatar GIF olarak yükle ---
await p.setInputFiles('input[aria-label="Profil fotoğrafı seç"]', '.qa/fixtures/anim.gif')
await p.waitForTimeout(1500)

// --- Doğrulama ---
const pngImgs = p.locator('img[src^="data:image/png"]')
const gifImg = p.locator('img[src^="data:image/gif"]')
console.log('PNG img count:', await pngImgs.count())
console.log('first PNG src ok:', (await pngImgs.first().getAttribute('src')).startsWith('data:image/png'))
console.log('banner img visible:', await pngImgs.nth(1).isVisible())

const gifSrc = await gifImg.first().getAttribute('src')
console.log('GIF src starts with data:image/gif:', gifSrc.startsWith('data:image/gif'))
const gifNatural = await p.evaluate(() => {
  const el = document.querySelector('img[src^="data:image/gif"]')
  return el ? { naturalWidth: el.naturalWidth, naturalHeight: el.naturalHeight } : null
})
console.log('GIF natural size:', JSON.stringify(gifNatural))

// Kendi avatar UserPanel'de
console.log('userpanel avatar img count:', await p.locator('img[src^="data:image/gif"], img[src^="data:image/png"]').count())

await p.screenshot({ path: '/tmp/pc-profile-1440.png', fullPage: true })
await b.close()
