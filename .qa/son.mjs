import { chromium } from 'playwright';

const BASE_URL = 'http://localhost:5180';
const TEST_ROOM_NAME = 'Final QA Odasi';
const TIMEOUT_MS = 20000;

const consoleWarnings = [];
const consoleErrors = [];

function log(m) { console.log('[son.mjs] ' + m); }

async function waitFor(cond, timeout, msg) {
  const start = Date.now();
  timeout = timeout || TIMEOUT_MS;
  while (Date.now() - start < timeout) {
    if (await cond()) return true;
    await new Promise(r => setTimeout(r, 300));
  }
  throw new Error('timeout: ' + msg);
}

async function run() {
  const browser = await chromium.launch({ headless: true });

  const contextA = await browser.newContext();
  const pageA = await contextA.newPage();
  await pageA.setViewportSize({ width: 1440, height: 900 });
  pageA.on('console', m => {
    const t = m.type().toUpperCase() + ':' + m.text().slice(0, 200);
    consoleWarnings.push('A:' + t);
    if (m.type() === 'warning' || m.type() === 'error') consoleErrors.push('A:' + t);
  });
  pageA.on('pageerror', e => consoleErrors.push('A pageerror: ' + e.message));

  const contextB = await browser.newContext();
  const pageB = await contextB.newPage();
  await pageB.setViewportSize({ width: 1440, height: 900 });
  pageB.on('console', m => {
    const t = m.type().toUpperCase() + ':' + m.text().slice(0, 200);
    consoleWarnings.push('B:' + t);
    if (m.type() === 'warning' || m.type() === 'error') consoleErrors.push('B:' + t);
  });
  pageB.on('pageerror', e => consoleErrors.push('B pageerror: ' + e.message));

  try {
    log('A: ana sayfa');
    await pageA.goto(BASE_URL, { waitUntil: 'networkidle' });

    log('A: sunucu olustur');
    await pageA.getByRole('button', { name: /Sunucu Olu\u015ftur/i }).first().click();
    await pageA.waitForTimeout(300);
    await pageA.getByLabel(/Sunucu ad/i).fill(TEST_ROOM_NAME);
    await pageA.getByRole('button', { name: /Sunucu Olu\u015ftur/i }).click();
    await pageA.waitForTimeout(3000);

    const urlA = pageA.url();
    log('A URL: ' + urlA);
    if (!urlA.match(/#\/oda\/.+/)) throw new Error('A hash yok: ' + urlA);
    const inviteLink = urlA;

    try {
      await waitFor(() => pageA.locator('text=/\u00DCyeler\\s*\\(1\\)/').count() > 0, 15000, 'A uye sayisi 1');
    } catch (e) {
      console.error('A BODY:', (await pageA.locator('body').innerText()).slice(0, 800).replace(/\n/g, ' | '));
      throw e;
    }
    log('A: uye sayisi 1');

    log('B: davet linkine katil');
    await pageB.goto(inviteLink, { waitUntil: 'networkidle' });

    await waitFor(() => pageB.locator('text=/\u00DCyeler\\s*\\(2\\)/').count() > 0, TIMEOUT_MS, 'B uye sayisi 2');
    await pageA.waitForTimeout(1000);
    await waitFor(() => pageA.locator('text=/\u00DCyeler\\s*\\(2\\)/').count() > 0, TIMEOUT_MS, 'A uye sayisi 2');
    log('iki es baglandi, uye sayisi 2');

    await pageA.screenshot({ path: '/tmp/pc-son-1440.png', fullPage: true });
    log('screenshot: /tmp/pc-son-1440.png');

    const meas = await pageA.evaluate(() => {
      const rail = document.querySelector('[data-rail]');
      const members = document.querySelector('[data-members]');
      const sidebar = document.querySelector('aside');
      const memberPanel = document.querySelector('[data-members]');
      const nameSpans = memberPanel ? Array.from(memberPanel.querySelectorAll('span.text-sm.font-medium.truncate')) : [];
      const names = nameSpans.map(s => (s.textContent || '').trim()).filter(Boolean);
      const counts = {};
      names.forEach(n => { counts[n] = (counts[n] || 0) + 1; });
      const duplicates = Object.entries(counts).filter(([, c]) => c > 1).map(([n]) => n);
      const countEl = Array.from(document.querySelectorAll('*')).find(el => /\u00DCyeler\s*\(/.test(el.textContent || ''));
      return {
        railW: rail ? rail.offsetWidth : null,
        membersW: members ? members.offsetWidth : null,
        sidebarW: sidebar ? sidebar.offsetWidth : null,
        innerWidth: window.innerWidth,
        scrollWidth: document.documentElement.scrollWidth,
        memberCountText: countEl ? countEl.textContent.trim() : null,
        names,
        counts,
        duplicates,
        memberEls: nameSpans.length,
        railRight: rail ? rail.getBoundingClientRect().right : null,
        overflowX: getComputedStyle(document.body).overflowX,
      };
    });
    log('OLCULER (1440): ' + JSON.stringify(meas, null, 2));

    await pageA.setViewportSize({ width: 390, height: 844 });
    await pageA.waitForTimeout(800);
    await pageA.screenshot({ path: '/tmp/pc-son-390.png', fullPage: true });
    log('screenshot: /tmp/pc-son-390.png');

    const measMob = await pageA.evaluate(() => ({
      innerWidth: window.innerWidth,
      scrollWidth: document.documentElement.scrollWidth,
      railW: document.querySelector('[data-rail]') ? document.querySelector('[data-rail]').offsetWidth : null,
      overflowX: getComputedStyle(document.body).overflowX,
    }));
    log('OLCULER (390): ' + JSON.stringify(measMob, null, 2));

    const nestedBtnWarns = consoleWarnings.filter(w => /button cannot contain|nested button/i.test(w));
    log('KONSOl UYARI SAYISI: ' + consoleWarnings.length);
    log('nested-button uyarisi: ' + (nestedBtnWarns.length ? 'VAR (' + nestedBtnWarns.length + ')' : 'YOK'));
    if (consoleWarnings.length) log('tum konsol mesajlari:\n' + consoleWarnings.join('\n'));

    const okRail = meas.railW === 72;
    const okMembers = meas.membersW === 240;
    const okMemberCount = !!meas.memberCountText && /\u00DCyeler\s*\(2\)/.test(meas.memberCountText);
    const okNoDup = meas.duplicates.length === 0 && meas.names.length === 2;
    const okNoOverflow = meas.scrollWidth === meas.innerWidth;
    const okNoNested = nestedBtnWarns.length === 0;

    console.log('\n=== DOGRULAMA ===');
    console.log('ray 72px:            ', okRail ? 'OK' : 'FAIL (' + meas.railW + ')');
    console.log('members 240px:       ', okMembers ? 'OK' : 'FAIL (' + meas.membersW + ')');
    console.log('uye sayisi 2:        ', okMemberCount ? 'OK' : 'FAIL (' + meas.memberCountText + ')');
    console.log('her uye tek kez:     ', okNoDup ? 'OK (' + meas.names.join(', ') + ')' : 'FAIL duplikasyon=' + JSON.stringify(meas.duplicates));
    console.log('scrollWidth=innerW:  ', okNoOverflow ? 'OK (' + meas.scrollWidth + '=' + meas.innerWidth + ')' : 'FAIL (' + meas.scrollWidth + '!=' + meas.innerWidth + ')');
    console.log('nested button uyarisi: ', okNoNested ? 'YOK (OK)' : 'VAR (FAIL)');

    const allOk = okRail && okMembers && okMemberCount && okNoDup && okNoOverflow && okNoNested;
    console.log(allOk ? '\nTUM DOGRULAMALAR GECTI' : '\nBAZI DOGRULAMALAR KALDI');
    process.exit(allOk ? 0 : 1);
  } catch (err) {
    console.error('HATA:', err.message);
    process.exit(1);
  } finally {
    await browser.close();
  }
}

run();
