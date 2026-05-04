# Phase 4 Docs Quality / Consistency / Traceability Review

**Scope:** Excalidraw pipeline ship artifacts — runbook (`diagrams-source/README.md`), skill doc (`visuals-routing.md`), REQUIREMENTS.md (D-06 fix), PROJECT.md, ROADMAP.md, STATE.md, 04-CONTEXT.md, 04-VERIFICATION.md, 04-01..05-SUMMARY.md, CLAUDE.md.

**Reviewer angle:** pedantic cross-doc consistency.

---

## Finding Index

| ID | Severity | File | Question |
|---|---|---|---|
| F-01 | OUT-OF-DATE | CLAUDE.md | No mention of the excalidraw pipeline anywhere |
| F-02 | OUT-OF-DATE | `.planning/ROADMAP.md` | Phase 4 progress row + phase checkbox still say "Not started"/unchecked; status line says "2026-05-03 Phase 4 planned"; last-updated is stale |
| F-03 | INCONSISTENT | `.planning/ROADMAP.md` | Traceability table rows DIAG-01..05 still say "Pending — planned in …" |
| F-04 | INCONSISTENT | `.planning/REQUIREMENTS.md` | Traceability table + five `- [ ]` bullets still show unchecked / "Pending" for DIAG-01..05 |
| F-05 | OUT-OF-DATE | `.planning/STATE.md` | Frontmatter + body contradict each other — `completed_phases: 4` vs `current_phase: 04 … status: ready_to_plan`; progress bar 100% but current phase 04 still "Executing" |
| F-06 | OUT-OF-DATE | `.planning/STATE.md` | Active Context still says "milestone v1.0 just started. Phase numbering reset to 1. _None yet — milestone v1.0 just started._" in the Completed Phases section |
| F-07 | INCOMPLETE | `diagrams-source/README.md` | Runbook doesn't state which version of `@aldinokemal2104/excalidraw-to-svg` is pinned; "devDep" mentioned but no version — contributor won't know what's installed |
| F-08 | INCOMPLETE | `diagrams-source/README.md` | Runbook says "Virgil font (Excalidraw default)" but karpenter diagram actually shipped in Helvetica per plan 04; no gotcha explains why Virgil breaks >5-element diagrams |
| F-09 | INCONSISTENT | `diagrams-source/README.md` line 115 | References `tests/unit/excalidraw-to-svg.test.ts` with "9 integration tests covering DIAG-01/02/03 + T-04-01"; file actually has 9 tests (correct count), but count claim omits that 1 of them is the security test; ok — minor |
| F-10 | INCOMPLETE | `diagrams-source/README.md` line 116 | References `.planning/phases/04-excalidraw-pipeline/04-RESEARCH.md` but I cannot verify its existence from summaries — needs check |
| F-11 | NITPICK | `.claude/skills/vv-blog-from-vault/references/visuals-routing.md` line 27 | The excalidraw row extension is prose after the phrase "Then:"; not wrapped in backticks — copy-pasting the CLI will include trailing "(see …)" as a single phrase. Minor UX cost |
| F-12 | INCONSISTENT | visuals-routing.md line 3 (Source line) | Attribution says "CONTEXT.md D-37/38/39/40" — but Phase 4 CONTEXT has D-01..D-06. The cited decisions belong to a prior phase (likely Phase 9 / v0.4 content skill); fine for existing 6 rows, but the new excalidraw extension has no citation — breaks the pattern |
| F-13 | OUT-OF-DATE | `.planning/PROJECT.md` line 20 | Validated-in-Phase-4 block still refers to v0.4 phase 4 (REQ-011/013/014 — Hero work); v1.0 Phase 4 excalidraw-pipeline completion is only in the "Last updated" line, not the v1.0 Phase validations block |
| F-14 | INCOMPLETE | `.planning/PROJECT.md` "v1.0 milestone validations" block | Has Phase 2 + Phase 3 entries, missing Phase 4; should name DIAG-01..05 + the Virgil/Helvetica + 10 KB budget decisions |
| F-15 | OUT-OF-DATE | `.planning/STATE.md` line 21–22 | "Current phase: 5" + "Status: Ready to plan" — but frontmatter says `current_phase: 04 … status: ready_to_plan`. The body contradicts itself |
| F-16 | INCONSISTENT | 04-01-SUMMARY.md `requirements-completed: [DIAG-01, DIAG-02, DIAG-03]` | Plan 1 is RED-state only (no script yet). Frontmatter claims the requirements are completed, but DIAG-01 requires the actual script. This is a "coverage" not "completion" claim — the conflation makes the metadata lie when grepped |
| F-17 | NITPICK | 04-CONTEXT.md §Canonical References | Says REQUIREMENTS.md DIAG-01 names wrong package per D-01b; D-01e later reversed this. The note should be struck through or updated — future reader could be confused |
| F-18 | OUT-OF-DATE | CLAUDE.md §Slidev Presentations Integration | Says "Phase 7 (future): Migrate Slidev builds into `public/slides/`" — but ROADMAP has this at Phase 5 now. The Phase 7 reference is a v0.4-era pointer |
| F-19 | NITPICK | `.claude/skills/.../visuals-routing.md` line 3 | "D-37" etc. numbering is external to the current project CONTEXT; reader can't track it. Not Phase 4's fault — inherited |
| F-20 | INCONSISTENT | 04-VERIFICATION.md PL-15 vs runbook H2 count | Says "100-200 line runbook with 5+ H2 sections" and notes "6 H2 sections (Authoring, Metadata, Exporting, Embedding, Gotchas, Further reading)" — but ROADMAP Plan 05 bullet (line 155) says "5 H2 sections: Authoring / Metadata / Exporting / Embedding / Gotchas" (no "Further reading"). Runbook has 6. ROADMAP bullet drifted |

