---
phase: 08-presentations-match-card-format
plan: 03
status: complete
completed: 2026-04-24
duration: "inline"
---

# Plan 08-03 Summary — Component rewrite + portfolio pages + search-index migration

## What was built

### New files
1. **src/components/PresentationCard.astro** — Reusable 5-row card component with typed `CollectionEntry<'presentations'>` props. Renders overline / title / description / slug URL / teal tag badges. Whole-card external anchor (`target="_blank" rel="noopener noreferrer"`). Slug derived via `id.replace(/^(en|ru)\//, '')`. Date formatted as ISO `YYYY-MM-DD`. Null city filtered via `[dateStr, data.event, data.city].filter(Boolean)`.

2. **src/pages/en/presentations/index.astro** — Full EN portfolio page with BaseLayout, flat date-desc grid of ALL decks (no year grouping, no pagination, no "All decks →" footer link), teal back-link `← Back to Home` via new `i.back_to_home` key.

3. **src/pages/ru/presentations/index.astro** — RU mirror; identical shape, locale='ru'. Auto-resolves RU translations from i18n.

### Rewritten files
4. **src/components/Presentations.astro** — Now queries Content Collection via `getCollection('presentations', ...)` with locale + draft filter. Slices top 6. Subtitle interpolates `{N}` via `String.prototype.replace`. Section gained `bg-surface` (D-17 zebra-rhythm). Container changed from `max-w-6xl + px-4 sm:px-6` → `max-w-[1120px] mx-auto px-6` (D-18). "All decks →" link target changed from external `s.vedmich.dev` → internal `/{locale}/presentations` (D-05). Grid gap `gap-4 → gap-5` (D-20). Inline card markup replaced with `<PresentationCard deck={deck} />` (D-16 DRY).

5. **src/data/search-index.ts** — Migrated from `import { presentations } from './social'` to `getCollection('presentations', ...)`. Dead `locale_urls` override logic and `as any` cast removed. `SearchItem.tags` type widened from `readonly string[]` → `string[]` to match collection emission. Blog query unchanged, `fuzzyScore` unchanged, return order preserved.

6. **src/data/social.ts** — `export const presentations` (62 lines) removed per D-25 clean-break. File now exports exactly 3 consts: `socialLinks`, `certifications`, `skills`.

## Key-files

- created (3):
  - src/components/PresentationCard.astro
  - src/pages/en/presentations/index.astro
  - src/pages/ru/presentations/index.astro
- modified (3):
  - src/components/Presentations.astro (full rewrite)
  - src/data/search-index.ts
  - src/data/social.ts

## Decisions

- **Kept `bg-brand-primary-soft/30` as default tag-badge bg** — Tailwind 4 compiled to `color-mix(in oklab, var(--color-brand-primary-soft) 30%, transparent)`. Fallback to `bg-brand-primary/10` is documented in plan Task 6 decision gate if live visual verification shows too-dark/olive rendering; trivial 1-line swap if needed. Did not pre-apply fallback — Tailwind 4 compilation verified in CSS output.
- **No year grouping on portfolio index pages** — per D-14, flat date-desc grid; all decks are 2025-2026 so grouping is visual noise. Differs from Speaking index.
- **Back-link uses `text-brand-primary`** (visible teal) on portfolio pages — per D-14 this is a top-level page nav not a sub-section return, so it differs from Speaking's muted style.
- **Kept `certifications` export** in `social.ts` — only `presentations` was removed; `certifications` is unused in components but retained for future reference.

## Verification

| Check | Result |
|---|---|
| `npm run build` | ✓ 25 pages in 893ms (up from 23) |
| `dist/en/presentations/index.html` exists | yes |
| `dist/ru/presentations/index.html` exists | yes |
| Homepage EN subtitle interpolated: `"6 talks · all slides at s.vedmich.dev"` | yes (N=6) |
| Homepage RU subtitle interpolated: `"6 докладов · все слайды на s.vedmich.dev"` | yes |
| "All decks →" href on homepage | `/en/presentations` (internal, NOT s.vedmich.dev) |
| RU portfolio back-link text | "Назад на главную" |
| EN portfolio back-link text | "Back to Home" |
| Search index contains slides items | 1+ JSON hits for `"kind":"slides"` |
| Hardcoded hex in Phase 8 files | 0 (PresentationCard, Presentations, both index pages) |
| `grep -c "^export const" src/data/social.ts` | 3 (socialLinks, certifications, skills) |
| `grep "import.*presentations.*from.*social" src/` | (no matches) |
| Tailwind alpha compilation (`bg-brand-primary-soft/30`) | `color-mix(in oklab, ..., 30%, transparent)` in compiled CSS |

## Self-Check: PASSED

Homepage Presentations section queries Content Collection with 5-row PresentationCard layout. Internal "All decks →" link, dynamic subtitle interpolation, teal tag badges with Tailwind 4 alpha compilation. Both portfolio pages render. Search index migrated. social.ts cleaned. 25 pages built with no errors.

## Files touched (single atomic commit recommended per CLAUDE.md small-change policy)

- `src/components/PresentationCard.astro` (new)
- `src/components/Presentations.astro` (rewrite)
- `src/pages/en/presentations/index.astro` (new)
- `src/pages/ru/presentations/index.astro` (new)
- `src/data/search-index.ts` (modified)
- `src/data/social.ts` (modified — removed presentations export)
