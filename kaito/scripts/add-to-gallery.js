/**
 * Add item to sand-gallery Firestore
 * Usage: node add-to-gallery.js <category> <title> <description> <githubRepo> <thumbnailUrl> [type]
 */

const admin = require('firebase-admin');
const path = require('path');

const credPath = path.join(__dirname, '..', 'firebase-admin.json');
const serviceAccount = require(credPath);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();

async function addItem(category, title, description, githubRepo, thumbnailUrl, type = 'game') {
  const item = {
    name: title,
    description: description,
    type: type,
    githubRepo: githubRepo,
    thumbnail: thumbnailUrl || '',
    url: `https://${githubRepo.split('/')[1].toLowerCase().replace(/\s+/g, '-')}.github.io/${githubRepo.split('/')[1].replace(/\s+/g, '-').toLowerCase()}/`,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
  };

  const docRef = await db.collection('media').add(item);
  console.log(`Added: ${title} (${docRef.id}) to ${category}`);
  return docRef.id;
}

const [,, category, title, description, githubRepo, thumbnailUrl, type] = process.argv;

if (!category || !title || !description || !githubRepo) {
  console.error('Usage: node add-to-gallery.js <category> <title> <description> <githubRepo> [thumbnailUrl] [type]');
  process.exit(1);
}

addItem(category, title, description, githubRepo, thumbnailUrl, type || 'game')
  .then(() => process.exit(0))
  .catch(err => {
    console.error('Error:', err);
    process.exit(1);
  });
