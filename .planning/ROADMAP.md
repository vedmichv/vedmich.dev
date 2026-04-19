# ROADMAP.md — v0.4 Reference Design Audit

**Milestone goal:** Align live vedmich.dev with the reference UI-kit (`viktor-vedmich-design` skill → `ui_kits/vedmich-dev/app.jsx`, 687 lines) pixel-by-pixel across all homepage sections. Ship visually complete site even where content is placeholder.

**Reference source of truth:** `/Users/viktor/.claude/skills/viktor-vedmich-design/ui_kits/vedmich-dev/app.jsx` — full React source with tokens, components, data. Also `ref-content.json` and `reference-1440-full.png`.

**Execution model:** Sequential — one phase at a time, atomic commit, push main, visual verify on live via playwright-cli attached to user's Chrome.

**Phase numbering NOTE:** Phase 1 (Header visual shell) already shipped (`71e38e9`). Phases below continue from Phase 2.

---

## Phase 2 — Search palette (⌘K modal with fuzzy search)

**Requirements:** REQ-001 (upgraded — search must be functional, not placeholder)
**Files:** `src/components/SearchPalette.astro` (new), `src/components/Header.astro` (wire trigger), `src/data/search-index.ts` (new — build index at compile time from presentations + blog posts), `src/i18n/{en,ru}.json`
**Approach:**
- Astro component with small client-side JS (the ONLY allowed island for this phase): keyboard shortcut handler (⌘K / Ctrl+K / "/"), arrow navigation, Enter to open
- Index built at build time from `social.ts` presentations array + blog Content Collection
- Fuzzy scoring per `app.jsx:184-195` (title exact = 100, haystack substring = 60, all-tokens-present = 30)
- Styling matches `app.jsx:233-300` — dark overlay with backdrop-blur, 640px-wide modal with Slides/Post kind badges
**Est. effort:** 90 min
**Verification:** Press ⌘K → modal opens, type "karp" → 2 results (Karpenter slides + Karpenter blog), Enter opens URL, Esc closes.

---

## Phase 3 — Section order + About: match reference

**Requirements:** REQ-008 (upgraded), NEW REQ-009 (section order), NEW REQ-010 (Book before Speaking)
**Files:** `src/pages/en/index.astro`, `src/pages/ru/index.astro`, `src/components/Header.astro`, `src/components/About.astro`, `src/i18n/en.json`, `src/i18n/ru.json`
**Change:**
- Reorder sections: Hero → About → Podcasts → **Book** → Speaking → Presentations → Blog → Contact (Book moves up, before Speaking)
- Reorder Header `navItems` to match (`about · podcasts · book · speaking · presentations · blog · contact`)
- About: 2-col grid (`1.4fr 1fr`), bio left with teal-highlighted `«Cracking the Kubernetes Interview»`, skill pills right under "Expertise" overline
- Drop the duplicate cert cards (and CNCF callout) from About — they are in the Hero cert bar
- Split `about.bio` i18n key into `bio_before` / `bio_accent` / `bio_after` (D-01); remove `about.certs_title` (D-03)
**Plans:** 3 plans (Wave 1: 03-01, 03-02 in parallel; Wave 2: 03-03)
- [ ] 03-01-i18n-keys-PLAN.md — split `about.bio` into three keys in both en.json and ru.json; remove `about.certs_title`
- [ ] 03-02-section-order-and-nav-PLAN.md — reorder `<Book />` above `<Speaking />` in both locale index pages; reorder `navItems` array in Header.astro to match
- [ ] 03-03-about-rewrite-PLAN.md — full rewrite of About.astro to match reference `app.jsx:400-421` (grid + bio with teal accent + overline + pills, no cert cards)
**Est. effort:** 25 min
**Verification:** Sections in reference order; About layout matches ref screenshot; both locales render identically; no hardcoded hex colors; `npm run build` passes.

---

## Phase 4 — Podcasts: DKT teal + AWS RU amber badges

**Requirements:** REQ-004
**Files:** `src/components/Podcasts.astro`
**Change:** Replace music-note SVG with `<Badge color="teal">DKT</Badge>` and `<Badge color="amber">AWS RU</Badge>` (per `app.jsx:125-129`). Badge = text overline with colored border + 10% opacity background.
**Est. effort:** 20 min
**Verification:** DKT teal badge, AWS RU amber badge, no music-note icon.

---

## Phase 5 — Book: PACKT cover + V. Vedmich emboss

**Requirements:** REQ-005
**Files:** `src/components/Book.astro`
**Change:** Render book cover as 140×200 card with `linear-gradient(160deg,#134E4A,#0F172A)` + teal border + radius 8. Inside: `PACKT` amber mono label top, book title display bottom, `V. Vedmich` teal mono subtitle. Layout: `140px | 1fr | auto` grid with title/desc column and "Get on Amazon" accent (amber) button right.
**Est. effort:** 30 min
**Verification:** Book card matches reference visually.

