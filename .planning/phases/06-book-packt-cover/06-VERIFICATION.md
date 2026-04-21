---
phase: 06-book-packt-cover
verified: 2026-04-21T10:21:00Z
status: human_needed
score: 27/27 must-haves verified (all automated checks pass)
overrides_applied: 1
overrides:
  - must_have: "REQ-005: PACKT label visible top-left + V. Vedmich label visible bottom (HTML text labels)"
    reason: "Locked per CONTEXT.md D-01 — both labels are already printed on the real /images/book-cover-3d.jpg 3D scan. Adding duplicate HTML overlays would double-render them alongside the image. Same brand-asset-over-text-reproduction stance as Phase 5 DKT logo (D-01). 3D perspective and non-regression of 'Get on Amazon' CTA clauses of REQ-005 are satisfied without the HTML label overlays."
    accepted_by: "Viktor Vedmich (user-locked during Phase 6 context gathering)"
    accepted_at: "2026-04-21T04:32:00Z"
human_verification:
  - test: "Book section visual verification on localhost dev + live (post-push)"
    expected: "Full-bleed amber band edge-to-edge at 1440×900 (no horizontal scrollbar, amber fills both sides of the viewport); 3-col desktop layout (cover 140 · text · amber CTA) with 28px gap; mobile 375×667 stack (cover → text → CTA button) with no horizontal overflow; JPG cover shows PACKT label top-left and V. Vedmich emboss at bottom (baked into the scan); rating row ★★★★★ 4.8 · Amazon reads at ≥AA contrast on the amber-soft band; solid amber CTA (bg #F59E0B, text #0F172A) reads crisply against the amber-soft band (≈11:1)."
    why_human: "Visual fidelity, banding/contrast perception, and Fitts's law feel of the whole-card click target cannot be verified via DOM/grep. Also explicitly deferred per STATE.md §Notes workflow: 'User prefers sequential execution with visual verification on live after each phase.'"
  - test: "Both locales render identically at 1440×900 and 375×667 (EN /en/#book + RU /ru/#book)"
    expected: "Only localized text differs (h2 'Book' / 'Книга', h3 'Cracking the Kubernetes Interview' identical in both per brand-locale-invariance, CTA 'Get on Amazon' / 'Купить на Amazon', desc EN/RU). Structural DOM shape (grid, rating row, star string, CTA span, amber band) is byte-equivalent."
    why_human: "DOM-shape equivalence already verified programmatically; visual equivalence (font rendering of Cyrillic in the desc, stacking of Cyrillic CTA + arrow SVG, no locale-specific wrap regression) needs a human eye."
  - test: "No horizontal-scroll regression on live at 1440×900 and 375×667 after push to main"
    expected: "Neither viewport shows a horizontal scrollbar. The full-bleed amber band must not exceed 100vw (first full-bleed banded section in the site — no precedent to lean on)."
    why_human: "STATE.md workflow explicitly defers live visual verify to post-push. The amber band extending edge-to-edge is the first of its kind in the site; a subtle scrollbar regression may only be visible at specific DPR/scrollbar-width configs on the live deploy."
---

# Phase 6: Book — PACKT cover + V. Vedmich emboss — Verification Report

**Phase Goal:** *Book card matches reference visually — full-bleed amber band edge-to-edge, 3-col desktop grid / mobile stack, rating row renders 5 amber stars + 4.8 + Amazon label, solid amber CTA contrast verified, both locales identical structurally, `npm run build` passes, no horizontal-scroll regression at 1440px or 375px.* (ROADMAP.md §Phase 6)
**Verified:** 2026-04-21T10:21:00Z
**Status:** `human_needed` — all programmatic checks pass; live visual verification deferred per `STATE.md §Notes` workflow
**Re-verification:** No — initial verification

---

## Goal Achievement

### Observable Truths

