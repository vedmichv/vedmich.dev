# Phase 4: Hero — match reference pixel-for-pixel — Research

**Researched:** 2026-04-19
**Domain:** Astro 5 component rewrite + Tailwind 4 arbitrary utilities + IntersectionObserver nav highlight + cross-file rename
**Confidence:** HIGH

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

**Phase Boundary**
- Rewrite `src/components/Hero.astro` to match reference (`app.jsx:357-391`) on 1440×900.
- Reposition Hero as the site's primary pitch (compact ~520px, credibility-dense).
- Project-wide rename **CNCF Kubernaut → CNCF Kubestronaut** (factology fix).
- Add IntersectionObserver-based nav active-state highlight in `Header.astro`.
- Out of scope: rewriting other sections; adding popover/Calendly/tooltip; changing cert data in `social.ts` beyond the one name/badge field.

**D-01..D-19 (verbatim scope for research and planning)**
- **D-01** Hero as sales pitch — compact ~520px, every line optimized to make visitors "hire / buy".
- **D-02** Replace 6 cert pills with 4-pill authority strip. CKA/CKS/CKAD/KCNA/KCSA are dropped from Hero. About section already has no cert block (Phase 3).
- **D-03** 4 pill labels, locale-invariant:
  1. `re:Invent & Keynote Speaker` → scrolls to `#speaking`
  2. `CNCF Kubestronaut` (teal active with dot) → external link to CNCF program
  3. `Author «Cracking the Kubernetes Interview»` → scrolls to `#book` (guillemets `«»` preserved both locales per Phase 3 D-07)
  4. `Host · DKT + AWS RU` → scrolls to `#podcasts` (middot separator)
- **D-04** Kubernaut → Kubestronaut in ONE atomic commit. Files:
  - `src/data/social.ts` (`certifications[0].name` + `badge` key)
  - `src/i18n/en.json` §`about.bio_before`
  - `src/i18n/ru.json` §`about.bio_before`
  - `src/layouts/BaseLayout.astro` §15 (default `description`)
  - `CLAUDE.md` §"Homepage Sections" #2
  - Do NOT touch `.playwright-cli/*.yml`, `current-content.json`, `ref-content.json` (historical).
- **D-05** Pills render as `<a>` elements. In-site: `href="#section"`. Kubestronaut: `href="https://www.cncf.io/training/kubestronaut/" target="_blank" rel="noopener"`. CSS `html { scroll-behavior: smooth }` already present (verified global.css:58-60).
- **D-06** Pill base: `inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-[13px] font-medium bg-surface text-text-primary border border-border font-body`. Teal variant: `bg-brand-primary-soft text-brand-primary-hover border-brand-primary` + leading dot `<span class="w-1.5 h-1.5 rounded-full bg-brand-primary-hover">`.
- **D-07** Hover affordance required (interactive): `hover:border-brand-primary hover:text-brand-primary-hover transition-colors`. Kubestronaut exception: `hover:bg-brand-primary-hover/20`.
- **D-08** Accessibility: `focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand-primary`. External pill has `aria-label="CNCF Kubestronaut program (opens in new tab)"`.
- **D-09** IntersectionObserver in Header.astro watches `#about #podcasts #book #speaking #presentations #blog #contact`. Toggles `.is-active` on matching nav link. Active style: `text-text-primary` + `border-b-2 border-brand-primary`. `threshold: 0.5, rootMargin: '-80px 0px -50% 0px'`. Inline module script, runs on DOMContentLoaded.
- **D-10** Extends Zero-JS baseline: scroll-observer + mobile menu → + nav-active. One observer, no framework.
- **D-11** h1: `font-display font-bold tracking-[-0.03em] leading-[1.05] text-text-primary m-0` with `font-size: clamp(40px, 8vw, 64px)`. 64px on ≥800px viewports, scales to 40px on 375px.
- **D-12** Add `--grad-hero-flat: linear-gradient(160deg, var(--bg-base), var(--brand-primary-soft));` to `design-tokens.css` §Gradients. Hero `.hero-deep-signal` uses `var(--grad-hero-flat)`. Keep `.noise-overlay`.
- **D-13** Keep `noise-overlay` class. Gradient banding prevention. Within Zero-JS (one `::after` pseudo).
- **D-14** Replace CSS `.typing-cursor` pseudo `|` with inline `_`: `<span class="cursor-blink text-brand-primary" aria-hidden="true">_</span>`. Add `.cursor-blink { animation: blink 1s step-end infinite } @keyframes blink { 50% { opacity: 0 } }`. `.typing-cursor` may be removed from `global.css` if no other consumer — grep required.
- **D-15** Keep reference tagline verbatim: `"Distributed Systems · Kubernetes · AI Engineer"`. 3-key i18n split:
  - `hero.tagline_before` = `"Distributed Systems · Kubernetes · "` (EN) / `"Распределённые системы · Kubernetes · "` (RU)
  - `hero.tagline_accent` = `"AI Engineer"` (both locales)
  - `hero.tagline_after` = `""` (both locales — reserve for future punctuation)
- **D-16** Remove old `hero.tagline` key. Render: `{i.hero.tagline_before}<span class="text-text-primary">{i.hero.tagline_accent}</span>{i.hero.tagline_after}`. No `set:html`, no HTML in JSON. Mirrors Phase 3 About bio pattern.
- **D-17** Greeting — two separate blocks, not one flex row:
  - Line 1 (hardcoded, no i18n): `<div class="font-mono text-brand-primary text-sm mb-4">~/vedmich.dev $ whoami</div>` — teal 14px, `mb-4` = 16px gap.
  - Line 2 (`i.hero.greeting`): `<div class="font-mono text-text-secondary text-base mb-1">Hi, I'm</div>` — mute 16px, `mb-1` = 4px gap.
- **D-18** Spacings (reference-faithful):
  - `<section>` padding: `pt-24 pb-16 px-6` (96/64/24). Drop `min-h-[90vh]`, `flex items-center`, `pt-16`.
  - Container: `max-w-[1120px] mx-auto w-full`. Drop nested `max-w-3xl`.
  - h1 → role: `mt-3` (12px).
  - Role → tagline: `mt-4` (16px ≈ ref 18px).
  - Tagline → pills: `mt-7` (28px).
  - Pills → CTA: `mt-8` (32px).
  - Pills internal gap: `gap-2.5` (10px).
  - CTA internal gap: `gap-3` (12px).
- **D-19** Target Hero height on 1440×900: **~520px**. Record actual measured height in SUMMARY. If too tall, pre-approved follow-ups: drop "Hi, I'm" line, tighten padding to 64/48.

### Claude's Discretion
- **Cursor animation placement:** inline `Hero.astro <style>` (local) vs `design-tokens.css` (canonical). Prefer local until second consumer appears.
- **Tailwind clamp spelling:** `text-[clamp(40px,8vw,64px)]` arbitrary vs `text-[40px] sm:text-[64px]` two-step fallback. Prefer clamp; fall back only if concrete bug found.
- **`scroll-margin-top: 80px`** on anchor targets (`#speaking`, `#book`, etc.) so sticky header doesn't overlap section title. Recommended yes — trivial single-line per section wrapper.
- **4-pill order:** Proposed `re:Invent → Kubestronaut → Author → Host`. Executor may reorder on wrap.
- **Grep `global.css` for `.typing-cursor`** pre-delete.

