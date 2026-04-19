---
phase: 04-hero-reference-match
plan: 02
subsystem: hero-component
tags:
  - astro
  - hero
  - tailwind
  - design-tokens
  - a11y
  - reference-match

# Dependency graph
requires:
  - phase: 03-section-order-about
    provides: 3-key i18n split pattern (bio_before/_accent/_after) with <span> accent rendering, no set:html
  - phase: 04-hero-reference-match
    plan: 01
    provides: i.hero.tagline_before / _accent / _after typed accessors in both en.json and ru.json
provides:
  - --grad-hero-flat canonical gradient token in design-tokens.css
  - Rewritten Hero.astro with 4-pill authority strip, clamp h1, inline _ cursor, Kubestronaut external-teal pill (rel=noopener + aria-label), flat 160deg gradient, Hero-scoped cursor-blink keyframes + reduced-motion override
  - Cleaned global.css (typing-cursor + @keyframes blink removed; cursor-blink keyframes now component-scoped in Hero)
  - REQ-011 acceptance evidence (4 authority pills in Hero, zero CKA-family cert pills)
  - T-04-01 mitigation (rel="noopener" on the single target=_blank external link)
affects:
  - 04-03 (Header nav-active observer + cross-file Kubestronaut rename in social.ts/BaseLayout.astro/CLAUDE.md + optional section[id] scroll-margin-top global rule + REQ inlining into REQUIREMENTS.md + Playwright computed-style gate)

# Tech tracking
tech-stack:
  added: []
  patterns:
    - Three-key i18n split render extended to Hero tagline (text-text-primary accent on AI Engineer, no HTML in JSON)
    - Tailwind 4 arbitrary clamp() utility: text-[clamp(40px,8vw,64px)] with no whitespace inside parens (Pitfall 1 avoided)
    - Component-scoped @keyframes inside Astro <style> (Option A per RESEARCH.md Open Question 1 — local until second consumer)
    - External link defense-in-depth via explicit rel="noopener" + aria-label for new-tab opener (T-04-01 mitigation, even though Chromium 88+ defaults this implicitly)
    - Canonical token reference over shim alias: text-bg-base (replaces older text-bg shim in CTA button)

key-files:
  created: []
  modified:
    - src/styles/design-tokens.css
    - src/components/Hero.astro
    - src/styles/global.css

key-decisions:
  - "Applied D-12: added --grad-hero-flat as token-referenced (var(--bg-base), var(--brand-primary-soft)) — no hardcoded hex; preserved --grad-hero-soft for future reintroduction"
  - "Applied D-11, D-14, D-17, D-18: full Hero rewrite matching reference app.jsx:357-398 — 2-block greeting, clamp h1 with inline _ cursor, role mono amber 18, 3-key tagline, 4-pill authority strip, 2 CTAs, pt-24 pb-16 px-6 container 1120"
  - "Applied D-02, D-03: 4 authority pills replace 6 cert pills — re:Invent Speaker / CNCF Kubestronaut (teal active, external) / Author «Cracking» / Host · DKT + AWS RU. CKA/CKS/CKAD/KCNA/KCSA dropped from Hero"
  - "Applied D-05, D-08, T-04-01 mitigation: Kubestronaut pill is <a target=_blank rel=noopener aria-label=...>; all 4 pills have focus-visible:outline for keyboard a11y"
  - "Applied D-14: retired .typing-cursor pseudo-element. Hero-inline <span class='cursor-blink text-brand-primary' aria-hidden='true'>_</span>; Hero-scoped @keyframes blink + reduced-motion override in Hero's <style> (Option A per RESEARCH.md Open Question 1). global.css lost .typing-cursor + @keyframes blink (one consumer had zero external users — verified via grep)"
  - "Applied D-19 target height: plan target ~520px on 1440×900, with +40px tolerance (≤560px) — runtime computed-style verification is deferred to Plan 04-03"
  - "Upgraded CTA primary to canonical text-bg-base (replaces older text-bg shim alias). No visual change (both resolve to --bg-base)"
  - "Preserved --grad-hero-soft token in design-tokens.css (didn't delete) — avoids breakage for any future consumer; the token is unreferenced after this plan"

