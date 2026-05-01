---
phase: 11-logo-favicon-refresh
plan: 02
subsystem: ui
tags: [component, layout, favicon, header, pwa, webmanifest, theme-color, a11y]

# Dependency graph
requires:
  - phase: 11-logo-favicon-refresh
    provides: "Plan 11-01 delivered public/vv-logo-hero.png (64x64, 5,459 B), public/favicon.ico (multi-size 16/32/48), public/apple-touch-icon.png (180x180), public/android-chrome-{192x192,512x512}.png, public/site.webmanifest (Deep Signal theme_color #14B8A6) — all ready on disk before this plan ran"
provides:
  - "src/components/Header.astro — Deep Signal hero logo with a11y alt='Viktor Vedmich' + loading='eager' + decoding='sync' (D-02, D-12)"
  - "src/layouts/BaseLayout.astro — full 5-tag icon + PWA manifest + theme-color #14B8A6 block in <head> (D-06)"
  - "dist/ EN + RU pages render new logo and icon stack symmetrically (D-11 invariant honoured — zero i18n edits)"
  - "Phase 11 REQ-007 acceptance items 3 + 4 completed (Header renders from hero PNG; build passes)"
affects: [12-footer-match (may reuse same theme-color + manifest pattern), future-phases-that-touch-Header-or-BaseLayout]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Head <link> block grouping by concern: canonical/hreflang (31-33) → icons+manifest+theme-color (35-40) → sitemap (41) → fonts preload (43-46). Mirrors the '<!-- Fonts: ... -->' sibling-comment style already in the file."
    - "Above-the-fold <img> loading strategy: loading='eager' + decoding='sync' pair — prevents async-decode paint stall on LCP-critical brand mark (D-02)."
    - "Theme-color hex-literal exception honoured: #14B8A6 in BaseLayout.astro meta matches --brand-primary token value; only meta/manifest are allowed to carry raw hex since they cannot reference CSS custom properties (REQ-007 exception documented in Plan 01 SUMMARY + CLAUDE.md)."
    - "Filename-based cache-bust: /vv-logo-hero.png is a new filename, so the swap from /favicon.svg naturally invalidates all intermediate caches without ?v= query strings (D-12)."

key-files:
  created: []
  modified:
    - "src/components/Header.astro — line 39 single-line swap (1+/1-, no line-count change; wc -l stays at 219)"
    - "src/layouts/BaseLayout.astro — line 35 expanded from 1 line to 6 lines (5+ insertions, wc -l 99 → 104); comment header + 4 new tags"

key-decisions:
  - "D-02 a11y-over-reference: alt='Viktor Vedmich' chosen over the reference UI kit's 'VV' — proper noun reads meaningfully to screen readers, identical in EN and RU, no i18n key needed."
  - "D-06 icon block ordering: SVG favicon first (modern browsers prefer it), ICO second (legacy Safari/Edge fallback), apple-touch-icon third (iOS), manifest fourth (PWA / Android), theme-color meta fifth (browser chrome)."
  - "Sitemap link intentionally kept AFTER the icon+manifest block (line 41), separating 'user-facing browser chrome' from 'machine-readable discovery' — sibling pattern preserved, no reorder of unrelated tags."
  - "Hex budget: BaseLayout.astro baseline hex count was 0, target delta +1 (#14B8A6). Final count: 1. No deprecated cyan (#06B6D4 / #22D3EE) introduced — CLAUDE.md anti-pattern table honoured."
  - "Plan-stated '7 page(s) built' assertion treated as STALE (pre-dates Phases 7/8/9 which added speaking + presentations + blog routes). Current main-branch + Plan 11-01 build emits 31 pages (confirmed in Plan 11-01 SUMMARY line 223). Reconciled as a deviation (Rule 3 — blocking: plan's grep gate would fail) rather than a plan-correctness issue."

patterns-established:
  - "Plan-level build count expectations in assertion form (e.g. '7 page(s) built') should be phrased against a live baseline at plan-write time. For this phase: verify 'build exits 0' + 'dist/en + dist/ru + all expected markup rendered' instead of a hard page-count match. Recorded as DEVIATION here for future plan authors."
  - "When swapping a <img src> pointing at a public/ asset, prefer a distinct filename (vv-logo-hero.png vs favicon.svg) over a query string — provides automatic cache invalidation at every CDN tier without maintenance debt."

