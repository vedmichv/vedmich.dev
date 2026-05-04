---
phase: 04-excalidraw-pipeline
plan: 03
subsystem: blog-content
tags: [excalidraw, mcp-post, bilingual, wave-2, diag-04, svg-embed]

# Dependency graph
requires:
  - phase: 04-excalidraw-pipeline
    plan: 02
    provides: "scripts/excalidraw-to-svg.mjs (SVGO pipeline + a11y + 10 KB budget + path-traversal guard)"
  - phase: 04-excalidraw-pipeline
    plan: 01
    provides: "@aldinokemal2104/excalidraw-to-svg@1.1.1 devDep + valid-v2 excalidraw.json fixture shape"
provides:
  - "First real-use artifact of the PLAN-02 pipeline: diagrams-source/2026-03-02-mcp-servers-plainly-explained/ directory convention"
  - "public/blog-assets/2026-03-02-mcp-servers-plainly-explained/diagrams/client-server.svg (9673 B, 820×100 intrinsic)"
  - "Bilingual <img> embed pattern: identical src/width/height/loading/style across EN and RU; only alt differs"
  - "Empirical reference for label-subset vs. font-subset budget tradeoff (Pitfall 3 remedy: shorter labels → smaller embedded Virgil subset)"
affects: [04-04, 04-05]

# Tech tracking
tech-stack:
  added: []  # No new deps — consumes PLAN-02 script + PLAN-01 devDep
  patterns:
    - "Date-prefixed slug convention: diagrams-source/<blog-date-slug>/ + public/blog-assets/<blog-date-slug>/diagrams/ (matches existing karpenter-right-sizing asset layout)"
    - "Bilingual <img> parity: identical src/width/height/loading/style across locales; only alt differs — matches D-03d CLS prevention via numeric dimensions"
    - "Label-subset budget remedy: when Virgil font subset pushes SVG over 10 KB, shorten labels to reduce unique glyph count; full-fidelity text preserved in <desc>/alt for a11y"
    - "Authoring path: programmatic JSON → pipeline script → committed SVG. Human-in-Excalidraw remains optional; programmatic fallback is production-viable for simple diagrams"

key-files:
  created:
    - diagrams-source/2026-03-02-mcp-servers-plainly-explained/client-server.excalidraw.json (8 elements: 3 rectangles + 3 text labels + 2 bidirectional arrows)
    - diagrams-source/2026-03-02-mcp-servers-plainly-explained/client-server.meta.json (title + descEn + descRu)
    - public/blog-assets/2026-03-02-mcp-servers-plainly-explained/diagrams/client-server.svg (9673 B post-SVGO, intrinsic 820×100)
  modified:
    - src/content/blog/en/2026-03-02-mcp-servers-plainly-explained.md (3-line ASCII diagram → 7-line <img> embed)
    - src/content/blog/ru/2026-03-02-mcp-servers-plainly-explained.md (same shape, RU-localized alt)

key-decisions:
  - "Took the programmatic-fallback authoring path (user-approved via checkpoint override) — emitted a hand-written valid-v2 Excalidraw JSON with 8 elements matching the ASCII diagram's shape (3 labeled rectangles + 2 bidirectional arrows, left-to-right). Human-in-Excalidraw authoring remains possible later as a drop-in replacement without re-editing the MDX."
  - "Shortened visual labels from 'Client: Claude Code / MCP Server / External resource: docs / DB / API' (three lines of ASCII text) to 'Claude Code / MCP Server / docs / API' (3 single-line labels). Driver: Virgil font-face glyph subset dominates SVG bytes. Empirical data: original labels → 12,729 B (124 % of budget); shortened labels → 9,673 B (94 %). Full text preserved in <desc> (a11y-readable) and in the <img> alt attributes (screen-reader-readable), so meaning is not lost."
  - "Kept bidirectional arrows (startArrowhead + endArrowhead = 'arrow') matching the ←→ semantics of the original ASCII diagram."
  - "viewBox intrinsic dimensions: 820×100 (wide-aspect horizontal flow). Applied as literal numeric width/height attributes on both <img> tags per D-03d CLS prevention."

patterns-established:
  - "Programmatic Excalidraw JSON authoring is viable for simple box-and-arrow diagrams when human-in-app authoring is not available — produces SVGs indistinguishable in output from human-authored ones after SVGO optimization"
  - "Font-subset-driven budget math: Virgil's base64-embedded TTF subset scales ~linearly with unique-glyph count. Two lines of text with ~30 unique chars can push SVG over 10 KB on their own"

