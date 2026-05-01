---
phase: 08-presentations-match-card-format
verified: 2026-04-24T21:07:00Z
status: passed
score: 10/10 must-haves verified
overrides_applied: 0
human_verification:
  - test: "Visually verify tag badge teal alpha rendering on live site (Plan 03 Task 6 decision gate)"
    expected: "Tag badges show visible teal tint on bg-surface — not muddy olive, not invisible. If olive/invisible, apply fallback bg-brand-primary/10 per UI-SPEC checkpoint 8."
    why_human: "Color perception against bg-surface requires human visual judgment. Tailwind 4 `color-mix(in oklab, ..., 30%, transparent)` compiled correctly, but the visual result of #134E4A (brand-primary-soft) at 30% alpha on #1E293B (bg-surface) cannot be assessed programmatically."
  - test: "Visually verify 5-row card layout and 3-col grid at 1440px on https://vedmich.dev/en/#presentations and /en/presentations"
    expected: "Each card renders 5 rows (overline / title / description / slug URL / tags), 3-col desktop grid, card-glow hover with teal border transition, solid teal slug URL text."
    why_human: "Visual fidelity vs reference-1440-full.png requires side-by-side screenshot comparison — component structure is verified via HTML but pixel parity needs eyes."
  - test: "Visually verify both locales render identically at /en/presentations and /ru/presentations"
    expected: "Same card layout, same grid, same back-link style. Only title/description translated; event/city/tags/URLs identical."
    why_human: "Bilingual visual parity is a visual-verify-on-push convention per CLAUDE.md publishing workflow."
---

# Phase 8: Presentations — match card format + portfolio migration — Verification Report

**Phase Goal:** Rewrite homepage Presentations section to match reference `app.jsx:522-551` visual format AND migrate `presentations` data from `src/data/social.ts` to an Astro Content Collection. Add full portfolio index pages at `/{locale}/presentations`. Extract reusable `<PresentationCard>` component. Update `search-index.ts` to query the collection. Keep decks as external links to `s.vedmich.dev/{slug}/`.

**Verified:** 2026-04-24T21:07:00Z
**Status:** passed
**Re-verification:** No — initial verification

## Goal Achievement

### Observable Truths

| #   | Truth                                                                                              | Status     | Evidence                                                                                                                                                                                                                                                                                         |
| --- | -------------------------------------------------------------------------------------------------- | ---------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | Presentations Content Collection registered with 9-field Zod schema                                | ✓ VERIFIED | `src/content.config.ts:31-44` — `defineCollection` with all 9 fields (title, event, city, date, description, tags, slides, video, draft). `city: z.string().nullable()`, `description: z.string()` required, `tags: z.array(z.string())` required, `slides`/`video: z.string().url().optional()`.  |
| 2   | 12 markdown files exist (6 EN + 6 RU) with complete frontmatter mirroring schema                   | ✓ VERIFIED | `src/content/presentations/en/*.md` (6 files) + `src/content/presentations/ru/*.md` (6 files). All filenames match: karpenter-prod, mcp-platform, slurm-prompt-engineering, slurm-ai-demo, eks-multi-az, dkt-workflow. 3 per locale have `city: null` (Slurm ×2 + DKT workflow).                  |
| 3   | Reusable PresentationCard component with typed props and 5-row structure                           | ✓ VERIFIED | `src/components/PresentationCard.astro:4` imports `CollectionEntry<'presentations'>` type. 5 structural rows delimited with `<!-- Row N -->` comments: overline / title / description / slug URL / tags. Whole-card anchor with `target="_blank" rel="noopener noreferrer"`.                      |
| 4   | Homepage Presentations queries Collection, uses PresentationCard, has bg-surface + max-w-[1120px]  | ✓ VERIFIED | `src/components/Presentations.astro:13` calls `getCollection('presentations', ...)` with locale + draft filter. `:24` section has `bg-surface`, `:25` container is `max-w-[1120px] mx-auto px-6`. `:29` "All decks" link points to `/{locale}/presentations` (internal).                         |
| 5   | /{locale}/presentations index pages exist for EN and RU with back_to_home link                     | ✓ VERIFIED | `src/pages/en/presentations/index.astro:1-45` + `src/pages/ru/presentations/index.astro:1-45`. Both use BaseLayout, query collection, render PresentationCard grid, back-link `← {i.back_to_home}` with teal styling. Built HTML `dist/{en,ru}/presentations/index.html` exist (31K + 32K).       |
| 6   | search-index.ts queries presentations collection, no social.ts import, no `as any`                 | ✓ VERIFIED | `src/data/search-index.ts:26` uses `getCollection('presentations', ...)`. Grep for `import.*presentations.*from.*social` returns no matches. Grep for `as any` returns no matches. `SearchItem.tags` type widened to `string[]`.                                                                 |
| 7   | social.ts has exactly 3 exports (socialLinks, certifications, skills) — no presentations           | ✓ VERIFIED | `src/data/social.ts` lines 1, 29, 38 show exactly 3 `export const` declarations. `grep -c "^export const" src/data/social.ts` = 3. No `presentations` export remains.                                                                                                                            |
| 8   | i18n files have {N} placeholder in subtitle + top-level back_to_home key in both locales           | ✓ VERIFIED | `src/i18n/en.json:65` `"{N} talks · all slides at s.vedmich.dev"`, `:81` `"back_to_home": "Back to Home"`. `src/i18n/ru.json:65` `"{N} докладов · все слайды на s.vedmich.dev"`, `:81` `"back_to_home": "Назад на главную"`. Both keys are top-level (not nested).                                |
| 9   | `npm run build` exits 0 with 25 pages                                                              | ✓ VERIFIED | Build log: `[build] 25 page(s) built in 924ms` / `[build] Complete!`. Glob count of `dist/**/index.html` = 25. New pages `dist/en/presentations/index.html` (31K) + `dist/ru/presentations/index.html` (32K) generated.                                                                          |
| 10  | Zero hardcoded hex in Phase 8 files (PresentationCard, Presentations, /presentations/ pages)       | ✓ VERIFIED | Grep for `#[0-9A-Fa-f]{6}` in all 4 paths (PresentationCard.astro, Presentations.astro, pages/en/presentations/, pages/ru/presentations/) returns zero matches. All colors reference Deep Signal tokens (`bg-surface`, `text-brand-primary`, `border-brand-primary/40`, etc.).                    |