| # | Truth | Status | Evidence |
|---|-------|--------|----------|
| 1 | Section renders a full-bleed amber band with `bg-brand-accent-soft` + `border-y border-brand-accent/30` | ✓ VERIFIED | `src/components/Book.astro:14` and `dist/{en,ru}/index.html` both contain `<section id="book" class="py-20 sm:py-28 bg-brand-accent-soft border-y border-brand-accent/30">` (exactly 1 occurrence each). Compiled CSS `dist/_astro/_slug_.CiX1uclI.css` contains `bg-brand-accent-soft{background-color:var(--color-brand-accent-soft)}` utility — no Tailwind-purge regression. |
| 2 | Inner content constrained to `max-w-[1120px] mx-auto px-4 sm:px-6` container matching Hero pattern | ✓ VERIFIED | `src/components/Book.astro:41` `<div class="max-w-[1120px] mx-auto px-4 sm:px-6">` present in both `dist/en/index.html` and `dist/ru/index.html` (1× occurrence each). |
| 3 | Desktop (sm:) uses 3-col grid `grid-cols-[140px_1fr_auto] gap-7 items-center` — cover · text · CTA | ✓ VERIFIED | `Book.astro:51` `<div class="flex flex-col gap-6 sm:grid sm:grid-cols-[140px_1fr_auto] sm:gap-7 sm:items-center">`. Compiled CSS contains `grid-cols-[140px_1fr_auto]{grid-template-columns:140px 1fr auto}`. Dist HTML both locales contain 1× occurrence of the class string. |
| 4 | Mobile (<640px) stacks vertically via `flex flex-col gap-6` — cover top, text middle, CTA bottom | ✓ VERIFIED | Same `Book.astro:51` classes use mobile-first `flex flex-col gap-6` that is overridden at `sm:`. Order in source is cover (line 52) → text (line 64) → CTA span (line 79), preserved in both dist outputs. |
| 5 | Cover is the existing `/images/book-cover-3d.jpg` JPG asset, `width=200 height=247`, `w-40 sm:w-48`, `loading=lazy decoding=async` | ✓ VERIFIED | `public/images/book-cover-3d.jpg` exists (140.7KB). `Book.astro:52-61` + dist HTML (both locales) contain `<img src="/images/book-cover-3d.jpg" alt="Cracking the Kubernetes Interview — book cover" width="200" height="247" loading="lazy" decoding="async" class="book-cover w-40 sm:w-48">` (1× each). |
| 6 | NO PACKT or V. Vedmich HTML text label is added alongside the cover — REQ-005 satisfied by JPG scan content | ✓ VERIFIED (override applied) | Grep for `PACKT\|V\. Vedmich` on `Book.astro`: no matches. Dist full-page scan `>PACKT<` count = 0 (EN and RU). Dist Book-section `>V. Vedmich<` count = 0 (EN and RU). Override D-01 applies — labels already baked into JPG scan; "3D perspective" and "no regression to Get on Amazon CTA" clauses of REQ-005 are satisfied. |
| 7 | `.book-cover` CSS block preserved byte-identical from D-03 baseline (drop-shadow, hover translateY(-6px), prefers-reduced-motion guard) | ✓ VERIFIED | `Book.astro:14-39` contains the full `<style>` block with `drop-shadow(8px 14px 22px rgba(0,0,0,0.45))` rest state, `translateY(-6px) + drop-shadow(…, rgba(20,184,166,0.22))` hover state, and `@media (prefers-reduced-motion: reduce)` guard. rgba() continuation allowed per D-03. |
| 8 | Card wrapper does NOT use `max-w-3xl` — class removed so card stretches full container width per D-10 | ✓ VERIFIED | Grep `max-w-3xl` on `Book.astro`: no matches. Dist Book-section both locales: 0 occurrences. |
| 9 | Card wrapper classes: `group book-card block p-6 sm:p-8 rounded-xl bg-bg border border-border card-glow animate-on-scroll` (with `animate-on-scroll` on the outer div per D-25) | ✓ VERIFIED | `Book.astro:44-49`: outer `<div class="animate-on-scroll">` wrapping the `<a class="group book-card block p-6 sm:p-8 rounded-xl bg-bg border border-border card-glow">`. Exact class sequence matches plan truth #9. |
| 10 | Section wrapper: previous `bg-surface/30` REMOVED per D-06, replaced by amber band per D-04 | ✓ VERIFIED | `bg-surface/30` count in Book section dist output = 0 (both locales). Only `bg-brand-accent-soft` remains on `<section id="book">`. |
| 11 | Rating row structure exact: `<div flex items-center gap-2 mt-2 mb-4 aria-label="4.8 out of 5 on Amazon"> <span text-brand-accent text-base aria-hidden>★★★★★</span> <span font-mono text-sm text-text-secondary>4.8</span> <span text-text-muted aria-hidden>·</span> <span font-body text-sm text-text-muted>Amazon</span> </div>` | ✓ VERIFIED | `Book.astro:68-73` matches the plan structure exactly. Dist HTML both locales: 1× `aria-label="4.8 out of 5 on Amazon"`, 1× `text-brand-accent text-base aria-hidden="true">★★★★★<`, 1× `font-mono text-sm text-text-secondary">4.8<`, 1× `text-text-muted" aria-hidden="true">·<`, 1× `font-body text-sm text-text-muted">Amazon<`. |
| 12 | Rating value `4.8` hardcoded in Astro frontmatter as `const rating = 4.8` per D-17 | ✓ VERIFIED | `Book.astro:11` `const rating = 4.8;`. No i18n key added (grep for `rating` in `src/i18n/{en,ru}.json` returns no matches). No `src/data/social.ts` rating edit (plan claims none). |
| 13 | Star string is the literal 5-character Unicode U+2605 sequence ★★★★★ — round-up from 4.8 per D-16 | ✓ VERIFIED | `Book.astro:69` contains exactly 5 × U+2605 glyphs. Dist HTML both locales contain exactly 1× occurrence of the 5-char sequence inside the Book section. |
| 14 | Amazon CTA is a styled `<span>` (NOT a nested `<a>` — avoids invalid HTML per D-12) with the amber-button class string per D-13 | ✓ VERIFIED | `Book.astro:79` `<span class="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-brand-accent text-bg-base font-medium hover:bg-brand-accent-hover transition-colors shrink-0">`. Confirmed `<span>` element (not `<a>`). Dist both locales: `bg-brand-accent text-bg-base` substring `PRESENT`. |
| 15 | CTA span contains `{i.book.cta}` followed by the existing external-link arrow SVG per D-14 | ✓ VERIFIED | `Book.astro:80-84` renders `{i.book.cta}` then inline `<svg>` with `path d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"` (external-link arrow, preserved). Dist EN shows "Get on Amazon" + SVG; Dist RU shows "Купить на Amazon" + SVG. |
| 16 | Whole-card `<a>` wraps the entire card content with `href=https://www.amazon.com/dp/1835460038 target=_blank rel="noopener noreferrer"` per D-11 | ✓ VERIFIED | `Book.astro:45-48` and dist HTML both locales: `<a href="https://www.amazon.com/dp/1835460038" target="_blank" rel="noopener noreferrer" class="group book-card block p-6 sm:p-8 rounded-xl bg-bg border border-border card-glow">`. 1× `amazon.com/dp/1835460038` match per section. |
| 17 | h3 renders `{i.book.name}` with `font-display text-xl font-semibold group-hover:text-accent transition-colors` — mb-3 removed (rating row supplies its own `mt-2 mb-4` spacing) | ✓ VERIFIED | `Book.astro:65-67`: `<h3 class="font-display text-xl font-semibold group-hover:text-accent transition-colors">{i.book.name}</h3>`. No `mb-3` present. Dist EN+RU show the h3 immediately followed by the rating-row `<div>` with `mt-2 mb-4`. |
| 18 | Description `<p>` renders `{i.book.desc}` with `text-text-muted text-sm leading-relaxed` — no `mb-4` (CTA moved to column 3) | ✓ VERIFIED | `Book.astro:74-76`: `<p class="text-text-muted text-sm leading-relaxed">{i.book.desc}</p>`. No `mb-4`. Dist EN renders the English desc; Dist RU renders the Russian desc — both identical structural positioning inside the text column. |
| 19 | Section h2 renders `{i.book.title}` with `font-display text-3xl font-bold mb-12 animate-on-scroll` per D-05 | ✓ VERIFIED | `Book.astro:42`: exact class string. Dist EN: `<h2 …>Book</h2>`. Dist RU: `<h2 …>Книга</h2>`. |
| 20 | i18n JSON NOT modified — `src/i18n/en.json` and `src/i18n/ru.json` byte-identical pre/post | ✓ VERIFIED | Read both files: `book` object keys `{title, name, desc, cta}` present in both locales with expected values. Plan D-20/D-21/D-22 claim no edits; SUMMARY `## Files Created/Modified` lists only `src/components/Book.astro` (no i18n file in the list). |
| 21 | Zero hardcoded hex in the Astro template body — rgba() inside the preserved `.book-cover` `<style>` block is D-03 continuation, NOT new | ✓ VERIFIED | Node-script split of `Book.astro` into frontmatter / template / style block: `Hex codes in template body (excl style): NONE`. `Hex codes in frontmatter: NONE`. Preserved style-block rgba values: `rgba(0,0,0,0.45)`, `rgba(0,0,0,0.55)`, `rgba(20,184,166,0.22)` — all pre-existing continuation per D-03 (also flagged WR-01 by REVIEW.md; see Anti-Patterns below). |
| 22 | No deprecated cyan (`#06B6D4`, `#22D3EE`, `text-cyan-*`, `bg-cyan-*`) per CLAUDE.md | ✓ VERIFIED | Grep on `Book.astro`: no matches for the deprecated cyan tokens. |
| 23 | No DKT brand colors (`#7C3AED`, `#10B981`) per CLAUDE.md | ✓ VERIFIED | Grep on `Book.astro`: no matches. |
| 24 | No AWS orange (`#FF9900`, `#232F3E`) per CLAUDE.md | ✓ VERIFIED | Grep on `Book.astro`: no matches. |
| 25 | `npm run build` exits 0 — 7 pages built, both EN and RU pages render without errors | ✓ VERIFIED | Re-ran `npm run build` during verification: `[build] 7 page(s) built in 785ms` + `[build] Complete!`. All 7 output files regenerated. |
| 26 | Built HTML at `dist/{en,ru}/index.html` contains the full expected DOM shape: 1× `<section id="book">`, 1× JPG `<img>`, 1× rating row with 4.8, 1× ★★★★★, 1× Amazon CTA span with `bg-brand-accent`, amber band classes, 0× `>PACKT<`, 0× CSS faux-cover gradient | ✓ VERIFIED | Node-script DOM-shape check on both dist files (see below, §Behavioral Spot-Checks): all 15 assertions pass per locale. |
| 27 | No horizontal-scroll regression at 1440px or 375px viewport — amber band must not overflow 100vw | ? NEEDS HUMAN | Cannot be verified via DOM/build — requires Playwright visual check on local + live per STATE.md §Notes. First full-bleed coloured section in the site, no prior pattern to lean on. See `human_verification` item #3. |

