---
phase: 09-blog-3-posts-card-format
plan: 01
type: summary
completed_date: "2026-04-26T20:10:13Z"
duration: "4m 51s"
executor_model: sonnet
subsystem: blog
tags: [blog, ui, card, schema, i18n, astro, tailwind, remark]
requirements: [REQ-002]

dependencies:
  requires: []
  provides:
    - BlogCard component (typed 4-row card)
    - BlogPreview component (transparent section + 3-col grid)
    - /blog/ index pages (EN + RU, 3-col BlogCard grid)
    - Slug pages with byline + teal tags + RU Cyrillic author render
    - Tightened blog schema (required tags + optional author/reading_time/cover_image)
    - reading-time remark plugin wired
    - blog.min_read i18n key (EN + RU)
  affects:
    - Homepage BlogPreview section (now transparent with 3-col grid)
    - All blog index and slug pages (new card format + byline)

tech_stack:
  added:
    - reading-time@^1.5.0 (dev dep)
    - mdast-util-to-string@^4.0.0 (dev dep)
  patterns:
    - Official Astro reading-time remark plugin recipe (12-line `remark-reading-time.mjs`)
    - Locale-aware author rendering in RU slug page (Latin → Cyrillic translation at render time)
    - BlogCard mirrors PresentationCard structure (4 rows: date/title/description/tags)

key_files:
  created:
    - src/components/BlogCard.astro (52 lines, typed props, RU date strip, teal tags)
    - remark-reading-time.mjs (12 lines, official Astro recipe)
  modified:
    - src/components/BlogPreview.astro (transparent section, BlogCard grid)
    - src/pages/en/blog/index.astro (BlogCard grid + back-link)
    - src/pages/ru/blog/index.astro (BlogCard grid + back-link + Cyrillic title)
    - src/pages/en/blog/[...slug].astro (byline + teal tags + larger h1 + short month)
    - src/pages/ru/blog/[...slug].astro (byline + teal tags + larger h1 + long month + г. strip + locale-aware Cyrillic author render)
    - src/content.config.ts (tags required, author/reading_time/cover_image added)
    - src/data/search-index.ts (removed dead `?? []` fallback)
    - src/i18n/en.json (added blog.min_read: "min read")
    - src/i18n/ru.json (added blog.min_read: "мин чтения")
    - astro.config.mjs (added markdown.remarkPlugins)
    - package.json + package-lock.json (added reading-time + mdast-util-to-string)

decisions:
  - D-26: Made blog schema tags required (not optional) — existing hello-world.md already has tags so non-breaking
  - D-25: Added author field with Latin default "Viktor Vedmich" — RU slug page translates to Cyrillic at render via locale-aware constant (zero frontmatter discipline)
  - D-42: Added blog.min_read i18n key only (blog.by_author dropped per UI-SPEC Q2)
  - D-11: BlogCard drops row 4 (slug URL) present in PresentationCard — blog posts are internal routes
  - D-15: BlogPreview section is transparent (no bg-surface/30) for zebra rhythm
  - D-16: Changed container from max-w-6xl to max-w-[1120px] matching Presentations pattern
  - D-23: Slug page h1 upgraded from text-3xl sm:text-4xl to text-4xl sm:text-5xl with tracking-[-0.02em]
  - D-28: Byline format is `{author} · {readingTime} {min_read_label}` with no "By" prefix (UI-SPEC Q2) and always abbreviated (UI-SPEC Q3)
  - RU slug page implements locale-aware author rendering via `authorDisplay` constant: schema-default Latin "Viktor Vedmich" → Cyrillic "Виктор Ведмич" at render time, satisfying UI-SPEC §L398 byline contract for ALL RU posts (existing hello-world + future Wave 3 posts) without requiring per-post frontmatter overrides

metrics:
  tasks_completed: 3
  commits: 3
  files_modified: 13
  files_created: 2
  build_time_ms: 856
  lines_added: ~250
  lines_removed: ~150
