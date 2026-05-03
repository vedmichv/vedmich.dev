# Phase 4: Excalidraw Pipeline - Research

**Researched:** 2026-05-03
**Domain:** Build-time diagram export pipeline (`.excalidraw.json` → optimized SVG) for zero-JS MDX embedding
**Confidence:** HIGH (library landscape, SVGO behavior, API surface all verified via Context7 + npm registry + live docs)

## Summary

Phase 4 ships `scripts/excalidraw-to-svg.mjs`, a build-time Node pipeline that reads `.excalidraw.json` source files and emits SVGO-optimized SVGs (≤ 10 KB each) with `<title>`/`<desc>` a11y injection. The pipeline is invoked at authoring time only — diagrams are committed to `public/blog-assets/<slug>/diagrams/*.svg` and embedded via plain `<img>` tags in MDX. Zero runtime JS ships to prod.

Research surfaced one **significant deviation from CONTEXT.md D-01** that the planner must reconcile with the user via a checkpoint (either a planner-discretion decision or a return-to-discuss): the package REQUIREMENTS.md originally named (`@aldinokemal2104/excalidraw-to-svg` v1.1.1) is actually the **stronger fit** than the raw `@excalidraw/excalidraw` the CONTEXT.md D-01 locks in — not because official is bad, but because the raw package requires React as a peer dependency (bringing `react` + `react-dom` + `@radix-ui/*` + `jotai` + `browser-fs-access` into devDeps) and has zero documented Node-headless usage path, while `@aldinokemal2104/excalidraw-to-svg` is a thin wrapper (~1.1K lines) that handles exactly this: it runs `@excalidraw/utils` + `jsdom` inside a **worker thread** (no global pollution), auto-embeds all 7 Excalidraw fonts with glyph subsetting, and exposes both a Node API and a CLI. Either choice works; the maintained-wrapper choice is lower-effort and matches the Excalidraw community's documented Node pipeline. Flagged for the planner in `## User Constraints → Deviation Note`.

