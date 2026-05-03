---
phase: 03-ui-polish
plan: 03
subsystem: testing
tags: [tests, shiki, syntax-highlighting, tech-debt, phase-2-fold, guard-test, github-dark]

# Dependency graph
requires:
  - phase: 02-code-block-upgrades
    provides: "8 attribute selectors in src/styles/global.css (lines 193-216) that match exact github-dark hex values and override them to Deep Signal tokens"
provides:
  - "tests/unit/shiki-palette-guard.test.ts — 8 node:test assertions pinning github-dark hex values emitted by Shiki via codeToHtml()"
  - "CLAUDE.md §Shiki palette guard pattern — documentation pointing maintainers at the test, when to run it, and why it exists"
  - "Hard failure gate at `npm run test:unit` for silent Shiki palette drift — replaces the soft defenses (semver pinning + ex-post-facto Playwright pixel diff)"
affects: [future-astro-bumps, future-shiki-bumps, phase-4-excalidraw-pipeline (dependency churn trigger)]

# Tech tracking
tech-stack:
  added: []  # shiki was already transitively installed by astro@^5.18.0 — zero new dependencies
  patterns:
    - "Palette guard test: one assert.match(html, /color:#HEX/i) per load-bearing hex, each with a failure message naming the exact CSS selector that breaks"
    - "Case-insensitive hex match via /i flag — handles Shiki's version-to-version case variance"
    - "Per-hex individual `test()` block (no loop/helper) — each failure points at a single distinct fixture + selector"
    - "node:test + node:assert/strict — mirror of tests/unit/rehype-code-badge.test.ts; zero new test-framework dependencies"

key-files:
  created:
    - "tests/unit/shiki-palette-guard.test.ts (69 LOC, 8 test() blocks, 8 codeToHtml() calls, 8 assert.match() assertions)"
  modified:
    - "CLAUDE.md (+6 lines: new `### Shiki palette guard pattern` H3 subsection between 'Key constraints' and 'Color Tokens' under §Deep Signal Design System)"

key-decisions:
  - "Followed the plan's `echo $1` fixture-vs-`echo $FOO` delta — shiki@3.23.0 bash grammar colors positional args (#FFAB70) but NOT identifier-style variables $FOO (colors those as default #E1E4E8). The plan's literal `echo $FOO` snippet was auto-fixed inline (Rule 1: Bug) before commit."
  - "No devDependency addition — shiki resolves transitively via astro@^5.18.0; `import { codeToHtml } from 'shiki'` in tests/unit/* works without package.json change"
  - "Zero modifications to existing tests/unit/ files (rehype-code-badge, vv-registry, vv-geom, vv-path) — per plan acceptance criterion, they remain byte-identical"
  - "No change to package.json test:unit glob — `tests/unit/*.test.ts` picks up the new file automatically"
  - "CLAUDE.md insertion as H3 subsection (not inline bullet in 'Key constraints') — matches the H3 rhythm used elsewhere in §Deep Signal Design System (Architecture / Key constraints / Color Tokens / Anti-Patterns / Typography)"

patterns-established:
  - "Shiki palette guard: one node:test assertion per load-bearing hex that a CSS attribute selector depends on — fixture must produce exactly that span color in the rendered HTML"
  - "Fixture verification is mandatory before shipping a palette-guard test — assumed semantics (#FFAB70 = 'bash variables') must be empirically confirmed against the current Shiki grammar (github-dark for `$FOO` actually renders as default text; positional args `$1` render as FFAB70)"
  - "Test failure message names both the drifted hex AND the consuming global.css selector, so maintainers have a single-hop path from test output to fix site"

requirements-completed: []  # Per plan frontmatter — WR-03 is Phase 2 tech-debt closure folded into Phase 3, not a POLISH-* requirement. Empty requirements field is intentional.

# Metrics
duration: ~10min
completed: 2026-05-03
---

# Phase 3 Plan 03: Shiki Palette Guard Summary

**Hard-assertion node:test guard fails fast at `npm run test:unit` if a future Shiki bump silently changes any of 8 load-bearing github-dark hex values that Phase 2's CSS attribute selectors depend on — closes WR-03 Phase 2 tech debt.**

## Performance

