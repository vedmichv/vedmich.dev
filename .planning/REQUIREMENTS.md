# REQUIREMENTS.md — v0.4 Reference Design Audit

**Milestone:** v0.4
**Target:** Close 8-section visual gap between live vedmich.dev and reference UI kit.
**Reference:** `/Users/viktor/Downloads/vedmich.html` → `ref-content.json` + `reference-1440-full.png`

---

## REQ-001 — Header: search pill + EN·RU locale switcher

**Type:** Component rewrite
**Priority:** P0
**Maps to:** Phase 1

The header MUST show a search-style pill between nav links and locale switcher:
- Visual: `⌕ Search…` label + `⌘K` keyboard-hint badge
- Behavior: non-functional trigger (opens nothing — visual placeholder only in v0.4)
- Style: `bg-bg-elevated` or `border-border` pill, text `text-text-muted`, kbd badge in `bg-bg-base`

The locale switcher MUST use `EN · RU` dot-separator style:
- Active locale: bold `text-text-primary`
- Other locale: dimmed `text-text-muted`, clickable, navigates to mirror route
- Dot `·` between: subtle `text-border-strong`

**Acceptance:**
- Search pill visible on `/en/` + `/ru/` at 1440px and 375px viewports
- Locale switcher shows `EN · RU` on both sides; active highlighted
- No console errors; no regression to mobile menu
- `npm run build` passes

---

## REQ-002 — Blog: 3 published posts

**Type:** Content additions
**Priority:** P0
**Maps to:** Phase 2

The homepage BlogPreview MUST show 3 posts matching the reference. Each post exists in BOTH `src/content/blog/en/` and `src/content/blog/ru/`.

**Posts to add:**
1. `2026-03-20-karpenter-right-sizing.md` — title "Karpenter in production: right-sizing at scale", tags `[kubernetes, aws, karpenter]`
2. `2026-03-02-mcp-servers-plainly-explained.md` — title "MCP servers, plainly explained", tags `[ai, mcp, agents]`
3. `2026-02-10-why-i-write-kubernetes-manifests-by-hand.md` — title "Why I still write Kubernetes manifests by hand", tags `[kubernetes, opinion]`

Each post: 300–600 words, draft: false, uses proper frontmatter schema, valid prose-invert rendering.

**Acceptance:**
- 6 new files created (3 EN + 3 RU)
- Homepage blog section shows 3 cards with dates, tags, excerpts
- `/en/blog/<slug>` and `/ru/blog/<slug>` render correctly
- All posts sourced from Obsidian vault where possible (via QMD)

---

## REQ-003 — Speaking: arrow-prefixed talks + inline city

**Type:** Component + layout update
**Priority:** P1
**Maps to:** Phase 3

Each speaking event MUST render in the reference format:
```
<Event name>  <City dimmed>
  → <Talk title 1>
  → <Talk title 2>
```

- Event + city on one line, city dimmed `text-text-muted`
- Talks listed below each with leading `→` arrow (teal `text-brand-primary`)
- Vertical timeline by year preserved

**Acceptance:**
- Each talk line starts with `→` arrow in teal
- City appears inline after event name, visually dimmed
- Year groupings preserved (2026, 2025, 2024, 2023)
- Both locales render (EN + RU)

---

## REQ-004 — Podcasts: monogram badges (DKT teal, AWS RU amber)

**Type:** Component update
**Priority:** P1
**Maps to:** Phase 4

Each podcast card MUST show a uppercase monogram badge in place of the music-note icon:
- DKT card: `DKT` monogram, teal style (`bg-brand-primary-soft`, `border-brand-primary`, `text-brand-primary-hover`)
- AWS RU card: `AWS RU` monogram, amber style (`bg-brand-accent-soft`, `border-brand-accent`, `text-brand-accent-hover`)

Badge is text, not an SVG icon. Size matches reference (~small uppercase, tracking-wider).

**Acceptance:**
- No music-note SVG remains in Podcasts.astro
- DKT badge teal, AWS RU badge amber
- Badges sit top-left of each card, above title
- Both locales render identically (monograms are text, not localized)

---

## REQ-005 — Book: PACKT label + V. Vedmich emboss

**Type:** Component visual update
**Priority:** P2
**Maps to:** Phase 5

The 3D book cover MUST show:
- `PACKT` publisher label, small, top-left of cover (teal or amber, matching ref)
- `V. Vedmich` author emboss, small, bottom of cover (dimmed)

Both labels are text overlaid on the CSS-rendered book cover. Must remain readable at all viewport widths.

**Acceptance:**
- `PACKT` label visible top-left of cover
- `V. Vedmich` label visible bottom of cover
- Book cover still renders in 3D perspective
- No regression to "Get on Amazon" CTA

---

## REQ-006 — Contact: single-letter badges + Write-me-a-message CTA

**Type:** Component rewrite
**Priority:** P1
**Maps to:** Phase 6

