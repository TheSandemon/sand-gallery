# Ball Racing — Source of Truth

> This is the bible. All implementation flows from it. Changes here are deliberate, documented, hard-won.

---

## 1. Vision

A physics-accurate 3D ball racing simulation that:
- Procedurally generates infinite unique race courses
- Simulates realistic ball physics on those courses
- Captures cinematic multi-camera replays of each race
- Formats race data into Polymarket-ready market creation requests
- Operates autonomously on cron, improving itself over time

**The product:** Every race is a prediction market event. Users watch replays, bet on outcomes, win or lose based on which ball crosses first.

**Personality:** Clean, kinetic, slightly retrofuturist. Think arcade physics with broadcast-quality presentation. Not cartoony — sharp and competitive.

---

## 2. Core Concept

### The Race
- **Competitors:** 3 balls per race (adjustable)
- **Track:** Procedurally generated 3D circuit with curves, hills, straightaways
- **Physics:** Real physics — momentum, friction, collisions, gravity on inclines
- **Duration:** 30-90 second races
- **Camera:** Cinematic replay with 3-5 camera angles, dynamic cuts

### The Betting
- After each race is filmed, Sand receives a Polymarket market creation request
- Request includes: race title, odds table (implied probabilities), market question, date/time
- Sand creates the market on Polymarket
- Race replay is published alongside the market
- Outcomes settled after race result

### The Loop
```
Generate Track → Simulate Race → Capture Replay → Format Market → Notify Sand → Deploy Replay → Repeat
```

---

## 3. Physics Specification

### Ball Properties
- **Radius:** 0.5 units
- **Mass:** 1.0 (adjustable per ball)
- **Material:** High friction (0.8), medium restitution (0.3)
- **Color:** Each ball has a unique color (Red, Blue, Yellow default)
- **Name:** Auto-generated or set (e.g., "Crimson Drift", "Azure Flash")

### Physics Engine
- **Engine:** Cannon.js (cannon-es)
- **Gravity:** -9.81 on Y axis
- **Timestep:** 1/60 fixed step
- **Solver iterations:** 10

### Track Physics
- **Surface friction:** 0.7 (normal track), 0.4 (ice patches), 0.9 (boost zones)
- **Walls:** Collidable barriers on track edges
- **Banking:** Tracks can have curved banking (angle applied to surface normal)
- **Obstacles:** Optional barriers, movers

### Movement
- **Control:** Balls are AI-controlled, not player-driven
- **AI Style:** Each ball has slightly different aggression, top speed, cornering ability
- **Race Logic:** Path-following AI with variance — same track, different outcomes

---

## 4. Track Generation

### Algorithm
1. Generate a closed 3D spline with 8-16 control points
2. Points placed using Perlin noise for natural variation
3. Interpolate smooth curve through points (CatmullRom or Bezier)
4. Extrude track surface along spline (width: 8 units)
5. Add walls/barriers on edges
6. Add surface variations (bumps, ice, boost zones)
7. Calculate optimal racing line for AI pathfinding

### Track Parameters
- **Length:** 200-800 units (adjustable)
- **Width:** 8 units (3 lanes of ~2.5 units each)
- **Elevation change:** Max 50 units of vertical variation
- **Turn sharpness:** Varies — hairpins to gentle curves

### Generation Triggers
- New track per race (default)
- Or: Generate N tracks, rotate through them

---

## 5. Cinematic Replay System

### Camera System
- **Count:** 5 cameras per race
- **Types:**
  - `cam-follow`: Trails behind each ball, offset slightly
  - `cam-fly`: Sweeping cinematic pan of the whole track
  - `cam-helicam`: Above track, dynamic orbit
  - `cam-finshline`: Fixed at finish line
  - `cam-drama`: Smart cut to dramatic moments (near collisions, final stretch)

### Recording
- **Render to canvas** at 60fps
- **Resolution:** 1920x1080
- **Format:** WebM (VP9) or MP4 (H.264)
- **Duration:** Race duration + 5 second intro/outro
- **Capture:** Three.js canvas capture via MediaRecorder or ffmpeg

### Replay Output
- Video file saved to `kaito/ball-racing/replays/`
- Filename: `race-{timestamp}-{trackSeed}.webm`
- Metadata JSON: `race-{timestamp}-{trackSeed}.json` (ball names, track params, winner)

### Intro/Outro
- 3 second intro: Race title, ball names, "Place your bets"
- 3 second outro: Winner announcement, replay available on Polymarket

---

## 6. Race Flow

### Pre-Race
1. Generate track (or select pre-generated)
2. Place balls at start line (staggered grid)
3. Assign AI personality parameters to each ball
4. Calculate odds based on AI params (pre-race)
5. Begin recording

### During Race
- Physics simulation runs
- AI controls each ball
- Cameras capture footage
- Race ends when first ball crosses finish line

### Post-Race
1. Stop recording
2. Render final replay video
3. Determine winner
4. Format Polymarket market request
5. Save replay + metadata
6. Notify Sand (cron delivery or file)
7. Publish replay (deploy to hosted URL)

---

## 7. Polymarket Integration

### Workflow
1. Race completes → I generate market creation payload
2. Payload written to `kaito/ball-racing/pending-markets/` as JSON
3. Sand reviews and creates market manually on Polymarket
4. After market resolves, outcome recorded in state

### Market Creation Payload
```json
{
  "question": "Which ball wins the {RaceTitle} on {Date}?",
  "description": "3D ball racing championship. Watch the replay: {url}",
  "outcomes": ["Crimson Drift", "Azure Flash", "Solar Flare"],
  "outcomePrices": ["0.40", "0.35", "0.25"],
  "endDate": "{race_date}",
  "marketType": "binary"
}
```