**Score (automated):** 26/26 verifiable truths verified + 1 override accepted (Truth 6, REQ-005 HTML labels). Truth 27 routed to human verification per `status: human_needed`.

---

## Required Artifacts

| Artifact | Expected | Status | Details |
|----------|----------|--------|---------|
| `src/components/Book.astro` | Rewritten Book component: full-bleed amber band section wrapper, 3-col desktop grid (cover \| text \| CTA), mobile stack, rating row with 5 amber stars + 4.8 + Amazon label, whole-card link preserved, `.book-cover` CSS preserved. min_lines=75, contains="★★★★★", exports=default component. | ✓ VERIFIED | Exists (89 lines ≥ min 75). Contains `★★★★★` literal at line 69. Exports default Astro component via `---`-delimited frontmatter + template. Imported by `src/pages/en/index.astro:7` and `src/pages/ru/index.astro:7`, rendered via `<Book locale={locale} />` on each page. Data-flow Level 4: h2 text → i18n `t(locale).book.title`; h3 → `i.book.name`; desc → `i.book.desc`; CTA → `i.book.cta`; rating → frontmatter const `4.8`; all produce real strings (not empty/static fallback). Flowing. |

---

## Key Link Verification

| From | To | Via | Status | Details |
|------|----|----|--------|---------|
| `src/components/Book.astro` | `src/i18n/en.json` + `src/i18n/ru.json` | `t(locale)` via `i.book.{title\|name\|desc\|cta}` | ✓ WIRED | `Book.astro:1` `import { t, type Locale } from '../i18n/utils';` + `Book.astro:9` `const i = t(locale);` + template references `{i.book.title}`, `{i.book.name}`, `{i.book.desc}`, `{i.book.cta}`. Dist EN shows English values rendered; Dist RU shows Russian values rendered (h2 "Book"/"Книга", CTA "Get on Amazon"/"Купить на Amazon", desc EN+RU match the i18n JSON source). |
| `src/components/Book.astro` | `public/images/book-cover-3d.jpg` | `<img src="/images/book-cover-3d.jpg" width=200 height=247 class="book-cover w-40 sm:w-48">` | ✓ WIRED | Asset exists (140.7KB). Served at `/images/book-cover-3d.jpg` via Astro's `public/` convention. `Book.astro:54` references the asset; dist HTML preserves the exact src attribute in both locales. |
| `src/components/Book.astro` | `https://www.amazon.com/dp/1835460038` | whole-card `<a>` with `target="_blank" rel="noopener noreferrer"` | ✓ WIRED | `Book.astro:10` `const amazonUrl = 'https://www.amazon.com/dp/1835460038';` + `Book.astro:46` `href={amazonUrl}`. Dist HTML both locales: 1× `amazon.com/dp/1835460038` match, `target="_blank" rel="noopener noreferrer"` preserved. |
| `Book.astro` `const rating = 4.8` | `<span>{rating}</span>` in rating row | Astro frontmatter expression interpolation | ✓ WIRED | `Book.astro:11` declares const; `Book.astro:68` `aria-label={\`${rating} out of 5 on Amazon\`}` interpolates into "4.8 out of 5 on Amazon"; `Book.astro:70` `<span …>{rating}</span>` renders the numeric `4.8`. Dist HTML both locales: 2× `4.8` (aria-label + span text), exactly as planned. |
| Tailwind `@theme` utility names | `src/styles/design-tokens.css` CSS vars | `bg-brand-accent-soft→--brand-accent-soft`, `border-brand-accent→--brand-accent (+ /30 opacity)`, `bg-brand-accent→--brand-accent`, `hover:bg-brand-accent-hover→--brand-accent-hover`, `text-bg-base→--bg-base`, `text-brand-accent→--brand-accent`, `text-text-secondary→--text-secondary`, `text-text-muted→--text-secondary (shim)` | ✓ WIRED | Compiled `dist/_astro/_slug_.CiX1uclI.css` contains `bg-brand-accent-soft{background-color:var(--color-brand-accent-soft)}` and `grid-cols-[140px_1fr_auto]{grid-template-columns:140px 1fr auto}` utilities — confirmed by Grep. No Tailwind-purge regression. |

