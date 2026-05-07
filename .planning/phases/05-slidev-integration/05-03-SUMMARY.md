---
phase: 05-slidev-integration
plan: 03
subsystem: slidev-runbook-and-skill-reference
tags: [slidev, docs, runbook, skill, three-way-sync, phase-5, wave-2]
requirements-covered: [SLIDES-06, CONTENT-04]
dependency-graph:
  requires:
    - 05-01 (Plan 01 Task 2 created the `Copy Slidev decks to dist/slides` CI step that Step 4 of the runbook activates)
    - 05-01 (Plan 01 Task 3 added CLAUDE.md forward-refs at lines 318/321 — this plan materializes the target files)
  provides:
    - docs/slides-onboarding.md (end-to-end runbook, 240 LOC, 10 H2 sections)
    - ~/.claude/skills/vv-slidev/references/publish-to-vedmich-dev.md (short SSoT pointer, 46 LOC)
    - vault-mirror at 85.20-Claude-Code/skills/vv-slidev/references/publish-to-vedmich-dev.md (byte-identical)
    - vault-commit `8d88cfc` ("vault backup: skill vv-slidev — add publish-to-vedmich-dev.md reference")
  affects:
    - 05-04-PLAN.md (SLIDES-06 + CONTENT-04 now shippable; Plan 04 flips the checkboxes)
tech-stack:
  added: []
  patterns:
    - "Runbook-style doc analog cloned from diagrams-source/README.md (H1 + *** dividers + bold-prefixed gotchas + Further reading tail)"
    - "Short SSoT pointer pattern for skill references (D-10): opening paragraph declares external SSoT, body is TL;DR + quick commands, drift bounded by <=55 LOC cap"
    - "Three-way sync per CLAUDE.md: live -> vault mirror via explicit-file cp (no cp -R trailing-slash hazard), then vault commit in its own repo"
key-files:
  created:
    - docs/slides-onboarding.md (240 LOC, 10 H2 sections, zero hex literals)
    - /Users/viktor/.claude/skills/vv-slidev/references/publish-to-vedmich-dev.md (46 LOC, not in vedmich.dev git)
    - /Users/viktor/Documents/ViktorVedmich/80-Resources/85-Scripts/85.20-Claude-Code/skills/vv-slidev/references/publish-to-vedmich-dev.md (46 LOC, committed to vault repo at 8d88cfc)
  modified: []
decisions:
  - "Runbook hit 240 LOC vs plan's 'expected ~170-210 lines' target — overshoot is ~15% over upper bound. All overshoot lives in Gotchas #6 (three-way-sync cp -R explanation, added per plan spec) and #7 (D-03 slides: retention nuance, added per plan spec). Both sections are load-bearing; trimming would drop required literal strings. LOC ceiling was only 'target' not 'max', so retained verbatim."
  - "10 H2 sections vs plan's >=8 target — When-to-use + Prerequisites + 6 Steps + Gotchas + Further reading = 10. Matches plan's expected 9 H2 (plan counted '9, well above >=8') plus an extra 'Step 4: Activate the whitelist' sub-header (not counted by plan). Exceeds minimum."
  - "Skill reference hit exactly 46 LOC (inside [30,55] target). Kept plan's verbatim content; only delta is 'full 10-H2-section runbook' instead of 'full 9-H2-section runbook' in the Full workflow section, matching the actual runbook section count shipped."
  - "Three-way sync used explicit-file cp form (Pitfall 5 mitigation) — no cp -R trailing-slash hazard possible. diff -q verified byte-identical before vault commit; LOC parity 46/46."
  - "Vault commit landed on main at 8d88cfc. NOT pushed per CLAUDE.md spec (vault is personal git repo with its own rhythm; SessionEnd hook handles sync)."
metrics:
  duration: "3m19s"
  tasks: 3
  files-changed-project: 1
  files-changed-live-skill: 1
  files-changed-vault: 1
  commits-project: 1
  commits-vault: 1
  completed: 2026-05-07
---

# Phase 05 Plan 03: Docs + Skill Reference Summary

