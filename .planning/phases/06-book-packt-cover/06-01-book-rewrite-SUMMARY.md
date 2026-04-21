---
phase: 06-book-packt-cover
plan: 01
subsystem: ui
tags: [astro, tailwind, design-tokens, reference-match, amber-band, amazon-rating, book, deep-signal]

# Dependency graph
requires:
  - phase: 04-hero-reference-match
    provides: max-w-[1120px] container width convention, Phase 4 D-03 brand-name locale invariance precedent
  - phase: 05-podcasts-badges
    provides: Brand-asset-over-text-reproduction precedent (D-01), arbitrary-opacity /N syntax for amber borders (D-06), whole-card anchor pattern with Fitts's law (D-10), no-premature-abstraction for single-use primitives (D-07)
  - phase: 03-section-order-about
    provides: Book section order position (after Podcasts, before Speaking per REQ-009)

provides:
  - Full-bleed amber band section wrapper pattern (first site-wide use of bg-brand-accent-soft + border-y border-brand-accent/30 extending edge-to-edge)
  - 3-col desktop grid + mobile flex-col stack pattern for card layouts (grid-cols-[140px_1fr_auto] gap-7 items-center at sm breakpoint)
  - Hardcoded-rating-with-ARIA precedent for static social-proof numbers (const in frontmatter, aria-label on container, aria-hidden on glyphs)
  - Solid amber CTA button class string (inline-flex px-5 py-2.5 rounded-lg bg-brand-accent text-bg-base hover:bg-brand-accent-hover) matching ref Button variant=accent
  - Max-w-[1120px] container width pattern inside a full-bleed section (precedent for future banded sections)
affects: [phase-07-speaking-timeline, phase-08-presentations, phase-10-contact, future banded-section refactors]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - Full-bleed coloured section pattern — section uses bg-token + border-y, inner div uses max-w-[1120px] mx-auto px-4 sm:px-6 container
    - Responsive layout pattern — mobile flex-col stack + desktop grid-cols-[140px_1fr_auto] via sm: breakpoint on the same wrapper
    - Hardcoded-social-proof pattern — numeric const in Astro frontmatter, ARIA-labeled container, aria-hidden glyphs, locale-invariant brand label

key-files:
  created: []
  modified:
    - src/components/Book.astro

key-decisions:
  - "Kept /images/book-cover-3d.jpg JPG cover instead of the reference CSS faux cover (D-01) — the JPG already has PACKT + V. Vedmich printed on the 3D render, so duplicating those labels in HTML would be redundant (same brand-asset-over-text-reproduction stance as Phase 5 DKT logo)"
  - "Introduced first full-bleed coloured section band on the site (amber bg-brand-accent-soft with border-y border-brand-accent/30), user-driven 'полная полоса' deviation from reference's transparent Section primitive (D-04)"
  - "Added Amazon rating row (★★★★★ 4.8 · Amazon) between h3 and description — not in REQ-005 originally, user-driven additive social proof; hardcoded const rating = 4.8 in frontmatter, no i18n key, no data layer extraction (D-15, D-17, D-18)"
  - "Round-up star rendering (5 filled amber stars via 5× U+2605, not half-star CSS) — visual simplicity over fractional accuracy; numeric 4.8 communicates the exact value (D-16)"
  - "Solid amber CTA button replaces ghost/text-accent variant — matches ref Button variant=accent with px-5 py-2.5 rounded-lg bg-brand-accent text-bg-base, readable on amber-soft band at ~11:1 contrast (D-13)"
  - "Preserved whole-card <a> wrapper to Amazon URL (D-11, Fitts's law) over ref-faithful button-only click target — big click area beats small button for accessibility"
  - "Dropped max-w-3xl from card wrapper (D-10) so the card stretches the full max-w-[1120px] container, matching user's 'полная полоса' intent throughout the band"
  - "Preserved existing .book-cover CSS block (drop-shadow + hover translateY(-6px) + prefers-reduced-motion guard) byte-identical per D-03; the rgba() values inside <style> are pre-existing continuation, not new hex introductions"
  - "No i18n changes — all 4 book keys (title, name, desc, cta) reused byte-identically per D-20/D-21/D-22; 'Amazon' brand label stays inline English in both locales per D-18 and Phase 4 D-03 precedent"
  - "No new tokens, no new components, no new assets, no changes to src/data/social.ts — single-file rewrite contained to src/components/Book.astro"

