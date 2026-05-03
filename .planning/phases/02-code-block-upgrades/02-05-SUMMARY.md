---
phase: 02
plan: 05
subsystem: copy-button-toast
tags: [copy-button, toast, accessibility, aria-live, i18n, astro-icon, lucide]
dependency_graph:
  requires:
    - "02-04 — Deep Signal CSS for `.prose .code-block` figure + `.code-lang-badge`; the figure already has `position: relative` + `margin: 1.5rem 0`, which becomes the positioning host for the absolute-placed copy button"
    - "02-03 — `rehype-code-badge.mjs` emits `<figure class=\"code-block\"><span.code-lang-badge>…</span><pre class=\"astro-code ...\">…</pre></figure>`; the script selector `.prose .code-block > pre` targets this exact structure"
    - "02-01 — `astro-icon` + `@iconify-json/lucide` installed in Phase 1; `lucide:copy` SVG available via `<Icon name=\"lucide:copy\">`"
    - "02-01 — design-tokens (`--success`, `--text-primary`, `--bg-elevated`, `--border`, `--text-muted`, `--font-body`, `--font-mono`, `--shadow-md`, `--ease-out`)"
  provides:
    - "Singleton `<div id=\"code-copy-toast\" role=\"status\" aria-live=\"polite\" aria-atomic=\"true\">` in `src/layouts/BaseLayout.astro`, SSR-rendered on 31/32 built pages (root redirect shell correctly skipped)"
    - "`.code-copy-toast` + `.code-copy-toast.is-visible` rules + `prefers-reduced-motion` fallback appended to `src/styles/global.css` (36 lines)"
    - "Rewritten `src/components/CodeCopyEnhancer.astro` (121 LOC → 158 LOC): SSR `<template id=\"code-copy-btn-template\">` with `<Icon name=\"lucide:copy\">`, `.prose .code-block > pre` selector, toast dispatch with `clearTimeout` double-copy pattern, bilingual `toastCopied` labels (`'Copied to clipboard'` / `'Скопировано в буфер'`)"
    - "New CSS contract in CodeCopyEnhancer `<style is:global>`: `.code-copy-btn-label { display: none }` → `display: inline` on `.code-block:hover` or `:focus-visible`; button always visible (no more `opacity: 0` at rest)"
  affects:
    - "Plan 02-06 (final baseline re-capture + Astro caret restore) — copy button pixel delta is new (icon-only bubble top-right at rest, icon+label on hover) — shiki-regression baselines for fence-bearing pages will drift past `maxDiffPixels: 150` when the cursor is hovering; Plan 02-06 is the committed re-capture"
tech-stack:
  added: []
  patterns:
    - "SSR template + runtime clone: `<template>` ships the button shell with `<Icon>` inside (astro-icon is SSR-only, so the Lucide SVG is rendered once at build into a `<use href=\"#ai:lucide:copy\">` symbol reference). The `is:inline` script does `template.content.cloneNode(true)` per `<pre>`, so the Lucide glyph stays canonical (no hardcoded SVG drift)."
    - "Singleton aria-live region in BaseLayout: the toast MUST be in the initial SSR DOM for reliable AT detection. Content-change announcements from a dynamically-created `aria-live` region are unreliable across screen readers (WAI-ARIA Authoring Practices). The toast is hidden via `opacity: 0 + pointer-events: none` — NOT `display: none`, NOT `visibility: hidden`, NOT `aria-hidden` — because those three remove the element from the AT tree and silence aria-live."
    - "clearTimeout last-write-wins: the toast has a `__hideTimer` expando. On every click, we `clearTimeout` the previous timer before starting a fresh 2000ms window. This means clicking two copy buttons in quick succession keeps the toast visible for a full 2s from the LAST click — matches D-07c singleton + no-queue."
    - "Idempotent runtime: the script skips `<pre>` whose figure already contains `.code-copy-btn`, so Astro HMR hot-reload or any accidental double-run doesn't duplicate buttons."
    - "Capability-safe clipboard: Clipboard API wrapped in `try`; fallback off-screen `<textarea>` + `execCommand('copy')` path preserved verbatim from the pre-rewrite file — matches CODE-05 acceptance criterion (zero regressions on the clipboard contract)."
