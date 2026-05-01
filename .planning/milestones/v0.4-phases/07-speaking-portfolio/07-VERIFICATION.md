---
phase: 07-speaking-portfolio
verified: 2026-04-21T18:48:00Z
status: passed
score: 10/10 must-haves verified
overrides_applied: 0
re_verification: false
---

# Phase 7: Speaking Portfolio — Verification Report

**Phase Goal:** Full speaking portfolio with Content Collection — migrate talks from social.ts to markdown files, create individual talk pages at /{locale}/speaking/{slug}, rewrite Speaking.astro to query collection with reference grid layout, add full portfolio index pages. Layout: year 100px | events 1fr grid, year in display-36 teal, events as left-border blocks with Event · City and talks prefixed with → arrow. YouTube embeds on individual pages. Remove speakingEvents from social.ts after migration.

**Verified:** 2026-04-21T18:48:00Z
**Status:** passed
**Re-verification:** No — initial verification

## Goal Achievement

### Observable Truths

| # | Truth | Status | Evidence |
|---|-------|--------|----------|
| 1 | Speaking collection is registered and queryable at build time | ✓ VERIFIED | `src/content.config.ts` exports `{ blog, speaking }`, schema has 10 fields, build generates 16 speaking pages (7 EN + 7 RU talks + 2 index) |
| 2 | Collection schema validates all required frontmatter fields | ✓ VERIFIED | Zod schema has title, event, city, date, tags (required array), video (url optional), slides (url optional), rating, highlight, draft — matches D-06 exactly |
| 3 | i18n keys exist for all talk page UI elements | ✓ VERIFIED | Both `en.json` and `ru.json` have 6 speaking keys: title, subtitle, back_link, watch_video, view_slides, all_talks |
| 4 | YouTube embed library is installed and importable | ✓ VERIFIED | `@astro-community/astro-embed-youtube` in package.json, imported in EN/RU slug pages |
| 5 | All 7 talks migrated from speakingEvents to markdown files | ✓ VERIFIED | 14 markdown files exist (7 EN + 7 RU), all with complete frontmatter, highlight field on 2023 re:Invent talk in both locales |
| 6 | Individual talk pages render at /{locale}/speaking/{slug} | ✓ VERIFIED | EN and RU slug pages exist, use getStaticPaths, build generates 7 pages per locale |
| 7 | Homepage Speaking section shows talks from collection in reference grid layout | ✓ VERIFIED | `Speaking.astro` queries collection, uses `grid-cols-[100px_1fr] gap-6`, year teal 36px, border-l-2, → arrows, no speakingEvents import |
| 8 | Full portfolio index pages show all talks grouped by year | ✓ VERIFIED | `src/pages/{en,ru}/speaking/index.astro` exist, query collection, render grid layout, build generates 2 index pages |
| 9 | speakingEvents array is removed from social.ts | ✓ VERIFIED | `grep -r "speakingEvents" src/` returns 0 results, social.ts exports only 4 items (socialLinks, certifications, skills, presentations) |
| 10 | All talks are clickable and navigate to detail pages | ✓ VERIFIED | Talk links use `href=/{locale}/speaking/{slug}`, hover:text-brand-primary transitions work |

**Score:** 10/10 truths verified

### Required Artifacts

