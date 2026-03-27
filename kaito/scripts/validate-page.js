/**
 * validate-page.js — Playwright-based page validation
 * Usage: node validate-page.js <pages-url> [project-name]
 * 
 * Opens the page in Chromium, checks for errors, verifies it loads.
 * Exits 0 if OK, exits 1 if errors found.
 */

const { chromium } = require('playwright');

async function validatePage(url, projectName) {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  
  const errors = [];
  
  // Capture console errors
  page.on('console', msg => {
    if (msg.type() === 'error') {
      errors.push(`CONSOLE ERROR: ${msg.text()}`);
    }
  });
  
  // Capture page errors
  page.on('pageerror', err => {
    errors.push(`PAGE ERROR: ${err.message}`);
  });

  // Capture 4xx responses
  page.on('response', resp => {
    if (resp.status() >= 400) {
      errors.push(`HTTP ${resp.status()}: ${resp.url()}`);
    }
  });

  try {
    const response = await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 15000 });
    
    if (!response || response.status() >= 400) {
      errors.push(`Page HTTP ${response ? response.status() : 'no response'}`);
    }

    // Wait for JS to execute
    await page.waitForTimeout(2000);
    
    // Check page has visible content
    const bodyText = await page.evaluate(() => document.body?.innerText || '');
    if (!bodyText || bodyText.trim().length < 5) {
      errors.push('Page appears empty or has no visible content');
    }
    
    // Check page has a title
    const title = await page.title();
    if (!title || title.length < 2) {
      errors.push('Page has no or very short title');
    }

  } catch (e) {
    errors.push(`NAVIGATION FAILED: ${e.message}`);
  }

  await browser.close();

  // Report
  console.log(`\n=== VALIDATION: ${projectName || url} ===`);
  console.log(`URL: ${url}`);
  console.log(`Status: ${errors.length === 0 ? 'PASS' : 'FAIL'}`);
  
  if (errors.length > 0) {
    console.log(`\nErrors (${errors.length}):`);
    errors.forEach(e => console.log(`  - ${e}`));
  }
  
  return errors.length === 0;
}

const [, , url, projectName] = process.argv;

if (!url) {
  console.error('Usage: node validate-page.js <pages-url> [project-name]');
  process.exit(1);
}

validatePage(url, projectName)
  .then(ok => process.exit(ok ? 0 : 1))
  .catch(e => {
    console.error('Validation crashed:', e.message);
    process.exit(1);
  });
