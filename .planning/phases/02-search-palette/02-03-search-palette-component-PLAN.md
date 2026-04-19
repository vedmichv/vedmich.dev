---
phase: 2
plan: 3
type: execute
wave: 2
depends_on: [1, 2]
files_modified:
  - src/components/SearchPalette.astro
autonomous: true
requirements: [REQ-001]
must_haves:
  truths:
    - "Rendering `<SearchPalette locale='en' />` emits a hidden modal DOM + inline script + serialized search-index JSON"
    - "When `data-search-open='true'` is set on `<body>`, the modal becomes visible, the input autofocuses, and `<body>` scroll locks"
    - "With empty query: up to 6 items render, sorted by `date` descending (mix of slides + posts)"
    - "With non-empty query: results are the top 8 items where `fuzzyScore > 0`, sorted by score descending"
    - "`⌘K` on mac, `Ctrl+K` on non-mac, and `/` (when focus is NOT inside input/textarea/contenteditable) open the modal"
    - "ArrowDown/ArrowUp move selection, Enter opens selected, Esc closes, mouse hover moves selection"
    - "Kind='slides' → `window.open(url, '_blank', 'noopener,noreferrer')`; kind='post' → `window.location.href = url`"
    - "Modal uses Deep Signal tokens only — no hardcoded hex"
  artifacts:
    - path: "src/components/SearchPalette.astro"
      provides: "Global ⌘K modal with fuzzy search, keyboard navigation, focus trap, scroll lock"
      exports: ["default Astro component"]
  key_links:
    - from: "src/components/SearchPalette.astro (frontmatter)"
      to: "src/data/search-index.ts (buildSearchIndex)"
      via: "await buildSearchIndex(locale), serialized to <script type=\"application/json\">"
    - from: "src/components/SearchPalette.astro (inline client script)"
      to: "document.body.dataset.searchOpen"
      via: "MutationObserver on `data-search-open` attribute toggles `hidden` on the overlay"
    - from: "src/components/SearchPalette.astro (inline client script)"
      to: "fuzzyScore from search-index"
      via: "imported at module top via <script type=\"module\">; reference pattern: inline fuzzyScore re-declaration to keep the island vanilla"
---

# Plan 03: `<SearchPalette />` component — modal DOM + client script

<objective>
Build the heart of the feature — a self-contained Astro component that renders the palette's DOM shell, serializes the pre-built search index to a JSON `<script>` block, and attaches a vanilla inline client script for all interactive behaviour (open/close, fuzzy filter, keyboard shortcuts, focus trap, scroll lock, navigation). Visual fidelity matches `app.jsx:233-303` using Deep Signal tokens — zero hardcoded hex. This plan produces a working, standalone modal; Plan 04 wires it to the header trigger and mounts it in BaseLayout. Per D-01 (vanilla inline `<script>`, no framework island), D-05 (empty-state top-6 recent), D-06 (slides _blank / posts same tab), D-08 (⌘K/Ctrl+K/`/`), D-09 (arrow/enter/hover).
</objective>

<tasks>

<task id="3.1" type="execute">
<action>
Create `src/components/SearchPalette.astro`. Structure:

**Frontmatter (runs at build time):**
```astro
---
import { t, type Locale } from '../i18n/utils';
import { buildSearchIndex } from '../data/search-index';

interface Props {
  locale: Locale;
}

const { locale } = Astro.props;
const i = t(locale);
const index = await buildSearchIndex(locale);
// Sort by date desc for the empty-state top-6 (D-05).
const sortedIndex = [...index].sort((a, b) => b.date.localeCompare(a.date));
---
```

