# Phase 2: Search palette — Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in `02-CONTEXT.md` — this log preserves the alternatives considered.

**Date:** 2026-04-19
**Phase:** 02-search-palette
**Areas discussed:** JS approach, Index source & locale split, Empty state + navigation target, Trigger surface & mobile

---

## JS approach

| Option | Description | Selected |
|--------|-------------|----------|
| Vanilla `<script>` + DOM | Inline `<script>` in `SearchPalette.astro`, no framework. ~3–4 KB gzipped. Consistent with existing Header.astro. | ✓ |
| Preact island (`client:load`) | Install `@astrojs/preact`, write component as island. ~12 KB runtime + component. First framework island in project. | |
| Vanilla JS in separate `.ts` module | `src/scripts/search-palette.ts` imported via `<script>`. Same runtime, cleaner than inline but complicates tree-shake. | |

**User's choice:** Vanilla `<script>` + DOM
**Notes:** Keeps project zero-JS-by-default. No new dependency.

---

## Index source & locale split

| Option | Description | Selected |
|--------|-------------|----------|
| Per-locale index (EN/RU), presentations shared | `buildIndex(locale)`: EN route searches EN blog + all slides; RU route searches RU blog + all slides. Slide titles stay English — acceptable. | |
| Global index (everything mixed) | One index with both locales' posts + slides. Simpler build, but cross-locale pollution confuses RU users (RU search finds EN posts). | |
| Per-locale index + locale-aware slide URLs | Variant 1 + optional `locale_urls.ru` override field in `social.ts` for future RU slide versions. Future-proof. | ✓ |

**User's choice:** Per-locale index + locale-aware slide URLs
**Notes:** Keeps schema forward-compatible. No RU slide versions today — nullable field stays empty until needed.

---

## Empty state

| Option | Description | Selected |
|--------|-------------|----------|
| Top-6 recent items (per `app.jsx:203`) | On open / when query empty, show 6 most recent items (slides + posts mixed, sorted by `date` desc). Discoverability. | ✓ |
| Blank state with hint text | Empty list + "Try: karpenter, mcp, kubernetes". Less visual noise, loses discoverability. | |
| Top-6 curated (pinned) | Manual "featured" list in `social.ts`. Requires per-item maintenance — overkill at current content scale. | |

**User's choice:** Top-6 recent items

---

## Navigation target

| Option | Description | Selected |
|--------|-------------|----------|
| Slides new tab, posts same tab | Slides → `window.open` (different domain `s.vedmich.dev`). Posts → same-tab navigation (own domain). Matches `app.jsx:218–223`. | ✓ |
| Everything same tab | Slide Enter → `window.location`. Loses page context. No popup-blocker risk. | |
| Everything new tab | Even posts open in new tab. Unexpected for same-site navigation, popup-block risk. | |

**User's choice:** Slides new tab, posts same tab

---

## Trigger surface — mobile

| Option | Description | Selected |
|--------|-------------|----------|
| Mobile: tap-to-open | Mobile menu hint becomes `<button>` that opens the modal. Input autofocus → iOS keyboard pops. | ✓ |
| Mobile: visual-only hint (status quo) | No change. Search is desktop-only. Simple but disappointing on mobile. | |
| Mobile: hide hint entirely | Remove visual hint — search doesn't exist on mobile. Honest, but we said "tap-to-open" is better. | |

**User's choice:** Mobile: tap-to-open

---

## Trigger surface — `/` shortcut

| Option | Description | Selected |
|--------|-------------|----------|
| Yes, `/` opens modal | `/` opens if focus is not in form field. Matches GitHub, Vercel, Linear. Power-user UX. | ✓ |
| No, only ⌘K / Ctrl+K | Modifier shortcuts only. Simpler — no risk of accidental fire while typing. | |

**User's choice:** Yes, `/` opens modal

---

## Claude's Discretion

- Focus trap, scroll lock, ARIA wiring — implement per accessibility best practice
- Debounce on input (likely skip — dataset <50 items)
- Match highlighting in titles (bold the matched substring) — defer if costly
- Platform detection for ⌘K vs Ctrl+K label — OS-aware label is nice-to-have

## Deferred Ideas

- Indexing speaking talks, book chapters, certifications (future phase)
- Obsidian/QMD-sourced blog content at build time (orthogonal)
- Search analytics / telemetry
- Server-side search (Pagefind/Algolia) — premature at current scale
- Recent-queries memory in `localStorage`
