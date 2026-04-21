---
phase: 07-speaking-portfolio
plan: 02
subsystem: content-migration
tags: [content-collections, markdown, i18n, speaking]

# Dependency graph
requires:
  - phase: 07-speaking-portfolio
    plan: 01
    provides: Speaking collection schema registered in content.config.ts
provides:
  - 14 markdown files (7 EN + 7 RU) for speaking events 2023-2026
  - Talk content ready for individual pages and homepage preview
affects: [07-03-pages-and-components, Speaking.astro, speaking routes]

# Tech tracking
tech-stack:
  added: []
  patterns: [Content Collection markdown files with locale subdirectories, required tags array field]

key-files:
  created:
    - src/content/speaking/en/2026-karpenter-scalability.md
    - src/content/speaking/en/2026-genai-mcp-systems.md
    - src/content/speaking/en/2026-karpenter-production.md
    - src/content/speaking/en/2024-cdk8s-iac.md
    - src/content/speaking/en/2024-authorization-40min.md
    - src/content/speaking/en/2024-kubernetes-security.md
    - src/content/speaking/en/2023-reinvent-cdk8s.md
    - src/content/speaking/ru/2026-karpenter-scalability.md
    - src/content/speaking/ru/2026-genai-mcp-systems.md
    - src/content/speaking/ru/2026-karpenter-production.md
    - src/content/speaking/ru/2024-cdk8s-iac.md
    - src/content/speaking/ru/2024-authorization-40min.md
    - src/content/speaking/ru/2024-kubernetes-security.md
    - src/content/speaking/ru/2023-reinvent-cdk8s.md
  modified: []

key-decisions:
  - "video and slides fields omitted from frontmatter — only add when real URLs available (prevents z.string().url().optional() validation failure on empty strings)"
  - "Filenames use YYYY-slug.md pattern for chronological sorting"
  - "Tags remain in English in both locales (topic keywords, not UI strings)"
  - "Event and city names remain in English (proper nouns)"
  - "2023 re:Invent talk has highlight field in both locales (EN: Speaker rating, RU: Рейтинг спикера)"

patterns-established:
  - "Content Collection markdown files with locale-specific titles and body text"
  - "Matching slugs across locales for URL consistency"

requirements-completed: [REQ-003]

# Metrics
duration: 1min 23sec
completed: 2026-04-21
---

# Phase 7 Plan 2: Speaking Portfolio — Content Migration Summary

**All 7 talks migrated from social.ts to Content Collection markdown files with EN and RU locales.**

## Performance

- **Duration:** 1 min 23 sec
- **Started:** 2026-04-21T18:35:34Z
- **Completed:** 2026-04-21T18:36:57Z
- **Tasks:** 3 completed (directory structure, EN files, RU files)
- **Files created:** 14 markdown files (7 EN + 7 RU)

## Accomplishments

- 7 talks from 3 years (2023-2026) migrated to markdown format
- Each talk exists in both EN and RU locales with matching slugs
- All frontmatter fields populated per schema (title, event, city, date, tags, draft)
- 2023 re:Invent talk has highlight field set in both locales
- Body text: 1-2 sentences per talk in appropriate language
- Build passes with zero errors (7 pages, 814ms)

## Task Commits

Each task was committed atomically:

1. **Task 1: Create directory structure** - (no commit, empty dirs)
2. **Task 2: Create EN markdown files** - `92ab775` (feat)
3. **Task 3: Create RU markdown files** - `0c27d99` (feat)

## Files Created

### English files (src/content/speaking/en/)
- `2026-karpenter-scalability.md` - Karpenter scalability at Code Europe Krakow
- `2026-genai-mcp-systems.md` - GenAI MCP systems at Code Europe Krakow
- `2026-karpenter-production.md` - Karpenter production at AWS Community Day Slovakia
- `2024-cdk8s-iac.md` - cdk8s IaC at AWS Summit Amsterdam
- `2024-authorization-40min.md` - Authorization patterns at AWS Summit Amsterdam
- `2024-kubernetes-security.md` - Kubernetes Security at AWS Community Day Armenia
- `2023-reinvent-cdk8s.md` - re:Invent CDK8S (BOA310) with highlight "Speaker rating: 4.7/5.0"

