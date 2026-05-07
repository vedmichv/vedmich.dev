---
phase: 05-slidev-integration
plan: 01
subsystem: slidev-infrastructure
tags: [slidev, submodule, ci, claude-md, infrastructure, phase-5, wave-1]
requirements-covered: [SLIDES-01, SLIDES-02]
dependency-graph:
  requires: []
  provides:
    - slidev-submodule-at-slidev/
    - .gitmodules-with-branch=gh-pages
    - ci-checkout-with-submodules-recursive
    - ci-empty-whitelist-cp-step
    - CLAUDE.md-slidev-integration-pointer-block
    - CLAUDE.md-sweep-of-stale-s.vedmich.dev-references
  affects:
    - 05-02-PLAN.md (URL surface updates that reference /slides/<slug>/)
    - 05-03-PLAN.md (creates docs/slides-onboarding.md + vv-slidev skill — pointers already in CLAUDE.md)
    - 05-04-PLAN.md (requirements + traceability close)
tech-stack:
  added:
    - git submodule tracking vedmichv/slidev:gh-pages at pinned SHA 1dfa2ec0
    - actions/checkout@v4 with submodules: recursive
  patterns:
    - explicit-whitelist CI cp step (empty in Phase 5 per D-12)
    - zero-runtime-JS — decks are pre-built SPA artifacts, copied at CI time
    - byte-exact .gitmodules (tab-indented, git default shape)
    - H2 pointer block in CLAUDE.md mirroring ## Excalidraw Diagram Pipeline — LIVE analog
key-files:
  created:
    - .gitmodules (101 B, 4 lines)
    - slidev/ (submodule at SHA 1dfa2ec0429a9d84ef41e22e8ac97dccf59e0634; working tree ~30 MB)
  modified:
    - .github/workflows/deploy.yml (50 → 63 LOC; +13 net lines)
    - CLAUDE.md (4 surgical edits: lines 123 + 270 + H2 block at 312-325 + DNS row at 415)
decisions:
  - "Submodule SHA 1dfa2ec0 (gh-pages HEAD as of 2026-03-03) — exact match to plan's expected pin"
  - "Task 2 job-count regex (^  [a-z]+:$) returns 3 not 2 because it also matches 'push:' under 'on:'; actual job topology verified as exactly 2 jobs (build + deploy) via scoped awk extraction — regex quirk, not topology regression"
  - "All 3 remaining s.vedmich.dev references (lines 270, 316, 415) explicitly contextualized with legacy/transition/deferral prose — zero unexplained references"
  - "CLAUDE.md H2 count preserved at 13 (1 section replaced with 1 section)"
metrics:
  duration: "5m43s"
  tasks: 3
  files-changed: 4
  commits: 3
  completed: 2026-05-07
---

# Phase 05 Plan 01: Slidev Integration — Infrastructure Foundation Summary

**Plan 05-01** ships the infrastructure contract for serving Slidev presentation decks under `vedmich.dev/slides/<slug>/`: git submodule pointing at `vedmichv/slidev:gh-pages` at SHA `1dfa2ec0`, CI extension with submodule checkout + commented-out whitelist `cp` loop, and CLAUDE.md pointer block mirroring the `## Excalidraw Diagram Pipeline — LIVE` style analog — empty-whitelist by design, no deck migrates in Phase 5 per D-01/D-12.

## Commits

| Task | Commit | Type | Description |
|------|--------|------|-------------|
| 1    | `3c10a27` | `feat(05-01)` | Add vedmichv/slidev as git submodule at slidev/ (-b gh-pages) |
| 2    | `738806a` | `ci(05-01)` | Extend deploy.yml with submodule checkout + empty-whitelist cp step |
| 3    | `60e1c21` | `docs(05-01)` | Add Slidev Integration block to CLAUDE.md + sweep stale s.vedmich.dev refs |

## What shipped

### Submodule (Task 1)

- **New file:** `.gitmodules` (101 B, tab-indented):
  ```
  [submodule "slidev"]
  	path = slidev
  	url = https://github.com/vedmichv/slidev.git
  	branch = gh-pages
  ```
