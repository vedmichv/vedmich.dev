---
phase: 02
plan: 02
subsystem: shiki-transformers
tags: [shiki, transformers, astro-config, fixture, deep-signal]
dependency_graph:
  requires:
    - "02-01 — Astro pin + shiki-regression baselines + rehype-code-badge scaffold"
  provides:
    - "@shikijs/transformers@^3.23.0 dev dep, peer-aligned with Astro 5.18.0's shiki@3.21.x line (all resolved to 3.23.0)"
    - "markdown.shikiConfig block in astro.config.mjs: theme 'github-dark' + wrap:true + transformerNotationHighlight() + transformerNotationDiff()"
    - "src/content/blog/en/__fixture-syntax-highlighting.md (draft) with 4 language fences exercising both transformers"
    - "@astrojs/sitemap filter excluding `/blog/__*` draft fixtures — stops Phase 2 fixtures from leaking to public sitemap"
  affects:
    - "Plan 02-03 reads from the shikiConfig block, adds rehypePlugins:[rehypeCodeBadge] (language badge) to the same markdown block"
    - "Plan 02-04 adds Deep Signal CSS overrides — first plan that will legitimately force shiki-regression baseline re-capture for karpenter-right-sizing and any post with yaml/ts/bash fences"
    - "Plan 02-05 (Copy UX + toast) consumes the `.code-block > pre` selector implied by Plan 02-03's rehype wrapper"
tech-stack:
  added:
    - "@shikijs/transformers@^3.23.0 (dev)"
  patterns:
    - "@shikijs/transformers v3 factory-call pattern: `transformers: [transformerNotationHighlight(), transformerNotationDiff()]`"
    - "Dockerfile annotation workaround: `# [!code X]` on own comment line, not trailing inline (Rule 1 fix — Shiki's dockerfile grammar doesn't tokenize trailing `#` as comment)"
    - "@astrojs/sitemap filter callback to exclude content-collection drafts: `sitemap({ filter: (page) => !/\\/blog\\/__/.test(page) })`"
key-files:
  created:
    - src/content/blog/en/__fixture-syntax-highlighting.md
  modified:
    - package.json
    - package-lock.json
    - astro.config.mjs
    - .planning/phases/02-code-block-upgrades/baselines/shiki-regression-2026-03-02-mcp-servers-plainly-explained-en-chromium-darwin.png
    - .planning/phases/02-code-block-upgrades/baselines/shiki-regression-2026-03-02-mcp-servers-plainly-explained-ru-chromium-darwin.png
    - tests/visual/shiki-regression.spec.ts-snapshots/shiki-regression-2026-03-02-mcp-servers-plainly-explained-en-chromium-darwin.png
    - tests/visual/shiki-regression.spec.ts-snapshots/shiki-regression-2026-03-02-mcp-servers-plainly-explained-ru-chromium-darwin.png
decisions:
  - "D-04b executed: `transformerNotationHighlight` (not `transformerMetaHighlight`) — matches `// [!code highlight]` comment syntax, validated on bash/yaml/typescript/dockerfile."
  - "D-05b executed: `transformerNotationDiff` alongside `transformerNotationHighlight` in the same `shikiConfig.transformers` array."
  - "Version correction per RESEARCH.md Summary #1: pinned `^3.23.0` (NOT the kickoff-research's stale `^1.0.0`) — Astro 5.18's shiki peer is `^3.21.0`; v4 would have produced a runtime @shikijs/core duplicate."
  - "Dockerfile annotation placement changed (Rule 1 fix): use own-line `# [!code X]` rather than trailing-comment inline. Shiki's dockerfile grammar tokenizes trailing `#` as raw text; only pure-comment lines trigger the transformer consumption pattern."
  - "Sitemap draft exclusion added (Rule 2 fix): `@astrojs/sitemap` default does NOT filter `data.draft === true` content, so the fixture URL `/en/blog/__fixture-syntax-highlighting/` would have been indexed publicly without the filter."
metrics:
  duration: "~7 minutes (7:26 elapsed — 10:48:06Z → 10:55:32Z)"
  completed: "2026-05-03"
  tasks: 3
  commits: 3
  files_changed: 7
---

# Phase 02 Plan 02: Shiki Transformers Wiring Summary

Installs `@shikijs/transformers@^3.23.0`, wires `transformerNotationHighlight` + `transformerNotationDiff` into `astro.config.mjs`'s new `markdown.shikiConfig` block with `theme: 'github-dark'`, and lands a `draft: true` fixture post exercising both transformers across bash, yaml, typescript, and dockerfile fences. Transformer classes (`has-highlighted`, `has-diff`, `line highlighted`, `line diff add`, `line diff remove`) are grep-verifiable in the built HTML. Deep Signal CSS is NOT yet wired — Plan 02-04 adds it.

