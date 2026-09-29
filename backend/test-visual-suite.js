const puppeteer = require('puppeteer-core');
const fs = require('fs');
const path = require('path');

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const OUTPUT_DIR = path.join(__dirname, 'test-results', 'suite-run');

if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

// Viewports to test
const VIEWPORTS = [
  { name: '1_desktop_wide', width: 1920, height: 1080, isMobile: false },
  { name: '2_desktop_std', width: 1366, height: 768, isMobile: false },
  { name: '3_laptop', width: 1024, height: 768, isMobile: false },
  { name: '4_tablet', width: 768, height: 1024, isMobile: true, hasTouch: true },
  { name: '5_mobile_iphone14', width: 390, height: 844, isMobile: true, hasTouch: true },
  { name: '6_mobile_compact', width: 360, height: 780, isMobile: true, hasTouch: true }
];

async function inspectPageVisuals(page, label) {
  return await page.evaluate((testLabel) => {
    const issues = [];
    const docWidth = document.documentElement.offsetWidth;
    const bodyScrollWidth = document.body.scrollWidth;
    const windowWidth = window.innerWidth;

    // 1. Check for overall horizontal overflow
    if (bodyScrollWidth > windowWidth + 1) {
      issues.push({
        type: 'HORIZONTAL_PAGE_OVERFLOW',
        label: testLabel,
        details: `Body scrollWidth (${bodyScrollWidth}px) exceeds window innerWidth (${windowWidth}px)`
      });
    }

    // 2. Check for overflowing text elements or clipped boxes
    const allElements = document.querySelectorAll('body *');
    allElements.forEach(el => {
      // Skip script, style, svg, path, etc.
      if (['SCRIPT', 'STYLE', 'SVG', 'PATH', 'HEAD', 'BR', 'HR'].includes(el.tagName)) return;

      const style = window.getComputedStyle(el);
      if (style.display === 'none' || style.visibility === 'hidden' || style.opacity === '0') return;

      // Allow intentional scrollable elements
      const overflowX = style.overflowX;
      const isScrollContainer = ['auto', 'scroll'].includes(overflowX);

      // Check text or child clipping
      const diffX = el.scrollWidth - el.clientWidth;
      if (diffX > 2 && !isScrollContainer && el.clientWidth > 0) {
        // If it's not a known scroll container
        issues.push({
          type: 'ELEMENT_OVERFLOW_X',
          label: testLabel,
          tag: el.tagName,
          className: el.className,
          id: el.id,
          clientWidth: el.clientWidth,
          scrollWidth: el.scrollWidth,
          diff: diffX,
          textSample: (el.textContent || '').trim().slice(0, 40)
        });
      }

      // Check vertical centering for badges, circles, and pills
      if (el.classList.contains('cart-count-badge') ||
          el.classList.contains('step-circle') ||
          el.classList.contains('activity-badge-num') ||
          el.classList.contains('log-icon-circle') ||
          el.classList.contains('sober-badge') ||
          el.classList.contains('summary-status-pill') ||
          el.classList.contains('payment-pill') ||
          el.classList.contains('footer-pill') ||
          el.classList.contains('wholesale-tier-badge') ||
          el.classList.contains('qty-btn')) {
        
        const rect = el.getBoundingClientRect();
        // Check if circular element has equal aspect ratio
        if (el.classList.contains('cart-count-badge') || el.classList.contains('step-circle') || el.classList.contains('log-icon-circle')) {
          if (Math.abs(rect.width - rect.height) > 2) {
            issues.push({
              type: 'CIRCLE_ASPECT_RATIO_DISTORTED',
              label: testLabel,
              tag: el.tagName,
              className: el.className,
              width: rect.width,
              height: rect.height
            });
          }
        }
      }

      // Check button text and icon vertical alignment
      if (el.tagName === 'BUTTON' || el.classList.contains('header-cart-trigger') || el.classList.contains('btn-whatsapp-cart-checkout') || el.classList.contains('btn-whatsapp-form-action')) {
        const text = el.textContent.trim();
        const rect = el.getBoundingClientRect();
        if (rect.height === 0 || rect.width === 0) return;

        // Check if button has both text and icon
        const icon = el.querySelector('.material-symbols-rounded, svg');
        if (icon && text.length > 2) {
          const iconRect = icon.getBoundingClientRect();
          const iconCenterY = iconRect.top + iconRect.height / 2;
          const buttonCenterY = rect.top + rect.height / 2;
          const diffCenter = Math.abs(iconCenterY - buttonCenterY);
          if (diffCenter > 4) {
            issues.push({
              type: 'BUTTON_ICON_TEXT_MISALIGNED',
              label: testLabel,
              className: el.className,
              buttonHeight: rect.height,
              iconHeight: iconRect.height,
              diffCenter: Math.round(diffCenter * 10) / 10,
              text: text.slice(0, 30)
            });
          }
        }
      }

      // Check headings centering when inside a centered container
      if (['H1', 'H2', 'H3', 'H4'].includes(el.tagName)) {
        const parent = el.parentElement;
        if (parent) {
          const pStyle = window.getComputedStyle(parent);
          if (pStyle.textAlign === 'center' || pStyle.alignItems === 'center') {
            const elRect = el.getBoundingClientRect();
            const parentRect = parent.getBoundingClientRect();
            if (parentRect.width > 0 && elRect.width > 0 && elRect.width < parentRect.width - 20) {
              const elCenter = elRect.left + elRect.width / 2;
              const parentCenter = parentRect.left + parentRect.width / 2;
              const offset = Math.abs(elCenter - parentCenter);
              if (offset > 5) {
                issues.push({
                  type: 'HEADING_NOT_CENTERED',
                  label: testLabel,
                  tag: el.tagName,
                  className: el.className,
                  offset: Math.round(offset * 10) / 10,
                  text: el.textContent.trim().slice(0, 40)
                });
              }
            }
          }
        }
      }
    });

    return {
      docWidth,
      bodyScrollWidth,
      windowWidth,
      issues
    };
  }, label);
}

