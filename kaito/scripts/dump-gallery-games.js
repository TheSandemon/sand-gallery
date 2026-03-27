const admin = require('firebase-admin');
const path = require('path');

const credPath = path.join(__dirname, '..', 'firebase-admin.json');
const serviceAccount = require(credPath);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();

async function dumpGames() {
  const doc = await db.collection('gallery_categories').doc('games').get();
  const data = doc.data();
  
  if (!data || !data.items) {
    console.log('No items');
    process.exit(0);
    return;
  }
  
  console.log(`Total games: ${data.items.length}`);
  data.items.forEach((item, i) => {
    console.log(`\n[${i}] "${item.name}" | url: ${item.url} | githubRepo: ${item.githubRepo || 'N/A'} | type: ${item.type}`);
  });
  
  process.exit(0);
}

dumpGames().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