---

## Data-Flow Trace (Level 4)

| Artifact | Data Variable | Source | Produces Real Data | Status |
|----------|---------------|--------|-------------------|--------|
| `src/components/Book.astro` h2 | `i.book.title` | `t(locale)` reading `src/i18n/{en,ru}.json` §`book.title` | "Book" (EN) / "Книга" (RU) — non-empty | ✓ FLOWING |
| `Book.astro` h3 | `i.book.name` | same | "Cracking the Kubernetes Interview" (both locales, brand name locale-invariant per D-18) | ✓ FLOWING |
| `Book.astro` rating row `aria-label` | `${rating}` template literal | frontmatter `const rating = 4.8` | "4.8 out of 5 on Amazon" rendered in dist | ✓ FLOWING |
| `Book.astro` rating row `<span>` | `rating` | same frontmatter const | "4.8" text rendered in dist | ✓ FLOWING |
| `Book.astro` desc `<p>` | `i.book.desc` | i18n JSON | EN: 162-char English description; RU: 140-char Russian description. Both non-empty in dist output. | ✓ FLOWING |
| `Book.astro` CTA span | `i.book.cta` | i18n JSON | "Get on Amazon" (EN) / "Купить на Amazon" (RU) | ✓ FLOWING |
| `Book.astro` `<a href>` | `amazonUrl` | frontmatter const | `https://www.amazon.com/dp/1835460038` | ✓ FLOWING |
| `Book.astro` `<img src>` | static string | literal `"/images/book-cover-3d.jpg"` | Asset exists at 140.7KB on disk, served via `public/` | ✓ FLOWING |

