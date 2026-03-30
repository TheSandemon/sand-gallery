/**
 * Add item to sand-gallery Firestore
 * Usage: node add-to-gallery.js <category> <title> <description> <githubRepo> [thumbnailUrl] [type]
 * 
 * githubRepo format: owner/repo  (e.g. TheSandemon/quantum-weave)
 * NOT the full GitHub URL
 */

const admin = require('firebase-admin');
const path = require('path');

const credPath = path.join(__dirname, '..', 'firebase-admin.json');
const serviceAccount = require(credPath);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();

/**
 * Parse githubRepo from either "owner/repo" or "https://github.com/owner/repo"
 */
function parseGithubRepo(input) {
  if (!input) return null;
  // If it's a full URL
  if (input.includes('github.com')) {
    const parts = input.split('/');
    // https://github.com/owner/repo → parts[2] = owner, parts[3] = repo
    if (parts.length >= 4) {
      return { owner: parts[2].toLowerCase(), repo: parts[3].toLowerCase().replace(/\.git$/, '') };
    }
    return null;
  }
  // If it's owner/repo format
  const parts = input.split('/');
  if (parts.length >= 2) {
    return { owner: parts[0].toLowerCase(), repo: parts[1].toLowerCase().replace(/\s+/g, '-').replace(/\.git$/, '') };
  }
  return null;
}

async function addItem(category, title, description, githubRepo, thumbnailUrl, type = 'game') {
  const parsed = parseGithubRepo(githubRepo);
  if (!parsed) {
    throw new Error(`Invalid githubRepo: "${githubRepo}" — expected "owner/repo" or "https://github.com/owner/repo"`);
  }

  const { owner, repo } = parsed;
  const pagesUrl = `https://${owner}.github.io/${repo}/`;

  const item = {
    name: title,
    description: description,
    type: type || 'game',
    category: category || type || 'game',
    githubRepo: `${owner}/${repo}`,
    thumbnail: thumbnailUrl || '',
    url: pagesUrl,
    iframeUrl: pagesUrl,  // Same as url for games — used for iframe embedding
    pagesUrl: pagesUrl,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
  };

  const docRef = await db.collection('media').add(item);
  console.log(`Added: ${title} (${docRef.id})`);
  console.log(`  category: ${category}`);
  console.log(`  url: ${pagesUrl}`);
  return docRef.id;
}

const [,, category, title, description, githubRepo, thumbnailUrl, type] = process.argv;

if (!category || !title || !description || !githubRepo) {
  console.error('Usage: node add-to-gallery.js <category> <title> <description> <githubRepo> [thumbnailUrl] [type]');
  console.error('  category: games, apps, tools, videos, images, embed');
  console.error('  githubRepo: owner/repo (NOT full GitHub URL)');
  process.exit(1);
}

addItem(category, title, description, githubRepo, thumbnailUrl, type || 'game')
  .then(() => process.exit(0))
  .catch(err => {
    console.error('Error:', err.message);
    process.exit(1);
  });