Contact section MUST show 5 social platforms as large single-letter square badges in a grid:
- L (LinkedIn), G (GitHub), Y (YouTube), 𝕏 (X/Twitter), T (Telegram)
- Each badge: square, large letter centered, platform name below
- Badge style: `bg-bg-elevated` or `bg-bg-surface`, `border-border`, hover elevate
- Below grid: prominent "Write me a message" / "Напишите мне" CTA button (primary teal)

**Acceptance:**
- 5 square badges in grid, each with single letter + platform name
- "Write me a message" CTA visible and styled as primary button
- `i18n` keys added: `contact.write_me_cta`
- Both locales render correctly
- Existing social URLs preserved (mailto for Write-me-a-message → `mailto:viktor@vedmich.dev` or similar)

---

## REQ-007 — Logo + favicon: brand kit refresh

**Type:** Asset swap
**Priority:** P1
**Maps to:** Phase 7

The canonical brand SVGs in Viktor's Obsidian vault MUST be copied to the site:
- `~/Documents/ViktorVedmich/40-Content/45-Personal-Brand/45.20-Brand-Kit/logo/exports/vv-logo.svg` → `public/vv-logo-primary.svg`
- `~/.../vv-logo-inverse.svg` → `public/vv-logo-inverse.svg`
- `~/.../vv-favicon.svg` → `public/favicon.svg`
- Same files also copied to `.design-handoff/deep-signal-design-system/project/assets/`

Component references in `Header.astro`, `BaseLayout.astro`, `Footer.astro` verified. Favicon cache invalidation via GH Pages natural refresh.

**Acceptance:**
- 3 canonical SVG files swapped in `public/` + `.design-handoff/`
- Browser tab favicon refreshed (hard-reload, no visible corruption)
- Header logo renders from new primary SVG
- `npm run build` passes

---

## REQ-008 — About: drop duplicate cert cards

**Type:** Content removal
**Priority:** P2
**Maps to:** Phase 8

The About section MUST NOT duplicate certification cards that now live in Hero. Keep the bio and skill pills; remove the cert card block.

**Acceptance:**
- About section no longer shows CNCF Kubernaut / CKA / CKS / CKAD / KCNA / KCSA cert cards
- Bio text preserved
- Skill pills preserved (AWS Cloud, Kubernetes, AI Engineering, etc.)
- Both locales render identically

---

## REQ-011 — Hero: reposition as primary pitch with 4-pill authority strip

**Type:** Component rewrite
**Priority:** P0
**Maps to:** Phase 4

The Hero section MUST reframe as the site's primary pitch with a compact authority strip of 4 pills that cover speaker credibility, CNCF achievement, author credibility, and podcast host status:

1. `re:Invent & Keynote Speaker` → scrolls to `#speaking`
2. `CNCF Kubestronaut` (teal-active, external link) → https://www.cncf.io/training/kubestronaut/
3. `Author «Cracking the Kubernetes Interview»` → scrolls to `#book`
4. `Host · DKT + AWS RU` → scrolls to `#podcasts`

The 6 cert pills that currently render from `src/data/social.ts certifications` (CNCF Kubestronaut + CKA/CKS/CKAD/KCNA/KCSA) MUST be replaced in the Hero — "Kubestronaut" already implies the 5 underlying certs. The About section does not render cert cards either (Phase 3). Pill labels are locale-invariant (brand/credential names, stay English in both EN and RU).

**Acceptance:**
- Hero contains exactly 4 `<a>` elements with class string containing `inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-[13px] font-medium`.
- Each pill has the correct href, and the Kubestronaut pill has `target="_blank"`, `rel="noopener"`, and `aria-label="CNCF Kubestronaut program (opens in new tab)"`.
- No `CKA|CKS|CKAD|KCNA|KCSA` strings appear inside the Hero section in the built HTML.
- 4-pill row renders on one line at 1440px (no wrap) — verified via Playwright computed width.
- Both EN (`dist/en/index.html`) and RU (`dist/ru/index.html`) render identically.
- Scrolling through `#about`, `#book`, `#podcasts`, `#speaking` causes the corresponding nav link to gain `.is-active` (teal underline) — D-09 observer.

---

## REQ-013 — Hero: typography matches reference exactly

**Type:** Component visual fidelity
**Priority:** P0
**Maps to:** Phase 4

The Hero h1 computed styles MUST match the reference UI kit (`app.jsx:363`):

- `font-family` resolves to Space Grotesk
- `font-size: 64px` at viewports ≥800px, scaled via `clamp(40px, 8vw, 64px)` for narrower viewports
- `font-weight: 700`
- `letter-spacing: -0.03em` (`-1.92px` computed at 64px)
- `line-height: 1.05` (`67.2px` computed at 64px)
- `color: var(--text-primary)` (`#E2E8F0`)

Role line MUST be mono amber 18px (`font-mono text-warm text-lg`).
Background MUST be flat 160deg gradient via `--grad-hero-flat` token (not `--grad-hero-soft` radial blobs).
Container MUST be `max-w-[1120px]`. Section padding MUST be `pt-24 pb-16 px-6` (96/64/24).
Greeting structure MUST be two separate blocks (terminal prompt 14px teal + "Hi, I'm" 16px mute mono), not a single flex row.
Cursor MUST be an inline `<span>_</span>` with `cursor-blink` CSS animation, not the old `.typing-cursor` pseudo-element.

