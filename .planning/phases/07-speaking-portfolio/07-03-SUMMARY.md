---
phase: 07-speaking-portfolio
plan: 03
subsystem: pages-and-components
tags: [astro, content-collections, dynamic-routing, youtube-embed, speaking-portfolio]

# Dependency graph
requires:
  - phase: 07-speaking-portfolio
    plan: 01
    provides: Speaking collection registered with Zod schema
  - phase: 07-speaking-portfolio
    plan: 02
    provides: 14 markdown files (7 EN + 7 RU) with talk content
provides:
  - Individual talk pages at /{locale}/speaking/{slug} with YouTube embeds
  - Full portfolio index pages at /{locale}/speaking/ showing all talks
  - Homepage Speaking section querying collection with reference grid layout
  - speakingEvents removed from social.ts (data now in collection)
affects: [speaking-section, homepage, navigation]

# Tech tracking
tech-stack:
  added: []
  patterns: [Dynamic routing with getStaticPaths, Conditional YouTube embed, Reference grid layout (100px|1fr)]

key-files:
  created:
    - src/pages/en/speaking/[...slug].astro
    - src/pages/ru/speaking/[...slug].astro
    - src/pages/en/speaking/index.astro
    - src/pages/ru/speaking/index.astro
  modified:
    - src/components/Speaking.astro
    - src/data/social.ts

key-decisions:
  - "Individual talk pages use max-w-3xl for prose readability (narrower than homepage sections)"
  - "Video embed only renders if talk.data.video is truthy (not empty string)"
  - "CTA buttons only render if video/slides URLs exist (conditional wrapper)"
  - "Year sorting uses explicit sort: Object.entries(talksByYear).sort((a, b) => Number(b[0]) - Number(a[0]))"
  - "Full portfolio index pages mirror Speaking.astro grid layout exactly"
  - "speakingEvents safely removed after verifying zero imports remain"

patterns-established:
  - "Conditional media embeds: {talk.data.video && <YouTube id={...} />}"
  - "Reference grid layout: grid-cols-[100px_1fr] gap-6, year in left column, events in right"
  - "Inline city format: event semibold + · separator + city muted"
  - "Talk links with arrow prefix: <span class='text-brand-primary'>→</span> {title}"

requirements-completed: [REQ-003]

# Metrics
duration: 2min 41sec
completed: 2026-04-21
---

# Phase 7 Plan 3: Speaking Portfolio — Pages and Components Summary

**Individual talk pages, full portfolio index, homepage Speaking section rewrite, and legacy data removal complete.**

## Performance

- **Duration:** 2 min 41 sec
- **Started:** 2026-04-21T18:39:56Z
- **Completed:** 2026-04-21T18:42:37Z
- **Tasks:** 5 completed
- **Files created:** 4 pages (2 slug + 2 index)
- **Files modified:** 2 (Speaking.astro + social.ts)

## Accomplishments

- Individual talk pages at `/{locale}/speaking/{slug}` with title, event/city/date meta, tags, video embed (conditional), CTA buttons, body prose
- Full portfolio index pages at `/{locale}/speaking/` showing all talks grouped by year in reference grid layout
- Homepage Speaking section completely rewritten — queries collection, no timeline/dots/cards, matches reference `app.jsx:456-486` visual
- speakingEvents array removed from social.ts — data now lives in Content Collection markdown files
- Build generates 16 new speaking pages (7 EN + 7 RU talks + 2 index pages)

## Task Commits

Each task was committed atomically:

1. **Task 1: Create EN slug page for individual talks** - `2ea5cae` (feat)
2. **Task 2: Create RU slug page (mirror of EN)** - `82ed3b9` (feat)
3. **Task 3: Rewrite Speaking.astro with reference grid layout** - `d2b856c` (feat)
4. **Task 4: Create full portfolio index pages** - `259b948` (feat)
5. **Task 5: Remove speakingEvents from social.ts** - `f457667` (feat)

## Files Created/Modified

