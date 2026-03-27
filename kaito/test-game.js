const { chromium } = require('@playwright/test');

(async () => {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  
  // Go to the game
  await page.goto('https://thesandemon.github.io/nexus-rift/');
  await page.waitForTimeout(1000);
  
  console.log('Page loaded. Looking for INITIATE button...');
  
  // Find and click the INITIATE button (the start button, not restart)
  const initiateBtn = page.locator('#start-btn');
  await initiateBtn.waitFor({ timeout: 5000 });
  await initiateBtn.click();
  console.log('Clicked INITIATE - game should start');
  
  // Wait for game to initialize
  await page.waitForTimeout(500);
  
  // Get canvas dimensions
  const canvas = page.locator('canvas');
  const box = await canvas.boundingBox();
  console.log('Canvas found at:', box);
  
  // Play aggressively - move around and shoot
  console.log('Starting gameplay test...');
  
  // Move with WASD
  await page.keyboard.down('w');
  await page.waitForTimeout(300);
  await page.keyboard.up('w');
  await page.keyboard.down('d');
  await page.waitForTimeout(300);
  await page.keyboard.up('d');
  
  // Aim and shoot
  await page.mouse.move(box.x + box.width/2 + 100, box.y + box.height/2);
  await page.mouse.click(box.x + box.width/2 + 100, box.y + box.height/2);
  await page.waitForTimeout(100);
  await page.mouse.click(box.x + box.width/2 + 100, box.y + box.height/2);
  console.log('Moved and shot');
  
  // Try dash
  await page.keyboard.press('Shift');
  console.log('Tried dash (SHIFT)');
  
  // Move more
  await page.keyboard.down('a');
  await page.waitForTimeout(200);
  await page.keyboard.up('a');
  await page.keyboard.down('s');
  await page.waitForTimeout(200);
  await page.keyboard.up('s');
  
  // Shoot more
  await page.mouse.move(box.x + box.width/2 - 100, box.y + box.height/2 - 50);
  await page.mouse.click(box.x + box.width/2 - 100, box.y + box.height/2 - 50);
  await page.waitForTimeout(100);
  await page.mouse.click(box.x + box.width/2 - 100, box.y + box.height/2 - 50);
  
  // Try arrows
  await page.keyboard.press('ArrowUp');
  await page.waitForTimeout(100);
  await page.keyboard.press('ArrowRight');
  console.log('Tested arrow keys');
  
  // Dash again
  await page.keyboard.press('Shift');
  console.log('Tried dash again');
  
  // Shoot multiple times
  for (let i = 0; i < 5; i++) {
    await page.mouse.move(box.x + box.width/2 + Math.random()*200 - 100, box.y + box.height/2 + Math.random()*200 - 100);
    await page.mouse.click(box.x + box.width/2 + Math.random()*200 - 100, box.y + box.height/2 + Math.random()*200 - 100);
    await page.waitForTimeout(50);
  }
  console.log('Rapid fire test done');
  
  // Try rift burst (space)
  await page.keyboard.press('Space');
  console.log('Tried RIFT BURST (SPACE)');
  
  // Continue playing
  await page.keyboard.down('w');
  await page.keyboard.down('d');
  await page.waitForTimeout(500);
  await page.mouse.click(box.x + box.width/2 + 150, box.y + box.height/2);
  await page.waitForTimeout(300);
  await page.keyboard.up('w');
  await page.keyboard.up('d');
  
  // More shooting
  await page.mouse.click(box.x + box.width/2 - 100, box.y + box.height/2 + 100);
  await page.mouse.click(box.x + box.width/2 + 100, box.y + box.height/2 - 100);
  await page.mouse.click(box.x + box.width/2, box.y + box.height/2 + 150);
  
  await page.waitForTimeout(500);
  
  // Take a screenshot to see game state
  await page.screenshot({ path: 'game-screenshot.png' });
  console.log('Screenshot saved to game-screenshot.png');
  
  // Check for any console errors
  console.log('Waiting a bit more to observe game loop...');
  await page.waitForTimeout(1000);
  
  await browser.close();
  console.log('Test complete!');
})();
