# MILESTONES.md

## v0.4 Reference Design Audit (Shipped: 2026-05-01)

**Phases completed:** 12 phases, 26 plans, 41 tasks

**Key accomplishments:**

- Bilingual hero.tagline split into 3-key structure (tagline_before/_accent/_after) + CNCF Kubestronaut spelling fix in about.bio_before for both en.json and ru.json — Wave 1 foundation for Plan 04-02 Hero rewrite.
- Full rewrite of `src/components/Hero.astro` to match reference `app.jsx:357-398` pixel-for-pixel on 1440×900 — added `--grad-hero-flat` design token, replaced 6 cert pills with a 4-pill authority strip, swapped `.typing-cursor::after` pseudo for inline `<span>_</span>` with component-scoped `cursor-blink` keyframes, and cleaned the no-longer-needed `.typing-cursor` / global `@keyframes blink` rules from `global.css`. Build: 7 pages in 761ms, exit 0.
- Closed Phase 4 Wave 3 with five coordinated mutations — (1) cross-file Kubestronaut rename in social.ts + BaseLayout.astro + CLAUDE.md, (2) IntersectionObserver nav-active observer + `.is-active` scoped style in Header.astro, (3) `section[id] { scroll-margin-top: 80px }` global rule in global.css, (4) REQ-011/013/014 inlined into REQUIREMENTS.md, (5) `npm run build` passed (7 pages) and user-approved visual gate on 1440×900 confirmed Hero typography, height, nav active-state, and anchor scroll all meet spec.
- One-liner:
- Book section rewritten to full-bleed amber band with 3-col desktop grid (cover | text with rating | solid amber CTA), mobile stack, Amazon rating row (★★★★★ 4.8 · Amazon) added as hardcoded social proof, JPG cover with baked-in PACKT + V. Vedmich preserved over CSS faux cover.
- Speaking Content Collection registered with validated schema, i18n keys for talk pages, and YouTube embed package installed.
- All 7 talks migrated from social.ts to Content Collection markdown files with EN and RU locales.
- Individual talk pages, full portfolio index, homepage Speaking section rewrite, and legacy data removal complete.
- File encoding change (EN + RU i18n):
- One-liner:
- One-liner:
- One-liner:
- Letter-badge social grid (L/G/Y/𝕏/T) + inline-expand mailto form with honest "check your email client" success panel, vanilla-TS data-state island, 11 new bilingual i18n keys, zero new dependencies.
- Deep Signal brand-kit asset pipeline — sharp + png-to-ico pinned, 158-LOC idempotent ESM generator produces 3 canonical SVGs + 7 platform rasters + 1 webmanifest in public/, mirrored to .design-handoff/ with 1.87 MB canonical source preserved (renamed derivative coexists beside it).
- Two-file surgical wiring — Header `<img>` now serves `/vv-logo-hero.png` with a11y alt + eager loading, and BaseLayout `<head>` now carries the full 5-tag Deep Signal icon + PWA manifest + `#14B8A6` theme-color block. Build green at 31 pages, EN/RU symmetric, zero i18n edits, zero deprecated cyan.
- File modified:

---

## v0.4 — Reference Design Audit (IN PROGRESS, started 2026-04-19)

Align live site with Claude-artifact reference UI kit across 8 homepage sections.

- Hero (pre-GSD, done 2026-04-19, commit `ac3a8fd`)
- Phases 1-8 tracked in ROADMAP.md

---

## v0.3 — Deep Signal Design System (shipped 2026-04-19)

Migrated from Electric Horizon (cyan) to Deep Signal (teal + amber). Canonical `design-tokens.css`, Tailwind 4 `@theme` bridge, 9 self-hosted WOFF2 fonts (Inter + Space Grotesk + JetBrains Mono), noise overlay utility. Presentations expanded to 6 decks.

---

## v0.2 — Electric Horizon (superseded by v0.3)

Initial cyan palette, dark-theme-default, first iteration of component system.

---

## v0.1 — Initial site

Astro 5 + Tailwind 4 scaffold, i18n JSON + utils, blog Content Collection, bilingual routing, GH Pages deploy.
