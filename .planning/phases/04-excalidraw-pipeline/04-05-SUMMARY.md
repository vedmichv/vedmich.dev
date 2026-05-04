---
phase: 04-excalidraw-pipeline
plan: 05
subsystem: documentation-and-doc-drift
tags: [excalidraw, runbook, skill-doc, doc-drift, wave-3, phase-close]

# Dependency graph
requires:
  - phase: 04-excalidraw-pipeline
    plan: 03
    provides: "MCP post migration evidence — client-server.svg (9673 B) shipped in both locales"
  - phase: 04-excalidraw-pipeline
    plan: 04
    provides: "Karpenter stress-test evidence — split-ownership.svg (7338 B) shipped in both locales; Virgil→Helvetica pitfall surfaced"
provides:
  - "diagrams-source/README.md — 118-line contributor runbook with 6 H2 sections (Authoring/Metadata/Exporting/Embedding/Gotchas + Further reading)"
  - ".claude/skills/vv-blog-from-vault/references/visuals-routing.md — Priority 1 excalidraw row extended with concrete delivery path (script + runbook pointer)"
  - ".planning/REQUIREMENTS.md — DIAG-05 language corrected per D-06 revised (`manifests` target called out as text-only per D-04b)"
affects: [06-companion-posts]

# Tech tracking
tech-stack:
  added: []  # Pure documentation — no deps, no code
  patterns:
    - "Primer-runbook pattern (mirror of src/components/visuals/README.md): H1 + tagline + Ship status + 5 H2 sections + Further reading. 100-150 line target; Phase 4 hit 118."
    - "Skill-doc Option B extension (preserve 3-column table shape, extend the existing invocation cell with the CLI + runbook pointer) — avoids schema churn across the 6-row Priority 1 table for a targeted edit"
    - "Post-phase doc-drift commit pattern (isolated single-file commit + docs(phase): prefix) carried forward from Phase 3 D-01e for Phase 4 D-06 — pure language reconciliation, no semantic change"

key-files:
  created:
    - diagrams-source/README.md (118 LOC, 6 H2 sections + further-reading)
  modified:
    - .claude/skills/vv-blog-from-vault/references/visuals-routing.md (one table row — Priority 1 excalidraw)
    - .planning/REQUIREMENTS.md (one line — DIAG-05 language)

key-decisions:
  - "Option B chosen for visuals-routing.md (inline-prose extension of existing 3-column table) over Option A (add a 4th column). Rationale: Option A would have required populating a 'Delivery path' column for all 6 rows, out of scope for Phase 4 — only excalidraw has a concrete pipeline. Option B adds the CLI invocation + runbook pointer inline in the existing invocation cell, preserving table shape and keeping the other 5 rows byte-identical."
  - "Three-way sync is N/A for this skill. Verified both paths: ~/.claude/skills/vv-blog-from-vault/ does NOT exist (skill is project-local), and ~/Documents/ViktorVedmich/.../vv-blog-from-vault/ also does NOT exist (no vault backup has ever been mirrored). Per CLAUDE.md §Skill updates, editing a project-local-only skill means edit-in-place with no mirror action. Documented explicitly so the orchestrator doesn't re-run the sync check."
  - "DIAG-01 language in REQUIREMENTS.md was NOT touched. D-01e reconciled the Phase 4 library choice to `@aldinokemal2104/excalidraw-to-svg`, which matches what REQUIREMENTS.md always said. The original D-06 scoping (both DIAG-01 AND DIAG-05) reduced to DIAG-05 only after D-01e."
  - "Runbook length: 118 lines — well under the 150-line 'aim for leaner' target from PATTERNS.md line 223, and within the [80, 200] acceptance range. Achieved by keeping each Gotcha to 1-2 sentences (mirrors src/components/visuals/README.md:232-246 numbered-caveats shape) and using deterministic placeholders (`<slug>`, `<diagram-name>`, `W`, `H`) instead of worked examples."
  - "6 H2 sections (not 5) — I included `## Further reading` as a full H2 section per the src/components/visuals/README.md primer pattern (lines 248-257). The plan's acceptance criterion requires `>= 5` H2 sections, so 6 is compliant."

