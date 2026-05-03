---
phase: 03-ui-polish
reviewed: 2026-05-03T00:00:00Z
depth: standard
files_reviewed: 9
files_reviewed_list:
  - CLAUDE.md
  - src/components/About.astro
  - src/components/BlogPreview.astro
  - src/components/Podcasts.astro
  - src/components/Presentations.astro
  - src/components/Speaking.astro
  - src/styles/design-tokens.css
  - src/styles/global.css
  - tests/unit/shiki-palette-guard.test.ts
findings:
  blocker: 1
  warning: 3
  info: 4
  total: 8
status: issues_found
---

# Phase 3: Code Review Report

**Reviewed:** 2026-05-03
**Depth:** standard
**Files Reviewed:** 9
**Status:** issues_found

## Summary

Phase 3 shipped four scoped changes: motion token update (`--transition-normal` → expo-out), a new pure-CSS `.animate-on-scroll-stagger` variant, bottom CTAs added to Blog/Presentations/Speaking, a Shiki palette guard test fixing Phase 2 tech debt (WR-03), and two light spacing fixes (About `sm:py-28`, Podcasts `bg-surface` + `gap-5`).

The code is well-structured, respects the Deep Signal token discipline (no hardcoded hex, no forbidden cyan/AWS/DKT colors), preserves the zero-JS budget (stagger is pure CSS via `:nth-child`), and includes a reduced-motion guard. The palette guard test passes all 8 assertions against the live Shiki version.

The review uncovered **one BLOCKER** (Shiki guard documentation cites stale CSS line numbers — this is the exact failure mode the guard is supposed to prevent), **three warnings** (CSS spec-compliance for `animation-delay`, missing `aria-hidden` on decorative SVGs, CTA-link duplication creating redundant screen-reader announcements), and **four info-level** suggestions around consistency and token hygiene.

No security findings. No i18n regressions. No tokens were hardcoded; no deprecated cyan, DKT, or AWS brand colors were reintroduced.

## Blocker Issues

### BL-01: Shiki palette guard documentation cites stale CSS line numbers

**File:** `CLAUDE.md:78` and `tests/unit/shiki-palette-guard.test.ts:6`, `:19`
**Issue:** The Shiki guard pattern section in CLAUDE.md (line 78) and the test file header (lines 6, 19) both direct the reader to "`src/styles/global.css` attribute selectors (lines 169-192)" where they should update hex values if the test fails. However, after this phase's insertion of the 24-line `.animate-on-scroll-stagger` block at `global.css:117`, the attribute selectors have shifted down. They now live at **`global.css:193-216`**, not 169-192. Lines 169-192 now contain Phase 2 code-block scaffolding comments and the `pre:is(.shiki, .astro-code)` base rule — updating any hex there will do nothing.

Why this is a BLOCKER and not a warning: the entire purpose of this guard is to catch future Shiki palette drift during an Astro bump. When an assertion fails a year from now, the failure message names "`#FFAB70` drifted" and the author follows the documentation pointer to lines 169-192 — where there is no matching selector to update. The guard then silently fails to actually guard; the selector at the real line 214 keeps its stale hex and the un-remapped github-dark color renders in blog code blocks. Phase 2's entire WR-03 ticket was about fixing this exact category of "silent drift breaks the override" — shipping the fix with a stale pointer reinstates the bug.

**Fix:** Update both locations to cite `lines 193-216`. Prefer a line-agnostic anchor to stop this recurring on every future CSS edit:

```css
/* In src/styles/global.css, wrap the Shiki token overrides with a sentinel comment
   block so docs reference the sentinel, not line numbers: */

/* === SHIKI_TOKEN_OVERRIDES_BEGIN === */
.prose :is(.shiki, .astro-code) span[style*="color:#E1E4E8" i] {
  color: var(--text-primary) !important;
}
/* ... other 7 selectors ... */
.prose :is(.shiki, .astro-code) span[style*="color:#FFAB70" i] {
  color: var(--brand-primary-hover) !important;
}
/* === SHIKI_TOKEN_OVERRIDES_END === */
```

