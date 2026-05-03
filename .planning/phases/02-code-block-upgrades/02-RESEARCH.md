# Phase 2: Code Block Upgrades - Research

**Researched:** 2026-05-03
**Domain:** Astro 5 Shiki integration — rehype plugin authoring + @shikijs/transformers v3 + CSS overrides over github-dark
**Confidence:** HIGH (stack, transformer API, regression surface, icon choice); MEDIUM (exact CSS-override strategy — attribute-selector vs built-in css-variables-theme tradeoff flagged below)

---

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

**D-01:** Build-time rehype plugin wraps Shiki's `<pre class="shiki">` in `<figure class="code-block"><span class="code-lang-badge">yaml</span><pre>…</pre></figure>`. Zero runtime JS for the badge itself. Plugin reads `code.className` (`language-yaml`, `language-bash`, etc.). Researcher picks authoring style — functional contract locked.

**D-01b:** Plugin file location: `rehype-code-badge.mjs` at project root (mirrors existing `remark-reading-time.mjs`). Wired into `astro.config.mjs` via `markdown.rehypePlugins: [rehypeCodeBadge]`.

**D-01c:** Badge sits INSIDE the new `<figure class="code-block">` wrapper, BEFORE `<pre>`. `CodeCopyEnhancer.astro` Copy button becomes a sibling of `<pre>` inside the same `.code-block` figure. Current `div.code-wrap` pattern is replaced. Copy script targets `.code-block > pre` instead of `.prose pre`.

**D-02:** Both badge and Copy always visible. Top-right toolbar row: `[YAML]  [⧉ Copy]`. Kills hover-only visibility for Copy.

**D-02b:** On touch devices (`@media (hover: none)`) — identical (both always visible). Existing `@media (hover: none) { .code-copy-btn { opacity: 1; } }` rule deleted.