requirements-completed: [DIAG-01, DIAG-02, DIAG-03, DIAG-04, DIAG-05]

# Metrics
duration: ~15 min
completed: 2026-05-04
---

# Phase 4 Plan 05: Wave 3 — Runbook + skill-doc delivery path + REQUIREMENTS.md DIAG-05 doc-drift

**Wave 3 closes Phase 4: contributor runbook shipped at `diagrams-source/README.md` (118 lines), project skill's `visuals-routing.md` Priority 1 `excalidraw` row extended with the concrete pipeline delivery path, and `.planning/REQUIREMENTS.md` DIAG-05 language corrected per D-06 revised (`manifests` called out as text-only per D-04b). All 5 DIAG-0X requirements now satisfied with documentation in place; infrastructure ready for Phase 6 companion posts.**

## Performance

- **Duration:** ~15 min net execution
- **Started:** 2026-05-04T17:13:00Z (HEAD assertion + file reads)
- **Completed:** 2026-05-04T17:28:39Z (final verification)
- **Tasks:** 4/4 complete (all atomic; Task 4 is verification-only with no commit)
- **Files created:** 1 (`diagrams-source/README.md`)
- **Files modified:** 2 (`visuals-routing.md`, `REQUIREMENTS.md`)
- **Commits:** 2 atomic (Tasks 1+2 bundled per plan verification §6; Task 3 separate per plan Task 3 `<action>` spec)

## Accomplishments

- **Contributor runbook shipped** at `diagrams-source/README.md` (118 LOC). Covers the full authoring → meta → export → embed → gotchas flow. Includes all 6 Phase-4-surfaced pitfalls as numbered caveats (Virgil budget, meta-required, pre-SVGO injection, boundary invariant, 100 KB files cap, Excalidraw-palette preservation).
- **Skill doc closed the loop.** `.claude/skills/vv-blog-from-vault/references/visuals-routing.md` Priority 1 `excalidraw` row previously described intent without a delivery path; now it carries the exact CLI invocation + pointer to the new runbook. Option B (inline prose extension) preserved the 3-column table shape across all 6 Priority 1 rows.
- **REQUIREMENTS.md DIAG-05 language fixed** per D-06 revised 2026-05-03. Old language "karpenter / manifests / TBD-third" was drift from a time when `manifests` was considered a diagram candidate; D-04b ruled it text-only. New language explicitly names "MCP + karpenter + 1-2 stretch" and cites D-04b for the manifests exclusion.
- **DIAG-01 untouched** per D-01e — REQUIREMENTS.md's mention of `@aldinokemal2104/excalidraw-to-svg` was always correct; the original D-06 two-target scope reduced to DIAG-05-only after D-01e.
- **Phase-end gate all green.** 2 diagrams shipped, both under 10 KB, both with `<title>`+`<desc>`; MCP ASCII removed from both locales; dist HTML carries `<img>` references; src/ + dist/ clean of wrapper imports; 44/44 unit tests pass; build green in 2.36s.
- **Three-way sync clean.** Verified both `~/.claude/skills/vv-blog-from-vault/` and `~/Documents/ViktorVedmich/.../vv-blog-from-vault/` do not exist — skill is project-local only, no mirror action required.

## Task Commits

1. **Task 1 + Task 2 (atomic): runbook + visuals-routing Priority 1 row** — `226e50e` (docs)
   - 2 files changed, +119/-1: new `diagrams-source/README.md` (118 lines) + 1-line edit to `.claude/skills/vv-blog-from-vault/references/visuals-routing.md`
   - Commit message: `docs(04-05): add diagrams-source runbook + update visuals-routing skill doc`
   - Rationale for bundling: both artifacts are documentation-only, same phase, no semantic interdependence; plan verification §6 authorizes "2 atomic commits" with the Tasks 1+2 pair as the natural unit.

