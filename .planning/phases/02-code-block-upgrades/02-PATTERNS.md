# Phase 2: Code Block Upgrades — Pattern Map

**Mapped:** 2026-05-03
**Files analyzed:** 13 (7 created / 6 modified)
**Analogs found:** 12 / 13 (1 file — `baselines/` — is a directory, no code analog applies)

## File Classification

| New/Modified File | Role | Data Flow | Closest Analog | Match Quality |
|-------------------|------|-----------|----------------|---------------|
| `rehype-code-badge.mjs` | build-plugin (rehype) | transform (hast visitor) | `remark-reading-time.mjs` | role-match (remark, not rehype) |
| `remark-stash-code-lang.mjs` (optional) | build-plugin (remark) | transform (mdast visitor) | `remark-reading-time.mjs` | exact |
| `tests/unit/rehype-code-badge.test.ts` | test (unit) | request-response (hast fixture → assertion) | `tests/unit/vv-registry.test.ts` | exact |
| `tests/visual/shiki-regression.spec.ts` | test (visual) | request-response (page → screenshot diff) | `tests/visual/pod-lifecycle-parity.spec.ts` | exact |
| `.planning/phases/02-code-block-upgrades/baselines/` | test-fixtures (PNG dir) | storage | `tests/visual/pod-lifecycle-parity.spec.ts-snapshots/` | exact (pattern, not code) |
| `src/styles/code-blocks.css` (optional) | stylesheet | declarative CSS | `src/styles/global.css` §prose-pre rule | role-match |
| `src/content/blog/en/__fixture-syntax-highlighting.md` (optional) | content fixture | declarative markdown | `src/content/blog/en/hello-world.md` | exact |
| `astro.config.mjs` (MODIFY) | config | declarative config | — (self-analog) | self |
| `src/components/CodeCopyEnhancer.astro` (MODIFY) | component (DOM enhancer) | event-driven (is:inline script) | — (self-analog) | self |
| `src/layouts/BaseLayout.astro` (MODIFY) | layout | template + singleton DOM | — (self-analog) | self |
| `src/styles/global.css` (MODIFY) | stylesheet | declarative CSS | — (self-analog) | self |
| `package.json` (MODIFY) | config | manifest | — (self-analog) | self |
| `src/styles/design-tokens.css` (VERIFY) | token source | declarative CSS | — (self-analog, no-change expected) | self |

---

## Pattern Assignments

### `rehype-code-badge.mjs` (build-plugin, hast-visitor transform)

**Analog:** `remark-reading-time.mjs` (project root, 11 LOC)

**Why this analog:** Closest ESM-default-export plugin-factory at project root. Shape and export style are identical; only the AST flavor differs (remark visits mdast, rehype visits hast).

**Imports + factory pattern** (lines 1-11 of `remark-reading-time.mjs`):

```javascript
// Source: docs.astro.build/en/recipes/reading-time
import getReadingTime from 'reading-time';
import { toString } from 'mdast-util-to-string';

export function remarkReadingTime() {
  return function (tree, { data }) {
    const textOnPage = toString(tree);
    const readingTime = getReadingTime(textOnPage);
    data.astro.frontmatter.minutesRead = Math.ceil(readingTime.minutes);
  };
}
```

**What to mirror:**
- ESM default-ish factory (named export; `astro.config.mjs` imports `{ remarkReadingTime }`).
- Top-of-file one-line sourcing comment, then imports, then export.
- Factory returns the visitor (no class, no options object needed for v1).
- Name matches file name (`rehype-code-badge.mjs` → `export function rehypeCodeBadge()`).

**What to add (specific to rehype, per RESEARCH.md Q2):**

```javascript
// rehype-code-badge.mjs
// Wraps <pre class="shiki"> emitted by Shiki in <figure class="code-block">
// and prepends <span class="code-lang-badge">. Build-time, zero runtime JS.
import { visit } from 'unist-util-visit';
import { h } from 'hastscript';

const LANGUAGE_CLASS_RE = /^language-(.+)$/;

export function rehypeCodeBadge() {
  return function transform(tree) {
    visit(tree, 'element', (node, index, parent) => {
      if (!parent || typeof index !== 'number') return;
      if (node.tagName !== 'pre') return;
      const preClasses = node.properties?.className ?? [];
      if (!preClasses.includes('shiki')) return;
      // ... detect lang, build <figure><span>badge</span><pre/></figure>
    });
  };
}
```

**Registration pattern** — mirror how `astro.config.mjs` imports `remark-reading-time.mjs`:

```javascript
import { remarkReadingTime } from './remark-reading-time.mjs';
// (add) import { rehypeCodeBadge } from './rehype-code-badge.mjs';
```