## What Shipped

1. **`@shikijs/transformers@^3.23.0` dev dep** — installed via `npm install -D`. Peer-aligned with Astro 5.18.0's `shiki: "^3.21.0"`: `shiki@3.23.0`, `@shikijs/transformers@3.23.0`, `@shikijs/core@3.23.0` all on the 3.x line. No `4.x` drift (which would produce a duplicated `@shikijs/core` runtime).

2. **`astro.config.mjs` shikiConfig block** — added `import { transformerNotationHighlight, transformerNotationDiff } from '@shikijs/transformers';` and expanded the existing `markdown:` block to include:
   ```javascript
   shikiConfig: {
     theme: 'github-dark',
     wrap: true,
     transformers: [
       transformerNotationHighlight(),
       transformerNotationDiff(),
     ],
   },
   ```
   `remarkPlugins: [remarkReadingTime]` preserved. `@astrojs/mdx`'s default `extendMarkdownConfig: true` auto-propagates the config to `.mdx` files — no separate mdx() registration.

3. **`src/content/blog/en/__fixture-syntax-highlighting.md`** — new draft post (4 fences: bash + yaml + typescript + dockerfile). Draft frontmatter keeps it out of BlogPreview, blog list, Speaking, Presentations (all filter `!data.draft`), but Astro still emits the HTML at `/en/blog/__fixture-syntax-highlighting/` so transformer output is grep-verifiable in `dist/`.

4. **`sitemap()` filter** — added `filter: (page) => !/\/blog\/__/.test(page)` so `__*` fixture posts don't leak into `sitemap-0.xml`. The 4 published posts are still indexed normally.

5. **Re-captured 2 shiki-regression baselines** — `mcp-servers-plainly-explained` EN + RU. See Deviations.

## Verification (commands run + results)

| Command | Result |
|---------|--------|
| `npm ls shiki @shikijs/transformers @shikijs/core` | All 3 on `3.23.0`; `shiki@3.23.0` deduped from 2 roots (astro, @astrojs/mdx); no 4.x entries |
| `grep '"@shikijs/transformers"' package.json` | `    "@shikijs/transformers": "^3.23.0",` |
| `grep -c '"@shikijs/transformers"' package-lock.json` | `1` (entry present) |
| `grep -c 'transformerNotationHighlight' astro.config.mjs` | `2` (import + factory call) |
| `grep -c 'transformerNotationDiff' astro.config.mjs` | `2` (import + factory call) |
| `grep -q "theme: 'github-dark'" astro.config.mjs` | match |
| `grep -q 'shikiConfig:' astro.config.mjs` | match |
| `grep -q 'wrap: true' astro.config.mjs` | match |
| `npm run build` | 32 pages (31 published + 1 fixture) in ~1.2s, zero errors |
| `ls dist/en/blog/__fixture-syntax-highlighting/index.html` | file present (29.5 KB) |
| `grep -c 'has-highlighted' dist/.../index.html` | `3` — bash, typescript, dockerfile fences got `has-highlighted` on `<pre>` |
| `grep -c 'has-diff' dist/.../index.html` | `3` — yaml, typescript, dockerfile fences got `has-diff` on `<pre>` |
| `grep -c 'class="line highlighted' dist/.../index.html` | `4` — 1 in bash + 1 in typescript + 2 in dockerfile (exceeds ≥3 threshold) |
| `grep -c 'class="line diff add' dist/.../index.html` | `3` — 1 in yaml + 1 in typescript + 1 in dockerfile (meets ≥3 threshold) |
| `grep -c 'class="line diff remove' dist/.../index.html` | `3` — 1 in yaml + 1 in typescript + 1 in dockerfile (exceeds ≥2 threshold) |
| `grep -c '__fixture' dist/sitemap-0.xml` | `0` (filter excludes draft) |
| `npx playwright test tests/visual/shiki-regression.spec.ts` | **8/8 passed** (8.9s) |
| `npm run test:unit` | 21/21 pass in ~120ms |
| Existing 4 posts transformer-class count | all `0` (no `[!code …]` annotations in their source — expected) |

## Commits

