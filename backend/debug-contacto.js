const puppeteer = require('puppeteer-core');
const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

async function findContactoCulprit() {
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 360, height: 780, isMobile: true, hasTouch: true });
  await page.goto('http://localhost:5173', { waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 400));

  await page.evaluate(() => {
    const navBtn = Array.from(document.querySelectorAll('.nav-btn-sober, .top-link, button')).find(
      el => el.textContent.includes('CONTACTO') || el.textContent.includes('Contacto')
    );
    if (navBtn) navBtn.click();
  });
  await new Promise(r => setTimeout(r, 600));

  const culprits = await page.evaluate(() => {
    const items = [];
    const elements = document.querySelectorAll('.contacto-grid *');
    elements.forEach(el => {
      if (el.scrollWidth > 328 || el.offsetWidth > 328) {
        items.push({
          tag: el.tagName,
          className: el.className,
          offsetWidth: el.offsetWidth,
          scrollWidth: el.scrollWidth,
          clientWidth: el.clientWidth,
          text: (el.textContent || '').trim().slice(0, 40)
        });
      }
    });
    return items;
  });

  console.log('Culprits in Contacto on 360px:', JSON.stringify(culprits, null, 2));
  await browser.close();
}

findContactoCulprit().catch(console.error);