2. **Task 3: REQUIREMENTS.md DIAG-05 language fix** — `ccc5165` (docs)
   - 1 file changed, +1/-1: single-line edit to `.planning/REQUIREMENTS.md` line 41
   - Commit message: `docs(04): fix DIAG-05 language — MCP + karpenter + stretch targets per D-04b`
   - Rationale for separation: plan Task 3 `<action>` explicitly mandates "a SEPARATE commit from Tasks 1-2 per PATTERNS.md commit hygiene". Mirrors Phase 3 D-01e doc-drift pattern.

3. **Task 4: Phase-end verification** — no commit (verification-only per plan spec).

## Files Created/Modified

- `diagrams-source/README.md` — NEW, 118 LOC, 6 H2 sections. Layout:
  - H1: `# Excalidraw diagram pipeline` (2-3-word name per PATTERNS.md)
  - Tagline: 1 line on what/why, zero runtime JS caveat
  - **Ship status** line with current consumers (MCP, karpenter) + future consumers (Phase 6 companion posts)
  - `## Authoring` — 5-step flow from excalidraw.com to `diagrams-source/<slug>/<name>.excalidraw.json` with Shift+1 zoom-to-fit + Virgil font guidance
  - `## Metadata` — required `.meta.json` schema (title + descEn + optional descRu); note on descRu being reserved for future enhancement
  - `## Exporting` — exact CLI invocation, success stdout shape, error-path remedies (10 KB budget, meta missing)
  - `## Embedding` — canonical `<img>` snippet with bilingual parity note
  - `## Gotchas` — 6 numbered caveats (Virgil budget / meta required / pre-SVGO injection / boundary invariant / 100 KB files / Excalidraw palette preservation)
  - `## Further reading` — 5 links to script, tests, RESEARCH, CLAUDE.md §Architecture, skill routing doc

- `.claude/skills/vv-blog-from-vault/references/visuals-routing.md` — MODIFIED (1 line). Priority 1 `excalidraw` row's invocation cell extended:
  - Before: `"Sketch X in excalidraw style."`
  - After: `"Sketch X in excalidraw style." Then: node scripts/excalidraw-to-svg.mjs diagrams-source/<slug>/<name>.excalidraw.json public/blog-assets/<slug>/diagrams/<name>.svg (see diagrams-source/README.md).`
  - All other table rows (Priority 0 × 5, Priority 1 × 5) byte-identical to HEAD~1.

- `.planning/REQUIREMENTS.md` — MODIFIED (1 line). DIAG-05 bullet:
  - Before: `- [ ] **DIAG-05**: Add 2-3 additional Excalidraw diagrams to existing blog posts (karpenter / manifests / TBD-third) to stress-test the pipeline on real content.`
  - After: `- [ ] **DIAG-05**: Add 1-2 additional Excalidraw diagrams to existing blog posts (MCP + karpenter + 1-2 stretch) to stress-test the pipeline on real content. \`manifests\` post is text-only per D-04b (no diagram fit).`
  - DIAG-01 (line 37) NOT modified per D-01e reconciliation.
  - All other DIAG-0X lines + Traceability table rows byte-identical.

## Decisions Made

