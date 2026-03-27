const admin = require('firebase-admin');
const path = require('path');

const credPath = path.join(__dirname, '..', 'firebase-admin.json');
const serviceAccount = require(credPath);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();

function buildUrl(githubRepo) {
  if (!githubRepo) return null;
  const fullMatch = githubRepo.match(/github\.com[/:]([^/]+)\/([^/.]+)/);
  if (fullMatch) {
    return `https://${fullMatch[1].toLowerCase()}.github.io/${fullMatch[2].toLowerCase()}/`;
  }
  // Handle owner/repo format
  const parts = githubRepo.split('/');
  if (parts.length === 2) {
    return `https://${parts[0].toLowerCase()}.github.io/${parts[1].toLowerCase()}/`;
  }
  return null;
}

async function checkAllCategories() {
  const categories = ['games', 'apps', 'tools', 'videos', 'images', 'audio', '3d', 'other'];
  
  for (const cat of categories) {
    const docRef = db.collection('gallery_categories').doc(cat);
    const doc = await docRef.get();
    const data = doc.data();
    
    if (!data || !data.items || data.items.length === 0) {
      console.log(`\n[${cat}] — no items`);
      continue;
    }
    
    console.log(`\n[${cat}] — ${data.items.length} items`);
    
    let hasBadUrl = false;
    for (let i = 0; i < data.items.length; i++) {
      const item = data.items[i];
      if (item.type === 'game' || item.type === 'app' || item.type === 'tool') {
        if (!item.url || !item.url.includes('thesandemon.github.io') || item.url.includes('.github.io//')) {
          const correctUrl = item.githubRepo ? buildUrl(item.githubRepo) : null;
          console.log(`  [${i}] ${item.name} — ${item.url} ${correctUrl ? '-> ' + correctUrl : ''}`);
          hasBadUrl = true;
        }
      }
    }
    
    if (!hasBadUrl) {
      console.log(`  All URLs OK`);
    }
  }
  
  process.exit(0);
}

checkAllCategories().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
