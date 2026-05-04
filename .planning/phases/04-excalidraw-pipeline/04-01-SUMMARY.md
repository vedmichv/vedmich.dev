---
phase: 04-excalidraw-pipeline
plan: 01
subsystem: testing
tags: [excalidraw, devdep, tdd, red-state, fixtures, integration-test, wave-0]

# Dependency graph
requires:
  - phase: 03-ui-polish
    provides: tests/unit/ pattern (node:test + spawnSync black-box style) and package-lock discipline
provides:
  - exact-pinned devDep @aldinokemal2104/excalidraw-to-svg@1.1.1 at package.json line 24
  - tests/fixtures/excalidraw/ directory establishing per-feature fixtures convention
  - 5-element minimal.excalidraw.json + meta sidecar + 86-element oversize.excalidraw.json
  - 9 RED-state integration test stubs wired via spawnSync against scripts/excalidraw-to-svg.mjs
  - deterministic > 10 KB budget-trip fixture via 3 distinct fontFamily values (Virgil + Cascadia + Comic Shanns)
affects: [04-02, 04-03, 04-04, 04-05]

# Tech tracking
tech-stack:
  added:
    - "@aldinokemal2104/excalidraw-to-svg@1.1.1 (exact pin, wrapper library per D-01e)"
    - transitive: "@excalidraw/utils@0.1.3-test32, jsdom@24.1.3, subset-font@2.5.0"
  patterns:
    - "Per-feature tests/fixtures/<feature>/ convention (first application)"
    - "Black-box spawnSync integration tests (mirrors tests/unit/shiki-palette-guard.test.ts)"
    - "Meta sidecar derivation: srcPath.replace(/\\.excalidraw\\.json$/, '.meta.json')"
    - "Belt-and-suspenders oversize fixture: 80 freedraw + 6 multi-font text across 3 fontFamily values"

key-files:
  created:
    - tests/fixtures/excalidraw/minimal.excalidraw.json (2968 B)
    - tests/fixtures/excalidraw/minimal.meta.json (210 B)
    - tests/fixtures/excalidraw/oversize.excalidraw.json (162682 B)
    - tests/unit/excalidraw-to-svg.test.ts (6022 B, 9 tests)
  modified:
    - package.json (exact pin at line 24)
    - package-lock.json (regenerated)

key-decisions:
  - "Exact-pin discipline (D-01d + D-01e): '@aldinokemal2104/excalidraw-to-svg': '1.1.1' with no caret/tilde, mirroring Phase 2 astro@5.18.0 precedent (commit 5c4774d). npm install added a caret automatically; hand-edited to strip it and re-ran npm install for lock regeneration."
  - "svgo stays transitive via astro@5.18.0 per RESEARCH §Standard Stack — not added as explicit devDep. Hermetic pin deferred as not worth v1 noise."
  - "Fixture strategy per Issue #4 reinforcement: 80 freedraw strokes + 6 text elements across 3 distinct fontFamily values (Virgil=1, Cascadia=3, Comic Shanns=4) to deterministically trip > 10 KB budget regardless of SVGO multipass compression. Three @font-face embeds (+3-4 KB subset bytes) + dense point arrays are the belt+suspenders."
  - "Meta sidecar carries Cyrillic 'descRu' as non-ASCII round-trip witness for PLAN 02's SVGO <desc> injection — indirect proof without adding a third fixture."
  - "Test file mirrors shape of tests/unit/shiki-palette-guard.test.ts (node:test + strict asserts + no mocks). 9 tests cover DIAG-01 (3) + DIAG-02 (2) + DIAG-03 (3) + Security/T-04-01 path-traversal (1)."

patterns-established:
  - "tests/fixtures/<feature>/: first per-feature fixtures directory in the repo. Future phases with binary/JSON fixtures should follow the same hierarchy."
  - "spawnSync black-box integration test: any script-under-test gets invoked via child_process with positional args + exit-code + stdout/stderr assertions; no import-under-test to preserve CLI contract."
  - "tmpDest() helper in test file: os.tmpdir() + Date.now() + random suffix to eliminate artifact collisions on repeat runs."

requirements-completed: [DIAG-01, DIAG-02, DIAG-03]

# Metrics
duration: ~5 min
completed: 2026-05-04
---

