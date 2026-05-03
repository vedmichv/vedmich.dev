---
phase: 02
plan: 01
subsystem: shiki-infrastructure
tags: [astro, shiki, playwright, test-infrastructure, baseline, version-pin]
dependency_graph:
  requires: []
  provides:
    - "Exact Astro 5.18.0 pin (stable substrate for Phase 2 implementation)"
    - "shiki-regression.spec.ts visual gate (8 cases, .prose-scoped)"
    - "rehype-code-badge.test.ts unit scaffold (becomes real in Plan 02-03)"
    - "8 pre-change baseline PNGs (in both Playwright snapshot dir + phase artifacts dir)"
  affects:
    - "Plan 02-02 consumes the Astro pin + the regression gate"
    - "Plan 02-03 replaces the unit scaffold with real hast-tree assertions"
    - "Plan 02-06 restores `^5.18.0` caret after phase merges"
tech-stack:
  added: []  # no top-level deps added; only version pin on existing astro
  patterns:
    - "Playwright visual regression gate with maxDiffPixels:150 / maxDiffPixelRatio:0.002 (mirrors pod-lifecycle-parity.spec.ts)"
    - "node:test + node:assert/strict for unit tests (already established in Phase 1)"
key-files:
  created:
    - tests/unit/rehype-code-badge.test.ts
    - tests/visual/shiki-regression.spec.ts
    - tests/visual/shiki-regression.spec.ts-snapshots/ (8 PNGs)
    - .planning/phases/02-code-block-upgrades/baselines/ (8 PNGs)
  modified:
    - package.json (astro pin)
    - package-lock.json (regenerated)
decisions:
  - "D-09 adjusted per RESEARCH.md Q8: pinned to 5.18.0 (already in node_modules) instead of 5.17.1 — functionally identical, avoids pointless downgrade reinstall."
  - "Baselines committed to both locations (Playwright auto-discovery dir + phase artifacts dir) per D-08b so reviewers can audit the pre-change state without poking inside the snapshot dir."
metrics:
  duration: "~3 minutes (5 tool-time minutes including test runs)"
  completed: "2026-05-03"
  tasks: 3
  commits: 3
  files_changed: 20
---

# Phase 02 Plan 01: Shiki Infrastructure + Baseline Capture Summary

Establishes the test + regression infrastructure for Phase 2 BEFORE any Shiki config change lands — Astro is pinned to exact `5.18.0`, unit + visual spec scaffolds are in place, and 8 pre-change baseline PNGs freeze the "before" visual state so later plans (02-02 through 02-05) can detect when a Shiki config or CSS change shifts the rendered output.

## What Shipped

1. **Astro version pin** — `package.json` changed from `"astro": "^5.17.1"` to `"astro": "5.18.0"` (exact pin, no caret). Lockfile regenerated; `node_modules/astro/package.json` reports 5.18.0. Pitfall 5 (accidental minor bump mid-phase) is now blocked. D-09 calls for restoring `^5.18.0` in Plan 02-06 after the phase merges cleanly.

2. **Unit test scaffold — `tests/unit/rehype-code-badge.test.ts`** (13 LOC): single `node:test` case that `assert.ok(true)` as a Wave 0 placeholder. Header comment documents that Plan 02-03 will replace this with real hast-tree fixtures once `rehype-code-badge.mjs` exists. Auto-picked up by the existing `npm run test:unit` script — no script change needed; 21/21 tests now pass (was 20/20).