- **New submodule:** `slidev/` working tree initialized at `vedmichv/slidev:gh-pages` pinned SHA `1dfa2ec0429a9d84ef41e22e8ac97dccf59e0634` (HEAD of gh-pages as of 2026-03-03, commit "Fix base path for custom domain s.vedmich.dev")
- Submodule contents verified present: `404.html`, `CNAME`, `index.html`, plus two live deck dirs (`slurm-prompt-engineering/`, `slurm-ai-demo/`)
- Total files added to git index for this task: 2 (`.gitmodules` + `slidev` gitlink mode 160000)
- All 5 verification probes passed:
  - `git config -f .gitmodules --get submodule.slidev.branch` → `gh-pages` ✓
  - `git config -f .gitmodules --get submodule.slidev.url` → `https://github.com/vedmichv/slidev.git` ✓
  - `git config -f .gitmodules --get submodule.slidev.path` → `slidev` ✓
  - `git submodule status slidev` → matches `^[ +-][0-9a-f]{7,40} slidev \(heads/gh-pages\)$` ✓
  - `ls slidev/` → `404.html CNAME index.html slurm-ai-demo/ slurm-prompt-engineering/` ✓
- `.gitignore` NOT modified — `slidev/` is submodule-managed per Pitfall 4 guidance

### CI extension (Task 2)

- **Modified:** `.github/workflows/deploy.yml` (50 → 63 LOC, net +13 lines)
- **Edit A** — `actions/checkout@v4` gains `with: submodules: recursive` (+2 lines)
- **Edit B** — New step `Copy Slidev decks to dist/slides` inserted between `Build Astro` and `Upload artifact` (+11 lines):
  - `mkdir -p dist/slides` (always runs; creates empty dir which GH Pages silently ignores)
  - Commented-out `for slug in slurm-prompt-engineering slurm-ai-demo; do cp -r slidev/$slug dist/slides/; done` loop
  - Inline comments explaining the `--base /slides/<slug>/` rebuild requirement + pointing to `docs/slides-onboarding.md`
- **Invariants preserved:**
  - Single-job topology: exactly **2 real jobs** (`build:` line 18 + `deploy:` line 54) — verified by scoped awk extraction
  - No `@slidev/cli`, `slidev-theme-*`, or `vue` in `package.json` (Pitfall 3 guard — CLEAN)
  - Local `npm run build` exits 0 (32 pages built in 2.48s, zero errors)
  - Local `dist/slides/` absent after `astro build` (Astro doesn't touch it; only the CI cp step would — and with empty whitelist, it stays empty)

### CLAUDE.md edits (Task 3)

4 surgical edits on CLAUDE.md:

- **Edit A** (line 123): "grid cards linking to s.vedmich.dev Slidev decks" → `/slides/<slug>/` (future; infrastructure-only) or external `slides:` override
- **Edit B** (line 270): "slug must match Slidev deployment path (e.g. s.vedmich.dev/<slug>/)" → internal `/slides/<slug>/` OR external `slides:` override for SpeakerDeck/Notist/legacy s.vedmich.dev
- **Edit C** (lines 312-325): Replace `## Slidev Presentations Integration` (14 LOC) with `## Slidev Integration — INFRASTRUCTURE READY (since 2026-05-07)` (14 LOC) — mirroring `## Excalidraw Diagram Pipeline — LIVE (since 2026-05-04)` style analog; includes 4 bold-prefixed pointer rows (Runbook / Submodule / CI step / Skill) + Boundary invariant line
- **Edit D** (line 415 DNS table row): `(Slidev presentations, keep)` → `(legacy Slidev artifact surface — user-owned closure pending per SLIDES-05 deferral; Phase 5 migrates hosting to vedmich.dev/slides/<slug>/, see .planning/phases/05-slidev-integration/05-CONTEXT.md §D-17)`

**Result:**
- H2 count preserved at 13 (1 section replaced with 1 section)
- `## Excalidraw Diagram Pipeline — LIVE (since 2026-05-04)` analog byte-identical
- `## Publishing Workflow` section byte-identical
- All 3 remaining `s.vedmich.dev` references (lines 270, 316, 415) explicitly contextualized with "legacy/transition/deferral" prose — zero unexplained references per `must_haves.truths`

## Verification (plan's success criteria)

| Criterion | Result |
|-----------|--------|
| SLIDES-01: `.gitmodules` with `branch = gh-pages`, `slidev/` initialized | ✓ PASS |
| SLIDES-01: `submodules: recursive` + `Copy Slidev decks` step present | ✓ PASS |
| SLIDES-02: Single-job topology preserved (2 jobs: `build:` + `deploy:`) | ✓ PASS (via scoped awk) |
| CLAUDE.md `## Slidev Integration — INFRASTRUCTURE READY (since 2026-05-07)` H2 present | ✓ PASS |
| CLAUDE.md stale `s.vedmich.dev` refs at lines 123, 270, 415 updated or contextualized | ✓ PASS |
| `## Excalidraw Diagram Pipeline — LIVE` section byte-identical (style analog preserved) | ✓ PASS |
| `npm run build` exits 0 locally | ✓ PASS (32 pages, 2.48s) |
| `package.json` free of Slidev deps (Pitfall 3 guard) | ✓ PASS (grep CLEAN) |
| Empty whitelist means `dist/slides/` absent/empty after local build | ✓ PASS (dir absent) |
| Regression: 69/69 unit tests still pass | ✓ PASS (`npm run test:unit`) |

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 — Plan regex quirk] Task 2 job-count automated verify**