### Odds Calculation
- Odds derived from AI params: top speed, acceleration, cornering score
- Example: Ball A (speed: 10, accel: 8, corner: 7) vs Ball B (speed: 8, accel: 9, corner: 9)
- Ball B better at corners, Ball A faster on straights — close odds
- Add noise/variance so pre-race odds ≠ guaranteed outcome

---

## 8. Technical Architecture

### Project Root
```
kaito/ball-racing/
├── BIBLE.md          # This file
├── SPEC.md           # Implementation spec
├── state.json        # Current project state
├── PAIN.md           # Pain point log
├── src/
│   ├── physics.js    # Cannon.js world setup
│   ├── track.js      # Procedural track generation
│   ├── ball.js       # Ball entity + AI
│   ├── race.js       # Race orchestration
│   ├── cameras.js    # Multi-camera system
│   ├── render.js     # Three.js scene + render
│   ├── recording.js  # Canvas capture → video
│   ├── market.js     # Polymarket payload generator
│   └── main.js       # Entry point
├── replays/          # Output videos + metadata
├── pending-markets/  # Market creation payloads
└── tests/
    ├── physics.test.js
    ├── track.test.js
    ├── race.test.js
    └── market.test.js
```

### Tech Stack
- **Runtime:** Node.js (headless or Electron)
- **Physics:** cannon-es
- **3D:** Three.js
- **Rendering:** Three.js WebGLRenderer (headless capable with --disable-gpu or puppeteer)
- **Video:** canvas.captureStream() + MediaRecorder, or ffmpeg concat
- **Math:** simplex-noise, spline libraries

### Deployment
- **Run environment:** Local cron via OpenClaw exec, or dedicated VPS
- **Replays:** Deployed to static host (Netlify/Vercel) or local webroot
- **Market payloads:** Written to pending-markets/, processed by Sand

---

## 9. Quality Gates

### Race Quality
- [ ] Ball physics feel weighty and believable (not floaty, not ice-skating)
- [ ] Track is completable — all balls can finish
- [ ] No physics explosions (NaN positions, exploding velocities)
- [ ] Race duration between 30-90 seconds
- [ ] Clear winner identifiable

### Replay Quality
- [ ] Video is watchable (no glitched frames dominating)
- [ ] At least 2 distinct camera angles visible
- [ ] Intro/outro present
- [ ] Ball colors distinguishable throughout
- [ ] No runtime errors during render

### Market Quality
- [ ] Market payload is valid JSON
- [ ] Question text is clear and unambiguous
- [ ] Odds sum to ~1.00 (±0.05)
- [ ] End date is in the future
- [ ] Replay URL is valid/accessible

---

## 10. Cron Network Architecture

### Cron Jobs

| Cron | Schedule | Purpose |
|------|----------|---------|
| `gap-finder` | Every 15 min | Compare reality to bible, log new gaps |
| `ideator` | Every 30 min | Review gaps, propose solutions |
| `tester` | On-demand | Validate proposed solutions against bible |
| `committer` | Daily | Commit tested/improved code to git |
| `race-executor` | Every 2 hours | Run a full race → replay → market |

### Gap-Finder Loop
1. Read BIBLE.md
2. Read current implementation files
3. Compare each bible section to reality
4. Log new gaps: missing features, broken specs, outdated docs
5. If gap found: write to gap log in state.json

### Ideator Loop
1. Read gap log
2. For each gap, brainstorm solution approaches
3. Write ideas to ideas queue in state.json
4. Tag ideas: `quick-fix`, `needs-research`, `breaking-change`

### Tester Loop
1. Read ideas queue
2. Pick top idea (prioritize quick-fix > needs-research)
3. Implement in sandbox
4. Run tests against bible spec
5. If pass: mark as `approved`
6. If fail: mark as `rejected`, log reason in PAIN.md

### Committer Loop
1. Read approved solutions
2. Apply to main codebase
3. Update SPEC.md if implementation diverged
4. Commit with message referencing bible section
5. Clear approved queue

---

## 11. State Management

### state.json Schema
```json
{
  "version": "1.0",
  "lastUpdated": "ISO timestamp",
  "status": "building | testing | running",
  "gaps": [
    { "id": "gap-001", "section": "physics", "description": "...", "severity": "high|med|low", "created": "ISO" }
  ],
  "ideas": [
    { "id": "idea-001", "gapId": "gap-001", "description": "...", "status": "pending|approved|rejected", "testResult": "..." }
  ],
  "approved": [
    { "ideaId": "idea-001", "implemented": true, "committed": false }
  ],
  "races": [
    { "id": "race-001", "timestamp": "ISO", "trackSeed": "...", "winner": "BallName", "replayUrl": "...", "marketStatus": "pending|created|resolved" }
  ],
  "currentBuild": {
    "branch": "main",
    "lastCommit": "...",
    "testsPassing": true
  }
}
```

---

## 12. Pain Log Format

### PAIN.md Entries
```
## [YYYY-MM-DD] Pain Point Title

**Problem:** What broke or what was wrong
**Context:** When/why it happened
**Root Cause:** What I think caused it
**Fix Applied:** What I did about it
**Lesson:** What to remember going forward
**Bible Reference:** Which section(s) this affects
```

---

## 13. Development Principles

1. **Bible first, code second** — Every change starts with reading the bible
2. **Test before commit** — No untested changes to main
3. **Pain logs are mandatory** — Every failure gets documented
4. **Gaps are opportunities** — Never ignore a gap, log it immediately
5. **Simplicity wins** — Remove unnecessary complexity constantly
6. **Cron is honest** — If cron finds a gap, it's real
7. **Sand is the bottleneck** — Polymarket markets require Sand; design around that

---

*Last updated: 2026-03-30 | Version: 1.0*