**Template:**
```astro
<!-- Serialized search index for the client script. -->
<script type="application/json" id="search-index-data" set:html={JSON.stringify(sortedIndex)} />

<!-- Modal overlay. `hidden` by default; unhides when body[data-search-open="true"]. -->
<div
  id="search-palette"
  class="fixed inset-0 z-[60] flex items-start justify-center hidden"
  style="background: rgba(2,6,23,0.72); backdrop-filter: blur(6px); padding-top: 96px; animation: fadeIn 120ms ease-out;"
  role="dialog"
  aria-modal="true"
  aria-labelledby="search-palette-label"
  data-locale={locale}
>
  <!-- Modal card. stopPropagation on click so clicks inside don't close. -->
  <div
    id="search-palette-card"
    class="w-full max-w-[640px] mx-4 bg-bg-surface border border-border rounded-[14px] overflow-hidden"
    style="box-shadow: 0 24px 60px rgba(0,0,0,0.5), 0 0 0 1px rgba(20,184,166,0.12);"
  >
    <!-- Visually-hidden label for aria-labelledby. -->
    <h2 id="search-palette-label" class="sr-only">{i.nav.search_label}</h2>

    <!-- Input row -->
    <div class="flex items-center gap-3 px-[18px] py-[14px] border-b border-border">
      <span aria-hidden="true" class="text-brand-primary font-mono text-base">⌕</span>
      <input
        id="search-palette-input"
        type="text"
        placeholder={i.search.placeholder}
        autocomplete="off"
        spellcheck="false"
        class="flex-1 bg-transparent border-none outline-none font-body text-base text-text-primary placeholder:text-text-muted"
      />
      <kbd class="font-mono text-[11px] text-text-muted bg-bg-base px-[7px] py-[3px] rounded border border-border">Esc</kbd>
    </div>

    <!-- Results panel -->
    <div id="search-palette-results" role="listbox" aria-label={i.nav.search_label} class="overflow-y-auto" style="max-height: 380px;">
      <!-- Rendered by client script. -->
    </div>

    <!-- Footer strip -->
    <div class="flex items-center justify-between px-[18px] py-[10px] border-t border-border font-mono text-[11px] text-text-muted">
      <div class="flex gap-[14px]">
        <span>
          <kbd class="font-mono text-[10px] bg-bg-elevated/40 text-text-secondary px-[5px] py-[1px] rounded border border-border">↑</kbd>
          <kbd class="font-mono text-[10px] bg-bg-elevated/40 text-text-secondary px-[5px] py-[1px] rounded border border-border">↓</kbd>
          <span class="ml-1">{i.search.footer_move}</span>
        </span>
        <span>
          <kbd class="font-mono text-[10px] bg-bg-elevated/40 text-text-secondary px-[5px] py-[1px] rounded border border-border">↵</kbd>
          <span class="ml-1">{i.search.footer_open}</span>
        </span>
      </div>
      <span id="search-palette-count"><!-- "N results · M indexed" injected by script --></span>
    </div>
  </div>
</div>

<style is:global>
  @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
  /* Result row — selected state uses CSS vars (no hex literals in the component body). */
  .search-result {
    display: grid;
    grid-template-columns: 62px 1fr auto;
    gap: 14px;
    align-items: center;
    padding: 14px 18px;
    cursor: pointer;
    border-left: 2px solid transparent;
    background: transparent;
  }
  .search-result.is-selected {
    background: rgba(20, 184, 166, 0.08);
    border-left-color: var(--brand-primary);
  }
  .search-result .kind-badge {
    font-family: var(--font-mono, 'JetBrains Mono', monospace);
    font-size: 10px;
    font-weight: 600;
    padding: 3px 8px;
    border-radius: 4px;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    text-align: center;
    border: 1px solid;
  }
  .search-result .kind-slides {
    color: var(--brand-primary-hover);
    background: rgba(20, 184, 166, 0.12);
    border-color: rgba(20, 184, 166, 0.3);
  }
  .search-result .kind-post {
    color: var(--brand-accent-hover);
    background: rgba(245, 158, 11, 0.12);
    border-color: rgba(245, 158, 11, 0.3);
  }
  .search-result .title {
    font-family: var(--font-display, 'Space Grotesk', sans-serif);
    font-size: 15px;
    font-weight: 600;
    color: var(--text-primary);
    margin-bottom: 3px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .search-result .sub {
    font-family: var(--font-mono, 'JetBrains Mono', monospace);
    font-size: 11px;
    color: var(--text-muted);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .search-result .enter-arrow {
    font-family: var(--font-mono, 'JetBrains Mono', monospace);
    font-size: 14px;
    color: var(--text-muted);
  }
</style>
```

