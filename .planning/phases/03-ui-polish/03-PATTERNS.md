# Phase 3: UI Polish — Pattern Map

**Mapped:** 2026-05-03
**Files analyzed:** 13 (2 created / 6 modified / 5 audit-only)
**Analogs found:** 12 / 13 (1 file — `baselines/` + `after/` — are directories; pattern is "Phase 2 visual test fixtures dir" only, no code analog)

> Reference artifact (read-only):
> `/Users/viktor/.claude/skills/viktor-vedmich-design/ui_kits/vedmich-dev/app.jsx` → Card (lines 157-168). Canonical Deep Signal hover pattern — `border-brand-primary` + `box-shadow: 0 0 20px rgba(20,184,166,.15)` + `transition: all 250ms cubic-bezier(0.16, 1, 0.3, 1)`. **No translate-Y.**

---

## File Classification

| New/Modified File | Role | Data Flow | Closest Analog | Match Quality |
|-------------------|------|-----------|----------------|---------------|
| `src/styles/global.css` (MODIFY) | stylesheet (global) | declarative CSS (keyframes + class + media query) | — (self-analog, see §Self Analogs) | self |
| `src/styles/design-tokens.css` (MODIFY) | token source (CSS variables) | declarative CSS (`:root` custom properties) | — (self-analog) | self |
| `src/components/BlogPreview.astro` (MODIFY) | Astro section component + i18n slot | request-response (Content Collections query → grid) | — (self-analog, `Presentations.astro` mirror) | self |
| `src/components/Presentations.astro` (MODIFY) | Astro section component + i18n slot | request-response (Content Collections query → grid) | — (self-analog, `BlogPreview.astro` mirror) | self |
| `src/components/Speaking.astro` (MODIFY) | Astro section component + i18n slot (timeline) | request-response (Content Collections query → year-grouped rows) | — (self-analog, bottom CTA at :64-69 is the candidate canonical style source) | self |
| `CLAUDE.md` (MODIFY) | project docs (root) | declarative markdown | `CLAUDE.md` §Deep Signal Design System (existing "Key constraints" subsection) | self (mirror sibling subsection) |
| `tests/unit/shiki-palette-guard.test.ts` (NEW) | test (unit, node:test) | request-response (`codeToHtml()` → regex assertion on rendered span style) | `tests/unit/rehype-code-badge.test.ts` | exact (both use `node:test` + `node:assert/strict`, run via `npm run test:unit`) |
| `.planning/phases/03-ui-polish/AUDIT.md` (NEW) | phase artifact (markdown table) | storage (audit log) | `.planning/phases/02-code-block-upgrades/02-SUMMARY.md` (table-driven phase record) | role-match (structured phase artifact; no exact AUDIT.md precedent) |
| `.planning/phases/03-ui-polish/baselines/` (NEW dir) | test-fixtures (PNG dir) | storage | `tests/visual/pod-lifecycle-parity.spec.ts-snapshots/` | role-match (PNG baseline dir, but human-review not Playwright-assertion) |
| `.planning/phases/03-ui-polish/after/` (NEW dir) | test-fixtures (PNG dir) | storage | same as baselines/ | role-match |
| `src/components/About.astro` (AUDIT-ONLY, modify if drift) | Astro section component | request-response | — (self-analog) | self |
| `src/components/Podcasts.astro` (AUDIT-ONLY) | Astro section component | request-response | — (self-analog) | self |
| `src/components/Hero.astro` (AUDIT-ONLY) | Astro section component | request-response | — (self-analog) | self |
| `src/components/Book.astro` (AUDIT-ONLY) | Astro section component | request-response | — (self-analog) | self |
| `src/components/Contact.astro` (AUDIT-ONLY) | Astro section component + state machine | event-driven (CTA ↔ form ↔ success) | — (self-analog) | self |
| `src/components/BlogCard.astro` (VERIFY, no change per D-02..D-02e) | Astro card component | request-response | — (self-analog, mirror of `PresentationCard.astro`) | self |
| `src/components/PresentationCard.astro` (VERIFY, no change per D-02..D-02e) | Astro card component | request-response | — (self-analog, mirror of `BlogCard.astro`) | self |

---

## Pattern Assignments

### `src/styles/global.css` (MODIFY — extend `.animate-on-scroll`, add `.animate-on-scroll-stagger` variant, extend `prefers-reduced-motion` block)

**Analog (self, existing class — extend in place):** `src/styles/global.css:109-115` (base `.animate-on-scroll`) + `:113-115` (is-visible trigger) + `:118-124` (`.card-glow`) + `:134-146` (`prefers-reduced-motion`).

**Why this analog:** Phase 3 stagger is a *variant* of the existing single-class `.animate-on-scroll` contract, NOT a replacement. Extends it; does not break back-compat. Every homepage section already uses `.animate-on-scroll` (About, Speaking, Podcasts, Book, Hero) — those stay one-shot fade-ins. The stagger class opts in per-grid.

