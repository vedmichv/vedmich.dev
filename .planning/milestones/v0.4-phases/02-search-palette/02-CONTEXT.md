# Phase 2: Search palette — Context

**Gathered:** 2026-04-19
**Status:** Ready for planning

<domain>
## Phase Boundary

Deliver a working ⌘K command palette for vedmich.dev — keyboard-driven modal overlay with fuzzy search over presentations (slides) and blog posts, wired to the existing search pill in the header. The Phase 1 placeholder pill becomes functional; no visual redesign beyond the modal itself. RU and EN locales each get their own index. Out of scope: indexing speaking talks, book chapters, Obsidian vault content, or adding analytics.

</domain>

<decisions>
## Implementation Decisions

### JS approach
- **D-01:** Use vanilla inline `<script>` in `SearchPalette.astro`. No Preact/React island, no framework dependency. Astro renders the modal DOM with `hidden` attribute; the script toggles visibility, manages the input/results state, and handles keyboard events. Rationale: project has zero framework islands today (Header uses vanilla `<script>`) and this keeps the pattern consistent, ships ~3–4 KB, no `@astrojs/preact` install needed.

### Index source & locale split
- **D-02:** Per-locale index — `buildSearchIndex(locale)` in `src/data/search-index.ts` returns blog posts for that locale plus all presentations. Presentations are shared across locales (titles stay in English, URLs point to `s.vedmich.dev/{slug}`).
- **D-03:** Slide URLs are locale-aware with a nullable override field. Each entry in `presentations` can carry an optional `slug_ru` or `locale_urls: { ru?: string }` — if present and locale is RU, use that; otherwise fall back to the shared `s.vedmich.dev/{slug}` URL. No RU slide versions exist today, but schema is forward-compatible (zero breakage when added later).
- **D-04:** Blog posts are pulled from Astro Content Collection at build time. Title, description, tags, date, slug per locale. RU posts only appear in RU index; EN posts only in EN index.

### Empty state
- **D-05:** On open (or when query is empty), show top-6 recent items sorted by `date` descending, mixing slides and posts. Matches `app.jsx:203` behavior — provides discoverability; user can hit Enter immediately without typing.

### Navigation target
- **D-06:** Slides open in a new tab (`window.open(url, '_blank', 'noopener,noreferrer')`). Posts navigate in the same tab (`window.location = url`). Matches `app.jsx:218–223`. Internal anchors (`#section`) still use smooth-scroll (not applicable in this phase since we only index slides + posts, but keep the branch for Phase 3+ growth).

### Mobile trigger
- **D-07:** Mobile menu search hint becomes a tappable `<button>` that opens the modal. The `⌘K` kbd badge hides at mobile widths (no relevance). Input autofocuses — iOS keyboard slides up. UX parity with desktop.

### Keyboard shortcuts
- **D-08:** `⌘K` on macOS, `Ctrl+K` on other platforms, and `/` all open the modal. The `/` listener must skip firing when focus is inside an `<input>`, `<textarea>`, or element with `contenteditable` — standard guard pattern. `Esc` closes.
- **D-09:** Arrow Up/Down navigates results, `Enter` opens the selected item, mouse hover moves selection. Matches `app.jsx:226–231`.

### Claude's Discretion
- Focus trap inside the modal while open (tab cycles between input and results) — implement per accessibility best practice.
- Scroll lock on `<body>` while modal is open.
- `role="dialog"`, `aria-modal="true"`, `aria-labelledby` wiring.
- Debounce on input (or skip — dataset is small, <50 items total).
- Match highlighting in result titles (bold the matched substring) — nice-to-have; defer if it adds complexity.
- Result count + indexed count footer text (per `app.jsx:294–296`).
- Kind badge colors (Slides teal, Post amber) — already locked by app.jsx reference.

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Reference design
- `/Users/viktor/.claude/skills/viktor-vedmich-design/ui_kits/vedmich-dev/app.jsx` §184–195 — `fuzzyScore()` function (title substring = 100, haystack substring = 60, all-tokens-present = 30)
- `/Users/viktor/.claude/skills/viktor-vedmich-design/ui_kits/vedmich-dev/app.jsx` §197–303 — `SearchPalette` component (layout, keyboard handlers, kind badges, empty-state top-6, footer)
- `/Users/viktor/.claude/skills/viktor-vedmich-design/ui_kits/vedmich-dev/app.jsx` §160–182 — `buildSearchIndex` (maps presentations → `kind: 'slides'`, blog → `kind: 'post'`)

### Roadmap & Requirements
- `.planning/ROADMAP.md` §"Phase 2 — Search palette" — phase scope, files list, verification steps
- `.planning/REQUIREMENTS.md` §"REQ-001" — original header pill requirement (Phase 1 locked the visual pill; Phase 2 upgrades to functional)

