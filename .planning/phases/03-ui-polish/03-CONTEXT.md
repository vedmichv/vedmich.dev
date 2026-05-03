# Phase 3: UI Polish - Context

**Gathered:** 2026-05-03
**Status:** Ready for planning

<domain>
## Phase Boundary

Polish the homepage UX against the Deep Signal reference (`app.jsx`) by (a) adding bottom "All posts →" / "All decks →" CTA links under the Blog and Presentations grids, (b) unifying hover behavior on `BlogCard`/`PresentationCard` so they match the reference Card pattern (teal border + teal glow + 250ms expo-out), (c) adding a staggered fade-in cascade (60ms per child, CSS-only) to cards in the Blog and Presentations grids, and (d) running a light spacing/typography audit across all homepage sections on 1440×900 + 375px, fixing token drift and alignment nits only. Phase also folds WR-03: ship `tests/unit/shiki-palette-guard.test.ts` so Phase 2's 8 Shiki hex overrides fail fast on a silent github-dark palette bump.

**Affects:** `src/styles/global.css` (`.card-glow` easing comment alignment, new `.animate-on-scroll-stagger` variant), `src/styles/design-tokens.css` (update `--transition-normal` to `250ms cubic-bezier(0.16, 1, 0.3, 1)` — expo-out — to match reference), `src/components/BlogPreview.astro` (add bottom CTA, wrap grid in stagger variant), `src/components/Presentations.astro` (same), `tests/unit/shiki-palette-guard.test.ts` (new), and whatever homepage components surface during the audit (`.planning/phases/03-ui-polish/AUDIT.md` tracks the list).

**Not in this phase (explicit):**
- **Rename `blog.all_posts` → `blog.see_all` / `presentations.all_decks` → `presentations.see_all`** — REQUIREMENTS.md POLISH-01..03 drift accepted. The existing keys stay; REQUIREMENTS.md gets a corrective pass after the phase.
- **Extract a shared `<SectionHeaderCTA>` component** — refactor deferred; current inline `<a>` in each section stays.
- **Top CTA changes** — both BlogPreview and Presentations already have top CTAs; Phase 3 only adds the bottom CTA and verifies the top is unchanged.
- **Speaking section redesign (timeline → cards)** — Speaking stays a timeline (`border-l-2 border-border pl-5` rows). REQUIREMENTS.md mention of "Speaking card" is documentation drift; `speaking.all_talks` already exists and works. Unify CTA visual style across all 3 sections only.
- **Translate-Y lift on cards** — reference `app.jsx` Card does NOT translate-Y (only border + glow). Phase 3 follows the reference.
- **Amber underline on card titles** — rejected; would mix brand-primary title with brand-accent underline and conflict with the bio accent pattern (`text-brand-accent` for `About.bio_accent`).
- **Stagger on About / Speaking / Podcasts** — stagger applies only to Blog + Presentations grids (cards). Heading + subtitle appear simultaneously with cards' cascade.
- **Pixel-diff automated regression gate** — visual audit is human-eye on before/after screenshots in `AUDIT.md`, not programmatic pixel threshold.

</domain>

<decisions>
## Implementation Decisions

### i18n Keys for CTA Links (POLISH-01 / POLISH-02 / POLISH-03)
- **D-01:** **Keep existing `blog.all_posts` and `presentations.all_decks` keys as-is.** REQUIREMENTS.md (POLISH-01..03) names `blog.see_all` + `presentations.see_all`, but both i18n keys already exist, already render live, and "All posts" / "Все посты" is arguably clearer than "See all posts". Rename would force 4 edits (en/ru × 2 sections) for zero user-facing delta. REQUIREMENTS.md corrected in a post-phase doc-drift commit.
- **D-01b:** **Bottom CTA text = identical to top CTA text.** "All posts →" top, "All posts →" bottom. Same `i.blog.all_posts` / `i.presentations.all_decks` key. Predictable, no new keys, reader muscle-memory.
- **D-01c:** **Unify CTA visual style across Blog + Presentations + Speaking.** `Speaking.astro:66-68` already ships `text-brand-primary hover:text-brand-primary-hover transition-colors` (slightly different tone from BlogPreview's `text-text-muted hover:text-brand-primary`). Decide one canonical style for "section all X →" links and apply across all 3. Candidate style: `text-sm text-text-muted hover:text-brand-primary transition-colors whitespace-nowrap` (BlogPreview's current shape, matches the quieter tone of the homepage). Planner verifies final style during research.
- **D-01d:** **`whitespace-nowrap` stays on top CTA** — tolerate title truncation on mobile. H2 strings ("Blog", "Recent decks", "Свежие доклады") are short; title truncation hasn't surfaced as a problem.
- **D-01e:** **REQUIREMENTS.md drift captured as doc-only fix** — after Phase 3 ships, update `.planning/REQUIREMENTS.md` POLISH-01..03 language to say "keeping existing `blog.all_posts` / `presentations.all_decks` / `speaking.all_talks` keys" so future milestones don't re-litigate.

