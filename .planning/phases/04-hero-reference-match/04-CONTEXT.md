# Phase 4: Hero — match reference pixel-for-pixel — Context

**Gathered:** 2026-04-19
**Status:** Ready for planning

<domain>
## Phase Boundary

Rewrite `src/components/Hero.astro` so that the rendered Hero section on 1440×900:

1. **Matches reference typography/spacing/container** — ROADMAP Phase 4 table §1-15 (h1 64/700/-0.03em/1.05, role mono amber 18, flat gradient 160deg, padding 96/64/24, container 1120, greeting 14/16 two-line structure, pills mt-7 gap-2.5, CTA mt-8, `_` cursor inline).
2. **Repositions Hero as the site's primary pitch** — compact credibility strip driven by 4 authority signals instead of 6 cert pills:
   - re:Invent & Keynote Speaker → scrolls to `#speaking`
   - CNCF **Kubestronaut** (teal active) → external link to CNCF Kubestronaut program
   - Author «Cracking the Kubernetes Interview» → scrolls to `#book`
   - Host · DKT + AWS RU → scrolls to `#podcasts`
3. **Renames `CNCF Kubernaut` → `CNCF Kubestronaut` project-wide** (factology fix; correct CNCF program name). Scope: `src/data/social.ts`, `src/i18n/en.json`, `src/i18n/ru.json`, `src/layouts/BaseLayout.astro` (meta description), `CLAUDE.md`.
4. **Adds IntersectionObserver-based nav active-state highlight** in `src/components/Header.astro` so clicking a Hero pill gives visible feedback in the header. In-scope by explicit user request (2026-04-19).

Out of scope: rewriting other sections (About / Podcasts / Speaking / Book / Presentations / Blog / Contact); adding new site capabilities (popover, Calendly embed, tooltip details on pills); changing cert data (`certifications` array stays the same six badges — but only `Kubestronaut` is surfaced in Hero, CKA/CKS/CKAD/KCNA/KCSA are dropped from the Hero row as per "Kubestronaut already implies all 5" decision).

</domain>

<decisions>
## Implementation Decisions

### Content strategy (Hero as primary pitch)
- **D-01:** Hero is the site's **sales pitch** — "if visitors don't read it, they don't scroll further". Compact (~520px on 1440×900), credibility-dense, every line optimized to make people "want to hire / buy". All authority signals must be visible above the fold.
- **D-02:** Replace the 6 cert pills (`certifications.map`) with a curated **4-pill authority strip** that covers: speaker credibility + CNCF achievement + author + podcast host. Each pill is a navigable anchor or external link (see D-07). CKA/CKS/CKAD/KCNA/KCSA are dropped from Hero — "Kubestronaut" already implies them. About section stays as-is from Phase 3 (no cert block there either).
- **D-03:** Pill labels (final copy, locale-invariant — these are brand/credential names, stay English in both EN and RU):
  1. `re:Invent & Keynote Speaker` — positions as conference-grade speaker (not tied to a single year — broader authority; user explicit: "важно чтоб люди хотели меня купить").
  2. `CNCF Kubestronaut` — teal-active variant (same visual treatment as current active cert pill: teal dot + `bg-brand-primary-soft` + `border-brand-primary` + `text-brand-primary-hover`). **Not "Kubernaut" — factology fix.**
  3. `Author «Cracking the Kubernetes Interview»` — guillemets `«»` preserved across locales (matches Phase 3 D-07 pattern).
  4. `Host · DKT + AWS RU` — middot separator, brand names over numeric metrics (avoids stale counts).

### Rename CNCF Kubernaut → CNCF Kubestronaut (project-wide)
- **D-04:** Correct the misspelling in ONE atomic commit as part of Phase 4. Files to touch:
  - `src/data/social.ts` — `certifications[0].name` + `badge` key.
  - `src/i18n/en.json` §`about.bio_before` — change trailing substring "CNCF Kubernaut and author of " → "CNCF Kubestronaut and author of ".
  - `src/i18n/ru.json` §`about.bio_before` — change "CNCF Kubernaut и автор книги " → "CNCF Kubestronaut и автор книги ".
  - `src/layouts/BaseLayout.astro` §15 — `description` default: "… CNCF Kubernaut, …" → "… CNCF Kubestronaut, …".
  - `CLAUDE.md` §"Homepage Sections" #2 — "CNCF Kubernaut + all 5 K8s certs" → "CNCF Kubestronaut + all 5 K8s certs".
  - Do NOT grep-replace inside `.playwright-cli/*.yml` snapshots, `current-content.json`, `ref-content.json` — those are historical artifacts.

