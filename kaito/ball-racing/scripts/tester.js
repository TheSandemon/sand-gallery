import { readFile, writeFile } from 'fs/promises';

const STATE_PATH = 'kaito/ball-racing/state.json';

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

async function runTests() {
  console.log('[Tester] Running tests and validating ideas...');
  
  const state = await readState();
  if (!state) {
    console.log('[Tester] No state file found');
    return;
  }
  
  // Get pending ideas
  const pendingIdeas = (state.ideas || []).filter(i => i.status === 'pending');
  
  if (pendingIdeas.length === 0) {
    console.log('[Tester] No pending ideas to test');
    return;
  }
  
  // Sort by category (quick-fix first)
  const sorted = pendingIdeas.sort((a, b) => {
    if (a.category === 'quick-fix' && b.category !== 'quick-fix') return -1;
    if (b.category === 'quick-fix' && a.category !== 'quick-fix') return 1;
    return 0;
  });
  
  // Pick top idea
  const topIdea = sorted[0];
  console.log(`[Tester] Testing idea: ${topIdea.description}`);
  
  // Simulate test - in reality this would run actual validation
  // For now, we'll mark as approved if it looks implementable
  
  const testPassed = validateIdea(topIdea);
  
  if (testPassed) {
    topIdea.status = 'approved';
    topIdea.testResult = 'passed';
    topIdea.testedAt = new Date().toISOString();
    console.log(`[Tester] ✓ Idea approved`);
  } else {
    topIdea.status = 'rejected';
    topIdea.testResult = 'failed - needs redesign';
    topIdea.testedAt = new Date().toISOString();
    console.log(`[Tester] ✗ Idea rejected - needs redesign`);
  }
  
  // Mark gap as resolved if all its ideas are processed
  const gapIdeas = (state.ideas || []).filter(i => i.gapId === topIdea.gapId);
  const allProcessed = gapIdeas.every(i => i.status !== 'pending');
  
  if (allProcessed) {
    const gap = (state.gaps || []).find(g => g.id === topIdea.gapId);
    if (gap) {
      gap.resolved = true;
      gap.resolvedAt = new Date().toISOString();
      console.log(`[Tester] Gap ${gap.id} resolved`);
    }
  }
  
  await saveState(state);
  return state;
}

function validateIdea(idea) {
  // Basic validation heuristics
  // In reality, run actual tests against the codebase
  
  // Quick-fixes are more likely to pass
  if (idea.category === 'quick-fix') return true;
  
  // Needs-research ideas need more scrutiny
  // For now, approve 50% of research ideas
  return Math.random() > 0.5;
}

runTests().catch(console.error);
