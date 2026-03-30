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

async function runRaceExecutor() {
  console.log('[RaceExecutor] Triggering race execution...');
  
  const state = await readState();
  if (!state) {
    console.log('[RaceExecutor] No state file');
    return;
  }
  
  // Check if we're ready to run
  if (state.status === 'running') {
    console.log('[RaceExecutor] Race already in progress');
    return;
  }
  
  // Check if tests are passing
  if (!state.currentBuild?.testsPassing) {
    console.log('[RaceExecutor] Tests not passing - skipping race');
    console.log('[RaceExecutor] Run tests first: npm test');
    return;
  }
  
  console.log('[RaceExecutor] Executing race via main.js...');
  
  // In a full implementation, this would spawn the actual race
  // For now, we just signal intent and update state
  state.status = 'pending_race';
  state.nextRace = new Date().toISOString();
  await saveState(state);
  
  // The actual race execution would be:
  // import { runRace } from '../src/main.js';
  // const result = await runRace();
  
  console.log('[RaceExecutor] Race queued');
  return state;
}

runRaceExecutor().catch(console.error);