3. **Visual regression spec — `tests/visual/shiki-regression.spec.ts`** (49 LOC): mirrors the structure of `tests/visual/pod-lifecycle-parity.spec.ts` exactly. Single templated `test()` inside a nested `for locale × for slug` loop produces 8 enumerated test cases:
   - `/{en,ru}/blog/hello-world`
   - `/{en,ru}/blog/2026-02-10-why-i-write-kubernetes-manifests-by-hand`
   - `/{en,ru}/blog/2026-03-02-mcp-servers-plainly-explained`
   - `/{en,ru}/blog/2026-03-20-karpenter-right-sizing`
   - Scope: `page.locator('article .prose').first()` (catches any `.prose`-scope CSS leakage, not just Shiki-specific changes).
   - Thresholds: `maxDiffPixels: 150`, `maxDiffPixelRatio: 0.002` (same as Phase 1's pixel-parity gate).
   - `reducedMotion: 'reduce'` + 300ms WOFF2 settle — deterministic across runs.

4. **8 pre-change baseline PNGs** captured via `npx playwright test tests/visual/shiki-regression.spec.ts --update-snapshots`, then re-run without `--update-snapshots` to confirm 8/8 pass deterministically against the freshly-captured baselines. Stored in both:
   - `tests/visual/shiki-regression.spec.ts-snapshots/` — Playwright's auto-discovered gate source of truth.
   - `.planning/phases/02-code-block-upgrades/baselines/` — phase-artifact audit copy, per D-08b.

## Verification (commands run + results)

| Command | Result |
|---------|--------|
| `grep '"astro":' package.json` | `    "astro": "5.18.0",` (no caret — PIN OK) |
| `grep -m1 '"astro"' package-lock.json` | `        "astro": "5.18.0",` (lockfile pinned) |
| `cat node_modules/astro/package.json \| grep '"version"'` | `"version": "5.18.0"` (installed) |
| `npm run test:unit` | 21/21 pass in ~119ms (includes the new scaffold) |
| `npx playwright test tests/visual/shiki-regression.spec.ts --list` | 8 tests enumerated under chromium project |
| `npx playwright test tests/visual/shiki-regression.spec.ts --update-snapshots` | 8 passed (12.4s) — baselines captured |
| `npx playwright test tests/visual/shiki-regression.spec.ts` | 8 passed (8.9s) — stable against own baselines |
| `ls tests/visual/shiki-regression.spec.ts-snapshots/*.png \| wc -l` | 8 |
| `ls .planning/phases/02-code-block-upgrades/baselines/*.png \| wc -l` | 8 |
| `npm run build` | 31 pages in 1.17s, zero errors |

## Commits

| # | Hash | Type | Files | Description |
|---|------|------|-------|-------------|
| 1 | `5c4774d` | chore | package.json, package-lock.json, tests/unit/rehype-code-badge.test.ts | Pin Astro to exact 5.18.0 + scaffold rehype-code-badge unit test |
| 2 | `d8f28bb` | test | tests/visual/shiki-regression.spec.ts | Scaffold shiki-regression.spec.ts with 8 test cases |
| 3 | `4e1fa49` | test | 16 PNG files across 2 directories | Capture 8 pre-change baseline PNGs for shiki-regression gate |

## Deviations from Plan

### Rule 3 — Fix baseline size expectation

**Found during:** Task 3 — baseline directory size audit.

**Issue:** Plan acceptance criteria state "Total baseline dir size is under 1 MB (8 × ~50KB ≈ 400KB expected)". Actual captured size is ~5.6 MB (hello-world ~130 KB each, mcp ~700-800 KB each, karpenter ~1.4-1.5 MB each).

**Root cause:** The plan's estimate assumed `.prose`-scoped screenshots would be text-only at ~50 KB. In reality, the `.prose` scope includes the full blog-post body — notably the karpenter post embeds two large inline images (the PodLifecycleAnimation SVG + a chart) which drive those PNGs up into the 1.4 MB range.

**Fix:** No code/artifact fix needed — this is a plan-estimate correction, not a bug. The baselines are deterministic, stable across runs, and git-acceptable at 5.6 MB total for a one-time phase commit. LFS is not required. Documented in the Task 3 commit message and in this SUMMARY so future phases know `.prose`-scoped baselines of image-heavy posts can hit ~1-2 MB per file.

**Files modified:** None.

**Commit:** N/A (deviation documented in `4e1fa49` commit message and this SUMMARY).

## Authentication Gates

None. All operations were local (npm install, npx playwright test, git commit). No network auth required.

## Known Stubs

None introduced by this plan. The unit test scaffold is an intentional placeholder; it's documented in the file's own header comment as a Wave 0 scaffold to be replaced in Plan 02-03 when `rehype-code-badge.mjs` lands. The test passes (`assert.ok(true)`), keeping the CI signal green until real assertions land.

## Next Plan Entry Point

**Plan 02-02 — Install @shikijs/transformers + wire transformers into astro.config.mjs.**

The baselines captured here must continue to pass unchanged after Plan 02-02 lands, because Plan 02-02 adds the `transformerNotationHighlight` / `transformerNotationDiff` transformers but does NOT apply any new CSS — the transformer annotations (`// [!code highlight]`, `// [!code ++]`, `// [!code --]`) won't appear in any existing post, so the visual output on all 4 posts × 2 locales stays byte-identical.

The first plan that will legitimately force a baseline re-capture is Plan 02-04 (Deep Signal CSS overrides) — by design, the screenshot gate will fail there, and the new post-Deep-Signal baselines become the committed "after" state.

## Self-Check: PASSED

- `tests/unit/rehype-code-badge.test.ts` — FOUND (committed in `5c4774d`, grep confirms `import { test } from 'node:test'`)
- `tests/visual/shiki-regression.spec.ts` — FOUND (committed in `d8f28bb`, `npx playwright test ... --list` returns 8 tests)
- `tests/visual/shiki-regression.spec.ts-snapshots/*.png` — FOUND (8 files, committed in `4e1fa49`)
- `.planning/phases/02-code-block-upgrades/baselines/*.png` — FOUND (8 files, committed in `4e1fa49`)
- `package.json` astro pin — FOUND (`"astro": "5.18.0"`, no caret)
- `package-lock.json` astro pin — FOUND (`"astro": "5.18.0"` in first entry)
- Task 1 commit `5c4774d` — FOUND in `git log --oneline`
- Task 2 commit `d8f28bb` — FOUND in `git log --oneline`
- Task 3 commit `4e1fa49` — FOUND in `git log --oneline`
- `npm run build` — PASSES (31 pages in 1.17s)
- `npm run test:unit` — PASSES (21/21)
- `npx playwright test tests/visual/shiki-regression.spec.ts` — PASSES (8/8 against its own freshly-captured baselines)