patterns-established:
  - "Wave 2 build-pass gate: after Wave 1 breaks the build by removing i.hero.tagline, Wave 2 restores it by rewriting Hero.astro to consume the new 3-key accessors. Build must pass by end of Wave 2 — same cadence as Phase 3 (03-01 broke build, 03-03 restored it)"
  - "External link hardening: every Astro <a target=_blank> must have both rel=noopener (T-01 mitigation) and aria-label (D-08 a11y)"
  - "Component-scoped cursor-blink animation via @keyframes inside Astro <style> — preferred over global.css until a second consumer appears"

requirements-completed:
  - REQ-011
  - REQ-013
  - REQ-014

threat-mitigations:
  - id: T-04-01
    threat: Reverse tabnabbing on Kubestronaut external link
    mitigation: "rel=\"noopener\" + aria-label on the single <a target=\"_blank\"> in Hero.astro"
    verified: "grep + awk pair-match confirmed 1 target=_blank matches 1 rel=noopener in Hero.astro"
  - id: T-04-02
    threat: XSS via i18n JSON → set:html
    mitigation: "Rendered {i.hero.tagline_accent} as Astro expression, not via set:html. No HTML in JSON (Phase 3 invariant preserved)"
    verified: "grep for set:html returns zero in Hero.astro; regex test confirms span accent is Astro expression"
  - id: T-04-03
    threat: Denial of service via cursor-blink animation
    mitigation: "Hero-scoped @media (prefers-reduced-motion: reduce) { .cursor-blink { animation: none; } } halts animation for sensitive users (WCAG 2.3.3)"
    verified: "Astro emits the reduced-motion rule in the scoped <style> block; verified via built CSS inspection"

# Metrics
duration: 6m 16s
completed: 2026-04-19
tasks_executed: 3
files_modified: 3
commits: 3
---

# Phase 4 Plan 02: Hero Rewrite Summary

**Full rewrite of `src/components/Hero.astro` to match reference `app.jsx:357-398` pixel-for-pixel on 1440×900 — added `--grad-hero-flat` design token, replaced 6 cert pills with a 4-pill authority strip, swapped `.typing-cursor::after` pseudo for inline `<span>_</span>` with component-scoped `cursor-blink` keyframes, and cleaned the no-longer-needed `.typing-cursor` / global `@keyframes blink` rules from `global.css`. Build: 7 pages in 761ms, exit 0.**

## Performance

- **Duration:** 6 min 16s (21:07:00Z → 21:13:16Z wall-clock, including two `npm run build` runs and 1 `curl` URL check)
- **Started:** 2026-04-19T21:07:00Z
- **Completed:** 2026-04-19T21:13:16Z
- **Tasks:** 3
- **Files modified:** 3
- **Commits (atomic per task):** 3

## Task Commits

Each task was committed atomically per the plan:

1. **Task 1: Add `--grad-hero-flat` token to `design-tokens.css`** — `f0b1455` (feat)
2. **Task 2: Full rewrite of `Hero.astro` (reference-match + 4-pill authority strip + clamp h1 + inline cursor + Kubestronaut URL verify)** — `36fc2e8` (feat)
3. **Task 3: Clean up `global.css` + Astro build gate (npm run build: 7 pages, 770ms)** — `5917fa5` (chore)

## Pre-Condition Verifications (performed before commits)

- **Kubestronaut URL reachability (A1 from RESEARCH.md §Assumptions Log):** `curl -sI https://www.cncf.io/training/kubestronaut/` returned HTTP **200** (not 404). No fallback URL needed; the primary `.cncf.io` path is live. Recorded before Task 2 committed.
- **`.typing-cursor` consumer grep (D-14 pre-condition):** After Task 2 landed, `grep -rn 'typing-cursor' src/` returned exactly 2 hits (both inside `src/styles/global.css` — the rule-and-reduced-motion blocks about to be deleted in Task 3). Zero consumers elsewhere in `src/`, zero in `src/components/*.astro`. Safe to delete.

## Final State (verbatim)

### `src/styles/design-tokens.css` (4-line addition, lines 141-144 in the rewritten file)

```css
  /* Softer hero variant — matches preview/brand-terminal-hero.html (approved). */
  --grad-hero-soft:
    radial-gradient(ellipse 90% 80% at 12% 10%, rgba(20,184,166,0.18), transparent 92%),
    radial-gradient(ellipse 80% 70% at 88% 15%, rgba(245,158,11,0.06), transparent 92%),
    radial-gradient(ellipse 95% 85% at 78% 95%, rgba(13,148,136,0.22), transparent 95%),
    linear-gradient(160deg, #0B1220 0%, #0E1A2C 100%);

  /* Flat hero gradient — reference-matched (Phase 4 D-12), no radial blobs.
     Pair with .noise-overlay to prevent banding on large surfaces. */
  --grad-hero-flat: linear-gradient(160deg, var(--bg-base), var(--brand-primary-soft));

  --grad-aurora:
  ...
```