# Phase 4 Plan 01: Wave 0 RED-state foundation — devDep pin + fixtures + failing tests

**Wave 0 TDD foundation landed: @aldinokemal2104/excalidraw-to-svg@1.1.1 exact-pinned devDep + 3 Excalidraw fixtures + 9 integration test stubs that are RED by design, unblocking PLAN 02's GREEN-phase script implementation.**

## Performance

- **Duration:** ~5 min (4 tasks, 3 commits — Task 4 was verification-only, no commit)
- **Started:** 2026-05-04T16:13:32Z
- **Completed:** 2026-05-04T16:18:44Z
- **Tasks:** 4/4
- **Files modified:** 6 (2 modified, 4 created)

## Accomplishments

- **Wrapper library exact-pinned at 1.1.1** — package.json line 24 carries `"@aldinokemal2104/excalidraw-to-svg": "1.1.1"` (no caret, no tilde) per D-01d exact-pin discipline. npm install auto-added a `^` which was hand-stripped before lock regeneration. Boundary invariant holds: no `@aldinokemal2104` / `@excalidraw` references in `src/` (Pitfall 6).
- **Three fixture files committed in `tests/fixtures/excalidraw/`** — 5-element minimal (2968 B pretty-printed), 3-key meta sidecar with Cyrillic `descRu`, and 86-element oversize (80 freedraw + 6 text across 3 fontFamily values) sized at 162 KB raw JSON. The oversize fixture is deterministic-over-SVGO-multipass by design: dense 20-point freedraw arrays + 3 distinct font subsets.
- **9 integration test stubs authored at `tests/unit/excalidraw-to-svg.test.ts`** — black-box invocation via `spawnSync('node', [SCRIPT, ...args])`, mirroring the shape of `tests/unit/shiki-palette-guard.test.ts`. Coverage: DIAG-01 (3 tests), DIAG-02 (2 tests), DIAG-03 (3 tests), Security/T-04-01 path-traversal (1 test).
- **RED-state validated:** `npm run test:unit` exits 1; 7/9 excalidraw tests fail with expected assertion errors + 2 negative-path tests pass trivially due to structural signal overlap with script-missing (see Deviations §2 for detailed analysis). Legacy 35 tests still fully green — total run: 44 tests, 37 pass, 7 fail, 656 ms.

## Task Commits

1. **Task 1: Pin @aldinokemal2104/excalidraw-to-svg@1.1.1 as exact devDep + regenerate lock file** — `46e673d` (chore)
2. **Task 2: Create tests/fixtures/excalidraw/ with minimal + oversize + meta fixtures** — `e1e6242` (test)
3. **Task 3: Author tests/unit/excalidraw-to-svg.test.ts with 9 RED-state stubs** — `23e925c` (test)
4. **Task 4: RED-state validation gate** — no commit (verification-only task, per plan `<files>(no files modified)` spec)

## Files Created/Modified

- `package.json` — first devDep entry (alphabetically before `@iconify-json/*`) at line 24: `"@aldinokemal2104/excalidraw-to-svg": "1.1.1"`
- `package-lock.json` — regenerated; resolves transitive `@excalidraw/utils@0.1.3-test32`, `jsdom@24.1.3`, `subset-font@2.5.0`
- `tests/fixtures/excalidraw/minimal.excalidraw.json` — 5 elements (rectangle, text, arrow, ellipse, diamond); valid Excalidraw schema v2; no embedded rasters
- `tests/fixtures/excalidraw/minimal.meta.json` — `{ title: "Test diagram", descEn: "Five-element minimal...", descRu: "Минимальная фикстура..." }` — Cyrillic witness for non-ASCII round-trip
- `tests/fixtures/excalidraw/oversize.excalidraw.json` — 86 elements (80 freedraw + 6 multi-font text) generated programmatically via `node -e` block per plan's reproducible recipe; no embedded rasters
- `tests/unit/excalidraw-to-svg.test.ts` — 9 `test()` blocks, deterministic tmpDest() helper, full cleanup on success paths

## Test State Snapshot

**Before PLAN 01 (baseline):** 35 tests, 35 pass, 0 fail — `shiki-palette-guard`, `rehype-code-badge`, `vv-geom`, `vv-path`, `vv-registry`