**Score:** 10/10 truths verified

### Required Artifacts (Level 1-3 Verification)

| Artifact                                            | Expected                                                             | Status     | Details                                                                                                                                                                                                                       |
| --------------------------------------------------- | -------------------------------------------------------------------- | ---------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `src/content.config.ts`                             | Presentations collection with 9-field Zod schema                     | ✓ VERIFIED | Exists, 46 lines, `defineCollection` present at line 31, `city: z.string().nullable()` at line 36, exported in `collections = { blog, speaking, presentations }` at line 46.                                                  |
| `src/content/presentations/en/*.md`                 | 6 EN markdown files with complete frontmatter                        | ✓ VERIFIED | All 6 files present, all with 8 required fields (title, event, city, date, description, tags, slides, draft). `video` field correctly omitted. Build validated all 12 files successfully.                                    |
| `src/content/presentations/ru/*.md`                 | 6 RU markdown files mirroring EN with Cyrillic title + description   | ✓ VERIFIED | All 6 files present. Titles and descriptions in Cyrillic (e.g. "Karpenter в продакшене"). Event/city/tags/slides/date/draft identical to EN. 3 files have `city: null`.                                                       |
| `src/components/PresentationCard.astro`             | Reusable card with typed props, 5-row structure                      | ✓ VERIFIED | 57 lines. `CollectionEntry<'presentations'>` import. 5 explicit rows. Teal tag badges `bg-brand-primary-soft/30 border-brand-primary/40`. `aria-role="list"` + `role="listitem"` for accessibility. No `as any`, no `<style>`. |
| `src/components/Presentations.astro`                | Rewrite — queries collection, uses PresentationCard, bg-surface, 1120px | ✓ VERIFIED | 43 lines. `getCollection('presentations', ...)`, `.sort()` by date desc, `.slice(0, 6)`, subtitle interpolation via `.replace('{N}', ...)`. `bg-surface` on section, `max-w-[1120px]` on container, internal "All decks" link. |
| `src/pages/en/presentations/index.astro`            | Full EN portfolio page with BaseLayout, back-link, PresentationCard grid | ✓ VERIFIED | 45 lines. BaseLayout with `path="/presentations"`, `locale='en'`, `i.back_to_home` back-link with teal styling. No slice — renders all decks flat date-desc.                                                                |
| `src/pages/ru/presentations/index.astro`            | Full RU portfolio page mirror of EN                                  | ✓ VERIFIED | 45 lines. Identical to EN except `const locale = 'ru';`. Auto-resolves i18n to Russian strings. Renders RU-translated titles.                                                                                                |
| `src/data/search-index.ts`                          | Queries presentations collection, no social.ts import                | ✓ VERIFIED | 63 lines. `getCollection('presentations', ...)` at line 26. No `import { presentations } from './social'`. No `as any`. `tags: string[]` type. Dead `locale_urls` logic removed.                                             |
| `src/data/social.ts`                                | 3 exports only, no presentations                                     | ✓ VERIFIED | 50 lines. `export const socialLinks` (line 1), `export const certifications` (line 29), `export const skills` (line 38). No `presentations` export.                                                                          |
| `src/i18n/en.json`                                  | `{N}` placeholder in subtitle + `back_to_home` top-level key         | ✓ VERIFIED | 82 lines. Line 65 `"subtitle": "{N} talks · all slides at s.vedmich.dev"`. Line 81 `"back_to_home": "Back to Home"` (top-level sibling to `footer`).                                                                          |
| `src/i18n/ru.json`                                  | `{N}` placeholder in subtitle + `back_to_home` top-level key (RU)    | ✓ VERIFIED | 82 lines. Line 65 `"subtitle": "{N} докладов · все слайды на s.vedmich.dev"`. Line 81 `"back_to_home": "Назад на главную"` (top-level).                                                                                   |

