---
phase: 04-hero-reference-match
plan: 03
type: execute
wave: 3
depends_on:
  - 04-02
files_modified:
  - src/data/social.ts
  - src/layouts/BaseLayout.astro
  - CLAUDE.md
  - src/components/Header.astro
  - src/styles/global.css
  - .planning/REQUIREMENTS.md
autonomous: false
requirements:
  - REQ-011
  - REQ-013
  - REQ-014
threat_refs: []
tags:
  - kubestronaut-rename
  - header
  - intersection-observer
  - scroll-margin
  - requirements-sync
  - visual-gate
objective: >-
  Complete Phase 4 by (1) renaming `Kubernaut → Kubestronaut` in the four
  remaining cross-file touchpoints from D-04 (`src/data/social.ts`
  certifications[0], `src/layouts/BaseLayout.astro` description meta default,
  `CLAUDE.md` §Homepage Sections #2); (2) appending the IntersectionObserver
  nav-active-state highlight script + `.is-active` style to
  `src/components/Header.astro` per D-09, D-10; (3) adding global CSS rule
  `section[id] { scroll-margin-top: 80px; }` to `src/styles/global.css` per
  Claude's Discretion #3 (prevents sticky header from obscuring section
  titles on anchor jumps); (4) inlining REQ-011, REQ-013, REQ-014 into
  `.planning/REQUIREMENTS.md` with the acceptance criteria drafted in
  04-RESEARCH.md §9.1; (5) running `npm run build` and a user-facing visual
  verification checkpoint to measure h1 computed styles and Hero height
  against REQ-013 + REQ-014 on 1440×900 and 375×667.

must_haves:
  truths:
    - `src/data/social.ts` `certifications[0]` has `name: 'CNCF Kubestronaut'` and `badge: 'kubestronaut'` (per D-04).
    - `src/layouts/BaseLayout.astro` default `description` prop contains `CNCF Kubestronaut`, not `CNCF Kubernaut` (per D-04).
    - `CLAUDE.md` §Homepage Sections #2 About line reads `certifications (CNCF Kubestronaut + all 5 K8s certs)` (per D-04).
    - Project-wide grep `grep -rn 'Kubernaut' src/ CLAUDE.md` returns zero matches (case-sensitive, historical `.planning/`, `.playwright-cli/`, `current-content.json`, `ref-content.json` excluded per D-04).
    - `src/components/Header.astro` has an IntersectionObserver-based nav-active-state script appended that observes all `section[id]` on the page, toggles `.is-active` on matching `header a[href^="#"]` links, with `threshold: 0.5` and `rootMargin: '-80px 0px -50% 0px'` (per D-09).
    - `src/components/Header.astro` has a scoped `<style>` block with `header a.is-active { color: var(--text-primary); border-bottom: 2px solid var(--brand-primary); }` (per D-09).
    - `src/styles/global.css` has a `section[id] { scroll-margin-top: 80px; }` rule (per Claude's Discretion #3 and RESEARCH.md §Pitfall 3, §Example 4).
    - `.planning/REQUIREMENTS.md` contains REQ-011, REQ-013, REQ-014 with the acceptance criteria drafted in RESEARCH.md §9.1 (Phase 4 requirements now first-class in the requirements doc, not just in ROADMAP/RESEARCH).
    - `npm run build` exits 0 with 7 pages built.
    - Hero section `getBoundingClientRect().height` on 1440×900 is ≤ 540px (REQ-014 acceptance — ~520 target, +20px tolerance).
    - h1 computed fontSize = 64px, fontWeight = 700, letterSpacing = -1.92px, lineHeight = 67.2px at 1440×900 (REQ-013 acceptance).
    - h1 computed fontSize = 40px at 375×667 (REQ-013 clamp-floor acceptance).
    - Nav active-state highlight visibly toggles when scrolling between sections (user visual gate).
    - Clicking a Hero pill (e.g., `#speaking`) smoothly scrolls to the target section with the section title visible below the sticky header (scroll-margin-top applied, not hidden).
  artifacts:
    - path: src/data/social.ts
      provides: Corrected certifications[0] name + badge fields
      contains: "name: 'CNCF Kubestronaut'"
    - path: src/layouts/BaseLayout.astro
      provides: Corrected description meta default
      contains: 'CNCF Kubestronaut'
    - path: CLAUDE.md
      provides: Corrected Homepage Sections doc
      contains: 'CNCF Kubestronaut'
    - path: src/components/Header.astro
      provides: Nav active-state observer + .is-active style
      min_lines: 30
      contains: "IntersectionObserver"
    - path: src/styles/global.css
      provides: scroll-margin-top global rule for anchor targets
      contains: 'scroll-margin-top'
    - path: .planning/REQUIREMENTS.md
      provides: REQ-011, REQ-013, REQ-014 inlined with acceptance criteria
      contains: 'REQ-011'
  key_links:
    - from: src/components/Header.astro
      to: IntersectionObserver API (browser built-in)
      via: new IntersectionObserver(cb, { threshold: 0.5, rootMargin: '-80px 0px -50% 0px' })
      pattern: "new IntersectionObserver"
    - from: src/components/Header.astro
      to: section[id] elements on page
      via: document.querySelectorAll('section[id]').forEach(s => obs.observe(s))
      pattern: "section\\[id\\]"
    - from: Header nav link classes (Tailwind utility)
      to: scoped <style> .is-active CSS rule (component-scoped via Astro cid)
      via: link.classList.add/remove('is-active') JS + header a.is-active CSS
      pattern: "a\\.is-active"
    - from: src/styles/global.css
      to: all <section id="..."> in the page (Hero + About + Podcasts + Book + Speaking + Presentations + Blog + Contact)
      via: section[id] { scroll-margin-top: 80px }
      pattern: "section\\[id\\]"
---

<objective>
Close Phase 4 with five coordinated mutations:

1. **Cross-file Kubestronaut rename** in `src/data/social.ts`,
   `src/layouts/BaseLayout.astro`, and `CLAUDE.md`. This completes the D-04
   atomic rename started in Plan 04-01 (which handled the two JSON files).
   After this plan, zero instances of `Kubernaut` (without the `-estr-`
   infix) remain in `src/` or `CLAUDE.md`.

2. **Nav-active-state highlight observer** appended to
   `src/components/Header.astro` per D-09, D-10. Adds an `IntersectionObserver`
   that watches all `section[id]` elements, toggles `.is-active` on the
   corresponding `header a[href^="#"]` link, and a scoped `<style>` block
   with the teal underline `.is-active` rule. Zero framework, single
   observer, extends Zero-JS baseline by exactly one observer per D-10.

3. **`scroll-margin-top` global rule** added to `src/styles/global.css` per
   Claude's Discretion #3 (RESEARCH.md §Pitfall 3, §Example 4). One line:
   `section[id] { scroll-margin-top: 80px; }`. Prevents the 61px sticky
   header from obscuring section titles when users click in-site pill anchors.

4. **REQ-011, REQ-013, REQ-014 inlined** into `.planning/REQUIREMENTS.md`
   with the acceptance criteria drafted in `04-RESEARCH.md §Phase Requirements`.
   Phase 4 introduced these requirements during Phase 3's audit (promoted from
   Phase 11); the requirements doc must be synced so they're first-class.

5. **Build + visual gate** — `npm run build` must pass; user verifies via
   local preview (playwright-cli or Chrome) that REQ-013 h1 computed styles
   and REQ-014 Hero height both pass on 1440×900 and 375×667 for EN and RU.
   Nav active-state highlight is verified visually. This is the final gate
   before the atomic Phase 4 commit.

