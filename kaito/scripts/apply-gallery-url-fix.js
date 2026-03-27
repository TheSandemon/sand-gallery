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
  // Handle full GitHub URL: https://github.com/owner/repo
  let match = raw.match(/https?:\/\/github\.com\/([^/]+)\/([^/]+)/);
  if (match) return { owner: match[1], repo: match[2] };
  // Handle owner/repo format
  let parts = raw.split('/');
  if (parts.length === 2) return { owner: parts[0], repo: parts[1] };
  return null;
}

function buildUrl(owner, repo) {
  return `https://${owner.toLowerCase()}.github.io/${repo.toLowerCase()}/`;
}

async function fixUrls() {
  // IDs that need fixing based on our analysis
  const toFix = [
    { id: '12GYL30P0s1nTSMUfAVt', name: 'Graviton',          repoRaw: 'TheSandemon/graviton' },
    { id: '54hzS3DeVfEsP47L3yKs', name: 'PARTICLE FORGE',   repoRaw: 'https://github.com/TheSandemon/particle-forge' },
    { id: 'BcGKtub694uA3RzmjGpY', name: 'ORBITAL DECAY',    repoRaw: 'https://github.com/TheSandemon/orbital-decay' },
    { id: 'Kt2MSY2h1n1QR7Wo5g6m', name: 'SYNTH STORM',      repoRaw: 'https://github.com/TheSandemon/synth-storm' },
    { id: 'Mkg0jkeM16PkFhvZbY1k', name: 'VOID BALL',        repoRaw: 'https://github.com/TheSandemon/void-ball' },
    { id: 'Rpcz6ihD6isFz98qUGY',  name: 'FRACTAL ENGINE',   repoRaw: 'https://github.com/TheSandemon/fractal-engine' },
    { id: 'apCPHM60ox2U9tkjwv8u', name: 'PIXEL STORM',      repoRaw: 'TheSandemon/pixel-storm' },
    { id: 'fHGITmNw1yCbXR5e4JrG', name: 'PHOTON RIFT',      repoRaw: 'https://github.com/TheSandemon/photon-rift' },
    { id: 'k9qzq8TT38Rvep5skPED', name: 'NEON MAZE',        repoRaw: 'https://github.com/TheSandemon/neon-maze' },
    { id: 'mCn0x8ky5XPgzQpj31m0', name: 'VOID CANVAS',      repoRaw: 'https://github.com/TheSandemon/void-canvas' },
    { id: 'sHzhyjrzHVDdS91MirNd', name: 'WAVELENGTH',       repoRaw: 'https://github.com/TheSandemon/wavelength' },
  ];

  // These ones happened to work due to owner==repo naming coincidence
  // But we should still fix to be consistent (thesandemon vs TheSandemon)
  const alsoFix = [
    { id: 'Ak7QFw0iDhC0cPLlUAqd', name: "Sand's Color Wheel", repoRaw: 'https://github.com/TheSandemon/Sands-Color-Wheel' },
    { id: 'g2YgnzMU32ebMG5N3bGO', name: "Sand's Chess",        repoRaw: 'https://github.com/TheSandemon/Sands-Chess' },
  ];

  const all = [...toFix, ...alsoFix];

  for (const item of all) {
    const extracted = extractOwnerRepo(item.repoRaw);
    if (!extracted) {
      console.log(`SKIP [${item.id}] ${item.name} — could not parse: ${item.repoRaw}`);
      continue;
    }
    const newUrl = buildUrl(extracted.owner, extracted.repo);
    console.log(`FIX  [${item.id}] ${item.name}`);
    console.log(`     OLD: ${(await db.collection('media').doc(item.id).get()).data().url}`);
    console.log(`     NEW: ${newUrl}`);
    await db.collection('media').doc(item.id).update({ url: newUrl, updatedAt: admin.firestore.FieldValue.serverTimestamp() });
    console.log(`     Done`);
  }

  console.log('\nAll done!');
  process.exit(0);
}

fixUrls().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
