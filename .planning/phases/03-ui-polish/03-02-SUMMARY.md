---
phase: 03-ui-polish
plan: 02
subsystem: ui
tags: [astro, components, homepage, cta, i18n, animation, deep-signal]

# Dependency graph
requires:
  - phase: 03-ui-polish
    plan: 01
    provides: "`--transition-normal` expo-out curve + `.animate-on-scroll-stagger` CSS variant (10 nth-child delays + reduced-motion guard)"
provides:
  - "Bottom `All posts →` CTA under the Blog grid — `posts.length > 0` guarded (empty state hides both top and bottom CTAs)"
  - "Bottom `All decks →` CTA under the Presentations grid — unconditional (mirrors unconditional top CTA)"
  - "Unified `text-sm text-text-muted hover:text-brand-primary transition-colors whitespace-nowrap` class across all three homepage section bottom CTAs (Blog + Presentations + Speaking)"
  - "`animate-on-scroll-stagger` wrapper class attached to Blog grid (3-card cascade at 0/60/120ms) and Presentations grid (6-card cascade at 0..300ms)"
affects: [03-04-plan, future-homepage-content-additions]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Reuse existing i18n keys verbatim for duplicated CTAs (top + bottom) — same text, same muscle-memory, zero new keys"
    - "Canonical CTA class string shared across sections via inline Tailwind list (no shared component yet — deferred refactor per 03-CONTEXT §Deferred Ideas)"
    - "Grid-level stagger opt-in via wrapper class — cards stay .animate-on-scroll (untouched); the wrapper's nth-child rules do all the work"
    - "Structural anchor inserts for Astro JSX: match the ternary-close `)}` + wrapper-close `</div>` pair, not absolute line numbers — resilient to whitespace drift"

key-files:
  created: []
  modified:
    - "src/components/BlogPreview.astro (+12 / -1 — stagger class on grid; bottom CTA block with `posts.length > 0` guard)"
    - "src/components/Presentations.astro (+10 / -1 — stagger class on grid; unconditional bottom CTA block)"
    - "src/components/Speaking.astro (+1 / -1 — single-line class-list swap on existing `<a>` to canonical shape)"

key-decisions:
  - "Honored all locked decisions from 03-CONTEXT.md verbatim — D-01 (keep existing keys), D-01b (same text top = bottom), D-01c (canonical class applied to all three), D-03 (stagger only on Blog + Presentations), D-03d (IntersectionObserver gate preserved)"
  - "Bottom CTA spacing `mt-10` — matches Speaking.astro's existing wrapper for consistent rhythm across all three sections (rejected `mt-8` option in PATTERNS.md)"
  - "Bottom CTA wrapped in its own `<div class=\"mt-10 animate-on-scroll\">` — NOT inside the stagger grid — so it fades in independently after cards cascade"
  - "Empty-state parity: BlogPreview bottom CTA uses the same `posts.length > 0` guard as the top CTA (no orphan link under zero cards); Presentations bottom CTA is unconditional because Presentations has no empty-state branch"

patterns-established:
  - "Inline Tailwind list for section bottom CTAs — reuse the canonical string verbatim across files; refactor to `<SectionHeaderCTA>` component deferred"
  - "Structural anchor editing: match a ternary-close + wrapper-close pair, not line numbers, when inserting into Astro JSX trees"
  - "i18n key reuse across sibling CTAs in the same section — cheaper than introducing `blog.all_posts_top` / `blog.all_posts_bottom` pair"

requirements-completed: [POLISH-01, POLISH-02, POLISH-03, POLISH-04, POLISH-05]

# Metrics
duration: 118s
completed: 2026-05-03
---

# Phase 3 Plan 02: Bottom CTAs + Stagger Wiring Summary

**Three component files touched, zero new i18n keys, zero card edits — Blog + Presentations grids now cascade cards via the Plan 01 stagger class, and all three homepage sections carry a unified canonical bottom CTA (`text-sm text-text-muted hover:text-brand-primary transition-colors whitespace-nowrap`).**

## Performance

