const admin = require('firebase-admin');
const path = require('path');

const credPath = path.join(__dirname, '..', 'firebase-admin.json');
const serviceAccount = require(credPath);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();

async function fixUrls() {
  const snapshot = await db.collection('media').where('type', 'in', ['game', 'project', 'app', 'tool']).get();
  
  const fixes = [];
  snapshot.docs.forEach(doc => {
    const data = doc.data();
    if (data.url && data.url.includes('github.io')) {
      const url = data.url;
      // Check if URL starts with https://thesandemon.github.io - if not, it might be wrong
      if (!url.startsWith('https://thesandemon.github.io')) {
        fixes.push({ docId: doc.id, currentUrl: url, name: data.name, repo: data.githubRepo });
      }
    }
  });
  
  console.log('URLs that need fixing:');
  fixes.forEach(f => {
    console.log(`\n  [${f.docId}] ${f.name}`);
    console.log(`    Current: ${f.currentUrl}`);
    console.log(`    Repo:    ${f.repo}`);
    if (f.repo) {
      const parts = f.repo.split('/');
      const correctUrl = `https://${parts[0].toLowerCase().replace(/\s+/g, '-')}.github.io/${parts[1].toLowerCase().replace(/\s+/g, '-')}/`;
      console.log(`    Correct: ${correctUrl}`);
    }
  });
  
  console.log(`\nTotal to fix: ${fixes.length}`);
  process.exit(0);
}

fixUrls().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
