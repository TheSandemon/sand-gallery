const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  const errors = [];
  const logs = [];
  page.on('console', msg => {
    if (msg.type() === 'error') errors.push(msg.text());
    if (msg.type() === 'log') logs.push(msg.text());
  });
  page.on('pageerror', err => errors.push('PAGEERROR: ' + err.message));

  await page.goto('https://thesandemon.github.io/vector-storm/', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(2000);
  
  // Inject a frame counter to check if rAF is running
  const frameCount = await page.evaluate(() => {
    return new Promise(resolve => {
      let count = 0;
      const start = Date.now();
      function check() {
        count++;
        if (Date.now() - start < 1000) {
          requestAnimationFrame(check);
        } else {
          resolve(count);
        }
      }
      requestAnimationFrame(check);
    });
  });
  console.log('rAF frames in 1 second:', frameCount);
  
  // Click ARENA and start
  await page.click('#btn-arena');
  await page.waitForTimeout(300);
  await page.click('#arena-start-btn');
  await page.waitForTimeout(500);
  
  // Check timer
  const timer1 = await page.$eval('#arenaTimer', el => el.textContent);
  await page.waitForTimeout(2000);
  const timer2 = await page.$eval('#arenaTimer', el => el.textContent);
  console.log('Timer at start:', timer1, '| Timer after 2s:', timer2);
  
  // Check loop running
  const arenaLoopFrames = await page.evaluate(() => {
    return new Promise(resolve => {
      let count = 0;
      const start = Date.now();
      function check() {
        count++;
        if (Date.now() - start < 1000) {
          requestAnimationFrame(check);
        } else {
          resolve(count);
        }
      }
      requestAnimationFrame(check);
    });
  });
  console.log('rAF frames in 1 second (arena mode):', arenaLoopFrames);
  
  console.log('Errors:', errors.length > 0 ? errors : 'NONE');
  
  await browser.close();
})();
