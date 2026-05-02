---
phase: 1
slug: rich-media-primitives
status: planned
nyquist_compliant: true
wave_0_complete: false
created: 2026-05-02
updated: 2026-05-02
---

# Phase 1 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.
> Updated 2026-05-02 after `/gsd-plan-phase 1` produced 6 plans across 5 waves.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | `@playwright/test` (visual + DOM assertions) + `node --test --experimental-strip-types` (pure geometry + registry unit tests) |
| **Config file** | `playwright.config.ts` (created in Plan 01 Task 2) |
| **Quick run command** | `node --test --experimental-strip-types tests/unit/` (pure TS units, <2 s) |
| **Full suite command** | `npm run build && npx playwright test && node --test --experimental-strip-types tests/unit/` (build → dev-server → screenshots → unit tests, ~30 s) |
| **Estimated runtime** | build ~1 s · unit tests ~2 s · Playwright visual ~15 s · total ~30 s |

---

## Sampling Rate

- **After every task commit:** Run `node --test --experimental-strip-types tests/unit/` (geometry + registry, <2 s)
- **After every plan wave:** Run `npm run build && npx playwright test` (full suite with pixel parity)
- **Before `/gsd-verify-work`:** Full suite must be green + build must be clean (31+ pages, zero errors)
- **Max feedback latency:** 2 s (unit) · 15 s (Playwright) · 30 s (full)

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Threat Ref | Secure Behavior | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|------------|-----------------|-----------|-------------------|-------------|--------|
| 01-01 / Task 1 | 01-01 | 0 | Wave-0 infra | — | N/A | install+build | `npm run build` (31+ pages) | ❌ W0 | ⬜ pending |
| 01-01 / Task 2 | 01-01 | 0 | Wave-0 infra | — | N/A | parse | `npx playwright test --list` exits 0 | ❌ W0 | ⬜ pending |
| 01-01 / Task 3 | 01-01 | 0 | PRIMS-05 (baseline) | Pitfall H | N/A | visual-baseline | `npx playwright test tests/visual/pod-lifecycle-parity.spec.ts --reporter=list` returns "1 passed" | ❌ W0 | ⬜ pending |
| 01-02 / Task 1 | 01-02 | 0 | PRIMS-01, PRIMS-03 (edge-point math) | — | N/A | unit (node --test) | `node --test --experimental-strip-types tests/unit/vv-geom.test.ts tests/unit/vv-path.test.ts` shows `# pass 10` | ❌ W0 | ⬜ pending |
| 01-02 / Task 2 | 01-02 | 0 | PRIMS-01 (registry) | Pitfall D | N/A | unit (node --test) | `node --test --experimental-strip-types tests/unit/vv-registry.test.ts` shows `# pass 7` (plus 3 more added in Plan 04 → 10 total) | ❌ W0 | ⬜ pending |
| 01-03 / Task 1 | 01-03 | 1 | PRIMS-01 (VvStage) | Pitfall A, G | N/A | build + grep | `npm run build` exits 0 + 18+ grep invariants on VvStage.astro (tone classes, reduced-motion, no hex) | ❌ W1 | ⬜ pending |
| 01-04 / Task 1 | 01-04 | 2 | PRIMS-02,03,04 (registry extension) | — | N/A | unit (node --test) | `node --test --experimental-strip-types tests/unit/vv-registry.test.ts` shows `# pass 10` | ❌ W2 | ⬜ pending |
| 01-04 / Task 2 | 01-04 | 2 | PRIMS-02,03,04 (children) | Pitfall G | N/A | build + grep | `npm run build` exits 0 + VvNode/Wire/Packet register-only grep invariants + no-hex check | ❌ W2 | ⬜ pending |
| 01-04 / Task 3 | 01-04 | 2 | PRIMS-02,03,04 (VvStage emit) | — | N/A | build + grep | `npm run build` exits 0 + `registry.nodes.values()` and `registry.packets.values()` grep hits in VvStage.astro | ❌ W2 | ⬜ pending |
| 01-05 / Task 1 | 01-05 | 3 | PRIMS-03 (escape hatch) | — | N/A | unit + build | `node --test --experimental-strip-types tests/unit/` passes all 20 + `npm run build` exits 0 | ❌ W3 | ⬜ pending |
| 01-05 / Task 2 | 01-05 | 3 | PRIMS-05 (refactor) | — | N/A | visual-regression | `npx playwright test tests/visual/pod-lifecycle-parity.spec.ts --reporter=list` returns "1 passed" + `wc -l src/components/PodLifecycleAnimation.astro` ≤ 100 | ❌ W3 | ⬜ pending |
| 01-05 / Task 3 | 01-05 | 3 | D-18, D-09b (reduced-motion, tone border) | — | N/A | manual | Human visual sign-off on `/en/blog/2026-03-20-karpenter-right-sizing` | N/A | ⬜ checkpoint |
| 01-06 / Task 1 | 01-06 | 4 | PRIMS-06 (README) | — | N/A | grep | 18+ grep invariants on README.md (9 sections, 4 primitive subsections, Iconify regex, all 6 tone vars, reduced-motion mention, ≥200 LOC) | ❌ W4 | ⬜ pending |
| 01-06 / Task 2 | 01-06 | 4 | D-21 (time-to-port) | — | N/A | metric-capture | `.planning/phases/01-rich-media-primitives/time-to-port-report.md` exists with Elapsed + Recommendation lines; scratch files removed; `npm run build` passes | N/A | ⬜ pending |
| 01-06 / Task 3 | 01-06 | 4 | D-21 (Phase 7 gate) | — | N/A | manual | Human decision: SKIP / DEFER / TRIGGER Phase 7 | N/A | ⬜ checkpoint |

