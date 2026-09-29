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
  await page.setViewport({ width: 1366, height: 768 });
  await page.goto('http://localhost:5173', { waitUntil: 'networkidle0' });

  const states = [];
  // Scroll down in steps of 10px from 0 to 120
  for (let y = 0; y <= 120; y += 10) {
    await page.evaluate((pos) => window.scrollTo(0, pos), y);
    await new Promise(r => setTimeout(r, 100));

    const info = await page.evaluate((expectedY) => {
      const h = document.querySelector('.site-header-sober');
      const hRect = h ? h.getBoundingClientRect() : null;

      return {
        expectedY,
        actualY: window.scrollY,
        isCollapsed: h ? h.classList.contains('is-collapsed') : null,
        headerHeight: hRect ? hRect.height : null
      };
    }, y);

    states.push(info);
  }

  console.log('Scroll Down Test:');
  console.log(JSON.stringify(states, null, 2));

  // Now test scrolling UP back to 0
  const upStates = [];
  for (let y = 120; y >= 0; y -= 10) {
    await page.evaluate((pos) => window.scrollTo(0, pos), y);
    await new Promise(r => setTimeout(r, 100));

    const info = await page.evaluate((expectedY) => {
      const h = document.querySelector('.site-header-sober');
      const hRect = h ? h.getBoundingClientRect() : null;

      return {
        expectedY,
        actualY: window.scrollY,
        isCollapsed: h ? h.classList.contains('is-collapsed') : null,
        headerHeight: hRect ? hRect.height : null
      };
    }, y);

    upStates.push(info);
  }

  console.log('Scroll Up Test:');
  console.log(JSON.stringify(upStates, null, 2));

  await browser.close();
})();