key-files:
  created: []
  modified:
    - src/components/CodeCopyEnhancer.astro
    - src/layouts/BaseLayout.astro
    - src/styles/global.css
decisions:
  - "D-07 executed: `Icon name=\"lucide:copy\"` from astro-icon (chosen over carbon:copy — lucide is the existing site icon family and ships a cleaner copy glyph; both were in scope per the plan/RESEARCH.md §Q5). Button is always visible — icon-only at rest (`.code-copy-btn-label { display: none }`), expands to icon+label on `.code-block:hover` or `:focus-visible`."
  - "D-07b executed: `<div id=\"code-copy-toast\" role=\"status\" aria-live=\"polite\" aria-atomic=\"true\">` injected after `<Footer />` and before the existing scroll-animation `<script>` in BaseLayout. One per page, hidden via `opacity: 0` so aria-live stays discoverable by AT."
  - "D-07c executed: singleton toast, no queue, success-only. clearTimeout pattern resets the 2s visibility window on every successful copy. No manual dismiss button."
  - "D-07e executed: removed the `is-copied` intra-button feedback path entirely. Toast is the canonical success signal (RESEARCH.md Pitfall 7). Clipboard API + textarea fallback preserved verbatim — all current a11y retained."
  - "D-02 executed: button visible at rest (no `opacity: 0` default). Badge on the left (from Plan 02-04 — top-left, pointer-events: none) and Copy on the right form the implicit `[ BADGE ]  [⧉ Copy]` toolbar."
  - "D-02b executed: removed `@media (hover: none)`. Touch devices now get identical behavior — always visible — without the hover-fallback hack. No more `opacity: 0` → `opacity: 1` dance."
  - "Selector contract swap: `.prose pre` → `.prose .code-block > pre`. Script now targets the figure-wrapped `<pre>` introduced by `rehype-code-badge.mjs` in Plan 02-03. No more runtime `div.code-wrap` creation — the SSR figure IS the positioning host."
  - "SSR template + runtime clone picked over hardcoded inline SVG (RESEARCH.md §Q5 Option B). Keeps astro-icon as the single source of truth for the Lucide `copy` glyph; no risk of the hardcoded SVG drifting from upstream if the `@iconify-json/lucide` package updates."
metrics:
  duration: "~4 minutes (11:14–11:18 UTC)"
  completed: "2026-05-03"
  tasks: 2
  commits: 2
  files_changed: 3
  lines_added: 142
  lines_deleted: 56
  build_pages: 32
  build_duration: "~2.5s per run"
  unit_test_count: "27/27 passing (unchanged from Plan 02-03)"
---

# Phase 02 Plan 05: CodeCopyEnhancer Singleton Upgrade Summary

Delivers **CODE-05** (preserve copy behavior) AND the user-requested **D-07/D-07b upgrade** (always-visible icon-only-at-rest + singleton aria-live toast). Three files changed: singleton toast DOM injected into `BaseLayout.astro`, toast CSS appended to `global.css`, and `CodeCopyEnhancer.astro` rewritten to target the Plan 02-03 figure, drop the `div.code-wrap` runtime wrapper, drop the `is-copied` intra-button success path, and dispatch to the new toast. Bilingual labels (`Copy / Copied to clipboard` — `Копировать / Скопировано в буфер`) verified in both `/en/` and `/ru/` blog dist HTML. Clipboard API + off-screen textarea `execCommand` fallback preserved verbatim. 27/27 unit tests still green.

## What Shipped

1. **`src/layouts/BaseLayout.astro`** — 13-line insertion. Singleton toast div placed AFTER `<Footer locale={locale} />` (line 72) and BEFORE the scroll-animation `<script>` (line 74 pre-change → now line 87). Attributes: `id="code-copy-toast"` + `class="code-copy-toast"` + `role="status"` + `aria-live="polite"` + `aria-atomic="true"`. Body is empty at SSR; the `is:inline` script in `CodeCopyEnhancer.astro` populates `textContent` on successful copy. One instance per page; sibling HTML (Header, main, SearchPalette, OG meta, fonts, noscript) untouched.