### Pill interaction pattern
- **D-05:** All pills render as `<a>` elements (not `<span>`). In-site targets use `href="#section"` for smooth scroll. CSS `html { scroll-behavior: smooth; }` is already present via Tailwind defaults in Astro; verify during execute. Zero additional JS for navigation. Kubestronaut pill is external: `href="https://www.cncf.io/training/kubestronaut/" target="_blank" rel="noopener"`.
- **D-06:** Pill base style follows reference `Pill` primitive (`app.jsx:116-123`): `inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-[13px] font-medium bg-surface text-text-primary border border-border font-body`. Teal variant (only Kubestronaut): `bg-brand-primary-soft text-brand-primary-hover border-brand-primary`, plus a leading `<span class="w-1.5 h-1.5 rounded-full bg-brand-primary-hover"></span>` dot.
- **D-07:** Add `hover:border-brand-primary hover:text-brand-primary-hover transition-colors` to pills — reference has no hover state, but since these are now interactive links, affordance is required. Exception: Kubestronaut already teal, use `hover:bg-brand-primary-hover/20` instead.
- **D-08:** Accessibility: each pill has a visible-on-focus ring (`focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand-primary`). External link pill (Kubestronaut) has `aria-label="CNCF Kubestronaut program (opens in new tab)"`.

### Nav active-state highlight (in-scope by explicit user request)
- **D-09:** Add an IntersectionObserver script to `src/components/Header.astro` that watches `#about #podcasts #book #speaking #presentations #blog #contact` and toggles `.is-active` on the matching nav link. Active style: `text-text-primary` (vs `text-text-secondary` default) + a teal 2px underline via `border-b-2 border-brand-primary`. Threshold 0.5, `rootMargin: "-80px 0px -50% 0px"` (accounting for sticky header). Script is inline-module, runs on DOMContentLoaded.
- **D-10:** This extends Zero-JS baseline from "scroll-observer + mobile menu" → "+ nav-active". Still minimal — one observer, no framework. Included in Phase 4 because Hero pills drive this UX; splitting would ship half-baked interaction.

### h1 responsive behavior
- **D-11:** h1 uses `font-display font-bold tracking-[-0.03em] leading-[1.05] text-text-primary m-0` with `font-size: clamp(40px, 8vw, 64px)`. Fixed 64px on ≥800px viewports (matches reference), scales down to 40px on 375px (fits "Viktor Vedmich" on single line). Reference doesn't test mobile — this is our defensible call. Use arbitrary Tailwind: `text-[clamp(40px,8vw,64px)]` or inline style attribute (executor decides the cleaner path — both compile identically).

### Background gradient
- **D-12:** Add new canonical token `--grad-hero-flat: linear-gradient(160deg, var(--bg-base), var(--brand-primary-soft));` to `src/styles/design-tokens.css` §"Complex / layered gradients" (right before or after `--grad-hero-soft`). Update `.hero-deep-signal` in `src/components/Hero.astro` `<style>` to `background: var(--grad-hero-flat);`. Keep `.noise-overlay` class (D-13).
- **D-13:** Keep `noise-overlay` class on the Hero `<section>`. Reference is a React mockup — real web gradients posterize without noise, visible banding appears on 520px tall gradient. Noise cost is one `::after` pseudo — stays within Zero-JS and design-tokens hygiene.

### Cursor
- **D-14:** Replace CSS `.typing-cursor` pseudo `|` with inline `_` character matching reference literally: `<span class="cursor-blink text-brand-primary" aria-hidden="true">_</span>`. Add `.cursor-blink { animation: blink 1s step-end infinite; } @keyframes blink { 50% { opacity: 0; } }` to Hero `<style>` block OR to `design-tokens.css` (executor decides; prefer tokens.css if the animation is reusable). Benefits: matches ref exactly; `_` is a text character (semantically correct for "typing" look). `.typing-cursor` can be removed from `global.css` if no other component uses it — grep first.