---

# Phase 09 Plan 01: Blog Schema + BlogCard + Index/Slug Unification — SUMMARY

**One-liner:** JWT-free blog card extraction with teal badges, transparent homepage section, 3-col grid indexes, slug byline `{author} · {min} {label}`, RU Cyrillic author via locale-aware render, and schema tighten (required tags + author/reading_time/cover_image fields) wired to official Astro reading-time remark plugin.

## What Was Built

Wave 1 UI foundation for Phase 9 blog redesign:

### Task 1: Infrastructure Wiring (Commit 687a73f)
- Installed `reading-time` and `mdast-util-to-string` as dev deps
- Created `remark-reading-time.mjs` at repo root (12-line official Astro recipe)
- Registered `remarkReadingTime` in `astro.config.mjs` under new `markdown:` key
- Tightened blog schema:
  - `tags: z.array(z.string())` — now required (was `.optional()`)
  - Added `author: z.string().default('Viktor Vedmich')` — Latin default
  - Added `reading_time: z.number().optional()` — remark plugin fills if absent
  - Added `cover_image: z.string().optional()` — schema-ready for future use
- Removed dead `?? []` fallback in `src/data/search-index.ts` (line 56)
- Added `blog.min_read` key to both `en.json` ("min read") and `ru.json` ("мин чтения")

### Task 2: BlogCard Component + Index Pages (Commit ba682a4)
- Created `src/components/BlogCard.astro`:
  - 4-row card: date overline (mono xs) / title (text-lg) / description / teal tag badges
  - Mirrors `PresentationCard.astro` structure minus row 4 (slug URL)
  - Internal route `href={`/${locale}/blog/${slug}`}` — no `target="_blank"`
  - RU date formatting includes `.replace(/\s*г\.?$/, '')` to strip trailing "г."
  - Teal Badge class chain: `text-brand-primary bg-brand-primary-soft/30 border border-brand-primary/40`
- Rewrote `src/components/BlogPreview.astro`:
  - Transparent section (no `bg-surface/30`) for zebra rhythm
  - Container: `max-w-[1120px] mx-auto px-6` (was `max-w-6xl`)
  - Grid: `grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5`
  - Consumes `<BlogCard post={post} locale={locale} />`
  - Preserves inline empty-state strings (EN: "Posts coming soon...", RU: "Посты появятся скоро...")
- Rewrote both `/blog/` index pages (`en` + `ru`):
  - Back-link matching `presentations/index` pattern: `← {i.back_to_home}`
  - h1: `text-4xl font-bold mb-12 animate-on-scroll`
  - Same 3-col BlogCard grid as homepage BlogPreview
  - RU title uses Cyrillic "Виктор Ведмич" in BaseLayout

### Task 3: Slug Page Byline + Teal Tags + RU Cyrillic Author Render (Commit 4736ce6)
- Updated both slug pages with 6 targeted edits:
  1. Added `import { t }` and destructured `remarkPluginFrontmatter` from `render(post)`
  2. Added `const readingTime = post.data.reading_time ?? remarkPluginFrontmatter.minutesRead`
  3. Date class upgraded: `font-mono text-xs text-text-muted mb-2 block`
     - EN: `month: 'short'` (e.g., "Mar 3, 2026")
     - RU: `month: 'long'` with `.replace(/\s*г\.?$/, '')` (e.g., "3 марта 2026")
  4. h1 upgraded: `text-4xl sm:text-5xl font-bold tracking-[-0.02em] mb-4`
  5. Inserted byline `<p class="text-sm text-text-muted mt-3">{author} · {readingTime} {i.blog.min_read}</p>` between description and tag row
  6. Tag row: dropped `{post.data.tags && (...)}` guard, upgraded to teal Badge tokens

