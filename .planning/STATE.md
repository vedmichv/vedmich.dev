---
gsd_state_version: 1.0
milestone: v0.4
milestone_name: milestone
current_phase: 11
status: executing
last_updated: "2026-05-01T17:24:46.574Z"
progress:
  total_phases: 12
  completed_phases: 9
  total_plans: 25
  completed_plans: 20
  percent: 80
---

# STATE.md

**Current milestone:** v0.4 — Reference Design Audit
**Current phase:** 11
**Status:** Ready to execute
**Last updated:** 2026-04-26

## Completed phases

- ✅ Phase 1 — Header search pill + EN · RU switcher (commit `71e38e9`, deployed 2026-04-19)
- ✅ Phase 2 — Search palette ⌘K (commits `965eac9`, `6f0fb7b`, `e8361e4`, `4bc642b`)
- ✅ Phase 3 — Section order + About rewrite + Header token fidelity (commits `f21655f`, `381e0d9`, 2026-04-19)
- ✅ Phase 4 — Hero: match reference pixel-for-pixel (3 plans, 2026-04-19)
- ✅ Phase 5 — Podcasts: DKT teal + AWS RU amber badges (commit `de2e43d`, 2026-04-21)
- ⏳ Phase 6 — Book: PACKT cover + V. Vedmich emboss (Plan 1 implementation complete, commit `97c6e89`, 2026-04-21 — awaiting visual verify + push)
- ✅ Phase 7 — Speaking Portfolio: full collection + reference grid layout (commits `2ea5cae`, `82ed3b9`, `d2b856c`, `259b948`, `f457667`, 2026-04-21)
- ✅ Phase 8 — Presentations: card format + Content Collection migration (commits `895ef22`, `e2c62a6`, `757ed8e`, 2026-04-24 — 25 pages build, 10/10 must-haves verified)

## Active context

- Reference artifact: `/Users/viktor/.claude/skills/viktor-vedmich-design/ui_kits/vedmich-dev/app.jsx`. Visual: `reference-1440-full.png`.
- **Phase 11 (Hero) spec expanded** during Phase 3 review — captures findings about min-h-[90vh] height drift, h1 typography (64/-0.03em/1.05), role mono 18px amber, flat vs grad-hero-soft background, single-line terminal greeting. Do not lose these details — they're in ROADMAP.md Phase 11 section.
- After Phase 3: About + Header tokens verified byte-for-byte via computed styles. Hero is the only remaining component-level fidelity gap before Phases 4-10 polish the other sections.
- Working tree has uncommitted changes in `.design-handoff/`, `public/favicon.svg`, `.mcp.json` — these will be touched naturally by Phase 10 (logo refresh) or belong to MCP config changes; leave alone for now.

## Pending todos

- [x] Phase 1 — Header search pill ✓ (commit `71e38e9`)
- [x] Phase 2 — Search palette ⌘K ✓ (commits `965eac9`/`6f0fb7b`/`e8361e4`/`4bc642b`)
- [x] Phase 3 — Section order + About + Header tokens ✓ (commits `f21655f`/`381e0d9`)
- [x] Phase 4 — Hero: match reference pixel-for-pixel ✓ (3 plans completed 2026-04-19)
- [x] Phase 5 — Podcasts: DKT teal + AWS RU amber badges ✓ (completed 2026-04-21, commit `de2e43d`)
- [x] Phase 6 — Book: PACKT cover + V. Vedmich emboss ✓ (Plan 1 complete 2026-04-21, commit `97c6e89` — awaiting visual verify + push to main)
- [x] Phase 7 — Speaking: timeline + arrows + inline city ✓ (3 plans, 2026-04-21)
- [x] Phase 8 — Presentations: card format + Content Collection migration ✓ (3 plans, 2026-04-24)
- [ ] Phase 9 — Blog: 3 posts with correct card format ← next
- [ ] Phase 10 — Contact: letter badges + working form
- [ ] Phase 11 — Logo + favicon refresh
- [ ] Phase 12 — Footer match

## Blockers

None.

## Notes

- User prefers sequential execution with visual verification on live after each phase.
- Playwright-cli skill is active. `playwright-cli attach --extension` requires Playwright MCP Bridge extension installed in Chrome. For headed Chrome use `playwright-cli open https://vedmich.dev/...`.
- `gh run list --branch main --limit 3` shows deploy status; typical deploy ~60-90s after push.
- GSD interactive questions are asked in Russian; artifacts are written in English (see CLAUDE.md).

