# PROJECT.md — vedmich.dev

**Site:** https://vedmich.dev
**Repo:** vedmichv/vedmich.dev
**Owner:** Viktor Vedmich (Senior Solutions Architect, AWS)
**Stack:** Astro 5.x + Tailwind CSS 4 + GitHub Pages
**Locales:** EN (default) / RU
**Deploy:** GitHub Actions → actions/deploy-pages@v4 on push to `main`

## What this project is

Personal portfolio site for Viktor Vedmich — bio, speaking, podcasts (DKT + AWS RU), book (Cracking the Kubernetes Interview), presentations, blog. Bilingual EN/RU. Static, zero-JS-first.

## Current state (2026-04-19)

Deep Signal design system is LIVE (teal #14B8A6 + amber #F59E0B). Hero matches reference artifact pixel-for-pixel on 1440×900 after Phase 4 rewrite (4-pill authority strip, clamp h1 typography, `--grad-hero-flat` flat 160deg gradient, 3-key i18n tagline split). Nav active-state IntersectionObserver + scroll-margin-top landed. `CNCF Kubestronaut` rename complete across codebase. Presentations section has 6 decks. Blog has 1 post. Site is stable, auto-deploying.

Phases complete: 01-header ✓, 02-search-palette ✓, 03-section-order-about ✓, 04-hero-reference-match ✓.

Validated in Phase 4: REQ-011 (4-pill authority strip), REQ-013 (Hero typography reference-match), REQ-014 (Hero height ≤ 540px on 1440×900).

## Current milestone: v0.4 — Reference Design Audit

Close the 8-section visual gap between live site and the Claude-artifact reference UI kit
(`/Users/viktor/Downloads/vedmich.html` → `ref-content.json` + `reference-1440-full.png`).

8 phases, one per section (Header, Blog, Speaking, Podcasts, Book, Contact, Logo, About).
Each phase = atomic commit → push main → GH Pages auto-deploy → visual verify via playwright-cli on live.

## Prior milestones

- **v0.1** — Initial Astro site, i18n, blog collection schema
- **v0.2** — Electric Horizon (cyan) design system
- **v0.3** — Deep Signal migration (teal + amber), self-hosted fonts, canonical tokens, Presentations expansion
- **v0.4 (IN PROGRESS)** — Reference audit (this milestone)

## Validated decisions

- **Zero-JS default.** Only JS allowed: IntersectionObserver scroll animations + mobile menu toggle. Why: performance (LCP < 1.5s), simplicity.
- **i18n without deps.** JSON files + `t(locale)` helper. No astro-i18n. Why: smaller bundle, full control.
- **Tokens, never hex.** All colors via `src/styles/design-tokens.css`. Hardcoded hex forbidden. Why: consistency, future theme switching.
- **Self-hosted fonts.** 9 WOFF2 files in `public/fonts/`. No Google Fonts CDN. Why: privacy, no render-blocking third-party request.
- **Small changes push straight to main.** No PR for blog posts, link updates, text fixes. Big design changes get a branch + visual review. Why: velocity for content work.
- **Broken-link tolerance during audit.** Slidev slugs may 404 during the reference audit milestone — content will be filled in a later milestone.

## Constraints

- **No new hardcoded hex colors** — reference design tokens only.
- **Never use deprecated cyan** (`#06B6D4` / `#22D3EE`) — Electric Horizon legacy.
- **Separate brand colors** — DKT `#7C3AED` / `#10B981` stays in DKT context only; AWS orange `#FF9900` stays employer-only.
- **Bilingual edits** — every text change must land in BOTH `src/i18n/en.json` and `src/i18n/ru.json`.
- **Build must pass** — `npm run build` = 7 pages, ~800ms, zero errors.

## Tools

- `playwright-cli` skill — visual verification on live site after each phase.
- `context7` MCP — Astro/Tailwind docs lookup.
- QMD MCP — Obsidian vault content search (blog source material from `~/Documents/ViktorVedmich/`).
- `gh run list` — GH Actions deploy status.

## Obsidian vault cross-references

Site content sourced from `~/Documents/ViktorVedmich/`. NEVER read `10-AWS/11-Active-Clients/`, `14-Tips-AWS-Internal/`, `16-Amazon-Employer/` (confidential). Blog post sources: `33-Book-Kubernetes/`, `73-KB-Tech/`, `32-DKT/`, `15.10-AWS-RU-Podcast/`.

## Not in scope for v0.4

- Real search (Pagefind/Algolia) — search pill is visual placeholder only.
- Slidev presentation content fill.
- Lighthouse/a11y audit.
- Obsidian → blog auto-sync script.