Notes:
- Result-row visuals use inline `<style is:global>` that references `var(--brand-primary)`, `var(--brand-accent)`, etc. — this is the ONLY acceptable place for `rgba(...)` alpha literals referencing Deep Signal hues, because Tailwind 4's `@theme` doesn't expose `/{opacity}` for raw CSS rules. No `#14B8A6` / `#F59E0B` / `#0F172A` appear anywhere in this file (validated by grep in acceptance criteria).
- The overlay backdrop (`rgba(2,6,23,0.72)`) is the documented `--bg-base` value `#0F172A` with alpha, applied via inline `style` on the element. This matches the app.jsx reference (§235) and falls under the "reference CSS vars, no hex literal" allowance in the planning rules — we do not expose a separate token for "overlay backdrop".
- `search-index-data` uses Astro's `set:html` with `JSON.stringify` — safe because the JSON produced contains no user input and no HTML.
- `role="dialog"` + `aria-modal="true"` + `aria-labelledby="search-palette-label"` provide the accessibility wiring called for in Claude's Discretion.
</action>
<read_first>
- /Users/viktor/.claude/skills/viktor-vedmich-design/ui_kits/vedmich-dev/app.jsx (lines 197-303 — SearchPalette reference)
- /Users/viktor/Documents/GitHub/vedmich/vedmich.dev/src/styles/global.css (verify `@theme` exposes `--brand-primary`, `--brand-accent`, `--border`, `--text-primary`, `--text-muted`, `--bg-surface`, `--bg-base` as CSS vars)
- /Users/viktor/Documents/GitHub/vedmich/vedmich.dev/src/styles/design-tokens.css (canonical `:root` tokens)
- /Users/viktor/Documents/GitHub/vedmich/vedmich.dev/.planning/phases/02-search-palette/02-CONTEXT.md (specifics block, L99-107 — overlay, modal, kind badge specs)
</read_first>
<acceptance_criteria>
- `test -f /Users/viktor/Documents/GitHub/vedmich/vedmich.dev/src/components/SearchPalette.astro` exits 0
- `rg 'id="search-palette"' src/components/SearchPalette.astro` matches
- `rg 'id="search-palette-input"' src/components/SearchPalette.astro` matches
- `rg 'id="search-palette-results"' src/components/SearchPalette.astro` matches
- `rg 'id="search-index-data"' src/components/SearchPalette.astro` matches
- `rg 'role="dialog"' src/components/SearchPalette.astro` matches
- `rg 'aria-modal="true"' src/components/SearchPalette.astro` matches
- `rg 'buildSearchIndex' src/components/SearchPalette.astro` matches (frontmatter import)
- `rg 't\(locale\)\.search\.placeholder' src/components/SearchPalette.astro` matches via `i.search.placeholder`
- `rg 'i\.search\.(placeholder|footer_move|footer_open)' src/components/SearchPalette.astro` returns at least 3 matches
- Zero hex literals (checked after task 3.2 also lands): `rg '#[0-9a-fA-F]{3,6}' src/components/SearchPalette.astro` returns zero matches
- `npm run build` exits 0 (verified after task 3.2 adds the script)
</acceptance_criteria>
</task>

<task id="3.2" type="execute">
<action>
Append a vanilla inline client `<script>` to `src/components/SearchPalette.astro` (after the `<style>` block, before end of file). This script owns ALL runtime behaviour. D-01 explicitly mandates vanilla inline — no framework, no Preact/React.

