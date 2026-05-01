---
phase: 12-footer-match
reviewed: 2026-05-01T18:00:00Z
depth: standard
files_reviewed: 1
files_reviewed_list:
  - src/components/Footer.astro
findings:
  critical: 0
  warning: 2
  info: 4
  total: 6
status: issues_found
---

# Phase 12: Code Review Report

**Reviewed:** 2026-05-01T18:00:00Z
**Depth:** standard
**Files Reviewed:** 1
**Status:** issues_found

## Summary

`src/components/Footer.astro` is the single modified file for Phase 12 — an 18-line
two-column footer that replaces a previous 43-line implementation. The rewrite is
structurally correct: Props contract preserved (`{ locale: Locale }` matches
`BaseLayout.astro:72`), bilingual i18n kept, no hex literals, no deprecated cyan,
no user-input surface, Astro escapes the two interpolations by default. Build
output in `dist/en/index.html` confirms the footer renders as designed.

However, the pursuit of "exactly match the reference" deleted a responsive-stacking
safeguard present in the pre-Phase-12 implementation. The reference UI kit
(`app.jsx:640-648`) was designed at 1440px only and never verified at mobile widths.
Two WARNING findings are rooted in that regression. A third concern flags a
documentation inaccuracy between SUMMARY/CONTEXT and the actual resolved token value.

No Critical issues found. The two WARNINGs are layout/robustness regressions, not
correctness-at-1440px failures.

## Warnings

### WR-01: Mobile layout — two spans collide on narrow viewports (responsive regression)

**File:** `src/components/Footer.astro:14`
**Issue:**
The old Footer used `flex flex-col sm:flex-row items-center justify-between gap-4`
so on mobile (< 640px) the two text pieces stacked vertically. The new
implementation hard-codes `flex items-center justify-between` with NO `flex-wrap`,
NO `flex-col sm:flex-row`, and NO `gap-*`. The two `<span>`s now compete for the
same row at every viewport.

Real-world widths:
- EN row at 375px (iPhone SE): `© 2026 Viktor Vedmich` (~150px at 13px Inter) +
  `Built with Astro` (~105px) + 32px `px-4` padding ≈ 287px. Fits — barely.
- RU row at 375px: `© 2026 Виктор Ведмич` (Cyrillic glyphs ~10% wider) +
  `Создано на Astro` (similar width) ≈ 290px. Fits — barely.
- At 320px (narrow Android / small iPhone), both rows go tight. No browser
  overflow because `flex` lets `justify-between` do its work, but `items-center`
  means NO line-wrapping safety net — if either translation ever grows (e.g.,
  `© 2030 Виктор Сергеевич Ведмич` patronymic addition, a longer attribution
  string, or an English string like "Built with Astro + MDX") the two spans
  collide, and the browser will either allow horizontal overflow (clipping the
  viewport) or shrink both via flex algorithm without word-wrap inside a
  `<span>`.

Phase 12 CONTEXT explicitly preserved `px-4 sm:px-6` "mobile guard" but then
deleted the vertical-stacking safeguard that was the actual mobile-first
primitive. Reference was 1440px-only; production must serve 375px.

**Fix:**
Restore the responsive-stacking primitive used elsewhere in the codebase (same
pattern as the pre-Phase-12 version, and the same idiom as
`Contact.astro:63` `flex flex-col gap-[14px]`):

```astro
<div class="max-w-[1120px] mx-auto px-4 sm:px-6 py-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-[13px] text-text-muted">
  <span>{i.footer.copyright.replace('{year}', String(year))}</span>
  <span>{i.footer.built_with}</span>
</div>
```

This keeps the `sm:` (640px+) rendering pixel-identical to the current reference
match and only activates vertical stacking on narrow mobile — a strict
superset of the requested behaviour. CONTEXT D-02 already admits
`px-4 sm:px-6` divergence from the reference's literal `24px`; the same
logic applies to `flex-col` → `sm:flex-row`.

If the intent is strict "exactly the reference at every width", add at least
`flex-wrap gap-2` so overflow wraps gracefully instead of colliding:

```astro
<div class="max-w-[1120px] mx-auto px-4 sm:px-6 py-8 flex flex-wrap items-center justify-between gap-2 text-[13px] text-text-muted">
```

### WR-02: `new Date()` at SSG build time — stale year after Jan 1

**File:** `src/components/Footer.astro:10`
**Issue:**
`const year = new Date().getFullYear()` runs at build time, not at request time
(Astro is SSG — `output: 'static'` by default for `@astrojs/*` GitHub Pages
deploys). The dist HTML freezes the year at whatever the build runner's clock
was during the last `npm run build` on GitHub Actions.

If the site is not redeployed between Jan 1 of year N+1 and the first push to
`main` that year, the footer will display `© 2026` (or whatever the last
build captured) for as long as deploys are quiet. This is an inherent SSG
limitation, not introduced by Phase 12 — the pre-Phase-12 implementation had
the same behaviour. But CONTEXT.md D-03 calls this pattern "auto-scrolls
without touching the codebase," which is misleading — it actually scrolls on
the next build, which is rebuild-gated.

**Fix (pick one):**

