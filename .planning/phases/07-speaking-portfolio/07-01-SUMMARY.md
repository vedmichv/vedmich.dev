---
phase: 07-speaking-portfolio
plan: 01
subsystem: content-collections
tags: [astro, content-collections, i18n, youtube-embed, zod]

# Dependency graph
requires:
  - phase: blog-collection
    provides: Content Collections pattern with glob loader, i18n via file structure
provides:
  - Speaking Content Collection registered with 10-field Zod schema
  - i18n keys for talk page UI (back_link, watch_video, view_slides, all_talks)
  - YouTube embed package installed (@astro-community/astro-embed-youtube v0.5.10)
affects: [07-02-content-migration, 07-03-pages-and-components, speaking-section, talk-pages]

# Tech tracking
tech-stack:
  added: [@astro-community/astro-embed-youtube@0.5.10]
  patterns: [Content Collection with required array field (tags), URL validation in Zod schema]

key-files:
  created: []
  modified: [src/content.config.ts, src/i18n/en.json, src/i18n/ru.json, package.json, package-lock.json]

key-decisions:
  - "tags field is required array (no .optional()) per D-06 frontmatter schema"
  - "video and slides fields use z.string().url().optional() for URL validation"
  - "Speaking collection follows same pattern as blog collection (glob loader, locale subdirectories)"
  - "YouTube embed uses astro-embed wrapper over lite-youtube-embed for Astro-native API"

patterns-established:
  - "URL validation in Content Collections: z.string().url().optional() for optional URL fields"
  - "Required array fields in Zod schema: z.array(z.string()) without .optional() chaining"

requirements-completed: [REQ-003]

# Metrics
duration: 2min 47sec
completed: 2026-04-21
---

# Phase 7 Plan 1: Speaking Portfolio — Data Layer Summary

**Speaking Content Collection registered with validated schema, i18n keys for talk pages, and YouTube embed package installed.**

## Performance

- **Duration:** 2 min 47 sec
- **Started:** 2026-04-21T18:30:13Z
- **Completed:** 2026-04-21T18:33:00Z
- **Tasks:** 3 completed
- **Files modified:** 5

## Accomplishments
- Speaking collection queryable at build time via `getCollection('speaking')`
- 10-field Zod schema enforces frontmatter validation (title, event, city, date, tags, video, slides, rating, highlight, draft)
- Both EN and RU i18n files have 6 speaking keys each (title, subtitle, back_link, watch_video, view_slides, all_talks)
- YouTube embed package ready for video embeds in talk pages (defers iframe load until user interaction)

## Task Commits

Each task was committed atomically:

1. **Task 1: Add speaking collection to content.config.ts** - `8096e60` (feat)
2. **Task 2: Add i18n keys for talk pages** - `8048466` (feat)
3. **Task 3: Install YouTube embed package** - `071ae22` (feat)

## Files Created/Modified
- `src/content.config.ts` - Speaking collection registered alongside blog, 10-field Zod schema with URL validation
- `src/i18n/en.json` - Added 4 keys to speaking object (back_link, watch_video, view_slides, all_talks)
- `src/i18n/ru.json` - Added 4 Russian translation keys to speaking object
- `package.json` - Added @astro-community/astro-embed-youtube dependency
- `package-lock.json` - Locked astro-embed-youtube v0.5.10 and lite-youtube-embed v0.3.4

## Technical Details

### Collection Schema
The speaking collection schema has 10 fields:
- Required: title (string), event (string), city (string), date (coerce.date), tags (string array)
- Optional with URL validation: video (string), slides (string)
- Optional: rating (string), highlight (string), draft (boolean, default false)

**Key constraint:** tags field is a required array — NOT optional. This differs from blog collection where tags are optional. The decision was locked in D-06 (07-CONTEXT.md).

### i18n Keys
Both locale files now have 6 speaking keys:
- EN: "Back to Speaking", "Watch on YouTube", "View Slides", "All talks"
- RU: "Назад к выступлениям", "Смотреть на YouTube", "Посмотреть слайды", "Все выступления"

Russian translations use correct Cyrillic text per UI-SPEC copywriting contract.

### YouTube Embed Package
Installed @astro-community/astro-embed-youtube v0.5.10, which wraps lite-youtube-embed v0.3.4. This package:
- Defers YouTube iframe creation until user clicks play
- Improves initial page load performance by avoiding YouTube's 500KB+ JS bundle
- Provides Astro-native component API: `<YouTube id={videoUrl} />`

## Verification Results

All verification commands from PLAN.md passed:
1. Schema validation: `grep -c "const speaking = defineCollection" src/content.config.ts` → 1 ✓
2. Export validation: `grep "export const collections" src/content.config.ts` → `{ blog, speaking }` ✓
3. EN i18n completeness: 6 keys (all_talks, back_link, subtitle, title, view_slides, watch_video) ✓
4. RU i18n completeness: `watch_video` = "Смотреть на YouTube" ✓
5. YouTube package: `npm list @astro-community/astro-embed-youtube` → v0.5.10 ✓
6. Build gate: `npm run build` → 7 pages, 769ms, exit 0 ✓

**Expected warning during build:** `[glob-loader] The base directory "/Users/viktor/Documents/GitHub/vedmich/vedmich.dev/src/content/speaking/" does not exist.` — This is expected because content files will be created in Plan 07-02. The collection is registered and ready; build does not fail.

## Deviations from Plan

None — plan executed exactly as written.

## Known Stubs

None — no UI components or data rendering in this plan. Data layer only.

## Self-Check: PASSED

**Created files:** N/A (no new files created, only modified existing)

**Modified files verified:**
- ✓ src/content.config.ts exists and contains speaking collection
- ✓ src/i18n/en.json exists and has 6 speaking keys
- ✓ src/i18n/ru.json exists and has 6 speaking keys
- ✓ package.json exists and contains @astro-community/astro-embed-youtube

**Commits verified:**
- ✓ 8096e60 exists (git log shows "feat(07-speaking-portfolio): register speaking collection")
- ✓ 8048466 exists (git log shows "feat(07-speaking-portfolio): add i18n keys for talk pages")
- ✓ 071ae22 exists (git log shows "feat(07-speaking-portfolio): install YouTube embed package")

All claims verified. Ready for Plan 07-02 (content migration).