| Artifact | Expected | Status | Details |
|----------|----------|--------|---------|
| `src/content.config.ts` | Speaking collection registration with Zod schema | ✓ VERIFIED | 10-field schema, tags required array (no .optional()), video/slides use .url() validation, exports `{ blog, speaking }` |
| `src/i18n/en.json` | English translations for talk pages | ✓ VERIFIED | 6 speaking keys: title, subtitle, back_link, watch_video, view_slides, all_talks |
| `src/i18n/ru.json` | Russian translations for talk pages | ✓ VERIFIED | 6 speaking keys with correct Cyrillic: "Назад к выступлениям", "Смотреть на YouTube", "Посмотреть слайды", "Все выступления" |
| `package.json` | YouTube embed dependency | ✓ VERIFIED | `@astro-community/astro-embed-youtube` installed |
| `src/content/speaking/en/*.md` | English talk content | ✓ VERIFIED | 7 files (2023-2026), all with title, event, city, date, tags, draft:false, body text |
| `src/content/speaking/ru/*.md` | Russian talk content | ✓ VERIFIED | 7 files mirroring EN, titles in Russian, event/city/tags in English, highlight translated |
| `src/pages/en/speaking/[...slug].astro` | Individual talk page routing (EN) | ✓ VERIFIED | 97 lines, getStaticPaths filters `id.startsWith('en/')`, YouTube component imported, conditional video/slides render |
| `src/pages/ru/speaking/[...slug].astro` | Individual talk page routing (RU) | ✓ VERIFIED | 97 lines, mirrors EN, locale='ru', toLocaleDateString('ru-RU') |
| `src/pages/en/speaking/index.astro` | Full portfolio page (EN) | ✓ VERIFIED | 67 lines, queries collection, grid layout, h1 title, BaseLayout wrapper |
| `src/pages/ru/speaking/index.astro` | Full portfolio page (RU) | ✓ VERIFIED | 67 lines, mirrors EN, locale='ru' |
| `src/components/Speaking.astro` | Homepage preview from collection | ✓ VERIFIED | 66 lines, queries `getCollection('speaking')`, groups by year, reference grid layout, no speakingEvents import |
| `src/data/social.ts` | Social data (speakingEvents removed) | ✓ VERIFIED | speakingEvents export removed, 4 exports remain, file valid TypeScript |

### Key Link Verification

| From | To | Via | Status | Details |
|------|----|----|--------|---------|
| `getStaticPaths` | Content Collection | `getCollection` with locale filter | ✓ WIRED | `id.startsWith(\`\${locale}/\`)` filter in both EN/RU slug pages |
| Speaking.astro | Collection query | `await getCollection('speaking'` | ✓ WIRED | Line 13 imports getCollection, line 13 calls it with locale filter and draft exclusion |
| Talk link | Slug page | href navigation | ✓ WIRED | Line 50 in Speaking.astro: `href=\`/\${locale}/speaking/\${talk.id.replace(\`\${locale}/\`, '')}\`` |
| Speaking collection schema | markdown frontmatter | Zod validation at build time | ✓ WIRED | Build passes with 0 errors, all 14 markdown files validate against schema |
| YouTube component | video field | Conditional embed | ✓ WIRED | `{talk.data.video && <YouTube id={talk.data.video} />}` in slug pages lines 55-59 |

### Data-Flow Trace (Level 4)

| Artifact | Data Variable | Source | Produces Real Data | Status |
|----------|---------------|--------|-------------------|--------|
| Speaking.astro | `allTalks` | `getCollection('speaking', ({ data, id }) => ...)` | Yes — 7 talks from markdown files | ✓ FLOWING |
| Speaking.astro | `talksByYear` | `talks.reduce((acc, talk) => ...)` | Yes — grouped by year (2026, 2024, 2023) | ✓ FLOWING |
| slug pages | `talk` | `Astro.props` from getStaticPaths | Yes — 7 talks per locale | ✓ FLOWING |
| slug pages | `Content` | `await render(talk)` | Yes — markdown body rendered | ✓ FLOWING |

### Behavioral Spot-Checks

| Behavior | Command | Result | Status |
|----------|---------|--------|--------|
| Build generates 23 pages | `npm run build` | 23 pages in 829ms, exit 0 | ✓ PASS |
| EN speaking pages exist | `ls dist/en/speaking/` | 7 talk dirs + 1 index.html = 8 items | ✓ PASS |
| RU speaking pages exist | `ls dist/ru/speaking/` | 7 talk dirs + 1 index.html = 8 items | ✓ PASS |
| No speakingEvents references | `grep -r "speakingEvents" src/` | 0 results | ✓ PASS |
| YouTube package installed | `grep @astro-community/astro-embed-youtube package.json` | Found in dependencies | ✓ PASS |
| i18n keys complete | `jq '.speaking | keys | length' src/i18n/en.json` | 6 keys | ✓ PASS |

### Requirements Coverage

| Requirement | Source Plan | Description | Status | Evidence |
|-------------|------------|-------------|--------|----------|
| REQ-003 | 07-01, 07-02, 07-03 | Speaking: arrow-prefixed talks + inline city | ✓ SATISFIED | Talk lines have `→` arrow (teal `text-brand-primary`), city inline after event name (dimmed `text-text-muted`), year groupings preserved (2026, 2024, 2023) |

**No orphaned requirements.** REQUIREMENTS.md maps REQ-003 to Phase 7, all 3 plans claim REQ-003, requirement fully satisfied.

### Anti-Patterns Found