requirements-completed: [REQ-007]

# Metrics
duration: 2m 12s
completed: 2026-05-01
---

# Phase 11 Plan 02: Component Wiring Summary

**Two-file surgical wiring — Header `<img>` now serves `/vv-logo-hero.png` with a11y alt + eager loading, and BaseLayout `<head>` now carries the full 5-tag Deep Signal icon + PWA manifest + `#14B8A6` theme-color block. Build green at 31 pages, EN/RU symmetric, zero i18n edits, zero deprecated cyan.**

## Performance

- **Duration:** 2 min 12 s
- **Started:** 2026-05-01T16:11:59Z
- **Completed:** 2026-05-01T16:14:11Z
- **Tasks:** 2 / 2 complete
- **Files modified:** 2 (source only — `dist/` is gitignored, package meta untouched)
- **`npm run build`:** 31 page(s) in 1.32s, zero warnings

## Accomplishments

- **Header logo swapped to Deep Signal hero PNG** — `src/components/Header.astro:39` now reads `<img src="/vv-logo-hero.png" alt="Viktor Vedmich" width="32" height="32" class="w-8 h-8 rounded-[7px] shrink-0" loading="eager" decoding="sync" />`. Four changes from the previous line (src, alt, +loading, +decoding), all other markup in the `<a href={getLocalizedPath('/', locale)}>` block (lines 37, 38, 40-43) left byte-identical. Line count of the file unchanged at 219.
- **BaseLayout head block expanded in place** — `src/layouts/BaseLayout.astro:35` went from one `<link rel="icon" type="image/svg+xml" href="/favicon.svg" />` line to a 6-line sibling block: `<!-- Icons + PWA manifest -->` comment + SVG favicon (preserved) + multi-size `.ico` (sizes="16x16 32x32 48x48") + apple-touch-icon (180x180) + PWA manifest + theme-color meta (#14B8A6). Sitemap link (line 41), fonts preload block (lines 44-46), and OG/Twitter tags all untouched. File grew by exactly +5 lines (99 → 104).
- **EN + RU rendered pages symmetric** — `dist/en/index.html` and `dist/ru/index.html` both contain the new `<img src="/vv-logo-hero.png" alt="Viktor Vedmich">` tag and the 5-tag icon block in identical order. `grep -c 'vv-logo-hero.png'` returns 1 in each — perfect parity.
- **Zero i18n string leakage (D-11)** — `grep -c 'favicon\|vv-logo' src/i18n/en.json src/i18n/ru.json` returns 0. Both `alt="Viktor Vedmich"` and `theme-color` are locale-neutral proper nouns / tokens.
- **Zero deprecated cyan** — `grep -E '#06B6D4|#22D3EE' src/components/Header.astro src/layouts/BaseLayout.astro` returns 0 matches. Only hex introduced is the D-06-approved `#14B8A6` in BaseLayout (baseline 0 → final 1, delta exactly +1 as acceptance criterion required).

## Task Commits

Each task committed atomically with the verbatim action block; per-task grep gates all passed before commit.

1. **Task 1: Swap Header logo to /vv-logo-hero.png with a11y alt + eager loading** — `1428a61` (`feat(11-02): swap Header logo to /vv-logo-hero.png with a11y alt + eager loading`)
   - 1 file changed (`src/components/Header.astro`), +1 / -1 lines
   - All 10 acceptance criteria met (src/alt/loading/decoding counts = 1; old src/alt absent; rounded-[7px] + w-8 h-8 preserved; exactly 1 `<img>` tag; line count unchanged)

2. **Task 2: Expand BaseLayout icon block + phase-level build / i18n / hex gate** — `677739c` (`feat(11-02): expand BaseLayout head with full icon + PWA manifest + theme-color`)
   - 1 file changed (`src/layouts/BaseLayout.astro`), +5 insertions
   - All 17 acceptance criteria met (6 tag-count grep gates × 1 each, hex hygiene, i18n invariants × 2 locales, build exits 0, dist/en + dist/ru render logo/theme-color/apple-touch-icon/site.webmanifest, EN/RU symmetric)
   - **NOTE on page count:** Plan acceptance said `7 page(s) built`. Actual build emits 31 pages — Phases 7/8/9 added speaking + presentations + blog routes after the plan was drafted. Reconciled under `Deviations` below.

_Plan metadata commit (this SUMMARY.md) will be created by the orchestrator after the verifier signs off — worktree-mode executor contract. STATE.md + ROADMAP.md are NOT touched by this agent._

## Files Created/Modified

**Modified — 2:**

- `src/components/Header.astro` (1+/1-) — line 39 `<img>` attributes updated (`src`, `alt`, `+loading`, `+decoding`). No other line touched. Line count unchanged at 219.
- `src/layouts/BaseLayout.astro` (5+) — line 35 single `<link rel="icon">` expanded in place to a 6-line block: comment header + SVG favicon (preserved) + ICO multi-size + apple-touch-icon + manifest + theme-color meta. Line 36 (sitemap), lines 38-41 (fonts preload), and the rest of the file unchanged. Line count 99 → 104.

**Created:** None.

**Reused from Plan 11-01 (no changes in this plan):**

- `public/vv-logo-hero.png` (5,459 B, 64×64)
- `public/favicon.svg` (preserved — kept as the first `<link rel="icon">` for modern browsers)
- `public/favicon.ico` (15,086 B, multi-size 16/32/48)
- `public/apple-touch-icon.png` (4,216 B, 180×180)
- `public/site.webmanifest` (402 B JSON, Deep Signal theme_color `#14B8A6`)

## Decisions Made

- **D-02 a11y alt text resolved in favour of accessibility over reference parity.** The reference UI kit used `alt="VV"`. Plan CONTEXT locked `alt="Viktor Vedmich"` because (a) screen readers announce the full name, giving context to assistive tech users, and (b) the string is a proper noun identical in EN and RU, so no i18n key is introduced — preserves D-11 invariant automatically.
- **D-02 paint strategy: `loading="eager"` + `decoding="sync"` paired together.** Above-the-fold brand mark must not be lazy-loaded (hurts LCP). `decoding="sync"` ensures the decode is not deferred to async even when the browser attempts to defer it — pair-together idiom prevents paint-stall on the hero pixel.
- **D-06 icon block ordering follows modern→legacy fallback chain.** SVG favicon first (scales without quality loss, preferred by modern browsers), multi-size ICO second (legacy Safari/Edge that ignore `type="image/svg+xml"`), apple-touch-icon third (iOS home-screen), manifest fourth (Android + PWA), theme-color meta fifth (sets browser chrome colour on supported platforms). All five land in a contiguous block with a single sibling `<!-- Icons + PWA manifest -->` comment header, mirroring the pre-existing `<!-- Fonts: ... -->` comment idiom on line 43.
- **D-12 filename-based cache invalidation.** Previous Header `<img src>` pointed at `/favicon.svg`. New `<img src>` is `/vv-logo-hero.png` — a distinct filename, so every CDN tier (GitHub Pages edge, any downstream browser cache) sees it as a fresh resource without query-string version suffixes. No maintenance debt; new filenames for future refreshes will cascade the same way.
- **D-11 invariant honoured without additional effort.** `grep -c 'favicon\|vv-logo' src/i18n/en.json src/i18n/ru.json` = 0 both before and after this plan. Neither `alt="Viktor Vedmich"` nor `theme-color` are locale-specific strings, so no key was added to en.json or ru.json. The Russian alt would also be "Viktor Vedmich" (Latin-letter proper noun in CV/bio context), so there is no locale-bifurcation pressure.

## Deviations from Plan

### Rule 3 — Blocking

**1. [Rule 3 - Blocking] Plan's `npm run build` page-count assertion is stale**

- **Found during:** Task 2 build gate (`grep -q '7 page(s) built' /tmp/ph11-build.log`).
- **Issue:** The plan's `<verify>` block and several `<acceptance_criteria>` items assert `7 page(s) built`. This was correct at the time the milestone's ROADMAP / CONSTRAINTS snapshot was written (pre-Phase-7), but Phases 7 (Speaking Portfolio + 7 talk slug pages × 2 locales), 8 (Presentations — Content Collection with multiple decks), and 9 (Blog — 3 posts × 2 locales) all added routes since. Plan 11-01's SUMMARY self-check explicitly recorded `31 pages in 1.51 s` as the post-pipeline build result — confirming this is not a new issue from this plan but a baseline that shifted.
- **Fix:** Left the actual implementation untouched (nothing to "fix" in code — build is green, Astro emits 31 pages in 1.32s). Adjusted the interpretation of Task 2's automated verify gate per project_notes guidance: treat "7 pages" as "build exits 0 + EN/RU symmetric + expected markup present in dist/". All four substantive checks pass:
  - `npm run build` exits 0
  - `dist/en/index.html` AND `dist/ru/index.html` exist
  - Both render `vv-logo-hero.png`, `theme-color`, `apple-touch-icon`, `site.webmanifest`
  - `grep -c 'vv-logo-hero.png' dist/en/index.html` == `grep -c 'vv-logo-hero.png' dist/ru/index.html` (both = 1)
- **Files modified:** None (this is a verification-interpretation fix, not a code fix).
- **Verification:** 31 pages built, zero warnings, 1.32s total. Build log at `/tmp/ph11-build.log`.
- **Committed in:** N/A (no code change).

### Rule 2 — Missing Critical? No.

No missing-critical-functionality auto-fixes were needed. Plan 01 already delivered all assets referenced by the new `<link>` tags (the SUMMARY self-check confirms each asset exists at expected size). The Header `<img>` and BaseLayout `<link>` blocks are purely declarative swaps.

### Rule 1 — Bug fixes? No.

No bug fixes. Both tasks compiled and rendered first-try. No retries, no re-edits.

---

**Total deviations:** 1 auto-fixed (1 blocking — plan's stale 7-page count assertion reconciled to actual 31-page reality; zero code impact, documented here for future plan authors).
**Impact on plan:** Zero on implementation — all code edits executed verbatim per the plan's `<action>` blocks. The deviation is a documentation / plan-authoring note: future build-count acceptance criteria should be phrased against live baselines, not frozen snapshots.

## Issues Encountered

One operational hiccup at agent startup — not a plan issue:

- **Worktree HEAD diverged from orchestrator base.** The `<worktree_branch_check>` preamble compared `git merge-base HEAD 337e7dee...` and found `319037c` (5 commits behind the required base). This meant the freshly-created worktree branch started from a pre-Phase-11 commit, so Plan 11-01 artifacts (`public/vv-logo-hero.png`, `public/favicon.ico`, etc.) were missing. Per the preamble's guidance, hard-reset the branch to the required base with `git reset --hard 337e7dee...`. The reset succeeded (verified `git rev-parse HEAD` = `337e7dee...`) and all Plan 01 assets were present after the reset. Plan execution then proceeded normally.

No authentication gates. No checkpoints. No retries on any acceptance criterion.

## User Setup Required

None — no external service configuration, no secrets, no environment variables required. After this plan's commits land on `main`:

- GH Actions will auto-deploy to `vedmich.dev` in ~2 minutes.
- Browser tab favicon will refresh to Deep Signal teal V (visible in a fresh browser profile; existing visitors may need a hard-reload for the new `.ico` file — standard favicon cache behaviour).
- iOS Safari "Add to Home Screen" will use the new 180×180 apple-touch-icon.
- PWA installers (Edge/Chrome "Install app") will read `site.webmanifest` and present Deep Signal branding + icon set.

## Next Phase Readiness

Phase 11 is complete at a plan level. Plan 11-01 (asset pipeline) + Plan 11-02 (component wiring) together satisfy all four REQ-007 acceptance items:

1. **3 canonical SVGs in `public/` + `.design-handoff/`** — delivered by Plan 11-01 Task 2.
2. **Browser tab favicon refreshed to Deep Signal teal V** — delivered by Plan 11-01 Task 2 (`public/favicon.ico` regenerated from `vv-favicon.svg`). Visually verifiable on live site after deploy.
3. **Header logo renders from new primary/hero PNG** — delivered by this plan Task 1.
4. **`npm run build` passes** — delivered by this plan Task 2 (31 pages in 1.32s, zero warnings).

**Blockers for downstream work:** None.

**Follow-ups deferred per 11-CONTEXT.md "Deferred Ideas" (awareness only, not this plan's scope):**

- **Lighthouse audit** — post-deploy, run Lighthouse on `https://vedmich.dev/en/` to confirm LCP stays below 1.5s with the new 5,459 B hero PNG in the critical-path header. Not blocking — budget is 46% under the 10 KB cap already.
- **OG image refresh** — current Open Graph + Twitter cards don't reference a Deep Signal-branded preview image. Future phase could generate a `/og-image.png` via a Canvas / Playwright capture script and wire it via `<meta property="og:image">` in BaseLayout.
- **Light-mode variants for LinkedIn embeds** — the `public/vv-logo-inverse.svg` exists for this use case but is not yet wired. If/when LinkedIn or OG previews require light-background rendering, a dedicated layout can point at it.
- **`npm audit fix` review for sharp/png-to-ico transitive tree** — noted in Plan 11-01 SUMMARY as a deferred follow-up; unchanged by this plan.

**Phase 12 (Footer match) can begin immediately** — no dependency on further Phase 11 work. Phase 12 may reuse the same `#14B8A6` theme-color convention if it adds any browser-chrome affordance.

## Threat Flags

No new threat-relevant surface. All threats in Plan 11-02's `<threat_model>` (T-11-06 manifest disclosure, T-11-07 apple-touch-icon brand disclosure, T-11-08 MITM icon replacement over HTTP) carry `accept` dispositions per the plan:

- **T-11-06** — `/site.webmanifest` is linked publicly from every page. Accepted because the manifest contains only public brand metadata (theme color, background color, icon paths, display mode); no PII, no secrets. Fetching it without credentials is standard PWA behaviour.
- **T-11-07** — apple-touch-icon + android-chrome icons advertise brand colour scheme to passive observers (e.g. network monitors). Accepted because icons are already public via `favicon.svg`; high-resolution variants do not change the threat model.
- **T-11-08** — Tampering with raster icons over HTTP. Accepted because GitHub Pages serves `vedmich.dev` over HTTPS with HSTS; out-of-scope for this phase (server-side setting).

No new trust boundaries added — all new `<link>` tags reference same-origin `public/` assets, and the `<meta name="theme-color">` value is a hardcoded brand token with no dynamic content path.

## Self-Check: PASSED

Every claim in this SUMMARY was verified via grep / test / build before write:

- **Files exist:**
  - `src/components/Header.astro` — FOUND (219 lines, line 39 carries the new `<img>` tag verified via `grep -n 'vv-logo-hero' src/components/Header.astro`)
  - `src/layouts/BaseLayout.astro` — FOUND (104 lines, lines 35-40 carry the 6-line icon block verified via inline Read offset=30 limit=20)
- **Commits exist:**
  - `1428a61` — FOUND (`git log --oneline` output shows `feat(11-02): swap Header logo...`)
  - `677739c` — FOUND (`git log --oneline` output shows `feat(11-02): expand BaseLayout head...`)
- **Build regression:**
  - `npm run build` → `31 page(s) built in 1.32s`, zero warnings — FOUND in `/tmp/ph11-build.log` tail.
- **EN/RU symmetry:**
  - `grep -c 'vv-logo-hero.png' dist/en/index.html` = 1 AND `grep -c 'vv-logo-hero.png' dist/ru/index.html` = 1 — PASS.
- **Hex hygiene:**
  - `grep -cE '#[0-9A-Fa-f]{3,6}' src/layouts/BaseLayout.astro` = 1 (delta +1 from baseline 0, matches the single `#14B8A6` theme-color as the only hex) — PASS.
  - `grep -E '#06B6D4|#22D3EE' src/components/Header.astro src/layouts/BaseLayout.astro` returns 0 matches — PASS.
- **i18n invariant:**
  - `grep -c 'favicon\|vv-logo' src/i18n/en.json src/i18n/ru.json` = 0 matches total — PASS.

---
*Phase: 11-logo-favicon-refresh*
*Plan: 02*
*Completed: 2026-05-01*
