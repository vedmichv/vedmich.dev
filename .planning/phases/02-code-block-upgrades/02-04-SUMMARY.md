---
phase: 02
plan: 04
subsystem: shiki-css-deep-signal
tags: [css, deep-signal, shiki, figure, badge, highlight, diff, global-css]
dependency_graph:
  requires:
    - "02-03 — rehype-code-badge.mjs emits `<figure class=\"code-block\"><span class=\"code-lang-badge\">LANG</span><pre class=\"astro-code ...\">…</pre></figure>`"
    - "02-02 — shikiConfig with github-dark + wrap:true + transformerNotationHighlight + transformerNotationDiff wired; fixture post present"
    - "02-01 — design-tokens.css canonical tokens (`--brand-primary`, `--brand-accent`, `--text-primary`, `--text-muted`, `--bg-code`, `--border`, `--success`, `--error`, `--font-mono`, `--brand-primary-soft`, `--brand-primary-hover`)"
  provides:
    - "128-line Phase 2 CSS block appended to src/styles/global.css (after existing reduced-motion rule)"
    - "`.prose pre.shiki` background/color/border override (CODE-04 D-03b)"
    - "8 attribute-selector token overrides mapping github-dark emit hex → Deep Signal tokens (D-03/D-03c/D-03d)"
    - "`.prose .code-block` figure host (position: relative; margin: 1.5rem 0)"
    - "`.prose .code-lang-badge` JB Mono 0.7rem uppercase visual (D-06)"
    - "`.prose .shiki .line.highlighted` border-left + color-mix tint (D-04)"
    - "`.prose .shiki .line.diff.add` + `.line.diff.remove` color-mix tints + `+` / U+2212 gutter glyphs (D-05/D-05c)"
    - "Reduced-motion rule for badge color transition"
  affects:
    - "Plan 02-05 CodeCopyEnhancer retargets `.code-block > pre` (parent already positioned by this plan's rule `.prose .code-block { position: relative }`)"
    - "Plan 02-06 final baseline re-capture — all 4 fence-bearing shiki-regression screenshots must be replaced; Plan 02-06 runs `--update-snapshots` once and commits the new PNGs"
tech-stack:
  added: []  # zero dependencies; pure CSS addition
  patterns:
    - "Shiki attribute-selector override: `.prose .shiki span[style*=\"color:#XXXXXX\" i]` matches Shiki's inline `style=\"color:#XXXXXX\"` emission. `i` flag handles Shiki minor-version case drift."
    - "`!important` on all token overrides to defeat Shiki's inline `style=` attribute (specificity tie; inline wins without it)."
    - "`.prose` scope on every new selector — prevents CSS leakage onto homepage Hero terminal, About skill pills, nav chrome, cert badges, cards (Pitfall 11)."
    - "CSS `color-mix(in srgb, <token> NN%, transparent)` for tint bgs — keeps contrast tunable by editing one % value, survives future token-palette changes."
    - "Diff gutter glyph via `::before { content: \"+\" | \"−\" }` — uses U+2212 MINUS SIGN for the remove side (visually heavier than ASCII hyphen)."
key-files:
  created: []
  modified:
    - src/styles/global.css
decisions:
  - "D-03 executed: github-dark base + Deep Signal CSS variable overrides scoped to .prose .shiki (Option 1 from RESEARCH.md Q3 — simpler than dual-theme mode refactor; keeps D-03 locked decision intact)."
  - "D-03b executed: `.prose pre.shiki { background-color: var(--bg-code) !important; color: var(--text-primary) !important; border: 1px solid var(--border); }`."
  - "D-03c executed: `!important` applied per rule to defeat Shiki's inline style attribute."
  - "D-03d executed: attribute selectors target Shiki-emitted hex literals, not classes (github-dark emits no token classes in Astro v5's integrated path)."
  - "D-04 executed: `.line.highlighted` gets `border-left: 2px solid var(--brand-primary)` + `background: color-mix(in srgb, var(--brand-primary-soft) 45%, transparent)`."
  - "D-05 executed: `.line.diff.add` + `.line.diff.remove` tinted via color-mix with --success / --error at 15%; gutter glyphs `+` and U+2212 emitted via ::before."
  - "D-05c executed: U+2212 MINUS SIGN (not ASCII `-`) used for remove-line glyph for visual weight parity with `+`."
  - "D-06 executed: `.code-lang-badge` = JetBrains Mono (var(--font-mono)) 0.7rem weight 500, letter-spacing 0.04em, uppercase, text-muted default, text-primary on `.code-block:hover`, 120ms ease color transition, absolute top-0.5rem/left-0.6rem, pointer-events: none, user-select: none, z-index: 1."
  - "Reduced-motion compliance: badge color transition disabled under `@media (prefers-reduced-motion: reduce)`."