**Plan 05-03** ships the documentation half of Phase 5: a 240-line end-to-end runbook at `docs/slides-onboarding.md` describing how to author, build, push, submodule-pump, and CI-whitelist a Slidev deck for publication at `vedmich.dev/slides/<slug>/`, plus a 46-line companion skill reference at `~/.claude/skills/vv-slidev/references/publish-to-vedmich-dev.md` that opens with an explicit "single source of truth" declaration pointing at the docs/ runbook — the deliberately-short skill reference (D-10) bounds drift risk by replicating only a TL;DR and quick-commands block, with all context deferred to docs/. Three-way sync to the vault mirror completed via explicit-file cp (avoiding the Pitfall 5 trailing-slash hazard), committed in the vault repo at `8d88cfc` with CLAUDE.md's prescribed message format.

## Commits

### vedmich.dev project (main branch)

| Task | Commit    | Type       | Description                                                    |
| ---- | --------- | ---------- | -------------------------------------------------------------- |
| 1    | `de9903e` | `docs(05-03)` | Add docs/slides-onboarding.md end-to-end runbook           |

Tasks 2 and 3 ship files OUTSIDE the vedmich.dev repo (live skill at `~/.claude/skills/`, vault at `~/Documents/ViktorVedmich/`). Per CLAUDE.md's three-way-sync rule, these are not committed in the vedmich.dev repo.

### Vault repo (~/Documents/ViktorVedmich, main branch)

| Task | Commit    | Message                                                                        |
| ---- | --------- | ------------------------------------------------------------------------------ |
| 3    | `8d88cfc` | vault backup: skill vv-slidev — add publish-to-vedmich-dev.md reference       |

### Live skill (~/.claude/skills/vv-slidev/)

Not a git repo — the live skill file was written directly via the Write tool. This is what Claude loads at skill-invocation time; the vault acts as the committed backup.

## What shipped

### Task 1: docs/slides-onboarding.md (240 LOC, 10 H2 sections)

Structural outline matches `diagrams-source/README.md` analog verbatim — H1 + 1-paragraph intro + `***` dividers between H2 sections + bold-prefixed gotcha headers + Further reading tail with cross-links to related artifacts.

H2 section inventory (10 sections, all present):

1. `## When to use this flow` — publishing scenarios + alternative pointer to `vv-slidev/references/deployment.md` for gh-pages-only flow
2. `## Prerequisites` — three repo checkouts + `git submodule status` verify + Plan 01 Task 2 landed-check
3. `## Step 1: Build the deck with --base /slides/<slug>/` — pnpm slidev build command with load-bearing trailing-slash note + legacy-vs-new base path contrast
4. `## Step 2: Publish dist/ to vedmichv/slidev:gh-pages` — git commands for gh-pages artifact repo side + CNAME/index/404 untouched invariant
5. `## Step 3: Pump the submodule in vedmich.dev` — `git submodule update --remote --merge slidev` + `git submodule status` SHA-match verify
6. `## Step 4: Activate the whitelist in .github/workflows/deploy.yml` — three sub-steps (uncomment, edit slug list, stage+commit) + whitelist-only invariant
7. `## Step 5: (Optional) Un-draft the MDX entry` — both-locale flip + optional `slides:` field removal for fallback to computed path
8. `## Step 6: Verify` — local build preview + push+deploy + curl probes + Vue Router deep-link browser check
9. `## Gotchas` — 7 numbered items (see below)
10. `## Further reading` — 9 bullet cross-links

