---
phase: 02-code-block-upgrades
reviewed: 2026-05-03T14:00:00Z
depth: standard
files_reviewed: 9
files_reviewed_list:
  - astro.config.mjs
  - rehype-code-badge.mjs
  - remark-stash-code-lang.mjs
  - src/components/CodeCopyEnhancer.astro
  - src/content/blog/en/__fixture-syntax-highlighting.md
  - src/layouts/BaseLayout.astro
  - src/styles/global.css
  - tests/unit/rehype-code-badge.test.ts
  - tests/visual/shiki-regression.spec.ts
findings:
  critical: 0
  warning: 6
  info: 7
  total: 13
status: issues_found
---

# Phase 2: Code Review Report — Code Block Upgrades

**Reviewed:** 2026-05-03T14:00:00Z
**Depth:** standard
**Files Reviewed:** 9
**Status:** issues_found

## Summary

Phase 2 (Shiki + code-block upgrades) is largely solid. The rehype/remark plugin contract is clean, idempotent, covered by unit tests; the Deep Signal anti-patterns (deprecated cyan, DKT, AWS brand hexes, pure #000/#FFF) are all respected in the hot paths. No Critical defects: no injection surface, no crash path, no secret leakage.

Six Warnings cluster around three themes:
1. **Accessibility regression** — the toast uses `background: var(--success)` (#10B981) with `color: var(--text-primary)` (#E2E8F0). Contrast is ~1.8:1 and fails WCAG AA (4.5:1) badly. This is a hard-violation of the brand's own accessibility posture — the token pair intended here is `background: var(--success)` + `color: var(--text-on-primary)` (#0F172A, ~7.1:1).
2. **Robustness of the copy flow** — no guarded check for `document.currentScript` being `null` under CSP/module import shenanigans; the timer is attached as a `__hideTimer` expando directly onto an `HTMLDivElement`, which works but is untyped and fragile; `innerText` (layout-dependent) is used instead of `textContent` for clipboard text, which can drop trailing newlines and break pasteability of e.g. `bash` scripts.
3. **CSS specificity and cascade** — eight `!important` declarations against Shiki's inline `style="color:#..."` are a reasonable hack but brittle against Shiki theme updates; `prose-pre:bg-surface` in `[...slug].astro` is silently overridden by `!important` in global.css (intent-vs-effect drift); `.shiki` class selectors will not match the Astro-emitted `.astro-code` class (a real regression surface).

Info items document minor improvements: hardcoded `#14B8A6` in `BaseLayout` theme-color meta is a canonical brand value but not a token; the fixture post claims it's excluded from the sitemap but the filter regex matches any URL containing `/blog/__`, which is fine but coincidentally also matches e.g. `/blog/__foo` on any site, which is unlikely to be an issue but worth noting; the unit tests do not cover the "class string" (not array) branch of `getClassList`, which is the more common Astro v5 flavor.

None of the findings block shipping; 3 Warnings (CSS toast contrast, `innerText` newline loss, selector scope mismatch) should be fixed before this lands on main.

---

## Warnings

### WR-01: Toast fails WCAG AA — `color: var(--text-primary)` on `background: var(--success)` is ~1.8:1 contrast

**File:** `src/styles/global.css:290-292` (cf. `src/styles/design-tokens.css:93,108,96`)

**Issue:** The code-copy toast sets `background: var(--success)` = `#10B981` (emerald-500) with `color: var(--text-primary)` = `#E2E8F0` (slate-200). Measured contrast: ~1.83:1. WCAG AA for normal text requires 4.5:1. Users get a pale-on-green confirmation that many will fail to read — and this is an `aria-live` toast shown for only ~2 seconds, so readability matters. There's already a token designed for exactly this pairing (`--text-on-primary: #0F172A`, contrast ~7.1:1 against emerald-500). Note this also violates the project's own CLAUDE.md guidance on avoiding pure `#000/#FFF` while using the token that was carefully chosen for on-accent/on-success text.

Note: `--text-on-primary` is declared in `design-tokens.css` but not mapped as a Tailwind color in `global.css:@theme`, so it cannot be referenced as `text-text-on-primary` utility; the raw CSS in `.code-copy-toast` block needs to use `var(--text-on-primary)` directly.

**Fix:**
```css
.code-copy-toast {
  /* ... */
  color: var(--text-on-primary);  /* was: var(--text-primary) — 1.8:1 on --success */
  background: var(--success);
  /* ... */
}
```

---

### WR-02: `pre.innerText` / `code.innerText` is layout-dependent and drops trailing newlines — pasted scripts may not execute as-is

**File:** `src/components/CodeCopyEnhancer.astro:67-68`

**Issue:** `innerText` reads *rendered* text, which depends on CSS `display`, line wrapping, and the selection/visibility state of the element at the moment of access. Shiki emits each line inside `<span class="line">...</span>`; `innerText` will insert `\n` between line spans (good) but will also:
- drop the final trailing newline that the source had (some shell scripts rely on it),
- collapse whitespace according to CSS `white-space` rules (Shiki uses `wrap: true`, but pre's default `white-space: pre` preserves spacing; still, not defined by spec),
- trigger a layout flush (reflow), which causes a visible jank on long blocks in slow browsers.

`textContent` reads the raw DOM text without layout considerations, preserves all whitespace, and does not force reflow. For copy-to-clipboard on `<pre><code>` content, `textContent` is the conventional and correct choice (this is what GitHub, MDN, and Shiki's own docs use).

Secondary issue: `code.innerText` vs `pre.innerText` — when `code` exists, you get just the code text (good). When `code` is missing, `pre.innerText` includes the language badge span text and the copy button's label text — because the figure is the positioning context and the button is absolutely positioned inside the figure, NOT inside the `pre`. Re-verify. Looking again: the figure wraps `[badge, pre]`, the button is appended to the figure (`figure.appendChild(btn)`), so `pre.innerText` is pre-content only. Good — no button-text leak. But the fallback is still only hit if the `code` child is missing, which should never happen for Shiki output, so dead code in practice.

**Fix:**
```js
const code = pre.querySelector('code');
const text = (code ?? pre).textContent ?? '';
```

---

### WR-03: Token-color `!important` overrides are locked to Shiki's github-dark hex palette — Shiki upgrades will silently break the theme

**File:** `src/styles/global.css:165-188`

**Issue:** The token overrides use attribute-selector matches against literal hex values Shiki emits inline on each `<span>`:

```css
.prose .shiki span[style*="color:#E1E4E8" i] { color: var(--text-primary) !important; }
.prose .shiki span[style*="color:#F97583" i] { color: var(--brand-primary) !important; }
/* ... 6 more */
```

This is load-bearing: if Shiki or the `github-dark` theme file updates a color by even a single digit (e.g. #F97583 → #FF7583), the entire color mapping for that token class falls off and users see raw github-dark colors (not Deep Signal). This is the kind of "silent regression on minor dependency update" that won't be caught by the CI unit tests (which only assert plugin behavior, not CSS color values) and only partially caught by visual regression (if the maxDiffPixels tolerance masks per-token shifts on small blocks).

Two options:
1. **Short-term (accept)**: leave as-is, add a CI guard that asserts Shiki's github-dark palette hasn't drifted. Cheap.
2. **Long-term (correct)**: migrate to a custom Shiki theme JSON that emits Deep Signal hexes directly (or CSS variables via Shiki's CSS-vars transformer). Removes the `!important` cascade entirely. This is a larger change, worth a follow-up plan.

Additionally, `span[style*="color:#85E89D"]` maps Shiki's "added/diff-add-ish" green to `--brand-primary` (teal), which is semantically odd — a diff-add line is rendered with teal syntax tokens. If this was intentional (keeping the brand palette cohesive), document it. If not, this token should map to `--success` or a neutral.

**Fix (short-term guard):**
Add an assertion in the visual regression suite that at least one known-color span renders as Deep Signal teal (#14B8A6 or its color-mix output) on a sample post. This catches Shiki palette drift.

---

### WR-04: CSS selector scope drift — `.prose .shiki` does not match Astro's `.astro-code` class, so half the tokens are un-themed when Astro emits its marker

**File:** `src/styles/global.css:155-267`

**Issue:** Every Phase 2 CSS rule is scoped on `.prose .shiki` (literal), but `rehype-code-badge.mjs` explicitly documents that Astro's internal Shiki renderer emits `class="astro-code"` (not `shiki`) and the plugin deliberately accepts BOTH (see `SHIKI_MARKER_CLASSES` set at line 34). The unit test `rehype-code-badge wraps <pre class="astro-code">` confirms this.

So the pipeline flow is:
1. Markdown fence → Astro Shiki → `<pre class="astro-code github-dark" data-language="yaml">`
2. rehypeCodeBadge → wraps in `<figure class="code-block">` — fine.
3. CSS tries to style `.prose .shiki ...` — **no match**, because the class is `astro-code`.

This means in production Astro output:
- `pre.shiki` base override (background, color, border) — does not apply.
- All 8 syntax token overrides — do not apply.
- `.line.highlighted` / `.line.diff.add` / `.line.diff.remove` selectors — do not apply.
- `.code-lang-badge` does apply (scoped on `.code-block`, which is our class), so badge remains styled.

Effective result: in Astro 5.18 (current), users see vanilla github-dark Shiki with a Deep Signal badge and copy button on top. Deep Signal color token overrides, diff gutter glyphs, and highlighted-line treatment all silently no-op.

Visual regression will catch this (it's the whole point of Plan 02-01 baselines), but the CI signal depends on whether baselines were captured on a tree that already had `.astro-code` classes. If baselines include `.astro-code` output but CSS only styles `.shiki`, the baseline captured the un-themed render and there's nothing to diff against on the subsequent build.

**Fix:** Change every `.prose .shiki` selector to `.prose :is(.shiki, .astro-code)` (matches either), same with `.prose .shiki .line.*`. Alternative: have rehypeCodeBadge normalize by adding `shiki` to `.astro-code` elements so a single selector suffices.

```css
/* Before */
.prose pre.shiki { /* ... */ }
.prose .shiki span[style*="color:#E1E4E8" i] { /* ... */ }
.prose .shiki .line.highlighted { /* ... */ }

/* After */
.prose pre:is(.shiki, .astro-code) { /* ... */ }
.prose :is(.shiki, .astro-code) span[style*="color:#E1E4E8" i] { /* ... */ }
.prose :is(.shiki, .astro-code) .line.highlighted { /* ... */ }
```

Or, more robustly, in `rehype-code-badge.mjs` after checking the marker class, add both classes so downstream CSS can use a single `.shiki` selector.

---

### WR-05: Cascade intent-vs-effect drift — `prose-pre:bg-surface` utility on blog pages is silently overridden by `!important` in global.css

**File:** `src/styles/global.css:156` (interaction with `src/pages/en/blog/[...slug].astro:62` and `src/pages/ru/blog/[...slug].astro:72`)

**Issue:** Blog pages set `prose-pre:bg-surface` (compiles to `background-color: var(--color-surface)` = `--bg-surface` = `#1E293B`) on the prose wrapper. Global.css then force-sets `background-color: var(--bg-code) !important` (#0D1117) on `.prose pre.shiki`. The `!important` wins, so the effective background is #0D1117, but:
- Any reader of the Astro component template sees `bg-surface` and assumes that's the color.
- If the global rule is ever relaxed (drop `!important`), the blog pages silently change to `#1E293B`.
- The two declarations disagree about what the code block background should be, and neither has a comment explaining which wins.

Note: `prose-pre:bg-surface` is a Tailwind typography variant that targets `.prose pre` (not `.prose pre.shiki`). The figure wrap changes the DOM so it's `.prose figure.code-block > pre.shiki`. Tailwind typography's `pre` selector descends arbitrarily, so the utility still matches — but this is yet another place where the figure wrapper could desync if typography's selectors get stricter.

**Fix:** Delete the `prose-pre:bg-surface` class from both `[...slug].astro` files (it's shadowed and misleading). Optionally, drop `!important` from `global.css:156` since nothing is competing now.

```astro
<div class="prose prose-invert max-w-none
  prose-headings:font-display prose-headings:font-semibold
  prose-a:text-accent prose-a:no-underline hover:prose-a:underline hover:prose-a:text-accent-light
  prose-code:font-mono prose-code:text-accent-light
  prose-pre:border prose-pre:border-border
  prose-hr:border-border
">
```

Companion change: `src/styles/global.css:156` can become:
```css
.prose pre:is(.shiki, .astro-code) {
  background-color: var(--bg-code);  /* no !important needed once prose-pre:bg-surface is removed */
  color: var(--text-primary);
  border: 1px solid var(--border);
}
```

---

### WR-06: `__hideTimer` expando on DOM element is untyped and fragile — plus `is:inline` + `document.currentScript` pattern has a subtle race with Astro View Transitions

**File:** `src/components/CodeCopyEnhancer.astro:39-99`

**Issue:** Two composable concerns:

(a) `toast.__hideTimer = setTimeout(...)` attaches an expando property to an `HTMLDivElement`. TypeScript would flag this; the `is:inline` script is not type-checked, so it runs. Browsers handle it fine today, but:
- It's not idiomatic — the conventional pattern is a module-scope `let hideTimer` closed over by the IIFE.
- If this script ever gets migrated to a `<script>` module (non-inline), strict type-check would break the build.
- Memory: expando properties attached to elements are GC'd with the element, which is fine; but hot-reload / HMR can leave stale timers if the script runs twice and only the second IIFE's `setTimeout` is referenced.

(b) `document.currentScript` inside an IIFE is `null` once the IIFE's microtask queue starts. Re-read the script:
```js
(() => {
  const script = document.currentScript;  // ← synchronous access, inside the IIFE
```
This works because `document.currentScript` is valid during synchronous execution of the script element. But if Astro View Transitions are ever enabled on the blog (they are not yet, verified via grep), `astro:page-load` would re-execute `is:inline` scripts in a non-currentScript context — the value becomes `null` and `COPY_LABEL` / `TOAST_COPIED` fall back to English defaults on RU pages.

The Astro recommended pattern for `astro:page-load` + View Transitions is to listen for `astro:page-load` explicitly and re-run the init. Since View Transitions aren't enabled, this is a latent risk — flag it when someone later adds `<ClientRouter />`.

Secondary concern: the script appends the button to the figure but has no teardown. On View Transitions navigation, the figure from the previous page could be reused; the new script runs, sees `figure.querySelector('.code-copy-btn')` returns non-null (from prior run), skips — but the event listener on the old button still references the old `pre` via closure. No functional bug (buttons would work), but subtle listener accumulation.

**Fix (minimum):**
```js
// Replace __hideTimer expando with closed-over variable
let hideTimer;

// ... inside click handler ...
if (toast) {
  toast.textContent = TOAST_COPIED;
  toast.classList.add('is-visible');
  if (hideTimer) clearTimeout(hideTimer);
  hideTimer = setTimeout(() => toast.classList.remove('is-visible'), 2000);
}
```

**Fix (View Transitions defensive):** Add a doc comment noting that if `ClientRouter` is added later, this script needs an `astro:page-load` listener for re-init.

---

## Info

### IN-01: Hardcoded `#14B8A6` in `BaseLayout.astro` theme-color meta — use a build-time constant from tokens

**File:** `src/layouts/BaseLayout.astro:40`

**Issue:** `<meta name="theme-color" content="#14B8A6" />` hardcodes the Deep Signal brand-primary hex. This is the canonical brand color (matches `--brand-primary` in `design-tokens.css:78`) and is fine, but a downstream migration (e.g. brand refresh) would need to touch both `design-tokens.css` and `BaseLayout.astro` and the correspondence is implicit. No functional bug.

**Fix:** Leave as-is for v1; consider extracting a shared `BRAND_PRIMARY_HEX` constant in `src/data/` if this value appears in more than one place (it does: `CNAME`/`index.html` do not use it, but favicon-generator scripts may).

### IN-02: Sitemap filter `.test('/blog/__')` matches any URL containing the substring, not just fixture posts

**File:** `astro.config.mjs:57`

**Issue:** `sitemap({ filter: (page) => !/\/blog\/__/.test(page) })` uses a regex without anchors. It correctly excludes fixture posts like `/en/blog/__fixture-syntax-highlighting`. It also excludes any hypothetical path like `/__blog/__misc` (impossible to generate here, so not a real bug), but more practically if a future blog post is ever slugged starting with `__` (e.g. for drafts), it's excluded — which might or might not be the intent.

**Fix:** Acceptable as-is. If you want stricter intent: `!/\/blog\/__[\w-]+$/.test(page)`. Minor.

### IN-03: Unit test coverage gap — `getClassList` "string class" branch (the Astro v5 flavor) not exercised

**File:** `tests/unit/rehype-code-badge.test.ts:8-35`

**Issue:** All test fixtures use `className: ['shiki', ...]` (array form, hast-standard). The plugin comments in `rehype-code-badge.mjs:14-22` explicitly note that Astro v5 emits `class: "shiki ..."` (string form). The plugin handles both, but tests only verify the array form. If the `getClassList` string-splitting branch regresses (e.g. someone adds a `.trim()` and breaks on leading whitespace), CI doesn't catch it.

**Fix:** Add one test fixture that passes `properties: { class: 'astro-code github-dark', 'data-language': 'bash' }` and asserts the figure wrap occurs.

### IN-04: Fixture post is published to dist on `draft: false` only — confirm `draft: true` is respected by blog collection rendering

**File:** `src/content/blog/en/__fixture-syntax-highlighting.md:6`

**Issue:** The fixture sets `draft: true` and relies on:
(a) homepage BlogPreview filtering `draft: true` out (per CLAUDE.md),
(b) sitemap filtering `__` prefix out,
(c) the `[...slug].astro` file renders ALL posts including drafts (`getCollection('blog', ({ id }) => id.startsWith('en/'))` — no draft filter).

So the fixture renders at `/en/blog/__fixture-syntax-highlighting` in production. This is deliberate (Phase 2 wants a live test page), but anyone who types the URL sees `"Internal fixture for Phase 2 transformer validation — not for publication."` This is not a bug but exposes internal tooling to the public.

**Fix:** For the fixture's lifetime, acceptable. Remove or gate after Phase 2 sign-off. A `noindex` meta on draft posts would be a durable solution.

### IN-05: `remark-stash-code-lang.mjs` does not normalize `lang` — bash/shell/sh variants each render as their own badge

**File:** `remark-stash-code-lang.mjs:17`

**Issue:** The plugin writes `node.lang` verbatim as `data-language`. mdast `.lang` is the raw fence string; a code block opened with ` ```sh ` will render badge `SH`, and ` ```shell ` will render `SHELL`. If blog posts mix these, the UX is inconsistent. This is not a bug — just a UX observation.

**Fix:** Consider a small alias map (`sh → bash`, `shell → bash`, `js → javascript`, `ts → typescript`) in either the remark plugin or the rehype badge plugin. Not required for v1.

### IN-06: `CodeCopyEnhancer` imports `Icon` at top of the component but the SSR template is the only consumer — redundant import-time cost on every page that ships the component

**File:** `src/components/CodeCopyEnhancer.astro:14`

**Issue:** The Icon component is used once (line 34) inside the `<template>`. Since the template is parsed once per page SSR and the runtime clones its content, there's no re-rendering cost. But the component still pulls in the `astro-icon` runtime for the Lucide copy icon SVG on every blog page. On blog posts without code blocks, the button template is inert but the Icon SVG is still emitted. Minor bytes.

**Fix:** Acceptable. If Phase 3 wants to trim page weight on code-block-free posts, gate `<CodeCopyEnhancer />` behind `post.data.hasCodeBlocks` or similar. Not for this phase.

### IN-07: `z-index: 1` on `.code-copy-btn` + `z-index: 1` on `.code-lang-badge` stack on top of each other — relies on DOM order for the badge to be behind the button

**File:** `src/components/CodeCopyEnhancer.astro:127` (btn) and `src/styles/global.css:216` (badge)

**Issue:** Both the copy button and the language badge have `z-index: 1`. They are positioned absolutely at `top: 0.5rem` — button at `right: 0.5rem`, badge at `left: 0.6rem`. No overlap in the default layout on wide code blocks. On narrow screens (e.g. 320px viewport with a code fence containing long identifiers), the button may horizontally collide with the badge. When they do overlap, DOM order determines stacking: the button is `figure.appendChild(...)` → last child → wins on top. This is correct behavior but undocumented.

**Fix:** Acceptable; add a comment on the badge CSS noting why z-index-1 pairs with the button. On narrow viewport, consider `.code-copy-btn { right: 0.5rem; }` + `.code-lang-badge { max-width: calc(100% - 80px); }` or hide the badge on hover when the button expands. v1 acceptable.

---

_Reviewed: 2026-05-03T14:00:00Z_
_Reviewer: Claude (gsd-code-reviewer)_
_Depth: standard_