metrics:
  duration: "~4 minutes (13:08–13:12 UTC)"
  completed: "2026-05-03"
  tasks: 1
  commits: 1
  files_changed: 1
  lines_added: 128
  lines_deleted: 0
  build_pages: 32
  build_duration: "1.34s"
---

# Phase 02 Plan 04: Deep Signal CSS for Shiki + Figure / Badge / Highlight / Diff Summary

Delivers the visual half of CODE-04 (Deep Signal Shiki palette via CSS variable overrides + attribute selectors) AND completes the visual-identity side of CODE-01 (badge), CODE-02 (highlight), and CODE-03 (diff). Plan 02-03 emitted the DOM; this plan styles it. All rules `.prose`-scoped to prevent leakage onto homepage terminal, nav, or cert badges (Pitfall 11). Zero deprecated cyan anywhere in source or compiled dist CSS (CLAUDE.md hard constraint).

## What Shipped

One file modified: `src/styles/global.css` gained 128 lines appended after the existing reduced-motion rule. No existing rule touched. Nine new style groups:

1. **Phase 2 section header comment** — identifies the block (scope, token source, purpose).
2. **`.prose pre.shiki` base override** — `background-color: var(--bg-code) !important; color: var(--text-primary) !important; border: 1px solid var(--border);` (D-03b).
3. **8 token-color attribute selectors** (D-03 / D-03c / D-03d) — one `.prose .shiki span[style*="color:#XXXXXX" i]` per Shiki github-dark color with `!important` override:
   - `#E1E4E8` → `var(--text-primary)`
   - `#F97583` → `var(--brand-primary)` (keywords)
   - `#9ECBFF` → `var(--brand-accent)` (strings)
   - `#85E89D` → `var(--brand-primary)` (yaml keys, html tags)
   - `#79B8FF` → `var(--brand-primary-hover)` (type annotations, numbers)
   - `#6A737D` → `var(--text-muted)` (comments)
   - `#B392F0` → `var(--text-primary)` (function/method names)
   - `#FFAB70` → `var(--brand-primary-hover)` (bash numbers, regex)
4. **`.prose .code-block`** — `position: relative; margin: 1.5rem 0;` (absolute-position host for the badge).
5. **`.prose figure.code-block > pre.shiki`** — `margin: 0;` (kills default `<figure>` vertical gap so Tailwind `.prose` still owns block spacing).
6. **`.prose .code-lang-badge`** — JetBrains Mono 0.7rem weight 500, letter-spacing 0.04em, uppercase, color `var(--text-muted)`, absolute top/left, pointer-events: none, user-select: none, transition color 120ms ease, z-index 1 (D-06).
7. **`.prose .code-block:hover .code-lang-badge`** — color `var(--text-primary)` (hover reveal).
8. **`.prose .shiki .line.highlighted`** — `display: inline-block; width: 100%; background: color-mix(in srgb, var(--brand-primary-soft) 45%, transparent); border-left: 2px solid var(--brand-primary); padding-left: calc(1rem - 2px); margin-left: -1rem;` (D-04).
9. **`.prose .shiki .line.diff.add`** + **`::before { content: "+" }`** + **`.line.diff.remove`** + **`::before { content: "−" }`** — color-mix tints (success/error at 15%), gutter glyphs using U+2212 for remove side (D-05/D-05c).
10. **Reduced-motion @media** — disables the `.code-lang-badge` color transition when user requests reduced motion.

## Verification (commands run + results)