### Created

- `src/pages/en/speaking/[...slug].astro` - Individual talk page EN — 97 lines
- `src/pages/ru/speaking/[...slug].astro` - Individual talk page RU — 97 lines (mirror)
- `src/pages/en/speaking/index.astro` - Full portfolio EN — 67 lines
- `src/pages/ru/speaking/index.astro` - Full portfolio RU — 67 lines (mirror)

### Modified

- `src/components/Speaking.astro` - Complete rewrite — 44 insertions, 40 deletions
  - Removed import of speakingEvents from social.ts
  - Added import of getCollection from 'astro:content'
  - Query collection with locale filter
  - Sort by date descending
  - Group by year via reduce
  - Replaced timeline dots + cards with grid layout: `grid-cols-[100px_1fr] gap-6`
  - Year: teal 36px bold, `-0.02em` tracking
  - Events: left border `border-l-2 border-border pl-5`, no card wrapper
  - Talk links: `→` arrow (teal inline span) + talk text (muted), hover teal
  - Highlight: `★` amber mono 12px
  - Section bg: `bg-surface` per D-01
  - Container: `max-w-[1120px]` per D-17
  - Padding: `py-20 sm:py-28` per D-18

- `src/data/social.ts` - Removed speakingEvents export — 50 deletions
  - speakingEvents array removed (lines 52-100)
  - 4 exports remain: socialLinks, certifications, skills, presentations
  - No other files import speakingEvents (verified via grep)

## Technical Details

### Individual Talk Page Structure

**Route:** `/{locale}/speaking/{slug}` generated via `getStaticPaths()`

**Layout:**
1. Back link — `← {i.speaking.back_link}` (teal, top-left)
2. h1 — talk title (display-36 bold)
3. Meta row — `{event} · {city} · {date}` (text-secondary, formatted via `toLocaleDateString`)
4. Tag badges — teal rounded-full pills with border
5. Video embed — `<YouTube id={video} />` (conditional on `talk.data.video`)
6. CTA buttons — "Watch on YouTube" (amber bg) + "View Slides" (teal border), both conditional
7. Body prose — markdown content with teal accent links

**Key implementation details:**
- Container: `max-w-3xl` (narrower than homepage for prose readability)
- Date formatting: `toLocaleDateString('en-US', ...)` for EN, `toLocaleDateString('ru-RU', ...)` for RU
- Video embed only renders if `talk.data.video` is truthy (not empty string)
- CTA buttons wrapped in conditional: `{(talk.data.video || talk.data.slides) && ...}`
- Prose classes match blog pattern: `prose prose-invert prose-lg`
- No hardcoded hex colors — all use `text-brand-primary`, `bg-brand-accent`, etc.

### Full Portfolio Index Pages

**Route:** `/{locale}/speaking/` — static page, no slug

**Structure:** Same as Speaking.astro component but wrapped in BaseLayout:
- h1 (not h2) for page title
- No bg-surface (inherits global bg-base)
- Shows ALL talks (no limit)
- Grid layout: `grid-cols-[100px_1fr] gap-6` per year
- Year groups separated by `gap-8`

### Homepage Speaking Section (Speaking.astro)

**Before:** Timeline with dots + cards, queried `speakingEvents` from social.ts

**After:** Reference grid layout, queries Content Collection

**Visual changes:**
- Timeline line removed (was `absolute left-4 top-0 bottom-0 w-px bg-border`)
- Dots removed (were `w-3 h-3 rounded-full bg-accent ring-4`)
- Cards removed (were `p-4 rounded-xl bg-surface border card-glow`)
- SVG arrow icons removed (were `<svg>` with right-chevron path)
- Added grid layout: `grid-cols-[100px_1fr] gap-6` per year
- Year: now left column, 36px teal bold, `-0.02em` tracking
- Events: now right column, left border `border-l-2`, 20px padding
- Talks: now links to `/{locale}/speaking/{slug}`, `→` text arrow prefix
- Section bg: `bg-surface` added (was no bg)
- Container: `max-w-[1120px]` (was `max-w-6xl`)

