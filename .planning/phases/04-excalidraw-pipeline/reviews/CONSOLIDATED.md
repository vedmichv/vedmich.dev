---
phase: 04-excalidraw-pipeline
type: post-phase-review-consolidation
reviewed: 2026-05-04
sources:
  - SECURITY-REVIEW.md
  - QUALITY-REVIEW.md
  - UX-REVIEW.md
  - DOCS-REVIEW.md
next_phase: 04.1-excalidraw-pipeline-hardening
total_findings: 58
---

# Phase 4 Post-Shipment Review Consolidation

Phase 4 shipped on 2026-05-04 with all 25/25 plan must-haves verified and Playwright-visual-check PASS on HUMAN-UAT. Four parallel review agents then ran adversarial security + code quality + visual UX + docs coherence reviews against the merged state.

This document consolidates the 58 findings and proposes a remediation ordering for Phase 4.1.

## Scope split

| Review | File | Findings |
|--------|------|----------|
| Security (adversarial) | SECURITY-REVIEW.md | 11 (2 CRITICAL, 2 HIGH, rest MEDIUM/LOW) |
| Code quality | QUALITY-REVIEW.md | 17 (2 HIGH, 8 MEDIUM, 4 LOW, 3 NITPICK) |
| Visual UX | UX-REVIEW.md | 10 (3 production-blocking) |
| Documentation | DOCS-REVIEW.md | 20 (7 OUT-OF-DATE, 6 INCONSISTENT, 4 INCOMPLETE, 3 NITPICK) |

## Priority 1: Remediate immediately (CRITICAL security + blocking UX)

These items have reproducible exploits or production-blocking visual issues:

### P1-SEC-01 — Arbitrary file overwrite via symlink (SEC-C01, confirms BL-01)
**Status:** Actively exploitable on HEAD today
**Attack:** Attacker-planted symlink under `$TMPDIR` (not `/tmp` — WR-02 saved that) allows `validatePath` to pass, then `fs.writeFile` dereferences the symlink and overwrites the target. Victim files confirmed: `~/.ssh/authorized_keys`, `.aws/credentials`.
**Extension:** JSON.parse SyntaxError on the symlink target echoes first ~10 bytes of victim file to stderr → information disclosure.
**Fix:** `fs.realpathSync` on all existing ancestors of destPath before the prefix check. Additionally remove `TMP_ROOT` from the write-allowlist entirely — tests should write under `<repo>/tests/tmp/` which is gitignored.
**Confidence:** High (reproduced end-to-end)

