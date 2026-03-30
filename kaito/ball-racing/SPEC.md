# Ball Racing — Implementation Spec

> Derived from BIBLE.md. Code must match this spec. Divergences are bugs.

---

## Project Structure

```
kaito/ball-racing/
├── BIBLE.md
├── SPEC.md
├── state.json
├── PAIN.md
├── package.json
├── src/
│   ├── main.js            # Entry: runRace()
│   ├── physics.js         # Cannon.js world
│   ├── track.js           # Procedural track generation
│   ├── ball.js            # Ball entity + AI controller
│   ├── race.js            # Race state machine
│   ├── cameras.js         # Multi-camera setup
│   ├── render.js          # Three.js scene
│   ├── recording.js       # Canvas capture
│   ├── market.js          # Polymarket payload builder
│   └── utils/
│       ├── noise.js       # Simplex noise wrapper
│       └── spline.js      # Spline interpolation helpers
├── replays/               # Generated videos
├── pending-markets/       # Market payloads awaiting Sand
├── public/
│   └── replay.html        # Video player page for replays
└── tests/
    ├── physics.test.js
    ├── track.test.js
    └── race.test.js
```

---

## Tech Stack

- **Node.js:** v20+
- **cannon-es:** ^0.20.0 (ES module cannon.js fork)
- **three:** ^0.160.0
- **simplex-noise:** ^4.0.0
- **threejs-orbitcontrols:** (for camera debug, optional)
- **vitest:** ^1.0 (testing)

---

## Module Specifications

### physics.js

```js
// Creates and exports Cannon.js world
// - Fixed timestep: 1/60
// - Gravity: Vec3(0, -9.81, 0)
// - Solver iterations: 10
// - Exports: world, stepWorld(dt)
// - Balls added via addBall(body)
// - Track bodies added via addStaticBody(shape, position, quat)
```

### track.js

```js
// Generates a procedural track
// Input: { seed: number, length: number, width: number }
// Output: { surfaceBody, wallBodies, finishLine, raceLine, metadata }
// - Uses seeded RNG for reproducibility
// - Track is a series of connected trimesh segments
// - Finish line at t=0 and t=1 on spline
// - Race line (Vec3[]) exported for AI pathfinding
```

### ball.js

```js
// Creates a ball with physics body + visual mesh
// Input: { name, color, mass, aiParams }
// aiParams: { topSpeed, acceleration, cornering, aggression }
// Exports: { body (Cannon), mesh (Threejs), name, aiController }
// aiController: updates body.velocity each frame to follow raceLine
```

### race.js

```js
// State machine for race execution
// States: IDLE -> COUNTDOWN -> RACING -> FINISHED
// Exports: RaceController with methods:
//   - start(track, balls)
//   - update(deltaTime) -> returns 'running' | 'finished'
//   - getPositions() -> [{ball, distanceAlongTrack, velocity}]
//   - getWinner() -> ball | null
//   - getElapsed() -> seconds
```

### cameras.js

```js
// Manages 5 cameras: follow, fly, helicam, finishline, drama
// Each camera: { position, target, update() }
// Exports: CameraManager
//   - update(raceState) -> updates all camera transforms
//   - getActiveCamera() -> current render camera
//   - cutTo(cameraName) -> hard switch
//   - autoCut(raceState) -> smart cuts based on drama events
```

### render.js

```js
// Three.js scene setup
// Exports: Renderer
//   - init(domElement) -> WebGLRenderer
//   - addMesh(mesh)
//   - addLight(type, params)
//   - render(camera)
//   - captureFrame() -> ImageData
//   - setSize(w, h)
```

### recording.js

```js
// Canvas capture to video
// Input: canvas element, width, height, fps
// Output: MediaRecorder → Blob → .webm file
// Exports: Recorder
//   - start()
//   - captureFrame()
//   - stop() -> Promise<Blob>
//   - save(path) -> writes file
//   - getIntroBlob() / getOutroBlob() -> pre-rendered
```

