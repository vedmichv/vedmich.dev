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

**Requirements:** REQ-008 (upgraded), NEW REQ-009 (section order)
**Files:** `src/pages/en/index.astro`, `src/pages/ru/index.astro`, `src/components/About.astro`
**Change:**
- Reorder sections: Hero → About → Podcasts → **Book** → Speaking → Presentations → Blog → Contact (Book moves up, before Speaking)
- About: 2-col grid (`1.4fr 1fr`), bio left with teal-highlighted `"Cracking the Kubernetes Interview"`, skill pills right under "Expertise" overline
- Drop the duplicate cert cards from About (they're in Hero)
**Est. effort:** 25 min
**Verification:** Sections in reference order; About layout matches ref screenshot.

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

## Phase 11 — Hero background gradient polish

**Requirements:** NEW REQ-011
**Files:** `src/components/Hero.astro`
**Change:** Verify background gradient exactly matches `linear-gradient(160deg,#0F172A,#134E4A)` per `app.jsx:359`. Keep noise overlay. Adjust Hero padding to `96px 24px 64px` if needed.
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
- [ ] Live vedmich.dev visually matches `app.jsx` rendering of reference UI kit
- [ ] Both /en/ and /ru/ render without regression at 1440px + 375px
- [ ] ⌘K search works on live
- [ ] Contact form opens on live
- [ ] `npm run build` = 7 pages, passes
- [ ] MEMORY updated with completion