**Pitfall to surface in plugin-header comment:** language class may NOT be present on `<code>` by default in Astro 5.18 + Shiki 3 (RESEARCH.md Q2 §blocker). Spike before lock-in; fall back to `remark-stash-code-lang.mjs` pattern if needed.

---

### `remark-stash-code-lang.mjs` (optional; build-plugin, mdast-visitor transform)

**Analog:** `remark-reading-time.mjs` (exact — same remark idiom, same root location)

**Why:** It IS a remark plugin with the exact shape — named export, factory returning a visitor, lives at project root, wired via `astro.config.mjs` `markdown.remarkPlugins`.

**Mirror the full shape.** Only delta is the visitor body (from `toString(tree) → frontmatter` to `visit(tree, 'code', node => node.data.hProperties['data-language'] = node.lang)`).

**Concrete content** (per RESEARCH.md Q2 Workaround A):

```javascript
// remark-stash-code-lang.mjs
// Stashes fence language onto code hast properties so rehype-code-badge
// can read it after Shiki strips the original language-XXX class.
import { visit } from 'unist-util-visit';

export function remarkStashCodeLang() {
  return (tree) => {
    visit(tree, 'code', (node) => {
      if (!node.lang) return;
      node.data = node.data || {};
      node.data.hProperties = node.data.hProperties || {};
      node.data.hProperties['data-language'] = node.lang;
    });
  };
}
```

---

### `tests/unit/rehype-code-badge.test.ts` (test, unit)

**Analog:** `tests/unit/vv-registry.test.ts` (116 LOC, 9 tests; pure hast-fixture → assertion pattern)

**Why this analog:** Same test framework (`node:test`), same assertion library (`node:assert/strict`), same shape (import subject, build in-memory fixture, invoke, assert). `vv-registry.test.ts` is the closest "pure data transform" unit test in the tree — tests a side-effecting visitor over an abstract registry map, which parallels tests over a hast tree.

**Imports pattern** (lines 1-6 of `vv-registry.test.ts`):

```typescript
import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  createStageRegistry,
  pushStage,
  popStage,
  currentRegistry,
} from '../../src/components/visuals/_vv-registry.ts';
```

**For our test, swap subject import to the plugin:**

```typescript
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { rehypeCodeBadge } from '../../rehype-code-badge.mjs';
```

**Happy-path test structure** (lines 10-17 of `vv-registry.test.ts`):

```typescript
test('createStageRegistry returns empty maps + unique uid', () => {
  const r = createStageRegistry();
  assert.equal(r.nodes.size, 0);
  assert.equal(r.wires.size, 0);
  assert.ok(r.uid.length >= 6, `uid '${r.uid}' too short`);
  const r2 = createStageRegistry();
  assert.notEqual(r.uid, r2.uid, 'uids must be unique');
});
```

**Mirror this shape for each scenario:**
- `test('wraps <pre class="shiki"> in <figure class="code-block">', () => { ... })`
- `test('emits <span class="code-lang-badge"> with correct language text', () => { ... })`
- `test('skips non-shiki <pre> (e.g. user-authored inline)', () => { ... })`
- `test('idempotent — second run over already-wrapped tree is a no-op', () => { ... })`

**Package-script match:** `npm run test:unit` already runs `node --experimental-strip-types --test 'tests/unit/*.test.ts'` — new `rehype-code-badge.test.ts` auto-picked up, zero config change.

---

### `tests/visual/shiki-regression.spec.ts` (test, visual)

**Analog:** `tests/visual/pod-lifecycle-parity.spec.ts` (36 LOC, 1 test — exact idiom for `.prose`-scoped, reduced-motion, maxDiffPixels baseline diff)

**Imports pattern** (lines 1-2):

```typescript
import { test, expect } from '@playwright/test';
```

**Describe block + reducedMotion + navigation + figure locator pattern** (lines 18-35):

```typescript
test.describe('PodLifecycleAnimation refactor — pixel parity', () => {
  test('reduced-motion frozen state matches baseline', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/en/blog/2026-03-20-karpenter-right-sizing');

    // Figure is currently .pod-lifecycle (pre-refactor) or .vv-stage (post-refactor)
    const figure = page.locator('figure.pod-lifecycle, figure.vv-stage').first();
    await figure.waitFor({ state: 'visible' });

    // 300ms settle for font loading — Inter/Space Grotesk/JetBrains Mono are WOFF2
    await page.waitForTimeout(300);

    await expect(figure).toHaveScreenshot('pod-lifecycle-frozen.png', {
      maxDiffPixels: 150,
      maxDiffPixelRatio: 0.002,
      animations: 'disabled',
    });
  });
});
```