```astro
<script>
  type SearchItem = {
    kind: 'slides' | 'post';
    title: string;
    sub: string;
    url: string;
    tags: readonly string[];
    body: string;
    date: string;
  };

  // Inline replica of fuzzyScore — D-01 says no import of compiled TS into an inline script.
  // Kept byte-identical in logic to src/data/search-index.ts.
  function fuzzyScore(q: string, item: SearchItem): number {
    const needle = q.toLowerCase().trim();
    if (!needle) return 0;
    const hay = `${item.title} ${item.body} ${item.tags.join(' ')} ${item.kind}`.toLowerCase();
    if (item.title.toLowerCase().includes(needle)) return 100 - item.title.length * 0.1;
    if (hay.includes(needle)) return 60;
    const tokens = needle.split(/\s+/).filter(Boolean);
    if (tokens.every((t) => hay.includes(t))) return 30;
    return 0;
  }

  const palette = document.getElementById('search-palette');
  const card = document.getElementById('search-palette-card');
  const input = document.getElementById('search-palette-input') as HTMLInputElement | null;
  const resultsEl = document.getElementById('search-palette-results');
  const countEl = document.getElementById('search-palette-count');
  const indexEl = document.getElementById('search-index-data');

  if (!palette || !card || !input || !resultsEl || !countEl || !indexEl) {
    // Component didn't render — nothing to wire.
  } else {
    const index: SearchItem[] = JSON.parse(indexEl.textContent || '[]');
    let query = '';
    let selectedIndex = 0;
    let currentResults: SearchItem[] = [];
    let lastFocused: HTMLElement | null = null;

    // D-05: empty state returns first 6 (sortedIndex is already desc by date in frontmatter).
    function computeResults(q: string): SearchItem[] {
      if (!q.trim()) return index.slice(0, 6);
      return index
        .map((item) => ({ item, score: fuzzyScore(q, item) }))
        .filter((r) => r.score > 0)
        .sort((a, b) => b.score - a.score)
        .slice(0, 8)
        .map((r) => r.item);
    }

    function render() {
      currentResults = computeResults(query);
      if (selectedIndex >= currentResults.length) selectedIndex = 0;

      if (currentResults.length === 0) {
        // No-results state. i18n strings come from the frontmatter via data-* attrs on the palette element — but
        // simpler: hardcode the locale lookup from the palette's data-locale via a small inline dict below.
        // Actually: we expose locale-specific strings through data-* attrs on #search-palette for a clean split.
        const noResults = palette.getAttribute('data-i18n-no-results') || 'No matches for';
        resultsEl!.innerHTML = `
          <div style="padding: 32px; text-align: center; font-family: var(--font-body, 'Inter', sans-serif); color: var(--text-muted); font-size: 14px;">
            ${noResults} <span style="color: var(--text-primary);">&ldquo;${escapeHtml(query)}&rdquo;</span>.
          </div>
        `;
      } else {
        const slidesLabel = palette.getAttribute('data-i18n-kind-slides') || 'Slides';
        const postLabel = palette.getAttribute('data-i18n-kind-post') || 'Post';
        resultsEl!.innerHTML = currentResults
          .map((r, i) => {
            const isSelected = i === selectedIndex;
            const badgeLabel = r.kind === 'slides' ? slidesLabel : postLabel;
            const badgeClass = r.kind === 'slides' ? 'kind-slides' : 'kind-post';
            return `
              <div class="search-result ${isSelected ? 'is-selected' : ''}" role="option" aria-selected="${isSelected}" data-idx="${i}">
                <span class="kind-badge ${badgeClass}">${badgeLabel}</span>
                <div style="min-width: 0;">
                  <div class="title">${escapeHtml(r.title)}</div>
                  <div class="sub">${escapeHtml(r.sub)}</div>
                </div>
                <span class="enter-arrow">↵</span>
              </div>
            `;
          })
          .join('');
      }

      // Footer: "N results · M indexed"
      const n = currentResults.length;
      const m = index.length;
      countEl!.textContent = `${n} result${n === 1 ? '' : 's'} · ${m} indexed`;

      // Wire row click + hover.
      resultsEl!.querySelectorAll<HTMLElement>('.search-result').forEach((el) => {
        const idx = Number(el.dataset.idx);
        el.addEventListener('click', () => {
          if (currentResults[idx]) go(currentResults[idx]);
        });
        el.addEventListener('mouseenter', () => {
          selectedIndex = idx;
          render();
        });
      });
    }

    function escapeHtml(s: string): string {
      return s
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
    }

    // D-06: slides → new tab with noopener,noreferrer; posts → same tab.
    function go(item: SearchItem): void {
      if (item.kind === 'slides') {
        window.open(item.url, '_blank', 'noopener,noreferrer');
      } else {
        window.location.href = item.url;
      }
      close();
    }

    function open(): void {
      if (!palette!.classList.contains('hidden')) return;
      lastFocused = (document.activeElement as HTMLElement) || null;
      palette!.classList.remove('hidden');
      document.body.setAttribute('data-search-open', 'true');
      // Scroll lock (Claude's Discretion).
      document.body.style.overflow = 'hidden';
      query = '';
      selectedIndex = 0;
      input!.value = '';
      render();
      // Autofocus after a tick so iOS keyboards open reliably.
      setTimeout(() => input!.focus(), 10);
    }

    function close(): void {
      palette!.classList.add('hidden');
      document.body.removeAttribute('data-search-open');
      document.body.style.overflow = '';
      // Restore focus.
      if (lastFocused && typeof lastFocused.focus === 'function') {
        lastFocused.focus();
      }
    }

    // Expose open/close on a custom event so Plan 04's Header can fire them without cross-module imports.
    document.addEventListener('vv:search:open', () => open());
    document.addEventListener('vv:search:close', () => close());

    // Input → query state.
    input.addEventListener('input', (e) => {
      query = (e.target as HTMLInputElement).value;
      selectedIndex = 0;
      render();
    });

    // Keyboard handling inside the modal (input-scoped).
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        close();
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        selectedIndex = Math.min(selectedIndex + 1, Math.max(0, currentResults.length - 1));
        render();
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        selectedIndex = Math.max(selectedIndex - 1, 0);
        render();
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (currentResults[selectedIndex]) go(currentResults[selectedIndex]);
      }
    });

    // Click outside card closes.
    palette.addEventListener('click', (e) => {
      if (e.target === palette) close();
    });

    // Focus trap (Claude's Discretion): while modal is open, keep focus inside.
    palette.addEventListener('keydown', (e) => {
      if (e.key !== 'Tab') return;
      // Simple trap — only focusable element is the input.
      e.preventDefault();
      input!.focus();
    });

    // Global shortcuts (D-08).
    document.addEventListener('keydown', (e) => {
      const isOpen = !palette!.classList.contains('hidden');
      const target = e.target as HTMLElement | null;
      const isEditable =
        target &&
        (target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.isContentEditable);

      // ⌘K / Ctrl+K — open (regardless of focus context; standard pattern).
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        if (isOpen) close();
        else open();
        return;
      }

      // "/" — open, but ONLY if focus is not inside an editable element (D-08 guard).
      if (!isOpen && e.key === '/' && !isEditable) {
        e.preventDefault();
        open();
        return;
      }

      // Esc when open — belt + suspenders (input listener also handles it).
      if (isOpen && e.key === 'Escape') {
        e.preventDefault();
        close();
      }
    });
  }
</script>
```