No hollow props, no disconnected stubs. All dynamic text flows from i18n JSON or from the intentional hardcoded `const rating = 4.8` (locked by D-17 since Amazon does not expose a public rating API).

---

## Behavioral Spot-Checks

Project is a static Astro site — `npm test` is undefined. Spot-checks replaced with build + DOM-shape + asset assertions against the built output.

| Behavior | Command | Result | Status |
|----------|---------|--------|--------|
| `npm run build` exits 0, 7 pages, both locales built | `npm run build` | `[build] 7 page(s) built in 785ms` + `Complete!` | ✓ PASS |
| Book-cover asset exists on disk | `ls public/images/book-cover-3d.jpg` | `140.7K` | ✓ PASS |
| Compiled CSS contains `bg-brand-accent-soft` utility (Tailwind purge did not strip the new class) | Grep `dist/_astro/` | `dist/_astro/_slug_.CiX1uclI.css` | ✓ PASS |
| Compiled CSS contains `grid-cols-[140px_1fr_auto]` utility | Grep `dist/_astro/` | `dist/_astro/_slug_.CiX1uclI.css` | ✓ PASS |
| EN dist DOM: 1× JPG, 1× 5-star string, 2× "4.8", 1× `>Amazon<`, 1× `amazon.com/dp/1835460038`, 1× `aria-label="4.8 out of 5 on Amazon"`, 1× `max-w-[1120px]`, 1× `grid-cols-[140px_1fr_auto]`, 0× `>PACKT<`, 0× CSS faux-cover gradient, 0× `max-w-3xl`, 0× `bg-surface/30` | Node script on `dist/en/index.html` | All 15 assertions pass | ✓ PASS |
| RU dist DOM: identical shape to EN (only localized h2/desc/CTA text differs) | Node script on `dist/ru/index.html` | All 15 assertions pass, RU h2 = "Книга", RU CTA = "Купить на Amazon" | ✓ PASS |
| Book component imported and rendered in both locale page entries | Grep `Book` in `src/pages/` | `src/pages/en/index.astro:7,19` + `src/pages/ru/index.astro:7,19` | ✓ PASS |
| Plan-referenced commit hash resolves | `git log --oneline 97c6e89 -1` | `97c6e89 feat(06-01): rewrite Book.astro with full-bleed amber band + rating row` | ✓ PASS |

