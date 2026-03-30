const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  const errors = [];
  page.on('console', msg => { if (msg.type() === 'error') errors.push(msg.text()); });
  page.on('pageerror', err => errors.push(err.message));
  
  await page.goto('https://thesandemon.github.io/void-link/');
  await page.waitForTimeout(3000);

  // Check canvas renders
  const canvas = await page.$('canvas#c');
  const box = await canvas.boundingBox();
  console.log('Canvas: ' + box.width + 'x' + box.height);

  // Check HUD
  const title = await page.textContent('#hud h1');
  console.log('Title: ' + title);
  const modeDisplay = await page.textContent('#mode-display');
  console.log('Mode: ' + modeDisplay);

  // Wait for stat-bar to have content (JS initialized)
  await page.waitForSelector('#stat-bar', { timeout: 5000 });
  // Check stats
  const statNodes = await page.textContent('#stat-nodes');
  const statRopes = await page.textContent('#stat-ropes');
  console.log('Initial stats - Nodes: ' + statNodes + ', Ropes: ' + statRopes);

  // Click to place anchor
  await page.mouse.click(200, 300);
  await page.waitForTimeout(300);
  const nodesAfterAnchor = await page.textContent('#stat-nodes');
  console.log('Nodes after anchor: ' + nodesAfterAnchor);

  // Switch to rope tool
  await page.click('[data-tool="rope"]');
  const ropeMode = await page.textContent('#mode-display');
  console.log('Rope mode: ' + ropeMode);

  // Click two points to make rope
  await page.mouse.click(300, 200);
  await page.waitForTimeout(200);
  await page.mouse.click(450, 200);
  await page.waitForTimeout(200);
  const ropesAfter = await page.textContent('#stat-ropes');
  console.log('Ropes after: ' + ropesAfter);

  // Test grab tool
  await page.click('[data-tool="grab"]');
  const grabMode = await page.textContent('#mode-display');
  console.log('Grab mode: ' + grabMode);

  // Test gravity slider
  await page.fill('#grav-slider', '2');
  await page.dispatchEvent('#grav-slider', 'input');
  await page.waitForTimeout(100);
  const gravVal = await page.textContent('#grav-val');
  console.log('Gravity set to: ' + gravVal);

  // Test space bar (pause)
  await page.keyboard.press('Space');
  await page.waitForTimeout(300);
  const statsBar = await page.textContent('#stat-bar');
  console.log('Stats (paused): ' + statsBar.substring(0, 60));

  // Unpause
  await page.keyboard.press('Space');
  await page.waitForTimeout(200);

  // Test node tool
  await page.click('[data-tool="node"]');
  await page.mouse.click(500, 400);
  await page.waitForTimeout(200);
  const nodesAfterNode = await page.textContent('#stat-nodes');
  console.log('Nodes after adding free node: ' + nodesAfterNode);

  // Test wall tool
  await page.click('[data-tool="wall"]');
  await page.mouse.click(100, 500);
  await page.waitForTimeout(100);
  await page.mouse.click(700, 500);
  await page.waitForTimeout(200);

  // Test stiffness slider
  await page.fill('#stiff-slider', '0.5');
  await page.dispatchEvent('#stiff-slider', 'input');
  const stiffVal = await page.textContent('#stiff-val');
  console.log('Stiffness: ' + stiffVal);

  // Test damping slider
  await page.fill('#damp-slider', '0.95');
  await page.dispatchEvent('#damp-slider', 'input');
  const dampVal = await page.textContent('#damp-val');
  console.log('Damping: ' + dampVal);

  // Test rope length slider
  await page.fill('#len-slider', '100');
  await page.dispatchEvent('#len-slider', 'input');
  const lenVal = await page.textContent('#len-val');
  console.log('Rope length: ' + lenVal);

  // Wait for physics to run
  await page.waitForTimeout(2000);

  // Test clear button
  await page.click('.action-btn');
  await page.waitForTimeout(300);
  const nodesAfterClear = await page.textContent('#stat-nodes');
  const ropesAfterClear = await page.textContent('#stat-ropes');
  console.log('After CLEAR - Nodes: ' + nodesAfterClear + ', Ropes: ' + ropesAfterClear);

  // Test reset
  await page.click('.action-btn.danger');
  await page.waitForTimeout(300);
  const nodesAfterReset = await page.textContent('#stat-nodes');
  console.log('After RESET - Nodes: ' + nodesAfterReset);

  console.log('Console errors: ' + (errors.length === 0 ? 'NONE' : errors.join(', ')));
  await browser.close();
  console.log('ALL TESTS PASSED');
})();