- **Duration:** ~10 min (fixture verification + test fix + commit + docs)
- **Started:** 2026-05-03T13:15:50Z (context load)
- **Commits landed:** 2026-05-03T13:19:29Z (test) → 2026-05-03T13:20:08Z (docs) — 39 seconds between atomic task commits
- **Completed:** 2026-05-03T13:20:38Z (summary write)
- **Tasks:** 2 / 2
- **Files modified:** 2 (1 new, 1 appended)

## Accomplishments

- `tests/unit/shiki-palette-guard.test.ts` shipped with 8 load-bearing github-dark hex assertions — each one exercises a single fixture snippet via `codeToHtml(code, { lang, theme: 'github-dark' })` and matches the rendered HTML against the expected hex
- All 8 assertions PASS on current shiki@3.23.0 (transitively via astro@^5.18.0) — verified by `npm run test:unit`, total suite jumped from 27 → 35 passing tests
- Each assertion's failure message names the drifted hex AND points to `src/styles/global.css` (line range 193-216 in the current file, referenced as "lines 169-192" in the plan based on pre-change numbering) — single-hop maintainer path from test output to fix site
- CLAUDE.md §Deep Signal Design System gains a new `### Shiki palette guard pattern` H3 subsection (4 bullets, between Key constraints and Color Tokens) documenting what the test pins, when to run it (before `npm update astro`), the run command, and its origin (WR-03 Phase 2 tech debt)
- Zero new dependencies added — shiki was already transitively installed by astro@^5.18.0
- Zero modifications to existing `tests/unit/` files (rehype-code-badge, vv-registry, vv-geom, vv-path remain byte-identical)
- Zero edit to `package.json` — the existing `tests/unit/*.test.ts` glob picks up the new file automatically

## Task Commits

Each task was committed atomically:

1. **Task 1: Create tests/unit/shiki-palette-guard.test.ts with 8 hex assertions (D-05, D-05b)** — `57d83f8` (test)
2. **Task 2: Document Shiki palette guard pattern in CLAUDE.md (D-05c)** — `9e357e6` (docs)

**Plan metadata commit:** pending this SUMMARY + STATE + ROADMAP update.

## Acceptance Grep Counts (all pass)

### Task 1 — tests/unit/shiki-palette-guard.test.ts

| Check | Expected | Actual |
|-------|----------|--------|
| `grep -c "^test(" tests/unit/shiki-palette-guard.test.ts` | 8 | **8** ✓ |
| `grep -c "codeToHtml" tests/unit/shiki-palette-guard.test.ts` | ≥ 8 | **9** ✓ (1 import + 8 call sites) |
| `grep -c "github-dark" tests/unit/shiki-palette-guard.test.ts` | ≥ 8 | **17** ✓ (test names + comments + theme literals) |
| `grep -c "assert.match" tests/unit/shiki-palette-guard.test.ts` | 8 | **8** ✓ |
| All 8 load-bearing hexes present (case-insensitive) | each ≥ 1 | **each = 3** ✓ (test name + code/comment + failure message) |
| `npm run test:unit` exits 0 | yes | **yes** ✓ |
| `npm run test:unit` passes 8 new `github-dark ... color is #...` assertions | 8/8 | **8/8** ✓ (total suite 35/35, up from 27/27) |
| Existing tests byte-identical | yes | **yes** ✓ (git diff tests/unit/{rehype-code-badge,vv-registry,vv-geom,vv-path}.test.ts is empty) |
| `package.json` unchanged | yes | **yes** ✓ |

### Task 2 — CLAUDE.md

| Check | Expected | Actual |
|-------|----------|--------|
| `grep -c "### Shiki palette guard pattern" CLAUDE.md` | 1 | **1** ✓ |
| `grep -c "shiki-palette-guard.test.ts" CLAUDE.md` | 1 | **1** ✓ |
| `grep -c "npm run test:unit" CLAUDE.md` | ≥ 1 | **2** ✓ (in 'When to run' bullet + 'Run command' bullet) |
| All 8 load-bearing hexes present in subsection | ≥ 8 | **8** ✓ |
| Subsection ordering (Key constraints → Shiki → Color Tokens) | in order | **L73 → L77 → L83** ✓ |
| No other subsection modified | diff purely additive | **yes** ✓ (6 `+` content lines, 0 `-` content lines) |