| Command | Expected | Actual |
|---------|----------|--------|
| `grep -c 'code-lang-badge' src/styles/global.css` | ≥ 2 | **3** (declaration + 2 hover-related mentions) |
| `grep -c '.prose .shiki span\[style\*="color:#' src/styles/global.css` | ≥ 8 | **8** (one per token color) |
| `grep -c '!important' src/styles/global.css` | ≥ 8 | **14** (4 pre-existing in file + 10 new: 2 for `pre.shiki` + 8 for token overrides) |
| `grep -c 'var(--brand-primary)' src/styles/global.css` | ≥ 3 | **8** |
| `grep -c 'var(--brand-accent)' src/styles/global.css` | ≥ 1 | **3** |
| `grep -c 'var(--brand-primary-hover)' src/styles/global.css` | ≥ 1 | **4** |
| `grep -c 'var(--success)' src/styles/global.css` | ≥ 1 | **3** |
| `grep -c 'var(--error)' src/styles/global.css` | ≥ 1 | **3** |
| `grep -c 'var(--text-muted)' src/styles/global.css` | ≥ 2 | **3** |
| `grep -c 'var(--bg-code)' src/styles/global.css` | ≥ 1 | **2** |
| `grep -c 'color-mix(in srgb' src/styles/global.css` | ≥ 3 | **3** (highlight + diff add + diff remove) |
| `grep -c 'prefers-reduced-motion: reduce' src/styles/global.css` | ≥ 2 | **2** (existing global + new badge-transition block) |
| `grep -c '#06B6D4\|#22D3EE\|06b6d4\|22d3ee' src/styles/global.css` | = 0 | **0** (CLAUDE.md hard constraint) |
| `grep -c '#7C3AED\|#FF9900\|#232F3E' src/styles/global.css` | = 0 | **0** (no DKT/AWS brand leakage) |
| `rm -rf .astro node_modules/.astro dist && npm run build` | 32 pages | **32 pages built in 1.34s, zero errors** |
| `grep -c 'code-lang-badge' dist/_astro/*.css` (occurrences) | ≥ 1 | **3** via `grep -o` |
| `grep -c 'shiki.*span\[style' dist/_astro/*.css` (occurrences) | ≥ 8 | **8** via `grep -oE` (all 8 compiled verbatim with `i` flag preserved) |
| `grep -c 'line.highlighted\|line\.diff\.add\|line\.diff\.remove' dist/_astro/*.css` (occurrences) | ≥ 3 | **11** via `grep -oE` |
| `grep -r '#06B6D4\|#22D3EE\|06b6d4\|22d3ee' dist/_astro/*.css` | empty | **empty** (exit 1, no match) — CLAUDE.md hard constraint PASSED in dist |
| `grep -r '#06B6D4\|#22D3EE\|06b6d4\|22d3ee' dist/ --include='*.css' --include='*.html'` | empty | **empty** (exit 1) |
| `grep -c 'class="code-block"' dist/en/blog/__fixture-syntax-highlighting/index.html` | ≥ 4 | **4** (bash + yaml + typescript + dockerfile figures) |
| `grep -c 'code-lang-badge' dist/en/blog/__fixture-syntax-highlighting/index.html` | ≥ 4 | **4** |
| `grep -c 'has-highlighted' dist/en/blog/__fixture-syntax-highlighting/index.html` | 3 | **3** |
| `grep -c 'has-diff' dist/en/blog/__fixture-syntax-highlighting/index.html` | 3 | **3** |

The compiled CSS file is `dist/_astro/_slug_.Dh09CC4M.css` (blog slug route bundle). Sample compiled selectors confirm `i` flag preserved:
```
.prose .shiki span[style*="color:#E1E4E8" i]
.prose .shiki span[style*="color:#F97583" i]
.prose .shiki span[style*="color:#9ECBFF" i]
.prose .shiki span[style*="color:#85E89D" i]
…
.prose .shiki .line.highlighted
.prose .shiki .line.diff.add
.prose .shiki .line.diff.remove
```

## Commits

| # | Hash | Type | Files | Description |
|---|------|------|-------|-------------|
| 1 | `64f1e02` | feat | `src/styles/global.css` | Append 128-line Phase 2 Deep Signal Shiki override block: base pre, 8 token attribute selectors, figure/badge, highlight, diff add/remove, reduced-motion |

## Deviations from Plan