### Existing code to respect
- `src/components/Header.astro` — search pill button lives at `<li class="hidden lg:block">`; desktop at L44, mobile hint at L101. Add trigger wiring (click/enter opens modal) without breaking existing Phase 1 styles.
- `src/data/social.ts` — `presentations` array (shape: `{ date, event, location, title, description, slug, tags }`) feeds the slide half of the index.
- `src/content.config.ts` — blog Content Collection schema (title, description, date, tags, draft) feeds the post half of the index.
- `src/i18n/en.json`, `src/i18n/ru.json` — `nav.search_label`, `nav.search_placeholder` already exist (Phase 1). Add: `search.placeholder`, `search.empty_hint`, `search.no_results`, `search.footer_move`, `search.footer_open`, `search.kind_slides`, `search.kind_post`.
- `src/styles/design-tokens.css` — teal `#14B8A6`, amber `#F59E0B`, bg surfaces. No new tokens needed.
- `src/layouts/BaseLayout.astro` — where the `<SearchPalette />` component gets mounted globally (once per page, renders inside `<body>`).

### Project rules
- `CLAUDE.md` — Deep Signal design tokens (anti-pattern: never `#06B6D4`/`#22D3EE`), i18n workflow, publish workflow (push to main, no PR for small changes)
- `CLAUDE.md` §"GSD workflows" — ask in RU, record in EN (applied during this discussion)

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- **Keyboard shortcut listener pattern**: Header.astro already uses a plain `document.addEventListener`-style handler for `.lang-switch` clicks. Same pattern extends cleanly to keydown handlers for ⌘K/Ctrl+K/`/`.
- **i18n pipeline**: `src/i18n/utils.ts → t(locale)` returns a typed object; extending `search.*` keys is a one-line change per JSON file.
- **Content Collection API**: `import { getCollection } from 'astro:content'` + filter by locale subfolder is already used in BlogPreview.astro — `src/data/search-index.ts` can reuse the exact pattern.

### Established Patterns
- **Zero-JS-by-default**: any new JS must be inline `<script>` inside an Astro component. Framework islands would be the first in the project.
- **Atomic commits per phase**: push straight to main for small UI changes (no PR).
- **Design tokens only**: never hardcode hex. All colors via `bg-*`/`text-*`/`border-*` utility classes that resolve through `global.css` `@theme`.

### Integration Points
- **Header.astro**: wire the existing `<button>` (currently `disabled`, `tabindex="-1"`) — remove `disabled`, add click handler that dispatches a `window.postMessage` or sets `data-search-open="true"` on `<body>`. Mobile menu hint becomes a `<button>` with the same handler.
- **BaseLayout.astro**: mount `<SearchPalette locale={locale} />` once per page, after `<slot />` before closing `</body>`. Pass locale from `Astro.currentLocale` or prop.
- **search-index.ts (new)**: exports `buildSearchIndex(locale: Locale): SearchItem[]`. Called inside `SearchPalette.astro` frontmatter at build time. Result is serialized to JSON inside a `<script type="application/json" id="search-index-data">` tag — the client script reads it on first open via `JSON.parse`.

</code_context>

<specifics>
## Specific Ideas

- Modal width `640px`, max-height for results panel `380px`, positioned `paddingTop: 96px` from top (per `app.jsx:237–242`).
- Overlay: `rgba(2,6,23,0.72)` + `backdrop-filter: blur(6px)`. Fade-in 120ms.
- Modal border: `1px solid var(--border)` + subtle teal outer ring `0 0 0 1px rgba(20,184,166,0.12)`.
- Kind badge: mono font, 10px, uppercase, `letter-spacing: 0.08em`. Slides: teal bg/border/text at 12%/30%/100% opacity. Posts: amber at same opacities.
- Result item layout: `62px | 1fr | auto` grid — badge | title+sub | return-arrow.
- Footer strip shows `↑ ↓ move` on left, `↵ open` next to it, `N results · M indexed` on right.
- Selected item gets `background: rgba(20,184,166,0.08)` + `border-left: 2px solid teal`.
- The `⌕` glyph in the input row is teal, JetBrains Mono, 16px.
- `Esc` kbd badge in the input row sits on the right.

</specifics>

<deferred>
## Deferred Ideas

- Indexing speaking talks, book chapters, certifications — these could join the index later but aren't in Phase 2 scope.
- Fetching content from Obsidian vault via QMD at build time — noted in CLAUDE.md for future but orthogonal to the search UI.
- Search analytics (which queries had no results, click-through rate) — no analytics stack in the project yet; would need its own phase.
- Server-side search (Pagefind, Algolia DocSearch) — the dataset is small enough that client-side fuzzy score is plenty; revisit at 100+ indexed items.
- Recent-queries memory in `localStorage` — nice-to-have; defer.
- Match highlighting in result titles — Claude's discretion; defer if it complicates plan.
- Keyboard shortcut hint in the pill button adapts to OS (`⌘K` on mac, `Ctrl+K` on Windows/Linux) — currently shows `⌘K` always; acceptable.

</deferred>

---

*Phase: 02-search-palette*
*Context gathered: 2026-04-19*