### Card Hover Behavior (POLISH-05)
- **D-02:** **Follow reference `app.jsx` Card pattern.** Hover signal = `border-brand-primary` (teal border) + `box-shadow: 0 0 20px rgba(20,184,166,.15)` (teal glow). No translate-Y lift, no amber underline on title. Current `.card-glow` in `src/styles/global.css:118-124` already does this via `var(--shadow-glow)` token — correct pattern, correct tokens. Phase 3 verifies it renders per-reference and aligns easing curve (see D-02b).
- **D-02b:** **Update `--transition-normal` to `250ms cubic-bezier(0.16, 1, 0.3, 1)` (expo-out)** in `src/styles/design-tokens.css` — matches reference `app.jsx:162`. Current token is `250ms ease-out`. Duration identical, curve shifts to expo-out (fast start, smooth settle) per reference. This touches every `.card-glow`, every other site-wide `var(--transition-normal)` consumer. Planner scans for unintended consequences; if any hover state breaks, per-component override allowed but document it. Accept the global token change — minor perceptual difference, correct brand-system contract.
- **D-02c:** **Keep `.card-glow` transition as an explicit prop list** (`transition: box-shadow var(--transition-normal), border-color var(--transition-normal)`). NOT `transition: all`. Reason: `.card-glow:hover` triggers `group-hover:text-brand-primary` on the title inside the anchor — we want the color change to inherit prose defaults, not be in the transition list. Current code is correct; keep it.
- **D-02d:** **Keep existing `group-hover:text-brand-primary` on card titles** (BlogCard + PresentationCard) — subtle inner-card affordance layered on top of the border+glow. Not in reference Card but already in code; zero-cost.
- **D-02e:** **Speaking timeline stays as-is** — `Speaking.astro:45-58` renders `border-l-2 border-border pl-5` rows, not cards. Existing `hover:text-brand-primary transition-colors` on the talk link is enough. No hover lift on year labels (static).