- Placement: inside `:root { ... }`, inside the "Complex / layered gradients" section, **immediately after `--grad-hero-soft` (line 139) and before `--grad-aurora` (line 146)** — matches plan `<action>` instructions exactly.
- Indentation: 2-space (matches surrounding block).
- `--grad-hero-soft` preserved byte-identical.
- `.light, [data-theme="light"]` override unchanged — `--grad-hero-flat` auto-inverts via its referenced vars (`--bg-base` and `--brand-primary-soft` both have `.light` overrides).

### `src/components/Hero.astro` (88 lines, full rewrite)

Structure:

- **Frontmatter (lines 1-10):** only `import { t, type Locale } from '../i18n/utils'` — `certifications` import dropped per D-02.
- **`<section>` (lines 12-79):** `id="hero" class="hero-deep-signal noise-overlay relative overflow-hidden pt-24 pb-16 px-6"` — no `min-h-[90vh]`, no `flex items-center`, no `pt-16`. Single container `max-w-[1120px] mx-auto w-full` (no nested `max-w-3xl`).
  - Greeting (2 blocks, D-17):
    - Line 1 (literal): `<div class="font-mono text-brand-primary text-sm mb-4">~/vedmich.dev $ whoami</div>`
    - Line 2 (i18n): `<div class="font-mono text-text-secondary text-base mb-1">{i.hero.greeting}</div>`
  - h1 (D-11, D-14): `font-display font-bold tracking-[-0.03em] leading-[1.05] text-text-primary m-0 text-[clamp(40px,8vw,64px)]` with `{i.hero.name}` followed by inline `<span class="cursor-blink text-brand-primary" aria-hidden="true">_</span>` — arbitrary-value `clamp(40px,8vw,64px)` has no whitespace (Pitfall 1 avoided).
  - Role (D-18): `<div class="font-mono text-warm text-lg mt-3">{i.hero.role}</div>` — amber via `text-warm` shim alias.
  - Tagline (D-15, D-16): `<p class="font-body text-lg text-text-secondary max-w-[640px] mt-4">{i.hero.tagline_before}<span class="text-text-primary">{i.hero.tagline_accent}</span>{i.hero.tagline_after}</p>` — 3-key split with `text-text-primary` accent on `AI Engineer`, no `set:html`, no HTML in JSON (Phase 3 invariant).
  - Pills (D-02, D-03, D-05, D-06, D-07, D-08): `<div class="flex flex-wrap gap-2.5 mt-7">` with exactly **4 `<a>` elements** in order:
    1. `href="#speaking"` → `re:Invent &amp; Keynote Speaker`
    2. `href="https://www.cncf.io/training/kubestronaut/"` + `target="_blank"` + `rel="noopener"` + `aria-label="CNCF Kubestronaut program (opens in new tab)"` → teal-active classes + leading dot + `CNCF Kubestronaut`
    3. `href="#book"` → `Author «Cracking the Kubernetes Interview»` (U+00AB/U+00BB guillemets)
    4. `href="#podcasts"` → `Host · DKT + AWS RU` (U+00B7 middle dot)
    - All 4 have `focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand-primary`.
  - CTAs (D-18): `<div class="flex flex-wrap items-center gap-3 mt-8">` with:
    - Primary `<a href="#contact">` — `bg-brand-primary hover:bg-brand-primary-hover text-bg-base` (canonical, not shim)
    - Ghost `<a href="#about">` — `border border-border hover:border-brand-primary ...` + `→` span (aria-hidden)
- **Scoped `<style>` (lines 81-88):**
  ```css
  .hero-deep-signal { background: var(--grad-hero-flat); }
  .cursor-blink { animation: blink 1s step-end infinite; }
  @keyframes blink { 50% { opacity: 0; } }
  @media (prefers-reduced-motion: reduce) {
    .cursor-blink { animation: none; }
  }
  ```
  - `var(--grad-hero-flat)` — not `--grad-hero-soft` (D-12).
  - `@keyframes blink` is Hero-scoped (Option A per RESEARCH.md §Open Question 1).
  - Reduced-motion override halts animation (T-04-03 mitigation).
  - Zero hardcoded hex.