- **Duration:** 118s (1 min 58s)
- **Started:** 2026-05-03T13:24:33Z
- **Completed:** 2026-05-03T13:26:31Z
- **Tasks:** 3 / 3
- **Files modified:** 3

## Accomplishments

- `BlogPreview.astro` grid now carries `animate-on-scroll-stagger` — 3 BlogCard children cascade at 0/60/120ms via Plan 01's CSS rules; reveal completes ~780ms after the grid enters the viewport
- Bottom `All posts →` CTA lands below the grid, reuses `i.blog.all_posts` (EN: "All posts", RU: "Все посты"), guarded by `posts.length > 0` so the empty-state branch hides both top and bottom CTAs simultaneously
- `Presentations.astro` grid now carries `animate-on-scroll-stagger` — 6 PresentationCard children cascade at 0..300ms; reveal completes ~900ms after the grid enters the viewport
- Bottom `All decks →` CTA lands below the grid, reuses `i.presentations.all_decks` (EN: "All decks", RU: "Все доклады"), unconditional (mirrors unconditional top CTA)
- `Speaking.astro` bottom CTA class list unified — was `font-body text-sm text-brand-primary hover:text-brand-primary-hover transition-colors`, now `text-sm text-text-muted hover:text-brand-primary transition-colors whitespace-nowrap` (canonical per D-01c). `font-body` dropped (redundant — section inherits body font); `whitespace-nowrap` added for consistency
- All three homepage section bottom CTAs now render with matching `text-text-muted → text-brand-primary` tone on hover
- Zero new i18n keys; `en.json` and `ru.json` byte-identical to pre-plan state (`diff` against HEAD~3 shows empty)
- `BlogCard.astro` and `PresentationCard.astro` untouched (verified `git diff HEAD~3 src/components/{Blog,Presentation}Card.astro` empty) — card hover behavior inherits Plan 01's expo-out curve via the `.card-glow` token consumer
- Build remained green on every task boundary: 32 pages in ~2.2s each build
- Zero hardcoded hex, zero new runtime dependencies, zero JS added — honors CLAUDE.md §Deep Signal constraints and PROJECT.md §Validated decisions (zero-JS default)

## Task Commits

Each task committed atomically:

1. **Task 1: Add bottom `All posts →` CTA + stagger wrapper to BlogPreview.astro (POLISH-02, POLISH-04)** — `5b3a170` (feat)
2. **Task 2: Add bottom `All decks →` CTA + stagger wrapper to Presentations.astro (POLISH-03, POLISH-04)** — `76815b0` (feat)
3. **Task 3: Unify Speaking.astro bottom CTA class list with canonical shape (POLISH-05, D-01c)** — `02fc454` (refactor)

**Plan metadata commit:** pending this SUMMARY + STATE/ROADMAP update.

## Acceptance Grep Counts (all pass)

### Task 1 — BlogPreview.astro

| Check | Expected | Actual |
|-------|----------|--------|
| `grep -c "animate-on-scroll-stagger" src/components/BlogPreview.astro` | 1 | **1** ✓ |
| `grep -c "i.blog.all_posts" src/components/BlogPreview.astro` | 2 | **2** ✓ |
| `grep -c "text-sm text-text-muted hover:text-brand-primary transition-colors whitespace-nowrap" src/components/BlogPreview.astro` | 2 | **2** ✓ |
| `grep -c "posts.length > 0" src/components/BlogPreview.astro` | 3 | **3** ✓ |
| `grep -c "mt-10" src/components/BlogPreview.astro` | 1 | **1** ✓ |
| `grep -c 'All posts →' dist/en/index.html` | 2 | **2** ✓ |
| `grep -c 'Все посты →' dist/ru/index.html` | 2 | **2** ✓ |

### Task 2 — Presentations.astro

| Check | Expected | Actual |
|-------|----------|--------|
| `grep -c "animate-on-scroll-stagger" src/components/Presentations.astro` | 1 | **1** ✓ |
| `grep -c "i.presentations.all_decks" src/components/Presentations.astro` | 2 | **2** ✓ |
| `grep -c "text-sm text-text-muted hover:text-brand-primary transition-colors whitespace-nowrap" src/components/Presentations.astro` | 2 | **2** ✓ |
| `grep -c "mt-10" src/components/Presentations.astro` | 1 | **1** ✓ |
| `grep -c 'All decks →' dist/en/index.html` | 2 | **2** ✓ |
| `grep -c 'Все доклады →' dist/ru/index.html` | 2 | **2** ✓ |

