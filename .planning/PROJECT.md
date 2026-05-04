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

**v1.0 milestone validations:**

Validated in v1.0 Phase 2 (code-block-upgrades): CODE-01..05 — Shiki language badge pill, `// [!code highlight]` transformer, Deep Signal tuned github-dark palette with 8 load-bearing hex overrides, visual regression tests on 4 posts × 2 locales (9 playwright specs).
Validated in v1.0 Phase 3 (ui-polish): POLISH-01..06 — bottom "All X →" CTAs unified on Blog/Presentations/Speaking using canonical class `text-sm text-text-muted hover:text-brand-primary transition-colors whitespace-nowrap` (existing `blog.all_posts` / `presentations.all_decks` / `speaking.all_talks` i18n keys kept per D-01, REQUIREMENTS.md reference to `*.see_all` is accepted doc-drift); `--transition-normal` updated to `250ms cubic-bezier(0.16, 1, 0.3, 1)` (expo-out curve per reference app.jsx); `.animate-on-scroll-stagger` CSS variant (pure CSS `:nth-child(1..10)` at 60ms step, cap at 540ms for n+11, reduced-motion guard with `0ms !important`); 14-row visual audit against Deep Signal reference with 2 atomic fixes (About `sm:py-28` rhythm, Podcasts `bg-surface` + `gap-5`) and 3 cross-cutting DEFER rows (H2 scale, About Me casing, max-w-6xl harmonization); WR-03 Shiki palette guard test folded in (8 codeToHtml assertions, sentinel-anchored pointers via `SHIKI_TOKEN_OVERRIDES_BEGIN`/`END`). Card hover follows reference border+glow+title-color-shift (no translate-Y, no amber underline) per D-02.

## Current milestone: v1.0 — Content Platform (planned, started 2026-05-02)

Turn vedmich.dev from "static site with a handful of posts" into a full content platform: three content streams (blog, presentations, podcast/talk companion posts) under one domain, Slidev decks served as first-party sub-routes under `vedmich.dev/slides/<slug>/`, reusable rich-media primitives that cut Slidev-slide lift from ~30 min to < 10 min, Excalidraw diagrams embedded as inline SVGs, and an overall UI polish pass (transitions, hover states, "See all" CTAs, minor design fixes).

**Target features:**

- **Wave 1 — Rich-media primitives.** `VvStage` / `VvNode` / `VvWire` / `VvPacket` Astro components mirroring the Slidev Vue primitives; refactor `PodLifecycleAnimation.astro` onto the new primitives as a validation test.
- **Wave 2 — Code block upgrades.** Shiki language badge (top-right pill), `// [!code highlight]` transformer, Shiki dark theme tuned to Deep Signal tokens.
- **Wave 3 — Excalidraw pipeline.** `.excalidraw.json → SVG export → commit → embed`. Replace the ASCII diagram in the MCP post with a real Excalidraw SVG and add 1-2 more inline diagrams in existing posts for stress-testing.
- **Wave 4 — Slidev → Astro codegen.** Script that reads one slide's `.md` + scoped `<style>` and emits an `.astro` component using the Wave 1 primitives. Handles S1 arch-grid, S2 lifecycle, S3 mesh.
- **Slidev integration.** `vedmich.dev/slides/<slug>/` sub-routes replacing the current `s.vedmich.dev` subdomain. Unified domain, unified navigation, documented onboarding workflow (git submodule / subtree + CI + theme template) for shipping a new deck end-to-end.
- **Polish pass.** Add "See all →" CTAs at the top and bottom of the Blog and Presentations homepage sections pointing to the existing `/{locale}/blog/` and `/{locale}/presentations/` index pages; extend `.animate-on-scroll` with section-transition / reveal variants; add hover states to `BlogCard` / `PresentationCard` / `SpeakingCard`; clean up remaining spacing / typography / alignment nits across homepage sections.
- **Companion posts batch.** Ship 2 companion posts (1 DKT + 1 AWS RU episode) via the `vv-blog-from-vault` skill — validates the end-to-end content pipeline on real episodes.
- **Optional — Karpenter animation polish.** Hotfix-style mini-phase, only triggered if the Wave 1 primitives refactor surfaces regressions on live `PodLifecycleAnimation`.

**Exit criteria:**
- Slidev slide lift < 10 min/slide (down from ~30 min) — proven by re-porting `PodLifecycleAnimation` onto Wave 1 primitives
- At least 1 Excalidraw diagram embedded via the new pipeline (MCP post minimum; 2-3 additional placements desirable)
- Code blocks render language badge + support `// [!code highlight]` comments with Deep Signal-matched Shiki theme
- Slidev decks served under `vedmich.dev/slides/<slug>/` with a documented "add a new deck" workflow
- "See all →" CTAs present at top and bottom of Blog + Presentations homepage sections
- ≥ 2 companion posts shipped (1 DKT + 1 AWS RU)

Design sketch: `.planning/notes/milestone-v0.5-content-platform.md` + `.planning/notes/rich-media-integration.md` (v0.5 scoping doc — scope now promoted to v1.0 with added Slidev integration + polish streams).

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

## Not in scope for v1.0

- Real search (Pagefind/Algolia) — search pill remains a visual placeholder.
- Lighthouse / a11y formal audit (deferred to v1.1).
- Obsidian → blog auto-sync script (manual `vv-blog-from-vault` skill stays the path).
- Full interactive Excalidraw (breaks zero-JS budget — static SVG export only).
- Slidev presenter / navigation UX inside blog posts (slides stay on sub-routes).
- Slidev-exact fidelity for every slide (selective porting — some slides won't port cleanly, accept it).

## Evolution

This document evolves at phase transitions and milestone boundaries.

**After each phase transition** (via `/gsd-transition`):
1. Requirements invalidated? → Move to Out of Scope with reason
2. Requirements validated? → Move to Validated with phase reference
3. New requirements emerged? → Add to Active
4. Decisions to log? → Add to Key Decisions
5. "What This Is" still accurate? → Update if drifted

**After each milestone** (via `/gsd-complete-milestone`):
1. Full review of all sections
2. Core Value check — still the right priority?
3. Audit Out of Scope — reasons still valid?
4. Update Context with current state

**Last updated:** 2026-05-04 (Phase 4 excalidraw-pipeline complete — DIAG-01..05 shipped; scripts/excalidraw-to-svg.mjs + 2 SVGs embedded in MCP + Karpenter posts)
