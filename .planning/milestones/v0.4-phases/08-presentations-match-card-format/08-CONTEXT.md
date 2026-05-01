# Phase 8: Presentations — match card format + portfolio migration — Context

**Gathered:** 2026-04-24
**Status:** Ready for planning

<domain>
## Phase Boundary

Rewrite Presentations homepage section to match reference `app.jsx:522-551` visual format AND migrate `presentations` data from `src/data/social.ts` to an Astro Content Collection (`src/content/presentations/{en,ru}/*.md`). Homepage section becomes a preview pulling from the collection (latest 6 by date desc) with reference 5-row card structure. New full portfolio index page at `/{locale}/presentations`. `speakingEvents`-style pattern repeated here — Phase 7 is the template.

**Individual deck pages at `/{locale}/presentations/{slug}` are NOT in this phase.** They are scheduled for a future "Unified Slides" phase/milestone (v0.5) where Slidev builds themselves migrate into `vedmich.dev/presentations/{slug}/`. Phase 8 keeps decks as external links to `s.vedmich.dev/{slug}/`.

**Scope expanded during discussion:** Original "match card format" (25 min) grew into Content Collection migration + index page + card rewrite. Same expansion pattern as Phase 7 Speaking (35 min → 3-4h with collection migration).

</domain>

<decisions>
## Implementation Decisions

### Tag badges — teal Badge treatment
- **D-01:** Tag chips switch from muted (`bg-bg text-text-muted`) to **teal Badge** style matching `app.jsx:125-129`:
  - Background: `bg-brand-primary-soft/30` (maps to existing token, ~10% teal on dark bg — nearest canonical to ref `rgba(20,184,166,.1)`)
  - Border: `border-brand-primary/40` (ref `rgba(20,184,166,.4)`)
  - Text: `text-brand-primary`
  - Typography: `font-mono text-[11px] font-semibold tracking-[0.08em] uppercase` (ref 11px/600/letterSpacing 0.08em)
  - Padding: `px-2 py-0.5` (ref `4px 8px`)
  - Radius: `rounded` (4px, ref borderRadius 4)
- **D-02:** Use existing design tokens only — do NOT introduce new `--badge-teal-bg` tokens. The `/30` and `/40` alpha modifiers on `brand-primary-soft` and `brand-primary` are sufficient. Verify rendering at build time (Tailwind 4 `@theme` alpha behavior).
- **D-03:** Tags get hover-state on parent card (inherits card `card-glow` hover). Tags are NOT individually clickable/filterable (no tag filter page in Phase 8 — defer to future phase).

### "All decks →" link — header placement, internal index
- **D-04:** "All decks →" stays as **inline link in header** (current pattern, matches Phase 7 Speaking decision from commit `298fa39`). NOT ref's footer ghost Button — the consistency between Speaking and Presentations header-links outweighs byte-match to ref.
- **D-05:** Link target changes from external `https://s.vedmich.dev` to internal **`/{locale}/presentations`** (new index page). Style unchanged: `text-sm text-text-muted hover:text-brand-primary transition-colors whitespace-nowrap`.

### Data model — Content Collection migration (mirror Phase 7 Speaking)
- **D-06:** Presentations stored as Astro Content Collection in `src/content/presentations/{en,ru}/*.md`. One file per deck. EN + RU mirrored (same slug both locales).
- **D-07:** Collection schema registered in `src/content.config.ts` alongside `blog` and `speaking` collections.
- **D-08:** Frontmatter schema (Zod):
  ```
  title: string (required)             — deck title
  event: string (required)             — conference/context name, e.g. "AWS Community Day" or "Slurm AI for DevOps"
  city: string | null (required)       — event city, null for online/course-based decks (Slurm)
  date: date (required)                — deck date (ISO)
  description: string (required)       — excerpt for card, 15-30 words
  tags: string[] (required)            — topic tags, 2-4 per deck
  slides: string (optional)            — external Slidev URL, e.g. "https://s.vedmich.dev/karpenter-prod/"
  video: string (optional)             — YouTube URL (reserved, not used in Phase 8)
  draft: boolean (default false)
  ```