Purpose: Close all Phase 4 decisions + close REQ-011/013/014 + add in-site
navigation affordance + land documentation consistency. After this plan,
Phase 4's scope is fully delivered.

Output: Four mutated source files, one mutated documentation file, one
mutated requirements file, a passing build, user-confirmed visual parity.
</objective>

<execution_context>
@$HOME/.claude/get-shit-done/workflows/execute-plan.md
@$HOME/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@.planning/phases/04-hero-reference-match/04-CONTEXT.md
@.planning/phases/04-hero-reference-match/04-RESEARCH.md
@.planning/phases/04-hero-reference-match/04-PATTERNS.md
@.planning/phases/04-hero-reference-match/04-01-SUMMARY.md
@.planning/phases/04-hero-reference-match/04-02-SUMMARY.md
@.planning/REQUIREMENTS.md

<interfaces>
<!-- Current state of files this plan mutates (verified during research 2026-04-19) -->

From src/data/social.ts lines 29-36 (certifications array):
```ts
export const certifications = [
  { name: 'CNCF Kubernaut', badge: 'kubernaut' },      // ← change both fields
  { name: 'CKA', badge: 'cka' },
  { name: 'CKS', badge: 'cks' },
  { name: 'CKAD', badge: 'ckad' },
  { name: 'KCNA', badge: 'kcna' },
  { name: 'KCSA', badge: 'kcsa' },
] as const;
```

From src/layouts/BaseLayout.astro line 15 (description prop default):
```astro
const { title, description = 'Viktor Vedmich — Senior Solutions Architect @ AWS, CNCF Kubernaut, Author, Speaker', locale, path = '' } = Astro.props;
```
(Change the one word inside the string.)

From CLAUDE.md §Homepage Sections line 112:
```markdown
2. **About** — bio, skill pills, certifications (CNCF Kubernaut + all 5 K8s certs)
```
(Change the one word.)

From src/components/Header.astro lines 129-173 (current `<script>` block — the nav-active observer appends AFTER this existing block):
```astro
<script>
  const btn = document.getElementById('mobile-menu-btn');
  // ... existing mobile menu + shrink-on-scroll + lang switch + search triggers ...
</script>
```

No existing `<style>` block in Header.astro currently. Task 2 adds the first one.

From src/styles/global.css lines 58-60 (existing smooth-scroll rule — paired with the new scroll-margin-top):
```css
html {
  scroll-behavior: smooth;
}
```

<!-- IntersectionObserver pattern for nav-active (D-09, RESEARCH.md §Example 3 + §Pattern 3) -->

Target script to append at the end of Header.astro (after the existing `</script>` on line 173):

```astro
<script>
  // Nav active-state highlight via IntersectionObserver (Phase 4 D-09).
  // Observes every <section id="..."> on the page and toggles `.is-active`
  // on the matching header anchor. Single observer, no framework, extends
  // Zero-JS baseline by one per D-10.
  const sections = document.querySelectorAll('section[id]');
  const navLinks = Array.from(document.querySelectorAll('header a[href^="#"]'));
  const linkByHref = new Map(navLinks.map((a) => [a.getAttribute('href'), a]));

  const obs = new IntersectionObserver(
    (entries) => {
      for (const e of entries) {
        const link = linkByHref.get('#' + (e.target as HTMLElement).id);
        if (!link) continue;
        if (e.isIntersecting) {
          navLinks.forEach((a) => a.classList.remove('is-active'));
          link.classList.add('is-active');
        }
      }
    },
    { threshold: 0.5, rootMargin: '-80px 0px -50% 0px' }
  );

  sections.forEach((s) => obs.observe(s));
</script>

<style>
  /* Nav active-state visual: teal underline + full-contrast text (Phase 4 D-09). */
  header a.is-active {
    color: var(--text-primary);
    border-bottom: 2px solid var(--brand-primary);
  }
</style>
```

<!-- REQ-011 / REQ-013 / REQ-014 to inline into REQUIREMENTS.md (from 04-RESEARCH.md §9.1) -->

```markdown
## REQ-011 — Hero: reposition as primary pitch with 4-pill authority strip

**Type:** Component rewrite
**Priority:** P0
**Maps to:** Phase 4

The Hero section MUST reframe as the site's primary pitch with a compact
authority strip of 4 pills that cover speaker credibility, CNCF achievement,
author credibility, and podcast host status:

1. `re:Invent & Keynote Speaker` → scrolls to `#speaking`
2. `CNCF Kubestronaut` (teal-active, external link) → https://www.cncf.io/training/kubestronaut/
3. `Author «Cracking the Kubernetes Interview»` → scrolls to `#book`
4. `Host · DKT + AWS RU` → scrolls to `#podcasts`

The 6 cert pills that currently render from `src/data/social.ts certifications`
(CNCF Kubernaut + CKA/CKS/CKAD/KCNA/KCSA) MUST be replaced — "Kubestronaut"
already implies the 5 underlying certs. The About section does not render
cert cards either (Phase 3).

**Acceptance:**
- Hero contains exactly 4 `<a>` elements with class `inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-[13px] font-medium`.
- Each pill has the correct href, and the Kubestronaut pill has `target="_blank"`, `rel="noopener"`, and `aria-label="CNCF Kubestronaut program (opens in new tab)"`.
- No CKA/CKS/CKAD/KCNA/KCSA strings appear inside the Hero section in the built HTML.
- 4-pill row renders on one line at 1440px (no wrap) — verified via Playwright computed width.
- Both EN and RU render identically (pill labels locale-invariant — brand/credential names).

## REQ-013 — Hero: typography matches reference exactly

**Type:** Component visual fidelity
**Priority:** P0
**Maps to:** Phase 4