2. **`src/styles/global.css`** — 36-line append after the existing Plan 02-04 reduced-motion block. Three rules:
   - `.code-copy-toast` base — `position: fixed; top: 1rem; right: 1rem; padding: 0.75rem 1rem; font-family: var(--font-body); font-size: 0.9rem; font-weight: 500; color: var(--text-primary); background: var(--success); border-radius: 6px; box-shadow: var(--shadow-md); opacity: 0; transform: translateY(-8px); pointer-events: none; z-index: 1000; transition: opacity 160ms var(--ease-out), transform 160ms var(--ease-out);`
   - `.code-copy-toast.is-visible` — flips `opacity: 1` + `transform: translateY(0)`.
   - `@media (prefers-reduced-motion: reduce) .code-copy-toast { transition: none; }` — hides/shows instantly.
   - **No `display: none` / `visibility: hidden` anywhere in the toast path** — preserves aria-live announcement (RESEARCH.md §Q6 visibility table).

3. **`src/components/CodeCopyEnhancer.astro`** — complete rewrite, 121 LOC → 158 LOC (+93 / -56 net):
   - **Frontmatter gained** `import { Icon } from 'astro-icon/components';`.
   - **Labels map** reduced to `{ copy, toastCopied }` per locale (old `copied` key dropped — it paired with the removed `is-copied` intra-button path).
   - **SSR `<template id="code-copy-btn-template">`** contains `<button type="button" class="code-copy-btn" aria-label={l.copy}>` + `<Icon name="lucide:copy" width="14" height="14" aria-hidden="true">` + `<span class="code-copy-btn-label">{l.copy}</span>`. This is the canonical source of the button shell AND the Lucide SVG — the script clones `template.content` at runtime.
   - **`<script is:inline>` passes** `data-copy-label` + `data-toast-copied-label` via script element dataset.
   - **Selector swap:** `document.querySelectorAll('.prose pre')` → `document.querySelectorAll('.prose .code-block > pre')`. Only figure-wrapped Shiki blocks are enhanced.
   - **No more `div.code-wrap`** — the figure from rehype is already `position: relative` (Plan 02-04), so the button appends directly to the figure.
   - **Idempotency guard:** `if (figure.querySelector('.code-copy-btn')) return;`.
   - **Toast dispatch** (new):
     ```js
     const toast = document.getElementById('code-copy-toast');
     if (toast) {
       toast.textContent = TOAST_COPIED;
       toast.classList.add('is-visible');
       if (toast.__hideTimer) clearTimeout(toast.__hideTimer);
       toast.__hideTimer = setTimeout(() => {
         toast.classList.remove('is-visible');
       }, 2000);
     }
     ```
   - **Removed:** `is-copied` class + 1600ms setTimeout revert, `opacity: 0` default on `.code-copy-btn`, `@media (hover: none)` hack (D-02b).
   - **Preserved:** Clipboard API `try { await navigator.clipboard.writeText(text) }` with off-screen textarea `execCommand('copy')` fallback; aria-label; bilingual data-attribute pattern.
   - **New CSS rules (scoped `<style is:global>`)**: `.prose .code-copy-btn` baseline (always visible, icon only, transparent border/bg), `.prose .code-copy-btn-label { display: none }`, hover/focus-visible selectors that set `color: var(--text-primary); border-color: var(--border); background: var(--bg-elevated);` AND reveal the label (`display: inline`), svg sizing, reduced-motion override.

## Verification (commands run + results)

