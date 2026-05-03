# Phase 2: Code Block Upgrades - Context

**Gathered:** 2026-05-03
**Status:** Ready for planning

<domain>
## Phase Boundary

Upgrade every prose code block on the site with a language badge (JetBrains Mono caps, top-right), `// [!code highlight]` and `// [!code ++]` / `// [!code --]` transformer support, and a Deep Signal-matched Shiki theme via CSS variable overrides on `github-dark`. Validated by zero visual regressions on the 4 existing blog posts. Also modernize `CodeCopyEnhancer.astro`: always-visible icon-only Copy button that expands to `[icon Copy]` on hover and fires a singleton `aria-live` toast on success.

**Affects:** `astro.config.mjs` (Shiki + rehype config), `src/components/CodeCopyEnhancer.astro` (Copy UX + toast singleton), `src/styles/global.css` or new `src/styles/code-blocks.css` (Shiki CSS overrides + badge + highlight + diff + toast styles), new build-time rehype plugin file (e.g. `rehype-code-badge.mjs`).

**Not in this phase (explicit):**
- Code block line numbers — deferred; not a v1.0 requirement
- Shiki Twoslash runtime — banned (breaks zero-JS budget, per REQUIREMENTS.md)
- Custom Shiki JSON theme file — rejected in favor of CSS variable overrides (CODE-04)
- General-purpose toast infrastructure with queue / variants / manual dismiss — singleton pattern only; full toast system deferred to a future UI-infra phase if multiple consumers appear

</domain>

<decisions>
## Implementation Decisions

### Badge Implementation Path (CODE-01)
- **D-01:** **Build-time rehype plugin** wraps Shiki's emitted `<pre class="shiki">` in `<figure class="code-block"><span class="code-lang-badge">yaml</span><pre>…</pre></figure>`. Zero runtime JS for the badge itself — badge HTML ships in the static build, no FOUC, no client-side DOM scan needed to render it. Plugin reads `code.className` (`language-yaml`, `language-bash`, etc.) emitted by Shiki. Planner/researcher chooses final plugin authoring style (`rehypeCodeBadge` as a rehype plugin vs remark-rehype hybrid) — functional contract is locked.
- **D-01b:** Plugin file location: `rehype-code-badge.mjs` at project root (mirrors existing `remark-reading-time.mjs`). Wired into `astro.config.mjs` via `markdown.rehypePlugins: [rehypeCodeBadge]`.
- **D-01c:** Badge sits INSIDE the new `<figure class="code-block">` wrapper, BEFORE `<pre>`. `CodeCopyEnhancer.astro` continues to inject its Copy button as a sibling of `<pre>` inside the same `.code-block` figure (current `div.code-wrap` pattern is replaced by the new figure container — Copy script targets `.code-block > pre` instead of `.prose pre`). This consolidates the toolbar (badge left + Copy right) into one consistently-positioned row.

### Toolbar Layout (CODE-01 + CODE-05)
- **D-02:** **Both badge and Copy are always visible**, positioned top-right as a toolbar row: `[ YAML ]  [⧉ Copy]`. Badge on the left of the Copy button (both absolute-positioned inside `.code-block`). Kills the hover-only-visible behavior for Copy — discoverability ahead of minimalism.
- **D-02b:** On touch devices (`@media (hover: none)`) — identical behavior (both always visible). Existing `@media (hover: none) { .code-copy-btn { opacity: 1; } }` rule becomes moot but is deleted for cleanliness.

