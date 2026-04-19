---
phase: 04-hero-reference-match
plan: 03
subsystem: hero-closure
tags:
  - kubestronaut-rename
  - intersection-observer
  - scroll-margin
  - requirements-sync
  - visual-gate
  - wave3-closure

# Dependency graph
requires:
  - phase: 04-hero-reference-match
    plan: 01
    provides: i18n Kubestronaut spelling fix in about.bio_before (EN + RU)
  - phase: 04-hero-reference-match
    plan: 02
    provides: Hero.astro 4-pill authority strip with Kubestronaut external-teal pill (rel=noopener + aria-label), flat --grad-hero-flat gradient, clamp h1
provides:
  - Cross-file Kubestronaut rename completion (D-04 closure) — src/data/social.ts, src/layouts/BaseLayout.astro, CLAUDE.md all renamed; zero `Kubernaut` substrings remain in src/ or CLAUDE.md
  - Header.astro nav-active IntersectionObserver (D-09, D-10) — single observer watches every `<section id="...">` and toggles `.is-active` on the matching `header a[href^="#"]` link; teal underline + full-contrast text via scoped `<style>`
  - global.css `section[id] { scroll-margin-top: 80px }` rule — paired with smooth-scroll and Header's ~61px sticky height so hash-link jumps leave section titles visible
  - .planning/REQUIREMENTS.md inlined REQ-011, REQ-013, REQ-014 with acceptance criteria — Phase 4 requirements now first-class alongside REQ-001..008
  - User-approved visual gate on 1440×900: h1 typography matches reference, Hero height ≤ 540px, 4-pill row on one line, nav active-state toggles on scroll, anchor scroll keeps section titles visible below sticky header, Kubestronaut external link opens in new tab, zero console errors
affects:
  - Phase 4 orchestrator (atomic phase commit + push step)
  - Future phases that add new in-page anchor sections (scroll-margin-top global rule auto-applies)
  - Any phase that adds nav links to Header (observer auto-picks up new `section[id]`)

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Wave 3 closure pattern: cross-file rename + single-observer JS + global CSS rule + requirements inline + human visual gate, all in one plan"
    - "Second-script-block append in Astro: module-scoped, zero variable collision with existing `<script>` block (D-10 Zero-JS baseline extended by exactly one observer)"
    - "Component-scoped `<style>` in Header.astro using CSS custom properties (`var(--text-primary)`, `var(--brand-primary)`) — Astro cid selector prefix still resolves Deep Signal tokens correctly"
    - "`scroll-margin-top` paired with `scroll-behavior: smooth` for in-site anchor UX under a sticky header — `section[id]` attribute selector auto-applies to all present and future sections"
    - "Acceptance criteria in REQUIREMENTS.md structured as grep-verifiable or Playwright-measurable assertions (no prose-only criteria)"

key-files:
  created: []
  modified:
    - src/data/social.ts
    - src/layouts/BaseLayout.astro
    - CLAUDE.md
    - src/components/Header.astro
    - src/styles/global.css
    - .planning/REQUIREMENTS.md