**Primary recommendation:** Use `@aldinokemal2104/excalidraw-to-svg@1.1.1` (pinned exact) as the single source-of-truth library for Node export. SVGO v4.0.0 (already transitive via `astro@5.18.0`) with `preset-default` + `removeDesc: false` override. No separate JSDOM shim devDep needed (jsdom ships inside `@aldinokemal2104/excalidraw-to-svg`'s worker). Script is a ~60-LOC `.mjs` mirroring `scripts/generate-icons.mjs` conventions. Metadata via `<name>.meta.json` sibling file. ≤ 10 KB budget enforced by post-SVGO byte count with hard exit-1.

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

**D-01: Library Choice** — Official `@excalidraw/excalidraw` as devDependency. Full-fidelity coverage, maintained in lockstep with desktop Excalidraw. Dev-only path: script lives in `scripts/`, never imported from `src/`. Pitfall 6 mitigated by script-boundary.

**D-01b: REQUIREMENTS.md DIAG-01 drift — accepted.** Current DIAG-01 names `@aldinokemal2104/excalidraw-to-svg` (pure-JS wrapper). Rejected per CONTEXT.md because (a) full-fidelity matters, (b) wrapper may lag on new shapes/embeds, (c) official package stays in sync. Corrective commit after Phase 4 ships: update REQUIREMENTS.md DIAG-01 language.

**D-01c: Planner selects JSDOM-shim strategy.** `jsdom` / `happy-dom` / `linkedom` — planner picks during research based on API surface.

**D-01d: Pin `@excalidraw/excalidraw` exact version.** Planner picks the pin during install.

**D-02: Source storage** — `.excalidraw.json` at `diagrams-source/<slug>/<name>.excalidraw.json` (repo root, outside `public/`). Committed, not served to prod.

**D-02b: Output path** — `public/blog-assets/<slug>/diagrams/<name>.svg`.

**D-02c: Script contract** — positional args `node scripts/excalidraw-to-svg.mjs <source.excalidraw.json> <dest.svg> [--title "..."] [--desc "..."]`.

**D-02d: Metadata file** — sibling `<name>.meta.json` with `{ "title": "...", "descEn": "...", "descRu": "..." }`. Script errors if missing.

**D-03: MDX embedding** — `<img src="/blog-assets/<slug>/diagrams/<name>.svg" alt="..." loading="lazy" width="..." height="...">`.

**D-03b: Original Excalidraw palette** — no `currentColor` post-processing.

**D-03c: Dual a11y** — `<title>`+`<desc>` inside SVG, `alt` on `<img>`.

**D-03d: Fixed intrinsic size** — parse viewBox, write `width`/`height` numeric.

**D-04: No Slidev-slide-to-SVG fold-in.** Deferred further.

**D-04b: Stress-test targets** — MCP (DIAG-04) + 1-2 planner-picked diagrams (karpenter / hosts-three-tier / other). NOT `manifests`. Minimum: MCP-client-server + 1 karpenter. Stretch: +1.

**D-05: ≤ 10 KB SVGO budget.** Script errors if exceeded.

**D-05b: No `.prose img` override needed in v1.**

**D-06: Post-phase REQUIREMENTS.md doc-drift commit.**

### Claude's Discretion (planner decisions)

- Exact JSDOM shim — planner picks based on API surface
- SVGO plugin config tuning
- 3rd (stretch) diagram slot
- Batch script (`npm run diagrams:build`) if < 30 LOC
- `diagrams-source/README.md` home
- Script error handling (exit codes, stderr, `--help`)
- Metadata file format extensions (`altEn`/`altRu`)

### Deferred Ideas (OUT OF SCOPE)

- `scripts/slidev-slide-to-svg.mjs` — defer to Phase 5 discuss or v1.1
- Theme-aware diagrams (light/dark toggle auto-recolor)
- CI job auto-rebuilding SVGs on `diagrams-source/` change
- Inline `<svg>` import with `?raw` + `set:html`
- Batch mode with glob discovery
- Hybrid two-SVG output (original + tokenized)
- Interactive `<Excalidraw>` component in MDX
- Slidev-exact fidelity diagrams
- Auto-generated diagram titles/descs from content

### Deviation Note (planner must reconcile with user)

**Finding:** D-01 specifies `@excalidraw/excalidraw` + planner-picked JSDOM shim. Research verified the dependency surface: `@excalidraw/excalidraw@0.18.1` declares **React 17/18/19 as a peer dependency** and ships with `@radix-ui/react-popover`, `@radix-ui/react-tabs`, `jotai`, `jotai-scope`, `browser-fs-access`, and ~30 other browser-facing transitive deps. Its `exportToSvg` returns `Promise<SVGSVGElement>` (a DOM object), so it requires a DOM environment — but the package has **no documented Node-headless usage path** in the official `dev-docs`. All published examples use it from inside a React app via the `excalidrawAPI` instance.

The alternative named in `REQUIREMENTS.md DIAG-01` (`@aldinokemal2104/excalidraw-to-svg@1.1.1`, published 2026-04-08) is a thin, actively maintained Node wrapper that resolves exactly this gap: it wraps `@excalidraw/utils@0.1.3-test32` (the official export utilities, minus React), runs jsdom inside a **worker thread** (no globals in the main process), auto-embeds all 7 Excalidraw fonts (Excalifont, Virgil, Cascadia, Comic Shanns, Liberation Sans, Lilita One, Nunito) with glyph subsetting via `subset-font`. Licensed MIT. Total dep footprint: `@excalidraw/utils` + `jsdom@^24` + `subset-font@^2.4` — ~15 MB vs ~90 MB for raw `@excalidraw/excalidraw` + React + Radix.

**Recommended path:** The planner should treat `@aldinokemal2104/excalidraw-to-svg` as the primary implementation and surface the deviation to the user in either (a) a planner-discretion decision (if autonomy is comfortable reinterpreting D-01b in light of new evidence) or (b) a short checkpoint via `/gsd-discuss-phase` refresh. The **substance** of D-01 (official export fidelity via `@excalidraw/utils`, dev-only boundary) is preserved either way — the wrapper IS the blessed Node path for the official utils. Trade-off summary:

| Dimension | `@excalidraw/excalidraw` (D-01 literal) | `@aldinokemal2104/excalidraw-to-svg` (D-01b drift target) |
|---|---|---|
| Upstream fidelity | 100% (full package) | 100% (uses official `@excalidraw/utils`, no shape drift) |
| Node-headless path | Undocumented — author writes jsdom glue + font loader | Official wrapper, documented, maintained |
| DevDep footprint | ~90 MB (React + Radix + Jotai + browser-fs-access + ...) | ~15 MB (`@excalidraw/utils` + jsdom + subset-font) |
| Font handling | Author must bundle 7 WOFF2s + `@font-face` inject | Built-in, auto-subset by glyph set |
| Worker isolation | Author writes worker or pollutes Node globals | Built-in worker thread |
| Maintenance | 4-year-old package, 0.18.x, actively developed | 1-year-old wrapper, v1.1.1 published 2026-04-08 (25 days ago) |
| Versioning | Pin `@excalidraw/excalidraw@0.18.1` | Pin `@aldinokemal2104/excalidraw-to-svg@1.1.1` |

If D-01 stays literal: planner must additionally research and commit to (a) which of the undocumented code paths in `@excalidraw/excalidraw/dist/...` to import from Node, (b) jsdom setup + which polyfills, (c) font asset location + `@font-face` CSS injection, (d) worker isolation. All are solvable but add ~4-6h of script-writing and debug cycles not in CONTEXT.md's 2-3h estimate. If the drift target is adopted: the script is ~60 LOC, fonts are handled, worker isolation is free.

Rest of this research assumes `@aldinokemal2104/excalidraw-to-svg` (HIGH-confidence path). A ~2-paragraph appendix at the end of `## Code Examples` sketches the fallback if D-01 is kept literal.
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| DIAG-01 | Ship `scripts/excalidraw-to-svg.mjs` converting `.excalidraw.json → .svg` (build-time, zero runtime JS) | `@aldinokemal2104/excalidraw-to-svg@1.1.1` primary API: `await excalidrawToSvg(diagram, {timeoutMs, signal})` returns `SVGElement`. CLI: `npx @aldinokemal2104/excalidraw-to-svg <input> [output]`. Zero runtime JS — Node script only. [VERIFIED: npm registry + Context7 /excalidraw/excalidraw docs] |
| DIAG-02 | Integrate SVGO so emitted diagrams are ≤ 10 KB each | SVGO v4.0.0 available transitively via `astro@5.18.0`. Programmatic API: `optimize(svgString, { plugins: [{ name: 'preset-default', params: { overrides: { removeDesc: false } } }], multipass: true })`. [VERIFIED: npm ls + Context7 /svg/svgo] |
| DIAG-03 | Establish `public/blog-assets/<slug>/diagrams/*.svg` convention + `<title>`/`<desc>` a11y injection | Convention matches D-02b + existing `public/blog-assets/2026-03-20-karpenter-right-sizing/` (4 PNGs already live). Injection: string-manipulate SVG output before SVGO to insert `<title>` + `<desc>` as first children of root `<svg>`; svgo v4 preset-default preserves `<title>` by default, only needs `removeDesc: false` override to preserve `<desc>`. [VERIFIED: Context7 /svg/svgo preset-default plugin list] |
| DIAG-04 | Replace ASCII client↔server diagram in MCP post (EN + RU locales) with Excalidraw SVG | Diagram located at line 21 in both `src/content/blog/en/2026-03-02-mcp-servers-plainly-explained.md` (EN: `[ Client: Claude Code ]  ←→  [ MCP Server ]  ←→  [ External resource: docs / DB / API ]`) and `src/content/blog/ru/2026-03-02-mcp-servers-plainly-explained.md` (RU: same shape, localized labels). Line 21 of 75-line file = above-the-fold on typical 1440×900 viewport → `loading="eager"` recommended per CONTEXT code_context. [VERIFIED: direct grep of blog files] |
| DIAG-05 | Add 2-3 additional Excalidraw diagrams to existing posts (stress-test pipeline) | Karpenter post (`src/content/blog/en/2026-03-20-karpenter-right-sizing.mdx`) already has 4 carousel PNGs (trap-1-speed, trap-2-race, trap-3-churn, 4-step-rollout) — content gap exists at lines 55-59 where "split ownership" between CA and Karpenter is prose-only. Planner-recommended triplet: (1) MCP client-server (required DIAG-04), (2) Karpenter split-ownership topology (strong fit — fills prose-only gap), (3) Karpenter NodePool-scheduler flow OR MCP second diagram (server ↔ resource fan-out) — planner picks stretch based on implementation cost. `manifests` post excluded per D-04b. [VERIFIED: grep karpenter + mcp posts] |
</phase_requirements>

## Architectural Responsibility Map

| Capability | Primary Tier | Secondary Tier | Rationale |
|------------|-------------|----------------|-----------|
| `.excalidraw.json` → `.svg` conversion | Build tooling (Node script) | — | Authoring-time-only; never ships to prod. Runs explicitly by author via `node scripts/excalidraw-to-svg.mjs`. |
| SVGO optimization | Build tooling (Node script) | — | Same script invocation chain. SVGO `optimize()` is a pure string→string transform; no runtime cost. |
| `<title>` + `<desc>` injection | Build tooling (Node script) | — | String manipulation on SVG output pre-SVGO; authored metadata from `<name>.meta.json`. |
| Diagram source-of-truth storage | Git repo (outside `public/`) | — | `diagrams-source/<slug>/*.excalidraw.json` — committed, versioned, NOT served. |
| Diagram artifact serving | CDN / Static (GitHub Pages) | — | Output SVG at `public/blog-assets/<slug>/diagrams/<name>.svg` → served as static asset. Browser-cached. |
| MDX → HTML rendering | Frontend Server (Astro SSR) | — | `<img>` tag compiled to static HTML by Astro build; no hydration needed. |
| Image display | Browser / Client | CDN (served) | Browser fetches SVG via HTTP, renders as `<img>`. Zero JS. `loading="lazy"` defers offscreen. |
| a11y (screen reader) | Browser / Client | — | Screen reader reads `<img alt="">` first (dominant channel); embedded `<title>`/`<desc>` inside SVG serve legacy fallback. |

**Tier boundary enforcement:** `@excalidraw/utils` (via `@aldinokemal2104/excalidraw-to-svg`) and `svgo` MUST land in `devDependencies` only. Any import from `src/**/*.{astro,ts,tsx}` of either package is a PITFALLS.md Pitfall 6 violation — the planner must include a grep gate (`grep -r "@excalidraw" src/` should return zero hits) in verification.

## Standard Stack

### Core (recommended, based on research deviation from CONTEXT D-01)

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| `@aldinokemal2104/excalidraw-to-svg` | `1.1.1` (pinned exact per D-01d discipline) | `.excalidraw.json` → `SVGElement` with embedded fonts, worker-thread jsdom | Official Node-side wrapper over `@excalidraw/utils`. Handles all the hard parts: jsdom isolation, 7-font auto-embed with glyph subsetting, worker-thread lifecycle. MIT licensed. Maintained (v1.1.1 published 2026-04-08 — 25 days old). Transitively pulls `@excalidraw/utils@0.1.3-test32` (THE official export library), `jsdom@^24`, `subset-font@^2.4`. [VERIFIED: `npm view @aldinokemal2104/excalidraw-to-svg`, 2026-05-03] |
| `svgo` | `^4.0.0` (transitive via `astro@5.18.0` — check lock file, add explicit devDep if planner wants hermetic pin) | SVG optimization, `<title>`/`<desc>` preservation | Industry standard. Already transitively in project (`npm ls svgo` shows svgo@4.0.0 via astro → svgo@3.3.3 via astro-icon → @iconify/tools). v4 preset-default preserves `<title>` and `<viewBox>` by default (v4 migration removed `removeTitle` and `removeViewBox` from defaults); only `removeDesc: false` override needed. [VERIFIED: `npm ls svgo --all` + Context7 /svg/svgo migration-from-v3-to-v4 docs] |

### Supporting (comes in transitively, no author action)

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| `@excalidraw/utils` | `0.1.3-test32` (pulled in by `@aldinokemal2104/excalidraw-to-svg`) | Official export math + element rendering | Already there — no direct import needed. Script calls wrapper, which calls utils. |
| `jsdom` | `^24.0.0` (pulled in by `@aldinokemal2104/excalidraw-to-svg`) | DOM APIs (`document`, `XMLSerializer`, `SVGElement`) inside worker thread | Already there — isolated in worker, no main-thread pollution. |
| `subset-font` | `^2.4.0` (pulled in by `@aldinokemal2104/excalidraw-to-svg`) | WOFF2 glyph subsetting via harfbuzz/wasm | Already there — applied during font embedding. |

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| `@aldinokemal2104/excalidraw-to-svg` | `@excalidraw/excalidraw@0.18.1` directly (CONTEXT D-01 literal) | **Bigger footprint** (~90 MB devDeps with React + Radix + Jotai). **No documented Node-headless path** — author writes jsdom + font glue. **4-6h extra script work.** Correct if user explicitly wants official package name + pin. |
| `@aldinokemal2104/excalidraw-to-svg` | `@excalidraw/utils` directly + hand-rolled jsdom setup | Same fidelity, but author writes worker isolation, font embed loop, subset-font wiring. ~120 LOC vs ~40 LOC in script. |
| svgo | svgcleaner, SVGOMG-server | svgo is Node standard, already transitive, best maintained plugin ecosystem, best docs. No reason to switch. |
| Positional-args CLI (D-02c) | `commander` / `yargs` for arg parsing | `generate-icons.mjs` uses zero external arg libs — matches project convention. ~10 LOC of `process.argv` slicing. |

**Installation:**

```bash
# Primary (recommended — requires reconciling D-01 deviation):
npm install -D @aldinokemal2104/excalidraw-to-svg@1.1.1

# svgo is already transitive; planner may optionally add explicit pin:
npm install -D svgo@4.0.0  # OPTIONAL — hermetic pin over transitive

# IF D-01 kept literal (CONTEXT.md authoritative):
# npm install -D @excalidraw/excalidraw@0.18.1 jsdom@24.0.0 svgo@4.0.0
# (planner additionally researches font asset loading + worker pattern — +4-6h)
```

**Version verification (run this before committing PLAN.md):**

```bash
npm view @aldinokemal2104/excalidraw-to-svg version time.modified
# Expected: 1.1.1, 2026-04-08T23:24:39.282Z

npm view svgo version time.modified
# Expected: 4.0.1 (latest), with 4.0.0 as transitive baseline

npm view @excalidraw/excalidraw version time.modified
# Expected: 0.18.1, 2026-04-20T20:24:36.894Z  (for info only; not installing this)
```

## Architecture Patterns

### System Architecture Diagram

```
Authoring flow (one-time, author-invoked):

  [Author: Excalidraw desktop/web] ──┐
                                     ▼
                          [diagrams-source/<slug>/<name>.excalidraw.json]
                          [diagrams-source/<slug>/<name>.meta.json]  ← { title, descEn, descRu }
                                     │
                                     ▼
                     `node scripts/excalidraw-to-svg.mjs <src> <dest>`
                                     │
                                     ▼ reads meta sibling, calls wrapper
                          ┌──────────────────────────────────┐
                          │ Worker thread (jsdom isolated)   │
                          │   @excalidraw/utils.exportToSvg  │
                          │   → SVGElement with @font-face   │
                          │     (fonts subset-embedded)      │
                          └──────────────┬───────────────────┘
                                         │ serialize via .outerHTML
                                         ▼
                         ┌───────────────────────────────┐
                         │ String post-process           │
                         │   inject <title> + <desc>     │
                         │   parse viewBox → width/height│
                         └──────────────┬────────────────┘
                                        │ SVG string
                                        ▼
                         ┌──────────────────────────────┐
                         │ svgo.optimize()              │
                         │   preset-default             │
                         │   + removeDesc: false        │
                         │   + multipass: true          │
                         └──────────────┬───────────────┘
                                        │ optimized SVG string
                                        ▼
                              Byte-count gate: ≤ 10 KB?
                                   │              │
                              yes  │              │ no → exit 1, print
                                   ▼              ▼   SVGO diff summary
                  [public/blog-assets/<slug>/diagrams/<name>.svg]
                                   │
                                   │ committed via atomic `fix(04): ...` commit
                                   ▼
                                   git HEAD

Rendering flow (runtime, every visit to /blog/<slug>):

         [src/content/blog/{en,ru}/<slug>.md embeds `<img src="/blog-assets/<slug>/diagrams/<name>.svg" ...>`]
                                   │
                                   │ astro build → static HTML
                                   ▼
                 [dist/{en,ru}/blog/<slug>/index.html with <img> tag]
                                   │
                                   │ GitHub Pages serves via CDN
                                   ▼
                          [Browser: <img> element]
                                   │
                                   │ HTTP GET /blog-assets/<slug>/diagrams/<name>.svg
                                   ▼
                      [Browser renders SVG — zero JS, explicit width/height]
```

### Recommended Project Structure

```
vedmich.dev/
├── diagrams-source/                        # NEW — repo-committed source JSON, outside public/
│   ├── README.md                           # runbook (D-discretion; see §9)
│   └── <slug>/
│       ├── <name>.excalidraw.json         # Excalidraw source export
│       └── <name>.meta.json                # { title, descEn, descRu }
├── scripts/
│   ├── generate-icons.mjs                  # EXISTING — pattern to mirror
│   └── excalidraw-to-svg.mjs              # NEW — this phase
├── public/
│   └── blog-assets/
│       └── <slug>/
│           ├── *.png                        # EXISTING carousel stills (karpenter)
│           └── diagrams/                    # NEW — Phase 4 output
│               └── <name>.svg
├── src/
│   └── content/blog/{en,ru}/
│       └── 2026-03-02-mcp-servers-plainly-explained.md  # MODIFIED — swap line 21 ASCII for <img>
└── tests/unit/
    └── excalidraw-to-svg.test.ts          # NEW — pipeline validation (see Validation Architecture)
```

### Pattern 1: `.mjs` Node Script (mirror `generate-icons.mjs`)

**What:** Single-purpose ESM script, top-level `await`, stdlib-first, explicit `process.exit(1)` on error. No transpilation, no test framework dependency (uses `node --test`).

**When to use:** Any build-time asset pipeline script in this project.

**Example (pattern from existing `scripts/generate-icons.mjs`):**

```javascript
// Source: scripts/generate-icons.mjs (existing project convention)
// @ts-check
// Source: Phase 4 — CONTEXT D-02c script contract
// One-shot diagram export. Re-runnable idempotently.

import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import excalidrawToSvg from '@aldinokemal2104/excalidraw-to-svg';
import { optimize } from 'svgo';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const REPO_ROOT = path.resolve(__dirname, '..');

const SVGO_CONFIG = {
  multipass: true,
  plugins: [
    {
      name: 'preset-default',
      params: {
        overrides: {
          removeDesc: false,         // preserve injected a11y <desc>
          // removeTitle: OFF by default in v4 — no action
          // removeViewBox: OFF by default in v4 — no action
        },
      },
    },
  ],
};

const SIZE_BUDGET = 10 * 1024;  // 10 KB per DIAG-02

async function main() {
  const [, , srcPath, destPath] = process.argv;
  if (!srcPath || !destPath) {
    console.error('Usage: node scripts/excalidraw-to-svg.mjs <source.excalidraw.json> <dest.svg>');
    process.exit(1);
  }

  const metaPath = srcPath.replace(/\.excalidraw\.json$/, '.meta.json');
  const meta = JSON.parse(await fs.readFile(metaPath, 'utf8'));
  if (!meta.title || !meta.descEn) {
    throw new Error(`${metaPath} missing required keys: title, descEn`);
  }

  const diagram = JSON.parse(await fs.readFile(srcPath, 'utf8'));
  const svgEl = await excalidrawToSvg(diagram);
  let svgString = svgEl.outerHTML;

  // Inject <title> and <desc> as first children of root <svg>
  const desc = meta.descRu ? `${meta.descEn} // ${meta.descRu}` : meta.descEn;
  svgString = svgString.replace(
    /<svg([^>]*)>/,
    `<svg$1><title>${escapeXml(meta.title)}</title><desc>${escapeXml(desc)}</desc>`
  );

  // Parse viewBox → explicit intrinsic width/height (D-03d)
  const viewBoxMatch = svgString.match(/viewBox="(\d+(?:\.\d+)?)\s+(\d+(?:\.\d+)?)\s+(\d+(?:\.\d+)?)\s+(\d+(?:\.\d+)?)"/);
  const intrinsicWidth = viewBoxMatch ? Math.round(parseFloat(viewBoxMatch[3])) : null;
  const intrinsicHeight = viewBoxMatch ? Math.round(parseFloat(viewBoxMatch[4])) : null;

  // Optimize
  const { data: optimized } = optimize(svgString, SVGO_CONFIG);

  // Budget gate
  const bytes = Buffer.byteLength(optimized, 'utf8');
  if (bytes > SIZE_BUDGET) {
    console.error(`SVG is ${bytes} B (${(bytes/1024).toFixed(1)} KB), exceeds 10 KB budget.`);
    console.error(`Simplify the diagram or zoom-to-fit in Excalidraw before re-exporting.`);
    process.exit(1);
  }

  await fs.mkdir(path.dirname(destPath), { recursive: true });
  await fs.writeFile(destPath, optimized, 'utf8');

  console.log(`✓ ${path.relative(REPO_ROOT, destPath)} (${bytes} B)`);
  console.log(`  intrinsic: ${intrinsicWidth}×${intrinsicHeight}`);
  console.log(`  title: ${meta.title}`);
  console.log(`  desc: ${desc}`);
}