---

## Phase 6 — Speaking: timeline + arrows + inline city

**Requirements:** REQ-003
**Files:** `src/components/Speaking.astro`
**Change:** Per `app.jsx:456-486`. Layout: year `100px | events 1fr` grid per year, year in display-36 teal; events as left-border-separated blocks with `Event name · City` (city dimmed) and bullet talks prefixed with `→`. Amber star + highlight for 2023 re:Invent.
**Est. effort:** 35 min (data structure stays in `social.ts`)
**Verification:** `→` arrows per talk, city inline dimmed, 2023 rating highlight.

---

## Phase 7 — Presentations: match card format

**Requirements:** NEW REQ-010 (presentations polish)
**Files:** `src/components/Presentations.astro`
**Change:** Per `app.jsx:522-551`. 3-col grid, each card: mono date+event overline, display-18 title, body excerpt, mono teal slug URL, teal tag badges at bottom. Footer "All decks →" ghost button.
**Est. effort:** 25 min
**Verification:** Cards have the 5-row structure (date/title/excerpt/url/tags).

---

## Phase 8 — Blog: 3 posts with correct card format

**Requirements:** REQ-002
**Files:** `src/content/blog/{en,ru}/*.md` (6 new files), `src/components/BlogPreview.astro`
**Change:**
- Add 3 posts: karpenter-right-sizing (2026-03-20), mcp-servers-plainly-explained (2026-03-02), why-i-write-kubernetes-manifests-by-hand (2026-02-10). EN + RU (QMD-sourced where possible).
- BlogPreview card format per `app.jsx:553-574`: mono date overline, display title, body excerpt, teal tag badges. 3-col grid.
**Est. effort:** 90 min
**Verification:** 3 cards on homepage match ref format; `/blog/<slug>` renders.

---

## Phase 9 — Contact: letter badges + working form

**Requirements:** REQ-006 (upgraded — form must be functional, not CTA)
**Files:** `src/components/Contact.astro`, `src/i18n/{en,ru}.json`
**Change:** Per `app.jsx:577-632`. 5-col grid of square cards (LinkedIn, GitHub, YouTube, X, Telegram) — teal display-22 letter centered (X uses `𝕏`), platform name below. Below: "Write me a message" primary button → expands to Name/Email/Message form → success state `✓ Message sent`. Form submits via mailto: or Formspree endpoint (ask user for preference during execution).
**Est. effort:** 60 min
**Verification:** Letter badges in grid, form opens/submits, success state shows.

---

## Phase 10 — Logo + favicon refresh

**Requirements:** REQ-007
**Files:** `public/vv-logo-primary.svg`, `public/vv-logo-inverse.svg`, `public/favicon.svg`, `.design-handoff/deep-signal-design-system/project/assets/*`, `public/vv-logo-hero.png` (new, from skill assets)
**Change:** Copy from `~/Documents/ViktorVedmich/40-Content/45-Personal-Brand/45.20-Brand-Kit/logo/exports/` + `/Users/viktor/.claude/skills/viktor-vedmich-design/assets/`. Verify Header uses `vv-logo-hero.png` (32×32, radius 7) per ref.
**Est. effort:** 15 min

---

## Phase 11 — Hero: match reference pixel-for-pixel

**Requirements:** NEW REQ-011, NEW REQ-013 (Hero typography), NEW REQ-014 (Hero height)
**Files:** `src/components/Hero.astro`, possibly `src/i18n/{en,ru}.json`
**Context:** Discovered during Phase 3 visual audit (2026-04-19). User flagged massive height mismatch and typography drift vs reference.

**Findings from Phase 3 audit (`app.jsx:357-391`):**