### Global

- `git diff HEAD~2 --stat` → 2 files changed, 75 insertions(+), 0 deletions — within plan's projected scope (2-3 files if shiki had needed a devDep addition; only 2 since shiki resolves transitively)

## Files Created/Modified

- `tests/unit/shiki-palette-guard.test.ts` (new, 69 LOC) — 8 `test()` blocks, one per load-bearing github-dark hex:
  - `#E1E4E8` default text via `const x = 1` (ts identifier)
  - `#F97583` keyword via `const x = 1` (ts `const`)
  - `#9ECBFF` string literal via `const x = "hello"` (ts)
  - `#85E89D` yaml key via `apiVersion: v1\nkind: Pod\n`
  - `#79B8FF` type annotation via `const x: number = 1`
  - `#6A737D` comment via `// comment`
  - `#B392F0` function name via `function foo() {}\nfoo();` (the `foo()` call site renders the identifier in #B392F0)
  - `#FFAB70` bash variable via `echo $1` (**fixture adjusted from plan's literal `echo $FOO`** — see Deviations below)
- `CLAUDE.md` (+6 lines after line 75 'Never add hardcoded hex' bullet, before line 77 '### Color Tokens (canonical)') — new `### Shiki palette guard pattern` H3 subsection with 4 bullets (what / when / run-command / origin)

## Decisions Made

- **Fixture for `#FFAB70` changed from `echo $FOO` (plan's literal) to `echo $1`** — empirical check against shiki@3.23.0 bash grammar showed `$FOO` renders as default `#E1E4E8` (Shiki does not treat identifier-style variable references as a distinct grammar token), while positional args `$1`/`$2` render as `#FFAB70`. Applied as Rule 1 (Bug fix) inline before commit, with an explanatory in-line comment in the test file naming the constraint. See Deviations.
- **No devDependency added for shiki** — tested empirically via the first test run before committing; `import { codeToHtml } from 'shiki'` resolves cleanly from `tests/unit/` because `node_modules/shiki@3.23.0` is present via astro's dependency chain. Plan's fallback path ("add `shiki: "^3.21.0"` to devDependencies IF the import fails") was not needed.
- **Kept all other fixtures verbatim from the plan** — the 7 non-bash assertions (`const x = 1`, `const x = "hello"`, `apiVersion: v1`, `const x: number = 1`, `// comment`, `function foo() {}\nfoo();`, bash positional arg) all produce the expected hex on first probe; no further deviations.
- **CLAUDE.md insertion shape followed the PATTERNS.md recommendation verbatim** — 4 bullets matching the terseness of "Key constraints", H3 rhythm of surrounding subsections, no inline fixture snippets (pointer to the test file + to the plan/todo is the pattern).

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Fixture for `#FFAB70` assertion: `echo $FOO` → `echo $1`**
- **Found during:** Task 1 — initial `npm run test:unit` after writing the file verbatim from the plan showed 7/8 green and 1 red. Error output revealed Shiki's github-dark bash grammar colors `echo` as `#79B8FF` and ` $FOO` as `#E1E4E8` (default text) — `#FFAB70` never appeared in the rendered HTML for that fixture.
- **Issue:** The plan (03-03-PLAN.md Task 1 Implementation notes, bullet 5) specifies `echo $FOO` and claims "`$FOO` (variable)" renders as `#FFAB70`. This contradicts actual shiki@3.23.0 behaviour: identifier-style shell variable references are default-text; only positional args (`$1`, `$2`, etc.) or the special `$?`, `$$`, `$!`, `$#` forms pick up `#FFAB70`.
- **Fix:** Changed fixture from `echo $FOO` to `echo $1`, and added an inline NB comment explaining the Shiki grammar constraint so a future maintainer doesn't re-litigate.
- **Files modified:** `tests/unit/shiki-palette-guard.test.ts` (one-line fixture change + 3-line explanatory comment block)
- **Verification:** Probed 23 candidate fixtures across bash/js/ts/python/json/yaml/dockerfile/css/html/markdown/toml/go/rust — only bash `$1` (and by extension any positional arg) produced `#FFAB70` in the current shiki. `npm run test:unit` now exits 0 with all 8/8 assertions passing.
- **Committed in:** 57d83f8 (Task 1 commit, single atomic unit)

---

**Total deviations:** 1 auto-fixed (1 Rule 1 bug — plan fixture didn't produce the expected color under current Shiki)
**Impact on plan:** Minimal — the test's intent (prove `#FFAB70` still renders from some fixture, catch silent Shiki drift) is preserved with a stronger empirical fixture. The failure message still points to `global.css` selector `#FFAB70`. No scope creep, no additional files touched. The plan's "planner refines each fixture snippet and confirms each hex appears exactly once in the rendered HTML" line (PATTERNS.md §`tests/unit/shiki-palette-guard.test.ts`) anticipated this kind of fixture refinement; the bug was that the plan itself shipped with an un-refined `$FOO`.

## Issues Encountered

None beyond the deviation above — probing took < 2 minutes (23 fixtures across 13 languages via a one-off `.mjs` script in `tests/unit/_probe.mjs`, deleted before commit). The remaining 7 fixtures produced exactly one span of their target color on the first run, as the plan predicted.

## User Setup Required

None — no external service configuration required. The test runs locally via `npm run test:unit` and in any CI that invokes that same script.

## WR-03 Todo Archival

The source todo at `.planning/todos/pending/shiki-palette-guard.md` is now **shipped in its entirety**:

- All 8 load-bearing hexes asserted ✓
- `npm run test:unit` integration done ✓
- CLAUDE.md documentation done ✓

Per the plan's `<output>` guidance ("Note to file-mover: `.planning/todos/pending/shiki-palette-guard.md` can be moved to `.planning/todos/done/` with the SUMMARY link — leave this for the orchestrator's end-of-phase cleanup, don't move it inside this plan"), the file is NOT moved/deleted in this commit. Phase orchestrator should archive it (move to `.planning/todos/done/` or delete) during end-of-phase cleanup after all 4 phase-3 plans complete.

## Next Phase / Plan Readiness

**Hand-off to Plan 02 / Plan 04 (Wave 2 + Wave 3):**
- Plan 03 is a leaf node in the wave DAG — it shares zero files with Plans 01, 02, 04. Its completion unblocks nothing else in Phase 3 (both Wave 2 Plan 02 and Wave 3 Plan 04 depend only on Plan 01's motion infrastructure, which shipped 2026-05-03).
- The palette guard is now armed: any future `npm update astro` or direct `npm update shiki` will be gated on the 8 assertions passing before visual regressions could appear on `/blog/*`.
- No blockers, no new infrastructure to validate. Plan 02 (bottom CTAs + stagger wiring) and Plan 04 (spacing/typography audit) may proceed independently.

**Broader hand-off (future milestones):**
- Before Phase 4 (Excalidraw pipeline), which will bring `@excalidraw/*` and SVGO deps, the palette guard gives confidence that incidental Shiki transitive bumps caused by Phase 4's npm churn won't break Phase 2's code-block theming silently.
- Before any Astro major bump (Astro 6+), run `npm run test:unit` first as the documented precondition.

## Self-Check: PASSED

- `tests/unit/shiki-palette-guard.test.ts` exists with 69 lines, 8 `test()` blocks, 8 `assert.match` calls — verified via `wc -l`, `grep -c`
- `CLAUDE.md` contains `### Shiki palette guard pattern` heading on line 77, between `### Key constraints` (L73) and `### Color Tokens (canonical)` (L83) — verified via `grep -n`
- Task 1 commit `57d83f8` exists — verified via `git log --oneline`
- Task 2 commit `9e357e6` exists — verified via `git log --oneline`
- `npm run test:unit` exits 0 with 35 passing tests (27 pre-existing + 8 new), 0 failing — verified via full suite run
- All 8 load-bearing hexes (`#E1E4E8 #F97583 #9ECBFF #85E89D #79B8FF #6A737D #B392F0 #FFAB70`) appear in both the test file (3 times each: test name + fixture context + failure message) and in CLAUDE.md (once each in the §Shiki palette guard pattern What bullet) — verified via `grep -oE "#[A-F0-9]{6}" | sort -u`

---
*Phase: 03-ui-polish*
*Plan: 03*
*Completed: 2026-05-03*
