---
phase: 01-rich-media-primitives
plan: 02
subsystem: visuals-primitives
tags:
  - typescript
  - geometry
  - svg
  - unit-tests
dependency_graph:
  requires: []
  provides:
    - _vv-registry (SSR-time coordinate store)
    - _vv-geom (edge-point geometry)
    - _vv-path (SVG path builder)
  affects:
    - Wave 1 VvStage/VvNode/VvWire/VvPacket (blocked until this ships)
tech_stack:
  added:
    - node:test (built-in test runner, zero deps)
  patterns:
    - Named exports (mirrors src/i18n/utils.ts pattern)
    - Pure TypeScript utilities (zero runtime framework deps)
    - TDD RED/GREEN cycle
key_files:
  created:
    - src/components/visuals/_vv-registry.ts (102 LOC)
    - src/components/visuals/_vv-geom.ts (46 LOC)
    - src/components/visuals/_vv-path.ts (50 LOC)
    - tests/unit/vv-registry.test.ts (7 tests)
    - tests/unit/vv-geom.test.ts (5 tests)
    - tests/unit/vv-path.test.ts (5 tests)
  modified: []
decisions:
  - D-06/D-07: Ref-by-id resolution via SSR-time registry module (not Astro.slots.render function-children)
  - D-11: Wire shapes (straight/bezier/polyline) all anchored at edge-points
  - D-12: computeEdgePoints returns coordinates on rect border (not center)
  - Pitfall D: Runtime assertion in pushStage throws if nested (prevents silent wrong output)
metrics:
  duration: 152
  completed_date: 2026-05-02T18:04:50Z
  tasks_completed: 2
  files_created: 6
  loc_added: 368
  test_count: 17
  test_pass: 17
  test_fail: 0
---

# Phase 01 Plan 02: Pure-TS Utility Modules Summary

Ship three pure-TypeScript utility modules for Wave 1 primitives: registry, geometry, and path builder. All framework-agnostic, unit-tested, ready for VvStage integration.

## One-Liner

SSR-time coordinate registry + rectangle edge-point geometry + SVG path builder (straight/bezier/polyline) — 198 LOC pure TS, 17 unit tests green, zero runtime framework deps.

## Objective Achievement

**Target:** Ship `_vv-registry.ts` (module-level SSR coordinate store), `_vv-geom.ts` (rectangle closest-edge intersection), and `_vv-path.ts` (SVG path builder). All three pure TypeScript with zero Astro deps. Cover with `node --test` unit tests.

**Result:** ✅ All three modules shipped. 17 unit tests pass in <1s. PodLifecycle edge-point fixture test (kubectl → api: 280,410 → 360,410) confirms pixel-parity invariant. Ready for Wave 1 primitive integration.

## Tasks Completed

| Task | Name | Commit | Files | Tests |
|------|------|--------|-------|-------|
| 1 | Pure-TS geometry utilities (_vv-geom.ts + _vv-path.ts) | 171af39 | _vv-geom.ts, _vv-path.ts, vv-geom.test.ts, vv-path.test.ts | 10 pass |
| 2 | SSR-time coordinate registry (_vv-registry.ts) | 6b0d06e | _vv-registry.ts, vv-registry.test.ts | 7 pass |

## Deviations from Plan

None. Plan executed exactly as written. All acceptance criteria met.

## Technical Details

### Module Architecture

**_vv-registry.ts (102 LOC):**
- Module-level `currentStage` singleton
- `pushStage(r)` / `popStage()` lifecycle
- `currentRegistry()` throws if no active stage (WCAG-safe error message)
- Pitfall D assertion: nested pushStage throws immediately with "nested or concurrent stages detected"
- `createStageRegistry()` returns fresh Registry with unique uid (6+ chars via `Math.random().toString(36)`)
- Two Maps: `nodes` (NodeRecord) and `wires` (WireRecord)
- Duplicate id warning: `console.warn` on overwrite

**_vv-geom.ts (46 LOC):**
- `computeEdgePoints(from: Rect, to: Rect)` → `{ a: Point, b: Point }`
- Ray-to-rect-edge algorithm: computes t-parameter for both X and Y axes, takes minimum
- Handles degenerate case (dx=0, dy=0) → returns centers without throwing
- O(1) complexity, zero allocations beyond the two returned Points

**_vv-path.ts (50 LOC):**
- `computeWirePath(from: Rect, to: Rect, opts)` → SVG path `d` string
- Precedence: via > curve > straight
- Via (polyline): `M a L waypoint1 L waypoint2 ... L b`
- Curve (bezier): `M a Q control b` — control point perpendicular to midpoint, offset = curve × len × 0.5
- Straight (default): `M a L b`

### Test Coverage

**17 tests total, all green:**

- **vv-geom.test.ts (5 tests):**
  - Horizontal equal rects → 200,100 / 300,100
  - Vertical equal rects → 100,150 / 100,350
  - Diagonal unequal rects → border validation (within 1e-6 tolerance)
  - Degenerate zero-distance → returns centers
  - **PodLifecycle fixture (kubectl → api)** → 280,410 / 360,410 ✅ (pixel-parity invariant proven)

