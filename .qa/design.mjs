import { chromium } from 'playwright'

const VIEWPORTS = [
  { name: '1440x900', width: 1440, height: 900 },
  { name: '1280x800', width: 1280, height: 800 },
  { name: '390x844', width: 390, height: 844 },
]

const RESULTS = []

async function measure(page) {
  return await page.evaluate(() => {
    const rail = document.querySelector('[data-rail]')
    const sidebar = document.querySelector('[data-sidebar]')
    const members = document.querySelector('[data-members]')
    const header = document.querySelector('.pc-glass-strong') || document.querySelector('header')

    const getRect = (el) => {
      if (!el) return null
      const r = el.getBoundingClientRect()
      return { width: Math.round(r.width), height: Math.round(r.height), left: Math.round(r.left), right: Math.round(r.right) }
    }

    // Check overflow: any element with right > innerWidth
    const overflowing = []
    const walk = (node) => {
      if (node.nodeType !== 1) return
      const el = node
      const r = el.getBoundingClientRect()
      if (r.right > window.innerWidth + 1) {
        overflowing.push({
          tag: el.tagName,
          className: el.className || '',
          right: Math.round(r.right),
          innerWidth: window.innerWidth,
        })
      }
      for (const child of el.children) walk(child)
    }
    walk(document.body)

    return {
      rail: getRect(rail),
      sidebar: getRect(sidebar),
      members: getRect(members),
      header: getRect(header),
      innerWidth: window.innerWidth,
      overflowing,
      scrollWidthEqInnerWidth: document.documentElement.scrollWidth === window.innerWidth,
    }
  })
}

async function createGuild(page) {
  // Bekle: BootSplash geçsin, WelcomeScreen görünsün
  await page.waitForTimeout(2500)

  // "Sunucu Oluştur" butonuna tıkla
  await page.click('button:has-text("Sunucu Oluştur")', { timeout: 10000 })
  await page.waitForTimeout(1000)

  // Modal içinde sunucu adını doldur
  const nameInput = page.locator('input[placeholder="Örn: Arkadaşlarım"]').first()
  await nameInput.waitFor({ state: 'visible', timeout: 10000 })
  await nameInput.fill('TestSunucu')
  await page.waitForTimeout(500)

  // "Sunucu Oluştur" butonuna tıkla (modal içinde)
  await page.click('button:has-text("Sunucu Oluştur")', { timeout: 10000 })
  await page.waitForTimeout(2500)
}

async function main() {
  const browser = await chromium.launch()
  for (const vp of VIEWPORTS) {
    const context = await browser.newContext({
      viewport: { width: vp.width, height: vp.height },
    })
    const page = await context.newPage()

    try {
      await page.goto('http://localhost:5180', { waitUntil: 'networkidle' })

      // Guild oluştur
      await createGuild(page)

      // Escape ile modalları kapat
      await page.keyboard.press('Escape')
      await page.waitForTimeout(500)

      // Screenshot
      await page.screenshot({
        path: `/tmp/pc-d-${vp.name.toLowerCase()}.png`,
        fullPage: false,
      })

      // Ölçümler
      const m = await measure(page)
      RESULTS.push({ viewport: vp.name, ...m })
      console.log(`\n=== ${vp.name} ===`)
      console.log(`  rail:       ${JSON.stringify(m.rail)}`)
      console.log(`  sidebar:    ${JSON.stringify(m.sidebar)}`)
      console.log(`  members:    ${JSON.stringify(m.members)}`)
      console.log(`  header:     ${JSON.stringify(m.header)}`)
      console.log(`  innerWidth: ${m.innerWidth}`)
      console.log(`  scrollWidth === innerWidth: ${m.scrollWidthEqInnerWidth}`)
      console.log(`  overflowing elements: ${m.overflowing.length}`)
      if (m.overflowing.length > 0) {
        for (const o of m.overflowing) {
          console.log(`    ${o.tag} .${o.className} right=${o.right} > innerWidth=${o.innerWidth}`)
        }
      }
    } catch (err) {
      console.error(`Hata (${vp.name}):`, err.message)
    }

    await context.close()
  }

  await browser.close()

  // Özet
  console.log('\n========================================')
  console.log('DESIGN QA ÖZET')
  console.log('========================================')
  let allOk = true
  for (const r of RESULTS) {
    const railOk = r.rail && r.rail.width === 72
    const sidebarOk = r.sidebar && r.sidebar.width === 240
    const membersOk = r.members && r.members.width === 240
    const headerOk = r.header && r.header.height === 48
    const scrollOk = r.scrollWidthEqInnerWidth
    const overflowOk = r.overflowing.length === 0
    const status = railOk && sidebarOk && membersOk && headerOk && scrollOk && overflowOk ? 'OK' : 'FAIL'
    if (status === 'FAIL') allOk = false
    console.log(`${r.viewport}: ${status} (rail=${r.rail?.width}, sidebar=${r.sidebar?.width}, members=${r.members?.width}, header=${r.header?.height}, scrollOK=${scrollOk}, overflow=${r.overflowing.length})`)
  }
  console.log(`\nSonuç: ${allOk ? 'TÜM TESTLER BAŞARILI' : 'BAZI TESTLER BAŞARISIZ'}`)
  process.exit(allOk ? 0 : 1)
}

main()