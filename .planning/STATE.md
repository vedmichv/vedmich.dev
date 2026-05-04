---
gsd_state_version: 1.0
milestone: v1.0
milestone_name: Content Platform
current_phase: 04
status: ready_to_plan
last_updated: "2026-05-04T16:10:44.383Z"
last_activity: 2026-05-04 -- Phase 04 execution started
progress:
  total_phases: 7
  completed_phases: 4
  total_plans: 21
  completed_plans: 16
  percent: 57
---

# STATE.md

**Current milestone:** v1.0 — Content Platform
**Current phase:** 5
**Status:** Ready to plan
**Last updated:** 2026-05-03

## Project Reference

**Core value:** Turn vedmich.dev from "static site with a handful of posts" into a full content platform — three streams (blog, presentations, companion posts), reusable rich-media primitives reducing Slidev slide lift from ~30 min to <10 min, Excalidraw diagrams, code block upgrades, and Slidev decks served as first-party routes.

**Current focus:** Phase 04 — excalidraw-pipeline

## Current Position

Phase: 04 (excalidraw-pipeline) — EXECUTING
Plan: Not started
Status: Executing Phase 04
Resume file: .planning/phases/04-excalidraw-pipeline/04-CONTEXT.md
Last activity: 2026-05-04

Progress: [██████████] 100%

## Completed Phases

_None yet — milestone v1.0 just started. Phase numbering reset to 1._

## Active Context

- Milestone v0.4 Reference Design Audit shipped 2026-05-01 (12 phases, 26 plans, 41 tasks).
- v1.0 scope defined from `.planning/notes/milestone-v0.5-content-platform.md` + `.planning/notes/rich-media-integration.md`, expanded during kickoff to add Slidev integration + polish streams.
- Reference artifact: `/Users/viktor/.claude/skills/viktor-vedmich-design/ui_kits/vedmich-dev/app.jsx`.
- Research completed 2026-05-02: 4 parallel research agents (SUMMARY, ARCHITECTURE, FEATURES, PITFALLS) analyzed stack, feature landscape, integration patterns, and domain pitfalls — HIGH confidence on Phases 1-6, LOW confidence on Phase 7 (codegen complexity unknown).

## Performance Metrics

**Velocity:**

| Phase | Plan | Duration | Tasks | Files | Completed |
|-------|------|----------|-------|-------|-----------|
| 03    | 01   | 65s      | 2     | 2     | 2026-05-03 |
| 03    | 03   | ~10min   | 2     | 2     | 2026-05-03 |
| 03    | 02   | 118s     | 3     | 3     | 2026-05-03 |
| 03    | 04   | 12min    | 2     | 2 src + AUDIT + 14 baseline + 4 after PNGs | 2026-05-03 |

**Quality:**

- v0.4 baseline: 12 phases, 26 plans, 41 tasks delivered with zero post-ship hotfixes
- Build time: 32 pages in ~2.2s (local, dev machine); target: maintain <10s after v1.0
- Zero-JS budget: maintained (only IntersectionObserver, menu toggle, CodeCopyEnhancer allowed)
- Phase 03 Plan 01: zero deviations, all grep acceptance checks passed, build green on both task boundaries
- Phase 03 Plan 03: 1 auto-fixed deviation (Rule 1 Bug — plan's `echo $FOO` fixture didn't produce `#FFAB70` under shiki@3.23.0; swapped to `echo $1` which does); 8/8 new assertions pass, total unit-test count 27 → 35
- Phase 03 Plan 02: zero deviations, all 19 grep acceptance checks passed, build green on all three task boundaries, en.json/ru.json/BlogCard.astro/PresentationCard.astro byte-identical to HEAD~3
- Phase 03 Plan 04: 2 atomic fixes shipped (About sm:py-28 + Podcasts bg-surface/gap-5); 3 cross-cutting findings logged as DEFER with rationale (H2 scale 6-file sweep, max-w-6xl 3-file harmonization, About Me→About me copy); zero hex in all 7 homepage components; build green on every boundary, 35/35 unit tests pass; homepage now ~98% reference-aligned

## Accumulated Context

### Key Decisions

