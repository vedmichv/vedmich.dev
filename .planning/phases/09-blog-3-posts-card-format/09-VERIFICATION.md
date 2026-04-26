---
phase: 09-blog-3-posts-card-format
verified: 2026-04-26T22:40:00Z
status: human_needed
score: 13/13 must-haves verified
re_verification: false
human_verification:
  - test: "Visual fidelity check — BlogCard layout vs reference app.jsx:553-574"
    expected: "4-row card structure (date overline / title / description / teal tag badges) matches reference at 1440px + 375px viewports. No slug URL row (internal routes). Card hover shifts title to teal + card-glow border/shadow transition."
    why_human: "Pixel-level layout verification requires visual rendering. Automated checks confirm structure exists (dist HTML contains correct classes), but exact spacing/alignment needs visual inspection."
  - test: "Prose quality of 3 new posts — voice alignment with D-31 tech-expert register"
    expected: "Posts follow voice-guide.md rules: tech-expert first-person, no AI vocabulary (delve/landscape/tapestry), contractions, varied sentence length, concrete opening details only Viktor would know."
    why_human: "Prose quality requires human judgment — anti-AI vocabulary scan is automated but voice register (tech-expert stance, natural contractions, sentence rhythm) needs human reading."
  - test: "RU translation quality — natural Russian with tech terms in Latin per D-30"
    expected: "RU posts read naturally in Russian. Tech terms (Karpenter, NodePool, MCP server, YAML, kubectl) stay Latin. Concepts translate where natural (кластер, консолидация). Code blocks byte-identical EN/RU."
    why_human: "Translation naturalness requires native/fluent Russian speaker judgment. Automated checks confirm tech-term preservation and code-block identity, but sentence flow quality is subjective."
  - test: "Manifests post grounding review — professional-experience vs recall/diary"
    expected: "Manifests opinion post reads as grounded professional experience, not fabricated. Per 09-03-SUMMARY.md deviation note: diary grep yielded 0 hits, executor wrote from professional experience per voice-guide.md opinion register permission."
    why_human: "Grounding source verification requires user (Viktor) to confirm the manifests post reflects real professional experience. Executor flagged this post as 'review before publish' due to diary-grep deviation."
  - test: "Live deploy verification — all 6 slug pages render correctly on vedmich.dev"
    expected: "After user pushes commits (NOT YET PUSHED per D-47 / 09-03-SUMMARY.md), GH Actions deploys in ~60-90s. All 6 slug pages (3 posts × 2 locales) render correctly on live site: bylines, teal tags, inline images (Karpenter), Related sections (Karpenter + MCP)."
    why_human: "Live URL verification happens AFTER user pushes to main. Commits remain local per STATE.md manual-verification preference. Automated checks confirm dist/ build output is correct; live-site check is post-push."
  - test: "Homepage BlogPreview card hover state — title/border/shadow transitions"
    expected: "Hover any BlogCard on homepage /en/ or /ru/: title text shifts from text-text-primary to text-brand-primary (#14B8A6), card border shifts to brand-primary, box-shadow adds teal glow (card-glow utility)."
    why_human: "CSS :hover state inspection requires browser DevTools or visual confirmation. Automated checks confirm .card-glow class exists in dist HTML + global.css defines the transition, but live hover behavior needs visual test."
---

# Phase 9: Blog — 3 Posts with Correct Card Format — VERIFICATION REPORT

**Phase Goal (from ROADMAP.md):** Ship the blog card format matching reference `app.jsx:553-574` AND author 3 vault-grounded posts (EN + RU) using a new reusable project-local skill.

**Verified:** 2026-04-26T22:40:00Z  
**Status:** human_needed (all automated checks passed; 6 human verification items await user action)  
**Re-verification:** No — initial verification

---

## Summary

Phase 9 delivered its goal: (1) Blog card format now matches reference UI kit with 4-row BlogCard structure (date overline / display title / body excerpt / teal tag badges) deployed across homepage BlogPreview, full /blog/ index pages, and (2) 3 vault-grounded posts shipped × 2 locales = 6 markdown files (Karpenter deep-dive with 4 reused carousel PNGs, MCP explainer citing upcoming Warsaw chalk talk, manifests opinion from professional experience). All 13 must-haves verified programmatically. 6 items require human verification before publication: visual fidelity, prose quality, RU translation quality, manifests grounding review, live-deploy check, hover-state animation verification. All commits remain local per user's manual-verification preference (STATE.md) — NOT YET PUSHED to main.

---

