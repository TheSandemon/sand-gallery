const admin = require('firebase-admin');
const path = require('path');

const credPath = path.join(__dirname, '..', 'firebase-admin.json');
const serviceAccount = require(credPath);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();

function extractOwnerRepo(raw) {
  if (!raw) return null;
  const fullMatch = raw.match(/https?:\/\/github\.com\/([^/]+)\/([^/]+)/);
  if (fullMatch) return { owner: fullMatch[1], repo: fullMatch[2] };
  const shortMatch = raw.split('/');
  if (shortMatch.length === 2) return { owner: shortMatch[0], repo: shortMatch[1] };
  return null;
}

function buildUrl(owner, repo) {
  return `https://${owner.toLowerCase()}.github.io/${repo.toLowerCase()}/`;
}

// All 15 entries that need fixing
const toFix = [
  { id: '12GYL30P0s1nTSMUfAVt', name: 'Graviton',           repoRaw: 'TheSandemon/graviton' },
  { id: '54hzS3DeVfEsP47L3yKs', name: 'PARTICLE FORGE',    repoRaw: 'https://github.com/TheSandemon/particle-forge' },
  { id: 'Ak7QFw0iDhC0cPLlUAqd', name: "Sand's Color Wheel", repoRaw: 'https://github.com/TheSandemon/Sands-Color-Wheel' },
  { id: 'BcGKtub694uA3RzmjGpY', name: 'ORBITAL DECAY',     repoRaw: 'https://github.com/TheSandemon/orbital-decay' },
  { id: 'JHOz4EUPKgr9o1AdGGNE', name: 'NEON PULSE',        repoRaw: 'https://github.com/TheSandemon/neon-pulse' },
  { id: 'Kt2MSY2h1n1QR7Wo5g6m', name: 'SYNTH STORM',       repoRaw: 'https://github.com/TheSandemon/synth-storm' },
  { id: 'Mkg0jkeM16PkFhvZbY1k', name: 'VOID BALL',         repoRaw: 'https://github.com/TheSandemon/void-ball' },
  { id: 'Rpcz6ihD6isFz998qUGY', name: 'FRACTAL ENGINE',   repoRaw: 'https://github.com/TheSandemon/fractal-engine' },
  { id: 'apCPHM60ox2U9tkjwv8u', name: 'PIXEL STORM',       repoRaw: 'TheSandemon/pixel-storm' },
  { id: 'fHGITmNw1yCbXR5e4JrG', name: 'PHOTON RIFT',       repoRaw: 'https://github.com/TheSandemon/photon-rift' },
  { id: 'g2YgnzMU32ebMG5N3bGO', name: "Sand's Chess",      repoRaw: 'https://github.com/TheSandemon/Sands-Chess' },
  { id: 'gW43GvieQSCtUkRqVQLs', name: 'VECTOR STORM',      repoRaw: 'https://github.com/TheSandemon/vector-storm' },
  { id: 'k9qzq8TT38Rvep5skPED', name: 'NEON MAZE',         repoRaw: 'https://github.com/TheSandemon/neon-maze' },
  { id: 'mCn0x8ky5XPgzQpj31m0', name: 'VOID CANVAS',       repoRaw: 'https://github.com/TheSandemon/void-canvas' },
  { id: 'sHzhyjrzHVDdS91MirNd', name: 'WAVELENGTH',        repoRaw: 'https://github.com/TheSandemon/wavelength' },
];

async function fixAll() {
  for (const item of toFix) {
    const doc = await db.collection('media').doc(item.id).get();
    const oldUrl = doc.data().url;
    const extracted = extractOwnerRepo(item.repoRaw);
    if (!extracted) {
      console.log(`SKIP [${item.id}] ${item.name} — could not parse: ${item.repoRaw}`);
      continue;
    }
    const newUrl = buildUrl(extracted.owner, extracted.repo);
    if (oldUrl === newUrl) {
      console.log(`OK   [${item.id}] ${item.name} — already correct`);
    } else {
      console.log(`FIX  [${item.id}] ${item.name}`);
      console.log(`     OLD: ${oldUrl}`);
      console.log(`     NEW: ${newUrl}`);
      await db.collection('media').doc(item.id).update({
        url: newUrl,
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      });
    }
  }
  console.log('\nAll done!');
  process.exit(0);
}

fixAll().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
