const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  const errors = [];
  page.on('console', m => { if (m.type()==='error') errors.push('ERR:'+m.text()); });
  page.on('pageerror', e => errors.push('PAGEERR:'+e.message));
  await page.goto('https://thesandemon.github.io/fractal-fold/', { waitUntil: 'networkidle', timeout: 20000 });
  await page.waitForTimeout(2000);
  
  // Check canvas exists and has size
  const canvas = await page.$('canvas#c');
  const box = await canvas.boundingBox();
  console.log('Canvas size:', box ? box.width+'x'+box.height : 'NOT FOUND');
  
  // Check fold mode buttons
  const modes = await page.locator('[data-mode]').all();
  console.log('Mode buttons:', modes.length, '(expect 4)');
  for (const m of modes) {
    await m.click();
    await page.waitForTimeout(100);
  }
  
  // Check tool buttons
  const tools = await page.locator('[data-tool]').all();
  console.log('Tool buttons:', tools.length, '(expect 5)');
  for (const t of tools) {
    await t.click();
    await page.waitForTimeout(50);
  }
  
  // Simulate drawing on canvas - draw a line
  await page.locator('[data-tool="line"]').click();
  const cx = box.x + box.width/2, cy = box.y + box.height/2;
  await page.mouse.move(cx, cy);
  await page.mouse.down();
  await page.mouse.move(cx+100, cy+100);
  await page.mouse.up();
  await page.waitForTimeout(500);
  
  // Draw a circle
  await page.locator('[data-tool="circle"]').click();
  await page.mouse.move(cx-100, cy-100);
  await page.mouse.down();
  await page.mouse.move(cx-50, cy-50);
  await page.mouse.up();
  await page.waitForTimeout(500);
  
  // Draw a triangle
  await page.locator('[data-tool="triangle"]').click();
  await page.mouse.move(cx+50, cy-50);
  await page.mouse.down();
  await page.mouse.move(cx+150, cy-50);
  await page.mouse.up();
  await page.waitForTimeout(500);
  
  // Check stats display
  const stats = await page.locator('#shapeStat').textContent();
  console.log('Shape stat after drawing:', stats);
  
  // Check fold count display
  const foldCount = await page.locator('#fold-count').textContent();
  console.log('Fold count display:', foldCount);
  
  // Test mirror mode + right click to add fold
  await page.locator('[data-mode="mirror"]').click();
  await page.mouse.click(box.x + box.width/2, box.y + box.height/2, { button: 'right' });
  await page.waitForTimeout(300);
  const foldCountAfter = await page.locator('#fold-count').textContent();
  console.log('Fold count after right-click:', foldCountAfter);
  
  // Test clear button
  await page.locator('#clearBtn').click();
  await page.waitForTimeout(200);
  const statsAfterClear = await page.locator('#shapeStat').textContent();
  console.log('Shape stat after clear:', statsAfterClear);
  
  // Test DEMO mode for a bit
  await page.locator('#demoBtn').click();
  await page.waitForTimeout(2000);
  const statsAfterDemo = await page.locator('#shapeStat').textContent();
  console.log('Shape stat after demo:', statsAfterDemo);
  await page.locator('#demoBtn').click(); // turn off
  
  // Test undo button
  await page.locator('#undoBtn').click();
  await page.waitForTimeout(200);
  
  // Test radial mode with N slider
  await page.locator('[data-mode="radial"]').click();
  await page.waitForTimeout(300);
  const radialDisplay = await page.locator('#fold-count').textContent();
  console.log('Radial mode display:', radialDisplay);
  
  // Check no errors
  console.log('Console errors:', errors.length === 0 ? 'NONE' : errors.join(' | '));
  
  await browser.close();
  console.log('GAMEPLAY TEST COMPLETE');
})().catch(e => { console.error('FAIL:', e.message); process.exit(1); });