**RU-specific (BLOCKER-1 fix):** Added locale-aware author rendering in `src/pages/ru/blog/[...slug].astro`:
```astro
const authorDisplay = post.data.author === 'Viktor Vedmich'
  ? 'Виктор Ведмич'
  : post.data.author;
```
Byline renders `{authorDisplay}` (not `{post.data.author}`). This translates the schema-default Latin "Viktor Vedmich" to Cyrillic "Виктор Ведмич" at render time, satisfying UI-SPEC §L398 byline contract for ALL RU posts (existing `hello-world.md` + future Wave 3 posts) without requiring per-post frontmatter overrides.

EN slug page does NOT add this constant — renders `{post.data.author}` directly, which is correct for EN readers.

## Verification Results

All 10 plan-level verification checks **PASSED**:

```bash
=== Full Plan Verification (Plan 09-01) ===

1. Build green:
  ✓ PASS (build exits 0)
2. No hardcoded hex in all 6 modified files:
  ✓ PASS (0 hex literals)
3. i18n key parity (EN and RU blog keys identical):
  ✓ PASS
4. EN byline in built HTML (Viktor Vedmich · N min read):
  ✓ PASS
5. RU byline in built HTML (Виктор Ведмич · N мин чтения):
  ✓ PASS
6. RU does NOT leak Latin byline (proves locale-aware render works):
  ✓ PASS (no Latin leak)
7. Homepage BlogPreview has 3-col grid (both locales):
  ✓ PASS
8. /blog/ index pages have teal badges:
  ✓ PASS
9. Slug pages have teal badges:
  ✓ PASS
10. Reading time plugin registered:
  ✓ PASS
```

### Built HTML Evidence

**EN slug page** (`dist/en/blog/hello-world/index.html`):
- Byline: `Viktor Vedmich · 1 min read` ✓
- Date: `Mar 3, 2026` (short month) ✓
- Tags: `bg-brand-primary-soft/30` teal badges ✓

**RU slug page** (`dist/ru/blog/hello-world/index.html`):
- Byline: `Виктор Ведмич · 1 мин чтения` ✓ (Cyrillic author via locale-aware render)
- NO Latin byline leak (`Viktor Vedmich · ` not found) ✓
- Date: `3 марта 2026` (long month, no trailing "г.") ✓
- Tags: `bg-brand-primary-soft/30` teal badges ✓

**Homepage** (`dist/{en,ru}/index.html`):
- Both locales render `grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5` ✓
- BlogPreview section has NO `bg-surface/30` (transparent) ✓

**Blog indexes** (`dist/{en,ru}/blog/index.html`):
- 3-col BlogCard grid ✓
- Teal badges present ✓
- Back-link: `← {Back to Home | Назад на главную}` ✓

## Commits

1. **687a73f** — `feat(09-01): tighten blog schema + wire reading-time remark plugin + add blog.min_read key`
   - Files: package.json, package-lock.json, remark-reading-time.mjs, astro.config.mjs, src/content.config.ts, src/data/search-index.ts, src/i18n/en.json, src/i18n/ru.json
   - Duration: ~1m 30s (includes npm install)

2. **ba682a4** — `feat(09-01): extract BlogCard + rewrite BlogPreview + rewrite /blog/ index pages`
   - Files: src/components/BlogCard.astro (new), src/components/BlogPreview.astro, src/pages/en/blog/index.astro, src/pages/ru/blog/index.astro
   - Duration: ~1m 30s

3. **4736ce6** — `feat(09-01): slug page byline + teal tags + mono date + larger h1 + RU Cyrillic author render`
   - Files: src/pages/en/blog/[...slug].astro, src/pages/ru/blog/[...slug].astro
   - Duration: ~1m 30s

Total duration: **4m 51s**

## Deviations from Plan

None. Plan executed exactly as written.

## Known Stubs

None. All components render production-ready markup. Empty-state strings ("Posts coming soon..." / "Посты появятся скоро...") are inline per UI-SPEC Q1 — intentional, not a stub.

## Notes for Wave 2 (Skill)

The `.claude/skills/vv-blog-from-vault/` skill should document:

