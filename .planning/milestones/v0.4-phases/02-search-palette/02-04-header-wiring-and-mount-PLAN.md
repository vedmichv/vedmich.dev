---
phase: 2
plan: 4
type: execute
wave: 3
depends_on: [3]
files_modified:
  - src/components/Header.astro
  - src/layouts/BaseLayout.astro
autonomous: true
requirements: [REQ-001]
must_haves:
  truths:
    - "Clicking the desktop search pill in Header opens the palette"
    - "Tapping the mobile menu search item opens the palette"
    - "The desktop pill is no longer `disabled`/`tabindex=-1` — it's keyboard-focusable and Enter/Space trigger opens"
    - "`<SearchPalette locale={locale} />` is rendered exactly once per page via BaseLayout"
    - "The `⌘K` kbd hint is hidden at mobile widths (inside mobile-menu) per D-07"
    - "The mobile search hint is a real `<button>` — not a `<span>` — so it's tappable and announced correctly by screen readers"
  artifacts:
    - path: "src/components/Header.astro"
      provides: "Wired desktop search pill + mobile search button that dispatch `vv:search:open`"
      contains: "CustomEvent('vv:search:open')"
    - path: "src/layouts/BaseLayout.astro"
      provides: "Global mount of SearchPalette after <Footer>, before </body>"
      contains: "<SearchPalette locale"
  key_links:
    - from: "src/components/Header.astro (desktop + mobile search buttons)"
      to: "SearchPalette inline script listener for `vv:search:open`"
      via: "document.dispatchEvent(new CustomEvent('vv:search:open'))"
    - from: "src/layouts/BaseLayout.astro"
      to: "src/components/SearchPalette.astro"
      via: "import + <SearchPalette locale={locale} />"
---

# Plan 04: Wire Header triggers + mount SearchPalette in BaseLayout

<objective>
Connect the Phase 1 search pill (desktop + mobile) to the SearchPalette built in Plan 03, and mount the palette once per page via BaseLayout. The desktop pill loses its `disabled` / `tabindex="-1"` placeholder state and gains a click handler that dispatches the `vv:search:open` custom event. The mobile menu's search hint converts from a passive `<span>` to a proper `<button>` with the same handler, and its `⌘K` kbd badge hides at mobile widths (D-07). BaseLayout imports and mounts `<SearchPalette locale={locale} />` after `<Footer>` — once per page, global. After this plan the end-to-end verification in ROADMAP passes. Per D-07 (mobile button + kbd hidden).
</objective>

<tasks>

<task id="4.1" type="execute">
<action>
Modify `src/components/Header.astro`.

**Desktop search pill (currently lines 44-59):**

Remove `disabled` and `tabindex="-1"`, add `id="search-trigger-desktop"`, keep styling intact. The class `cursor-not-allowed` must become `cursor-pointer` (or simply drop that utility — the default button cursor is fine).

Before:
```astro
<li class="hidden lg:block">
  <button
    type="button"
    tabindex="-1"
    disabled
    aria-label={i.nav.search_label}
    class="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-bg-elevated/60 border border-border hover:border-border-strong transition-colors text-sm cursor-not-allowed"
  >
    ...
  </button>
</li>
```

After:
```astro
<li class="hidden lg:block">
  <button
    type="button"
    id="search-trigger-desktop"
    aria-label={i.nav.search_label}
    class="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-bg-elevated/60 border border-border hover:border-border-strong transition-colors text-sm cursor-pointer"
  >
    <svg class="w-3.5 h-3.5 text-brand-primary-hover" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
      <circle cx="11" cy="11" r="7" />
      <path stroke-linecap="round" d="m20 20-3-3" />
    </svg>
    <span class="text-text-muted">{i.nav.search_placeholder}</span>
    <kbd class="px-1.5 py-0.5 text-[11px] font-mono rounded bg-bg-base border border-border text-text-muted">⌘K</kbd>
  </button>
</li>
```

**Mobile menu search hint (currently lines 101-110 — a `<span>`):**