**Planned Phase:** 06 (Book: PACKT cover + V. Vedmich emboss) — 1 plans — 2026-04-21T07:20:25.495Z
**Context gathered:** 5 (Podcasts — DKT teal + AWS RU amber badges) — 2026-04-20T19:50:00Z — `.planning/phases/05-podcasts-badges/05-CONTEXT.md`
**Context gathered:** 6 (Book — PACKT cover + V. Vedmich emboss) — 2026-04-21T04:32:00Z — `.planning/phases/06-book-packt-cover/06-CONTEXT.md`
**Plan executed:** 06-01 (Book rewrite — full-bleed amber band + rating row) — 2026-04-21T07:36:57Z — `.planning/phases/06-book-packt-cover/06-01-book-rewrite-SUMMARY.md` — commit `97c6e89` — 7 min 9 sec — `npm run build` green (7 pages, 837ms), DOM shape verified both locales
**UI-SPEC approved:** 7 (Speaking Portfolio) — 2026-04-21 — `.planning/phases/07-speaking-portfolio/07-UI-SPEC.md` — 6/6 dimensions PASS, 1 revision (6px→8px spacing fix)
**Planned Phase:** 07 (Speaking Portfolio) — 3 plans in 2 waves — 2026-04-21T18:00:00Z — research HIGH confidence, pattern map 11/11 analogs, checker VERIFICATION PASSED all dimensions
**Plan executed:** 07-01 (Speaking Portfolio — Data Layer) — 2026-04-21T18:33:00Z — `.planning/phases/07-speaking-portfolio/07-01-SUMMARY.md` — commits `8096e60`, `8048466`, `071ae22` — 2 min 47 sec — Speaking collection registered, i18n keys added, YouTube embed package installed
**Plan executed:** 07-02 (Speaking Portfolio — Content Migration) — 2026-04-21T18:36:57Z — `.planning/phases/07-speaking-portfolio/07-02-SUMMARY.md` — commits `92ab775`, `0c27d99` — 1 min 23 sec — 14 markdown files created (7 EN + 7 RU), all talks migrated from social.ts
**Plan executed:** 07-03 (Speaking Portfolio — Pages and Components) — 2026-04-21T18:42:37Z — `.planning/phases/07-speaking-portfolio/07-03-SUMMARY.md` — commits `2ea5cae`, `82ed3b9`, `d2b856c`, `259b948`, `f457667` — 2 min 41 sec — 4 pages created (slug + index × 2 locales), Speaking.astro rewritten with reference grid layout, speakingEvents removed from social.ts
**Context gathered:** 8 (Presentations — match card format + portfolio migration) — 2026-04-24 — `.planning/phases/08-presentations-match-card-format/08-CONTEXT.md` — commit `217d7bf` — scope expanded from 25 min card rewrite to Content Collection migration (mirror Phase 7 Speaking pattern); individual deck pages deferred to future Unified Slides milestone v0.5
**Context gathered:** 9 (Blog — 3 posts with correct card format) — 2026-04-26 — `.planning/phases/09-blog-3-posts-card-format/09-CONTEXT.md` — scope expanded to 3 waves: (1) card rewrite + BlogCard component + index/slug unification + schema tighten (tags required + add author/reading_time/cover_image), (2) create `.claude/skills/vv-blog-from-vault/` project-local skill (vault search + session-recall + draft gen EN+RU + companion links + visuals routing + verify+push), (3) use skill to write 3 posts (karpenter/mcp/manifests) × 2 locales = 6 files. Est. 6-8 hours total. Voice: tech-expert first-person. Vault sources identified per post (karpenter carousel, MCP Warsaw talk, manifests via session recall).
**UI-SPEC approved:** 9 (Blog — 3 posts with correct card format) — 2026-04-26 — `.planning/phases/09-blog-3-posts-card-format/09-UI-SPEC.md` — commit `d91bdc5` — 6/6 dimensions PASS (copywriting, visuals, color, typography, spacing, registry safety) — 579 lines — 44 decisions pre-populated from CONTEXT.md (D-01…D-44), 4 copywriting questions resolved (empty state preserved, no byline prefix, always abbreviated min/мин, RU suffix "г." stripped) — ~92% pre-populated, zero invented tokens — ready for /gsd-plan-phase 9
**Planned Phase:** 09 (Blog — 3 posts with correct card format) — 3 plans in 3 sequential waves — 2026-04-26 — research HIGH confidence (mermaid-in-Astro native via syntaxHighlight.excludeLangs, reading-time official remark recipe, all 7 delegation skills + all vault paths verified), pattern map 27/28 analogs mapped (PresentationCard→BlogCard 1:1, Presentations→BlogPreview adapter, hello-world→content template, vv-carousel+sync-claude-sessions→skill structure), plan-checker VERIFICATION PASSED iter-3/3 after 2 revision cycles (iter-1 resolved 2 blockers: RU byline Latin-name via `authorDisplay` locale-aware render, Karpenter title restored to REQ-002 verbatim "right-sizing at scale"; iter-2 resolved translation-rule inconsistency by expanding "at scale" → both "в масштабе"/"на масштабе" idioms with usage guidance). Decision-coverage gate override recorded: 37/44 decisions lack explicit `D-NN:` citation in must_haves, but checker Dimension 7 (Context Compliance) PASSED — all decisions semantically honored. User chose "Proceed anyway" — lexical citation not worth a replanning pass.
**Context gathered:** 10 (Contact — letter badges + working form) — 2026-05-01 — `.planning/phases/10-contact-letter-badges-working-form/10-CONTEXT.md` — commit `3143ea3` — 37 decisions locked. Backend: mailto: only (viktor@vedmich.dev), inline expand per ref, HTML5-only validation, honest success copy "Check your email client". MX for vedmich.dev flagged as pre-flight check (D-03).
**Context gathered:** 11 (Logo + favicon refresh) — 2026-05-01 — `.planning/phases/11-logo-favicon-refresh/11-CONTEXT.md` — commit `d59c0de` — 12 decisions locked. Header swaps `/favicon.svg` → optimised `/vv-logo-hero.png` 64×64 @2x (~5–10 KB); favicon.ico regenerated from vv-favicon.svg multi-size; full icon set added (apple-touch 180×180 + site.webmanifest + android-chrome 192/512); BaseLayout `<link>` block expanded + theme-color meta #14B8A6; `.design-handoff/` mirrors all new derivatives; `alt="Viktor Vedmich"` (a11y over reference parity); generation via `scripts/generate-icons.mjs` using sharp + png-to-ico.
**Context gathered:** 12 (Footer match) — 2026-05-01 — `.planning/phases/12-footer-match/12-CONTEXT.md` — commit `aff1a8a` — 5 decisions locked. Remove 5 social-icon SVGs + `socialLinks` import (contacts already in Contact section via Phase 10); container aligned to `max-w-[1120px]` + mobile `px-4 sm:px-6` guard; drop `bg-surface/30` and border `/50` alpha → solid `border-border`; `text-[13px]` to match reference font-size; dynamic year via `new Date().getFullYear()` + bilingual i18n preserved (`footer.copyright`, `footer.built_with`). Target: ~14 LOC (from 43). Closes v0.4 milestone.