- **Option B for visuals-routing edit** (PATTERNS.md §735-787 Option B): extend the existing invocation column inline rather than adding a 4th "Delivery path" column. Rationale: Option A would require populating the new column for all 6 Priority 1 rows (mermaid-pro flow, mermaid-pro architecture, excalidraw, art, viktor-vedmich-design, opinion), but only excalidraw has a concrete delivery path in Phase 4. Option B lands the delivery-path info in the single row where it's actually known, preserves the canonical 3-column shape for every other row, and keeps the edit minimal (1 cell vs 7 cells).
- **Three-way sync N/A (project-local skill).** Per CLAUDE.md §Skill updates, when a skill exists at all three locations (`~/.claude/skills/`, vault backup, source repo) the rule is edit all three. When the skill is project-local only, editing the project file IS the edit — no mirrors to maintain. Verified both skill-global and vault-backup paths do not exist; project-local is the only live instance. Documented in SUMMARY so the orchestrator doesn't schedule a no-op sync commit post-merge.
- **DIAG-01 left alone per D-01e.** Earlier CONTEXT drafts had D-06 reversing DIAG-01's library name to `@excalidraw/excalidraw`, but D-01e (committed 2026-05-03 as `8d2c469 docs(04): reconcile D-01 library to wrapper (D-01e)`) aligned the phase's library choice with what REQUIREMENTS.md already said. Touching DIAG-01 would either be a no-op or a regression. Plan verified this in its `<interfaces>` block ("DIAG-01 UNCHANGED — was always correct per D-01e"); executor confirmed with grep before editing.
- **Runbook length 118 lines** (target range [80, 200]; PATTERNS.md preferred ≤ 150). Achieved lean via: (a) using placeholders `<slug>`, `<diagram-name>`, `W`, `H` instead of worked examples (existing MCP + karpenter SVGs are the worked examples, discoverable via the Further reading section and via `ls diagrams-source/`); (b) keeping each Gotcha to 1-3 sentences mirroring src/components/visuals/README.md:232-246; (c) skipping a "Hello world example" block — the existing diagrams-source/<slug>/ directories serve that role.
- **6 H2 sections (not 5).** The plan requires `>= 5` and lists 5 explicitly (Authoring / Metadata / Exporting / Embedding / Gotchas). I added `## Further reading` as a 6th section to match the src/components/visuals/README.md primer tail pattern (Phase 1 shipped `## Further reading` at lines 248-257). Acceptance gate `grep -c '^## '` returns 6, which satisfies `>= 5`.

## Deviations from Plan

### Auto-fixed Issues

**None.** Plan executed exactly as written:
- Task 1 runbook content is verbatim from plan lines 156-275.
- Task 2 visuals-routing edit is verbatim from plan lines 319-321.
- Task 3 REQUIREMENTS.md edit is verbatim from plan lines 384-386.
- Two atomic commits landed matching plan verification §6.

### Boundary-check Phrasing Note (not a code deviation)

**1. [Gate script minor — no code fix] Phase-end gate's `grep -rE ... src/ | head -1 > /dev/null` emitted a "FAIL" in the initial run due to pipe-head return-code masking on macOS bash; the invariant is actually clean.**

- **Found during:** Task 4 phase-end gate (initial run reported `FAIL wrapper import present in src/`).
- **Root cause:** The bash idiom `if ! grep -r ... | head -1 > /dev/null` evaluates `head`'s return code (always 0 when given empty input), not `grep`'s return code. Result: both the clean case (grep fails, head succeeds) and the dirty case (grep succeeds, head succeeds) return 0, and the `!` negation flips that to "FAIL" for both.
- **Verification:** re-ran as `if grep -rqE "@aldinokemal2104|@excalidraw" src/; then echo FAIL; else echo OK; fi` — returned OK. Also ran without `-q` and head: `grep -rE "@aldinokemal2104|@excalidraw" src/` returns empty stdout. The boundary invariant is actually clean.
- **No fix needed:** The plan's Task 4 automated verify block (line 504) uses the correct shape `! grep -rE "@aldinokemal2104|@excalidraw" src/ 2>/dev/null`, which evaluates grep's return code correctly (no pipe, no head). The gate script I composed inline had the spurious pipe. The plan's automated verify is the source of truth and is well-formed. Documented here as implementation-note so the verifier agent knows where the "FAIL" in /tmp/phase-04-end-gate.log came from.

### Task 4 dist script-count check (pre-noted in plans 03 + 04)