### Task 3 — Speaking.astro

| Check | Expected | Actual |
|-------|----------|--------|
| `grep -c "text-text-muted hover:text-brand-primary transition-colors whitespace-nowrap" src/components/Speaking.astro` | 1 | **1** ✓ |
| `grep -c "font-body text-sm text-brand-primary hover:text-brand-primary-hover" src/components/Speaking.astro` | 0 | **0** ✓ |
| `grep -c "i.speaking.all_talks" src/components/Speaking.astro` | 1 | **1** ✓ |
| `grep -c "mt-10 animate-on-scroll" src/components/Speaking.astro` | 1 | **1** ✓ |
| `grep -c "border-l-2 border-border pl-5" src/components/Speaking.astro` | 1 | **1** ✓ |
| `grep -c 'All talks →' dist/en/index.html` | 1 | **1** ✓ |
| `grep -c 'Все выступления →' dist/ru/index.html` | 1 | **1** ✓ |

### End-to-end

| Check | Expected | Actual |
|-------|----------|--------|
| Files carrying canonical CTA class | 3 (BlogPreview, Presentations, Speaking) | **3** ✓ |
| Files carrying `animate-on-scroll-stagger` | 2 (BlogPreview, Presentations) | **2** ✓ |
| `diff <(git show HEAD~3:src/i18n/en.json) src/i18n/en.json` | empty | **empty** ✓ |
| `diff <(git show HEAD~3:src/i18n/ru.json) src/i18n/ru.json` | empty | **empty** ✓ |
| `git diff HEAD~3 src/components/BlogCard.astro src/components/PresentationCard.astro` | empty | **empty** ✓ |

### Build

- `npm run build` after Task 1 → exit 0, 32 pages in 2.16s
- `npm run build` after Task 2 → exit 0, 32 pages in 2.17s
- `npm run build` after Task 3 → exit 0, 32 pages in 2.20s

## Files Created/Modified

- `src/components/BlogPreview.astro` — two edits. (1) Grid `<div>` class list on line 37 gains ` animate-on-scroll-stagger` (no other changes to the grid). (2) Between the `)}` of the `posts.length > 0 ? ... : ...` ternary and the `</div>` of the `max-w-[1120px]` wrapper, inserted a 10-line bottom CTA block wrapped in `{posts.length > 0 && (...)}` guard. Top CTA (lines 24-34), frontmatter (lines 1-20), and empty-state fallback `<p>` unchanged.
- `src/components/Presentations.astro` — two edits. (1) Grid `<div>` class list on line 37 gains ` animate-on-scroll-stagger`. (2) Between the grid's closing `</div>` and the `max-w` wrapper's closing `</div>`, inserted an 8-line unconditional bottom CTA block (no guard — matches unconditional top CTA). Top CTA (lines 26-34), frontmatter, and subtitle `<p>` unchanged.
- `src/components/Speaking.astro` — one edit. `<a>` class list on line 66: `font-body text-sm text-brand-primary hover:text-brand-primary-hover transition-colors` → `text-sm text-text-muted hover:text-brand-primary transition-colors whitespace-nowrap`. Wrapper `<div class="mt-10 animate-on-scroll">`, href, arrow, and i18n key untouched. Timeline rows (lines 34-63) untouched.

## Decisions Made