## Key decisions — Phase 7 Plan 1

- tags field is required array (no .optional()) per D-06 frontmatter schema — differs from blog collection where tags are optional
- video and slides fields use z.string().url().optional() for URL validation at build time
- YouTube embed uses @astro-community/astro-embed-youtube wrapper over lite-youtube-embed for Astro-native API

## Key decisions — Phase 7 Plan 2

- video and slides fields omitted from frontmatter when no URLs available — prevents z.string().url().optional() validation failure on empty strings
- Filenames use YYYY-slug.md pattern for chronological sorting
- Tags remain in English in both locales (topic keywords, not UI strings)
- Event and city names remain in English (proper nouns)
- Found 7 talks in speakingEvents (not 6 as plan stated) — created all 7 files

## Key decisions — Phase 6 Plan 1

- Kept `/images/book-cover-3d.jpg` over ref CSS faux cover (D-01) — JPG already has PACKT + V. Vedmich printed; same brand-asset-over-text-reproduction stance as Phase 5 DKT logo.
- Introduced first full-bleed coloured section band on the site — `bg-brand-accent-soft border-y border-brand-accent/30` (D-04).
- Added Amazon rating row ★★★★★ 4.8 · Amazon as hardcoded social proof — `const rating = 4.8` in frontmatter, ARIA-annotated, no i18n key (D-15, D-17, D-18, D-19).
- Dropped `max-w-3xl` card constraint so the card stretches the full `max-w-[1120px]` container width (D-10).
- Promoted 2-col `sm:flex-row` to 3-col grid `grid-cols-[140px_1fr_auto]` on desktop; mobile flex-col stack retained (D-08, D-09).
- Solid amber CTA button replaces ghost `text-accent` variant — matches ref Button `variant="accent"` (D-13).