The 7 Gotchas (named per plan's acceptance criteria):

1. **`--base` flag requires a trailing slash** — Slidev hosting docs invariant
2. **Never copy 404.html, CNAME, or index.html from slidev/ root** — D-13 anti-pattern with 3-way rationale
3. **Never add `@slidev/cli`, `vue`, or `slidev-theme-*` to vedmich.dev/package.json** — Pitfall 3 regression guard
4. **After `git checkout <branch>`, always run `git submodule update --init --recursive`** — Pitfall 7 branch-switch submodule sync
5. **`.gitmodules` MUST have `branch = gh-pages`** — Pitfall 4 with `git config -f` verify command
6. **Three-way sync gotcha — `cp -R` trailing slash** — CLAUDE.md invariant with explicit-file-form alternative
7. **Ghost decks retain `slides:` frontmatter URLs per D-03** — D-14 scope exemption for `src/content/presentations/` + `data.slides ??` fallback

Invariants honored:
- Zero hex literals (grep: 0 matches against `#[0-9a-fA-F]{3,6}`)
- All plan-required literal strings present: `slidev build`, `--base /slides/`, `git submodule update --remote --merge slidev`, `cp -r slidev/`, `404.html`, `CNAME`, `@slidev/cli`, `branch = gh-pages`
- 10 `***` dividers between H2 sections (plan required `^\*\*\*$` line present)
- `docs/` directory was created via `mkdir -p docs/` before file write — no pre-existing docs/ content affected

### Task 2: Live skill reference (46 LOC)

File: `/Users/viktor/.claude/skills/vv-slidev/references/publish-to-vedmich-dev.md` (not in vedmich.dev git).

Target per D-10: 30-50 LOC short pointer, NOT a full mirror. Actual: 46 LOC (mid-band, leaves slack for future micro-edits without exceeding the 55 LOC acceptance ceiling).

Content structure:
- H1: `# Publishing a deck to vedmich.dev/slides/<slug>/`
- Opening paragraph: explicit "single source of truth" declaration pointing at `docs/slides-onboarding.md` in `vedmichv/vedmich.dev` repo (drift-prevention invariant per D-10 threat model)
- Complementary-reference paragraph: cross-refs `references/deployment.md` (gh-pages side) vs this file (vedmich.dev side)
- `## TL;DR` — 5-line numbered summary of the flow
- `## Quick commands` — 4-block fenced bash for Steps 1-4 of the runbook
- `## Full workflow` — single-line pointer back to the docs/ runbook with accurate "10-H2-section" count
- `## Related skill references` — 2-bullet cross-refs to sibling references

4 H2 sections total (plan required ≥3).

SKILL.md was NOT modified — the skill does not maintain an explicit references inventory (all references in `references/` are auto-discovered via the skill-loader glob). No deviation needed per plan's read_first note.

### Task 3: Vault mirror + vault commit

Operation A (mirror): `cp` from live skill path to vault path using the explicit-file form (plan-preferred, Pitfall 5 mitigation). `diff -q` confirmed byte-identical; `wc -l` confirmed LOC parity (46/46).

Vault mirror path: `/Users/viktor/Documents/ViktorVedmich/80-Resources/85-Scripts/85.20-Claude-Code/skills/vv-slidev/references/publish-to-vedmich-dev.md`

Operation B (vault commit): executed inside `~/Documents/ViktorVedmich/` (separate git repo, own `main` branch). Commit message exactly matches CLAUDE.md spec:

```
vault backup: skill vv-slidev — add publish-to-vedmich-dev.md reference
```

Vault commit SHA: `8d88cfc`. Vault NOT pushed per CLAUDE.md spec (personal rhythm, SessionEnd hook handles remote sync).

Live skill file mtime/LOC unchanged between Task 2 end-state and Task 3 end-state — Operation A is one-way copy; no edits leaked back into live from the mirror step.

## Verification (plan's success criteria)

| Criterion                                                                                              | Result                   |
| ------------------------------------------------------------------------------------------------------ | ------------------------ |
| SLIDES-06: `docs/slides-onboarding.md` exists                                                          | ✓ PASS                   |
| SLIDES-06: Runbook LOC >= 150                                                                          | ✓ PASS (240 LOC)         |
| SLIDES-06: H2 count >= 8                                                                               | ✓ PASS (10 H2)           |
| SLIDES-06: 6 numbered Steps present                                                                    | ✓ PASS (Steps 1-6)       |
| SLIDES-06: 7 Gotchas present with named pitfalls                                                       | ✓ PASS                   |
| SLIDES-06: `--base /slides/<slug>/` (trailing-slash requirement) documented                            | ✓ PASS                   |
| SLIDES-06: D-13 anti-pattern named (no 404.html/CNAME/index.html copy)                                 | ✓ PASS (Gotcha 2)        |
| SLIDES-06: Pitfall 3 anti-pattern named (no @slidev/cli in package.json)                               | ✓ PASS (Gotcha 3)        |
| SLIDES-06: Pitfall 4 invariant named (`branch = gh-pages`)                                             | ✓ PASS (Gotcha 5)        |
| SLIDES-06: Pitfall 5 gotcha named (cp -R trailing-slash)                                               | ✓ PASS (Gotcha 6)        |
| SLIDES-06: Pitfall 7 invariant named (branch-switch submodule sync)                                    | ✓ PASS (Gotcha 4)        |
| SLIDES-06: D-03 slides: retention nuance named                                                         | ✓ PASS (Gotcha 7)        |
| SLIDES-06: Zero hex literals                                                                           | ✓ PASS (grep returns 0)  |
| CONTENT-04: Live skill at `~/.claude/skills/vv-slidev/references/publish-to-vedmich-dev.md` exists     | ✓ PASS                   |
| CONTENT-04: Live skill LOC 30-55                                                                       | ✓ PASS (46 LOC)          |
| CONTENT-04: Live skill opens with SSoT declaration                                                     | ✓ PASS                   |
| CONTENT-04: Live skill has `## TL;DR` + `## Quick commands` sections                                   | ✓ PASS                   |
| CONTENT-04: Live skill includes `--base /slides/` in commands                                          | ✓ PASS                   |
| CONTENT-04: Live skill cross-refs `references/deployment.md`                                           | ✓ PASS                   |
| CONTENT-04: Vault mirror exists at 85.20-Claude-Code/skills/vv-slidev/references/                      | ✓ PASS                   |
| CONTENT-04: Vault mirror byte-identical to live (diff -q returns empty)                                | ✓ PASS                   |
| CONTENT-04: Vault commit exists with exact CLAUDE.md-prescribed message                                | ✓ PASS (`8d88cfc`)       |
| CONTENT-04: Vault commit is HEAD of vault repo                                                         | ✓ PASS                   |
| CONTENT-04: Vault file committed (not staged, not untracked)                                           | ✓ PASS                   |
| CLAUDE.md forward-refs (lines 318/321 from Plan 01 Task 3) now point at real files                     | ✓ PASS                   |
| `npm run build` exits 0 (sanity regression)                                                            | ✓ PASS (32 pages, 2.28s) |

## Threat flags

No new security-relevant surface introduced. Documentation-only changes + one skill reference + one vault mirror. T-05-03 (documentation drift) addressed per plan's mitigation: skill reference LOC gate <=55 satisfied (46 LOC), opening SSoT declaration present, drift-bounded content limited to TL;DR + commands (all context in docs/).

## Deviations from Plan

### Auto-fixed Issues

None — no bugs encountered during execution, no missing critical functionality discovered, no blocking issues. All three tasks executed exactly as specified. The only minor deviations are:

**1. [Rule 1 — LOC overshoot, intentional] docs/slides-onboarding.md hit 240 LOC vs plan's "expected ~170-210 lines"**

- **Found during:** Task 1 post-write verification
- **Issue:** Final LOC is ~14% over the upper bound of the plan's expected range.
- **Fix:** None — the overshoot is entirely inside Gotchas 6 and 7, both of which the plan explicitly specifies as content the executor MUST write (plan lists both verbatim in its `<action>` block). The expected LOC was a target, not a hard cap; the plan's acceptance gate is `>= 150`, which 240 comfortably satisfies. Trimming would require dropping plan-required literal strings.
- **Classification:** Plan-directed content; no change to the plan's requirements, just honest reporting of actual LOC.
- **Commit:** N/A (observation only)

**2. [Rule 1 — H2 count, plan pattern] 10 H2 sections vs plan's "expected 9"**

- **Found during:** Task 1 post-write verification
- **Issue:** Plan text said "Intro not counted; When-to-use + Prerequisites + 6 Steps + Gotchas + Further reading = 9" but actual grep returns 10.
- **Fix:** Verified count — the plan's arithmetic is 1+1+6+1+1 = 10, not 9 (plan's narrative was off by one). My grep reports 10, which matches the plan's list. Acceptance gate is `>= 8` and both interpretations satisfy it.
- **Classification:** Plan specification quirk — off-by-one in the narrative description; the shipped count matches the actual list the plan enumerates.
- **Commit:** N/A (observation only)