**Data flow changes:**
- Before: `speakingEvents.map((yearGroup) => yearGroup.events.map(...))`
- After: `getCollection('speaking')` → sort → reduce to `talksByYear` → map

**Year sorting:** Explicit sort added — `Object.entries(talksByYear).sort((a, b) => Number(b[0]) - Number(a[0]))` to ensure newest-first display (Object.entries returns insertion order, but talks are already sorted descending by date, so reduce accumulates in descending order — explicit sort is safety net).

## Verification Results

All verification commands from PLAN.md passed:

1. **Build gate:** `npm run build` → 23 pages, 836ms, exit 0 ✓
2. **EN page count:** 7 talk directories + 1 index.html = 8 pages ✓
3. **RU page count:** 7 talk directories + 1 index.html = 8 pages ✓
4. **Collection query:** `getCollection('speaking'` found in Speaking.astro ✓
5. **No speakingEvents references:** `grep -r "speakingEvents" src/` → 0 results ✓
6. **Reference grid layout:** `grid-cols-[100px_1fr]` found in Speaking.astro ✓
7. **Token-based colors:** No hardcoded hex in Speaking.astro or slug pages ✓

## Deviations from Plan

None — plan executed exactly as written.

## Known Stubs

**Stub 1: Missing video URLs**
- **Location:** All 7 talks
- **Pattern:** `video` field omitted from frontmatter (not empty string)
- **Reason:** No YouTube URLs available yet; will be added when recordings are uploaded
- **Resolution plan:** When video URLs become available, add `video: "https://youtu.be/VIDEO_ID"` to frontmatter, rebuild site, video embed will appear automatically
- **UI impact:** Video embed section does not render, CTA buttons do not render (conditional on video/slides existence)

**Stub 2: Missing slides URLs**
- **Location:** All 7 talks
- **Pattern:** `slides` field omitted from frontmatter
- **Reason:** Slidev URLs not yet deployed for these talks
- **Resolution plan:** When Slidev decks are deployed to s.vedmich.dev, add `slides: "https://s.vedmich.dev/slug/"` to frontmatter
- **UI impact:** "View Slides" CTA button does not render

**Stub 3: Minimal body text**
- **Location:** All 7 talk markdown files
- **Pattern:** 1-2 sentences per talk body
- **Reason:** Migration from social.ts provided only titles/events/cities — body text was not in source data
- **Resolution plan:** Expand body text via QMD vault search (find talk notes in `15.31-Talks-Materials/`, `15.50-Speaking-Portfolio/`)
- **UI impact:** Individual talk pages show title, meta, tags, but very short description — looks like placeholder content

## Self-Check: PASSED

**Created files verified:**
- ✓ src/pages/en/speaking/[...slug].astro exists (97 lines)
- ✓ src/pages/ru/speaking/[...slug].astro exists (97 lines)
- ✓ src/pages/en/speaking/index.astro exists (67 lines)
- ✓ src/pages/ru/speaking/index.astro exists (67 lines)

**Modified files verified:**
- ✓ src/components/Speaking.astro exists, contains `getCollection('speaking'`, no `speakingEvents` import
- ✓ src/data/social.ts exists, contains 4 exports (socialLinks, certifications, skills, presentations), no speakingEvents

**Commits verified:**
- ✓ 2ea5cae exists (git log shows "feat(07-03): create EN slug page for individual talks")
- ✓ 82ed3b9 exists (git log shows "feat(07-03): create RU slug page (mirror of EN)")
- ✓ d2b856c exists (git log shows "feat(07-03): rewrite Speaking.astro with reference grid layout")
- ✓ 259b948 exists (git log shows "feat(07-03): create full portfolio index pages")
- ✓ f457667 exists (git log shows "feat(07-03): remove speakingEvents from social.ts")

All claims verified. Ready for visual verification on live site after push to main.
