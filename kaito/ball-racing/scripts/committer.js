import { readFile, writeFile } from 'fs/promises';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

const STATE_PATH = 'kaito/ball-racing/state.json';
const BIBLE_PATH = 'kaito/ball-racing/BIBLE.md';

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

async function gitCommit(message) {
  try {
    await execAsync(`git add -A && git commit -m "${message}"`, { cwd: 'kaito/ball-racing' });
    return true;
  } catch (e) {
    console.log('[Committer] Git commit failed (may be clean tree):', e.message);
    return false;
  }
}

async function getLastCommit() {
  try {
    const { stdout } = await execAsync('git log -1 --oneline', { cwd: 'kaito/ball-racing' });
    return stdout.trim();
  } catch {
    return null;
  }
}

async function runCommitter() {
  console.log('[Committer] Checking for approved changes...');
  
  const state = await readState();
  if (!state) {
    console.log('[Committer] No state file found');
    return;
  }
  
  // Find approved ideas
  const approvedIdeas = (state.ideas || []).filter(i => i.status === 'approved');
  
  if (approvedIdeas.length === 0) {
    console.log('[Committer] No approved ideas to commit');
    return;
  }
  
  // Group by section/gap
  const byGap = {};
  for (const idea of approvedIdeas) {
    if (!byGap[idea.gapId]) byGap[idea.gapId] = [];
    byGap[idea.gapId].push(idea);
  }
  
  // Generate commit message
  const sections = [...new Set(approvedIdeas.map(i => i.section))];
  const commitMsg = `ball-racing: Fix ${sections.join(', ')} (${approvedIdeas.length} changes)\n\n` +
    approvedIdeas.map(i => `- ${i.section}: ${i.description}`).join('\n') +
    `\n\n[auto-commit]`;
  
  // Check if there are actual file changes
  try {
    const { stdout } = await execAsync('git status --porcelain', { cwd: 'kaito/ball-racing' });
    if (!stdout.trim()) {
      console.log('[Committer] No file changes to commit');
      return;
    }
  } catch {
    // git not available or not a git repo
    console.log('[Committer] Not a git repo or git not available');
    return;
  }
  
  // Commit
  const committed = await gitCommit(commitMsg);
  
  if (committed) {
    // Mark ideas as committed
    const committedIds = new Set(approvedIdeas.map(i => i.id));
    state.ideas = (state.ideas || []).map(i => 
      committedIds.has(i.id) ? { ...i, committed: true, status: 'committed' } : i
    );
    state.currentBuild.lastCommit = await getLastCommit();
    await saveState(state);
    
    console.log('[Committer] Committed successfully');
    console.log(`  Ideas committed: ${approvedIdeas.length}`);
    console.log(`  Sections: ${sections.join(', ')}`);
  } else {
    console.log('[Committer] Nothing to commit');
  }
  
  return state;
}

runCommitter().catch(console.error);