- **D-09:** Body text = optional long-form notes / key takeaways. Empty string allowed — Phase 8 migrates existing descriptions only, no new body content.
- **D-10:** `slug` = filename stem (e.g. `karpenter-prod.md` → slug `karpenter-prod`). Mirror of Phase 7 Speaking convention.

### Talk/Deck separation — NOT merged
- **D-11:** Speaking (talks) and Presentations (decks) are **separate Content Collections** — NOT merged into a unified "activities" collection in this phase.
  - Rationale: a deck can exist without a talk (Slurm course decks), a talk can exist without public slides (older re:Invent talks). Separate collections keep both clean.
  - Future cross-link (if talk.slides slug matches a presentation slug): deferred to a later phase.

### Homepage section — latest 6, sorted newest first
- **D-12:** Homepage Presentations section queries `getCollection('presentations', ({ data, locale }) => data.locale === currentLocale && !data.draft)`, sorts by `date` desc, slices to **top 6**. Matches current behavior and ref subtitle `"6 talks · all slides at s.vedmich.dev"`.
- **D-13:** Subtitle becomes dynamic: `"{N} talks · all slides at s.vedmich.dev"` where N = total deck count (not sliced). i18n key `presentations.subtitle` stays but interpolates count.

### Index page `/{locale}/presentations`
- **D-14:** New route: `src/pages/{en,ru}/presentations/index.astro`. Renders ALL decks (no slice), sorted by date desc, in SAME 3-col grid as homepage (same card component). Back-link at top: `← {i.back_to_home}`. No pagination in Phase 8 — all decks on one page (current 6, may grow).
- **D-15:** Page title: `Recent decks · Viktor Vedmich` (EN) / `Свежие доклады · Виктор Ведмич` (RU). Use existing `i.presentations.title` and `i.presentations.subtitle` for page header (same as homepage section).
- **D-16:** Index uses **SAME card component** as homepage — refactor card into `<PresentationCard>` Astro component to avoid duplication. Homepage section becomes a grid wrapper around that card.

### Reference visual fidelity (from `app.jsx:522-551`)
- **D-17:** Section background: `bg-surface` (`#1E293B`) — per ref `bg={VV.surface}`. Zebra-rhythm: Podcasts surface → Speaking surface → Book amber → **Presentations surface** → Blog transparent.
- **D-18:** Container: `max-w-[1120px] mx-auto` (consistent with all sections, ref `maxWidth: 1120`). Drop current `max-w-6xl` (1152).
- **D-19:** Section padding: `py-20 sm:py-28` — consistent with all sections.
- **D-20:** Grid: `grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5` — 5 (20px) gap ref, not current 4 (16px).
- **D-21:** Card: `p-6 rounded-xl bg-surface border border-border card-glow animate-on-scroll` — padding bumped from `p-5` (20) → `p-6` (24) to match ref `padding: 24`. Retain `card-glow` hover, `animate-on-scroll`, whole-card `<a>` anchor (UX improvement over ref `Card` div+onClick).
- **D-22:** Inside card — 5-row structure:
  1. **Overline:** `font-mono text-xs text-text-muted mb-2` → `{date} · {event}{city ? ' · ' + city : ''}`. mb-2 (8) matches ref marginBottom 8.
  2. **Title:** `font-display text-lg font-semibold leading-snug mt-0 group-hover:text-brand-primary transition-colors` → 18px/600/line-height 1.3, teal on hover. `mt-0` (no extra top since overline has mb).
  3. **Description:** `font-body text-sm text-text-secondary my-2.5 leading-relaxed flex-1` → 14px, `my-2.5` (10px top/bottom match ref `margin: '10px 0'`), `flex-1` pushes URL+tags to bottom.
  4. **Slug URL:** `font-mono text-[11px] text-brand-primary tracking-[0.06em] mt-2 mb-2.5 truncate` → 11px SOLID teal (no /80 alpha), tracking 0.06em per ref. Rendered as `s.vedmich.dev/{slug}`. mt-2/mb-2.5 (ref marginTop 8 marginBottom 10).
  5. **Tags:** `flex flex-wrap gap-1.5` — 6px gap per ref. Badges per D-01.

