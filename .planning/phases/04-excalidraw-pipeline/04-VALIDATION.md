---
phase: 4
slug: excalidraw-pipeline
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-05-03
---

# Phase 4 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.
> Derived from `04-RESEARCH.md` §Validation Architecture (lines 632-682).

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | `node --test` (builtin) + `node:assert/strict` — matches `tests/unit/*.test.ts` |
| **Config file** | none — `tests/unit/*.test.ts` glob in `package.json` `scripts.test:unit` picks up new test files automatically |
| **Quick run command** | `npm run test:unit` |
| **Full suite command** | `npm run test:unit && npm run build` |
| **Estimated runtime** | ~5s (unit) + ~90s (full Astro build) |

---

## Sampling Rate

- **After every task commit:** `npm run test:unit`
- **After every plan wave:** `npm run test:unit && npm run build`
- **Before `/gsd-verify-work`:** Full suite green + all DIAG-0X grep assertions pass + human visual sign-off on live `/en/blog/mcp-servers-plainly-explained/` + RU mirror
- **Max feedback latency:** ~5s

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Threat Ref | Secure Behavior | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|------------|-----------------|-----------|-------------------|-------------|--------|
| TBD | TBD | 1 | DIAG-01 | T-04-01 (path traversal) | Resolve + assert paths under repo root | integration | `node --test tests/unit/excalidraw-to-svg.test.ts` (::exports-valid-svg) | ❌ W0 | ⬜ pending |
| TBD | TBD | 1 | DIAG-01 | — | Script errors on missing meta sibling | integration | `tests/unit/excalidraw-to-svg.test.ts::errors-on-missing-meta` | ❌ W0 | ⬜ pending |
| TBD | TBD | 1 | DIAG-01 | — | Script errors on missing input file | integration | `tests/unit/excalidraw-to-svg.test.ts::errors-on-missing-input` | ❌ W0 | ⬜ pending |
| TBD | TBD | 1 | DIAG-02 | — | Output SVG ≤ 10 KB after SVGO | integration | `tests/unit/excalidraw-to-svg.test.ts::under-10kb-budget` | ❌ W0 | ⬜ pending |
| TBD | TBD | 1 | DIAG-02 | — | Script exits 1 + prints budget diagnostic if SVG > 10 KB | integration | `tests/unit/excalidraw-to-svg.test.ts::exits-on-oversize` | ❌ W0 | ⬜ pending |
| TBD | TBD | 1 | DIAG-03 | — | Output SVG contains `<title>` with author-supplied text | unit (post-SVGO) | `tests/unit/excalidraw-to-svg.test.ts::preserves-title` | ❌ W0 | ⬜ pending |
| TBD | TBD | 1 | DIAG-03 | — | Output SVG contains `<desc>` with author-supplied text (validates `removeDesc: false`) | unit | `tests/unit/excalidraw-to-svg.test.ts::preserves-desc` | ❌ W0 | ⬜ pending |
| TBD | TBD | 1 | DIAG-03 | — | Output path is `public/blog-assets/<slug>/diagrams/<name>.svg` | integration | `tests/unit/excalidraw-to-svg.test.ts::writes-to-canonical-path` | ❌ W0 | ⬜ pending |
| TBD | TBD | 2 | DIAG-04 | T-04-02 (XSS via text) | SVGO `removeScripts` strips `<script>`; `escapeXml()` on injected `<title>`/`<desc>` | E2E / content | `grep -q 'diagrams/client-server.svg' src/content/blog/en/2026-03-02-mcp-servers-plainly-explained.md && ! grep -q '←→' src/content/blog/en/2026-03-02-mcp-servers-plainly-explained.md` | ❌ W0 | ⬜ pending |
| TBD | TBD | 2 | DIAG-04 | — | RU locale parity | E2E / content | Same grep against `src/content/blog/ru/...md` | ❌ W0 | ⬜ pending |
| TBD | TBD | 2 | DIAG-04 | — | Built HTML contains `<img>` with correct src/alt | E2E / build | `npm run build && grep -q 'src="/blog-assets/mcp-servers-plainly-explained/diagrams/client-server.svg"' dist/en/blog/mcp-servers-plainly-explained/index.html` | ❌ W0 | ⬜ pending |
| TBD | TBD | 2 | DIAG-04 | — | `<img>` has explicit `width`/`height` (CLS prevention) | E2E / build | `grep -qE 'width="[0-9]+" height="[0-9]+"' dist/en/blog/mcp-servers-plainly-explained/index.html` | ❌ W0 | ⬜ pending |
| TBD | TBD | 2 | DIAG-05 | — | ≥ 2 total diagrams under `public/blog-assets/*/diagrams/*.svg` | integration | `find public/blog-assets -path '*/diagrams/*.svg' \| wc -l` returns ≥ 2 | ❌ W0 | ⬜ pending |
| TBD | TBD | 2 | DIAG-05 | — | Karpenter post contains `<img src="/blog-assets/2026-03-20-karpenter-right-sizing/diagrams/...svg">` | E2E / content | `grep -q 'diagrams/.*\.svg' src/content/blog/en/2026-03-20-karpenter-right-sizing.mdx` | ❌ W0 | ⬜ pending |
| TBD | TBD | all | — (boundary) | — | `@excalidraw/*` NEVER imported from `src/` (PITFALLS Pitfall 6) | static grep gate | `! grep -rE '@excalidraw\|@aldinokemal2104' src/` | ❌ W0 | ⬜ pending |
| TBD | TBD | all | — (boundary) | — | No runtime JS added to prod bundle | E2E / build | `npm run build && ! grep -rE '@excalidraw\|@aldinokemal2104' dist/` | ❌ W0 | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

