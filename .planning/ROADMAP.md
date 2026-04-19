# ROADMAP.md — v0.4 Reference Design Audit

**Milestone goal:** Align live vedmich.dev with the reference UI-kit (`viktor-vedmich-design` skill → `ui_kits/vedmich-dev/app.jsx`, 687 lines) pixel-by-pixel across all homepage sections. Ship visually complete site even where content is placeholder.

**Reference source of truth:** `/Users/viktor/.claude/skills/viktor-vedmich-design/ui_kits/vedmich-dev/app.jsx` — full React source with tokens, components, data. Also `ref-content.json` and `reference-1440-full.png`.

**Execution model:** Sequential — one phase at a time, atomic commit, push main, visual verify on live via playwright-cli attached to user's Chrome.

**Phase numbering NOTE:** Phase 1 (Header visual shell) already shipped (`71e38e9`). Phases below continue from Phase 2. **Reordered 2026-04-19: Hero promoted to Phase 4** after visual audit during Phase 3 flagged major Hero drift vs reference (user explicit request).

---

## Phase 2 — Search palette (⌘K modal with fuzzy search) ✅

**Status:** Complete (commits `965eac9`, `6f0fb7b`, `e8361e4`, `4bc642b`, 2026-04-19)
**Requirements:** REQ-001 (upgraded — search must be functional, not placeholder)
**Files:** `src/components/SearchPalette.astro`, `src/components/Header.astro`, `src/data/search-index.ts`, `src/i18n/{en,ru}.json`
**Verification:** Press ⌘K → modal opens, type "karp" → 2 results, Enter opens URL, Esc closes.

---

## Phase 3 — Section order + About: match reference ✅

**Status:** Complete (commits `f21655f`, `381e0d9`, `95e7478`, 2026-04-19). Header tokens also fixed in-scope.
**Requirements:** REQ-008 (upgraded), NEW REQ-009 (section order), NEW REQ-010 (Book before Speaking)
**Files:** `src/pages/en/index.astro`, `src/pages/ru/index.astro`, `src/components/Header.astro`, `src/components/About.astro`, `src/i18n/en.json`, `src/i18n/ru.json`
**Verification:** Sections in reference order; About layout byte-match tokens; Header pixel-match tokens.

---

## Phase 4 — Hero: match reference pixel-for-pixel 🎯 **NEXT**

**Requirements:** NEW REQ-011, NEW REQ-013 (Hero typography), NEW REQ-014 (Hero height)
**Files:** `src/components/Hero.astro`, `src/i18n/en.json`, `src/i18n/ru.json`
**Context:** Promoted to Phase 4 during Phase 3 visual audit (2026-04-19). User flagged massive height mismatch and typography drift vs reference. Was originally scheduled as Phase 11 (cosmetic gradient polish) — new scope is a full component rewrite.

**Findings from Phase 3 audit (`app.jsx:357-391`):**

