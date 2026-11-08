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
  await p.waitForTimeout(8000)

  const bootVisible = await p.locator('text=Sohbet et. Sunucu yok. Kayıt yok.').count()
  console.log(`Boot screen visible: ${bootVisible > 0}`)

  if (bootVisible > 0) {
    await p.waitForSelector('button:has-text("Sunucu Oluştur")', { state: 'visible', timeout: 10000 })
    await p.click('button:has-text("Sunucu Oluştur")')
    await p.waitForTimeout(2000)

    const dialog = p.locator('role=dialog')
    const dialogCount = await dialog.count()
    console.log(`Dialog count: ${dialogCount}`)

    if (dialogCount > 0) {
      await dialog.locator('input[placeholder*="Sunucu"]').fill('Görsel Test Sunucusu')
      await p.waitForTimeout(500)
      await dialog.locator('button[type="submit"], button').filter({ hasNotText: 'X' }).last().click()
      await p.waitForTimeout(3000)

      await p.screenshot({ path: path.replace('.png', '-after-create.png'), fullPage: false })

      const railVisible = await p.locator('[data-rail]').count()
      console.log(`Rail visible: ${railVisible > 0}`)

      if (railVisible > 0) {
        await p.click('input[placeholder="Yeni kanal adı…"]')
        await p.type('input[placeholder="Yeni kanal adı…"]', 'genel')
        await p.waitForTimeout(300)
        await p.keyboard.press('Enter')
        await p.waitForTimeout(800)

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

          let railItemsRightOk = true
          const railItems = document.querySelectorAll('[data-rail] button, [data-rail] a')
          railItems.forEach(el => {
            const r = el.getBoundingClientRect()
            if (r.right > 72 + 1) railItemsRightOk = false
          })

          const memberRows = document.querySelectorAll('[data-members] .hover\:bg-\[hsl\(var\(--pc-surface-hover\)\)\]').length
          const channelItems = document.querySelectorAll('[data-sidebar] button').length
          const genelCount = Array.from(document.querySelectorAll('button, div')).filter(el =>
            el.textContent.trim() === 'genel' || el.textContent.trim() === '# genel'
          ).length

          return {
            W, H,
            rail: rb('[data-rail]'),
            sidebar: rb('[data-sidebar]'),
            members: rb('[data-members]'),
            scrollWidth: document.documentElement.scrollWidth,
            innerWidth: W,
            scrollOk: document.documentElement.scrollWidth <= W,
            railItemsRightOk,
            memberRows,
            channelItems,
            genelCount,
            overflow: overflow.slice(0, 10),
          }
        })
        console.log(`=== ${w}x${h} → ${path} ===`)
        console.log(JSON.stringify(m, null, 2))
      } else {
        console.log(`Rail not visible after create`)
      }
    }
  }

  await ctx.close()
}

await runViewport(1440, 900, '/tmp/pc-n-1440.png')
await runViewport(1280, 800, '/tmp/pc-n-1280.png')

console.log('ERRORS:', errs.slice(0, 10))
await b.close()