### Tagline (ref-faithful, 3-key i18n split)
- **D-15:** Keep reference tagline verbatim: `"Distributed Systems · Kubernetes · AI Engineer"`. Split across 3 i18n keys following Phase 3 pattern (D-01):
  - `hero.tagline_before` = `"Distributed Systems · Kubernetes · "` (EN) / `"Распределённые системы · Kubernetes · "` (RU)
  - `hero.tagline_accent` = `"AI Engineer"` (both locales — term of art, English)
  - `hero.tagline_after` = `""` (both locales — empty reserve for future punctuation like `.`)
- **D-16:** Replace current `hero.tagline` single-key with the 3-key split. Remove the old key. Template renders `{i.hero.tagline_before}<span class="text-text-primary">{i.hero.tagline_accent}</span>{i.hero.tagline_after}` inside the tagline `<p>`. Same pattern as Phase 3 About bio accent — no `set:html`, no HTML in JSON.

### Greeting structure (ref-faithful)
- **D-17:** Two separate blocks, not one flex row:
  - Line 1 (terminal prompt): `<div class="font-mono text-brand-primary text-sm mb-4">~/vedmich.dev $ whoami</div>` — teal, 14px, `mb-4` = 16px gap.
  - Line 2 ("Hi, I'm"): `<div class="font-mono text-text-secondary text-base mb-1">Hi, I'm</div>` — mute, 16px, `mb-1` = 4px gap.
  - The existing i18n key `hero.greeting` → "Hi, I'm" / "Привет, я" maps to Line 2. Line 1 is hardcoded (terminal prompt is universal; no i18n needed — it's a code-like element).

### Spacing (ref-faithful)
- **D-18:** All margins match reference (`app.jsx:357-391`):
  - `<section>` padding: `pt-24 pb-16 px-6` (96/64/24). Drop `min-h-[90vh]`, drop `flex items-center`, drop `pt-16`.
  - Container: `max-w-[1120px] mx-auto w-full`. Drop the nested `max-w-3xl` wrapper.
  - h1 → role gap: `mt-3` (12px).
  - Role → tagline gap: `mt-4` (≈18px; Tailwind `mt-4` = 16px, reference is 18 — close enough, no arbitrary needed).
  - Tagline → pills: `mt-7` (28px).
  - Pills → CTA: `mt-8` (32px).
  - Pills internal gap: `gap-2.5` (10px).
  - CTA internal gap: `gap-3` (12px).

### Section height target
- **D-19:** Target Hero section height on 1440×900 viewport: **~520px** (content + 96 top + 64 bottom padding). User flagged ability to "сжимать ещё больше" — if during visual verify the section feels too tall, dropping "Hi, I'm" line or tightening paddings to 64/48 are pre-approved follow-up tweaks. Record actual measured height in Phase 4 SUMMARY.

### Claude's Discretion
- Whether to inline cursor animation in `Hero.astro` `<style>` or extract to `design-tokens.css`. Prefer local scoping until a second consumer appears.
- Exact Tailwind spelling for clamp — `text-[clamp(40px,8vw,64px)]` arbitrary value vs a two-step `text-[40px] sm:text-[64px]` fallback if clamp causes paint issues. Prefer clamp; fall back only if executor finds a concrete bug.
- Whether to set `scroll-margin-top: 80px` on anchor targets (`#speaking`, `#book`, etc.) so sticky header doesn't overlap the section title. Recommended yes — trivial single-line in each section wrapper.
- Ordering of the 4 Hero pills on the visible row. Proposed order: `re:Invent & Keynote Speaker` → `CNCF Kubestronaut` (teal active, visual anchor middle-left) → `Author «Cracking the Kubernetes Interview»` → `Host · DKT + AWS RU`. Executor may re-order if wrap behavior on 1440px is ugly.
- How to `grep` `global.css` for `.typing-cursor` before deleting it — standard pre-delete check.

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Reference design
- `/Users/viktor/.claude/skills/viktor-vedmich-design/ui_kits/vedmich-dev/app.jsx` §357-398 — `Hero` component: container, padding, greeting structure, h1 typography, role mono amber, tagline split rendering, pills, CTA spacing. **SOURCE OF TRUTH for visual targets.**
- `/Users/viktor/.claude/skills/viktor-vedmich-design/ui_kits/vedmich-dev/app.jsx` §116-123 — `Pill` primitive: `default` + `teal` variants used by Hero credentials strip.
- `/Users/viktor/.claude/skills/viktor-vedmich-design/ui_kits/vedmich-dev/app.jsx` §131-155 — `Button` primitive: `primary` teal + `ghost` variants for CTA.
- `/Users/viktor/.claude/skills/viktor-vedmich-design/ui_kits/vedmich-dev/app.jsx` §394-398 — `Cursor` component: inline `_` char with blinking opacity.
- `reference-1440-full.png` (project root) — visual reference screenshot.

### Roadmap & Requirements
- `.planning/ROADMAP.md` §"Phase 4 — Hero: match reference pixel-for-pixel" — 15-item diff table + 10-step change plan + verification criteria.
- `.planning/REQUIREMENTS.md` — NEW REQ-011 (Hero repositioning), NEW REQ-013 (Hero typography), NEW REQ-014 (Hero height). Note: REQ-011/013/014 are introduced by Phase 4 itself (promoted from Phase 11 during Phase 3 audit on 2026-04-19); inline into REQUIREMENTS.md during plan or execute phase.
- `.planning/STATE.md` §"Active context" — Phase 11→4 promotion rationale; min-h-[90vh] + typography drift details.

### Prior phase context (carry-forward decisions)
- `.planning/phases/03-section-order-about/03-CONTEXT.md` §Implementation Decisions — bio split pattern (D-01), token hygiene (D-05), no `set:html` in JSON (D-01), atomic commit per phase.
- `.planning/phases/03-section-order-about/03-CONTEXT.md` §Deferred Ideas — "Pill hover interactions" was deferred in Phase 3 because About pills are static; Phase 4 explicitly reverses this for Hero pills because they're now interactive links (justified diff).

### Existing code to respect
- `src/components/Hero.astro` — current implementation. Full rewrite target.
- `src/components/Header.astro` — add IntersectionObserver script for nav active-state highlight (D-09).
- `src/data/social.ts` §29-36 — `certifications` array; rename `CNCF Kubernaut` → `CNCF Kubestronaut` and `badge: 'kubernaut'` → `'kubestronaut'`. Hero no longer maps over this array (D-02).
- `src/i18n/en.json` §"hero" — split `tagline` into 3 keys (D-15). §"about.bio_before" — Kubernaut→Kubestronaut fix (D-04).
- `src/i18n/ru.json` §"hero" — same mutation as EN, with RU translations for `tagline_before`. §"about.bio_before" — Kubernaut→Kubestronaut fix.
- `src/layouts/BaseLayout.astro` §15 — meta description: Kubernaut → Kubestronaut (D-04).
- `src/styles/design-tokens.css` §"Complex / layered gradients" — add `--grad-hero-flat` (D-12).
- `src/styles/global.css` — grep for `.typing-cursor` references before deleting (D-14).
- `CLAUDE.md` §"Homepage Sections" — Kubernaut → Kubestronaut copy fix (D-04).

### Project rules
- `CLAUDE.md` §"Deep Signal Design System" — token hygiene, anti-patterns (no deprecated cyan, no hardcoded hex, DKT/AWS colors forbidden outside their sections).
- `CLAUDE.md` §"Content Workflow" — bilingual edits land in BOTH `src/i18n/en.json` and `src/i18n/ru.json`.
- `CLAUDE.md` §"Publishing Workflow — Big changes" — Phase 4 crosses the "design changes" threshold; push straight to main is still OK (aligned with project convention for this milestone), but visual verification on live via playwright-cli is mandatory after deploy.
- `CLAUDE.md` §"GSD workflows" — ask in RU, record artifacts in EN (applied during this discussion).

### External resources (pill targets)
- https://www.cncf.io/training/kubestronaut/ — CNCF Kubestronaut program page (target for Kubestronaut pill).

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- **i18n pipeline** (`src/i18n/utils.ts` → `t(locale)`) — typed keys; adding `hero.tagline_before/_accent/_after` is a one-line change per JSON; TS auto-picks new keys (run `astro check` if typed export breaks).
- **Tailwind `@theme` utilities** — `text-brand-primary`, `bg-brand-primary-soft`, `border-brand-primary`, `text-warm`, `bg-surface`, `border-border`, `text-text-primary`, `text-text-secondary`, `font-mono`, `font-display`, `font-body` all already resolve to Deep Signal tokens in `src/styles/global.css`.
- **Self-hosted fonts** — Space Grotesk 700 (h1), Inter 400 (tagline), JetBrains Mono 400/500 (terminal greeting, role, pill labels where applicable) are already preloaded in `BaseLayout.astro`. No new font loading work.
- **`.noise-overlay` class** — provides fractalNoise `::after`, already applied to current Hero. Keep.
- **`animate-on-scroll` IntersectionObserver** — existing pattern in `BaseLayout.astro` (or wherever); fine as an analog to the new nav-highlight observer, but the nav-highlight needs its own instance with different threshold/callback.
- **Current `.typing-cursor` in `global.css`** — pseudo-element cursor; will be replaced by inline `_` (D-14). Grep for other consumers before removing the CSS rule.

### Established Patterns
- **Zero-JS default** — extended by one observer for nav highlight (D-09). Still minimal: no framework, no hydration, inline module script.
- **Atomic commit per phase** — Phase 4 touches ~7 files (Hero, Header, social.ts, 2 i18n JSON, BaseLayout, design-tokens.css, CLAUDE.md). Single commit per Phase 4 plan (may be split into 2-3 plans for logical grouping — executor decides).
- **Design tokens only** — no hardcoded hex. New gradient token `--grad-hero-flat` added at canonical source.
- **Bilingual parity** — every text change lands in both `en.json` and `ru.json`. Pill labels stay English in both locales (brand/credential names).
- **Component decomposition** — keep Hero as a single `.astro` component; don't extract `<Pill>` to its own component (consistent with Phase 3 which kept About.astro monolithic).

### Integration Points
- **`src/components/Hero.astro`** — full rewrite per D-03 through D-18.
- **`src/components/Header.astro`** — append IntersectionObserver inline module script at bottom, targeting `document.querySelectorAll('a[href^="#"]')` in nav.
- **`src/data/social.ts`** — trivial string rename (D-04).
- **`src/i18n/{en,ru}.json`** — replace `hero.tagline` with 3-key split, fix `about.bio_before` Kubernaut spelling.
- **`src/layouts/BaseLayout.astro`** — meta description Kubernaut fix.
- **`src/styles/design-tokens.css`** — add `--grad-hero-flat` token.
- **`CLAUDE.md`** — documentation Kubernaut fix.
- Cross-file risk: if other components (Footer, About, Presentations) consume `hero.tagline` — grep before the JSON swap. Initial audit suggests only Hero uses it, but verify during plan-phase.

</code_context>

<specifics>
## Specific Ideas

### Hero markup sketch (illustrative, not prescriptive)
```astro
<section id="hero" class="hero-deep-signal noise-overlay relative overflow-hidden pt-24 pb-16 px-6">
  <div class="max-w-[1120px] mx-auto w-full">
    <div class="font-mono text-brand-primary text-sm mb-4">~/vedmich.dev $ whoami</div>
    <div class="font-mono text-text-secondary text-base mb-1">{i.hero.greeting}</div>
    <h1 class="font-display font-bold tracking-[-0.03em] leading-[1.05] text-text-primary m-0 text-[clamp(40px,8vw,64px)]">
      {i.hero.name}<span class="cursor-blink text-brand-primary" aria-hidden="true">_</span>
    </h1>
    <div class="font-mono text-warm text-lg mt-3">{i.hero.role}</div>
    <p class="font-body text-lg text-text-secondary max-w-[640px] mt-4">
      {i.hero.tagline_before}<span class="text-text-primary">{i.hero.tagline_accent}</span>{i.hero.tagline_after}
    </p>

    <!-- Authority pills -->
    <div class="flex flex-wrap gap-2.5 mt-7">
      <a href="#speaking"
         class="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-[13px] font-medium bg-surface border border-border text-text-primary hover:border-brand-primary hover:text-brand-primary-hover transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand-primary">
        re:Invent &amp; Keynote Speaker
      </a>
      <a href="https://www.cncf.io/training/kubestronaut/"
         target="_blank" rel="noopener"
         aria-label="CNCF Kubestronaut program (opens in new tab)"
         class="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-[13px] font-medium bg-brand-primary-soft border border-brand-primary text-brand-primary-hover hover:bg-brand-primary-hover/20 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand-primary">
        <span class="w-1.5 h-1.5 rounded-full bg-brand-primary-hover"></span>
        CNCF Kubestronaut
      </a>
      <a href="#book"
         class="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-[13px] font-medium bg-surface border border-border text-text-primary hover:border-brand-primary hover:text-brand-primary-hover transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand-primary">
        Author «Cracking the Kubernetes Interview»
      </a>
      <a href="#podcasts"
         class="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-[13px] font-medium bg-surface border border-border text-text-primary hover:border-brand-primary hover:text-brand-primary-hover transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand-primary">
        Host · DKT + AWS RU
      </a>
    </div>

    <!-- CTA -->
    <div class="flex flex-wrap items-center gap-3 mt-8">
      <a href="#contact" class="inline-flex items-center gap-2 px-5 py-2.5 bg-brand-primary hover:bg-brand-primary-hover text-bg-base font-medium rounded-lg transition-colors">{i.hero.cta}</a>
      <a href="#about" class="inline-flex items-center gap-2 px-5 py-2.5 border border-border hover:border-brand-primary hover:text-brand-primary-hover text-text-primary font-medium rounded-lg transition-colors">
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

### New design token (add to `src/styles/design-tokens.css` §Gradients)
```css
/* Flat hero gradient — reference-matched, no radial blobs. Pair with .noise-overlay. */
--grad-hero-flat: linear-gradient(160deg, var(--bg-base), var(--brand-primary-soft));
```

### New i18n keys
```json
// en.json  "hero":
{
  "greeting": "Hi, I'm",
  "name": "Viktor Vedmich",
  "role": "Senior Solutions Architect @ AWS",
  "tagline_before": "Distributed Systems · Kubernetes · ",
  "tagline_accent": "AI Engineer",
  "tagline_after": "",
  "cta": "Get in touch",
  "cta_secondary": "Read more"
}

// ru.json  "hero":
{
  "greeting": "Привет, я",
  "name": "Виктор Ведмич",
  "role": "Senior Solutions Architect @ AWS",
  "tagline_before": "Распределённые системы · Kubernetes · ",
  "tagline_accent": "AI Engineer",
  "tagline_after": "",
  "cta": "Связаться",
  "cta_secondary": "Подробнее"
}
```

### Nav active-highlight script sketch (append at bottom of `Header.astro`)
```astro
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

</specifics>

<deferred>
## Deferred Ideas

- **Pill popovers with detail (modal/tooltip)** — e.g., Kubestronaut pill expanding to show "= CKA + CKS + CKAD + KCNA + KCSA" on hover/click, or re:Invent pill showing "BOA310 · 4.7/5.0 rating". Would require JS and adds complexity; deferred. Current decision: single short pill label + external/scroll link is sufficient signal.
- **Podcast metrics in pill** — e.g., "Host · DKT (10K+ subs) + AWS RU (70K+ listens)". Too long for a pill; metrics go stale. Deferred: metrics already live in Podcasts section.
- **Hero CTA → Calendly embed** — "Book a call" direct booking link. Not yet set up; current `#contact` flow (mailto / Formspree TBD in Phase 10) is path of least resistance for v0.4. Revisit post-milestone.
- **h1 letter-by-letter typing animation** — reference has only a blinking cursor, not live typing. Could add later with a Typed.js or custom hook. Deferred — would violate Zero-JS baseline.
- **Mobile Hero rework** — if 375px Hero feels cramped after Phase 4 ships, revisit stacking / pill wrap / font-size ladder. Phase 4 targets 1440×900 primarily; 375px is "graceful degrade, no regression".
- **Scroll-margin-top on section targets** — trivial single-line fix per section wrapper (`scroll-margin-top: 80px`) to prevent sticky header overlap. Pre-approved follow-up in Claude's Discretion (D-nav).
- **Remove unused `.typing-cursor` from `global.css`** — micro-cleanup, do it inside Phase 4 after grep confirms no other consumer.
- **Section height tightening to ~420px** — if user finds 520px too tall post-ship (D-19 notes: "готовым к тому что будем сжимать"), drop "Hi, I'm" line or tighten paddings to 64/48 in a Phase 4.1 follow-up.

</deferred>

---

*Phase: 04-hero-reference-match*
*Context gathered: 2026-04-19*
