# PROJECT.md — vedmich.dev

**Site:** https://vedmich.dev
**Repo:** vedmichv/vedmich.dev
**Owner:** Viktor Vedmich (Senior Solutions Architect, AWS)
**Stack:** Astro 5.x + Tailwind CSS 4 + GitHub Pages
**Locales:** EN (default) / RU
**Deploy:** GitHub Actions → actions/deploy-pages@v4 on push to `main`

## What this project is

Personal portfolio site for Viktor Vedmich — bio, speaking, podcasts (DKT + AWS RU), book (Cracking the Kubernetes Interview), presentations, blog. Bilingual EN/RU. Static, zero-JS-first.

## Current state (2026-05-01)

Deep Signal design system is LIVE (teal #14B8A6 + amber #F59E0B). Hero matches reference artifact pixel-for-pixel on 1440×900 after Phase 4 rewrite. Podcasts section rewritten to reference in Phase 5: asymmetric badge treatment — DKT card keeps PNG logo with white chrome, AWS RU card gets inline amber text badge; music-note SVG dropped; stats now mono muted. Nav active-state IntersectionObserver + scroll-margin-top landed. `CNCF Kubestronaut` rename complete across codebase. Presentations section has 6 decks via Content Collection (Phase 8). Blog now has 4 posts with proper card format (Phase 9). Contact section replaced with working `mailto:` form — compact inline social chips (letter + name) + expand-in-place form Card + honest success state + noscript fallback + a11y hardening (Phase 10). Browser-surface brand identity refreshed in Phase 11: Header now serves optimised 64×64 `/vv-logo-hero.png` (5.5 KB) with `alt="Viktor Vedmich"`; full icon coverage via multi-size favicon.ico + apple-touch-icon + android-chrome + webmanifest; `scripts/generate-icons.mjs` is the re-runnable ESM pipeline (sharp + png-to-ico). Footer collapsed to reference shape in Phase 12: 43 → 18 lines, 5 social-icon SVGs + `socialLinks` import deleted, `max-w-[1120px]` + solid `border-border` + `text-[13px]`, bilingual i18n + dynamic year preserved — v0.4 milestone closed. Site is stable, auto-deploying.

Phases complete: 01-header ✓, 02-search-palette ✓, 03-section-order-about ✓, 04-hero-reference-match ✓, 05-podcasts-badges ✓, 07-speaking-portfolio ✓, 08-presentations-card-format ✓, 09-blog-3-posts-card-format ✓, 10-contact-letter-badges-working-form ✓, 11-logo-favicon-refresh ✓, 12-footer-match ✓.

Validated in Phase 4: REQ-011 (4-pill authority strip), REQ-013 (Hero typography reference-match), REQ-014 (Hero height ≤ 540px on 1440×900).
Validated in Phase 5: REQ-004 (Podcasts monogram badges — DKT logo + AWS RU amber text badge, no music-note SVG, both locales identical DOM).
Validated in Phase 9: REQ-002 (Blog — 3 posts × 2 locales in card format; `<BlogCard>` component + schema tightening + reading-time remark plugin + RU locale-aware Cyrillic author render; reusable `.claude/skills/vv-blog-from-vault/` skill for future posts).
Validated in Phase 10: REQ-006 (Contact — functional mailto form replacing the old CTA-only chip layout; compact social chips + inline-expand Card + success state + T-10-01 header-injection mitigation via `encodeURIComponent`; bilingual parity 13 keys per locale; Deep Signal token hygiene). MX pre-flight for `viktor@vedmich.dev` flagged as user-owned ops task (D-03).
Validated in Phase 11: REQ-007 (Brand-kit refresh — 3 canonical Deep Signal SVGs shipped to `public/`, 64×64 optimised hero PNG ≤ 10 KB, multi-size favicon.ico (16/32/48), full icon coverage via apple-touch-icon 180×180 + android-chrome 192/512 + site.webmanifest with theme-color `#14B8A6` + background-color `#0F172A`; idempotent `scripts/generate-icons.mjs` pipeline; `.design-handoff/` mirrors preserve 1.87 MB canonical hero beside the 5 KB derivative).
Validated in Phase 12: REQ-012 (Footer reference-match — two-column flex matching `app.jsx:640-648`; 5 social-icon SVGs + `socialLinks` Footer import deleted (export retained for Contact section consumer); canonical `max-w-[1120px]` container; solid `border-border` + `text-[13px]`; bilingual i18n `footer.copyright` + `footer.built_with` and dynamic `new Date().getFullYear()` preserved; zero hex literals; 43 → 18 LOC).

## Current milestone: v0.5 — Content Platform (planned)

Move vedmich.dev from "static site with a handful of posts" to a platform that lifts existing artifacts (Slidev slides, vv-carousel PNGs, Excalidraw diagrams, vault notes, podcast episodes) into blog posts with minimal manual work. Carousel/slide content integrated **as-is** — no major rewrites.

Tentative phases (full design at `.planning/notes/milestone-v0.5-content-platform.md`):
- **Phase 1 — Rich-media integration:** `VvStage`/`VvNode`/`VvWire`/`VvPacket` primitives + Shiki language badge + `// [!code highlight]` transformer + Excalidraw SVG-export pipeline (6-10h).
- **Phase 2+ — Podcast/talk companion posts:** use `vv-blog-from-vault` skill for companion posts on new DKT + AWS RU podcast episodes (ongoing).
- **Phase 3 (optional) — Phase 9.1 Karpenter animation polish:** only if Phase 9 rich-media experiment surfaces issues on live.

**Exit criteria:** Slidev slide lift <10 min/slide (down from ~30 min); ≥1 Excalidraw diagram embedded; code blocks show language badge + highlight-lines; ≥2 companion posts shipped.

## Prior milestones

- **v0.1** — Initial Astro site, i18n, blog collection schema
- **v0.2** — Electric Horizon (cyan) design system (superseded by v0.3)
- **v0.3** — Deep Signal migration (teal + amber), self-hosted fonts, canonical tokens, Presentations expansion (shipped 2026-04-19)
- **v0.4** — Reference Design Audit — 12 phases, 26 plans, 41 tasks (shipped 2026-05-01). Live site matches Deep Signal reference UI kit across every homepage section. Tech debt (6 advisory code-review warnings, 2 REQ documentation drift items) deferred to v0.5 maintenance pass. Full archive at `.planning/milestones/v0.4-ROADMAP.md`.

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