### market.js

```js
// Generates Polymarket market creation payload
// Input: raceResult { winner, balls, trackName, raceDate, replayUrl }
// Output: marketPayload { question, description, outcomes, outcomePrices, endDate }
// Calculates odds from ball AI params + random noise
// Writes JSON to pending-markets/{timestamp}.json
```

---

## Key Constants

```js
const BALL_RADIUS = 0.5;
const TRACK_WIDTH = 8;
const RACE_TIMEOUT = 120; // seconds, force-finish if exceeded
const CAMERA_FPS = 60;
const VIDEO_OUTPUT_FPS = 30;
const RECORD_WIDTH = 1920;
const RECORD_HEIGHT = 1080;
const BALL_COUNT = 3;
const MARKET_NOTIFY_FILE = 'pending-markets/';
```

---

## Race Execution Flow (main.js)

```
1. Load dependencies
2. Generate track (track.js with random seed)
3. Create 3 balls with varied AI params
4. Initialize renderer + recording
5. Start recorder (with intro)
6. Run race loop:
   - Update physics (physics.js stepWorld)
   - Update AI controllers (ball.js)
   - Update cameras (cameras.js)
   - Render frame (render.js)
   - Check finish condition
7. Race ends → stop recorder (with outro)
8. Save video to replays/
9. Generate market payload → pending-markets/
10. Update state.json (race logged)
11. If cron triggered: deliver summary to Sand
```

---

## AI Controller Logic

```js
// Each ball's AI:
1. Find closest point on raceLine to current position
2. Look ahead N units on raceLine
3. Steer toward look-ahead point (proportional controller)
4. Apply throttle based on: distance to next turn, current velocity
5. Variance: add small random offset to throttle/steering for unpredictability
// Tunable params per ball:
//   topSpeed: max velocity magnitude
//   acceleration: how fast ball speeds up
//   cornering: how tight it can turn
//   aggression: how close to other balls it tries to go
```

---

## Video Output Format

- **Format:** WebM (VP9 codec)
- **Resolution:** 1920x1080
- **FPS:** 30
- **Intro:** 3s animation (race title, ball names)
- **Outro:** 3s (winner, "Bet on Polymarket")
- **Audio:** None (silent, cleaner)
- **Filename:** `race-{YYYYMMDD-HHmmss}-{seed}.webm`
- **Metadata:** `race-{YYYYMMDD-HHmmss}-{seed}.json` alongside

---

## Market Payload Example

```json
{
  "question": "Which ball wins the Neon Circuit race on March 30, 2026?",
  "description": "Watch the race replay and place your bet. 3D physics ball racing. Watch here: {replayUrl}",
  "outcomes": ["Crimson Drift", "Azure Flash", "Golden Apex"],
  "outcomePrices": ["0.41", "0.37", "0.22"],
  "endDate": "2026-03-30T20:00:00Z",
  "marketType": "scalar",
  "replayUrl": "https://example.com/replays/race-20260330-023100-4821.webm",
  "trackName": "Neon Circuit",
  "raceId": "race-20260330-023100-4821"
}
```

---

## Tests

### physics.test.js
- World initializes with correct gravity
- Step updates bodies
- No NaN after 100 steps

### track.test.js
- Same seed produces same track
- Track has collision bodies
- Finish line is defined

### race.test.js
- Race transitions through states correctly
- Winner is correctly identified
- Timeout force-finishes stalled races

---

## Quality Checklist (Pre-Commit)

Before any commit:
- [ ] All tests pass
- [ ] Race runs end-to-end without error
- [ ] Video file is generated and playable
- [ ] Market payload is valid JSON
- [ ] No hardcoded values that should be constants
- [ ] No console.log statements in production code
- [ ] SPEC.md matches implementation

---

*Version: 1.0 | Aligned with BIBLE.md v1.0*
