# Sand Gallery — Cycle Log

## Cycle 1 — 2026-03-28 04:55 UTC
**Project:** ORBITAL DECAY (TheSandemon/orbital-decay)
**Type:** UPDATE
**Feature:** VOID MOON ECLIPSE SYSTEM

### What was added:
- Two orbiting void moons at 120px and 200px orbit radii, with opposite orbit directions
- Shadow cone eclipse mechanic: when a moon passes between the star and debris within 300px, absorption is BLOCKED — debris bounces away with purple sparks, a low tone, and a small mass drain
- Eclipse drain: 0.02 mass per 100ms when any moon is actively eclipsing
- Moon gravitational slingshot: tangential force deflects nearby debris
- Moon-debris collision: debris explodes into purple particles
- Moon-comet absorption: comets hitting moons are destroyed
- Star collision with moon: 1 mass damage + star pushed away
- Visual: dark radial shadow cone drawn from star through moon when active
- Visual: each moon has accretion disk gradient, crater details, orbital dash ring
- Visual: pulsing purple ring when moon is actively eclipsing
- UI: "VOID MOON ECLIPSE — ABSORPTION BLOCKED" indicator (top-left, pulsing)
- UI: "VOID MOONS ACTIVE" indicator (top-right)
- Instructions updated to mention void moons

### Bugs fixed during development:
1. **eclipseActive persisting across frames** — `eclipseActive` was not reset each update frame. Once any debris was eclipsed, it stayed true forever, causing constant mass drain. Fixed by resetting `this.eclipseActive = false` at the start of each `update()` call.
2. **Balance tuning** — Initial eclipse cone was too wide (0.35 rad) and drain too high (0.05/100ms), causing mass to drain from 50 to ~17 in 10 seconds with zero absorptions. Tuned to: cone 0.25 rad, drain 0.02/100ms, eclipse only when debris within 300px of star.

### Validation:
- Playwright: PASS
- Gameplay (12s automated): mass drains at correct passive rate, eclipse indicator toggles, zero console errors
- Code review: all edge cases handled, eclipse reset each frame, proper debris.eclipsed flag management
