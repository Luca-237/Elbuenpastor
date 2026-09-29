const puppeteer = require('puppeteer-core');
const fs = require('fs');
const path = require('path');

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const OUTPUT_DIR = path.join(__dirname, 'test-results', 'full-pages');

if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

async function captureFullPages() {
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();

  const scenarios = [
    { name: 'desktop', width: 1366, height: 768, isMobile: false },
    { name: 'mobile', width: 390, height: 844, isMobile: true, hasTouch: true }
  ];

  const sections = ['productos', 'quienes-somos', 'contacto', 'historial'];

  for (const s of scenarios) {
    await page.setViewport({ width: s.width, height: s.height, isMobile: s.isMobile, hasTouch: s.hasTouch });
    
    for (const sec of sections) {
      await page.goto('http://localhost:5173', { waitUntil: 'networkidle0' });
      await new Promise(r => setTimeout(r, 400));

      await page.evaluate((targetSec) => {
        const navBtns = Array.from(document.querySelectorAll('.nav-btn-sober, .top-link, button'));
        const btn = navBtns.find(b => {
          const t = b.textContent.toLowerCase();
          if (targetSec === 'productos' && (t.includes('productos') || t.includes('catálogo'))) return true;
          if (targetSec === 'quienes-somos' && t.includes('quiénes somos')) return true;
          if (targetSec === 'contacto' && t.includes('contacto')) return true;
          if (targetSec === 'historial' && t.includes('historial')) return true;
          return false;
        });
        if (btn) btn.click();
      }, sec);

      await new Promise(r => setTimeout(r, 600));

      // Scroll a bit then back to trigger any lazy loading or transitions
      await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
      await new Promise(r => setTimeout(r, 400));
      await page.evaluate(() => window.scrollTo(0, 0));
      await new Promise(r => setTimeout(r, 300));

      await page.screenshot({
        path: path.join(OUTPUT_DIR, `${s.name}_${sec}_full.png`),
        fullPage: true
      });
    }
  }

  console.log('Full-page screenshots captured successfully!');
  await browser.close();
}

captureFullPages().catch(console.error);