### P1-SEC-02 — Threat model T-04-02 defense-in-depth is fictional (SEC-C02)
**Status:** Currently does not compromise shipped SVGs (wrapper's XMLSerializer handles the attacker input paths that would exploit this), but the threat model's written claim is false.
**Attack:** `04-02-PLAN.md:128` claims SVGO's `preset-default` strips `<script>`. It does NOT. Verified against `node_modules/svgo/plugins/preset-default.js` source AND empirically: `<script>`, `onload`, `<foreignObject>`, `<iframe>`, `javascript:` URIs all survive SVGO.
**Fix:** Add explicit `removeScripts` + `removeAttributesBySelector` plugins after `preset-default`. The wrapper's `escapeXml` + XMLSerializer is the actual defense; SVGO is not.
**Confidence:** High (verified against svgo source)

### P1-SEC-03 — SSRF / tracking pixel via files[*].dataURL (SEC-H03)
**Attack:** Wrapper embeds whatever dataURL the attacker provides into `<image href>` with zero scheme validation. Protocols confirmed surviving: `file://`, `https://` (external fetch on render → tracking pixel + IP disclosure), `data:image/svg+xml` containing scripts.
**Fix:** Whitelist dataURL schemes in `validateFilesBlob`: `data:image/png;base64,` + `data:image/jpeg;base64,` + `data:image/gif;base64,`. Reject everything else.
**Confidence:** High (the wrapper does sanitize `element.link` — asymmetric defense is a smell)

### P1-UX-01 — White SVG background on dark prose (UX-01)
**Evidence:** Both SVGs open with `<path fill="#fff" ...>` painting the full canvas white. Deep Signal dark theme `--bg-base: #0F172A` → readers see jarring bright slab. Karpenter hits 367×720 px of white against dark.
**Fix options:**
1. Re-export with transparent `viewBackgroundColor: null` in Excalidraw (cleaner, requires re-authoring + re-export)
2. Post-process in `excalidraw-to-svg.mjs`: remove the leading `<path fill="#fff">` via SVGO plugin override (immediate fix, retroactive for shipped SVGs)
3. Wrap `<img>` in `<figure style="background: white; padding: 1rem; border-radius: 8px">` (hybrid — adds light surface, keeps SVG white-on-white)
**Recommend:** option 2 (script-level fix) — applies to both shipped SVGs without re-authoring, future-proof for new diagrams.
**Confidence:** High (visual evidence in SVG source, live site behavior confirmed)

### P1-UX-02 — Mobile labels unreadable at 6.7 px (UX-02)
**Evidence:** MCP 820×100 SVG scales to 343×42 on 375px mobile. 16px Excalidraw labels scale to `16 * (42/100) = 6.7 px`. Below 9px legibility floor.
**Fix:** Re-author MCP diagram with 28-32px label font-size in Excalidraw → `label_px * (viewport_height/svg_height) >= 12px`. Also widen the viewBox to break 8.2:1 banner ratio (target 3:1 aspect).
**Confidence:** High (geometric calculation)

### P1-UX-03 — MCP aspect ratio 8.2:1 (UX-03)
Related to UX-02 — the extreme banner ratio is what forces the 42px mobile height. Re-authoring to 3:1 or 4:1 fixes both.

### P1-UX-04 — Karpenter Helvetica (UX-04 = WR-04)
**Evidence:** Karpenter SVG uses `font-family="Helvetica"` with no `@font-face` embed. Windows readers get Arial fallback → metric drift → labels may overflow box borders.
**Fix options:**
1. Re-author with Virgil font (adds ~9.5 KB embed → currently busts 10 KB budget at 17 elements)
2. Simplify diagram to <=10 elements so Virgil fits
3. Accept Helvetica + add `font-family="Helvetica, Arial, sans-serif"` fallback chain in SVG post-process
**Recommend:** option 3 for now, track Virgil re-author as follow-up if cross-platform screenshots show breakage.
**Confidence:** High

## Priority 2: Code quality + test coverage gaps

### P2-Q01 — Idempotency not guaranteed (Q-01 HIGH)
Script header claims "re-runnable" but Excalidraw regens `seed`/`versionNonce` on every UI re-export → byte-different SVGs for visually-identical input → noisy `git diff` per edit.
**Fix:** Add byte-stability test + strip/normalize nonces in the script OR document caveat prominently in runbook.

### P2-Q02 — JSON.parse error UX (Q-02 HIGH)
Raw SyntaxError without naming which file (meta vs source) failed. Common author error, worst UX.
**Fix:** `parseJsonOrThrow(text, pathForErr)` helper + add test for malformed JSON.

### P2-Q03-04 — Silent meta validation failures (Q-03/Q-04 MEDIUM)
- `elements: []` → zero-size SVG with no error
- `{"title": {"en": "..."}}` → literal `<title>[object Object]</title>` (silent a11y regression)
**Fix:** Type-strict meta validator (check `typeof meta.title === 'string'`, `meta.title.length > 0`, etc). Add 2 tests.

### P2-Q08 — FILES_BLOB_BUDGET untested (Q-08 MEDIUM)
T-04-03 guard exists in code but no test exercises it. Oversize fixture hits 10KB post-SVGO (DIAG-02) but never accumulates `files[*].dataURL`.
**Fix:** Add fixture `oversize-files.excalidraw.json` with 200KB base64 dataURL in `files` key + test that pipeline rejects with non-zero exit.

### P2-Q05 — Hardcoded allowlist (Q-05 MEDIUM)
`REPO_ROOT` + `TMP_ROOT` should be `ALLOWED_WRITE_ROOTS` array. Fixes WR-02 error message drift + SEC-C01 attack surface.
**Fix:** Refactor to whitelist. Combines with P1-SEC-01.

### P2-Q12 — escapeXml Unicode coverage (Q-12 LOW)
No tests for emoji, RTL marks, zero-width joiners, surrogate pairs in meta strings.
**Fix:** Add 3-4 parametric tests.

## Priority 3: Documentation drift

### P3-D01 — Status drift across tracking files (DOCS findings 1-5, HIGH)
- REQUIREMENTS.md DIAG-01..05 still `[ ] Pending`
- ROADMAP Phase 4 checkbox `[ ]`, progress `0/5`, last-updated `2026-05-03`
- STATE.md frontmatter vs body contradict (`current_phase: 04` vs "Current phase: 5"; `status: ready_to_plan` vs "EXECUTING")
- Plan 04-05 SUMMARY self-check asserts `grep -c "DIAG-0[1-5].*Phase 4.*Pending" = 5` — the drift state is baked into the verification gate
**Root cause:** `gsd-sdk query phase.complete` did not fully update the trackers. Bug in SDK or our workflow invocation.
**Fix:** Manually correct all 5 files, add regression test to gsd-sdk.

### P3-D02 — Runbook missing npm install + library name (DOCS, HIGH)
`diagrams-source/README.md` never names `@aldinokemal2104/excalidraw-to-svg@1.1.1` nor says `npm install`. First-time contributor gets "Cannot find module".
**Fix:** Add "## Prerequisites" H2 with `npm install` + library name.

### P3-D03 — Runbook Virgil recommendation contradicts shipped Helvetica (DOCS, HIGH)
Gotcha 1 tells contributors to use Virgil, but Karpenter shipped in Helvetica per deviation. Helvetica-escape-hatch (for >10-element diagrams) not documented.
**Fix:** Update Gotcha 1 with element-count threshold + Helvetica fallback pattern.

### P3-D04 — CLAUDE.md has zero Excalidraw mentions
Project CLAUDE.md covers Slidev but not Excalidraw pipeline. Says "Phase 7 Slidev" (SKIPPED in v1.0).
**Fix:** Add "## Diagrams Pipeline" section + update Slidev phase reference to Phase 5.

## Priority 4: Polish (LOW severity, deferrable)

- SEC-H04 (parsererror silent success) — edge case, requires specific meta payload
- SEC-L02 (BL-02 latent regex) — not currently exploitable; closed as side-effect of DOM-based injection in P1-SEC-02
- Q-10 (test.after() instead of try/unlinkSync) — style
- Q-13 (verbose stdout for batch workflows) — optional `--quiet` flag
- UX-05..10 (a11y secondary, figure/figcaption pattern, forced-colors mode) — enhancements
- DOCS-NITPICK findings (9-15) — consistency polish

## Suggested Phase 4.1 plan structure

**Wave 1 (parallel, independent files):**
- Plan 4.1-01: Security hardening (scripts/excalidraw-to-svg.mjs) — P1-SEC-01, P1-SEC-02, P1-SEC-03, P2-Q05 combined. Adds symlink test.
- Plan 4.1-02: UX fix (scripts + re-export) — P1-UX-01 (SVGO post-process white-bg removal), P1-UX-04 (Helvetica fallback chain)
- Plan 4.1-03: Docs drift fix (REQUIREMENTS/ROADMAP/STATE/runbook/CLAUDE.md) — P3-D01..D04

**Wave 2 (depends on Wave 1 security changes):**
- Plan 4.1-04: MCP diagram re-author — P1-UX-02, P1-UX-03 (label size + aspect ratio). Re-runs pipeline from Wave 1's fixed script.
- Plan 4.1-05: Test coverage gaps — P2-Q01, P2-Q02, P2-Q03, P2-Q04, P2-Q08, P2-Q12

**Wave 3 (cleanup):**
- Plan 4.1-06: Priority 4 polish (optional, can defer to v1.1)

Estimated effort: 6-8 hours of agent work + human re-author of MCP diagram (~15 min).
