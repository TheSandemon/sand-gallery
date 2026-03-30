import { readFile, writeFile } from 'fs/promises';

const STATE_PATH = 'kaito/ball-racing/state.json';

const FIX_STRATEGIES = {
  'MISSING_MODULE': [
    'Create the missing module following SPEC.md structure',
    'Import required dependencies first',
    'Implement core function, defer edge cases',
    'Test with existing modules'
  ],
  'BROKEN_INTEGRATION': [
    'Read the failing function in the module',
    'Check BIBLE.md for the correct spec',
    'Fix the implementation',
    'Run module tests'
  ],
  'SPEC_DRIFT': [
    'Read SPEC.md for the affected module',
    'Update implementation OR update spec (pick one)',
    'Document the change reason',
    'Update tests'
  ],
  'DOCS_STALE': [
    'Read BIBLE.md section',
    'Update docs to match reality',
    'Or update code to match docs'
  ]
};

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

function categorizeIdea(gap) {
  // Determine if this is a quick-fix or needs research
  if (gap.severity === 'low' || gap.severity === 'medium') {
    return 'quick-fix';
  }
  if (gap.description.includes('Missing') && gap.section) {
    return 'needs-research';
  }
  return 'needs-research';
}

function generateIdea(gap) {
  const strategies = FIX_STRATEGIES[gap.severity] || FIX_STRATEGIES['BROKEN_INTEGRATION'];
  
  // Specific ideas based on gap type
  const ideas = [];
  
  switch (gap.section) {
    case 'physics':
      ideas.push('Implement Cannon.js world with correct parameters per SPEC.md');
      ideas.push('Add NaN checks after physics step');
      ideas.push('Add sleep mode for performance');
      break;
    case 'track':
      ideas.push('Use CatmullRom spline for smooth track following BIBLE.md');
      ideas.push('Add collision bodies for track surface and walls');
      ideas.push('Generate a race line for AI pathfinding');
      break;
    case 'ball':
      ideas.push('Implement AI controller that follows race line');
      ideas.push('Add variance to AI params for unpredictability');
      ideas.push('Sync Three.js mesh position to Cannon.js body');
      break;
    case 'cameras':
      ideas.push('Implement all 5 camera types in CameraManager');
      ideas.push('Add auto-cut logic for cinematic replay');
      ideas.push('Implement drama camera for close call moments');
      break;
    case 'recording':
      ideas.push('Use canvas.captureStream() + MediaRecorder for WebM');
      ideas.push('Add intro/outro text overlay');
      ideas.push('Implement frame blending for smooth output');
      break;
    case 'market':
      ideas.push('Calculate odds from AI params with noise factor');
      ideas.push('Generate Polymarket-compatible JSON payload');
      ideas.push('Save payload to pending-markets/ directory');
      break;
    default:
      ideas.push(`Fix ${gap.section}: ${gap.description}`);
  }
  
  return ideas.slice(0, 3);
}

async function runIdeator() {
  console.log('[Ideator] Analyzing gaps and generating ideas...');
  
  const state = await readState();
  if (!state) {
    console.log('[Ideator] No state file found');
    return;
  }
  
  const unresolvedGaps = (state.gaps || []).filter(g => !g.resolved);
  
  if (unresolvedGaps.length === 0) {
    console.log('[Ideator] No unresolved gaps - nothing to ideate');
    return;
  }
  
  let ideaId = (state.ideas?.length || 0) + 1;
  const newIdeas = [];
  
  for (const gap of unresolvedGaps) {
    // Check if gap already has ideas
    const existingIdeas = (state.ideas || []).filter(i => i.gapId === gap.id);
    if (existingIdeas.length > 0) continue;
    
    const ideas = generateIdea(gap);
    const category = categorizeIdea(gap);
    
    for (const idea of ideas) {
      newIdeas.push({
        id: `idea-${String(ideaId++).padStart(3, '0')}`,
        gapId: gap.id,
        section: gap.section,
        description: idea,
        status: 'pending',
        category,
        testResult: null,
        created: new Date().toISOString()
      });
    }
  }
  
  if (newIdeas.length > 0) {
    state.ideas = [...(state.ideas || []), ...newIdeas];
    await saveState(state);
    console.log(`[Ideator] Generated ${newIdeas.length} ideas for ${unresolvedGaps.length} gaps:`);
    
    // Group by category
    const byCategory = {};
    for (const idea of newIdeas) {
      if (!byCategory[idea.category]) byCategory[idea.category] = [];
      byCategory[idea.category].push(idea);
    }
    
    for (const [cat, ideas] of Object.entries(byCategory)) {
      console.log(`  ${cat}: ${ideas.length} ideas`);
    }
  } else {
    console.log('[Ideator] No new ideas generated');
  }
  
  return state;
}

runIdeator().catch(console.error);