patterns-established:
  - "Full-bleed band section — `<section class='py-20 sm:py-28 bg-{token}-soft border-y border-{token}/30'>` + inner `<div class='max-w-[1120px] mx-auto px-4 sm:px-6'>` for coloured section emphasis without overflow-x regression"
  - "Responsive card layout — `<div class='flex flex-col gap-6 sm:grid sm:grid-cols-[{fixed}px_1fr_auto] sm:gap-7 sm:items-center'>` for mobile stack + desktop 3-col grid within a single wrapper"
  - "Hardcoded social-proof row — const in frontmatter + container with aria-label + aria-hidden on glyph spans + locale-invariant brand label inline"
  - "Solid amber CTA class string (canonical) — `inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-brand-accent text-bg-base font-medium hover:bg-brand-accent-hover transition-colors` — reusable for Speaking/Contact CTAs"
  - "Whole-card <a> + styled <span> CTA anti-pattern guard — span mimics a button visually but is NOT a nested <a>, avoiding invalid HTML while preserving Fitts's-law click target"
  - "Brand-asset-over-text-label precedent — when a real brand asset (JPG/logo) exists with labels baked in, render the asset and skip duplicating labels in adjacent HTML (Phase 5 DKT + Phase 6 JPG cover)"

requirements-completed: [REQ-005]

# Metrics
duration: 7min
completed: 2026-04-21
---

# Phase 6 Plan 1: Book PACKT Cover + V. Vedmich Emboss Summary

**Book section rewritten to full-bleed amber band with 3-col desktop grid (cover | text with rating | solid amber CTA), mobile stack, Amazon rating row (★★★★★ 4.8 · Amazon) added as hardcoded social proof, JPG cover with baked-in PACKT + V. Vedmich preserved over CSS faux cover.**

## Performance

- **Duration:** 7 min 9 sec
- **Started:** 2026-04-21T07:29:48Z
- **Completed:** 2026-04-21T07:36:57Z
- **Tasks:** 2 (Task 1 implementation + Task 2 verification gate)
- **Files modified:** 1

## Accomplishments

- Section wrapper swapped from neutral `bg-surface/30` to full-bleed amber band (`bg-brand-accent-soft border-y border-brand-accent/30`) — first site-wide use of a coloured banded section pattern, visually distinguishing the Book section from neighbouring Podcasts / Speaking
- Card layout promoted from 2-col flex (sm:flex-row) to mobile flex-col stack + desktop 3-col grid (`grid-cols-[140px_1fr_auto] gap-7 items-center`) matching ref `app.jsx:492`
- Amazon rating row added (★★★★★ 4.8 · Amazon) between h3 title and description — NEW additive not in REQ-005, user-driven social proof, hardcoded `const rating = 4.8` in frontmatter
- CTA re-styled from ghost (text-accent) to solid amber button (`bg-brand-accent text-bg-base px-5 py-2.5 rounded-lg hover:bg-brand-accent-hover`) matching ref Button `variant="accent"`
- Card stretches the full `max-w-[1120px]` container (dropped `max-w-3xl` constraint) to fill the amber band width
- Real `/images/book-cover-3d.jpg` 3D render preserved over CSS faux cover — JPG already has PACKT + V. Vedmich printed, no HTML label duplication
- All preserved per contract: `.book-cover` CSS block byte-identical (drop-shadow, hover lift, reduced-motion guard), whole-card `<a>` to amazon.com/dp/1835460038 with `target="_blank" rel="noopener noreferrer"`, `card-glow` + `animate-on-scroll` utilities, external-link arrow SVG, all 4 i18n keys (title, name, desc, cta)
- `npm run build` exits 0 with 7 pages in 837ms — both `dist/en/index.html` and `dist/ru/index.html` contain the expected DOM shape (1× JPG img, 1× ★★★★★, 2× "4.8" [aria-label + span text], 1× `>Amazon<`, 1× amber CTA, 1× amber band, 1× amazon URL anchor, 0× PACKT HTML label, 0× CSS faux cover leak)
- Compiled CSS contains `bg-brand-accent-soft{background-color:var(--color-brand-accent-soft)}` and `grid-cols-[140px_1fr_auto]{grid-template-columns:140px 1fr auto}` utilities — no Tailwind purge regression
- Zero hardcoded hex in template body (Node script carves out `<style>` block and greps remaining body — pre-existing rgba() in `.book-cover` CSS allowed continuation per D-03)
- Zero deprecated cyan (`#06B6D4`, `#22D3EE`, `text-cyan-*`), zero DKT colours (`#7C3AED`, `#10B981`), zero AWS orange (`#FF9900`, `#232F3E`)
- Zero i18n edits — `src/i18n/en.json` and `src/i18n/ru.json` byte-identical before/after

## Task Commits

Each task was committed atomically:

1. **Task 1: Full rewrite of Book.astro — full-bleed amber band section, 3-col desktop grid with mobile stack, Amazon rating row with 5 filled amber stars, solid amber CTA in column 3** — `97c6e89` (feat)
2. **Task 2: Token/hex-hygiene check + build gate** — verification-only gate (no file mutations, no commit); all 13 checks passed (token hygiene, rejected CSS faux cover, full-bleed amber band, responsive grid, rating row ARIA, solid amber CTA, preserved artifacts, i18n invariance, `npm run build` green with 7 pages, DOM shape EN + RU, compiled CSS)

## Files Created/Modified