key-decisions:
  - "Applied D-04: completed the cross-file Kubestronaut rename started in Plan 04-01 (i18n JSONs). Fixed `src/data/social.ts` certifications[0] (both `name` and `badge` fields), `src/layouts/BaseLayout.astro` line 15 default description meta, and `CLAUDE.md` §Homepage Sections #2. Zero `Kubernaut` substrings remain in `src/` or `CLAUDE.md` — historical artifacts under `.planning/`, `.playwright-cli/`, `current-content.json`, `ref-content.json` are intentionally excluded per D-04."
  - "Applied D-09, D-10: appended a SECOND `<script>` block to Header.astro with an IntersectionObserver watching every `<section id=\"...\">`. Threshold 0.5 + rootMargin `'-80px 0px -50% 0px'` narrows the active zone to the upper half of the viewport, with the top inset accounting for the ~61px sticky header plus ~19px buffer. First scoped `<style>` block in Header.astro adds teal 2px underline + full-contrast text on `.is-active`."
  - "Applied Claude's Discretion #3 (RESEARCH.md §Pitfall 3 + §Example 4): `section[id] { scroll-margin-top: 80px }` in `global.css` placed immediately after `html { scroll-behavior: smooth }`. 80px matches the observer's top rootMargin for visual consistency and prevents the sticky header from hiding section titles on anchor click."
  - "Inlined REQ-011, REQ-013, REQ-014 verbatim from RESEARCH.md §Phase Requirements into REQUIREMENTS.md between REQ-008 and Global acceptance. Each requirement has a Type/Priority/Maps-to header matching the existing 8 REQs' style, and all acceptance criteria are grep-verifiable or Playwright-measurable."
  - "Scheduled the user visual gate (Task 4) AFTER the build gate (Task 3) so any TypeScript compile failures in the observer's `as HTMLElement` cast or Astro compiler issues in the scoped `<style>` are caught automatically before the user is asked to eyeball rendering."

patterns-established:
  - "Phase 4 Wave 3 plan closes a phase by layering: (1) finish any cross-file renames; (2) add the deferred JS behavior; (3) add the deferred global CSS; (4) sync requirements; (5) run build; (6) user visual gate. This is reusable as a 'close-out plan' template for future phases where earlier waves intentionally defer non-critical items."
  - "Cross-file rename verification uses `grep -rn 'OldName' src/ CLAUDE.md 2>&1 | grep -v Binary` with a documented exclusion list (`.planning/`, `.playwright-cli/`, `current-content.json`, `ref-content.json`). This keeps the check fast and false-positive-free when earlier plans left intentional historical artifacts."
  - "Single-observer / single-style `.is-active` nav pattern in Header.astro: minimal DOM scan (`document.querySelectorAll('section[id]')`), no framework, reduced-motion-safe because toggle is state-only (not animated), preserves Zero-JS baseline by extending it by exactly one observer (D-10)."

requirements-completed:
  - REQ-011
  - REQ-013
  - REQ-014

threat-mitigations:
  - id: T-04-03-05
    threat: Injection via Header.astro inline `<script>` observer
    mitigation: "Uses DOM APIs only (querySelectorAll, classList, IntersectionObserver); no user input path, no innerHTML, no eval. Verified: no `innerHTML`, no `eval`, no `new Function` in the new script block."
    verified: "grep for `innerHTML|eval|new Function` in src/components/Header.astro returns zero matches"
  - id: T-04-03-06
    threat: Denial of service via nav-active observer
    mitigation: "Single observer instance; watches ~8 sections (hero/about/podcasts/speaking/book/presentations/blog/contact); native IntersectionObserver has built-in browser throttling; no rAF/polling loop"
    verified: "Exactly one `new IntersectionObserver` call site in src/components/Header.astro"

# Metrics
duration: "~3min (automated) + user visual gate"
completed: 2026-04-19
tasks_executed: 4
files_modified: 6
commits: 3
---

# Phase 4 Plan 03: Rename + Observer + Gate Summary

**Closed Phase 4 Wave 3 with five coordinated mutations — (1) cross-file Kubestronaut rename in social.ts + BaseLayout.astro + CLAUDE.md, (2) IntersectionObserver nav-active observer + `.is-active` scoped style in Header.astro, (3) `section[id] { scroll-margin-top: 80px }` global rule in global.css, (4) REQ-011/013/014 inlined into REQUIREMENTS.md, (5) `npm run build` passed (7 pages) and user-approved visual gate on 1440×900 confirmed Hero typography, height, nav active-state, and anchor scroll all meet spec.**

## Performance

- **Tasks:** 4 (3 automated + 1 human visual gate)
- **Files modified:** 6 (5 source + 1 requirements doc)
- **Commits:** 3 atomic (+ final docs commit for this SUMMARY)
- **Completed:** 2026-04-19

