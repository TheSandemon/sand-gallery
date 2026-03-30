const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  const errors = [];
  page.on('console', msg => {
    if (msg.type() === 'error') errors.push(msg.text());
  });
  page.on('pageerror', err => errors.push(err.message));

  await page.goto('https://thesandemon.github.io/fractal-fold/');
  await page.waitForTimeout(1500);

  // Check overlay visible initially
  const overlay = await page.evaluate(() => {
    const hint = document.getElementById('hint');
    return hint && hint.textContent.includes('CLICK');
  });
  console.log('Initial hint visible:', overlay);

  // Check all 6 mode buttons
  const modeBtns = await page.evaluate(() => {
    return Array.from(document.querySelectorAll('[data-mode]')).map(b => b.dataset.mode);
  });
  console.log('Mode buttons:', modeBtns);
  console.log('Has FRACTAL mode:', modeBtns.includes('fractal'));
  console.log('Has TRIPLY mode:', modeBtns.includes('triply'));

  // Check all 6 tool buttons (added star)
  const toolBtns = await page.evaluate(() => {
    return Array.from(document.querySelectorAll('[data-tool]')).map(b => b.dataset.tool);
  });
  console.log('Tool buttons:', toolBtns);
  console.log('Has STAR tool:', toolBtns.includes('star'));

  // Check audio button
  const audioBtn = await page.evaluate(() => !!document.getElementById('audioBtn'));
  console.log('Audio button exists:', audioBtn);

  // Check mesh button
  const meshBtn = await page.evaluate(() => !!document.getElementById('meshBtn'));
  console.log('Mesh button exists:', meshBtn);

  // Check theme tag
  const themeTag = await page.evaluate(() => {
    const t = document.getElementById('theme-tag');
    return t ? t.textContent : null;
  });
  console.log('Theme tag:', themeTag);

  // Check mesh distance slider
  const meshSlider = await page.evaluate(() => !!document.getElementById('meshDist'));
  console.log('Mesh dist slider exists:', meshSlider);

  // Check trail canvas exists
  const trailCanvas = await page.evaluate(() => !!document.getElementById('trail'));
  console.log('Trail canvas exists:', trailCanvas);

  // Test canvas renders pixels
  const pixels = await page.evaluate(() => {
    const c = document.getElementById('c');
    const ctx = c.getContext('2d');
    const d = ctx.getImageData(0, 0, 100, 100).data;
    let nonBlack = 0;
    for (let i = 0; i < d.length; i += 4) {
      if (d[i] > 5 || d[i+1] > 5 || d[i+2] > 5) nonBlack++;
    }
    return nonBlack;
  });
  console.log('Non-black pixels in 100x100:', pixels);

  // Test clicking star tool
  await page.click('[data-tool="star"]');
  const starActive = await page.evaluate(() => {
    return document.querySelector('[data-tool="star"]').classList.contains('active');
  });
  console.log('Star tool active after click:', starActive);

  // Test clicking fractal mode
  await page.click('[data-mode="fractal"]');
  const fractalActive = await page.evaluate(() => {
    return document.querySelector('[data-mode="fractal"]').classList.contains('active');
  });
  console.log('Fractal mode active after click:', fractalActive);

  // Test clicking triply mode
  await page.click('[data-mode="triply"]');
  const triplyActive = await page.evaluate(() => {
    return document.querySelector('[data-mode="triply"]').classList.contains('active');
  });
  console.log('Triply mode active after click:', triplyActive);

  // Test drawing a circle (click and drag)
  await page.click('[data-tool="circle"]');
  await page.mouse.move(640, 360);
  await page.mouse.down();
  await page.mouse.move(700, 400);
  await page.mouse.up();
  await page.waitForTimeout(200);

  const shapeCount = await page.evaluate(() => {
    return window.shapes ? window.shapes.length : -1;
  });
  console.log('Shape count after draw:', shapeCount);

  // Test T key theme cycling
  const themeBefore = await page.evaluate(() => document.getElementById('theme-tag').textContent);
  await page.keyboard.press('t');
  await page.waitForTimeout(100);
  const themeAfter = await page.evaluate(() => document.getElementById('theme-tag').textContent);
  console.log('Theme before T:', themeBefore, '-> after:', themeAfter);
  console.log('Theme changed:', themeBefore !== themeAfter);

  // Test L key mesh toggle
  await page.keyboard.press('l');
  await page.waitForTimeout(100);
  const meshActive = await page.evaluate(() => {
    return document.getElementById('meshBtn').classList.contains('active');
  });
  console.log('Mesh active after L key:', meshActive);

  // Test demo button
  await page.click('#demoBtn');
  await page.waitForTimeout(600);
  const demoActive = await page.evaluate(() => {
    return document.getElementById('demoBtn').classList.contains('active');
  });
  console.log('Demo active after click:', demoActive);

  // Test clear
  await page.click('#clearBtn');
  await page.waitForTimeout(100);

  // Wait and check no errors
  await page.waitForTimeout(1000);
  console.log('Console errors:', errors.length > 0 ? errors : 'NONE');

  await browser.close();
  console.log('\n=== GAMEPLAY TEST COMPLETE ===');
})();