### Link behavior — whole-card anchor + external target
- **D-23:** Whole card remains `<a href="https://s.vedmich.dev/{slug}/" target="_blank" rel="noopener noreferrer">` — external deck link in new tab. UX pattern shared with Podcasts (Phase 5). Deviates from ref (ref uses `Card` div with onClick=null), but consistent with site-wide "whole-card clickable" decision.
- **D-24:** When Unified Slides phase ships (future), change this to `href="/{locale}/presentations/{slug}"` without `target=_blank` (internal). Non-breaking data-shape-wise; frontmatter `slides` field already captures external URL for current state.

### social.ts — remove presentations export
- **D-25:** After migration, remove `export const presentations` from `src/data/social.ts` (mirror Phase 7 removal of `speakingEvents`). Clean break, no backward-compat shim. CLAUDE.md guidance: "If you are certain that something is unused, you can delete it completely."
- **D-26:** Update `src/data/search-index.ts` to query the Content Collection instead of importing from `social.ts`. Keep search functionality unchanged from user's perspective.

### i18n additions
- **D-27:** Reuse existing i18n keys where possible:
  - `presentations.title` = "Recent decks" / "Свежие доклады" (exists, no change)
  - `presentations.subtitle` = adjust to `"{N} talks · all slides at s.vedmich.dev"` with N interpolation (current is hardcoded "6 talks")
  - `presentations.all_decks` = "All decks" / "Все доклады" (exists, reuse for header link label)
- **D-28:** New key `back_to_home` — already exists in Phase 7 EN/RU i18n (check `en.json`/`ru.json`). Reuse for index page back-link.

### Claude's Discretion
- Exact wording of index page back-link (use existing `speaking.back_link` equivalent if present, else `back_to_home`)
- Exact Tailwind class grouping order (functional vs atomic)
- Whether to refactor `<PresentationCard>` as `.astro` component or inline JSX in two places (prefer component — DRY)
- Whether to preserve all 6 existing decks as-is or touch up excerpts during migration (default: copy verbatim, no content edits)

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Reference UI kit (ground truth for visual contract)
- `/Users/viktor/.claude/skills/viktor-vedmich-design/ui_kits/vedmich-dev/app.jsx` §L522-551 — Presentations section component
- `/Users/viktor/.claude/skills/viktor-vedmich-design/ui_kits/vedmich-dev/app.jsx` §L125-129 — `Badge` primitive (tag badge treatment)
- `/Users/viktor/.claude/skills/viktor-vedmich-design/ui_kits/vedmich-dev/app.jsx` §L157-168 — `Card` primitive (base card style)
- `/Users/viktor/.claude/skills/viktor-vedmich-design/ui_kits/vedmich-dev/app.jsx` §L62-87 — presentations data shape
- `reference-1440-full.png` — full homepage screenshot at 1440px for visual comparison
- `ref-content.json` — structured content reference

### Phase 7 Speaking — template for this phase (Content Collection migration pattern)
- `.planning/phases/07-speaking-portfolio/07-CONTEXT.md` — full decisions, schema, pattern
- `.planning/phases/07-speaking-portfolio/07-01-PLAN.md` — Wave 1 plan: register collection, i18n keys, package install
- `.planning/phases/07-speaking-portfolio/07-02-PLAN.md` — Wave 1 parallel: create markdown files from data
- `.planning/phases/07-speaking-portfolio/07-03-PLAN.md` — Wave 2: pages + component rewrite + data cleanup
- `src/content.config.ts` — existing collection schemas (blog, speaking) — model to extend
- `src/content/speaking/{en,ru}/` — 14 files migrated in Phase 7 — template for frontmatter + body structure
- `src/components/Speaking.astro` — component pattern: `getCollection('speaking', ...)` + locale filter + render

