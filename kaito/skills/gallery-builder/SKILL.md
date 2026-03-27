# Gallery Builder Skill — Rigorous Edition

Build, test, and iterate on sand-gallery projects. This skill drives autonomous agent sessions.

## The Rigorous Testing Protocol

**EVERY project — new or update — must pass gameplay testing before being marked done.**

Playwright validation (`validate-page.js`) checks technical loading. But the agent MUST also do **manual gameplay testing** by directly interacting with the project. This means actually opening it in a browser and playing it.

### Testing Checklist (fill this out for EVERY project)

For each project, report these observations in the cycle log:

```
TESTING REPORT — [Project Name]
URL: https://thesandemon.github.io/[repo]/

[ ] Page loaded without crash
[ ] Controls respond (mouse/keyboard)
[ ] Game loop works (objective, progression, feedback)
[ ] Visuals render correctly (no glitched elements, proper colors)
[ ] No console errors during play (beyond warnings)
[ ] Audio works if applicable (no crackling, correct timing)

OBSERVATIONS:
- What did you play for ~2-3 minutes?
- What worked well?
- What was confusing or broken?
- What would make it better?

MUST-FIX (before marking done):
- [list any critical bugs that make it unplayable or very frustrating]
- [list any visual issues that are immediately obvious]

AFTER FIXES: Re-test before marking validated: true
```

### Critical vs Non-Critical

**Critical (MUST fix before deploy):**
- Game crashes on load or during play
- Controls don't work at all
- Complete black/white screen (shader compilation fail, etc.)
- No visible content on page
- Game has no way to progress or interact

**Non-Critical (note in log, can fix in follow-up update):**
- Slight visual glitch on one specific interaction
- Audio slightly out of sync
- UI could be more polished
- Missing a "nice to have" feature

## Decision: New or Update?
- **30% chance**: Build a NEW project
- **70% chance**: Update an EXISTING project

## Critical Files
- `C:\Users\Sand\.openclaw\workspace\kaito\gallery-builds.json` — tracks all projects
- `C:\Users\Sand\.openclaw\workspace\kaito\firebase-admin.json` — Firebase credentials
- `C:\Users\Sand\.openclaw\workspace\kaito\scripts\add-to-gallery.js` — Firestore writer
- `C:\Users\Sand\.openclaw\workspace\kaito\scripts\validate-page.js` — Playwright technical validator
- `C:\Users\Sand\.openclaw\workspace\kaito\scripts\ensure-pages-legacy.js` — Fixes GitHub Pages

## Path A: New Project

### Step 1: Pick a Category
Randomly pick: `games`, `apps`, or `tools`