async function runTestSuite() {
  console.log('🚀 Starting Chrome Visual & Centering Test Suite...');
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();

  const allReports = [];

  for (const vp of VIEWPORTS) {
    console.log(`\n========================================`);
    console.log(`📱 Testing Viewport: ${vp.name} (${vp.width}x${vp.height})`);
    console.log(`========================================`);

    await page.setViewport({
      width: vp.width,
      height: vp.height,
      isMobile: vp.isMobile || false,
      hasTouch: vp.hasTouch || false
    });

    // 1. Home / Productos Catalog
    await page.goto('http://localhost:5173', { waitUntil: 'networkidle0' });
    await new Promise(r => setTimeout(r, 600));

    let report = await inspectPageVisuals(page, `${vp.name}_01_catalog`);
    allReports.push({ step: `${vp.name}_01_catalog`, ...report });
    await page.screenshot({ path: path.join(OUTPUT_DIR, `${vp.name}_01_catalog.png`) });

    // Test sticky header scrolled
    await page.evaluate(() => window.scrollTo(0, 300));
    await new Promise(r => setTimeout(r, 500));
    let scrolledReport = await inspectPageVisuals(page, `${vp.name}_02_header_scrolled`);
    allReports.push({ step: `${vp.name}_02_header_scrolled`, ...scrolledReport });
    await page.screenshot({ path: path.join(OUTPUT_DIR, `${vp.name}_02_header_scrolled.png`) });
    await page.evaluate(() => window.scrollTo(0, 0));
    await new Promise(r => setTimeout(r, 400));

    // 2. Open Cart Drawer
    await page.evaluate(() => {
      const btn = document.querySelector('.header-cart-trigger');
      if (btn) btn.click();
    });
    await new Promise(r => setTimeout(r, 600));
    let cartReport = await inspectPageVisuals(page, `${vp.name}_03_cart_items`);
    allReports.push({ step: `${vp.name}_03_cart_items`, ...cartReport });
    await page.screenshot({ path: path.join(OUTPUT_DIR, `${vp.name}_03_cart_items.png`) });

    // Switch Cart to Activity tab
    await page.evaluate(() => {
      const tabs = Array.from(document.querySelectorAll('.drawer-tab-btn'));
      const actTab = tabs.find(t => t.textContent.includes('Actividad'));
      if (actTab) actTab.click();
    });
    await new Promise(r => setTimeout(r, 400));
    let actReport = await inspectPageVisuals(page, `${vp.name}_04_cart_activity`);
    allReports.push({ step: `${vp.name}_04_cart_activity`, ...actReport });
    await page.screenshot({ path: path.join(OUTPUT_DIR, `${vp.name}_04_cart_activity.png`) });

    // Close Cart Drawer
    await page.evaluate(() => {
      const closeBtn = document.querySelector('.drawer-close-btn');
      if (closeBtn) closeBtn.click();
    });
    await new Promise(r => setTimeout(r, 500));

    // 3. Navigation: Quiénes Somos
    await page.evaluate(() => {
      const navBtn = Array.from(document.querySelectorAll('.nav-btn-sober, .top-link, button')).find(
        el => el.textContent.includes('QUIÉNES SOMOS') || el.textContent.includes('Quiénes Somos')
      );
      if (navBtn) navBtn.click();
    });
    await new Promise(r => setTimeout(r, 600));
    let qsReport = await inspectPageVisuals(page, `${vp.name}_05_quienes_somos`);
    allReports.push({ step: `${vp.name}_05_quienes_somos`, ...qsReport });
    await page.screenshot({ path: path.join(OUTPUT_DIR, `${vp.name}_05_quienes_somos.png`) });

    // 4. Navigation: Contacto
    await page.evaluate(() => {
      const navBtn = Array.from(document.querySelectorAll('.nav-btn-sober, .top-link, button')).find(
        el => el.textContent.includes('CONTACTO') || el.textContent.includes('Contacto')
      );
      if (navBtn) navBtn.click();
    });
    await new Promise(r => setTimeout(r, 600));
    let contactReport = await inspectPageVisuals(page, `${vp.name}_06_contacto`);
    allReports.push({ step: `${vp.name}_06_contacto`, ...contactReport });
    await page.screenshot({ path: path.join(OUTPUT_DIR, `${vp.name}_06_contacto.png`) });

    // 5. Navigation: Historial
    await page.evaluate(() => {
      const navBtn = Array.from(document.querySelectorAll('.nav-btn-sober, .top-link, button')).find(
        el => el.textContent.includes('HISTORIAL') || el.textContent.includes('Historial')
      );
      if (navBtn) navBtn.click();
    });
    await new Promise(r => setTimeout(r, 600));
    let histReport = await inspectPageVisuals(page, `${vp.name}_07_historial`);
    allReports.push({ step: `${vp.name}_07_historial`, ...histReport });
    await page.screenshot({ path: path.join(OUTPUT_DIR, `${vp.name}_07_historial.png`) });
  }

  // Aggregate issues
  const allIssues = [];
  allReports.forEach(r => {
    if (r.issues && r.issues.length > 0) {
      allIssues.push(...r.issues);
    }
  });

  const finalSummary = {
    totalSnapshots: allReports.length,
    totalIssuesFound: allIssues.length,
    issues: allIssues
  };

  fs.writeFileSync(path.join(OUTPUT_DIR, 'suite_report.json'), JSON.stringify(finalSummary, null, 2));
  console.log(`\n========================================`);
  console.log(`🏁 Visual Test Suite Completed!`);
  console.log(`📊 Total issues found: ${allIssues.length}`);
  console.log(`📁 Report saved to: ${path.join(OUTPUT_DIR, 'suite_report.json')}`);
  console.log(`========================================`);

  await browser.close();
}

runTestSuite().catch(err => {
  console.error('Suite error:', err);
  process.exit(1);
});
