const admin = require('firebase-admin');
const path = require('path');

const credPath = path.join(__dirname, '..', 'firebase-admin.json');
const serviceAccount = require(credPath);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();

async function listAll() {
  const snapshot = await db.collection('media').get();
  
  snapshot.docs.forEach(doc => {
    const data = doc.data();
    if (data.url && data.url.includes('github.io')) {
      console.log(`"${doc.id}" | "${data.name}" | "${data.url}"`);
    }
  });
  process.exit(0);
}

listAll().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