function escapeXml(str) {
  return str.replace(/[<>&"']/g, (c) => ({
    '<': '&lt;', '>': '&gt;', '&': '&amp;', '"': '&quot;', "'": '&apos;'
  }[c]));
}

main().catch((err) => {
  console.error('[excalidraw-to-svg] FAILED:', err.message);
  process.exit(1);
});
```

### Pattern 2: Metadata Sibling File

**What:** Each `<name>.excalidraw.json` has a sibling `<name>.meta.json` with locked shape `{ title: string, descEn: string, descRu?: string }`.

**When to use:** Every diagram. Script errors if meta file missing (D-02d a11y invariant).

**Example:**

```json
// diagrams-source/mcp-servers-plainly-explained/client-server.meta.json
{
  "title": "MCP client-server architecture",
  "descEn": "Claude Code (client) connects via JSON-RPC to an MCP server, which fans out to external resources: docs, databases, APIs.",
  "descRu": "Claude Code (клиент) подключается по JSON-RPC к MCP-серверу, который обращается к внешним ресурсам: docs, DB, API."
}
```

### Pattern 3: Atomic `fix(04-NN): ...` Commit Per Diagram

**What:** Each shipped diagram = one commit. Commit pattern per Phase 3 D-04e:

```
fix(04-02): mcp-servers — swap ASCII diagram for client-server SVG