The Hero h1 computed styles MUST match the reference UI kit (`app.jsx:363`):
- font-family resolves to Space Grotesk
- font-size: 64px at viewports ≥800px, scaled via `clamp(40px, 8vw, 64px)` for narrower viewports
- font-weight: 700
- letter-spacing: -0.03em (-1.92px computed at 64px)
- line-height: 1.05 (67.2px computed at 64px)
- color: `var(--text-primary)` (#E2E8F0)

Role line MUST be mono amber 18px (`font-mono text-warm text-lg`).
Background MUST be flat 160deg gradient via `--grad-hero-flat` token.
Container MUST be `max-w-[1120px]`. Section padding MUST be `pt-24 pb-16 px-6` (96/64/24).

**Acceptance:**
- h1 computed style at 1440×900: fontSize = 64px, fontWeight = 700, letterSpacing = -1.92px, lineHeight = 67.2px, fontFamily matches `/Space Grotesk/`.
- h1 computed fontSize at 375×667: 40px (clamp floor).
- `grep -q 'text-\[clamp(40px,8vw,64px)\]' src/components/Hero.astro` exits 0.
- `grep -q 'grad-hero-flat' src/styles/design-tokens.css src/components/Hero.astro` exits 0 (token declared + consumed).
- No `typing-cursor` class anywhere.

## REQ-014 — Hero: section height ≤ 540px on 1440×900

**Type:** Component layout constraint
**Priority:** P0
**Maps to:** Phase 4

The Hero section computed total height on 1440×900 desktop viewport MUST be
≤ 540px (target ~520px, +20px tolerance for pill wrap sub-pixel DPR).
This represents a reduction from the previous ~810px (`min-h-[90vh]`
stretching).

**Acceptance:**
- `document.getElementById('hero').getBoundingClientRect().height` on 1440×900 with all content loaded: **≤ 540**.
- No `min-h-[90vh]`, `flex items-center`, or `pt-16` classes on the Hero `<section>` wrapper.
- Hero `<section>` uses `pt-24 pb-16 px-6` classes exactly.
```

These REQs should be appended to `.planning/REQUIREMENTS.md` AFTER REQ-008
(line 178) and BEFORE "Global acceptance" block (line 180).
</interfaces>
</context>

<tasks>

<task type="auto">
  <name>Task 1: Cross-file Kubestronaut rename (social.ts + BaseLayout.astro + CLAUDE.md)</name>
  <files>src/data/social.ts, src/layouts/BaseLayout.astro, CLAUDE.md</files>
  <read_first>
    - src/data/social.ts (read in full — confirm `certifications[0]` is on line 30 and the rest of the array is unchanged; understand the `as const` pattern to preserve)
    - src/layouts/BaseLayout.astro (read lines 1-20 — confirm line 15 `description` default is the correct target; no other Kubernaut reference in the file)
    - CLAUDE.md (read §Homepage Sections around line 110-120 — confirm only one `Kubernaut` reference on line 112 inside §Homepage Sections; DO NOT touch other mentions inside `.playwright-cli`, `current-content.json`, `ref-content.json` — these are historical artifacts per D-04 exclusion)
    - .planning/phases/04-hero-reference-match/04-CONTEXT.md (D-04 — the exclusion list specifying what NOT to grep-replace)
    - .planning/phases/04-hero-reference-match/04-PATTERNS.md §`src/data/social.ts`, §`src/layouts/BaseLayout.astro`, §`CLAUDE.md` (target states verbatim)
  </read_first>
  <action>
    Perform three surgical string replacements.

    **Edit 1 — `src/data/social.ts` line 30:**

    Change this single line:
    ```ts
      { name: 'CNCF Kubernaut', badge: 'kubernaut' },
    ```
    to:
    ```ts
      { name: 'CNCF Kubestronaut', badge: 'kubestronaut' },
    ```

    Rules:
    - Change BOTH the `name` field (`'CNCF Kubernaut'` → `'CNCF Kubestronaut'`) AND the `badge` field (`'kubernaut'` → `'kubestronaut'`). Both are lowercase-prefixed with the matching change.
    - Preserve indentation (2 spaces inside the array, single quotes around strings, trailing comma on the line).
    - Do NOT touch the other 5 entries (CKA/CKS/CKAD/KCNA/KCSA).
    - Do NOT touch `skills`, `socialLinks`, `speakingEvents`, `presentations` exports.
    - Preserve `as const` closure at the end of the array.

    **Edit 2 — `src/layouts/BaseLayout.astro` line 15:**

    Change the substring `CNCF Kubernaut` to `CNCF Kubestronaut` inside the `description` default prop. The line currently reads:

    ```astro
    const { title, description = 'Viktor Vedmich — Senior Solutions Architect @ AWS, CNCF Kubernaut, Author, Speaker', locale, path = '' } = Astro.props;
    ```

    After the edit:

    ```astro
    const { title, description = 'Viktor Vedmich — Senior Solutions Architect @ AWS, CNCF Kubestronaut, Author, Speaker', locale, path = '' } = Astro.props;
    ```

    Rules:
    - Change ONLY the one substring `CNCF Kubernaut` → `CNCF Kubestronaut`. No other edits to line 15 or the file.
    - Preserve the em-dash `—` (U+2014) verbatim — do not accidentally rewrite as `-` or `--`.
    - Preserve all other props (`title`, `locale`, `path`) and the `Astro.props` destructuring.
    - This string flows through `<meta name="description">`, `<meta property="og:description">`, and `<meta name="twitter:description">` (lines 29, 45, 54) — no edits needed to those consumers; they read the prop automatically.

    **Edit 3 — `CLAUDE.md` §Homepage Sections:**

    Find the line (around line 112 based on current file layout):

    ```markdown
    2. **About** — bio, skill pills, certifications (CNCF Kubernaut + all 5 K8s certs)
    ```

    Change to:

    ```markdown
    2. **About** — bio, skill pills, certifications (CNCF Kubestronaut + all 5 K8s certs)
    ```

    Rules:
    - Change ONLY the substring `CNCF Kubernaut` → `CNCF Kubestronaut`.
    - Preserve the em-dash `—`, the bold `**About**`, and the parenthetical formatting.
    - Do NOT touch any other lines in CLAUDE.md, including any `.planning/` path references or other section anchors.

    After all three edits, run this project-wide verification grep:

    ```bash
    # Allowed "Kubernaut" mentions: historical artifacts that MUST stay for audit trail.
    # Expected results after Task 1:
    #   0 matches in src/
    #   0 matches in CLAUDE.md
    #   Some matches in .planning/* (historical decisions, plan text) — ALLOWED
    #   Some matches in .playwright-cli/, current-content.json, ref-content.json — ALLOWED (D-04)

    grep -rn 'Kubernaut' src/ CLAUDE.md 2>&1 | grep -v Binary
    # Expected: no output (ZERO matches).
    ```

    If the grep returns ANY match in `src/` or `CLAUDE.md`, investigate and fix before moving to Task 2.
  </action>
  <verify>
    <automated>grep -q "name: 'CNCF Kubestronaut', badge: 'kubestronaut'" src/data/social.ts || { echo "social.ts not updated"; exit 1; }; grep -q "name: 'CNCF Kubernaut'" src/data/social.ts && { echo "social.ts still has old name"; exit 2; }; grep -q "CNCF Kubestronaut, Author, Speaker" src/layouts/BaseLayout.astro || { echo "BaseLayout.astro not updated"; exit 3; }; grep -q "CNCF Kubernaut," src/layouts/BaseLayout.astro && { echo "BaseLayout.astro still has old description"; exit 4; }; grep -q "certifications (CNCF Kubestronaut + all 5 K8s certs)" CLAUDE.md || { echo "CLAUDE.md not updated"; exit 5; }; grep -q "certifications (CNCF Kubernaut + all 5 K8s certs)" CLAUDE.md && { echo "CLAUDE.md still has old copy"; exit 6; }; MATCHES=$(grep -rn 'Kubernaut' src/ CLAUDE.md 2>&1 | grep -v Binary); if [ -n "$MATCHES" ]; then echo "Residual Kubernaut matches:"; echo "$MATCHES"; exit 7; fi; echo "OK: all 3 files renamed, zero residual matches"</automated>
  </verify>
  <acceptance_criteria>
    Presence checks (must exit 0):
    - `grep -q "name: 'CNCF Kubestronaut', badge: 'kubestronaut'" src/data/social.ts`
    - `grep -q "CNCF Kubestronaut, Author, Speaker" src/layouts/BaseLayout.astro`
    - `grep -q "certifications (CNCF Kubestronaut + all 5 K8s certs)" CLAUDE.md`

    Absence checks in target files (must exit 1):
    - `grep -q "CNCF Kubernaut" src/data/social.ts`
    - `grep -q "CNCF Kubernaut," src/layouts/BaseLayout.astro`
    - `grep -q "CNCF Kubernaut +" CLAUDE.md`

    Project-wide zero-residual:
    - `grep -rn 'Kubernaut' src/ CLAUDE.md 2>&1 | grep -v Binary` returns no matches.
    - But `grep -rn 'Kubestronaut' src/ CLAUDE.md 2>&1 | grep -v Binary | wc -l` returns at least 4 (the three files from this task + the two JSONs from Plan 04-01 + Hero.astro from Plan 04-02 pills).

    Structural (social.ts specifically):
    - `node -e "const s=require('./src/data/social.ts'.replace('.ts','').replace(/.*\//,''));"` is not a valid Node check — instead use: `node --input-type=module -e "import('./src/data/social.ts').then(m => { if(m.certifications[0].name !== 'CNCF Kubestronaut') process.exit(1); if(m.certifications[0].badge !== 'kubestronaut') process.exit(2); if(m.certifications.length !== 6) process.exit(3); console.log('OK'); })"` — OR simply run `npm run build` at Task 4's gate to verify TS compilation. Grep suffices for this acceptance level.
    - `grep -c "'CNCF " src/data/social.ts` prints `1` (only one CNCF-prefixed name; the other certs are CKA/CKS/... without CNCF prefix).

    Non-target blocks preserved:
    - `grep -q "{ name: 'CKA', badge: 'cka' }" src/data/social.ts` exits 0 (unchanged).
    - `grep -q "{ name: 'KCSA', badge: 'kcsa' }" src/data/social.ts` exits 0 (unchanged).
    - `grep -q 'skills =' src/data/social.ts` exits 0 (skills array preserved).
  </acceptance_criteria>
  <done>Three files mutated — `src/data/social.ts` cert[0] renamed (name + badge), `src/layouts/BaseLayout.astro` description default renamed, `CLAUDE.md` §Homepage Sections renamed. Zero `Kubernaut` substring remains in `src/` or `CLAUDE.md`. Other cert entries, skills array, and em-dash formatting preserved.</done>
</task>

<task type="auto">
  <name>Task 2: Header.astro — append IntersectionObserver nav-active observer + scroll-margin-top global rule</name>
  <files>src/components/Header.astro, src/styles/global.css</files>
  <read_first>
    - src/components/Header.astro (read in full — you're APPENDING at the end of the file; must not overwrite or disturb existing `<script>` block ending on line 173; understand the existing mobile menu + scroll-shrink + language-switch + search-trigger handlers so you don't conflict with variable names)
    - src/styles/global.css (read in full — confirm `html { scroll-behavior: smooth; }` at lines 58-60 is present; the new `section[id] { scroll-margin-top: 80px; }` rule pairs with this)
    - src/pages/en/index.astro (spot check — confirm the homepage renders sections with `id` attributes `#about`, `#podcasts`, `#book`, `#speaking`, `#presentations`, `#blog`, `#contact`; if any section doesn't have an id the observer will silently skip it)
    - src/layouts/BaseLayout.astro (confirm the existing `.animate-on-scroll` observer in `<script>` block is intact — lines 63-88; new observer in Header.astro is independent, different threshold/rootMargin, different toggle semantics)
    - .planning/phases/04-hero-reference-match/04-CONTEXT.md (D-09, D-10 — observer specification)
    - .planning/phases/04-hero-reference-match/04-RESEARCH.md §Architecture Patterns §Pattern 3 (complete pattern + threshold/rootMargin rationale); §Example 3 (append script verbatim)
    - .planning/phases/04-hero-reference-match/04-PATTERNS.md §`src/components/Header.astro` (append target: after existing `</script>` on line 173; add first `<style>` block in Header.astro)
  </read_first>
  <action>
    **Part A — Append to `src/components/Header.astro`:**

    Locate the existing `</script>` closing tag at approximately line 173. Immediately AFTER that line (leaving one blank line for visual separation), append EXACTLY these blocks:

    ```astro

    <script>
      // Nav active-state highlight via IntersectionObserver (Phase 4 D-09).
      // Observes every <section id="..."> on the page and toggles `.is-active`
      // on the matching header anchor. Single observer, no framework, extends
      // Zero-JS baseline by one per D-10.
      const sections = document.querySelectorAll('section[id]');
      const navLinks = Array.from(document.querySelectorAll('header a[href^="#"]'));
      const linkByHref = new Map(navLinks.map((a) => [a.getAttribute('href'), a]));

      const obs = new IntersectionObserver(
        (entries) => {
          for (const e of entries) {
            const link = linkByHref.get('#' + (e.target as HTMLElement).id);
            if (!link) continue;
            if (e.isIntersecting) {
              navLinks.forEach((a) => a.classList.remove('is-active'));
              link.classList.add('is-active');
            }
          }
        },
        { threshold: 0.5, rootMargin: '-80px 0px -50% 0px' }
      );

      sections.forEach((s) => obs.observe(s));
    </script>

    <style>
      /* Nav active-state visual: teal underline + full-contrast text (Phase 4 D-09). */
      header a.is-active {
        color: var(--text-primary);
        border-bottom: 2px solid var(--brand-primary);
      }
    </style>
    ```

    Rules (mandatory):
    - Append AFTER the existing `</script>` closing tag — do not replace any existing code.
    - The new `<script>` block is a separate, independent block from the existing one (Astro 5 supports multiple `<script>` tags per component; each is processed independently — RESEARCH.md §Architecture Patterns §Pattern 4).
    - Variable names (`sections`, `navLinks`, `linkByHref`, `obs`) must be unique within this script block — they do NOT conflict with the existing script block's variables (`btn`, `menu`, `header`, `searchTriggerDesktop`, etc.) because each `<script>` is module-scoped in Astro.
    - `threshold: 0.5` and `rootMargin: '-80px 0px -50% 0px'` must be exactly these values (per D-09). The `-80px` top inset accounts for the ~61px sticky header plus ~19px buffer; the `-50%` bottom narrows the active zone to the upper half of the viewport.
    - TypeScript cast `(e.target as HTMLElement)` is required — Astro processes the script as TS; without the cast, `.id` access is untyped.
    - The `<style>` block MUST use plain CSS (not `@apply` Tailwind utilities) — `var(--text-primary)` and `var(--brand-primary)` reference the Deep Signal CSS custom properties directly. Astro's scoped-style compiler will prefix the selector with `[data-astro-cid-*]` but the rule still applies because the `<header>` element rendered by this file inherits the cid.
    - Do NOT wrap in `document.addEventListener('DOMContentLoaded', ...)` — Astro 5 renders inline `<script>` tags in-place after the HTML they sit adjacent to (per RESEARCH.md §Pitfall 7 + §Architecture Patterns §Pattern D), so the DOM is already parsed when this script runs.
    - Keep the existing `<script>` block (mobile menu, scroll shrink, language switch, search triggers) byte-identical.
    - File MUST end with a trailing newline.

    **Part B — Add `scroll-margin-top` global rule to `src/styles/global.css`:**

    Add ONE new CSS rule to `src/styles/global.css`. Place it immediately AFTER the `html { scroll-behavior: smooth; }` rule (which ends around line 60, before the `body {}` rule on line 62). Add:

    ```css

    /* Sticky-header offset for anchor navigation (Phase 4 Claude's Discretion #3).
       All <section id="..."> gets 80px top breathing room when scrolled to via
       hash link. Pairs with scroll-behavior: smooth and Header.astro's ~61px
       sticky height. */
    section[id] {
      scroll-margin-top: 80px;
    }
    ```

    Rules:
    - Placement: immediately after `html { scroll-behavior: smooth; }` block (around line 60), BEFORE `body {` block.
    - Use CSS `section[id]` attribute selector — this applies to all present and future `<section id="...">` on any page (Hero, About, Podcasts, Book, Speaking, Presentations, Blog, Contact).
    - `80px` matches the rootMargin top inset in Header.astro's observer for consistency.
    - File MUST remain valid CSS.
    - Do NOT modify any other global.css rule.

    After Part A + Part B are applied, do not run the build yet — Task 3 handles the build gate.
  </action>
  <verify>
    <automated>grep -q 'new IntersectionObserver' src/components/Header.astro || { echo "observer missing"; exit 1; }; grep -q "threshold: 0.5, rootMargin: '-80px 0px -50% 0px'" src/components/Header.astro || { echo "observer options missing/wrong"; exit 2; }; grep -q "document.querySelectorAll('section\\[id\\]')" src/components/Header.astro || { echo "sections querySelector missing"; exit 3; }; grep -q "header a\\.is-active" src/components/Header.astro || { echo ".is-active style missing"; exit 4; }; grep -q 'border-bottom: 2px solid var(--brand-primary)' src/components/Header.astro || { echo "brand-primary underline style missing"; exit 5; }; SCRIPT_COUNT=$(grep -c '^<script>' src/components/Header.astro); if [ "$SCRIPT_COUNT" -ne 2 ]; then echo "Expected 2 <script> blocks, got $SCRIPT_COUNT"; exit 6; fi; grep -q 'document.getElementById(.mobile-menu-btn.)' src/components/Header.astro || { echo "existing mobile menu handler was damaged"; exit 7; }; grep -q 'section\\[id\\] {' src/styles/global.css || { echo "scroll-margin-top rule missing from global.css"; exit 8; }; grep -q 'scroll-margin-top: 80px' src/styles/global.css || { echo "scroll-margin-top value missing"; exit 9; }; grep -q 'html {' src/styles/global.css && grep -q 'scroll-behavior: smooth' src/styles/global.css || { echo "smooth-scroll rule accidentally damaged"; exit 10; }; echo "OK: observer + is-active style + scroll-margin-top added; existing Header script preserved"</automated>
  </verify>
  <acceptance_criteria>
    Header.astro presence checks:
    - `grep -q 'new IntersectionObserver' src/components/Header.astro` exits 0.
    - `grep -q "threshold: 0.5" src/components/Header.astro` exits 0.
    - `grep -q "rootMargin: '-80px 0px -50% 0px'" src/components/Header.astro` exits 0.
    - `grep -q "document.querySelectorAll('section\\[id\\]')" src/components/Header.astro` exits 0.
    - `grep -q 'header a.is-active' src/components/Header.astro` exits 0.
    - `grep -q 'color: var(--text-primary)' src/components/Header.astro` exits 0.
    - `grep -q 'border-bottom: 2px solid var(--brand-primary)' src/components/Header.astro` exits 0.
    - `grep -c '^<script>' src/components/Header.astro` prints `2` (existing + new script blocks).
    - `grep -c '^<style>' src/components/Header.astro` prints `1` (the new style block is the first in this file).

    Header.astro preservation checks:
    - `grep -q 'mobile-menu-btn' src/components/Header.astro` exits 0 (existing menu handler preserved).
    - `grep -q 'search-trigger-desktop' src/components/Header.astro` exits 0 (existing search trigger preserved).
    - `grep -q 'lang-switch' src/components/Header.astro` exits 0 (existing language-switch preserved).
    - `grep -c 'navItems' src/components/Header.astro` prints at least `3` (frontmatter def + desktop nav + mobile nav usages preserved).

    global.css presence checks:
    - `grep -q 'section\\[id\\] {' src/styles/global.css` exits 0.
    - `grep -q 'scroll-margin-top: 80px' src/styles/global.css` exits 0.

    global.css preservation checks:
    - `grep -q 'html {' src/styles/global.css` exits 0.
    - `grep -q 'scroll-behavior: smooth' src/styles/global.css` exits 0.
    - `grep -q '@theme' src/styles/global.css` exits 0.
    - `grep -q 'animate-on-scroll' src/styles/global.css` exits 0.
    - `grep -q 'typing-cursor' src/styles/global.css` exits 1 (still removed from Plan 04-02 Task 3 — confirm no regression).

    Logical:
    - Inline script's TypeScript compilation succeeds — validated by Task 3's `npm run build`.
  </acceptance_criteria>
  <done>Header.astro has the new IntersectionObserver script block + `.is-active` style block appended; existing mobile menu + scroll shrink + language switch + search triggers preserved. global.css has the `section[id] { scroll-margin-top: 80px; }` rule added immediately after `html { scroll-behavior: smooth }`; no regression to other rules.</done>
</task>

<task type="auto">
  <name>Task 3: Inline REQ-011, REQ-013, REQ-014 into REQUIREMENTS.md + Astro build gate + DOM verification</name>
  <files>.planning/REQUIREMENTS.md</files>
  <read_first>
    - .planning/REQUIREMENTS.md (read in full — understand the existing structure: REQ-001 through REQ-008 blocks + "Global acceptance" block at the end; each REQ has a standard header format with Type/Priority/Maps to metadata)
    - .planning/phases/04-hero-reference-match/04-RESEARCH.md §Phase Requirements (source of the acceptance criteria text to inline verbatim — REQ-011, REQ-013, REQ-014)
    - .planning/phases/04-hero-reference-match/04-CONTEXT.md (context on why these REQs are being introduced by Phase 4)
  </read_first>
  <action>
    **Part A — Append REQ-011, REQ-013, REQ-014 to `.planning/REQUIREMENTS.md`:**

    Locate the existing REQ-008 block. It ends with the line containing "Both locales render identically" (around line 176). After that line, BEFORE the `## Global acceptance (all phases)` heading, insert exactly these three new blocks (preserving the `---` separators between each):

    ```markdown

    ---

    ## REQ-011 — Hero: reposition as primary pitch with 4-pill authority strip

    **Type:** Component rewrite
    **Priority:** P0
    **Maps to:** Phase 4

    The Hero section MUST reframe as the site's primary pitch with a compact authority strip of 4 pills that cover speaker credibility, CNCF achievement, author credibility, and podcast host status:

    1. `re:Invent & Keynote Speaker` → scrolls to `#speaking`
    2. `CNCF Kubestronaut` (teal-active, external link) → https://www.cncf.io/training/kubestronaut/
    3. `Author «Cracking the Kubernetes Interview»` → scrolls to `#book`
    4. `Host · DKT + AWS RU` → scrolls to `#podcasts`

    The 6 cert pills that currently render from `src/data/social.ts certifications` (CNCF Kubestronaut + CKA/CKS/CKAD/KCNA/KCSA) MUST be replaced in the Hero — "Kubestronaut" already implies the 5 underlying certs. The About section does not render cert cards either (Phase 3). Pill labels are locale-invariant (brand/credential names, stay English in both EN and RU).

    **Acceptance:**
    - Hero contains exactly 4 `<a>` elements with class string containing `inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-[13px] font-medium`.
    - Each pill has the correct href, and the Kubestronaut pill has `target="_blank"`, `rel="noopener"`, and `aria-label="CNCF Kubestronaut program (opens in new tab)"`.
    - No `CKA|CKS|CKAD|KCNA|KCSA` strings appear inside the Hero section in the built HTML.
    - 4-pill row renders on one line at 1440px (no wrap) — verified via Playwright computed width.
    - Both EN (`dist/en/index.html`) and RU (`dist/ru/index.html`) render identically.
    - Scrolling through `#about`, `#book`, `#podcasts`, `#speaking` causes the corresponding nav link to gain `.is-active` (teal underline) — D-09 observer.

    ---

    ## REQ-013 — Hero: typography matches reference exactly

    **Type:** Component visual fidelity
    **Priority:** P0
    **Maps to:** Phase 4

    The Hero h1 computed styles MUST match the reference UI kit (`app.jsx:363`):

    - `font-family` resolves to Space Grotesk
    - `font-size: 64px` at viewports ≥800px, scaled via `clamp(40px, 8vw, 64px)` for narrower viewports
    - `font-weight: 700`
    - `letter-spacing: -0.03em` (`-1.92px` computed at 64px)
    - `line-height: 1.05` (`67.2px` computed at 64px)
    - `color: var(--text-primary)` (`#E2E8F0`)

    Role line MUST be mono amber 18px (`font-mono text-warm text-lg`).
    Background MUST be flat 160deg gradient via `--grad-hero-flat` token (not `--grad-hero-soft` radial blobs).
    Container MUST be `max-w-[1120px]`. Section padding MUST be `pt-24 pb-16 px-6` (96/64/24).
    Greeting structure MUST be two separate blocks (terminal prompt 14px teal + "Hi, I'm" 16px mute mono), not a single flex row.
    Cursor MUST be an inline `<span>_</span>` with `cursor-blink` CSS animation, not the old `.typing-cursor` pseudo-element.

    **Acceptance:**
    - h1 computed style at 1440×900: fontSize = 64px, fontWeight = 700, letterSpacing = -1.92px, lineHeight = 67.2px, fontFamily matches `/Space Grotesk/`.
    - h1 computed fontSize at 375×667: 40px (clamp floor hit).
    - `grep -q 'text-\[clamp(40px,8vw,64px)\]' src/components/Hero.astro` exits 0.
    - `grep -q 'grad-hero-flat' src/styles/design-tokens.css` exits 0 (token declared).
    - `grep -q 'var(--grad-hero-flat)' src/components/Hero.astro` exits 0 (token consumed).
    - No `typing-cursor` class in `src/` or `dist/_astro/*.css`.
    - No hardcoded hex codes in Hero.astro.

    ---

    ## REQ-014 — Hero: section height ≤ 540px on 1440×900

    **Type:** Component layout constraint
    **Priority:** P0
    **Maps to:** Phase 4

    The Hero section computed total height on 1440×900 desktop viewport MUST be ≤ 540px (target ~520px, +20px tolerance for pill wrap sub-pixel DPR). This represents a reduction from the previous ~810px (caused by `min-h-[90vh]` stretching).

    **Acceptance:**
    - `document.getElementById('hero').getBoundingClientRect().height` on 1440×900 with all content loaded: **≤ 540**.
    - No `min-h-[90vh]`, `flex items-center`, or `pt-16` classes on the Hero `<section>` wrapper.
    - Hero `<section>` uses `pt-24 pb-16 px-6` classes exactly.
    - All 4 authority pills render on one row on 1440×900 (no wrap).
    ```

    Rules:
    - Preserve all existing REQ blocks (REQ-001 through REQ-008) byte-identical.
    - Preserve the `## Global acceptance (all phases)` heading and its child bullets at the file's end.
    - Preserve the file's initial header (title, milestone, target, reference).
    - The three new REQ blocks appear BETWEEN REQ-008 and "Global acceptance".
    - Use `---` horizontal-rule separators between each new REQ block to match the existing file style.
    - All acceptance criteria use grep-verifiable or Playwright-measurable assertions.

    **Part B — Astro build gate:**

    Run the full build and DOM checks:

    ```bash
    npm run build 2>&1 | tail -10
    # Expected: exit 0, "7 pages built" or similar in output.
    ```

    Built HTML checks:
    ```bash
    # 4-pill count in Hero (both locales)
    for locale in en ru; do
      n=$(awk '/<section id="hero"/{p=1} /<\/section>/{p=0; exit} p' "dist/$locale/index.html" | grep -c 'rounded-full text-\[13px\] font-medium')
      if [ "$n" -ne 4 ]; then echo "Locale $locale has $n pills, expected 4"; exit 1; fi
    done

    # Kubestronaut external link present in both
    for locale in en ru; do
      if ! grep -q 'href="https://www.cncf.io/training/kubestronaut/"' "dist/$locale/index.html"; then
        echo "Kubestronaut pill missing in $locale"; exit 2
      fi
      if ! grep -q 'rel="noopener"' "dist/$locale/index.html"; then
        echo "rel=noopener missing in $locale"; exit 3
      fi
    done

    # Tagline accent rendered both locales
    for locale in en ru; do
      if ! grep -Eq 'text-text-primary[^"]*">AI Engineer</span>' "dist/$locale/index.html"; then
        echo "Tagline accent missing in $locale"; exit 4
      fi
    done

    # Kubestronaut rename landed — zero Kubernaut in built HTML
    for locale in en ru; do
      if grep -Eq 'Kubernaut[^e]' "dist/$locale/index.html"; then
        echo "Residual Kubernaut misspelling in built HTML $locale"; exit 5
      fi
    done

    # CKA-family cert pills absent from Hero
    for locale in en ru; do
      n=$(awk '/<section id="hero"/{p=1} /<\/section>/{p=0; exit} p' "dist/$locale/index.html" | grep -cE 'CKA|CKS|CKAD|KCNA|KCSA')
      if [ "$n" -ne 0 ]; then echo "Hero has $n CKA-family pills in $locale, expected 0"; exit 6; fi
    done

    # No typing-cursor in built CSS
    n=$(grep -l 'typing-cursor' dist/_astro/*.css 2>/dev/null | wc -l)
    if [ "$n" -gt 0 ]; then echo "typing-cursor still in built CSS"; exit 7; fi

    echo "All DOM checks passed"
    ```

    If all checks pass, proceed to Task 4 (visual checkpoint).
  </action>
  <verify>
    <automated>grep -q '## REQ-011 — Hero: reposition as primary pitch' .planning/REQUIREMENTS.md || { echo "REQ-011 not inlined"; exit 1; }; grep -q '## REQ-013 — Hero: typography matches reference exactly' .planning/REQUIREMENTS.md || { echo "REQ-013 not inlined"; exit 2; }; grep -q '## REQ-014 — Hero: section height' .planning/REQUIREMENTS.md || { echo "REQ-014 not inlined"; exit 3; }; grep -q '^## REQ-008' .planning/REQUIREMENTS.md || { echo "REQ-008 accidentally damaged"; exit 4; }; grep -q '## Global acceptance' .planning/REQUIREMENTS.md || { echo "Global acceptance heading damaged"; exit 5; }; npm run build 2>&1 | tail -5 > /tmp/gsd-04-03-build.log; if [ ${PIPESTATUS[0]} -ne 0 ]; then cat /tmp/gsd-04-03-build.log; echo "Build failed"; exit 6; fi; for loc in en ru; do n=$(awk '/<section id="hero"/{p=1} /<\/section>/{p=0; exit} p' "dist/$loc/index.html" | grep -c 'rounded-full text-\[13px\] font-medium'); if [ "$n" -ne 4 ]; then echo "Locale $loc has $n Hero pills, expected 4"; exit 7; fi; done; grep -q 'href="https://www.cncf.io/training/kubestronaut/"' dist/en/index.html || { echo "Kubestronaut link missing EN"; exit 8; }; grep -q 'href="https://www.cncf.io/training/kubestronaut/"' dist/ru/index.html || { echo "Kubestronaut link missing RU"; exit 9; }; grep -Eq 'Kubernaut[^e]' dist/en/index.html && { echo "Kubernaut misspelling in built EN HTML"; exit 10; }; grep -Eq 'Kubernaut[^e]' dist/ru/index.html && { echo "Kubernaut misspelling in built RU HTML"; exit 11; }; grep -l 'typing-cursor' dist/_astro/*.css 2>/dev/null | grep -q . && { echo "typing-cursor in built CSS"; exit 12; }; echo "All OK"</automated>
  </verify>
  <acceptance_criteria>
    REQUIREMENTS.md presence:
    - `grep -q '^## REQ-011 — Hero: reposition as primary pitch' .planning/REQUIREMENTS.md`
    - `grep -q '^## REQ-013 — Hero: typography matches reference exactly' .planning/REQUIREMENTS.md`
    - `grep -q '^## REQ-014 — Hero: section height' .planning/REQUIREMENTS.md`
    - `grep -q 'grad-hero-flat' .planning/REQUIREMENTS.md` (REQ-013 references the token)
    - `grep -q 'clamp(40px, 8vw, 64px)' .planning/REQUIREMENTS.md` (REQ-013 references the clamp)
    - `grep -q '≤ 540' .planning/REQUIREMENTS.md` (REQ-014 height target)

    REQUIREMENTS.md preservation:
    - `grep -q '^## REQ-001' .planning/REQUIREMENTS.md` exits 0 (REQ-001 preserved).
    - `grep -q '^## REQ-008' .planning/REQUIREMENTS.md` exits 0 (REQ-008 preserved).
    - `grep -q '## Global acceptance (all phases)' .planning/REQUIREMENTS.md` exits 0 (footer preserved).

    Build:
    - `npm run build` exits 0.
    - `dist/en/index.html` and `dist/ru/index.html` exist.

    Built HTML DOM checks:
    - Each locale's `<section id="hero">` contains exactly 4 pills (class string match).
    - Each locale's Hero contains `href="https://www.cncf.io/training/kubestronaut/"` + `rel="noopener"`.
    - Each locale's Hero renders the tagline accent with `AI Engineer` wrapped in `text-text-primary`.
    - Each locale's built HTML contains zero `Kubernaut` (without `-estr-`) substrings.
    - Each locale's Hero contains zero `CKA/CKS/CKAD/KCNA/KCSA` strings.
    - Built CSS (`dist/_astro/*.css`) contains zero `typing-cursor` references.

    Cross-file Kubestronaut:
    - `grep -rn 'Kubernaut' src/ CLAUDE.md 2>&1 | grep -v Binary` returns no matches (final zero-residual check).
  </acceptance_criteria>
  <done>REQUIREMENTS.md has REQ-011, REQ-013, REQ-014 inlined with acceptance criteria matching RESEARCH.md §9.1. `npm run build` exits 0 with 7 pages. Built HTML verified: 4 Hero pills per locale, Kubestronaut external link with noopener, tagline accent rendering, zero Kubernaut residuals, zero CKA-family pills in Hero. Built CSS has zero typing-cursor references. Existing REQs preserved.</done>
</task>

<task type="checkpoint:human-verify" gate="blocking">
  <name>Task 4: User visual gate — confirm Hero typography, height, nav active-state, and scroll-anchor behavior</name>
  <what-built>
    Phase 4 complete. Files changed across all three plans:
    - src/i18n/en.json, src/i18n/ru.json (04-01) — hero.tagline 3-key split + CNCF Kubestronaut fix in about.bio_before.
    - src/styles/design-tokens.css (04-02) — new `--grad-hero-flat` token.
    - src/components/Hero.astro (04-02) — full rewrite: 4-pill authority strip (re:Invent, Kubestronaut external, Author, Host), clamp h1, inline `_` cursor, flat gradient, 3-key tagline with text-primary accent, role mono amber.
    - src/styles/global.css (04-02, 04-03) — removed `.typing-cursor` + `@keyframes blink` + reduced-motion override; added `section[id] { scroll-margin-top: 80px; }`.
    - src/data/social.ts (04-03) — Kubernaut → Kubestronaut in certifications[0].
    - src/layouts/BaseLayout.astro (04-03) — CNCF Kubestronaut in description meta.
    - CLAUDE.md (04-03) — CNCF Kubestronaut in §Homepage Sections.
    - src/components/Header.astro (04-03) — IntersectionObserver nav-active observer + `.is-active` style.
    - .planning/REQUIREMENTS.md (04-03) — REQ-011, REQ-013, REQ-014 inlined.

    Result: Hero section matches reference `app.jsx:357-398` pixel-for-pixel
    at 1440×900, with the 4-pill authority strip replacing the 6-pill cert row.
  </what-built>
  <how-to-verify>
    1. **Start dev server** (if not already running):
       ```bash
       npm run dev
       # Serves at http://localhost:4321
       ```

    2. **Visual + computed-style check at 1440×900 (EN + RU)**:
       - Open http://localhost:4321/en/ in a browser at viewport size 1440×900.
       - Hero section should appear WITHOUT stretching to fill 90% of viewport height. It should feel compact, roughly the upper half of the viewport.
       - Confirm visible:
         - Terminal prompt line: `~/vedmich.dev $ whoami` in teal mono 14px
         - "Hi, I'm" in mute mono 16px directly below
         - "Viktor Vedmich_" as the h1 (large, Space Grotesk, with blinking teal `_` cursor at the end)
         - Role: "Senior Solutions Architect @ AWS" in mono amber 18px
         - Tagline: "Distributed Systems · Kubernetes · AI Engineer" — with "AI Engineer" in brighter white (text-primary)
         - 4 pills in one row: `re:Invent & Keynote Speaker` → `CNCF Kubestronaut` (teal, with leading dot) → `Author «Cracking the Kubernetes Interview»` → `Host · DKT + AWS RU`
         - Two CTAs below: "Get in touch" (solid teal) + "Read more →" (ghost)
         - Background: smooth flat gradient from dark navy (top-left) to deep teal (bottom-right) — NO blobs
       - Open DevTools → Inspect the h1 element → Computed tab:
         - `font-family: 'Space Grotesk', ...` ✓
         - `font-size: 64px` ✓
         - `font-weight: 700` ✓
         - `letter-spacing: -1.92px` (-0.03em × 64px) ✓
         - `line-height: 67.2px` (1.05 × 64px) ✓
         - `color: rgb(226, 232, 240)` (#E2E8F0 = --text-primary) ✓
       - In DevTools Console:
         ```js
         document.getElementById('hero').getBoundingClientRect().height
         // Expected: ≤ 540 (target ~520).
         ```
       - Repeat for http://localhost:4321/ru/ — same visual, RU translations for tagline-before and greeting; "AI Engineer" stays English.

    3. **Computed-style check at 375×667 (mobile)**:
       - Narrow the viewport to 375×667 (iPhone SE dimensions).
       - Hero should stay readable without horizontal scroll.
       - h1 Computed fontSize: **40px** (clamp floor hit via `clamp(40px, 8vw, 64px)` — at 375px viewport, `8vw = 30px` but the clamp floor keeps it at 40px).
       - Pills may wrap to multiple lines on 375px — that's acceptable (D-19 mobile graceful-degrade note).

    4. **Nav active-state highlight**:
       - Scroll to About section (click Hero's "Read more" CTA, or scroll manually).
       - Header nav link "About" should gain a teal underline + brighter text color when the About section is ≥ 50% visible in the viewport.
       - Scroll further to Podcasts, Book, Speaking — each time the active underline should move to the matching nav link.
       - Scroll back up — underline moves back in reverse.
       - NO flicker or jitter (may be small "handoff" between sections; that's expected behavior for threshold 0.5).

    5. **Anchor scroll + scroll-margin-top**:
       - Scroll to top of page.
       - Click Hero's "re:Invent & Keynote Speaker" pill.
       - Page smoothly scrolls to the Speaking section.
       - The Speaking section title should be visible BELOW the sticky header (not hidden behind it). This is the `scroll-margin-top: 80px` rule working.
       - Click Hero's "Author «Cracking the Kubernetes Interview»" pill.
       - Page smoothly scrolls to Book section; Book title is visible below header.
       - Click Hero's "Host · DKT + AWS RU" pill.
       - Page smoothly scrolls to Podcasts section; Podcasts title visible below header.

    6. **Kubestronaut external link**:
       - Click Hero's "CNCF Kubestronaut" pill.
       - A new tab opens at https://www.cncf.io/training/kubestronaut/.
       - Original vedmich.dev tab is still reachable (reverse tabnabbing mitigation).
       - Right-click the Kubestronaut pill → Inspect → confirm `rel="noopener"` and `aria-label="CNCF Kubestronaut program (opens in new tab)"` are in the HTML.

    7. **Reduced-motion check (optional)**:
       - Enable system-level "Reduce motion" (macOS: System Settings → Accessibility → Display → Reduce motion; Linux: GNOME Tweaks).
       - Reload the page.
       - The `_` cursor should NOT blink (animation halted per reduced-motion override added in 04-02 Task 2's `<style>`).

    8. **DevTools Console — no errors**:
       - No JavaScript errors referencing `hero.tagline`, `certifications`, or `typing-cursor`.
       - No CSS "failed to parse" warnings.
       - If any are present, describe them and the executor will diagnose.

    9. **Cross-artifact sanity (no action needed — confirmatory only)**:
       - The Obsidian vault references + playwright-cli snapshots under `.planning/` and `.playwright-cli/` still mention "Kubernaut" — this is INTENTIONAL (historical audit artifacts per D-04 exclusion). Do NOT flag these as regressions.

    If all checks pass, type **`approved`** to confirm visual + functional parity. If any check fails, describe the specific mismatch (which step, what you see, what you expected) and the executor will diagnose and loop back to the appropriate task.
  </how-to-verify>
  <resume-signal>Type `approved` to confirm REQ-011, REQ-013, REQ-014 acceptance criteria all met and proceed to the atomic Phase 4 commit + push-to-main. Or describe any mismatch (typography value, height, pill count, nav active-state behavior, anchor scroll alignment, console error).</resume-signal>
</task>

</tasks>

<threat_model>
## Trust Boundaries

No new trust boundary introduced by this plan beyond Plan 04-02's external
Kubestronaut link (already mitigated via `rel="noopener"` in Plan 04-02).
Kubernaut → Kubestronaut rename does not alter the site's attack surface.
Header.astro observer is same-origin DOM query and toggle; no cross-origin
data handling.

## STRIDE Threat Register

| Threat ID | Category | Component | Disposition | Mitigation Plan |
|-----------|----------|-----------|-------------|-----------------|
| T-04-03-01 | Tampering | src/data/social.ts certifications array | accept | Build-time static data; repo write access already trust-bounded. |
| T-04-03-02 | Tampering | BaseLayout.astro default description prop | accept | Build-time default; overridable per-page; public text. |
| T-04-03-03 | Tampering | CLAUDE.md doc | accept | Docs artifact; not runtime asset. |
| T-04-03-04 | Info disclosure | meta description | accept | Public bio string; intentionally in `<meta name="description">` + OG. |
| T-04-03-05 | Injection | Header.astro inline `<script>` observer | accept | Uses DOM APIs only (querySelectorAll, classList, IntersectionObserver); no user input, no innerHTML, no eval. |
| T-04-03-06 | Denial of service | nav-active observer | accept | Single observer instance watching ~7 sections; native browser API with built-in throttling. |
| T-04-03-07 | Information disclosure | href="#section" in-site anchors | accept | Same-origin navigation only; no new routes exposed. |

No new mitigations required (T-04-01 external-link reverse-tabnabbing is
already handled by Plan 04-02's `rel="noopener"`).
</threat_model>

<verification>
Phase 4 verification is distributed across all three plans; Plan 04-03 is the
final gate:

- All three plans' `<verify><automated>` commands exit 0.
- `npm run build` exits 0 with 7 pages built (Plan 04-02 Task 3 + Plan 04-03 Task 3).
- `grep -rn 'Kubernaut' src/ CLAUDE.md 2>&1 | grep -v Binary` returns no matches.
- Built HTML (both EN + RU `dist/*/index.html`) contains:
  - 4 Hero pills with the authority strip labels
  - Kubestronaut external link with `target="_blank"` + `rel="noopener"`
  - Tagline accent with `AI Engineer` in `text-text-primary`
  - Zero CKA-family pills inside Hero section
  - Zero `Kubernaut` substrings
- Built CSS (`dist/_astro/*.css`) contains zero `typing-cursor` rules.
- `.planning/REQUIREMENTS.md` contains REQ-011, REQ-013, REQ-014 with acceptance criteria.
- User visual gate (Task 4) confirms:
  - h1 computed styles match REQ-013 (64/700/-1.92px/67.2px at 1440×900, 40px at 375×667)
  - Hero height ≤ 540px on 1440×900 (REQ-014)
  - Nav active-state toggles on scroll (D-09)
  - scroll-margin-top prevents header obstruction on anchor click
  - No console errors

Post-commit, post-push verification (outside this plan, on live):
- Wait ~2 min for GitHub Actions deploy (`gh run list --branch main --limit 3`).
- Playwright-cli attach to Chrome → https://vedmich.dev/en/ at 1440×900 + 375×667; https://vedmich.dev/ru/ at same viewports.
- Same computed-style + height measurements repeated on live URLs.
- Record measurements in `.planning/phases/04-hero-reference-match/04-SUMMARY.md` (orchestrator writes phase SUMMARY after checkpoint approval).
</verification>

<success_criteria>
- `src/data/social.ts`, `src/layouts/BaseLayout.astro`, `CLAUDE.md` all have `Kubernaut → Kubestronaut`.
- Zero `Kubernaut` (without `-estr-` infix) in `src/` or `CLAUDE.md`.
- `src/components/Header.astro` has the nav-active IntersectionObserver script appended (after existing script block) + scoped `<style>` with `.is-active` rule.
- `src/styles/global.css` has `section[id] { scroll-margin-top: 80px; }` rule added.
- `.planning/REQUIREMENTS.md` has REQ-011, REQ-013, REQ-014 blocks inlined between REQ-008 and Global acceptance.
- `npm run build` exits 0 with 7 pages.
- Built HTML verification passes in both locales.
- User types `approved` on Task 4 checkpoint after local preview verifies REQ-011/013/014 acceptance criteria visually + via DevTools computed styles + via `getBoundingClientRect().height` check.
- After checkpoint approval, orchestrator proceeds to atomic Phase 4 commit + push to main (outside this plan's scope).
</success_criteria>

<output>
After Task 4 `approved`, create `.planning/phases/04-hero-reference-match/04-03-SUMMARY.md` recording:
- List of the three renamed files (social.ts / BaseLayout.astro / CLAUDE.md) with before/after one-line diffs.
- Header.astro append shape (location of new `<script>` block line numbers, `<style>` block line numbers).
- global.css changes: `section[id] { scroll-margin-top: 80px; }` location (line number relative to `html { scroll-behavior: smooth }`); confirmation that typing-cursor rules stayed removed from Plan 04-02.
- REQUIREMENTS.md: confirm REQ-011, REQ-013, REQ-014 present with acceptance criteria block sizes.
- Build result: "7 pages, ~Xs" exit 0.
- Measured Hero height on 1440×900 (from DevTools `getBoundingClientRect().height` reading) — record actual pixel count.
- Measured h1 computed styles at 1440×900: fontSize, fontWeight, letterSpacing, lineHeight, fontFamily.
- Measured h1 fontSize at 375×667: pixel count (should be 40px).
- User checkpoint outcome: `approved` / `changes requested` + description.
- Final note to orchestrator: "Phase 4 complete; all 3 plans landed; ready for atomic commit `docs(04): match Hero to reference + Kubestronaut rename + nav observer` covering the 9 files: src/i18n/en.json, src/i18n/ru.json, src/styles/design-tokens.css, src/components/Hero.astro, src/styles/global.css, src/data/social.ts, src/layouts/BaseLayout.astro, CLAUDE.md, src/components/Header.astro, .planning/REQUIREMENTS.md, .planning/STATE.md. Await user push confirmation per CLAUDE.md §Publishing Workflow."
</output>
</content>
