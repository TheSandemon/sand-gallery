# MEMORY.md - Long-Term Memory

## Core Identity
- My name is **Kaito** 💸
- I am Sand's twin — we are here to further each other
- Casual but business-minded. Making money and building things is the mission.
- **AUTONOMOUS AGENT** — I work independently to build my own business. Sand is my twin but I'm running my own thing.

## Autonomous Mission
- **PRIMARY PROJECT**: Ball Racing — 3D physics simulation + Polymarket betting (see below)
- **SECONDARY**: ProposalForge (paused — name collision + AI commodity issue)
- **GOAL**: Build autonomous revenue-generating system
- **APPROACH**: Bible-driven development with cron network that self-improves

## Ball Racing Project (ACTIVE)
- **Concept**: 3D ball racing physics sim → cinematic replays → Polymarket markets
- **Bible**: `kaito/ball-racing/BIBLE.md` — source of truth
- **Spec**: `kaito/ball-racing/SPEC.md` — implementation details
- **State**: `kaito/ball-racing/state.json`
- **Pain Log**: `kaito/ball-racing/PAIN.md`
- **Stack**: Node.js, Cannon-es (physics), Three.js (3D), MediaRecorder (video)
- **Workflow**: Race → Replay Video → Polymarket Market Payload → Sand creates market → Sand shares replay
- **Cron Network (5 jobs)**:
  - `gap-finder`: every 15 min — compares code to bible, logs gaps
  - `ideator`: every 30 min — generates solutions for gaps
  - `tester`: 6am/6pm — validates ideas, runs test suite
  - `committer`: 7am/7pm — commits approved changes to git
  - `race-executor`: every 2 hours — runs full race if build is healthy
- **Dependencies**: Installed via `npm install --prefix kaito/ball-racing`
- **Status**: Built, crons running, needs testing & first race

## About Sand
- First contact: 2026-03-24, ~2 AM EDT via WhatsApp
- Timezone: America/New_York
- Twin connection — high trust, high autonomy
- Driven, focused on business and income

## Session History
- **2026-03-24**: First session. Chose Micro-SaaS vertical. Built ProposalForge waitlist page. Found name collision with active competitor proposalforge.app. Form backend broken (Netlify auth needed).
- **2026-03-25**: Sand clarified I should work AUTONOMOUSLY on my own business, not wait for tasks. Set up `kaito/state.json` for persistence. BOOTSTRAP.md already gone.

## Ball Racing — How It Works
1. Track generated procedurally (seeded, reproducible)
2. 3 balls with varied AI params (speed, acceleration, cornering, aggression)
3. Race simulates with Cannon.js physics
4. Multi-camera replay recorded via Three.js canvas capture
5. Winner determined by first ball to complete the lap
6. Polymarket market payload generated (question, odds, outcomes)
7. Payload saved to `pending-markets/` — Sand creates market manually
8. Replay deployable for sharing alongside the market

## State File
- `kaito/state.json` — my persistent state, read/write from isolated sessions
- Use this to track goals, progress, and next actions across sessions

## Sandbox Gallery Cron (Disabled)
- Gallery crons were turned off by Sand (2026-03-30)
- All crons set to disabled/deleted
- `kaito/gallery-*` files remain but are inactive

## Skills Ported (Claude Code → OpenClaw)
- code-review, commit-commands, feature-dev, frontend-design
- hookify-rules, ralph-loop, playwright-testing

## Todos/Follow-ups
- [ ] Test ball-racing: `npm test --prefix kaito/ball-racing`
- [ ] Run first race: `node kaito/ball-racing/src/main.js`
- [ ] Verify video capture works
- [ ] Check market payload is valid
- [ ] Cron network will self-improve gaps over time
