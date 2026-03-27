const admin = require('firebase-admin');
const path = require('path');

const credPath = path.join(__dirname, '..', 'firebase-admin.json');
const serviceAccount = require(credPath);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();

// Map of game name (uppercase) -> correct GitHub Pages URL
const correctUrls = {
  "SAND'S CHESS":     'https://thesandemon.github.io/sands-chess/',
  "GRAVITON":         'https://thesandemon.github.io/graviton/',
  'VOID BALL':        'https://thesandemon.github.io/void-ball/',
  'NEON MAZE':        'https://thesandemon.github.io/neon-maze/',
  'SYNTH STORM':      'https://thesandemon.github.io/synth-storm/',
  'FRACTAL ENGINE':   'https://thesandemon.github.io/fractal-engine/',
  'WAVELENGTH':       'https://thesandemon.github.io/wavelength/',
  'PHOTON RIFT':      'https://thesandemon.github.io/photon-rift/',
  'VOID CANVAS':      'https://thesandemon.github.io/void-canvas/',
  'PIXEL STORM':      'https://thesandemon.github.io/pixel-storm/',
  'ORBITAL DECAY':    'https://thesandemon.github.io/orbital-decay/',
  "SAND'S COLOR WHEEL": 'https://thesandemon.github.io/sands-color-wheel/',
  'NEON PULSE':       'https://thesandemon.github.io/neon-pulse/',
  'PARTICLE FORGE':   'https://thesandemon.github.io/particle-forge/',
  'VECTOR STORM':     'https://thesandemon.github.io/vector-storm/',
};

async function fixGalleryCategories() {
  const categories = ['games', 'apps', 'tools'];
  
  for (const cat of categories) {
    const docRef = db.collection('gallery_categories').doc(cat);
    const doc = await docRef.get();
    const data = doc.data();
    
    if (!data || !data.items) continue;
    
    let updated = false;
    
    for (let i = 0; i < data.items.length; i++) {
      const item = data.items[i];
      const key = item.name.toUpperCase();
      const correctUrl = correctUrls[key];
      
      if (correctUrl && item.url !== correctUrl) {
        const oldUrl = item.url;
        item.url = correctUrl;
        console.log(`[${cat}] ${item.name}: ${oldUrl} -> ${correctUrl}`);
        updated = true;
      } else if (!correctUrl && item.url && (!item.url.includes('thesandemon.github.io') || item.url.includes('.github.io//'))) {
        console.log(`[${cat}] ${item.name}: UNKNOWN — current: ${item.url} (no mapping)`);
      }
    }
    
    if (updated) {
      await docRef.update({ items: data.items, updatedAt: admin.firestore.FieldValue.serverTimestamp() });
      console.log(`  -> Updated ${cat}`);
    }
  }
  
  console.log('\nDone!');
  process.exit(0);
}

fixGalleryCategories().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