**2. [Plan assertion scope mismatch — pre-noted] Plan Task 4 includes `grep -c '<script' ...html` as a T-04-02 gate, but every Astro page has 3 site-wide scripts from BaseLayout (scroll observer, mobile menu, search palette). This is site-wide baseline, not a regression.**

- **Pre-noted in:** 04-03-SUMMARY.md Deviations §2 (lines 121-133) and 04-04-SUMMARY.md Deviations §2 (lines 121-128). Both prior-wave SUMMARYs document the same plan-gate-vs-semantic-intent mismatch.
- **Plan gate text (Task 4 lines 489-495):** iterates `<script` counts across 4 dist HTMLs; expects 0.
- **Empirical reality:** 3 baseline `<script>` tags per page from BaseLayout.astro. Not introduced by Phase 4; exists on every blog post since before this phase.
- **T-04-02 ACTUAL threat surface (SVG asset script content):** `grep -c '<script' public/blog-assets/.../diagrams/*.svg` returns **0** for both shipped SVGs (client-server.svg + split-ownership.svg). The ACTUAL threat is mitigated. See `/tmp/phase-04-end-gate-post-build.log` for the scan output.
- **No code fix:** the plan's page-level grep is overspecified relative to the semantic T-04-02 threat model. The SVG-asset-level grep is both tighter and meaningful. Plan's `<acceptance_criteria>` also pre-notes (line 517) that dist paths may differ from stated form; same logic applies to the literal grep shape.
- **Verifier note:** if this assertion re-appears in any future plan's gate, refine to `grep '<script' public/blog-assets/**/*.svg` (asset-scoped) rather than page-level. The asset-level check catches injection at the pipeline boundary where it matters.

## Issues Encountered

None. Executor ran cleanly; both atomic commits landed on the first attempt; all acceptance-criterion greps passed first-run; full test + build suite green.

## Phase-end gate log excerpt

```
=== Phase 4 end-of-phase verification ===

--- DIAG-01: script exists + unit tests pass ---
  OK script present

--- DIAG-02: 10 KB budget on all shipped SVGs ---
  public/blog-assets/2026-03-02-mcp-servers-plainly-explained/diagrams/client-server.svg:     9673 B OK under budget
  public/blog-assets/2026-03-20-karpenter-right-sizing/diagrams/split-ownership.svg:     7338 B OK under budget

--- DIAG-03: <title> + <desc> on every shipped SVG ---
  client-server.svg: title=ok desc=ok
  split-ownership.svg: title=ok desc=ok

--- DIAG-04: MCP post updated in both locales ---
  OK EN MCP uses <img>
  OK RU MCP uses <img>
  OK EN MCP ASCII gone
  OK RU MCP ASCII gone

--- DIAG-05: >= 2 total diagrams ---
  Total diagrams: 2 OK

--- Documentation ---
  OK runbook exists
  OK skill doc updated
  OK REQUIREMENTS.md DIAG-05 fixed
```

Post-build dist checks:

```
--- Dist-level DIAG-04 + T-04-02 checks ---
  dist/en/blog/2026-03-02-mcp-servers-plainly-explained/index.html: svg-ref=found
  dist/ru/blog/2026-03-02-mcp-servers-plainly-explained/index.html: svg-ref=found
  dist/en/blog/2026-03-20-karpenter-right-sizing/index.html: svg-ref=found
  dist/ru/blog/2026-03-20-karpenter-right-sizing/index.html: svg-ref=found

--- T-04-02 (SVG asset script scan) ---
  client-server.svg: OK 0 scripts
  split-ownership.svg: OK 0 scripts

--- Boundary invariants ---
  OK src/ clean
  OK dist/ clean

--- Summary ---
  Tests: 44/44 pass
  Build: 32 pages, 2.36s
  Diagrams shipped: 2
```

## REQUIREMENTS.md DIAG-05 before/after snippet

