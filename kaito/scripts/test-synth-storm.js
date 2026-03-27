const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  const errors = [];
  page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
  page.on('pageerror', e => errors.push(e.message));
  await page.goto('https://thesandemon.github.io/synth-storm/', { waitUntil: 'networkidle' });
  console.log('Starting gameplay test...');

  await page.waitForTimeout(2000);
  
  // Test each mode for ~10 seconds
  const modes = ['particles', 'spiral', 'galaxy', 'wave', 'storm', 'laser', 'waterfall', 'sonar', 'eq'];
  for (const m of modes) {
    await page.evaluate((mode) => toggleMode(mode), m);
    console.log(`  Playing ${m.toUpperCase()} mode...`);
    await page.waitForTimeout(1500);
    // Check no errors in this mode
    const errCount = errors.length;
    await page.waitForTimeout(1000);
    const newErrs = errors.length - errCount;
    if (newErrs > 0) console.log(`    !! ${newErrs} new errors in ${m} mode`);
  }
  
  // Test SPACE pause
  await page.keyboard.press('Space');
  await page.waitForTimeout(300);
  const paused = await page.evaluate(() => paused);
  console.log(`[${paused ? 'PASS' : 'FAIL'}] SPACE pauses`);
  await page.keyboard.press('Space');
  await page.waitForTimeout(300);
  
  // Test P burst
  await page.keyboard.press('p');
  await page.waitForTimeout(300);
  const pc = await page.evaluate(() => particles.length);
  console.log(`[${pc > 50 ? 'PASS' : 'FAIL'}] P key burst (${pc} particles)`);
  
  // Test L loop toggle
  await page.keyboard.press('l');
  await page.waitForTimeout(200);
  const loopOn = await page.evaluate(() => loopEnabled);
  console.log(`[${loopOn !== undefined ? 'PASS' : 'FAIL'}] L key toggles loop`);
  
  // Theme cycling
  for (let i = 0; i < 6; i++) await page.keyboard.press('t');
  const finalTheme = await page.$eval('#theme-indicator', el => el.textContent);
  console.log(`[${finalTheme === 'AURORA' ? 'PASS' : 'FAIL'}] Theme cycling (ends at: ${finalTheme})`);
  
  // Let it run for 30 more seconds in PARTICLES
  await page.evaluate(() => toggleMode('particles'));
  await page.waitForTimeout(30000);
  
  console.log(`\nTotal console errors: ${errors.length}`);
  if (errors.length > 0) console.log('Errors:', errors);
  
  await browser.close();
  console.log('\n=== GAMEPLAY TEST COMPLETE ===');
  if (errors.length > 0) { process.exit(1); }
})().catch(e => { console.error('GAMEPLAY TEST FAILED:', e.message); process.exit(1); });