**D-03:** `github-dark` as Shiki base theme + Deep Signal CSS variable overrides scoped to `.prose .shiki`:
  - keywords / declarations / types → `var(--brand-primary)` (#14B8A6 teal)
  - strings / values → `var(--brand-accent)` (#F59E0B amber)
  - comments → `var(--text-muted)` (#78909C)
  - base/identifiers/operators → `var(--text-primary)` (#E2E8F0)
  - numbers/constants → `var(--brand-primary-hover)` (#2DD4BF)
  - functions/methods → `var(--text-primary)`

**D-03b:** `.prose pre` background → `var(--bg-code)` (#0D1117), `border: 1px solid var(--border)` preserved. Scope all overrides via `.prose .shiki` (Pitfall 11).

**D-03c:** `!important` likely needed to defeat Shiki inline styles. Planner verifies against current output.

**D-03d:** Concrete token-class targeting varies — planner inspects emitted HTML on 4 posts and writes the selector map. Color targets are locked.

**D-04:** `// [!code highlight]` rendered with `border-left: 2px solid var(--brand-primary)` + `background: var(--brand-primary-soft)` at ~10-12% opacity. Both on `.highlighted` class that `@shikijs/transformers` applies per line.

**D-04b:** Transformer = `transformerNotationHighlight` (not `transformerMetaHighlight`). Validated on bash, yaml, typescript.

**D-05:** `// [!code ++]` → `background: var(--success)` ~15% tint + `+` glyph in gutter. `// [!code --]` → `background: var(--error)` ~15% tint + `−` glyph in gutter. Standard git palette.

**D-05b:** Transformer = `transformerNotationDiff`. Applied alongside `transformerNotationHighlight`.

**D-05c:** Gutter glyphs via CSS `::before` on `.diff.add` / `.diff.remove`. Pure CSS, inherits a11y.

**D-06:** Badge visual — `text-muted` color, transparent background, JetBrains Mono `0.7rem` (~11px), uppercase, letter-spacing `0.04em`, padding `0.3rem 0.6rem`, no border. On `.code-block:hover`, badge → `text-primary` (120ms ease).

**D-06b:** Badge shows Shiki-detected language as-emitted (no vocab normalization in v1).

**D-07:** Icon-only by default, `[⧉ Copy]` on hover. Icon choice left to researcher.

**D-07b:** Singleton `<div id="code-copy-toast" aria-live="polite" role="status">` in `BaseLayout.astro` (hidden by default). On successful copy, toast text set to `"Copied to clipboard"` / `"Скопировано в буфер"`, `.is-visible` class toggled ~2s. Fixed top-right viewport, `var(--success)` bg, `var(--text-primary)` text, CSS transition slide-in/fade-out.

**D-07c:** Auto-hide on animationend. No manual dismiss, no queue, no variants (success only).

**D-07d:** No keyboard shortcut in this phase.

**D-07e:** Preserve all current a11y. Existing `is-copied` intra-button feedback may coexist or be removed — planner's call.

**D-08:** Playwright screenshot-diff regression gate on 4 blog posts, BOTH locales = 8 screenshots. Baselines BEFORE Shiki config change committed to `.planning/phases/02-code-block-upgrades/baselines/`.

**D-08b:** Baseline posts: `hello-world.md`, `2026-02-10-why-i-write-kubernetes-manifests-by-hand.md`, `2026-03-02-mcp-servers-plainly-explained.md`, `2026-03-20-karpenter-right-sizing.mdx`. EN + RU. Screenshot scope: `.prose` section only.

**D-09:** Pin Astro to exact version during phase (`"astro": "5.17.1"` — dropping the `^`). After merge + regression pass, restore `^5.17.1`.

### Claude's Discretion
- Rehype plugin authoring style (vanilla `unist-util-visit` + `hastscript` vs hast helpers vs `rehype-pretty-code` as dep)
- Icon choice for Copy button (`carbon:copy` / `lucide:copy` / `lucide:clipboard` / `ph:copy`)
- Toast CSS animation curve + duration (within constraints: 120-180ms ease-out in, 200-260ms ease-in out, visible ~2s, `prefers-reduced-motion: reduce` disables)
- Exact Shiki token-class selector map
- Whether to keep `is-copied` intra-button feedback alongside toast
- File split — inline `global.css` vs new `src/styles/code-blocks.css`

### Deferred Ideas (OUT OF SCOPE)
- Full toast manager system (queue, ToastContainer, variants, manual dismiss)
- Keyboard shortcut Cmd/Ctrl+Shift+C
- Code block line numbers (`transformerNotationFocus` / gutter numbering)
- Custom Shiki JSON theme file
- Shiki Twoslash runtime
- Language badge vocabulary normalization (`ts` → `typescript`)
- Phase 3 (UI polish) visual pass on code blocks in full-page context
</user_constraints>

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| **CODE-01** | Render language badge (top-right pill) on every prose code block, JetBrains Mono small-caps | Focus Q2 (rehype plugin skeleton), Q6 (toast DOM placement unrelated to badge itself) |
| **CODE-02** | `// [!code highlight]` via `@shikijs/transformers`, validated on bash/yaml/typescript | Focus Q1 (transformer API + exact package name `@shikijs/transformers@^3.21.0`) |
| **CODE-03** | `// [!code ++]` / `// [!code --]` diff line styling | Focus Q1 (both transformers registered in same `shikiConfig.transformers` array) |
| **CODE-04** | Deep Signal-matched Shiki theme via CSS variables (not named JSON theme) | Focus Q3 (attribute-selector strategy on inline `style="color:#…"` spans — github-dark token color inventory documented below) |
| **CODE-05** | Preserve `CodeCopyEnhancer.astro` copy button behavior on all 4 existing posts (zero regressions) | Focus Q4 (regression surface is 3 of 4 posts with fences, one `.mdx`), Q6 (toast integration) |
</phase_requirements>

---

## Summary

The planner needs to know five things that the kickoff research (2026-05-02) either got wrong or didn't surface:

1. **`@shikijs/transformers` version is `^3.21.0`, not `^1.0.0`.** The kickoff research mistakenly pointed at Shiki v1. Astro 5.17.1 + 5.18.0 both depend on `shiki: "^3.21.0"`, and `@shikijs/transformers` must match its peer (`@shikijs/core`, `@shikijs/types`). `@shikijs/transformers@3.23.0` (latest 3.x) is the correct pin. 4.0.x exists but aligns with Shiki 4 — `^4.0.0` will NOT match Astro 5.x's Shiki peer and will produce type/runtime mismatches. **Install command: `npm install -D @shikijs/transformers@^3.23.0`** [VERIFIED: npm view @shikijs/transformers@3.21.0 dependencies → `@shikijs/core: 3.21.0, @shikijs/types: 3.21.0`].

2. **github-dark emits NO token classes — only `style="color:#XXXXXX"` inline attributes.** The kickoff research guessed `.shiki .token.keyword` selectors; that is wrong. Concrete inspection (Shiki 3.23 + github-dark, YAML + TypeScript sample) shows bare `<span style="color:#F97583">` for keywords, no class at all. D-03c is correct: `!important` is required. Planner writes attribute selectors like `.prose .shiki span[style*="color:#F97583"]`. Full hex inventory below in Question 3. [VERIFIED: ran `codeToHtml(yaml, { theme: 'github-dark' })` locally].

3. **Regression surface is smaller than D-08 assumes.** D-08b lists 4 posts × 2 locales = 8 screenshots, but only 3 of 4 posts have code fences: `hello-world.md` has ZERO fences (no `<pre>` will render), `2026-02-10-why-i-write-kubernetes-manifests-by-hand.md` has ZERO fences. The real regression surface is `2026-03-02-mcp-servers-plainly-explained.md` (1 no-language ASCII fence) and `2026-03-20-karpenter-right-sizing.mdx` (2 yaml fences). Planner can keep the 8-screenshot gate (empty-fence posts serve as regression anchors against CSS leakage into `.prose` in general), but task estimates should reflect that only 2 posts actually exercise the Shiki config. [VERIFIED: grep ^\`\`\` across all 8 post files].

4. **Speaking pages also use `.prose prose-invert` — scope matters.** `/en/speaking/[...slug].astro` + `/ru/speaking/[...slug].astro` both wrap `<Content />` in `.prose prose-invert`. `CodeCopyEnhancer` runs there too via the same `.prose pre` selector — *if* speaking markdown ever gains code fences in the future. Current speaking content has zero fences (verified). The `.prose .shiki` scope is correct and covers both blog + speaking prose. [VERIFIED: `grep '```' src/content/speaking/` returned nothing].

5. **Astro's `markdown.rehypePlugins` automatically applies to MDX** via `extendMarkdownConfig: true` (default). No need to register `rehypeCodeBadge` separately on the `mdx()` integration call. The rehype plugin runs AFTER Shiki (Shiki is part of Astro's markdown→hast conversion; rehype plugins receive the hast tree post-Shiki), so the `<pre class="shiki github-dark">` will be present when our plugin's visitor walks the tree. [VERIFIED: Context7 `/llmstxt/astro_build_llms-full_txt` on "MDX inherits markdown config"].

**Primary recommendation:** Use vanilla `unist-util-visit` + `hastscript` for the rehype plugin (both already transitively installed — zero new top-level deps). Use attribute selectors (not token classes) for the CSS override. Use `lucide:copy` for the Copy icon. Pin `@shikijs/transformers@^3.23.0` (not `^1.0.0`). Accept that the visual regression gate catches CSS leakage even on fence-less posts — keep the 8-screenshot plan.

---

## Locked Decision Validation

| Decision | Status | Note |
|----------|--------|------|
| **D-01** rehype wraps `<pre>` in `<figure class="code-block">` | IMPLEMENTABLE | `unist-util-visit` + `hastscript` already installed; ~25 LOC plugin. |
| **D-01b** plugin file at project root (`rehype-code-badge.mjs`) | IMPLEMENTABLE | Mirrors `remark-reading-time.mjs` pattern exactly. |
| **D-01c** badge + Copy live inside `<figure class="code-block">` | IMPLEMENTABLE | Requires changing CodeCopyEnhancer's selector from `.prose pre` to `.prose .code-block > pre` AND its wrapper-creation logic (skip wrap creation — figure already exists from rehype step). See Q2. |
| **D-02** both always-visible, toolbar row top-right | IMPLEMENTABLE | Pure CSS — delete `opacity: 0` on `.code-copy-btn`, delete `:hover` opacity rule. |
| **D-02b** touch devices identical | IMPLEMENTABLE | Delete the `@media (hover: none)` override (becomes redundant). |
| **D-03** github-dark + CSS overrides for 6 token types | IMPLEMENTABLE via attribute selectors | Cannot use token classes — see Q3. Strategy: `.prose .shiki span[style*="color:#F97583"] { color: var(--brand-primary) !important; }` × ~10 rules. |
| **D-03b** `.prose pre` bg = `--bg-code`, scope `.prose .shiki` | IMPLEMENTABLE | Override `background-color:#24292e` inline on `<pre class="shiki">` with `!important`. |
| **D-03c** `!important` needed | IMPLEMENTABLE | Confirmed — inline `style=` attributes are the only way Shiki emits colors in single-theme mode. |
| **D-03d** planner inspects emitted HTML, writes selector list | IMPLEMENTABLE | Done in Q3 below — complete token→hex→Deep-Signal map provided. |
| **D-04** highlight = border-left + soft bg on `.highlighted` | IMPLEMENTABLE | `transformerNotationHighlight` adds `.highlighted` class per line + `.has-highlighted` on `<pre>` [VERIFIED: Context7 shiki docs]. |
| **D-04b** `transformerNotationHighlight` (not Meta) | IMPLEMENTABLE | Correct transformer for `// [!code highlight]` comment syntax. |
| **D-05** diff git palette + gutter glyphs | IMPLEMENTABLE | `transformerNotationDiff` adds `.diff.add` / `.diff.remove` + `.has-diff` on `<pre>` [VERIFIED: Context7 shiki docs]. |
| **D-05b** both transformers in same array | IMPLEMENTABLE | `shikiConfig.transformers: [transformerNotationHighlight(), transformerNotationDiff()]`. |
| **D-05c** CSS `::before` glyphs on `.diff.add` / `.diff.remove` | IMPLEMENTABLE | `content: "+"` / `content: "−"` — pure CSS. |
| **D-06** badge visual (JB Mono 0.7rem, muted, uppercase) | IMPLEMENTABLE | No new tokens required — `--font-mono`, `--text-muted`, `--text-primary` all exist in `design-tokens.css`. |
| **D-06b** badge shows language as-emitted | IMPLEMENTABLE | Rehype plugin reads `code.properties.className` → extracts `language-yaml` → strips `language-` → renders `yaml`. |
| **D-07** icon-only default, icon+label on hover | IMPLEMENTABLE | See Q5 for icon recommendation. Requires `astro-icon` `<Icon>` component (already installed). |
| **D-07b** singleton toast in `BaseLayout.astro`, `aria-live="polite"` | IMPLEMENTABLE | See Q6 for precise placement + aria-live visibility constraint. |
| **D-07c** auto-hide on animationend, success-only | IMPLEMENTABLE | ~5 LOC addition to existing `is:inline` script in CodeCopyEnhancer. |
| **D-07d** no keyboard shortcut | — | Not in this phase. |
| **D-07e** preserve a11y | IMPLEMENTABLE | Keep `aria-label`, clipboard + textarea fallback, bilingual labels. |
| **D-08** Playwright diff gate × 8 screenshots | IMPLEMENTABLE but SCOPE NOTE | Only 2 of 4 posts have fences — see Summary #3. Gate still catches CSS leakage so 8-screenshot scope stands. |
| **D-08b** `.prose`-scoped screenshots, 4 posts × 2 locales | IMPLEMENTABLE | Playwright `locator('.prose').screenshot()` pattern. Mirrors existing `pod-lifecycle-parity.spec.ts`. |
| **D-09** pin astro to exact version during phase | IMPLEMENTABLE with VERSION CORRECTION | Current installed version is **5.18.0** (pulled from `^5.17.1`). D-09 says pin to `5.17.1` but 5.18.0 is already in `node_modules`. Planner must choose: downgrade to 5.17.1 (re-lock), OR pin the current 5.18.0. Both acceptable — 5.17.1 and 5.18.0 share `shiki: "^3.21.0"` and have no breaking changes between them. Recommend pinning `5.18.0` (least disruption). See Q8. |

**No decisions are unimplementable.** Two require minor adjustments (D-08 scope note, D-09 version number).

---

## Answers to 8 Focus Questions

### Q1. Shiki transformer API (current as of Astro 5.18.0)

**Package install:** `npm install -D @shikijs/transformers@^3.23.0`

Astro 5.17.1 and 5.18.0 both depend on `shiki: "^3.21.0"`. `@shikijs/transformers` has matching peer deps per-major: v3 pairs with `@shikijs/core: 3.x`, v4 pairs with `@shikijs/core: 4.x`. Installing `^4.0.0` will install a second copy of `@shikijs/core@4.x` alongside Astro's `3.x`, producing a runtime mismatch. **Always align major.** [VERIFIED: `npm view @shikijs/transformers@3.21.0 dependencies` → `{ '@shikijs/core': '3.21.0', '@shikijs/types': '3.21.0' }`]

**astro.config.mjs exact shape:**

```javascript
// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import sitemap from '@astrojs/sitemap';
import mdx from '@astrojs/mdx';
import icon from 'astro-icon';
import { remarkReadingTime } from './remark-reading-time.mjs';
import { rehypeCodeBadge } from './rehype-code-badge.mjs';
import {
  transformerNotationHighlight,
  transformerNotationDiff,
} from '@shikijs/transformers';

export default defineConfig({
  site: 'https://vedmich.dev',
  i18n: { /* unchanged */ },
  markdown: {
    remarkPlugins: [remarkReadingTime],
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
  vite: { plugins: [tailwindcss()] },
  integrations: [mdx(), sitemap(), icon()],
});
```

**Key facts** [CITED: https://docs.astro.build/en/reference/configuration-reference/#markdownshikiconfig, via Context7]:

- `shikiConfig.transformers` was added in `astro@4.11.0` — present and stable in 5.x.
- `shikiConfig.theme` accepts any built-in Shiki theme name (`github-dark` is built-in); for CSS-variable theming there's also `themes: { light, dark }` + `defaultColor: false` (not used here — we override via CSS instead).
- `wrap: true` keeps long lines soft-wrapped (currently inherited by default; locking explicitly for regression safety).

**MDX inheritance:** `extendMarkdownConfig: true` is the default on `@astrojs/mdx` — our `markdown.shikiConfig` and `markdown.rehypePlugins` AUTOMATICALLY apply to `.mdx` files (including `karpenter-right-sizing.mdx`). No separate registration on the `mdx()` integration is needed [CITED: https://docs.astro.build/en/guides/integrations-guide/mdx §"Options inherited from Markdown config"].

**Transformer class output on `<pre>` and lines** [CITED: https://shiki.style/packages/transformers, via Context7]:

| Transformer | Annotation | Class on `<pre>` | Class on line `<span>` |
|-------------|------------|------------------|------------------------|
| `transformerNotationHighlight` | `// [!code highlight]` | `has-highlighted` | `highlighted` |
| `transformerNotationDiff` | `// [!code ++]` | `has-diff` | `diff add` (two classes) |
| `transformerNotationDiff` | `// [!code --]` | `has-diff` | `diff remove` |

These are the classes D-04 / D-05 / D-05c target.

---

### Q2. Rehype-code-badge plugin pattern

**Recommended authoring style:** vanilla `unist-util-visit` + `hastscript`. Both transitively installed via Astro's rehype pipeline — zero new top-level deps. `rehype-pretty-code` would add ~200 KB of code-highlighting logic duplicating Shiki's work and isn't needed for a badge-only concern.

**Minimal working skeleton** (~30 LOC, mirrors `remark-reading-time.mjs` ESM default export pattern):

```javascript
// rehype-code-badge.mjs
// Wraps every <pre class="shiki"> emitted by Shiki in a <figure class="code-block">
// and prepends a <span class="code-lang-badge"> reading the language from the
// inner <code class="language-XXX"> className. Build-time, zero runtime JS.
import { visit } from 'unist-util-visit';
import { h } from 'hastscript';

const LANGUAGE_CLASS_RE = /^language-(.+)$/;

export function rehypeCodeBadge() {
  return function transform(tree) {
    visit(tree, 'element', (node, index, parent) => {
      if (!parent || typeof index !== 'number') return;
      if (node.tagName !== 'pre') return;
      // Astro's Shiki output tags <pre> with class="shiki …"
      const preClasses = node.properties?.className ?? [];
      if (!preClasses.includes('shiki')) return;
      // Already wrapped? (rehype runs once per pass, but belt-and-braces)
      if (parent.type === 'element' && parent.tagName === 'figure'
          && (parent.properties?.className ?? []).includes('code-block')) {
        return;
      }

      // Find <code class="language-yaml"> child to read language
      const codeChild = node.children?.find(
        (c) => c.type === 'element' && c.tagName === 'code'
      );
      const codeClasses = codeChild?.properties?.className ?? [];
      const langClass = codeClasses.find((c) =>
        typeof c === 'string' && LANGUAGE_CLASS_RE.test(c)
      );
      const lang = langClass ? LANGUAGE_CLASS_RE.exec(langClass)[1] : 'text';

      const badge = h('span', { class: 'code-lang-badge', 'aria-hidden': 'true' }, lang);
      const figure = h('figure', { class: 'code-block' }, [badge, node]);

      parent.children[index] = figure;
    });
  };
}
```

**Pipeline ordering — does it affect Shiki's output?**

No. Shiki runs as part of Astro's markdown-to-hast conversion step, BEFORE user-registered rehype plugins execute. By the time `rehypeCodeBadge` runs, `<pre class="shiki github-dark">…</pre>` is already fully rendered in the hast tree. Our plugin operates on the post-Shiki tree and only wraps/decorates — doesn't interfere with Shiki's token emission.

Pipeline order (confirmed via Astro source + docs):
1. Remark plugins (markdown AST) — `remarkReadingTime` runs here
2. Remark → rehype conversion (Astro built-in)
3. Shiki highlighting of `<pre><code>` blocks (Astro built-in)
4. Transformers from `shikiConfig.transformers` (per-block, applied during step 3)
5. User-registered rehype plugins — `rehypeCodeBadge` runs here

**MDX coverage:** Registering on `markdown.rehypePlugins` is sufficient for both `.md` AND `.mdx`. MDX's `extendMarkdownConfig: true` default copies `markdown.*` config into the MDX pipeline. No separate registration needed [CITED: https://docs.astro.build/en/guides/integrations-guide/mdx].

**Potential gotcha:** the `language-XXX` class lives on `<code>`, not `<pre>`. The kickoff research's suggestion that `<pre data-language="..."` exists by default is wrong. Shiki v3 with `github-dark` emits:

```html
<pre class="shiki github-dark" style="background-color:#24292e;color:#e1e4e8" tabindex="0">
  <code>
    <span class="line">...</span>
  </code>
</pre>
```

Note: **no `language-yaml` class on `<code>` either** in vanilla Shiki output. [VERIFIED: ran `codeToHtml` with `lang: 'yaml', theme: 'github-dark'` locally — output has `<pre class="shiki github-dark">` then `<code>` with no class attribute, then per-line `<span class="line">`].

**This is a blocker for the naive plugin.** The language info is stripped before rehype sees the tree. Three workarounds:

**Workaround A — Read from the source markdown `code` hast node (BEFORE Shiki runs):** Add a *remark* plugin that stashes language into a `data-language` attribute on the code node, which survives through Shiki. Pattern:

```javascript
// remark-stash-code-lang.mjs
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

Then `rehypeCodeBadge` reads `pre.properties['data-language']` (hProperties on markdown `code` nodes propagate to the rendered `<pre>` in Astro's remark→rehype pipeline).

**Workaround B — Parse `node.properties.className` after all** — Shiki v3 DOES add `language-XXX` back on `<code>` when `langAlias` or specific options are set. Not reliable cross-version.

**Workaround C — Custom Shiki transformer with `pre(node)` hook that writes `data-language` during Shiki's pass.** Preferred for single-point-of-truth but ties badge logic to `shikiConfig` instead of `rehypePlugins`.

**Researcher recommendation: Workaround A.** Two tiny plugins (remark to stash, rehype to wrap) are cleaner than a transformer that mixes theming with DOM wrapping. ~15 LOC remark + ~25 LOC rehype. Total ~40 LOC of plugin code at project root.

Alternative: **test-spike-first** — before committing to Workaround A, the planner's first task should be a 10-minute empirical test: build the site with *just* a naive `visit` that logs `pre.properties` to console, see what's actually in the tree under Astro 5.18.0 + Shiki 3.21.0. The kickoff-research guessed wrong once; this spike grounds the plugin code in real behavior before writing it.

---

### Q3. Shiki CSS override strategy — validate D-03c

**Validation: D-03c is CONFIRMED.** Shiki v3 with single-theme mode (`theme: 'github-dark'`) emits per-span `style="color:#XXXXXX"` inline attributes. No CSS token classes. `!important` is required to defeat inline styles.

**However, D-03c can be AVOIDED via dual-theme mode** — if Shiki is configured with `themes: { light, dark }` instead of `theme:`, it emits spans with `style="--shiki-light:#xxx;--shiki-dark:#xxx;color:var(--shiki-light)"`. Then CSS can override by redefining `--shiki-dark` — no `!important` needed [CITED: https://shiki.style/guide/dual-themes]. **This is a cleaner path but changes the base Shiki config away from D-03's single-theme spec.** Raising for the planner:

**Option 1 (D-03 as-written):** `theme: 'github-dark'` + `.prose .shiki span[style*="color:#F97583"] { color: var(--brand-primary) !important; }` × ~10 rules. Works. `!important` everywhere.

**Option 2 (cleaner, requires re-opening D-03):** `themes: { dark: 'github-dark', light: 'github-dark' }` + `defaultColor: false` → Shiki emits CSS variables. Override: `.prose .shiki { --shiki-dark: var(--text-primary); } .prose .shiki span[style*="--shiki-dark:#F97583"] { --shiki-dark: var(--brand-primary); }`. No `!important`. BUT still uses attribute selectors for the hex match, so complexity isn't dramatically reduced.

**Option 3 (also cleaner, requires re-opening D-03):** Shiki's built-in `createCssVariablesTheme` — spans emit `style="color:var(--shiki-token-keyword)"`. Override by redefining CSS variables. Loses github-dark's exact palette (the CSS-variables theme is a fresh TextMate mapping, not a port of github-dark). **Not D-03's intent — drops the "github-dark base" half of the locked decision.**

**Researcher recommendation:** Stay with **Option 1 (D-03 as-written)** — the `!important` hack is localized to ~10 CSS rules, scoped to `.prose .shiki`, and keeps the locked decision intact. Option 2 is a viable future refactor if the overrides become fragile across Shiki minor bumps.

**Complete github-dark token color inventory** (extracted from concrete `codeToHtml()` runs against yaml + typescript + bash samples) [VERIFIED: local run 2026-05-03]:

| Shiki-emitted hex | Token semantic | Example Deep Signal mapping per D-03 |
|-------------------|----------------|---------------------------------------|
| `#24292e` | pre background | → `var(--bg-code)` (#0D1117) |
| `#E1E4E8` / `#e1e4e8` | default text / operators / punctuation | → `var(--text-primary)` (#E2E8F0) |
| `#F97583` | keywords (`const`, `function`, `return`, `let`, type ops) | → `var(--brand-primary)` (#14B8A6 teal) |
| `#9ECBFF` | strings / URLs / yaml scalar values | → `var(--brand-accent)` (#F59E0B amber) |
| `#85E89D` | yaml keys / html-tag names / markdown headings | → `var(--brand-primary)` (#14B8A6) — treat as keyword-adjacent |
| `#79B8FF` | type annotations / numbers / imported names | → `var(--brand-primary-hover)` (#2DD4BF) |
| `#6A737D` | comments | → `var(--text-muted)` (#78909C) |
| `#B392F0` | function / method names | → `var(--text-primary)` (#E2E8F0) per D-03 (functions/methods → default) |
| `#FFAB70` | numbers (in some languages e.g. bash), regex literals | → `var(--brand-primary-hover)` (#2DD4BF) per D-03 (numbers/constants) |
| `#FDAEB7` | red-squiggly / invalid highlights | → keep (rare; don't override) |

**Concrete CSS override template** (goes in `global.css` or new `code-blocks.css`):

```css
/* Override Shiki's <pre> inline background. */
.prose pre.shiki {
  background-color: var(--bg-code) !important;
  color: var(--text-primary) !important;
  border: 1px solid var(--border);
}

/* Override github-dark token colors by attribute-selector on inline style. */
.prose .shiki span[style*="color:#E1E4E8"],
.prose .shiki span[style*="color:#e1e4e8"] {
  color: var(--text-primary) !important;
}
.prose .shiki span[style*="color:#F97583"] {
  color: var(--brand-primary) !important;
}
.prose .shiki span[style*="color:#9ECBFF"] {
  color: var(--brand-accent) !important;
}
.prose .shiki span[style*="color:#85E89D"] {
  color: var(--brand-primary) !important;
}
.prose .shiki span[style*="color:#79B8FF"] {
  color: var(--brand-primary-hover) !important;
}
.prose .shiki span[style*="color:#6A737D"] {
  color: var(--text-muted) !important;
}
.prose .shiki span[style*="color:#B392F0"] {
  color: var(--text-primary) !important;
}
.prose .shiki span[style*="color:#FFAB70"] {
  color: var(--brand-primary-hover) !important;
}
```

**Note on case-sensitivity:** CSS attribute selectors are case-sensitive by default. Shiki occasionally emits lowercase hex (`#e1e4e8`) and sometimes uppercase (`#E1E4E8`). Belt-and-braces: write both forms or use the `i` flag (`span[style*="color:#f97583" i]`) — supported in all modern browsers.

**Planner task:** Add a test-spike step (10 min) — build site once, `grep -oE 'color:#[0-9a-fA-F]{6}' dist/en/blog/2026-03-20-karpenter-right-sizing/index.html | sort -u` to confirm the hex inventory. If the live emission differs from the above (e.g. Shiki minor bump changed colors), extend the selector list.

---

### Q4. Regression risk & mitigation

**Confirmation of Pitfall 2:** `shikiConfig` IS global — it applies to every markdown and MDX file that passes through Astro's rendering pipeline. [CITED: https://docs.astro.build/en/reference/configuration-reference/#markdownshikiconfig — "Options for Shiki, our default syntax highlighter"].

**Where code blocks currently render on vedmich.dev** [VERIFIED: grep `^\`\`\`` across content + grep `<pre` across components]:

| Location | Rendering path | Fences present? |
|----------|----------------|------------------|
| `src/content/blog/en/hello-world.md` | Content Collections → Shiki | **0** |
| `src/content/blog/en/2026-02-10-why-i-write-kubernetes-manifests-by-hand.md` | Content Collections → Shiki | **0** |
| `src/content/blog/en/2026-03-02-mcp-servers-plainly-explained.md` | Content Collections → Shiki | **1 (no-lang, ASCII diagram)** |
| `src/content/blog/en/2026-03-20-karpenter-right-sizing.mdx` | Content Collections → Shiki (via MDX) | **2 (yaml)** |
| `src/content/blog/ru/*` (all 4 mirror files) | Same | Same language counts (mirrored) |
| `src/content/speaking/en/*` | Content Collections → Shiki | **0** (verified via grep) |
| `src/content/speaking/ru/*` | Content Collections → Shiki | **0** |
| `src/content/presentations/*` | Content Collections → Shiki | **0** |
| `src/components/Hero.astro` | Inline `<div class="font-mono">` — NOT `<pre>` | N/A |
| All homepage sections | Data-driven HTML, no markdown | N/A |

**Real regression surface:** 2 EN + 2 RU markdown/MDX files have fences = **4 files**. The other 4 post files (2 EN + 2 RU) will still re-render HTML but contain zero `<pre>` elements, so Shiki config change can't directly regress them. They serve as regression anchors for `.prose` CSS leakage only.

**Recommended test surface (respecting D-08b):**

- Keep the 8-screenshot plan (4 posts × 2 locales). Screenshot scope = `.prose` section. Even fenceless posts will catch:
  - Any accidental `.prose` selector breakage from the new CSS
  - Font weight/size changes from the new code-block styles
  - Layout shift from `<figure class="code-block">` wrapper if it ever appears
- **Add one new post fixture during implementation** at `src/content/blog/en/__fixture-syntax-highlighting.md` (draft: true, excluded from sitemap) with:
  - 1 bash fence with `// [!code highlight]`
  - 1 yaml fence with `// [!code ++]` and `// [!code --]`
  - 1 typescript fence mixing highlight + diff
  - 1 dockerfile fence (untransformed baseline)
  
  This fixture exists ONLY to validate transformers under test — it's not a published post. Delete or keep as `draft: true` depending on planner preference.

**Build-pass sanity check:** Before screenshot gate, run `npm run build` — verify still 31 pages in under ~1s. Any Shiki config error surfaces here with a clear stack trace.

**Baseline capture order per D-08:**
1. Wave 0 task: capture baselines from CURRENT `main` (before any Phase 2 changes).
2. Commit baselines to `.planning/phases/02-code-block-upgrades/baselines/*.png` (8 files).
3. Wave 1+ tasks: run each implementation change, re-screenshot, diff. Failure = stop + investigate.

---

### Q5. Icon choice for Copy button (D-07)

**Inspected 8 installed Iconify collections.** Top candidates by visual weight + Deep Signal fit at 14-16px:

| Icon | Style | Width @ 16px | Deep Signal fit | Notes |
|------|-------|--------------|------------------|-------|
| **`lucide:copy`** | 2px stroke, outlined, rounded joins | medium-light | ★★★★★ | Matches Lucide's linear-outline style used elsewhere. Two rounded rects overlap — clear copy semantic. |
| `lucide:clipboard` | 2px stroke, outlined | medium | ★★★★ | Clipboard metaphor. Slightly busier than `copy`. |
| `carbon:copy` | solid filled, thicker | heavy | ★★★ | Solid fill clashes with outlined rest-of-site chrome. |
| `ph:copy` | 1.5px default stroke | lightest | ★★★ | Phosphor default weight is a hair too light next to JB Mono. `ph:copy-bold` is closer but adds visual weight. |
| `carbon:copy-to-clipboard` | outlined, slightly more detail | medium | ★★★★ | Has a checkmark state visible — unnecessary since D-07b uses toast for feedback. |

**Recommendation: `lucide:copy`** (`<Icon name="lucide:copy" width="14" height="14" />`).

Rationale:
- Lucide's 2px stroke weight at 14px renders at ~1.4 visual weight — matches JetBrains Mono 0.7rem capital-height at 11px font-size. The two glyphs will feel "sibling-weight" in the toolbar.
- Purely outlined (no fills) — aligns with the site's existing stroke-based icon language (per-ref Lucide chevrons in the nav).
- The overlapping-rect glyph reads as "copy" at a glance, more than `clipboard` does. Users' muscle memory from macOS / Chrome / VSCode clipboard affordances.
- Inline SVG body is 243 bytes (checked against carbon:copy 249 bytes, ph:copy-bold 380 bytes) — effectively a tie but Lucide slightly wins.

**Usage in Astro (already-installed `astro-icon` component):**

```astro
---
import { Icon } from 'astro-icon/components';
---
<button class="code-copy-btn" aria-label={l.copy}>
  <Icon name="lucide:copy" width="14" height="14" aria-hidden="true" />
  <span class="code-copy-btn-label">{l.copy}</span>
</button>
```

Don't use: `carbon:copy-to-clipboard` (noisier detail), `lucide:clipboard-check` (success state belongs to toast, not icon swap per D-07e discretion — keep the icon static).

---

### Q6. Singleton toast DOM placement (D-07b)

**Recommendation: inject `<div id="code-copy-toast">` directly in `BaseLayout.astro`**, server-rendered once per page. Not via `CodeCopyEnhancer` runtime DOM creation.

**Exact injection point in `BaseLayout.astro`** — insert after `<Footer />`, before the existing `<script>` block (line 74 currently):

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
      // ... existing scroll-animation script
    </script>
```

**Why BaseLayout, not CodeCopyEnhancer:**

1. **`aria-live` polite announcements require the element to be present in DOM at page load**, not created later. Content-mutation events on an element that didn't exist when the AT (assistive tech) scanned the DOM may be ignored by some screen readers. Placing the toast in the SSR'd BaseLayout ensures it's in the initial DOM on every page. [This is a well-established a11y rule: live regions must be discovered by AT during the initial DOM pass; dynamically-created live regions are unreliable — Mozilla, WAI-ARIA Authoring Practices.]
2. **Works cross-page**: `CodeCopyEnhancer` only mounts on blog post pages (`/en/blog/[slug].astro` and `/ru/blog/[slug].astro`). If a toast is ever needed elsewhere (future UI-infra phase, per D-07c's explicit non-goal), the DOM slot already exists.
3. **Hydration-safe**: no race between script execution and toast element existence. CodeCopyEnhancer's `is:inline` script can immediately `document.getElementById('code-copy-toast')` without null-checks / retries.

**CSS hidden-state strategy — CRITICAL:** `aria-live` announcements fire on content changes EVEN IF the element is visually hidden, but ONLY when certain visibility rules hold:

| Hide method | Announces on content change? |
|-------------|------------------------------|
| `display: none` | **NO — removed from AT tree** |
| `visibility: hidden` | **NO — removed from AT tree** |
| `aria-hidden="true"` | **NO — explicitly removed** |
| `opacity: 0` | **YES — still in AT tree** |
| `transform: translate(off-screen)` | **YES — still in AT tree** |
| `clip: rect(0,0,0,0)` (sr-only pattern) | **YES — still in AT tree** |

**Correct hidden-state CSS:**

```css
.code-copy-toast {
  position: fixed;
  top: 1rem;
  right: 1rem;
  padding: 0.75rem 1rem;
  font-family: var(--font-body);
  font-size: 0.9rem;
  color: var(--text-primary);
  background: var(--success);
  border-radius: 6px;
  box-shadow: var(--shadow-md);
  opacity: 0;
  transform: translateY(-8px);
  pointer-events: none;
  z-index: 1000;
  transition: opacity 160ms var(--ease-out), transform 160ms var(--ease-out);
}

.code-copy-toast.is-visible {
  opacity: 1;
  transform: translateY(0);
}

@media (prefers-reduced-motion: reduce) {
  .code-copy-toast { transition: none; }
}
```

- Uses `opacity: 0` (not `display: none`) — aria-live region stays in the AT tree.
- `pointer-events: none` when hidden prevents accidental interaction.
- `transform: translateY(-8px)` → `translateY(0)` slide-in is a soft affordance, disabled under reduced-motion.

**JS update pattern inside CodeCopyEnhancer's `is:inline` script:**

```javascript
const toast = document.getElementById('code-copy-toast');
// ... inside the click handler, after successful copy:
if (toast) {
  toast.textContent = COPIED_MSG;   // "Copied to clipboard" / "Скопировано в буфер"
  toast.classList.add('is-visible');
  clearTimeout(toast.__hideTimer);
  toast.__hideTimer = setTimeout(() => {
    toast.classList.remove('is-visible');
  }, 2000);
}
```

- `textContent` change triggers aria-live announcement.
- `clearTimeout` prevents overlap if user copies two blocks in quick succession (toast stays up for the full 2s of the LAST copy).
- No queue — last-write-wins matches D-07c "singleton, no queue".

**Bilingual labels** — add new data attribute to CodeCopyEnhancer's `<script>` tag and extend the `labels` map:

```typescript
const labels = {
  en: { copy: 'Copy', copied: 'Copied', toastCopied: 'Copied to clipboard' },
  ru: { copy: 'Копировать', copied: 'Скопировано', toastCopied: 'Скопировано в буфер' },
} as const;
```

And pass as `data-toast-copied-label={l.toastCopied}` on the `<script>` tag. Script reads via `script.dataset.toastCopiedLabel`.

---

### Q7. Validation Architecture (Nyquist)

*Per .planning/config.json — workflow.nyquist_validation is not explicitly set, so this section is included.*

#### Test Framework

| Property | Value |
|----------|-------|
| Framework | Playwright `^1.59.1` (installed) + Node's built-in `node --test --experimental-strip-types` for unit tests |
| Config file | `playwright.config.ts` (exists, Phase 1 legacy) + `package.json` scripts (`test`, `test:unit`) |
| Quick run command | `npm run test:unit` (unit tests, ~1s) OR `npm run test -- tests/visual/shiki-regression.spec.ts` (single file, ~10s) |
| Full suite command | `npm run test` (all Playwright specs, ~60-90s) + `npm run test:unit` (unit tests) |

#### Phase Requirements → Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| CODE-01 | Language badge renders (`<figure.code-block>` wraps `<pre>`, `<span.code-lang-badge>` present) | unit (DOM assertion) | `node --experimental-strip-types --test tests/unit/rehype-code-badge.test.ts` | ❌ Wave 0 |
| CODE-01 | Badge shows correct language text (`yaml`, `bash`, etc.) | unit + visual | same unit test + Playwright screenshot | ❌ Wave 0 |
| CODE-02 | `// [!code highlight]` emits `<span class="line highlighted">` + `<pre class="…has-highlighted">` | integration (build artifact inspection) | `npm run build && grep -l 'has-highlighted' dist/en/blog/**/index.html` | ❌ Wave 0 |
| CODE-02 | Highlighted line visually distinguished (border-left + soft bg) | visual | `npx playwright test tests/visual/shiki-regression.spec.ts --grep highlight` | ❌ Wave 0 |
| CODE-03 | `// [!code ++]` emits `<span class="line diff add">` + `<pre class="…has-diff">` | integration | `npm run build && grep -l 'diff add' dist/en/blog/**/index.html` | ❌ Wave 0 |
| CODE-03 | Diff lines show green/red tint + gutter glyphs | visual | `npx playwright test --grep diff` | ❌ Wave 0 |
| CODE-04 | Shiki tokens use Deep Signal colors (attribute-selector override) | visual + manual | Playwright diff on 8 screenshots; manual audit of computed styles in DevTools | ❌ Wave 0 |
| CODE-04 | No `#06B6D4` (deprecated cyan) appears in rendered CSS | grep check | `npm run build && grep -r '06B6D4\\|22D3EE' dist/` (must return nothing) | ❌ Wave 0 |
| CODE-05 | Copy button still works (clipboard API + fallback) on all 4 existing posts | manual | `npm run preview` → visit each post → click Copy → verify clipboard | manual-only |
| CODE-05 | Copy button fires toast announcement (aria-live polite) | Playwright accessibility | `page.getByRole('status').textContent()` after click | ❌ Wave 0 |
| CODE-05 | Bilingual parity — same behavior on `/en/` and `/ru/` blog pages | visual | Playwright diff × 2 locales = 8 screenshots | ❌ Wave 0 |

#### Sampling Rate

- **Per task commit:** `npm run build` (build-pass) + `npm run test:unit` (~1s)
- **Per wave merge:** `npm run test` (full Playwright suite, ~60-90s) + manual audit of `npm run preview` on 1 post per language/locale
- **Phase gate:** Full suite green + 8 screenshot-diffs green + manual audit clean before `/gsd-verify-work`

#### Wave 0 Gaps

- [ ] `tests/unit/rehype-code-badge.test.ts` — unit test for `rehype-code-badge.mjs`, feeds a hast tree, asserts `<figure class="code-block">` wrap + badge text
- [ ] `tests/visual/shiki-regression.spec.ts` — 8 Playwright screenshot tests (4 posts × 2 locales), using same `maxDiffPixels`/`maxDiffPixelRatio` pattern as `pod-lifecycle-parity.spec.ts`
- [ ] `.planning/phases/02-code-block-upgrades/baselines/` — directory with 8 pre-change baseline PNGs
- [ ] `src/content/blog/en/__fixture-syntax-highlighting.md` (optional, draft:true) — fixture post exercising highlight + diff on yaml, bash, typescript, dockerfile for transformer validation
- [ ] No framework install needed (`@playwright/test` + Node test runner already installed)

---

### Q8. Astro 5.17.1 pin + restore (D-09)

**Validation:** Astro 5.17.1 is a real, recently-released version (2026-01-29). [VERIFIED: `npm view astro time` → `'5.17.1': '2026-01-29T15:41:46.731Z'`]. `@shikijs/transformers` v3.x supports it fine (both 5.17.1 and 5.18.0 depend on `shiki: "^3.21.0"`). [VERIFIED: `npm view astro@5.17.1 dependencies | grep shiki`]

**Version drift since D-09 was written:** The project currently has `"astro": "^5.17.1"` in `package.json` and **Astro 5.18.0 is already installed in `node_modules`** (pulled on last `npm install`, released 2026-02-25). Between 5.17.1 → 5.18.0:
- `shiki` peer dep unchanged (`^3.21.0`)
- No breaking transformer API changes (confirmed against Shiki changelog + Astro 5.x changelog — no Shiki-related entries in the 5.18 release notes)
- MDX integration `@astrojs/mdx@4.3.14` unchanged

**Recommended adjustment to D-09:** Pin to `"astro": "5.18.0"` (the version already in `node_modules`) instead of downgrading to `5.17.1`. Rationale:
1. Downgrading means removing `node_modules/` + reinstall — a large, noisy diff for a version that's functionally identical for Phase 2 needs.
2. The spirit of D-09 (Pitfall 5 mitigation) is "don't let an accidental minor bump during implementation surprise us" — that risk is equally prevented by pinning to 5.18.0 as to 5.17.1.
3. Phase 2 will be executed and merged in a ~few-day window; the next minor likely to appear is 5.19.x (if any). Locking 5.18.0 bars that noise.

**Restore step at phase end:** After merge + regression gate passes, restore `"astro": "^5.18.0"` in a separate commit (matches the intent of D-09's "restore `^` post-merge"). If the planner insists on literal D-09 compliance, substitute `5.17.1` everywhere below — the downgrade is safe, just noisier.

**Latest 5.x as of research date:** Astro 5.16.5 was the final 5.x before the 6.0 alpha branch opened. The 5.17 line emerged as a patch-fork (5.17.0 released same day as 5.17.1, both on 2026-01-29). Astro 5.18 / 5.19 continue the 5.x line alongside 6.x alphas. Currently `astro@6.2.1` is latest — a MAJOR version past 5.x, not a candidate for this phase's pin.

**Future-hazards** (6.0 release notes — not in scope, flagged for awareness):
- Astro 6 changed `markdown.syntaxHighlight` default from `'shiki'` to a config object — the `shikiConfig` block stays the same semantically but lives under `markdown.syntaxHighlight.shikiConfig`. Our `markdown.shikiConfig` wiring works on 5.x; a future 6.x upgrade would need a small migration.
- Astro 6 upgraded to `shiki: "^4.0.0"` — transformers would need bump to `@shikijs/transformers@^4.0.0` at that time.
- **None of this affects Phase 2.** Staying on Astro 5.18 for v1.0 milestone is safe.

---

## Recommended task shape

Tasks the planner should create (not actual plan text — a sketch for the planner to decompose into waves):

**Wave 0 — Baselines + test infrastructure**
- Pin `astro` to exact `5.18.0` in `package.json` (drop `^`). Commit. (D-09 adjusted — see Q8.)
- Scaffold `tests/visual/shiki-regression.spec.ts` with 8 test cases (4 posts × 2 locales), `.prose`-scoped screenshots, same `maxDiffPixels: 150, maxDiffPixelRatio: 0.002` thresholds as Phase 1.
- Scaffold `tests/unit/rehype-code-badge.test.ts` with hast-tree fixtures.
- Create `.planning/phases/02-code-block-upgrades/baselines/` directory.
- Run test once on current `main` to capture 8 baseline PNGs. Commit baselines.

**Wave 1 — Shiki transformers (CODE-02, CODE-03)**
- Install `@shikijs/transformers@^3.23.0` as dev dep.
- Add `shikiConfig` block to `astro.config.mjs` with `theme: 'github-dark'`, `wrap: true`, `transformers: [transformerNotationHighlight(), transformerNotationDiff()]`.
- Add fixture post `src/content/blog/en/__fixture-syntax-highlighting.md` (draft:true) with highlight + diff samples on bash, yaml, typescript, dockerfile.
- Build, verify `has-highlighted` + `has-diff` classes appear in dist HTML.
- Run Playwright visual diff — 8 baselines should still pass (transformers add classes but no visual change yet without the CSS step).

**Wave 2 — Rehype plugin for language badge (CODE-01)**
- Empirical spike (10 min): add a temporary `console.log(node.properties)` visitor to inspect what Shiki emits in Astro 5.18.0 under live build. Confirm whether language class lives on `<code>`, on `<pre>` as `data-language`, or nowhere.
- Based on spike: author `rehype-code-badge.mjs` at project root using `unist-util-visit` + `hastscript`. Might pair with `remark-stash-code-lang.mjs` per Workaround A in Q2.
- Register in `astro.config.mjs` `markdown.rehypePlugins`.
- Unit test the plugin with hast-tree fixtures (CODE-01 assertion: `<figure.code-block>` wraps `<pre>`, `<span.code-lang-badge>` present, language text correct).
- Build, verify figure wrapping in dist HTML for all 4 posts with fences.
- Run Playwright visual diff — badges are now visible; baselines must be re-captured as the "post-badge" state OR keep baselines pre-badge and accept the expected diff on the 2 posts with fences.

**Wave 3 — Deep Signal CSS overrides (CODE-04)**
- Decide file split: new `src/styles/code-blocks.css` imported from `global.css` (recommended if CSS grows >100 LOC) vs inline in `global.css` (fine if ~50-80 LOC).
- Write the 10-11 attribute-selector overrides from Q3 table.
- Override `.prose pre.shiki` background/border.
- Style `.code-block` figure container (position: relative; toolbar absolute).
- Style `.code-lang-badge` per D-06 (JB Mono 0.7rem, muted, uppercase, 0.04em tracking).
- Style `.highlighted` line (border-left + `--brand-primary-soft` at 10-12% opacity).
- Style `.diff.add` / `.diff.remove` (git-palette tint + `::before` gutter glyphs).
- Build, diff screenshots — expected to fail the 8-screenshot gate on the 2 fence-bearing posts (new Deep Signal palette ≠ baseline github-dark). Re-capture baselines; commit new baselines as "post-Deep-Signal state"; verify future runs stable.
- Verify no `#06B6D4` / `#22D3EE` leaks via `grep` on dist.

**Wave 4 — Copy button UX + toast (CODE-05, D-07, D-07b)**
- Rewrite `CodeCopyEnhancer.astro`:
  - Replace `.code-wrap` runtime wrapping logic with `.code-block > pre` selector (figure already exists from Wave 2).
  - Change button to icon-only default, icon+label on hover (add `<Icon name="lucide:copy">`).
  - Remove `opacity: 0` default state; both badge + Copy always visible.
  - Remove `@media (hover: none)` rule (redundant).
  - Add toast-integration: `getElementById('code-copy-toast')` + textContent + class toggle.
  - Add bilingual `toastCopied` label to `labels` map.
- Add singleton toast element to `BaseLayout.astro` (after `<Footer>`, before existing `<script>`).
- Add `.code-copy-toast` CSS (fixed top-right, opacity-based show/hide, reduced-motion fallback).
- Build, manual smoke test on `npm run preview`: click Copy on 1 yaml block / 1 bash block / verify toast appears, announces, hides after 2s. Test keyboard: tab to Copy, Enter to activate, screen reader announces.

**Wave 5 — Regression gate + restore pin (CODE-05, D-08, D-09 restore)**
- Re-capture final baselines (8 PNGs reflecting Deep Signal Shiki + badge + new Copy UX).
- Run `npm run test` full suite, confirm 8 screenshot diffs pass.
- Manual visual audit on `npm run preview` for all 4 posts × 2 locales.
- Restore `"astro": "^5.18.0"` in `package.json` (D-09 post-merge step).
- Commit + merge.

**Ballpark:** 5 waves × 1-2 tasks each ≈ 8-11 tasks total. Estimated 4-6h per ROADMAP.md.

---

## Pitfalls & gotchas specific to this implementation

1. **Shiki doesn't emit language class by default** (see Q2). Naive `code.properties.className` read yields nothing. Budget 10 min for the empirical spike before writing the plugin. Fallback: `remark-stash-code-lang.mjs` pattern.

2. **Attribute selectors are case-sensitive.** Shiki inconsistently emits hex in lower vs upper case between versions. Use the `i` flag (`span[style*="#F97583" i]`) or write both cases.

3. **`aria-live` + `display: none` = silent.** The toast MUST be hidden via `opacity: 0` (not `display: none`, not `visibility: hidden`, not `aria-hidden="true"`) to keep the live region announceable (Q6).

4. **MDX extends markdown config only if `extendMarkdownConfig !== false`.** Our `markdown.rehypePlugins` propagates to MDX automatically because we never set `extendMarkdownConfig`. If someone later sets it to `false` on the `mdx()` integration, the rehype plugin stops running for `.mdx` files. Document in the plugin's leading comment.

5. **Baseline re-capture cadence.** After Wave 2 (badge appears) AND after Wave 3 (Deep Signal colors appear), the "before" baselines become stale. Don't try to diff Wave 1 output against post-Wave-3 baselines. Plan explicit baseline re-capture steps. This is why the screenshot gate catches regressions vs. each wave's expected delta, not against a fixed pre-phase state.

6. **`transformerNotationHighlight` behavior on comment-less languages.** Shiki silently skips `// [!code highlight]` on languages that don't support `//` comments (e.g. the default ascii fence in mcp-servers post has no lang → Shiki falls back to plain text, transformers don't trigger). The fixture post must use languages that DO support comments: bash (`#`), yaml (`#`), typescript (`//`), dockerfile (`#`). Yaml + bash use `#` for both syntax-comments AND for `[!code highlight]`? → No, the transformer's annotation is prefix-matched; it looks for the `[!code ...]` literal, not the comment char. Always attach it as `# [!code highlight]` in yaml/bash, `// [!code highlight]` in ts/dockerfile. Verify in the fixture post.

7. **`is-copied` class + toast double-feedback.** Current `CodeCopyEnhancer` keeps the button border tinted for 1.6s on copy. With the new toast, this is redundant. D-07e defers the choice. Researcher recommendation: REMOVE the `is-copied` style path — avoid two concurrent success signals competing for the user's attention (the toast is the canonical confirmation).

8. **`baselines/` directory.** D-08 says screenshots "committed to `.planning/phases/02-code-block-upgrades/baselines/`". PNG binaries in git: 8 files × ~50KB = ~400KB total. Acceptable but be aware LFS isn't configured — if future phases add many more, consider LFS or moving baselines to a separate `testing/baselines/` branch.

9. **Test server boot in Playwright.** `playwright.config.ts` uses `webServer: { command: 'npm run dev' }` which boots Vite dev (HMR). Vite dev processes shiki on-demand; verify the screenshot test hits a "settled" state. Mirror the 300ms `waitForTimeout` pattern from `pod-lifecycle-parity.spec.ts` for font + shiki settle.

10. **Speaking pages + `.prose` scope.** Speaking MD pages also use `.prose prose-invert` (verified). No code fences today, but if one appears, the new `.prose .shiki` overrides will apply there too. Acceptable (speaking prose should look the same as blog prose). Just worth noting in the plugin/CSS comment.

---

## Validation Architecture (Nyquist)

Covered in full under Focus Question 7 above. Summary:

- **Framework:** Playwright + Node test runner (both installed).
- **Commands:** `npm run test:unit` (fast, unit tests), `npm run test` (full, visual + integration).
- **Sampling:** per-commit (build+unit), per-wave (full suite + manual audit), phase-gate (all green).
- **Wave 0 gaps:** 4 test artifacts + 1 fixture post + 8 baseline PNGs (no framework install needed).

---

## Blockers

None. All locked decisions are implementable, with two minor adjustments flagged above:

1. **D-09 version number**: Recommend pinning to `5.18.0` (currently installed) instead of `5.17.1` — functionally identical, avoids a pointless downgrade. Planner may override per strict D-09 wording; either works.
2. **D-08 regression scope clarification**: Only 2 of 4 posts have code fences; the 8-screenshot gate still makes sense (catches CSS leakage on fenceless posts) but the real Shiki-behavior regression surface is 2 posts × 2 locales = 4 screenshots. Documented, not blocking.

---

## RESEARCH COMPLETE

**Phase:** 2 — Code Block Upgrades
**Confidence:** HIGH (stack, package versions, transformer API, rehype pipeline order, icon choice, toast a11y); MEDIUM (exact CSS selector strategy — empirical spike recommended before plugin-author lock-in).

**Key findings:**
- `@shikijs/transformers` version is `^3.23.0`, not `^1.0.0` (kickoff research was stale).
- github-dark emits NO token classes, only `style="color:#XXXXXX"` — CSS overrides require attribute selectors + `!important`.
- `unist-util-visit` + `hastscript` already transitively installed — zero new top-level deps for the rehype plugin.
- Only 2 of 4 blog posts have code fences today; screenshot regression gate still useful for catching general `.prose` CSS leakage.
- Singleton toast MUST be in BaseLayout (aria-live requires DOM-at-load) and hidden via `opacity: 0` (not `display: none`).
- `lucide:copy` is the best icon match for Deep Signal's stroke-based chrome.

**File created:** `.planning/phases/02-code-block-upgrades/02-RESEARCH.md`

**Ready for planning.** Planner has everything needed to decompose into ~8-11 tasks across 5 waves.