| # | Hash | Type | Files | Description |
|---|------|------|-------|-------------|
| 1 | `0999e93` | chore | package.json, package-lock.json | Install @shikijs/transformers@^3.23.0 (peer-aligned, no 4.x drift) |
| 2 | `7ef515b` | feat | astro.config.mjs + 4 PNG baselines | Wire shikiConfig.transformers + re-capture 2 drifted baselines |
| 3 | `b5ef68e` | feat | astro.config.mjs, src/content/blog/en/__fixture-syntax-highlighting.md | Fixture post + sitemap draft filter |

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking Issue] Shiki-regression baseline drift on mcp-servers-plainly-explained**

- **Found during:** Task 2 — after wiring `shikiConfig` with `wrap: true`, `npx playwright test tests/visual/shiki-regression.spec.ts` failed on 2/8 baselines (EN + RU of `2026-03-02-mcp-servers-plainly-explained`).
- **Issue:** Pre-02-02 baseline captured the ASCII-art plaintext fence `[ Client: Claude Code ] ←→ [ MCP Server ] ←→ [ External resource: docs / DB / API ]` (~90 chars wide) as a horizontally-scrollable single line. Post-02-02, the explicit `wrap: true` in the new `shikiConfig` tells Shiki to emit `white-space: pre-wrap; word-wrap: break-word;` on every `<pre>`, which wraps that long line to 2 lines, shifting the `.prose` section height by several dozen pixels — well past the `maxDiffPixels: 150` threshold.
- **Root cause of plan mismatch:** Plan 02-01-SUMMARY.md and Plan 02-02 both claimed 8 baselines would pass unchanged after 02-02 because "transformers add classes but no CSS defines their appearance yet". That was correct for the transformer classes BUT overlooked that `wrap: true` (also part of the same commit) IS a visual change to any pre-existing long-line fence.
- **Fix:** Re-captured 2 baselines via `npx playwright test ... --grep mcp-servers --update-snapshots`, then copied the new PNGs to the phase-artifact dir (`.planning/phases/02-code-block-upgrades/baselines/`). 6 other baselines verified still-byte-identical (no drift on fence-less posts or the karpenter yaml fences which fit container width).
- **Files modified:** 4 PNGs (2 in `tests/visual/shiki-regression.spec.ts-snapshots/`, 2 in `.planning/phases/02-code-block-upgrades/baselines/`). No code change.
- **Commit:** `7ef515b`

**2. [Rule 1 - Bug] Dockerfile inline annotations silently skipped**

- **Found during:** Task 3 — after creating the fixture with inline-comment annotations (`RUN npm ci # [!code highlight]`) per plan's verbatim content, `grep 'has-highlighted' dist/.../index.html` returned `2` for Fence 4 (Dockerfile) instead of the expected `1`; per-line transformer classes were missing entirely.
- **Issue:** Shiki's `dockerfile` TextMate grammar does NOT tokenize trailing `# ...` as a comment token — the entire string after the Docker command (e.g. `RUN npm ci # [!code highlight]`) stays in a single "text" token. `@shikijs/transformers/transformerNotationHighlight` searches for `[!code X]` literals inside comment tokens ONLY; without a comment token, it can't find or consume the annotation, so the line class and `<pre>` class both silently skip.
- **Verified with isolated repro:** Ran `codeToHtml(..., { lang: 'dockerfile', transformers: [...] })` directly — confirmed trailing `# [!code X]` stays in raw text; pure-comment `# [!code X]` on its own line IS consumed and applied to the next source line.
- **Research reference:** RESEARCH.md Pitfall 6 flagged the risk for "comment-less languages" but incorrectly implied all four fixture languages would handle inline fine. Empirical test here nails down that dockerfile specifically requires own-line annotations.
- **Fix:** Restructured the dockerfile fence in the fixture to use own-line `# [!code X]` pattern (transformer consumes the comment line and attaches the class to the NEXT line). Added inline prose in the fixture markdown explaining the quirk to future readers. Final Dockerfile fence now has 2 `highlighted` lines, 1 `diff add`, and 1 `diff remove` — exceeds all thresholds.
- **Files modified:** `src/content/blog/en/__fixture-syntax-highlighting.md` (edited before Task 3 commit, so no separate commit).
- **Commit:** `b5ef68e`

**3. [Rule 2 - Missing Critical Functionality] @astrojs/sitemap does NOT filter content-collection drafts**