**Frontmatter Schema Reference:**
```yaml
---
title: "Post Title"
description: "Short description (1-2 sentences)"
date: 2026-MM-DD
tags: ["tag1", "tag2"]  # REQUIRED — must be present
draft: false             # omit or false to publish
# Optional fields (can be omitted):
# author: "Viktor Vedmich"    # default — omit for both EN and RU (RU slug page translates to Cyrillic automatically)
# reading_time: N              # auto-computed by remark plugin if omitted
# cover_image: "/path/to.jpg"  # schema-ready but not rendered in Phase 9
---
```

**Key points for the skill:**
1. `tags` is a **required** field — skill must always generate at least one tag
2. `author` defaults to "Viktor Vedmich" — **skill should omit this field from generated frontmatter for both EN and RU posts**. The RU slug page translates the Latin default to Cyrillic "Виктор Ведмич" at render time via the locale-aware `authorDisplay` constant, so RU posts do NOT need an `author:` frontmatter override
3. `reading_time` is optional — skill can omit; the remark plugin will compute it at build time
4. `cover_image` is schema-ready but NOT rendered in Phase 9 — skill can omit or add a vault image path for future use
5. Inline images must use root-absolute paths: `/blog-assets/{slug}/image.png` (not `./image.png`)
6. Vault references (`[[wikilinks]]`) must be expanded to web-friendly prose or external links

## Notes for Wave 3 (Content)

Three posts to write (EN + RU = 6 files total):
1. **Karpenter: Right-sizing at scale** (REQ-002)
2. **MCP Servers: The future of AI workflows**
3. **Kubernetes Manifests 101**

**Frontmatter for all 6 files:**
- `tags:` required — use vault keywords (e.g., `["kubernetes", "karpenter", "cost-optimization"]`)
- `author:` omit (defaults to "Viktor Vedmich"; RU slug page renders Cyrillic automatically)
- `reading_time:` omit (remark plugin computes at build)
- `draft: false` to publish

**Locale-aware author rendering verified:** `src/content/blog/ru/hello-world.md` has NO `author:` field in frontmatter. The RU slug page renders `Виктор Ведмич · 1 мин чтения` via the `authorDisplay` constant, proving the pattern works for all RU posts.

## Self-Check: PASSED

**Files created:**
```bash
$ test -f src/components/BlogCard.astro
FOUND: src/components/BlogCard.astro
$ test -f remark-reading-time.mjs
FOUND: remark-reading-time.mjs
```

**Commits exist:**
```bash
$ git log --oneline --all | grep -E "687a73f|ba682a4|4736ce6"
4736ce6 feat(09-01): slug page byline + teal tags + mono date + larger h1 + RU Cyrillic author render
ba682a4 feat(09-01): extract BlogCard + rewrite BlogPreview + rewrite /blog/ index pages
687a73f feat(09-01): tighten blog schema + wire reading-time remark plugin + add blog.min_read key
```

**Build green:**
```bash
$ npm run build
[build] 25 page(s) built in 856ms
[build] Complete!
```

**Zero hardcoded hex:**
```bash
$ grep -cE '#[0-9a-fA-F]{6}' src/components/BlogCard.astro src/components/BlogPreview.astro \
  src/pages/en/blog/index.astro src/pages/ru/blog/index.astro \
  "src/pages/en/blog/[...slug].astro" "src/pages/ru/blog/[...slug].astro"
0
```

**RU byline renders Cyrillic (BLOCKER-1 verification):**
```bash
$ grep -o "Виктор Ведмич · [0-9]* мин чтения" dist/ru/blog/hello-world/index.html
Виктор Ведмич · 1 мин чтения

$ grep -q "Viktor Vedmich · " dist/ru/blog/hello-world/index.html && echo "FAIL: Latin leaked" || echo "PASS: No Latin leak"
PASS: No Latin leak
```

All claims verified. Wave 1 UI foundation is complete and production-ready.
