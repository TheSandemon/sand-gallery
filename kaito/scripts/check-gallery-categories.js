const admin = require('firebase-admin');
const path = require('path');

const credPath = path.join(__dirname, '..', 'firebase-admin.json');
const serviceAccount = require(credPath);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();

async function check() {
  const doc = await db.collection('gallery_categories').doc('games').get();
  const data = doc.data();
  
  if (!data || !data.items) {
    console.log('No items found in gallery_categories/games');
    return;
  }
  
  console.log(`Total games: ${data.items.length}`);
  console.log('\nFirst 3 items:');
  data.items.slice(0, 3).forEach((item, i) => {
    console.log(`\n[${i}] ${item.name}`);
    console.log(`    url: ${item.url}`);
    console.log(`    githubRepo: ${item.githubRepo}`);
    console.log(`    type: ${item.type}`);
  });
  
  // Check for wrong URLs
  data.items.forEach((item, i) => {
    if (item.url && !item.url.startsWith('https://thesandemon.github.io') && !item.url.startsWith('https://')) {
      console.log(`\nBAD URL [${i}] ${item.name}: ${item.url}`);
    }
    if (item.githubRepo && !item.githubRepo.startsWith('https://github.com')) {
      console.log(`\nBAD GITHUB_REPO [${i}] ${item.name}: ${item.githubRepo}`);
    }
  });
  
  process.exit(0);
}

check().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