| # | Element | Reference | Current (Hero.astro) | Action |
|---|---|---|---|---|
| 1 | Section height | `padding: '96px 24px 64px'`, content-height | `min-h-[90vh] flex items-center` → stretches to ~810px, centers content | **Remove `min-h-[90vh]` + `flex items-center`**, use `pt-24 pb-16 px-6` (96/64/24) |
| 2 | Container | `maxWidth: 1120` | `max-w-6xl` (1152) + `max-w-3xl` inner | `max-w-[1120px]`, drop inner `max-w-3xl` |
| 3 | Background | flat `linear-gradient(160deg,#0F172A,#134E4A)` | `var(--grad-hero-soft)` (multi-layer radial blobs) | Replace with flat gradient to match reference exactly |
| 4 | Terminal greeting | ONE line mono teal 14px `~/vedmich.dev $ whoami` + separate `Hi, I'm` mono mute 16px (separate block) | Current: `~/vedmich.dev $` + `whoami` in one flex block + `Hi, I'm` at text-sm | Single-line terminal prompt at 14px; separate `Hi, I'm` at 16px mono mute below |
| 5 | Greeting size | 16px | `text-sm` (14px) | `text-base` |
| 6 | **h1 size** | **64px** | `text-4xl sm:text-5xl lg:text-6xl` (36→48→60) | `text-[64px]` — no responsive shrinking (reference stays 64 on all viewports) |
| 7 | h1 weight | 700 | `font-bold` (700) ✓ | keep |
| 8 | h1 letter-spacing | **-0.03em** | `tracking-tight` (-0.025em) | `tracking-[-0.03em]` |
| 9 | h1 line-height | **1.05** | default (~1.1) | `leading-[1.05]` |
| 10 | h1 color | `VV.text` (#E2E8F0) | `text-text-primary` via h1 cascade | keep |
| 11 | Role ("Senior SA @ AWS") | mono **amber 18px**, margin-top 12 | `font-mono text-xl sm:text-2xl text-warm-light font-medium` (20→24px) | `font-mono text-lg text-warm mt-3` (18px amber) |
| 12 | Tagline | Inter 18 mute, margin-top 18, **"AI Engineer" emphasized in text-primary** | `text-lg text-text-muted mb-8` — no emphasis split | Split string so "AI Engineer" wraps in `text-text-primary`; margin-top 18px |
| 13 | Cert pills gap | `gap: 10, marginTop: 28` | `gap-2 mb-10` (8px gap, 40 mb) | `gap-2.5 mt-7` |
| 14 | CTA margin-top | 32 | `gap-3` (12 gap) | `mt-8` |
| 15 | Cursor | inline `_` char, teal, blinking opacity | `<span class="typing-cursor text-brand-primary-hover">` (CSS pseudo `|`) | keep current — visually equivalent |

**Typography cross-check (computed styles from Phase 3 audit):**
- About.astro tokens ✓ all match (Space Grotesk 28/600, Inter 18/1.7, pills Inter 13/500 on #1E293B, overline Inter 11/600 #94A3B8).
- Header.astro tokens ✓ all match after 03-03 expansion (logo 32px rounded-[7px], nav Inter 14/500 text-secondary, search bg-base rounded-[7px] with mono ⌕).
- **Only Hero.astro remained drift as of 2026-04-19.**

**Change plan:**
1. Remove `min-h-[90vh] flex items-center pt-16` from `<section>` wrapper.
2. Switch wrapper to `pt-24 pb-16 px-6` (96/64/24 reference padding).
3. Change background from `.hero-deep-signal` (which uses `--grad-hero-soft` complex blobs) to flat `linear-gradient(160deg, var(--bg-base), var(--brand-primary-soft))` — matches reference exactly. Keep noise overlay.
4. Inner container: `max-w-6xl` → `max-w-[1120px]`, drop the nested `max-w-3xl` wrapper (reference has single column at full container width).
5. Greeting structure:
   - Line 1 (terminal): `<div class="font-mono text-brand-primary text-sm mb-4">~/vedmich.dev $ whoami</div>` — mono teal 14px.
   - Line 2 (Hi): `<div class="font-mono text-text-secondary text-base mb-1">Hi, I'm</div>` — mono mute 16px.
6. `h1`: `font-display text-[64px] font-bold tracking-[-0.03em] leading-[1.05] text-text-primary m-0`. No responsive shrinking.
7. Role: `<div class="font-mono text-warm text-lg mt-3">` — amber 18px mono, margin-top 12px (reference `marginTop: 12`).
8. Tagline: Split `hero.tagline` i18n key:
   - `hero.tagline_prefix: "Distributed Systems · Kubernetes · "`
   - `hero.tagline_emphasis: "AI Engineer"`
   - Render: `<p class="font-body text-lg text-text-secondary max-w-[640px] mt-4">{i.hero.tagline_prefix}<span class="text-text-primary">{i.hero.tagline_emphasis}</span></p>` (mt-4 ≈ 18px).
9. Cert pills wrapper: `flex flex-wrap gap-2.5 mt-7` (28px from role, 10px gap).
10. CTA wrapper: `flex flex-wrap items-center gap-3 mt-8` (32px from pills).

**Plans:** 3 plans across 2 waves

Plans:
- [ ] 04-01-i18n-kubestronaut-PLAN.md — Wave 1: 3-key hero.tagline split in both locales + Kubernaut→Kubestronaut fix in about.bio_before (bilingual).
- [ ] 04-02-hero-rewrite-PLAN.md — Wave 2 (depends 04-01): Add --grad-hero-flat token + full Hero.astro rewrite (4-pill authority strip, clamp h1, inline _ cursor, flat gradient) + remove .typing-cursor from global.css + build gate.
- [ ] 04-03-rename-observer-gate-PLAN.md — Wave 2 (depends 04-02): Kubestronaut rename in social.ts/BaseLayout/CLAUDE.md + Header.astro nav-active observer + scroll-margin-top global + inline REQ-011/013/014 into REQUIREMENTS.md + user visual checkpoint for REQ-013/014 acceptance.

**Est. effort:** 45 min (grew from Phase 11's original 15 min based on audit depth).

**Verification:**
- Computed styles of h1 match reference: 64px/700/-0.03em/1.05.
- Hero total height on 1440×900 viewport is ~520px (not 810px like before).
- `linear-gradient(160deg,#0F172A,#134E4A)` applied as flat background (no radial blobs).
- Tagline has "AI Engineer" visually distinct (text-primary emphasis).
- Role text is mono amber, 18px (not 20-24).
- Terminal greeting is ONE line, not two blocks.
- `npm run build` exits 0.
- No hardcoded hex in Hero.astro.
- Side-by-side against `reference-1440-full.png` — Hero section is pixel-equivalent.

---

## Phase 5 — Podcasts: DKT teal + AWS RU amber badges

**Requirements:** REQ-004
**Files:** `src/components/Podcasts.astro`
**Change:** Replace music-note SVG with `<Badge color="teal">DKT</Badge>` and `<Badge color="amber">AWS RU</Badge>` (per `app.jsx:125-129`). Badge = text overline with colored border + 10% opacity background.
**Est. effort:** 20 min
**Verification:** DKT teal badge, AWS RU amber badge, no music-note icon.

---

## Phase 6 — Book: PACKT cover + V. Vedmich emboss

**Requirements:** REQ-005
**Files:** `src/components/Book.astro`
**Change:** Render book cover as 140×200 card with `linear-gradient(160deg,#134E4A,#0F172A)` + teal border + radius 8. Inside: `PACKT` amber mono label top, book title display bottom, `V. Vedmich` teal mono subtitle. Layout: `140px | 1fr | auto` grid with title/desc column and "Get on Amazon" accent (amber) button right.
**Est. effort:** 30 min
**Verification:** Book card matches reference visually.

---

## Phase 7 — Speaking: timeline + arrows + inline city

**Requirements:** REQ-003
**Files:** `src/components/Speaking.astro`
**Change:** Per `app.jsx:456-486`. Layout: year `100px | events 1fr` grid per year, year in display-36 teal; events as left-border-separated blocks with `Event name · City` (city dimmed) and bullet talks prefixed with `→`. Amber star + highlight for 2023 re:Invent.
**Est. effort:** 35 min (data structure stays in `social.ts`)
**Verification:** `→` arrows per talk, city inline dimmed, 2023 rating highlight.

---

## Phase 8 — Presentations: match card format

**Requirements:** NEW REQ-010 (presentations polish)
**Files:** `src/components/Presentations.astro`
**Change:** Per `app.jsx:522-551`. 3-col grid, each card: mono date+event overline, display-18 title, body excerpt, mono teal slug URL, teal tag badges at bottom. Footer "All decks →" ghost button.
**Est. effort:** 25 min
**Verification:** Cards have the 5-row structure (date/title/excerpt/url/tags).

---

## Phase 9 — Blog: 3 posts with correct card format

**Requirements:** REQ-002
**Files:** `src/content/blog/{en,ru}/*.md` (6 new files), `src/components/BlogPreview.astro`
**Change:**
- Add 3 posts: karpenter-right-sizing (2026-03-20), mcp-servers-plainly-explained (2026-03-02), why-i-write-kubernetes-manifests-by-hand (2026-02-10). EN + RU (QMD-sourced where possible).
- BlogPreview card format per `app.jsx:553-574`: mono date overline, display title, body excerpt, teal tag badges. 3-col grid.
**Est. effort:** 90 min
**Verification:** 3 cards on homepage match ref format; `/blog/<slug>` renders.

---

## Phase 10 — Contact: letter badges + working form

**Requirements:** REQ-006 (upgraded — form must be functional, not CTA)
**Files:** `src/components/Contact.astro`, `src/i18n/{en,ru}.json`
**Change:** Per `app.jsx:577-632`. 5-col grid of square cards (LinkedIn, GitHub, YouTube, X, Telegram) — teal display-22 letter centered (X uses `𝕏`), platform name below. Below: "Write me a message" primary button → expands to Name/Email/Message form → success state `✓ Message sent`. Form submits via mailto: or Formspree endpoint (ask user for preference during execution).
**Est. effort:** 60 min
**Verification:** Letter badges in grid, form opens/submits, success state shows.

---

## Phase 11 — Logo + favicon refresh

**Requirements:** REQ-007
**Files:** `public/vv-logo-primary.svg`, `public/vv-logo-inverse.svg`, `public/favicon.svg`, `.design-handoff/deep-signal-design-system/project/assets/*`, `public/vv-logo-hero.png` (new, from skill assets)
**Change:** Copy from `~/Documents/ViktorVedmich/40-Content/45-Personal-Brand/45.20-Brand-Kit/logo/exports/` + `/Users/viktor/.claude/skills/viktor-vedmich-design/assets/`. Verify Header uses `vv-logo-hero.png` (32×32, radius 7) per ref.
**Est. effort:** 15 min

---

## Phase 12 — Footer match

**Requirements:** NEW REQ-012
**Files:** `src/components/Footer.astro`
**Change:** Per `app.jsx:640-648`. Simple two-column flex: `© {year} Viktor Vedmich` left, `Built with Astro` right. 32px padding, top border.
**Est. effort:** 10 min

---

## Milestone-level done criteria

- [ ] Phases 2-12 merged to main with atomic commits
- [x] Phase 2 complete
- [x] Phase 3 complete
- [ ] Phase 4 (Hero) — **next**
- [ ] Phases 5-12 remaining
- [ ] Live vedmich.dev visually matches `app.jsx` rendering of reference UI kit
- [ ] Both /en/ and /ru/ render without regression at 1440px + 375px
- [ ] ⌘K search works on live
- [ ] Contact form opens on live
- [ ] `npm run build` = 7 pages, passes
- [ ] MEMORY updated with completion