**None.** Plan executed exactly as written. The verbatim CSS block from `<action>` was appended to `src/styles/global.css` without modification. All source acceptance criteria exceeded minimums, all dist-level CSS compilation verified, all CLAUDE.md hard constraints (no deprecated cyan, no DKT/AWS brand leak) satisfied in both source and compiled output.

No auto-fix rules triggered (Rules 1–3), no architectural decision needed (Rule 4). Per the plan's explicit note, Playwright regression was **intentionally not re-captured** (the 4/8 fence-bearing-post failures are the expected transient regression baked into the phase architecture; Plan 02-06 handles the final baseline commit).

## Authentication Gates

None. Single local file edit, local build (`npm run build`), local git commit.

## Known Stubs

None introduced by this plan.

## Expected Transient Regression

Per the plan objective, `npx playwright test tests/visual/shiki-regression.spec.ts` will now show **4/8 failures** on fence-bearing posts (mcp-servers × 2 locales, karpenter × 2 locales). This is **designed** — the Deep Signal palette just kicked in: keywords now render teal (`#14B8A6`) instead of github-dark's pink (`#F97583`), strings amber (`#F59E0B`) instead of blue (`#9ECBFF`), the `<pre>` background is `#0D1117` instead of `#24292e`, the badge appears in JetBrains Mono uppercase text-muted top-left, highlight lines have teal border-left + soft teal bg, diff-add/remove have green/red tints + gutter glyphs. Every pixel in the code-block regions shifted past the `maxDiffPixels: 150` threshold.

Snapshots intentionally NOT updated in this plan. Fence-less posts (hello-world + why-i-write-k8s × 2 locales) still pass unchanged — the `.prose` scope on every new rule prevents leakage into non-fence content.

Plan 02-06 is the final baseline re-capture + commit task.

## Next Plan Entry Point

**Plan 02-05 — CodeCopyEnhancer singleton upgrade** (CODE-06).

Plan 02-05 will:
1. Rewrite `CodeCopyEnhancer.astro` to scan `.code-block > pre` (replacing the current `.prose pre` scan + inline `div.code-wrap` runtime insertion). The `.prose .code-block` figure rule from THIS plan makes the figure the positioning parent for the copy button — matches D-06/D-07 layout intent.
2. Restyle the copy button icon-only at rest (SVG clipboard, `var(--text-muted)`), revealing a "Copy" label + `var(--text-primary)` color on `.code-block:hover` — same rhythm as the badge animation.
3. Hoist the success toast into `BaseLayout.astro` as a singleton (replaces the per-component inline toast). Toast uses Deep Signal success (`var(--success)` at ~15%) background and fades after 2s via `@keyframes fadeOutToast`.
4. Respect `prefers-reduced-motion` for toast + icon transitions.
5. Verify via Playwright that copy button appears on hover, button click writes to clipboard, and toast appears once regardless of which button was clicked.

Plan 02-05 is DOM + JS + a small amount of CSS (~40 lines) — minimal visual impact beyond the hover-state introduction. Plan 02-06 then does the holistic phase verification + final shiki-regression baseline re-capture + Astro caret restore (the `caret-color` CSS rule Astro disabled on `.prose pre` — we may want to re-enable for code-selection UX).

## Self-Check: PASSED

- `src/styles/global.css` modified with 128-line Phase 2 block — FOUND (line count from `git diff --cached --stat` matches)
- Task 1 commit `64f1e02` — FOUND in `git log --oneline -3`
- All 8 Shiki token attribute selectors present in both source and compiled CSS — VERIFIED (grep counts match)
- All 14 `!important` placements — VERIFIED (10 new + 4 pre-existing across animation + reduced-motion blocks)
- No deprecated cyan in source OR compiled dist — VERIFIED (both greps return exit 1 with empty output)
- No DKT/AWS employer brand colors in source — VERIFIED (grep returns 0)
- Fixture page contains 4 `<figure class="code-block">` wrappers + 4 `.code-lang-badge` spans + 3 `has-highlighted` classes + 3 `has-diff` classes — VERIFIED
- `npm run build` passes 32 pages — VERIFIED (1.34s)
- Reduced-motion rule appended — VERIFIED (count = 2)
- Plan 02-05 is unblocked — the `.prose .code-block { position: relative }` host rule exists (required for CodeCopyEnhancer absolute positioning)