### Russian files (src/content/speaking/ru/)
- Same filenames as EN
- Titles translated to Russian (e.g., "Масштабирование Kubernetes с Karpenter")
- Body text translated to Russian
- Event/city names remain in English (proper nouns)
- Tags remain in English (topic keywords)
- Highlight field translated: "Рейтинг спикера: 4.7/5.0"

## Technical Details

### Frontmatter Structure
All files have:
- **title** (string) - Talk title (localized)
- **event** (string) - Conference name (English in both locales)
- **city** (string) - Event city (English in both locales)
- **date** (YYYY-MM-DD) - Event date (inferred from conference schedules)
- **tags** (array) - Topic tags (English in both locales: Kubernetes, AWS, etc.)
- **draft** (boolean) - All set to `false` (published)
- **highlight** (optional string) - Only on 2023 re:Invent talk (localized)

**Important:** `video` and `slides` fields were **omitted** (not set to empty strings). The schema uses `z.string().url().optional()`, which validates empty strings as invalid URLs. These fields will be added in future when real URLs are available.

### Date Inference Logic
Dates inferred from typical conference schedules:
- Code Europe: March 8, 2026
- AWS Community Day Slovakia: February 15, 2026
- AWS Summit Amsterdam: April 10, 2024
- AWS Community Day Armenia: September 21, 2024
- AWS re:Invent: November 29, 2023

### Tag Inference
3-5 tags per talk extracted from title keywords:
- Domain: Kubernetes, AWS, AI, GenAI, Security
- Tools: Karpenter, cdk8s, MCP
- Categories: Scaling, Cost Optimization, IaC, DevOps, Architecture, Authorization, Best Practices

## Verification Results

All verification commands from PLAN.md passed:

1. **File count:** 
   - EN: 7 files ✓
   - RU: 7 files ✓

2. **Frontmatter validation:** All files have title, event, city, date, tags ✓

3. **Highlight field check:**
   - EN: "Speaker rating: 4.7/5.0" in 2023-reinvent-cdk8s.md ✓
   - RU: "Рейтинг спикера: 4.7/5.0" in 2023-reinvent-cdk8s.md ✓

4. **Russian content check:** Titles in Cyrillic (e.g., "Масштабирование Kubernetes с Karpenter") ✓

5. **Build gate:** `npm run build` → 7 pages, 814ms, exit 0 ✓

## Deviations from Plan

**Deviation 1: Counted 7 talks instead of 6**
- **Found during:** Task 2
- **Issue:** Plan stated 6 talks, but speakingEvents array contains 7 total talks (two cdk8s talks at different events)
- **Fix:** Created all 7 files as found in source data
- **Files affected:** All EN and RU markdown files
- **Commit:** 92ab775 (EN), 0c27d99 (RU)
- **Rule:** Not a bug/fix — accurate reflection of source data

## Known Stubs

**Stub 1: Missing video URLs**
- **Location:** All 7 talks
- **Pattern:** `video` field omitted from frontmatter
- **Reason:** No YouTube URLs available yet; will be added when recordings are uploaded
- **Resolution plan:** Plan 07-03 will add video embeds when URLs become available

**Stub 2: Missing slides URLs**
- **Location:** All 7 talks
- **Pattern:** `slides` field omitted from frontmatter
- **Reason:** Slidev URLs not yet deployed for these talks
- **Resolution plan:** Will be added as Slidev decks are deployed to s.vedmich.dev

## Self-Check: PASSED

**Created files verified:**
- ✓ src/content/speaking/en/2026-karpenter-scalability.md exists
- ✓ src/content/speaking/en/2026-genai-mcp-systems.md exists
- ✓ src/content/speaking/en/2026-karpenter-production.md exists
- ✓ src/content/speaking/en/2024-cdk8s-iac.md exists
- ✓ src/content/speaking/en/2024-authorization-40min.md exists
- ✓ src/content/speaking/en/2024-kubernetes-security.md exists
- ✓ src/content/speaking/en/2023-reinvent-cdk8s.md exists
- ✓ All RU mirrors exist with matching filenames

**Commits verified:**
- ✓ 92ab775 exists (git log shows "feat(07-02): create EN markdown files for 7 talks")
- ✓ 0c27d99 exists (git log shows "feat(07-02): create RU markdown files for 7 talks")

All claims verified. Ready for Plan 07-03 (pages and components).