requirements-completed: [DIAG-04]

# Metrics
duration: ~25 min (exclude worktree rebase setup)
completed: 2026-05-04
---

# Phase 4 Plan 03: Wave 2 — MCP post ASCII→SVG swap (DIAG-04) Summary

**First real blog post wired to the Wave-1 pipeline: MCP client-server diagram shipped as 9,673 B SVG + bilingual `<img>` embed in both EN and RU locales, atomic 5-file commit, build green in 2.36 s.**

## Performance

- **Duration:** ~25 min net execution (setup: worktree rebase from cacf780 → bc1714b + npm install)
- **Started:** 2026-05-04T19:10:00Z (worktree HEAD reset)
- **Completed:** 2026-05-04T19:18:27Z (commit landed)
- **Tasks:** 3/3 (Task 1 author JSON+meta, Task 2 run pipeline, Task 3 MDX swap + build gate)
- **Files modified:** 5 (3 new + 2 edited)

## Accomplishments

- **DIAG-04 shipped** — first blog post migrated from ASCII to Excalidraw SVG embed. Pattern proven end-to-end: `.excalidraw.json` + `.meta.json` → `client-server.svg` (9,673 B) → bilingual `<img>` embed. Build green, dist HTML verified.
- **Pipeline budget headroom measured empirically** — original labels = 12.7 KB (24 % over budget). After shortening labels per Pitfall 3, 9.7 KB (94 % of budget, 567 B headroom). Single-word labels would drop to 7.8 KB (78 %). Font-subset base64 is the dominant byte consumer for text-heavy diagrams.
- **Bilingual parity achieved** — EN and RU `<img>` blocks have byte-identical `src`, `width`, `height`, `loading`, `style` attributes; only `alt` text differs (EN ASCII-scoped, RU Cyrillic). Matches D-03 D-03d contract.
- **Programmatic fallback path proven** — the user-approved programmatic JSON authoring (no human Excalidraw app pass) produces a valid v2 schema that the pipeline accepts and optimizes correctly. Can swap in a human-authored JSON later without touching the MDX.
- **Build performance unchanged** — 32 pages in 2.36 s (comparable to 04-02's 2.38 s baseline). No new runtime code, no @aldinokemal2104/@excalidraw leakage into `dist/` (boundary invariant holds: `grep -rE "@aldinokemal2104|@excalidraw" dist/` → 0 lines).

## Task Commits

Single atomic commit for all 3 tasks (per plan — `<files_modified>` lists 5 files, one commit is the canonical execution):

1. **Task 1–3: MCP client-server SVG + bilingual MDX swap** — `50ec3d0` (fix)
   - 5 files changed (+283/-6): 3 new (excalidraw.json, meta.json, SVG) + 2 edited (EN + RU MDX)
   - Commit message: `fix(04-03): mcp-servers — swap ASCII diagram for client-server SVG (EN + RU)`

**Plan metadata:** (this commit will be amended with SUMMARY.md by the executor commit that follows)

## Files Created/Modified

- `diagrams-source/2026-03-02-mcp-servers-plainly-explained/client-server.excalidraw.json` — 8 elements (3 rects + 3 text + 2 arrows, both arrows bidirectional via `startArrowhead: "arrow"` + `endArrowhead: "arrow"`). Uses the valid v2 schema with the same shape conventions as `tests/fixtures/excalidraw/minimal.excalidraw.json`. Virgil-only (`fontFamily: 1`).
- `diagrams-source/2026-03-02-mcp-servers-plainly-explained/client-server.meta.json` — 3 keys: `title` (EN, 30 chars), `descEn` (EN, 120 chars), `descRu` (RU, 114 chars). Exactly the strings mandated by PLAN 03 Task 1.
- `public/blog-assets/2026-03-02-mcp-servers-plainly-explained/diagrams/client-server.svg` — 9,673 bytes post-SVGO. Intrinsic viewBox `0 0 820 100`. Contains `<title>MCP client-server architecture</title>` + `<desc>Claude Code (client) connects via JSON-RPC…</desc>`. Zero `<script>` content (T-04-02 mitigated at export time + SVGO `removeScripts` defense-in-depth).
- `src/content/blog/en/2026-03-02-mcp-servers-plainly-explained.md` — replaced the 3-line ASCII fenced code block at lines 20-22 with a 7-line `<img>` block. EN alt: `"MCP client-server architecture: Claude Code connects to an MCP Server, which fans out to external resources (docs, databases, APIs)"`.
- `src/content/blog/ru/2026-03-02-mcp-servers-plainly-explained.md` — same `<img>` shape, RU-localized alt: `"Архитектура MCP клиент-сервер: Claude Code подключается к MCP-серверу, который обращается к внешним ресурсам (docs, DB, API)"`.

## Decisions Made

- **Programmatic authoring path selected** — user pre-approved via checkpoint override (`<checkpoint_override>` in the executor prompt). Committed a hand-written valid-v2 Excalidraw JSON with 8 elements matching the ASCII diagram's shape. Visual review deferred to a post-ship pass; a human-authored replacement can be dropped in later by overwriting the `.excalidraw.json` and re-running the pipeline — no MDX re-edit needed since `<img src>` and the meta stay identical.
- **Labels shortened to fit 10 KB budget (Pitfall 3 remedy)** — empirically found that Virgil's base64 font subset dominates SVG bytes. Tested three label variants:
  - "Client: Claude Code / MCP Server / External resource:\ndocs / DB / API" (original) → 12,729 B (**124 %** of budget — over)
  - "Claude Code / MCP Server / docs / API" (Variant A, chosen) → 9,673 B (**94 %** of budget)
  - "Claude / MCP / docs" (single-word fallback) → 7,835 B (**76 %** of budget — excessive information loss)
  
  Variant A preserves the core identity of each node ("Claude Code" = the client, "MCP Server" = the middle tier, "docs / API" = external resources). Information density sacrificed by the shorter labels is recovered by the `<title>` + `<desc>` embedded in the SVG (screen-reader accessible) + the alt text on the `<img>` (also screen-reader accessible; also visible on alt-hover in dev tools). The prose paragraphs on lines 14-24 of the post already explain the full tripartite flow in words.
- **Bidirectional arrows** — both arrows carry `startArrowhead: "arrow"` + `endArrowhead: "arrow"`, matching the ←→ semantics of the ASCII original and the post's prose ("The client passes the tools to the language model… The client sends that result back to the model").
- **Resource box sized at 240×80** (wider than the other two 200×80 boxes) — gives breathing room for "docs / API" label even though it's shorter than originally planned.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 — Budget Bug] Shortened visual labels to fit the 10 KB SVG budget**
- **Found during:** Task 2 (first pipeline run)
- **Issue:** First pipeline invocation with the plan-specified labels ("Client: Claude Code" / "MCP Server" / "External resource:\ndocs / DB / API") produced a 12,729-byte SVG — 24 % over the 10,240-byte budget. Pipeline exited 1 with `SVG is 12729 B (12.4 KB), exceeds 10 KB budget`. Root cause: Excalidraw's wrapper embeds Virgil as a glyph-subset TTF base64 blob inline in the SVG; the subset scales with unique-character count, and the plan's labels cover ~32 unique glyphs across 3 lines.
- **Fix:** Shortened the 3 visual labels to "Claude Code" / "MCP Server" / "docs / API" (20 unique glyphs total). Re-ran the pipeline. Output: 9,673 B (94 % of budget). Full-fidelity text is preserved in the SVG `<desc>` element and in the `<img alt>` attributes on both locales — so a11y meaning is not lost.
- **Files modified:** `diagrams-source/2026-03-02-mcp-servers-plainly-explained/client-server.excalidraw.json` (three `text` and matching `originalText` fields shortened; text-resource box also resized from 48 px two-line height to 24 px single-line height + y moved 108 to 100 to keep vertical centering).
- **Verification:** `wc -c client-server.svg` = 9673 (within budget). Post-commit: the MDX `<img alt>` text on both EN and RU carries the full "docs, databases, APIs" phrasing.
- **Why Rule 1 (bug) not Rule 4 (architectural):** the plan explicitly documents this exact remedy in Task 2 (`<action>` block, "If the script exits 1 with 'exceeds 10 KB budget': … shorten labels"). The plan anticipated the budget tension and pre-authorized the remedy. No architectural change; no alternative SVG-export path needed.
- **Committed in:** `50ec3d0`

### Plan Assertion Overspecification (not a code deviation, but worth documenting)

**2. [Assertion scope mismatch] Plan's `! grep -q '<script' dist/…/index.html` asserts a post-condition that was never achievable on this site**
- **Found during:** Task 3 build-gate verification.
- **Issue:** The plan's Task 3 `<action>` includes `! grep -q '<script' dist/en/blog/2026-03-02-…/index.html` as a "T-04-02 post-build XSS defense" gate. This grep FAILS because every Astro-generated page on this site contains 3 `<script>` tags from the BaseLayout (mobile menu toggle, copy-button toolbar, scroll-observer, search-index JSON). Empirically verified on 3 other blog pages (karpenter-right-sizing, why-i-write-kubernetes-manifests-by-hand, hello-world) — all of them have exactly 3 `<script>` tags. This is a site-wide baseline, NOT a regression from the SVG swap.
- **What the plan actually protects against:** T-04-02 is specifically about XSS-via-inlined-SVG — a `<script>` inside an inlined `<svg>` rendering as executable script in the page. Our approach is `<img src="…">` (external SVG file), not `<svg>…</svg>` inlined. So no SVG content reaches the built HTML at all, making the literal `<script>` grep a category mistake.
- **What IS verified for T-04-02 (semantic intent):**
  - `! grep -q '<script' public/blog-assets/.../client-server.svg` — **passes** (the SVG asset itself has zero scripts; SVGO's `removeScripts` + the programmatic JSON author producing no scripts both contribute)
  - `grep -c 'diagrams/client-server.svg' dist/en/blog/.../index.html` = 1 — **passes** (embed is `<img>`, not `<svg>` inlining)
  - `grep -c 'diagrams/client-server.svg' dist/ru/blog/.../index.html` = 1 — **passes**
  - `grep -rE "@aldinokemal2104|@excalidraw" dist/` — **0 lines** (no wrapper leakage)
  - `grep -rE "@aldinokemal2104|@excalidraw" src/` — **0 lines** (Pitfall 6 boundary holds)
- **No fix needed:** this is a plan-assertion scope mismatch, not a code bug. The plan's `<acceptance_criteria>` literal grep is overspecified; the plan's `<threat_model>` semantic intent is satisfied. Per SCOPE BOUNDARY rule (only auto-fix issues DIRECTLY caused by current task's changes), pre-existing site-wide BaseLayout scripts are not fixable here and not relevant to T-04-02's actual threat model.
- **Follow-up (out of scope):** if PLAN 04 or PLAN 05 also includes this literal-grep assertion, the authors may want to refine it to `grep "diagrams/.*\.svg" dist/…/index.html | grep -q '<script'` (script-inside-the-SVG-embed-region check) or simply drop it in favor of the asset-level `! grep '<script' public/blog-assets/.../*.svg` check which is both tighter and more meaningful.

---

**Total deviations:** 1 auto-fixed (Rule 1 bug) + 1 assertion-scope note (no code change).
**Impact on plan:** the Rule 1 fix was pre-authorized by the plan's Pitfall 3 remedy text. The assertion-scope note is documentation-only — the actual T-04-02 security posture is intact.

## Issues Encountered

- **Worktree base drift:** worktree was at `cacf780` (Phase 3 tip) but the plan requires PLAN-02 artifacts at `bc1714b`. Reset HEAD forward to `bc1714b` (safe — worktree HEAD was a strict ancestor of the target; `git log bc1714b..HEAD` returned empty, so nothing was lost). Then `npm install` to get `svgo` and `@aldinokemal2104/excalidraw-to-svg` into `node_modules/` (dev-deps already in `package.json`, just missing from the worktree's fresh node_modules).
- **Node module resolution in `/tmp/`:** early exploration wrote an inspection script to `/tmp/inspect-svg.mjs`, which failed to resolve `@aldinokemal2104/excalidraw-to-svg` (script outside repo → no access to `node_modules`). Fix: moved inspection scripts to `scripts/_inspect-*.mjs` inside the repo (resolves deps correctly), deleted them after use. No artifacts committed.

## User Setup Required

None — no external service configuration required. The `<img>` src is a relative URL served from Astro's `public/` dir, which GitHub Pages deploys automatically.

## Next Phase Readiness

- **PLAN 04 ready to execute** — pattern is proven end-to-end. Future diagrams (Karpenter consolidation flow, K8s rolling update, ETCD cluster) can follow the same date-prefixed-slug convention and invoke the pipeline script the same way.
- **10 KB budget caveat for PLAN 04/05 authors** — text-heavy labels can chew the budget. Keep visual labels to ≤ 20 unique glyphs total across all text elements, OR use shapes with color coding + legends instead of verbose labels. If a diagram genuinely needs long labels, consider splitting into two simpler diagrams.
- **Zero open blockers.** The pipeline, the asset-path convention, and the bilingual `<img>` embed shape are all validated. PLAN 04 is unblocked.

## Threat Flags

None. No new trust boundaries introduced beyond PLAN 02's cataloged T-04-01/02/03:
- T-04-01 (path traversal) — verified: both paths (`diagrams-source/.../client-server.excalidraw.json` and `public/blog-assets/.../client-server.svg`) resolve under REPO_ROOT; script's guard accepted both. No attempt to write outside the repo.
- T-04-02 (XSS-as-SVG) — verified (see Deviation §2 for the plan-assertion scope discussion). The asset SVG has no script; the `<img>` embed pattern structurally excludes SVG-sourced scripts from ever reaching the built HTML.
- T-04-03 (oversized files blob) — N/A: the authored `files: {}` is empty (no embedded rasters), so the 100 KB budget is trivially respected.

No new network endpoints. No new auth paths. No new file-access patterns. No new schema. Plan 03 is a pure content-migration with zero new surface.

## Self-Check: PASSED

**File existence verified:**
- `diagrams-source/2026-03-02-mcp-servers-plainly-explained/client-server.excalidraw.json` — FOUND
- `diagrams-source/2026-03-02-mcp-servers-plainly-explained/client-server.meta.json` — FOUND
- `public/blog-assets/2026-03-02-mcp-servers-plainly-explained/diagrams/client-server.svg` — FOUND (9,673 B)
- `src/content/blog/en/2026-03-02-mcp-servers-plainly-explained.md` — MODIFIED (←→ ASCII gone; `<img>` embed present)
- `src/content/blog/ru/2026-03-02-mcp-servers-plainly-explained.md` — MODIFIED (←→ ASCII gone; `<img>` embed present)

**Commit hash verified in git log:**
- `50ec3d0` — FOUND (`fix(04-03): mcp-servers — swap ASCII diagram for client-server SVG (EN + RU)`)

**Plan success criteria re-run:**
- `! grep -q "←→" src/content/blog/en/2026-03-02-mcp-servers-plainly-explained.md` — passes (ASCII gone, EN).
- `! grep -q "←→" src/content/blog/ru/2026-03-02-mcp-servers-plainly-explained.md` — passes (ASCII gone, RU).
- `grep -q 'diagrams/client-server.svg' src/content/blog/en/…` — passes.
- `grep -q 'diagrams/client-server.svg' src/content/blog/ru/…` — passes.
- `grep -q 'loading="eager"' src/content/blog/en/…` — passes.
- `grep -q 'loading="eager"' src/content/blog/ru/…` — passes.
- `grep -q 'width="820"' … && grep -q 'height="100"' …` — passes (both locales).
- `grep -q 'alt="MCP client-server architecture' src/content/blog/en/…` — passes.
- `grep -q 'alt="Архитектура MCP' src/content/blog/ru/…` — passes.
- `wc -c public/blog-assets/.../client-server.svg` = 9673 (≤ 10240) — passes.
- `grep -q '<title>MCP client-server architecture</title>' public/blog-assets/.../client-server.svg` — passes.
- `grep -q '<desc>' public/blog-assets/.../client-server.svg` — passes.
- `! grep -q '<script' public/blog-assets/.../client-server.svg` — passes.
- `grep -cE 'viewBox="[^"]+"' public/blog-assets/.../client-server.svg` = 1 — passes.
- `npm run build` — exits 0, 32 pages in 2.36 s.
- `grep -q 'diagrams/client-server.svg' dist/en/blog/2026-03-02-…/index.html` — passes.
- `grep -q 'diagrams/client-server.svg' dist/ru/blog/2026-03-02-…/index.html` — passes.
- `grep -rE "@aldinokemal2104|@excalidraw" dist/` — 0 lines (boundary clean).
- `grep -rE "@aldinokemal2104|@excalidraw" src/` — 0 lines (boundary clean).
- `find public/blog-assets -path '*/diagrams/*.svg' | wc -l` = 1 — passes (≥ 1, first diagram shipped).
- `npm run test:unit` — 44/44 pass, 0 fail (5.0 s) — no regressions.

**No spurious modifications:**
- `git status --porcelain` — clean (only the pending SUMMARY.md is untracked, which will land in the executor's metadata commit).
- No deletions in the task commit (`git diff --diff-filter=D HEAD~1 HEAD` — empty).