### Auth Gates

None — no authentication required. All three tasks are local file operations + one git commit in each of two repos (vedmich.dev + vault). Both repos are local to Viktor's machine, no remote credentials touched.

### Architecture Changes

None — plan executed exactly as written. All D-decisions honored: D-06 (submodule pump commands documented), D-08 (source/dist split explained), D-09 (docs location = docs/slides-onboarding.md), D-10 (skill reference is short pointer, not full mirror), D-13 (no-root-copy anti-pattern surfaced in Gotcha 2), D-17 (SLIDES-06 + CONTENT-04 mapped as shippable for Plan 04 to close).

## Metrics

- **Duration:** 3m19s (199 s wall clock)
- **Tasks completed:** 3 / 3
- **Files created (project):** 1 (`docs/slides-onboarding.md`)
- **Files created (live skill):** 1 (`~/.claude/skills/vv-slidev/references/publish-to-vedmich-dev.md`)
- **Files created (vault mirror):** 1 (mirror path in 85.20-Claude-Code/)
- **Commits (project):** 1 (`de9903e`, `docs(05-03):` format)
- **Commits (vault):** 1 (`8d88cfc`, CLAUDE.md-prescribed format)
- **Commits (live skill):** 0 (not a git repo)
- **Runbook LOC:** 240 (vs target 150-200; +20% over upper bound in service of plan-required Gotcha content)
- **Skill reference LOC:** 46 (inside [30,55] acceptance band)
- **Vault diff vs live:** empty (byte-identical)
- **Build regression:** none (`npm run build` → 32 pages, 2.28s, matches baseline)

