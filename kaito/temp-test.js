const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  const errors = [];
  page.on('console', msg => { if (msg.type() === 'error') errors.push(msg.text()); });
  page.on('pageerror', err => errors.push(err.message));
  await page.goto('https://thesandemon.github.io/orbital-decay/');
  await page.waitForTimeout(500);
  await page.click('canvas');
  await page.waitForTimeout(300);
  for (let i = 0; i < 12; i++) {
    const x = 640 + Math.cos(i * 0.3) * 200;
    const y = 360 + Math.sin(i * 0.3) * 150;
    await page.mouse.move(x, y);
    await page.waitForTimeout(1000);
    const score = await page.locator('#score-display').textContent();
    const mass = await page.evaluate(() => document.getElementById('mass-fill').style.width);
    const eclipse = await page.evaluate(() => document.getElementById('eclipse-indicator').className.includes('active'));
    console.log('T+' + (i+1) + 's: score=' + score + ' mass=' + mass + ' eclipse=' + eclipse);
  }
  console.log('Console errors:', errors.length === 0 ? 'NONE' : errors);
  await browser.close();
})();
