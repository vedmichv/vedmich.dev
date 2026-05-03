---
phase: 02
plan: 03
subsystem: rehype-plugins
tags: [rehype, remark, hast, astro-plugin, badge, code-lang-badge, figure]
dependency_graph:
  requires:
    - "02-02 — shikiConfig wired (github-dark + wrap + transformers), fixture post published, sitemap draft filter"
    - "02-01 — Astro 5.18.0 pin + shiki-regression baselines + rehype-code-badge unit scaffold"
  provides:
    - "remark-stash-code-lang.mjs at project root (ESM, named export, sets mdast code.data.hProperties['data-language'])"
    - "rehype-code-badge.mjs at project root (ESM, named export, wraps pre.shiki|astro-code in figure.code-block + prepends span.code-lang-badge)"
    - "astro.config.mjs wired with both plugins — markdown.remarkPlugins + markdown.rehypePlugins"
    - "6 new unit tests (hast fixtures) + 1 astro-code class regression lock = 7 total; all passing; test count 20 → 27"
    - "Working figure/badge DOM in dist HTML for all fence-bearing posts, both locales"
  affects:
    - "Plan 02-04 adds `.prose .code-block` + `.prose .code-lang-badge` CSS to style the figure + badge (restoring visual parity to shiki-regression baselines that drifted from the unstyled wrap)"
    - "Plan 02-05 CodeCopyEnhancer retargets `.code-block > pre` (replacing the old `.prose pre` scan + `div.code-wrap` runtime insertion) and uses the existing `.code-block` figure as its absolute-positioning parent"
    - "Plan 02-06 final baseline re-capture after Plan 02-04 CSS lands"
tech-stack:
  added: []  # zero new top-level deps; unist-util-visit + hastscript resolved transitively
  patterns:
    - "Defensive hast property read: accept both hast-spec (`className` array, `data-language` kebab-case) AND Astro v5 internal flavor (`class` string, `dataLanguage` camelCase). Helpers `getClassList()` + `getDataLanguage()` normalize both."
    - "Marker-class union: rehype plugin matches EITHER `shiki` (Shiki's own class) OR `astro-code` (Astro's internal rehype plugin's wrapper class). Locked as `Set` for O(1) membership check."
    - "Astro cache invalidation required for plugin authoring: `rm -rf .astro node_modules/.astro dist` before every fresh build when testing new remark/rehype plugins. Cached hast on .md files silently skips plugin execution until cleared."
    - "Belt-and-suspenders language propagation: Astro's internal Shiki rehype plugin already emits `data-language` on `<pre>` from the fence `lang`, but `remark-stash-code-lang.mjs` ALSO stashes it via `hProperties` as defensive fallback should Astro's internal behavior change."
key-files:
  created:
    - remark-stash-code-lang.mjs
    - rehype-code-badge.mjs
  modified:
    - astro.config.mjs
    - tests/unit/rehype-code-badge.test.ts
decisions:
  - "D-01 executed: build-time rehype plugin wraps `<pre class=\"astro-code\">` (Astro's marker) in `<figure class=\"code-block\">`. Zero runtime JS. Badge HTML ships in static build."
  - "D-01b executed: plugin files at project root (`remark-stash-code-lang.mjs`, `rehype-code-badge.mjs`), wired via `markdown.remarkPlugins` + `markdown.rehypePlugins`, mirrors `remark-reading-time.mjs` pattern."
  - "D-01c executed: badge INSIDE `.code-block` figure, BEFORE `<pre>` — `<figure><span.code-lang-badge>LANG</span><pre>…</pre></figure>`."
  - "Rule 1 correction — marker class: Astro's built-in Shiki integration emits `class=\"astro-code\"`, NOT `class=\"shiki\"` (Shiki's own default). Plan, CONTEXT.md, RESEARCH.md, and PATTERNS.md all assumed `shiki`. Plugin accepts BOTH so direct-Shiki users (if ever added) remain supported."
  - "Rule 1 correction — hast property flavor: Astro v5's internal Shiki rehype plugin emits hast properties as raw HTML-attribute keys (`class` string, `dataLanguage` camelCase), not hast-standard (`className` array, `data-language` kebab). Plugin normalizes via helpers rather than assuming one flavor."
  - "Rule 1 correction — pipeline order: Research predicted user rehype runs BEFORE Shiki (so the plugin would read `<pre>` with no classes yet). Empirically verified via stderr trace that Astro v5 user rehype runs AFTER internal Shiki rehype (Astro internal plugin already applied all classes, transformers, and data-language). Plan's stashed-data-language fallback is still sound defensively."
  - "Rule 1 correction — node:test `aria-hidden` assertion: plan's verbatim test used `badge.properties['aria-hidden']` but hast normalizes attribute to camelCase property `ariaHidden`. Fixed assertion with inline comment explaining hast convention."
