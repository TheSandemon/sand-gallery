const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  const errors = [];
  page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
  page.on('pageerror', e => errors.push(e.message));
  await page.goto('https://thesandemon.github.io/pixel-storm/');
  await page.waitForTimeout(2000);

  const geneBtn = await page.locator('#gene-splice-btn').isVisible();
  console.log('Gene Splice button:', geneBtn);

  const mutateBtn = await page.locator('#mutate-btn').isVisible();
  console.log('Mutate button:', mutateBtn);

  const stGlider = await page.locator('#st-glider').isVisible();
  const stOsc = await page.locator('#st-oscillator').isVisible();
  const stStill = await page.locator('#st-still').isVisible();
  const stGun = await page.locator('#st-gun').isVisible();
  console.log('Species counter tags:', stGlider, stOsc, stStill, stGun);

  const llfeBtn = await page.locator('[data-rule="llfe"]').isVisible();
  const persianBtn = await page.locator('[data-rule="persianrug"]').isVisible();
  const walledBtn = await page.locator('[data-rule="walledcities"]').isVisible();
  const voteBtn = await page.locator('[data-rule="vote"]').isVisible();
  console.log('New rules (llfe/persianrug/walledcities/vote):', llfeBtn, persianBtn, walledBtn, voteBtn);

  await page.click('#gene-splice-btn');
  await page.waitForTimeout(500);
  const genePanelVisible = await page.locator('#gene-panel').isVisible();
  console.log('Gene panel visible after click:', genePanelVisible);

  const geneSelA = await page.locator('#gene-sel-a').isVisible();
  const geneSelB = await page.locator('#gene-sel-b').isVisible();
  console.log('Gene selects visible:', geneSelA, geneSelB);

  const geneRuleText = await page.locator('#gene-rule-name').textContent();
  console.log('Gene rule name:', geneRuleText);

  await page.click('#gene-apply-btn');
  await page.waitForTimeout(300);
  const genePanelGone = !(await page.locator('#gene-panel').isVisible());
  console.log('Gene panel closed after apply:', genePanelGone);

  await page.click('#mutate-btn');
  await page.waitForTimeout(300);
  const mutateActive = await page.locator('#mutate-btn.active').count() > 0;
  console.log('Mutate button active:', mutateActive);
  await page.click('#mutate-btn');

  await page.click('[data-rule="llfe"]');
  await page.waitForTimeout(300);
  const llfeActive = await page.locator('[data-rule="llfe"].active').count() > 0;
  console.log('LLFE rule active after click:', llfeActive);

  await page.keyboard.press('g');
  await page.waitForTimeout(300);
  const genePanelViaKey = await page.locator('#gene-panel').isVisible();
  console.log('Gene panel via G key:', genePanelViaKey);
  await page.keyboard.press('Escape');
  await page.waitForTimeout(200);

  await page.keyboard.press('u');
  await page.waitForTimeout(300);
  const mutateViaKey = await page.locator('#mutate-btn.active').count() > 0;
  console.log('Mutate via U key:', mutateViaKey);

  console.log('Console errors:', errors.length > 0 ? errors : 'none');
  await browser.close();
})();