### `src/styles/global.css` (138 lines, 15-line removal)

Deletions:

1. **`@keyframes blink` block** (formerly lines 109-113, 4 lines) — removed along with its comment.
2. **`.typing-cursor::after` rule** (formerly lines 115-119, 5 lines) — removed.
3. **`.typing-cursor::after { animation: none }`** inside reduced-motion media query (formerly lines 150-152, 3 lines) — removed, but the surrounding `@media (prefers-reduced-motion: reduce) { ... }` wrapper is preserved intact (still contains `*` universal animation-duration reset + `.animate-on-scroll` override).

Preserved byte-identical: `@theme` block (lines 7-56), `html { scroll-behavior: smooth }` (lines 58-60), body styles, display headlines rule, `::selection`, `:focus-visible`, `@keyframes fadeInUp` (89-99), `.animate-on-scroll` (101-107), `.card-glow` (109-116), `@keyframes drawLine` (118-122), reduced-motion media wrapper (124-138).

## Confirmations (acceptance criteria verified)

All listed in the plan's `<acceptance_criteria>` blocks for each task:

### Task 1 acceptance (all PASS)

- `--grad-hero-flat` present in `design-tokens.css` ✓
- Exact-shape line (2-space indent) present ✓
- `--grad-hero-soft` preserved ✓
- No hardcoded hex in the new line ✓
- `--grad-hero-*` count = 2 (flat + soft) ✓
- `@font-face` count = 9 (unchanged) ✓
- `.light, [data-theme="light"]` block unchanged ✓
- File parses as valid CSS (build-verified in Task 3) ✓

### Task 2 acceptance (all PASS)

- All **40 presence checks** (i18n import, `id="hero"`, section classes, container, terminal prompt, greeting ref, `text-[clamp(40px,8vw,64px)]`, `tracking-[-0.03em]`, `leading-[1.05]`, inline cursor span, name ref, role classes/ref, `tagline_before/_accent/_after` refs, accent span, 4 pill hrefs, `target="_blank"`, `rel="noopener"`, `aria-label`, teal pill classes, Kubestronaut label, `Author «Cracking»`, `Host · DKT + AWS RU`, pills/CTA wrappers, primary/ghost CTA classes, CTA refs, `var(--grad-hero-flat)`, `cursor-blink` rule, `@keyframes blink`, focus-visible outline, prefers-reduced-motion override) ✓
- All **12 absence checks** (`certifications`, `min-h-[90vh]`, `flex items-center pt-16`, `max-w-6xl`, `max-w-3xl`, `typing-cursor`, `var(--grad-hero-soft)`, `i.hero.tagline` non-underscore, `Kubernaut` misspelling, hardcoded hex, old responsive h1 sizes, old h1 classes) ✓
- **Pill count = 4** (exact; via `(s.match(/inline-flex items-center gap-1\.5 px-3\.5 py-1\.5 rounded-full text-\[13px\]/g) || []).length`) ✓
- **External-link safety (T-04-01):** `awk` pair-matches 1 `target="_blank"` with 1 `rel="noopener"` ✓
- **Kubestronaut URL reachability:** HTTP 200 (via `curl -sI`) ✓ — no fallback used.

### Task 3 acceptance (all PASS)

- `@keyframes blink` removed from `global.css` ✓
- `.typing-cursor` removed from `global.css` (0 occurrences) ✓
- Zero `typing-cursor` consumers anywhere in `src/` ✓
- `animate-on-scroll`, `@keyframes fadeInUp`, `card-glow`, `@keyframes drawLine`, `prefers-reduced-motion: reduce` wrapper, `@theme` all preserved ✓
- **Build gate:** `npm run build` exits 0; 7 pages built in 761-770ms ✓
- `dist/en/index.html` and `dist/ru/index.html` both exist ✓
- Kubestronaut external link count = 1 in both locales ✓
- Tagline accent: `<span class="text-text-primary" data-astro-cid-bbe6dxrz>AI Engineer</span>` present in both locales — matches the plan's `<verification>` note "class ordering may vary by Astro's compiler — any class string containing `text-text-primary` with `AI Engineer` as the wrapped text is acceptable" ✓
- Pill count in Hero section = 4 in both locales ✓
- Zero CKA/CKS/CKAD/KCNA/KCSA occurrences inside `<section id="hero">` in both locales (REQ-011 acceptance) ✓
- Zero `typing-cursor` in built CSS (`dist/_astro/*.css`) ✓

