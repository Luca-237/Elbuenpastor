const puppeteer = require('puppeteer-core');
const fs = require('fs');
const path = require('path');

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

async function processLogos() {
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  const page = await browser.newPage();
  
  await page.setContent('<!DOCTYPE html><html><body><canvas id="c"></canvas></body></html>');

  const logoPath = path.join(__dirname, '..', 'frontend', 'public', 'logo-buen-pastor.png');
  const logoBase64 = fs.readFileSync(logoPath).toString('base64');
  
  const results = await page.evaluate(async (b64) => {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        const w = img.width;
        const h = img.height;
        const canvas = document.getElementById('c');
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext('2d');
        
        // 1. Transparent version: convert white/off-white background to transparent
        ctx.drawImage(img, 0, 0);
        const imgData1 = ctx.getImageData(0, 0, w, h);
        const d1 = imgData1.data;
        for (let i = 0; i < d1.length; i += 4) {
          const r = d1[i], g = d1[i+1], b = d1[i+2];
          if (r > 240 && g > 240 && b > 240) {
            d1[i+3] = 0;
          } else if (r > 200 && g > 200 && b > 200) {
            d1[i+3] = Math.round(255 - ((r - 200) / 45) * 255);
          }
        }
        ctx.putImageData(imgData1, 0, 0);
        const transparentPng = canvas.toDataURL('image/png').split(',')[1];
        
        // 2. Radiant Metallic Gold version for dark backgrounds
        const canvasGold = document.createElement('canvas');
        canvasGold.width = w;
        canvasGold.height = h;
        const ctxGold = canvasGold.getContext('2d');
        const imgData2 = ctxGold.createImageData(w, h);
        const d2 = imgData2.data;

        for (let i = 0; i < d1.length; i += 4) {
          const r = d1[i], g = d1[i+1], b = d1[i+2], a = d1[i+3];
          if (a > 15) {
            const isTerracotta = (r > 130 && g < 110 && b < 100);
            if (isTerracotta) {
              // Warm golden-terracotta / rich gold
              d2[i] = 240;
              d2[i+1] = 195;
              d2[i+2] = 110;
              d2[i+3] = a;
            } else {
              // Radiant metallic gold
              d2[i] = 212;
              d2[i+1] = 175;
              d2[i+2] = 55;
              d2[i+3] = a;
            }
          } else {
            d2[i+3] = 0;
          }
        }
        ctxGold.putImageData(imgData2, 0, 0);
        const goldPng = canvasGold.toDataURL('image/png').split(',')[1];

        // 3. Gold Medallion on Deep Navy (#0C2340) with double gold ring
        const medCanvas = document.createElement('canvas');
        medCanvas.width = 400;
        medCanvas.height = 400;
        const mctx = medCanvas.getContext('2d');

        // Circular background with subtle radial gradient
        const grad = mctx.createRadialGradient(200, 200, 50, 200, 200, 190);
        grad.addColorStop(0, '#102C4E');
        grad.addColorStop(1, '#081729');
        mctx.beginPath();
        mctx.arc(200, 200, 192, 0, Math.PI * 2);
        mctx.fillStyle = grad;
        mctx.fill();

        // Outer gold ring
        mctx.beginPath();
        mctx.arc(200, 200, 188, 0, Math.PI * 2);
        mctx.lineWidth = 4;
        mctx.strokeStyle = '#D4AF37';
        mctx.stroke();

        // Inner gold ring
        mctx.beginPath();
        mctx.arc(200, 200, 180, 0, Math.PI * 2);
        mctx.lineWidth = 1.5;
        mctx.strokeStyle = '#F3DE98';
        mctx.stroke();

        // Little laurel / star dots around ring
        for (let angle = 0; angle < Math.PI * 2; angle += Math.PI / 8) {
          const x = 200 + Math.cos(angle) * 184;
          const y = 200 + Math.sin(angle) * 184;
          mctx.beginPath();
          mctx.arc(x, y, 2.5, 0, Math.PI * 2);
          mctx.fillStyle = '#E5C378';
          mctx.fill();
        }

        // Draw upper Good Shepherd illustration in gold inside
        mctx.save();
        mctx.beginPath();
        mctx.arc(200, 200, 175, 0, Math.PI * 2);
        mctx.clip();
        // Crop the shepherd figure (top 75% of canvasGold)
        mctx.drawImage(canvasGold, 90, 15, w - 180, h * 0.72, 40, 25, 320, 320);
        mctx.restore();

        const medallionPng = medCanvas.toDataURL('image/png').split(',')[1];

        resolve({ transparentPng, goldPng, medallionPng });
      };
      img.src = 'data:image/png;base64,' + b64;
    });
  }, logoBase64);

  const publicDir = path.join(__dirname, '..', 'frontend', 'public');
  fs.writeFileSync(path.join(publicDir, 'logo-buen-pastor-transparent.png'), Buffer.from(results.transparentPng, 'base64'));
  fs.writeFileSync(path.join(publicDir, 'logo-buen-pastor-gold.png'), Buffer.from(results.goldPng, 'base64'));
  fs.writeFileSync(path.join(publicDir, 'logo-medallion-navy.png'), Buffer.from(results.medallionPng, 'base64'));

  console.log('Successfully generated transparent, gold, and medallion logos!');
  await browser.close();
}

processLogos().catch(e => {
  console.error('Error generating logos:', e);
  process.exit(1);
});