**Base animate-on-scroll pattern** (lines 97-115 verbatim — to preserve and extend):

```css
/* Scroll-triggered fade-in animation */
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(24px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-on-scroll {
  opacity: 0;
}

.animate-on-scroll.is-visible {
  animation: fadeInUp 0.6s ease-out forwards;
}
```

**Card glow easing contract** (lines 117-124 verbatim — keep structure, inherit `--transition-normal` update from D-02b):

```css
/* Card hover glow — uses teal shadow token */
.card-glow {
  transition: box-shadow var(--transition-normal), border-color var(--transition-normal);
}
.card-glow:hover {
  box-shadow: var(--shadow-glow);
  border-color: var(--brand-primary);
}
```

**Reduced-motion pattern to extend** (lines 132-146 verbatim — the stagger variant inherits this, planner must verify/add guards per D-03e):

```css
/* Respect user's reduced-motion preference (WCAG 2.3.3 / SC 2.2.2).
   Keeps scroll-triggered reveals visible (no fade-up) instead of hiding them. */
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
  .animate-on-scroll {
    opacity: 1;
  }
}
```

**What to mirror for the new `.animate-on-scroll-stagger` rule:**

- Add a NEW rule block, don't edit the base `.animate-on-scroll`. Place it immediately after the base rule (around line 116, before `.card-glow`).
- Use per-child `animation-delay: calc(60ms * (n - 1))` via `:nth-child(n)` to match D-03b (60ms cascade).
- Cap at 10 children via `:nth-child(-n+10)` + a fallback `:nth-child(n+11) { animation-delay: 540ms }` per D-03c — or pick alternative per Claude's Discretion.
- Children must be `.animate-on-scroll` so they inherit `opacity: 0` + IntersectionObserver wiring from BaseLayout.astro:92/108.
- Add guard inside `prefers-reduced-motion` block: `.animate-on-scroll-stagger > .animate-on-scroll { animation-delay: 0 !important; opacity: 1 !important; }` per D-03e.

**Noscript fallback (lines 48-52 of `BaseLayout.astro`) already unhides `.animate-on-scroll` — the stagger variant children are `.animate-on-scroll` so they inherit this. No change in BaseLayout needed.** (D-03f confirms this.)

**Critical constraint — IntersectionObserver contract (lines 87-112 of `BaseLayout.astro`):**

```javascript
// Scroll-triggered animations — skipped when user prefers reduced motion.
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

if (prefersReducedMotion) {
  document.querySelectorAll('.animate-on-scroll').forEach((el) => {
    el.classList.add('is-visible');
  });
} else {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.1 }
  );

  document.querySelectorAll('.animate-on-scroll').forEach((el) => {
    observer.observe(el);
  });
}
```

This observer already handles every `.animate-on-scroll` descendant uniformly. Stagger children get `.is-visible` added when they intersect the viewport independently — the `animation-delay` on each child only affects when the `fadeInUp` 0.6s keyframe starts *after* `is-visible` lands. No JS change needed.

---

### `src/styles/design-tokens.css` (MODIFY — single-line: `--transition-normal` curve)

**Analog (self):** `src/styles/design-tokens.css:234-237` — existing `--transition-*` tokens.

**Current state** (line 234-237):

```css
/* -- Motion -- */
--transition-fast: 150ms ease-out;
--transition-normal: 250ms ease-out;
--transition-slow: 400ms cubic-bezier(0.16, 1, 0.3, 1);
--ease-out: cubic-bezier(0.16, 1, 0.3, 1);
```

**Target state** (D-02b — match reference `app.jsx:162`):

```css
/* -- Motion -- */
--transition-fast: 150ms ease-out;
--transition-normal: 250ms cubic-bezier(0.16, 1, 0.3, 1);  /* expo-out (D-02b) — matches Card component in viktor-vedmich-design */
--transition-slow: 400ms cubic-bezier(0.16, 1, 0.3, 1);
--ease-out: cubic-bezier(0.16, 1, 0.3, 1);
```

**What to mirror:** Preserve `--transition-fast` (150ms ease-out) untouched — D-02b only updates normal. `--ease-out` already matches the new curve; `--transition-normal` could be rewritten as `250ms var(--ease-out)` for DRY, but keep literal expanded form to match `--transition-slow`'s existing style (same line shape).

**Consumer scan (D-02b "scan for unintended consequences"):**
Only ONE production consumer of `var(--transition-normal)` across the entire codebase:

```
src/styles/global.css:119:  transition: box-shadow var(--transition-normal), border-color var(--transition-normal);
```

