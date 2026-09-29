const puppeteer = require('puppeteer-core');
const fs = require('fs');
const path = require('path');

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const OUTPUT_DIR = path.join(__dirname, 'test-results');

if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

async function runVisualTests() {
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1400,900']
  });

  const page = await browser.newPage();
  
  const consoleLogs = [];
  const errors = [];
  const failedRequests = [];

  page.on('console', msg => {
    consoleLogs.push({ type: msg.type(), text: msg.text() });
  });

  page.on('pageerror', err => {
    errors.push(err.toString());
  });

  page.on('requestfailed', req => {
    failedRequests.push({ url: req.url(), failure: req.failure() ? req.failure().errorText : 'failed' });
  });

  console.log('--- 1. Testing Desktop View (1366x768) ---');
  await page.setViewport({ width: 1366, height: 768 });
  await page.goto('http://localhost:5173', { waitUntil: 'networkidle0' });

  await page.screenshot({ path: path.join(OUTPUT_DIR, '01_desktop_home_catalog.png'), fullPage: false });

  // Check for horizontal overflow
  const desktopOverflow = await page.evaluate(() => {
    const docWidth = document.documentElement.offsetWidth;
    const bodyScrollWidth = document.body.scrollWidth;
    const overflowingElements = [];
    document.querySelectorAll('*').forEach(el => {
      if (el.scrollWidth > el.clientWidth && el.clientWidth > 0 && !['HTML', 'BODY'].includes(el.tagName)) {
        overflowingElements.push({
          tag: el.tagName,
          id: el.id,
          className: el.className,
          scrollWidth: el.scrollWidth,
          clientWidth: el.clientWidth
        });
      }
    });
    return { docWidth, bodyScrollWidth, hasHorizontalScroll: bodyScrollWidth > docWidth, overflowingElements: overflowingElements.slice(0, 10) };
  });
  console.log('Desktop overflow status:', JSON.stringify(desktopOverflow, null, 2));

  // Open Cart Drawer
  console.log('--- 2. Testing Cart Drawer ---');
  await page.evaluate(() => {
    const trigger = document.querySelector('.header-cart-trigger') || 
                    document.querySelector('.cart-top-link') ||
                    Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('PEDIDO'));
    if (trigger) trigger.click();
  });
  await new Promise(r => setTimeout(r, 600));
  await page.screenshot({ path: path.join(OUTPUT_DIR, '02_desktop_cart_drawer.png') });

  // Close cart drawer
  await page.evaluate(() => {
    const closeBtn = document.querySelector('.drawer-close-btn');
    if (closeBtn) closeBtn.click();
  });
  await new Promise(r => setTimeout(r, 600));

  // Test Navigation to "Quiénes Somos"
  console.log('--- 3. Testing Quiénes Somos ---');
  await page.evaluate(() => {
    const navBtn = Array.from(document.querySelectorAll('button, a, md-text-button, md-filled-button')).find(el => el.textContent.includes('QUIÉNES SOMOS') || el.textContent.includes('Quiénes Somos'));
    if (navBtn) navBtn.click();
  });
  await new Promise(r => setTimeout(r, 600));
  await page.screenshot({ path: path.join(OUTPUT_DIR, '03_desktop_quienes_somos.png') });

  // Test Navigation to "Contacto"
  console.log('--- 4. Testing Contacto ---');
  await page.evaluate(() => {
    const navBtn = Array.from(document.querySelectorAll('button, a, md-text-button, md-filled-button')).find(el => el.textContent.includes('CONTACTO') || el.textContent.includes('Contacto'));
    if (navBtn) navBtn.click();
  });
  await new Promise(r => setTimeout(r, 600));
  await page.screenshot({ path: path.join(OUTPUT_DIR, '04_desktop_contacto.png') });

  // Test Navigation to "Historial"
  console.log('--- 5. Testing Historial ---');
  await page.evaluate(() => {
    const navBtn = Array.from(document.querySelectorAll('button, a, md-text-button, md-filled-button')).find(el => el.textContent.includes('HISTORIAL') || el.textContent.includes('Historial'));
    if (navBtn) navBtn.click();
  });
  await new Promise(r => setTimeout(r, 600));
  await page.screenshot({ path: path.join(OUTPUT_DIR, '05_desktop_historial.png') });

  // Test Mobile View (390x844 - iPhone 12/13/14)
  console.log('--- 6. Testing Mobile View (390x844) ---');
  await page.setViewport({ width: 390, height: 844, isMobile: true, hasTouch: true });
  
  // Go to Catalog on mobile
  await page.evaluate(() => {
    const navBtn = Array.from(document.querySelectorAll('button, a, md-text-button, md-filled-button')).find(el => el.textContent.includes('PRODUCTOS') || el.textContent.includes('Catálogo'));
    if (navBtn) navBtn.click();
  });
  await new Promise(r => setTimeout(r, 600));
  await page.screenshot({ path: path.join(OUTPUT_DIR, '06_mobile_catalog.png') });

  // Check mobile overflow
  const mobileOverflow = await page.evaluate(() => {
    const docWidth = document.documentElement.offsetWidth;
    const bodyScrollWidth = document.body.scrollWidth;
    return { docWidth, bodyScrollWidth, hasHorizontalScroll: bodyScrollWidth > docWidth };
  });
  console.log('Mobile overflow status:', JSON.stringify(mobileOverflow, null, 2));

  // Open Cart Drawer on mobile
  await page.evaluate(() => {
    const btn = document.querySelector('.header-cart-trigger');
    if (btn) btn.click();
  });
  await new Promise(r => setTimeout(r, 600));
  await page.screenshot({ path: path.join(OUTPUT_DIR, '07_mobile_cart.png') });

  // Close Cart on mobile
  await page.evaluate(() => {
    const closeBtn = document.querySelector('.drawer-close-btn');
    if (closeBtn) closeBtn.click();
  });
  await new Promise(r => setTimeout(r, 600));

  // Mobile Quiénes Somos
  await page.evaluate(() => {
    const navBtn = Array.from(document.querySelectorAll('button, a, md-text-button, md-filled-button')).find(el => el.textContent.includes('QUIÉNES SOMOS') || el.textContent.includes('Quiénes Somos'));
    if (navBtn) navBtn.click();
  });
  await new Promise(r => setTimeout(r, 600));
  await page.screenshot({ path: path.join(OUTPUT_DIR, '08_mobile_quienes_somos.png') });

  // Mobile Contacto
  await page.evaluate(() => {
    const navBtn = Array.from(document.querySelectorAll('button, a, md-text-button, md-filled-button')).find(el => el.textContent.includes('CONTACTO') || el.textContent.includes('Contacto'));
    if (navBtn) navBtn.click();
  });
  await new Promise(r => setTimeout(r, 600));
  await page.screenshot({ path: path.join(OUTPUT_DIR, '09_mobile_contacto.png') });

  // Mobile Historial
  await page.evaluate(() => {
    const navBtn = Array.from(document.querySelectorAll('button, a, md-text-button, md-filled-button')).find(el => el.textContent.includes('HISTORIAL') || el.textContent.includes('Historial'));
    if (navBtn) navBtn.click();
  });
  await new Promise(r => setTimeout(r, 600));
  await page.screenshot({ path: path.join(OUTPUT_DIR, '10_mobile_historial.png') });

  // Check CSS and UI specifics
  const uiInspection = await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll('button')).map(b => ({
      text: b.textContent.trim(),
      bg: window.getComputedStyle(b).backgroundColor,
      color: window.getComputedStyle(b).color,
      border: window.getComputedStyle(b).border
    }));
    return { buttons: buttons.slice(0, 15) };
  });

  const report = {
    consoleLogs,
    errors,
    failedRequests,
    desktopOverflow,
    mobileOverflow,
    uiInspection
  };

  fs.writeFileSync(path.join(OUTPUT_DIR, 'report.json'), JSON.stringify(report, null, 2));
  console.log('Testing complete! Report and screenshots saved to:', OUTPUT_DIR);

  await browser.close();
}

runVisualTests().catch(err => {
  console.error('Test run error:', err);
  process.exit(1);
});