*Task IDs are TBD — planner assigns task-level mapping during plan generation.*

---

## Wave 0 Requirements

- [ ] `tests/unit/excalidraw-to-svg.test.ts` — new test file, covers DIAG-01/02/03 with fixture JSON (mirror `tests/unit/shiki-palette-guard.test.ts` structure)
- [ ] `tests/fixtures/excalidraw/minimal.excalidraw.json` — ~5-element fixture (< 2 KB JSON) for unit test reproducibility
- [ ] `tests/fixtures/excalidraw/minimal.meta.json` — `{ title, descEn, descRu }` test triple
- [ ] `tests/fixtures/excalidraw/oversize.excalidraw.json` — ~40-element fixture to trip the 10 KB budget test
- [ ] `package.json` devDep — primary: `@aldinokemal2104/excalidraw-to-svg@1.1.1` (subject to D-01 reconciliation — see RESEARCH §Deviation Note)
- [ ] `scripts/excalidraw-to-svg.mjs` — the pipeline script itself (mirror `scripts/generate-icons.mjs` shape)
- [ ] `diagrams-source/README.md` — author runbook (zoom-to-fit → export → meta → run script → verify budget)

Framework install: none — `node:test` built in, `@types/node` already transitive via Astro.

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Diagram renders legibly on `/en/blog/mcp-servers-plainly-explained/` at 1440px + 375px | DIAG-04 | Visual legibility is subjective | `npm run dev`, open in browser, verify diagram is readable, not cramped, correctly aligned in prose flow. Playwright MCP screenshot for record. |
| RU locale diagram alt text reads naturally | DIAG-04 | Language fluency check | Read `alt="..."` on `<img>` in `src/content/blog/ru/2026-03-02-mcp-servers-plainly-explained.md` — confirm native-sounding phrasing |
| Excalidraw palette aesthetic intact (blue strokes, yellow fills preserved) | D-03b | Aesthetic QA | View SVG in browser — hand-sketched feel preserved, no unintended monochrome collapse |
| Karpenter DIAG-05 diagram clarifies the prose around lines 55-59 (split-ownership) | DIAG-05 | Content-fit judgment | Read the post section; confirm diagram adds clarity vs. ASCII/prose-only narrative |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references (fixtures, test file, devDep install, script, runbook)
- [ ] No watch-mode flags
- [ ] Feedback latency < 5s (unit) / < 90s (full with build)
- [ ] `nyquist_compliant: true` set in frontmatter after Wave 0 lands

**Approval:** pending