### Key Link Verification (Wiring)

| From                                    | To                                        | Via                                          | Status  | Details                                                                                                                                                                  |
| --------------------------------------- | ----------------------------------------- | -------------------------------------------- | ------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `Presentations.astro`                   | `PresentationCard.astro`                  | `import PresentationCard from './PresentationCard.astro'` + `<PresentationCard deck={deck} />` | ✓ WIRED | Built HTML `dist/en/index.html` contains 6 cards with `class="group flex flex-col p-6 rounded-xl bg-surface..."` — verified via `grep -o ... \| wc -l = 6`.             |
| `PresentationCard.astro`                | `https://s.vedmich.dev/{slug}/`           | `<a href={deckUrl} target="_blank" rel="noopener noreferrer">` with `deckUrl = \`https://s.vedmich.dev/${slug}/\`` | ✓ WIRED | Slug derived from `id.replace(/^(en|ru)\//, '')`. Built HTML shows 6 matching anchor elements per locale/page.                                                           |
| `Presentations.astro` "All decks" link  | `/{locale}/presentations`                 | `href={\`/${locale}/presentations\`}`        | ✓ WIRED | Built HTML `dist/en/index.html` contains `<a href="/en/presentations" class="text-sm text-text-muted...">All decks →</a>`. No external `s.vedmich.dev` on "All decks".  |
| Pages `/{locale}/presentations/index.astro` | `back_to_home` i18n key                 | `← {i.back_to_home}`                         | ✓ WIRED | Built HTML `dist/en/presentations/index.html` contains "Back to Home"; `dist/ru/presentations/index.html` contains "Назад на главную".                                  |
| `search-index.ts`                       | `presentations` Content Collection        | `getCollection('presentations', ...)`        | ✓ WIRED | Query executes at build time — same pattern as blog query. `SearchItem.tags: string[]` type widened matches collection emission.                                          |
| `Presentations.astro` subtitle         | Runtime count                              | `i.presentations.subtitle.replace('{N}', String(totalCount))` | ✓ WIRED | Built HTML contains `"6 talks · all slides at s.vedmich.dev"` (EN) / `"6 докладов · все слайды на s.vedmich.dev"` (RU). No `{N}` literal anywhere in `dist/`.          |

### Data-Flow Trace (Level 4)