- Exports diagrams-source/mcp-servers-plainly-explained/client-server.excalidraw.json
- Optimized output: public/blog-assets/mcp-servers-plainly-explained/diagrams/client-server.svg (6,842 B)
- Swaps line 21 ASCII in EN + RU locales for <img src="/blog-assets/mcp-servers-plainly-explained/diagrams/client-server.svg"
  alt="..." loading="eager" width="1800" height="400">
```

Commits include: source JSON + meta JSON + output SVG + EN blog edit + RU blog edit (paired).

### Anti-Patterns to Avoid

- **Hand-rolling jsdom setup in main thread:** Pollutes Node globals — `global.document = ...` leaks into any `npm run test:unit` that runs after. Use worker-thread isolation (built into `@aldinokemal2104/excalidraw-to-svg`).
- **Importing `@excalidraw/excalidraw` or `@aldinokemal2104/excalidraw-to-svg` from `src/`:** PITFALLS.md Pitfall 6. Grep gate: `grep -r "@excalidraw\|@aldinokemal2104" src/` must return zero hits. Add to verification.
- **Running Excalidraw export in `astro build`:** Defeats the commit-SVG-as-source-of-truth principle (D-02b). Script is explicitly author-invoked, not wired into `npm run build`.
- **Re-exporting on theme change:** Not applicable in v1 per D-03b (keep original palette). If light/dark toggle ever ships, re-export is a later-phase task, not in-script runtime branching.
- **Auto-title inference:** D-02d locks explicit author metadata. No AI-guess fallback.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| `.excalidraw.json` → SVG conversion | Custom SVG emitter from JSON | `@aldinokemal2104/excalidraw-to-svg` | Excalidraw JSON schema has 20+ element types (rectangle, ellipse, arrow, freedraw, text, embed, frame, magicframe, image, line, diamond, ...), each with ~30 properties, rough.js pen-sketch rendering, arrow-binding math. ~4,000+ LOC equivalent in `@excalidraw/utils`. Maintained by Excalidraw team. |
| Font embedding for Virgil/Cascadia/Excalifont | Manual WOFF2 load + base64 + `@font-face` CSS injection | `@aldinokemal2104/excalidraw-to-svg` auto-embed | 7 fonts × 3 variants × handling of which glyphs appear in the diagram × subset-font wasm bindings. Non-trivial. |
| jsdom setup for Node-side DOM | Boot jsdom in main thread | `@aldinokemal2104/excalidraw-to-svg` worker isolation | `global.document = ...` pollution breaks other unit tests. Worker-thread isolation is the correct pattern. |
| SVG optimization | Manual regex strip of `<metadata>`, whitespace, default attributes | `svgo` with `preset-default` | SVGO runs 31 plugins; hand-rolling any 5 of them is a maintenance pit. |
| XML escaping for title/desc | Manual `replace(/&/g, '&amp;')...` chain | Small 6-liner `escapeXml()` OR `@xmldom/xmldom` | Actually hand-roll is fine here — it's 6 lines. Only 5 characters to escape (`<`, `>`, `&`, `"`, `'`). Adding a dep would be overkill. |
| Arg parsing | commander / yargs | `process.argv` + simple destructure | Script takes 2 positional args + optional flags. `commander` for a 60-LOC script is overkill. Matches `generate-icons.mjs` (zero arg libs). |

**Key insight:** The pipeline is 90% "call the wrapper, pipe through svgo, write file." Hand-rolled Node scripts usually try to write Excalidraw schema handling, font embed, and jsdom setup themselves — all of which are solved upstream by the recommended library choice. Script LOC stays < 80.