### Project-level
- `CLAUDE.md` — Deep Signal tokens, anti-patterns (no hardcoded hex), publishing workflow, self-hosted fonts
- `.planning/PROJECT.md` — v0.4 milestone scope, zero-JS principle, bilingual constraint
- `.planning/REQUIREMENTS.md` — existing REQ-001 through REQ-014 (NEW REQ-010 for presentations polish is declared in ROADMAP but not yet inlined here — planner should inline it during planning)
- `src/styles/design-tokens.css` — canonical color/spacing tokens (validate `brand-primary-soft` + alpha modifiers work as expected)
- `src/styles/global.css` — Tailwind 4 `@theme` block (check `bg-brand-primary-soft/30` compiles correctly)

### Current state files (what's being rewritten)
- `src/components/Presentations.astro` — current implementation, 62 lines
- `src/data/social.ts` §L52-113 — current `presentations` array (6 decks), to be removed after migration
- `src/data/search-index.ts` — indexes presentations from social.ts, to be updated to Content Collection query
- `src/i18n/en.json` §L63-67, `src/i18n/ru.json` §L63-67 — current presentations i18n

### Deferred / future
- `.planning/ROADMAP.md` — Phase 8 entry (Est. effort grew from 25 min to 3-4h during discuss; roadmap note should update)
- Unified Slides milestone (v0.5) — Slidev → vedmich.dev/presentations/{slug}/ migration. Plant a seed in deferred ideas.

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets (from codebase scout)
- **`src/content.config.ts`** — already registers `blog` and `speaking` collections with Zod schemas + glob loader. Extend with `presentations` entry following same shape.
- **`src/components/Speaking.astro`** — uses `getCollection('speaking', ({ data }) => !data.draft && data.locale === locale)` — exact pattern to copy for Presentations.
- **`src/pages/{en,ru}/speaking/index.astro`** and `speaking/[...slug].astro` — templates for index page (use index.astro shape; skip slug.astro for Phase 8).
- **`src/components/Book.astro`** — card with `card-glow` + `animate-on-scroll` — same hover/entrance pattern.
- **`src/components/Podcasts.astro`** — whole-card `<a>` anchor pattern + stats row + footer link.
- **`src/styles/global.css`** — `@theme` block maps `bg-brand-primary-soft` + alpha modifiers. Verify `/30` and `/40` alpha compile in Tailwind 4.

### Established Patterns
- **Content Collection per locale:** `src/content/{collection}/{locale}/*.md` — blog, speaking already follow this. `presentations/{en,ru}/` consistent.
- **Frontmatter in EN always, RU optional-bilingual:** Phase 7 migrated 14 files (7 EN + 7 RU). Phase 8 will be 6 EN + 6 RU = 12 files.
- **No hardcoded hex in components:** ALL colors must reference tokens. `bg-brand-primary-soft`, `border-brand-primary`, `text-brand-primary`, `text-warm` only.
- **`animate-on-scroll`** on every major element (hero, about, cards, year groups).
- **`max-w-[1120px] mx-auto`** inside `px-4 sm:px-6` wrapper in every section.
- **i18n via `t(locale)`** helper, no runtime translation lookup.
- **Whole-card anchor** preferred over nested button/link (Podcasts, Book card).