| Command | Expected | Actual |
|---------|----------|--------|
| `grep -c 'id="code-copy-toast"' src/layouts/BaseLayout.astro` | `1` | **1** |
| `grep -c 'role="status"' src/layouts/BaseLayout.astro` | `1` | **1** |
| `grep -c 'aria-live="polite"' src/layouts/BaseLayout.astro` | `1` | **1** |
| `grep -c 'aria-atomic="true"' src/layouts/BaseLayout.astro` | `1` | **1** |
| Footer-line < Toast-line < Script-line ordering | true | Footer@72 < Toast@80 < Script@87 |
| `grep -c '.code-copy-toast' src/styles/global.css` | ≥ 2 | **3** (base + `.is-visible` + reduced-motion) |
| `grep -c 'var(--success)' src/styles/global.css` | ≥ 1 | **4** (pre-existing diff tints + toast bg) |
| `grep -c 'var(--text-primary) in toast rule'` | ≥ 1 | **1** |
| `grep -q 'display: none' inside .code-copy-toast block` | false | **OK (absent)** |
| `grep -q 'visibility: hidden' inside .code-copy-toast block` | false | **OK (absent)** |
| `grep -q "import { Icon } from 'astro-icon/components'" CodeCopyEnhancer.astro` | match | **match** |
| `grep -q 'toastCopied' CodeCopyEnhancer.astro` | match | **match** |
| `grep -q 'Copied to clipboard' CodeCopyEnhancer.astro` | match | **match** |
| `grep -q 'Скопировано в буфер' CodeCopyEnhancer.astro` | match | **match** |
| `grep -q 'code-copy-btn-template' CodeCopyEnhancer.astro` | match | **match** |
| `grep -q 'name="lucide:copy"' CodeCopyEnhancer.astro` | match | **match** |
| `grep -q '.prose .code-block > pre' CodeCopyEnhancer.astro` | match | **match** |
| `grep -q "getElementById('code-copy-toast')" CodeCopyEnhancer.astro` | match | **match** |
| `grep -q "classList.add('is-visible')" CodeCopyEnhancer.astro` | match | **match** |
| `grep -q 'clearTimeout(toast.__hideTimer)' CodeCopyEnhancer.astro` | match | **match** |
| `! grep -q 'is-copied' CodeCopyEnhancer.astro` | absent | **absent** |
| `! grep -q 'code-wrap' CodeCopyEnhancer.astro` | absent | **absent** |
| `! grep -q 'opacity: 0' CodeCopyEnhancer.astro` | absent | **absent** |
| `! grep -q '@media (hover: none)' CodeCopyEnhancer.astro` | absent | **absent** |
| `rm -rf .astro node_modules/.astro dist && npm run build` | 32 pages | **32 pages built in 2.57s (Task 1), 2.45s (Task 2)**, zero errors |
| `grep -c 'id="code-copy-toast"' dist/en/index.html` | 1 | **1** |
| `grep -c 'id="code-copy-toast"' dist/ru/index.html` | 1 | **1** |
| `grep -c 'id="code-copy-toast"' dist/en/blog/2026-03-20-karpenter-right-sizing/index.html` | 1 | **1** |
| `grep -c 'id="code-copy-toast"' dist/ru/blog/2026-03-20-karpenter-right-sizing/index.html` | 1 | **1** |
| `grep -c 'aria-live="polite"' dist/en/index.html` | ≥ 1 | **2** (toast + pre-existing aria-live on the SearchPalette listbox) |
| Total HTML files with toast DOM | 31 | **31/32** (only `dist/index.html` locale-redirect shell has no BaseLayout → correctly skipped) |
| `grep -l 'code-copy-toast' dist/_astro/*.css` | ≥ 1 | **1** (compiled bundle) |
| `grep -c 'id="code-copy-btn-template"' dist/en/blog/2026-03-20-karpenter-right-sizing/index.html` | 1 | **1** |
| `grep -c 'id="code-copy-btn-template"' dist/ru/blog/2026-03-20-karpenter-right-sizing/index.html` | 1 | **1** |
| `grep -c 'id="code-copy-btn-template"' dist/en/blog/__fixture-syntax-highlighting/index.html` | 1 | **1** |
| `grep -c 'id="code-copy-btn-template"' dist/en/blog/2026-03-02-mcp-servers-plainly-explained/index.html` | 1 | **1** |
| `grep -c 'id="code-copy-btn-template"' dist/ru/blog/2026-03-02-mcp-servers-plainly-explained/index.html` | 1 | **1** |
| Lucide `copy` SVG rendered inside EN-karpenter template | match (rect `x="8" y="8"`) | **match** — `<symbol id="ai:lucide:copy" viewBox="0 0 24 24">…<rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/>…</symbol><use href="#ai:lucide:copy">…` |
| `grep -c 'data-toast-copied-label="Copied to clipboard"' dist/en/blog/2026-03-20-karpenter-right-sizing/index.html` | 1 | **1** |
| `grep -c 'data-toast-copied-label="Скопировано в буфер"' dist/ru/blog/2026-03-20-karpenter-right-sizing/index.html` | 1 | **1** |
| `grep -c 'data-copy-label="Copy"' dist/en/blog/2026-03-20-karpenter-right-sizing/index.html` | ≥ 1 | **1** |
| `grep -c 'data-copy-label="Копировать"' dist/ru/blog/2026-03-20-karpenter-right-sizing/index.html` | ≥ 1 | **1** |
| `grep -c 'id="code-copy-btn-template"' dist/en/index.html` (homepage) | 0 | **0** (CodeCopyEnhancer not mounted on homepage — correct scope) |
| `grep -c 'id="code-copy-btn-template"' dist/en/speaking/index.html` | 0 | **0** (correct scope) |
| `npm run test:unit` | 27/27 | **27/27 pass in 127ms** |

