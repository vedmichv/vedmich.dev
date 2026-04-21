---
phase: 06-book-packt-cover
plan: 01
type: execute
wave: 1
depends_on: []
files_modified:
  - src/components/Book.astro
autonomous: true
requirements:
  - REQ-005
tags:
  - astro
  - book
  - tailwind
  - design-tokens
  - reference-match
  - amber-band
  - amazon-rating
objective: >-
  Rewrite `src/components/Book.astro` to match the reference
  (`app.jsx:488-519`) structurally, with two user-locked deviations:
  (1) real 3D JPG cover retained (D-01) — do NOT build CSS faux cover, do
  NOT overlay PACKT/V.Vedmich labels (they are baked into the JPG scan);
  (2) full-bleed amber band wrapper (D-04) — `<section>` uses
  `bg-brand-accent-soft border-y border-brand-accent/30` with inner
  `<div class="max-w-[1120px] mx-auto px-4 sm:px-6">` container. Promote
  the current 2-col `flex sm:flex-row` layout to a 3-col desktop grid
  `grid grid-cols-[140px_1fr_auto] gap-7 items-center` (D-08), keeping
  mobile `flex flex-col gap-6` stack (D-09). Drop `max-w-3xl` from the
  card wrapper so it stretches the full container width (D-10). Drop the
  current `bg-surface/30` section backdrop (D-06). ADD an Amazon rating
  row under the h3 (D-15): `★★★★★ 4.8 · Amazon`, 5 filled amber stars
  (round-up per D-16), hardcoded `const rating = 4.8` in frontmatter
  (D-17), `aria-label="4.8 out of 5 on Amazon"` on the container,
  `aria-hidden="true"` on the star string and `·` separator (D-19).
  Style the CTA as a solid amber button `inline-flex items-center gap-2
  px-5 py-2.5 rounded-lg bg-brand-accent text-bg-base font-medium
  hover:bg-brand-accent-hover transition-colors` per ref Button
  `variant="accent"` (D-13) — occupying the `auto` grid column on
  desktop, moving to the bottom on mobile. Preserve: whole-card `<a>`
  wrapper to Amazon (D-11, Fitts's law), existing `.book-cover` CSS
  block lines 16-38 (drop-shadow, hover lift, prefers-reduced-motion
  guard, D-03), `.card-glow` hover ring (D-24), `.animate-on-scroll`
  entrance animation on h2 + card (D-25), JPG asset at
  `/images/book-cover-3d.jpg` with its current `w-40 sm:w-48 width="200"
  height="247"` sizing (D-02), and the existing external-link arrow SVG
  (D-14). No i18n edits — `i.book.title`, `i.book.name`, `i.book.desc`,
  `i.book.cta` are all reused byte-identically from
  `src/i18n/{en,ru}.json` (D-20 through D-22). No new tokens, no new
  components, no new assets, no changes to `src/data/social.ts` or any
  other file. Implements D-01 through D-25 plus REQ-005 acceptance
  preserved via the JPG cover (PACKT + V. Vedmich already printed on
  the 3D render).

must_haves:
  truths:
    - "Book section renders a full-bleed amber band at 1440x900 — the bg color (#451A03, --brand-accent-soft) extends edge-to-edge in the browser viewport, with horizontal borders in amber/30 opacity top and bottom."
    - "Inside the amber band, content is constrained to max-w-[1120px] mx-auto px-4 sm:px-6 — matching Hero container width pattern."
    - "At desktop (sm: >= 640px) the card uses a 3-col grid grid-cols-[140px_1fr_auto] gap-7 items-center — cover in column 1, text column (h3 + rating + desc) in column 2, Amazon CTA button in column 3 (auto width)."
    - "At mobile (< 640px) the card stacks vertically via flex flex-col gap-6 — cover on top, text middle, CTA button at the bottom."
    - "The book cover image is the existing /images/book-cover-3d.jpg JPG asset, width=200 height=247, class w-40 sm:w-48, loading=lazy, decoding=async — unchanged from current Book.astro per D-01, D-02."
    - "NO PACKT or V. Vedmich text label is added as an HTML element alongside the cover — they are already printed on the JPG scan. REQ-005 is satisfied by the JPG content."
    - "The .book-cover CSS block (drop-shadow, hover translateY(-6px), prefers-reduced-motion guard) is preserved byte-identical from current lines 16-38 per D-03."
    - "The card wrapper (the whole-card <a>) does NOT use max-w-3xl — the class is REMOVED so the card stretches the full container width per D-10."
    - "The card wrapper uses classes: group book-card block p-6 sm:p-8 rounded-xl bg-bg border border-border card-glow animate-on-scroll — per D-10, D-24, D-25 (max-w-3xl dropped)."
    - "The section wrapper <section id=book> uses classes py-20 sm:py-28 bg-brand-accent-soft border-y border-brand-accent/30 — the previous bg-surface/30 is REMOVED per D-06, replaced by the amber band per D-04."
    - "Below the h3 title and BEFORE the description paragraph, a rating row renders with exactly this structure: <div class=flex items-center gap-2 mt-2 mb-4 aria-label=4.8 out of 5 on Amazon> <span class=text-brand-accent text-base aria-hidden=true>★★★★★</span> <span class=font-mono text-sm text-text-secondary>4.8</span> <span class=text-text-muted aria-hidden=true>·</span> <span class=font-body text-sm text-text-muted>Amazon</span> </div> — per D-15, D-19."
    - "The rating value 4.8 is hardcoded in the Astro frontmatter as const rating = 4.8 per D-17 — not sourced from i18n, not from src/data/social.ts."
    - "The star string is the literal 5-character Unicode U+2605 sequence ★★★★★ — 5 filled amber stars, round-up from 4.8 per D-16 (no half-star)."
    - "The Amazon CTA is a styled <span> (NOT a nested <a> — invalid HTML per D-12) with classes inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-brand-accent text-bg-base font-medium hover:bg-brand-accent-hover transition-colors per D-13."
    - "The CTA span contains the i18n text {i.book.cta} followed by the existing external-link arrow SVG per D-14 (arrow SVG path preserved from current Book.astro line 72-74)."
    - "The whole-card <a> element wraps the entire card content with href=https://www.amazon.com/dp/1835460038 target=_blank rel=noopener noreferrer per D-11."
    - "The h3 element renders {i.book.name} with classes font-display text-xl font-semibold group-hover:text-accent transition-colors — same as current Book.astro line 64 except the mb-3 is REPLACED by no bottom margin since the rating row now sits directly below via its own mt-2 mb-4."
    - "The description <p> renders {i.book.desc} with classes text-text-muted text-sm leading-relaxed — no mb-4 since the CTA moves out of the text column on desktop (lives in column 3 of the grid) per D-08."
    - "The section h2 renders {i.book.title} with classes font-display text-3xl font-bold mb-12 animate-on-scroll per D-05 — unchanged from current line 41."
    - "i18n JSON files are NOT modified — src/i18n/en.json and src/i18n/ru.json are byte-identical before and after this phase. Keys referenced: i.book.title, i.book.name, i.book.desc, i.book.cta per D-20, D-21, D-22."
    - "Zero hardcoded hex in the Astro template body (the rgba() values inside the existing .book-cover <style> block lines 20, 28-29 are preserved from D-03 — those are pre-existing and NOT new hex introductions by this phase)."
    - "No deprecated cyan (#06B6D4, #22D3EE, text-cyan-*, bg-cyan-*) per CLAUDE.md §Anti-Patterns."
    - "No DKT brand colors (#7C3AED, #10B981) per CLAUDE.md §Anti-Patterns."
    - "No AWS orange (#FF9900, #232F3E) per CLAUDE.md §Anti-Patterns."
    - "npm run build exits 0 — 7 pages built, both EN (dist/en/index.html) and RU (dist/ru/index.html) pages render without Astro or TypeScript errors."
    - "The built HTML at dist/en/index.html and dist/ru/index.html both contain: (a) exactly 1 <section id=book>, (b) exactly 1 <img src=/images/book-cover-3d.jpg>, (c) exactly 1 rating row with 4.8 text, (d) exactly 1 ★★★★★ star string, (e) exactly 1 Amazon CTA span with bg-brand-accent class, (f) the full-bleed section uses bg-brand-accent-soft and border-brand-accent/30 classes."
    - "No horizontal-scroll regression at 1440px or 375px viewport — the amber band must not overflow 100vw (verified by Playwright visual check)."
  artifacts:
    - path: src/components/Book.astro
      provides: Rewritten Book component matching reference — full-bleed amber band section wrapper, 3-col desktop grid (cover | text column with rating | solid amber CTA), mobile stack, Amazon rating row with 5 filled amber stars + 4.8 + Amazon label, whole-card link preserved, existing .book-cover CSS preserved
      min_lines: 75
      contains: "★★★★★"
      exports:
        - default component
  key_links:
    - from: src/components/Book.astro
      to: src/i18n/en.json and ru.json via t(locale)
      via: typed i.book access for title, name, desc, cta (unchanged)
      pattern: 'i\.book\.(title|name|desc|cta)'
    - from: src/components/Book.astro
      to: public/images/book-cover-3d.jpg
      via: <img src=/images/book-cover-3d.jpg width=200 height=247 w-40 sm:w-48
      pattern: '/images/book-cover-3d\.jpg'
    - from: src/components/Book.astro
      to: https://www.amazon.com/dp/1835460038
      via: whole-card <a> href external link new tab noopener noreferrer
      pattern: 'amazon\.com/dp/1835460038'
    - from: src/components/Book.astro const rating
      to: rating row <span>{rating}</span>
      via: Astro frontmatter expression interpolation
      pattern: 'const rating = 4\.8'
    - from: Tailwind @theme utilities
      to: design-tokens.css CSS vars
      via: bg-brand-accent-soft maps to --brand-accent-soft (#451A03), border-brand-accent via /30 arbitrary opacity maps to --brand-accent at 30%, bg-brand-accent maps to --brand-accent (#F59E0B), hover:bg-brand-accent-hover maps to --brand-accent-hover (#FBBF24), text-bg-base maps to --bg-base (#0F172A), text-brand-accent maps to --brand-accent, text-text-secondary maps to --text-secondary (#94A3B8), text-text-muted maps to --text-muted via shim alias, bg-bg maps to --bg-base, border-border maps to --border
      pattern: 'bg-brand-accent-soft|border-brand-accent|bg-brand-accent|text-bg-base|text-brand-accent|text-text-secondary|text-text-muted'
---

<objective>
Single-file rewrite of `src/components/Book.astro` to match reference
`app.jsx:488-519` structurally while implementing the two user-locked
deviations captured in `06-CONTEXT.md` (real JPG cover, full-bleed amber
band) and the one user-driven additive (Amazon rating row `★★★★★ 4.8 ·
Amazon`). Two tasks:

1. **Rewrite Book.astro** — Replace the section wrapper to a full-bleed
   amber band (D-04, D-06), restructure the card to a 3-col desktop
   grid with mobile stack (D-08, D-09), drop `max-w-3xl` (D-10), keep
   the real JPG cover and `.book-cover` CSS block (D-01, D-02, D-03),
   add the Amazon rating row with hardcoded `const rating = 4.8` and
   ARIA annotations (D-15, D-17, D-19), style the CTA as a solid amber
   button (D-13), preserve the whole-card `<a>` + `.card-glow` +
   `.animate-on-scroll` + existing arrow SVG (D-11, D-14, D-24, D-25).
   No i18n edits (D-20, D-21, D-22).

2. **Token/hex-hygiene + build gate** — Run the Deep Signal token
   enforcement check (no new hardcoded hex in the template body — the
   existing `.book-cover` `<style>` block rgba() values are allowed
   continuation per D-03), verify no deprecated cyan / DKT green /
   AWS orange references, confirm `npm run build` exits 0 with 7 pages,
   and verify both `dist/en/index.html` and `dist/ru/index.html`
   contain the expected DOM shape (full-bleed section wrapper, JPG img,
   rating row with 4.8, star string, amber CTA span, whole-card anchor).

Purpose: Land REQ-005 (PACKT label + V. Vedmich emboss — satisfied by
the existing JPG scan that has both labels printed in-frame, per D-01
rationale "real brand asset over mockup reproduction" — same stance as
Phase 5 DKT logo). Advance the site from the neutral `bg-surface/30`
Book section to a visually distinct amber-band section that coheres with
the amber CTA, providing focused social proof via the hardcoded Amazon
rating.

Output: One mutated file (`src/components/Book.astro`). Zero new tokens,
zero new components, zero new assets, zero i18n edits. `npm run build`
passes. Both EN and RU render identical DOM shape (only the localized
text content inside h2/h3/desc/cta differs — rating row, badge text, and
URLs are locale-invariant per D-18 and the Phase 4 D-03 precedent).
Visual verification on live via playwright-cli is deferred to post-commit
per the user's established workflow (`.planning/STATE.md` §Notes).
</objective>

<execution_context>
@$HOME/.claude/get-shit-done/workflows/execute-plan.md
@$HOME/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@.planning/phases/06-book-packt-cover/06-CONTEXT.md
@.planning/phases/06-book-packt-cover/06-DISCUSSION-LOG.md

<interfaces>
<!-- i18n keys available via `const i = t(locale);` (UNCHANGED from current Book.astro) -->

- `i.book.title` — "Book" (EN) / "Книга" (RU). Rendered in section h2.
- `i.book.name` — "Cracking the Kubernetes Interview" (both locales — brand name stays English per Phase 4 D-03 precedent). Rendered in card h3.
- `i.book.desc` — EN: "A comprehensive guide covering Kubernetes concepts, architecture, networking, security, and real-world scenarios to help you ace your next interview." / RU: "Полное руководство по концепциям, архитектуре, сетям, безопасности Kubernetes и реальным сценариям для подготовки к собеседованию.". Rendered in card description paragraph.
- `i.book.cta` — "Get on Amazon" (EN) / "Купить на Amazon" (RU). Rendered inside the amber CTA span.

<!-- Reference Book component (app.jsx:488-519) — STRUCTURAL source of truth -->
```jsx
const Book = () => (
  <Section id="book" title="Book">
    <Card hoverable={false}>
      <div style={{ display: 'grid', gridTemplateColumns: '140px 1fr auto', gap: 28, alignItems: 'center' }}>
        {/* Cover — CSS faux cover REJECTED per D-01; we keep the real JPG */}
        <div style={{ width: 140, height: 200, borderRadius: 8, background: 'linear-gradient(160deg, #134E4A, #0F172A)', border: '1px solid rgba(20,184,166,0.4)', padding: '16px 12px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div style={{ fontFamily: VV.fontMono, fontSize: 10, color: VV.amber, letterSpacing: '0.1em' }}>PACKT</div>
          <div style={{ fontFamily: VV.fontDisplay, fontSize: 14, fontWeight: 600, color: VV.text, lineHeight: 1.2 }}>Cracking<br/>the Kubernetes<br/>Interview</div>
          <div style={{ fontFamily: VV.fontMono, fontSize: 9, color: VV.teal, letterSpacing: '0.1em' }}>V. Vedmich</div>
        </div>
        {/* Text column — rating NOT in ref; we ADD it per D-15 */}
        <div>
          <h3 style={{ fontFamily: VV.fontDisplay, fontSize: 22, fontWeight: 600, color: VV.text, margin: 0 }}>Cracking the Kubernetes Interview</h3>
          <p style={{ fontFamily: VV.fontBody, color: VV.mute, margin: '8px 0 0', fontSize: 15, lineHeight: 1.6 }}>A comprehensive guide covering Kubernetes concepts, architecture, networking, security, and real-world scenarios.</p>
        </div>
        {/* CTA — solid amber button (variant="accent") per ref Button:131-155 */}
        <Button variant="accent" href="#">Get on Amazon</Button>
      </div>
    </Card>
  </Section>
);
```

<!-- Reference Button primitive (app.jsx:131-155) — informs D-13 -->
Accent variant: `background: VV.amber (#F59E0B)`, `color: VV.bg (#0F172A)`, `border: 1px solid VV.amber`, `padding: '10px 20px'`, `borderRadius: 8`, `fontFamily: VV.fontBody`, `fontWeight: 500`, `fontSize: 14`, hover: `background: VV.amberHover (#FBBF24)`.

Tailwind mapping: `inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-brand-accent text-bg-base font-medium hover:bg-brand-accent-hover transition-colors`. The `px-5 py-2.5` ≈ ref `padding: '10px 20px'` (10px vertical = py-2.5 = 10px; 20px horizontal = px-5 = 20px). `rounded-lg` = 8px. `gap-2` = 8px between CTA text and arrow SVG. `font-medium` = 500.

<!-- Tailwind utility resolutions (src/styles/global.css @theme block) — all tokens confirmed exist -->
- `bg-brand-accent-soft` → `--brand-accent-soft` (#451A03, deep amber) — amber band background per D-04.
- `border-brand-accent` → `--brand-accent` (#F59E0B) — full opacity amber border (rare); combined with `/30` arbitrary opacity = `rgba(245,158,11,0.3)` per D-04 (amber at 30% opacity for the soft horizontal border on the band).
- `bg-brand-accent` → `--brand-accent` (#F59E0B, amber) — solid amber CTA bg per D-13.
- `hover:bg-brand-accent-hover` → `--brand-accent-hover` (#FBBF24, amber hover) — CTA hover bg per D-13.
- `text-bg-base` → `--bg-base` (#0F172A, dark navy) — CTA text color on amber bg = high contrast per D-13.
- `text-brand-accent` → `--brand-accent` (#F59E0B, amber) — star color per D-15.
- `text-text-primary` → `--text-primary` (#E2E8F0, near-white) — h3 title color (inherited via h3 cascade in global.css).
- `text-text-secondary` → `--text-secondary` (#94A3B8, secondary mute) — rating number "4.8" color per D-15 (AA-compliant 5.3:1 on amber-soft bg).
- `text-text-muted` → `--text-secondary` via shim alias (global.css line 49 `--color-text-muted: var(--text-secondary)`) — Amazon label + separator color per D-15.
- `bg-bg` → `--bg-base` (#0F172A) — card surface (the card sits ON the amber band, so `bg-bg` provides a dark card on an amber backdrop — visual contrast preserved).
- `border-border` → `--border` (#334155) — card border (shim alias).
- `.card-glow` → teal hover ring + shadow (src/styles/global.css:118-124) per D-24.
- `.animate-on-scroll` → IntersectionObserver fade-in-up per D-25.

<!-- Full replacement target markup (Astro syntax) -->
Reference shape: one file with:
- Frontmatter: `import`, `Props`, `const { locale }`, `const i = t(locale)`, `const amazonUrl = 'https://www.amazon.com/dp/1835460038'`, AND the new `const rating = 4.8` per D-17.
- `<section id="book">` with full-bleed amber band classes per D-04.
- `<style>` block preserving the existing `.book-cover` CSS lines 16-38 byte-identical per D-03.
- Inner `<div class="max-w-[1120px] mx-auto px-4 sm:px-6">` container per D-04.
- h2 with unchanged classes per D-05.
- Whole-card `<a>` wrapping the card, per D-11.
- Inside the `<a>`, a `<div>` that uses `flex flex-col gap-6 sm:grid sm:grid-cols-[140px_1fr_auto] sm:gap-7 sm:items-center` — mobile flex-col stack, desktop 3-col grid per D-08, D-09.
- Column 1: the existing cover wrapper and `<img>` (D-01, D-02).
- Column 2: h3 + rating row + desc (D-15).
- Column 3: the amber CTA span with arrow SVG (D-13, D-14).

```astro
---  (astro-frontmatter-delim)
import { t, type Locale } from '../i18n/utils';

interface Props {
  locale: Locale;
}

const { locale } = Astro.props;
const i = t(locale);
const amazonUrl = 'https://www.amazon.com/dp/1835460038';
const rating = 4.8;
---  (astro-frontmatter-delim)

<section id="book" class="py-20 sm:py-28 bg-brand-accent-soft border-y border-brand-accent/30">
  <style>
    /* The cover image is already a 3D render (spine + perspective baked in).
       We only add a subtle hover lift + teal glow, no extra rotation. */
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
      filter: drop-shadow(14px 24px 32px rgba(0, 0, 0, 0.55))
              drop-shadow(0 0 22px rgba(20, 184, 166, 0.22));
    }
    @media (prefers-reduced-motion: reduce) {
      .book-cover,
      .book-card:hover .book-cover,
      .book-card:focus-visible .book-cover {
        transform: none;
        transition: none;
      }
    }
  </style>
  <div class="max-w-[1120px] mx-auto px-4 sm:px-6">
    <h2 class="font-display text-3xl font-bold mb-12 animate-on-scroll">{i.book.title}</h2>

    <div class="animate-on-scroll">
      <a
        href={amazonUrl}
        target="_blank"
        rel="noopener noreferrer"
        class="group book-card block p-6 sm:p-8 rounded-xl bg-bg border border-border card-glow"
      >
        <div class="flex flex-col gap-6 sm:grid sm:grid-cols-[140px_1fr_auto] sm:gap-7 sm:items-center">
          <!-- Column 1: cover (real JPG per D-01, D-02) -->
          <div class="book-cover-wrap shrink-0 flex justify-center sm:justify-start">
            <img
              src="/images/book-cover-3d.jpg"
              alt={`${i.book.name} — book cover`}
              width="200"
              height="247"
              loading="lazy"
              decoding="async"
              class="book-cover w-40 sm:w-48"
            />
          </div>

          <!-- Column 2: text column (h3 + rating + desc) -->
          <div>
            <h3 class="font-display text-xl font-semibold group-hover:text-accent transition-colors">
              {i.book.name}
            </h3>
            <div class="flex items-center gap-2 mt-2 mb-4" aria-label={`${rating} out of 5 on Amazon`}>
              <span class="text-brand-accent text-base" aria-hidden="true">★★★★★</span>
              <span class="font-mono text-sm text-text-secondary">{rating}</span>
              <span class="text-text-muted" aria-hidden="true">·</span>
              <span class="font-body text-sm text-text-muted">Amazon</span>
            </div>
            <p class="text-text-muted text-sm leading-relaxed">
              {i.book.desc}
            </p>
          </div>

          <!-- Column 3: amber CTA button (variant="accent" per D-13) -->
          <span class="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-brand-accent text-bg-base font-medium hover:bg-brand-accent-hover transition-colors shrink-0">
            {i.book.cta}
            <svg class="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
          </span>
        </div>
      </a>
    </div>
  </div>
</section>
```

Departures from reference (intentional, locked in CONTEXT.md):
- Cover: real JPG with `w-40 sm:w-48 width="200" height="247"`, NOT the ref's 140×200 CSS faux cover (D-01, D-02).
- Section wrapper: full-bleed amber band (D-04), NOT the ref's transparent Section wrapper with `padding: '80px 24px'`.
- Rating row: NEW, not in ref (D-15).
- Card wrapper: `group book-card block p-6 sm:p-8 rounded-xl bg-bg border border-border card-glow` (Astro pattern), NOT the ref's `<Card hoverable={false}>` primitive. `.card-glow` is intentionally kept despite ref's `hoverable={false}` per D-24 rationale (whole-card clickable = hover affordance wins over ref fidelity).
- Inner grid: `flex flex-col gap-6 sm:grid sm:grid-cols-[140px_1fr_auto] sm:gap-7 sm:items-center` — mobile stack, desktop 3-col grid (D-08, D-09).
- CTA: Astro `<span>` styled as ref's `<Button variant="accent">` per D-13 (can't nest `<a>` per D-12).

<!-- Current Book.astro state (file being replaced) -->
Current Book.astro is 82 lines:
- Frontmatter lines 1-11: imports, Props, locale destructure, `amazonUrl` const.
- Line 13: section wrapper `<section id="book" class="py-20 sm:py-28 bg-surface/30">` — REPLACE the `bg-surface/30` with the amber band classes per D-04, D-06.
- Lines 14-39: `<style>` block with `.book-cover` CSS — PRESERVE byte-identical per D-03.
- Line 40: `<div class="max-w-6xl mx-auto px-4 sm:px-6">` — REPLACE `max-w-6xl` with `max-w-[1120px]` per D-04.
- Line 41: h2 — UNCHANGED per D-05.
- Lines 43-78: card structure — REWRITE to use the 3-col grid / mobile stack with the rating row added per D-08, D-09, D-10, D-15.

**Specific transformations:**

| Current (line #) | New | Decision |
|---|---|---|
| Section `bg-surface/30` (line 13) | `bg-brand-accent-soft border-y border-brand-accent/30` | D-04, D-06 |
| `<style>` block (lines 14-39) | IDENTICAL (byte-copy) | D-03 |
| `max-w-6xl` (line 40) | `max-w-[1120px]` | D-04 |
| h2 classes (line 41) | IDENTICAL | D-05 |
| `<a class="... max-w-3xl">` (line 48) | `<a class="...">` (drop `max-w-3xl`) | D-10 |
| `<div class="flex flex-col sm:flex-row gap-8 items-center sm:items-start">` (line 50) | `<div class="flex flex-col gap-6 sm:grid sm:grid-cols-[140px_1fr_auto] sm:gap-7 sm:items-center">` | D-08, D-09 |
| Cover wrapper `<div class="book-cover-wrap shrink-0">` (line 51) | `<div class="book-cover-wrap shrink-0 flex justify-center sm:justify-start">` (center on mobile, left-align on desktop) | D-09 |
| `<img ... class="book-cover w-40 sm:w-48" />` (lines 52-60) | IDENTICAL | D-02 |
| Text `<div class="flex-1">` (line 63) | `<div>` (drop flex-1 since it's now a grid cell, not a flex child) | D-08 |
| h3 classes (line 64): `font-display text-xl font-semibold mb-3 group-hover:text-accent transition-colors` | `font-display text-xl font-semibold group-hover:text-accent transition-colors` (drop `mb-3` — rating row supplies top margin) | D-15 |
| h3 content (line 65) | IDENTICAL `{i.book.name}` | D-22 |
| NEW (between h3 and desc) | Rating row `<div class="flex items-center gap-2 mt-2 mb-4" aria-label={...}> ★★★★★ + {rating} + · + Amazon </div>` | D-15, D-17, D-19 |
| Desc `<p class="text-text-muted text-sm leading-relaxed mb-4">` (line 67) | `<p class="text-text-muted text-sm leading-relaxed">` (drop `mb-4` — CTA no longer below; moved to column 3) | D-08 |
| Desc content (line 68) | IDENTICAL `{i.book.desc}` | D-20 |
| CTA span (lines 70-75) — `inline-flex items-center gap-2 text-sm font-medium text-accent group-hover:text-accent-light transition-colors` | `inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-brand-accent text-bg-base font-medium hover:bg-brand-accent-hover transition-colors shrink-0` | D-13 |
| CTA span location | MOVE OUT of the text column — becomes column 3 of the grid (sibling of text div, not child) | D-08 |
| Arrow SVG (lines 72-74) | IDENTICAL path `d="M10 6H6a2 2 0 00-2 2v10..."` | D-14 |
| i18n JSON | NO CHANGES | D-20, D-21, D-22 |

**Frontmatter addition:** `const rating = 4.8;` per D-17 — add as line 10 (after `amazonUrl` const).

**Expected file shape after rewrite:**
- Total line count: ~85-95 (grows slightly from the added rating row and frontmatter const).
- Imports, Props, const declarations: 11 lines.
- `<section>` opening tag: 1 line.
- `<style>` block: preserved 26 lines.
- Inner container + h2: 2 lines.
- Card wrapper + inner grid: 2 lines.
- Column 1 (cover): 11 lines.
- Column 2 (text + rating + desc): 14 lines.
- Column 3 (CTA span + arrow): 7 lines.
- Closing tags: 5 lines.
</interfaces>
</context>

<tasks>

<task type="auto">
  <name>Task 1: Full rewrite of Book.astro — full-bleed amber band section, 3-col desktop grid with mobile stack, Amazon rating row with 5 filled amber stars, solid amber CTA in column 3</name>
  <files>src/components/Book.astro</files>
  <read_first>
    - src/components/Book.astro (CURRENT state — read in full: you are REPLACING lines 13, 40, 48, 50, 51, 63, 64, 67, 70-75; preserving lines 14-39 byte-identical; adding a new rating row block between the h3 and the desc; adding `const rating = 4.8;` to frontmatter. Note current imports (`t`, `type Locale`), current Props + locale destructure + `const amazonUrl`. All structural scaffolding stays; the internals transform per the table in <interfaces>.)
    - .planning/phases/06-book-packt-cover/06-CONTEXT.md (D-01 through D-25 — the full decision set implemented here; pay close attention to D-01 real-JPG-over-CSS-faux, D-04 full-bleed amber band, D-06 remove bg-surface/30, D-08 3-col desktop grid, D-10 drop max-w-3xl, D-13 solid amber CTA classes, D-15 rating row structure + placement, D-17 hardcoded rating, D-19 ARIA annotations, D-22 no i18n edits)
    - .planning/phases/06-book-packt-cover/06-DISCUSSION-LOG.md §"Full-width band" §"Amazon rating placement" §"Stars fill rendering" (rationale chain for the new patterns)
    - /Users/viktor/.claude/skills/viktor-vedmich-design/ui_kits/vedmich-dev/app.jsx lines 488-519 (Book component — structural source of truth, but note: cover section rejected per D-01, rating row added per D-15)
    - /Users/viktor/.claude/skills/viktor-vedmich-design/ui_kits/vedmich-dev/app.jsx lines 131-155 (Button primitive — accent variant informs D-13 CTA classes)
    - /Users/viktor/.claude/skills/viktor-vedmich-design/ui_kits/vedmich-dev/app.jsx lines 100-113 (Section primitive — inner max-w container pattern)
    - src/styles/design-tokens.css (confirm brand tokens exist: `--brand-accent` #F59E0B, `--brand-accent-hover` #FBBF24, `--brand-accent-soft` #451A03, `--bg-base` #0F172A, `--border` #334155, `--text-primary`, `--text-secondary`, `--text-muted`. No new tokens added by this plan.)
    - src/styles/global.css lines 7-56 (`@theme` block — confirm Tailwind utilities `bg-brand-accent-soft`, `border-brand-accent`, `bg-brand-accent`, `hover:bg-brand-accent-hover`, `text-bg-base`, `text-brand-accent`, `text-text-secondary`, `text-text-muted`, `bg-bg`, `border-border` all resolve to the intended Deep Signal tokens; lines 118-124 `.card-glow` utility preserved per D-24)
    - src/i18n/en.json §"book" (confirm keys: `title: "Book"`, `name: "Cracking the Kubernetes Interview"`, `desc: "A comprehensive guide..."`, `cta: "Get on Amazon"` — UNCHANGED; no edit in this task)
    - src/i18n/ru.json §"book" (confirm keys: `title: "Книга"`, `name: "Cracking the Kubernetes Interview"`, `desc: "Полное руководство..."`, `cta: "Купить на Amazon"` — UNCHANGED; no edit in this task)
    - CLAUDE.md §"Deep Signal Design System — LIVE" §"Anti-Patterns" (never hardcoded hex in template body, never deprecated cyan `#06B6D4`/`#22D3EE`, never DKT green `#7C3AED`/`#10B981`, never AWS orange `#FF9900`/`#232F3E`; keep amber `--brand-accent: #F59E0B`)
    - .planning/phases/05-podcasts-badges/05-01-podcasts-rewrite-PLAN.md (precedent pattern — single-plan full rewrite with byte-preservation rules for section wrappers, i18n-key invariance, inline brand text, whole-card `<a>` + `.card-glow` + arrow SVG preservation — apply the same pattern here)
  </read_first>
  <action>
    Replace the ENTIRE contents of `src/components/Book.astro` with exactly this file content (use the Write tool to overwrite — do NOT use heredoc or Bash `cat`):

    ```astro
    ---  (astro-frontmatter-delim)
    import { t, type Locale } from '../i18n/utils';

    interface Props {
      locale: Locale;
    }

    const { locale } = Astro.props;
    const i = t(locale);
    const amazonUrl = 'https://www.amazon.com/dp/1835460038';
    const rating = 4.8;
    ---  (astro-frontmatter-delim)

    <section id="book" class="py-20 sm:py-28 bg-brand-accent-soft border-y border-brand-accent/30">
      <style>
        /* The cover image is already a 3D render (spine + perspective baked in).
           We only add a subtle hover lift + teal glow, no extra rotation. */
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
          filter: drop-shadow(14px 24px 32px rgba(0, 0, 0, 0.55))
                  drop-shadow(0 0 22px rgba(20, 184, 166, 0.22));
        }
        @media (prefers-reduced-motion: reduce) {
          .book-cover,
          .book-card:hover .book-cover,
          .book-card:focus-visible .book-cover {
            transform: none;
            transition: none;
          }
        }
      </style>
      <div class="max-w-[1120px] mx-auto px-4 sm:px-6">
        <h2 class="font-display text-3xl font-bold mb-12 animate-on-scroll">{i.book.title}</h2>

        <div class="animate-on-scroll">
          <a
            href={amazonUrl}
            target="_blank"
            rel="noopener noreferrer"
            class="group book-card block p-6 sm:p-8 rounded-xl bg-bg border border-border card-glow"
          >
            <div class="flex flex-col gap-6 sm:grid sm:grid-cols-[140px_1fr_auto] sm:gap-7 sm:items-center">
              <div class="book-cover-wrap shrink-0 flex justify-center sm:justify-start">
                <img
                  src="/images/book-cover-3d.jpg"
                  alt={`${i.book.name} — book cover`}
                  width="200"
                  height="247"
                  loading="lazy"
                  decoding="async"
                  class="book-cover w-40 sm:w-48"
                />
              </div>

              <div>
                <h3 class="font-display text-xl font-semibold group-hover:text-accent transition-colors">
                  {i.book.name}
                </h3>
                <div class="flex items-center gap-2 mt-2 mb-4" aria-label={`${rating} out of 5 on Amazon`}>
                  <span class="text-brand-accent text-base" aria-hidden="true">★★★★★</span>
                  <span class="font-mono text-sm text-text-secondary">{rating}</span>
                  <span class="text-text-muted" aria-hidden="true">·</span>
                  <span class="font-body text-sm text-text-muted">Amazon</span>
                </div>
                <p class="text-text-muted text-sm leading-relaxed">
                  {i.book.desc}
                </p>
              </div>

              <span class="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-brand-accent text-bg-base font-medium hover:bg-brand-accent-hover transition-colors shrink-0">
                {i.book.cta}
                <svg class="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </span>
            </div>
          </a>
        </div>
      </div>
    </section>
    ```

    (Note: the two `---` lines in the block above are the Astro frontmatter delimiters — when writing the file, emit exactly `---` on a line by itself, NOT the placeholder text `(astro-frontmatter-delim)`. The placeholder is only there to survive heredoc escaping in this plan document.)

    Rules (mandatory — each is an acceptance criterion below):

    **Frontmatter:**
    - Import line: EXACTLY `import { t, type Locale } from '../i18n/utils';` — identical to current file line 2.
    - `interface Props { locale: Locale; }` — identical to current lines 4-6.
    - `const { locale } = Astro.props;` — identical to current line 8.
    - `const i = t(locale);` — identical to current line 9.
    - `const amazonUrl = 'https://www.amazon.com/dp/1835460038';` — identical to current line 10 (URL BYTE-IDENTICAL: https://www.amazon.com/dp/1835460038).
    - NEW: `const rating = 4.8;` — added as the last frontmatter const per D-17.
    - NO other imports, NO new interfaces, NO type aliases beyond what exists.

    **Section wrapper (CHANGED per D-04, D-06):**
    - `<section id="book" class="py-20 sm:py-28 bg-brand-accent-soft border-y border-brand-accent/30">` — REPLACES current line 13's `bg-surface/30` class.
    - Classes EXACTLY in this order (preserving Tailwind ordering convention): `py-20 sm:py-28 bg-brand-accent-soft border-y border-brand-accent/30`.
    - `border-y` = Tailwind shortcut for `border-t border-b` (1px top + 1px bottom).
    - `border-brand-accent/30` = amber `--brand-accent` at 30% opacity via Tailwind arbitrary-opacity syntax (established in Phase 5 D-06 precedent `border-brand-accent/40`).
    - `bg-surface/30` must NOT appear in the section class list per D-06.
    - NO `noise-overlay` class on the section per D-07 (no inner texture on the amber band).

    **`<style>` block (PRESERVED byte-identical per D-03):**
    - Lines 14-39 of current Book.astro (the entire `<style>...</style>` block with `.book-cover`, `.book-card:hover .book-cover`, `@media (prefers-reduced-motion: reduce)` rules) MUST be copied verbatim into the new file.
    - The rgba() values (`rgba(0, 0, 0, 0.45)`, `rgba(0, 0, 0, 0.55)`, `rgba(20, 184, 166, 0.22)`) inside the `<style>` block are PRE-EXISTING and allowed per D-03; they are NOT new hex introductions.

    **Inner container (CHANGED per D-04):**
    - `<div class="max-w-[1120px] mx-auto px-4 sm:px-6">` — REPLACES current line 40's `max-w-6xl` with `max-w-[1120px]`.
    - `max-w-6xl` (1152px) must NOT appear in the file per D-04.

    **h2 title (UNCHANGED per D-05):**
    - `<h2 class="font-display text-3xl font-bold mb-12 animate-on-scroll">{i.book.title}</h2>` — identical to current line 41.

    **Card wrapper (CHANGED per D-10):**
    - Outer wrapping `<div class="animate-on-scroll">` — identical to current line 43.
    - Whole-card `<a>` per D-11:
      - `href={amazonUrl}` — byte-identical to current (URL = `https://www.amazon.com/dp/1835460038`).
      - `target="_blank"` — byte-identical.
      - `rel="noopener noreferrer"` — byte-identical.
      - `class="group book-card block p-6 sm:p-8 rounded-xl bg-bg border border-border card-glow"` — REPLACES current line 48; the `max-w-3xl` class MUST be DROPPED per D-10.
    - `max-w-3xl` must NOT appear anywhere in the file per D-10.

    **Inner grid layout (CHANGED per D-08, D-09):**
    - `<div class="flex flex-col gap-6 sm:grid sm:grid-cols-[140px_1fr_auto] sm:gap-7 sm:items-center">` — REPLACES current line 50.
    - Mobile (< 640px): `flex flex-col gap-6` — cover top, text middle, button bottom per D-09.
    - Desktop (sm: >= 640px): `sm:grid sm:grid-cols-[140px_1fr_auto] sm:gap-7 sm:items-center` — 3-col grid, gap 28px (gap-7), items centered vertically per D-08.
    - Current classes `flex flex-col sm:flex-row gap-8 items-center sm:items-start` must NOT appear in the file per D-08 (replaced by the grid pattern).

    **Column 1: cover (D-01, D-02 — PRESERVED):**
    - Wrapper: `<div class="book-cover-wrap shrink-0 flex justify-center sm:justify-start">` — adds `flex justify-center sm:justify-start` to the current `<div class="book-cover-wrap shrink-0">` (line 51) to center the cover in mobile column 1 while left-aligning on desktop grid cell.
    - `<img>` EXACTLY identical to current lines 52-60:
      - `src="/images/book-cover-3d.jpg"` — UNCHANGED.
      - `alt={\`${i.book.name} — book cover\`}` — UNCHANGED template literal.
      - `width="200"` — UNCHANGED per D-02.
      - `height="247"` — UNCHANGED per D-02.
      - `loading="lazy"` — UNCHANGED.
      - `decoding="async"` — UNCHANGED.
      - `class="book-cover w-40 sm:w-48"` — UNCHANGED per D-02.

    **Column 2: text column (h3 + rating row + desc):**
    - Wrapper: `<div>` — simple grid cell, no classes needed (the column is sized by the grid template).
    - h3 classes EXACTLY: `font-display text-xl font-semibold group-hover:text-accent transition-colors` — DROPS `mb-3` from current line 64 per D-15 (the rating row now supplies top margin via `mt-2`).
    - h3 content: `{i.book.name}` — UNCHANGED.
    - NEW rating row block between h3 and desc per D-15:
      ```astro
      <div class="flex items-center gap-2 mt-2 mb-4" aria-label={`${rating} out of 5 on Amazon`}>
        <span class="text-brand-accent text-base" aria-hidden="true">★★★★★</span>
        <span class="font-mono text-sm text-text-secondary">{rating}</span>
        <span class="text-text-muted" aria-hidden="true">·</span>
        <span class="font-body text-sm text-text-muted">Amazon</span>
      </div>
      ```
      - Container classes EXACTLY: `flex items-center gap-2 mt-2 mb-4`.
      - `aria-label` EXACTLY: `aria-label={\`${rating} out of 5 on Amazon\`}` (template literal interpolation of the const — produces `"4.8 out of 5 on Amazon"` at render time) per D-19.
      - Star `<span>` classes EXACTLY: `text-brand-accent text-base` (D-15 specifies text-base; executor MAY choose text-lg instead — both allowed per Claude's Discretion in CONTEXT.md).
      - Star `<span>` attributes: `aria-hidden="true"` per D-19.
      - Star `<span>` content: the literal 5-character string `★★★★★` (Unicode U+2605 repeated 5 times) per D-16. The character is the BLACK STAR glyph, not ☆ (WHITE STAR) and not a styled Nerd Font icon.
      - Rating number `<span>` classes EXACTLY: `font-mono text-sm text-text-secondary` (D-15; executor MAY use text-base per Claude's Discretion).
      - Rating number `<span>` content: `{rating}` — interpolates the frontmatter const. Must render as `4.8` literally.
      - Separator `<span>` classes EXACTLY: `text-text-muted`.
      - Separator `<span>` attributes: `aria-hidden="true"` per D-19.
      - Separator `<span>` content: the `·` character (MIDDLE DOT, Unicode U+00B7) per D-15.
      - "Amazon" `<span>` classes EXACTLY: `font-body text-sm text-text-muted`.
      - "Amazon" `<span>` content: the literal text `Amazon` (brand name, locale-invariant per D-18).
      - NO HTML comment `<!-- Rating row -->` inside the rendered output — keep the file readable but avoid emitting comments into the HTML via JSX-style `{/* */}` syntax; use regular HTML comments `<!-- -->` at top level if needed for readability, but they will appear in dist/*.html.
    - Description `<p>` classes EXACTLY: `text-text-muted text-sm leading-relaxed` — DROPS `mb-4` from current line 67 per D-08 (the CTA moved out of the text column to column 3 on desktop, so the text column's last element is the description; no bottom margin needed).
    - Description content: `{i.book.desc}` — UNCHANGED.

    **Column 3: amber CTA button (CHANGED per D-13):**
    - `<span>` EXACTLY: `<span class="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-brand-accent text-bg-base font-medium hover:bg-brand-accent-hover transition-colors shrink-0">`.
    - This REPLACES current lines 70-75 class string `inline-flex items-center gap-2 text-sm font-medium text-accent group-hover:text-accent-light transition-colors`.
    - Classes EXACTLY in this order: `inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-brand-accent text-bg-base font-medium hover:bg-brand-accent-hover transition-colors shrink-0`.
    - Do NOT use `text-sm` — the ref Button `variant="accent"` uses `fontSize: 14` which is Tailwind default `text-sm` (14px), but D-13 specifies the solid amber button pattern which inherits default body-text size. The spec in D-13 does NOT include `text-sm`; the default cascade (`font-body` / Inter at body size) governs. KEEP the class string exactly as written above (10 classes).
    - Do NOT use `text-accent` — replaced by `bg-brand-accent text-bg-base` per D-13.
    - Do NOT use `group-hover:text-accent-light` — replaced by `hover:bg-brand-accent-hover` per D-13.
    - `shrink-0` appended so the CTA doesn't shrink on narrower sm: breakpoints.
    - CTA content: `{i.book.cta}` — UNCHANGED.
    - Arrow SVG EXACTLY identical to current lines 72-74:
      - `<svg class="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">`
      - `<path stroke-linecap="round" stroke-linejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />`
      - `</svg>`

    **Forbidden content (must NOT appear anywhere in the file):**
    - NO `bg-surface/30` on the section per D-06.
    - NO `max-w-6xl` on the inner container per D-04.
    - NO `max-w-3xl` on the card wrapper per D-10.
    - NO `flex flex-col sm:flex-row gap-8 items-center sm:items-start` — replaced by the grid pattern per D-08.
    - NO `mb-3` on the h3 (dropped per D-15 — rating row's `mt-2` takes over).
    - NO `mb-4` on the desc `<p>` (dropped per D-08 — CTA moved out of text column).
    - NO `flex-1` on the text column (replaced by a plain `<div>` grid cell per D-08).
    - NO ref-faithful CSS faux cover — no `<div style="width: 140px; height: 200px; background: linear-gradient(...)...">` with PACKT/V.Vedmich inline labels per D-01.
    - NO additional `<span>PACKT</span>` or `<span>V. Vedmich</span>` HTML elements alongside the cover — those are already printed on the JPG per D-01.
    - NO half-star CSS (clip-path, background-clip) or unicode HALF STAR (U+2BE8) — round-up to 5 filled amber stars per D-16.
    - NO nested `<a>` elements inside the whole-card `<a>` (e.g., NO `<a href="#reviews">` around the rating number) per D-11, D-12.
    - NO i18n key added for "Amazon" or "rating" — locale-invariant per D-18.
    - NO new entries in `src/i18n/en.json` or `src/i18n/ru.json` — the JSON files are NOT mutated by this task.
    - NO changes to `src/data/social.ts` — the rating is hardcoded in Book.astro frontmatter per D-17, NOT extracted to the data layer.
    - NO new Stars.astro or BookCover.astro sub-components per D-23.
    - NO hardcoded hex codes in the Astro template body (JSX) — all colors via Tailwind utilities. EXCEPTION: the pre-existing rgba() values inside the `<style>` block (lines 20, 28-29 of current file) are allowed per D-03 (they are NOT new hex introductions; they are faithfully preserved from the current file).
    - NO deprecated cyan classes: `text-cyan-*`, `bg-cyan-*`, `border-cyan-*`, `#06B6D4`, `#22D3EE`.
    - NO DKT brand colors: `#7C3AED`, `#10B981`.
    - NO AWS orange: `#FF9900`, `#232F3E`, `text-aws-*`.
    - NO noise-overlay class on the amber band per D-07.

    **File shape:**
    - File MUST end with a trailing newline.
    - Total line count ~85-95 (starts ~82 lines, grows by ~10 for frontmatter const + rating row block, may shrink slightly from removed margin classes).
    - Valid Astro syntax — must compile without errors under `npm run build`.
  </action>
  <verify>
    <automated>set -e; TF="src/components/Book.astro"; if ! grep -q "import { t, type Locale } from '../i18n/utils'" "$TF"; then echo "FAIL: i18n import missing"; exit 1; fi; echo "OK: i18n import present"; if ! grep -q "const { locale } = Astro.props" "$TF"; then echo "FAIL: locale prop destructure missing"; exit 2; fi; echo "OK: locale destructured"; if ! grep -q "const amazonUrl = 'https://www.amazon.com/dp/1835460038'" "$TF"; then echo "FAIL: amazonUrl const missing or URL changed"; exit 3; fi; echo "OK: amazonUrl const preserved"; if ! grep -q "const rating = 4.8" "$TF"; then echo "FAIL: rating const missing"; exit 4; fi; echo "OK: rating const present per D-17"; if ! grep -q 'id="book"' "$TF"; then echo "FAIL: section id missing"; exit 5; fi; echo "OK: section id preserved"; if ! grep -q 'bg-brand-accent-soft' "$TF"; then echo "FAIL: amber band bg token missing (D-04)"; exit 6; fi; echo "OK: amber band bg present"; if ! grep -q 'border-y border-brand-accent/30' "$TF"; then echo "FAIL: amber band border missing (D-04)"; exit 7; fi; echo "OK: amber band border present"; if grep -q 'bg-surface/30' "$TF"; then echo "FAIL: old bg-surface/30 still present (D-06 violation)"; exit 8; fi; echo "OK: bg-surface/30 removed per D-06"; if ! grep -q 'max-w-\[1120px\]' "$TF"; then echo "FAIL: max-w-[1120px] container missing (D-04)"; exit 9; fi; echo "OK: max-w-[1120px] container present"; if grep -q 'max-w-6xl' "$TF"; then echo "FAIL: old max-w-6xl still present (D-04 violation)"; exit 10; fi; echo "OK: max-w-6xl removed"; if grep -q 'max-w-3xl' "$TF"; then echo "FAIL: max-w-3xl still on card (D-10 violation)"; exit 11; fi; echo "OK: max-w-3xl removed per D-10"; if ! grep -q 'grid-cols-\[140px_1fr_auto\]' "$TF"; then echo "FAIL: 3-col grid template missing (D-08)"; exit 12; fi; echo "OK: 3-col grid present per D-08"; if ! grep -q 'sm:grid sm:grid-cols-\[140px_1fr_auto\]' "$TF"; then echo "FAIL: sm: breakpoint for grid missing (D-08, D-09)"; exit 13; fi; echo "OK: sm: grid breakpoint present"; if ! grep -q 'flex flex-col gap-6 sm:grid' "$TF"; then echo "FAIL: mobile flex-col stack missing (D-09)"; exit 14; fi; echo "OK: mobile flex-col stack present"; if grep -q 'sm:flex-row' "$TF"; then echo "FAIL: old sm:flex-row still present (D-08 violation)"; exit 15; fi; echo "OK: sm:flex-row replaced by grid"; if ! grep -q '/images/book-cover-3d.jpg' "$TF"; then echo "FAIL: JPG cover src missing (D-01)"; exit 16; fi; echo "OK: JPG cover present per D-01"; if ! grep -q 'width="200"' "$TF" || ! grep -q 'height="247"' "$TF"; then echo "FAIL: cover dimensions changed (D-02 violation)"; exit 17; fi; echo "OK: cover 200x247 preserved per D-02"; if ! grep -q 'class="book-cover w-40 sm:w-48"' "$TF"; then echo "FAIL: cover render classes changed (D-02 violation)"; exit 18; fi; echo "OK: cover render classes preserved"; if ! grep -q 'book-cover-wrap shrink-0 flex justify-center sm:justify-start' "$TF"; then echo "FAIL: cover wrapper missing flex alignment"; exit 19; fi; echo "OK: cover wrapper alignment present"; if ! grep -q '★★★★★' "$TF"; then echo "FAIL: 5-star string missing (D-15, D-16)"; exit 20; fi; echo "OK: 5-star string present per D-16"; STARS_COUNT=$(grep -o '★' "$TF" | wc -l | tr -d ' '); if [ "$STARS_COUNT" != "5" ]; then echo "FAIL: expected exactly 5 star characters, got $STARS_COUNT"; exit 21; fi; echo "OK: exactly 5 star characters (U+2605)"; if ! grep -q 'aria-label={`${rating} out of 5 on Amazon`}' "$TF"; then echo "FAIL: rating aria-label template literal missing (D-19)"; exit 22; fi; echo "OK: rating aria-label present per D-19"; ARIA_HIDDEN_COUNT=$(grep -c 'aria-hidden="true"' "$TF"); if [ "$ARIA_HIDDEN_COUNT" -lt "2" ]; then echo "FAIL: expected >=2 aria-hidden=true occurrences (star span + separator span per D-19), got $ARIA_HIDDEN_COUNT"; exit 23; fi; echo "OK: aria-hidden markers present per D-19 (count: $ARIA_HIDDEN_COUNT)"; if ! grep -q 'text-brand-accent text-base' "$TF"; then echo "FAIL: star span classes missing"; exit 24; fi; echo "OK: star span styling present"; if ! grep -q 'font-mono text-sm text-text-secondary' "$TF"; then echo "FAIL: rating number span classes missing"; exit 25; fi; echo "OK: rating number styling present"; if ! grep -q '{rating}' "$TF"; then echo "FAIL: rating interpolation missing"; exit 26; fi; echo "OK: rating interpolated"; if ! grep -q 'font-body text-sm text-text-muted' "$TF"; then echo "FAIL: Amazon label span classes missing"; exit 27; fi; echo "OK: Amazon label styling present"; if ! grep -q '>Amazon<' "$TF"; then echo "FAIL: Amazon label text missing from span (must be inside <span>Amazon</span>)"; exit 28; fi; echo "OK: Amazon label inline per D-18"; if ! grep -q 'bg-brand-accent text-bg-base' "$TF"; then echo "FAIL: solid amber CTA bg/fg missing (D-13)"; exit 29; fi; echo "OK: solid amber CTA present per D-13"; if ! grep -q 'hover:bg-brand-accent-hover' "$TF"; then echo "FAIL: CTA hover bg missing (D-13)"; exit 30; fi; echo "OK: CTA hover state present"; if ! grep -q 'px-5 py-2.5 rounded-lg' "$TF"; then echo "FAIL: CTA padding/radius missing (D-13)"; exit 31; fi; echo "OK: CTA padding+radius present per D-13"; if grep -q 'text-accent group-hover:text-accent-light' "$TF"; then echo "FAIL: old ghost CTA classes still present (D-13 violation)"; exit 32; fi; echo "OK: old ghost CTA replaced"; if ! grep -q 'amazon.com/dp/1835460038' "$TF"; then echo "FAIL: Amazon URL changed or missing (D-11)"; exit 33; fi; echo "OK: Amazon URL preserved"; if ! grep -q 'target="_blank"' "$TF"; then echo "FAIL: target=_blank missing on anchor"; exit 34; fi; echo "OK: target=_blank present"; if ! grep -q 'rel="noopener noreferrer"' "$TF"; then echo "FAIL: rel=noopener noreferrer missing"; exit 35; fi; echo "OK: rel attributes present"; if ! grep -q 'card-glow' "$TF"; then echo "FAIL: card-glow utility missing (D-24)"; exit 36; fi; echo "OK: card-glow preserved per D-24"; if ! grep -q 'animate-on-scroll' "$TF"; then echo "FAIL: animate-on-scroll utility missing (D-25)"; exit 37; fi; echo "OK: animate-on-scroll preserved per D-25"; if ! grep -q '.book-cover {' "$TF" || ! grep -q 'prefers-reduced-motion' "$TF"; then echo "FAIL: existing .book-cover CSS block removed (D-03 violation)"; exit 38; fi; echo "OK: .book-cover CSS preserved per D-03"; if ! grep -q 'translateY(-6px)' "$TF"; then echo "FAIL: hover lift transform missing (D-03)"; exit 39; fi; echo "OK: hover lift preserved"; if ! grep -q 'M10 6H6a2 2 0' "$TF"; then echo "FAIL: external-link arrow SVG path missing (D-14)"; exit 40; fi; echo "OK: arrow SVG preserved per D-14"; if grep -Eq '^[^*]*#[0-9a-fA-F]{3,8}' "$TF" | grep -v 'rgba' | grep -v '<style>'; then echo "FAIL: hardcoded hex in template body (outside <style> block)"; exit 41; fi; echo "OK: no hardcoded hex in template body"; if grep -Eq '#06B6D4|#22D3EE|text-cyan-|bg-cyan-' "$TF"; then echo "FAIL: deprecated cyan detected"; exit 42; fi; echo "OK: no deprecated cyan"; if grep -Eq '#7C3AED|#10B981' "$TF"; then echo "FAIL: DKT brand color detected"; exit 43; fi; echo "OK: no DKT brand color"; if grep -Eq '#FF9900|#232F3E' "$TF"; then echo "FAIL: AWS orange detected"; exit 44; fi; echo "OK: no AWS orange"; if ! grep -q 'i.book.title' "$TF"; then echo "FAIL: i.book.title missing (D-22)"; exit 45; fi; echo "OK: i.book.title referenced"; if ! grep -q 'i.book.name' "$TF"; then echo "FAIL: i.book.name missing (D-22)"; exit 46; fi; echo "OK: i.book.name referenced"; if ! grep -q 'i.book.desc' "$TF"; then echo "FAIL: i.book.desc missing (D-20)"; exit 47; fi; echo "OK: i.book.desc referenced"; if ! grep -q 'i.book.cta' "$TF"; then echo "FAIL: i.book.cta missing (D-21)"; exit 48; fi; echo "OK: i.book.cta referenced"; LINE_COUNT=$(wc -l < "$TF" | tr -d ' '); if [ "$LINE_COUNT" -lt "75" ]; then echo "FAIL: file too short ($LINE_COUNT lines) — likely missing sections"; exit 49; fi; echo "OK: file has $LINE_COUNT lines (expected >=75)"; echo "Task 1 automated verify: all 49 checks pass"</automated>
  </verify>
  <acceptance_criteria>
    Presence (must exit 0):
    - `grep -q "import { t, type Locale } from '../i18n/utils'" src/components/Book.astro`
    - `grep -q "const { locale } = Astro.props" src/components/Book.astro`
    - `grep -q "const i = t(locale);" src/components/Book.astro`
    - `grep -q "const amazonUrl = 'https://www.amazon.com/dp/1835460038'" src/components/Book.astro`
    - `grep -q "const rating = 4.8" src/components/Book.astro` (NEW per D-17)
    - `grep -q 'id="book"' src/components/Book.astro`
    - `grep -q 'class="py-20 sm:py-28 bg-brand-accent-soft border-y border-brand-accent/30"' src/components/Book.astro` (D-04)
    - `grep -q 'max-w-\[1120px\] mx-auto px-4 sm:px-6' src/components/Book.astro` (D-04)
    - `grep -q 'font-display text-3xl font-bold mb-12 animate-on-scroll' src/components/Book.astro` (D-05)
    - `grep -q 'flex flex-col gap-6 sm:grid sm:grid-cols-\[140px_1fr_auto\] sm:gap-7 sm:items-center' src/components/Book.astro` (D-08, D-09)
    - `grep -q 'book-cover-wrap shrink-0 flex justify-center sm:justify-start' src/components/Book.astro`
    - `grep -q 'src="/images/book-cover-3d.jpg"' src/components/Book.astro` (D-01)
    - `grep -q 'width="200"' src/components/Book.astro` (D-02)
    - `grep -q 'height="247"' src/components/Book.astro` (D-02)
    - `grep -q 'loading="lazy"' src/components/Book.astro`
    - `grep -q 'decoding="async"' src/components/Book.astro`
    - `grep -q 'class="book-cover w-40 sm:w-48"' src/components/Book.astro` (D-02)
    - `grep -q 'font-display text-xl font-semibold group-hover:text-accent transition-colors' src/components/Book.astro` (h3 — D-15 drops mb-3)
    - `grep -q 'flex items-center gap-2 mt-2 mb-4' src/components/Book.astro` (rating row container — D-15)
    - `grep -q 'aria-label={`${rating} out of 5 on Amazon`}' src/components/Book.astro` (D-19)
    - `grep -c '★★★★★' src/components/Book.astro` prints `1` (the literal 5-star string appears exactly once)
    - `grep -o '★' src/components/Book.astro | wc -l | tr -d ' '` prints `5` (exactly 5 individual star glyphs, U+2605)
    - `grep -q 'text-brand-accent text-base' src/components/Book.astro` (star span — D-15)
    - `grep -q 'font-mono text-sm text-text-secondary' src/components/Book.astro` (rating number — D-15)
    - `grep -q 'font-body text-sm text-text-muted' src/components/Book.astro` (Amazon label — D-15)
    - `grep -q '>Amazon<' src/components/Book.astro` (Amazon label text inside span — locale-invariant per D-18)
    - `grep -c 'aria-hidden="true"' src/components/Book.astro` prints `2` or more (star span + separator span per D-19)
    - `grep -q 'text-text-muted' src/components/Book.astro` (separator class + Amazon label class)
    - `grep -q 'text-text-secondary' src/components/Book.astro` (rating number class)
    - `grep -q 'text-text-muted text-sm leading-relaxed' src/components/Book.astro` (desc paragraph — D-08 drops mb-4)
    - `grep -q 'inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-brand-accent text-bg-base font-medium hover:bg-brand-accent-hover transition-colors shrink-0' src/components/Book.astro` (CTA span — D-13)
    - `grep -q 'd="M10 6H6a2 2 0' src/components/Book.astro` (external-link arrow SVG path preserved — D-14)
    - `grep -q 'w-4 h-4 group-hover:translate-x-1 transition-transform' src/components/Book.astro` (arrow SVG classes preserved)
    - `grep -q 'group book-card block p-6 sm:p-8 rounded-xl bg-bg border border-border card-glow' src/components/Book.astro` (whole-card anchor classes — D-10 drops max-w-3xl, D-24 keeps card-glow)
    - `grep -q 'href={amazonUrl}' src/components/Book.astro`
    - `grep -q 'target="_blank"' src/components/Book.astro`
    - `grep -q 'rel="noopener noreferrer"' src/components/Book.astro`
    - `grep -q '.book-cover {' src/components/Book.astro` (CSS block preserved — D-03)
    - `grep -q 'prefers-reduced-motion: reduce' src/components/Book.astro` (reduced-motion guard preserved — D-03)
    - `grep -q 'translateY(-6px)' src/components/Book.astro` (hover lift preserved — D-03)
    - `grep -q 'i.book.title' src/components/Book.astro` (D-22)
    - `grep -q 'i.book.name' src/components/Book.astro` (D-22)
    - `grep -q 'i.book.desc' src/components/Book.astro` (D-20)
    - `grep -q 'i.book.cta' src/components/Book.astro` (D-21)

    Absence (must exit 1 — no match):
    - `grep -q 'bg-surface/30' src/components/Book.astro` (D-06 violation — old bg must be replaced)
    - `grep -q 'max-w-6xl' src/components/Book.astro` (D-04 violation — container width changed)
    - `grep -q 'max-w-3xl' src/components/Book.astro` (D-10 violation — card width constraint dropped)
    - `grep -q 'flex flex-col sm:flex-row gap-8 items-center sm:items-start' src/components/Book.astro` (D-08 violation — old 2-col flex replaced by grid)
    - `grep -q 'sm:flex-row' src/components/Book.astro` (D-08 — grid replaces flex-row)
    - `grep -q 'mb-3 group-hover:text-accent' src/components/Book.astro` (D-15 — h3's mb-3 dropped; rating row supplies top margin)
    - `grep -q 'text-text-muted text-sm leading-relaxed mb-4' src/components/Book.astro` (D-08 — desc's mb-4 dropped; CTA moves out of text column)
    - `grep -q 'flex-1' src/components/Book.astro` (D-08 — text column is grid cell, not flex child)
    - `grep -q 'text-accent group-hover:text-accent-light' src/components/Book.astro` (D-13 — old ghost CTA classes replaced by solid amber)
    - `grep -q 'PACKT' src/components/Book.astro` (D-01 — PACKT already on JPG; no extra HTML label)
    - `grep -q 'V. Vedmich' src/components/Book.astro` (D-01 — V. Vedmich already on JPG; no extra HTML label)
    - `grep -q 'linear-gradient(160deg, #134E4A, #0F172A)' src/components/Book.astro` (D-01 — CSS faux cover rejected)
    - `grep -q '☆' src/components/Book.astro` (D-16 — no WHITE STAR / half-star Unicode)
    - `grep -q '⯨' src/components/Book.astro` (D-16 — no half-star glyph)
    - `grep -q 'clip-path' src/components/Book.astro` (D-16 — no CSS half-star rendering)
    - `grep -q 'noise-overlay' src/components/Book.astro` (D-07 — no noise on amber band)
    - `grep -Eq '#06B6D4|#22D3EE' src/components/Book.astro` (CLAUDE.md — no deprecated cyan hex)
    - `grep -Eq 'text-cyan-|bg-cyan-|border-cyan-' src/components/Book.astro` (CLAUDE.md — no cyan utilities)
    - `grep -Eq '#7C3AED|#10B981' src/components/Book.astro` (CLAUDE.md — no DKT colors)
    - `grep -Eq '#FF9900|#232F3E' src/components/Book.astro` (CLAUDE.md — no AWS employer orange)
    - `grep -q 'aws_badge' src/components/Book.astro` (D-18 — no i18n key for "Amazon" text)
    - `grep -q 'book.rating' src/components/Book.astro` (D-18 — rating not in i18n)
    - `grep -q '<Stars' src/components/Book.astro` (D-23 — no primitive component)
    - `grep -q 'BookCover' src/components/Book.astro` (D-23 — no primitive component)

    Structural:
    - File line count: `wc -l < src/components/Book.astro` prints a value `>= 75` and `<= 110` (expected range for the rewrite).
    - Exactly one `<section id="book">` element: `grep -c '<section id="book"' src/components/Book.astro` prints `1`.
    - Exactly one `<img src="/images/book-cover-3d.jpg">` element: `grep -c 'src="/images/book-cover-3d.jpg"' src/components/Book.astro` prints `1`.
    - Exactly 5 star characters in the file: `grep -o '★' src/components/Book.astro | wc -l` prints `5`.
    - Exactly one rating row container: `grep -c 'aria-label={`${rating} out of 5 on Amazon`}' src/components/Book.astro` prints `1`.
    - Exactly one whole-card anchor: anchor count open = close = 1; verified via `node -e "const fs=require('fs'); const s=fs.readFileSync('src/components/Book.astro','utf8'); const aOpens=(s.match(/<a\\s/g)||[]).length; const aCloses=(s.match(/<\\/a>/g)||[]).length; if(aOpens!==1||aCloses!==1){console.error('Expected exactly 1 <a> open and 1 </a> close, got',aOpens,aCloses); process.exit(1);} console.log('OK: 1 anchor, no nesting');"` exits 0.
    - `<style>` block preserved from current lines 14-39: the 3 CSS selectors `.book-cover`, `.book-card:hover .book-cover`, `.book-card:focus-visible .book-cover`, plus the `@media (prefers-reduced-motion: reduce)` block all present.
    - The existing `.book-cover` CSS block rgba() values are the ONLY allowed pre-existing hex-like values in the file (they are pre-existing per D-03 and not new introductions).
  </acceptance_criteria>
  <done>Book.astro is fully rewritten per reference app.jsx:488-519 with user-locked deviations: (1) full-bleed amber band section wrapper replaces bg-surface/30 per D-04 and D-06; (2) 3-col desktop grid [140px_1fr_auto] with mobile flex-col stack per D-08 and D-09; (3) card wrapper drops max-w-3xl per D-10; (4) real /images/book-cover-3d.jpg JPG cover retained byte-identically per D-01 and D-02; (5) NEW Amazon rating row with 5 filled amber stars + hardcoded 4.8 + Amazon label with full ARIA annotations per D-15 D-16 D-17 D-19; (6) solid amber CTA button styled as ref Button variant=accent per D-13; (7) whole-card anchor to Amazon preserved per D-11; (8) existing .book-cover CSS block with drop-shadow hover lift and prefers-reduced-motion guard preserved byte-identically per D-03; (9) .card-glow + .animate-on-scroll utilities preserved per D-24 and D-25; (10) external-link arrow SVG path preserved per D-14. No i18n edits per D-20 D-21 D-22. No PACKT / V. Vedmich HTML labels per D-01 (already printed on JPG). No max-w-6xl, no max-w-3xl, no bg-surface/30, no CSS faux cover, no half-star, no Stars primitive, no hardcoded hex in template body. All 4 i18n keys (title, name, desc, cta) still referenced.</done>
</task>

<task type="auto">
  <name>Task 2: Token/hex-hygiene check + build gate — verify the rewrite compiles cleanly, produces both EN and RU HTML with the expected DOM shape, the full-bleed amber band and rating row render in both locales, and leaves zero new hardcoded hex in the template body</name>
  <files>src/components/Book.astro</files>
  <read_first>
    - src/components/Book.astro (confirm Task 1 produced the expected file — re-read only if the Task 1 automated verify failed; otherwise skip to avoid redundant reads)
    - CLAUDE.md §"Deep Signal Design System — LIVE" §"Anti-Patterns" (token enforcement rules — no hardcoded hex in template body, no deprecated cyan, no DKT green, no AWS orange; this task enforces them at the grep level)
    - .planning/phases/05-podcasts-badges/05-01-podcasts-rewrite-PLAN.md §Task 2 (structural analog — same build gate approach, different file)
    - .planning/phases/06-book-packt-cover/06-CONTEXT.md §code_context (confirms: no new tokens required, all utilities exist, i18n keys unchanged, no new assets)
  </read_first>
  <action>
    This task is a verification-only gate — no file mutations. Run each of the following checks in sequence. If ANY check fails, fix Task 1 output (re-run Task 1 with corrected Astro markup) before proceeding. If ALL checks pass, the plan is complete.

    **Check 1 — Token/hex-hygiene (Deep Signal discipline per CLAUDE.md):**

    The template BODY (everything outside the `<style>` block) must have zero hardcoded hex. The `<style>` block preserves pre-existing rgba() values from the current file per D-03 — these are ALLOWED continuation, not new introductions.

    ```bash
    # Strategy: temporarily carve out the <style> block, then grep the rest for hex.
    node -e "
    const fs = require('fs');
    const s = fs.readFileSync('src/components/Book.astro', 'utf8');
    // Carve out content between <style> and </style> (inclusive) — that's D-03 preserved territory.
    const body = s.replace(/<style>[\\s\\S]*?<\\/style>/g, '<!-- STYLE_BLOCK_OMITTED -->');
    const hexMatches = body.match(/#[0-9a-fA-F]{3,8}\\b/g) || [];
    if (hexMatches.length > 0) {
      console.error('FAIL: hardcoded hex in template body outside <style> block:');
      hexMatches.forEach(h => console.error('  ', h));
      process.exit(1);
    }
    console.log('OK: zero hardcoded hex in template body (outside <style> block)');
    "
    ```

    **Check 2 — Forbidden classes/patterns:**

    ```bash
    # Expected: ZERO matches for each of these forbidden palette references.
    grep -En '#06B6D4|#22D3EE|#7C3AED|#10B981|#FF9900|#232F3E|text-cyan-|bg-cyan-|border-cyan-' src/components/Book.astro
    # Expected stdout: empty, exit code 1.
    ```

    **Check 3 — CSS faux cover rejected (D-01):**

    ```bash
    # The ref's linear-gradient(160deg, #134E4A, #0F172A) CSS faux cover MUST NOT appear.
    grep -n 'linear-gradient(160deg, #134E4A, #0F172A)' src/components/Book.astro
    # Expected: empty, exit code 1.

    # PACKT / V. Vedmich MUST NOT appear as HTML text (they are already on the JPG per D-01).
    grep -En '>PACKT<|>V\\. Vedmich<|>V\\.Vedmich<' src/components/Book.astro
    # Expected: empty, exit code 1.
    ```

    **Check 4 — Full-bleed amber band present (D-04, D-06):**

    ```bash
    # bg-brand-accent-soft MUST be on the section.
    grep -q 'bg-brand-accent-soft' src/components/Book.astro || { echo "FAIL: amber band bg missing (D-04)"; exit 1; }

    # border-y border-brand-accent/30 MUST be on the section.
    grep -q 'border-y border-brand-accent/30' src/components/Book.astro || { echo "FAIL: amber band border missing (D-04)"; exit 1; }

    # bg-surface/30 MUST be absent.
    grep -q 'bg-surface/30' src/components/Book.astro && { echo "FAIL: old bg-surface/30 still present (D-06)"; exit 1; } || true

    # Inner container uses max-w-[1120px] (D-04).
    grep -q 'max-w-\[1120px\] mx-auto px-4 sm:px-6' src/components/Book.astro || { echo "FAIL: max-w-[1120px] container missing (D-04)"; exit 1; }

    echo "OK: full-bleed amber band + max-w-[1120px] container verified"
    ```

    **Check 5 — 3-col grid / mobile stack layout (D-08, D-09):**

    ```bash
    grep -q 'flex flex-col gap-6 sm:grid sm:grid-cols-\[140px_1fr_auto\] sm:gap-7 sm:items-center' src/components/Book.astro || { echo "FAIL: responsive grid classes missing (D-08, D-09)"; exit 1; }

    # Old 2-col flex layout MUST be absent.
    grep -q 'flex flex-col sm:flex-row gap-8 items-center sm:items-start' src/components/Book.astro && { echo "FAIL: old 2-col flex still present"; exit 1; } || true

    echo "OK: responsive grid layout verified"
    ```

    **Check 6 — Rating row (D-15, D-16, D-17, D-19):**

    ```bash
    # const rating = 4.8 in frontmatter (D-17).
    grep -q 'const rating = 4.8' src/components/Book.astro || { echo "FAIL: const rating = 4.8 missing (D-17)"; exit 1; }

    # aria-label template literal (D-19).
    grep -q 'aria-label={`${rating} out of 5 on Amazon`}' src/components/Book.astro || { echo "FAIL: rating aria-label missing (D-19)"; exit 1; }

    # Exactly 5 star chars U+2605 (D-16).
    STARS=$(grep -o '★' src/components/Book.astro | wc -l | tr -d ' ')
    [ "$STARS" = "5" ] || { echo "FAIL: expected 5 stars, got $STARS (D-16)"; exit 1; }

    # No half-star or white-star glyph (D-16).
    grep -q '☆' src/components/Book.astro && { echo "FAIL: white-star glyph present (D-16)"; exit 1; } || true
    grep -q 'clip-path' src/components/Book.astro && { echo "FAIL: CSS half-star rendering present (D-16)"; exit 1; } || true

    # Amazon label inline in span, not in i18n (D-18).
    grep -q '>Amazon<' src/components/Book.astro || { echo "FAIL: Amazon label missing from span (D-18)"; exit 1; }

    # Rating NOT in i18n JSON.
    grep -l 'book.rating\|★\|Amazon' src/i18n/en.json src/i18n/ru.json 2>/dev/null | while read f; do
      if grep -q 'Amazon' "$f"; then
        # i18n may already contain "Amazon" inside i.book.cta (="Get on Amazon" / "Купить на Amazon") — that's ALLOWED.
        # Check specifically for a new rating-related key.
        if grep -Eq '"rating"|"stars"|"review"' "$f"; then
          echo "FAIL: rating-related key added to $f (D-18 violation)"; exit 1
        fi
      fi
    done

    echo "OK: rating row verified (hardcoded, 5 stars, ARIA, no i18n leak)"
    ```

    **Check 7 — Solid amber CTA (D-13):**

    ```bash
    grep -q 'inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-brand-accent text-bg-base font-medium hover:bg-brand-accent-hover transition-colors' src/components/Book.astro || { echo "FAIL: solid amber CTA classes missing (D-13)"; exit 1; }

    # Old ghost CTA MUST be absent.
    grep -q 'text-accent group-hover:text-accent-light' src/components/Book.astro && { echo "FAIL: old ghost CTA classes still present (D-13)"; exit 1; } || true

    echo "OK: solid amber CTA verified"
    ```

    **Check 8 — Preserved artifacts (D-01, D-02, D-03, D-11, D-14, D-24, D-25):**

    ```bash
    # JPG cover asset on disk.
    test -f public/images/book-cover-3d.jpg || { echo "FAIL: /images/book-cover-3d.jpg missing on disk"; exit 1; }

    # Cover referenced with exact attributes (D-01, D-02).
    grep -q 'src="/images/book-cover-3d.jpg"' src/components/Book.astro || { echo "FAIL: cover src missing (D-01)"; exit 1; }
    grep -q 'width="200"' src/components/Book.astro || { echo "FAIL: cover width changed (D-02)"; exit 1; }
    grep -q 'height="247"' src/components/Book.astro || { echo "FAIL: cover height changed (D-02)"; exit 1; }
    grep -q 'class="book-cover w-40 sm:w-48"' src/components/Book.astro || { echo "FAIL: cover render classes changed (D-02)"; exit 1; }

    # .book-cover CSS block preserved (D-03).
    grep -q '.book-cover {' src/components/Book.astro || { echo "FAIL: .book-cover CSS rule missing (D-03)"; exit 1; }
    grep -q 'translateY(-6px)' src/components/Book.astro || { echo "FAIL: hover lift transform missing (D-03)"; exit 1; }
    grep -q 'prefers-reduced-motion: reduce' src/components/Book.astro || { echo "FAIL: reduced-motion guard missing (D-03)"; exit 1; }

    # Whole-card <a> wrap preserved (D-11).
    grep -q 'href={amazonUrl}' src/components/Book.astro || { echo "FAIL: whole-card anchor href missing (D-11)"; exit 1; }
    grep -q 'target="_blank"' src/components/Book.astro || { echo "FAIL: target=_blank missing"; exit 1; }
    grep -q 'rel="noopener noreferrer"' src/components/Book.astro || { echo "FAIL: rel=noopener noreferrer missing"; exit 1; }

    # Arrow SVG preserved (D-14).
    grep -q 'M10 6H6a2 2 0' src/components/Book.astro || { echo "FAIL: external-link arrow SVG path missing (D-14)"; exit 1; }
    grep -q 'w-4 h-4 group-hover:translate-x-1 transition-transform' src/components/Book.astro || { echo "FAIL: arrow SVG classes missing (D-14)"; exit 1; }

    # card-glow and animate-on-scroll utilities preserved (D-24, D-25).
    grep -q 'card-glow' src/components/Book.astro || { echo "FAIL: card-glow utility missing (D-24)"; exit 1; }
    grep -q 'animate-on-scroll' src/components/Book.astro || { echo "FAIL: animate-on-scroll utility missing (D-25)"; exit 1; }

    echo "OK: preserved artifacts verified (JPG, CSS block, anchor, arrow, utilities)"
    ```

    **Check 9 — i18n invariance (D-20, D-21, D-22):**

    ```bash
    # All 4 i18n keys still referenced in Book.astro.
    for k in title name desc cta; do
      grep -q "i.book.$k" src/components/Book.astro || { echo "FAIL: i.book.$k missing (D-20/D-21/D-22)"; exit 1; }
    done

    # i18n JSON files NOT modified in this plan — check git status shows no change in these paths.
    # (This is an advisory check; the real enforcement happens at commit-time via git diff.)
    if git diff --quiet src/i18n/en.json; then
      echo "OK: src/i18n/en.json unchanged (D-22 respected)"
    else
      echo "WARN: src/i18n/en.json was modified — verify no book.* keys changed"
    fi
    if git diff --quiet src/i18n/ru.json; then
      echo "OK: src/i18n/ru.json unchanged (D-22 respected)"
    else
      echo "WARN: src/i18n/ru.json was modified — verify no book.* keys changed"
    fi
    ```

    **Check 10 — Build gate (CRITICAL — `npm run build` must exit 0):**

    ```bash
    npm run build 2>&1 | tail -20
    # Expected: includes "7 pages" or equivalent success indicator.
    # Expected exit code: 0.
    # If the build fails, read the error message:
    #   (a) Missing i18n key → verify Task 1 references exactly the 4 keys: title, name, desc, cta. Do NOT add new keys.
    #   (b) Tailwind arbitrary-value pattern hit → confirm `grid-cols-[140px_1fr_auto]`, `max-w-[1120px]` have NO whitespace inside the brackets (Tailwind splits on spaces; underscores are required for multi-value arbitrary grid templates).
    #   (c) Astro syntax error → validate `<svg>`, `<img>`, `<a>`, `<span>` tag closure; Astro is XML-strict; self-closing tags need `/>`.
    #   (d) TypeScript error on `rating` access → confirm `const rating = 4.8;` is in the frontmatter block between the `---` delimiters.
    #   (e) Template literal aria-label syntax → the backtick template-literal expression inside an Astro attribute value must be wrapped in curly braces: `aria-label={`${rating} out of 5 on Amazon`}`. If Astro rejects it, fall back to a computed frontmatter const: `const ratingAriaLabel = \`\${rating} out of 5 on Amazon\`;` then use `aria-label={ratingAriaLabel}`.
    ```

    **Check 11 — Both locales render expected DOM shape in built HTML:**

    Note: `>Amazon<` and `>AWS RU<`-style anchors bind grep to span delimiters to avoid false positives from HTML comments (Astro emits comments into built output by default).

    ```bash
    # Both dist HTML files exist.
    test -f dist/en/index.html || { echo "FAIL: dist/en/index.html missing"; exit 1; }
    test -f dist/ru/index.html || { echo "FAIL: dist/ru/index.html missing"; exit 1; }

    # EN Book section contains:
    for loc in en ru; do
      BSEC=$(awk '/<section id="book"/{p=1} /<\/section>/{if(p){p=0;exit}} p' dist/$loc/index.html)

      # (a) exactly 1 JPG img
      C=$(echo "$BSEC" | grep -c 'src="/images/book-cover-3d.jpg"'); [ "$C" = "1" ] || { echo "FAIL: $loc book img count != 1, got $C"; exit 1; }

      # (b) exactly 1 rating row with 4.8
      C=$(echo "$BSEC" | grep -c '4.8'); [ "$C" -ge "1" ] || { echo "FAIL: $loc 4.8 rating count < 1, got $C"; exit 1; }

      # (c) exactly 1 ★★★★★ string
      C=$(echo "$BSEC" | grep -c '★★★★★'); [ "$C" = "1" ] || { echo "FAIL: $loc star string count != 1, got $C"; exit 1; }

      # (d) >Amazon< label span
      C=$(echo "$BSEC" | grep -c '>Amazon<'); [ "$C" = "1" ] || { echo "FAIL: $loc >Amazon< span count != 1, got $C"; exit 1; }

      # (e) amber CTA span with bg-brand-accent class
      C=$(echo "$BSEC" | grep -cE 'class="[^"]*bg-brand-accent[^-][^"]*text-bg-base'); [ "$C" = "1" ] || { echo "FAIL: $loc amber CTA span count != 1, got $C"; exit 1; }

      # (f) section has the full-bleed amber band classes
      C=$(echo "$BSEC" | grep -c 'bg-brand-accent-soft'); [ "$C" -ge "1" ] || { echo "FAIL: $loc amber band bg missing, count $C"; exit 1; }
      C=$(echo "$BSEC" | grep -c 'border-brand-accent/30'); [ "$C" -ge "1" ] || { echo "FAIL: $loc amber band border missing, count $C"; exit 1; }

      # (g) exactly 1 whole-card anchor with amazon.com URL
      C=$(echo "$BSEC" | grep -c 'amazon.com/dp/1835460038'); [ "$C" = "1" ] || { echo "FAIL: $loc amazon anchor count != 1, got $C"; exit 1; }

      # (h) NO CSS faux cover markup
      C=$(echo "$BSEC" | grep -c 'linear-gradient(160deg, #134E4A'); [ "$C" = "0" ] || { echo "FAIL: $loc CSS faux cover leaked, count $C"; exit 1; }

      # (i) NO extra PACKT / V.Vedmich HTML labels
      C=$(echo "$BSEC" | grep -c '>PACKT<'); [ "$C" = "0" ] || { echo "FAIL: $loc >PACKT< leaked, count $C"; exit 1; }

      echo "OK: $loc Book section DOM shape verified"
    done
    ```

    **Check 12 — CSS utilities compile into built CSS:**

    ```bash
    # Tailwind must generate the amber-soft bg utility from the source.
    grep -l 'bg-brand-accent-soft\|brand-accent-soft' dist/_astro/*.css > /dev/null 2>&1 || { echo "FAIL: bg-brand-accent-soft utility not in built CSS"; exit 1; }
    echo "OK: amber band CSS compiled"

    # Tailwind must generate the grid-cols arbitrary utility.
    grep -lE 'grid-cols-\[140px_1fr_auto\]|grid-cols.*140px' dist/_astro/*.css > /dev/null 2>&1 || { echo "FAIL: arbitrary grid-cols utility not in built CSS"; exit 1; }
    echo "OK: grid-cols arbitrary utility compiled"
    ```

    **Check 13 — REQ-005 acceptance verified:**

    REQ-005 says (from REQUIREMENTS.md §REQ-005):
    - "`PACKT` label visible top-left of cover" → Satisfied by the JPG asset which has PACKT printed in-frame (D-01 locked decision, documented in DISCUSSION-LOG). The JPG renders (Check 11(a)).
    - "`V. Vedmich` label visible bottom of cover" → Satisfied by the JPG asset which has V. Vedmich printed in-frame (D-01). The JPG renders (Check 11(a)).
    - "Book cover still renders in 3D perspective" → Preserved because we keep the JPG (it IS a 3D render) per D-01.
    - "No regression to 'Get on Amazon' CTA" → The CTA text `{i.book.cta}` still renders in column 3, styled as solid amber button per D-13. The whole-card anchor still navigates to `https://www.amazon.com/dp/1835460038` per D-11.

    Document the CONTEXT-driven deviation (JPG asset over CSS faux cover per D-01) in plan summary.

    If all 13 checks pass, Task 2 and the plan are complete. Do NOT commit from within the plan — the atomic Phase 6 commit happens after visual verify on live per the user's established workflow (see `.planning/STATE.md` §Notes "User prefers sequential execution with visual verification on live after each phase."). Visual verification on live via playwright-cli attached to real Chrome (per `$HOME/.claude/projects/-Users-viktor-Documents-GitHub-vedmich-vedmich-dev/memory/feedback_playwright.md`) happens at:
    - 1440×900 viewport for both `/en/` and `/ru/` (desktop grid layout + amber band edge-to-edge).
    - 375×667 viewport for both `/en/` and `/ru/` (mobile flex-col stack, amber band still edge-to-edge, no horizontal scroll).
  </action>
  <verify>
    <automated>set -e; TF="src/components/Book.astro"; node -e "const fs=require('fs'); const s=fs.readFileSync('$TF','utf8'); const body=s.replace(/<style>[\\s\\S]*?<\\/style>/g,'<!-- STYLE_BLOCK_OMITTED -->'); const hex=body.match(/#[0-9a-fA-F]{3,8}\\b/g)||[]; if(hex.length>0){console.error('FAIL: hex in body:',hex); process.exit(1);} console.log('OK: no hex in template body');"; grep -Eq '#06B6D4|#22D3EE|#7C3AED|#10B981|#FF9900|#232F3E|text-cyan-|bg-cyan-|border-cyan-' "$TF" && { echo "FAIL: forbidden color reference detected"; exit 2; } || true; grep -q 'linear-gradient(160deg, #134E4A, #0F172A)' "$TF" && { echo "FAIL: CSS faux cover leaked"; exit 3; } || true; grep -Eq '>PACKT<|>V\\. Vedmich<|>V\\.Vedmich<' "$TF" && { echo "FAIL: PACKT/V.Vedmich HTML label leaked (D-01 — already on JPG)"; exit 4; } || true; grep -q 'bg-brand-accent-soft' "$TF" || { echo "FAIL: amber band bg missing (D-04)"; exit 5; }; grep -q 'border-y border-brand-accent/30' "$TF" || { echo "FAIL: amber band border missing (D-04)"; exit 6; }; grep -q 'bg-surface/30' "$TF" && { echo "FAIL: bg-surface/30 still present (D-06)"; exit 7; } || true; grep -q 'max-w-\[1120px\] mx-auto px-4 sm:px-6' "$TF" || { echo "FAIL: max-w-[1120px] container missing (D-04)"; exit 8; }; grep -q 'max-w-6xl' "$TF" && { echo "FAIL: max-w-6xl still present (D-04)"; exit 9; } || true; grep -q 'max-w-3xl' "$TF" && { echo "FAIL: max-w-3xl still present (D-10)"; exit 10; } || true; grep -q 'flex flex-col gap-6 sm:grid sm:grid-cols-\[140px_1fr_auto\] sm:gap-7 sm:items-center' "$TF" || { echo "FAIL: responsive grid classes missing (D-08, D-09)"; exit 11; }; grep -q 'sm:flex-row' "$TF" && { echo "FAIL: old sm:flex-row present"; exit 12; } || true; grep -q 'const rating = 4.8' "$TF" || { echo "FAIL: const rating missing (D-17)"; exit 13; }; grep -q 'aria-label={`${rating} out of 5 on Amazon`}' "$TF" || { echo "FAIL: rating aria-label missing (D-19)"; exit 14; }; STARS=$(grep -o '★' "$TF" | wc -l | tr -d ' '); [ "$STARS" = "5" ] || { echo "FAIL: star count != 5, got $STARS (D-16)"; exit 15; }; grep -q '☆' "$TF" && { echo "FAIL: white-star glyph (D-16)"; exit 16; } || true; grep -q 'clip-path' "$TF" && { echo "FAIL: CSS half-star (D-16)"; exit 17; } || true; grep -q '>Amazon<' "$TF" || { echo "FAIL: Amazon label missing (D-18)"; exit 18; }; grep -q 'inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-brand-accent text-bg-base font-medium hover:bg-brand-accent-hover transition-colors' "$TF" || { echo "FAIL: solid amber CTA missing (D-13)"; exit 19; }; grep -q 'text-accent group-hover:text-accent-light' "$TF" && { echo "FAIL: old ghost CTA still present (D-13)"; exit 20; } || true; test -f public/images/book-cover-3d.jpg || { echo "FAIL: book-cover-3d.jpg missing on disk"; exit 21; }; grep -q 'src="/images/book-cover-3d.jpg"' "$TF" || { echo "FAIL: cover src missing"; exit 22; }; grep -q 'width="200"' "$TF" || { echo "FAIL: cover width changed (D-02)"; exit 23; }; grep -q 'height="247"' "$TF" || { echo "FAIL: cover height changed (D-02)"; exit 24; }; grep -q '.book-cover {' "$TF" || { echo "FAIL: .book-cover CSS missing (D-03)"; exit 25; }; grep -q 'translateY(-6px)' "$TF" || { echo "FAIL: hover lift missing (D-03)"; exit 26; }; grep -q 'prefers-reduced-motion: reduce' "$TF" || { echo "FAIL: reduced-motion guard missing (D-03)"; exit 27; }; grep -q 'href={amazonUrl}' "$TF" || { echo "FAIL: whole-card anchor href missing (D-11)"; exit 28; }; grep -q 'M10 6H6a2 2 0' "$TF" || { echo "FAIL: arrow SVG missing (D-14)"; exit 29; }; grep -q 'card-glow' "$TF" || { echo "FAIL: card-glow missing (D-24)"; exit 30; }; grep -q 'animate-on-scroll' "$TF" || { echo "FAIL: animate-on-scroll missing (D-25)"; exit 31; }; for k in title name desc cta; do grep -q "i.book.$k" "$TF" || { echo "FAIL: i.book.$k missing"; exit 32; }; done; npm run build 2>&1 | tail -10 > /tmp/gsd-06-01-build.log; if [ ${PIPESTATUS[0]} -ne 0 ]; then echo "FAIL: npm run build exited non-zero"; cat /tmp/gsd-06-01-build.log; exit 33; fi; test -f dist/en/index.html || { echo "FAIL: dist/en/index.html missing"; exit 34; }; test -f dist/ru/index.html || { echo "FAIL: dist/ru/index.html missing"; exit 35; }; for loc in en ru; do BSEC=$(awk '/<section id="book"/{p=1} /<\/section>/{if(p){p=0;exit}} p' dist/$loc/index.html); C=$(echo "$BSEC" | grep -c 'src="/images/book-cover-3d.jpg"'); [ "$C" = "1" ] || { echo "FAIL: $loc JPG img count $C != 1"; exit 36; }; C=$(echo "$BSEC" | grep -c '4.8'); [ "$C" -ge "1" ] || { echo "FAIL: $loc 4.8 count $C < 1"; exit 37; }; C=$(echo "$BSEC" | grep -c '★★★★★'); [ "$C" = "1" ] || { echo "FAIL: $loc star string count $C != 1"; exit 38; }; C=$(echo "$BSEC" | grep -c '>Amazon<'); [ "$C" = "1" ] || { echo "FAIL: $loc Amazon span count $C != 1"; exit 39; }; C=$(echo "$BSEC" | grep -c 'bg-brand-accent-soft'); [ "$C" -ge "1" ] || { echo "FAIL: $loc amber band bg count $C < 1"; exit 40; }; C=$(echo "$BSEC" | grep -c 'amazon.com/dp/1835460038'); [ "$C" = "1" ] || { echo "FAIL: $loc amazon anchor count $C != 1"; exit 41; }; C=$(echo "$BSEC" | grep -c '>PACKT<'); [ "$C" = "0" ] || { echo "FAIL: $loc >PACKT< leaked, count $C"; exit 42; }; C=$(echo "$BSEC" | grep -c 'linear-gradient(160deg, #134E4A'); [ "$C" = "0" ] || { echo "FAIL: $loc CSS faux cover leaked, count $C"; exit 43; }; done; grep -l 'bg-brand-accent-soft\|brand-accent-soft' dist/_astro/*.css > /dev/null 2>&1 || { echo "FAIL: amber band CSS not compiled"; exit 44; }; echo "OK: all 13 checks passed (token hygiene, rejected CSS faux cover, full-bleed amber band, responsive grid, rating row, solid amber CTA, preserved artifacts, i18n invariance, build green, DOM shape EN+RU, compiled CSS)"</automated>
  </verify>
  <acceptance_criteria>
    Token hygiene (must exit 1 — no match in template body):
    - Node script carves out `<style>` block; grep on the remaining body for `#[0-9a-fA-F]{3,8}\b` returns zero matches (hex only allowed inside the preserved `<style>` block per D-03).
    - `grep -Eq '#06B6D4|#22D3EE' src/components/Book.astro` exits 1 (no deprecated cyan).
    - `grep -Eq '#7C3AED|#10B981' src/components/Book.astro` exits 1 (no DKT colors).
    - `grep -Eq '#FF9900|#232F3E' src/components/Book.astro` exits 1 (no AWS orange).
    - `grep -Eq 'text-cyan-|bg-cyan-|border-cyan-' src/components/Book.astro` exits 1 (no cyan utilities).

    Structural invariants in source:
    - CSS faux cover rejected: `grep -q 'linear-gradient(160deg, #134E4A, #0F172A)' src/components/Book.astro` exits 1.
    - No PACKT / V. Vedmich HTML labels: `grep -Eq '>PACKT<|>V\. Vedmich<|>V\.Vedmich<' src/components/Book.astro` exits 1.
    - No bg-surface/30: `grep -q 'bg-surface/30' src/components/Book.astro` exits 1.
    - No max-w-6xl or max-w-3xl: `grep -Eq 'max-w-6xl|max-w-3xl' src/components/Book.astro` exits 1.
    - No old flex layout: `grep -q 'sm:flex-row' src/components/Book.astro` exits 1.
    - No old ghost CTA: `grep -q 'text-accent group-hover:text-accent-light' src/components/Book.astro` exits 1.
    - No half-star: `grep -Eq '☆|clip-path' src/components/Book.astro` exits 1.
    - Exactly 5 star glyphs: `grep -o '★' src/components/Book.astro | wc -l` prints `5`.

    Required presence in source:
    - Amber band: `grep -q 'bg-brand-accent-soft' src/components/Book.astro && grep -q 'border-y border-brand-accent/30' src/components/Book.astro` exits 0.
    - Container: `grep -q 'max-w-\[1120px\] mx-auto px-4 sm:px-6' src/components/Book.astro` exits 0.
    - Responsive grid: `grep -q 'flex flex-col gap-6 sm:grid sm:grid-cols-\[140px_1fr_auto\] sm:gap-7 sm:items-center' src/components/Book.astro` exits 0.
    - Rating const: `grep -q 'const rating = 4.8' src/components/Book.astro` exits 0.
    - Rating aria-label template literal: `grep -q 'aria-label={`${rating} out of 5 on Amazon`}' src/components/Book.astro` exits 0.
    - Amazon label: `grep -q '>Amazon<' src/components/Book.astro` exits 0.
    - Solid amber CTA: `grep -q 'inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-brand-accent text-bg-base font-medium hover:bg-brand-accent-hover transition-colors' src/components/Book.astro` exits 0.
    - JPG cover src + dimensions: `grep -q 'src="/images/book-cover-3d.jpg"' && grep -q 'width="200"' && grep -q 'height="247"' && grep -q 'class="book-cover w-40 sm:w-48"'` all exit 0.
    - `.book-cover` CSS preserved: `grep -q '.book-cover {' src/components/Book.astro && grep -q 'translateY(-6px)' src/components/Book.astro && grep -q 'prefers-reduced-motion: reduce' src/components/Book.astro` exits 0.
    - Arrow SVG: `grep -q 'M10 6H6a2 2 0' src/components/Book.astro` exits 0.
    - Utilities preserved: `grep -q 'card-glow' && grep -q 'animate-on-scroll'` exits 0.
    - All 4 i18n keys: `for k in title name desc cta; do grep -q "i.book.$k" src/components/Book.astro; done` exits 0 each time.

    Disk assets present:
    - `test -f public/images/book-cover-3d.jpg` exits 0.

    i18n files unchanged:
    - `git diff --quiet src/i18n/en.json` exits 0 (no modifications in this plan).
    - `git diff --quiet src/i18n/ru.json` exits 0 (no modifications in this plan).

    Build gate:
    - `npm run build` exits 0.
    - Output includes "7 pages" success indicator.
    - `dist/en/index.html` and `dist/ru/index.html` both exist.

    Built DOM verification (REQ-005 acceptance):
    - EN Book section: `awk '/<section id="book"/{p=1} /<\/section>/{if(p){p=0;exit}} p' dist/en/index.html` returns content that:
      - Contains exactly 1 `src="/images/book-cover-3d.jpg"`.
      - Contains at least 1 `4.8` (rating text).
      - Contains exactly 1 `★★★★★`.
      - Contains exactly 1 `>Amazon<` span.
      - Contains at least 1 `bg-brand-accent-soft` (amber band class).
      - Contains at least 1 `border-brand-accent/30` (amber band border).
      - Contains exactly 1 `amazon.com/dp/1835460038` anchor href.
      - Contains zero `>PACKT<` (D-01 — already on JPG).
      - Contains zero `linear-gradient(160deg, #134E4A` (CSS faux cover rejected).
    - RU Book section: same assertions against `dist/ru/index.html`.

    Built CSS verification:
    - `grep -l 'bg-brand-accent-soft\|brand-accent-soft' dist/_astro/*.css | wc -l` prints 1 or more (Tailwind compiled the amber band utility).
    - `grep -lE 'grid-cols-\[140px_1fr_auto\]|grid-cols.*140px' dist/_astro/*.css | wc -l` prints 1 or more (Tailwind compiled the arbitrary grid template).
  </acceptance_criteria>
  <done>All 13 verification checks pass: (1) zero new hardcoded hex in template body (existing `<style>` rgba() values preserved per D-03 are excluded by the carve-out); (2) zero forbidden color references (cyan, DKT, AWS orange); (3) CSS faux cover rejected — no `linear-gradient(160deg, #134E4A, #0F172A)` and no `>PACKT<` / `>V. Vedmich<` HTML labels per D-01; (4) full-bleed amber band present with `bg-brand-accent-soft border-y border-brand-accent/30` and inner `max-w-[1120px]` container per D-04 and D-06; (5) responsive grid `flex flex-col gap-6 sm:grid sm:grid-cols-[140px_1fr_auto] sm:gap-7 sm:items-center` present per D-08 and D-09; (6) Amazon rating row with `const rating = 4.8` hardcoded, exactly 5 `★` glyphs, aria-label template literal, `>Amazon<` span inline, no half-star per D-15 through D-19; (7) solid amber CTA button with exact D-13 class string, old ghost CTA absent; (8) all preserved artifacts intact (JPG cover 200x247 with `w-40 sm:w-48`, `.book-cover` CSS block with drop-shadow + hover lift + reduced-motion guard, whole-card anchor to Amazon, external-link arrow SVG, `.card-glow`, `.animate-on-scroll`); (9) i18n JSON files unchanged, all 4 `i.book.*` keys referenced; (10) `npm run build` exits 0 with 7 pages; (11) both `dist/en/index.html` and `dist/ru/index.html` Book sections render the expected DOM shape (JPG img, rating row with 4.8, star string, Amazon span, amber CTA, amber band classes, Amazon anchor; no leaked PACKT labels, no CSS faux cover); (12) built CSS contains the `bg-brand-accent-soft` and `grid-cols-[140px_1fr_auto]` utilities compiled from the source; (13) REQ-005 acceptance preserved via JPG asset (PACKT + V. Vedmich printed in-frame + 3D perspective) per D-01 decision chain documented in DISCUSSION-LOG.md.</done>
</task>

</tasks>

<verification>
- Both tasks' `<verify><automated>` commands exit 0.
- `npm run build` exits 0 with 7 pages built (Astro default: 7 pages = `/`, `/en/`, `/ru/`, `/en/blog/`, `/ru/blog/`, and two more routing variants).
- Source file `src/components/Book.astro` contains:
  - Zero hardcoded hex in the template body (outside the preserved `<style>` block per D-03).
  - Zero deprecated cyan references (`#06B6D4`, `#22D3EE`, `text-cyan-*`, `bg-cyan-*`).
  - Zero DKT brand colors (`#7C3AED`, `#10B981`).
  - Zero AWS orange (`#FF9900`, `#232F3E`).
  - No `bg-surface/30`, no `max-w-6xl`, no `max-w-3xl`, no `sm:flex-row` (all replaced).
  - No CSS faux cover (`linear-gradient(160deg, #134E4A, #0F172A)`) per D-01.
  - No extra `>PACKT<` or `>V. Vedmich<` HTML labels per D-01 (they are on the JPG).
  - No half-star Unicode or CSS (`☆`, `clip-path`) per D-16.
  - No new Astro primitives (`<Stars>`, `<BookCover>`) per D-23.
  - Full-bleed amber band section with `bg-brand-accent-soft border-y border-brand-accent/30` per D-04.
  - Inner `max-w-[1120px]` container per D-04.
  - Responsive grid `flex flex-col gap-6 sm:grid sm:grid-cols-[140px_1fr_auto] sm:gap-7 sm:items-center` per D-08, D-09.
  - `const rating = 4.8` in frontmatter per D-17.
  - Rating row with 5 filled amber stars, `4.8` numeric, `·` separator, `Amazon` label — all in spans with proper ARIA annotations per D-15, D-16, D-19.
  - Solid amber CTA span with exact D-13 class string, including `bg-brand-accent text-bg-base hover:bg-brand-accent-hover px-5 py-2.5 rounded-lg`.
  - Real JPG cover `/images/book-cover-3d.jpg` at `width="200" height="247" class="book-cover w-40 sm:w-48"` per D-01, D-02.
  - `.book-cover` CSS block preserved byte-identical (drop-shadow, hover `translateY(-6px)`, `prefers-reduced-motion: reduce` guard) per D-03.
  - Whole-card `<a>` to `https://www.amazon.com/dp/1835460038` with `target="_blank"` + `rel="noopener noreferrer"` per D-11.
  - External-link arrow SVG path preserved (`M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14`) per D-14.
  - `.card-glow` + `.animate-on-scroll` utilities preserved per D-24, D-25.
  - All 4 i18n keys (`i.book.title`, `i.book.name`, `i.book.desc`, `i.book.cta`) still referenced.
- `src/i18n/en.json` and `src/i18n/ru.json` are byte-identical before and after this plan (`git diff --quiet` exits 0 on both).
- `src/data/social.ts` is byte-identical before and after this plan.
- Built HTML in both `dist/en/index.html` and `dist/ru/index.html`:
  - Contains `<section id="book">` with `bg-brand-accent-soft` and `border-brand-accent/30` classes.
  - Contains `<img src="/images/book-cover-3d.jpg" width="200" height="247" ...>`.
  - Contains the rating row with `★★★★★`, `4.8`, `·`, and `>Amazon<` span.
  - Contains the amber CTA span with `bg-brand-accent text-bg-base` classes.
  - Contains exactly 1 whole-card `<a>` with href `https://www.amazon.com/dp/1835460038`.
  - Does NOT contain `>PACKT<` or `>V. Vedmich<` HTML text labels (they are on the JPG).
  - Does NOT contain the CSS faux cover `linear-gradient(160deg, #134E4A, #0F172A)`.
- Built CSS (`dist/_astro/*.css`) contains:
  - `bg-brand-accent-soft` utility resolving to `#451A03`.
  - `grid-cols-[140px_1fr_auto]` arbitrary grid template.
  - `border-brand-accent/30` arbitrary-opacity amber border.
- Visual verification on live via playwright-cli at 1440×900 and 375×667 for both `/en/` and `/ru/` is deferred to post-commit per the user's established workflow (`.planning/STATE.md` §Notes) — NOT blocking this plan's acceptance. The user will run playwright-cli attached to real Chrome (per `$HOME/.claude/projects/-Users-viktor-Documents-GitHub-vedmich-vedmich-dev/memory/feedback_playwright.md` — `playwright-cli attach --extension` with `PLAYWRIGHT_MCP_EXTENSION_TOKEN`, not fresh browser) to confirm:
  (a) full-bleed amber band renders edge-to-edge (no horizontal-scroll overflow at either viewport),
  (b) 3-col desktop grid layout with cover left, text center, solid amber CTA right (1440×900),
  (c) mobile flex-col stack (cover top, text middle, CTA bottom) at 375×667,
  (d) rating row shows 5 amber stars + 4.8 + Amazon label with visual balance,
  (e) amber CTA button has sufficient contrast on amber-soft band (if washed out, fallback to ghost variant per D-13 Claude's Discretion),
  (f) hover on card shows `.card-glow` teal ring + shadow and `.book-cover` lifts 6px,
  (g) both EN and RU render identically structurally (only text content differs).
</verification>

<success_criteria>
- `src/components/Book.astro` is fully rewritten per reference `app.jsx:488-519` with the two user-locked deviations (real JPG cover per D-01, full-bleed amber band per D-04) and the one user-driven additive (Amazon rating row per D-15).
- All 25 decisions D-01 through D-25 from `06-CONTEXT.md` are implemented.
- REQ-005 acceptance is satisfied: `PACKT` label + `V. Vedmich` emboss visible (via the JPG asset that has them printed in-frame per D-01 rationale), book cover renders in 3D perspective (JPG is a 3D render), "Get on Amazon" CTA present as solid amber button, no regression to card behavior.
- Zero hardcoded hex in the Astro template body (existing rgba() values inside the `<style>` block are preserved per D-03; they are NOT new introductions). Zero deprecated cyan, zero DKT colors, zero AWS orange.
- No CSS faux cover markup, no extra PACKT/V.Vedmich HTML labels, no bg-surface/30, no max-w-6xl, no max-w-3xl, no sm:flex-row, no old ghost CTA classes, no half-star Unicode/CSS — all per locked decisions.
- i18n JSON files (`src/i18n/en.json`, `src/i18n/ru.json`) are byte-identical before and after this plan (no keys added, no values changed) per D-20, D-21, D-22.
- `src/data/social.ts` is untouched (no rating extraction to data layer) per D-17.
- No new files created (no `Stars.astro`, no `BookCover.astro`, no new tokens, no new assets) per D-23 and CONTEXT.md §out of scope.
- `npm run build` exits 0 with 7 pages.
- Both `dist/en/index.html` and `dist/ru/index.html` Book sections render the expected DOM shape: full-bleed amber band, JPG cover, rating row with `★★★★★ 4.8 · Amazon`, amber CTA span, whole-card Amazon anchor — structurally identical in both locales (only localized text in h2/h3/desc/cta differs).
- Built CSS contains the compiled `bg-brand-accent-soft`, `border-brand-accent/30`, and `grid-cols-[140px_1fr_auto]` utilities.
- Commit and visual verification on live are deferred to post-plan per the user's established workflow.
</success_criteria>

<output>
After completion, create `.planning/phases/06-book-packt-cover/06-01-SUMMARY.md` recording:
- Final `src/components/Book.astro` line count and shape (frontmatter ~11 lines with new `const rating = 4.8`, `<style>` block preserved 26 lines, section wrapper 1 line with amber band classes, inner container 1 line with `max-w-[1120px]`, h2 1 line, outer `animate-on-scroll` wrapper 1 line, whole-card `<a>` 5 lines across multi-line attrs, inner grid `<div>` 1 line, column 1 cover ~11 lines, column 2 text+rating+desc ~14 lines, column 3 amber CTA span ~7 lines, closing tags ~5 lines).
- Confirmation that the following were REMOVED from the file:
  - `bg-surface/30` section backdrop (D-06).
  - `max-w-6xl` inner container (D-04).
  - `max-w-3xl` card wrapper constraint (D-10).
  - `flex flex-col sm:flex-row gap-8 items-center sm:items-start` 2-col flex layout (D-08).
  - `mb-3` on h3 (D-15) and `mb-4` on desc `<p>` (D-08).
  - `flex-1` on text column (D-08).
  - Old ghost CTA classes `text-accent group-hover:text-accent-light` (D-13).
- Confirmation that the following NEW elements were ADDED:
  - `const rating = 4.8;` in frontmatter (D-17).
  - Full-bleed amber band classes `bg-brand-accent-soft border-y border-brand-accent/30` on section (D-04).
  - `max-w-[1120px]` inner container (D-04).
  - Responsive grid layout `flex flex-col gap-6 sm:grid sm:grid-cols-[140px_1fr_auto] sm:gap-7 sm:items-center` (D-08, D-09).
  - Rating row `<div>` with 5 filled amber stars, hardcoded `4.8`, `·` separator, `Amazon` label, ARIA annotations (D-15, D-16, D-17, D-19).
  - Solid amber CTA classes `bg-brand-accent text-bg-base hover:bg-brand-accent-hover px-5 py-2.5 rounded-lg` (D-13).
  - `shrink-0` on the CTA and `flex justify-center sm:justify-start` on the cover wrapper.
- Confirmation that the following were PRESERVED byte-identically:
  - The entire `<style>` block lines 14-39 of original Book.astro (drop-shadow, hover lift, prefers-reduced-motion guard) per D-03.
  - JPG cover `src="/images/book-cover-3d.jpg"` at `width="200" height="247" class="book-cover w-40 sm:w-48"` (D-01, D-02).
  - Whole-card `<a>` wrapping pattern to `https://www.amazon.com/dp/1835460038` with `target="_blank"` + `rel="noopener noreferrer"` (D-11).
  - External-link arrow SVG path `M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14` (D-14).
  - `.card-glow` + `.animate-on-scroll` utility references (D-24, D-25).
  - All 4 i18n key references (`i.book.title`, `i.book.name`, `i.book.desc`, `i.book.cta`) — zero i18n JSON edits (D-20, D-21, D-22).
- Build result: "7 pages, ~Xs" with exit code 0.
- Built HTML verification: both `dist/en/index.html` and `dist/ru/index.html` Book sections contain 1 JPG img + 1 rating row with `4.8` + 1 `★★★★★` + 1 `>Amazon<` span + 1 amber CTA span + 1 whole-card Amazon anchor + amber band classes on section; zero `>PACKT<` or `>V. Vedmich<` HTML text labels; zero CSS faux cover markup.
- Whether the executor used the default solid amber CTA (`bg-brand-accent text-bg-base`) or fell back to the ghost outline variant (`bg-bg border border-brand-accent text-brand-accent`) per D-13 Claude's Discretion. Default expectation: solid amber was used.
- Whether the executor chose `text-base` or `text-lg` for the star span font size per Claude's Discretion (default per D-15 specification is `text-base`).
- Whether the executor chose `text-sm` or `text-base` for the rating number font size per Claude's Discretion (default per D-15 specification is `text-sm`).
- Note for post-commit visual verify via playwright-cli (per `feedback_playwright.md` — attach to real Chrome with PLAYWRIGHT_MCP_EXTENSION_TOKEN, NOT fresh browser):
  - 1440×900 `/en/` and `/ru/`: full-bleed amber band edge-to-edge, 3-col grid layout (cover | text | CTA right-aligned), rating row visible, amber CTA button has sufficient contrast on amber-soft backdrop.
  - 375×667 `/en/` and `/ru/`: mobile flex-col stack (cover on top, text middle, CTA bottom, all vertically centered), amber band still edge-to-edge, NO horizontal scroll regression.
  - Card hover at 1440×900: `.card-glow` teal ring + box-shadow, `.book-cover` translates up 6px with extra drop-shadow.
  - If user reports the amber CTA reads washed out on the amber-soft band during verify, follow the D-13 fallback path to the ghost variant (`bg-bg border border-brand-accent text-brand-accent`).
- Note for Phase 7 (Speaking): the full-bleed-band pattern introduced here (`py-20 sm:py-28 bg-{color}-soft border-y border-{color}/30 + inner max-w-[1120px]`) is now a viable section-level accent. If the Phase 7 Speaking timeline needs visual differentiation, this is the established pattern. Keep amber band exclusive to Book for now (coherence with amber CTA).
- Note for deferred rating data-layer refactor: when a second consumer of rating data appears (e.g., testimonials on a future section, speaker rating on Speaking.astro), migrate `const rating = 4.8` → `src/data/social.ts export const book = { rating: 4.8, reviews: null, ... }` and extract `src/components/Stars.astro` accepting `value` prop per D-23 deferred note.
</output>
</content>
</invoke>