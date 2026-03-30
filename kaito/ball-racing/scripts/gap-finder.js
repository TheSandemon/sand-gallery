import { readFile, readdir, writeFile } from 'fs/promises';
import { existsSync } from 'fs';

const BIBLE_PATH = 'kaito/ball-racing/BIBLE.md';
const SPEC_PATH = 'kaito/ball-racing/SPEC.md';
const STATE_PATH = 'kaito/ball-racing/state.json';
const SRC_DIR = 'kaito/ball-racing/src/';

const GAP_SEVERITY = {
  MISSING_MODULE: 'high',
  BROKEN_INTEGRATION: 'high',
  SPEC_DRIFT: 'medium',
  DOCS_STALE: 'low'
};

// Sections from the Bible that need verification
const BIBLE_SECTIONS = [
  { id: 'physics', check: 'Physics engine initialized with correct gravity and timestep' },
  { id: 'track', check: 'Procedural track generation produces valid collision bodies' },
  { id: 'ball', check: 'Ball AI controller updates body velocity each frame' },
  { id: 'race', check: 'Race state machine transitions IDLE->COUNTDOWN->RACING->FINISHED' },
  { id: 'cameras', check: '5 cameras implemented: follow, fly, helicam, finishline, drama' },
  { id: 'recording', check: 'Canvas capture to WebM/MP4 video' },
  { id: 'market', check: 'Polymarket payload generated with correct fields' },
  { id: 'quality_gates', check: 'Quality gates defined for race, replay, and market' },
  { id: 'cron_network', check: 'Gap-finder, ideator, tester, committer crons documented' }
];

async function readBible() {
  try {
    return await readFile(BIBLE_PATH, 'utf8');
  } catch {
    return null;
  }
}

async function readSpec() {
  try {
    return await readFile(SPEC_PATH, 'utf8');
  } catch {
    return null;
  }
}

async function readState() {
  try {
    const data = await readFile(STATE_PATH, 'utf8');
    return JSON.parse(data);
  } catch {
    return null;
  }
}

async function saveState(state) {
  await writeFile(STATE_PATH, JSON.stringify(state, null, 2));
}

async function getImplementedModules() {
  const files = await readdir(SRC_DIR).catch(() => []);
  const modules = files.filter(f => f.endsWith('.js')).map(f => f.replace('.js', ''));
  return modules;
}

function checkModule(moduleName, content) {
  const checks = {
    physics: ['createWorld', 'gravity', 'stepWorld', 'CANNON'],
    track: ['generateTrack', 'spline', 'raceLine', 'CANNON'],
    ball: ['createBall', 'aiParams', 'updateBallAI'],
    race: ['RaceController', 'RaceState', 'update', 'getWinner'],
    cameras: ['CameraManager', 'FOLLOW', 'FLY', 'HELICAM', 'FINISHLINE', 'DRAMA'],
    recording: ['Recorder', 'start', 'stop', 'captureStream'],
    market: ['generateMarketPayload', 'outcomes', 'outcomePrices', 'question']
  };
  
  const moduleChecks = checks[moduleName];
  if (!moduleChecks) return { valid: true, gaps: [] };
  
  const gaps = [];
  for (const check of moduleChecks) {
    if (!content.includes(check)) {
      gaps.push(`Missing: ${check}`);
    }
  }
  
  return { valid: gaps.length === 0, gaps };
}

async function runGapFinder() {
  console.log('[GapFinder] Starting gap analysis...');
  
  const bible = await readBible();
  const spec = await readSpec();
  const state = await readState();
  const modules = await getImplementedModules();
  
  if (!state) {
    console.log('[GapFinder] No state file - skipping');
    return;
  }
  
  const newGaps = [];
  let gapId = (state.gaps?.length || 0) + 1;
  
  // Check each bible section
  for (const section of BIBLE_SECTIONS) {
    const moduleName = section.id;
    const moduleFile = `${SRC_DIR}${moduleName}.js`;
    
    // Check if module exists
    if (!modules.includes(moduleName)) {
      newGaps.push({
        id: `gap-${String(gapId++).padStart(3, '0')}`,
        section: moduleName,
        description: `Module ${moduleName} does not exist`,
        severity: GAP_SEVERITY.MISSING_MODULE,
        created: new Date().toISOString(),
        bibleSection: section.check
      });
      continue;
    }
    
    // Read module content
    const content = await readFile(moduleFile, 'utf8').catch(() => '');
    
    // Check module content
    const { valid, gaps } = checkModule(moduleName, content);
    
    if (!valid) {
      for (const gapDesc of gaps) {
        newGaps.push({
          id: `gap-${String(gapId++).padStart(3, '0')}`,
          section: moduleName,
          description: gapDesc,
          severity: GAP_SEVERITY.BROKEN_INTEGRATION,
          created: new Date().toISOString(),
          bibleSection: section.check
        });
      }
    }
  }
  
  // Check spec alignment
  if (spec && bible) {
    // Check for sections in bible not in spec
    const specModules = modules.join(', ');
    // This is a simplified check - in reality we'd parse both docs
  }
  
  // Merge new gaps, avoid duplicates
  const existingGapIds = new Set((state.gaps || []).map(g => `${g.section}:${g.description}`));
  const uniqueNewGaps = newGaps.filter(g => 
    !existingGapIds.has(`${g.section}:${g.description}`)
  );
  
  if (uniqueNewGaps.length > 0) {
    state.gaps = [...(state.gaps || []), ...uniqueNewGaps];
    await saveState(state);
    console.log(`[GapFinder] Found ${uniqueNewGaps.length} new gaps:`);
    for (const gap of uniqueNewGaps) {
      console.log(`  - [${gap.severity}] ${gap.section}: ${gap.description}`);
    }
  } else {
    console.log('[GapFinder] No new gaps found');
  }
  
  return state;
}

runGapFinder().catch(console.error);