metrics:
  duration: "~7 minutes (11:00–11:07 UTC)"
  completed: "2026-05-03"
  tasks: 3
  commits: 3
  files_changed: 4
  lines_added: 276
  lines_deleted: 10
  unit_test_count: "20 → 27 (+7)"
  build_pages: 32
  build_duration: "~1.1-1.35s per run"
---

# Phase 02 Plan 03: Language Badge Rehype Plugin Summary

Delivers CODE-01 (language badge) at build time. Two new ESM plugins at project root — `remark-stash-code-lang.mjs` (stashes fence `lang` onto hProperties) and `rehype-code-badge.mjs` (wraps Shiki's `<pre>` in `<figure class="code-block">` + prepends `<span class="code-lang-badge">`). Both wired into `astro.config.mjs`. Unit tests cover 7 contracts over in-memory hast fixtures. Badge DOM appears in static HTML for every fence-bearing post across both locales — zero runtime JS. Deep Signal CSS for the figure + badge lands in Plan 02-04.

## What Shipped

1. **`remark-stash-code-lang.mjs`** (20 LOC including header comment) — ESM named export `remarkStashCodeLang`. Visits mdast `code` nodes; sets `node.data.hProperties['data-language']` from `node.lang`. Survives the remark→rehype conversion as a hast property. Defensive fallback — Astro v5's internal Shiki rehype plugin ALREADY emits `data-language` on the `<pre>` directly, but this plugin guards against that internal behavior changing.

2. **`rehype-code-badge.mjs`** (86 LOC, mostly header comment documenting the Astro v5 pipeline + flavor quirks) — ESM named export `rehypeCodeBadge`. Visits hast `element` nodes; when a `<pre>` has class `shiki` OR `astro-code`, wraps it in `<figure class="code-block">` with a leading `<span class="code-lang-badge">LANG</span>`. Reads language from either `data-language` or `dataLanguage` property (both flavors supported). Idempotent (re-run over already-wrapped tree is a no-op). Falls back to `"text"` when no language attribute present (bare ``` fence).

3. **`astro.config.mjs` wiring** — two new imports (`remarkStashCodeLang` + `rehypeCodeBadge`), `markdown.remarkPlugins: [remarkReadingTime, remarkStashCodeLang]`, new `markdown.rehypePlugins: [rehypeCodeBadge]`. Existing `shikiConfig` (github-dark + wrap + transformers) preserved verbatim. Sitemap filter from Plan 02-02 preserved. Verbatim-preserved: `// @ts-check`, `defineConfig`, `site`, `i18n`, `vite`, `integrations`.

4. **`tests/unit/rehype-code-badge.test.ts`** (166 LOC) — replaces the Wave 0 scaffold from Plan 02-01. Uses `node:test` + `node:assert/strict`. Seven tests covering the plugin contract:
   - wraps `<pre class="shiki">` in `<figure class="code-block">`
   - prepends `<span class="code-lang-badge">` with language text + `aria-hidden="true"`
   - falls back to `"text"` badge when `data-language` missing
   - skips `<pre>` without `shiki`/`astro-code` class (user-authored raw pre)
   - idempotent — second run is a no-op
   - skips `<div>` elements (only wraps `<pre>`)
   - wraps `<pre class="astro-code">` (Astro integration marker — regression lock)

## Verification (commands run + results)

| Command | Result |
|---------|--------|
| `test -f remark-stash-code-lang.mjs && test -f rehype-code-badge.mjs` | both present |
| `grep -q 'export function remarkStashCodeLang' remark-stash-code-lang.mjs` | match |
| `grep -q 'export function rehypeCodeBadge' rehype-code-badge.mjs` | match |
| `node -e "import('./remark-stash-code-lang.mjs').then(m => console.log(typeof m.remarkStashCodeLang))"` | `function` |
| `node -e "import('./rehype-code-badge.mjs').then(m => console.log(typeof m.rehypeCodeBadge))"` | `function` |
| `grep -c "^test(" tests/unit/rehype-code-badge.test.ts` | `7` |
| `npm run test:unit` | 27/27 passed in ~128ms (20 prior + 7 new) |
| `grep -c "rehypeCodeBadge" astro.config.mjs` | `4` (import + markdown block + 2 comment mentions — ≥ 2 required) |
| `grep -c "remarkStashCodeLang" astro.config.mjs` | `3` (import + markdown block + 1 comment mention — ≥ 2 required) |
| `grep -q "rehypePlugins: \[rehypeCodeBadge\]" astro.config.mjs` | match |
| `grep -q "remarkPlugins: \[remarkReadingTime, remarkStashCodeLang\]" astro.config.mjs` | match |
| `rm -rf .astro node_modules/.astro dist && npm run build` | 32 pages in 1.26s, zero errors |
| `grep -c 'class="code-block"' dist/en/blog/2026-03-20-karpenter-right-sizing/index.html` | `2` (≥ 2 required) |
| `grep -c 'code-lang-badge' dist/en/blog/2026-03-20-karpenter-right-sizing/index.html` | `2` |
| `grep -c '>yaml</span>' dist/en/blog/2026-03-20-karpenter-right-sizing/index.html` | `2` (≥ 2 required) |
| `grep -c 'class="code-block"' dist/en/blog/__fixture-syntax-highlighting/index.html` | `4` (bash + yaml + typescript + dockerfile; ≥ 4 required) |
| `grep -c '>bash</span>' dist/en/blog/__fixture-syntax-highlighting/index.html` | `1` |
| `grep -c '>dockerfile</span>' dist/en/blog/__fixture-syntax-highlighting/index.html` | `1` |
| `grep -c 'code-lang-badge' dist/en/blog/hello-world/index.html 2>/dev/null \|\| echo 0` | `0` (fence-less post; correct) |
| `grep -c 'code-lang-badge' dist/en/blog/2026-02-10-why-i-write-kubernetes-manifests-by-hand/index.html 2>/dev/null \|\| echo 0` | `0` (fence-less post; correct) |
| `grep -c 'code-lang-badge' dist/en/index.html 2>/dev/null \|\| echo 0` | `0` (homepage not prose; correct) |
| `grep -c 'code-lang-badge' dist/index.html 2>/dev/null \|\| echo 0` | `0` (root redirect; correct) |
| `grep -c 'code-lang-badge' dist/ru/blog/2026-03-20-karpenter-right-sizing/index.html` | `2` (bilingual parity ≥ 2 required) |
| `grep -c 'class="code-block"' dist/en/blog/2026-03-02-mcp-servers-plainly-explained/index.html` | `1` (1 bare plaintext fence wrapped with `text` badge fallback — note: Astro infers `data-language="plaintext"` so badge text is `plaintext` not the fallback literal) |
| `npx playwright test tests/visual/shiki-regression.spec.ts` | 4/8 FAILED (mcp-servers + karpenter × 2 locales), 4/8 PASSED (fence-less posts) — **expected transient regression** per plan objective |

## Commits

| # | Hash | Type | Files | Description |
|---|------|------|-------|-------------|
| 1 | `c4bf873` | feat | `remark-stash-code-lang.mjs`, `rehype-code-badge.mjs` | Add plugin files at project root (initial implementation per plan's verbatim spec) |
| 2 | `2691162` | test | `tests/unit/rehype-code-badge.test.ts` | Replace scaffold with 6 hast-tree tests |
| 3 | `5872fe9` | feat | `astro.config.mjs`, `rehype-code-badge.mjs`, `tests/unit/rehype-code-badge.test.ts` | Wire plugins into markdown pipeline + Rule 1 fixes (marker class, hast flavor) + 7th regression-lock test |

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 — Bug] Plugin's marker-class filter never matched Astro's `<pre>`**

- **Found during:** Task 3 — first build after wiring plugins showed `0` figures emitted on all pages despite `npm run build` passing 32 pages.
- **Issue:** Plan specified the rehype plugin filter `classes.includes('shiki')` based on "Shiki emits `class=\"shiki\"`" assumption from RESEARCH.md §Q2. Empirically, Astro's internal Shiki rehype plugin emits `class="astro-code github-dark"` (Astro's own marker class), NOT `class="shiki"`. Plan 02-02 SUMMARY even recorded this (`class="astro-code github-dark"` in its verification grep) but the plan's plugin spec wasn't updated.
- **Fix:** Widened marker detection to `new Set(['shiki', 'astro-code'])` with a union check. Preserves direct-Shiki compatibility if the site ever adds non-Astro Shiki usage (e.g., a runtime `codeToHtml()` call). Documented in plugin header comment.
- **Files modified:** `rehype-code-badge.mjs`, `tests/unit/rehype-code-badge.test.ts` (added 7th test locking the `astro-code` contract)
- **Commit:** `5872fe9`

**2. [Rule 1 — Bug] Plugin's hast property read used wrong flavor for Astro v5**

- **Found during:** Task 3 — after widening the marker class, still `0` figures emitted because `node.properties.className` was always `undefined`.
- **Issue:** hast spec says element properties use camelCase key names for HTML attributes — `className` (array), `tabIndex`, `dataLanguage`. Astro v5's internal Shiki rehype plugin instead emits raw HTML-attribute keys: `class` (space-separated string), `tabindex`, `data-language`. Plan's plugin spec assumed canonical hast flavor (`node.properties.className`, `node.properties['data-language']`) which silently returned `undefined` on Astro-emitted trees. `hastscript`'s `h()` produces the canonical flavor (verified — badge `className` is an array and `ariaHidden` is camelCase), so the unit tests with synthesized fixtures passed while the live Astro build failed.
- **Fix:** Added `getClassList(properties)` and `getDataLanguage(properties)` helpers that normalize either flavor:
  - `getClassList`: `className` (array) → as-is; `class` (string) → split on whitespace.
  - `getDataLanguage`: `data-language` → as-is; `dataLanguage` → as-is.
  Documented both flavors in plugin header comment.
- **Files modified:** `rehype-code-badge.mjs`
- **Commit:** `5872fe9`

**3. [Rule 1 — Bug] Plan's test assertion used non-existent hast property**

- **Found during:** Task 2 — `npm run test:unit` showed 1/6 tests failing with `AssertionError: Expected values to be strictly equal: + undefined / - 'true'`.
- **Issue:** Plan's verbatim test asserted `badge.properties['aria-hidden'] === 'true'`. `hastscript` normalizes the `aria-hidden` attribute to the camelCase property key `ariaHidden` (which serializes back to `aria-hidden="true"` on HTML emission). The kebab-case key doesn't exist on hast properties, so `badge.properties['aria-hidden']` is `undefined`.
- **Fix:** Changed assertion to `badge.properties.ariaHidden === 'true'` with an inline comment explaining the hast convention.
- **Files modified:** `tests/unit/rehype-code-badge.test.ts`
- **Commit:** `2691162` (fixed before first test commit landed)

**4. [Rule 3 — Blocking Issue] Astro hast cache silently skipped rehype on .md files**

- **Found during:** Task 3 — after fixing #1 and #2, karpenter.mdx (2 yaml badges) worked but fixture.md (0 badges) and mcp-servers.md (0 badges) failed. Pattern: all `.mdx` files wrapped, all `.md` files unwrapped. Initial hypothesis: Astro only runs rehype plugins on MDX.
- **Issue:** Astro caches the hast tree for `.md` files at `.astro/` and `node_modules/.astro/`. The cache was populated during earlier builds (from Plan 02-01 and 02-02 where `rehype-code-badge` did not yet exist). On rebuild, Astro reused the cached hast for unchanged `.md` sources — completely skipping rehype-plugin execution for them. `.mdx` files don't hit the same cache path, so they re-ran the plugins as expected.
- **Fix:** `rm -rf .astro node_modules/.astro dist && npm run build`. After cache clear, rehype plugin ran against ALL files (both `.md` and `.mdx`). Documented the requirement in plugin header comment + commit message + this SUMMARY so future plugin-authoring plans know to clear the cache before empirical verification.
- **Files modified:** none (runtime cache — not tracked)
- **Commit:** N/A (documented in `5872fe9` message)

### Pipeline order correction (documented, not auto-fixed)

The plan's `<interfaces>` block said: "Pipeline order (per RESEARCH.md Q2): 1. Remark plugins mutate mdast → 2. Remark→rehype conversion → 3. Shiki highlights `<pre><code>` → 4. User rehypePlugins run (rehypeCodeBadge sees `<pre class=\"shiki ...\">)`." This is the CORRECT final order per the plan, and it IS what we observe empirically (`<pre class="astro-code github-dark has-highlighted ..." data-language="yaml">` when the visitor runs). The plan's description is accurate; RESEARCH.md §Q2 was right. The earlier Summary (02-02) also confirmed this order. So no deviation here — this note is just to clarify the belt-and-suspenders role of `remark-stash-code-lang.mjs`: since Astro's internal Shiki rehype plugin ALREADY populates `data-language` on `<pre>`, the remark-stash plugin is defensive-only in this Astro version. If Astro ever changes its internal plugin to stop emitting `data-language`, the remark-stash fallback kicks in (assuming Astro's mdast→hast converter stops stripping `hProperties` on the code node, which it shouldn't).

## Expected Transient Regression

Per the plan's objective: after Task 3, `npx playwright test tests/visual/shiki-regression.spec.ts` shows **4/8 failures** on fence-bearing posts (mcp-servers + karpenter × 2 locales). This is **designed** — the figure + badge DOM is now present in the HTML but has zero CSS styling, so the unstyled badge text renders as plain text above each code block, shifting `.prose` pixel layout past the `maxDiffPixels: 150` threshold. The 4/8 fence-less posts (hello-world + why-i-write-k8s-manifests × 2 locales) still pass unchanged.

Snapshots intentionally NOT updated. Plan 02-04 adds Deep Signal CSS (`.prose .code-block { position: relative; margin: 0; }` + `.prose .code-lang-badge { position: absolute; top: 0.6rem; left: 0.6rem; color: var(--text-muted); ... }`) which restores visual parity. Final baseline re-capture happens in Plan 02-06.

## Authentication Gates

None. All operations were local (npm install, npm run build, npm run test:unit, npx playwright test, git commit). No network auth required.

## Known Stubs

None introduced by this plan. The two plugin files and the unit tests are fully implemented — no TODOs, placeholders, or `assert.ok(true)` stubs remaining. Badge DOM is a functional (if unstyled) feature; CSS styling is the explicit next plan (02-04) per the phase roadmap.

## Next Plan Entry Point

**Plan 02-04 — Deep Signal CSS overrides for Shiki tokens + figure/badge/highlight/diff styles.**

Plan 02-04 will:
1. Add `.prose .code-block` styling (`position: relative; margin: 0;` to host the badge absolute-positioning).
2. Add `.prose .code-lang-badge` styling (JetBrains Mono 0.7rem, muted → primary on hover, top-right placement per D-06).
3. Add `.prose pre.astro-code` Deep Signal background + border overrides (`var(--bg-code)`, `var(--border)`).
4. Add `.prose .shiki span[style*="color:#..."]` attribute selectors for github-dark token → Deep Signal mapping (per D-03, D-03d; 6 token colors mapped to teal/amber/muted/primary/primary-hover).
5. Add `.prose .shiki .highlighted` (border-left + bg tint per D-04) and `.prose .shiki .diff.add/.remove` (git palette + gutter glyph per D-05).
6. Re-run `npx playwright test tests/visual/shiki-regression.spec.ts` — expect ALL 8 to fail now (the CSS change is a deliberate visual shift that drifts every baseline). Re-capture all 8 baselines with `--update-snapshots` and commit the new PNGs. This becomes the committed "after" state that Plan 02-06 locks in.
7. Manual audit via `npm run preview` on karpenter + fixture posts, both locales — confirm badge renders as JB Mono uppercase muted in top-right, highlight/diff lines render with correct colors.

Plan 02-04 is the largest visual-change plan in the phase. After 02-04, CSS is locked; Plans 02-05 (CodeCopyEnhancer) and 02-06 (verification + Astro caret restore + final baseline commit) are DOM + test-infra only with minimal visual impact.

## Self-Check: PASSED

- `remark-stash-code-lang.mjs` at project root — FOUND (20 LOC, `grep -q 'export function remarkStashCodeLang'` matches)
- `rehype-code-badge.mjs` at project root — FOUND (86 LOC, `grep -q 'export function rehypeCodeBadge'` matches)
- `astro.config.mjs` wired with both plugins — VERIFIED (remarkPlugins + rehypePlugins grep matches)
- `tests/unit/rehype-code-badge.test.ts` — FOUND (7 tests, `grep -c "^test("` returns 7; scaffold placeholder replaced)
- Task 1 commit `c4bf873` — FOUND in `git log --oneline -4`
- Task 2 commit `2691162` — FOUND in `git log --oneline -4`
- Task 3 commit `5872fe9` — FOUND in `git log --oneline -4`
- `npm run test:unit` — PASSES (27/27 in ~128ms)
- `npm run build` — PASSES (32 pages in ~1.26s)
- `dist/en/blog/2026-03-20-karpenter-right-sizing/index.html` contains 2 × `class="code-block"` + 2 × `>yaml</span>` — VERIFIED
- `dist/en/blog/__fixture-syntax-highlighting/index.html` contains 4 × `class="code-block"` + badges for bash/yaml/typescript/dockerfile — VERIFIED
- `dist/en/blog/2026-03-02-mcp-servers-plainly-explained/index.html` contains 1 × `class="code-block"` + 1 × `>plaintext</span>` — VERIFIED
- `dist/ru/blog/2026-03-20-karpenter-right-sizing/index.html` contains 2 × `class="code-block"` — bilingual parity VERIFIED
- Fence-less posts (hello-world, why-i-write-k8s × 2 locales) have 0 × `code-lang-badge` — VERIFIED (scope correct, no leakage)
- Homepage `dist/en/index.html` + root `dist/index.html` have 0 × `code-lang-badge` — VERIFIED (not prose, correctly untouched)
- `npx playwright test tests/visual/shiki-regression.spec.ts` — 4/8 expected failures on fence-bearing posts (designed transient regression per plan objective) — VERIFIED; snapshots NOT updated
