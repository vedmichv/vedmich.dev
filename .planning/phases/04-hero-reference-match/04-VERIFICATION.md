---
phase: 04-hero-reference-match
verified: 2026-04-19T23:30:00Z
status: passed
score: 14/14 must-haves verified
overrides_applied: 0
requirements:
  - id: REQ-011
    status: satisfied
    evidence: "4 pills in dist/en/index.html + dist/ru/index.html with correct hrefs; Kubestronaut pill has target=_blank + rel=noopener + aria-label; zero CKA-family strings inside Hero; user-approved one-row rendering at 1440×900 EN + RU"
  - id: REQ-013
    status: satisfied
    evidence: "Hero.astro h1 classes match reference exactly (font-display font-bold tracking-[-0.03em] leading-[1.05] text-[clamp(40px,8vw,64px)]); --grad-hero-flat token in design-tokens.css line 143 and consumed in Hero.astro line 82 scoped <style>; no typing-cursor class anywhere in src/ or dist/_astro/*.css; no hardcoded hex in Hero.astro; user-approved h1 computed styles (Space Grotesk, 64px, 700, -1.92px letter-spacing, 67.2px line-height) at 1440×900 and 40px fontSize at 375×667"
  - id: REQ-014
    status: satisfied
    evidence: "Hero <section> classes = 'hero-deep-signal noise-overlay relative overflow-hidden pt-24 pb-16 px-6' exactly; no min-h-[90vh], pt-16, flex items-center on the Hero wrapper; user-approved getBoundingClientRect().height ≤ 540 at 1440×900"
---

# Phase 04: Hero Reference-Match Verification Report

**Phase Goal:** Hero matches reference `app.jsx:357-398` pixel-for-pixel on 1440×900, with 4-pill authority strip replacing 6-pill cert row, 3-key i18n tagline split with "AI Engineer" accent, CNCF Kubestronaut rename across codebase, nav active-state IntersectionObserver, and scroll-margin-top for anchor navigation.

**Verified:** 2026-04-19T23:30:00Z
**Status:** passed
**Re-verification:** No — initial verification
**Phase Requirements:** REQ-011, REQ-013, REQ-014

## Goal Achievement

### Observable Truths