## Common Pitfalls

### Pitfall 1: `<desc>` stripped by SVGO preset-default

**What goes wrong:** After SVGO runs, `<desc>` is missing from the output even though it was in the pre-SVGO string. Screen readers lose the descriptive a11y layer (CONTEXT D-03c dual-channel).
**Why it happens:** SVGO v4 `preset-default` enables `removeDesc` by default. (v4 migration note: `removeTitle` and `removeViewBox` were DROPPED from default in v4, but `removeDesc` stayed.) [VERIFIED: Context7 /svg/svgo preset-default plugin list]
**How to avoid:** Pass `params.overrides.removeDesc: false` in SVGO config. Do NOT disable `removeMetadata` (that one strips `<metadata>` blobs Excalidraw embeds — safe to lose).
**Warning signs:** `grep -c '<desc>' output.svg` returns `0`. Unit test for post-SVGO `<desc>` presence catches this.

### Pitfall 2: `<title>` stripped if author mistakenly copies v3 SVGO config

**What goes wrong:** Author looks at an older SVGO config blog post showing `'preset-default', 'removeTitle'` pattern → `<title>` vanishes.
**Why it happens:** SVGO v3 had `removeTitle` in preset-default. v4 migration (October 2024) removed it explicitly for a11y. Copy-paste from stale blog posts re-adds it.
**How to avoid:** Don't add `'removeTitle'` or `{ name: 'removeTitle' }` anywhere in plugins. The default v4 behavior is correct.
**Warning signs:** `grep -c '<title>' output.svg` returns `0` after SVGO.

### Pitfall 3: Excalidraw canvas zoomed-out → inflated viewBox

**What goes wrong:** Author exports at zoom level where the canvas extends to e.g. `viewBox="0 0 5000 3000"`. SVG file size balloons (empty space is still bytes of path data after SVGO). Passes ≤ 10 KB budget on small diagrams but fails on medium ones for the wrong reason.
**Why it happens:** Excalidraw export respects the current canvas viewport. "Zoom to fit" before export normalizes bounds.
**How to avoid:** Author workflow: press `Shift+1` (Excalidraw "zoom to fit selection") → export. Document in `diagrams-source/README.md`.
**Warning signs:** `file.svg` > 10 KB when the diagram visually has 5-10 elements.

### Pitfall 4: Browser-global polyfill expected in main thread

**What goes wrong:** Author writes the script without using the worker wrapper, calls `@excalidraw/utils` directly, hits `ReferenceError: document is not defined` or `URL.createObjectURL is not a function`.
**Why it happens:** Excalidraw's export internals use `document`, `XMLSerializer`, and `URL.createObjectURL`. Without jsdom + polyfills in the main thread, the function throws.
**How to avoid:** Use `@aldinokemal2104/excalidraw-to-svg` (recommended path — it runs jsdom in a worker, inaccessible from main). If D-01 stays literal and we use `@excalidraw/excalidraw` directly, the planner must add jsdom + URL.createObjectURL polyfill setup, preferably inside a `node:worker_threads` Worker to avoid polluting `npm run test:unit` runs.
**Warning signs:** `ReferenceError` on first invocation.

### Pitfall 5: `<title>`/`<desc>` injected AFTER SVGO (position bug)

**What goes wrong:** Author injects a11y elements AFTER SVGO runs. SVGO's `cleanupIds` or other plugins may have already stripped internal references the injected block relies on — OR — the injected block trips SVGO on the NEXT run (the post-SVGO svg isn't valid if the `<title>` has unescaped `<`, `>`, `&`).
**How to avoid:** Inject a11y BEFORE SVGO. SVGO v4 preserves `<title>` and (with `removeDesc: false`) `<desc>`. Author `escapeXml()` on the meta strings.
**Warning signs:** svgo throws `SvgoParserError` on subsequent runs.

### Pitfall 6: Missing explicit `width`/`height` → CLS

**What goes wrong:** `<img src="..." />` without width/height. Browser sets `width: 0; height: 0` until the SVG fetches and computes intrinsic dims, shifting layout (CLS spike). LCP regression.
**Why it happens:** Authors copy the image reference without parsing viewBox.
**How to avoid:** Script reads viewBox from the SVG output (D-03d), prints `width × height` to stdout so author pastes into MDX. Consider adding to meta output file for batch embedding.
**Warning signs:** CLS > 0.1 on a post with diagrams in PageSpeed Insights.

### Pitfall 7: Forgetting the meta file (silent a11y regression)

**What goes wrong:** Author exports a new diagram without creating `<name>.meta.json`. Script silently writes an SVG without `<title>` or `<desc>`. Screen readers get only the `<img alt>` (which author may also forget).
**How to avoid:** D-02d mandates: if meta file missing, script errors with `Error: <name>.meta.json required with keys title, descEn. Aborting.` Never silently fall back.
**Warning signs:** `grep -c '<title>' output.svg` returns `0` on a successful run.

## Code Examples

### Excalidraw-to-SVG with Injection + SVGO + Budget Gate