- **Phase 03 Plan 01 (2026-05-03):** `--transition-normal` set to `250ms cubic-bezier(0.16, 1, 0.3, 1)` (expo-out) in `src/styles/design-tokens.css` — single-line swap, matches `viktor-vedmich-design/ui_kits/vedmich-dev/app.jsx` Card reference. `.card-glow` is the sole site-wide consumer and inherits automatically.
- **Phase 03 Plan 01 (2026-05-03):** `.animate-on-scroll-stagger` CSS variant added to `src/styles/global.css` — 10 explicit `:nth-child(n)` rules (0..540ms, 60ms step) + `:nth-child(n+11)` catch-all at 540ms. Explicit-rule form chosen over `calc(60ms * (n - 1))` for portability / greppability / devtools discoverability.
- **Phase 03 Plan 01 (2026-05-03):** Direct-child combinator `> .animate-on-scroll` (not `> *`) keeps cascade scoped to elements that opt into the animation system.
- **Phase 03 Plan 01 (2026-05-03):** Reduced-motion guard for stagger children forces `animation-delay: 0 !important` + `opacity: 1 !important` inside the existing `@media (prefers-reduced-motion: reduce)` block (WCAG 2.3.3 / SC 2.2.2).
- **Phase 03 Plan 03 (2026-05-03):** Shipped `tests/unit/shiki-palette-guard.test.ts` (8 `codeToHtml(...theme:'github-dark')` node:test assertions, one per load-bearing hex in `src/styles/global.css` attribute selectors); all 8 pass on current shiki@3.23.0. WR-03 (Phase 2 tech debt) closed.
- **Phase 03 Plan 03 (2026-05-03):** CLAUDE.md §Deep Signal Design System gains `### Shiki palette guard pattern` subsection documenting what/when/run-command/origin — pointer only; test file is the 8-hex canonical source of truth.
- **Phase 03 Plan 03 (2026-05-03):** Rule 1 bug in plan's fixture — `echo $FOO` renders `$FOO` as default-text #E1E4E8 under shiki@3.23.0 bash grammar, not #FFAB70. Swapped to `echo $1` (positional arg, which IS colored #FFAB70). Probed 23 candidate fixtures across 13 languages before selecting. Inline NB comment added to the test to prevent re-litigation.
- **Phase 03 Plan 02 (2026-05-03):** Bottom `All posts →` and `All decks →` CTAs added to `src/components/BlogPreview.astro` and `src/components/Presentations.astro`. Blog bottom CTA guarded by `posts.length > 0` (empty state hides both top and bottom simultaneously); Presentations bottom CTA unconditional (matches unconditional top CTA — no empty-state branch). Both reuse existing `i.blog.all_posts` / `i.presentations.all_decks` keys per D-01 — zero new i18n keys added. REQUIREMENTS.md POLISH-01..03 `blog.see_all` / `presentations.see_all` naming drift is a deferred doc-only fix per D-01e.
- **Phase 03 Plan 02 (2026-05-03):** `src/components/Speaking.astro` bottom CTA class list unified to canonical `text-sm text-text-muted hover:text-brand-primary transition-colors whitespace-nowrap` per D-01c. Previous `font-body text-sm text-brand-primary hover:text-brand-primary-hover transition-colors` replaced. `font-body` dropped (redundant — section inherits body font); `whitespace-nowrap` added for consistency. All three homepage section bottom CTAs (Blog + Presentations + Speaking) now render with matching `text-text-muted → text-brand-primary` hover tone.
- **Phase 03 Plan 02 (2026-05-03):** `animate-on-scroll-stagger` wrapper class attached to the Blog grid (3-card cascade at 0/60/120ms) and the Presentations grid (6-card cascade at 0..300ms). `BlogCard.astro` and `PresentationCard.astro` untouched — both already carry `.animate-on-scroll` on their outer `<a>` so they become stagger children automatically with zero per-card edit.
- **Phase 03 Plan 04 (2026-05-03):** 14 baseline PNGs captured against live `vedmich.dev/en/` via repo-local `playwright chromium` headless script (no playwright-cli skill on disk — direct `playwright` package usage equivalent for public static site). Element-scoped on `section#<id>` for tight framing; `.animate-on-scroll` force-unhidden pre-capture for final reveal state. `.planning/phases/03-ui-polish/AUDIT.md` shipped with 14 rows across 7 H2 blocks (Hero/About/Podcasts/Speaking/Book/Presentations/Blog) + 3 DEFER blocks + summary tally.
- **Phase 03 Plan 04 (2026-05-03):** Two atomic `fix(03-04): ...` commits: **8ceb39e** — `About.astro` cross-section padding rhythm (`py-20 px-6` → `py-20 sm:py-28 px-6`, +64px desktop section height); **bd589c5** — `Podcasts.astro` card bg + grid gap alignment (both cards `bg-bg` → `bg-surface`, grid `gap-6` → `gap-5` per reference `app.jsx:161,426`). Single-source-file per commit; AUDIT.md + after PNGs co-committed per plan acceptance criteria.
- **Phase 03 Plan 04 (2026-05-03):** Three cross-cutting findings DEFER'd with rationale: (DEFER-1) H2 scale drift `text-3xl font-bold` vs `text-[28px] font-semibold` in 6 files — checkpoint-worthy subjective call; (DEFER-2) "About Me" vs "About me" i18n casing — copy/translation scope; (DEFER-3) `max-w-6xl` vs `max-w-[1120px]` section-width harmonization in 3 files. Each DEFER has future-phase pointer.
- **Phase 03 Plan 04 (2026-05-03):** Three-commit atomic fix pattern pioneered — `fix-A` + AUDIT-with-PENDING-1 placeholder, `fix-B` + AUDIT-with-A-SHA-resolved + PENDING-2 placeholder, `docs-AUDIT-finalize` with both SHAs resolved. Avoids `git amend`, preserves one-source-file-per-commit atomicity. Reusable pattern for future audit phases.

