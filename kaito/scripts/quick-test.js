const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch({ headless: true });
  const ctx = await browser.newContext();
  const page = await ctx.newPage();
  const errors = [];
  page.on('pageerror', e => errors.push(e.message));
  await page.goto('https://thesandemon.github.io/fractal-fold/?v=' + Date.now(), { waitUntil: 'networkidle', timeout: 20000 });
  await page.waitForTimeout(3000);
  
  const box = await page.locator('canvas#c').boundingBox();
  const cx = box.x + box.width/2, cy = box.y + box.height/2;
  await page.locator('[data-tool="circle"]').click();
  await page.mouse.move(cx - 50, cy - 50);
  await page.mouse.down();
  await page.mouse.move(cx + 50, cy + 50);
  await page.mouse.up();
  await page.waitForTimeout(1000);
  
  const stats = await page.locator('#shapeStat').textContent();
  console.log('Shapes:', stats);
  console.log('Errors:', errors.length ? errors.join(' | ') : 'NONE');
  await browser.close();
  process.exit(0);
})().catch(e => { console.error(e.message); process.exit(1); });