That's the `.card-glow` rule. Every other hover transition in the codebase uses Tailwind's `transition-colors` / `transition-transform` / `transition-all` (which default to `150ms ease`, NOT the token). So the global token change has a **single on-site impact surface** — `.card-glow` on `BlogCard`, `PresentationCard`, `Podcasts.astro` (both cards), `Book.astro`, `Contact.astro` (social chips). Curve shifts from linear-feeling `ease-out` to fast-start/smooth-settle expo-out. No breakage risk; no per-component override needed.

---

### `src/components/BlogPreview.astro` (MODIFY — add bottom CTA, wrap grid in stagger variant)

**Analog (self, internal pattern mirror):** Top CTA at `src/components/BlogPreview.astro:24-34`.

**Current top CTA shape (verbatim, line 24-34) — mirror for the bottom CTA:**

```astro
<div class="flex items-baseline justify-between gap-6 mb-12 animate-on-scroll">
  <h2 class="font-display text-3xl font-bold">{i.blog.title}</h2>
  {posts.length > 0 && (
    <a
      href={`/${locale}/blog`}
      class="text-sm text-text-muted hover:text-brand-primary transition-colors whitespace-nowrap"
    >
      {i.blog.all_posts} →
    </a>
  )}
</div>
```

**Current grid wrapper (line 36-47) — target of stagger wrap:**

```astro
{posts.length > 0 ? (
  <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
    {posts.map((post) => (
      <BlogCard post={post} locale={locale} />
    ))}
  </div>
) : (
  <p class="text-text-muted animate-on-scroll">
    {locale === 'ru' ? 'Посты появятся скоро...' : 'Posts coming soon...'}
  </p>
)}
```