- `src/components/Book.astro` — rewritten (89 lines, was 82) — full-bleed amber band section wrapper, 3-col desktop grid + mobile flex-col stack, Amazon rating row with hardcoded 4.8, solid amber CTA in column 3, all preservation targets kept byte-identical

## Decisions Made

- **D-01 through D-25 all implemented as specified in `.planning/phases/06-book-packt-cover/06-CONTEXT.md`.** No deviations from plan or context.
- Star rendering used `text-base` (16px) for the amber star string, matching the rating number's `text-sm` visual balance — within executor's Claude's Discretion per CONTEXT.md.
- Card wrapper `p-6 sm:p-8` padding retained as-is from the plan.
- `gap-7` (28px, ref-exact) used between grid cells on desktop.
- Solid amber CTA (not ghost) used per D-13 default — contrast on amber-soft band is ~11:1 which is well above WCAG AA; no fallback to ghost variant needed.

## Deviations from Plan

None — plan executed exactly as written. All 25 context decisions (D-01 through D-25) applied, all must-have truths satisfied, all forbidden patterns absent, all preserved artifacts intact.

## Issues Encountered

- **Diagnostic only, not a code issue:** The `awk '/<section id="book"/{p=1} /<\/section>/{if(p){p=0;exit}} p' dist/$loc/index.html` extraction in plan Check 11 returned empty output because Astro emits the entire Book section on a single line (line 15 in `dist/en/index.html`) — when the opening and closing tags share a line, the awk `p=0; exit` fires before printing. Worked around by running the DOM shape checks via a Node.js `match(/<section id="book"[\s\S]*?<\/section>/)` instead. All 10 DOM shape checks passed in both locales.
- **Environment:** Running under rtk shell shim meant `grep -q` on patterns like `import { t, type Locale }` was interpreted as regex (curly braces parsed as repetition quantifiers). Worked around by using the Grep tool with explicit escaping.

## User Setup Required

None — no external service configuration required. Build is green; deployment will happen via auto-push to `main` after user visual-verify on live per STATE.md §Notes workflow ("User prefers sequential execution with visual verification on live after each phase").

## Next Phase Readiness

- **Ready for user visual verification** on local `npm run dev` at 1440×900 and 375×667 for both `/en/` and `/ru/` before push to `main`.
- **Post-merge Phase 6 verification** — once pushed, visual verify on live via `playwright-cli attach --extension` at:
  - 1440×900 for desktop grid + amber band edge-to-edge extent
  - 375×667 for mobile flex-col stack + amber band edge-to-edge without horizontal scroll
- **Phase 7 (Speaking) prerequisites met** — no cross-phase blockers introduced; established patterns (full-bleed band if Speaking adopts one, solid amber CTA class string, responsive grid pattern) are reusable.
- **REQ-005 satisfied** — "PACKT label visible top-left" and "V. Vedmich label visible bottom" are both satisfied by the JPG asset (which contains both labels printed in-frame); "3D perspective preserved" is satisfied by keeping the JPG (it IS a 3D render); "Get on Amazon CTA no regression" is satisfied by the solid amber button in column 3 with unchanged i18n content and unchanged href.

## Self-Check: PASSED

File existence:
- FOUND: `src/components/Book.astro` (89 lines, rewritten)
- FOUND: `.planning/phases/06-book-packt-cover/06-01-book-rewrite-SUMMARY.md` (this file)

Commit existence:
- FOUND: `97c6e89` — "feat(06-01): rewrite Book.astro with full-bleed amber band + rating row"

Build gate:
- PASSED: `npm run build` exits 0, 7 pages in 837ms, both `dist/en/index.html` and `dist/ru/index.html` regenerated

DOM shape (both locales via Node.js `<section id="book">` extraction):
- EN: 1× JPG img, 2× "4.8", 1× ★★★★★, 1× `>Amazon<`, 1× bg-brand-accent-soft, 1× border-brand-accent/30, 1× amazon.com/dp/1835460038, 0× `>PACKT<`, 0× faux cover, 1× amber CTA class
- RU: 1× JPG img, 2× "4.8", 1× ★★★★★, 1× `>Amazon<`, 1× bg-brand-accent-soft, 1× border-brand-accent/30, 1× amazon.com/dp/1835460038, 0× `>PACKT<`, 0× faux cover, 1× amber CTA class

Compiled CSS utilities:
- FOUND: `bg-brand-accent-soft{background-color:var(--color-brand-accent-soft)}` in `dist/_astro/_slug_.CiX1uclI.css`
- FOUND: `grid-cols-\[140px_1fr_auto\]{grid-template-columns:140px 1fr auto}` in `dist/_astro/_slug_.CiX1uclI.css`

Zero hex in template body, zero deprecated cyan, zero DKT colours, zero AWS orange, i18n JSON byte-identical (`git diff --quiet` returns 0 for both `src/i18n/en.json` and `src/i18n/ru.json`).

---
*Phase: 06-book-packt-cover*
*Completed: 2026-04-21*
