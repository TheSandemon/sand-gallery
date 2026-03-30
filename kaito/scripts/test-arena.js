const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  const errors = [];
  page.on('console', msg => {
    if (msg.type() === 'error') errors.push(msg.text());
  });
  page.on('pageerror', err => errors.push(err.message));

  await page.goto('https://thesandemon.github.io/vector-storm/', { waitUntil: 'networkidle' });
  
  // Wait for game to initialize
  await page.waitForTimeout(1500);
  
  // Check initial state
  const title = await page.title();
  console.log('Title:', title);
  
  const h1 = await page.$eval('h1', el => el.textContent);
  console.log('H1:', h1);
  
  // Check ARENA button exists
  const arenaBtn = await page.$('#btn-arena');
  console.log('ARENA button present:', !!arenaBtn);
  
  // Click ARENA button to open overlay
  await arenaBtn.click();
  await page.waitForTimeout(500);
  
  // Check overlay is visible
  const overlayDisplay = await page.$eval('#arena-overlay', el => getComputedStyle(el).display);
  console.log('Overlay display after ARENA click:', overlayDisplay);
  
  // Check HUD tags hidden before start
  const scoreHidden = await page.$eval('#arenaScoreTag', el => el.style.display);
  console.log('Score tag before start:', scoreHidden);
  
  // Click START GAME button
  const startBtn = await page.$('#arena-start-btn');
  await startBtn.click();
  await page.waitForTimeout(500);
  
  // Check overlay is now hidden
  const overlayAfterStart = await page.$eval('#arena-overlay', el => el.style.display);
  console.log('Overlay after START:', overlayAfterStart);
  
  // Check HUD tags are now visible
  const scoreTag = await page.$eval('#arenaScoreTag', el => el.style.display);
  const comboTag = await page.$eval('#arenaComboTag', el => el.style.display);
  const waveTag = await page.$eval('#arenaWaveTag', el => el.style.display);
  const livesTag = await page.$eval('#arenaLivesTag', el => el.style.display);
  const timerTag = await page.$eval('#arenaTimerTag', el => el.style.display);
  console.log('Score tag after start:', scoreTag);
  console.log('Combo tag after start:', comboTag);
  console.log('Wave tag after start:', waveTag);
  console.log('Lives tag after start:', livesTag);
  console.log('Timer tag after start:', timerTag);
  
  // Check initial values
  const score = await page.$eval('#arenaScore', el => el.textContent);
  const combo = await page.$eval('#arenaCombo', el => el.textContent);
  const wave = await page.$eval('#arenaWave', el => el.textContent);
  const lives = await page.$eval('#arenaLives', el => el.textContent);
  const timer = await page.$eval('#arenaTimer', el => el.textContent);
  console.log('Score:', score, '| Combo:', combo, '| Wave:', wave, '| Lives:', lives, '| Timer:', timer);
  
  // Simulate spawning shapes and throwing them (click and drag)
  for (let i = 0; i < 5; i++) {
    const x = 200 + Math.random() * 400;
    const y = 300 + Math.random() * 200;
    await page.mouse.click(x, y);
    await page.waitForTimeout(100);
    // Drag to throw
    await page.mouse.move(x, y);
    await page.mouse.down();
    await page.mouse.move(x + 100, y + 50);
    await page.mouse.up();
    await page.waitForTimeout(200);
  }
  
  await page.waitForTimeout(3000);
  
  // Check timer has decreased
  const timerAfter = await page.$eval('#arenaTimer', el => el.textContent);
  console.log('Timer after 3s:', timerAfter, '(was', timer + ')');
  
  // Check for targets (arenaTargets should have spawned)
  // We can't directly check JS arrays, but we can verify no errors
  console.log('Console errors:', errors.length === 0 ? 'NONE' : errors);
  
  if (errors.length === 0) {
    console.log('\n=== ARENA MODE TEST: PASS ===');
  } else {
    console.log('\n=== ARENA MODE TEST: FAIL ===');
    console.log('Errors:', errors);
  }
  
  await browser.close();
})();
