---
phase: 06-book-packt-cover
reviewed: 2026-04-21T00:00:00Z
depth: standard
files_reviewed: 1
files_reviewed_list:
  - src/components/Book.astro
findings:
  critical: 0
  warning: 1
  info: 3
  total: 4
status: issues_found
---

# Phase 6: Code Review Report

**Reviewed:** 2026-04-21
**Depth:** standard
**Files Reviewed:** 1
**Status:** issues_found

## Summary

`src/components/Book.astro` implements the Phase 6 Book rewrite: full-bleed amber band, 3-column desktop layout with JPG cover, Amazon rating row with ARIA, and a whole-card anchor that uses a styled `<span>` CTA to avoid nested anchors. The component is well-structured and adheres to most Deep Signal conventions — i18n is wired correctly via `t(locale)`, external link security is correctly set (`rel="noopener noreferrer"`), ARIA labeling of the rating row is correct, `prefers-reduced-motion` is respected, and no deprecated cyan / DKT / AWS brand colors appear anywhere.

The only substantive concern (WR-01) is that the component-scoped `<style>` block bakes the brand-primary teal (`#14B8A6`) into `drop-shadow()` as raw `rgba(20, 184, 166, 0.22)`. Per CLAUDE.md, components must reference design tokens rather than hardcoded hex/rgb — and a drifted palette migration would bypass this component. Two Info items track minor polish (ordering of i18n-independent constants, intentional hardcoded rating documentation), and one Info item flags a redundant `shrink-0` that has no effect on a grid item.

No critical issues. No invalid HTML, no nested anchors, no XSS vectors, no anti-pattern brand colors.

## Warnings

### WR-01: Brand-primary teal hardcoded as raw RGB in component-scoped CSS

**File:** `src/components/Book.astro:30`
**Issue:** The hover state drop-shadow uses `rgba(20, 184, 166, 0.22)`, which is `#14B8A6` (the `--brand-primary` token) expressed as decimal RGB. CLAUDE.md states: *"Never add hardcoded hex to components — always reference a token."* Hardcoded color literals (even disguised as `rgba()`) inside component CSS bypass the canonical token pipeline — a future palette adjustment in `design-tokens.css` (e.g. a teal hue refinement) would not propagate here, silently drifting this component off-brand. The same applies to `rgba(0, 0, 0, 0.45)` / `rgba(0, 0, 0, 0.55)` on lines 21 and 29, though those correspond to the generic black drop-shadow rather than a brand color and are less critical.

The project already exposes `--shadow-glow: 0 0 20px rgba(20,184,166,0.15)` (design-tokens.css:231) for exactly this kind of teal glow, and `.card-glow` on the parent `<a>` already applies it on hover via `box-shadow`. The custom `drop-shadow` layering here duplicates that intent in a non-tokenized form.

**Fix:** Replace the raw RGB literals with CSS custom properties so the component respects token updates. Two options:

Option A — prefer the existing `--shadow-glow` token where possible, and introduce a token for the black ambient shadow:

```astro
<style>
  .book-cover {
    display: block;
    height: auto;
    filter: drop-shadow(8px 14px 22px rgba(0, 0, 0, 0.45));
    transition: transform 400ms cubic-bezier(0.16, 1, 0.3, 1),
                filter 400ms cubic-bezier(0.16, 1, 0.3, 1);
    will-change: transform;
  }
  .book-card:hover .book-cover,
  .book-card:focus-visible .book-cover {
    transform: translateY(-6px);
    /* Compose ambient shadow + brand teal glow from tokens.
       --brand-primary is declared in design-tokens.css and flows
       through the .light override for OG renders. */
    filter: drop-shadow(14px 24px 32px rgba(0, 0, 0, 0.55))
            drop-shadow(0 0 22px color-mix(in srgb, var(--brand-primary) 22%, transparent));
  }
  /* … */
</style>
```

Option B — if `color-mix()` is undesirable, add dedicated tokens (e.g. `--shadow-cover-rest`, `--shadow-cover-hover-glow`) to `design-tokens.css` and reference them here. This keeps the shadow recipe centralized alongside the other `--shadow-*` variables.

Either path ensures the teal glow tracks future brand-primary changes and survives the `.light` override used by LinkedIn/OG renders.

## Info

### IN-01: `rating` is a hardcoded literal — document the intent