### Technical Debt

- **WR-03 Shiki palette guard todo** — shipped via 03-03 on 2026-05-03. `.planning/todos/pending/shiki-palette-guard.md` marked archivable; phase orchestrator to move to done/ (or delete) during end-of-phase cleanup after all 4 phase-3 plans complete.
- **REQUIREMENTS.md POLISH-01..03 key-naming drift** — deferred per D-01e: post-phase doc-only commit to update language from `blog.see_all` / `presentations.see_all` / `speaking.see_all` to "keeping existing `blog.all_posts` / `presentations.all_decks` / `speaking.all_talks` keys". Phase 3 code changes kept existing keys; REQUIREMENTS.md still says rename. Orchestrator to fix post-phase.
- **Phase 3 Plan 04 DEFER items (3 cross-cutting findings)** — see AUDIT.md DEFER-1, DEFER-2, DEFER-3 for full rationale. All three are polish-class, low-urgency. Candidates for a v1.1 "Typography alignment + copy pass" mini-plan or roll-into-next UI-phase.

### Todos

_Populated after roadmap approval._

## Blockers

None.

## Notes

- Phase numbering resets to 1 (`config.json: continue_from_previous=false`, `phase_start=1`).
- Phase 2 (Shiki upgrades) flagged as HIGHEST regression risk — global config change affects all 4 existing posts. Mitigation: run early while post count is low, screenshot comparison, pin Astro version.
- Phase 5 (Slidev integration) requires DNS audit (15 min) to check Route 53 + external backlinks to `s.vedmich.dev` before deciding on CNAME removal vs 301 redirect.
- Phase 7 (codegen) is checkpoint-gated: after Phase 1, user re-ports one slide using primitives; if elapsed time >15 min, Phase 7 proceeds; if <15 min, Phase 7 skipped entirely (ROI insufficient).
- Companion posts batch sized to 2 posts (1 DKT + 1 AWS RU, minimum viable for exit criterion).
- GSD interactive questions asked in Russian; artifacts in English (see CLAUDE.md).
- `playwright-cli attach --extension` required for visual verification on live site.

## Accumulated Context from Prior Milestones

### Key Decisions — v0.4

- Kept `/images/book-cover-3d.jpg` over ref CSS faux cover (D-01) — JPG already has PACKT + V. Vedmich printed; same brand-asset-over-text-reproduction stance as Phase 5 DKT logo.
- Introduced first full-bleed coloured section band on the site — `bg-brand-accent-soft border-y border-brand-accent/30` (D-04).
- Added Amazon rating row ★★★★★ 4.8 · Amazon as hardcoded social proof — `const rating = 4.8` in frontmatter, ARIA-annotated, no i18n key.
- Dropped `max-w-3xl` card constraint so the card stretches the full `max-w-[1120px]` container width.
- Promoted 2-col `sm:flex-row` to 3-col grid `grid-cols-[140px_1fr_auto]` on desktop; mobile flex-col stack retained.
- Solid amber CTA button replaces ghost `text-accent` variant — matches ref Button `variant="accent"`.
- tags field is required array (no .optional()) per D-06 frontmatter schema — differs from blog collection where tags are optional.
- video and slides fields use z.string().url().optional() for URL validation at build time; omitted from frontmatter when no URLs available.
- YouTube embed uses @astro-community/astro-embed-youtube wrapper over lite-youtube-embed for Astro-native API.
- Filenames use YYYY-slug.md pattern for chronological sorting.
- Tags remain in English in both locales (topic keywords, not UI strings).
- Event and city names remain in English (proper nouns).

## Session Continuity

**For next session:**

- Load `.planning/ROADMAP.md` + `.planning/REQUIREMENTS.md` + `.planning/STATE.md`
- Check progress counters
- Resume from current phase/plan

**Phase 3 complete. Next steps:**

- Orchestrator end-of-phase cleanup: (a) move `.planning/todos/pending/shiki-palette-guard.md` to archived/, (b) fix REQUIREMENTS.md POLISH-01..03 key-naming drift per D-01e, (c) evolve PROJECT.md after phase completion if relevant
- `/gsd-context-phase 04` to gather Phase 04 (Excalidraw Pipeline) context
- Phase 04 goal: `.excalidraw.json → SVG` build pipeline + replace MCP-post ASCII diagram + stress-test on 2-3 additional posts
