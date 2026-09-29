const puppeteer = require('puppeteer-core');
const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

async function checkCardChildren() {
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

  const details = await page.evaluate(() => {
    const items = [];
    document.querySelectorAll('.contacto-form-card *').forEach(el => {
      const w = el.getBoundingClientRect().width;
      if (w > 300) {
        items.push({
          tag: el.tagName,
          className: el.className,
          width: Math.round(w),
          scrollWidth: el.scrollWidth,
          text: (el.textContent || '').trim().slice(0, 30)
        });
      }
    });
    return items;
  });

  console.log(JSON.stringify(details, null, 2));
  await browser.close();
}

checkCardChildren().catch(console.error);