## Goal Achievement

### Observable Truths

| # | Truth | Status | Evidence |
|---|-------|--------|----------|
| 1 | BlogCard renders with 4 rows (date overline / title / description / teal tag badges) matching PresentationCard minus slug URL row | ✓ VERIFIED | `src/components/BlogCard.astro` exists (52 lines), contains typed props `CollectionEntry<'blog'>`, renders 4-row structure per plan. Class chains match PresentationCard for teal Badge tokens (`bg-brand-primary-soft/30 border border-brand-primary/40 text-brand-primary`). No `displayUrl` / no row 4 slug URL line (internal routes). dist HTML contains correct structure. |
| 2 | Homepage BlogPreview shows top 3 non-draft posts in 3-column grid on desktop | ✓ VERIFIED | `dist/en/index.html` + `dist/ru/index.html` contain `grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5` class on BlogPreview section. Search index JSON shows 3 newest posts by date desc: Karpenter (2026-03-20), hello-world (2026-03-03), MCP (2026-03-02). Manifests (2026-02-10) older than hello-world → visible on /blog/ index only. |
| 3 | Section wrapper is transparent (no bg-surface/30) so it inherits bg-bg-base for zebra rhythm | ✓ VERIFIED | `src/components/BlogPreview.astro` section class is `py-20 sm:py-28` (NO `bg-surface/30`). Grep confirms no background tint on section wrapper. |
| 4 | Full /blog/ index pages list all non-draft posts in 3-column grid at both /en/blog/ and /ru/blog/ | ✓ VERIFIED | `dist/en/blog/index.html` + `dist/ru/blog/index.html` exist (both contain same 3-col grid class). 4 posts total (hello-world + 3 new) render in both locales. |
| 5 | Slug pages render date as mono xs short-month with RU 'г.' suffix stripped, h1 at text-4xl sm:text-5xl tracking-[-0.02em], teal tag badges, and a byline showing {author} · {reading_time} {min_read_label} | ✓ VERIFIED | EN slug pages: `Viktor Vedmich · N min read` (7/6/5/1 for Karpenter/MCP/Manifests/hello-world). RU slug pages: `Виктор Ведмич · N мин чтения` (same reading times). Date format: EN uses `Mar 20, 2026` (short month), RU uses `20 марта 2026` (long month, no trailing "г." per `.replace(/\s*г\.?$/, '')`). h1 class confirmed `text-4xl sm:text-5xl tracking-[-0.02em]` in dist HTML. Teal tag badges present (`bg-brand-primary-soft/30`). |
| 6 | RU slug page bylines render 'Виктор Ведмич · N мин чтения' via Wave 1 Task 3 locale-aware render — NO RU post frontmatter contains an `author:` override (verified via grep) | ✓ VERIFIED | Fleet-wide RU author check PASSED: `for f in src/content/blog/ru/*.md; do ! grep -q '^author:' "$f"; done` exits 0. All 4 RU posts (hello-world + 3 new) omit `author:` field. dist/ru/blog/*/index.html files all contain `Виктор Ведмич · ` byline (Cyrillic). NO Latin leak: `grep 'Viktor Vedmich · ' dist/ru/blog/*/index.html` returns no matches. Wave 1 Task 3 `authorDisplay` locale-aware render confirmed working. |
| 7 | Blog schema accepts required tags plus optional author/reading_time/cover_image without breaking hello-world.md | ✓ VERIFIED | `src/content.config.ts` blog schema: `tags: z.array(z.string())` (required, no `.optional()`), `author: z.string().default('Viktor Vedmich')`, `reading_time: z.number().optional()`, `cover_image: z.string().optional()`. `npm run build` exits 0 with 31 pages → hello-world.md validates (has tags, omits author/reading_time/cover_image). |
| 8 | Reading time auto-computes at build via remark plugin when frontmatter omits it | ✓ VERIFIED | `remark-reading-time.mjs` exists at repo root (12 lines, official Astro recipe). `astro.config.mjs` registers plugin: `remarkPlugins: [remarkReadingTime]`. Slug pages consume: `const readingTime = post.data.reading_time ?? remarkPluginFrontmatter.minutesRead`. Built HTML bylines show reading times (7/6/5/1 min) computed at build. |
| 9 | npm run build exits 0 with both locales rendering no regressions | ✓ VERIFIED | `npm run build` output: `31 page(s) built in 886ms` ✓. 0 Astro warnings, 0 Zod errors. 8 dist/blog/* directories (4 EN + 4 RU slug pages). |
| 10 | Three new blog posts exist in both EN and RU locales (6 markdown files total) | ✓ VERIFIED | `ls src/content/blog/{en,ru}/*.md` shows 8 files (4 per locale). Phase 9 posts: `2026-03-20-karpenter-right-sizing`, `2026-03-02-mcp-servers-plainly-explained`, `2026-02-10-why-i-write-kubernetes-manifests-by-hand`. All exist in both locales. |
| 11 | Karpenter EN title matches REQ-002 verbatim: 'Karpenter in production: right-sizing at scale' | ✓ VERIFIED | BLOCKER-2 FIX: `grep '^title: "Karpenter in production: right-sizing at scale"$' src/content/blog/en/2026-03-20-karpenter-right-sizing.md` returns exact match. Commit message also uses REQ-002 verbatim: `Post: Karpenter in production: right-sizing at scale`. |
| 12 | Karpenter post reuses 4 carousel PNGs from the vault (inline via root-absolute /blog-assets/... paths), not regenerated | ✓ VERIFIED | `public/blog-assets/2026-03-20-karpenter-right-sizing/` contains 4 PNGs (trap-1-speed, trap-2-race, trap-3-churn, 4-step-rollout). Total size 3.2M. All inline references in markdown use root-absolute paths `![...](/blog-assets/2026-03-20-karpenter-right-sizing/...)`. Grep confirms no relative paths: `grep -rnE '\]\(blog-assets/' src/content/blog/` returns 0 matches. |
| 13 | Content commits use the CLAUDE.md Post: <title> template with NO Co-Authored-By trailer | ✓ VERIFIED | 3 content commits: `103b7e6 Post: Karpenter...`, `51864e1 Post: MCP...`, `21dcb1a Post: Why I still...` — all use `Post:` prefix, NO Co-Authored-By trailer. 1 infrastructure commit: `0258d23 docs(09): close Phase 9...` — HAS Co-Authored-By trailer per CLAUDE.md convention. |

**Score:** 13/13 truths verified

---

### Required Artifacts

All 13 artifacts PASSED Level 1 (exists), Level 2 (substantive), Level 3 (wired):

| Artifact | Expected | Status | Details |
|----------|----------|--------|---------|
| `src/components/BlogCard.astro` | Typed BlogCard component consumed by BlogPreview + /blog/ index | ✓ VERIFIED | 52 lines, contains `CollectionEntry<'blog'>` typed props, 4-row structure (date overline / title / description / tags), imported by BlogPreview.astro + both blog/index.astro files. Level 3 WIRED: 3 imports found. |
| `src/components/BlogPreview.astro` | Homepage blog section (top 3 cards) | ✓ VERIFIED | 31 lines, imports BlogCard, queries collection with `.slice(0, 3)`, transparent section (no bg-surface/30), `max-w-[1120px]` container, 3-col grid. Level 3 WIRED: used in homepage index.astro (both locales). |
| `src/pages/en/blog/index.astro` | EN full blog list page | ✓ VERIFIED | 42 lines, imports BlogCard, queries collection, 3-col grid, back-link. Level 3 WIRED: generates dist/en/blog/index.html. |
| `src/pages/ru/blog/index.astro` | RU full blog list page | ✓ VERIFIED | 42 lines, mirrors EN with RU deltas (Cyrillic title, RU description, RU empty-state string). Level 3 WIRED: generates dist/ru/blog/index.html. |
| `src/pages/en/blog/[...slug].astro` | EN slug page with byline + teal tags + larger h1 | ✓ VERIFIED | 76 lines, imports `t` utils, destructures `remarkPluginFrontmatter`, renders byline `{post.data.author} · {readingTime} {i.blog.min_read}`, h1 `text-4xl sm:text-5xl`, teal tag badges. Level 3 WIRED: generates 4 EN slug pages. |
| `src/pages/ru/blog/[...slug].astro` | RU slug page with byline + teal tags + larger h1 + RU 'г.' strip + locale-aware Cyrillic author render | ✓ VERIFIED | 80 lines, contains `const authorDisplay = post.data.author === 'Viktor Vedmich' ? 'Виктор Ведмич' : post.data.author;`, renders byline `{authorDisplay} · {readingTime} {i.blog.min_read}`, includes `.replace(/\s*г\.?$/, '')` for date. Level 3 WIRED: generates 4 RU slug pages with Cyrillic bylines. |
| `src/content.config.ts` | Blog schema with required tags + author/reading_time/cover_image | ✓ VERIFIED | 60 lines, exports blog collection with `tags: z.array(z.string())` (required), `author: z.string().default('Viktor Vedmich')`, `reading_time: z.number().optional()`, `cover_image: z.string().optional()`. Level 3 WIRED: Zod validates at build time. |
| `src/i18n/en.json` | EN i18n with new blog.min_read key | ✓ VERIFIED | Contains `"min_read": "min read"` in blog block. Level 3 WIRED: consumed by EN slug page. |
| `src/i18n/ru.json` | RU i18n with new blog.min_read key | ✓ VERIFIED | Contains `"min_read": "мин чтения"` in blog block. Level 3 WIRED: consumed by RU slug page. |
| `remark-reading-time.mjs` | Official Astro reading-time remark plugin at repo root | ✓ VERIFIED | 12 lines, exports `remarkReadingTime()`, sets `data.astro.frontmatter.minutesRead`. Level 3 WIRED: imported by astro.config.mjs. |
| `astro.config.mjs` | Astro config with remarkReadingTime registered | ✓ VERIFIED | 21 lines, contains `markdown: { remarkPlugins: [remarkReadingTime] }`. Level 3 WIRED: plugin runs at build, computed reading times present in dist HTML bylines. |
| `src/content/blog/en/2026-03-20-karpenter-right-sizing.md` | Karpenter deep-dive (EN, ~1500-2500 words) — title matches REQ-002 verbatim | ✓ VERIFIED | 1316 words (floor 1275 ✓), 89 lines, title matches REQ-002 VERBATIM, 4 inline images via root-absolute paths, Related section cites carousel + Warsaw talk. Level 3 WIRED: generates dist/en/blog/2026-03-20-karpenter-right-sizing/index.html. |
| `src/content/blog/en/2026-03-02-mcp-servers-plainly-explained.md` | MCP explainer (EN, ~800-1200 words) | ✓ VERIFIED | 1214 words (floor 680 ✓), 94 lines, Related section cites Warsaw chalk talk DOP202. Level 3 WIRED: generates dist/en/blog/2026-03-02-mcp-servers-plainly-explained/index.html. |
| `src/content/blog/en/2026-02-10-why-i-write-kubernetes-manifests-by-hand.md` | Manifests opinion (EN, ~700-1000 words) | ✓ VERIFIED | 966 words (floor 600 ✓), 81 lines, standalone (no Related section). Level 3 WIRED: generates dist/en/blog/2026-02-10-why-i-write-kubernetes-manifests-by-hand/index.html. |

**All 6 RU posts** (hello-world + 3 new) verified: full body translation, NO `author:` frontmatter field, Cyrillic bylines render via Wave 1 Task 3 locale-aware `authorDisplay` constant.

**4 Karpenter carousel PNGs** verified copied: trap-1-speed.png (2.3M), trap-2-race.png (355K), trap-3-churn.png (300K), 4-step-rollout.png (257K) — total 3.2M.

---

### Key Link Verification

All 5 key links VERIFIED:

| From | To | Via | Status | Details |
|------|----|----|--------|---------|
| `src/components/BlogPreview.astro` | `src/components/BlogCard.astro` | import BlogCard | ✓ WIRED | `import BlogCard from './BlogCard.astro'` present, `<BlogCard post={post} locale={locale} />` renders in grid. |
| `src/pages/en/blog/index.astro` | `src/components/BlogCard.astro` | import BlogCard (relative path) | ✓ WIRED | `import BlogCard from '../../../components/BlogCard.astro'` present, iteration renders cards. |
| `src/pages/ru/blog/index.astro` | `src/components/BlogCard.astro` | import BlogCard (relative path) | ✓ WIRED | `import BlogCard from '../../../components/BlogCard.astro'` present, iteration renders cards. |
| `astro.config.mjs` | `remark-reading-time.mjs` | import remarkReadingTime | ✓ WIRED | `import { remarkReadingTime } from './remark-reading-time.mjs'`, registered in `markdown.remarkPlugins` array. |
| `src/pages/en/blog/[...slug].astro` | `src/i18n/en.json` | t('en').blog.min_read | ✓ WIRED | `const i = t(locale)`, renders `{i.blog.min_read}` in byline, dist HTML contains "min read". |
| `src/pages/ru/blog/[...slug].astro` | Cyrillic author rendering | authorDisplay constant — translates Latin 'Viktor Vedmich' to 'Виктор Ведмич' at render time | ✓ WIRED | `const authorDisplay = post.data.author === 'Viktor Vedmich' ? 'Виктор Ведмич' : post.data.author;` present at line 17, byline renders `{authorDisplay}`, dist HTML contains Cyrillic bylines for all 4 RU posts. |

---

### Data-Flow Trace (Level 4)

Not applicable — blog posts are static markdown files, not dynamic data sources. BlogCard receives typed `CollectionEntry<'blog'>` props from parent components; data flows from markdown frontmatter + body → Astro collection query → BlogCard props → rendered HTML. No empty/hardcoded stub values observed.

---

### Requirements Coverage

| Requirement | Source Plan | Description | Status | Evidence |
|-------------|------------|-------------|--------|----------|
| REQ-002 | 09-01, 09-02, 09-03 | Blog: 3 published posts | ✓ SATISFIED | **Acceptance from REQ-002:** (1) 6 new files created (3 EN + 3 RU), (2) Homepage BlogPreview shows 3 cards (Karpenter + hello-world + MCP by date desc), (3) `/en/blog/<slug>` and `/ru/blog/<slug>` render correctly. **BLOCKER-2 fix:** Karpenter EN title `"Karpenter in production: right-sizing at scale"` matches REQ-002 L42 VERBATIM. MCP EN title `"MCP servers, plainly explained"` matches REQ-002 L43. Manifests EN title `"Why I still write Kubernetes manifests by hand"` matches REQ-002 L44. All 3 posts sourced from Obsidian vault per REQ-002 acceptance (Karpenter via carousel + talk notes, MCP via chalk talk CFP + lesson notes, Manifests via professional experience per voice-guide.md opinion register). |

---

### Anti-Patterns Found

Zero anti-patterns found. No hex hygiene violations (all modified files use design tokens). No relative image paths (deploy-post.sh grep gate passed). No AI vocabulary in voice-guide.md ban list detected in spot-check of Karpenter lede + MCP intro. No stub implementations — all 6 posts are substantive content (3496 EN words total, 3139 RU words total).

---

### Human Verification Required

**6 items need human testing before publication:**

#### 1. Visual fidelity check — BlogCard layout vs reference app.jsx:553-574

**Test:** Open `/en/` and `/ru/` homepages in browser at 1440px viewport. Inspect BlogPreview section. Compare card layout to reference `app.jsx:553-574` (from viktor-vedmich-design skill UI kit).

**Expected:**
- 4-row structure: date overline (mono xs text-text-muted) / title (text-lg font-display) / description (text-sm text-text-secondary) / teal tag badges (uppercase mono, `bg-brand-primary-soft/30 border border-brand-primary/40`).
- No slug URL row (BlogCard is 4 rows, PresentationCard is 5 rows).
- Card padding `p-6` (24px), grid gap `gap-5` (20px).
- Card hover: title shifts to teal (`text-brand-primary`), border+shadow glow via `.card-glow` utility.

**Why human:** Pixel-level layout verification requires visual rendering. Automated checks confirm structure exists (dist HTML contains correct classes), but exact spacing/alignment needs visual inspection.

#### 2. Prose quality of 3 new posts — voice alignment with D-31 tech-expert register

**Test:** Read through all 3 EN posts: Karpenter, MCP, Manifests. Check voice against `.claude/skills/vv-blog-from-vault/references/voice-guide.md` rules.

**Expected:**
- Tech-expert first-person stance: "I've seen this fail" over "Some teams find…"
- No AI vocabulary (ban list: delve, landscape, tapestry, harness, leverage, utilize, pivotal, seamless, groundbreaking, realm, navigate the complexities, at the forefront).
- Contractions present (`I've`, `don't`, `it's`, `here's`).
- Varied sentence length (short punches + longer winding sentences).
- Concrete opening details only Viktor would know (Salesforce 1000+ clusters stat, client reactions, dates, CLI output).

**Why human:** Prose quality requires human judgment — anti-AI vocabulary scan is automated but voice register (tech-expert stance, natural contractions, sentence rhythm) needs human reading.

#### 3. RU translation quality — natural Russian with tech terms in Latin per D-30

**Test:** Read through all 3 RU posts. Check translation against `.claude/skills/vv-blog-from-vault/references/translation-rules.md`.

**Expected:**
- RU prose reads naturally in Russian (not machine-translated word-for-word).
- Tech terms stay in Latin: `Karpenter`, `NodePool`, `MCP server`, `YAML`, `kubectl`, `Cluster Autoscaler`, flag names, AWS service names.
- Concepts translate where natural: "cluster" → "кластер", "consolidation" → "консолидация", "в продакшне", "в масштабе".
- Code blocks byte-identical between EN and RU files (grep diff confirms this automatically, but human should spot-check one code block per post).
- Headings translate: `## Why this trips teams up` → `## Почему тут путаются команды`.

**Why human:** Translation naturalness requires native/fluent Russian speaker judgment. Automated checks confirm tech-term preservation and code-block identity, but sentence flow quality is subjective.

#### 4. Manifests post grounding review — professional-experience vs recall/diary

**Test:** Read `src/content/blog/en/2026-02-10-why-i-write-kubernetes-manifests-by-hand.md` and verify it reflects real professional experience (not fabricated opinion).

**Expected:** Opinion post reads as grounded professional experience. Per 09-03-SUMMARY.md deviation note (D-48): "Diary grep for 'manifest/helm/kustomize' yielded 0 hits from 15 diary files. Per plan deviation note, wrote post from professional experience instead of halting." This is acceptable per `voice-guide.md` opinion register — professional-experience grounding is valid for opinion pieces. User (Viktor) should confirm the post reflects real professional experience.

**Why human:** Grounding source verification requires user (Viktor) to confirm the manifests post reflects real professional experience. Executor flagged this post as "review before publish" due to diary-grep deviation — only user can confirm authenticity.

#### 5. Live deploy verification — all 6 slug pages render correctly on vedmich.dev

**Test:** After user pushes commits to main (NOT YET PUSHED per D-47 / 09-03-SUMMARY.md), wait ~60-90s for GH Actions to deploy. Visit all 6 slug pages on live site:
- `/en/blog/2026-03-20-karpenter-right-sizing`
- `/ru/blog/2026-03-20-karpenter-right-sizing`
- `/en/blog/2026-03-02-mcp-servers-plainly-explained`
- `/ru/blog/2026-03-02-mcp-servers-plainly-explained`
- `/en/blog/2026-02-10-why-i-write-kubernetes-manifests-by-hand`
- `/ru/blog/2026-02-10-why-i-write-kubernetes-manifests-by-hand`

**Expected:**
- All 6 pages render without 404 errors.
- Bylines: EN pages show `Viktor Vedmich · N min read`, RU pages show `Виктор Ведмич · N мин чтения`.
- Teal tag badges render correctly (uppercase, mono font, teal border+text).
- Karpenter post: 4 inline images load correctly (trap-1-speed, trap-2-race, trap-3-churn, 4-step-rollout).
- Karpenter + MCP posts: Related section renders at end-of-post with companion links.

**Why human:** Live URL verification happens AFTER user pushes to main. Commits remain local per STATE.md manual-verification preference. Automated checks confirm dist/ build output is correct; live-site check is post-push.

#### 6. Homepage BlogPreview card hover state — title/border/shadow transitions

**Test:** Open `/en/` or `/ru/` homepage in browser. Hover over any BlogCard in the BlogPreview section (should show 3 cards: Karpenter, hello-world, MCP).

**Expected:**
- Hover: card title text shifts from `text-text-primary` (#E2E8F0) to `text-brand-primary` (#14B8A6).
- Card border shifts to `border-brand-primary`.
- Box-shadow adds teal glow (`.card-glow` utility defines `box-shadow: 0 0 0 1px var(--brand-primary), 0 4px 16px rgba(20, 184, 166, 0.24)`).
- Transition is smooth (CSS `transition-colors` + `card-glow` transition).

**Why human:** CSS :hover state inspection requires browser DevTools or visual confirmation. Automated checks confirm `.card-glow` class exists in dist HTML + `global.css` defines the transition, but live hover behavior needs visual test.

---

### Gaps Summary

**No gaps found.** All 13 must-haves verified programmatically. Phase goal achieved: blog card format matches reference UI kit AND 3 vault-grounded posts shipped × 2 locales. 6 items routed to human verification (visual fidelity, prose quality, RU translation quality, manifests grounding review, live deploy check, hover state) — all are post-verification QA steps, not blockers.

**Commits remain local** per D-47 / 09-03-SUMMARY.md — user prefers manual verification before pushing to main. 4 commits ready to push: 3 content commits (`Post: <title>`) + 1 infrastructure commit (`docs(09): close Phase 9`).

---

_Verified: 2026-04-26T22:40:00Z_  
_Verifier: Claude (gsd-verifier)_  
_Build green: 31 pages in 886ms_  
_Score: 13/13 must-haves verified_  
_Status: human_needed (6 items await user action)_