- Followed all locked decisions in 03-CONTEXT.md verbatim — no re-litigation. D-01 (keep existing keys; no `blog.see_all` / `presentations.see_all` rename), D-01b (same text top = bottom), D-01c (canonical class list), D-03 (stagger scope: Blog + Presentations only), D-03d (IntersectionObserver gate preserved).
- Bottom CTA spacing fixed at `mt-10` across all three sections (previously discussed `mt-8` in PATTERNS.md rejected in favor of Speaking's existing `mt-10` rhythm). Single canonical spacing token.
- Bottom CTA block wrapped in its own `.animate-on-scroll` container (NOT inside the stagger grid) — fades in with its own IntersectionObserver trigger after cards cascade, not as an 11th stagger child.
- Structural anchor editing approach for BlogPreview insert: matched the ternary-close + wrapper-close pattern rather than absolute line numbers. Resilient to prior whitespace edits. Same pattern applied to Presentations insert.
- Verified `npm run build` exits 0 between every task — never stacked un-verified edits.

## Deviations from Plan

None — plan executed exactly as written. Every grep count matches the expected acceptance criterion; every preserved block stayed byte-identical to the pre-plan state (`en.json`, `ru.json`, `BlogCard.astro`, `PresentationCard.astro` all show empty diffs against HEAD~3). Build remained green on all three task boundaries.

## Issues Encountered

None.

## User Setup Required

None — no external service configuration required.

## Next Phase / Plan Readiness

**Hand-off to Plan 04 (Spacing/typography audit, Wave 3):**
- The live homepage now matches the Phase 3 functional target. Plan 04 captures the 14 baseline screenshots (7 sections × 2 viewports) *after* Plans 01 + 02 deploy to live `vedmich.dev`, so findings are purely about spacing / typography / alignment drift — NOT about CTA presence or hover-curve drift (both of which are already correct by construction).
- Specifically, Plan 04 should expect to find zero drift on:
  - Bottom CTA presence under Blog + Presentations grids
  - Canonical CTA class list across Blog + Presentations + Speaking bottom links
  - Card hover expo-out curve on BlogCard + PresentationCard
  - Cards cascading with 60ms stagger on scroll-into-view (Blog 3-card + Presentations 6-card grids)
- Plan 04's deliverables: `AUDIT.md` with 5-col findings table, before/after screenshots in `.planning/phases/03-ui-polish/baselines/` + `after/`, atomic `fix(03): ...` commits for each drift row.

**No blockers for Plan 04.** Wave 2 CTA + stagger wiring ready for visual audit.

**Downstream reminder:** REQUIREMENTS.md POLISH-01..03 still reference `blog.see_all` / `presentations.see_all` keys (documentation drift per D-01e). Per 03-CONTEXT §D-01e, this is a deferred doc-only fix — the phase orchestrator or a post-phase doc pass updates REQUIREMENTS.md language to say "keeping existing `blog.all_posts` / `presentations.all_decks` / `speaking.all_talks` keys" so future milestones don't re-litigate. Not a Plan 02 deliverable.

## Self-Check: PASSED

- `src/components/BlogPreview.astro` exists, contains `animate-on-scroll-stagger` (1 match), contains `i.blog.all_posts` (2 matches), contains canonical class string (2 matches) — verified via grep
- `src/components/Presentations.astro` exists, contains `animate-on-scroll-stagger` (1 match), contains `i.presentations.all_decks` (2 matches), contains canonical class string (2 matches) — verified via grep
- `src/components/Speaking.astro` exists, contains canonical class string (1 match), old class list gone (0 matches), `i.speaking.all_talks` still present (1 match), timeline block untouched — verified via grep
- Task 1 commit `5b3a170` exists (`git rev-parse --short HEAD` at commit time + `git log --oneline -1`)
- Task 2 commit `76815b0` exists
- Task 3 commit `02fc454` exists
- `npm run build` exits 0 with 32 pages built — verified after each of the three tasks
- `dist/en/index.html` contains two `All posts →`, two `All decks →`, one `All talks →` anchors — verified via grep
- `dist/ru/index.html` contains two `Все посты →`, two `Все доклады →`, one `Все выступления →` anchors — verified via grep
- `src/i18n/en.json` and `src/i18n/ru.json` byte-identical to HEAD~3 — verified via `diff`
- `src/components/BlogCard.astro` and `src/components/PresentationCard.astro` byte-identical to HEAD~3 — verified via `git diff`

---
*Phase: 03-ui-polish*
*Plan: 02*
*Completed: 2026-05-03*