Convert the outer `<span>` to a `<button>` and give it `id="search-trigger-mobile"`. Hide the `⌘K` kbd at mobile widths per D-07 (it's already only visible inside the mobile menu which is `md:hidden`, so the kbd is inherently mobile-only; D-07 says to drop it entirely from the mobile trigger).

Before:
```astro
<li class="pt-3 border-t border-border/50">
  <span class="flex items-center gap-2 text-sm text-text-muted">
    <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
      <circle cx="11" cy="11" r="7" />
      <path stroke-linecap="round" d="m20 20-3-3" />
    </svg>
    {i.nav.search_placeholder}
    <kbd class="ml-auto px-1.5 py-0.5 text-[11px] font-mono rounded bg-bg-base border border-border">⌘K</kbd>
  </span>
</li>
```

After:
```astro
<li class="pt-3 border-t border-border/50">
  <button
    type="button"
    id="search-trigger-mobile"
    aria-label={i.nav.search_label}
    class="w-full flex items-center gap-2 text-sm text-text-muted hover:text-text-primary transition-colors py-1"
  >
    <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
      <circle cx="11" cy="11" r="7" />
      <path stroke-linecap="round" d="m20 20-3-3" />
    </svg>
    <span>{i.nav.search_placeholder}</span>
  </button>
</li>
```

(Note: `⌘K` kbd removed per D-07 — "The ⌘K kbd badge hides at mobile widths (no relevance).")

**Client script (existing `<script>` block at line 128+):**

Append the trigger wiring INSIDE the existing `<script>` block (don't add a second script block — keep things flat). Add at the bottom of the script, before the closing `</script>`:

```js
// Wire search triggers to the SearchPalette component (Plan 03 listens for vv:search:open).
const searchTriggerDesktop = document.getElementById('search-trigger-desktop');
const searchTriggerMobile = document.getElementById('search-trigger-mobile');

const openSearch = () => {
  document.dispatchEvent(new CustomEvent('vv:search:open'));
  // Also collapse the mobile menu if it's the trigger source.
  menu?.classList.add('hidden');
};

searchTriggerDesktop?.addEventListener('click', openSearch);
searchTriggerMobile?.addEventListener('click', openSearch);
```

Notes:
- The existing `menu` variable is already declared at the top of the script (`const menu = document.getElementById('mobile-menu');`) — reuse it, do not re-declare.
- We do not need a separate Esc/shortcut listener here — SearchPalette's client script owns `⌘K`/`Ctrl+K`/`/` globally (D-08).
- Do NOT add a pressed state or `aria-expanded` toggling on the trigger for this phase — defer (Claude's Discretion didn't include it).
- The locale switcher + mobile-menu-btn + scroll-shrink + save-language logic must remain untouched.
</action>
<read_first>
- /Users/viktor/Documents/GitHub/vedmich/vedmich.dev/src/components/Header.astro (full file — the desktop pill is L44-59, mobile hint L101-110, existing `<script>` L128-160)
- /Users/viktor/Documents/GitHub/vedmich/vedmich.dev/.planning/phases/02-search-palette/02-CONTEXT.md (D-07 mobile trigger conversion)
- /Users/viktor/Documents/GitHub/vedmich/vedmich.dev/src/components/SearchPalette.astro (confirm `vv:search:open` is the custom event name from Plan 03)
</read_first>
<acceptance_criteria>
- `rg 'id="search-trigger-desktop"' src/components/Header.astro` matches
- `rg 'id="search-trigger-mobile"' src/components/Header.astro` matches
- `rg 'disabled' src/components/Header.astro` returns ZERO matches (the desktop button no longer has `disabled`)
- `rg 'tabindex="-1"' src/components/Header.astro` returns ZERO matches (removed from desktop pill)
- `rg "CustomEvent\('vv:search:open'\)" src/components/Header.astro` matches
- `rg 'cursor-not-allowed' src/components/Header.astro` returns ZERO matches (replaced)
- `rg '<span class="flex items-center gap-2 text-sm text-text-muted">' src/components/Header.astro` returns ZERO matches (mobile hint is no longer a `<span>`)
- Mobile trigger has NO `⌘K` kbd element: scan the `search-trigger-mobile` block — `rg -A 10 'id="search-trigger-mobile"' src/components/Header.astro | rg "⌘K"` returns zero matches (the `⌘K` kbd remains ONLY on the desktop pill, not on the mobile button)
- `npm run build` exits 0 — Header still compiles, no TS errors, no `<a>`-inside-button, no invalid markup
</acceptance_criteria>
</task>

<task id="4.2" type="execute">
<action>
Modify `src/layouts/BaseLayout.astro` to import and mount `<SearchPalette />` once per page.

**Add the import** in frontmatter (alongside existing Header/Footer imports, line 3):

```astro
import Header from '../components/Header.astro';
import Footer from '../components/Footer.astro';
import SearchPalette from '../components/SearchPalette.astro';
```

**Mount the component** inside `<body>`, AFTER `<Footer locale={locale} />` (line 60) and AFTER the existing `<script>` block (line 62-87), but still BEFORE `</body>`. This placement means:
- Rendered once globally — every page shows the palette.
- Located after `<Footer>` so tab order still hits nav → main → footer → palette trigger (hidden until opened, so practical tab order unaffected).
- Located alongside the scroll-animation script so both live in the global layout concern.

Updated body structure:

```astro
<body class="min-h-screen flex flex-col">
  <Header locale={locale} />
  <main class="flex-1">
    <slot />
  </main>
  <Footer locale={locale} />

  <script>
    // ... existing scroll-animation script untouched ...
  </script>

  <!-- Global search palette (⌘K). Hidden by default; triggered by header buttons or keyboard shortcut. -->
  <SearchPalette locale={locale} />
</body>
```

Notes:
- Do NOT put `<SearchPalette />` inside `<main>` — it's a fixed overlay, not page content. Putting it after `</main>` keeps the DOM tidy.
- `locale` is already declared as a `Props` field on BaseLayout and destructured on line 14 — reuse it.
- Do NOT touch the `<head>` contents, fonts, OG tags, or the Intersection-Observer script.
</action>
<read_first>
- /Users/viktor/Documents/GitHub/vedmich/vedmich.dev/src/layouts/BaseLayout.astro (full file — confirm placement, existing imports, Props type)
- /Users/viktor/Documents/GitHub/vedmich/vedmich.dev/src/components/SearchPalette.astro (verify Props.locale is the only prop)
</read_first>
<acceptance_criteria>
- `rg "import SearchPalette from '../components/SearchPalette.astro'" src/layouts/BaseLayout.astro` matches
- `rg "<SearchPalette locale=\{locale\}" src/layouts/BaseLayout.astro` matches
- The `<SearchPalette />` tag appears exactly once: `rg -c "<SearchPalette" src/layouts/BaseLayout.astro` returns `2` (1 import line + 1 usage) — adjust if `-c` counts lines not matches; alternatively `rg "<SearchPalette" src/layouts/BaseLayout.astro | wc -l` returns 2
- `npm run build` exits 0 — 7 pages still build: `/en/`, `/ru/`, `/en/blog`, `/ru/blog`, (blog post routes), `/sitemap-index.xml`. Every built page includes the palette DOM.
- `rg "search-palette" dist/en/index.html` matches after build (the palette DOM is present in the rendered HTML).
- `rg "search-palette" dist/ru/index.html` matches (palette mounted on both locales).
- The `search-index-data` JSON in `dist/en/index.html` contains at least the 6 presentations: `rg "karpenter-prod" dist/en/index.html` matches (EN index includes the Karpenter slide).
</acceptance_criteria>
</task>

</tasks>

<verification>
End-to-end live verification after push:

1. `npm run build && npm run preview` (or deploy to vedmich.dev).
2. Visit `/en/` → press ⌘K → modal opens centered, input focused, 6 recent items visible (all slides today since no EN blog posts seeded yet). Type `karp` → top result is "Karpenter in production: right-sizing at scale" (score = 100 - 43*0.1 ≈ 95.7, title substring match). ArrowDown moves selection; Enter opens `s.vedmich.dev/karpenter-prod` in a new tab (D-06: slides → `_blank`). Esc closes, focus returns to the search pill.
3. On `/en/`, click the desktop search pill → modal opens (Plan 04 wiring works). Click outside the modal card → closes. Press `/` while body is focused → opens. Focus the input, press `/` → character enters (guard works — D-08 skip-when-inside-input).
4. On `/en/` at 375px width: open mobile menu (hamburger) → see the search button (no `⌘K` kbd per D-07) → tap it → modal opens, mobile menu closes, input focused, iOS keyboard slides up.
5. Visit `/ru/` → repeat step 2. Placeholder reads «Поиск по слайдам, постам, тегам…». All 6 slides render identically (shared index). Russian post search not yet applicable (no RU blog posts yet).
6. Build invariants: `npm run build` shows 7 pages, ≤ 1s build time, zero warnings/errors. `rg "#[0-9a-fA-F]{3,6}" src/components/SearchPalette.astro src/data/search-index.ts src/components/Header.astro` returns ZERO matches (no hardcoded hex in any modified file).

ROADMAP verification mapping: "Press ⌘K → modal opens, type 'karp' → 2 results (Karpenter slides + Karpenter blog), Enter opens URL, Esc closes." In Phase 2, only the Karpenter SLIDES entry exists (blog post ships Phase 8). The mechanism passes when ⌘K opens, `karp` filters to Karpenter matches against the currently-indexed corpus, Enter opens, Esc closes. Full 2-result visual match for "karp" arrives after Phase 8.

Covers **REQ-001 (upgraded — functional search)**: Header pill is now wired, fully keyboard-navigable, and the modal performs the fuzzy match, keyboard nav, and navigation described in the requirement + ROADMAP verification.
</verification>