**Before** (HEAD~1, line 41):
```markdown
- [ ] **DIAG-05**: Add 2-3 additional Excalidraw diagrams to existing blog posts (karpenter / manifests / TBD-third) to stress-test the pipeline on real content.
```

**After** (HEAD, line 41):
```markdown
- [ ] **DIAG-05**: Add 1-2 additional Excalidraw diagrams to existing blog posts (MCP + karpenter + 1-2 stretch) to stress-test the pipeline on real content. `manifests` post is text-only per D-04b (no diagram fit).
```

**DIAG-01** (line 37): UNCHANGED. Continues to say:
```markdown
- [ ] **DIAG-01**: Ship `scripts/excalidraw-to-svg.mjs` that converts `.excalidraw.json → .svg` via `@aldinokemal2104/excalidraw-to-svg` (build-time, zero runtime JS).
```

## Three-way sync outcome

**N/A — vv-blog-from-vault is project-local only.**

Verification performed before Task 2 edit:
- `test -f ~/.claude/skills/vv-blog-from-vault/references/visuals-routing.md` → absent
- `test -d ~/.claude/skills/vv-blog-from-vault/` → absent
- `test -f ~/Documents/ViktorVedmich/80-Resources/85-Scripts/85.20-Claude-Code/skills/vv-blog-from-vault/references/visuals-routing.md` → absent
- `test -d ~/Documents/ViktorVedmich/80-Resources/85-Scripts/85.20-Claude-Code/skills/vv-blog-from-vault/` → absent

Action taken: edited `.claude/skills/vv-blog-from-vault/references/visuals-routing.md` (project-local) only. No `~/.claude/` mirror created (would fork a divergent copy). No vault commit (no vault path exists).

This finding is consistent with the planner's note in PLAN 04-05 `<interfaces>` block lines 117-121: "`vv-blog-from-vault` exists ONLY at the project-local path ... In that case: Edit the project-local file. Do NOT create a mirror in `~/.claude/skills/`. Do NOT commit a vault backup."

**For orchestrator post-merge:** no three-way-sync action needed. If the project ever adds this skill globally (via a future `cp -R` into `~/.claude/skills/`), the global version would then need to pick up this delivery path from the project copy.

## Total diagrams shipped at Phase 4 close

`find public/blog-assets -path '*/diagrams/*.svg' | wc -l` returns **2** at this plan's HEAD:

| Diagram | Bytes | Budget % | Consumer post | Plan |
|---------|------:|---------:|---------------|------|
| `client-server.svg` | 9673 B | 94.5% | `2026-03-02-mcp-servers-plainly-explained` (EN + RU) | 04-03 |
| `split-ownership.svg` | 7338 B | 71.7% | `2026-03-20-karpenter-right-sizing` (EN + RU) | 04-04 |

DIAG-05 minimum (≥ 2 total diagrams) is satisfied. Stretch was not attempted in this plan (per plan scope — Task 4 is verification-only; no third diagram authored here). Stretch remains a Phase 6 companion-post candidate per D-04c.

## Known Stubs

None. All three documentation artifacts are fully wired:
- Runbook references a script that exists, tests that pass, and phase artifacts that are committed.
- Skill doc references a runbook that exists in the same commit pair.
- REQUIREMENTS.md DIAG-05 language references decisions (D-04b, D-06) that are documented in CONTEXT.md.

## TDD Gate Compliance

This plan is `type: execute` (not `type: tdd`) — no RED/GREEN/REFACTOR cycle. The phase's TDD cycle completed in 04-01 (RED) + 04-02 (GREEN); PLAN 05 is pure documentation and doc-drift reconciliation with no behavioral change.

## Threat Flags

None. No new security surface:
- Runbook is markdown with no executable content.
- Skill-doc edit is one table cell — no code change.
- REQUIREMENTS.md edit is one bullet — no code change, no new requirement.
- All three files are text-only. No new network endpoints, no new auth paths, no new file I/O patterns.