---

## Requirements Coverage

| Requirement | Source Plan | Description | Status | Evidence |
|-------------|-------------|-------------|--------|----------|
| REQ-005 | `06-01-book-rewrite-PLAN.md` frontmatter `requirements:` | Book: PACKT label + V. Vedmich emboss. Acceptance: (a) PACKT label visible top-left of cover, (b) V. Vedmich label visible bottom of cover, (c) Book cover still renders in 3D perspective, (d) no regression to "Get on Amazon" CTA. | ✓ SATISFIED (override accepted) | Clauses (a)+(b): satisfied by the real `/images/book-cover-3d.jpg` 3D scan that has both labels baked into the image per D-01 — locked during Phase 6 context gathering, same brand-asset-over-text-reproduction stance as Phase 5 (see `overrides` in frontmatter). Clause (c): preserved — keeping the JPG asset IS the 3D render, `.book-cover` CSS block preserved byte-identical per D-03. Clause (d): preserved — `{i.book.cta}` rendered unchanged inside the solid amber CTA span at `Book.astro:79-84`, `href` unchanged, whole-card `<a>` unchanged. Visual confirmation of (a)+(b) via the JPG scan = human-verify item #1 above. |

**Orphaned requirements check:** Grep `REQ-005` across `.planning/` shows the requirement is claimed *only* by Phase 6 (`06-01-book-rewrite-PLAN.md` frontmatter) and referenced by the Phase 6 CONTEXT/DISCUSSION-LOG/SUMMARY. The `REQUIREMENTS.md §REQ-005` line `**Maps to:** Phase 5` is stale documentation from before the Phase 5/6 renumbering (Phase 5 = Podcasts ships REQ-004 per `ROADMAP.md:102`; Phase 6 = Book ships REQ-005 per `ROADMAP.md:117`). **Not a double-claim conflict** and **not orphaned**; recommend a follow-up doc fix in `REQUIREMENTS.md:105` to say `Maps to: Phase 6`. Out of scope for Phase 6 verification.