Then update CLAUDE.md §Shiki palette guard and the test header to: "update the matching attribute selector inside `/* SHIKI_TOKEN_OVERRIDES_BEGIN */` ... `/* SHIKI_TOKEN_OVERRIDES_END */` block in `src/styles/global.css`." This pattern is drift-proof.

If a sentinel is too heavy, minimal fix: change `169-192` → `193-216` in both files. But the line-number pointer will rot again on the next global.css edit — expect to repeat this fix.

## Warnings

### WR-01: `animation-delay: 0 !important` is invalid per CSS spec (missing time unit)

**File:** `src/styles/global.css:167`
**Issue:** Inside the `@media (prefers-reduced-motion: reduce)` block, `animation-delay` is set to a bare `0` without a time unit:

```css
.animate-on-scroll-stagger > .animate-on-scroll {
  animation-delay: 0 !important;
  opacity: 1 !important;
}
```

Per CSS Animations Level 1 and the CSS Values Module, `animation-delay` requires a `<time>` value, which MUST have a unit (`s` or `ms`) — unlike `<length>` where `0` is unitless-valid. Some browsers (Chrome, Firefox) accept the bare `0` as a non-standard leniency; Safari has historically been stricter, and WebKit may reject the declaration and keep the non-reduced-motion delay (0→540ms stagger) active, defeating the accessibility guard.