**File:** `src/components/Book.astro:11`
**Issue:** `const rating = 4.8;` is hardcoded (per design decision D-17 in CONTEXT.md — Amazon does not expose a public rating API, so freezing at a point-in-time value is intentional). This is fine, but an uninitiated reader will not know whether to update it or where the number comes from. Leaving it undocumented invites accidental "improvements" (e.g. turning it into a prop or a fetch).

**Fix:** Add a short comment pointing at the rationale:

```astro
// Hardcoded per D-17: Amazon has no public ratings API.
// Update manually when the Amazon listing rating changes meaningfully.
const rating = 4.8;
```

### IN-02: `shrink-0` on a grid item has no practical effect

**File:** `src/components/Book.astro:79`
**Issue:** The CTA `<span>` has `shrink-0`, which only applies in flex containers. At mobile widths (`flex flex-col`) the CTA is a block-level column child where `flex-shrink` is effectively moot, and at desktop widths the parent switches to `sm:grid sm:grid-cols-[140px_1fr_auto]` — grid items ignore flex shrink/grow. The class is dead weight. (The same `shrink-0` on `.book-cover-wrap` at line 52 has the same issue but is even more harmless since its width is constrained by the `<img>` inside.)

**Fix:** Remove `shrink-0` from line 79 (and optionally line 52) for clarity. The layout behaves identically:

```astro
<span class="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-brand-accent text-bg-base font-medium hover:bg-brand-accent-hover transition-colors">
```

### IN-03: Ordering of constants — `amazonUrl` and `rating` could move above `locale` extraction

**File:** `src/components/Book.astro:8-11`
**Issue:** Minor style observation. The two locale-independent constants (`amazonUrl`, `rating`) are declared after the locale-dependent bindings (`const { locale } = Astro.props; const i = t(locale);`). Grouping i18n-independent constants at the top (or extracting them as module-level constants outside the frontmatter entirely) reads more clearly and signals that they do not change per-render.

**Fix:** Reorder (no functional change):

```astro
---
import { t, type Locale } from '../i18n/utils';

// Static, locale-independent data for the Book section.
const amazonUrl = 'https://www.amazon.com/dp/1835460038';
// Hardcoded per D-17: Amazon has no public ratings API.
const rating = 4.8;

interface Props {
  locale: Locale;
}

const { locale } = Astro.props;
const i = t(locale);
---
```

This is a purely cosmetic suggestion — reject if it conflicts with the project's preferred convention.

---

## Positive notes (not findings — worth preserving)

- **i18n:** `t(locale)` is used correctly; both `en.json` and `ru.json` expose the required `book.title / name / desc / cta` keys.
- **Security:** `target="_blank"` is paired with `rel="noopener noreferrer"` (line 47-48). No `innerHTML`, no `set:html`, no `eval`, no dynamic attribute construction.
- **HTML validity:** The CTA is a `<span>` inside the card-level `<a>` — no nested anchors. Correctly avoids the common pitfall flagged in D-11/D-12.
- **ARIA:** The rating row uses `aria-label="4.8 out of 5 on Amazon"` on the flex container and `aria-hidden="true"` on both the decorative star glyphs and the middle-dot separator. Numeric `4.8` remains in the accessible name via the unlabeled `<span>`. This is correct ARIA.
- **Motion:** `prefers-reduced-motion: reduce` is honored on lines 32-39, overriding both transform and transition. Pairs with the global reduced-motion rule in `global.css`.
- **Image:** `loading="lazy"`, `decoding="async"`, explicit `width`/`height` (prevents CLS), descriptive `alt` text derived from i18n.
- **Design tokens:** All Tailwind utilities used (`bg-brand-accent-soft`, `border-brand-accent/30`, `bg-bg`, `border-border`, `bg-brand-accent`, `bg-brand-accent-hover`, `text-bg-base`, `text-accent`, `text-text-secondary`, `text-text-muted`, `card-glow`, `font-display`, `font-mono`) resolve to valid Deep Signal tokens or documented shim aliases in `global.css`. No deprecated cyan (`#06B6D4`/`#22D3EE`), no DKT brand (`#7C3AED`/`#10B981`), no AWS brand (`#FF9900`/`#232F3E`).
- **TypeScript:** `Props` interface is declared and typed with the exported `Locale` union; `Astro.props` destructuring is sound.

---

_Reviewed: 2026-04-21_
_Reviewer: Claude (gsd-code-reviewer)_
_Depth: standard_