### Deferred Ideas (OUT OF SCOPE)
- Pill popovers with detail (Kubestronaut=CKA+CKS+CKAD+KCNA+KCSA tooltip, re:Invent BOA310 rating).
- Podcast metrics in pill (too long, go stale — already in Podcasts section).
- Hero CTA → Calendly embed (not set up; #contact is Phase 10).
- h1 letter-by-letter typing animation (violates Zero-JS).
- Mobile Hero rework (375px cramped — revisit post-ship).
- Section height tightening to ~420px (Phase 4.1 follow-up if 520 is still too tall).
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| REQ-011 | Hero repositioning — 4 authority pills replace 6 cert pills; Hero is primary pitch ≤ 520px on 1440×900 | D-01..D-03; Standard Stack (Astro 5 component); Code Examples (Pill markup); Architecture Patterns (monolithic .astro per Phase 3 convention) |
| REQ-013 | Hero typography — h1 matches reference (64px/700/-0.03em/1.05 ≥800px viewports, clamp to 40px on 375px) | D-11; Standard Stack (Tailwind 4 arbitrary `text-[clamp(...)]`); Code Examples (h1 classes); Common Pitfalls (Tailwind underscore semantics in arbitrary values) |
| REQ-014 | Hero section height target ≤ 520px on 1440×900 | D-18, D-19; Validation Architecture (playwright-cli getBoundingClientRect sample); Architecture Patterns (padding 96/64 + content) |

**Note:** REQ-011, REQ-013, REQ-014 are introduced by Phase 4 itself (promoted from legacy Phase 11 during Phase 3 audit on 2026-04-19). Current `.planning/REQUIREMENTS.md` does NOT yet contain these IDs. A planning task must inline them into REQUIREMENTS.md with the acceptance criteria below before execution begins:

- **REQ-011 acceptance:**
  - Hero contains exactly 4 pills with the D-03 labels (verified via grep on built HTML).
  - Hero contains 0 pills from `social.ts certifications.map` (i.e. no CKA/CKS/CKAD/KCNA/KCSA appear as Hero pills).
  - Each of the 4 pills is an `<a>` with the correct href and `target`/`rel`/`aria-label` where required.
  - 4-pill row renders on one line at 1440px (no wrap) — verified via Playwright computed styles.

- **REQ-013 acceptance:**
  - h1 computed style on 1440×900: `font-family` resolves to Space Grotesk; `font-size: 64px`; `font-weight: 700`; `letter-spacing: -1.92px` (-0.03em of 64px); `line-height: 67.2px` (1.05 of 64px); `color: rgb(226, 232, 240)` (#E2E8F0 = --text-primary).
  - h1 computed font-size on 375×667: `40px` (clamp floor hit).
  - No deprecated `typing-cursor` class remains on h1.

- **REQ-014 acceptance:**
  - `document.getElementById('hero').getBoundingClientRect().height` on 1440×900 with all content loaded: **≤ 540px** (520 ±20 tolerance — accounts for pill wrap overflow on sub-pixel DPR).
  - No `min-h-[90vh]` or `flex items-center` on the `<section>`.
</phase_requirements>

## Summary

Phase 4 is a **full-file rewrite of `src/components/Hero.astro`** (72 current lines → ~60-80 new lines) plus five targeted mutations in satellite files. The technical surface area is small (7 files) but the blast radius is wide (cross-file rename, i18n contract change, new global CSS token). All technology choices are already in the stack; nothing novel needs to be added.

Three technical tensions called out in the research brief are resolved below with HIGH confidence:

1. **Tailwind 4 arbitrary `clamp()`** — officially supported via `text-[clamp(40px,8vw,64px)]`. No spaces inside the parens means no underscore-substitution gotcha. The alternative CSS-variable form `text-(length:--hero-h1)` exists but adds indirection without value here.
2. **Astro 5 inline script semantics** — Since Astro 5 (`upgrade-to/v5`), `<script>` tags with no attributes are now rendered **directly where authored** (not hoisted, not bundled with other components' scripts) but they ARE still processed (TS compilation, import resolution). A second observer in `Header.astro` will co-exist fine with the existing mobile-menu/search script block; it's the same file so deduplication across component instances is moot (the header renders once per page).
3. **IntersectionObserver `rootMargin` for sticky header** — Header computed height is ~61px (`py-[14px]` + 32px logo + 1px border). The `-80px` top inset in the user-sketched `rootMargin: '-80px 0px -50% 0px'` gives a small safety buffer and makes the "active" section trigger slightly below the header fold; `-50%` bottom makes the transition happen mid-viewport. Both values are defensible defaults — no change recommended unless visual verify flags them.

The one **contentual divergence from the reference image** is pre-approved by the user and documented in D-02: the reference UI kit (`app.jsx:378-385` + `ref-hero.png`) shows **six cert pills** (CNCF Kubernaut + CKA/CKS/CKAD/KCNA/KCSA), but this phase replaces them with **four authority pills** as an explicit pitch-first product decision. The plan must not regress to 6 pills "because the reference has 6."

**Primary recommendation:** Execute Phase 4 as **3 plans across 2 waves**, mirroring Phase 3's cadence:
- Wave 1 (independent): Plan 04-01 i18n key mutation (hero.tagline split + Kubernaut→Kubestronaut fix in about.bio_before).
- Wave 2 (depends on 04-01): Plan 04-02 Hero.astro rewrite + design-tokens.css token addition. Plan 04-03 cross-file Kubernaut→Kubestronaut rename (social.ts, BaseLayout.astro, CLAUDE.md) + Header.astro nav-highlight observer + `.typing-cursor` cleanup in global.css + `scroll-margin-top` on section anchors.
- Single atomic commit at phase end (per project convention, `CLAUDE.md` §Publishing Workflow Big Changes — push to main is pre-approved for v0.4 milestone).

## Architectural Responsibility Map

| Capability | Primary Tier | Secondary Tier | Rationale |
|------------|-------------|----------------|-----------|
| Hero rendering (markup, typography, pills, CTA) | Astro SSG (build-time) | Browser (styles only) | Static content compiled at build; no hydration needed [VERIFIED: Hero.astro current is Zero-JS] |
| Nav active-state highlight | Browser (runtime) | — | Depends on viewport scroll position which only exists in browser; cannot be SSG'd [VERIFIED: CONTEXT.md D-09] |
| Pill navigation (in-site anchor) | Browser (native) | CSS (smooth-scroll) | Browser handles `href="#section"` via `html { scroll-behavior: smooth }` [VERIFIED: global.css:58-60] |
| Pill navigation (external, Kubestronaut) | Browser (native) | — | Standard `<a target="_blank" rel="noopener">` [CITED: OWASP Top 10 noopener advice] |
| Kubernaut→Kubestronaut data rename | Astro SSG (build-time) | — | Static `certifications` array consumed at build in Hero (indirectly — Phase 4 drops the .map, but social.ts canonical name still matters for downstream/About if reintroduced) [VERIFIED: social.ts:29-36] |
| i18n key split (tagline_before/accent/after) | Astro SSG (build-time) | — | JSON imported typed at build; no runtime lookup [VERIFIED: i18n/utils.ts pattern] |
| Cursor blink animation | Browser (CSS runtime) | — | CSS `@keyframes` executed by browser [VERIFIED: global.css:110-119 existing typing-cursor pattern] |
| Flat gradient + noise overlay | Browser (CSS runtime) | — | CSS `linear-gradient` + SVG data-URI `::after` [VERIFIED: design-tokens.css:281-293 existing .noise-overlay] |
| `scroll-margin-top` on anchors | Browser (CSS runtime) | — | CSS property consumed by browser on smooth-scroll-to-hash [CITED: MDN scrollIntoView] |

## Standard Stack

### Core

| Library | Version (verified) | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Astro | 5.17.1 (installed) / 5.17.1 (latest, `npm view`) | Static site generator; component model | Already the project's framework; v5 changes `<script>` rendering behavior (relevant to D-09 observer) [VERIFIED: package.json:15, `npm view astro version` = 6.1.8 HEAD, but project pinned to ^5.17.1 — v6 not eligible without a milestone upgrade] |
| Tailwind CSS | 4.2.1 (installed) / 4.2.2 (latest, `npm view`) | Utility-first styling; arbitrary values | Project standard; `text-[clamp(...)]` arbitrary-value syntax is canonical (no plugin needed) [VERIFIED: package.json:16, `npm view tailwindcss version` = 4.2.2 on 2026-04-19 — 1 patch behind] |
| `@tailwindcss/vite` | 4.2.1 (installed) | Tailwind 4 Vite plugin for Astro | Required for Tailwind 4 `@theme` blocks used in `global.css` [VERIFIED: package.json:14] |
| `@tailwindcss/typography` | 0.5.19 (installed) | Blog prose styling | Not touched by Phase 4 (no blog surface), but present [VERIFIED: package.json:13] |

### Supporting

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| Web Platform — `IntersectionObserver` | N/A (browser built-in) | Nav active-state detection | D-09 observer; already used in `BaseLayout.astro:72` for `.animate-on-scroll` [VERIFIED: BaseLayout.astro:72-86 existing pattern] |
| Web Platform — CSS `clamp()` | N/A (baseline CSS) | Responsive h1 font-size | D-11 `clamp(40px, 8vw, 64px)` — baseline support since 2020 [CITED: MDN CSS clamp] |
| Web Platform — CSS `scroll-margin-top` | N/A (baseline CSS) | Offset scroll-to-anchor for sticky header | Claude's Discretion — apply to `#speaking`, `#book`, `#podcasts`, `#about` targets at minimum [CITED: MDN scroll-margin-top] |
| Web Platform — CSS `scroll-behavior: smooth` | N/A (already set in `global.css:58-60`) | Smooth in-site anchor nav | Already canonical; no action [VERIFIED: global.css line 58-60] |

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| `text-[clamp(40px,8vw,64px)]` arbitrary | `text-(length:--hero-h1)` + `--hero-h1: clamp(...)` in design-tokens.css | CSS variable form is cleaner for reusable token [VERIFIED: Tailwind docs §font-size custom values]; but h1 size is one-off for Hero — arbitrary is direct. Prefer arbitrary; CSS-var form only if we need the same clamp elsewhere. |
| `text-[clamp(40px,8vw,64px)]` arbitrary | `text-[40px] sm:text-[64px]` two-step responsive | Two-step has a visible jump at 640px breakpoint, no interpolation. clamp is smoother. Fall back only if clamp has a paint bug in target browsers. |
| Inline `<script>` in `Header.astro` | Centralize in `BaseLayout.astro` next to animate-on-scroll observer | Inline scoping keeps each component's script adjacent to its markup — matches Phase 2/3 pattern (Header already has mobile-menu/search script inline). No reason to centralize. |
| `cursor-blink` keyframes in `Hero.astro <style>` | Put in `design-tokens.css` | Token CSS = one consumer right now. Inline `<style>` is scoped and trivial (3 lines). Prefer local per Claude's Discretion; promote later if second consumer appears. |
| `Pill` extracted to separate component | Inline in Hero | Phase 3 convention: keep monolithic. 4 pills with similar but distinct hrefs → inline is clearer. |
| Third-party Typed.js for cursor | Native CSS animation | Typed.js would add JS for a visual flourish; D-14 explicitly reverts to Zero-JS CSS keyframe. |

**Installation:**
```bash
# No new packages — all capabilities in existing stack.
# Optional patch upgrade (cosmetic; not required for Phase 4):
npm install tailwindcss@4.2.2
```

**Version verification:**
- `npm view astro version` → `6.1.8` (HEAD; project pinned `^5.17.1` allowing patches within 5.x; 5.17.1 remains the active installed version — do NOT bump to v6 in Phase 4).
- `npm view tailwindcss version` → `4.2.2` (2026-04-15 publish date; project on `^4.2.1` accepts 4.2.2 automatically on next install; no action needed).
- `@tailwindcss/vite` should move in lockstep with core; verify parity before any version bump.

## Architecture Patterns

### System Architecture Diagram

```
[Build time — Astro SSG]
  src/i18n/en.json  ─┐
  src/i18n/ru.json  ─┼─> t(locale): typed object  ──> Hero.astro frontmatter
  src/data/social.ts ┘   (tagline_before/_accent/_after)  (const i = t(locale))
                                                         │
  src/styles/design-tokens.css  ──> --grad-hero-flat     │
  src/styles/global.css  (@theme bridge)                 │
                                                         ▼
                                                   <section id="hero">
                                                   ├─ flat gradient bg
                                                   ├─ .noise-overlay ::after
                                                   ├─ greeting (2-block)
                                                   ├─ h1 + cursor-blink
                                                   ├─ role (mono amber)
                                                   ├─ tagline (3-part i18n)
                                                   ├─ 4 pill <a> tags
                                                   └─ 2 CTA buttons
                                                         │
                                                         ▼
                                                 Serve dist/{en,ru}/index.html
                                                         │
[Runtime — Browser]                                      ▼
  DOMContentLoaded ──> Header.astro <script>
                       ├─ mobile-menu toggle (existing)
                       ├─ search-palette trigger (existing)
                       ├─ animate-on-scroll observer (in BaseLayout)
                       └─ NEW: nav-active IntersectionObserver
                                │
                                observe(section[id]) × 7
                                │
                                on intersection (threshold 0.5):
                                ├─ remove .is-active from all nav links
                                └─ add .is-active to matching link
                                │
                                ▼
                          visible underline on active section link

  User clicks Hero pill (e.g., "re:Invent & Keynote Speaker")
                ├─ href="#speaking"
                ▼
  Browser scroll-behavior:smooth + scroll-margin-top:80px ──> scrolled section aligned below header
                                                         ──> observer fires, nav link gets .is-active
```

### Recommended Project Structure

Unchanged from existing. Phase 4 does NOT introduce new folders or files — only mutates existing ones:

```
src/
├── components/
│   ├── Hero.astro          # FULL REWRITE (72 lines → ~70)
│   └── Header.astro        # APPEND observer script + .is-active style
├── data/
│   └── social.ts           # Kubernaut → Kubestronaut (2 char changes)
├── i18n/
│   ├── en.json             # hero.tagline → 3 keys + Kubernaut → Kubestronaut
│   └── ru.json             # mirror
├── layouts/
│   └── BaseLayout.astro    # description meta: Kubernaut → Kubestronaut
└── styles/
    ├── design-tokens.css   # APPEND --grad-hero-flat
    └── global.css          # REMOVE .typing-cursor rules (if no consumer)

CLAUDE.md                    # copy fix: Kubernaut → Kubestronaut
```

### Pattern 1: Three-key i18n split with inline accent

**What:** Split a translator-facing string into before/accent/after, then render with a typed span around the accent. No HTML in JSON, no `set:html` in the component.

**When to use:** Any hero/headline/body text where a specific word/phrase needs visual emphasis (teal highlight here).

**Example (Phase 3 carry-forward, applied to Hero tagline):**
```astro
---
// Source: src/components/About.astro (Phase 3 canonical — reuse this exact pattern)
const { locale } = Astro.props;
const i = t(locale);
---
<p class="font-body text-lg text-text-secondary max-w-[640px] mt-4">
  {i.hero.tagline_before}<span class="text-text-primary">{i.hero.tagline_accent}</span>{i.hero.tagline_after}
</p>
```
```json
// Source: src/i18n/en.json (shape after 04-01 plan)
"hero": {
  "tagline_before": "Distributed Systems · Kubernetes · ",
  "tagline_accent": "AI Engineer",
  "tagline_after": ""
}
```

### Pattern 2: Tailwind 4 arbitrary `clamp()` font-size

**What:** Fluid typography via CSS `clamp()` as a Tailwind arbitrary value.

**When to use:** One-off responsive font-size not worth promoting to a design token.

**Example:**
```astro
<!-- Source: Tailwind docs §font-size custom values [CITED: tailwindcss.com/docs/font-size] -->
<h1 class="font-display font-bold tracking-[-0.03em] leading-[1.05] text-text-primary m-0 text-[clamp(40px,8vw,64px)]">
  {i.hero.name}<span class="cursor-blink text-brand-primary" aria-hidden="true">_</span>
</h1>
```

**CRITICAL — Tailwind arbitrary-value underscore rule:** Tailwind treats underscores as spaces at build-time in arbitrary values [CITED: tailwindcss.com/docs/adding-custom-styles §Handling whitespace]. `clamp(40px,8vw,64px)` contains NO spaces or underscores, so it is safe. If any space is needed inside the arg (e.g. `calc(100% - 20px)`), use underscore: `calc(100%_-_20px)`.

### Pattern 3: IntersectionObserver nav-active with sticky header

**What:** Toggle `.is-active` on nav links based on which section intersects the viewport, offset for a sticky header.

**When to use:** Multi-section single-page navigation with a fixed header.

**Example:**
```astro
<!-- Source: CONTEXT.md sketch D-09 (exact wording for Plan 04-03) + MDN IntersectionObserver [VERIFIED: /mdn/content] -->
<script>
  const sections = document.querySelectorAll('section[id]');
  const navLinks = Array.from(document.querySelectorAll('header a[href^="#"]'));
  const linkByHref = new Map(navLinks.map(a => [a.getAttribute('href'), a]));
  const obs = new IntersectionObserver((entries) => {
    for (const e of entries) {
      const link = linkByHref.get('#' + e.target.id);
      if (!link) continue;
      if (e.isIntersecting) {
        navLinks.forEach(a => a.classList.remove('is-active'));
        link.classList.add('is-active');
      }
    }
  }, { threshold: 0.5, rootMargin: '-80px 0px -50% 0px' });
  sections.forEach(s => obs.observe(s));
</script>
<style>
  header a.is-active { color: var(--text-primary); border-bottom: 2px solid var(--brand-primary); }
</style>
```

**Threshold/rootMargin tuning** — measured Header height: `py-[14px]` (28px total) + logo `w-8 h-8` (32px) + `border-b` (1px) = **~61px content box**. The `-80px` top inset in rootMargin is a safe buffer (nav link triggers after a section clears the header plus ~19px). Keep the proposed `{ threshold: 0.5, rootMargin: '-80px 0px -50% 0px' }`. Consider decreasing to `-60px` if visual testing shows the active state lags.

### Pattern 4: Flat hero gradient + noise overlay

**What:** Single-direction CSS gradient with a `fractalNoise` SVG `::after` overlay to eliminate banding on large gradients.

**When to use:** Any large-area gradient background (>500px). The noise overlay is already a canonical utility in `design-tokens.css:281-293`.

**Example:**
```css
/* Source: src/styles/design-tokens.css §Gradients (new token, add below --grad-subtle-dark:123) */
--grad-hero-flat: linear-gradient(160deg, var(--bg-base), var(--brand-primary-soft));
```
```astro
<section id="hero" class="hero-deep-signal noise-overlay relative overflow-hidden pt-24 pb-16 px-6">
  <!-- content -->
</section>
<style>
  .hero-deep-signal { background: var(--grad-hero-flat); }
</style>
```

### Pattern 5: CSS `@keyframes` cursor-blink (replacing pseudo-element)

**What:** CSS animation on a real inline `<span>` element containing the literal `_` character, instead of a `::after` pseudo-element that injects `|`.

**When to use:** Whenever the cursor needs to be semantically a character (matches reference literally, more accessible to screen readers via `aria-hidden`).

**Example:**
```astro
<!-- Source: CONTEXT.md D-14 + reference app.jsx:394-398 [VERIFIED against skill canonical] -->
<h1 class="...">
  {i.hero.name}<span class="cursor-blink text-brand-primary" aria-hidden="true">_</span>
</h1>
<style>
  .cursor-blink { animation: blink 1s step-end infinite; }
  @keyframes blink { 50% { opacity: 0; } }
</style>
```

### Anti-Patterns to Avoid

- **Hardcoded hex in Hero.astro** — project rule; always reference a token. Especially forbidden: `#06B6D4`, `#22D3EE` (deprecated cyan), `#7C3AED`/`#10B981` (DKT podcast brand, wrong section), `#FF9900` (AWS). [VERIFIED: CLAUDE.md §Anti-Patterns]
- **`set:html` in Astro template** — used with JSON i18n, it opens XSS vectors and loses translator ergonomics. Phase 3 explicitly rejected this pattern (03-01 plan). Keep the three-key split.
- **Extracting `Pill` to its own component** — Phase 3 kept About monolithic by explicit convention. The 4 Hero pills have different hrefs/aria — inline is clearer. [VERIFIED: 03-CONTEXT.md Established Patterns]
- **Animating h1 letter-by-letter** — violates Zero-JS baseline. The reference has only a blinking cursor, not typing. [VERIFIED: CONTEXT.md Deferred Ideas]
- **Radial-blob gradient for Hero** — current `--grad-hero-soft` has 3 radial blobs; reference is a flat 160deg gradient. Switching is core to this phase.
- **Observer per section** — create ONE observer watching all section[id] elements, NOT 7 observers [CITED: MDN IntersectionObserver API §Best practices].
- **`rootMargin` with px-only values when header uses rem scaling** — Header is currently px-based (`py-[14px]`), not rem-based, so `-80px` is fine. If Header switches to rem later, update rootMargin accordingly.
- **`target="_blank"` without `rel="noopener"`** — reverse-tabnabbing vulnerability. D-05 mandates `rel="noopener"` on Kubestronaut pill. [CITED: OWASP Reverse Tabnabbing]
- **Removing `.typing-cursor` without grepping** — D-14 explicit pre-condition. Grep result (verified during research): 1 producer (global.css:115-119 + 150-152 reduced-motion), 1 consumer (Hero.astro:27). After rewrite, both go; `.typing-cursor` can be cleanly removed.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Fluid responsive font-size | Custom JS that reads viewport width | CSS `clamp()` via Tailwind arbitrary | Native, no JS, interpolates smoothly, supported in all browsers since 2020 [CITED: MDN CSS clamp] |
| Nav active-state detection | `scroll` event listener with `getBoundingClientRect` checks per section | IntersectionObserver | Event listener fires hundreds of times per scroll; observer fires only on threshold crossing (~60× less work) [CITED: MDN IntersectionObserver] |
| Hash-link smooth scroll | Custom `scrollIntoView({behavior:'smooth'})` on link click | CSS `html { scroll-behavior: smooth }` | Zero JS; already set in global.css:58-60 |
| Anchor-offset for sticky header | `window.scrollBy(0, -80)` after scrollIntoView | CSS `scroll-margin-top: 80px` on section targets | Zero JS, works with CSS smooth-scroll [CITED: MDN scroll-margin-top] |
| Translator string parsing | Template literals or split strings in component | 3-key i18n with typed access | Phase 3 established this; translator-friendly, XSS-safe [VERIFIED: 03-01 plan rationale] |
| Cursor blink | Typed.js (3.8KB gzipped + init JS) | CSS `@keyframes` on inline `<span>` | Visual parity with Typed.js for ~0KB, no hydration [CITED: CONTEXT.md D-14 + Zero-JS baseline] |
| Gradient banding elimination | Dithering in image editor + bake to PNG | `.noise-overlay` class with fractalNoise SVG `::after` | Already canonical in design-tokens.css; 1KB data-URI, one pseudo-element [VERIFIED: design-tokens.css:281-293] |
| Project-wide string rename | Generic `sed -i` across all files | Targeted edits in the 5 files listed in D-04; DO NOT grep-replace in `.playwright-cli/*.yml`, `current-content.json`, `ref-content.json` (historical artifacts) | sed hits historical snapshot YAMLs which are point-in-time audit records; touching them rewrites history [VERIFIED: CONTEXT.md D-04 exclusion list + grep output showing 23KB of historical references] |

**Key insight:** Every pattern needed for Phase 4 is already in the web platform (CSS, native APIs) or the existing Astro/Tailwind stack. No dependencies to add.

## Runtime State Inventory

Phase 4 is a **code + config + copy change**, not a rename in the sense of renaming persistent state. However, the `Kubernaut → Kubestronaut` mutation DOES touch both code AND the user-facing meta description, so a light inventory is warranted:

| Category | Items Found | Action Required |
|----------|-------------|------------------|
| Stored data | **None.** No database, no key-value store, no backend. vedmich.dev is 100% static SSG. | None — verified by grepping for `DATABASE_URL`, `mongo`, `redis`, `sqlite` across repo (0 hits). |
| Live service config | **None.** No runtime services. GitHub Pages serves static files. GitHub Actions workflow does not embed "Kubernaut". | None — verified via `grep -r Kubernaut .github/ 2>&1` → 0 hits. |
| OS-registered state | **None.** No scheduled tasks, no OS-level registrations. | None. |
| Secrets/env vars | **None.** No `.env` files; no secrets reference "Kubernaut". `.mcp.json` contains MCP server config, not project secrets. | None. |
| Build artifacts | **`dist/` (gitignored).** Regenerated on every `npm run build`. Contains current "Kubernaut" copy embedded in pre-rendered HTML. | Rebuild on next push; GH Actions redeploys live site with "Kubestronaut" automatically (~60-90s deploy). |
| Historical audit artifacts | `.playwright-cli/page-2026-04-19T17-06-48-607Z.yml` and `.playwright-cli/page-2026-04-19T19-15-51-727Z.yml` contain "Kubernaut" as a literal text capture. `current-content.json` + `ref-content.json` at repo root capture the old copy in JSON. | **DO NOT MODIFY.** These are point-in-time snapshots of the audit state and are referenced in STATE.md/ROADMAP.md as evidence. Changing them rewrites history. Explicitly excluded by D-04. |
| Browser cached assets | `/favicon.svg` cached in user browsers; no "Kubernaut" in favicon. OG image meta in BaseLayout uses `description` prop (about-to-change). | User browsers pick up new meta description on next visit (no cache invalidation needed — HTML is re-served). OG image thumbnails on LinkedIn/X require manual re-scrape if already posted; none are in scope. |

**Canonical question:** After Phase 4 lands, what runtime systems still have "Kubernaut" cached?
- Search engines (Google, Bing) — will pick up new meta description on next crawl (days/weeks; acceptable).
- Social preview caches (LinkedIn, Twitter) — only if a pre-rename link was shared; none known to be in live social posts. Not in scope.

No data migration required. The rename is purely cosmetic/factological at the site surface level.

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| Node.js | `npm run build` | ✓ | (assumed from existing successful Phase 3 build) | — |
| npm | dep install / scripts | ✓ | — | — |
| Astro 5 | build + dev | ✓ | 5.17.1 | — |
| Tailwind 4 | styling | ✓ | 4.2.1 (pinned; 4.2.2 latest) | — |
| `playwright-cli` | visual verification (Nyquist validation) | ✓ | 0.1.8 at `/Users/viktor/.npm-global/bin/playwright-cli` | Manual screenshot + diff if Playwright Chrome extension token fails |
| Chrome (user's) with Playwright MCP Bridge extension | `playwright-cli attach --extension` for real-user visual verify | ✓ (assumed, per MEMORY.md `feedback_playwright.md`) | — | `playwright-cli open <url>` for fresh headed Chrome if extension token missing |
| Context7 MCP | doc lookup during planning | ✗ (MCP tools not available in this research agent session — CLI fallback used via `npx ctx7@latest`) | ctx7 CLI | CLI fallback via `npx --yes ctx7@latest library/docs` — verified working in this research session |
| Git / GitHub CLI | commit + deploy | ✓ | — | — |
| GitHub Actions runner | build + deploy on push to `main` | ✓ (external dependency; has worked for Phase 1-3) | — | Manual `gh-pages` branch push (not needed) |

**Missing dependencies with no fallback:** None.

**Missing dependencies with fallback:** Context7 MCP — CLI fallback (`npx ctx7@latest`) works and was used in this research session. No blocker for planner.

## Common Pitfalls

### Pitfall 1: Tailwind arbitrary value with spaces breaks at build

**What goes wrong:** `text-[clamp(40px, 8vw, 64px)]` (with spaces after commas) compiles as a broken utility or silently drops the class.

**Why it happens:** Tailwind splits utility strings on spaces at parse time. The class attribute `text-[clamp(40px, 8vw, 64px)]` becomes 3 separate "classes": `text-[clamp(40px,`, `8vw,`, `64px)]`.

**How to avoid:** Never include literal spaces inside arbitrary values. Either (a) no spaces: `text-[clamp(40px,8vw,64px)]` — preferred, (b) underscores: `text-[clamp(40px,_8vw,_64px)]` — underscores convert to spaces at build [CITED: tailwindcss.com/docs/adding-custom-styles §Handling whitespace].

**Warning signs:** Compiled CSS has no `.text-\[clamp...` rule. h1 falls back to browser default. Check `dist/_astro/*.css` after build.

### Pitfall 2: `rootMargin` insensitivity when Hero is tall but first section below is tall too

**What goes wrong:** With `rootMargin: '-80px 0px -50% 0px'` and `threshold: 0.5`, if About section is 1200px tall, the observer fires when 50% of About is visible (~600px scrolled past About's top), not when About first enters view. User clicks About pill → expects About to become "active" immediately, but nothing changes for half a screen.

**Why it happens:** `threshold: 0.5` requires 50% visibility. Combined with `-50%` bottom rootMargin, the effective "active" window shrinks to a narrow band near the top of the viewport.

**How to avoid:** Test visually with the 8 sections actually rendering. Adjust in one of two ways: (a) lower `threshold` to `0` and rely purely on `rootMargin` for the trigger zone (gives "whatever section's top is near the header" semantics), or (b) compute `threshold` as a ratio per section instead of a constant.

**Warning signs:** Clicking nav link scrolls but underline doesn't move; underline moves but not smoothly; underline stuck on previous section during scroll. Check in Playwright by scrolling and asserting `.is-active` classes change at expected pixel positions.

### Pitfall 3: `scroll-margin-top` must be on the SCROLL TARGET, not the header

**What goes wrong:** Applying `scroll-margin-top: 80px` to `<header>` does nothing for anchor jumps.

**Why it happens:** `scroll-margin-*` is a property of the element being scrolled INTO view, not the element that obstructs.

**How to avoid:** Apply `scroll-margin-top: 80px` to each `<section id="...">` that can be a scroll target. Either per-section inline or a global rule:
```css
section[id] { scroll-margin-top: 80px; }
```
Latter is preferable — one rule handles all present and future anchors [CITED: MDN scroll-margin-top].

**Warning signs:** Clicking nav link scrolls, but section title is hidden under the sticky header.

### Pitfall 4: `grad-hero-soft` vs `grad-hero-flat` — old class lingering

**What goes wrong:** Hero.astro's `<style>` block still references `var(--grad-hero-soft)` after token swap, so even with `--grad-hero-flat` defined, the visual gradient stays radial-blob.

**Why it happens:** `.hero-deep-signal { background: var(--grad-hero-soft); }` is co-located with the Hero markup; easy to miss in diff review.

**How to avoid:** Plan 04-02 acceptance check must grep `Hero.astro` for `var(--grad-hero-` occurrences → should return exactly ONE line referencing `--grad-hero-flat`.

**Warning signs:** Visual verify shows 3 radial blobs still visible on Hero after deploy.

### Pitfall 5: i18n key removal breaks old consumers mid-wave

**What goes wrong:** Plan 04-01 removes `hero.tagline` from JSON before Plan 04-02 rewrites Hero.astro. `npm run build` fails mid-wave because Hero.astro frontmatter still references `i.hero.tagline`.

**Why it happens:** Typed access via `t(locale).hero.tagline` fails TypeScript check when the key disappears.

**How to avoid:** Plans must be in the SAME WAVE or 04-01 must PRECEDE 04-02 with a checkpoint. Recommended: 04-01 (i18n mutation, both `hero.*` + `about.bio_before`) lands first as Wave 1; 04-02 (Hero.astro rewrite) + 04-03 (Header + cross-file rename) land in Wave 2. This mirrors Phase 3's structure (03-01 first, 03-03 second).

**Warning signs:** Build error: `Property 'tagline' does not exist on type`. Catch early by running `npm run build` after Plan 04-01, expecting the build to fail (noted as acceptable mid-wave state in Phase 3 03-01 acceptance_criteria).

### Pitfall 6: `social.ts certifications[0]` name changed, but About or other consumer still reads old

**What goes wrong:** After D-04's `certifications[0].name = 'CNCF Kubestronaut'`, some component reading the array may display stale UI.

**Why it happens:** Cross-file rename misses a consumer.

**How to avoid:** Grep all consumers of `certifications` import:
- `src/components/About.astro` — Phase 3 removed the `certifications` import (verified: 03-03 plan acceptance criteria). No consumer.
- `src/components/Hero.astro` — Phase 4 removes `certifications` import entirely (D-02). No consumer.
- **Confirmed: no component consumes `certifications` after Phase 4.** The array stays as export for future reintroduction but becomes unreferenced data.

**Warning signs:** grep `certifications` in `src/components/*.astro` after Phase 4 → should return 0 matches. If matches remain, flag for follow-up.

### Pitfall 7: Astro 5 script hoisting changed — don't assume v4 behavior

**What goes wrong:** Developer expects `<script>` in `Header.astro` to be hoisted to `<head>` per Astro 4 default. In Astro 5, scripts render in-place (in the header body). Relative order matters.

**Why it happens:** Astro 5 changed default script rendering behavior [CITED: docs.astro.build/en/guides/upgrade-to/v5 §`<script>` tags are rendered directly as declared].

**How to avoid:** Place the nav-active observer script at the BOTTOM of `Header.astro` (after the mobile menu script block). DOM is guaranteed to be parsed at that point because the script runs after the `<header>` markup is rendered. Alternatively, use `document.addEventListener('DOMContentLoaded', ...)` wrapper for safety — though in practice, Astro scripts already run after their owning component's HTML is parsed.

**Warning signs:** `document.querySelectorAll('section[id]')` returns empty NodeList, observer observes nothing. Observer silently fails with no errors.

### Pitfall 8: Missing `rel="noopener"` on external pill

**What goes wrong:** `<a href="https://www.cncf.io/..." target="_blank">` without `rel="noopener"` allows the CNCF page to access `window.opener` and redirect the original tab (reverse tabnabbing).

**Why it happens:** Easy to forget on one-off external links.

**How to avoid:** D-05 explicitly mandates `rel="noopener"`. Modern browsers default to this for `target="_blank"` since 2020 [CITED: Chromium 88+ implicit noopener], but explicit is safer. Plan acceptance grep must check for the literal `rel="noopener"`.

**Warning signs:** OWASP/accessibility linter warns about tabnabbing risk.

## Code Examples

Verified patterns from official sources, reference UI kit, and existing codebase:

### Example 1: New `--grad-hero-flat` token in design-tokens.css

```css
/* Source: CONTEXT.md D-12 + existing design-tokens.css §Complex/layered gradients (lines 125-159) */
/* Add right after --grad-subtle-dark at line 122 or within the Complex gradients block. */

/* Flat hero gradient — reference-matched, no radial blobs. Pair with .noise-overlay. */
--grad-hero-flat: linear-gradient(160deg, var(--bg-base), var(--brand-primary-soft));
```

Rationale for placement: `--grad-subtle-dark: linear-gradient(160deg, #0F172A, #134E4A);` already exists at line 122 and is visually almost identical (it hardcodes the same colors the new token references via tokens). The new token could either replace `--grad-subtle-dark` OR be added alongside with a Hero-specific name. Decision: **add alongside** to avoid breaking any consumer of `--grad-subtle-dark` (grep first). `--grad-hero-flat` is semantically Hero-owned; `--grad-subtle-dark` is generic-subtle.

### Example 2: Full Hero.astro rewrite (consolidates CONTEXT.md specifics)

```astro
---
// Source: CONTEXT.md §Specific Ideas (Hero markup sketch) + D-11 through D-18 applied
// This is the illustrative target for Plan 04-02; executor may refine class-ordering.
import { t, type Locale } from '../i18n/utils';

interface Props {
  locale: Locale;
}

const { locale } = Astro.props;
const i = t(locale);
---

<section id="hero" class="hero-deep-signal noise-overlay relative overflow-hidden pt-24 pb-16 px-6">
  <div class="max-w-[1120px] mx-auto w-full">
    <!-- Greeting — two blocks (D-17) -->
    <div class="font-mono text-brand-primary text-sm mb-4">~/vedmich.dev $ whoami</div>
    <div class="font-mono text-text-secondary text-base mb-1">{i.hero.greeting}</div>

    <!-- H1 with inline _ cursor (D-14, D-11) -->
    <h1 class="font-display font-bold tracking-[-0.03em] leading-[1.05] text-text-primary m-0 text-[clamp(40px,8vw,64px)]">
      {i.hero.name}<span class="cursor-blink text-brand-primary" aria-hidden="true">_</span>
    </h1>

    <!-- Role (D-18: mt-3 = 12px from h1) -->
    <div class="font-mono text-warm text-lg mt-3">{i.hero.role}</div>

    <!-- Tagline (D-15, D-16: 3-key split with text-primary accent) -->
    <p class="font-body text-lg text-text-secondary max-w-[640px] mt-4">
      {i.hero.tagline_before}<span class="text-text-primary">{i.hero.tagline_accent}</span>{i.hero.tagline_after}
    </p>

    <!-- Authority pills (D-02, D-03, D-05, D-06, D-07, D-08) -->
    <div class="flex flex-wrap gap-2.5 mt-7">
      <a href="#speaking"
         class="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-[13px] font-medium bg-surface border border-border text-text-primary font-body hover:border-brand-primary hover:text-brand-primary-hover transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand-primary">
        re:Invent &amp; Keynote Speaker
      </a>
      <a href="https://www.cncf.io/training/kubestronaut/"
         target="_blank" rel="noopener"
         aria-label="CNCF Kubestronaut program (opens in new tab)"
         class="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-[13px] font-medium bg-brand-primary-soft border border-brand-primary text-brand-primary-hover font-body hover:bg-brand-primary-hover/20 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand-primary">
        <span class="w-1.5 h-1.5 rounded-full bg-brand-primary-hover"></span>
        CNCF Kubestronaut
      </a>
      <a href="#book"
         class="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-[13px] font-medium bg-surface border border-border text-text-primary font-body hover:border-brand-primary hover:text-brand-primary-hover transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand-primary">
        Author «Cracking the Kubernetes Interview»
      </a>
      <a href="#podcasts"
         class="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-[13px] font-medium bg-surface border border-border text-text-primary font-body hover:border-brand-primary hover:text-brand-primary-hover transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand-primary">
        Host · DKT + AWS RU
      </a>
    </div>

    <!-- CTAs (D-18: mt-8 = 32px from pills, gap-3 internal) -->
    <div class="flex flex-wrap items-center gap-3 mt-8">
      <a href="#contact"
         class="inline-flex items-center gap-2 px-5 py-2.5 bg-brand-primary hover:bg-brand-primary-hover text-bg-base font-medium rounded-lg transition-colors">
        {i.hero.cta}
      </a>
      <a href="#about"
         class="inline-flex items-center gap-2 px-5 py-2.5 border border-border hover:border-brand-primary hover:text-brand-primary-hover text-text-primary font-medium rounded-lg transition-colors">
        {i.hero.cta_secondary}<span aria-hidden="true">→</span>
      </a>
    </div>
  </div>
</section>

<style>
  .hero-deep-signal { background: var(--grad-hero-flat); }
  .cursor-blink { animation: blink 1s step-end infinite; }
  @keyframes blink { 50% { opacity: 0; } }
</style>
```

**Verified via:**
- CONTEXT.md §Specific Ideas (2026-04-19) — verbatim sketch is authoritative.
- app.jsx:357-391 — reference Hero component (VERIFIED: read during research).
- app.jsx:394-398 — Cursor component (`_` char, teal, blink via setInterval; ported to CSS `@keyframes`).
- Phase 3 About.astro pattern — three-key i18n + inline `<span>` accent (VERIFIED: 03-03 plan, landed).

### Example 3: nav-active IntersectionObserver append to Header.astro

```astro
<!-- Append BELOW the existing </script> tag in Header.astro (line 173), 
     keeping the existing mobile-menu + search-trigger logic intact. -->

<script>
  // Nav active-state highlight via IntersectionObserver (Phase 4 D-09)
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
  /* Uses CSS vars so the underline color follows brand tokens (dark + light mode). */
  header a.is-active {
    color: var(--text-primary);
    border-bottom: 2px solid var(--brand-primary);
  }
</style>
```

**Verified via:**
- CONTEXT.md §Specific Ideas §Nav active-highlight script sketch.
- MDN IntersectionObserver API [VERIFIED: /mdn/content ctx7 docs].
- Astro v5 script directives [VERIFIED: /websites/astro_build_en ctx7 docs — scripts without attributes are processed and rendered in place in v5].

### Example 4: scroll-margin-top global rule (Claude's Discretion, recommended)

```css
/* Append to src/styles/global.css after body rules */

/* Sticky header offset for anchor navigation (Phase 4 Claude's Discretion) */
section[id] {
  scroll-margin-top: 80px; /* ≈ header height + small breathing room */
}
```

Alternative: inline per section. Global rule is cleaner; 80px chosen to match D-09's rootMargin top inset.

### Example 5: i18n mutation for both locales

```json
// src/i18n/en.json — "hero" block after Plan 04-01
{
  "hero": {
    "greeting": "Hi, I'm",
    "name": "Viktor Vedmich",
    "role": "Senior Solutions Architect @ AWS",
    "tagline_before": "Distributed Systems · Kubernetes · ",
    "tagline_accent": "AI Engineer",
    "tagline_after": "",
    "cta": "Get in touch",
    "cta_secondary": "Read more"
  }
}
```

```json
// src/i18n/ru.json — "hero" block after Plan 04-01
{
  "hero": {
    "greeting": "Привет, я",
    "name": "Виктор Ведмич",
    "role": "Senior Solutions Architect @ AWS",
    "tagline_before": "Распределённые системы · Kubernetes · ",
    "tagline_accent": "AI Engineer",
    "tagline_after": "",
    "cta": "Связаться",
    "cta_secondary": "Подробнее"
  }
}
```

**Notes:**
- `tagline_before` EN: trailing space is LOAD-BEARING (the `<span>` accent follows immediately; without the space, `"Kubernetes ·AI Engineer"` joins).
- `tagline_before` RU: same trailing-space rule.
- `tagline_after` is `""` in both locales — reserved for future additions (period, etc.).
- `name` / `role` / `cta` / `cta_secondary` unchanged from current en.json and ru.json.
- RU's `name` currently stored as Unicode-escaped (`\u0412\u0438...`) — fine to keep as escaped or switch to literal Cyrillic (Phase 3 03-01 plan noted Astro reads both).

### Example 6: Kubernaut → Kubestronaut mutations (D-04)

```ts
// src/data/social.ts — line 30 before
{ name: 'CNCF Kubernaut', badge: 'kubernaut' },
// After
{ name: 'CNCF Kubestronaut', badge: 'kubestronaut' },
```

```astro
<!-- src/layouts/BaseLayout.astro — line 15 before -->
const { title, description = 'Viktor Vedmich — Senior Solutions Architect @ AWS, CNCF Kubernaut, Author, Speaker', locale, path = '' } = Astro.props;
<!-- After -->
const { title, description = 'Viktor Vedmich — Senior Solutions Architect @ AWS, CNCF Kubestronaut, Author, Speaker', locale, path = '' } = Astro.props;
```

```markdown
<!-- CLAUDE.md §Homepage Sections #2 before -->
2. **About** — bio, skill pills, certifications (CNCF Kubernaut + all 5 K8s certs)
<!-- After -->
2. **About** — bio, skill pills, certifications (CNCF Kubestronaut + all 5 K8s certs)
```

```json
// src/i18n/en.json — about.bio_before before (from Phase 3)
"bio_before": "... CNCF Kubernaut and author of "
// After
"bio_before": "... CNCF Kubestronaut and author of "
```

```json
// src/i18n/ru.json — about.bio_before before
"bio_before": "... CNCF Kubernaut и автор книги "
// After
"bio_before": "... CNCF Kubestronaut и автор книги "
```

### Example 7: Typing-cursor removal from global.css (D-14 post-rewrite cleanup)

```css
/* src/styles/global.css lines 109-119 — REMOVE these blocks after Hero rewrite. */

/* Typing cursor animation — follows brand primary via shim alias */
@keyframes blink {
  0%, 100% { opacity: 1; }
  50% { opacity: 0; }
}

.typing-cursor::after {
  content: "|";
  animation: blink 1s step-end infinite;
  color: var(--brand-primary-hover);
}

/* AND remove from reduced-motion override (lines 150-152): */
.typing-cursor::after {
  animation: none;
}
```

**Important:** The `@keyframes blink` rule is LOAD-BEARING for the new `.cursor-blink` class in Hero.astro's `<style>` block. Two choices:

1. **Hero-local `@keyframes blink` in Hero.astro `<style>`** — then DELETE the global.css `@keyframes blink` block safely. Preferred per Claude's Discretion (scoping).
2. **Keep `@keyframes blink` in global.css**, rename Hero's class to reference it. Global rule survives; Hero's `<style>` only contains `.cursor-blink { animation: blink 1s step-end infinite; }`.

Choice 1 is cleaner for Phase 4 scope (local-only animation). Choice 2 is fine if the planner wants one keyframe source. **Planner decides.**

Grep confirmed during research:
```
src/components/Hero.astro:27 — only .typing-cursor consumer (removed by Phase 4)
src/styles/global.css:115, 150 — only producers
CLAUDE.md:74, 341 — doc mentions (don't touch, not code)
.planning/* — plan docs (don't touch)
```

No third-party consumer. Safe to delete entirely.

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Astro 4 auto-hoist scripts to `<head>` | Astro 5: scripts render in-place | Astro 5.0 (2024) | Observer script in Header.astro now runs after header markup parses — no `DOMContentLoaded` wrapper needed, but order within file matters [CITED: docs.astro.build/en/guides/upgrade-to/v5 §Scripts] |
| Tailwind 3 `@config + tailwind.config.js` | Tailwind 4 `@theme` in CSS | Tailwind 4.0 (Jan 2025) | Design tokens live in `global.css` `@theme` block; project already migrated [VERIFIED: global.css:7] |
| Tailwind 3 `theme.extend.fontSize` for clamp | Tailwind 4 arbitrary `text-[clamp(...)]` or `text-(length:--var)` | Tailwind 4.0 | Less config, more inline. Arbitrary is canonical for one-off [CITED: tailwindcss.com/docs/font-size] |
| `Typed.js` for typing/cursor animations | Native CSS `@keyframes` on inline `<span>` | Ongoing (CSS-only trend) | Zero JS weight; matches Zero-JS baseline |
| `scroll` event listener for nav active | `IntersectionObserver` API | IntersectionObserver baseline since Chrome 51 (2016), Safari 12.1 (2019) | ~60× fewer callback fires; browser-optimized |
| `scrollTo(0, y)` after hash click for header offset | CSS `scroll-margin-top` | Baseline since 2020 | Zero JS; works with `scroll-behavior: smooth` [CITED: MDN scroll-margin-top] |
| `target="_blank"` implicit opener access | `rel="noopener"` mandatory | Chromium 88+ (Jan 2021) implicitly defaults noopener; explicit still recommended | Defense-in-depth for reverse tabnabbing [CITED: Chromium blog Jan 2021] |

**Deprecated / outdated in this codebase (to remove in Phase 4):**
- `.typing-cursor::after { content: "|" }` — replaced by inline `<span>_</span>` per D-14. [VERIFIED: 1 consumer only; no breakage]
- `--grad-hero-soft` radial-blob Hero background — replaced by `--grad-hero-flat` per D-12. [VERIFIED: only consumer is Hero.astro's `.hero-deep-signal` rule]
- `hero.tagline` single-key i18n — replaced by 3-key split per D-15. [VERIFIED: only consumer is Hero.astro, grep confirmed]
- `min-h-[90vh] flex items-center pt-16` on Hero `<section>` — replaced by `pt-24 pb-16 px-6` per D-18.

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | CNCF Kubestronaut program URL is https://www.cncf.io/training/kubestronaut/ — page currently reachable | D-05 Kubestronaut pill href | Dead link on pill click. Mitigation: planner or executor verifies URL live before merging (CNCF rarely renames program paths, but this is the one claim we couldn't verify via tool during research — WebFetch hit maxContentLength, kubestronaut.io ECONNREFUSED in sandbox). Alternative: https://kubestronaut.io/ (community shorthand) — planner should pick the official .cncf.io path. [ASSUMED — verify in Plan 04-02 acceptance] |
| A2 | Header height on desktop is ~61px (computed from `py-[14px]` + 32px logo + 1px border), so `rootMargin: '-80px ...'` gives ~19px buffer | D-09 + Pitfall 2 | Observer fires too early/late if header height differs. Mitigation: during visual verify, measure actual header height via Playwright `document.getElementById('site-header').getBoundingClientRect().height` and adjust rootMargin if >70px. [ASSUMED — measured via class analysis, not runtime browser; low risk because Phase 3 tokens locked header padding] |
| A3 | No other component in `src/components/` consumes `certifications` array from social.ts after Phase 4 (Phase 3 removed About's consumer, Phase 4 removes Hero's consumer) | D-02 + Pitfall 6 | Stale UI showing old cert name in some unknown component. Mitigation: grep all `.astro` files for `certifications` import pre-commit in Plan 04-03. Verified during research (0 consumers after Phase 3); Phase 4 doesn't add new consumers. [VERIFIED via grep; tagging as ASSUMED because research didn't run the full build to confirm] |
| A4 | Current `@keyframes blink` rule name in global.css doesn't conflict with any other `@keyframes blink` in project | D-14 | CSS animation behavior surprises. Mitigation: grep `@keyframes blink` project-wide — if only 1 occurrence (global.css:110), safe to own the name. [VERIFIED: 1 producer; global.css:110 is THE blink keyframe] |
| A5 | GitHub Actions workflow for deploy isn't affected by any Kubernaut → Kubestronaut-sensitive string | D-04 | CI failure post-push. Mitigation: grep `.github/workflows/*.yml` for "Kubernaut" — 0 hits confirmed during research. |
| A6 | Tailwind 4.2.1 compiles `text-[clamp(40px,8vw,64px)]` correctly (arbitrary `text-[...]` with `clamp()` is canonical in v4 docs) | Pitfall 1 | h1 has no font-size applied, falls back to browser default. Mitigation: after build, inspect `dist/_astro/*.css` for `.text-\[clamp` rule presence. [VERIFIED via Tailwind docs CTX7 lookup — arbitrary values with nested functions like `clamp()` are supported] |
| A7 | Playwright-cli (v0.1.8) supports `getComputedStyle` evaluation on attached Chrome for validation | Validation Architecture | Cannot measure h1 typography post-deploy. Mitigation: fall back to visual diff against `ref-hero.png`. Acceptable degradation. [ASSUMED — playwright-cli is a thin wrapper over Playwright; `page.evaluate` support is standard] |

**Recommended user confirmation before planning:** A1 (Kubestronaut URL) — if the user has a preferred URL (cncf.io vs kubestronaut.io), confirm before Plan 04-02 locks it.

## Open Questions (RESOLVED)

1. **Keyframe `blink` ownership — Hero-local or global?** — RESOLVED: inline in Hero.astro `<style>` (locked by Plan 04-02 Task 2).
   - What we know: Currently in global.css:110-113 (used by `.typing-cursor::after`). After Phase 4, only `.cursor-blink` needs it. Phase 4 deletes `.typing-cursor`.
   - What's unclear: Keep `@keyframes blink` in global.css (reusable) or move inline to Hero.astro `<style>` (scoped).
   - Recommendation: **Inline in Hero.astro `<style>`** per D-14 Claude's Discretion + project convention (local until second consumer). Planner locks in 04-02.

2. **Pill order on wrap at intermediate viewports (900-1100px)** — RESOLVED: executor discretion — keep proposed order, re-test on live.
   - What we know: Proposed order re:Invent → Kubestronaut → Author → Host has two long labels (Author, Host). On 1440×900 they fit in one row. On 1100px they may wrap with Kubestronaut alone on line 2.
   - What's unclear: Visual priority — should Kubestronaut be first (teal anchor left-aligned) or second (anchor middle)?
   - Recommendation: **Test both visually on 1100px, 900px, 768px viewports**. If wrap is ugly, move Kubestronaut to position 1 (fits on wrap). Non-blocking for planning — executor has flexibility per Claude's Discretion.

3. **`scroll-margin-top` scope — section[id] global OR per-section inline** — RESOLVED: global rule `section[id] { scroll-margin-top: 80px; }` (locked by Plan 04-03 Task 2).
   - What we know: CONTEXT.md Claude's Discretion recommends yes. MDN supports either form.
   - What's unclear: Whether to make it a global rule (touches every present and future section) or apply inline only to the 4 scroll targets Phase 4 adds (`#speaking`, `#book`, `#podcasts`, plus Kubestronaut external — already `target=_blank`, no offset needed).
   - Recommendation: **Global rule** `section[id] { scroll-margin-top: 80px; }` in global.css. One line, handles every future section automatically. Keeps Phase 4 scope small.

4. **Should Plan 04-01 ALSO fix Kubernaut→Kubestronaut in `about.bio_before`, or is that Plan 04-03's scope?** — RESOLVED: bundled in Plan 04-01 (Tasks 1 + 2).
   - What we know: Both mutations touch the same 2 JSON files (en.json, ru.json).
   - What's unclear: One plan (Plan 04-01 bundles all JSON mutations) or two (Plan 04-01 tagline split + Plan 04-03 Kubestronaut rename).
   - Recommendation: **Bundle in Plan 04-01.** Both are JSON mutations, both land before Hero.astro rewrite. Atomic commit at phase end anyway. Simpler cognitive load.

5. **Animation for pill entrance** — RESOLVED: no `.animate-on-scroll` on Hero (locked by Plan 04-02 Task 2).
   - What we know: Phase 3 uses `.animate-on-scroll` on About columns. Hero currently does NOT have `.animate-on-scroll` (content is above fold on load).
   - What's unclear: Add `.animate-on-scroll` to pill row for visual consistency?
   - Recommendation: **No.** Hero is the first paint; animating it delays visual feedback. Keep Hero purely static (no scroll animations). Matches reference.

## Environment Availability

See `## Environment Availability` section above (moved inline due to logical flow).

## Validation Architecture

### Test Framework

| Property | Value |
|----------|-------|
| Framework | **No test runner installed** — vedmich.dev uses visual/manual validation via playwright-cli (`/Users/viktor/.npm-global/bin/playwright-cli` v0.1.8) against locally-running `npm run dev` (localhost:4321) AND live site (https://vedmich.dev post-deploy). |
| Config file | None — playwright-cli is a global tool, not a project dep. |
| Quick run command | `npm run build` (SSG; 7 pages; targets <1s) |
| Full suite command | `npm run build && playwright-cli attach --extension <token>` + scripted check OR playwright-cli REPL commands per REQ acceptance criteria. |
| Phase gate | `npm run build` green + visual verify via playwright-cli on local (1440×900, 375×667, EN + RU) + post-push live verify on vedmich.dev. |

### Phase Requirements → Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| REQ-011 | 4 authority pills replace 6 cert pills | DOM grep (build artifact) | `awk '/<section id="hero"/{p=1} /<\/section>/{p=0; exit} p' dist/en/index.html \| grep -c 'inline-flex items-center gap-1.5'` → expect `4` | ✓ (dist/en/index.html generated by `npm run build`) |
| REQ-011 | Kubestronaut pill is external with noopener + aria-label | DOM grep | `grep -c 'href="https://www.cncf.io/training/kubestronaut/"' dist/en/index.html` → expect `1`; `grep -c 'rel="noopener"' dist/en/index.html` → expect `1`; `grep -c 'aria-label="CNCF Kubestronaut program (opens in new tab)"' dist/en/index.html` → expect `1` | ✓ |
| REQ-011 | No `CKA\|CKS\|CKAD\|KCNA\|KCSA` as Hero pills | DOM grep | `awk '/<section id="hero"/{p=1} /<\/section>/{p=0; exit} p' dist/en/index.html \| grep -cE 'CKA\|CKS\|CKAD\|KCNA\|KCSA'` → expect `0` | ✓ |
| REQ-013 | h1 computed style at 1440×900 (font-size 64, weight 700, tracking -0.03em, line-height 1.05, Space Grotesk) | Playwright getComputedStyle | `playwright-cli attach ... --eval "const h=document.querySelector('#hero h1'); const s=getComputedStyle(h); return {fz:s.fontSize, fw:s.fontWeight, ls:s.letterSpacing, lh:s.lineHeight, ff:s.fontFamily}"` → expect `{fz:"64px", fw:"700", ls:"-1.92px", lh:"67.2px", ff: /Space Grotesk/}` | Manual (scripted via playwright-cli REPL) |
| REQ-013 | h1 computed style at 375×667: font-size 40 (clamp floor) | Playwright getComputedStyle | Same command, set viewport 375×667 first via `playwright-cli set-viewport 375 667` | Manual |
| REQ-014 | Hero section height ≤ 540px on 1440×900 | Playwright getBoundingClientRect | `playwright-cli ... --eval "return document.getElementById('hero').getBoundingClientRect().height"` → expect `<= 540` | Manual |
| REQ-014 | No `min-h-[90vh]` or `flex items-center` classes on Hero section | Source grep (pre-build) | `grep -E 'min-h-\[90vh\]\|flex items-center' src/components/Hero.astro` → expect no match | ✓ |
| (D-12) | `--grad-hero-flat` token present in design-tokens.css; Hero `.hero-deep-signal` references it | Source grep | `grep -c 'grad-hero-flat' src/styles/design-tokens.css src/components/Hero.astro` → expect `2` (one producer, one consumer) | ✓ |
| (D-14) | `.typing-cursor` removed from global.css, `.cursor-blink` present in Hero.astro `<style>` | Source grep | `grep -c '\.typing-cursor' src/styles/global.css src/components/Hero.astro` → expect `0`; `grep -c 'cursor-blink' src/components/Hero.astro` → expect `≥ 1` | ✓ |
| (D-04) | No `Kubernaut` (without -estr-) in touched files | Source grep | `grep -l 'Kubernaut' src/ CLAUDE.md 2>&1 \| grep -v '\.planning' \| grep -v '\.playwright-cli' \| grep -v 'ref-content.json' \| grep -v 'current-content.json'` → expect no match | ✓ |
| (D-09) | Nav link `.is-active` toggles on scroll past section 50% | Playwright scripted | `playwright-cli ... --eval "document.querySelector('#about').scrollIntoView({block:'center'}); await new Promise(r=>setTimeout(r,300)); return document.querySelector('header a[href=\"#about\"]').classList.contains('is-active')"` → expect `true` | Manual |
| (D-15, D-16) | Tagline renders with `<span class="text-text-primary">AI Engineer</span>` in dist HTML both locales | DOM grep | `grep -E 'text-text-primary[^"]*">AI Engineer</span>' dist/en/index.html dist/ru/index.html` → expect 2 matches (one per locale) | ✓ |
| (D-18) | Hero padding is exactly `pt-24 pb-16 px-6` | Source grep | `grep 'pt-24 pb-16 px-6' src/components/Hero.astro` → expect match | ✓ |
| (D-17) | Greeting Line 1 hardcoded, Line 2 via i18n | Source grep | `grep '~/vedmich.dev \$ whoami' src/components/Hero.astro` → expect match; `grep 'i.hero.greeting' src/components/Hero.astro` → expect match | ✓ |

### Sampling Rate

- **Per task commit:** `npm run build` (local, ~90s expected; project target <1s for SSG) + source greps listed above.
- **Per wave merge:** `npm run build` + `dist/*` grep checks (DOM post-render).
- **Phase gate (before `/gsd-verify-work`):**
  1. Local `npm run dev` → Playwright-cli attach → 1440×900 screenshot of http://localhost:4321/en/ + http://localhost:4321/ru/ → compare to `reference-1440-full.png` §Hero crop.
  2. Playwright-cli evaluate computed styles for h1 + section height per REQ-013 + REQ-014.
  3. Scroll test: click each nav link → assert `.is-active` moves.
  4. Approval gate: user types "approved" on Task 3 checkpoint per Phase 3 pattern.
- **Post-push live verify** (outside phase scope, recorded in SUMMARY):
  - Wait ~2 min (`gh run list --branch main --limit 3`).
  - Playwright-cli attach → https://vedmich.dev/en/ at 1440×900 and 375×667.
  - Same measurements as local.

### Wave 0 Gaps

No gaps — all validation uses existing tooling:
- [x] `npm run build` — existing script.
- [x] `playwright-cli` — installed globally.
- [x] Source greps — `grep` available in shell.

If Playwright Chrome extension token is missing (per MEMORY.md feedback_playwright.md), fallback is `playwright-cli open <url>` with a fresh headed Chrome; all `--eval` commands still work.

*(No new test files needed. No framework install.)*

## Security Domain

Project config check: `security_enforcement` — not explicitly set in `.planning/config.json`. Treating as enabled per gsd defaults.

### Applicable ASVS Categories

| ASVS Category | Applies | Standard Control |
|---------------|---------|-----------------|
| V2 Authentication | No | Phase 4 has no auth surface. Site is read-only. |
| V3 Session Management | No | No sessions. |
| V4 Access Control | No | No access control (everything is public). |
| V5 Input Validation | Partial | i18n strings are hardcoded in JSON (build-time); no user input. `localStorage('vedmich-lang')` IS user-controlled but only used as locale selector (bounded enum en/ru). No Phase 4 change here. |
| V6 Cryptography | No | No secrets, no auth, no crypto. GitHub Pages TLS is infra. |
| V7 Error Handling | No | Phase 4 doesn't add error paths. |
| V8 Data Protection | No | All data is public bio + links. |
| V10 Malicious Code | Yes | External link (`target=_blank` to cncf.io) — reverse tabnabbing. D-05 mandates `rel="noopener"`. |
| V11 Business Logic | No | No business logic. |
| V12 Files & Resources | No | No file handling. |
| V13 API | No | No APIs. |
| V14 Configuration | Partial | Zero-JS baseline is a config/hygiene posture. Adding one observer doesn't change posture materially; keeps inline `<script>` no-src pattern. Content-Security-Policy: not currently set (Phase not scoped to add; existing risk carried). |

### Known Threat Patterns for This Stack

| Pattern | STRIDE | Standard Mitigation |
|---------|--------|---------------------|
| Reverse tabnabbing via `target="_blank"` on Kubestronaut pill | Tampering (attacker-controlled window.opener manipulates origin tab via cross-origin window.location.href) | `rel="noopener"` (D-05). Modern Chromium implicit since v88, but EXPLICIT is mandatory for Safari legacy support + defense in depth [CITED: OWASP Top 10 2021 §A05 + web.dev/external-anchors-use-rel-noopener] |
| XSS via i18n JSON → `set:html` | Injection | Phase 3 established "no set:html, 3-key split with `<span>` wrapping" — Phase 4 continues [VERIFIED: 03-01 plan acceptance criteria] |
| XSS via user-controlled `localStorage('vedmich-lang')` → locale routing | Injection | Existing Header.astro saves locale to localStorage and reads on next visit. Value is used for path prefix only (`/en/` or `/ru/`). If attacker sets malicious value, Astro router returns 404 (no route). Not a new risk in Phase 4. [VERIFIED: Header.astro:156-160] |
| Clickjacking on CTA button | Repudiation | Not applicable (no auth/state-changing actions). Site is pure content. |
| Content-Security-Policy bypass via inline `<script>` | Info disclosure | Site has no CSP. Inline scripts in Header/BaseLayout work because no CSP enforcement. Phase 4 continues the pattern. Recommend: add CSP in a future phase with `script-src 'self' 'unsafe-inline'` or `nonce`-based, but NOT Phase 4 scope. |

**No new attack surface introduced by Phase 4 beyond the external link.** Single mitigation required: `rel="noopener"` on Kubestronaut pill (D-05 mandated).

## Project Constraints (from CLAUDE.md)

Extracted actionable directives from `./CLAUDE.md` that Phase 4 plans MUST honor:

1. **Deep Signal token hygiene** — never use hardcoded hex in components. Only canonical tokens (`--brand-primary`, `--bg-base`, etc.) or Tailwind utilities that resolve to tokens (`text-brand-primary`, `bg-surface`). [CLAUDE.md §Deep Signal Design System]
2. **Anti-pattern colors FORBIDDEN:** `#06B6D4`, `#22D3EE` (deprecated cyan), `#7C3AED`, `#10B981` (DKT), `#FF9900`, `#232F3E` (AWS). Pure `#000` / `#FFF` body text also forbidden. [CLAUDE.md §Anti-Patterns]
3. **Bilingual parity** — every text change lands in BOTH `src/i18n/en.json` and `src/i18n/ru.json`. [CLAUDE.md §Content Workflow]
4. **Typography families** — display/headlines: Space Grotesk (500/600/700); body/UI: Inter; code/mono: JetBrains Mono. Self-hosted from `public/fonts/`; NO Google Fonts CDN. [CLAUDE.md §Typography]
5. **Zero-JS default** — minimize client-side JS. Phase 4 extends by ONE observer (nav highlight) per D-10. [CLAUDE.md §Architecture Key Design Decisions]
6. **Zero build regressions** — `npm run build` must pass with 7 pages generated, ~800ms target. [CLAUDE.md §Deployment + Publishing Workflow]
7. **Big changes require visual verification** — Playwright-cli screenshot on 1440px + 375px, EN + RU, after deploy. Phase 4 crosses this threshold. [CLAUDE.md §Publishing Workflow - Big changes]
8. **Atomic commit per phase** — Phase 4 ships as one commit that touches ~7 files. [CLAUDE.md §Publishing Workflow]
9. **GSD workflows** — ask user interactive questions in Russian; record artifacts (CONTEXT.md, PLAN.md, RESEARCH.md, commit messages, DISCUSSION-LOG.md) in English. Technical terms stay English inside Russian questions. [CLAUDE.md §User Context + §GSD workflows]
10. **i18n architecture** — JSON translations + typed `t(locale)` helper; no `astro-i18n` package; pages mirror EN/RU layout. [CLAUDE.md §Architecture Key Design Decisions]
11. **MCP servers available:** Playwright (visual testing), Context7 (docs). Use via `npx ctx7@latest` CLI fallback if MCP tools stripped from agent session.

Planner MUST explicitly check each of these during plan review.

## Sources

### Primary (HIGH confidence)
- `/websites/tailwindcss` (Context7 via ctx7 CLI) — topics fetched: `arbitrary value text clamp font size syntax`, `text-(length:--custom-property) variable`, `arbitrary value underscore space calc` → confirms arbitrary `text-[clamp(40px,8vw,64px)]` is canonical v4 syntax.
- `/websites/astro_build_en` (Context7 via ctx7 CLI) — topics fetched: `script tag inline component module behavior`, `script is:inline component duplicate DOMContentLoaded` → confirms Astro 5 script semantics (in-place rendering, dedup for processed scripts).
- `/mdn/content` (Context7 via ctx7 CLI) — topics fetched: `IntersectionObserver rootMargin sticky header`, `intersection observer threshold multiple sections`, `scroll-margin-top sticky header` → confirms IntersectionObserver API + `scroll-margin-top` canonical use.
- `npm view astro version` — verified 5.17.1 installed, 6.1.8 HEAD (do not bump in Phase 4).
- `npm view tailwindcss version` — verified 4.2.1 installed, 4.2.2 latest (patch diff; no action).
- Reference UI kit: `/Users/viktor/.claude/skills/viktor-vedmich-design/ui_kits/vedmich-dev/app.jsx` §357-398 Hero, §116-123 Pill, §131-155 Button, §394-398 Cursor — direct inspection.
- Reference screenshots: `reference-1440-full.png` (1425×4746 full page), `ref-hero.png` (Hero crop), `ref-viewport-900.png` (Podcasts-at-top scroll position) — direct visual inspection.
- Existing source files read in full: `src/components/Hero.astro`, `src/components/Header.astro`, `src/components/About.astro` (via Phase 3 plan artifacts), `src/data/social.ts`, `src/i18n/en.json`, `src/i18n/ru.json`, `src/layouts/BaseLayout.astro`, `src/styles/design-tokens.css`, `src/styles/global.css`, `src/pages/en/index.astro`, `package.json`, `.planning/config.json`.
- Phase 3 artifacts read in full: `03-CONTEXT.md`, `03-01-i18n-keys-PLAN.md`, `03-03-about-rewrite-PLAN.md` — pattern source of truth.

### Secondary (MEDIUM confidence)
- Tailwind 4 arbitrary-value rules: underscores as space conversion confirmed via multiple Tailwind docs pages [CITED: tailwindcss.com/docs/adding-custom-styles, /content, /upgrade-guide] — triangulated.
- OWASP Reverse Tabnabbing mitigation guidance — industry standard, cross-referenced in web.dev article.
- IntersectionObserver baseline browser support — caniuse.com cross-referenced with MDN Compatibility table [not directly fetched in this session; inferred from MDN docs which show baseline=widely-available].

### Tertiary (LOW confidence — flagged in Assumptions Log)
- A1 Kubestronaut URL reachability at https://www.cncf.io/training/kubestronaut/ — WebFetch returned `maxContentLength size of 10485760 exceeded` during research (page too large for in-band fetch, kubestronaut.io ECONNREFUSED). Have NOT confirmed URL live in this session. Planner / executor must verify in Plan 04-02 pre-commit.
- A2 Header height ~61px — computed from class analysis, not measured runtime. Low risk; re-measure during visual verify.
- A7 Playwright-cli v0.1.8 supports `getComputedStyle` via `--eval` — assumed from Playwright standard API; not tested in this session.

## Metadata

**Confidence breakdown:**
- Standard stack: **HIGH** — all versions verified via `npm view`; framework + utility APIs confirmed via Context7 docs. No speculation.
- Architecture patterns: **HIGH** — all patterns either directly present in Phase 3 (three-key i18n, observer, inline script), or canonical web platform (clamp, scroll-margin-top). Each has an authoritative source.
- Pitfalls: **HIGH** — Tailwind underscore rule, Astro 5 script behavior, IntersectionObserver threshold semantics all verified via official docs. The one remaining uncertainty (A1 Kubestronaut URL) is flagged.
- Security: **HIGH** — OWASP patterns, single mitigation path (`rel="noopener"`), no new attack surface.
- Validation architecture: **HIGH** — all greps and Playwright-cli evaluations use existing tooling; no framework install needed.

**Research date:** 2026-04-19
**Valid until:** 2026-05-19 (30 days; Astro 5 + Tailwind 4 are stable; reference UI kit is frozen; dependencies changing faster than 30 days would be an ecosystem event, not baseline).

---

*Phase: 04-hero-reference-match*
*Researched: 2026-04-19*
*Ready for: /gsd-plan-phase 4*