### Build output

```
23:11:57 [build] 7 page(s) built in 770ms
23:11:57 [build] Complete!
```

Pages emitted:
- `dist/en/index.html`
- `dist/en/blog/index.html`
- `dist/en/blog/hello-world/index.html`
- `dist/ru/index.html`
- `dist/ru/blog/index.html`
- `dist/ru/blog/hello-world/index.html`
- `dist/index.html` (root redirect)

## Decisions Made

1. **Option A for cursor-blink keyframes** — inlined `@keyframes blink` into Hero's scoped `<style>` rather than keeping in `global.css`. Matches project convention "local until second consumer" and RESEARCH.md Open Question 1 recommendation. global.css thinner; cursor animation now component-scoped.
2. **Canonical `text-bg-base` over shim `text-bg`** in primary CTA — per CLAUDE.md §Deep Signal Design System hygiene rule "prefer canonical tokens in new writes". No visual change (both resolve to `--bg-base`), forward-compatible with future shim retirement.
3. **No runtime Playwright typography gate in this plan** — the plan's `<verification>` section explicitly states:
   - "Hero total height on 1440×900 viewport (via playwright-cli computed style in Plan 04-03's gate task) ≤ 540px — deferred to Plan 04-03 for runtime verification"
   - "h1 computed styles at 1440×900: ... — deferred to Plan 04-03 for runtime verification"
   - "h1 computed fontSize at 375×667 = 40px (clamp floor) — deferred to Plan 04-03"
   Runtime REQ-013/REQ-014 runtime assertion is explicitly 04-03's responsibility; this plan delivers build-time acceptance only. Built DOM grep confirms the Tailwind utility classes that will produce those computed values are all emitted correctly.