- **Found during:** Task 3 — post-build `grep -c '__fixture' dist/sitemap-0.xml` returned `1`, meaning the URL `https://vedmich.dev/en/blog/__fixture-syntax-highlighting/` was in the public sitemap and would be indexed by search engines on next crawl.
- **Issue:** The plan's description text claimed "Astro builds draft posts into `dist/` but excludes from `sitemap`". That claim is factually wrong — `@astrojs/sitemap@^3.7.0` has no awareness of `data.draft` from Astro Content Collections. It includes every `dist/*/index.html` page regardless of frontmatter.
- **Security/SEO impact:** If shipped as-is, the draft fixture URL would be indexed in Google/Bing, potentially outranking canonical posts for syntax-highlighting queries, and exposing an internal test artifact publicly. Low severity (the `__` prefix and fixture title make it obvious) but Rule 2 applies — drafts should never reach public sitemaps.
- **Fix:** Added `filter: (page) => !/\/blog\/__/.test(page)` to the `sitemap()` call in `astro.config.mjs`. Pattern matches any blog URL starting with `__` (fixture naming convention). Published posts are unaffected.
- **Files modified:** `astro.config.mjs` (edited in Task 3's commit since it's the task that introduced the fixture causing the leak).
- **Verified:** `grep -c '__fixture' dist/sitemap-0.xml` returns `0` post-fix.
- **Commit:** `b5ef68e`

## Authentication Gates

None. All operations were local (npm install, npx playwright test, git commit, node-test unit runs). No network auth required.

## Known Stubs

None introduced by this plan. The fixture file IS a content stub (intentional placeholder exercising transformers), but it's excluded from user-facing UI (BlogPreview, blog list, sitemap) and marked `draft: true`. Purpose is test-infrastructure, not content stub.

## Next Plan Entry Point

**Plan 02-03 — Author `rehype-code-badge.mjs` (+ optional `remark-stash-code-lang.mjs`), wire into `markdown.rehypePlugins`, write real hast-tree unit tests replacing the 02-01 scaffold.**

This plan delivers CODE-01 (language badge). Plan 02-03 will:
1. Empirical spike (10 min): inspect `<pre>` HTML in Astro 5.18 + Shiki 3.23 to confirm whether the `language-*` class survives to the rehype stage. Research Q2 predicts it does NOT in default config — then Workaround A (remark-stash-code-lang stashes language onto `hProperties['data-language']`) is needed.
2. Author `rehype-code-badge.mjs` at project root using `unist-util-visit` + `hastscript` (both transitively installed — zero new top-level deps).
3. Register in `markdown.rehypePlugins: [rehypeCodeBadge]` of astro.config.mjs.
4. Replace `tests/unit/rehype-code-badge.test.ts` scaffold with real hast-tree fixtures (assert `<figure class="code-block">` wrap + `<span class="code-lang-badge">` + correct language text).
5. Build, verify `<figure class="code-block">` present for all Shiki-rendered fences (fixture + karpenter-right-sizing yaml fences).
6. Run shiki-regression again — WILL break baselines for posts with fences since the `<figure>` wrapper shifts the DOM. Re-capture the baselines that drift, keeping the 6 fence-less baselines intact.

Then Plan 02-04 adds Deep Signal CSS overrides (CODE-04) to the `.prose .shiki` scope, which IS a visual change — more baseline drift expected there too.

## Self-Check: PASSED

- `package.json` has `"@shikijs/transformers": "^3.23.0"` — FOUND (grep confirms)
- `package-lock.json` has @shikijs/transformers entry — FOUND (grep count 1)
- `astro.config.mjs` has `import { transformerNotationHighlight, transformerNotationDiff } from '@shikijs/transformers';` — FOUND
- `astro.config.mjs` has `shikiConfig:` with `theme: 'github-dark'`, `wrap: true`, `transformers: [...]` — FOUND
- `astro.config.mjs` has sitemap filter for `__` fixtures — FOUND
- `src/content/blog/en/__fixture-syntax-highlighting.md` — FOUND (created in Task 3)
- Task 1 commit `0999e93` — FOUND in `git log --oneline -5`
- Task 2 commit `7ef515b` — FOUND in `git log --oneline -5`
- Task 3 commit `b5ef68e` — FOUND in `git log --oneline -5`
- `npm run build` — PASSES (32 pages in 1.12–1.36s across runs)
- `npx playwright test tests/visual/shiki-regression.spec.ts` — PASSES (8/8 after baseline re-capture)
- `npm run test:unit` — PASSES (21/21)
- `dist/en/blog/__fixture-syntax-highlighting/index.html` — FOUND (29.5 KB)
- Fixture `has-highlighted` count `3`, `has-diff` count `3`, line-level classes all meet or exceed thresholds — VERIFIED
- Existing 4 published posts have zero transformer classes (no `[!code …]` annotations in their source) — VERIFIED
- Sitemap excludes fixture URL — VERIFIED (grep count 0)