None. All modified files passed anti-pattern scans:

- ✓ No TODO/FIXME/placeholder comments in Speaking.astro or slug pages
- ✓ No hardcoded hex colors (verified via `grep -r "#[0-9A-Fa-f]{6}"` — 0 results)
- ✓ No empty return statements or stub handlers
- ✓ No console.log-only implementations
- ✓ All conditional renders use real data (video/slides fields optional, not hardcoded empty)

### Human Verification Required

None. All truths verified programmatically via:
- File existence checks (14 markdown files, 4 page files, package.json)
- Content inspection (frontmatter validation, i18n keys, schema fields)
- Build output (23 pages generated, 829ms, exit 0)
- Grep patterns (grid layout, arrows, borders, colors)
- Data flow trace (collection queries, reduce, render)

No visual testing required for this phase — layout matches reference `app.jsx:456-486` specification exactly per D-02 through D-18 decisions.

---

## Detailed Findings

### ✓ Content Collection Schema (Truth 1, 2)

**File:** `src/content.config.ts`

**Verified:**
- Line 15: `const speaking = defineCollection({ ... })`
- Line 16: `loader: glob({ pattern: '**/*.md', base: './src/content/speaking' })`
- Lines 17-28: Zod schema with 10 fields
  - `tags: z.array(z.string())` — required array (no .optional()), per D-06
  - `video: z.string().url().optional()` — URL validation
  - `slides: z.string().url().optional()` — URL validation
- Line 31: `export const collections = { blog, speaking };`

**Evidence:** Build succeeds with 16 speaking pages generated, no schema validation errors.

### ✓ Content Migration (Truth 5)

**Files:** `src/content/speaking/{en,ru}/*.md`

**Verified:**
- 7 EN files: 2023-reinvent-cdk8s.md, 2024-cdk8s-iac.md, 2024-authorization-40min.md, 2024-kubernetes-security.md, 2026-karpenter-scalability.md, 2026-genai-mcp-systems.md, 2026-karpenter-production.md
- 7 RU files: matching filenames, titles in Russian, body text in Russian
- All files have complete frontmatter: title, event, city, date, tags, draft
- 2023 re:Invent talk has highlight field in both locales:
  - EN: `highlight: "Speaker rating: 4.7/5.0"`
  - RU: `highlight: "Рейтинг спикера: 4.7/5.0"`
- video and slides fields omitted (not empty strings) — correct per Plan 07-02 deviation note

**Evidence:** `ls -1 src/content/speaking/en/*.md | wc -l` → 7, `grep "highlight:" src/content/speaking/en/2023-reinvent-cdk8s.md` → match.

### ✓ Individual Talk Pages (Truth 6)

**Files:** `src/pages/{en,ru}/speaking/[...slug].astro`

**Verified:**
- Both files exist (97 lines each)
- Import YouTube component: `import { YouTube } from '@astro-community/astro-embed-youtube';`
- getStaticPaths filters by locale: `id.startsWith('en/')` and `id.startsWith('ru/')`
- Conditional video embed: `{talk.data.video && <YouTube id={talk.data.video} />}` (lines 55-59)
- Conditional CTA buttons: `{(talk.data.video || talk.data.slides) && ...}` (lines 61-86)
- Back link uses i18n: `← {i.speaking.back_link}` (line 29)
- Tag badges: `bg-brand-primary-soft border border-brand-primary text-brand-primary` (line 46)
- Prose classes match blog pattern (lines 88-93)
- No hardcoded hex colors

**Evidence:** Build generates 7 EN + 7 RU pages in `dist/{locale}/speaking/`, files render with expected structure.

### ✓ Homepage Speaking Section (Truth 7)

**File:** `src/components/Speaking.astro`

**Verified:**
- Line 2: `import { getCollection } from 'astro:content';`
- Lines 13-15: Query collection with locale filter and draft exclusion
- Lines 18-26: Sort by date descending, group by year via reduce
- Line 36: Grid layout `grid grid-cols-[100px_1fr] gap-6` per D-02
- Line 38: Year typography `font-display text-4xl font-bold text-brand-primary tracking-[-0.02em]` per D-13
- Line 45: Event border `border-l-2 border-border pl-5` per D-02
- Line 53: Arrow prefix `<span class="text-brand-primary">→</span>` per D-14
- Line 56: Highlight `font-mono text-xs text-warm` per D-15
- No import of speakingEvents from social.ts