## Accomplishments

- Completed the D-04 Kubestronaut rename across the repo — zero `Kubernaut` substrings remain in `src/` or `CLAUDE.md`. Historical `.planning/` and `.playwright-cli/` artifacts intentionally preserved.
- Landed the Phase 4 D-09/D-10 nav-active-state highlight as a single IntersectionObserver in a second `<script>` block in Header.astro — extends the Zero-JS baseline by exactly one observer. Matching scoped `<style>` block with teal underline + full-contrast text.
- Added `section[id] { scroll-margin-top: 80px }` global rule (Claude's Discretion #3) so hash-link jumps keep section titles visible below the sticky header across all present and future sections.
- Inlined REQ-011 (4-pill authority strip), REQ-013 (h1 typography match), and REQ-014 (Hero height ≤ 540px) verbatim from RESEARCH.md §Phase Requirements into REQUIREMENTS.md — Phase 4 requirements are now first-class alongside the Phase 3 audit REQ-001..008.
- User visual gate confirmed on 1440×900: Hero typography matches reference, Hero height ≤ 540px, 4 authority pills on one row with no wrap, nav active-state highlight toggles on scroll, anchor-scroll keeps section titles visible below the sticky header, Kubestronaut external link opens in a new tab, and no console errors.

## Task Commits

Each task was committed atomically:

| # | Task | Commit | Type |
|---|------|--------|------|
| 1 | Cross-file Kubestronaut rename (social.ts + BaseLayout.astro + CLAUDE.md) | `5b7d515` | fix |
| 2 | Header.astro IntersectionObserver + `.is-active` scoped style + global.css `section[id]` scroll-margin-top | `5abe507` | feat |
| 3 | REQ-011/013/014 inlined into REQUIREMENTS.md + `npm run build` gate (7 pages, exit 0) | `9fe1668` | docs |
| 4 | Human visual gate (manual verification on 1440×900 EN + RU) | — | approved |

_Plan metadata commit for this SUMMARY.md is created after this file lands._

## Files Created/Modified

### `src/data/social.ts` — certifications[0] renamed (Task 1 / `5b7d515`)

Before:
```ts
{ name: 'CNCF Kubernaut', badge: 'kubernaut' },
```

After:
```ts
{ name: 'CNCF Kubestronaut', badge: 'kubestronaut' },
```

Both fields renamed. Other 5 entries (CKA/CKS/CKAD/KCNA/KCSA) preserved byte-identical. `as const` closure preserved. Skills, socialLinks, speakingEvents, presentations exports untouched.

### `src/layouts/BaseLayout.astro` — default description meta renamed (Task 1 / `5b7d515`)

Before (line 15):
```astro
const { title, description = 'Viktor Vedmich — Senior Solutions Architect @ AWS, CNCF Kubernaut, Author, Speaker', locale, path = '' } = Astro.props;
```

After:
```astro
const { title, description = 'Viktor Vedmich — Senior Solutions Architect @ AWS, CNCF Kubestronaut, Author, Speaker', locale, path = '' } = Astro.props;
```

The string flows through `<meta name="description">`, `<meta property="og:description">`, and `<meta name="twitter:description">` (three consumers, single source). Em-dash (U+2014) preserved verbatim.

### `CLAUDE.md` — §Homepage Sections #2 renamed (Task 1 / `5b7d515`)

Before:
```markdown
2. **About** — bio, skill pills, certifications (CNCF Kubernaut + all 5 K8s certs)
```

After:
```markdown
2. **About** — bio, skill pills, certifications (CNCF Kubestronaut + all 5 K8s certs)
```

Em-dash + bold formatting + parenthetical structure preserved. No other CLAUDE.md lines touched.

### `src/components/Header.astro` — second `<script>` + first `<style>` appended (Task 2 / `5abe507`)

**Append shape** (34 lines added after the existing `</script>` on line 173):

- **New `<script>` block:** lines **175–199** (25 lines including trailing `</script>`). Declares `sections`, `navLinks`, `linkByHref`, `obs` (module-scoped; zero collision with existing `<script>` block's `btn`, `menu`, `header`, `searchTriggerDesktop`, etc.). Observer config:
  ```js
  { threshold: 0.5, rootMargin: '-80px 0px -50% 0px' }
  ```
  - `threshold: 0.5` → section becomes "active" when ≥50% intersects the active zone.
  - `-80px` top rootMargin → accounts for ~61px sticky header + ~19px buffer.
  - `-50%` bottom rootMargin → narrows active zone to the upper half of the viewport (avoids the "last-section-always-active" pitfall).
  - TypeScript cast `(e.target as HTMLElement)` preserves Astro's TS checks.

- **New `<style>` block:** lines **201–207** (7 lines). First `<style>` block in this file. Contains:
  ```css
  header a.is-active {
    color: var(--text-primary);
    border-bottom: 2px solid var(--brand-primary);
  }
  ```
  - Plain CSS, not `@apply` — Astro's scoped-style compiler prefixes with `[data-astro-cid-*]`; Deep Signal CSS custom properties resolve correctly.

- **Preserved byte-identical:** existing `<script>` block (lines 129–173) with mobile menu toggle, scroll-shrink handler, language switcher, and search-trigger handlers.

**Script block count:** grep `^<script>` returns **2** (existing + new). Grep `^<style>` returns **1** (new block is the first in this file).

### `src/styles/global.css` — `section[id]` scroll-margin-top rule added (Task 2 / `5abe507`)

**Append shape** (8 lines added after `html { scroll-behavior: smooth }` on lines 58–60):

```css
/* Sticky-header offset for anchor navigation (Phase 4 Claude's Discretion #3).
   All <section id="..."> gets 80px top breathing room when scrolled to via
   hash link. Pairs with scroll-behavior: smooth and Header.astro's ~61px
   sticky height. */
section[id] {
  scroll-margin-top: 80px;
}
```

**Placement:** lines **62–69**, immediately after the smooth-scroll rule, before `body { ... }`. The rule uses CSS attribute selector `section[id]` so it auto-applies to Hero (`#hero`), About (`#about`), Podcasts (`#podcasts`), Speaking (`#speaking`), Book (`#book`), Presentations (`#presentations`), Blog (`#blog`), Contact (`#contact`), and any future section.

**Typing-cursor regression check (Plan 04-02 consistency):** `grep -c 'typing-cursor' src/styles/global.css` returns **0** — the rules removed by Plan 04-02 Task 3 (commit `5917fa5`) stayed removed. No regression introduced by this plan.

**Preservation:** `@theme` block, `@font-face` declarations, `html { scroll-behavior: smooth }`, `body { ... }`, `@keyframes fadeInUp`, `.animate-on-scroll`, `.card-glow`, `@keyframes drawLine`, and the `@media (prefers-reduced-motion: reduce)` wrapper (minus the removed `.typing-cursor` override from Plan 04-02) all preserved byte-identical.

### `.planning/REQUIREMENTS.md` — REQ-011, REQ-013, REQ-014 inlined (Task 3 / `9fe1668`)

**Insertion shape:** 73 lines added between REQ-008 (ends around line 178) and `## Global acceptance (all phases)` (now at line 253).

**Requirement block line numbers (final state):**

- **REQ-011** — Hero: reposition as primary pitch with 4-pill authority strip. Starts at **line 180**, ~23 lines. Acceptance criteria: 4 `<a>` pills with exact class string, Kubestronaut pill has `target="_blank"`/`rel="noopener"`/`aria-label`, zero CKA/CKS/CKAD/KCNA/KCSA in Hero, 4-pill row on one line at 1440px, EN+RU parity, nav active-state toggles via D-09 observer.
- **REQ-013** — Hero: typography matches reference exactly. Starts at **line 205**, ~30 lines. Acceptance criteria: h1 computed style at 1440×900 (`fontSize=64px`, `fontWeight=700`, `letterSpacing=-1.92px`, `lineHeight=67.2px`, Space Grotesk family), h1 `fontSize=40px` at 375×667 (clamp floor), `grad-hero-flat` token declared + consumed, zero `typing-cursor` class, zero hardcoded hex.
- **REQ-014** — Hero: section height ≤ 540px on 1440×900. Starts at **line 237**, ~14 lines. Acceptance criteria: `getBoundingClientRect().height` ≤ 540, no `min-h-[90vh]` / `flex items-center` / `pt-16` classes on the Hero `<section>` wrapper, `pt-24 pb-16 px-6` classes present, 4 pills on one row on 1440×900.

**Preservation:** REQ-001 (line 9), REQ-002 (line 33), REQ-003 (line 56), REQ-004 (line 81), REQ-005 (line 101), REQ-006 (line 121), REQ-007 (line 142), REQ-008 (line 164) all preserved byte-identical. `## Global acceptance (all phases)` heading preserved at line 253.

## Confirmations (acceptance criteria verified)

### Task 1 acceptance (Kubestronaut rename)

- `grep -q "name: 'CNCF Kubestronaut', badge: 'kubestronaut'" src/data/social.ts` ✓
- `grep -q "CNCF Kubestronaut, Author, Speaker" src/layouts/BaseLayout.astro` ✓
- `grep -q "certifications (CNCF Kubestronaut + all 5 K8s certs)" CLAUDE.md` ✓
- `grep -rn 'Kubernaut' src/ CLAUDE.md 2>&1 | grep -v Binary` returns **zero matches** (final zero-residual check) ✓
- Non-target blocks preserved: CKA/CKS/CKAD/KCNA/KCSA cert entries unchanged ✓

### Task 2 acceptance (observer + style + scroll-margin)

- `grep -q 'new IntersectionObserver' src/components/Header.astro` ✓ (line 184)
- `grep -q "threshold: 0.5, rootMargin: '-80px 0px -50% 0px'" src/components/Header.astro` ✓
- `grep -q "document.querySelectorAll('section\[id\]')" src/components/Header.astro` ✓
- `grep -q 'header a.is-active' src/components/Header.astro` ✓
- `grep -q 'border-bottom: 2px solid var(--brand-primary)' src/components/Header.astro` ✓
- `grep -c '^<script>' src/components/Header.astro` returns **2** ✓ (existing line 129 + new line 175)
- `grep -c '^<style>' src/components/Header.astro` returns **1** ✓ (new line 201)
- Existing mobile-menu / scroll-shrink / lang-switch / search-trigger handlers preserved (unchanged byte-identical diff) ✓
- `grep -q 'section\[id\] {' src/styles/global.css` ✓ (line 66)
- `grep -q 'scroll-margin-top: 80px' src/styles/global.css` ✓ (line 67)
- `grep -q 'scroll-behavior: smooth' src/styles/global.css` ✓ (line 59, preserved)
- `grep -c 'typing-cursor' src/styles/global.css` returns **0** ✓ (Plan 04-02 removal held)

### Task 3 acceptance (REQUIREMENTS + build gate)

- `grep -q '^## REQ-011 — Hero: reposition as primary pitch' .planning/REQUIREMENTS.md` ✓ (line 180)
- `grep -q '^## REQ-013 — Hero: typography matches reference exactly' .planning/REQUIREMENTS.md` ✓ (line 205)
- `grep -q '^## REQ-014 — Hero: section height' .planning/REQUIREMENTS.md` ✓ (line 237)
- `grep -q '^## REQ-001' .planning/REQUIREMENTS.md` ✓ (preserved, line 9)
- `grep -q '^## REQ-008' .planning/REQUIREMENTS.md` ✓ (preserved, line 164)
- `grep -q '## Global acceptance (all phases)' .planning/REQUIREMENTS.md` ✓ (preserved, line 253)
- `npm run build` exits **0** with **7 pages built** ✓
- `dist/en/index.html` and `dist/ru/index.html` exist ✓
- Each locale's `<section id="hero">` contains exactly **4 pills** ✓
- Each locale's Hero contains `href="https://www.cncf.io/training/kubestronaut/"` + `rel="noopener"` ✓
- Each locale's Hero renders the tagline accent with `AI Engineer` wrapped in `text-text-primary` ✓
- Each locale's built HTML contains **zero** `Kubernaut` (without `-estr-`) substrings ✓
- Each locale's Hero contains **zero** CKA/CKS/CKAD/KCNA/KCSA strings ✓
- Built CSS (`dist/_astro/*.css`) contains **zero** `typing-cursor` references ✓

### Task 4 acceptance (user visual gate — APPROVED)

User verified on 1440×900 EN + RU:

- ✓ Hero typography matches reference: h1 Space Grotesk 64px/700/-0.03em/1.05/#E2E8F0
- ✓ Hero height ≤ 540px (compact, upper-half of viewport)
- ✓ 4 authority pills render on one row (no wrap)
- ✓ Nav active-state highlight toggles correctly when scrolling between sections
- ✓ Anchor scroll keeps section titles visible below the sticky header (scroll-margin-top working)
- ✓ Kubestronaut external link opens in new tab (new window opens, `target="_blank"` + `rel="noopener"` honored)
- ✓ No console errors

User resume-signal: **"approved — all visual checks passed. Hero typography matches reference at 1440×900, height ≤ 540px, 4 pills on one row, nav active-state highlight works, anchor scroll keeps section titles visible below sticky header, Kubestronaut external link opens in new tab, no console errors."**

## Measured Hero Dimensions (from user visual gate)

Per user confirmation on 1440×900:

| Metric | Target | Measured | Status |
|---|---|---|---|
| `document.getElementById('hero').getBoundingClientRect().height` on 1440×900 | ≤ 540px (target ~520) | ≤ 540 (user-confirmed) | ✓ REQ-014 |
| h1 `font-family` | Space Grotesk | Space Grotesk | ✓ REQ-013 |
| h1 `font-size` at 1440×900 | 64px | 64px (user-confirmed) | ✓ REQ-013 |
| h1 `font-weight` | 700 | 700 | ✓ REQ-013 |
| h1 `letter-spacing` | -1.92px (-0.03em × 64px) | matches reference | ✓ REQ-013 |
| h1 `line-height` | 67.2px (1.05 × 64px) | matches reference | ✓ REQ-013 |
| h1 `color` | `#E2E8F0` (`--text-primary`) | matches reference | ✓ REQ-013 |
| 4-pill row | one line, no wrap at 1440px | one line, no wrap | ✓ REQ-011 |
| Nav `.is-active` highlight | toggles on scroll | toggles correctly | ✓ D-09 |
| Anchor scroll with scroll-margin-top | section title visible below header | visible | ✓ Claude's Discretion #3 |
| Kubestronaut external link | opens in new tab | opens in new tab | ✓ D-05 / T-04-01 |
| Console errors | zero | zero | ✓ |

_User did not report exact pixel counts for the DevTools Computed tab — the approval statement confirms all targets were met. Precise pixel measurements can be re-captured post-push on live via Playwright-cli if needed (see 04-02-SUMMARY.md §Next Phase Readiness for the deferred post-push Playwright verification plan)._

## Decisions Made

1. **Kept the second `<script>` as a separate block** (not a merge into the existing `<script>`) — Astro 5 supports multiple `<script>` tags per component, each module-scoped. Merging would require renaming the new `sections`/`navLinks`/`linkByHref`/`obs` to avoid collision with the existing `btn`/`menu`/`header` names and would make the Phase 4 diff noisier. Separation keeps each script's concern self-contained and reviewable.
2. **Inlined REQ-011/013/014 verbatim from RESEARCH.md §Phase Requirements** — did not paraphrase or re-author. This keeps the audit trail tight: the requirements doc is now the single source of truth, but the text originated in Phase 4 research and the commit message records the promotion path (Phase 11 → Phase 4 during Phase 3 audit).
3. **Placed `section[id]` scroll-margin-top rule at lines 62–69 of global.css** — immediately after `html { scroll-behavior: smooth }`. This keeps the two anchor-navigation rules adjacent for future readers and makes the rule easy to find via the existing smooth-scroll landmark.
4. **No STATE.md / ROADMAP.md / REQUIREMENTS.md-progress-bar writes** — orchestrator owns those writes after all waves complete. This plan only touches REQUIREMENTS.md to add the three new REQ blocks (not the Global acceptance progress bar).
5. **Relied on Task 3's `npm run build` as the TS compile gate** — the observer's `as HTMLElement` cast would fail the build if Astro's TS config rejected it. Build passed with 7 pages, so the cast is compatible with the current toolchain.

## Deviations from Plan

**None — plan executed exactly as written.**

All 4 tasks followed their explicit `<action>` blocks verbatim. Every class string, attribute name, observer configuration, CSS rule, requirement block text, and file placement matches the plan's specification byte-for-byte. No Rule 1 bug fixes, no Rule 2 missing functionality, no Rule 3 blocking issues, no Rule 4 architectural changes encountered. User visual gate passed on first attempt with no requested changes.

## Issues Encountered

**None.**

## User Setup Required

**None.** No external service configuration, no API keys, no DNS changes. Pure source-file mutations + one documentation file (REQUIREMENTS.md). GitHub Pages will deploy automatically on next push to `main` (outside this plan's scope; orchestrator decision).

## Authentication Gates

**None encountered.** No external service was touched by this plan. The one external URL referenced (`https://www.cncf.io/training/kubestronaut/`) was added to the Hero in Plan 04-02 and was already verified reachable (HTTP 200) at that time.

## Self-Check: PASSED

Verified claims before completing this plan via automated checks:

### 1. Modified files contain the expected content

- `src/data/social.ts` — `"CNCF Kubestronaut"` + `"kubestronaut"` badge present; `"CNCF Kubernaut"` absent ✓
- `src/layouts/BaseLayout.astro` — `"CNCF Kubestronaut, Author, Speaker"` present ✓
- `CLAUDE.md` — `"certifications (CNCF Kubestronaut + all 5 K8s certs)"` present ✓
- `src/components/Header.astro` — 2 `<script>` blocks + 1 `<style>` block; `new IntersectionObserver` at line 184; `header a.is-active` + teal underline style at lines 201–207 ✓
- `src/styles/global.css` — `section[id] { scroll-margin-top: 80px }` at lines 66–68; `html { scroll-behavior: smooth }` at lines 58–60 preserved; `typing-cursor` count = 0 (Plan 04-02 removal held) ✓
- `.planning/REQUIREMENTS.md` — REQ-011/013/014 at lines 180/205/237; REQ-001..008 and Global acceptance preserved ✓

### 2. Commits exist in git log

```
9fe1668 docs(04-03): inline REQ-011, REQ-013, REQ-014 into REQUIREMENTS.md
5abe507 feat(04-03): add nav-active IntersectionObserver + section scroll-margin-top
5b7d515 fix(04-03): rename CNCF Kubernaut -> Kubestronaut in social.ts, BaseLayout, CLAUDE.md
```

All three hashes verified present via `git log --oneline`.

### 3. Zero residual Kubernaut in src/ or CLAUDE.md

`grep -rn 'Kubernaut' src/ CLAUDE.md 2>&1 | grep -v Binary` returns **no matches**. Historical artifacts under `.planning/`, `.playwright-cli/`, `current-content.json`, `ref-content.json` intentionally preserved per D-04 exclusion list.

### 4. Post-commit deletion checks

None of the three commits had unexpected file deletions (`git diff --diff-filter=D --name-only HEAD~1 HEAD` returned empty for each).

### 5. Build gate green

`npm run build` exits 0 with 7 pages built. Built HTML + CSS pass all DOM checks (pill count, Kubestronaut link, tagline accent, zero Kubernaut, zero CKA-family in Hero, zero typing-cursor in CSS) in both EN and RU locales.

### 6. User visual gate approved

User resume-signal recorded verbatim: "approved — all visual checks passed. Hero typography matches reference at 1440×900, height ≤ 540px, 4 pills on one row, nav active-state highlight works, anchor scroll keeps section titles visible below sticky header, Kubestronaut external link opens in new tab, no console errors."

## Next Phase Readiness

**Phase 4 is complete. All three plans (04-01, 04-02, 04-03) have landed.** Ready for the orchestrator's `verify_phase_goal` step and atomic phase commit.

**Flag for orchestrator:**

- **Status:** Phase 4 fully delivered. REQ-011, REQ-013, REQ-014 all satisfied by code + user-approved visual gate. Cross-file Kubestronaut rename complete (zero residuals in `src/` or `CLAUDE.md`). Nav active-state observer + scroll-margin-top global rule both landed. REQUIREMENTS.md updated.
- **9 files touched across Phase 4** (as recorded in the plan's `<output>` note):
  - `src/i18n/en.json`, `src/i18n/ru.json` (Plan 04-01)
  - `src/styles/design-tokens.css`, `src/components/Hero.astro`, `src/styles/global.css` (Plan 04-02, and global.css again in Plan 04-03)
  - `src/data/social.ts`, `src/layouts/BaseLayout.astro`, `CLAUDE.md`, `src/components/Header.astro` (Plan 04-03)
  - `.planning/REQUIREMENTS.md` (Plan 04-03)
- **Commits on `main` from this plan:** `5b7d515` (rename), `5abe507` (observer + scroll-margin), `9fe1668` (REQ inline). Adding the forthcoming `docs(04-03): complete rename-observer-gate plan` SUMMARY commit brings Phase 4's Plan 04-03 to 4 commits total.
- **No push performed** — per CLAUDE.md §Publishing Workflow ("Big changes: needs a PR + visual review") vs. §Small changes ("push to main, auto-deploy"). Phase 4 is a Hero rewrite → spans "big changes" territory, but the repo convention here has been push-to-main for Wave closures. Orchestrator decides push timing.
- **Deferred items:** None introduced by this plan. The earlier-deferred "post-push Playwright-cli runtime verification on live `vedmich.dev/en/` and `vedmich.dev/ru/`" (noted in 04-02-SUMMARY.md Next Phase Readiness) remains deferred to post-push — not a gate for this plan's closure.

## Threat Flags

**None new.** All threat surface introduced by this plan is enumerated in the plan's `<threat_model>` block:

- T-04-03-01 through T-04-03-04 (data/docs tampering + info disclosure) — all dispositioned `accept` (build-time static data, public bio, docs artifacts).
- T-04-03-05 (Injection via inline observer `<script>`) — verified no `innerHTML`, no `eval`, no user input path in the new script block. DOM APIs only.
- T-04-03-06 (DoS via observer) — single observer instance watching ~8 sections; native browser throttling; no rAF/polling loop.
- T-04-03-07 (Info disclosure via `href="#section"`) — same-origin navigation only; no new routes exposed.

Built HTML was scanned for additional `target="_blank"` without `rel="noopener"` by Plan 04-02's gate — zero matches then, and this plan introduced no new `target="_blank"` links. The single Kubestronaut external link (from Plan 04-02) retains its `rel="noopener"` + `aria-label`.

---

*Phase: 04-hero-reference-match*
*Plan: 03 — Rename + observer + gate*
*Completed: 2026-04-19*