- **vv-path.test.ts (5 tests):**
  - Straight line → `M 280 410 L 360 410`
  - Bezier curve → regex match for `Q` command
  - Polyline via → `L 400 200` present, no `Q`
  - Via dominates curve → polyline wins
  - Multi-waypoint → all L segments present

- **vv-registry.test.ts (7 tests):**
  - createStageRegistry → empty maps, unique uid
  - registerNode / getNode → store/retrieve
  - registerWire / getWire → store/retrieve
  - pushStage + currentRegistry → happy path
  - currentRegistry throws when no stage active
  - Nested pushStage throws (Pitfall D)
  - Sequential stage lifecycles → no leakage

### Key Design Decisions

**D-06/D-07 (Ref-by-id resolution):** Chose SSR-time registry module over Astro.slots.render function-children pattern. Keeps MDX syntax clean: `<VvWire from='a' to='b'/>` with no `ctx` prop. Trade-off: module-level singleton assumes single-threaded SSR (Astro 5 baseline). Pitfall D assertion surfaces breakage immediately if Astro 6+ parallelizes.

**D-11 (Wire shapes):** All three shapes (straight/bezier/polyline) implemented with full edge-point anchoring. Bezier control point is perpendicular to midpoint (standard quadratic curve formula). Polyline interpolates via waypoints. Via dominates curve (tested).

**D-12 (Edge-point math):** `computeEdgePoints` returns coordinates on rect border, not center. Algorithm: ray-to-rect-edge via t-parameter (min of tX, tY). Handles unequal node widths correctly (tested via diagonal-unequal-rects case). PodLifecycle fixture test proves pixel parity: pre-refactor coordinates (280,410 → 360,410) reproduce exactly.

**Pitfall D (Nested stages):** Runtime assertion in `pushStage` throws Error if `currentStage` already set. Error message: "nested or concurrent stages detected" + migration hint for Astro 6+. Prevents silent wrong output (wire paths resolving to wrong nodes).

### Unit Test Infrastructure

**node:test runner:** Built into Node.js 18+, zero deps. Command: `node --test --experimental-strip-types tests/unit/*.test.ts`. TypeScript files run directly via Node 22's experimental TS support (no transpile step).

**Test execution time:** <1s for all 17 tests (113ms actual). Fast feedback loop for geometry regressions.

**Pattern:** `import { test } from 'node:test'; import assert from 'node:assert/strict';` — standard Node.js test API. No Jest, no Vitest, no test framework install.

## Requirements Validated

- **PRIMS-01:** `_vv-registry.ts` ready for VvStage (pushStage/popStage/currentRegistry + ref resolution)
- **PRIMS-03:** `_vv-geom.ts` + `_vv-path.ts` ready for VvWire (edge-point math + straight/bezier/polyline)
- **D-06/D-07:** Ref-by-id resolution mechanism shipped (registry module, not function-children)
- **D-11/D-12:** Wire shapes + edge-points implemented (all three anchored at borders)
- **Pitfall D:** Nested-push runtime assertion in place

## Next Steps

Wave 1 primitives (VvStage, VvNode, VvWire, VvPacket) can now import from these utility modules. Expected integration pattern:

- VvStage: `import { createStageRegistry, pushStage, popStage } from './_vv-registry.ts'`
- VvNode: `import { currentRegistry } from './_vv-registry.ts'` → `currentRegistry().registerNode(...)`
- VvWire: `import { currentRegistry } from './_vv-registry.ts'` + `import { computeWirePath } from './_vv-path.ts'`
- VvPacket: Reads wire records from registry for SMIL `<mpath>` targeting

## Self-Check: PASSED

✅ All created files exist:
- src/components/visuals/_vv-registry.ts
- src/components/visuals/_vv-geom.ts
- src/components/visuals/_vv-path.ts
- tests/unit/vv-registry.test.ts
- tests/unit/vv-geom.test.ts
- tests/unit/vv-path.test.ts

✅ All commits exist:
- 171af39 (Task 1: geom + path)
- 6b0d06e (Task 2: registry)

✅ All exports present:
- computeEdgePoints (1 occurrence)
- computeWirePath (1 occurrence)
- pushStage (1 occurrence)
- popStage (1 occurrence)
- currentRegistry (1 occurrence)
- createStageRegistry (1 occurrence)

✅ All patterns verified:
- rayToRectEdge helper (3 occurrences in _vv-geom.ts)
- via guard first (1 occurrence in _vv-path.ts)
- curve guard after via (1 occurrence in _vv-path.ts)
- "nested or concurrent" assertion text (1 occurrence in _vv-registry.ts)
- "must be inside a <VvStage>" error text (1 occurrence in _vv-registry.ts)

✅ All tests pass: 17/17 green, 0 failures.

✅ PodLifecycle fixture test passes (pixel-parity invariant confirmed).

## Metrics

- **Duration:** 2m 32s (152 seconds)
- **LOC added:** 368 (198 source + 170 tests)
- **Test count:** 17
- **Test pass rate:** 100% (17/17)
- **Files created:** 6
- **Commits:** 2