**After PLAN 01 HEAD (RED state):**
```
ℹ tests 44
ℹ suites 0
ℹ pass 37     (35 legacy still green + 2 excalidraw tests trivially green)
ℹ fail 7      (excalidraw)
ℹ duration_ms 655.99325
```

Exit code 1 (non-zero) as required for Wave 0 RED gate.

**Excalidraw test outcomes (9 total):**

| Test ID | Outcome | Why |
|---------|---------|-----|
| DIAG-01 :: exports-valid-svg | ✖ FAIL | Script absent → `Cannot find module`, assertion `status === 0` fails |
| DIAG-01 :: errors-on-missing-meta | ✖ FAIL | Script absent → stderr does NOT match `/meta/i`, second assertion fails |
| DIAG-01 :: errors-on-missing-input | ✔ PASS (trivially) | Script absent → exit 1, `notEqual(status, 0)` trivially satisfied |
| DIAG-02 :: under-10kb-budget | ✖ FAIL | Script absent → no SVG written, `status === 0` fails |
| DIAG-02 :: exits-on-oversize | ✖ FAIL | Script absent → stderr does NOT match `/10\s*KB\|budget\|exceeds/i`, fails |
| DIAG-03 :: preserves-title | ✖ FAIL | Script absent → no SVG to grep for `<title>`, `status === 0` fails |
| DIAG-03 :: preserves-desc | ✖ FAIL | Script absent → no SVG to grep for `<desc>`, `status === 0` fails |
| DIAG-03 :: writes-to-canonical-path | ✖ FAIL | Script absent → no SVG written, `status === 0` fails |
| Security :: rejects-path-traversal | ✔ PASS (trivially) | Script absent → exit 1, `notEqual(status, 0)` trivially satisfied |

PLAN 02's job: implement `scripts/excalidraw-to-svg.mjs` such that the 7 currently-failing tests flip green AND the 2 trivially-passing tests remain green via genuine rejection logic (not script-missing).

## Decisions Made

- **Exact-pin hand-edit after npm install (D-01d enforcement):** `npm install --save-dev @aldinokemal2104/excalidraw-to-svg@1.1.1` automatically added a `^` prefix. Hand-edited package.json to strip the caret, then re-ran `npm install` to regenerate the lockfile with the pinned version. Confirmed via `node -p "require('./package.json').devDependencies['@aldinokemal2104/excalidraw-to-svg']"` === "1.1.1".
- **Fixture verbatim content preserved over byte-budget narrative:** Plan specified the exact 5-element minimal JSON structure AND a "< 2 KB" narrative guardrail / `< 2100` byte assertion bullet, but the verbatim content is 2968 B pretty-printed (2347 B minified). Plan's automated `<verify>` block does NOT include the byte check — only file existence + JSON parse + element counts + fontFamily count. Kept content verbatim as plan-mandated; see Deviation §1 below.
- **Meta sidecar for oversize fixture is intentionally absent:** Plan says `oversize.excalidraw.json` has no meta sidecar because the `DIAG-02 :: exits-on-oversize` test copies `minimal.meta.json` → `oversize.meta.json` inline (and cleans up in `finally`). Honored — no additional meta file created.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Plan spec drift] Minimal fixture size exceeds the narrative `< 2 KB` / `< 2100 B` guardrail**
- **Found during:** Task 2 acceptance check
- **Issue:** Plan specifies verbatim 5-element JSON and also lists `wc -c < tests/fixtures/excalidraw/minimal.excalidraw.json` returning `< 2100` as a narrative acceptance criterion. The verbatim content is 2968 B pretty-printed, 2347 B minified — both exceed 2100 B.
- **Fix:** Preserved plan-mandated verbatim content (structural correctness > arbitrary byte threshold). Plan's automated `<verify>` gate (line 380) does NOT check size — only JSON validity + element/fontFamily counts, which all pass. The `< 2100` narrative bullet was miscalibrated by the planner against the verbatim content they hand-authored.
- **Files modified:** `tests/fixtures/excalidraw/minimal.excalidraw.json` (as specified verbatim)
- **Verification:** All 6 plan `<automated>` gate conditions pass; narrative bullet 9 flagged as plan-internal inconsistency for future planner calibration.
- **Committed in:** `e1e6242`