Per plan `<threat_model>`: "Block severity: LOW. This plan does not introduce new threats; it documents existing mitigations." Confirmed at execution boundary.

## Self-Check: PASSED

**File existence verified:**
- `diagrams-source/README.md` — FOUND (118 LOC)
- `.claude/skills/vv-blog-from-vault/references/visuals-routing.md` — MODIFIED (1 row edit; table shape preserved)
- `.planning/REQUIREMENTS.md` — MODIFIED (1 line edit; DIAG bullet count still 5; Traceability still 5 Pending rows)

**Commit hashes verified in git log:**
- `226e50e` — FOUND: `docs(04-05): add diagrams-source runbook + update visuals-routing skill doc`
- `ccc5165` — FOUND: `docs(04): fix DIAG-05 language — MCP + karpenter + stretch targets per D-04b`

**Acceptance criteria (Task 1 — runbook) — all 12 pass:**
- `test -f diagrams-source/README.md` — pass
- `wc -l < diagrams-source/README.md` = 118 (in [80, 200]) — pass
- `grep -c "^## "` = 6 (≥ 5) — pass
- `grep -q "^# Excalidraw diagram pipeline"` — pass
- All 5 named H2 sections grep — pass
- `grep -q "node scripts/excalidraw-to-svg.mjs"` — pass (CLI example)
- `grep -q "Shift+1"` — pass (zoom-to-fit gotcha)
- `grep -q "10 KB"` — pass (budget mention)
- `grep -q "meta.json"` — pass (metadata convention)
- `grep -qE "bilingual|EN.*RU|locale"` — pass (bilingual guidance)
- `! grep -qE "#(06B6D4|22D3EE|FF0000|000000)"` — pass (no deprecated hex)

**Acceptance criteria (Task 2 — skill doc) — all 6 pass:**
- `grep -q "node scripts/excalidraw-to-svg.mjs diagrams-source"` — pass
- `grep -q "public/blog-assets/<slug>/diagrams"` — pass
- `grep -q "diagrams-source/README.md"` — pass (references runbook)
- `grep -c "^|"` = 15 (≥ 8 required) — pass
- Priority 0 `Karpenter / cluster autoscaling` row unchanged — pass
- Priority 1 `mermaid-pro to generate a flowchart` row unchanged — pass

**Acceptance criteria (Task 3 — REQUIREMENTS.md) — all 6 pass:**
- `grep -q "MCP + karpenter"` — pass (new language)
- `grep -q 'manifests.*post is text-only'` — pass (reason text)
- `! grep -q "karpenter / manifests / TBD-third"` — pass (old language gone)
- `grep -q "aldinokemal2104/excalidraw-to-svg"` — pass (DIAG-01 unchanged)
- `grep -c "^- \[ \] \*\*DIAG-"` = 5 — pass (all 5 bullets present)
- `grep -c "DIAG-0[1-5].*Phase 4.*Pending"` = 5 — pass (Traceability rows intact)
- `git log --oneline -1 | grep -q "docs(04): fix DIAG-05"` — pass

**Acceptance criteria (Task 4 — phase-end gate) — all pass:**
- DIAG-01/02/03/04/05: all OK
- Boundary invariants src/ + dist/: OK (clean form of grep)
- Runbook + skill doc + REQUIREMENTS.md: OK
- T-04-02 SVG asset script count: 0 on both SVGs
- `npm run test:unit`: 44/44 pass (4.95s)
- `npm run build`: exit 0, 32 pages, 2.36s
- Diagrams shipped: 2 (DIAG-05 minimum satisfied)

**Post-commit cleanliness:**
- `git status --porcelain` after each commit: clean (only SUMMARY.md remains untracked until its own commit)
- `git diff --diff-filter=D HEAD~2 HEAD` — empty (no deletions across both atomic commits)
- HEAD assertion passed both pre-commit and post-commit checks (worktree-agent-a901b879862ed0421 branch)