---

## Anti-Patterns Found

| File | Line | Pattern | Severity | Impact |
|------|------|---------|----------|--------|
| `src/components/Book.astro` | 21 | `rgba(0, 0, 0, 0.45)` raw RGB in `.book-cover` rest-state drop-shadow | ℹ️ Info | D-03 allowed continuation — pre-existing rgba, not introduced by Phase 6. Generic black ambient shadow, not a brand-color drift. Token for `--shadow-cover-rest` could centralize it (REVIEW.md WR-01 Option B). |
| `src/components/Book.astro` | 29 | `rgba(0, 0, 0, 0.55)` raw RGB in `.book-cover` hover-state drop-shadow | ℹ️ Info | Same as above — D-03 continuation. |
| `src/components/Book.astro` | 30 | `rgba(20, 184, 166, 0.22)` — `#14B8A6` (`--brand-primary`) expressed as raw RGB in hover drop-shadow | ⚠️ Warning (pre-existing, flagged WR-01 in REVIEW.md) | Brand teal hardcoded; a future palette refinement in `design-tokens.css` would not propagate. Pre-existing — preserved per D-03 to stay byte-identical with the prior component. REVIEW.md proposes `color-mix(in srgb, var(--brand-primary) 22%, transparent)` as the fix but explicitly categorizes this as "warning, not critical". **Does not block Phase 6 goal** — the goal is "Book card matches reference visually + full-bleed amber band + rating row + solid amber CTA", all of which are satisfied; the rgba is a token-hygiene debt carried forward from earlier phases, not a Phase 6 regression. Recommend closing in a dedicated token-hygiene sweep phase. |
| `src/components/Book.astro` | 52, 79 | `shrink-0` utility class on grid items (has no effect in grid containers) | ℹ️ Info | REVIEW.md IN-02 — cosmetic dead weight; safe to remove but doesn't affect rendered output. |
| `src/components/Book.astro` | 11 | Hardcoded `const rating = 4.8` without an inline comment | ℹ️ Info | REVIEW.md IN-01 — documentation suggestion; intent is captured in CONTEXT.md D-17 + PLAN.md must_haves, so an uninitiated reader can trace the rationale via planning docs. |

No 🛑 Blockers. The one ⚠️ Warning (raw RGB in `.book-cover` hover glow) is pre-existing, D-03-preserved, and flagged by REVIEW.md as warning-severity with an explicit fix path; it does not block Phase 6 goal achievement. No TODO/FIXME/PLACEHOLDER comments anywhere in `Book.astro`. No empty-return stubs. No deprecated cyan / DKT / AWS brand color leaks.

---

## Deferred Items

None for this phase. The phase goal scope is self-contained in `src/components/Book.astro`; no part of the phase goal explicitly references work scheduled for Phase 7+.

