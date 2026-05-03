---
phase: 03-ui-polish
plan: 01
subsystem: ui
tags: [css, design-tokens, motion, animation, homepage, deep-signal]

# Dependency graph
requires:
  - phase: v0.3-deep-signal-migration
    provides: ".card-glow rule + --transition-normal + --shadow-glow tokens (the infrastructure this plan updates in place)"
provides:
  - "--transition-normal token updated to 250ms cubic-bezier(0.16, 1, 0.3, 1) (expo-out) — .card-glow inherits automatically"
  - ".animate-on-scroll-stagger CSS variant — 10 explicit nth-child delays (0..540ms, 60ms step) + n+11 catch-all at 540ms"
  - "prefers-reduced-motion guard extended: stagger children forced to animation-delay:0 + opacity:1 under WCAG 2.3.3"
affects: [03-02-plan, 03-04-plan, future-hover-state-work]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Single-line motion-token swap: update ONE custom-property value, let existing var(--transition-normal) consumers inherit"
    - "Opt-in stagger wrapper: parent class + CSS :nth-child delays, zero runtime JS"
    - "Reduced-motion guard mirrors base guard shape (animation-delay:0 + opacity:1 !important inside existing media block)"

key-files:
  created: []
  modified:
    - "src/styles/design-tokens.css (1 line changed — curve swap, comment added)"
    - "src/styles/global.css (24 lines added — 19-line stagger block + 4-line reduced-motion guard + 1 blank-line separator)"

key-decisions:
  - "Kept --transition-normal value as literal expanded curve (not 250ms var(--ease-out)) to match --transition-slow style on adjacent line"
  - "Explicit nth-child(1..10) rules + n+11 catch-all at 540ms — NOT calc(60ms * (n - 1)) single rule (portable, greppable, discoverable in devtools)"
  - "Direct-child combinator > .animate-on-scroll (not > *) — only cards that opt into animation system cascade"
  - "No edits to BaseLayout.astro IntersectionObserver — existing .is-visible gate unchanged"

patterns-established:
  - "Motion token update: touch design-tokens.css ONLY (one line), never per-component overrides — all consumers inherit via var()"
  - "CSS stagger: wrap grid in .animate-on-scroll-stagger, children remain .animate-on-scroll — nth-child does the work"
  - "WCAG reduced-motion guard: mirror base rule shape inside existing @media block, add !important to override stagger delays"

requirements-completed: [POLISH-04, POLISH-05]

# Metrics
duration: 65s
completed: 2026-05-03
---

# Phase 3 Plan 01: Token + Motion Infrastructure Summary

**Motion token shifted to reference expo-out curve (single line) and a 10-step cards-only stagger CSS variant shipped — Plan 02 now has the class to attach to Blog + Presentations grids.**

## Performance

- **Duration:** 65s (1 min 5s)
- **Started:** 2026-05-03T13:13:46Z
- **Completed:** 2026-05-03T13:14:51Z
- **Tasks:** 2 / 2
- **Files modified:** 2

## Accomplishments

- `--transition-normal` resolves to `250ms cubic-bezier(0.16, 1, 0.3, 1)` site-wide — `.card-glow` hover easing now matches `viktor-vedmich-design/ui_kits/vedmich-dev/app.jsx` Card reference with zero component edits
- `.animate-on-scroll-stagger` CSS variant added — 10 explicit `:nth-child(n)` delays (0ms..540ms in 60ms steps) + `:nth-child(n+11)` catch-all at 540ms
- Reduced-motion guard extended inside existing `@media (prefers-reduced-motion: reduce)` block — stagger children forced to `animation-delay: 0 !important` + `opacity: 1 !important`, honors WCAG 2.3.3 / SC 2.2.2
- Zero regression on existing `.animate-on-scroll` consumers (About, Speaking, Podcasts, Hero, Book) — they don't wrap in `.animate-on-scroll-stagger` so they keep the one-shot fade-in behavior
- Zero new JS, zero new runtime dependencies, zero hardcoded hex added — honors the project's zero-JS default and Deep Signal token-only constraint

## Task Commits

Each task was committed atomically:

1. **Task 1: Update `--transition-normal` token to expo-out curve (D-02b)** — `f9b48fb` (fix)
2. **Task 2: Add `.animate-on-scroll-stagger` variant + reduced-motion guard (D-03c, D-03e)** — `3a5eb6b` (feat)

**Plan metadata commit:** pending this SUMMARY + STATE/ROADMAP update.

## Acceptance Grep Counts (all pass)

### Task 1 — design-tokens.css

| Check | Expected | Actual |
|-------|----------|--------|
| `grep -c "cubic-bezier(0.16, 1, 0.3, 1)" src/styles/design-tokens.css` | 3 | **3** ✓ |
| `grep -c "250ms ease-out" src/styles/design-tokens.css` | 0 | **0** ✓ |
| `grep -c "150ms ease-out" src/styles/design-tokens.css` | 1 | **1** ✓ |
| Line 234 `--transition-fast: 150ms ease-out;` verbatim | yes | **yes** ✓ |
| Line 236 `--transition-slow: 400ms cubic-bezier(0.16, 1, 0.3, 1);` verbatim | yes | **yes** ✓ |