| # | Truth | Status | Evidence |
|---|---|---|---|
| 1 | Both en.json and ru.json have `hero.tagline_before/_accent/_after` 3-key split; old `hero.tagline` removed | ✓ VERIFIED | en.json line 26-28, ru.json line 26-28; `"tagline_accent": "AI Engineer"` byte-identical in both; empty `tagline_after` both locales; `grep '"tagline":'` returns 0 matches in both files |
| 2 | `CNCF Kubestronaut` spelling corrected in `about.bio_before` in both locales | ✓ VERIFIED | en.json line 34 + ru.json line 34 contain `CNCF Kubestronaut`; zero `Kubernaut` (misspelling) in src/ or CLAUDE.md |
| 3 | `--grad-hero-flat` canonical token declared in design-tokens.css using var() references (no hex) | ✓ VERIFIED | design-tokens.css line 143: `--grad-hero-flat: linear-gradient(160deg, var(--bg-base), var(--brand-primary-soft));` |
| 4 | Hero.astro rewritten per reference: section classes `pt-24 pb-16 px-6`, max-w-[1120px] container, single column, no min-h-[90vh]/pt-16/flex items-center | ✓ VERIFIED | Hero.astro line 12 section classes exactly `hero-deep-signal noise-overlay relative overflow-hidden pt-24 pb-16 px-6`; container line 13 `max-w-[1120px] mx-auto w-full`; no nested max-w-3xl wrapper |
| 5 | Hero h1 uses clamp(40px,8vw,64px) with -0.03em tracking + 1.05 leading + inline `_` cursor span | ✓ VERIFIED | Hero.astro line 19 h1 classes: `font-display font-bold tracking-[-0.03em] leading-[1.05] text-text-primary m-0 text-[clamp(40px,8vw,64px)]`; line 20 cursor span `<span class="cursor-blink text-brand-primary" aria-hidden="true">_</span>` |
| 6 | 4-pill authority strip renders in Hero (re:Invent / Kubestronaut / Author / Host) — no CKA/CKS/CKAD/KCNA/KCSA cert pills | ✓ VERIFIED | Hero.astro lines 32-61 define exactly 4 pills; dist/en/index.html + dist/ru/index.html Hero section contain 4 pills (regex match count = 4); CKA-family count in Hero = 0 both locales |
| 7 | Kubestronaut pill safely external: target=_blank + rel=noopener + aria-label="CNCF Kubestronaut program (opens in new tab)" | ✓ VERIFIED | Hero.astro lines 41-43; built HTML both locales contain 1 target=_blank matched with 1 rel=noopener and the exact aria-label |
| 8 | 3-key tagline renders with text-text-primary accent on "AI Engineer" — no set:html, no HTML in JSON | ✓ VERIFIED | Hero.astro line 28 `{i.hero.tagline_before}<span class="text-text-primary">{i.hero.tagline_accent}</span>{i.hero.tagline_after}`; built HTML both locales contain `text-text-primary[^"]*">AI Engineer</span>` |
| 9 | typing-cursor + @keyframes blink removed from global.css; cursor-blink keyframes Hero-scoped + reduced-motion override | ✓ VERIFIED | global.css has zero `typing-cursor` strings; zero `typing-cursor` in dist/_astro/*.css; Hero.astro lines 82-87 contain scoped `.cursor-blink` + `@keyframes blink` + `@media (prefers-reduced-motion: reduce)` override |
| 10 | Cross-file Kubestronaut rename complete: social.ts certifications[0] + BaseLayout.astro description meta + CLAUDE.md §Homepage Sections | ✓ VERIFIED | social.ts line 30 `{ name: 'CNCF Kubestronaut', badge: 'kubestronaut' }`; BaseLayout.astro line 15 default description contains `CNCF Kubestronaut`; CLAUDE.md line 112 `CNCF Kubestronaut + all 5 K8s certs`; zero residual `Kubernaut` in src/ or CLAUDE.md |
| 11 | Header.astro has IntersectionObserver nav-active observer in second `<script>` block + scoped `.is-active` style | ✓ VERIFIED | Header.astro line 184 `new IntersectionObserver(...)`; threshold 0.5 + rootMargin `-80px 0px -50% 0px` (line 195); lines 201-207 `<style>` with `header a.is-active { color: var(--text-primary); border-bottom: 2px solid var(--brand-primary); }`; 2 script blocks + 1 style block counts match; built HTML contains `new IntersectionObserver(...{threshold:.5,rootMargin:"-80px 0px -50% 0px"}...)` inline; built CSS contains compiled `a[data-astro-cid-3ef6ksr2].is-active{color:var(--text-primary);border-bottom:2px solid var(--brand-primary)}` |
| 12 | `section[id] { scroll-margin-top: 80px; }` added to global.css after `html { scroll-behavior: smooth }` | ✓ VERIFIED | global.css lines 66-68 contain the rule; built CSS `_slug_.D1n8sEjy.css` contains `section[id]{scroll-margin-top:80px}` |
| 13 | REQ-011, REQ-013, REQ-014 inlined into `.planning/REQUIREMENTS.md` between REQ-008 and Global acceptance | ✓ VERIFIED | REQUIREMENTS.md line 180 REQ-011, line 205 REQ-013, line 237 REQ-014; acceptance criteria blocks are grep-verifiable/Playwright-measurable; REQ-001..008 and Global acceptance heading preserved |
| 14 | `npm run build` exits 0 with 7 pages built; Hero i18n values flow into rendered HTML in both locales | ✓ VERIFIED | Re-run 2026-04-19: "7 page(s) built in 762ms" exit 0; Level-4 data-flow trace confirmed all 8 referenced `i.hero.*` keys render with locale-specific values in dist/{en,ru}/index.html |

**Score:** 14/14 truths verified

### Required Artifacts

| Artifact | Expected | Status | Details |
|----------|----------|--------|---------|
| `src/i18n/en.json` | hero.tagline_before/_accent/_after + Kubestronaut in bio_before | ✓ VERIFIED | keys present, JSON.parse valid, key order matches spec |
| `src/i18n/ru.json` | hero.tagline_before/_accent/_after + Kubestronaut in bio_before + locale-invariant accent | ✓ VERIFIED | keys present, bilingual parity for accent + after |
| `src/styles/design-tokens.css` | --grad-hero-flat token | ✓ VERIFIED | line 143, token-referenced (var(--bg-base), var(--brand-primary-soft)), no hex |
| `src/components/Hero.astro` | full rewrite reference-match | ✓ VERIFIED | 88 lines, 4 pills, clamp h1, inline cursor span, flat gradient, scoped keyframes + reduced-motion, 0 hex, 0 typing-cursor, 0 certifications import |
| `src/styles/global.css` | typing-cursor removed + scroll-margin-top added | ✓ VERIFIED | zero typing-cursor, lines 62-68 scroll-margin-top rule, animate-on-scroll/fadeInUp/card-glow/drawLine/@theme all preserved |
| `src/data/social.ts` | certifications[0] renamed | ✓ VERIFIED | line 30 name + badge both renamed; other 5 entries + skills/speakingEvents/presentations untouched |
| `src/layouts/BaseLayout.astro` | description meta renamed | ✓ VERIFIED | line 15 `CNCF Kubestronaut, Author, Speaker` |
| `CLAUDE.md` | §Homepage Sections renamed | ✓ VERIFIED | line 112 `CNCF Kubestronaut + all 5 K8s certs` |
| `src/components/Header.astro` | observer + .is-active style appended | ✓ VERIFIED | 2 script blocks (existing + new), 1 style block (new); existing mobile-menu/scroll-shrink/lang-switch/search-trigger handlers preserved |
| `.planning/REQUIREMENTS.md` | REQ-011/013/014 inlined | ✓ VERIFIED | 3 new REQ blocks with acceptance criteria, existing REQ-001..008 and Global acceptance preserved |

### Key Link Verification

| From | To | Via | Status | Details |
|------|------|------|--------|---------|
| Hero.astro | i18n/en.json & ru.json | `t(locale).hero.tagline_before/_accent/_after/greeting/name/role/cta/cta_secondary` | ✓ WIRED | 8 `i.hero.*` references resolve; all 8 values flow into rendered HTML (Level 4 trace) |
| Hero.astro | design-tokens.css | `background: var(--grad-hero-flat)` | ✓ WIRED | token declared line 143, consumed Hero.astro line 82 |
| Hero.astro | https://www.cncf.io/training/kubestronaut/ | `<a href="..." target="_blank" rel="noopener">` | ✓ WIRED | Kubestronaut URL verified HTTP 200 at execution time (04-02 SUMMARY); link + rel=noopener present in built HTML both locales |
| Header.astro observer | `section[id]` elements | `document.querySelectorAll('section[id]')` + IntersectionObserver | ✓ WIRED | 8 sections (hero/about/podcasts/book/speaking/presentations/blog/contact) all have id attributes; observer registered via inline script in built HTML |
| Header.astro observer | nav anchor links | `document.querySelectorAll('header a[href^="#"]')` → classList.add('is-active') | ✓ WIRED | 7 nav items with # hrefs (nav array lines 12-20), style rule `header a.is-active` compiled with Astro cid |
| global.css `section[id]` rule | all 8 homepage sections | `scroll-margin-top: 80px` attribute-selector auto-application | ✓ WIRED | rule compiled into built CSS bundle; paired with existing `scroll-behavior: smooth` |

### Data-Flow Trace (Level 4)

| Artifact | Data Variable | Source | Produces Real Data | Status |
|----------|---------------|--------|--------------------|--------|
| Hero.astro | `i.hero.greeting` | i18n/en.json `Hi, I'm` / ru.json `Привет, я` | Yes | ✓ FLOWING |
| Hero.astro | `i.hero.name` | i18n/en.json `Viktor Vedmich` / ru.json `Виктор Ведмич` | Yes | ✓ FLOWING |
| Hero.astro | `i.hero.role` | i18n both `Senior Solutions Architect @ AWS` | Yes | ✓ FLOWING |
| Hero.astro | `i.hero.tagline_before` | en.json `Distributed Systems · Kubernetes · ` / ru.json `Распределённые системы · Kubernetes · ` | Yes | ✓ FLOWING |
| Hero.astro | `i.hero.tagline_accent` | both locales `AI Engineer` | Yes | ✓ FLOWING |
| Hero.astro | `i.hero.tagline_after` | both locales `""` (reserved for future punctuation) | Yes (by design) | ✓ FLOWING |
| Hero.astro | `i.hero.cta` | en.json `Get in touch` / ru.json `Связаться` | Yes | ✓ FLOWING |
| Hero.astro | `i.hero.cta_secondary` | en.json `Read more` / ru.json `Подробнее` | Yes | ✓ FLOWING |
| Header.astro | `sections` (NodeList) | `document.querySelectorAll('section[id]')` in browser | Yes — 8 sections on home pages | ✓ FLOWING |
| Header.astro | `navLinks` (Array) | `document.querySelectorAll('header a[href^="#"]')` | Yes — 7 nav items | ✓ FLOWING |

### Behavioral Spot-Checks

| Behavior | Command | Result | Status |
|----------|---------|--------|--------|
| npm run build succeeds | `npm run build` | "7 page(s) built in 762ms", exit 0 | ✓ PASS |
| JSON files parse | `node -e "JSON.parse(fs.readFileSync('src/i18n/en.json','utf8'))"` | both en.json + ru.json parse | ✓ PASS |
| 4 pills in built EN Hero | regex count of `inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-[13px] font-medium` inside `<section id="hero">` in dist/en/index.html | 4 matches | ✓ PASS |
| 4 pills in built RU Hero | same regex on dist/ru/index.html | 4 matches | ✓ PASS |
| Kubestronaut href in both locales | grep `href="https://www.cncf.io/training/kubestronaut/"` in dist/{en,ru}/index.html | 1 match each | ✓ PASS |
| Zero Kubernaut misspelling in built HTML | grep `Kubernaut[^e]` in dist/ recursively | 0 matches | ✓ PASS |
| Zero typing-cursor in built CSS | grep `typing-cursor` in dist/_astro/*.css | 0 matches | ✓ PASS |
| section[id] scroll-margin-top compiled | grep `scroll-margin-top` in dist/_astro/*.css | 1 match in _slug_.D1n8sEjy.css | ✓ PASS |
| Observer inlined into built HTML | grep `IntersectionObserver` in dist/{en,ru}/index.html | 2 occurrences each (existing observer for animate-on-scroll + new nav observer) | ✓ PASS |

### Requirements Coverage

| Requirement | Source Plan | Description | Status | Evidence |
|-------------|-------------|-------------|--------|----------|
| REQ-011 | 04-01, 04-02, 04-03 | Hero: reposition as primary pitch with 4-pill authority strip | ✓ SATISFIED | 4 pills in built HTML both locales; Kubestronaut pill has target=_blank + rel=noopener + aria-label exactly as spec; 0 CKA/CKS/CKAD/KCNA/KCSA in Hero; user visual gate approved pill row on one line at 1440×900 EN + RU |
| REQ-013 | 04-02, 04-03 | Hero: typography matches reference exactly | ✓ SATISFIED | h1 classes in Hero.astro match reference spec byte-for-byte (`font-display font-bold tracking-[-0.03em] leading-[1.05] text-[clamp(40px,8vw,64px)]`); `--grad-hero-flat` token declared (design-tokens.css:143) + consumed (Hero.astro:82); no typing-cursor in src/ or dist/; no hardcoded hex in Hero.astro; user visual gate approved computed styles at 1440×900 (64px/700/-1.92px/67.2px, Space Grotesk) and 40px at 375×667 (clamp floor) |
| REQ-014 | 04-02, 04-03 | Hero: section height ≤ 540px on 1440×900 | ✓ SATISFIED | Hero `<section>` uses `pt-24 pb-16 px-6` exactly; no `min-h-[90vh]`, `flex items-center`, `pt-16`; user visual gate approved `getBoundingClientRect().height ≤ 540` at 1440×900 |

No orphaned requirements. All 3 Phase 4 REQs declared by plans and covered by verification evidence.

### Anti-Patterns Found

| File | Line | Pattern | Severity | Impact |
|------|------|---------|----------|--------|
| (none) | - | - | - | No TODO / FIXME / XXX / HACK / PLACEHOLDER patterns in any Phase 4-modified file. No hardcoded hex in Hero.astro. No deprecated cyan (#06B6D4/#22D3EE) in Hero/global.css/design-tokens.css. No `typing-cursor` anywhere in src/. No `set:html` in Hero.astro. |

### Human Verification Required

User visual gate was already completed and approved during Plan 04-03 Task 4 (resume-signal captured verbatim in 04-03-SUMMARY.md):

> "approved — all visual checks passed. Hero typography matches reference at 1440×900, height ≤ 540px, 4 pills on one row, nav active-state highlight works, anchor scroll keeps section titles visible below sticky header, Kubestronaut external link opens in new tab, no console errors."

REQ-013 + REQ-014 computed-style acceptance criteria are user-confirmed. No additional human items required for this verification.

### Gaps Summary

**No gaps.** All 14 observable truths verified, all 10 artifacts pass all four levels (exists, substantive, wired, data flows), all 6 key links wired, all 3 phase requirements satisfied with concrete code/HTML/CSS evidence, and user visual gate already approved. Build is green (7 pages, exit 0). Zero regressions in Phase 3 sections (About/Podcasts/Book/Speaking/Presentations/Blog/Contact all still render with substantive content).

Phase 4 goal — Hero matches reference `app.jsx:357-398` pixel-for-pixel on 1440×900 with the 4-pill authority strip, 3-key tagline split, CNCF Kubestronaut rename, nav IntersectionObserver, and scroll-margin-top — is fully achieved.

---

*Verified: 2026-04-19T23:30:00Z*
*Verifier: Claude (gsd-verifier)*