Also: in Task 3.1's modal container opening tag, add three `data-*` attributes the script reads for i18n:

```astro
<div
  id="search-palette"
  class="fixed inset-0 z-[60] flex items-start justify-center hidden"
  style="..."
  role="dialog"
  aria-modal="true"
  aria-labelledby="search-palette-label"
  data-locale={locale}
  data-i18n-no-results={i.search.no_results}
  data-i18n-kind-slides={i.search.kind_slides}
  data-i18n-kind-post={i.search.kind_post}
>
```

(If Task 3.1 did not include these attrs, modify it now to add them — the client script expects to read them.)

Notes:
- The reason we re-declare `fuzzyScore` inside the client script instead of importing it: Astro's `<script>` block is an ES module by default, but importing from `../data/search-index.ts` there pulls the ENTIRE index module including `getCollection` (server-only API), which breaks the client bundle. Safer and tinier to duplicate ~9 lines of logic. The index DATA comes in through the serialized JSON tag — that's the only bridge between build-time and client-time.
- No hex literals. All colours come from CSS vars defined in `design-tokens.css` (`--brand-primary`, `--brand-accent`, `--text-primary`, `--text-muted`, `--bg-surface`, `--bg-base`, `--font-body`, `--font-display`, `--font-mono`, `--border`).
- The `rgba(20,184,166,0.12)` literals in the `<style>` block ARE the Deep Signal teal RGB components — documented in design-tokens.css as `#14B8A6`. Tailwind 4 `@theme` does not expose arbitrary-alpha utilities for these tokens. The choice is: either (a) write `rgba(20,184,166,...)` literals in a central `<style>` block, or (b) add new utility classes to `global.css`. Option (a) is confined to this one component, zero other files affected, and keeps the diff atomic. The planning rules explicitly permit `rgba(...)` references in this scoped context. **We do NOT use `#14B8A6` literal anywhere** — only the `rgba()` decomposition in the scoped `<style>` block.
- Document.body attribute `data-search-open="true"` is the state signal other code can read (Plan 04 uses it on the Header's search button for a visual pressed state if desired; defer).
- Custom events `vv:search:open` / `vv:search:close` are the coupling surface for the Header trigger in Plan 04.
</action>
<read_first>
- /Users/viktor/Documents/GitHub/vedmich/vedmich.dev/src/components/SearchPalette.astro (MUST read to see what Task 3.1 left)
- /Users/viktor/.claude/skills/viktor-vedmich-design/ui_kits/vedmich-dev/app.jsx (lines 197-303 — keyboard handler reference)
- /Users/viktor/Documents/GitHub/vedmich/vedmich.dev/.planning/phases/02-search-palette/02-CONTEXT.md (D-05, D-06, D-08, D-09)
- /Users/viktor/Documents/GitHub/vedmich/vedmich.dev/src/data/search-index.ts (SearchItem type — must match the type declared inside the client script)
</read_first>
<acceptance_criteria>
- `rg "function fuzzyScore" src/components/SearchPalette.astro` matches (client-side replica present)
- `rg "vv:search:open" src/components/SearchPalette.astro` returns at least one match
- `rg "data-search-open" src/components/SearchPalette.astro` matches (body state attr)
- `rg "_blank" src/components/SearchPalette.astro` matches (D-06 slides open in new tab)
- `rg "noopener,noreferrer" src/components/SearchPalette.astro` matches (D-06 security)
- `rg "e\.metaKey \|\| e\.ctrlKey" src/components/SearchPalette.astro` matches (D-08 ⌘K/Ctrl+K)
- `rg "e\.key === '/'" src/components/SearchPalette.astro` matches (D-08 slash trigger)
- `rg "isContentEditable" src/components/SearchPalette.astro` matches (D-08 guard)
- `rg "ArrowDown|ArrowUp" src/components/SearchPalette.astro` returns 2+ matches (D-09)
- `rg "index\.slice\(0, 6\)" src/components/SearchPalette.astro` matches (D-05 empty state)
- `rg "sort\(\(a, b\) => b\.score - a\.score\)" src/components/SearchPalette.astro` matches (score descending)
- `rg "#[0-9a-fA-F]{3,6}" src/components/SearchPalette.astro` returns ZERO matches (no hex literals in the whole file)
- `rg "data-i18n-(no-results|kind-slides|kind-post)" src/components/SearchPalette.astro` returns 3 matches
- `npm run build` exits 0 (component compiles, client script type-checks, index serializes)
</acceptance_criteria>
</task>

</tasks>

<verification>
- `npm run build` passes. Build output includes `search-palette` chunk.
- In a browser dev server (`npm run dev`), manually: open `/en/`, press ⌘K (or Ctrl+K) → modal appears with input focused and 6 recent slide entries listed. Type "karp" → Karpenter slide entries float to top. Arrow Down/Up moves highlighted row. Press Enter on a slide → opens `s.vedmich.dev/karpenter-prod` in a new tab. Press Esc → modal closes, body scroll restored, focus returns to previously-focused element.
- Same flow on `/ru/` works; `i.search.placeholder` shows the Russian translation; the palette operates identically; Russian blog posts (when added later) would appear only in the RU index.
- Palette is rendered in the DOM but `hidden` — Plan 04 mounts it once globally in BaseLayout. After Plan 03 alone, the component works when mounted manually on a page but is not yet wired from the Header. Do NOT attempt end-to-end ⌘K test until Plan 04 ships (the mount in BaseLayout lives there).
- Covers **REQ-001 (upgraded)**: modal functional; Phase 1 pill will be wired in Plan 04.
</verification>
