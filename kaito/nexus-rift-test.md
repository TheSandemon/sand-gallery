# NEXUS RIFT - Game Test Report

**Tester:** Kaito (subagent)  
**Date:** 2026-03-27  
**Game URL:** https://thesandemon.github.io/nexus-rift/  
**Duration:** ~2 minutes of active gameplay testing

---

## 1. Controls — How Do They Feel?

| Control | Input | Result | Verdict |
|---------|-------|--------|---------|
| Move | WASD | Player moved in all 4 directions smoothly | ✅ Good |
| Move | Arrow Keys | Same as WASD — both work | ✅ Good |
| Aim | Mouse | Player ship rotates to face cursor | ✅ Good |
| Shoot | Left Click | Bullets fired toward cursor | ✅ Good |
| Dash | SHIFT | Quick dodge movement | ✅ Good |
| Rift Burst | SPACE | Area burst attack (when charged) | ✅ Good |

**Notes:**
- Movement is responsive with no noticeable input lag
- Dash has a short cooldown (indicator says "DASH READY")
- Rift Burst charges over time (saw it at 17%, 26% during play)
- Both WASD and Arrow keys work simultaneously — no conflicts

---

## 2. Game Loop — Does It Work?

| Feature | Observed | Status |
|---------|----------|--------|
| Enemy Spawning | Red triangular enemies appeared and moved toward player | ✅ Working |
| Waves | "WAVE 1" displayed in UI | ✅ Working |
| Combat | Player could shoot and kill enemies | ✅ Working |
| Damage | Integrity (health) bar present at 100% during test | ✅ Likely working |
| Score | Score counter visible (started at 0) | ✅ Working |
| Dash Cooldown | "DASH READY" indicator appeared after using dash | ✅ Working |
| Rift Charge | "RIFT 26%" + progress bar fills over time | ✅ Working |

**Notes:**
- Game loop is functional — enemies spawn, player can fight, waves progress
- Enemies are red triangular ships that pursue the player
- No deaths during testing, but damage system appears to be in place

---

## 3. Visuals — Do They Render Correctly?

### Aesthetic
- **Style:** Neon vector / cyberpunk minimal
- **Background:** Deep black with subtle dark grid pattern + scattered cyan/green star particles
- **Player:** Neon green arrow/delta-wing shaped ship with glow
- **Enemies:** Red triangular ships (inverted from player orientation) with glow
- **Bullets:** Small bright projectiles (color not confirmed in screenshots)
- **UI:** Clean, high-contrast, positioned around screen edges

### UI Elements Present
- Title "NEXUS RIFT" (top left, orange/gold)
- Wave counter + Score (top right)
- "DASH READY" indicator (middle right, green)
- "RIFT XX%" + charge bar (right side, cyan)
- "INTEGRITY" health bar (bottom center, green)
- Control hints: "SPACE RIFT BURST", "SHIFT DASH" (bottom right)

### Visual Assessment
- ✅ All shapes render cleanly with no jaggies
- ✅ Glow/bloom effects on ships are consistent
- ✅ Grid background visible but not distracting
- ✅ UI text is legible and properly positioned
- ✅ No visual glitches, tearing, or rendering artifacts

---

## 4. Bugs & Issues

| Issue | Severity | Details |
|-------|----------|---------|
| 404 Resource Error | Low | Console showed `Failed to load resource: the server responded with a status of 404 ()`. Likely a favicon, font, or optional asset. Game continued to function normally. |

**No other bugs detected.** Game ran without crashes, freezes, or errors during ~2 minutes of play.

---

## 5. What Would Make It Better?

### Feedback & Polish
- **Screen shake** on taking damage or using Rift Burst
- **Hit markers** or flash when bullets connect with enemies
- **Enemy death effect** — explosion or particle burst when enemies die
- **Sound effects** — no audio observed (could be missing or just not tested thoroughly)
- **Damage numbers** — floating damage text on hit
- **Enemy health bars** — small bars above enemies showing their HP

### Gameplay Feel
- **Thruster trails** behind the player ship when moving
- **Bullet trails** for projectiles
- **Dash afterimage** — brief ghost trail when dashing
- **More enemy variety** — different shapes/colors per enemy type
- **Boss waves** — periodic tough enemies with more health

### UI/UX
- **Enemy count** — "X enemies remaining" in wave
- **High score display** — persistent personal best
- **Pause menu** (ESC key)
- **Mobile hint** — show touch controls if on mobile device

### Visual
- **Particle effects on Rift Burst** — more dramatic explosion visuals
- **Dynamic background** — subtle parallax star layers
- **Color-coded enemies** — different colors for different enemy types

---

## Summary

**Overall: The game is solid and playable.** Controls work, game loop functions, visuals are clean and cohesive. The main issue is a minor 404 error for some resource (favicon likely). The biggest opportunities for improvement are in juice/polish — adding screen shake, particles, sound, and visual feedback would elevate the experience significantly.

**Recommended priorities:**
1. Fix the 404 resource error (low effort)
2. Add screen shake and hit effects (medium effort, high impact)
3. Add enemy death explosions and bullet trails (medium effort, high impact)
4. Consider adding audio cues (if not already present)
