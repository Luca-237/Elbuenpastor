const puppeteer = require('puppeteer-core');
const fs = require('fs');
const path = require('path');

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

async function testCentering() {
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1366, height: 768 });
  await page.goto('http://localhost:5173', { waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 600));

  const results = await page.evaluate(() => {
    const reports = [];

    // Helper to test if text inside an element is centered
    function checkTextCentering(selector, name) {
      const elements = document.querySelectorAll(selector);
      elements.forEach((el, index) => {
        const style = window.getComputedStyle(el);
        const rect = el.getBoundingClientRect();
        
        // For inline-flex or flex items
        const isFlex = style.display.includes('flex');
        const textAlign = style.textAlign;
        const justifyContent = style.justifyContent;
        const alignItems = style.alignItems;
        
        // Check padding symmetry
        const padLeft = parseFloat(style.paddingLeft);
        const padRight = parseFloat(style.paddingRight);
        const padTop = parseFloat(style.paddingTop);
        const padBottom = parseFloat(style.paddingBottom);

        reports.push({
          name: `${name} [${index}]`,
          tag: el.tagName,
          text: el.textContent.trim().slice(0, 35),
          rect: { width: Math.round(rect.width), height: Math.round(rect.height) },
          textAlign,
          display: style.display,
          justifyContent,
          alignItems,
          padXDiff: Math.abs(padLeft - padRight),
          padYDiff: Math.abs(padTop - padBottom)
        });
      });
    }

    checkTextCentering('.brand-sober-block', 'Brand Header Block');
    checkTextCentering('.heading-title', 'Page Heading Title');
    checkTextCentering('.breadcrumbs-nav', 'Breadcrumbs Nav');
    checkTextCentering('.product-info-centered', 'Product Info Centered Card');
    checkTextCentering('.product-title-centered', 'Product Title');
    checkTextCentering('.product-pricing-centered', 'Product Pricing');
    checkTextCentering('.cart-count-badge', 'Cart Badge');
    checkTextCentering('.header-cart-trigger', 'Cart Trigger Button');
    checkTextCentering('.sober-badge', 'Sober Badge');
    checkTextCentering('.callout-title', 'Sidebar Callout Title');
    checkTextCentering('.footer-bottom-bar', 'Footer Bottom Bar');
    checkTextCentering('.peace-banner-notif', 'Peace Banner');

    return reports;
  });

  console.log(JSON.stringify(results, null, 2));
  await browser.close();
}

testCentering().catch(console.error);
