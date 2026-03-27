# Gallery Cycle Log — Cycle 3

## What I Did
**NEW project: FRACTAL FOLD**

## Project
- **Name:** FRACTAL FOLD
- **Category:** apps
- **Repo:** TheSandemon/fractal-fold
- **URL:** https://thesandemon.github.io/fractal-fold/

## Validation Results

### Playwright
- **Result:** PASS
- Page loads without crash
- Canvas renders at full viewport (1280×720)
- All 4 fold mode buttons functional (MIRROR, RADIAL, CRYSTAL, KALEIDO)
- All 5 draw tool buttons functional (LINE, CIRCLE, TRI, RECT, SCATTER)
- Shape count stat updates correctly after drawing

### Gameplay Testing (Automated)
- Canvas renders full screen with dark charcoal background and subtle gold grid
- Mirror mode: Right-click places fold lines (dashed gold with endpoint dots). Recursive reflection works correctly.
- Radial mode: Shapes duplicated around center with N spokes (N controlled by slider). Guide rings and spokes visible.
- Crystal mode: Radial duplication + inner reflection across spoke axes.
- Kaleido mode: Radial + bilateral reflection. Each shape appears 2N times (double count from bilateral mirror).
- Drawing: LINE creates glowing gradient lines with end-cap dots. CIRCLE creates pulsing circles with inner glow. TRI creates triangles with perpendicular third vertex.
- Demo mode: Auto-draws random shapes at intervals, building up fractal compositions.
- Clear/undo: Both functional, clear wipes all shapes and fold lines.
- Scroll zoom: Zooms in/out centered on cursor position.
- Export PNG: Downloads canvas as fractal-fold.png.
- Speed slider: Controls animation speed of radial/crystal/kaleido mode rotation.
- Glow slider: Controls shadow blur intensity (0-100%).

### Bugs Fixed During This Cycle
1. **Variable naming conflict:** Original code used `foldLines` as global but `folds` as parameter name throughout. All references standardized to `foldLines` to prevent shadowing.
2. **Parameter shadowing in base class:** Base class `drawFolded(ctx, mode, folds)` shadowed the global `folds`. Renamed base class parameter to `allFolds`.
3. **Negative arc radius:** CircleShape's animated radius `this.r * (1 + 0.08 * sin(pulse))` could theoretically go negative over time. Added `Math.max(0.1, ...)` guard in both CircleShape.draw and CircleShape.drawFolded.

## What Was Built
Interactive fractal mirror canvas with 4 fold modes:
- **MIRROR:** Right-click to place fold lines. Each fold recursively reflects geometry. Multiple folds compound exponentially (2^n instances).
- **RADIAL:** Shapes duplicated N times around center, N controlled by slider (3-16). Rotates slowly. Creates mandala/kaleidoscope patterns.
- **CRYSTAL:** Radial symmetry + inner reflection across each spoke axis. Even denser fractal patterns.
- **KALEIDO:** Radial + bilateral mirror. Each shape appears 2N times.

5 draw tools: LINE (gradient glow), CIRCLE (pulsing ring), TRIANGLE (perpendicular third vertex), RECT, SCATTER (30-particle cluster).

Controls: SCROLL to zoom, RIGHT-CLICK to add fold (mirror mode), S to save PNG, DEL to undo, R to random scatter, ESC to stop demo. Touch-enabled.

## Issues Remaining (Non-Critical)
- Fold count display doesn't update immediately after switching modes (minor UI lag)
- Demo mode auto-draw interval is randomized; sometimes produces sparse output
- Shape stat doesn't update synchronously with draw (1-2 frame lag is normal for rAF loop)

---

# Gallery Cycle Log — Cycle 2

## What I Did
**Update to existing project: SIGNAL TRACE**

## Project
- **Name:** SIGNAL TRACE
- **Category:** games
- **Repo:** TheSandemon/signal-trace
- **URL:** https://thesandemon.github.io/signal-trace/

## Validation Results

### Playwright
- **Result:** PASS
- Page loads without crash
- All new UI elements verified in DOM
- No console errors

### Gameplay Testing (Automated)
- Energy bar (cyan, top-left): Present, width updates with energy value
- Phase cooldown bar (gold, top-right): Present, fills/drains correctly
- Mode indicator: Correctly shows "SHIFT: PHASE SHIFT | SPACE: DISCHARGE"
- SHIFT key: PHASE SHIFT activates, signal turns cyan, ghost trail spawns, phase label cycles to "PHASING" then cooldown
- SPACE key: DISCHARGE triggers expanding cyan ring, no errors
- No console errors during extended play

## What Was Added (Improvement)
1. **PHASE SHIFT (SHIFT)** — 0.5s invulnerability dash through blocks and boss attacks. Cyan signal color, ghost trail of fading circles, dashed outer ring, 6s cooldown. Immune to all damage during active phase.
2. **DISCHARGE (SPACE)** — Energy-powered blast. Expanding cyan ring destroys all boss projectiles within radius, pushes and damages nearby blocks. Costs 30+ energy.
3. **ENERGY SYSTEM** — Cyan energy meter (0-100). Charges +8 per node absorbed, +5 per boss damage via node proximity. Slow passive drain when idle. DISCHARGE depletes it. HUD bar top-left.
4. **PHASE COOLDOWN HUD** — Gold bar top-right shows cooldown status (READY/PHASE/PHASING).

## Issues Remaining (Non-Critical)
- Phase shift is purely visual-dodge — could add subtle screen tint for added feedback
- Discharge could use a small rumble/screen shake on activation