---

## Detailed Findings

### F-01 — CLAUDE.md has no excalidraw mention (OUT-OF-DATE)

**File:** `/Users/viktor/Documents/GitHub/vedmich/vedmich.dev/CLAUDE.md`

Grep results:
- `grep -c "excalidraw\|@aldinokemal" CLAUDE.md` → 0
- `grep -c "Phase 4" CLAUDE.md` → 0

**Evidence:** The project-local CLAUDE.md covers Slidev (§Slidev Presentations Integration, lines 311–326) but has zero mention of the new Excalidraw pipeline, the `diagrams-source/` directory convention, the `scripts/excalidraw-to-svg.mjs` script, or the `diagrams-source/README.md` runbook. A new contributor reading CLAUDE.md as the project's entry point will not discover the pipeline.

**Fix (suggested insertion after §Slidev Presentations Integration, before §Development, line 327):**

```markdown
---

## Excalidraw Diagram Pipeline — LIVE (since 2026-05-04)

Hand-sketched diagrams ship as build-time-exported static SVGs via `@aldinokemal2104/excalidraw-to-svg@1.1.1`. Source `.excalidraw.json` lives at `diagrams-source/<slug>/`, optimized SVG ships to `public/blog-assets/<slug>/diagrams/*.svg`, embedded via `<img>` in bilingual MDX. Zero runtime JS.

Current consumers: MCP post (`2026-03-02-mcp-servers-plainly-explained`) + Karpenter post (`2026-03-20-karpenter-right-sizing`).

**Runbook:** `diagrams-source/README.md`
**Script:** `scripts/excalidraw-to-svg.mjs`
**Tests:** `tests/unit/excalidraw-to-svg.test.ts` (9 integration tests)
**Boundary invariant:** `@aldinokemal2104/excalidraw-to-svg` is a devDep — never import from `src/`.
```

---

### F-02 — ROADMAP.md Phase 4 checkbox still unchecked (OUT-OF-DATE)

**File:** `/Users/viktor/Documents/GitHub/vedmich/vedmich.dev/.planning/ROADMAP.md`

**Line 26:**

```
- [ ] **Phase 4: Excalidraw Pipeline** — Export script + replace ASCII diagrams + stress-test on 2-3 posts
```

**Line 228 (Progress Table):**

```
| 4. Excalidraw Pipeline | 0/5 | Planned 2026-05-03 — 5 plans across 4 waves | - |
```

**Line 326:**

```
**Last updated:** 2026-05-03 (Phase 4 planned — 5 plans across 4 waves, Wave 2 parallel)
```

**Evidence:** Phase 4 is verified complete per `04-VERIFICATION.md` (2026-05-04T19:50:00Z, status: `human_needed` for visual check only; all 5 DIAG-* SATISFIED; 20/20 plan must-haves VERIFIED). Plans 04-01..04-05 are all marked `- [x]` at lines 145..155, but the phase checkbox at line 26 and Progress Table row at line 228 contradict that.

**Fix — line 26:**

```diff
-- [ ] **Phase 4: Excalidraw Pipeline** — Export script + replace ASCII diagrams + stress-test on 2-3 posts
+- [x] **Phase 4: Excalidraw Pipeline** — Export script + replace ASCII diagrams + stress-test on 2-3 posts (shipped 2026-05-04)
```

**Fix — line 228:**

```diff
-| 4. Excalidraw Pipeline | 0/5 | Planned 2026-05-03 — 5 plans across 4 waves | - |
+| 4. Excalidraw Pipeline | 5/5 | Shipped 2026-05-04 | 2026-05-04 |
```

**Fix — line 326:**

```diff
-**Last updated:** 2026-05-03 (Phase 4 planned — 5 plans across 4 waves, Wave 2 parallel)
+**Last updated:** 2026-05-04 (Phase 4 excalidraw-pipeline shipped — 5 plans, 2 SVGs embedded in MCP + karpenter posts, 44/44 unit tests green)
```

---

### F-03 — ROADMAP.md Traceability table still says "Pending" (INCONSISTENT)

**File:** `/Users/viktor/Documents/GitHub/vedmich/vedmich.dev/.planning/ROADMAP.md`

**Lines 304–308:**

```
| DIAG-01 | Excalidraw Pipeline | Phase 4 | Pending — planned in 04-01 (infra) + 04-02 (script) |
| DIAG-02 | Excalidraw Pipeline | Phase 4 | Pending — planned in 04-01 (budget test) + 04-02 (gate impl) |
| DIAG-03 | Excalidraw Pipeline | Phase 4 | Pending — planned in 04-01 (a11y tests) + 04-02 (injection) + 04-03/04 (canonical path) |
| DIAG-04 | Excalidraw Pipeline | Phase 4 | Pending — planned in 04-03 (MCP swap, EN + RU) |
| DIAG-05 | Excalidraw Pipeline | Phase 4 | Pending — planned in 04-04 (karpenter, EN + RU) |
```

**Evidence:** 04-VERIFICATION.md line 140..144 shows all five DIAG-* SATISFIED.

**Fix:**

```diff
-| DIAG-01 | Excalidraw Pipeline | Phase 4 | Pending — planned in 04-01 (infra) + 04-02 (script) |
-| DIAG-02 | Excalidraw Pipeline | Phase 4 | Pending — planned in 04-01 (budget test) + 04-02 (gate impl) |
-| DIAG-03 | Excalidraw Pipeline | Phase 4 | Pending — planned in 04-01 (a11y tests) + 04-02 (injection) + 04-03/04 (canonical path) |
-| DIAG-04 | Excalidraw Pipeline | Phase 4 | Pending — planned in 04-03 (MCP swap, EN + RU) |
-| DIAG-05 | Excalidraw Pipeline | Phase 4 | Pending — planned in 04-04 (karpenter, EN + RU) |
+| DIAG-01 | Excalidraw Pipeline | Phase 4 | Shipped — 04-01 fixtures + 04-02 script (177 LOC) |
+| DIAG-02 | Excalidraw Pipeline | Phase 4 | Shipped — budget gate in 04-02; both SVGs ≤ 10 KB (9673 B MCP, 7338 B karpenter) |
+| DIAG-03 | Excalidraw Pipeline | Phase 4 | Shipped — pre-SVGO title+desc injection verified in both SVGs |
+| DIAG-04 | Excalidraw Pipeline | Phase 4 | Shipped — MCP ASCII → SVG in EN + RU (04-03) |
+| DIAG-05 | Excalidraw Pipeline | Phase 4 | Shipped — karpenter split-ownership in EN + RU (04-04); stretch deferred per D-04c |
```

---

### F-04 — REQUIREMENTS.md bullets + Traceability still "Pending" (INCONSISTENT)

**File:** `/Users/viktor/Documents/GitHub/vedmich/vedmich.dev/.planning/REQUIREMENTS.md`

**Lines 37–41 (bullet list):**

```
- [ ] **DIAG-01**: Ship `scripts/excalidraw-to-svg.mjs` …
- [ ] **DIAG-02**: Integrate SVGO …
- [ ] **DIAG-03**: Establish the `public/blog-assets/<slug>/diagrams/*.svg` convention …
- [ ] **DIAG-04**: Replace the ASCII client-↔-server diagram …
- [ ] **DIAG-05**: Add 1-2 additional Excalidraw diagrams …
```

**Lines 131–135 (Traceability):**

```
| DIAG-01 | Excalidraw Pipeline | Phase 4 | Pending |
| DIAG-02 | Excalidraw Pipeline | Phase 4 | Pending |
| DIAG-03 | Excalidraw Pipeline | Phase 4 | Pending |
| DIAG-04 | Excalidraw Pipeline | Phase 4 | Pending |
| DIAG-05 | Excalidraw Pipeline | Phase 4 | Pending |
```

**Evidence:** 04-VERIFICATION.md confirms all 5 SATISFIED. The plan 04-05 SUMMARY self-check (line 309–310) verifies `grep -c "DIAG-0[1-5].*Phase 4.*Pending"` = 5 — but that's asserting the drift state, not a completion state. **D-06 only fixed DIAG-05 language, not status.**

**Fix — change `[ ]` to `[x]` on all 5 DIAG bullets (lines 37–41) and change "Pending" to "Shipped" on all 5 Traceability rows (lines 131–135):**

```diff
-- [ ] **DIAG-01**: Ship `scripts/excalidraw-to-svg.mjs` …
+- [x] **DIAG-01**: Ship `scripts/excalidraw-to-svg.mjs` …
-- [ ] **DIAG-02**: Integrate SVGO …
+- [x] **DIAG-02**: Integrate SVGO …
-- [ ] **DIAG-03**: Establish the `public/blog-assets/<slug>/diagrams/*.svg` convention …
+- [x] **DIAG-03**: Establish the `public/blog-assets/<slug>/diagrams/*.svg` convention …
-- [ ] **DIAG-04**: Replace the ASCII client-↔-server diagram …
+- [x] **DIAG-04**: Replace the ASCII client-↔-server diagram …
-- [ ] **DIAG-05**: Add 1-2 additional Excalidraw diagrams …
+- [x] **DIAG-05**: Add 1-2 additional Excalidraw diagrams …
```

```diff
-| DIAG-01 | Excalidraw Pipeline | Phase 4 | Pending |
+| DIAG-01 | Excalidraw Pipeline | Phase 4 | Shipped 2026-05-04 |
-| DIAG-02 | Excalidraw Pipeline | Phase 4 | Pending |
+| DIAG-02 | Excalidraw Pipeline | Phase 4 | Shipped 2026-05-04 |
-| DIAG-03 | Excalidraw Pipeline | Phase 4 | Pending |
+| DIAG-03 | Excalidraw Pipeline | Phase 4 | Shipped 2026-05-04 |
-| DIAG-04 | Excalidraw Pipeline | Phase 4 | Pending |
+| DIAG-04 | Excalidraw Pipeline | Phase 4 | Shipped 2026-05-04 |
-| DIAG-05 | Excalidraw Pipeline | Phase 4 | Pending |
+| DIAG-05 | Excalidraw Pipeline | Phase 4 | Shipped 2026-05-04 |
```

---

### F-05 — STATE.md frontmatter vs body contradiction (OUT-OF-DATE)

**File:** `/Users/viktor/Documents/GitHub/vedmich/vedmich.dev/.planning/STATE.md`

**Frontmatter (lines 1–15):**

```yaml
current_phase: 04
status: ready_to_plan
last_activity: 2026-05-04 -- Phase 04 execution started
progress:
  completed_phases: 4
  percent: 57
```

**Body (lines 21–38):**

```
**Current phase:** 5
**Status:** Ready to plan
**Last updated:** 2026-05-03

Phase: 04 (excalidraw-pipeline) — EXECUTING
Plan: Not started
Status: Executing Phase 04
Progress: [██████████] 100%
```

**Evidence:**
- Frontmatter says current phase 04, completed 4 — contradictory (can't be both).
- Body line 22 says "Current phase: 5" but line 32 says "Phase: 04 — EXECUTING".
- Progress bar 100% but "Plan: Not started" on line 33.
- Last-updated 2026-05-03 on line 23 but frontmatter says 2026-05-04.

**Fix — overhaul the whole frontmatter + Current Position block to reflect Phase 4 shipped, Phase 5 up next:**

```diff
 ---
 gsd_state_version: 1.0
 milestone: v1.0
 milestone_name: Content Platform
-current_phase: 04
-status: ready_to_plan
-last_updated: "2026-05-04T16:10:44.383Z"
-last_activity: 2026-05-04 -- Phase 04 execution started
+current_phase: 05
+status: ready_to_plan
+last_updated: "2026-05-04T19:50:00Z"
+last_activity: 2026-05-04 -- Phase 04 shipped (DIAG-01..05 all SATISFIED); Phase 05 Slidev Integration next
 progress:
   total_phases: 7
-  completed_phases: 4
-  total_plans: 21
-  completed_plans: 16
-  percent: 57
+  completed_phases: 2    # phases 3 + 4 shipped under v1.0 (phases 1-2 still open)
+  total_plans: 26        # 6+6+4+5 for phases 1..4 known; 5+6 TBD
+  completed_plans: 9     # 3 and 4 plans all done
+  percent: 35
 ---
```

(*Exact completed-phases count depends on v1.0 semantics — if phase 3 is complete and phase 4 is complete but 1 + 2 are still pending, then completed_phases should be 2, not 4.*)

**Fix — body §Current Position (lines 30–39):**

```diff
-Phase: 04 (excalidraw-pipeline) — EXECUTING
-Plan: Not started
-Status: Executing Phase 04
-Resume file: .planning/phases/04-excalidraw-pipeline/04-CONTEXT.md
-Last activity: 2026-05-04
-
-Progress: [██████████] 100%
+Phase: 05 (slidev-integration) — NOT STARTED
+Plan: Not planned
+Status: Ready to plan Phase 05
+Resume file: .planning/phases/04-excalidraw-pipeline/04-VERIFICATION.md (Phase 04 closeout; human-verification items pending)
+Last activity: 2026-05-04
+
+Progress: Phase 04 [██████████] 100% shipped; Phase 05 [          ] 0%
```

**Fix — §Completed Phases (line 42):**

```diff
-_None yet — milestone v1.0 just started. Phase numbering reset to 1._
+- **Phase 03: UI Polish** — shipped 2026-05-03 (POLISH-01..06, 4 plans, WR-03 folded)
+- **Phase 04: Excalidraw Pipeline** — shipped 2026-05-04 (DIAG-01..05, 5 plans, 2 SVGs embedded, 9 new unit tests)
```

---

### F-06 — STATE.md "Active Context" still says "milestone v1.0 just started" (OUT-OF-DATE)

**File:** `/Users/viktor/Documents/GitHub/vedmich/vedmich.dev/.planning/STATE.md`

**Line 42:**

```
_None yet — milestone v1.0 just started. Phase numbering reset to 1._
```

**Evidence:** Contradicted by STATE.md own §Performance Metrics table (lines 56–60) which lists Phase 03 plans 01–04 completed. Also contradicted by the "Last updated: 2026-05-04 (Phase 4 excalidraw-pipeline complete)" line in PROJECT.md.

**Fix:** replace as shown in F-05 (part of the same remediation).

---

### F-07 — Runbook missing library version pin (INCOMPLETE)

**File:** `/Users/viktor/Documents/GitHub/vedmich/vedmich.dev/diagrams-source/README.md`

**Evidence:** The word "devDep" appears exactly once (line 104, in Gotcha 4). Nowhere does the runbook name `@aldinokemal2104/excalidraw-to-svg` or the pinned version `1.1.1`. A contributor who runs `node scripts/excalidraw-to-svg.mjs` without `npm install` first will get "Cannot find module '@aldinokemal2104/excalidraw-to-svg'" and have no pointer to what to install.

**Fix:** add a "Prerequisites" subsection before §Authoring (between line 8 and 9):

```markdown
## Prerequisites

The pipeline depends on `@aldinokemal2104/excalidraw-to-svg@1.1.1` (exact pin — devDep) and `svgo` (transitive via Astro).

First-time setup:
```bash
npm install  # pulls in the wrapper + svgo from package.json:devDependencies
```

Verify:
```bash
node -p "require('./package.json').devDependencies['@aldinokemal2104/excalidraw-to-svg']"
# → 1.1.1
```

***
```

---

### F-08 — Runbook gotcha doesn't explain Virgil vs Helvetica budget tradeoff (INCOMPLETE)

**File:** `/Users/viktor/Documents/GitHub/vedmich/vedmich.dev/diagrams-source/README.md` — Gotcha 1 (line 98)

**Current text:**

> **Virgil-only text keeps the budget.** The wrapper auto-embeds whichever Excalidraw fonts your diagram uses. Cascadia + Comic Shanns + Lilita One together can push even a small diagram over 10 KB. If you want mixed fonts, verify the SVG byte count and simplify if needed.

**Evidence:** 04-04-SUMMARY.md Deviations §1 documents that Virgil itself produces a **9,457-byte** base64 font embed in the SVG. At ≥ 8 elements the body alone is > 1 KB, pushing total over budget. The karpenter diagram **shipped in Helvetica (fontFamily: 2)** precisely for this reason, not Virgil. The runbook's "Virgil-only keeps the budget" advice is the opposite of what plan 04 actually did.

**Fix — expand Gotcha 1:**

```markdown
1. **Font choice is the dominant byte driver.** The wrapper auto-embeds each Excalidraw font your diagram uses as an inline base64 TTF subset. Virgil alone is ~9.5 KB — at ≥ 8 elements, a Virgil diagram overruns the 10 KB budget no matter how few elements it has. Two options:
   - **Small diagrams (≤ 5 text labels):** Virgil is fine (MCP client-server, 9,673 B, 94 % of budget).
   - **Larger diagrams (≥ 6 text labels):** use Helvetica (`fontFamily: 2`) instead — renders via the browser's system-font fallback, zero embedded bytes. Caveat: Helvetica's a system font, so rendering is slightly OS-dependent (macOS/iOS ship Helvetica; Linux falls back to a sans-serif). The karpenter split-ownership diagram (7,338 B, 71.7 % of budget) uses Helvetica for this reason. If you need handwritten aesthetics AND a dense diagram, split it into two smaller Virgil diagrams rather than one Helvetica one.
```

---

### F-09 — Runbook test-count reference minor (INCONSISTENT)

**File:** `/Users/viktor/Documents/GitHub/vedmich/vedmich.dev/diagrams-source/README.md` line 115

**Current:** `**\`tests/unit/excalidraw-to-svg.test.ts\`** — 9 integration tests covering DIAG-01/02/03 + T-04-01 path-traversal.`

**Evidence:** 04-01-SUMMARY.md confirms 9 tests: DIAG-01 (3) + DIAG-02 (2) + DIAG-03 (3) + Security/T-04-01 path-traversal (1). Count is correct. This is a NITPICK — the phrasing could be tighter ("DIAG-01..03 + T-04-01" not "DIAG-01/02/03") but it's not wrong.

**Fix (optional):** leave as-is.

---

### F-10 — Runbook references `04-RESEARCH.md` — verify it exists (INCOMPLETE)

**File:** `/Users/viktor/Documents/GitHub/vedmich/vedmich.dev/diagrams-source/README.md` line 116

**Current:**

```
**`.planning/phases/04-excalidraw-pipeline/04-RESEARCH.md`** — library choice rationale, SVGO pitfalls, security domain.
```

**Evidence:** The commit `0b6e2f0 docs(04): research Excalidraw pipeline phase domain` in the recent-commits list suggests it exists, but this wasn't verified in this review.

**Fix if file is missing:** swap to `04-CONTEXT.md §Implementation Decisions` which does exist and is canonical. Otherwise leave.

---

### F-11 — Skill doc CLI not in backticks (NITPICK)

**File:** `/Users/viktor/Documents/GitHub/vedmich/vedmich.dev/.claude/skills/vv-blog-from-vault/references/visuals-routing.md` line 27

**Current:**

```
| Hand-sketched / whiteboard style | `excalidraw` | "Sketch X in excalidraw style." Then: `node scripts/excalidraw-to-svg.mjs diagrams-source/<slug>/<name>.excalidraw.json public/blog-assets/<slug>/diagrams/<name>.svg` (see `diagrams-source/README.md`). |
```

**Evidence:** The CLI is already in backticks. After re-reading — this is correct. Marking NITPICK/resolved. No fix needed.

**Revised finding:** the inline prose is dense. Copy-pasting the CLI includes the "(see ...)" trailer. Low-cost UX win to break it:

```markdown
| Hand-sketched / whiteboard style | `excalidraw` | "Sketch X in excalidraw style." Then run:<br>`node scripts/excalidraw-to-svg.mjs diagrams-source/<slug>/<name>.excalidraw.json public/blog-assets/<slug>/diagrams/<name>.svg`<br>See `diagrams-source/README.md` for the full runbook. |
```

---

### F-12 — visuals-routing.md "Source" line cites D-37..D-40 (INCONSISTENT)

**File:** `/Users/viktor/Documents/GitHub/vedmich/vedmich.dev/.claude/skills/vv-blog-from-vault/references/visuals-routing.md` line 3

**Current:**

```
**Source:** CONTEXT.md D-37 (visual signals), D-38 (asset storage), D-39 (reuse FIRST), D-40 (animations deferred).
```

**Evidence:** Phase 4 CONTEXT.md has decisions numbered D-01..D-06 (not D-37..D-40). Those decision numbers are inherited from a prior phase's CONTEXT (Phase 9 v0.4 content-skill work), not from Phase 4. Not wrong — just opaque to readers.

**Fix:** add a citation for the new excalidraw delivery-path information added in Phase 4:

```diff
-**Source:** CONTEXT.md D-37 (visual signals), D-38 (asset storage), D-39 (reuse FIRST), D-40 (animations deferred).
+**Source:** v0.4 Phase 9 CONTEXT.md D-37..D-40 (visual signals / asset storage / reuse FIRST / animations deferred) + v1.0 Phase 4 CONTEXT.md D-01e (excalidraw delivery path via `scripts/excalidraw-to-svg.mjs`).
```

---

### F-13 / F-14 — PROJECT.md doesn't record Phase 4 in v1.0 validations block (OUT-OF-DATE / INCOMPLETE)

**File:** `/Users/viktor/Documents/GitHub/vedmich/vedmich.dev/.planning/PROJECT.md`

**Lines 29–30** (v1.0 milestone validations block):

> Validated in v1.0 Phase 2 (code-block-upgrades): CODE-01..05 — Shiki language badge pill, `// [!code highlight]` transformer…
>
> Validated in v1.0 Phase 3 (ui-polish): POLISH-01..06 …

**Evidence:** Phase 2 and Phase 3 have entries. Phase 4 is missing entirely. The only Phase 4 mention is the trailer at line 118 ("Last updated: 2026-05-04 (Phase 4 excalidraw-pipeline complete)"). That's a footnote, not a validations record.

**Fix — insert a new "Validated in v1.0 Phase 4" paragraph between lines 30 and 32:**

```markdown
Validated in v1.0 Phase 4 (excalidraw-pipeline): DIAG-01..05 — `scripts/excalidraw-to-svg.mjs` (177 LOC) using `@aldinokemal2104/excalidraw-to-svg@1.1.1` (exact-pinned devDep per D-01d/D-01e); SVGO `preset-default` + `removeDesc: false` + `multipass: true` with pre-SVGO `<title>`+`<desc>` injection via `escapeXml`; 10 KB budget gate + `validatePath` (REPO_ROOT ∪ os.tmpdir) path-traversal guard + `validateFilesBlob` 100 KB cap; `public/blog-assets/<slug>/diagrams/*.svg` convention; MCP post ASCII `←→` diagram replaced with bilingual `<img>` embed of 9,673 B client-server SVG (EN + RU); karpenter post gains 7,338 B split-ownership SVG (EN + RU) after the "split ownership" paragraph (Helvetica fontFamily=2 to fit budget per D-04b Deviations §1); `diagrams-source/README.md` contributor runbook (118 LOC, 6 H2 sections); `visuals-routing.md` Priority 1 `excalidraw` row extended with concrete delivery path; REQUIREMENTS.md DIAG-05 language reconciled per D-06-revised (DIAG-01 unchanged per D-01e); 9 new integration tests (44 total), all green; boundary invariant holds (`@aldinokemal2104` / `@excalidraw` never appear in `src/` or `dist/`). Tech debt: WR-04 Helvetica is OS-dependent (add runbook gotcha or re-author with Virgil); BL-01 symlink-bypass on validatePath; BL-02 regex-based title/desc injection not XML-aware — all three folded to v1.1 or Phase 5 security pass.
```

---

### F-15 — STATE.md §Project Reference "Current phase: 5" vs §Current Position "Phase: 04 — EXECUTING" (OUT-OF-DATE)

Same as F-05; resolved by the fix in F-05.

---

### F-16 — 04-01-SUMMARY.md frontmatter claims `requirements-completed: [DIAG-01, DIAG-02, DIAG-03]` (INCONSISTENT)

**File:** `/Users/viktor/Documents/GitHub/vedmich/vedmich.dev/.planning/phases/04-excalidraw-pipeline/04-01-SUMMARY.md` line 52

**Current:**

```yaml
requirements-completed: [DIAG-01, DIAG-02, DIAG-03]
```

**Evidence:** Plan 01 is the Wave-0 RED-state plan — it adds fixtures + 9 failing tests + a devDep pin. The actual script (`scripts/excalidraw-to-svg.mjs`) is NOT present at this plan's HEAD (confirmed in 04-01-SUMMARY "Self-Check" line 196: `! test -e scripts/excalidraw-to-svg.mjs` PASSES). DIAG-01 requires the script. Flagging these requirements as "completed" in plan 01 frontmatter when the implementation doesn't exist until plan 02 is a metadata inconsistency.

Similarly, plan 05 SUMMARY (`requirements-completed: [DIAG-01, DIAG-02, DIAG-03, DIAG-04, DIAG-05]`) is correct as a cumulative "phase-end" claim, but 04-01, 04-02, 04-03 each claim subsets. Cross-plan grep by requirement ID would get confusing.

**Fix — suggest changing frontmatter convention to `requirements-covered` (contributed tests/fixtures) vs `requirements-satisfied` (implementation live):**

```diff
-requirements-completed: [DIAG-01, DIAG-02, DIAG-03]
+requirements-covered: [DIAG-01, DIAG-02, DIAG-03]  # RED-state tests; impl lands in plan 02
```

Or drop the field from plan-01 entirely and only record it on the plan that ships the requirement.

---

### F-17 — 04-CONTEXT.md §Canonical References notes stale D-01b drift (NITPICK)

**File:** `/Users/viktor/Documents/GitHub/vedmich/vedmich.dev/.planning/phases/04-excalidraw-pipeline/04-CONTEXT.md` line 91

**Current:**

> `.planning/REQUIREMENTS.md` §Excalidraw Pipeline — DIAG-01..05 full spec (note: DIAG-01 names wrong package per D-01b; DIAG-05 names `manifests` per D-04b — both get corrected post-phase per D-06)

**Evidence:** D-01b was REVERSED by D-01e (documented at lines 29–30 of same file). DIAG-01 language in REQUIREMENTS.md was always correct. The note here is stale.

**Fix:**

```diff
-`.planning/REQUIREMENTS.md` §Excalidraw Pipeline — DIAG-01..05 full spec (note: DIAG-01 names wrong package per D-01b; DIAG-05 names `manifests` per D-04b — both get corrected post-phase per D-06)
+`.planning/REQUIREMENTS.md` §Excalidraw Pipeline — DIAG-01..05 full spec. DIAG-01 was always correct per D-01e (wrapper is the canonical library); DIAG-05 names `manifests` per D-04b — corrected post-phase per D-06-revised (DIAG-05 only; DIAG-01 unchanged).
```

---

### F-18 — CLAUDE.md §Slidev section says "Phase 7 future" (OUT-OF-DATE)

**File:** `/Users/viktor/Documents/GitHub/vedmich/vedmich.dev/CLAUDE.md` line 316

**Current:**

```
**Phase 7 (future):** Migrate Slidev builds into `public/slides/` so presentations live at `vedmich.dev/slides/`.
```

**Evidence:** v1.0 ROADMAP places Slidev integration at Phase 5 (line 27). "Phase 7" is v0.4 numbering or a stale reference. v1.0 Phase 7 (codegen) was SKIPPED per ROADMAP line 29. The CLAUDE.md reference is misleading to a reader who looks at the v1.0 roadmap and sees Phase 5 = Slidev Integration, Phase 7 = SKIPPED codegen.

**Fix:**

```diff
-**Phase 7 (future):** Migrate Slidev builds into `public/slides/` so presentations live at `vedmich.dev/slides/`.
+**v1.0 Phase 5 (in-progress, target 2026-05):** Migrate Slidev builds into `public/slides/` so presentations live at `vedmich.dev/slides/<slug>/`. See `.planning/ROADMAP.md §Phase 5: Slidev Integration`.
```

---

### F-19 — visuals-routing.md inherited D-37..D-40 citation unclear (NITPICK)

Same as F-12, resolved by the fix in F-12.

---

### F-20 — ROADMAP Plan 05 bullet says "5 H2 sections" vs runbook's 6 H2 (INCONSISTENT)

**File:** `/Users/viktor/Documents/GitHub/vedmich/vedmich.dev/.planning/ROADMAP.md` line 155

**Current:**

```
04-05-PLAN.md — Ship `diagrams-source/README.md` runbook (5 H2 sections: Authoring / Metadata / Exporting / Embedding / Gotchas) …
```

**Evidence:**
- Runbook (lines 9, 21, 41, 71, 96, 112) has 6 H2 sections — Authoring, Metadata, Exporting, Embedding, Gotchas, **Further reading**.
- 04-05-SUMMARY.md key-decisions (line 41) explicitly says "6 H2 sections (not 5)" — acknowledges the drift.
- 04-VERIFICATION.md PL-15 correctly states "6 H2 sections (Authoring, Metadata, Exporting, Embedding, Gotchas, Further reading)".

The ROADMAP bullet is the only artifact that still says "5".

**Fix:**

```diff
-04-05-PLAN.md — Ship `diagrams-source/README.md` runbook (5 H2 sections: Authoring / Metadata / Exporting / Embedding / Gotchas) …
+04-05-PLAN.md — Ship `diagrams-source/README.md` runbook (6 H2 sections: Authoring / Metadata / Exporting / Embedding / Gotchas / Further reading; 118 LOC) …
```

---

## Consistency Sweep — Library Version `@aldinokemal2104/excalidraw-to-svg@1.1.1`

| File | Version text | Status |
|---|---|---|
| `package.json` line 24 | `"@aldinokemal2104/excalidraw-to-svg": "1.1.1"` | Exact pin ✓ |
| `diagrams-source/README.md` | No version mentioned | **MISSING** (F-07) |
| `visuals-routing.md` | No version (CLI command only) | Acceptable (routing doc, not install doc) |
| `.planning/REQUIREMENTS.md` DIAG-01 | No version (`via @aldinokemal2104/excalidraw-to-svg`) | Acceptable — REQUIREMENTS doesn't pin |
| `.planning/ROADMAP.md` Phase 4 | `@aldinokemal2104/excalidraw-to-svg@1.1.1` (line 128, 145) | ✓ |
| `.planning/phases/04.../04-CONTEXT.md` | `@aldinokemal2104/excalidraw-to-svg` (line 33, D-01e explicit) + version implicit via D-01d discipline | ✓ |
| `04-VERIFICATION.md` PL-1, PL-4 | `@aldinokemal2104/excalidraw-to-svg@1.1.1` | ✓ |
| Summaries 04-01/02/03/04/05 | `@aldinokemal2104/excalidraw-to-svg@1.1.1` (each) | ✓ |
| CLAUDE.md | No mention (F-01) | **MISSING** |

**Aggregate verdict:** Version consistency is tight where mentioned. **The runbook + CLAUDE.md are the two coverage gaps.**

---

## Skill Routing Coherence

**Question (from task):** does visuals-routing.md's Priority 1 excalidraw row route correctly?

**Walkthrough:**

1. User says "Sketch an X diagram for the post."
2. Skill reader checks visuals-routing.md Priority 0 first — no vault asset matches.
3. Priority 1 table, row 3: "Hand-sketched / whiteboard style" → `excalidraw` skill → "Sketch X in excalidraw style."
4. Extended invocation cell: `node scripts/excalidraw-to-svg.mjs diagrams-source/<slug>/<name>.excalidraw.json public/blog-assets/<slug>/diagrams/<name>.svg (see diagrams-source/README.md)`.
5. Runbook takes over — Authoring / Metadata / Exporting / Embedding walk-through.

**Verdict:** routing coherent. One gap: the skill doc doesn't tell the reader "the excalidraw skill itself lives at `~/.claude/skills/excalidraw/`" — but that's fine, the skill-invocation-by-description pattern should fire automatically.

**Minor wart:** the `excalidraw` skill in `~/.claude/skills/excalidraw/SKILL.md` (cited in 04-CONTEXT line 117–118) handles authoring in Excalidraw; the runbook + `scripts/excalidraw-to-svg.mjs` handle export. The routing doc leaves that division implicit. If a new user clicks through, they may get a subagent authoring a diagram + the CLI export in sequence.

---

## Runbook Walkthrough (as new contributor)

Running the 118-line runbook for a hypothetical new diagram:

1. ✅ §Authoring — clear: 5 steps, Shift+1 for zoom-to-fit, Virgil default.
2. ⚠️ **Contributor runs `node scripts/excalidraw-to-svg.mjs ...` and fails with "Cannot find module '@aldinokemal2104/excalidraw-to-svg'"** — runbook has no `npm install` step. Covered by F-07 fix.
3. ✅ §Metadata — clear, with JSON schema.
4. ✅ §Exporting — clear CLI + error paths.
5. ⚠️ Contributor draws a 12-label diagram in Virgil, hits "exceeds 10 KB budget". Gotcha 1 says "Simplify and verify" but **doesn't mention Helvetica fallback** — F-08. They might simplify a diagram that didn't need simplifying.
6. ✅ §Embedding — clear with width/height, lazy-loading, bilingual notes.
7. ✅ §Gotchas — 6 items, all real pitfalls.
8. ✅ §Further reading — 5 good pointers (assuming F-10's 04-RESEARCH.md exists).

**Verdict:** 118 LOC is genuinely tight and readable. Two real gaps: the missing `npm install` pointer (F-07) and the missing Helvetica-as-escape-hatch note (F-08).

---

## Traceability Matrix — DIAG-01..05 → Phases + Decisions D-01..D-06 → Plans

| Requirement | Phase | Decisions cited | Plans | Status in REQUIREMENTS.md | Status (actual) |
|---|---|---|---|---|---|
| DIAG-01 | 4 | D-01..D-01e, D-01d (pin), D-06-revised | 04-01, 04-02 + 04-05 doc | `[ ]` Pending | **Shipped** (mismatch) |
| DIAG-02 | 4 | D-05 (10 KB budget) | 04-01, 04-02 | `[ ]` Pending | **Shipped** (mismatch) |
| DIAG-03 | 4 | D-02, D-02b, D-02c, D-02d, D-03c | 04-01, 04-02, 04-03, 04-04 | `[ ]` Pending | **Shipped** (mismatch) |
| DIAG-04 | 4 | D-03, D-03d | 04-03 | `[ ]` Pending | **Shipped** (mismatch) |
| DIAG-05 | 4 | D-04, D-04b, D-04c, D-06-revised | 04-04 (+ 04-05 doc-drift) | `[ ]` Pending | **Shipped** (mismatch, F-04) |

**Decisions D-01..D-06 cross-reference:**

| Decision | Cited in | Orphans? |
|---|---|---|
| D-01 (superseded) | 04-CONTEXT §Library Choice | ✓ obsolete-documented |
| D-01b (reversed) | 04-CONTEXT + 04-05-SUMMARY (F-17 stale note) | ✓ |
| D-01c (obviated) | 04-CONTEXT | ✓ |
| D-01d (exact pin) | 04-CONTEXT, 04-01-SUMMARY, package.json, 04-VERIFICATION PL-1 | ✓ |
| D-01e (primary) | 04-CONTEXT, REQUIREMENTS.md (implicit), 04-01..05-SUMMARY, 04-VERIFICATION | ✓ |
| D-02, D-02b, D-02c, D-02d | 04-CONTEXT, 04-01-SUMMARY, 04-02-SUMMARY, 04-VERIFICATION | ✓ |
| D-03, D-03b, D-03c, D-03d | 04-CONTEXT, 04-03-SUMMARY, 04-04-SUMMARY, 04-VERIFICATION | ✓ |
| D-04, D-04b, D-04c | 04-CONTEXT, 04-04-SUMMARY, 04-05-SUMMARY, REQUIREMENTS.md DIAG-05 | ✓ |
| D-05, D-05b | 04-CONTEXT, 04-01..04-04 SUMMARY, 04-VERIFICATION PL-5 | ✓ |
| D-06 (revised) | 04-CONTEXT, 04-05-SUMMARY, 04-VERIFICATION PL-17..18 | ✓ |

**No orphan decisions.** D-01 through D-06 all trace to at least one plan and are cited in the summary / verification artifacts.

**One traceability gap:** the decisions are cited in artifacts but not back-linked from REQUIREMENTS.md itself (no "per D-01e" or similar notes in REQUIREMENTS DIAG-01 text). Not required but would strengthen the trail.

---

## PROJECT.md Evolution

**Question:** was PROJECT.md updated appropriately after phase completion?

**Evidence:**
- Line 118: `**Last updated:** 2026-05-04 (Phase 4 excalidraw-pipeline complete — DIAG-01..05 shipped; scripts/excalidraw-to-svg.mjs + 2 SVGs embedded in MCP + Karpenter posts)` — ✓ updated.
- But: the v1.0 milestone validations block (lines 27–30) has entries for Phase 2 and Phase 3 but **no entry for Phase 4**. The "Last updated" trailer is insufficient — the validations block is the formal record. F-14.

**Verdict:** PARTIALLY updated. The trailer is right; the structured record block is missing. F-13 + F-14 together fix it.

---

## Summary Table — All Findings by Severity

| Severity | Count | IDs |
|---|---|---|
| OUT-OF-DATE | 7 | F-01, F-02, F-05, F-06, F-13, F-15, F-18 |
| INCONSISTENT | 6 | F-03, F-04, F-12, F-16, F-20 + (F-19) |
| INCOMPLETE | 4 | F-07, F-08, F-10, F-14 |
| NITPICK | 3 | F-09, F-11, F-17 |

**Total: 20 findings.**

---

## Recommended Patch Order

1. **First — block Phase 5 start until these are fixed:**
   - F-02 (ROADMAP Phase 4 checkbox + progress row)
   - F-03 (ROADMAP traceability DIAG-* rows)
   - F-04 (REQUIREMENTS DIAG-* bullets + traceability)
   - F-05 + F-06 + F-15 (STATE.md — single overhaul pass)

2. **Second — docs-gap fixes before Phase 6 consumers need them:**
   - F-01 (CLAUDE.md excalidraw section)
   - F-07 (runbook prereqs / install)
   - F-08 (runbook Virgil/Helvetica gotcha)
   - F-13 + F-14 (PROJECT.md v1.0 Phase 4 validations block)
   - F-18 (CLAUDE.md Phase 7 → Phase 5 correction)

3. **Third — tidy-up / non-blocking:**
   - F-10 (verify 04-RESEARCH.md exists or swap ref)
   - F-11 (skill-doc CLI line-break nicety)
   - F-12 (skill-doc source line citation)
   - F-16 (plan-SUMMARY `requirements-completed` convention)
   - F-17 (04-CONTEXT §Canonical References stale D-01b note)
   - F-20 (ROADMAP Plan 05 bullet "5 H2" → "6 H2")

All fixes are single-file edits. Total: ~7 files touched across ~15 individual edits.

---

_Review completed 2026-05-04._