| Artifact                                     | Data Variable             | Source                                         | Produces Real Data | Status      |
| -------------------------------------------- | ------------------------- | ---------------------------------------------- | ------------------ | ----------- |
| `Presentations.astro` (homepage section)    | `homepageDecks` (6 decks) | `getCollection('presentations', ...)` → 12 markdown files (6 per locale) | Yes — 6 cards per locale render with real titles, events, descriptions, tags, slides URLs | ✓ FLOWING   |
| `pages/en/presentations/index.astro`        | `decks` (all EN decks)    | Same — filtered by `id.startsWith('en/')`      | Yes — 6 cards render with EN titles                                                         | ✓ FLOWING   |
| `pages/ru/presentations/index.astro`        | `decks` (all RU decks)    | Same — filtered by `id.startsWith('ru/')`      | Yes — 6 cards render with RU-translated Cyrillic titles (e.g., "Karpenter в продакшене")   | ✓ FLOWING   |
| `search-index.ts` `slideItems` (⌘K search) | Search index array         | Same — populated from collection query         | Yes — slides with `kind: 'slides'`, URLs point to `https://s.vedmich.dev/{slug}`           | ✓ FLOWING   |
| `PresentationCard.astro`                    | `data.title/description/tags/event/city` | Props `deck: CollectionEntry<'presentations'>` drilled through from parent components | Yes — each card displays its entry's real data | ✓ FLOWING |
| `Presentations.astro` subtitle              | `totalCount` (6)           | `sortedDecks.length` computed before slice     | Yes — "6 talks" renders in EN, "6 докладов" in RU                                          | ✓ FLOWING   |

### Behavioral Spot-Checks

| Behavior                                                         | Command                                                                      | Result                                                  | Status |
| ---------------------------------------------------------------- | ---------------------------------------------------------------------------- | ------------------------------------------------------- | ------ |
| Build exits 0 with exactly 25 pages                              | `npm run build`                                                              | `[build] 25 page(s) built in 924ms / Complete!`         | ✓ PASS |
| Both new portfolio index pages generated                         | `ls dist/{en,ru}/presentations/index.html`                                   | Both files exist (31K + 32K)                            | ✓ PASS |
| Homepage EN subtitle interpolates count                          | `grep "6 talks · all slides at s.vedmich.dev" dist/en/index.html`            | Match found (1 line)                                    | ✓ PASS |
| Homepage RU subtitle interpolates count                          | `grep "6 докладов · все слайды на s.vedmich.dev" dist/ru/index.html`         | Match found (1 line)                                    | ✓ PASS |
| No `{N}` literal leaks anywhere in build output                  | `grep -r '{N}' dist/`                                                        | No matches                                              | ✓ PASS |
| "All decks →" link is internal on homepage                       | `grep 'href="/en/presentations"[^>]*>[^<]*All decks' dist/en/index.html`     | Match found                                             | ✓ PASS |
| EN portfolio page renders 6 PresentationCard instances           | `grep -o 'class="group flex flex-col p-6 ...' dist/en/presentations/index.html \| wc -l` | 6                                                       | ✓ PASS |
| RU portfolio page renders 6 PresentationCard instances           | `grep -o 'class="group flex flex-col p-6 ...' dist/ru/presentations/index.html \| wc -l` | 6                                                       | ✓ PASS |
| Homepage EN/RU each render 6 PresentationCard instances          | Same grep on homepage HTML files                                             | 6 + 6                                                   | ✓ PASS |
| Teal tag-badge alpha compiles in Tailwind 4                      | `grep "color-mix.*in oklab" dist/_astro/*.css`                               | `color-mix(in oklab, ...)` present in compiled CSS      | ✓ PASS |
| EN back-link text renders                                        | `grep "Back to Home" dist/en/presentations/index.html`                       | Match found                                             | ✓ PASS |
| RU back-link text renders (Cyrillic)                             | `grep "Назад на главную" dist/ru/presentations/index.html`                   | Match found                                             | ✓ PASS |
| Karpenter EN title renders                                       | `grep "Karpenter in production" dist/en/presentations/index.html`            | 2 matches (card + meta)                                 | ✓ PASS |

### Requirements Coverage

| Requirement | Source Plan         | Description                              | Status      | Evidence                                                                                                                                                       |
| ----------- | ------------------- | ---------------------------------------- | ----------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| REQ-010     | 08-01, 08-02, 08-03 | Presentations polish (card format + portfolio migration per ROADMAP Phase 8) | ✓ SATISFIED | All 10 must-haves verified. Homepage section rewritten to match `app.jsx:522-551` (bg-surface, max-w-[1120px], 5-row cards, teal tag badges), Content Collection migration complete (collection + 12 markdown files + 2 portfolio index pages + search-index migration + social.ts cleanup). REQ-010 is referenced in ROADMAP Phase 8 and plan frontmatters; `.planning/REQUIREMENTS.md` slot REQ-010 is currently occupied by the About section requirement (known documentation inconsistency noted in 08-CONTEXT.md:128 — "REQ-010 for presentations polish is declared in ROADMAP but not yet inlined here"). Implementation evidence satisfies the presentations polish requirement regardless of the documentation slot conflict. |