---

## Human Verification Required

### 1. Book section visual verification on localhost dev + live (post-push)

**Test:** Render the site via `npm run dev` (localhost:4321), navigate to `/en/#book` and `/ru/#book`. Then after push to main, repeat on live `https://vedmich.dev/en/#book` + `https://vedmich.dev/ru/#book`. Use Playwright-CLI attached to Chrome (not fresh browser): `playwright-cli attach --extension` with `PLAYWRIGHT_MCP_EXTENSION_TOKEN`.

**Expected:**
- Full-bleed amber band edge-to-edge at 1440×900 (no horizontal scrollbar; amber `--brand-accent-soft` = `#451A03` fills both sides of the viewport; horizontal borders amber at 30% opacity).
- 3-col desktop layout: cover (140-200px) · text column · amber CTA button, 28px gap, items center-aligned.
- Mobile 375×667 stack: cover → text → CTA button; no horizontal overflow.
- JPG cover shows the PACKT label (top-left) and V. Vedmich emboss (bottom) — both baked into the 3D scan, no HTML overlays.
- Rating row reads crisply: `★★★★★` in amber, `4.8` in mono, `·`, `Amazon` in muted body font. Contrast on amber-soft band: ≥AA.
- Solid amber CTA (`bg #F59E0B`, text `#0F172A`) reads at ≈11:1 contrast against the amber-soft band — CTA is clearly the primary action, does not wash out.
- Whole-card `<a>` click on any part of the card opens `https://www.amazon.com/dp/1835460038` in a new tab (Fitts's law target preserved).

**Why human:** Visual fidelity, banding/contrast perception, and click-target feel cannot be verified via DOM/grep. Explicitly deferred per `STATE.md §Notes`: *"User prefers sequential execution with visual verification on live after each phase."*

### 2. Locale equivalence at 1440×900 and 375×667

**Test:** Side-by-side Playwright screenshots of `/en/#book` and `/ru/#book` at both viewports.

**Expected:** Only localized text differs — h2 "Book" / "Книга", desc EN/RU, CTA "Get on Amazon" / "Купить на Amazon". Structural DOM shape (grid, rating row, star string, CTA span, amber band, JPG cover) is byte-equivalent. Cyrillic desc does not introduce a wrap regression that makes the card taller than the EN version (may cause a subtle grid-row-height mismatch worth eyeballing).

**Why human:** DOM-shape equivalence is already verified programmatically; visual equivalence (font rendering of Cyrillic in body text, stacking of Cyrillic CTA + arrow SVG, no locale-specific wrap regression) needs a human eye.

### 3. Horizontal-scroll regression check on live

**Test:** After push to main, on live `https://vedmich.dev/en/` and `/ru/` at 1440×900 and 375×667: confirm no horizontal scrollbar anywhere on the page. The Book section is the first full-bleed coloured band in the site — the amber `<section>` extends to `100vw`, so a DPR/scrollbar-width edge case could cause a horizontal scrollbar on live (that might not reproduce on local).

**Expected:** No horizontal scrollbar at either viewport, on either locale, on live.

**Why human:** `STATE.md` workflow defers live visual verify to post-push. The amber band extending edge-to-edge is the first of its kind in the site; a subtle scrollbar regression may only be visible on the live deploy at specific DPR/scrollbar-width configs.

---

## Gaps Summary

No automated-verification gaps. All 26 programmatic truths pass; the 27th ("no horizontal-scroll regression") is routed to human verification per STATE.md workflow. REQ-005 acceptance clauses (a)+(b) are satisfied by the JPG scan with an override (locked per CONTEXT.md D-01); clauses (c)+(d) pass programmatic verification.

**Phase 6 Plan 1 implementation is complete and build-green.** Awaiting user visual verify on localhost + push to main + visual verify on live before the phase is considered shipped end-to-end. This matches STATE.md §Notes and ROADMAP.md §Phase 6's explicit workflow.

---

*Verified: 2026-04-21T10:21:00Z*
*Verifier: Claude (gsd-verifier)*