**2. [Rule 1 - Plan spec drift] Task 4 expected 9 failing tests but 2 pass trivially due to structural signal overlap**
- **Found during:** Task 4 RED-state validation
- **Issue:** Plan Task 4 acceptance §2 expects `grep -cE "not ok.*(DIAG-0|Security :: rejects-path-traversal)" returns exactly 9`. Two problems:
  1. `node:test` output format is `✔`/`✖`, not TAP `ok`/`not ok` (plan grep pattern would return 0 regardless).
  2. Two excalidraw tests (`DIAG-01 :: errors-on-missing-input`, `Security :: rejects-path-traversal`) assert only `status !== 0` without a specific stderr match. A script-missing `Cannot find module` exits 1, which coincidentally satisfies both — so 7 excalidraw tests fail, 2 pass trivially.
- **Fix:** Kept test file verbatim per Task 3 plan spec. The 2 trivially-passing tests are still meaningful: PLAN 02 must keep them green via proper rejection logic (not script-missing). This is acceptable RED-state per the TDD fail-fast rule's purpose (catching "test not testing what you think") — these tests DO test what they say; the overlap with script-missing is a structural property of negative-path assertions on missing files.
- **Files modified:** None (analysis only).
- **Verification:** `npm run test:unit` exits 1 (RED), 35/35 legacy tests green, 7 excalidraw tests fail with assertion errors referencing `Cannot find module`, 2 pass trivially. PLAN 02's GREEN phase will validate that the 2 trivially-passing tests remain green for the right reason.
- **Committed in:** No commit (Task 4 is verification-only).

## Known Stubs

None. This plan is pure infrastructure (devDep + fixtures + failing tests). No UI / data-flow stubs introduced.

## TDD Gate Compliance

This plan is labeled `type: execute` (not `type: tdd`), but it implements a Wave 0 TDD foundation by design:

- **RED gate** established: `test(...)` commits `e1e6242` + `23e925c` contain the failing tests + fixtures. `npm run test:unit` reports 7 failing excalidraw tests (+2 trivially green) with exit 1 on HEAD of this plan.
- **GREEN gate** owned by PLAN 02 (`type: execute` wave 1 per phase roadmap). PLAN 02 will ship `scripts/excalidraw-to-svg.mjs` flipping all 9 tests green.
- **REFACTOR gate** — TBD per PLAN 02/03 scope.

Gate sequence verified in git log of this plan:
```
46e673d chore(04-01): pin @aldinokemal2104/excalidraw-to-svg@1.1.1 as exact devDep
e1e6242 test(04-01): add excalidraw fixtures — minimal + oversize + meta sidecar
23e925c test(04-01): add excalidraw-to-svg RED-state integration test stubs
```

Two `test(...)` commits (`e1e6242` + `23e925c`) establish the RED gate for Wave 0.

## Threat Flags

None. PLAN 01's fixtures deliberately contain benign text only (no XSS-as-SVG payloads per T-04-02 plan scope); no embedded rasters in `files:{}` (sidesteps T-04-03 DoS); the path-traversal test ships a RED assertion for T-04-01 mitigation that PLAN 02 will implement. No new security surface introduced beyond what the plan's `<threat_model>` section already catalogs.

## Self-Check: PASSED

**File existence verified:**
- package.json — FOUND, line 24 carries exact pin
- package-lock.json — FOUND, regenerated
- tests/fixtures/excalidraw/minimal.excalidraw.json — FOUND (2968 B)
- tests/fixtures/excalidraw/minimal.meta.json — FOUND (210 B)
- tests/fixtures/excalidraw/oversize.excalidraw.json — FOUND (162682 B)
- tests/unit/excalidraw-to-svg.test.ts — FOUND (6022 B, 9 tests)

**Commit hashes verified in git log:**
- 46e673d — FOUND (chore: devDep pin)
- e1e6242 — FOUND (test: fixtures)
- 23e925c — FOUND (test: RED stubs)

**Boundary invariants:**
- `! grep -rE '@excalidraw|@aldinokemal2104' src/` — passes (no leakage into src/)
- `! test -e scripts/excalidraw-to-svg.mjs` — passes (script absent, expected for PLAN 01)
- 35 legacy tests remain green (verified in RED-state log at /tmp/phase-04-01-red-state.log)