## Next

- **Plan 04** (Wave 3, sequential after Plans 01-03): requirements + traceability close for Phase 5. Will:
  - Flip SLIDES-01 + SLIDES-02 (Plan 01 shipped), SLIDES-04 (Plan 02 shipped), SLIDES-06 + CONTENT-04 (this plan shipped) checkboxes to `[x]` in `.planning/REQUIREMENTS.md`.
  - Annotate SLIDES-03 + SLIDES-05 as deferred per D-17 in the same file.
  - Mark `§Phase 5: Slidev Integration` as `✅ Shipped 2026-05-07` in `.planning/ROADMAP.md`.
  - Update `.planning/STATE.md` current position to post-Phase-5.

- **Runbook activation:** no runbook-activation happens in Phase 5. When Viktor decides to migrate a real deck (user-driven, no Phase 6 dependency), he opens `docs/slides-onboarding.md` and follows Steps 1-6. Claude can load the short skill reference when invoked with `/vv-slidev` or similar triggers for quick-command lookup.

## Self-Check: PASSED

- [x] `docs/slides-onboarding.md` exists (FOUND)
- [x] `/Users/viktor/.claude/skills/vv-slidev/references/publish-to-vedmich-dev.md` exists (FOUND)
- [x] `/Users/viktor/Documents/ViktorVedmich/80-Resources/85-Scripts/85.20-Claude-Code/skills/vv-slidev/references/publish-to-vedmich-dev.md` exists (FOUND)
- [x] Vault mirror byte-identical to live skill (diff returned empty)
- [x] Project commit `de9903e` exists on main (FOUND via `git log --oneline`)
- [x] Vault commit `8d88cfc` exists on vault main (FOUND via `git log --oneline` inside ~/Documents/ViktorVedmich/)
- [x] Vault commit message exactly matches CLAUDE.md spec (verified via `git log -1 --format='%s' -- <vault-path>`)
- [x] CLAUDE.md line 318 (`docs/slides-onboarding.md`) now points at a real file (FOUND)
- [x] CLAUDE.md line 321 (`publish-to-vedmich-dev.md`) now points at a real file (FOUND)
- [x] `npm run build` green, 32 pages, 2.28s (FOUND)
- [x] No hex literals in runbook (grep returns 0)
- [x] No pending changes in project repo after all three tasks (git status --short is empty at SUMMARY time, will stage SUMMARY.md next)
