// Script to expand placeholder content on Sand.Gallery
// Run via: node expand-placeholders.js

const admin = require('firebase-admin');
const { initializeApp, cert } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');

// Use application default credentials
initializeApp();
const db = getFirestore();

async function expandPlaceholders() {
  console.log('🔄 Checking for placeholder content on Sand.Gallery...');
  
  const timestamp = admin.firestore.FieldValue.serverTimestamp();
  const results = {};
  
  try {
    // Check and populate Games
    const gamesRef = db.collection('content').doc('games');
    const gamesDoc = await gamesRef.get();
    
    if (!gamesDoc.exists || !gamesDoc.data()?.items || gamesDoc.data()?.items.length === 0) {
      const sampleGames = [
        { id: 'game-1', title: 'Neural Maze', description: 'AI-generated maze game with adaptive difficulty. Navigate procedurally generated neural networks.', category: 'puzzle', thumbnail: 'https://picsum.photos/seed/neuralmaze/400/300', status: 'ready', createdAt: timestamp, plays: 0, rating: 4.5 },
        { id: 'game-2', title: 'Crypto Runner', description: 'Endless runner with crypto-themed obstacles. Dodge bears, catch bulls!', category: 'arcade', thumbnail: 'https://picsum.photos/seed/cryptorun/400/300', status: 'ready', createdAt: timestamp, plays: 0, rating: 4.2 },
        { id: 'game-3', title: 'Quantum Chess', description: 'Chess variant where pieces exist in superposition. Checkmate like never before.', category: 'strategy', thumbnail: 'https://picsum.photos/seed/quantchess/400/300', status: 'ready', createdAt: timestamp, plays: 0, rating: 4.8 },
        { id: 'game-4', title: 'Beat Synth', description: 'AI-powered music creation. Mix, match, and discover neural-synthesized sounds.', category: 'music', thumbnail: 'https://picsum.photos/seed/beatsynth/400/300', status: 'ready', createdAt: timestamp, plays: 0, rating: 4.6 },
        { id: 'game-5', title: 'Art Generator', description: 'Describe your vision and watch AI bring it to life. Compete for the best creations.', category: 'art', thumbnail: 'https://picsum.photos/seed/artgen/400/300', status: 'ready', createdAt: timestamp, plays: 0, rating: 4.7 },
        { id: 'game-6', title: 'Word AI', description: 'AI-powered word puzzles that adapt to your skill. New challenges daily.', category: 'puzzle', thumbnail: 'https://picsum.photos/seed/wordai/400/300', status: 'ready', createdAt: timestamp, plays: 0, rating: 4.3 }
      ];
      await gamesRef.set({ items: sampleGames, lastUpdated: timestamp });
      results.games = 'populated';
      console.log('✅ Populated Games with 6 AI-generated games');
    } else {
      results.games = 'already exists';
      console.log('📋 Games already populated');
    }
    
    // Check and populate Tools
    const toolsRef = db.collection('content').doc('tools');
    const toolsDoc = await toolsRef.get();
    
    if (!toolsDoc.exists || !toolsDoc.data()?.items || toolsDoc.data()?.items.length === 0) {
      const sampleTools = [
        { id: 'tool-1', title: 'Code Assistant', description: 'AI-powered code review, optimization, and bug detection in real-time.', category: 'code', icon: 'https://picsum.photos/seed/codeasst/100/100', status: 'ready', createdAt: timestamp, uses: 0 },
        { id: 'tool-2', title: 'Image Generator', description: 'Create stunning images from text prompts. Multiple art styles available.', category: 'image', icon: 'https://picsum.photos/seed/imggen/100/100', status: 'ready', createdAt: timestamp, uses: 0 },
        { id: 'tool-3', title: 'Content Writer', description: 'AI writing assistant for blogs, emails, social posts, and creative writing.', category: 'text', icon: 'https://picsum.photos/seed/contentw/100/100', status: 'ready', createdAt: timestamp, uses: 0 },
        { id: 'tool-4', title: 'Research Search', description: 'Deep web search with source citation and fact-checking.', category: 'search', icon: 'https://picsum.photos/seed/research/100/100', status: 'ready', createdAt: timestamp, uses: 0 },
        { id: 'tool-5', title: 'API Debugger', description: 'Test, debug, and optimize APIs with AI-powered suggestions.', category: 'dev', icon: 'https://picsum.photos/seed/apidebug/100/100', status: 'ready', createdAt: timestamp, uses: 0 },
        { id: 'tool-6', title: 'Data Analyzer', description: 'Upload datasets and get AI insights, visualizations, and analysis.', category: 'dev', icon: 'https://picsum.photos/seed/dataan/100/100', status: 'ready', createdAt: timestamp, uses: 0 }
      ];
      await toolsRef.set({ items: sampleTools, lastUpdated: timestamp });
      results.tools = 'populated';
      console.log('✅ Populated Tools with 6 AI-powered tools');
    } else {
      results.tools = 'already exists';
      console.log('📋 Tools already populated');
    }
    
    // Update site config
    const configRef = db.collection('config').doc('site');
    await configRef.set({ lastAutoExpand: timestamp, expandResults: results }, { merge: true });
    
    console.log('✅ Placeholder expansion complete:', results);
    return results;
    
  } catch (error) {
    console.error('❌ Error expanding placeholders:', error);
    throw error;
  }
}

expandPlaceholders()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
