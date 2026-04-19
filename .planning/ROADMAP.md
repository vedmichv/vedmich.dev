# ROADMAP.md — v0.4 Reference Design Audit

**Milestone goal:** Align live vedmich.dev with the reference UI-kit artifact across 8 homepage sections.
**Execution model:** Sequential — one phase at a time, atomic commit, push main, visual verify on live, then next.
**Reference:** `ref-content.json` + `reference-1440-full.png` in repo root.

---

## Phase 1 — Header: search pill + EN·RU switcher

**Requirements:** REQ-001
**Files:** `src/components/Header.astro`, `src/i18n/{en,ru}.json`
**Depends on:** none
**Est. effort:** 30 min
**Verification:** Playwright screenshot /en/ + /ru/ at 1440px + 375px — search pill visible, EN·RU dot-separator style, active locale bold.

---

## Phase 2 — Blog: 3 published posts

**Requirements:** REQ-002
**Files:** `src/content/blog/en/2026-03-20-karpenter-right-sizing.md` + 5 more (6 files total)
**Depends on:** none (parallel with Phase 1 in principle, but sequential per user preference)
**Est. effort:** 90 min (content writing per post, EN+RU parallel via QMD vault sourcing)
**Verification:** Homepage BlogPreview shows 3 cards with dates, tags, excerpts. `/en/blog/<slug>` + `/ru/blog/<slug>` render correctly with prose-invert styles.

---

## Phase 3 — Speaking: → arrows + inline city

**Requirements:** REQ-003
**Files:** `src/components/Speaking.astro` (+ possibly `src/data/social.ts` if structure change needed)
**Depends on:** none
**Est. effort:** 20 min
**Verification:** Screenshot /en/#speaking + /ru/#speaking — each talk line starts with teal `→`, city inline dimmed after event name.

---

## Phase 4 — Podcasts: monogram badges

**Requirements:** REQ-004
**Files:** `src/components/Podcasts.astro`
**Depends on:** none
**Est. effort:** 20 min
**Verification:** Screenshot /en/#podcasts — DKT teal monogram, AWS RU amber monogram, no music-note SVG.

---

## Phase 5 — Book: PACKT label + V. Vedmich emboss

**Requirements:** REQ-005
**Files:** `src/components/Book.astro`
**Depends on:** none
**Est. effort:** 25 min
**Verification:** Screenshot /en/#book — PACKT visible top-left on cover, V. Vedmich visible bottom.

---

## Phase 6 — Contact: letter badges + Write CTA

**Requirements:** REQ-006
**Files:** `src/components/Contact.astro`, `src/i18n/{en,ru}.json`
**Depends on:** none
**Est. effort:** 35 min
**Verification:** Screenshot /en/#contact + /ru/#contact — 5 letter badges in grid, primary teal "Write me a message" CTA below.

---

## Phase 7 — Logo + favicon refresh

**Requirements:** REQ-007
**Files:** `public/vv-logo-primary.svg`, `public/vv-logo-inverse.svg`, `public/favicon.svg`, `.design-handoff/deep-signal-design-system/project/assets/*`
**Depends on:** none
**Est. effort:** 15 min (file copy + verify references)
**Verification:** Browser tab favicon refreshed, Header logo uses new SVG, `npm run build` passes.

---

## Phase 8 — About cleanup

**Requirements:** REQ-008
**Files:** `src/components/About.astro`
**Depends on:** none
**Est. effort:** 10 min
**Verification:** Screenshot /en/#about — no cert cards (they live in Hero); bio + skill pills remain.

---

## Milestone-level done criteria

- [ ] All 8 phases merged to main with atomic commits
- [ ] Live vedmich.dev passes visual diff vs `reference-1440-full.png` (subjective user review)
- [ ] Both /en/ and /ru/ render without regression at 1440px + 375px
- [ ] `npm run build` = 7 pages, passes
- [ ] MEMORY update: new session-handoff or completion memory + remove stale reference-audit memory