- **Found during:** Task 2 verification run
- **Issue:** Plan's `grep -cE '^  [a-z]+:$' .github/workflows/deploy.yml` expected to return 2 (one per job), actual returned 3 — because the regex ALSO matches `push:` under `on:` (the workflow's trigger block).
- **Fix:** None — the regex quirk was present in the BASELINE too (pre-Task-2 `git show HEAD~2:.github/workflows/deploy.yml | grep -cE '^  [a-z]+:$'` also returned 3). The Task 2 edits did NOT change the real job count. Verified via scoped `awk '/^jobs:/{flag=1; next} flag && /^[a-zA-Z]/{flag=0} flag && /^  [a-z]+:$/'` which returns exactly **2 jobs** (`build:` + `deploy:`) — single-job topology per SLIDES-02 preserved as required.
- **Classification:** Plan specification quirk — the intent (topology preserved) is fully met; the regex is just too broad. No code change needed.
- **Commit:** N/A (observation only)

### Auth Gates

None — no authentication required for any step. `git submodule add` used HTTPS to a public repo; no PAT/SSH key needed.

### Architecture Changes

None — plan executed exactly as written. All 4 D-decisions (D-02 submodule branch, D-05 whitelist, D-09 docs split, D-12 empty whitelist) honoured verbatim.

## Metrics

- **Duration:** 5m43s (343 s wall clock)
- **Tasks completed:** 3 / 3
- **Files changed:** 4 (2 created: `.gitmodules`, `slidev` gitlink; 2 modified: `deploy.yml`, `CLAUDE.md`)
- **Commits:** 3 (one per task, all conventional-commit format)
- **`.gitmodules` byte-count:** 101 B (plan expected ~97 B — within ~5% tolerance, difference is trailing-newline vs tab width)
- **`.github/workflows/deploy.yml` LOC:** 50 → 63 (+13; plan expected ~60-63 — exact match)
- **CLAUDE.md H2 count:** 13 → 13 (preserved exactly, 1 replacement section)
- **Submodule SHA:** `1dfa2ec0429a9d84ef41e22e8ac97dccf59e0634` (matches plan's expected `1dfa2ec0 or later`)
- **Regression:** 69/69 unit tests green (matches baseline); `npm run build` green (32 pages, 2.48s)

## Next

- **Plan 02** (Wave 1, parallel-safe): touches independent files (`src/components/PresentationCard.astro`, `src/data/search-index.ts`, `src/i18n/*.json`, 12 MDX frontmatter flips, `src/components/Presentations.astro` empty-state). No dependency on Plan 01's deliverables — can run in parallel.
- **Plan 03** (Wave 2, sequential after Plan 01): creates `docs/slides-onboarding.md` + `~/.claude/skills/vv-slidev/references/publish-to-vedmich-dev.md` + vault mirror. CLAUDE.md's new pointer block forward-references these files — Plan 03 materializes them.
- **Plan 04** (Wave 3, after Plans 01+02+03): requirements traceability + REQUIREMENTS/ROADMAP/STATE close for Phase 5.

## Self-Check: PASSED

- [x] `.gitmodules` exists (FOUND)
- [x] `slidev/` submodule populated (FOUND)
- [x] `.github/workflows/deploy.yml` has both edits (FOUND)
- [x] CLAUDE.md has new H2 block (FOUND)
- [x] Commit `3c10a27` exists (FOUND)
- [x] Commit `738806a` exists (FOUND)
- [x] Commit `60e1c21` exists (FOUND)
- [x] Build green, tests green (FOUND)
