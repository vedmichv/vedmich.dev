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

## Global acceptance (all phases)

- Each phase = 1 atomic commit + push to main
- After each phase: visual verification on live vedmich.dev via playwright-cli (EN + RU, 1440px + 375px viewport)
- `npm run build` passes after each phase (7 pages, ~800ms target)
- Zero new hardcoded hex colors — only design-tokens references
- No deprecated cyan palette anywhere
- Both EN and RU render without layout regression