| Element | Reference | Current (Hero.astro) | Action |
|---|---|---|---|
| Section height | `padding: '96px 24px 64px'`, content-height | `min-h-[90vh] flex items-center` → stretches to ~810px, centers content | **Remove `min-h-[90vh]` + `flex items-center`**, use `pt-24 pb-16 px-6` (96/64/24) |
| Container | `maxWidth: 1120` | `max-w-6xl` (1152) + `max-w-3xl` inner | `max-w-[1120px]` |
| Background | flat `linear-gradient(160deg,#0F172A,#134E4A)` | `var(--grad-hero-soft)` (multi-layer radial blobs) | Replace with flat gradient to match reference exactly |
| Terminal greeting | ONE line: mono teal 14px `~/vedmich.dev $ whoami` + separate `Hi, I'm` mono mute 16px | TWO lines: `~/vedmich.dev $` + `whoami` block + `Hi, I'm` | Simplify to single terminal line + mono-mute greeting (drop extra wrapper) |
| Greeting size | 16px (`Hi, I'm`) | `text-sm` (14px) | `text-base` |
| **h1 size** | **64px** | `text-4xl sm:text-5xl lg:text-6xl` (36→48→60) | `text-[64px]` or `text-6xl` with explicit override; never go below 60 on lg |
| h1 weight | 700 | `font-bold` (700) ✓ | keep |
| h1 letter-spacing | **-0.03em** | `tracking-tight` (-0.025em) | `tracking-[-0.03em]` |
| h1 line-height | **1.05** | default (~1.1) | `leading-[1.05]` |
| h1 color | `VV.text` (#E2E8F0) | `text-text-primary` via h1 cascade | keep (already correct) |
| Role ("Senior SA @ AWS") | mono **amber 18px**, margin-top 12 | `font-mono text-xl sm:text-2xl text-warm-light font-medium` (20→24px) | `font-mono text-lg text-warm mt-3` (18px amber) |
| Tagline | Inter 18 mute, margin-top 18, **"AI Engineer" emphasized in text-primary** | `text-lg text-text-muted mb-8` — no emphasis split | Split string so "AI Engineer" wraps in `text-text-primary`; margin-top 18px |
| Cert pills gap | `gap: 10, marginTop: 28` | `gap-2 mb-10` (8px gap, 40 mb) | `gap-2.5 mt-7` |
| CTA margin-top | 32 | `gap-3` (12 gap, margin inherited) | `mt-8` |
| Cursor | inline `_` char, teal, blinking opacity | `<span class="typing-cursor text-brand-primary-hover">` (CSS pseudo `|`) | keep current — visually equivalent |

**Typography cross-check (from computed styles, RU/en):**
- About.astro tokens ✓ all match (Space Grotesk 28/600, Inter 18/1.7, pills Inter 13/500 on #1E293B, overline Inter 11/600 #94A3B8).
- Header.astro tokens ✓ all match after 03-03 expansion (logo 32px rounded-[7px], nav Inter 14/500 text-secondary, search bg-base rounded-[7px] with mono ⌕).
- **Only Hero.astro is the remaining fidelity gap.**

**Change:**
1. Remove `min-h-[90vh] flex items-center pt-16` from `<section>` wrapper.
2. Switch wrapper to `pt-24 pb-16 px-6` (96/64/24 reference padding).
3. Change background from `.hero-deep-signal` (which uses `--grad-hero-soft` complex blobs) to flat `linear-gradient(160deg, var(--bg-base), var(--brand-primary-soft))` — matches reference exactly.
4. Inner container: `max-w-6xl` → `max-w-[1120px]`, drop the nested `max-w-3xl` wrapper (reference has single column at full container width).
5. Greeting structure:
   - Line 1: `<span class="font-mono text-brand-primary text-sm">~/vedmich.dev $ whoami</span>` (single line, mono teal 14px, mb-4)
   - Line 2: `<span class="font-mono text-text-secondary text-base">Hi, I'm</span>` (mono mute 16px, mb-1)
6. `h1`: `text-[64px] font-bold tracking-[-0.03em] leading-[1.05] text-text-primary m-0` — explicit pixel sizes, no responsive shrinking (reference has no mobile bump).
7. Role: `<div class="font-mono text-warm text-lg mt-3">` — amber 18px Inter-mono, margin-top 12px.
8. Tagline: Split `tagline` i18n string so "AI Engineer" is wrapped — e.g. `tagline_prefix: "Distributed Systems · Kubernetes · "`, `tagline_emphasis: "AI Engineer"`. Render as `<p class="font-body text-lg text-text-secondary max-w-[640px] mt-4">{i.hero.tagline_prefix}<span class="text-text-primary">{i.hero.tagline_emphasis}</span></p>`.
9. Cert pills wrapper: `mt-7` (28px from role), `gap-2.5` (10px).
10. CTA wrapper: `mt-8` (32px from pills).

**Est. effort:** 45 min (grew from 15 min based on audit depth)
**Verification:**
- Computed styles of h1 match reference: 64px/700/-0.03em/1.05.
- Hero total height on 1440×900 viewport is ~520px (not 810px like before — visual density matches reference).
- `linear-gradient(160deg,#0F172A,#134E4A)` applied as flat background (no radial blobs).
- Tagline has "AI Engineer" visually distinct (lighter vs muted).
- Role text is mono amber, 18px (not 20-24).
- Terminal greeting is ONE line, not two blocks.

---

## Phase 12 — Footer match

**Requirements:** NEW REQ-012
**Files:** `src/components/Footer.astro`
**Change:** Per `app.jsx:640-648`. Simple two-column flex: `© {year} Viktor Vedmich` left, `Built with Astro` right. 32px padding, top border.
**Est. effort:** 10 min

---

## Milestone-level done criteria

- [ ] Phases 2-12 merged to main with atomic commits
- [ ] Live vedmich.dev visually matches `app.jsx` rendering of reference UI kit
- [ ] Both /en/ and /ru/ render without regression at 1440px + 375px
- [ ] ⌘K search works on live
- [ ] Contact form opens on live
- [ ] `npm run build` = 7 pages, passes
- [ ] MEMORY updated with completion