## Commits

| # | Hash | Type | Files | Description |
|---|------|------|-------|-------------|
| 1 | `4369318` | feat | `src/layouts/BaseLayout.astro`, `src/styles/global.css` | Inject singleton `<div id="code-copy-toast">` + append toast CSS block |
| 2 | `15a6dc0` | feat | `src/components/CodeCopyEnhancer.astro` | Rewrite with icon+label UX, `.code-block > pre` selector, SSR button template, toast dispatch, `is-copied` path removed |

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 — Blocking Issue] Plan's verbatim header comment contained the literal `is-copied`, failing the automated `! grep -q 'is-copied'` gate**

- **Found during:** Task 2 — after pasting the plan's verbatim file content and running the plan's own `<verify><automated>` chain, the `! grep -q 'is-copied'` check failed because the plan's header comment read "No `is-copied` intra-button feedback (toast is canonical — RESEARCH.md Pitfall 7)." The comment documents the removal, but grep is literal and counts it as a hit. This is a self-inconsistency inside the plan — the verifier flagged a documentation reference to the removed concept.
- **Fix:** Rephrased the comment to "No intra-button success class (toast is canonical — RESEARCH.md Pitfall 7)." — same intent, no string hit for the legacy class name.
- **Files modified:** `src/components/CodeCopyEnhancer.astro` (1 line, part of same commit before it landed).
- **Commit:** rolled into `15a6dc0` (fixed pre-commit, no separate commit needed).

No other auto-fixes triggered. No architectural changes (Rule 4) needed. No authentication gates — everything local (file edits, `npm run build`, `npm run test:unit`, `git commit`).

## Authentication Gates

None. Local file edits, local clean build, local unit tests, local git commit.

## Known Stubs

None. The copy button is fully functional (icon-only at rest, icon+label on hover, clipboard write + textarea fallback, toast dispatch with 2s auto-hide). No TODO markers, no `return null` placeholders, no "coming soon" text. All bilingual labels populate at build time from the `labels` map.

## Threat Flags

None. The script targets only `.prose .code-block > pre` inside blog posts that we author ourselves; no external content flows through the copy button. Clipboard write uses `navigator.clipboard.writeText(text)` where `text` is derived from `pre.querySelector('code').innerText` — DOM-extracted, not interpolated HTML — so no XSS surface is introduced. The toast `textContent` is set from the component's compile-time bilingual label map, not from any user input.

## Manual Smoke Test Status