1. Accept and document: add a comment so future readers don't assume runtime
   evaluation.

   ```astro
   // Captured at SSG build time — refreshes when the site next deploys.
   const year = new Date().getFullYear();
   ```

2. Add a yearly cron to GitHub Actions that triggers a no-op rebuild on Jan 1
   (a `workflow_dispatch` + `schedule: cron: '0 0 1 1 *'` workflow that runs
   `npm run build` and `actions/deploy-pages@v4`). This guarantees the footer
   reflects the current calendar year every January without manual work.

3. Move the rendering to a client-side `<script>` and populate the year at
   runtime. Rejected because it adds JS to a zero-JS page (violates CLAUDE.md
   "Zero JS by default") and introduces a flash-of-old-year on first paint.

Option 2 is the safest; option 1 is the cheapest. No action is required for
Phase 12 v0.4 closure.

## Info

### IN-01: Documentation drift — `text-text-muted` resolves to `#94A3B8`, not `#78909C`

**File:** `src/components/Footer.astro:14`
**Issue:**
Phase 12 artefacts (CONTEXT.md D-04, PATTERNS.md "Deep Signal color tokens",
SUMMARY.md "Final Component Structure") all claim `text-text-muted` resolves
to `#78909C` to match reference `VV.muted`. It actually resolves to
`#94A3B8` via the `@theme` shim in `src/styles/global.css:49`:

```css
--color-text-muted: var(--text-secondary);  /* AA contrast — not --text-muted */
```

The canonical `--text-muted` (`#78909C`) is only reachable via
`text-text-muted-new` (global.css:24). This is a pre-existing shim decision
(documented there as "AA contrast") and is not a Phase 12 regression. The
Footer render matches the reference-colour INTENT (muted grey-blue on dark
bg) with a slightly lighter shade that improves contrast. No fix needed —
but CONTEXT.md / SUMMARY.md should be corrected so future phases don't
chase a mirage.

**Fix:**
Update Phase 12 CONTEXT.md D-04 and SUMMARY.md to reference the actual
resolved value (`#94A3B8` via `text-secondary`) or switch the utility to
`text-text-muted-new` if strict `#78909C` is required. If unsure, leave as-is
— the `@theme` shim was a deliberate AA-contrast decision that outlives this
phase.

### IN-02: Redundant `String(year)` coercion

**File:** `src/components/Footer.astro:15`
**Issue:**
`i.footer.copyright.replace('{year}', String(year))` — the `String()` wrapper
is redundant. `String.prototype.replace`'s second argument is coerced to
string by the spec (step 5 of RegExp/String.prototype.replace algorithm).
`year.toString()` or just `year` both work. TypeScript strict mode does not
complain because `.replace()` accepts `string | ((...args) => string)`, but
the number → string coercion still happens. Minor readability note.

**Fix:**
```astro
<span>{i.footer.copyright.replace('{year}', String(year))}</span>
```
could become
```astro
<span>{i.footer.copyright.replace('{year}', `${year}`)}</span>
```
or simply
```astro
<span>{i.footer.copyright.replace('{year}', year.toString())}</span>
```

No functional change. Defer or ignore.

### IN-03: i18n template resilience — silent pass-through on missing `{year}`

**File:** `src/components/Footer.astro:15`
**Issue:**
If a future editor removes the literal `{year}` placeholder from
`src/i18n/en.json` or `src/i18n/ru.json` (`footer.copyright`), `.replace()`
silently returns the string unchanged — no throw, no lint, no build failure.
The footer would render `© Viktor Vedmich` without a year, and it would
slip through `npm run build` and even the current Phase 12 acceptance-grep
regime.

Not a bug today (both JSONs contain the literal), but brittle. The codebase
uses the same pattern in `Presentations.astro:21` (`.replace('{N}', ...)`),
so adding a helper would pay off twice.

**Fix (optional, for a future phase):**
Add a typed helper to `src/i18n/utils.ts`:

```typescript
export function interpolate(template: string, vars: Record<string, string | number>): string {
  let out = template;
  for (const [k, v] of Object.entries(vars)) {
    const placeholder = `{${k}}`;
    if (!out.includes(placeholder)) {
      throw new Error(`i18n template missing placeholder "${placeholder}": ${template}`);
    }
    out = out.replaceAll(placeholder, String(v));
  }
  return out;
}
```

Then the Footer line becomes
`{interpolate(i.footer.copyright, { year })}` and missing placeholders fail
loudly at build time. Out of scope for Phase 12.

### IN-04: `items-center` on two single-line spans is a no-op

**File:** `src/components/Footer.astro:14`
**Issue:**
`flex items-center` on a row where both children are single-line inline-level
`<span>`s with identical line-height (inherited `1.6` from Inter body) is
effectively a no-op — the flex cross-axis alignment would default to
`stretch`, but since both items have intrinsic height = one line of 13px text,
they sit on the same baseline either way. Keeping it is defensive (if one
span ever becomes multi-line, it stays vertically centred on the other) and
matches the pre-existing codebase idiom; no fix needed. Flagged for awareness
only.

**Fix:**
None needed. Leave as-is — it's safely defensive.

---

_Reviewed: 2026-05-01T18:00:00Z_
_Reviewer: Claude (gsd-code-reviewer)_
_Depth: standard_