### Syntax Token Colors (CODE-04)
- **D-03:** **`github-dark` as Shiki base theme + Deep Signal CSS variable overrides** scoped to `.prose .shiki`. Mapping:
  - `keywords / declarations / types` → `var(--brand-primary)` (teal #14B8A6)
  - `strings / values` → `var(--brand-accent)` (amber #F59E0B)
  - `comments` → `var(--text-muted)` (#78909C)
  - base/identifiers/operators → `var(--text-primary)` (#E2E8F0)
  - numbers/constants → `var(--brand-primary-hover)` (#2DD4BF — softer teal)
  - functions/methods → `var(--text-primary)` (default)
- **D-03b:** Background `.prose pre` → `var(--bg-code)` (#0D1117), with existing `border: 1px solid var(--border)` preserved. CSS overrides use `:where(.prose .shiki)` or `.prose pre.shiki` for scoping so overrides never leak into non-blog code blocks (Pitfall 11).
- **D-03c:** **Shiki inline styles vs CSS overrides.** Shiki emits `style="color: #…; --shiki-dark: #…"` attributes per span. CSS `!important` is needed on the override rules to defeat Shiki inline styles. Planner verifies this against current Astro 5 Shiki output during research spike.
- **D-03d:** Concrete token-class targeting varies by Shiki version. Planner inspects emitted HTML on 4 existing posts (yaml/bash/typescript/dockerfile samples) and maps Shiki's TextMate scope classes (`.shiki .token-…` / `span[style*="#…"]`) onto Deep Signal overrides. Exact selector list is the planner's call; color targets above are locked.

### Highlight Line Treatment (CODE-02)
- **D-04:** `// [!code highlight]` lines rendered with **`border-left: 2px solid var(--brand-primary)` + `background: var(--brand-primary-soft)` at ~10-12% opacity**. Two-affordance treatment: bordered edge for skimming, bg tint for full-line emphasis. Both live on the `.highlighted` class that `@shikijs/transformers` applies per line.
- **D-04b:** Transformer source: `transformerNotationHighlight` from `@shikijs/transformers` (not `transformerMetaHighlight` — the former handles `// [!code highlight]` comment syntax, which is what CODE-02 requires; the latter handles `{1,3-5}` in the code fence meta string). Validated on bash, yaml, and typescript in manual audit — Shiki silently skips unsupported languages, so this is worth regression-catching before merge.

### Diff Line Treatment (CODE-03)
- **D-05:** `// [!code ++]` → `background: var(--success)` tinted ~15% + `+` glyph in gutter (left padding, green). `// [!code --]` → `background: var(--error)` tinted ~15% + `−` glyph in gutter (red). Standard git/GitHub palette — readers' muscle memory. Uses existing `--success` / `--error` tokens from `design-tokens.css` §Status.
- **D-05b:** Transformer source: `transformerNotationDiff` from `@shikijs/transformers`. Applied alongside `transformerNotationHighlight` in `shikiConfig.transformers` array.
- **D-05c:** Gutter glyph approach: CSS `::before` on `.diff.add` / `.diff.remove` lines (the classes `transformerNotationDiff` applies). Content `content: "+"` / `content: "−"`. No inline HTML injection — pure CSS, inherits all a11y from Shiki's base output.

### Language Badge Visual (CODE-01)
- **D-06:** Badge visual: **`text-muted` color, transparent background**, JetBrains Mono `0.7rem` (~11px), `text-transform: uppercase`, `letter-spacing: 0.04em`, `padding: 0.3rem 0.6rem`, no border. On `.code-block:hover`, badge text animates to `text-primary` (120ms ease). Matches today's Copy button baseline tone so the toolbar feels as one row, not two separate widgets.
- **D-06b:** Badge shows the Shiki-detected language exactly as emitted (`yaml`, `bash`, `ts`, `dockerfile`, `typescript`). No vocabulary normalization in v1 — if `ts` and `typescript` both appear across posts, they render as-is. Planner can add a lookup map in the rehype plugin if user wants consistency later (deferred; out of v1.0).

### Copy Button UX (CODE-05 + user-requested enhancement)
- **D-07:** **Icon-only by default, icon+label on hover.** Copy button default state: clipboard icon only (Iconify name TBD by planner — `carbon:copy` or `lucide:copy` — both in existing 8 `@iconify-json/*` packages from Phase 1; planner picks). On `.code-block:hover`, button expands to `[⧉ Copy]` / `[⧉ Копировать]` with text. Reduces toolbar visual weight at rest while retaining discoverability (button is always visible, text shows on intent).
- **D-07b:** **Singleton toast for copy feedback.** One `<div id="code-copy-toast" aria-live="polite" role="status">` lives in `BaseLayout.astro` (hidden by default). On successful copy, `CodeCopyEnhancer.astro` sets toast text (`"Copied to clipboard"` / `"Скопировано в буфер"` — bilingual via same `labels` map) and toggles `.is-visible` class for ~2s. Fixed position top-right of viewport, `var(--success)` bg + `var(--text-primary)` text, soft slide-in/fade-out via CSS transition. ~30-40 LOC addition, stays within zero-JS philosophy (already `is:inline` script).
- **D-07c:** Toast auto-hides on animationend; no manual dismiss button, no queue, no variants (success only — Copy is the single consumer in v1.0). Intentional scope limit — a general toast system is deferred.
- **D-07d:** Keyboard shortcut NOT added in this phase (the Cmd/Ctrl+Shift+C option was presented but not selected). Keeps Copy UX changes focused on the visible-by-default + toast combo.
- **D-07e:** Preserve all current a11y: `aria-label`, `aria-live` (already present on toast by design), clipboard API + textarea fallback, bilingual labels. Existing `is-copied` class timing (1.6s) can stay or be replaced by the toast — planner's call; both mechanisms can coexist briefly if needed.

### Regression Test Gate (CODE-05)
- **D-08:** **Playwright screenshot diff + manual live audit** before merge. Baseline: capture screenshots of all 4 existing blog posts' code blocks BEFORE Shiki config change (commit the baselines to `.planning/phases/02-code-block-upgrades/baselines/`). After implementation: re-screenshot, diff — delta > tiny threshold fails the gate. Plus manual audit on `npm run preview` checking bash/yaml/typescript/dockerfile code blocks render correctly + Copy works + badge appears + highlight + diff render correctly. Locks in defense against Pitfall 2 (global Shiki config regression).
- **D-08b:** Baseline posts to screenshot: `hello-world.md`, `2026-02-10-why-i-write-kubernetes-manifests-by-hand.md`, `2026-03-02-mcp-servers-plainly-explained.md`, `2026-03-20-karpenter-right-sizing.mdx`. Both locales (8 screenshots total). Screenshots scope: the `.prose` section only, not full page (reduces false-positive diff on unrelated layout changes).

### Astro Version Pinning (Pitfall 5)
- **D-09:** **Pin Astro to exact version** in `package.json` (`"astro": "5.17.1"`) at phase start — remove the `^` caret. After Phase 2 merges cleanly + regression passes, restore `^5.17.1` in a follow-up commit. Prevents Shiki transformer API drift from an accidental minor upgrade during implementation.

### Claude's Discretion
- **Rehype plugin authoring style** (vanilla AST visitor via `unist-util-visit` vs hast helpers vs pre-built `rehype-pretty-code` if it aligns with the CSS-override approach) — researcher picks; functional contract = wrap `<pre>` in `<figure.code-block>` with `<span.code-lang-badge>`.
- **Icon choice for Copy button** — `carbon:copy` vs `lucide:clipboard` vs `lucide:copy`. Planner picks based on visual fit with Deep Signal (all three already in 8 installed Iconify collections from Phase 1).
- **Toast CSS animation curve + duration** — planner picks within constraints: 120-180ms ease-out in, 200-260ms ease-in out, visible ~2s total, `prefers-reduced-motion: reduce` disables transition entirely.
- **Exact Shiki token-class selector list** — planner inspects emitted HTML on 4 existing posts and writes the selector map. Researcher can provide a Context7-sourced reference mapping.
- **Whether to keep the `is-copied` intra-button feedback** alongside the toast, or remove it. Both acceptable; toast is the primary feedback channel.
- **File split for new styles** — inline into `global.css` vs new `src/styles/code-blocks.css` import. Planner picks based on LOC size.

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Phase scope & requirements
- `.planning/ROADMAP.md` §Phase 2 — 5 success criteria (language badge, `[!code highlight]`, diff, Deep Signal theme, CodeCopyEnhancer regression-free)
- `.planning/REQUIREMENTS.md` §Code Block Upgrades — CODE-01, CODE-02, CODE-03, CODE-04, CODE-05 full spec

### Research artifacts (v1.0 kickoff, 2026-05-02)
- `.planning/research/SUMMARY.md` §Critical architectural finding — Shiki config is build-time + markdown-scoped; global change risk
- `.planning/research/ARCHITECTURE.md` §Shiki Integration (Wave 2) — includes concrete `astro.config.mjs` `shikiConfig` example with `transformerMetaHighlight`, CSS override pattern, and the "extend CodeCopyEnhancer" recommendation (Plan supersedes that to the rehype-plugin path per D-01)
- `.planning/research/PITFALLS.md` §Pitfall 2 (global Shiki regression), §Pitfall 5 (Astro version pinning), §Pitfall 8 (language badge as runtime JS — mitigated by D-01), §Pitfall 11 (global Shiki CSS scoping — mitigated by `.prose .shiki` scope in D-03b)
- `.planning/research/FEATURES.md` — feature complexity estimates (badge 30 min, highlight 15 min, Deep Signal overrides 45 min)
- `.planning/research/STACK.md` — Shiki transformer package choice (`@shikijs/transformers`)

### Code references (what to read / what to mirror)
- `src/components/CodeCopyEnhancer.astro` — current Copy button. Structure, bilingual labels map, clipboard API + fallback, aria-live pattern. Target for D-07 / D-07b updates.
- `src/pages/en/blog/[...slug].astro` and `src/pages/ru/blog/[...slug].astro` — blog post layout; `<CodeCopyEnhancer locale="…"/>` is mounted here at article end. Post `.prose` wrapper class name is `prose prose-invert`.
- `src/styles/global.css` §prose / code overrides (currently `prose-pre:bg-surface prose-pre:border prose-pre:border-border`) — needs replacement by Deep Signal-tokenized overrides scoped to `.prose .shiki`.
- `src/styles/design-tokens.css` §Brand / §Text / §Status — canonical tokens referenced in D-03, D-04, D-05.
- `astro.config.mjs` — current `markdown: { remarkPlugins: [remarkReadingTime] }` block. Receives `shikiConfig` + `rehypePlugins: [rehypeCodeBadge]` additions.
- `remark-reading-time.mjs` — local remark-plugin example at project root; mirror its shape (ESM default export + plugin factory pattern) when authoring `rehype-code-badge.mjs`.
- `src/content/blog/en/2026-03-20-karpenter-right-sizing.mdx` — post with the most code blocks (yaml + bash); primary regression target.
- `src/content/blog/en/2026-03-02-mcp-servers-plainly-explained.md` — typescript + bash mix.
- `src/content/blog/en/2026-02-10-why-i-write-kubernetes-manifests-by-hand.md` — yaml-heavy.

### Libraries
- `@shikijs/transformers` — https://shiki.style/packages/transformers — `transformerNotationHighlight` for `// [!code highlight]`, `transformerNotationDiff` for `// [!code ++]` / `// [!code --]`. Version `^1.0.0` per STACK.md.
- `rehype` / `unist-util-visit` — already available via Astro's mdx pipeline; no new top-level deps needed for the badge plugin if authored as a hast visitor.
- `astro-icon` — Phase 1 dep — provides `<Icon name="carbon:copy"/>` for D-07 (copy button icon).

### Project constraints
- `CLAUDE.md` §Deep Signal Design System — no hex literals, tokens only, `.prose` scoping, bilingual i18n parity, zero-JS budget.
- `.planning/PROJECT.md` §Current milestone / §Validated decisions — zero-JS default, tokens-never-hex, build-must-pass.
- `.planning/phases/01-rich-media-primitives/01-CONTEXT.md` — Phase 1 decisions, includes Iconify package list (8 collections) now usable by Copy button (D-07).

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- **`CodeCopyEnhancer.astro`** (121 LOC): DOM-wrapper + clipboard API + bilingual label pattern already proven. Single source for Copy UX; extended (not replaced) for D-07/D-07b. Existing scoped CSS for `.code-wrap` + `.code-copy-btn` is the starting skeleton for the new toolbar + toast styles.
- **`remark-reading-time.mjs`** (project root): Existing local remark plugin. Shape and wiring pattern mirrors the new `rehype-code-badge.mjs` — ESM default export, registered in `astro.config.mjs` `markdown.remarkPlugins` / `rehypePlugins`.
- **`src/styles/design-tokens.css`**: All tokens needed already exist. `--brand-primary`, `--brand-accent`, `--brand-primary-soft`, `--text-primary`, `--text-muted`, `--bg-code`, `--border`, `--success`, `--error`. No new tokens required.
- **8 Iconify collections** (`@iconify-json/{carbon,lucide,ph,solar,logos,streamline-flex,simple-icons,twemoji}`): Installed in Phase 1 as dev deps. `carbon:copy`, `lucide:copy`, `lucide:clipboard` all available for D-07 icon.
- **`src/layouts/BaseLayout.astro`**: Singleton toast DOM injection point (D-07b) — the file already owns `aria-live`-ish concerns (scroll-behavior script, font preload). Toast slot sits after `<slot/>` before closing `</body>`.

### Established Patterns
- **`is:inline` scripts with data-* params for i18n** — `CodeCopyEnhancer.astro` already reads `data-copy-label` / `data-copied-label`. Toast labels follow the same pattern (added via new `data-toast-copied-label` attribute).
- **Scoped `<style is:global>` for DOM-generated content** — `CodeCopyEnhancer.astro` uses this to style `.code-wrap` injected at runtime. New toolbar styles for `.code-block` (server-rendered by rehype plugin) can go in plain global.css OR stay in the component for encapsulation. Planner picks.
- **Bilingual label maps in components** — `const labels = { en: { copy: 'Copy' }, ru: { copy: 'Копировать' } }`. Same map extended for toast copy.
- **`.prose` scoping for all blog-post styles** — enforced site-wide. All new Shiki overrides are `.prose .shiki …` selectors.
- **`is:inline` + `data-*` for one-off page-owned scripts** (vs `client:load` — intentionally never used on this site).

### Integration Points
- `astro.config.mjs` — new `markdown.shikiConfig` block, new `markdown.rehypePlugins: [rehypeCodeBadge]` entry. Must not break existing `markdown.remarkPlugins: [remarkReadingTime]`.
- `BaseLayout.astro` — new `<div id="code-copy-toast" aria-live="polite" role="status">` added once; received by `CodeCopyEnhancer` script.
- `src/pages/{en,ru}/blog/[...slug].astro` — NO change required. `<CodeCopyEnhancer locale="…"/>` mount point stays; internal behavior upgraded.
- `.prose` wrapper on blog pages — already present; rehype plugin output (`<figure class="code-block">`) inherits prose styling automatically.
- The 4 existing blog posts — `hello-world.md`, `2026-02-10-*.md`, `2026-03-02-*.md`, `2026-03-20-*.mdx` — ZERO per-post edits; all upgrades flow from global config.

</code_context>

<specifics>
## Specific Ideas

- User explicitly added "also make it easy to quickly copy code block" to the discussion scope — raised Copy UX from "preserve as-is" to "upgrade". Resulting scope: icon-only-at-rest + label-on-hover + singleton toast (D-07 / D-07b).
- User chose the **Recommended** option on all six gray areas (badge path, toolbar layout, syntax mapping, highlight treatment, diff treatment, badge visual, regression gate). Preferences align with research recommendations: build-time over runtime, always-visible over hover-only for discoverability, git-standard green/red for diff over Deep Signal re-skin (respecting muscle memory for diff semantics).
- Toast is **singleton** by design — user explicitly chose the simple path, rejecting the full toast-manager stack option. This constrains planner: no queue, no manual dismiss, no variants in this phase.
- Playwright screenshot-diff regression gate mirrors Phase 1's PodLifecycle pixel-parity gate — user is familiar with that pattern and accepted it here by name.

</specifics>

<deferred>
## Deferred Ideas

### To a future UI-infra phase (not scheduled in v1.0)
- **Full toast manager system** (queue, `<ToastContainer>`, success/error/info variants, manual dismiss, slide-in animation) — only useful if a 2nd toast consumer appears. Copy feedback is the only consumer in v1.0.
- **Keyboard shortcut Cmd/Ctrl+Shift+C on code block focus** — presented as an option in Copy UX discussion, not selected. Additive ~10 LOC if added later.

### Not in v1.0
- **Code block line numbers** — not a v1.0 requirement. `transformerNotationFocus` / gutter line-numbering is a separate Shiki transformer if added.
- **Custom Shiki JSON theme file** — rejected in favor of CSS variable override approach (CODE-04). Revisit only if CSS overrides become fragile across Shiki version bumps.
- **Shiki Twoslash runtime** — explicitly out of scope per REQUIREMENTS.md (zero-JS budget).
- **Language badge vocabulary normalization** (`ts` → `typescript`, `sh` → `bash`) — punted. If user wants consistency later, add a lookup map in the rehype plugin.

### To Phase 3 (UI Polish)
- **Visual polish pass for code blocks in context of full homepage / blog index** — Phase 2 fixes the blocks themselves; Phase 3 audits their appearance alongside other sections.

</deferred>

---

*Phase: 2-code-block-upgrades*
*Context gathered: 2026-05-03*