### Stagger Animation (POLISH-04)
- **D-03:** **Cards-only stagger in Blog + Presentations grids.** Heading + subtitle appear simultaneously (one `.animate-on-scroll`); cards cascade via `.animate-on-scroll` applied per-child on the grid, with per-child delay via CSS `:nth-child`.
- **D-03b:** **60ms per child.** Mid-range of POLISH-04's 50–100ms window. For 3-card BlogPreview grid: 0/60/120ms offsets → full cascade lands at ~180ms + 600ms `fadeInUp` = ~780ms total. For 6-card Presentations grid: 0..300ms offsets → ~900ms total. Feels alive but not laggy.
- **D-03c:** **Implement via CSS `:nth-child` + `animation-delay`** — pure CSS, zero runtime JS. New class variant `.animate-on-scroll-stagger` that wraps a grid; children selected via `.animate-on-scroll-stagger > .animate-on-scroll:nth-child(n) { animation-delay: calc(60ms * (n - 1)); }`. Planner picks exact selector shape (`> *` vs `> .animate-on-scroll`) and nth-child handling for ≥ 10 cards (cap at 10 via `:nth-child(-n+10)` + `:nth-child(n+11) { animation-delay: 540ms }`, or let it run unbounded — planner's call).
- **D-03d:** **Preserves current IntersectionObserver gate** — cards still wait for `is-visible` to start animating. The stagger just controls when each card begins its 0.6s `fadeInUp` after the grid itself is marked visible. Cards inside a non-intersecting grid stay `opacity: 0` and don't play yet.
- **D-03e:** **`prefers-reduced-motion: reduce` fallback** — extends the existing rule in `src/styles/global.css:134-146`. Stagger children get `animation-delay: 0` + `opacity: 1` under reduced-motion (no cascade, no fade, all cards visible). Current global rule already forces `animation-duration: 0.01ms !important` + unhides `.animate-on-scroll` — planner verifies the stagger variant inherits this correctly and adds any missing guards.
- **D-03f:** **`<noscript>` fallback in BaseLayout already unhides `.animate-on-scroll`** (line 48-52) — stagger variant children inherit this. No-JS users see all cards immediately with no cascade. OK.

### Spacing/Typography Audit (POLISH-06)
- **D-04:** **Light audit pass — fix token drift + alignment errors only.** Scope: hardcoded hex/sizes, non-4px-grid padding, misaligned baselines, stray `m-0` or margin conflicts. NOT a full pixel-perfect reference match — accept that the live site is already "95% reference" and Phase 3 brings it to "98% reference". Reference artifact: `/Users/viktor/.claude/skills/viktor-vedmich-design/ui_kits/vedmich-dev/app.jsx`.
- **D-04b:** **Viewports: 1440×900 (desktop) + 375px (mobile).** Reference defines layout behavior at 1440 (per PROJECT.md / CLAUDE.md), mobile target per REQUIREMENTS.md POLISH-06. Capture screenshots of all 7 homepage sections (Hero, About, Podcasts, Speaking, Book, Presentations, Blog; Contact optional — Phase 10 closed it out) at both viewports — 14 baseline screenshots.
- **D-04c:** **Playwright via `playwright-cli` skill, attach-to-real-Chrome mode** (per memory: use `attach --extension` with `PLAYWRIGHT_MCP_EXTENSION_TOKEN`, not fresh browser). Live-site screenshots, not `localhost:4321` — mirrors real deploy appearance.
- **D-04d:** **Findings tracked in `.planning/phases/03-ui-polish/AUDIT.md`** as a table: `| Section | Viewport | Finding | Fix | Status |`. Before/after screenshots committed to `.planning/phases/03-ui-polish/baselines/` and `.planning/phases/03-ui-polish/after/`. AUDIT.md becomes the permanent record for future phases that reference the reference-site alignment state.
- **D-04e:** **Each spacing fix = atomic commit** (`fix(03): tighten about.bio leading` style), mirroring Phase 2's commit hygiene. AUDIT.md updated in same commit as the fix.

### WR-03: Shiki Palette Guard Test (folded from pending todo)
- **D-05:** **Ship `tests/unit/shiki-palette-guard.test.ts`** in Phase 3. Follows the spec in `.planning/todos/pending/shiki-palette-guard.md` verbatim: 8 `codeToHtml(...theme: 'github-dark')` assertions, one per load-bearing hex that Phase 2's CSS overrides depend on (`#F97583`, `#9ECBFF`, `#85E89D`, `#79B8FF`, `#6A737D`, `#B392F0`, `#FFAB70`, `#E1E4E8`).
- **D-05b:** **Wired into `npm run test:unit`** alongside existing Node test runner tests. Pass expected on current shiki@3.21.x (Astro ^5.18.0). If any fail → the bump silently drifted palette; the failing test's assertion message points to the exact hex selector in `src/styles/global.css` that needs updating.
- **D-05c:** **Documented in `CLAUDE.md` § Deep Signal Design System** as "Shiki palette guard pattern" — note the test + when to run it (before `npm update astro`). Mirror to vault backup per three-way-sync rule is not needed (skill-scope rule only); CLAUDE.md is per-project.
- **D-05d:** **Scope annotation: this is Phase 2 tech-debt closure, not UI polish** — acknowledged. Folding it into Phase 3 rather than leaving it as a loose pending todo prevents it getting orphaned before Phase 4 Excalidraw's bundle-size risk reintroduces npm churn. 30-minute add-on, low risk.

### Claude's Discretion
- **Final class name for stagger variant** — `.animate-on-scroll-stagger` vs `.stagger` vs `.animate-stagger`. Planner picks.
- **Exact `:nth-child` cap handling** for > 10 card grids — bounded cascade vs unbounded vs progressive decay of per-child delay (180ms → 150ms → 120ms…). Planner researches; 3-card Blog grid + 6-card Presentations grid are the only consumers in v1.0, so cap at 10 is safe.
- **`--transition-normal` scan** — when updating to expo-out, planner checks whether any other site-wide consumer (SearchPalette, Header hover, Footer links) needs a different curve. If so, case-by-case override with a new token (`--transition-hover`, `--transition-ui`).
- **AUDIT.md table columns** — keep the 5-col minimum (section / viewport / finding / fix / status) or expand. Planner picks.
- **Before/after screenshot file naming** — `{section}-1440-before.png` vs `before/{section}-1440.png`. Planner picks one convention.
- **CTA visual unification across all 3 sections (D-01c)** — if the three current styles fight, planner picks one canonical shape and applies it. Default: BlogPreview's `text-sm text-text-muted hover:text-brand-primary transition-colors whitespace-nowrap` since it's the most reference-aligned (subtle quaternary link).
- **Top vs bottom CTA rendering for empty state** — BlogPreview already guards `posts.length > 0` around the top CTA. Planner decides whether the bottom CTA guards identically (probably yes — no cards = no sense showing "all posts" link under them).
- **Exact `.planning/phases/03-ui-polish/AUDIT.md` headers and scoring** — planner's call; don't over-engineer. Simple table sufficient.

### Folded Todos
- **WR-03 — Shiki github-dark palette guard test** (from `.planning/todos/pending/shiki-palette-guard.md`): Adds `tests/unit/shiki-palette-guard.test.ts` with 8 assertions pinning github-dark hex colors that Phase 2 CSS overrides depend on. 30 min effort. Scope note: this is Phase 2 tech-debt closure folded into Phase 3 to prevent orphan before Phase 4 bundle-size churn. See D-05..D-05d.

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Phase scope & requirements
- `.planning/ROADMAP.md` §Phase 3 UI Polish — 5 success criteria (bottom CTAs, unified hover, staggered reveal, audit-to-zero-nits, bilingual keys)
- `.planning/REQUIREMENTS.md` §Homepage Polish — POLISH-01..06 full spec (note: POLISH-01/02/03 say `blog.see_all` / `presentations.see_all`; per D-01 we keep existing `all_posts` / `all_decks` keys and fix REQUIREMENTS.md language post-phase)
- `.planning/todos/pending/shiki-palette-guard.md` — WR-03 spec (folded via D-05)

### Reference artifact (design source of truth)
- `/Users/viktor/.claude/skills/viktor-vedmich-design/ui_kits/vedmich-dev/app.jsx` — Deep Signal reference UI kit. Card component at lines 157-168 defines the canonical hover pattern: `border-brand-primary` + `box-shadow: 0 0 20px rgba(20,184,166,.15)` + `transition: all 250ms cubic-bezier(0.16, 1, 0.3, 1)`. No translate-Y.

### Research artifacts (v1.0 kickoff, 2026-05-02)
- `.planning/research/SUMMARY.md` — v1.0 milestone synthesis
- `.planning/research/ARCHITECTURE.md` — integration patterns (animate-on-scroll IntersectionObserver section confirms current gate works for stagger)
- `.planning/research/PITFALLS.md` — Pitfall 2 (Shiki regression — informs D-05 guard test value) + Pitfall 4 (hardcoded coords — reminder for audit)

### Code references (what to read / what to mirror)
- `src/styles/global.css:109-146` — current `.animate-on-scroll` (single-element fadeInUp), `.card-glow` (border+glow on hover), `prefers-reduced-motion` block. All three extend or constrain Phase 3 work.
- `src/styles/design-tokens.css:233-236` — `--transition-fast / --transition-normal / --transition-slow` tokens. D-02b updates `--transition-normal` in place.
- `src/components/BlogPreview.astro:22-48` — top CTA already present (line 27-34); grid of cards (line 37-41); empty-state fallback (line 42-46). Bottom CTA gets inserted after the grid, same guard.
- `src/components/Presentations.astro:24-43` — same pattern; top CTA line 28-34, grid line 37-41. Bottom CTA after grid.
- `src/components/Speaking.astro:64-69` — existing bottom "All talks →" link. Candidate reference for D-01c unified style (or the one that gets replaced).
- `src/components/BlogCard.astro` — card layout, `.card-glow animate-on-scroll` classes (line 26), `group-hover:text-brand-primary` title (line 31). Hover behavior lives here.
- `src/components/PresentationCard.astro` — same shape as BlogCard (line 24, line 32).
- `src/components/About.astro`, `Podcasts.astro`, `Hero.astro`, `Book.astro`, `Contact.astro` — audit targets for POLISH-06 spacing pass.
- `src/layouts/BaseLayout.astro:48-52` — `<noscript>` unhide rule (stagger variant must inherit); line 87-112 IntersectionObserver script (stagger relies on `.is-visible` class landing, no change needed here).
- `src/i18n/en.json:60,66` + `src/i18n/ru.json:60,66` — existing `blog.all_posts` / `presentations.all_decks` keys. No edits needed per D-01.

### Prior phase context
- `.planning/phases/02-code-block-upgrades/02-CONTEXT.md` — Phase 2 decisions, including the 8 Shiki hex overrides that WR-03 guards (D-05).
- `.planning/phases/01-rich-media-primitives/01-CONTEXT.md` — Phase 1 decisions, includes reduced-motion pattern (D-18 there) that Phase 3 stagger inherits.

### Libraries
- `shiki` — already installed; `codeToHtml` API used in WR-03 guard test (D-05). Reference: https://shiki.style/packages/core
- `@playwright/test` — already installed (Phase 1, 2); used for visual audit via `playwright-cli` skill in attach-to-real-Chrome mode (per memory: `attach --extension` + `PLAYWRIGHT_MCP_EXTENSION_TOKEN`).

### Project constraints
- `CLAUDE.md` §Deep Signal Design System — token-only (no hex), bilingual parity, `.prose` scoping.
- `CLAUDE.md` §Publishing Workflow — big design changes need branch + visual review; Phase 3 qualifies for branch flow (not push-to-main).
- `.planning/PROJECT.md` §Validated decisions — zero-JS default (stagger implementation via CSS `:nth-child` honors this).
- `.planning/STATE.md` — current milestone state. Phase 3 is next.

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- **`.card-glow` class** (`src/styles/global.css:118-124`) — already implements reference Card hover (teal border + teal glow via `var(--shadow-glow)`). BlogCard + PresentationCard already apply it (line 26 / 24). Phase 3 only updates the `--transition-normal` curve (D-02b) to bring the easing in-line with reference.
- **`.animate-on-scroll`** (`src/styles/global.css:109-115`) — baseline fade-in rule. Phase 3 extends via a `.animate-on-scroll-stagger` wrapper class that adds per-child `animation-delay`, not by replacing the base class. Back-compat preserved across all existing sections (About, Speaking, Podcasts, Hero).
- **IntersectionObserver script in `BaseLayout.astro`** — already handles the `.is-visible` gate. Stagger variant children reuse it as-is.
- **`<noscript>` unhide + `prefers-reduced-motion` guard** (`BaseLayout.astro:48-52` + `global.css:134-146`) — stagger inherits; D-03e/D-03f cover the edge cases.
- **`src/components/Speaking.astro:66-68`** — existing bottom "All talks →" CTA. Either the source of the unified CTA style (D-01c) or the target to harmonize with BlogPreview's variant.
- **`shiki` + `codeToHtml`** — already transitively installed by Astro 5; `test/` directory pattern already established in Phase 1+2 for `npm run test:unit` via node:test. WR-03 test slots in cleanly.
- **`design-tokens.css` tokens** — all colors needed for Phase 3 already exist: `--shadow-glow`, `--brand-primary`, `--text-muted`, `--border`, `--transition-normal` (with D-02b curve update).

### Established Patterns
- **Single-class animate-on-scroll + IntersectionObserver** — the site's entire motion system. Phase 3 stagger extends the contract, doesn't break it.
- **Atomic fix commits with `fix(NN): ...` prefix** — audit fixes in D-04e follow Phase 2's pattern (`fix(02): move YAML badge right`).
- **Bilingual i18n parity via `t(locale)` helper** — every user-facing string lives in both `en.json` + `ru.json`. Phase 3 adds zero new keys per D-01.
- **`.prose` scoping for blog-only styles** — audit findings that touch blog layout (not applicable for Phase 3 scope — blog-index / blog-detail pages are outside Phase 3 audit target, only homepage).
- **"Push to main" for small changes** (per CLAUDE.md §Publishing workflow) — but Phase 3 touches design tokens globally (D-02b) and adds ~100 LOC across 4+ files. Treat as big change: branch + visual review.

### Integration Points
- `src/styles/design-tokens.css` — single-line update to `--transition-normal` (D-02b). Cascades to every consumer; audit sweep part of POLISH-06.
- `src/styles/global.css` — append `.animate-on-scroll-stagger` rule + extend `prefers-reduced-motion` block.
- `src/components/BlogPreview.astro` + `src/components/Presentations.astro` — add bottom CTA (mirror existing top CTA shape); wrap grid `<div>` in stagger variant class.
- `src/components/Speaking.astro` — either source or target of unified CTA visual style (D-01c); planner decides during implementation.
- `tests/unit/shiki-palette-guard.test.ts` — new file, wired into existing `npm run test:unit` script.
- `CLAUDE.md` — new "Shiki palette guard pattern" subsection in §Deep Signal Design System per D-05c.
- `.planning/phases/03-ui-polish/AUDIT.md` — audit artifact; referenced by future phases' audits as the homepage baseline record.

### Creative options
- **CSS variable per card for stagger index** (`style={{'--stagger-idx': i}}` + `animation-delay: calc(60ms * var(--stagger-idx))`) — alternative to `:nth-child`, works even if cards aren't direct siblings. Planner chooses if grid DOM ever nests cards inside wrapper divs (not current case but possible).
- **Unify `.card-glow` with an inline `@apply transition-colors`** in Tailwind 4 `@theme` — probably not worth it; the current 6-line global rule is canonical and discoverable. Keep.
- **Grow audit scope into a `grid-audit.md` design-tokens reference guide** — tempting but out of scope. Audit stays phase-specific; design-tokens.css is the canonical token reference.

</code_context>

<specifics>
## Specific Ideas

- User chose "Recommended" on every Phase 3 gray area (same pattern as Phase 2, Phase 1). Preferences align cleanly with reference-first discipline: keep existing keys, follow reference Card pattern, CSS-only stagger, light audit, before/after screenshots.
- User explicitly folded WR-03 (Shiki palette guard) into Phase 3 — accepting 30-min add-on rather than letting it drift toward Phase 4 Excalidraw's bundle-size risk. Planner respects this: WR-03 ships as part of Phase 3 even though it's Phase 2 tech-debt.
- User chose to update `--transition-normal` globally (D-02b) rather than per-component — accepting that one site-wide easing change touches every hover state. Planner must scan for unintended consequences (SearchPalette, Header, Footer hovers) and document findings.
- User kept Speaking as timeline (not cards) — REQUIREMENTS.md drift on "Speaking card" accepted; CTA style unification (D-01c) is the only Speaking touch in Phase 3.
- User chose "light audit" over "systematic delta-by-delta" — trusts the existing Phase 4/5/9/10/11/12 v0.4 reference matches already did the heavy lifting; Phase 3 is the polish pass, not a re-audit.
- Reference artifact `app.jsx` remains the source of truth; Phase 3 is a "match reference" polish, not "reimagine the UI" phase.
- WR-03 per-hex assertions (D-05) intentionally use exact hex strings from `.planning/todos/pending/shiki-palette-guard.md` — the test IS the palette assertion, so no abstraction / no lookup-table design.

</specifics>

<deferred>
## Deferred Ideas

### To a future UI/design-system phase (not scheduled in v1.0)
- **Shared `<SectionHeaderCTA>` component** — extract `<h2> + <a "All X →">` pattern used across Blog, Presentations, Speaking into one reusable Astro component. Today it's duplicated 3 times with slight variations. Refactor candidate; no feature gain.
- **Design-tokens drift audit** — systematic review of every token consumer to detect drift from canonical `design-tokens.css`. Not scoped; one-time effort whenever the token set stabilizes.
- **Translate-Y lift + amber underline on card hover** — presented as options, user rejected in favor of reference fidelity. Revisit if reference ever adopts them.

### To Phase 4 (Excalidraw Pipeline) or later
- **`--transition-fast` + `--transition-slow` review** — D-02b only touches `--transition-normal`. The other two tokens may also drift from reference easing. Out of Phase 3 scope; revisit with Phase 4 / Phase 5 audits.

### Not in v1.0
- **Dark/light mode toggle** — already deferred in REQUIREMENTS.md. Stagger animation works in both color modes once theme toggle arrives (CSS delay is theme-agnostic).
- **Automated visual regression gate** (Percy / Chromatic style) — AUDIT.md screenshots are human-reviewed. Automated pixel-diff CI step is future work.
- **View counters / analytics** — already deferred. Relevant because POLISH-04 reveal animation could be measured for scroll-to-view time, but not until analytics ships.
- **Tag filter UI on blog index** — out of Phase 3 scope; blog-index pages are not homepage.

### Reviewed Todos (all folded — none deferred)
*All pending todos matching Phase 3 (WR-03) were folded via D-05. No reviewed-but-deferred todos.*

</deferred>

---

*Phase: 3-ui-polish*
*Context gathered: 2026-05-03*
