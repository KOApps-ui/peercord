/* ------------------------------------------------------------------ *
 * PeerCord — QA: Basit DOM keşfi
 * ------------------------------------------------------------------ */
import { test } from '@playwright/test'

const BASE = 'http://localhost:5181'

test('DOM yapısını keşfet', async ({ page }) => {
  await page.goto(BASE)
  // Uygulamanın yüklenmesini bekle - root içindeki içeriği bekle
  await page.waitForSelector('#root > *', { timeout: 30000 })
  await page.waitForTimeout(3000)

  // Tüm elementleri yazdır
  const body = await page.locator('body').innerHTML()
  console.log('BODY HTML (ilk 5000 karakter):')
  console.log(body.slice(0, 5000))

  // data-* attribute'ları bul
  const elements = await page.locator('*').all()
  for (const el of elements.slice(0, 200)) {
    const attrs = await el.evaluate(e => {
      const result: Record<string, string> = {}
      for (const attr of e.attributes) {
        if (attr.name.startsWith('data-')) {
          result[attr.name] = attr.value
        }
      }
      return result
    })
    if (Object.keys(attrs).length > 0) {
      console.log('data-* attrs:', attrs)
    }
  }
})