### Anti-Patterns Found

| File | Line | Pattern | Severity | Impact |
| ---- | ---- | ------- | -------- | ------ |

No anti-patterns detected. Grep for TODO/FIXME/PLACEHOLDER/not implemented/coming soon returned zero matches across all Phase 8 files. Zero hardcoded hex. No `as any` type casts. No deprecated cyan palette references.

### Human Verification Required

Automated checks pass 10/10 and build generates 25 pages correctly. These items require human eyes for visual validation per CLAUDE.md publishing workflow:

#### 1. Tag badge teal alpha rendering (Plan 03 Task 6 decision gate)

**Test:** Open live site / local preview at `http://localhost:4321/en/#presentations` at 1440×900 viewport. Inspect tag badges on any card (e.g., "KUBERNETES" / "AWS" / "KARPENTER" on Karpenter deck).
**Expected:** Tag badge background shows a visible teal tint (not muddy olive, not invisible against bg-surface). Border clearly teal-hued. Text solid teal `#14B8A6` readable.
**Why human:** The compiled CSS uses `color-mix(in oklab, var(--color-brand-primary-soft) 30%, transparent)` which yields `#134E4A` at 30% alpha on `#1E293B` background — the visual "muddiness" of this result is a perceptual judgment. If olive/invisible, apply the documented fallback: change `bg-brand-primary-soft/30` to `bg-brand-primary/10` in `PresentationCard.astro:51`.

#### 2. 5-row card layout and 3-col grid visual parity vs reference

**Test:** Screenshot `http://localhost:4321/en/#presentations` and `http://localhost:4321/en/presentations` at 1440px. Compare side-by-side with `reference-1440-full.png`.
**Expected:** Cards render 5 rows in order: mono date+event overline, display-18 title, body excerpt, mono teal solid slug URL, teal tag badges. 3-col desktop grid with `gap-5` (20px). `card-glow` hover transitions border to teal.
**Why human:** Pixel fidelity vs reference screenshot. Component structure is HTML-verified (6 card instances per page, 5 row comments in source); visual spacing and hover animation need eyes.

#### 3. Both locales render identically

**Test:** Open `/en/presentations` and `/ru/presentations` side-by-side at 1440px and 375px.
**Expected:** Identical layout. Only differences: translated title and description text (Cyrillic in RU). Event names, cities, tags, URLs, slide counts, back-link style identical between locales.
**Why human:** Visual-verify-on-push convention per CLAUDE.md. Bilingual parity confirmation needs a human scanning both pages.

### Gaps Summary

None. All 10 must-haves verified with concrete code evidence. Build passes with 25 pages. Data flows correctly through collection → component → rendered HTML. Both locales render with real, translated content. Tailwind 4 alpha compilation verified in CSS output. Zero hardcoded hex. No stubs, placeholders, or unwired code paths.

The phase implementation fully delivers the ROADMAP Phase 8 goal: "Rewrite homepage Presentations section to match reference `app.jsx:522-551` visual format AND migrate `presentations` data from `src/data/social.ts` to an Astro Content Collection. Add new full portfolio index pages at `/{locale}/presentations`. Extract reusable `<PresentationCard>` component. Update `search-index.ts` to query the collection. Keep decks as external links to `s.vedmich.dev/{slug}/`."

Three visual verification items remain for the developer to confirm on the live site after push, consistent with the project's visual-verify-on-push publishing workflow convention. These are not blocking and do not lower the status.

**Note on REQ-010 documentation:** The ROADMAP and plan frontmatter reference REQ-010 for "presentations polish," but `.planning/REQUIREMENTS.md` currently lists REQ-010 as the About section requirement. This numbering conflict was explicitly noted in 08-CONTEXT.md line 128 as pre-existing, to be inlined during planning. Implementation evidence fully satisfies the presentations polish requirement; the documentation inconsistency is a documentation-only concern, not a code gap.

---

_Verified: 2026-04-24T21:07:00Z_
_Verifier: Claude (gsd-verifier)_
