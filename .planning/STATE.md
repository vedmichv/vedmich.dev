---
gsd_state_version: 1.0
milestone: v0.4
milestone_name: milestone
current_phase: 06-book-packt-cover
status: executing
last_updated: "2026-04-21T07:38:29.363Z"
progress:
  total_phases: 6
  completed_phases: 4
  total_plans: 12
  completed_plans: 8
  percent: 67
---

# STATE.md

**Current milestone:** v0.4 — Reference Design Audit
**Current phase:** 06-book-packt-cover (Plan 1 of 1 complete — awaiting visual verify + push)
**Status:** Phase 6 Plan 1 implementation complete; visual verify pending
**Last updated:** 2026-04-21

## Completed phases

- ✅ Phase 1 — Header search pill + EN · RU switcher (commit `71e38e9`, deployed 2026-04-19)
- ✅ Phase 2 — Search palette ⌘K (commits `965eac9`, `6f0fb7b`, `e8361e4`, `4bc642b`)
- ✅ Phase 3 — Section order + About rewrite + Header token fidelity (commits `f21655f`, `381e0d9`, 2026-04-19)
- ✅ Phase 4 — Hero: match reference pixel-for-pixel (3 plans, 2026-04-19)
- ✅ Phase 5 — Podcasts: DKT teal + AWS RU amber badges (commit `de2e43d`, 2026-04-21)
- ⏳ Phase 6 — Book: PACKT cover + V. Vedmich emboss (Plan 1 implementation complete, commit `97c6e89`, 2026-04-21 — awaiting visual verify + push)

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
- [ ] Phase 7 — Speaking: timeline + arrows + inline city ← next
- [ ] Phase 8 — Presentations: match card format
- [ ] Phase 9 — Blog: 3 posts with correct card format
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

## Key decisions — Phase 6 Plan 1

- Kept `/images/book-cover-3d.jpg` over ref CSS faux cover (D-01) — JPG already has PACKT + V. Vedmich printed; same brand-asset-over-text-reproduction stance as Phase 5 DKT logo.
- Introduced first full-bleed coloured section band on the site — `bg-brand-accent-soft border-y border-brand-accent/30` (D-04).
- Added Amazon rating row ★★★★★ 4.8 · Amazon as hardcoded social proof — `const rating = 4.8` in frontmatter, ARIA-annotated, no i18n key (D-15, D-17, D-18, D-19).
- Dropped `max-w-3xl` card constraint so the card stretches the full `max-w-[1120px]` container width (D-10).
- Promoted 2-col `sm:flex-row` to 3-col grid `grid-cols-[140px_1fr_auto]` on desktop; mobile flex-col stack retained (D-08, D-09).
- Solid amber CTA button replaces ghost `text-accent` variant — matches ref Button `variant="accent"` (D-13).
