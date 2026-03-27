const { chromium } = require('@playwright/test');

(async () => {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  
  // Collect console messages
  const logs = [];
  page.on('console', msg => {
    if (msg.type() === 'error') {
      logs.push(`[ERROR] ${msg.text()}`);
    }
  });
  
  // Go to the game
  await page.goto('https://thesandemon.github.io/nexus-rift/');
  await page.waitForTimeout(1000);
  
  console.log('=== NEXUS RIFT GAME TEST ===');
  console.log('Page loaded. Starting game...');
  
  // Find and click the INITIATE button (the start button, not restart)
  const startBtn = page.locator('#start-btn');
  await startBtn.waitFor({ timeout: 5000 });
  await startBtn.click();
  console.log('[OK] Clicked INITIATE - game started');
  
  // Wait for game to initialize
  await page.waitForTimeout(500);
  
  // Get canvas dimensions
  const canvas = page.locator('canvas');
  const box = await canvas.boundingBox();
  const centerX = box.x + box.width / 2;
  const centerY = box.y + box.height / 2;
  console.log(`[OK] Canvas: ${box.width}x${box.height}`);
  
  // ===== AGGRESSIVE GAMEPLAY TEST =====
  console.log('\n--- Testing Controls ---');
  
  // Test 1: Movement - WASD
  console.log('[TEST] WASD movement...');
  await page.keyboard.down('w');
  await page.waitForTimeout(200);
  await page.keyboard.up('w');
  await page.keyboard.down('s');
  await page.waitForTimeout(200);
  await page.keyboard.up('s');
  await page.keyboard.down('a');
  await page.waitForTimeout(200);
  await page.keyboard.up('a');
  await page.keyboard.down('d');
  await page.waitForTimeout(200);
  await page.keyboard.up('d');
  console.log('[OK] WASD movement tested');
  
  // Test 2: Arrow keys
  console.log('[TEST] Arrow key movement...');
  await page.keyboard.press('ArrowUp');
  await page.waitForTimeout(100);
  await page.keyboard.press('ArrowDown');
  await page.waitForTimeout(100);
  await page.keyboard.press('ArrowLeft');
  await page.waitForTimeout(100);
  await page.keyboard.press('ArrowRight');
  await page.waitForTimeout(100);
  console.log('[OK] Arrow keys tested');
  
  // Test 3: Shooting
  console.log('[TEST] Shooting (mouse click)...');
  for (let i = 0; i < 10; i++) {
    const targetX = centerX + (Math.random() - 0.5) * 400;
    const targetY = centerY + (Math.random() - 0.5) * 400;
    await page.mouse.move(targetX, targetY);
    await page.mouse.click(targetX, targetY);
    await page.waitForTimeout(80);
  }
  console.log('[OK] Shooting tested (10 shots)');
  
  // Test 4: Dash
  console.log('[TEST] Dash (SHIFT)...');
  await page.keyboard.press('Shift');
  await page.waitForTimeout(100);
  await page.keyboard.press('Shift');
  await page.waitForTimeout(100);
  await page.keyboard.press('Shift');
  console.log('[OK] Dash tested (3 dashes)');
  
  // Test 5: Rift Burst (SPACE)
  console.log('[TEST] Rift Burst (SPACE)...');
  await page.keyboard.press('Space');
  await page.waitForTimeout(200);
  await page.keyboard.press('Space');
  console.log('[OK] Rift Burst tested');
  
  // ===== COMBINED GAMEPLAY =====
  console.log('\n--- Aggressive Combined Test ---');
  
  // Move around while shooting
  for (let i = 0; i < 15; i++) {
    const moveKey = ['w', 'a', 's', 'd'][Math.floor(Math.random() * 4)];
    await page.keyboard.down(moveKey);
    
    const targetX = centerX + (Math.random() - 0.5) * 600;
    const targetY = centerY + (Math.random() - 0.5) * 600;
    await page.mouse.move(targetX, targetY);
    await page.mouse.click(targetX, targetY);
    await page.waitForTimeout(100);
    
    await page.keyboard.up(moveKey);
    
    // Occasionally dash
    if (i % 5 === 0) {
      await page.keyboard.press('Shift');
    }
    
    // Occasionally rift burst
    if (i % 7 === 0) {
      await page.keyboard.press('Space');
    }
  }
  console.log('[OK] Combined movement/shooting test done');
  
  // ===== OBSERVE GAME STATE =====
  console.log('\n--- Observing Game State ---');
  await page.waitForTimeout(500);
  
  // Take screenshot
  await page.screenshot({ path: 'game-screenshot-final.png' });
  console.log('[OK] Final screenshot saved');
  
  // Check for console errors
  console.log('\n--- Console Errors ---');
  if (logs.length === 0) {
    console.log('[OK] No console errors detected');
  } else {
    console.log(`[WARN] ${logs.length} console errors:`);
    logs.forEach(log => console.log(log));
  }
  
  // Try to evaluate game state from page
  const gameState = await page.evaluate(() => {
    // Try to find any exposed game state
    return {
      hasCanvas: !!document.querySelector('canvas'),
      title: document.title
    };
  });
  console.log(`\n[INFO] Page title: ${gameState.title}`);
  
  await page.waitForTimeout(500);
  
  await browser.close();
  console.log('\n=== TEST COMPLETE ===');
})();
