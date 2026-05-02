---
phase: 1
slug: rich-media-primitives
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-05-02
---

# Phase 1 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | `@playwright/test` (visual + DOM assertions) + `node --test` (pure geometry unit tests) |
| **Config file** | `playwright.config.ts` (to be created in Wave 0) |
| **Quick run command** | `npx playwright test --grep @unit` (geometry-only, <5 s) |
| **Full suite command** | `npm run build && npx playwright test` (build → dev-server → screenshots) |
| **Estimated runtime** | ~25 s full suite (build ~1 s, Playwright ~20 s for visual + interaction) |

---

## Sampling Rate

- **After every task commit:** Run `npx playwright test --grep @unit` (geometry + DOM sanity, <5 s)
- **After every plan wave:** Run `npm run build && npx playwright test` (full suite with pixel parity)
- **Before `/gsd-verify-work`:** Full suite must be green + build must be clean (31+ pages, zero errors)
- **Max feedback latency:** 5 s (quick) · 25 s (full)

---

## Per-Task Verification Map

*Filled during planning — planner maps each PLAN task to a verification row.*

| Task ID | Plan | Wave | Requirement | Threat Ref | Secure Behavior | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|------------|-----------------|-----------|-------------------|-------------|--------|
| TBD | TBD | 0 | Wave-0 infra | — | N/A | install | `npx playwright install chromium` | ❌ W0 | ⬜ pending |

---

## Wave 0 Requirements

- [ ] `playwright.config.ts` — browsers: chromium; use reducedMotion: 'reduce' default; screenshot dir `./tests/__snapshots__/`
- [ ] `tests/visual/pod-lifecycle-parity.spec.ts` — baseline screenshot of `/en/blog/karpenter-right-sizing` BEFORE any refactor (Pitfall H from RESEARCH.md)
- [ ] `tests/unit/vv-geom.test.ts` — `node --test` unit tests for rectangle closest-edge intersection (validates RESEARCH.md §Edge-Point Geometry algorithm)
- [ ] `tests/unit/vv-path.test.ts` — unit tests for straight / bezier / polyline `computeWirePath()` builder
- [ ] `@playwright/test` installed as devDependency + browser binaries
- [ ] `CI=true` + `PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD` documented in `docs/` for deploy pipeline (avoid CI hang)
- [ ] `package.json` script entries: `"test:visual": "playwright test"`, `"test:unit": "node --test tests/unit/*.test.ts"`

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Time-to-port metric (D-21) | PRIMS exit criterion | Subjective — human clocks elapsed time while porting 1 additional slide from `slidev-theme-vv/presentations/vv-demo/pages/` onto primitives | Pick one slide not already ported (not slide 84). Timer starts on first file open, stops on green build + visual check. Record in CONTEXT.md under "Metrics". <10 min = Phase 7 skipped, 10-15 min = user decides, >15 min = Phase 7 triggered. |
| LOC metric (D-20) | PRIMS-05 proxy | `wc -l` is trivially automated but the interpretation is judgmental — does reduction prove "easier porting" or is it just code-shuffling? | Record pre-refactor `wc -l src/components/PodLifecycleAnimation.astro` (baseline: 241). Post-refactor, record again. Target: ≤ 100. Commit both numbers in phase verification report. |
| Prefers-reduced-motion behavior parity | PRIMS-04 | Visual-only — hard to assert via screenshot alone (OS toggle, not page-level) | Toggle macOS System Settings → Accessibility → Display → Reduce motion. Reload `/en/blog/karpenter-right-sizing`. Confirm: nodes visible at final opacity, wires at 0.55 opacity, no packet motion. Then untoggle, confirm animations resume. |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references (Playwright install + baseline capture + geometry unit tests)
- [ ] No watch-mode flags (Playwright `--ui` banned in CI)
- [ ] Feedback latency < 5 s on quick run, < 25 s on full suite
- [ ] `nyquist_compliant: true` set in frontmatter (after planner completes per-task map)

**Approval:** pending