**What to copy exactly:**
- `reducedMotion: 'reduce'` via `emulateMedia` (also enforced globally by `playwright.config.ts` `use.reducedMotion: 'reduce'`, but per-test call mirrors the existing test's defensive style).
- 300ms WOFF2 settle (`await page.waitForTimeout(300)`).
- `maxDiffPixels: 150, maxDiffPixelRatio: 0.002, animations: 'disabled'` — RESEARCH.md Q7 explicitly recommends matching these thresholds.
- Locator chained to `.waitFor({ state: 'visible' })` before screenshot.

**What to swap:**
- Locator: `page.locator('article .prose').first()` (scope = whole prose block, per D-08b).
- 8 tests total — one `test(...)` per (post × locale):
  - `/en/blog/hello-world` + `/ru/blog/hello-world`
  - `/en/blog/2026-02-10-why-i-write-kubernetes-manifests-by-hand` + `/ru/…`
  - `/en/blog/2026-03-02-mcp-servers-plainly-explained` + `/ru/…`
  - `/en/blog/2026-03-20-karpenter-right-sizing` + `/ru/…`
- Screenshot filenames: `shiki-regression-<slug>-<locale>.png`.
- `test.describe('Shiki + code-block regression — .prose parity on 4 posts × 2 locales', () => { ... })`.

---

### `.planning/phases/02-code-block-upgrades/baselines/` (test-fixtures directory)

**Analog:** `tests/visual/pod-lifecycle-parity.spec.ts-snapshots/` (dir holding `pod-lifecycle-frozen-chromium-darwin.png`)

**Why this analog:** Identical role — PNG binaries committed to git as baseline for screenshot diff.

**Deviation note:** The existing snapshot directory is a Playwright auto-generated `*.spec.ts-snapshots/` sibling. The phase spec instructs `.planning/phases/02-code-block-upgrades/baselines/` — a manual baseline location outside Playwright's default snapshot discovery. The planner must explicitly pass the baselines path via `toHaveScreenshot(<absolute-or-relative-path>)` if the baselines live outside `<spec>-snapshots/`. Simpler: let Playwright use its default `tests/visual/shiki-regression.spec.ts-snapshots/` AND ALSO copy-commit the 8 PNGs into `.planning/phases/02-code-block-upgrades/baselines/` for phase-artifact visibility (8 × ~50KB = ~400KB, per RESEARCH.md Pitfall 8).

**Size budget:** ~50KB per `.prose`-scoped PNG × 8 = ~400KB. LFS not configured; acceptable for one phase.

---

### `src/styles/code-blocks.css` (optional, stylesheet)

**Analog:** `src/styles/global.css` (147 LOC) — specifically the `@import "./design-tokens.css"` + plain CSS blocks pattern at top.

**Import pattern** (lines 1-4 of `global.css`):

```css
/* Design tokens MUST come before Tailwind — so :root vars are in scope
   when @theme references them via var(...) and .light override cascades. */
@import "./design-tokens.css";
@import "tailwindcss";
@plugin "@tailwindcss/typography";
```

**For the new file, copy this head comment style and import the tokens directly** (if this CSS file is consumed standalone — otherwise have `global.css` `@import "./code-blocks.css"`). Planner's call per Claude's Discretion (CONTEXT.md).

**Representative `.prose` scoping pattern to mirror** (the only existing block that directly targets prose code is in `src/pages/{en,ru}/blog/[...slug].astro`, inline Tailwind arbitrary-property):

```astro
<div class="prose prose-invert max-w-none
  prose-headings:font-display prose-headings:font-semibold
  prose-a:text-accent prose-a:no-underline hover:prose-a:underline hover:prose-a:text-accent-light
  prose-code:font-mono prose-code:text-accent-light
  prose-pre:bg-surface prose-pre:border prose-pre:border-border
  prose-hr:border-border
">
```

**What to copy:**
- `.prose` wrapper scope (all new Shiki overrides must begin `.prose .shiki …` per D-03b).
- Token-var references only — no hex literals (e.g., `color: var(--brand-primary) !important;` not `color: #14B8A6`).
- Theme class chain (`.prose prose-invert` remains; new rules can use either `.prose` OR `:where(.prose)` to avoid specificity bloat).

**Concrete block template per RESEARCH.md Q3:**

```css
.prose pre.shiki {
  background-color: var(--bg-code) !important;
  color: var(--text-primary) !important;
  border: 1px solid var(--border);
}

.prose .shiki span[style*="color:#F97583" i] { color: var(--brand-primary) !important; }
.prose .shiki span[style*="color:#9ECBFF" i] { color: var(--brand-accent) !important; }
.prose .shiki span[style*="color:#85E89D" i] { color: var(--brand-primary) !important; }
.prose .shiki span[style*="color:#79B8FF" i] { color: var(--brand-primary-hover) !important; }
.prose .shiki span[style*="color:#6A737D" i] { color: var(--text-muted) !important; }
.prose .shiki span[style*="color:#FFAB70" i] { color: var(--brand-primary-hover) !important; }
/* … full set in Q3 */
```

---

### `src/content/blog/en/__fixture-syntax-highlighting.md` (optional, content fixture)

**Analog:** `src/content/blog/en/hello-world.md` (closest simple blog post)

**Why this analog:** Same Content Collection path, same frontmatter schema, same markdown flavor. Fixture is a minimal blog post — just mirrors the frontmatter and adds fences with `// [!code ...]` annotations.

**Frontmatter template** (from `hello-world.md` style, inferred from CONTEXT.md §Adding a Blog Post and Phase 2 schema):

```yaml
---
title: "Syntax Highlighting Fixture"
description: "Internal fixture for Phase 2 transformer validation — not for publication."
date: 2026-05-03
tags: ["fixture"]
draft: true
---
```

Key: `draft: true` — excluded from build/sitemap. Body contains four fences (bash, yaml, typescript, dockerfile) per RESEARCH.md Q4 using `# [!code highlight]` (yaml/bash) and `// [!code highlight]` / `// [!code ++]` / `// [!code --]` (typescript/dockerfile).

---

### `astro.config.mjs` (MODIFY — config)

**Self-analog** — current file is 28 LOC with `markdown.remarkPlugins: [remarkReadingTime]` already in place.

**Current state** (lines 20-22):

```javascript
  markdown: {
    remarkPlugins: [remarkReadingTime],
  },
```

**Target state** (RESEARCH.md Q1):

```javascript
import { remarkReadingTime } from './remark-reading-time.mjs';
import { rehypeCodeBadge } from './rehype-code-badge.mjs';
// (if Workaround A) import { remarkStashCodeLang } from './remark-stash-code-lang.mjs';
import {
  transformerNotationHighlight,
  transformerNotationDiff,
} from '@shikijs/transformers';

// ... inside defineConfig:
  markdown: {
    remarkPlugins: [remarkReadingTime /*, remarkStashCodeLang */],
    rehypePlugins: [rehypeCodeBadge],
    shikiConfig: {
      theme: 'github-dark',
      wrap: true,
      transformers: [
        transformerNotationHighlight(),
        transformerNotationDiff(),
      ],
    },
  },
```

**What to preserve verbatim:**
- `// @ts-check` first line (lines 1).
- `defineConfig` wrapper + `site: 'https://vedmich.dev'` + `i18n: { … }` block untouched.
- `vite: { plugins: [tailwindcss()] }` untouched.
- `integrations: [mdx(), sitemap(), icon()]` untouched.
- Preserve `remarkReadingTime` in the `remarkPlugins` array.

**MDX coverage note:** `markdown.*` config auto-applies to `.mdx` via `@astrojs/mdx`'s `extendMarkdownConfig: true` default (RESEARCH.md Summary #5). No separate registration on `mdx()`.

---

### `src/components/CodeCopyEnhancer.astro` (MODIFY — component)

**Self-analog** — current 121 LOC; rewrite in place preserving proven patterns.

**Current imports + frontmatter pattern** (lines 1-21):

```typescript
---
// Enhance all <pre> blocks inside `.prose` with a copy-to-clipboard button.
// ...
interface Props {
  locale?: 'en' | 'ru';
}

const { locale = 'en' } = Astro.props;

const labels = {
  en: { copy: 'Copy', copied: 'Copied' },
  ru: { copy: 'Копировать', copied: 'Скопировано' },
} as const;

const l = labels[locale];
---
```

**What to preserve (foundational):**
- `interface Props { locale?: 'en' | 'ru'; }` + default `'en'` destructure (lines 9-13).
- `labels` literal-map const (lines 15-18) — **extend**, do not replace. Add `toastCopied` field per RESEARCH.md Q6:

```typescript
const labels = {
  en: { copy: 'Copy', copied: 'Copied', toastCopied: 'Copied to clipboard' },
  ru: { copy: 'Копировать', copied: 'Скопировано', toastCopied: 'Скопировано в буфер' },
} as const;
```

**Preserve `is:inline` + `data-*` bilingual-label passthrough pattern** (line 23):

```astro
<script is:inline data-copy-label={l.copy} data-copied-label={l.copied}>
  (() => {
    const script = document.currentScript;
    const COPY = script?.dataset.copyLabel ?? 'Copy';
    const COPIED = script?.dataset.copiedLabel ?? 'Copied';
    // ...
  })();
</script>
```

**Extend the data attributes:** add `data-toast-copied-label={l.toastCopied}` to the `<script>` tag. Script reads via `script.dataset.toastCopiedLabel`.

**Preserve clipboard API + textarea fallback** (lines 45-60):

```javascript
btn.addEventListener('click', async () => {
  const code = pre.querySelector('code');
  const text = code ? code.innerText : pre.innerText;
  try {
    await navigator.clipboard.writeText(text);
  } catch {
    // Fallback: textarea selection
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.style.position = 'fixed';
    ta.style.top = '-1000px';
    document.body.appendChild(ta);
    ta.select();
    try { document.execCommand('copy'); } catch { /* noop */ }
    document.body.removeChild(ta);
  }
  // ...success path here
});
```

**What to CHANGE:**

1. **Selector** (line 29) — `.prose pre` → `.prose .code-block > pre`. The rehype plugin already provides the `<figure class="code-block">` wrapper; script no longer creates `div.code-wrap`. Delete lines 30-36 (`wrap` creation loop).

2. **Icon-only default + label on hover** (replace line 42 `btn.textContent = COPY`):
   - Use `<Icon name="lucide:copy" width="14" height="14" aria-hidden="true" />` from `astro-icon/components`. RESEARCH.md Q5 confirms `lucide:copy` is the best fit.
   - But the current `CodeCopyEnhancer` script creates the button at runtime — mixing `<Icon>` (Astro component, SSR-only) with runtime DOM creation is awkward. Planner picks: either (a) render button HTML in a `<template>` at component root and clone at runtime, or (b) inline the Lucide SVG string in the script's DOM create loop.
   - Icon component import pattern (seen in `src/components/visuals/README.md:18`):

     ```astro
     ---
     import { Icon } from 'astro-icon/components';
     ---
     ```

3. **Remove `opacity: 0` default + hover reveal** (lines 96, 100-103):
   - Current: `opacity: 0` on `.code-copy-btn`, reveal on `.code-wrap:hover`.
   - Target (D-02): both badge + Copy always visible. Delete `opacity: 0`, delete `:hover { opacity: 1 }` rule, delete `@media (hover: none)` block (lines 117-120).

4. **Toast dispatch** — append to success branch (after line 60 `document.body.removeChild(ta);` pair, inside both success paths):

   ```javascript
   const toast = document.getElementById('code-copy-toast');
   if (toast) {
     toast.textContent = TOAST_COPIED;
     toast.classList.add('is-visible');
     clearTimeout(toast.__hideTimer);
     toast.__hideTimer = setTimeout(() => {
       toast.classList.remove('is-visible');
     }, 2000);
   }
   ```

5. **Delete `.code-wrap` scoped styles** — `<style is:global>` block (lines 72-121) mostly needs rewriting:
   - Drop `.prose .code-wrap` rules (figure replaces it).
   - Drop `@media (hover: none)` block (D-02b).
   - Keep `.prose .code-copy-btn` base rules (size, typography, border) but remove `opacity: 0`.
   - Add `.code-lang-badge` styles per D-06 (JB Mono 0.7rem, muted, uppercase, 0.04em).
   - Add `.code-copy-toast` styles per RESEARCH.md Q6 (fixed top-right, opacity-based hide).

**Preserve `is-copied` button feedback decision:** per D-07e + RESEARCH.md Pitfall 7, remove the `is-copied` class path — toast is canonical confirmation. Delete lines 61-66 `btn.classList.add('is-copied'); setTimeout(..., 1600)` block.

---

### `src/layouts/BaseLayout.astro` (MODIFY — layout)

**Self-analog** — 105 LOC; inject one element + nothing else.

**Current closing `<body>` pattern** (lines 67-104):

```astro
  <body class="min-h-screen flex flex-col">
    <Header locale={locale} />
    <main class="flex-1">
      <slot />
    </main>
    <Footer locale={locale} />

    <script>
      // Scroll-triggered animations — skipped when user prefers reduced motion.
      // ...
    </script>

    <!-- Global ⌘K search palette. Hidden by default; Header buttons or keyboard shortcuts open it. -->
    <SearchPalette locale={locale} />
  </body>
```

**Injection point (RESEARCH.md Q6 pinpoints this exactly):** insert AFTER `<Footer locale={locale} />` (line 72), BEFORE the `<script>` block (line 74).

```astro
    <Footer locale={locale} />

    <!-- Singleton toast for CodeCopyEnhancer (D-07b). One per page, hidden until
         a copy action sets text + .is-visible. Screen-reader polite announcement. -->
    <div
      id="code-copy-toast"
      class="code-copy-toast"
      role="status"
      aria-live="polite"
      aria-atomic="true"
    ></div>

    <script>
      // ... existing scroll-animation script unchanged
    </script>
```

**Critical `aria-live` hidden-state rule** (RESEARCH.md Q6 + Pitfall 3): the toast MUST be hidden via `opacity: 0` + `pointer-events: none`. **Never** use `display: none`, `visibility: hidden`, or `aria-hidden="true"` — all three remove the element from the AT tree and silent the announcement.

**Mirror existing `<noscript>` fallback pattern** (lines 48-52) — no new noscript needed for toast; it's progressive-enhancement-only.

**Preserve Everything Else Untouched:**
- All meta, OG, canonical, alternate, icon, manifest, preload font links.
- Both `<script>` blocks unchanged.
- `<SearchPalette>` mount unchanged.
- Props interface unchanged.

---

### `src/styles/global.css` (MODIFY — stylesheet)

**Self-analog** — 147 LOC.

**Current prose code-block styling is INLINED in blog page Tailwind utilities** (not in `global.css` at all, per earlier grep). `global.css` currently has zero `.prose pre` or `.prose .shiki` rules. All new rules added here are greenfield.

**Existing `@theme` block + :root-var-reference pattern** (lines 7-56) is the analog:

```css
@theme {
  --color-brand-primary:       var(--brand-primary);
  /* ... dozens of similar lines ... */
}
```

**What to preserve:**
- Token-var-only references (`var(--...)`); zero hex literals.
- `@theme` block layout and comment structure.
- The `body`, `::selection`, `:focus-visible`, `animate-on-scroll`, `@media (prefers-reduced-motion)` blocks all untouched.

**What to ADD** (inline OR import a new `code-blocks.css` — planner's pick per D-08):

```css
/* -- Deep Signal Shiki overrides (scoped to .prose .shiki — Pitfall 11). -- */
.prose pre.shiki {
  background-color: var(--bg-code) !important;
  color: var(--text-primary) !important;
  border: 1px solid var(--border);
}

.prose .shiki span[style*="color:#F97583" i] { color: var(--brand-primary) !important; }
/* ... remaining token overrides from RESEARCH.md Q3 ... */

/* -- Figure + badge toolbar (from rehype-code-badge.mjs) -- */
.prose .code-block {
  position: relative;
  margin: 0;
}
.prose .code-lang-badge {
  position: absolute;
  top: 0.6rem;
  left: 0.6rem;
  font-family: var(--font-mono);
  font-size: 0.7rem;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: var(--text-muted);
  padding: 0.3rem 0.6rem;
  transition: color 120ms ease;
}
.prose .code-block:hover .code-lang-badge {
  color: var(--text-primary);
}

/* -- Highlight line treatment (D-04) -- */
.prose .shiki .line.highlighted {
  display: inline-block;
  width: 100%;
  background: color-mix(in srgb, var(--brand-primary-soft) 12%, transparent);
  border-left: 2px solid var(--brand-primary);
  padding-left: calc(1rem - 2px);
}

/* -- Diff line treatment + gutter glyph (D-05, D-05c) -- */
.prose .shiki .line.diff.add {
  display: inline-block;
  width: 100%;
  background: color-mix(in srgb, var(--success) 15%, transparent);
}
.prose .shiki .line.diff.add::before {
  content: "+";
  display: inline-block;
  width: 1rem;
  color: var(--success);
}
.prose .shiki .line.diff.remove {
  display: inline-block;
  width: 100%;
  background: color-mix(in srgb, var(--error) 15%, transparent);
}
.prose .shiki .line.diff.remove::before {
  content: "−";
  display: inline-block;
  width: 1rem;
  color: var(--error);
}
```

**What to REMOVE from `src/pages/{en,ru}/blog/[...slug].astro`:** the `prose-pre:bg-surface prose-pre:border prose-pre:border-border` Tailwind arbitrary-utilities on the `.prose` container become redundant (superseded by `.prose pre.shiki` rule). Planner's call whether to clean up in Phase 2 or defer.

---

### `package.json` (MODIFY — config)

**Self-analog** — current deps include `"astro": "^5.17.1"`.

**Two changes required:**

1. **Pin Astro** (D-09 + RESEARCH.md Q8 adjustment):

   ```diff
   - "astro": "^5.17.1"
   + "astro": "5.18.0"
   ```

   RESEARCH.md Q8 recommends 5.18.0 (already in `node_modules`) over the literal 5.17.1 from D-09 — functionally identical, avoids pointless downgrade reinstall. Restore `^5.18.0` in a follow-up commit after Phase 2 merges (D-09 restore step).

2. **Add Shiki transformers** (RESEARCH.md Q1):

   ```diff
     "devDependencies": {
   +   "@shikijs/transformers": "^3.23.0",
       "@iconify-json/carbon": "...",
       ...
     }
   ```

   Version must be `^3.x.x` (NOT `^4.0.0`) to match Astro 5.x's `shiki: "^3.21.0"` peer.

**Preserve all other deps + scripts** unchanged.

**`scripts` block** — the new test files (`tests/visual/shiki-regression.spec.ts` + `tests/unit/rehype-code-badge.test.ts`) are auto-picked up by existing `test` and `test:unit` scripts — no script change needed.

---

### `src/styles/design-tokens.css` (VERIFY — no changes expected)

**Self-analog** — 298 LOC.

**Per CONTEXT.md §Reusable Assets:** "All tokens needed already exist. `--brand-primary`, `--brand-accent`, `--brand-primary-soft`, `--text-primary`, `--text-muted`, `--bg-code`, `--border`, `--success`, `--error`. No new tokens required."

**Action:** grep-confirm each token exists in `design-tokens.css` before declaring no-change. Tokens already verified present during context gathering:
- `--brand-primary: #14B8A6;` (line 78)
- `--brand-primary-hover: #2DD4BF;` (line 79)
- `--brand-primary-soft: #134E4A;` (line 81)
- `--brand-accent: #F59E0B;` (line 82)
- `--text-primary: #E2E8F0;` (line 93)
- `--text-muted: #78909C;` (line 95)
- `--bg-code: #0D1117;` (line 90)
- `--border: #334155;` (line 100)
- `--success: #10B981;` (line 108)
- `--error: #EF4444;` (line 110)
- `--font-mono` (line 194)
- `--ease-out` (line 237)
- `--shadow-md` (line 229)

**No writes expected to this file in Phase 2.** If the planner discovers a missing token during implementation, it should be added here under the appropriate section (not in `global.css` or component-scoped CSS) per CLAUDE.md "All tokens live in design-tokens.css".

---

## Shared Patterns

### 1. ESM Plugin Factory at Project Root

**Source:** `remark-reading-time.mjs` (lines 1-11)
**Apply to:** `rehype-code-badge.mjs`, `remark-stash-code-lang.mjs`

```javascript
// Source: <doc-url>
import { visit } from 'unist-util-visit';

export function pluginName() {
  return function transform(tree /*, file */) {
    visit(tree, /* selector */, (node) => {
      // mutate or decorate
    });
  };
}
```

- Named export matching file name.
- Top-of-file one-line source/comment attribution.
- Import visitor + any helpers.
- Factory that returns the visitor closure.
- No class, no config options for v1 simplicity.

### 2. Bilingual `labels` Const with `as const` + Locale Indexing

**Source:** `src/components/CodeCopyEnhancer.astro` (lines 15-20)
**Apply to:** all new bilingual strings in `CodeCopyEnhancer` (specifically `toastCopied`)

```typescript
const labels = {
  en: { copy: 'Copy', copied: 'Copied', toastCopied: 'Copied to clipboard' },
  ru: { copy: 'Копировать', copied: 'Скопировано', toastCopied: 'Скопировано в буфер' },
} as const;

const l = labels[locale];
```

- `as const` for literal narrowing.
- Keys keyed on `'en'` / `'ru'` — match the shared `Locale` type from `src/i18n/utils.ts`.
- Destructure into `l` for concise template interpolation.

### 3. `is:inline` Script + `data-*` Attribute Passthrough for i18n

**Source:** `src/components/CodeCopyEnhancer.astro` (lines 23-27)
**Apply to:** CodeCopyEnhancer's rewrite (pass `toastCopied` via `data-toast-copied-label`)

```astro
<script is:inline data-copy-label={l.copy} data-copied-label={l.copied} data-toast-copied-label={l.toastCopied}>
  (() => {
    const script = document.currentScript;
    const COPY = script?.dataset.copyLabel ?? 'Copy';
    const COPIED = script?.dataset.copiedLabel ?? 'Copied';
    const TOAST_COPIED = script?.dataset.toastCopiedLabel ?? 'Copied';
    // ...
  })();
</script>
```

- `is:inline` keeps script un-bundled — immediate execution, no JS ship for Astro module system.
- `script.dataset.*` read at run-time — dataset name is kebab-to-camel translated.
- `??` fallback keeps script defensive if attribute is missing.

### 4. `.prose` Scoping for All Blog-Post Styling

**Source:** `src/pages/{en,ru}/blog/[...slug].astro` (line 58 en / line 68 ru) + implicit throughout the codebase
**Apply to:** all new Shiki overrides, badge styles, highlight/diff line styles

Rule: **every** new selector for code-block behavior must begin `.prose .shiki …` or `.prose .code-block …` or `.prose pre.shiki …`. Never bare `.shiki` / `pre` / `code`. Prevents Pitfall 11 (global Shiki CSS scope leakage onto the homepage's `font-mono` terminals, certification badges, etc., which are NOT inside `.prose`).

### 5. Token-Var References Only — Zero Hex Literals in Components

**Source:** CLAUDE.md §Deep Signal + `src/styles/design-tokens.css` + `global.css` @theme block
**Apply to:** `code-blocks.css` (or inline), `CodeCopyEnhancer.astro` `<style>`, `BaseLayout.astro` toast styles

- ALWAYS `color: var(--brand-primary)`, NEVER `color: #14B8A6`.
- Exception: Shiki attribute selectors like `span[style*="color:#F97583" i]` — the hex matches Shiki's emitted INLINE style (read-only input), not a new hex being introduced to the design system.

### 6. Playwright Screenshot Diff Pattern

**Source:** `tests/visual/pod-lifecycle-parity.spec.ts` (full file)
**Apply to:** `tests/visual/shiki-regression.spec.ts` (8 test cases)

Copy the:
- Import line (`import { test, expect } from '@playwright/test';`)
- `test.describe(…, () => { test(…, async ({ page }) => { … })})` nesting.
- `page.emulateMedia({ reducedMotion: 'reduce' })` first call.
- `page.goto('/en/blog/<slug>')` navigation.
- Locator → `.waitFor({ state: 'visible' })` settle.
- `page.waitForTimeout(300)` WOFF2-settle delay.
- `toHaveScreenshot(<name>.png, { maxDiffPixels: 150, maxDiffPixelRatio: 0.002, animations: 'disabled' })`.

### 7. `node:test` + `node:assert/strict` for Unit Tests

**Source:** `tests/unit/vv-*.test.ts` (all 3 files)
**Apply to:** `tests/unit/rehype-code-badge.test.ts`

```typescript
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { subject } from '../../path/to/subject';

test('descriptive scenario', () => {
  const result = subject(input);
  assert.equal(result.foo, expected);
});
```

No `describe` wrapping — top-level `test()` calls only. No framework install (Node built-in).

---

## No Analog Found

None. Every new file has a close analog in the codebase (pattern-wise, if not role-exact). Even `baselines/` has an analog (`*-snapshots/` dir from Playwright).

---

## Metadata

**Analog search scope:**
- `/Users/viktor/Documents/GitHub/vedmich/vedmich.dev/remark-reading-time.mjs` — plugin pattern
- `/Users/viktor/Documents/GitHub/vedmich/vedmich.dev/src/components/CodeCopyEnhancer.astro` — component pattern
- `/Users/viktor/Documents/GitHub/vedmich/vedmich.dev/src/layouts/BaseLayout.astro` — layout pattern
- `/Users/viktor/Documents/GitHub/vedmich/vedmich.dev/astro.config.mjs` — config pattern
- `/Users/viktor/Documents/GitHub/vedmich/vedmich.dev/src/styles/{global,design-tokens}.css` — style token patterns
- `/Users/viktor/Documents/GitHub/vedmich/vedmich.dev/src/pages/{en,ru}/blog/[...slug].astro` — mount point pattern
- `/Users/viktor/Documents/GitHub/vedmich/vedmich.dev/tests/visual/pod-lifecycle-parity.spec.ts` — visual test pattern
- `/Users/viktor/Documents/GitHub/vedmich/vedmich.dev/tests/unit/vv-{geom,path,registry}.test.ts` — unit test pattern
- `/Users/viktor/Documents/GitHub/vedmich/vedmich.dev/src/components/visuals/VvNode.astro` + `/README.md` — Iconify Icon import pattern
- `/Users/viktor/Documents/GitHub/vedmich/vedmich.dev/package.json` — dep version pattern
- `/Users/viktor/Documents/GitHub/vedmich/vedmich.dev/playwright.config.ts` — Playwright config pattern

**Files scanned:** 12 primary + ~15 grep sweeps across `src/components/**`, `src/content/blog/**`, `tests/**`, `src/styles/**`.

**Pattern extraction date:** 2026-05-03