Source: `@aldinokemal2104/excalidraw-to-svg` README (https://www.npmjs.com/package/@aldinokemal2104/excalidraw-to-svg) + Context7 `/svg/svgo` `optimize()` API + project `scripts/generate-icons.mjs` conventions.

See the full ~80 LOC script in **Architecture Patterns → Pattern 1** above. Key calls:

```javascript
// Load
const diagram = JSON.parse(await fs.readFile(srcPath, 'utf8'));

// Convert
const svgEl = await excalidrawToSvg(diagram);
let svgString = svgEl.outerHTML;

// Inject a11y (pre-SVGO)
svgString = svgString.replace(/<svg([^>]*)>/, `<svg$1><title>${t}</title><desc>${d}</desc>`);

// Optimize
const { data: optimized } = optimize(svgString, {
  multipass: true,
  plugins: [{
    name: 'preset-default',
    params: { overrides: { removeDesc: false } },
  }],
});

// Budget check
if (Buffer.byteLength(optimized, 'utf8') > 10 * 1024) process.exit(1);

// Write
await fs.writeFile(destPath, optimized);
```

### MDX Embed (EN post — line 21 replacement)

Source: CONTEXT D-03 + D-03d

```markdown
<!-- BEFORE (line 21 of 2026-03-02-mcp-servers-plainly-explained.md) -->
```
[ Client: Claude Code ]  ←→  [ MCP Server ]  ←→  [ External resource: docs / DB / API ]
```

<!-- AFTER -->
<img
  src="/blog-assets/mcp-servers-plainly-explained/diagrams/client-server.svg"
  alt="MCP client-server architecture: Claude Code connects to an MCP Server, which fans out to external resources (docs, databases, APIs)"
  loading="eager"
  width="1800"
  height="400"
  style="max-width: 100%; height: auto;"
/>
```

**RU mirror:** Same `src`, same `width`/`height`, `loading="eager"`; `alt` localized to:
`"Архитектура MCP клиент-сервер: Claude Code подключается к MCP-серверу, который обращается к внешним ресурсам (docs, DB, API)"`.

`loading="eager"` rationale: line 21 of a 75-line post with hero + 2 prose paragraphs above → likely above-the-fold on 1440×900. Lazy-loading would delay LCP. D-03 names `loading="lazy"` as default — planner overrides to `eager` here based on position (CONTEXT code_context explicitly allows this).

### D-01 Literal Fallback (if user keeps `@excalidraw/excalidraw`)

If reconciliation concludes the user wants the official package:

```javascript
// UNTESTED SKETCH — adds 4-6h of debug cycles
import { Worker } from 'node:worker_threads';

// In a worker file (scripts/excalidraw-to-svg-worker.mjs):
import { JSDOM } from 'jsdom';
const dom = new JSDOM('<!doctype html><html><body></body></html>');
global.document = dom.window.document;
global.window = dom.window;
global.XMLSerializer = dom.window.XMLSerializer;
global.URL = Object.assign(global.URL || {}, { createObjectURL: () => 'blob:stub', revokeObjectURL: () => {} });
// Load + manually resolve WOFF2 font paths from node_modules/@excalidraw/excalidraw/dist/assets/...
// Build @font-face CSS with base64 WOFF2
// Import exportToSvg from the deep path (NOT documented):
const { exportToSvg } = await import('@excalidraw/excalidraw/scene/export');
// ... call it with { elements, appState, files }
// ... serialize via new XMLSerializer().serializeToString(svgElement)
```

Research surfaced NO official Excalidraw docs for this path. All five failure-mode queries on Context7 returned React-in-browser examples only. High implementation risk.

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| `.planning/research/STACK.md` names `@excalidraw/excalidraw@^0.17.0` | Current stable is `0.18.1` (published 2026-04-20) | 2026-04-20 | STACK.md mildly stale; D-01d's "pin exact" supersedes the `^0.17.0` caret anyway |
| SVGO v3: `removeTitle` and `removeViewBox` in preset-default | v4: both removed from preset-default (October 2024) | SVGO 4.0.0 | Good news — our a11y needs fewer overrides. Only `removeDesc: false` needed. |
| Raw `@excalidraw/excalidraw` in Node scripts (common blog-post advice) | Worker-thread wrapper packages like `@aldinokemal2104/excalidraw-to-svg` | 2025-2026 | Author time saved: ~4-6h script debug → ~30min wrapper install. |

**Deprecated/outdated:**

- **SVGO v2/v3 `extendDefaultPlugins`** — removed. Use `{ name: 'preset-default', params: { overrides: {...} } }`.
- **STACK.md `@excalidraw/excalidraw ^0.17.0` entry** — pin to 0.18.1 if chosen; prefer `@aldinokemal2104/excalidraw-to-svg` per deviation analysis.
- **CONTEXT.md D-01 literal + planner-picks-shim approach** — research shows the "shim choice" is moot because the recommended library embeds jsdom in a worker. Raised as Deviation Note for planner reconciliation.

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | `@aldinokemal2104/excalidraw-to-svg` v1.1.1 covers all Excalidraw shape types currently in use (rectangles, text, arrows, freedraw, diamonds) | Standard Stack | LOW — it uses official `@excalidraw/utils` which IS the shape engine; drift risk is zero for shape types, only for package wrapper API. Test by exporting a real MCP diagram as first task. |
| A2 | `loading="eager"` is correct for MCP post diagram at line 21 of 75 | Code Examples — MDX Embed | LOW — line 21 of a short post is above-the-fold on 1440×900 and near-fold on 375px. Worst case: `lazy` delays LCP by ~50ms. Planner verifies by scroll-to-fold-probe on dev build before committing. |
| A3 | `@font-face` CSS blobs embedded by the wrapper push typical diagrams UNDER the 10 KB budget after subset-font + SVGO multipass | Architecture → Pattern 1, SIZE_BUDGET | MEDIUM — depends on how many Excalidraw fonts are used. MCP diagram with Virgil text only → subset is small. A diagram with Cascadia + Comic Shanns + Virgil + Lilita One → subsets sum quickly. Empirical validation required: run pipeline on real MCP JSON before committing to 10 KB budget; if it fails, D-05's error path applies (author simplifies or changes font palette in Excalidraw). |
| A4 | Karpenter "split ownership between CA and Karpenter" is the strongest DIAG-05 content-fit | Phase Requirements | LOW — prose-only gap at karpenter.mdx lines 55-59 is a clear diagram opportunity. Alternate: 2nd MCP diagram (server → resource fan-out) has equally strong fit. Planner picks. |
| A5 | `diagrams-source/README.md` is the most discoverable home for the runbook (Claude's Discretion) | Execution Flow → Step 6 / Validation Architecture | LOW — colocates with source JSON, discoverable during authoring. Alternatives (append to `CLAUDE.md` or `docs/`) are fine. Planner picks. |
| A6 | Batch script `npm run diagrams:build` is NOT worth adding in v1 | Claude's Discretion assessment | LOW — 3 diagrams max in this phase. Manual invocations are faster than writing a manifest-driven runner. Revisit in Phase 6 if companion-post diagrams push count > 8. |
| A7 | `removeDesc: false` is the only SVGO override needed | Standard Stack → svgo | LOW — MCP post only needs `<title>` + `<desc>` preserved. If author diagrams later use `<style>`, `<script>`, or embedded raster `<image>` tags, additional overrides may be needed. Script currently allows SVGO to strip those (inline styles can be stripped via `minifyStyles` + `inlineStyles` which preset-default includes). |

**If this table grows, users' confidence in the plan should drop. All A1-A7 are LOW-MEDIUM risk and empirically verifiable during Wave 0 (first real diagram export).**

## Open Questions

1. **Does user want to stay literal on D-01 (`@excalidraw/excalidraw` + planner-picked shim) or accept the research-recommended drift (`@aldinokemal2104/excalidraw-to-svg`)?**
   - What we know: Research surfaces `@aldinokemal2104/excalidraw-to-svg@1.1.1` as the strong fit (~60 LOC script, zero unknown unknowns). Raw `@excalidraw/excalidraw` works but needs 4-6h of undocumented glue.
   - What's unclear: Whether D-01's "official package" preference was (a) about fidelity (both preserve it via shared `@excalidraw/utils`) or (b) about naming discipline (pin `@excalidraw/*` namespace). If (a), drift is trivially justified; if (b), user might want D-01 kept and absorb the 4-6h cost.
   - Recommendation: Planner surfaces this as a 1-question `AskUserQuestion` in PLAN-00 pre-wave (ask in Russian per CLAUDE.md GSD rule) before locking library choice. Question: "Use `@aldinokemal2104/excalidraw-to-svg` (thin wrapper over official `@excalidraw/utils`, documented Node path, +15 MB devDeps) OR use raw `@excalidraw/excalidraw` + hand-rolled jsdom/worker/font-embed (+90 MB devDeps, +4-6h effort, no official Node-headless docs)?" Either answer is valid; researcher has documented both paths.

2. **MCP post second diagram — client-server (primary) + server-resource fan-out (stretch)?**
   - What we know: CONTEXT D-04b allows up to 2 MCP diagrams. Post has natural 2-diagram decomposition: §"The shape of it" (client-server flow) + §"Three concrete servers I use" (server fan-out to docs / DB / API).
   - What's unclear: Whether the 3 servers diagram aids content clarity enough to justify +1 diagram authoring effort.
   - Recommendation: Ship primary (client-server) first. Evaluate during DIAG-04 implementation — if the primary took < 20 min end-to-end, ship the fan-out as a stretch target the same day. If > 40 min, defer.

3. **Karpenter DIAG-05 candidate: split-ownership topology vs NodePool-constrained-provisioning?**
   - What we know: karpenter.mdx §"Trap 2 — Running CA and Karpenter at the same time" (lines 46-59) has a prose-only explanation of "split ownership" between CA (system node groups) and Karpenter (everything else) that would benefit from a labeled 2-pool diagram. It also has §"Step 1: Split ownership" at line 111 that references the same concept.
   - What's unclear: Whether a CA/Karpenter pool-split diagram is simpler to author than a NodePool-requirements-funnel diagram (showing how `limits.cpu` + `requirements` constrain Karpenter's instance-picker).
   - Recommendation: Planner picks based on author-effort estimate during diagrams-source creation. Split-ownership is structurally simpler (2 labeled boxes + 4 pod bubbles). NodePool-requirements is richer but requires more Excalidraw text. Prefer the simpler one for pipeline stress-test; content coverage is secondary to pipeline validation.

4. **Does CONTEXT.md D-05b's "no `.prose img` override in v1" survive the MCP + karpenter reality?**
   - What we know: `@tailwindcss/typography` default sets `max-width: 100%` on `.prose img`. Should work.
   - What's unclear: Whether Excalidraw's 1800-wide native viewBox interacts with the `.prose` `max-width: 65ch` constraint cleanly. Preview on both 1440 and 375 viewports before committing.
   - Recommendation: Verify on dev build after first diagram lands; add `.prose img { margin-block: 1.5rem; }` scoped override only if visual inspection shows diagrams feel cramped.

5. **Does `<desc>` need to be bilingual, or just English?**
   - What we know: D-02d meta shape locks `descEn` required, `descRu` optional. Bilingual MDX `alt` is the primary a11y channel (different `<img>` per locale).
   - What's unclear: Whether a single SVG `<desc>` with `"EN // RU"` concatenation is screen-reader-friendly OR confuses AT.
   - Recommendation: Ship `<desc>` in English only for v1 (simpler, dominant audience). If a Russian audibility concern surfaces post-launch, add `<desc xml:lang="ru">` + `<desc xml:lang="en">` sibling pattern later (both W3C-valid). Script stays meta-driven.

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| Node.js runtime | Script execution | ✓ | `v25.9.0` | — |
| npm | Package install | ✓ | comes with node | — |
| `svgo` (transitive or explicit) | SVGO optimization | ✓ | `4.0.0` via `astro@5.18.0` | — |
| `@aldinokemal2104/excalidraw-to-svg` | Excalidraw export (recommended path) | ✗ | — | Install via `npm install -D @aldinokemal2104/excalidraw-to-svg@1.1.1` |
| `@excalidraw/excalidraw` | Excalidraw export (D-01 literal path) | ✗ | — | Install via `npm install -D @excalidraw/excalidraw@0.18.1` (adds React peer dep — see deviation note) |
| Excalidraw desktop/web | Authoring `.excalidraw.json` (author-side only) | ✓ (external — not a project dep) | — | — |
| ffmpeg/imagemagick | — not needed for SVG pipeline | n/a | — | — |

**Missing dependencies with no fallback:** None for the recommended path. Install is a one-liner in `devDependencies`.

**Missing dependencies with fallback:** Library choice — both candidates ship via npm, no fallback needed; the choice is on user preference / deviation reconciliation.

## Validation Architecture

> `workflow.nyquist_validation` is ABSENT from `.planning/config.json` — treat as enabled.

### Test Framework

| Property | Value |
|----------|-------|
| Framework | `node --test` (builtin) + `node:assert/strict` — matches existing `tests/unit/*.test.ts` |
| Config file | none — `tests/unit/*.test.ts` glob in `package.json` `scripts.test:unit` picks up new test files automatically |
| Quick run command | `npm run test:unit` (runs all `tests/unit/*.test.ts` in ~5s) |
| Full suite command | `npm run test:unit && npm run build` (unit tests + fresh Astro build which includes MDX parsing of MCP post) |

### Phase Requirements → Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| DIAG-01 | Script reads `.excalidraw.json` and writes valid `<svg>` string to target path | integration (uses fixture JSON) | `npm run test:unit` (runs new `tests/unit/excalidraw-to-svg.test.ts::exports-valid-svg`) | ❌ Wave 0 |
| DIAG-01 | Script exits 1 on missing meta sibling | integration | `tests/unit/excalidraw-to-svg.test.ts::errors-on-missing-meta` | ❌ Wave 0 |
| DIAG-01 | Script exits 1 on missing input file | integration | `tests/unit/excalidraw-to-svg.test.ts::errors-on-missing-input` | ❌ Wave 0 |
| DIAG-02 | Output SVG is ≤ 10 KB after SVGO | integration | `tests/unit/excalidraw-to-svg.test.ts::under-10kb-budget` (uses MCP fixture JSON) | ❌ Wave 0 |
| DIAG-02 | Script exits 1 + prints budget diagnostic if SVG > 10 KB | integration | `tests/unit/excalidraw-to-svg.test.ts::exits-on-oversize` (uses oversize fixture) | ❌ Wave 0 |
| DIAG-03 | Output SVG contains `<title>` with author-supplied text | unit (post-SVGO string assertion) | `tests/unit/excalidraw-to-svg.test.ts::preserves-title` | ❌ Wave 0 |
| DIAG-03 | Output SVG contains `<desc>` with author-supplied text (post-SVGO — validates `removeDesc: false` override) | unit | `tests/unit/excalidraw-to-svg.test.ts::preserves-desc` | ❌ Wave 0 |
| DIAG-03 | Output path is `public/blog-assets/<slug>/diagrams/<name>.svg` | integration (file exists + correct path) | `tests/unit/excalidraw-to-svg.test.ts::writes-to-canonical-path` | ❌ Wave 0 |
| DIAG-04 | MCP post EN locale line 21 no longer contains `←→` (ASCII removed) AND contains `<img src="/blog-assets/mcp-servers-plainly-explained/diagrams/client-server.svg"` | E2E / content | Shell grep: `grep -q 'diagrams/client-server.svg' src/content/blog/en/2026-03-02-mcp-servers-plainly-explained.md && ! grep -q '←→' src/content/blog/en/2026-03-02-mcp-servers-plainly-explained.md` | ❌ Wave 0 |
| DIAG-04 | MCP post RU locale — same (parity check) | E2E / content | Same grep against RU file | ❌ Wave 0 |
| DIAG-04 | Built `dist/en/blog/mcp-servers-plainly-explained/index.html` contains the `<img>` with correct src/alt | E2E / build artifact | `npm run build && grep -q 'src="/blog-assets/mcp-servers-plainly-explained/diagrams/client-server.svg"' dist/en/blog/mcp-servers-plainly-explained/index.html` | ❌ Wave 0 |
| DIAG-04 | `<img>` has explicit `width` and `height` attributes (CLS prevention) | E2E / build artifact | `grep -qE 'width="[0-9]+" height="[0-9]+"' dist/en/blog/mcp-servers-plainly-explained/index.html` | ❌ Wave 0 |
| DIAG-05 | At least 2 total diagrams exist under `public/blog-assets/*/diagrams/*.svg` (MCP + karpenter stretch minimum) | integration | `find public/blog-assets/*/diagrams/*.svg \| wc -l` returns ≥ 2 | ❌ Wave 0 |
| DIAG-05 | Karpenter post contains `<img src="/blog-assets/2026-03-20-karpenter-right-sizing/diagrams/...svg"` | E2E / content | `grep -q 'diagrams/.*\.svg' src/content/blog/en/2026-03-20-karpenter-right-sizing.mdx` | ❌ Wave 0 |
| — (boundary invariant) | `@excalidraw/*` NEVER imported from `src/` (PITFALLS.md Pitfall 6) | static grep gate | `! grep -r '@excalidraw\|@aldinokemal2104' src/` | ❌ Wave 0 |
| — (boundary invariant) | No new runtime JS added to production bundle | E2E / build artifact | `npm run build` completes, `grep -r '@excalidraw' dist/` returns zero | ❌ Wave 0 |

### Sampling Rate

- **Per task commit:** `npm run test:unit` (fast — ~5s; includes all existing 35 tests + new ~8 excalidraw tests)
- **Per wave merge:** `npm run test:unit && npm run build` (full suite + Astro build; includes MDX parsing, ensures `<img>` renders in HTML)
- **Phase gate:** Full suite green + all DIAG-0X grep assertions pass + human visual sign-off on live `/en/blog/mcp-servers-plainly-explained/` + RU mirror

### Wave 0 Gaps

- [ ] `tests/unit/excalidraw-to-svg.test.ts` — new test file, covers DIAG-01/02/03 with fixture JSON
- [ ] `tests/fixtures/excalidraw/minimal.excalidraw.json` — ~5-element fixture (1 rectangle, 1 text, 1 arrow, 1 ellipse, 1 diamond) for unit test reproducibility; < 2 KB JSON
- [ ] `tests/fixtures/excalidraw/minimal.meta.json` — test meta with `{ title: "Test", descEn: "Test diagram", descRu: "Тест" }`
- [ ] `tests/fixtures/excalidraw/oversize.excalidraw.json` — ~40-element fixture that SHOULD trip the 10 KB budget for the "exits-on-oversize" test (deliberately chunky freedraw with many Virgil glyphs)
- [ ] `package.json` devDeps — add `@aldinokemal2104/excalidraw-to-svg@1.1.1` (or D-01 literal per user reconciliation)
- [ ] `scripts/excalidraw-to-svg.mjs` — the pipeline script itself
- [ ] `diagrams-source/README.md` — runbook per A5 recommendation (author workflow: zoom-to-fit → export → meta → run script → verify budget)

Framework install: none — `node:test` is built in, `@types/node` already transitive via Astro. Test authoring pattern mirrors `tests/unit/shiki-palette-guard.test.ts`.

## Security Domain

> CONTEXT.md did NOT flag `security_enforcement: false`. Treat as enabled. This phase has LIMITED security surface (build-time script, no runtime code, no user input) but worth documenting:

### Applicable ASVS Categories

| ASVS Category | Applies | Standard Control |
|---------------|---------|-----------------|
| V2 Authentication | no | N/A — build-time script, no auth surface |
| V3 Session Management | no | N/A |
| V4 Access Control | no | N/A |
| V5 Input Validation | yes (mild) | Validate `srcPath`/`destPath` args resolve under repo root; reject paths with `..` that escape. Validate `.excalidraw.json` parses as JSON with expected `type: "excalidraw"` shape. |
| V6 Cryptography | no | N/A — no secrets, no crypto |

### Known Threat Patterns for this stack

| Pattern | STRIDE | Standard Mitigation |
|---------|--------|---------------------|
| Malicious `.excalidraw.json` containing XSS payload in text elements (e.g. `<script>`) | Tampering, Elevation of privilege | SVGO `preset-default` includes `removeScripts` — strips `<script>` from output. Pre-SVGO string, verify no raw HTML tags in `<title>`/`<desc>` — our `escapeXml()` handles this. |
| Malicious JSON containing embedded raster base64 images with exploit payloads | Tampering | Low risk — Excalidraw images would render as embedded `<image>` tags in output SVG; browsers sandbox images. Still prudent to reject extremely large `files` blobs (> 100 KB total) during validation. |
| Path traversal via CLI arg (`destPath = ../../../etc/passwd`) | Elevation of privilege | Resolve paths with `path.resolve()` + assert result `startsWith(REPO_ROOT)`. |
| NPM supply-chain attack on `@aldinokemal2104/excalidraw-to-svg` | Tampering | Pin to exact version `1.1.1` (D-01d discipline). Verify MIT license. Review package size + dep count before install. Same risk profile as any new devDep. |

No data is stored, no user input is received, no network calls on-build. Script is ACL-less; anyone with repo write access can run it. This is intentional — the artifact (SVG) is reviewed in PR.

## Sources

### Primary (HIGH confidence)

- **Context7 `/excalidraw/excalidraw`** — fetched 2026-05-03 via `npx ctx7@latest docs`. `exportToSvg()` API signature, `.excalidraw.json` schema (type + version + elements + appState + files), export example code. 229 code snippets indexed.
- **Context7 `/svg/svgo`** — fetched 2026-05-03. `optimize(svg, config)` API, `preset-default` plugin list, v4 migration notes (removeTitle/removeViewBox removed from defaults; removeDesc remains), `overrides` parameter syntax. 943 code snippets indexed.
- **npm registry** — verified 2026-05-03: `@aldinokemal2104/excalidraw-to-svg@1.1.1` (published 2026-04-08), `@excalidraw/excalidraw@0.18.1` (2026-04-20), `svgo@4.0.1` latest, `jsdom@29.1.1` latest, `happy-dom@20.9.0` latest, `linkedom@0.18.12`. License + dep graph for each.
- **Project file inspection** — `scripts/generate-icons.mjs` (pattern), `package.json` (devDeps, scripts), `src/content/blog/{en,ru}/2026-03-02-mcp-servers-plainly-explained.md` (line 21 ASCII), `src/content/blog/en/2026-03-20-karpenter-right-sizing.mdx` (content gap), `tests/unit/shiki-palette-guard.test.ts` (test pattern), `public/blog-assets/2026-03-20-karpenter-right-sizing/` (existing convention).
- **`npm ls svgo --all`** — confirmed svgo@4.0.0 transitive via astro@5.18.0 and svgo@3.3.3 via astro-icon → @iconify/tools. No direct devDep needed unless hermetic pin desired.
- **`@aldinokemal2104/excalidraw-to-svg` README** — fetched via raw.githubusercontent.com 2026-05-03. API + CLI + font embed + worker pattern.

### Secondary (MEDIUM confidence)

- SVGO v4 migration notes via https://github.com/svg/svgo/blob/main/docs/06-migrations/01-migration-from-v3-to-v4.mdx (Context7-indexed)
- SVGO preset-default v4 plugin list via WebFetch to https://svgo.dev/docs/preset-default/
- `.planning/research/ARCHITECTURE.md` Wave 3 §Excalidraw Integration (research agent output, dated 2026-05-02) — confirms "dev dependency only" + static SVG export pattern
- `.planning/research/PITFALLS.md` Pitfall 6 (~1 MB bundle) and Pitfall 9 (viewBox optimization) — already validated at research time

### Tertiary (LOW confidence — flagged as ASSUMED)

- Live docs for Excalidraw server-side font subsetting edge-cases (how many glyphs push a diagram over 10 KB) — empirical, needs first-diagram validation per A3
- The precise Excalidraw font file names shipped with the wrapper (Excalifont vs Excalifont-Regular vs Excalifont.ttf) — package README documents the 7 fonts but not the exact file names; script doesn't need them — wrapper handles it

## Metadata

**Confidence breakdown:**

- Standard stack choice: HIGH — npm registry directly verified; both library candidates exist, maintained, MIT; dep graphs documented
- API surfaces: HIGH — Context7 returns full `exportToSvg` + `optimize` signatures with examples
- SVGO v4 default behavior: HIGH — explicit migration docs + live WebFetch confirmation of plugin list
- Script pattern: HIGH — existing `generate-icons.mjs` is the idiomatic template
- MCP diagram content fit: HIGH — direct grep confirms line 21 ASCII in both locales
- Karpenter DIAG-05 content gap: HIGH — lines 55-59 prose-only on split-ownership topology
- D-01 deviation analysis: HIGH — package.json of each candidate directly inspected + dep trees traced
- 10 KB budget viability in practice: MEDIUM — font embed size depends on glyph set of real diagrams; empirical verify during Wave 0 first real diagram
- SVGO `removeDesc: false` sufficiency for all diagram styles: MEDIUM — covers MCP + karpenter expected shapes; exotic diagrams (embedded `<image>`, `<style>`) not in scope

**Research date:** 2026-05-03
**Valid until:** 2026-06-03 (30 days — ecosystem is stable; revalidate if `@aldinokemal2104/excalidraw-to-svg` bumps to 2.x or SVGO bumps to 5.x)
