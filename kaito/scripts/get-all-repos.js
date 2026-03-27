const admin = require('firebase-admin');
const path = require('path');

const credPath = path.join(__dirname, '..', 'firebase-admin.json');
const serviceAccount = require(credPath);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();

const ids = [
  '12GYL30P0s1nTSMUfAVt', '54hzS3DeVfEsP47L3yKs', 'Ak7QFw0iDhC0cPLlUAqd',
  'BcGKtub694uA3RzmjGpY', 'JHOz4EUPKgr9o1AdGGNE', 'Kt2MSY2h1n1QR7Wo5g6m',
  'Mkg0jkeM16PkFhvZbY1k', 'Rpcz6ihD6isFz998qUGY', 'apCPHM60ox2U9tkjwv8u',
  'fHGITmNw1yCbXR5e4JrG', 'g2YgnzMU32ebMG5N3bGO', 'gW43GvieQSCtUkRqVQLs',
  'k9qzq8TT38Rvep5skPED', 'mCn0x8ky5XPgzQpj31m0', 'sHzhyjrzHVDdS91MirNd',
];

async function getRepos() {
  for (const id of ids) {
    const doc = await db.collection('media').doc(id).get();
    const data = doc.data();
    console.log(`"${id}" | "${data.name}" | "${data.githubRepo || 'MISSING'}"`);
  }
  process.exit(0);
}

getRepos().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