### Step 2: Generate a Creative Idea
Must match sand-gallery's aesthetic:
- Dark backgrounds (#0a0a0a, #1a1a1a)
- Gold (#D4A853) and neon green (#00ff88) accents
- Distinctive fonts (Syncopate, Orbitron, Space Mono, Rajdhani — NOT Inter, Roboto)
- Particle effects, physics, interactive experiences
- NOT generic — feels like a creative technologist's portfolio

Ideas should be surprising and interesting. Think:
- Interactive particle simulations with novel mechanics
- Physics-based games with unexpected twists
- Generative art engines with user-driven evolution
- Audio visualizers with unique rendering approaches
- Creative coding experiments that feel alive

### Step 3: Build It
Create a complete, working `index.html` — genuinely impressive and creative.
Single HTML file preferred. Keep it under ~1500 lines of JS for maintainability.

### Step 4: Create GitHub Repo + Deploy
```bash
cd C:\Users\Sand\.openclaw\workspace
gh repo create TheSandemon/[repo-name] --public --source=[project-dir] --push
```
**CRITICAL**: After creating the repo, you MUST enable GitHub Pages with legacy static serving:
```bash
# Enable pages
gh api repos/TheSandemon/[repo-name]/pages --method POST \
  --field source[branch]=master --field source[path]=/
```

### Step 5: Playwright Validation
```bash
cd C:\Users\Sand\.openclaw\workspace\kaito
node scripts/validate-page.js https://thesandemon.github.io/[repo-name]/
```
If it FAILS, fix the issues and retry.

### Step 6: RIGOROUS GAMEPLAY TESTING
This is the critical step. Open the URL in your testing flow and:
1. Play for 2-3 minutes minimum
2. Try all the controls listed in the UI
3. Push all the buttons, test all modes
4. Look for visual glitches, unexpected behavior, broken game states
5. Identify what works and what doesn't

Fill out the testing checklist above. Fix critical bugs.

### Step 7: Add to Firestore
ONLY after Playwright AND gameplay testing both pass:
```bash
cd C:\Users\Sand\.openclaw\workspace\kaito
node scripts/add-to-gallery.js [category] "[title]" "[description]" "https://github.com/TheSandemon/[repo-name]" "" [type]
```

### Step 8: Update gallery-builds.json
```json
{
  "type": "new",
  "category": "games|apps|tools",
  "title": "...",
  "description": "...",
  "repo": "TheSandemon/...",
  "pagesUrl": "https://thesandemon.github.io/...",
  "firestoreId": "...",
  "validated": true,
  "tested": true,
  "testingNotes": "what you observed during gameplay",
  "timestamp": "ISO timestamp"
}
```

---

## Path B: Update Existing Project

### Step 1: Pick a Project
Read `gallery-builds.json`. Pick a project that hasn't been updated recently.
Prefer projects with older updates or known improvement opportunities.
Avoid the same project twice in a row.

### Step 2: Play the Current Version First
Before making any changes — play the existing version for 1-2 minutes.
Note what's working, what's broken, what could be better.
This tells you WHAT to improve.

### Step 3: Identify What to Improve
Based on gameplay observations:
- Add a compelling new feature
- Fix a real bug you actually encountered
- Improve visual design in a specific way
- Extend functionality in a natural direction
- Don't add junk "features" — add things that make it more fun/useful

### Step 4: Clone and Update
```bash
gh repo clone TheSandemon/[repo-name]
# Make targeted improvements
git add . && git commit -m "Describe what you added"
git push
```

### Step 5: Playwright Validation
```bash
cd C:\Users\Sand\.openclaw\workspace\kaito
node scripts/validate-page.js https://thesandemon.github.io/[repo-name]/
```

### Step 6: RIGOROUS GAMEPLAY RE-TESTING
After pushing, play the updated version for 2-3 minutes.
Compare to what you observed in Step 2. Did your changes actually help?
Fix any new bugs introduced by your changes.

### Step 7: Update gallery-builds.json
```json
{
  "type": "update",
  "title": "...",
  "repo": "TheSandemon/...",
  "improvement": "What you added/changed",
  "validated": true,
  "tested": true,
  "testingNotes": "comparison to previous version + observations",
  "timestamp": "ISO timestamp"
}
```

---

## Aesthetics Checklist
- [ ] Dark theme background (#0a0a0a or similar)
- [ ] Gold or neon green accent color
- [ ] Smooth animations (CSS or JS-based)
- [ ] No generic fonts (Inter, Roboto, Arial — use Syncopate, Orbitron, Space Mono, Rajdhani)
- [ ] Feels premium and hand-crafted
- [ ] Particle effects or physics feel alive
- [ ] Controls are responsive (no input lag)

## Non-Negotiable Rules
1. **Playwright validation MUST pass** — technical check
2. **Gameplay testing MUST happen** — actual play, real observations
3. **Critical bugs MUST be fixed** before marking done
4. If GitHub Pages is broken (404), use the POST command to set it to legacy mode
5. Always update `gallery-builds.json` when done — include testingNotes
6. **Report what you actually played and what you observed** — not just "it works"

## Output
Write a summary to `C:\Users\Sand\.openclaw\workspace\kaito\gallery-cycle-log.md`:
- What you did (new or update)
- Project name + category
- Validation result (Playwright + gameplay)
- Specific observations from playing
- What was fixed based on testing
- Issues that remain (non-critical)
