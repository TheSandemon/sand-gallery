/**
 * Fix broken Firestore media entries
 * Usage: node scripts/fix-gallery.js [--dry-run]
 */

const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const credPath = path.join(__dirname, '../firebase-admin.json');
const serviceAccount = require(credPath);

admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
const db = admin.firestore();

/**
 * Parse github repo from either:
 * - "owner/repo" 
 * - "https://github.com/owner/repo"
 * - "https://github.com/owner/repo.git"
 */
function parseGithubRepo(input) {
  if (!input) return null;
  
  if (input.includes('github.com')) {
    // Full URL: https://github.com/owner/repo
    const match = input.match(/github\.com[/:]([^/]+)\/([^/.]+)/);
    if (match) {
      return { owner: match[1].toLowerCase(), repo: match[2].toLowerCase().replace(/\s+/g, '-') };
    }
    return null;
  }
  
  // owner/repo format
  const parts = input.split('/');
  if (parts.length >= 2) {
    return { 
      owner: parts[0].toLowerCase(), 
      repo: parts[1].toLowerCase().replace(/\s+/g, '-').replace(/\.git$/, '') 
    };
  }
  return null;
}

function isUrlBroken(url) {
  if (!url) return true;
  // "https://.github.io//" means split failed
  if (url.includes('.github.io//')) return true;
  // Missing thesandemon in the URL when it should be there
  if (url.includes('github.io') && !url.includes('thesandemon') && !url.includes('signal-trace')) return true;
  return false;
}

async function checkUrlWorks(url) {
  try {
    const r = execSync(`curl -s -o NUL -w "%{http_code}" "${url}" --max-time 5`, { encoding: 'utf8' });
    return r.trim() === '200';
  } catch { return false; }
}

async function fixAll(dryRun = false) {
  const snap = await db.collection('media').get();
  let fixed = 0, skipped = 0, checked = 0;

  for (const doc of snap.docs) {
    const d = doc.data();
    const updates = {};
    let reasons = [];

    // ── Fix url if broken ─────────────────────────────────────────────────
    if (isUrlBroken(d.url)) {
      const parsed = parseGithubRepo(d.githubRepo);
      if (parsed) {
        const correctUrl = `https://${parsed.owner}.github.io/${parsed.repo}/`;
        
        // Check if the correct URL actually works
        if (dryRun) {
          console.log(`  ? Would try: ${correctUrl}`);
        } else {
          const works = await checkUrlWorks(correctUrl);
          if (works) {
            updates.url = correctUrl;
            console.log(`  ✅ FIX url: "${d.url}" → "${correctUrl}"`);
          } else {
            console.log(`  ⚠️  URL doesn't work, leaving as-is: "${d.url}"`);
          }
        }
        if (!dryRun || updates.url) reasons.push('url');
      }
    }

    // ── Add iframeUrl if missing ───────────────────────────────────────────
    if (!d.iframeUrl && d.url && !isUrlBroken(d.url)) {
      updates.iframeUrl = d.url;
      reasons.push('iframeUrl');
    }

    // ── Add category if missing ───────────────────────────────────────────
    if (!d.category && d.type) {
      updates.category = d.type;
      reasons.push('category');
    }

    // ── Add pagesUrl if missing ───────────────────────────────────────────
    if (!d.pagesUrl && d.url && !isUrlBroken(d.url) && d.url.includes('github.io')) {
      updates.pagesUrl = d.url;
    }

    // ── Normalize githubRepo to owner/repo format ─────────────────────────
    if (d.githubRepo && d.githubRepo.includes('github.com')) {
      const parsed = parseGithubRepo(d.githubRepo);
      if (parsed) {
        updates.githubRepo = `${parsed.owner}/${parsed.repo}`;
        reasons.push('githubRepo');
      }
    }

    // ── Apply ─────────────────────────────────────────────────────────────
    checked++;
    if (Object.keys(updates).length > 0) {
      if (!dryRun) {
        updates.updatedAt = admin.firestore.FieldValue.serverTimestamp();
        await doc.ref.update(updates);
        console.log(`  ✅ Updated ${doc.id} (${d.name}) — ${reasons.join(', ')}`);
      } else {
        console.log(`  [DRY] ${doc.id} (${d.name}): would update ${reasons.join(', ')}`);
      }
      fixed++;
    } else {
      skipped++;
    }
  }

  console.log(`\n${dryRun ? '[DRY RUN] ' : ''}Done. checked=${checked}, fixed=${fixed}, skipped=${skipped}`);
}

const dryRun = process.argv.includes('--dry-run');
console.log(`${dryRun ? 'DRY RUN' : 'LIVE'} mode\n`);

fixAll(dryRun)
  .then(() => process.exit(0))
  .catch(err => {
    console.error('Fatal:', err.message);
    process.exit(1);
  });
