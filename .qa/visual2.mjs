import { chromium } from 'playwright'

const errs = []
const b = await chromium.launch({ headless: true })

async function runViewport(w, h, path) {
  const ctx = await b.newContext()
  const p = await ctx.newPage()
  p.on('console', m => { if (m.type() === 'error') errs.push(`${w}x${h}: ` + m.text()) })
  p.on('pageerror', e => errs.push(`${w}x${h} PAGEERROR: ` + e.message))

  await p.setViewportSize({ width: w, height: h })
  await p.goto('http://localhost:5180/', { waitUntil: 'networkidle' })

  // Uygulama hazır olana kadar bekle (BootSplash kapanır)
  await p.waitForSelector('text=PeerCord başlatılıyor…', { state: 'hidden', timeout: 30000 })
  await p.waitForTimeout(400)

  // 1. Sunucu oluştur modalını aç (dialog yoktaki ilk "Sunucu Oluştur" düğmesi)
  await p.evaluate(() => {
    const btn = Array.from(document.querySelectorAll('button')).find(
      el => el.textContent === 'Sunucu Oluştur' && !el.closest('[role=dialog]')
    )
    if (!btn) throw new Error('Oluştur düğmesi bulunamadı')
    btn.click()
  })
  await p.waitForSelector('role=dialog', { state: 'visible', timeout: 10000 })
  await p.waitForTimeout(300)

  // 2. Modal: sunucu adı girip oluştur
  const dialog = p.locator('role=dialog')
  await dialog.locator('input[placeholder="Örn: Arkadaşlarım"]').fill('Görsel Test Sunucusu')
  await p.waitForTimeout(200)
  await dialog.getByRole('button', { name: 'Sunucu Oluştur' }).click()
  await p.waitForTimeout(800)

  // 3. Sunucu görünümü: kanal oluştur
  await p.waitForSelector(w >= 1024 ? '[data-rail]' : '[data-sidebar]', {
    state: 'visible',
    timeout: 10000,
  })
  await p.click('input[placeholder="Yeni kanal adı…"]')
  await p.type('input[placeholder="Yeni kanal adı…"]', 'genel')
  await p.waitForTimeout(300)
  await p.keyboard.press('Enter')
  await p.waitForTimeout(800)

  // 4. Escape ile açık modalı kapat → ekran görüntüsü
  await p.keyboard.press('Escape')
  await p.waitForTimeout(500)

  await p.screenshot({ path, fullPage: false })

  const m = await p.evaluate(() => {
    const W = window.innerWidth
    const H = window.innerHeight
    const rb = (sel) => {
      const el = document.querySelector(sel)
      return el ? { w: Math.round(el.getBoundingClientRect().width), x: Math.round(el.getBoundingClientRect().x), right: Math.round(el.getBoundingClientRect().right) } : null
    }
    let overflow = []
    document.querySelectorAll('*').forEach(el => {
      const r = el.getBoundingClientRect()
      if (r.x < -1 || r.right > W + 1 || r.width > W + 1) {
        let cls = ''
        try { cls = String(el.className || '').slice(0, 60) } catch { cls = '' }
        overflow.push({ tag: el.tagName, cls, x: Math.round(r.x), right: Math.round(r.right), w: Math.round(r.width) })
      }
    })

    // Ray içindeki elemanların right <= 72 kontrolü (rail x=0'dan başlıyor, genişliği 72)
    let railItemsRightOk = true
    const railItems = document.querySelectorAll('[data-rail] button, [data-rail] a, [data-rail] div[class*="cursor-pointer"]')
    railItems.forEach(el => {
      const r = el.getBoundingClientRect()
      if (r.right > 72 + 1) railItemsRightOk = false
    })

    return {
      W, H,
      rail: rb('[data-rail]'),
      sidebar: rb('[data-sidebar]'),
      members: rb('[data-members]'),
      scrollWidth: document.documentElement.scrollWidth,
      innerWidth: W,
      scrollOk: document.documentElement.scrollWidth <= W,
      railItemsRightOk,
      overflow: overflow.slice(0, 10),
    }
  })
  console.log(`=== ${w}x${h} → ${path} ===`)
  console.log(JSON.stringify(m, null, 2))

  await ctx.close()
}

await runViewport(1440, 900, '/tmp/pc-m-1440.png')
await runViewport(1280, 800, '/tmp/pc-m-1280.png')
await runViewport(390, 844, '/tmp/pc-m-390.png')

console.log('ERRORS:', errs.slice(0, 10))
await b.close()