### Integration Points
- **Astro Content Collections** — schema registration in `src/content.config.ts`. Build-time validation.
- **Search index** — `src/data/search-index.ts` feeds ⌘K palette. Must be updated to use collection.
- **i18n JSON files** — both locales edited in same commit (bilingual constraint from CLAUDE.md).
- **GH Actions deploy** — auto on push to main. Typical build ~800ms. Adding collection may add ~50ms.
- **src/pages/{en,ru}/** — routes mirrored between locales.

### Creative options the existing architecture enables
- **`<PresentationCard>` component** — extract card as `.astro` file, share between homepage section and index page. Phase 7 Speaking did NOT do this (inlined) — opportunity to introduce the pattern.
- **Dynamic subtitle count** — `presentations.subtitle` could interpolate collection size at build: `t(locale).presentations.subtitle.replace('{N}', String(allDecks.length))`.
- **`tags` filter in future** — collection schema makes tag filtering trivial to add later. Not in Phase 8 scope.

### Constraints from existing architecture
- **No new top-level pages without mirroring in both locales** — `src/pages/en/presentations/index.astro` + `src/pages/ru/presentations/index.astro` required.
- **draft: false default** is already the pattern in blog/speaking — carry forward.
- **Tailwind 4 `@theme` alpha quirks** — `bg-token/30` works with literal hex tokens but may need testing with `brand-primary-soft` specifically. Fallback: use `bg-brand-primary/10` (alpha on base token) if soft-variant alpha doesn't compile.

</code_context>

<specifics>
## Specific Ideas

- **Follow Phase 7 Speaking as a template** — user explicitly said "Content Collection миграция (как Speaking Phase 7)". Planner should read `07-01-PLAN.md`, `07-02-PLAN.md`, `07-03-PLAN.md` as implementation templates — schema registration wave, parallel markdown file creation, then component rewrite + cleanup wave.
- **Keep decks pointing external in Phase 8** — user explicitly chose to defer full Slidev → vedmich.dev migration into a separate future phase. Don't try to build individual `/presentations/{slug}` pages in Phase 8.
- **Teal tags is THE headline visual change.** User flagged this as the most visible drift. Verify rendering in both localized pages + all 6 existing decks.
- **Consistency beats ref purity** for "All decks" link — user confirmed inline header link matches Phase 7 Speaking pattern.

</specifics>

<deferred>
## Deferred Ideas

### Unified Slides migration (next milestone: v0.5 proposed)
- Migrate Slidev builds (`vedmichv/slidev`, `DKT-AI/slidev`, theme repos `slidev-theme-slurm`, `slidev-theme-dkt`) into `vedmich.dev/presentations/{slug}/` as native Astro+Slidev combined build.
- Full individual deck pages at `/{locale}/presentations/{slug}` with:
  - Embedded Slidev viewer (or static export from Slidev)
  - Meta, OG, title, description, date, event, city, tags
  - YouTube embed if video field set
  - Download PDF link
  - Back to index
- `s.vedmich.dev` subdomain: keep as 301 redirect or retire entirely (DNS decision)
- Requires architectural decisions: Astro+Slidev build integration (base paths, router), theme-package integration, CI pipeline, DNS migration, URL redirects
- Est. effort: 8-16+ hours of focused work — warrants own milestone (v0.5)
- **Plant a seed** when Phase 8 ships: add to `.planning/seeds/` or backlog as trigger for post-v0.4 planning

### Talk ↔ Presentation cross-linking (later)
- If a Speaking talk's `slides` field matches a Presentations slug, link to `/{locale}/presentations/{slug}` instead of external Slidev URL.
- Requires: individual deck pages to exist first (Unified Slides milestone).

### Tag filter page (later)
- `/{locale}/presentations?tag=kubernetes` filtered view.
- Requires: decision on URL structure (query param vs path `/presentations/tag/kubernetes/`), static generation vs client-side filter.

### Pagination on index page (later, if deck count grows)
- Current: all decks on one page. When count > 15-20, introduce pagination (Astro static paging or infinite scroll).

</deferred>

---

*Phase: 08-presentations-match-card-format*
*Context gathered: 2026-04-24*