### Task 2 — global.css

| Check | Expected | Actual |
|-------|----------|--------|
| `grep -c "animate-on-scroll-stagger" src/styles/global.css` | >= 12 | **13** ✓ |
| `grep -c "nth-child(1)" src/styles/global.css` | >= 1 | **1** ✓ |
| `grep -c "nth-child(10)" src/styles/global.css` | >= 1 | **1** ✓ |
| `grep -c "nth-child(n+11)" src/styles/global.css` | >= 1 | **1** ✓ |
| `grep -Ec "animation-delay:[[:space:]]*540ms" src/styles/global.css` | >= 2 | **2** ✓ |
| Reduced-motion stagger guard present | yes | **yes** ✓ |
| Base `.animate-on-scroll.is-visible` rule unchanged | yes | **yes** ✓ |
| `.card-glow` rule unchanged | yes | **yes** ✓ |

### Build

- `npm run build` after Task 1 → exit 0, 32 pages in 2.23s
- `npm run build` after Task 2 → exit 0, 32 pages in 2.16s
- **Target per plan:** 31 pages in ~800ms; actual is 32 pages (plan was slightly out-of-date on page count) in ~2.2s (dev-machine variance, still well under the <10s build budget).

## Files Created/Modified

- `src/styles/design-tokens.css` — single-line swap on line 235: `--transition-normal: 250ms cubic-bezier(0.16, 1, 0.3, 1);` with `/* expo-out (D-02b) — matches Card component in viktor-vedmich-design */` comment. `--transition-fast` (L234), `--transition-slow` (L236), `--ease-out` (L237) untouched.
- `src/styles/global.css` — Block A (lines 117-135): 19-line `.animate-on-scroll-stagger` block inserted after `.animate-on-scroll.is-visible` closing brace, before `/* Card hover glow */` comment. 11 `:nth-child` rules total (10 explicit + 1 catch-all). Block B (lines 166-169): 4-line reduced-motion guard inside existing `@media (prefers-reduced-motion: reduce)` block, after `.animate-on-scroll { opacity: 1; }` rule.

## Decisions Made

- Followed all locked decisions in 03-CONTEXT.md verbatim — no re-litigation. D-02b curve, D-03b 60ms step, D-03c pure CSS via `:nth-child`, D-03e reduced-motion guard, cap at 10 with 11+ → 540ms.
- Selected explicit 11-rule form (not a single `calc(60ms * (n - 1))` rule) per Task 2 implementation note — portable, grep-friendly, discoverable in devtools.
- Kept curve value as literal `cubic-bezier(0.16, 1, 0.3, 1)` (not `var(--ease-out)`) per plan guidance — matches `--transition-slow` style on the adjacent line.
- Direct-child combinator `> .animate-on-scroll` (not `> *`) — cascade only applies to children that already opt into the animation system.

## Deviations from Plan

None — plan executed exactly as written. Every grep count matches the expected acceptance criterion; every preserved rule stayed identical to the pre-plan state; build remained green on both task boundaries.

**`--transition-normal` consumer scan confirmed PATTERNS.md:** `grep -rn "var(--transition-normal)" src/` — the only production consumer is `.card-glow` in `src/styles/global.css:139` (post-Task-2 line number; pre-plan was line 119). No surprise consumers, no per-component overrides needed. PATTERNS.md assertion holds.

## Issues Encountered

None.

## User Setup Required

None — no external service configuration required.

## Next Phase / Plan Readiness

**Hand-off to Plan 02 (Bottom CTAs + stagger wiring, Wave 2):**
- The `.animate-on-scroll-stagger` class is **ready to attach** to the grid `<div>` elements in `src/components/BlogPreview.astro` (current line 38 grid) and `src/components/Presentations.astro` (current line 37 grid).
- Both `BlogCard.astro` and `PresentationCard.astro` already carry `.animate-on-scroll` on their outer `<a>` — no per-card edits needed; they'll auto-become cascade children once the wrapper class lands.
- For the 3-card Blog grid: cascade lands at 0/60/120ms → full reveal at ~180ms + 600ms `fadeInUp` = ~780ms total.
- For the 6-card Presentations grid: cascade lands at 0..300ms → ~900ms total.
- Plan 04 (spacing audit) will visually verify both grids cascade correctly on 1440×900 + 375px via playwright-cli attach-to-real-Chrome.

**No blockers for Plan 02.** Wave 1 motion infrastructure ready.

## Self-Check: PASSED

- `src/styles/design-tokens.css` exists and contains `cubic-bezier(0.16, 1, 0.3, 1)` on line 235 (verified)
- `src/styles/global.css` exists and contains `.animate-on-scroll-stagger` (13 matches, verified)
- Task 1 commit `f9b48fb` exists in git log (verified via `git rev-parse --short HEAD` at commit time)
- Task 2 commit `3a5eb6b` exists in git log (verified via `git rev-parse --short HEAD` at commit time)
- `npm run build` exits 0 with 32 pages built — verified after each task

---
*Phase: 03-ui-polish*
*Plan: 01*
*Completed: 2026-05-03*