**What to mirror for the new bottom CTA:**
- Same `i.blog.all_posts` key (D-01b — identical text to top), same `→` arrow, same `/${locale}/blog` href.
- Same class string per D-01c canonical style: `text-sm text-text-muted hover:text-brand-primary transition-colors whitespace-nowrap`.
- Same `posts.length > 0 &&` guard (D-01 Claude's Discretion — empty state hides both CTAs, no orphan "All posts" link under zero cards).
- Wrap in its own `.animate-on-scroll` container so it fades in with its own delay (NOT nested inside the stagger grid). Shape suggestion: `<div class="mt-8 animate-on-scroll">...<a>...</a></div>` — mt-8 matches `Speaking.astro:65` (existing bottom CTA spacing). Planner verifies with screenshot.

**What to mirror for grid stagger wrap (D-03):**
- Add `animate-on-scroll-stagger` class to the grid `<div>` — `<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 animate-on-scroll-stagger">`.
- `BlogCard` already has `animate-on-scroll` (line 25 of `BlogCard.astro`) — cards become the stagger children automatically; no per-card edit needed.
- Keep the `posts.length > 0 ?` conditional intact; empty-state branch has no cards to stagger.

---

### `src/components/Presentations.astro` (MODIFY — add bottom CTA, wrap grid in stagger variant)

**Analog (self, internal pattern mirror):** Top CTA at `src/components/Presentations.astro:26-34`.

**Current top CTA (verbatim, line 26-34) — mirror for the bottom CTA:**

```astro
<div class="flex items-baseline justify-between gap-6 mb-2 animate-on-scroll">
  <h2 class="font-display text-3xl font-bold">{i.presentations.title}</h2>
  <a
    href={`/${locale}/presentations`}
    class="text-sm text-text-muted hover:text-brand-primary transition-colors whitespace-nowrap"
  >
    {i.presentations.all_decks} →
  </a>
</div>
```

**Current grid (line 37-41) — target of stagger wrap:**

```astro
<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
  {homepageDecks.map((deck) => (
    <PresentationCard deck={deck} />
  ))}
</div>
```

**What to mirror for the new bottom CTA:**
- Same `i.presentations.all_decks` key (D-01b), same `→`, same href `/${locale}/presentations`.
- Same canonical class string per D-01c: `text-sm text-text-muted hover:text-brand-primary transition-colors whitespace-nowrap`.
- **No `posts.length > 0` guard needed** — Presentations.astro has no empty-state branch (top CTA renders unconditionally). Bottom CTA matches: unconditional. Alternatively: `{homepageDecks.length > 0 && …}` to future-proof; planner picks.
- Wrapper: `<div class="mt-8 animate-on-scroll">` or `<div class="mt-10 animate-on-scroll">` — match Speaking.astro:65's `mt-10` or BlogPreview's upcoming choice, just be consistent across both new bottom CTAs.

**What to mirror for grid stagger wrap (D-03):**
- Add `animate-on-scroll-stagger` class to the grid `<div>`. `PresentationCard.astro:24` already has `animate-on-scroll` — becomes the stagger child automatically.

---

### `src/components/Speaking.astro` (MODIFY — unify CTA visual style, line 64-69)

**Analog (self, existing bottom CTA at line 64-69):**

```astro
<div class="mt-10 animate-on-scroll">
  <a href={`/${locale}/speaking`} class="font-body text-sm text-brand-primary hover:text-brand-primary-hover transition-colors">
    {i.speaking.all_talks} →
  </a>
</div>
```

**D-01c canonical candidate (from BlogPreview line 29):** `text-sm text-text-muted hover:text-brand-primary transition-colors whitespace-nowrap`.

**Decision required by planner:** Per D-01c, choose ONE canonical "section bottom CTA" class string. Two options on the table:

1. **BlogPreview style (`text-text-muted hover → text-brand-primary`)** — subtle, quiet, matches reference `app.jsx` aesthetic.
2. **Speaking style (`text-brand-primary hover → text-brand-primary-hover`)** — brighter, more assertive.

Per D-01c default recommendation + reference-fidelity discipline from D-02: **use BlogPreview style** as canonical, rewrite Speaking's bottom CTA to match. Change Speaking.astro:66 from `font-body text-sm text-brand-primary hover:text-brand-primary-hover transition-colors` to `text-sm text-text-muted hover:text-brand-primary transition-colors whitespace-nowrap` (drop `font-body` which was redundant — body font inherits at the section root).

**What stays:** `mt-10` spacing class, `<div class="...animate-on-scroll">` wrapper shape, `{i.speaking.all_talks} →` i18n + arrow.

**What changes:** Only the `<a>` class list.

**Also unify vertical spacing:** If planner picks `mt-10` as canonical, BlogPreview + Presentations bottom CTAs should use `mt-10` too (not `mt-8`). Consistent rhythm across all three sections.

---

### `CLAUDE.md` (MODIFY — add "Shiki palette guard pattern" subsection per D-05c)

**Analog (self — mirror existing subsection style):** `CLAUDE.md` §"Deep Signal Design System — LIVE" → "Key constraints" subsection (lines 73-75).

**Existing "Key constraints" subsection shape (verbatim, lines 73-75):**

```markdown
### Key constraints
- **Tailwind 4 `@theme` inlines colors statically** — `.light`/`[data-theme="light"]` override only affects raw CSS rules that use `var(--brand-*)` directly (e.g. `.typing-cursor`, `.card-glow`, `body`). Tailwind utilities like `bg-surface` compile to hex literals and do NOT follow the class toggle. Light mode is therefore intended only for OG/LinkedIn image rendering via dedicated preview templates, not for a user-facing toggle.
- **Never add hardcoded hex** to components — always reference a token. Especially avoid `#06B6D4`/`#22D3EE` (deprecated cyan).
```

**What to mirror — new subsection placement:** Add under §"Deep Signal Design System — LIVE" (after "Key constraints", before "Color Tokens (canonical)" — around current line 76). Use `### Shiki palette guard pattern` as the H3 heading. Keep to bullet-list style, 3-5 bullets max, matching the terseness of "Key constraints".

**Content to include (from D-05c + WR-03 spec):**
- What it is: node:test unit test at `tests/unit/shiki-palette-guard.test.ts`, 8 assertions pinning the github-dark palette hexes that Phase 2 `.prose` span-attribute overrides depend on.
- When to run: before `npm update astro` or any Astro/Shiki bump.
- On failure: test output points to the exact hex selector in `src/styles/global.css` that needs updating. Bump blocked until palette overrides are updated.
- Run command: `npm run test:unit`.

**Do NOT include:** the 8 hexes inline (they live in the test file + in `shiki-palette-guard.md` todo). CLAUDE.md is the pointer, not the canonical list.

---

### `tests/unit/shiki-palette-guard.test.ts` (NEW — 8 assertions pinning github-dark hex colors)

**Analog (exact):** `tests/unit/rehype-code-badge.test.ts`.

**Why this analog:** Same test runner (`node:test` via `node --experimental-strip-types --test`), same assertion library (`node:assert/strict`), same directory (`tests/unit/`), runs in the same `npm run test:unit` script — zero new infrastructure.

**Imports + harness pattern** (lines 1-2 of `tests/unit/rehype-code-badge.test.ts` verbatim):

```typescript
import { test } from 'node:test';
import assert from 'node:assert/strict';
```

**Test structure pattern** (lines 37-52 of `tests/unit/rehype-code-badge.test.ts` — shape to mirror):

```typescript
test('rehypeCodeBadge wraps <pre class="shiki"> in <figure class="code-block">', () => {
  const tree = makeShikiTree({ language: 'yaml' });
  const transform = rehypeCodeBadge();
  transform(tree as any);

  const root = tree.children[0] as any;
  assert.equal(root.tagName, 'figure');
  assert.ok(
    Array.isArray(root.properties.className) &&
      root.properties.className.includes('code-block'),
    'figure must have code-block class',
  );
  // ...
});
```

**What to mirror:**
- `test('descriptive name', async () => { ... })` — one `test()` block per assertion (8 total).
- Async variant required (Shiki `codeToHtml` returns a Promise).
- Assertion style: `assert.match(html, /color:#HEX/i, 'failure-mode hint')` — per the WR-03 spec exactly. The `i` flag handles case variance (Shiki sometimes emits lower-/upper-case hex between versions).
- Each assertion message points the reader to `src/styles/global.css` selectors to update if the test fails.

**What to add (specific to Shiki palette guard — verbatim from `.planning/todos/pending/shiki-palette-guard.md`):**

```typescript
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { codeToHtml } from 'shiki';

// Freeze github-dark palette hexes. If Shiki bumps the theme and one of these
// changes, this test fails fast — forcing us to update src/styles/global.css
// attribute selectors to match the new palette.

test('github-dark keyword color is #F97583', async () => {
  const html = await codeToHtml('const x = 1', { lang: 'ts', theme: 'github-dark' });
  assert.match(html, /color:#F97583/i, 'keyword hex drifted — update global.css');
});

test('github-dark string color is #9ECBFF', async () => {
  const html = await codeToHtml('const x = "hello"', { lang: 'ts', theme: 'github-dark' });
  assert.match(html, /color:#9ECBFF/i, 'string hex drifted — update global.css');
});

// ... 6 more, one per load-bearing hex
```

**8 hexes to assert (from D-05 + global.css:169-192):**

| Hex | Token mapped to | Fixture snippet suggestion |
|---|---|---|
| `#E1E4E8` | `--text-primary` | `const x = 1` (identifier default text) |
| `#F97583` | `--brand-primary` | `const x = 1` (keyword `const`) |
| `#9ECBFF` | `--brand-accent` | `const x = "hello"` (string literal) |
| `#85E89D` | `--brand-primary` | `- item` in markdown OR `key: value` in yaml (yaml key / md list marker) |
| `#79B8FF` | `--brand-primary-hover` | `const x: number = 1` (type `number`) |
| `#6A737D` | `--text-muted` | `// comment` |
| `#B392F0` | `--text-primary` | `function foo() {}` (function name) |
| `#FFAB70` | `--brand-primary-hover` | `echo "$FOO"` in bash (variable) or `/regex/` in JS (regex literal) |

Planner refines each fixture snippet and confirms each hex appears exactly once in the rendered HTML for the chosen snippet. All 8 must currently pass against shiki@3.21.x (D-05b).

**Wiring into npm scripts:** ZERO changes — `package.json:11` already globs `tests/unit/*.test.ts`:

```json
"test:unit": "node --experimental-strip-types --test 'tests/unit/*.test.ts'"
```

**Package dependency:** `shiki` is transitively installed by `astro@^5.18.0` (no new dev-dep needed; `codeToHtml` imports from the installed `shiki` package). If node:test's TS stripper can't resolve `shiki` due to it being a transitive, the planner adds `shiki` to `devDependencies` — a small tweak, allowed.

---

### `.planning/phases/03-ui-polish/AUDIT.md` (NEW — audit findings table)

**Analog (role-match, closest structural analog):** `.planning/phases/02-code-block-upgrades/02-SUMMARY.md` — table-heavy phase artifact with sectioned headers.

**Why this analog:** No prior phase has shipped AUDIT.md, so there's no exact precedent. 02-SUMMARY.md is the closest structurally: markdown tables as the primary record, H2/H3 section headers, prose intro per section, linked-to from phase directory.

**What to mirror:**
- Front matter: `# Phase 3: UI Polish — AUDIT` + metadata block (`**Audited:** 2026-05-XX`, `**Viewports:** 1440×900 (desktop) + 375px (mobile)`, `**Reference:** viktor-vedmich-design/ui_kits/vedmich-dev/app.jsx`).
- H2 per section audited (one each for Hero, About, Podcasts, Speaking, Book, Presentations, Blog; Contact optional per D-04b).
- Under each H2: a 5-column table per D-04d minimum — `| Section | Viewport | Finding | Fix | Status |`. Planner may expand columns (e.g. add `Commit` or `Before / After` screenshot links).
- Status values: `OK` (reference match, no drift) / `FIX <sha>` (fixed in commit, link to commit) / `DEFER` (out of scope for Phase 3, future phase).

**Canonical table shape suggestion:**

```markdown
## About

**Baselines:** [baselines/about-1440.png](baselines/about-1440.png) · [baselines/about-375.png](baselines/about-375.png)

| Section | Viewport | Finding | Fix | Status |
|---------|----------|---------|-----|--------|
| About | 1440 | Reference match — bio + skills grid 1.4fr/1fr aligned | — | OK |
| About | 375 | Skills pills wrap tightly, no baseline shift | — | OK |
```

Add sectioned after-shots only for rows with `FIX` status.

**Per D-04e — atomic commits:** Each row with status `FIX <sha>` is a standalone commit (`fix(03): tighten about.bio leading`). AUDIT.md gets updated in the same commit as the fix (table edit + code edit co-committed).

---

### `.planning/phases/03-ui-polish/baselines/` + `after/` (NEW dirs — 14 baseline screenshots + N after screenshots)

**Analog (role-match, pattern-only not code):** `tests/visual/pod-lifecycle-parity.spec.ts-snapshots/` — Playwright snapshot baseline directory.

**Why this analog is role-match but not exact:** Both are "directory of named PNGs representing a canonical visual state". The difference: Playwright's dir is auto-managed (Playwright diffs against it in CI); Phase 3's is human-review (AUDIT.md table references each PNG; no programmatic diff gate per D-04/D-04d).

**What to mirror:**
- One PNG per (section × viewport) = 7 sections × 2 viewports = 14 baselines per D-04b.
- Optional: only capture `after/` for sections that got fixes. If a section stays `OK`, no after-shot needed (saves 100KB per skipped PNG, keeps repo lean).

**Filename convention (per D-04 Claude's Discretion — planner picks one):**
Two shapes on the table:
1. **Section-qualifier** (flat): `baselines/about-1440.png`, `baselines/about-375.png`, `after/about-1440.png`.
2. **Viewport-first**: `baselines/1440/about.png`, `baselines/375/about.png`.

**Recommended:** Option 1 (flat, one dir per state) — simpler to reference in AUDIT.md tables, easier to grep. Matches `tests/visual/pod-lifecycle-parity.spec.ts-snapshots/` flat-PNG style. Current `baselines/` directory already exists (per `ls` check); empty or pre-populated state unknown to planner — verify contents before adding.

**Capture tooling (D-04c):** `playwright-cli` skill, attach-to-real-Chrome mode (per memory: `attach --extension` + `PLAYWRIGHT_MCP_EXTENSION_TOKEN`). Screenshot live-site `vedmich.dev/en/#<section>` at 1440×900 + `vedmich.dev/en/#<section>` at 375px.

---

### `src/components/BlogCard.astro` + `PresentationCard.astro` (VERIFY — no change expected per D-02..D-02e)

**Analog (self, sibling components — internal mirror):** These two components ARE each other's analog. Shape is nearly identical by design.

**Current relevant state (`BlogCard.astro:23-26` verbatim):**

```astro
<a
  href={href}
  class="group flex flex-col p-6 rounded-xl bg-surface border border-border card-glow animate-on-scroll"
>
```

**Current relevant state (`PresentationCard.astro:20-24` verbatim):**

```astro
<a
  href={deckUrl}
  target="_blank"
  rel="noopener noreferrer"
  class="group flex flex-col p-6 rounded-xl bg-surface border border-border card-glow animate-on-scroll"
>
```

**Title hover affordance (BlogCard.astro:31, PresentationCard.astro:32 — identical):**

```astro
<h3 class="font-display text-lg font-semibold leading-snug mt-0 text-text-primary group-hover:text-brand-primary transition-colors">
```

**What to verify (per D-02..D-02e):**
- `card-glow` class present — ✓ (both have it).
- Border token is `border-border` (=`--border`) — ✓.
- Hover signal = `card-glow` → `border-brand-primary` + `box-shadow: var(--shadow-glow)` (defined in `global.css:121-124`) — ✓ (class is in place; visual verified via `--shadow-glow` = `0 0 20px rgba(20,184,166,0.15)` in design-tokens.css:231, matching reference exactly).
- NO `translate-Y` / `hover:-translate-y-1` — ✓ (neither card has it; reference does not use it per D-02).
- `group-hover:text-brand-primary` on title — ✓ (both have it; D-02d confirms keep).
- After D-02b token curve update, both cards inherit the new expo-out easing via `card-glow` → `var(--transition-normal)`. No per-component change.

**Conclusion:** Phase 3 does NOT edit BlogCard.astro or PresentationCard.astro. Verify-only via screenshots in the audit pass.

---

### AUDIT-ONLY: `About.astro`, `Podcasts.astro`, `Hero.astro`, `Book.astro`, `Contact.astro`

**Scope per D-04:** Read each file, capture before screenshots at 1440 + 375, compare against reference `app.jsx`, log findings in AUDIT.md. **Modify only if drift detected** (hardcoded hex, off-grid padding, misaligned baselines).

**Pattern per file — what to look for:**

| File | Known-good state | Drift to check for |
|------|------------------|--------------------|
| `About.astro` | `py-20 px-6`, `max-w-[1120px]`, bio uses `text-lg leading-[1.7]`, `text-brand-primary` accent — all token-based | `text-[11px]` on "EXPERTISE" label (line 25) is non-standard; check against reference. `rounded-full px-3.5 py-1.5 text-[13px]` pills on line 30 — off-grid but reference-matched. |
| `Podcasts.astro` | `py-20 sm:py-28 bg-surface/30`, `max-w-6xl` (NOT 1120px), `card-glow animate-on-scroll` on both cards | Note: `max-w-6xl` vs `max-w-[1120px]` inconsistency across sections (Hero+BlogPreview+About use `1120px`; Podcasts+Book+Contact use `6xl`=1152px). This is a known 32px delta per section wrapper. Drift? Check reference. |
| `Hero.astro` | Inline `<style>` for `.cursor-blink` + `prefers-reduced-motion` guard; `noise-overlay` applied; authority pills with `bg-surface border-border` | No known drift expected. Verify `grad-hero-flat` background renders correctly. |
| `Book.astro` | Inline `<style>` for `.book-cover` with cubic-bezier transition (`400ms cubic-bezier(0.16, 1, 0.3, 1)`) — already uses reference curve ahead of time | `translateY(-6px)` hover on cover — note D-02 "no translate-Y on cards" decision is for card HOVER, not book cover IMG; this is different. Keep. |
| `Contact.astro` | State machine (cta/form/success), `bg-surface/30`, `max-w-6xl`, social chips use `card-glow` | Social chips at line 29 use `bg-bg-base` (not `bg-surface`); verify reference alignment. |

**Hardcoded hex scan (anti-pattern per CLAUDE.md):** Audit should grep each file for `#` sequences not inside URLs/anchors. Expected-0 matches in v1.0.

---

## Shared Patterns

### i18n Helper — Existing Pattern, Zero New Keys

**Source:** `src/i18n/utils.ts` via `t(locale)` helper.

**Apply to:** Every component that needs user-facing strings. All existing sections do this; Phase 3 adds NO new keys (D-01 decision).

**Keys reused across bottom CTAs (already exist):**
- `i.blog.all_posts` — en: "All posts", ru: "Все посты" (en.json:71, ru.json:71)
- `i.presentations.all_decks` — en: "All decks", ru: "Все доклады" (en.json:66, ru.json:66)
- `i.speaking.all_talks` — en: "All talks", ru: "Все выступления" (en.json:55, ru.json:55)

**Import pattern used by every section (verbatim from BlogPreview.astro:2-11):**

```typescript
import { t, type Locale } from '../i18n/utils';

interface Props {
  locale: Locale;
}

const { locale } = Astro.props;
const i = t(locale);
```

---

### `.animate-on-scroll` + IntersectionObserver Contract

**Source:** `src/styles/global.css:109-115` + `src/layouts/BaseLayout.astro:87-112`.

**Apply to:** Every section root + every staggered child.

**Contract:**
1. Add `animate-on-scroll` class to any element that should fade in on viewport-entry.
2. BaseLayout's IntersectionObserver adds `is-visible` when it intersects (threshold 0.1).
3. CSS rule `.animate-on-scroll.is-visible` plays `fadeInUp 0.6s ease-out forwards`.
4. `prefers-reduced-motion` forces `opacity: 1` (immediately visible, no animation).
5. `<noscript>` in BaseLayout head sets `.animate-on-scroll { opacity: 1 !important; }` — JS-off visitors see content.

**Phase 3 stagger extension contract:**
- Grid container gets `animate-on-scroll-stagger` class.
- Children are already `.animate-on-scroll` (per BlogCard/PresentationCard line 24-25 existing classes).
- New CSS rule `.animate-on-scroll-stagger > .animate-on-scroll:nth-child(n) { animation-delay: calc(60ms * (n - 1)); }` drives cascade.
- Reduced-motion + noscript inheritance is automatic — no extra guards beyond what `prefers-reduced-motion` block already provides (planner adds one explicit guard for stagger: `animation-delay: 0 !important` inside the reduced-motion block per D-03e).

---

### `card-glow` Hover Pattern — Reference-Aligned (D-02..D-02e)

**Source:** `src/styles/global.css:117-124`.

**Apply to:** BlogCard, PresentationCard, Podcasts cards, Book card, Contact social chips, any future surface-tier card.

**Rule (verbatim, line 117-124):**

```css
/* Card hover glow — uses teal shadow token */
.card-glow {
  transition: box-shadow var(--transition-normal), border-color var(--transition-normal);
}
.card-glow:hover {
  box-shadow: var(--shadow-glow);
  border-color: var(--brand-primary);
}
```

**Key constraints per D-02c:** Transition uses explicit prop list (`box-shadow, border-color`), NOT `transition: all`. Reason: `.card-glow:hover` triggers `group-hover:text-brand-primary` on inner title (BlogCard line 31 / PresentationCard line 32) — we want the color change to inherit Tailwind's prose defaults, not be in the explicit transition list.

**Tokens consumed (design-tokens.css):**
- `--transition-normal: 250ms ease-out` → becomes `250ms cubic-bezier(0.16, 1, 0.3, 1)` after D-02b.
- `--shadow-glow: 0 0 20px rgba(20,184,166,0.15)` (line 231).
- `--brand-primary: #14B8A6` (line 78).

**Reference match post-D-02b:** Identical to `app.jsx:162` `transition: 'all 250ms cubic-bezier(0.16,1,0.3,1)'` — EXCEPT we keep prop-list form instead of `all` per D-02c rationale above.

---

### node:test Unit Test Pattern

**Source:** `tests/unit/rehype-code-badge.test.ts`, `tests/unit/vv-registry.test.ts`, `tests/unit/vv-geom.test.ts`, `tests/unit/vv-path.test.ts`.

**Apply to:** Every new unit test in Phase 3 (just the one: `shiki-palette-guard.test.ts`).

**Contract:**
- Location: `tests/unit/*.test.ts`.
- Imports: `import { test } from 'node:test'` + `import assert from 'node:assert/strict'`.
- Test shape: `test('descriptive name', () => { ... })` or `test('...', async () => { ... })` for async.
- No test framework (Jest / Vitest) — pure node runner.
- Run: `npm run test:unit` (globs `tests/unit/*.test.ts`, runs via `node --experimental-strip-types --test`).
- TypeScript: stripped by node's `--experimental-strip-types` flag, no compile step.

---

### Atomic Commit Pattern (D-04e, mirrors Phase 2)

**Source:** git log of Phase 2 — commits like `fix(02): move YAML badge right`, `feat(02): add CodeCopyEnhancer singleton toast`.

**Apply to:** Every audit fix in AUDIT.md with `FIX <sha>` status. Phase 3 convention: `fix(03): <one-line-description>`.

**Examples (projected):**
- `fix(03): update --transition-normal to expo-out per reference`
- `fix(03): add bottom All posts CTA under BlogPreview grid`
- `fix(03): wrap BlogPreview+Presentations grids in stagger variant`
- `fix(03): unify Speaking bottom CTA style with BlogPreview`
- `test(03): add shiki github-dark palette guard`
- `docs(03): note Shiki palette guard pattern in CLAUDE.md`

---

## Self Analogs

Files modified in Phase 3 that have no cross-file analog (the file IS the analog — just extend in place):

| File | Extension point | Technique |
|------|-----------------|-----------|
| `src/styles/global.css` | After line 115, before line 117 | Append new `.animate-on-scroll-stagger > *` rule |
| `src/styles/global.css` | Inside line 134-146 reduced-motion block | Add `.animate-on-scroll-stagger > .animate-on-scroll { animation-delay: 0 !important; opacity: 1 !important; }` |
| `src/styles/design-tokens.css` | Line 235 | Single-line replace: curve value only |
| `src/components/BlogPreview.astro` | Line 41 grid `<div>` class list | Add `animate-on-scroll-stagger` token |
| `src/components/BlogPreview.astro` | After line 46 (after empty-state fallback) | Insert new `<div class="mt-10 animate-on-scroll">...<a>...</a></div>` guarded by `posts.length > 0` |
| `src/components/Presentations.astro` | Line 37 grid `<div>` class list | Add `animate-on-scroll-stagger` token |
| `src/components/Presentations.astro` | After line 41 (after grid) | Insert new bottom CTA `<div>...` |
| `src/components/Speaking.astro` | Line 66 `<a>` class list | Replace with canonical CTA shape |
| `CLAUDE.md` | After line 75 (after "Key constraints") | New H3 `### Shiki palette guard pattern` with 3-5 bullets |

---

## No Analog Found

None. Every Phase 3 file has either a concrete analog (self or sibling) or a role-match that provides structural guidance.

---

## Metadata

**Analog search scope:**
- `src/components/` — all .astro files read for section/card pattern analysis
- `src/styles/` — `global.css` + `design-tokens.css` fully read for token and rule extraction
- `src/layouts/BaseLayout.astro` — fully read for IntersectionObserver + noscript contract
- `src/i18n/en.json` + `ru.json` — grepped for `all_posts`, `all_decks`, `all_talks`, `see_all`
- `tests/unit/` — all .test.ts files listed; `rehype-code-badge.test.ts` + `vv-registry.test.ts` read for node:test pattern
- `package.json` — verified `npm run test:unit` command + shiki presence
- `.planning/todos/pending/shiki-palette-guard.md` — read for WR-03 spec verbatim
- `.planning/phases/02-code-block-upgrades/02-PATTERNS.md` — read first 100 lines for format reference
- `.planning/phases/02-code-block-upgrades/02-SUMMARY.md` — inspected as closest structural analog for AUDIT.md
- Reference artifact `/Users/viktor/.claude/skills/viktor-vedmich-design/ui_kits/vedmich-dev/app.jsx` lines 140-190 — Card component extracted

**Files scanned:** 20 source files + 5 planning artifacts + 1 external reference.

**Pattern extraction date:** 2026-05-03.
