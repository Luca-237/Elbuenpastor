const puppeteer = require('puppeteer-core');
const fs = require('fs');
const path = require('path');

(async () => {
  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: 'new',
    args: ['--no-sandbox']
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 390, height: 844, isMobile: true, hasTouch: true });
  await page.goto('http://localhost:5173', { waitUntil: 'networkidle0' });

  // Scroll to 200
  await page.evaluate(() => window.scrollTo(0, 200));
  await new Promise(r => setTimeout(r, 400));

  const framesDir = path.join(__dirname, 'test-results', 'mobile-scroll-frames');
  if (!fs.existsSync(framesDir)) fs.mkdirSync(framesDir, { recursive: true });

  const states = [];
  for (let y = 60; y >= 0; y -= 10) {
    await page.evaluate((pos) => window.scrollTo(0, pos), y);
    await new Promise(r => setTimeout(r, 100));

    const info = await page.evaluate((expectedY) => {
      const h = document.querySelector('.site-header-sober');
      const tb = document.querySelector('.top-bar-sober');
      const n = document.querySelector('.nav-and-actions-wrapper');
      const ph = document.querySelector('.page-heading-sober');
      const hRect = h ? h.getBoundingClientRect() : null;
      const phRect = ph ? ph.getBoundingClientRect() : null;
      const nRect = n ? n.getBoundingClientRect() : null;

      return {
        expectedY,
        actualY: window.scrollY,
        isCollapsed: h ? h.classList.contains('is-collapsed') : null,
        headerHeight: hRect ? hRect.height : null,
        headerBottom: hRect ? hRect.bottom : null,
        pageHeadingTop: phRect ? phRect.top : null,
        navTop: nRect ? nRect.top : null,
        navBottom: nRect ? nRect.bottom : null
      };
    }, y);

    states.push(info);
    const fname = 'm_frame_' + String(y).padStart(3, '0') + '.png';
    await page.screenshot({ path: path.join(framesDir, fname) });
  }

  console.log(JSON.stringify(states, null, 2));
  await browser.close();
})();