---

## Wave 0 Requirements

- [x] `playwright.config.ts` — browsers: chromium; use reducedMotion: 'reduce' default; webServer boots `npm run dev`; testDir `./tests/`
- [x] `tests/visual/pod-lifecycle-parity.spec.ts` — baseline screenshot of `/en/blog/2026-03-20-karpenter-right-sizing` BEFORE any refactor (Pitfall H)
- [x] `tests/unit/vv-geom.test.ts` — `node --test` unit tests for rectangle closest-edge intersection (5 cases including the PodLifecycle fixture)
- [x] `tests/unit/vv-path.test.ts` — unit tests for straight / bezier / polyline `computeWirePath()` (5 cases including via-dominates-curve)
- [x] `tests/unit/vv-registry.test.ts` — registry lifecycle + nested-push assertion (7 cases Wave 0, extended to 10 in Wave 2)
- [x] `@playwright/test` installed as devDependency + chromium binary (`npx playwright install chromium`)
- [x] `package.json` script entries: `"test": "playwright test"`, `"test:unit": "node --test tests/unit/"`
- [x] `.gitignore` entries: `test-results/`, `playwright-report/`
- [x] `astro-icon` + 8 `@iconify-json/*` installed + wired in astro.config.mjs

All Wave 0 requirements mapped to Plans 01-01 + 01-02 tasks.

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions | Plan Reference |
|----------|-------------|------------|-------------------|----------------|
| Animated-state visual parity (not just reduced-motion frozen state) | PRIMS-05 | Playwright's reducedMotion parity test covers static final state; the animated flow (packets looping, entry staggers) is time-dependent and best validated by a human eye | Plan 01-05 Task 3 checkpoint: `npm run dev`, open `/en/blog/2026-03-20-karpenter-right-sizing`, verify staggered entry + 7 packets looping + amber Pod tone border-left + no console errors | Plan 01-05 Task 3 |
| Prefers-reduced-motion toggle parity | PRIMS-04 / D-18 | OS-level setting toggle; hard to assert via Playwright emulateMedia alone (emulateMedia tests the declarative CSS but not the user-toggle path round-trip) | Plan 01-05 Task 3 checkpoint: toggle macOS Reduce motion, reload, confirm packets hidden + nodes static; untoggle, confirm resume | Plan 01-05 Task 3 |
| Time-to-port metric (D-21) | PRIMS-06 / Phase 7 gate | Subjective — human or Claude clocks elapsed time while porting one slide; interpretation of what "was slow" requires narrative | Plan 01-06 Task 2: pick a slide from slidev-theme-vv/presentations/vv-demo/pages/, time the port, record report with Phase 7 recommendation | Plan 01-06 Task 2 |
| LOC metric (D-20) | PRIMS-05 | `wc -l` is trivial; interpretation ("does reduction prove easier porting?") is judgmental | Plan 01-05 Task 2 automated verify: assert post-refactor LOC ≤ 100. Pre/post numbers committed to phase directory | Plan 01-05 Task 2 |
| Phase 7 go/skip decision | D-21 | Business decision weighing primitives ROI vs codegen scope | Plan 01-06 Task 3 checkpoint: user selects from three documented options based on time-to-port-report.md | Plan 01-06 Task 3 |

---

## Validation Sign-Off

- [x] All tasks have `<automated>` verify OR are Wave 0 dependencies
- [x] Sampling continuity: no 3 consecutive tasks without automated verify — checkpoints in Plans 05/06 interleaved with automated tasks
- [x] Wave 0 covers all MISSING references (Playwright install + baseline capture + geometry/registry unit tests + astro-icon install)
- [x] No watch-mode flags (Playwright `--ui` banned in CI; we use `--reporter=list`)
- [x] Feedback latency < 2 s on quick run (node --test), < 30 s on full suite
- [x] `nyquist_compliant: true` set in frontmatter

**Approval:** granted 2026-05-02 — all 6 plans mapped, all Wave 0 gaps addressed, both manual checkpoints have clear pass criteria.
