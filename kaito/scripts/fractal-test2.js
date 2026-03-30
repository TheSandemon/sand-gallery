const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  const errors = [];
  page.on('console', msg => {
    if (msg.type() === 'error') errors.push({text: msg.text(), loc: msg.location()});
  });
  page.on('pageerror', err => errors.push({text: err.message, stack: err.stack}));

  await page.goto('https://thesandemon.github.io/fractal-fold/');
  await page.waitForTimeout(1000);
  
  // Test all modes one by one
  const modes = ['mirror', 'radial', 'crystal', 'kaleido', 'fractal', 'triply'];
  for (const m of modes) {
    await page.click(`[data-mode="${m}"]`);
    await page.waitForTimeout(300);
    // Draw something
    await page.mouse.move(640, 360);
    await page.mouse.down();
    await page.mouse.move(700, 400);
    await page.mouse.up();
    await page.waitForTimeout(200);
  }
  
  // Test theme cycling
  for (let i = 0; i < 4; i++) {
    await page.keyboard.press('t');
    await page.waitForTimeout(100);
  }
  
  // Test mesh
  await page.keyboard.press('l');
  await page.waitForTimeout(100);
  
  // Test demo
  await page.click('#demoBtn');
  await page.waitForTimeout(1000);
  
  console.log('Errors:', JSON.stringify(errors, null, 2));
  
  await browser.close();
})();
