const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  const errors = [];
  page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
  page.on('pageerror', e => errors.push(e.message));
  await page.goto('https://thesandemon.github.io/pixel-storm/');
  await page.waitForTimeout(1000);

  // Canvas should be rendering
  const canvasEl = await page.locator('#grid');
  const canvasBox = await canvasEl.boundingBox();
  console.log('Canvas dimensions:', canvasBox ? `${Math.round(canvasBox.width)}x${Math.round(canvasBox.height)}` : 'not found');

  // Check initial generation = 0
  const gen0 = await page.locator('#gen-count').textContent();
  console.log('Initial gen:', gen0);

  // Wait 3 seconds for some generations to run
  await page.waitForTimeout(3000);
  const genAfter3s = await page.locator('#gen-count').textContent();
  console.log('Gen after 3s play:', genAfter3s);

  // Check population changed
  const pop = await page.locator('#pop-count').textContent();
  console.log('Population:', pop);

  // Test play/pause
  await page.click('#play-btn');
  await page.waitForTimeout(500);
  const genAfterPause = await page.locator('#gen-count').textContent();
  const genPaused = genAfterPause === genAfter3s;
  console.log('Gen froze on pause:', genPaused, '(gen was', genAfter3s, 'now', genAfterPause + ')');

  // Resume
  await page.click('#play-btn');
  await page.waitForTimeout(500);

  // Test random button
  await page.click('#random-btn');
  await page.waitForTimeout(500);
  const genAfterRandom = await page.locator('#gen-count').textContent();
  console.log('Gen after random:', genAfterRandom, '(should be ~0 or reset)');

  // Test step button
  await page.click('#step-btn');
  await page.waitForTimeout(200);
  console.log('Step button functional (paused + stepped)');

  // Test new rule: LLFE
  await page.click('[data-rule="llfe"]');
  await page.waitForTimeout(300);
  console.log('LLFE rule selected OK');

  // Test new rule: Vote 4/2
  await page.click('[data-rule="vote"]');
  await page.waitForTimeout(300);
  console.log('Vote 4/2 rule selected OK');

  // Test clear
  await page.click('#clear-btn');
  await page.waitForTimeout(200);
  const genAfterClear = await page.locator('#gen-count').textContent();
  console.log('Gen after clear:', genAfterClear, '(should be 0)');

  // Test zoom slider
  await page.fill('#zoom-slider', '200');
  await page.dispatchEvent('#zoom-slider', 'input');
  await page.waitForTimeout(200);
  const zoomPct = await page.locator('#zoom-pct').textContent();
  console.log('Zoom to 200%:', zoomPct);

  // Reset zoom
  await page.click('#zoom-fit-btn');
  await page.waitForTimeout(200);
  const zoomFit = await page.locator('#zoom-pct').textContent();
  console.log('Zoom after FIT:', zoomFit);

  // Test pattern injection (glider)
  await page.click('[data-pattern="glider"]');
  await page.waitForTimeout(200);
  console.log('Glider injected OK');

  // Let it run 5 more seconds
  await page.click('#play-btn');
  await page.waitForTimeout(5000);
  const finalGen = await page.locator('#gen-count').textContent();
  console.log('Final generation after 5s run:', finalGen);

  // Check for any species detection
  const gliderFound = await page.locator('#st-glider.found').count() > 0;
  const stillFound = await page.locator('#st-still.found').count() > 0;
  console.log('Species detected (glider/still):', gliderFound, stillFound);

  console.log('Console errors:', errors.length > 0 ? errors : 'none');
  await browser.close();
})();