The plan's `<verification>` step 5 calls for a manual `npm run preview` test. Per the `<parallel_execution>` block in my spawn prompt, I'm a parallel executor in a worktree — the manual preview/click flow cannot be automated here without a browser driver. **Automated substitute:** every dist-level grep below confirms the DOM and CSS contract is in place:

- Template rendered in every blog page in both locales
- Lucide `copy` SVG canonical inside the template (rect `x="8" y="8"` + the correct `path`)
- `data-toast-copied-label` attributes carry the correct localized strings
- Singleton toast DOM present on every non-redirect page with the correct aria-live attributes
- Unit tests 27/27 green — no regression on the rehype plugin contract introduced in Plan 02-03
- `opacity: 0` (not `display: none`) on the toast hidden state — aria-live announce-ability preserved

**Deferred to Plan 02-06** (which runs the full manual preview + Playwright re-capture anyway): the cross-browser smoke test of copy → paste → toast announce on both locales. If Plan 02-06 uncovers any runtime regression, it can file a Rule 1 fix there.

## Next Plan Entry Point

**Plan 02-06 — Final phase verification + shiki-regression baseline re-capture + Astro caret restore.**

Plan 02-06 will:
1. Run `npm run preview` manually and visually confirm:
   - Copy button visible at rest (icon only, muted tone) top-right of every code block on both locales.
   - Hover on `.code-block` → button expands to `[⧉ Copy]` (EN) / `[⧉ Копировать]` (RU) with border + elevated background.
   - Click Copy → toast slides in top-right, shows `Copied to clipboard` (EN) / `Скопировано в буфер` (RU), fades after ~2s.
   - Paste into an editor — content matches the code block (Clipboard API path).
   - Tab to Copy via keyboard → `:focus-visible` outline + label reveal.
   - `prefers-reduced-motion` → toast appears/disappears instantly (no transition).
2. Re-run `npx playwright test tests/visual/shiki-regression.spec.ts --update-snapshots` and commit the new baseline PNGs — these lock in the Deep Signal palette + figure/badge + copy button icon.
3. Optionally restore Astro's `caret-color` default on `.prose pre` (Astro disabled it at some point — we may want it back for code-selection UX).
4. Holistic grep sweep confirming zero `#06B6D4` / `#22D3EE` / `#7C3AED` / `#FF9900` in `dist/` (CLAUDE.md hard constraint).
5. Final phase-close commit stamping metadata + moving the roadmap cursor.

Plan 02-06 is manual + test-infra only — no new code logic.

## Self-Check: PASSED

- `src/layouts/BaseLayout.astro` modified (13 lines inserted) — FOUND (`git diff --numstat 9ba19c4..HEAD` shows `13  0  src/layouts/BaseLayout.astro`)
- `src/styles/global.css` modified (36 lines appended) — FOUND (`git diff --numstat` shows `36  0  src/styles/global.css`)
- `src/components/CodeCopyEnhancer.astro` modified (93 inserted / 56 deleted) — FOUND (`git diff --numstat` shows `93  56  src/components/CodeCopyEnhancer.astro`)
- Task 1 commit `4369318` — FOUND in `git log --oneline 9ba19c4..HEAD`
- Task 2 commit `15a6dc0` — FOUND in `git log --oneline 9ba19c4..HEAD`
- Singleton toast in dist: 31/32 HTML files — VERIFIED (`dist/index.html` redirect shell correctly has no BaseLayout)
- Lucide `copy` SVG rendered inside every blog page's SSR template — VERIFIED (rect `x="8" y="8"` + matching path signature match)
- Bilingual `data-toast-copied-label` matches labels map in dist EN + RU — VERIFIED
- Compiled CSS `dist/_astro/*.css` contains `code-copy-toast` — VERIFIED
- `npm run build` passes 32 pages — VERIFIED (2.45s last run)
- `npm run test:unit` — 27/27 green — VERIFIED (no plugin changes since Plan 02-03)
- Plan 02-06 is unblocked — the copy button DOM + toast DOM are now stable and ready for the final phase-wide baseline re-capture