4. **Kept `--grad-hero-soft` alive in `design-tokens.css`** — did not delete. Token is no longer consumed, but removing it has no benefit here (it may be reintroduced for future "blobby hero" variants). The only current consumer (Hero's `<style>`) was migrated to `--grad-hero-flat` via Task 2.
5. **Trailing-space preservation in `i18n tagline_before`** — unchanged from Wave 1 (04-01); this plan consumes it via Astro expression without altering it. Verified: EN `"Distributed Systems \u00b7 Kubernetes \u00b7 "` and RU `"Распределённые системы \u00b7 Kubernetes \u00b7 "` both end with a space, ensuring the `<span>` accent renders `"Kubernetes · AI Engineer"` (not `"Kubernetes ·AI Engineer"`).

## Deviations from Plan

**None — plan executed exactly as written.**

All three tasks followed their explicit `<action>` blocks verbatim. Every class string, attribute name, href value, token name, i18n key, CSS rule, and deletion matches the plan's specification byte-for-byte. No Rule 1 bug fixes, no Rule 2 missing functionality, no Rule 3 blocking issues, no Rule 4 architectural changes encountered. The one minor note about the plan's `<verification>` regex for the tagline accent being too strict for Astro's `data-astro-cid-*` attribute injection is explicitly anticipated by the plan itself ("class ordering may vary by Astro's compiler — any class string containing `text-text-primary` with `AI Engineer` as the wrapped text is acceptable").

## Issues Encountered

**None.**

## User Setup Required

**None.** No external service configuration, no API keys, no DNS changes, no manual build-env adjustments. Pure source-file mutations; GitHub Pages will deploy automatically on next push to `main` (outside this plan's scope).

## Authentication Gates

**None encountered.** The single URL touched (CNCF Kubestronaut program page) was verified reachable via anonymous `curl -sI` (HTTP 200).

## Kubestronaut URL Verification

- **Primary URL used:** `https://www.cncf.io/training/kubestronaut/`
- **HTTP status code from `curl -sI`:** **200** (verified 2026-04-19 at 21:10 UTC prior to Task 2 commit).
- **Fallback URL (would have been used if primary 404'd):** `https://kubestronaut.io/` — **not needed**, primary is live.
- No divergence from RESEARCH.md §Assumptions Log A1 — Option A resolved as the primary URL.

## Self-Check: PASSED

Verified claims before completing this plan via automated checks:

### 1. Created/modified files exist with expected content

- `src/styles/design-tokens.css` — `--grad-hero-flat` line present at line 143 (Python exact-match check) ✓
- `src/components/Hero.astro` — 88 lines, all 40 presence + 12 absence + pill-count=4 regex checks pass via `/tmp/gsd-04-02-task2-verify.mjs` ✓
- `src/styles/global.css` — 138 lines, `.typing-cursor` / `@keyframes blink` absent; `animate-on-scroll`, `@keyframes fadeInUp`, `card-glow`, `@keyframes drawLine`, `@theme`, reduced-motion wrapper all present ✓

### 2. Commits exist in git log

```
5917fa5 chore(04-02): remove .typing-cursor + @keyframes blink from global.css
36fc2e8 feat(04-02): rewrite Hero to reference-match with 4-pill authority strip
f0b1455 feat(04-02): add --grad-hero-flat canonical gradient token
```

All three hashes verified present via `git log --oneline`.

### 3. Post-commit deletion checks

None of the three commits had unexpected file deletions (`git diff --diff-filter=D --name-only HEAD~1 HEAD` returned empty for each).

### 4. Build gate

`npm run build` exits 0 with 7 pages built in 761ms (after Task 3).

### 5. Built DOM in both locales

Via Python regex:
- 4 pills in `<section id="hero">` for both EN and RU
- Kubestronaut external link with `rel="noopener"` in both EN and RU
- Tagline accent `<span class="text-text-primary" data-astro-cid-bbe6dxrz>AI Engineer</span>` in both locales
- Zero CKA/CKS/CKAD/KCNA/KCSA refs inside Hero section in either locale (REQ-011)

### 6. External-link safety (T-04-01)

`awk` pair-match on `Hero.astro`: 1 `target="_blank"` matched with 1 `rel="noopener"`, exit 0.

## Next Phase Readiness

**Flag for Plan 04-03 executor (Wave 2, sibling plan):**

- Hero is now fully rewritten and renders correctly from the 3-key i18n accessors (Wave 1) + `--grad-hero-flat` token (Task 1). The build gate is green.
- Plan 04-03's remaining work from CONTEXT.md D-04 scope:
  1. `src/data/social.ts` — rename `certifications[0].name: 'CNCF Kubernaut' → 'CNCF Kubestronaut'` and `badge: 'kubernaut' → 'kubestronaut'`. Note: Hero no longer consumes the `certifications` array (this plan removed the import), so the change is cosmetic for the data contract only.
  2. `src/layouts/BaseLayout.astro` line 15 — default `description` prop: `'... CNCF Kubernaut, ...'` → `'... CNCF Kubestronaut, ...'`.
  3. `CLAUDE.md` §"Homepage Sections" #2 — `CNCF Kubernaut` → `CNCF Kubestronaut`.
- Plan 04-03 also owns:
  4. IntersectionObserver nav-active highlight append in `src/components/Header.astro` (CONTEXT.md D-09, D-10).
  5. Optional global rule `section[id] { scroll-margin-top: 80px; }` in `src/styles/global.css` (RESEARCH.md Open Question 3 recommendation).
  6. REQ-011, REQ-013, REQ-014 inlining into `.planning/REQUIREMENTS.md` (RESEARCH.md §Phase Requirements note).
  7. Runtime computed-style gate via Playwright-cli: `#hero h1` at 1440×900 must show `fontSize=64px`, `fontWeight=700`, `letterSpacing=-1.92px`, `lineHeight=67.2px`, Space Grotesk family; at 375×667 must show `fontSize=40px` (clamp floor). `#hero` section height ≤ 540px.

**Flag for orchestrator:**

- This plan created 3 commits (`f0b1455`, `36fc2e8`, `5917fa5`) on `main`. Per plan instructions, `STATE.md` and `ROADMAP.md` are owned by the orchestrator — no writes from this executor.
- Deferred items: none.
- Build is now green on `main` and ready to deploy, but no push was performed (Phase 4 phase-level commit will be the orchestrator's responsibility after Plan 04-03 lands and user visual verify gates pass).

## Threat Flags

None — all threat surface introduced by this plan (single external link via Kubestronaut pill; inline cursor-blink animation) is already enumerated in the plan's `<threat_model>` block (T-04-01 mitigated, T-04-02 invariant preserved, T-04-03 accepted with reduced-motion override). No novel security-relevant surface outside the threat register was added. Built HTML was scanned post-build for additional `target="_blank"` without `rel="noopener"` — zero matches, confirming no stray external links were introduced.

---

*Phase: 04-hero-reference-match*
*Plan: 02 — Hero rewrite*
*Completed: 2026-04-19*