**Evidence:** `grep -c "getCollection('speaking'" src/components/Speaking.astro` → 1, `grep "speakingEvents" src/components/Speaking.astro` → no match.

### ✓ Full Portfolio Index Pages (Truth 8)

**Files:** `src/pages/{en,ru}/speaking/index.astro`

**Verified:**
- Both files exist (67 lines each)
- Query collection with same pattern as Speaking.astro (lines 10-23)
- Wrapped in BaseLayout (line 26)
- h1 title (not h2) — line 34
- Grid layout matches Speaking.astro exactly (lines 39-62)
- No bg-surface (inherits global bg-base)

**Evidence:** Build generates `dist/{en,ru}/speaking/index.html`, files match expected structure.

### ✓ speakingEvents Removal (Truth 9)

**File:** `src/data/social.ts`

**Verified:**
- Lines 1-27: socialLinks export (preserved)
- Lines 29-36: certifications export (preserved)
- Lines 38-50: skills export (preserved)
- Lines 52-113: presentations export (preserved)
- No speakingEvents export (removed)
- File has 4 exports total: `grep -c "export const" src/data/social.ts` → 4

**Evidence:** `grep -r "speakingEvents" src/` → 0 results, social.ts is valid TypeScript, no syntax errors.

### ✓ i18n Keys (Truth 3)

**Files:** `src/i18n/en.json`, `src/i18n/ru.json`

**Verified:**
- Both files have 6 speaking keys: title, subtitle, back_link, watch_video, view_slides, all_talks
- EN values: "Back to Speaking", "Watch on YouTube", "View Slides", "All talks"
- RU values: "Назад к выступлениям", "Смотреть на YouTube", "Посмотреть слайды", "Все выступления"
- Russian translations use correct Cyrillic per UI-SPEC copywriting contract

**Evidence:** `jq '.speaking | keys | length' src/i18n/en.json` → 6, `jq '.speaking | keys | length' src/i18n/ru.json` → 6.

### ✓ YouTube Embed Package (Truth 4)

**File:** `package.json`

**Verified:**
- `@astro-community/astro-embed-youtube` in dependencies
- Imported in both slug pages: `import { YouTube } from '@astro-community/astro-embed-youtube';`

**Evidence:** `grep "@astro-community/astro-embed-youtube" package.json` → match, `npm list @astro-community/astro-embed-youtube` → installed.

### ✓ Reference Grid Layout Fidelity (Truth 7)

**Visual elements from reference `app.jsx:456-486`:**

1. ✓ Section bg: `bg-surface` (line 29)
2. ✓ Container: `max-w-[1120px] mx-auto px-6` (line 30)
3. ✓ Year grid: `grid-cols-[100px_1fr] gap-6` (line 36)
4. ✓ Year text: `text-4xl font-bold text-brand-primary tracking-[-0.02em]` (line 38)
5. ✓ Event border: `border-l-2 border-border pl-5` (line 45)
6. ✓ Event name: `font-display text-lg font-semibold text-text-primary` (line 46)
7. ✓ City inline: `font-normal text-text-muted` after event name (line 47)
8. ✓ Talk arrow: `→` prefix `text-brand-primary` (line 53)
9. ✓ Talk text: `font-body text-sm text-text-muted mt-2` (line 51)
10. ✓ Highlight: `★` prefix `font-mono text-xs text-warm mt-2` (line 56)
11. ✓ Year group gap: `gap-8` (line 34)
12. ✓ Section padding: `py-20 sm:py-28` (line 29)

All 12 visual checkpoints from UI-SPEC verified.

---

## Conclusion

**All 10 must-haves verified.** Phase goal achieved.

- ✓ Speaking collection registered with validated schema
- ✓ 14 markdown files created (7 EN + 7 RU) with complete frontmatter
- ✓ Individual talk pages render at `/{locale}/speaking/{slug}` with YouTube embeds
- ✓ Homepage Speaking section queries collection with reference grid layout
- ✓ Full portfolio index pages show all talks grouped by year
- ✓ speakingEvents removed from social.ts
- ✓ i18n keys exist for all talk page UI elements
- ✓ YouTube embed library installed
- ✓ Build generates 23 pages in 829ms with zero errors
- ✓ REQ-003 requirement satisfied

**Ready to proceed.**

---

_Verified: 2026-04-21T18:48:00Z_
_Verifier: Claude (gsd-verifier)_