The CSS validator (and Stylelint's `length-zero-no-unit` rule) will flag bare-zero for `<length>` — but for `<time>` the rule flips: the unit IS required. The nth-child rules above at lines 125-135 all correctly use `0ms`; this one-liner is the only outlier.

**Fix:**
```css
.animate-on-scroll-stagger > .animate-on-scroll {
  animation-delay: 0ms !important;
  opacity: 1 !important;
}
```

### WR-02: Decorative SVG arrow icons lack `aria-hidden="true"` on podcast cards

**File:** `src/components/Podcasts.astro:46-48` and `:73-75`
**Issue:** Both podcast cards contain a decorative right-chevron SVG inside a `<div>` that wraps the "Listen" text and arrow:

```astro
<div class="mt-4 inline-flex items-center gap-1 text-sm text-text-muted group-hover:text-brand-primary-hover transition-colors">
  {i.podcasts.listen}
  <svg class="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
    <path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7" />
  </svg>
</div>
```

The SVG has no `role`, no `aria-label`, no `aria-hidden`. Its semantic meaning ("arrow indicating clickable link") is already conveyed by the "Listen" text and the anchor wrapper. Screen readers may:
- Announce nothing (benign) if the SVG lacks an accessible name — actual behavior in VoiceOver/NVDA varies.
- Announce "image" or the raw `<path>` attributes in older AT.

Since the outer `<a>` has a meaningful href and visible "Listen" text, the SVG is purely presentational. Best practice per WAI-ARIA 1.2 is to mark decorative SVGs `aria-hidden="true"` AND `focusable="false"` (the latter to prevent IE/Edge-legacy tab-stop bugs, still a good defensive marker).

This same pattern exists pre-phase-3, so it is not strictly a regression, but Podcasts was edited in this phase (gap-5 + bg-surface changes on the same cards) and the surrounding markup was under review. Flagging now rather than letting it persist.

**Fix:**
```astro
<svg
  class="w-4 h-4 group-hover:translate-x-1 transition-transform"
  fill="none"
  viewBox="0 0 24 24"
  stroke="currentColor"
  stroke-width="2"
  aria-hidden="true"
  focusable="false"
>
  <path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7" />
</svg>
```

### WR-03: Duplicate CTA links in BlogPreview and Presentations create redundant screen-reader announcements

**File:** `src/components/BlogPreview.astro:27-33` + `:49-57`; `src/components/Presentations.astro:28-34` + `:43-50`
**Issue:** Both components render two anchor elements pointing to the **same URL** with **identical visible text**:

- BlogPreview: top-right `{i.blog.all_posts} →` at `href="/${locale}/blog"` and bottom-left `{i.blog.all_posts} →` at `href="/${locale}/blog"`.
- Presentations: same pattern with `{i.presentations.all_decks} →` at `href="/${locale}/presentations"`.

Screen-reader users navigating by the "links list" (VoiceOver rotor, NVDA `Insert+F7`) will see two entries with identical text and identical URL. Per WCAG 2.4.4 Link Purpose (In Context), duplicate links with identical accessible names are not a failure — but WAI-ARIA Authoring Practices flag this as an "avoidable noise" pattern when the links are functionally equivalent. Sighted users get visual affordance (top vs bottom placement); AT users lose that context.

Speaking.astro does not have this problem — it has only the bottom CTA. The phase's stated goal (per the phase context) was "Bottom CTAs added to Blog/Presentations/Speaking" — BlogPreview and Presentations ALREADY had top-right CTAs from a prior phase, so this phase effectively duplicated them. This may be intentional UX (redundancy is fine on wide grids), but the accessibility impact deserves a call-out.

**Fix:** Two options, pick one.

**Option A (minimal, preserves visual design):** Give each link a distinguishing `aria-label` so AT users understand their position:

```astro
<!-- Top-right -->
<a href={`/${locale}/blog`}
   class="text-sm text-text-muted hover:text-brand-primary transition-colors whitespace-nowrap"
   aria-label={`${i.blog.all_posts} (top of section)`}>
  {i.blog.all_posts} →
</a>

<!-- Bottom -->
<a href={`/${locale}/blog`}
   class="text-sm text-text-muted hover:text-brand-primary transition-colors whitespace-nowrap"
   aria-label={`${i.blog.all_posts} (end of section)`}>
  {i.blog.all_posts} →
</a>
```

**Option B (cleaner, drops visual duplication):** Remove the top-right CTA and keep only the bottom — matching the Speaking component pattern. The h2 can be left-aligned alone; the bottom CTA alone is sufficient on mobile and desktop.

Option B is recommended for consistency; it aligns all three sections (Blog, Presentations, Speaking) to the same layout.

## Info

### IN-01: `text-warm` shim alias in Speaking.astro could migrate to canonical token

**File:** `src/components/Speaking.astro:56`
**Issue:** The highlight text uses the shim alias `text-warm` (which maps to `--brand-accent` amber via `global.css:46`). The Deep Signal system's stated preference in CLAUDE.md is the canonical naming (`text-brand-accent`) for new code; shim aliases exist purely for migration backwards-compatibility.

This is not a bug — the shim correctly resolves to the same color — but new/touched lines in this phase are an opportunity to shed legacy naming.

**Fix:** `class="font-mono text-xs text-warm mt-2"` → `class="font-mono text-xs text-brand-accent mt-2"`. No visual change, one less shim-alias dependency.

### IN-02: `whitespace-nowrap` on bottom CTAs may overflow on extremely narrow RU viewports

**File:** `src/components/BlogPreview.astro:29`, `:53`; `src/components/Presentations.astro:31`, `:47`; `src/components/Speaking.astro:66`
**Issue:** All five new/updated CTAs use `whitespace-nowrap`. The shortest viewport in practice is 320px (iPhone SE 1st gen). The RU localized strings are:
- `"Все посты →"` (12 chars) — safe
- `"Все доклады →"` (14 chars) — safe
- `"Все выступления →"` (18 chars) — ~160-180px at `text-sm`, still safe on 320px

All current strings fit. The concern is future i18n additions (e.g., a German locale, or a longer RU variant) could hit the ~320px bound and force horizontal scroll. `whitespace-nowrap` also prevents the browser from intelligently wrapping in the rare case where it would help.

**Fix:** Consider whether `whitespace-nowrap` is load-bearing here. If the arrow `→` must stay on the same line as the label (the visual intent), prefer `whitespace-nowrap` on a tighter span wrapping only the arrow, or use a non-breaking space between text and arrow: `{i.blog.all_posts}&nbsp;→`. For now, not a regression — flagging for future-proofing.

### IN-03: Podcasts 2-card grid intentionally opts out of stagger — worth a comment

**File:** `src/components/Podcasts.astro:16`
**Issue:** BlogPreview and Presentations grids now use `animate-on-scroll-stagger`, but Podcasts' 2-card grid at line 16 does not — each card just has plain `animate-on-scroll`. A future maintainer may see the inconsistency and "fix" it by adding the class, unaware that 2 items produce a barely-perceptible stagger (60ms offset) that doesn't justify the wrapper complexity.

This is a design decision worth documenting in-code.

**Fix:** Add a one-line comment:
```astro
<!-- 2-card grid: plain animate-on-scroll per card; stagger adds no
     meaningful cascade at N=2 and makes the second card feel laggy. -->
<div class="grid md:grid-cols-2 gap-5">
```

### IN-04: Shiki palette guard test lacks version pin documentation

**File:** `tests/unit/shiki-palette-guard.test.ts:1-27`
**Issue:** The test guards against Shiki `github-dark` palette drift, but the file header doesn't document the Shiki version the current hex values were captured from (`shiki@3.x` per `@shikijs/transformers ^3.23.0` in package.json). If all 8 tests fail after a Shiki 4.x major, the engineer has no baseline version to diff against in the Shiki changelog.

**Fix:** Add to the header comment:
```ts
// Captured against: shiki (transitive via @shikijs/transformers ^3.23.0).
// On assertion failure after `npm update`, diff the theme at
// https://github.com/shikijs/textmate-grammars-themes/blob/main/packages/tm-themes/themes/github-dark.json
// between the installed version and the previous one to identify the changed token.
```

---

## Notes on items NOT found (clean signals)

- **No hardcoded hex** in any reviewed component (`grep "#[0-9A-Fa-f]{6}" src/components/*.astro src/styles/design-tokens.css src/styles/global.css` shows only tokens in `design-tokens.css` and `global.css`'s Shiki attribute selectors — both by design).
- **No forbidden colors**: `#06B6D4`, `#22D3EE`, `#7C3AED`, `#FF9900`, `#232F3E` — zero matches in reviewed files.
- **Zero-JS budget honored**: stagger is pure CSS `:nth-child`, no new script added.
- **Reduced-motion guard correct**: the new stagger has its own `@media (prefers-reduced-motion: reduce)` override (`global.css:166-169`) that resets delay and forces opacity; BaseLayout's JS also bails out of IntersectionObserver under reduced motion (covers the opacity-0 initial state).
- **`--transition-normal` matches spec**: `250ms cubic-bezier(0.16, 1, 0.3, 1)` — identical curve to `--transition-slow` and `--ease-out`. Confirmed against CLAUDE.md phase context.
- **i18n clean**: all new CTA text uses existing translation keys (`i.blog.all_posts`, `i.presentations.all_decks`, `i.speaking.all_talks`) — no hardcoded strings introduced. Both `en.json` and `ru.json` already contain these keys.
- **Shiki test executes green** against current Shiki install (`node --experimental-strip-types --test` — 8/8 pass).
- **No XSS surface**: no `set:html`, no `innerHTML`, no user-rendered unescaped content in reviewed components. Blog prose is handled elsewhere (Astro Content Collections Markdown pipeline — already reviewed in prior phases).
- **Card `<a>` semantics preserved**: all three CTA anchors are standalone block links (not nested inside other anchors).

---

_Reviewed: 2026-05-03_
_Reviewer: Claude (gsd-code-reviewer)_
_Depth: standard_