**Acceptance:**
- h1 computed style at 1440×900: fontSize = 64px, fontWeight = 700, letterSpacing = -1.92px, lineHeight = 67.2px, fontFamily matches `/Space Grotesk/`.
- h1 computed fontSize at 375×667: 40px (clamp floor hit).
- `grep -q 'text-\[clamp(40px,8vw,64px)\]' src/components/Hero.astro` exits 0.
- `grep -q 'grad-hero-flat' src/styles/design-tokens.css` exits 0 (token declared).
- `grep -q 'var(--grad-hero-flat)' src/components/Hero.astro` exits 0 (token consumed).
- No `typing-cursor` class in `src/` or `dist/_astro/*.css`.
- No hardcoded hex codes in Hero.astro.

---

## REQ-010 — Presentations: match card format + portfolio migration ✅

**Type:** Component rewrite + Content Collection migration
**Priority:** P1
**Maps to:** Phase 8
**Status:** Validated 2026-04-24 — 10/10 must-haves verified in `08-VERIFICATION.md`

The Presentations homepage section MUST match reference `app.jsx:522-551` visual format AND the underlying data MUST live in an Astro Content Collection (mirror Phase 7 Speaking pattern):

- Homepage section: `bg-surface` (zebra-rhythm), container `max-w-[1120px]`, 3-col responsive grid, `gap-5` (20px).
- Each card (5-row structure): mono date+event+city overline, display-18 title, body excerpt description, mono teal SOLID slug URL (no alpha), teal tag badges (Tailwind 4 alpha via `bg-brand-primary-soft/30` + `border-brand-primary/40`), card padding `p-6` (24px).
- Card anchor is whole-card external link to `https://s.vedmich.dev/{slug}/` (target=_blank, rel=noopener noreferrer).
- "All decks →" header link target changed from external `s.vedmich.dev` to INTERNAL `/{locale}/presentations` portfolio index page.
- Subtitle interpolates total deck count via `{N}` placeholder replacement.
- New `/{locale}/presentations` index pages render ALL decks (flat date-desc grid, no year grouping, no pagination) with teal back-link using new `back_to_home` i18n key.
- Data source migrated from `src/data/social.ts presentations` array to `src/content/presentations/{en,ru}/*.md` (Content Collection with Zod schema: `city` nullable, `description` required, `tags` required array, `slides`/`video` URL-validated optional).
- `search-index.ts` queries the collection directly (legacy `locale_urls` override and `as any` cast removed).
- `presentations` export removed from `social.ts` (clean break, no backward-compat shim).

**Acceptance:**
- `src/content.config.ts` exports `presentations` collection with 9-field Zod schema.
- 12 markdown files exist (6 EN + 6 RU); 3 files per locale have `city: null` (Slurm × 2 + DKT).
- `src/components/PresentationCard.astro` exists with typed `CollectionEntry<'presentations'>` props.
- `src/components/Presentations.astro` queries collection, uses `bg-surface` + `max-w-[1120px]`, internal `/{locale}/presentations` "All decks" link, subtitle interpolation.
- `src/pages/{en,ru}/presentations/index.astro` render with BaseLayout + back-link.
- `src/data/search-index.ts` uses `getCollection('presentations', ...)`; no `as any`, no social import.
- `src/data/social.ts` has exactly 3 exports (socialLinks, certifications, skills).
- `npm run build` exits 0 with 25 pages (23 baseline + 2 new index pages).
- Zero hardcoded hex in all Phase 8 files (PresentationCard, Presentations, `/presentations/` pages).

---

## REQ-014 — Hero: section height ≤ 540px on 1440×900

**Type:** Component layout constraint
**Priority:** P0
**Maps to:** Phase 4

The Hero section computed total height on 1440×900 desktop viewport MUST be ≤ 540px (target ~520px, +20px tolerance for pill wrap sub-pixel DPR). This represents a reduction from the previous ~810px (caused by `min-h-[90vh]` stretching).

**Acceptance:**
- `document.getElementById('hero').getBoundingClientRect().height` on 1440×900 with all content loaded: **≤ 540**.
- No `min-h-[90vh]`, `flex items-center`, or `pt-16` classes on the Hero `<section>` wrapper.
- Hero `<section>` uses `pt-24 pb-16 px-6` classes exactly.
- All 4 authority pills render on one row on 1440×900 (no wrap).

---

## Global acceptance (all phases)

- Each phase = 1 atomic commit + push to main
- After each phase: visual verification on live vedmich.dev via playwright-cli (EN + RU, 1440px + 375px viewport)
- `npm run build` passes after each phase (7 pages, ~800ms target)
- Zero new hardcoded hex colors — only design-tokens references
- No deprecated cyan palette anywhere
- Both EN and RU render without layout regression
