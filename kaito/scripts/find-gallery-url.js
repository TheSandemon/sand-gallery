const admin = require('firebase-admin');
const path = require('path');

const credPath = path.join(__dirname, '..', 'firebase-admin.json');
const serviceAccount = require(credPath);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();

// List all collections
db.listCollections().then(collections => {
  console.log('Collections:', collections.map(c => c.id));
  
  // Get first few docs from media
  return db.collection('media').limit(5).get();
}).then(snapshot => {
  snapshot.docs.forEach(doc => {
    const data = doc.data();
    console.log(`\nDoc ${doc.id}:`);
    console.log('  name:', data.name);
    console.log('  url:', data.url);
    console.log('  type:', data.type);
    console.log('  thumbnail:', data.thumbnail);
  });
  process.exit(0);
}).catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
