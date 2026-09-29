const puppeteer = require('puppeteer-core');
const fs = require('fs');
const path = require('path');

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const OUT_DIR = path.join(__dirname, 'test-results', 'scroll-debug');

if (!fs.existsSync(OUT_DIR)) {
  fs.mkdirSync(OUT_DIR, { recursive: true });
}

async function debugHeaderScroll() {
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1366, height: 768 });
  await page.goto('http://localhost:5173', { waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 600));

  const steps = [
    { scrollY: 0, label: '01_initial_0' },
    { scrollY: 25, label: '02_down_25' },
    { scrollY: 45, label: '03_down_45' },
    { scrollY: 150, label: '04_down_150' },
    { scrollY: 300, label: '05_down_300' },
    { scrollY: 150, label: '06_up_150' },
    { scrollY: 45, label: '07_up_45' },
    { scrollY: 35, label: '08_up_35' },
    { scrollY: 10, label: '09_up_10' },
    { scrollY: 0, label: '10_up_0' }
  ];

  const logs = [];

  for (const s of steps) {
    await page.evaluate((y) => window.scrollTo(0, y), s.scrollY);
    // Wait a brief moment like a human scrolling
    await new Promise(r => setTimeout(r, 200));

    const state = await page.evaluate((y, label) => {
      const header = document.querySelector('.site-header-sober');
      const topBar = document.querySelector('.top-bar-sober');
      const mainArea = document.querySelector('.header-main-area');
      const container = document.querySelector('.header-main-container');
      const brand = document.querySelector('.brand-sober-block');
      const navWrapper = document.querySelector('.nav-and-actions-wrapper');

      const hRect = header ? header.getBoundingClientRect() : null;
      const tbRect = topBar ? topBar.getBoundingClientRect() : null;
      const maRect = mainArea ? mainArea.getBoundingClientRect() : null;
      const cRect = container ? container.getBoundingClientRect() : null;

      return {
        label,
        targetScrollY: y,
        actualScrollY: window.scrollY,
        isCollapsed: header ? header.classList.contains('is-collapsed') : false,
        headerRect: hRect ? { top: hRect.top, height: hRect.height } : null,
        topBarRect: tbRect ? { top: tbRect.top, height: tbRect.height, display: window.getComputedStyle(topBar).display, opacity: window.getComputedStyle(topBar).opacity } : null,
        mainAreaRect: maRect ? { top: maRect.top, height: maRect.height } : null,
        containerFlexDir: container ? window.getComputedStyle(container).flexDirection : null,
        gapBetweenTopBarAndMain: (tbRect && maRect) ? Math.round(maRect.top - (tbRect.top + tbRect.height)) : null
      };
    }, s.scrollY, s.label);

    logs.push(state);
    await page.screenshot({ path: path.join(OUT_DIR, `${s.label}.png`) });
  }

  // Also test mobile view scroll
  await page.setViewport({ width: 390, height: 844, isMobile: true, hasTouch: true });
  await page.evaluate(() => window.scrollTo(0, 0));
  await new Promise(r => setTimeout(r, 400));

  const mobileSteps = [
    { scrollY: 0, label: 'm_01_initial_0' },
    { scrollY: 50, label: 'm_02_down_50' },
    { scrollY: 200, label: 'm_03_down_200' },
    { scrollY: 50, label: 'm_04_up_50' },
    { scrollY: 30, label: 'm_05_up_30' },
    { scrollY: 0, label: 'm_06_up_0' }
  ];

  for (const s of mobileSteps) {
    await page.evaluate((y) => window.scrollTo(0, y), s.scrollY);
    await new Promise(r => setTimeout(r, 200));
    await page.screenshot({ path: path.join(OUT_DIR, `${s.label}.png`) });
  }

  fs.writeFileSync(path.join(OUT_DIR, 'debug_log.json'), JSON.stringify(logs, null, 2));
  console.log('Scroll debug finished! Logs saved to:', path.join(OUT_DIR, 'debug_log.json'));
  await browser.close();
}

debugHeaderScroll().catch(console.error);
