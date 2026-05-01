# Phase 4: Hero — match reference pixel-for-pixel — Pattern Map

**Mapped:** 2026-04-19
**Files analyzed:** 8 (7 MODIFY + 1 doc)
**Analogs found:** 8 / 8 (all exact or role-match)

## File Classification

| Modified File | Role | Data Flow | Closest Analog | Match Quality |
|---------------|------|-----------|----------------|---------------|
| `src/components/Hero.astro` | component (Astro, SSG) | build-time render | `src/components/About.astro` (Phase 3 rewrite) | exact — same monolithic `.astro` + i18n `*_before/_accent/_after` + Deep Signal pills pattern |
| `src/components/Header.astro` | component (Astro, SSG + inline client script) | hybrid: SSG markup + browser runtime JS | `src/layouts/BaseLayout.astro` §63-88 `animate-on-scroll` IntersectionObserver | exact for the IntersectionObserver pattern; existing `Header.astro` §129-173 script block is the direct append target |
| `src/data/social.ts` | data (static TS const export) | import at build time | `src/data/social.ts` itself — surgical string rename with no pattern to copy | N/A (self-edit; pattern is identity) |
| `src/i18n/en.json` | config (i18n string catalog) | JSON import at build time | Plan `03-01-i18n-keys-PLAN.md` (EN `about.bio` → 3-key split) | exact — same JSON mutation pattern, same bilingual parity rule, same "no `set:html`" invariant |
| `src/i18n/ru.json` | config (i18n string catalog) | JSON import at build time | Plan `03-01-i18n-keys-PLAN.md` (RU `about.bio` → 3-key split) | exact — same JSON mutation pattern, same "book title stays English" rule |
| `src/layouts/BaseLayout.astro` | layout (Astro, SSG) | build-time render | `src/layouts/BaseLayout.astro` §15 itself — single-token prop-default string rename | N/A (self-edit; identity) |
| `src/styles/design-tokens.css` | config (CSS custom properties) | compile-time import by Tailwind `@theme` | `src/styles/design-tokens.css` §122 `--grad-subtle-dark` + §125-139 existing `--grad-hero-soft` block | exact — same canonical-gradient-token section, same `linear-gradient(160deg, ..., ...)` shape |
| `src/styles/global.css` | config (CSS) | compile-time import by Astro pipeline | `src/styles/global.css` §109-119 `.typing-cursor` rule (rule removal, not add) | N/A (pure deletion; grep-confirm-then-delete pattern) |
| `CLAUDE.md` | doc (markdown) | human-read | Doc §"Homepage Sections" §74 itself — single-word fix | N/A (self-edit; identity) |

## Pattern Assignments

### `src/components/Hero.astro` (component, build-time render — FULL REWRITE)

**Analog:** `src/components/About.astro` (Phase 3 landing, 39 lines).

**Why this analog:** About.astro is the canonical Phase 3 monolithic `.astro` rewrite that landed the exact toolkit Hero needs: (1) three-key i18n `*_before/_accent/_after` accent rendering without `set:html`, (2) Deep Signal token-only utilities (no hardcoded hex), (3) inline pill markup with `Pill` primitive classes from the reference UI kit, (4) `interface Props { locale: Locale }` + `const i = t(locale)` frontmatter shape. Hero rewrite is the same shape scaled up (greeting + h1 + role + tagline + 4 pills + 2 CTAs) with one extra local `<style>` block for cursor-blink keyframes.

**Imports pattern** (About.astro:1-11 — ALMOST identical for Hero; ONLY change is drop `certifications` import per D-02):
```astro
---
import { t, type Locale } from '../i18n/utils';
import { skills } from '../data/social';  // Hero: DROP this; Hero no longer maps certifications

interface Props {
  locale: Locale;
}

const { locale } = Astro.props;
const i = t(locale);
---
```

Hero frontmatter after rewrite:
```astro
---
import { t, type Locale } from '../i18n/utils';

interface Props {
  locale: Locale;
}

const { locale } = Astro.props;
const i = t(locale);
---
```

**Three-key i18n accent pattern** (About.astro:19-21 — copy verbatim for Hero tagline):
```astro
<p class="font-body text-lg leading-[1.7] text-text-primary animate-on-scroll m-0">
  {i.about.bio_before}<span class="text-brand-primary">{i.about.bio_accent}</span>{i.about.bio_after}
</p>
```

Hero tagline (same pattern, `text-text-primary` accent color instead of `text-brand-primary` per D-16, no `animate-on-scroll` because Hero is above the fold per RESEARCH.md §Open Question 5):
```astro
<p class="font-body text-lg text-text-secondary max-w-[640px] mt-4">
  {i.hero.tagline_before}<span class="text-text-primary">{i.hero.tagline_accent}</span>{i.hero.tagline_after}
</p>
```

**Default pill primitive pattern** (About.astro:29-33 — copy class string for 3 of 4 Hero pills):
```astro
<span class="inline-flex items-center rounded-full px-3.5 py-1.5 text-[13px] font-medium bg-surface border border-border text-text-primary">
  {skill}
</span>
```

Hero default pill (same primitive, upgraded to `<a>` + hover affordance + focus ring per D-05, D-07, D-08):
```astro
<a href="#speaking"
   class="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-[13px] font-medium bg-surface border border-border text-text-primary font-body hover:border-brand-primary hover:text-brand-primary-hover transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand-primary">
  re:Invent &amp; Keynote Speaker
</a>
```

**Teal-active pill variant pattern** (current `Hero.astro:42-45` — the ONLY "active pill with dot" the project has; preserve the visual, swap `<span>` → `<a>` + add hover + focus ring for the Kubestronaut pill):
```astro
<!-- Current Hero.astro lines 42-45 (to be REPLACED) -->
<span class="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium bg-brand-primary-soft border border-brand-primary text-brand-primary-hover">
  <span class="w-1.5 h-1.5 rounded-full bg-brand-primary-hover"></span>
  {name}
</span>
```

Kubestronaut pill after rewrite (same `bg-brand-primary-soft border-brand-primary text-brand-primary-hover` token triplet + leading dot, sizes bumped to `px-3.5 py-1.5 text-[13px]` for pill-row consistency, `rel="noopener"` + `aria-label` per D-05/D-08):
```astro
<a href="https://www.cncf.io/training/kubestronaut/"
   target="_blank" rel="noopener"
   aria-label="CNCF Kubestronaut program (opens in new tab)"
   class="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-[13px] font-medium bg-brand-primary-soft border border-brand-primary text-brand-primary-hover font-body hover:bg-brand-primary-hover/20 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand-primary">
  <span class="w-1.5 h-1.5 rounded-full bg-brand-primary-hover"></span>
  CNCF Kubestronaut
</a>
```

**Scoped `<style>` block pattern** (current `Hero.astro:74-78` — preserve the pattern of "component-local `<style>` referencing a `--grad-*` token", add cursor-blink keyframes inside same block per D-14 Claude's Discretion):
```astro
<!-- Current Hero.astro:74-78 — structure to reuse -->
<style>
  .hero-deep-signal {
    background: var(--grad-hero-soft);  /* RENAME to --grad-hero-flat per D-12 */
  }
</style>
```

Hero after rewrite:
```astro
<style>
  .hero-deep-signal { background: var(--grad-hero-flat); }
  .cursor-blink { animation: blink 1s step-end infinite; }
  @keyframes blink { 50% { opacity: 0; } }
</style>
```

**CTA button pattern** (current `Hero.astro:55-69` — preserve verbatim; the token-utility shape is already correct):
```astro
<div class="flex flex-wrap items-center gap-3">
  <a href="#contact"
     class="inline-flex items-center gap-2 px-5 py-2.5 bg-brand-primary hover:bg-brand-primary-hover text-bg font-medium rounded-lg transition-colors">
    {i.hero.cta}
  </a>
  <a href="#about"
     class="inline-flex items-center gap-2 px-5 py-2.5 border border-border hover:border-brand-primary hover:text-brand-primary-hover text-text-primary font-medium rounded-lg transition-colors">
    {i.hero.cta_secondary}
    <span aria-hidden="true">→</span>
  </a>
</div>
```

Only diff: `text-bg` → `text-bg-base` recommended (shim alias → canonical token; project is mid-migration and canonical is preferred for new writes — see `global.css:41` shim map). Wrapper change: `mb-10` drops, `mt-8` added on wrapper (per D-18). `gap-3` preserved.

**Diff intent:** Full rewrite. Adopt reference `Hero` markup (`app.jsx:357-391`): 2-block greeting → clamp h1 + inline `_` cursor → mono-amber role → 3-key tagline → 4-pill authority strip (3 scroll + 1 external-teal) → 2 CTAs. Drop `min-h-[90vh] flex items-center pt-16`; use `pt-24 pb-16 px-6` + `max-w-[1120px]` container. Switch gradient token from `--grad-hero-soft` (radial blobs) to `--grad-hero-flat` (linear 160deg). Replace `.typing-cursor::after {}` pseudo with inline `<span class="cursor-blink">_</span>`.

**Risk/landmine:**
1. **Build-break window (Pitfall 5):** The `i.hero.tagline` → 3-key split lands in Plan 04-01 (Wave 1) BEFORE Hero.astro rewrite (Plan 04-02, Wave 2). Between waves, `npm run build` will fail with `Property 'tagline' does not exist`. This is EXPECTED; 03-01 plan established the same mid-wave breakage cadence. The `.json` type inference in Astro may produce warnings but still build — verify mid-wave outcome matches Phase 3.
2. **Tailwind arbitrary-value underscore rule (Pitfall 1):** `text-[clamp(40px,8vw,64px)]` MUST contain zero whitespace inside the parens. Accidental `clamp(40px, 8vw, 64px)` splits into 3 "classes" and silently fails.
3. **Gradient token lingering (Pitfall 4):** After changing `--grad-hero-soft` → `--grad-hero-flat` in the `<style>` block, grep Hero.astro for `var(--grad-hero-` → must return exactly 1 hit (`--grad-hero-flat`).
4. **Drop-`certifications`-import check (Pitfall 6 / A3):** After rewrite, `grep -n certifications src/components/Hero.astro` must return 0. No other `.astro` consumer remains (About dropped its consumer in Phase 3); `certifications` becomes unreferenced export data.
5. **`rel="noopener"` mandatory (Pitfall 8 / ASVS V10):** Kubestronaut pill alone has `target="_blank"`; the literal string `rel="noopener"` must be in the rendered HTML.
6. **`text-bg` vs `text-bg-base`:** Current code uses shim alias `text-bg`; canonical is `text-bg-base` (see `global.css:41`). Either compiles, but canonical is preferred for new writes per CLAUDE.md §Deep Signal hygiene.

---

### `src/components/Header.astro` (component + inline client script — APPEND observer + CSS)

**Analog:** `src/layouts/BaseLayout.astro` §63-88 — the project's canonical IntersectionObserver pattern (used for `.animate-on-scroll`). This is the ONE IntersectionObserver the project currently has; the new nav-active observer is a direct analog with different callback semantics (toggle active class, don't unobserve).

**Why this analog:** The pattern — vanilla DOM-ready execution, single observer instance observing a `querySelectorAll` result, entry-by-entry handler, no framework, no hydration — maps 1:1. The only differences are (a) threshold (0.5 vs 0.1), (b) rootMargin (`-80px 0px -50% 0px` vs none), (c) the callback body (toggle class on a sibling link element vs add-and-unobserve on the entry target), and (d) it does NOT have a `prefers-reduced-motion` gate because the highlight is not animation; it's state.

**Observer pattern** (BaseLayout.astro:63-88 — lines 72-86 are the observer creation; lines 66-71 are the reduced-motion gate which does NOT apply to Header's nav-active):
```astro
<script>
  // Scroll-triggered animations — skipped when user prefers reduced motion.
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (prefersReducedMotion) {
    document.querySelectorAll('.animate-on-scroll').forEach((el) => {
      el.classList.add('is-visible');
    });
  } else {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1 }
    );

    document.querySelectorAll('.animate-on-scroll').forEach((el) => {
      observer.observe(el);
    });
  }
</script>
```

**Existing `Header.astro` script block** (lines 129-173 — APPEND the new observer BELOW this block, inside the same file, at the end):
```astro
<script>
  const btn = document.getElementById('mobile-menu-btn');
  const menu = document.getElementById('mobile-menu');

  btn?.addEventListener('click', () => {
    menu?.classList.toggle('hidden');
  });

  // Close mobile menu on link click
  menu?.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => {
      menu?.classList.add('hidden');
    });
  });

  // Header shrink on scroll
  const header = document.getElementById('site-header');
  window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
      header?.classList.add('shadow-lg');
    } else {
      header?.classList.remove('shadow-lg');
    }
  });

  // ... language-switch + search-trigger handlers continue ...
</script>
```

Append to Header.astro (new observer — RESEARCH.md Example 3 / CONTEXT.md D-09 sketch):
```astro
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
  /* Uses CSS vars so the underline color follows brand tokens. */
  header a.is-active {
    color: var(--text-primary);
    border-bottom: 2px solid var(--brand-primary);
  }
</style>
```

**Existing `<style>` in Header.astro:** none currently — the append above introduces the first `<style>` block in this file. Astro supports multiple `<script>` blocks and one or more `<style>` blocks per component; Astro 5 renders both in-place in the order authored (RESEARCH.md §Architecture Patterns + Pitfall 7).

**Diff intent:** Append a second `<script>` block at the bottom of Header.astro (AFTER line 173 `</script>`) containing the nav-active IntersectionObserver, plus a scoped `<style>` block with the `.is-active` CSS rule referencing CSS vars (not Tailwind utilities, because selector is `header a.is-active` — Tailwind does not know how to compile `[data-astro-cid-*] header a.is-active` from a utility map; a vanilla CSS rule in `<style>` is the project convention).

**Risk/landmine:**
1. **Astro 5 script hoisting change (Pitfall 7):** Unlike Astro 4, `<script>` tags in component bodies render in-place. Place the new block AFTER the existing script block (line 173) — NOT at the top of the file — so DOM is parsed by the time the observer code runs. Alternatively wrap in `document.addEventListener('DOMContentLoaded', ...)` for safety, though the in-place order makes that redundant.
2. **CSS vars vs Tailwind utilities in scoped `<style>`:** `header a.is-active { color: var(--text-primary); border-bottom: 2px solid var(--brand-primary); }` — DO NOT write `@apply text-text-primary border-b-2 border-brand-primary` inside Astro's scoped `<style>` (Tailwind 4 `@apply` inside scoped Astro styles is supported but adds indirection; direct `var()` is the project convention for one-offs like this — matches `global.css` rule patterns).
3. **`threshold: 0.5 + rootMargin: '-50%' bottom` interaction (Pitfall 2):** For sections taller than viewport the active state fires mid-section, not at the top. Documented risk; acceptable per D-09. Revisit during visual verify.
4. **`rootMargin` -80px MUST stay px while Header is px-sized:** Header uses `py-[14px]` (~61px total). If future phase migrates Header to rem sizing, rootMargin must be updated in lockstep.
5. **Observer may silently fail if sections lack `id`:** `querySelectorAll('section[id]')` returns only elements with an `id` attribute. Phase 3 established all 7 homepage sections with `id` (about, podcasts, book, speaking, presentations, blog, contact). Verify via grep on `src/pages/en/index.astro` pre-merge.

---

### `src/data/social.ts` (data, surgical rename — 1 line, 2 edits)

**Analog:** none needed — the change is a 1-line surgical string edit on lines 29-36 (`certifications` array). No pattern to copy.

**Current state** (`src/data/social.ts:30`):
```ts
export const certifications = [
  { name: 'CNCF Kubernaut', badge: 'kubernaut' },
  { name: 'CKA', badge: 'cka' },
  ...
] as const;
```

**Target state:**
```ts
export const certifications = [
  { name: 'CNCF Kubestronaut', badge: 'kubestronaut' },
  { name: 'CKA', badge: 'cka' },
  ...
] as const;
```

**Diff intent:** Rename `Kubernaut` → `Kubestronaut` in `name` field AND `kubernaut` → `kubestronaut` in `badge` field of `certifications[0]`. Preserve `as const` and array ordering.

**Risk/landmine:**
1. **Zero consumers after Phase 4 (A3):** `src/components/Hero.astro:3,40` is the only current consumer; Phase 4 removes it (D-02). After rewrite: 0 consumers. Array remains as latent export data for future reintroduction. Grep `certifications` in `src/components/*.astro` after merge → expected count: 0.
2. **`badge` field is cosmetic** (not used in markup currently — no `src/components/` file reads `.badge` except the removed Hero consumer, which does NOT read `.badge`). Renaming both `name` AND `badge` keeps the data self-consistent and matches Phase 4 D-04 intent.

---

### `src/i18n/en.json` (config — 3-key split + 1 Kubestronaut fix)

**Analog:** Plan `.planning/phases/03-section-order-about/03-01-i18n-keys-PLAN.md` Task 1 (EN `about.bio` → `bio_before/bio_accent/bio_after`). Exact pattern match.

**Why this analog:** 03-01 landed the three-key i18n pattern in en.json for `about.bio`. The phase-4 mutation is the same shape applied to `hero.tagline` — remove old single key, add 3 new keys (`tagline_before`, `tagline_accent`, `tagline_after`), preserve trailing-space convention on `_before`, keep translator-friendly verbatim English term-of-art in `_accent`. The additional `about.bio_before` string patch (Kubernaut → Kubestronaut, D-04) sits inside the already-edited-by-03-01 block.

**03-01 Task 1 action block** (copy this exact cadence for Phase 4 Plan 04-01):
```json
"about": {
  "title": "About Me",
  "bio_before": "Solutions Architect and AI Engineer with 15+ years designing and evolving distributed systems at scale. Currently at AWS, owning end-to-end architecture for enterprise clients across hybrid cloud, Kubernetes, and GenAI / agentic platforms. CNCF Kubernaut and author of ",
  "bio_accent": "«Cracking the Kubernetes Interview»",
  "bio_after": ".",
  "skills_title": "Expertise"
},
```

Target shape for Phase 4 (both `hero` and `about` blocks mutated; diff shown in bold):
```json
"hero": {
  "greeting": "Hi, I'm",
  "name": "Viktor Vedmich",
  "role": "Senior Solutions Architect @ AWS",
  "tagline_before": "Distributed Systems \u00b7 Kubernetes \u00b7 ",      // NEW
  "tagline_accent": "AI Engineer",                                        // NEW
  "tagline_after": "",                                                    // NEW (empty reserve)
  // REMOVED: "tagline": "Distributed Systems · Kubernetes · AI Engineer"
  "cta": "Get in touch",
  "cta_secondary": "Read more"
},
"about": {
  "title": "About Me",
  "bio_before": "... CNCF Kubestronaut and author of ",                   // CHANGED: Kubernaut → Kubestronaut
  "bio_accent": "«Cracking the Kubernetes Interview»",
  "bio_after": ".",
  "skills_title": "Expertise"
},
```

**Acceptance-criteria grep pattern** (from 03-01-PLAN.md:145-153 — copy this cadence for Plan 04-01):
```bash
grep -q '"tagline_before"' src/i18n/en.json      # exit 0
grep -q '"tagline_accent": "AI Engineer"' src/i18n/en.json  # exit 0
grep -q '"tagline_after": ""' src/i18n/en.json   # exit 0
grep -q '"tagline":' src/i18n/en.json            # exit 1 (old key removed)
grep -q '"bio_before".*Kubestronaut' src/i18n/en.json  # exit 0
grep -q 'Kubernaut' src/i18n/en.json             # exit 1 (misspelling gone)
node -e "JSON.parse(require('fs').readFileSync('src/i18n/en.json','utf8'))"  # exits 0
```

**Diff intent:** (1) Replace single-key `hero.tagline` with 3-key split `tagline_before/_accent/_after`. (2) Patch the existing `about.bio_before` string to correct `CNCF Kubernaut` → `CNCF Kubestronaut`. Both edits in the same atomic plan (Plan 04-01) per RESEARCH.md §Open Question 4 recommendation.

**Risk/landmine:**
1. **Load-bearing trailing space on `tagline_before`:** Phase 3 D-01 established this rule for `bio_before`; same applies here. `"Distributed Systems · Kubernetes · "` MUST end with a space so the `<span>` accent follows immediately without word-join.
2. **`·` encoding:** Source file uses `\u00b7` (U+00B7 middle dot). Keep the escape form OR switch to literal `·` — Astro reads both. Mirror existing file style (escaped) for minimal diff noise.
3. **Mid-wave build failure (Pitfall 5):** After 04-01 but before 04-02, `Hero.astro` still references `i.hero.tagline` → TS check may fail. 03-01 precedent established this is acceptable mid-wave; build passes again after 04-02 lands.
4. **Exactly one `Kubernaut` reference in this file before 04-01 lands:** line 32 `bio_before`. Zero after. Grep confirms.

---

### `src/i18n/ru.json` (config — 3-key split + 1 Kubestronaut fix, mirror of en.json)

**Analog:** Plan `.planning/phases/03-section-order-about/03-01-i18n-keys-PLAN.md` Task 2 (RU mirror of the EN mutation). Exact pattern match.

**Why this analog:** 03-01 Task 2 established the bilingual-parity invariant: every EN change lands in RU with RU-translated `_before`/`_after` and IDENTICAL English `_accent`. For Phase 4: `tagline_accent = "AI Engineer"` stays English in both locales (per D-15, same reasoning as `bio_accent` keeping the book title English in both per 03-01 D-07).

**03-01 Task 2 action block** (copy cadence for Phase 4 Plan 04-01 Task 2):
```json
"about": {
  "title": "Обо мне",
  "bio_before": "Solutions Architect и AI Engineer с 15+ годами опыта в проектировании распределённых систем. Работаю в AWS, веду сквозную архитектуру для enterprise-клиентов: hybrid cloud, Kubernetes, GenAI и agentic-платформы. CNCF Kubernaut и автор книги ",
  "bio_accent": "«Cracking the Kubernetes Interview»",
  "bio_after": ".",
  "skills_title": "Экспертиза"
},
```

Target shape for Phase 4:
```json
"hero": {
  "greeting": "Привет, я",
  "name": "Виктор Ведмич",
  "role": "Senior Solutions Architect @ AWS",
  "tagline_before": "Распределённые системы \u00b7 Kubernetes \u00b7 ",   // NEW (RU translation + trailing space)
  "tagline_accent": "AI Engineer",                                        // NEW (ENGLISH, same as EN per D-15)
  "tagline_after": "",                                                    // NEW
  // REMOVED: "tagline": "Распределённые системы · Kubernetes · AI Engineer"
  "cta": "Связаться",
  "cta_secondary": "Подробнее"
},
"about": {
  "title": "Обо мне",
  "bio_before": "... CNCF Kubestronaut и автор книги ",                   // CHANGED: Kubernaut → Kubestronaut
  "bio_accent": "«Cracking the Kubernetes Interview»",
  "bio_after": ".",
  "skills_title": "Экспертиза"
},
```

**Diff intent:** Mirror the EN mutation. (1) Replace `hero.tagline` with 3-key split. (2) Patch `about.bio_before` Kubernaut → Kubestronaut.

**Risk/landmine:**
1. **Existing file uses Unicode-escape form for Cyrillic:** e.g. `"\u041e\u0431\u043e \u043c\u043d\u0435"` vs literal `"Обо мне"`. Both are valid JSON. Phase 3 03-01 Task 2 §rules permitted either; prefer literal Cyrillic for new writes (easier diff review), but keep existing escaped strings untouched where not part of the phase 4 surface to minimize noise.
2. **Bilingual parity check:** `tagline_accent` MUST be byte-identical across en.json and ru.json: `"AI Engineer"`. Same rule as 03-01 `bio_accent`.
3. **`hero.name` in ru.json is `"Виктор Ведмич"` (Cyrillic):** Unchanged by Phase 4. Do NOT translate to English accidentally.
4. **Load-bearing trailing space:** `"Распределённые системы · Kubernetes · "` — space after the second `·`. Mirrors EN convention.

---

### `src/layouts/BaseLayout.astro` (layout — surgical 1-word fix in prop default)

**Analog:** none needed — 1-token rename in `description` prop default on line 15.

**Current state** (BaseLayout.astro:15):
```astro
const { title, description = 'Viktor Vedmich — Senior Solutions Architect @ AWS, CNCF Kubernaut, Author, Speaker', locale, path = '' } = Astro.props;
```

**Target state:**
```astro
const { title, description = 'Viktor Vedmich — Senior Solutions Architect @ AWS, CNCF Kubestronaut, Author, Speaker', locale, path = '' } = Astro.props;
```

**Diff intent:** Correct the default `description` prop string — `CNCF Kubernaut` → `CNCF Kubestronaut`. This string is consumed by `<meta name="description">` (line 29), `<meta property="og:description">` (line 45), and `<meta name="twitter:description">` (line 54) for any page that does not pass an explicit `description` prop.

**Risk/landmine:**
1. **Per-page overrides:** Grep `description=` in `src/pages/` — if any page passes its own `description` prop override, this default does not apply to that page. Phase 4 does not touch per-page overrides; the homepage (`src/pages/en/index.astro` and `src/pages/ru/index.astro`) may or may not override — verify.
2. **Em-dash `—` (U+2014):** Keep verbatim. Do not accidentally rewrite as `-` or `--`.
3. **Cross-locale impact:** BaseLayout.astro is locale-agnostic; this default applies to both EN and RU. Acceptable because the description is English for both meta surfaces (standard practice for international tech sites).

---

### `src/styles/design-tokens.css` (config — APPEND 1 new gradient token)

**Analog:** `src/styles/design-tokens.css` §119-123 ("basic gradients") + §125-139 ("Complex / layered gradients"). The `--grad-subtle-dark` token on line 122 is visually adjacent (same `linear-gradient(160deg, ...)` shape) but uses hardcoded hex, making it unfit as a direct swap target.

**Why this analog:** `--grad-subtle-dark: linear-gradient(160deg, #0F172A, #134E4A);` is the closest existing gradient by direction (160deg) and color endpoints (same as `var(--bg-base)` and `var(--brand-primary-soft)` byte-for-byte). The new `--grad-hero-flat` is functionally `--grad-subtle-dark` with token references instead of literals, living in a Hero-specific namespace. Per CONTEXT.md D-12 and RESEARCH.md Example 1, add alongside (do NOT replace `--grad-subtle-dark`) to avoid breaking any latent consumer.

**Existing gradient declaration pattern** (lines 122, 135-139 — shape to copy):
```css
/* Basic gradients */
--grad-subtle-dark: linear-gradient(160deg, #0F172A, #134E4A);

/* Complex / layered gradients */
--grad-hero-soft:
    radial-gradient(ellipse 90% 80% at 12% 10%, rgba(20,184,166,0.18), transparent 92%),
    radial-gradient(ellipse 80% 70% at 88% 15%, rgba(245,158,11,0.06), transparent 92%),
    radial-gradient(ellipse 95% 85% at 78% 95%, rgba(13,148,136,0.22), transparent 95%),
    linear-gradient(160deg, #0B1220 0%, #0E1A2C 100%);
```

**Target state** — append at the end of the "Complex / layered gradients" block (after line 139, before `--grad-aurora` on line 141), OR adjacent to `--grad-hero-soft` for visual grouping:
```css
/* Flat hero gradient — reference-matched (Phase 4 D-12), no radial blobs. Pair with .noise-overlay. */
--grad-hero-flat: linear-gradient(160deg, var(--bg-base), var(--brand-primary-soft));
```

**Diff intent:** Add one new CSS variable. Single line + comment. Does not remove or mutate any existing gradient. Token references (`var(--bg-base)`, `var(--brand-primary-soft)`) instead of literal hex — per CLAUDE.md §Deep Signal Design System hygiene rule ("Never add hardcoded hex to components — always reference a token").

**Risk/landmine:**
1. **Placement inside correct section:** The file has two gradient sections — "Gradients (basic)" (119-123) and "Complex / layered gradients" (125-178). `--grad-hero-flat` is semantically basic (single stop) but hero-specific. Recommend placement at end of "Complex / layered gradients" block (after line 139, adjacent to `--grad-hero-soft`) for discoverability. Matches RESEARCH.md §Example 1 suggestion.
2. **Token values must exist:** `--bg-base` and `--brand-primary-soft` are declared earlier in the same `:root` block (verify lines). They do. This is why the new token works — cascade order is `basic vars → gradients → complex gradients`.
3. **`.light` override (line 260+):** The file has a `.light` class override section (lines 237-275 per grep). `--grad-hero-flat` is NOT re-declared under `.light`. That is fine: the CSS variables it references (`--bg-base`, `--brand-primary-soft`) DO have `.light` overrides, so the gradient auto-inverts under `.light` class. Matches project convention for other gradient vars.
4. **Do NOT replace `--grad-subtle-dark`:** Even though it's visually identical, it may have silent consumers (grep first, but recommend keeping both as safety).

---

### `src/styles/global.css` (config — DELETE `.typing-cursor` rules post-consumer-removal)

**Analog:** `src/styles/global.css` §109-119 (the rule to delete) + §147-152 (reduced-motion counterpart to delete). This is pure deletion after grep-confirmation.

**Current state** (global.css:109-119 + 150-152 — to DELETE):
```css
/* Typing cursor animation — follows brand primary via shim alias */
@keyframes blink {
  0%, 100% { opacity: 1; }
  50% { opacity: 0; }
}

.typing-cursor::after {
  content: "|";
  animation: blink 1s step-end infinite;
  color: var(--brand-primary-hover);  /* #2DD4BF — AA at small size */
}

...

  .typing-cursor::after {
    animation: none;
  }
```

**Pre-delete grep required** (per D-14 + CONTEXT.md §Claude's Discretion + RESEARCH.md §Example 7 grep output):
```bash
grep -rn '\.typing-cursor' src/ CLAUDE.md 2>&1 | grep -v '^.planning/'
# Expected after Plan 04-02 lands:
#   src/styles/global.css:115  ← to delete
#   src/styles/global.css:150  ← to delete
#   CLAUDE.md:* ← doc mentions (leave alone)
# NO src/components/**.astro hits.
```

Expected grep after Plan 04-02: zero `.typing-cursor` consumers in `src/components/`.

**Target state:** Lines 109-119 removed; lines 150-152 inside `@media (prefers-reduced-motion: reduce)` removed. The `@keyframes blink` rule has two options per CONTEXT.md D-14 Claude's Discretion:

- **Option A (RECOMMENDED per Claude's Discretion and research Open Question 1):** Delete `@keyframes blink` from global.css entirely; add it inline to Hero.astro `<style>` (scoped per-component). Matches the project "local until second consumer" convention.
- **Option B:** Keep `@keyframes blink` in global.css, reference by name from Hero's `<style>` via `animation: blink 1s step-end infinite;`. One keyframe source; slightly less scoped.

**Diff intent:** Remove three CSS blocks (`@keyframes blink`, `.typing-cursor::after`, reduced-motion override) from global.css. Verified via grep that no remaining consumer exists. `@keyframes blink` either moves inline to Hero.astro (Option A) or stays put (Option B).

**Risk/landmine:**
1. **Grep verification MUST precede delete (D-14 pre-condition):** If ANY `.typing-cursor` consumer remains outside Hero.astro + .planning docs, halt and investigate. Per RESEARCH.md §Example 7 grep confirmation (2026-04-19), zero non-Hero consumers exist.
2. **Option A vs Option B keyframe placement:** Option A (inline in Hero) is preferred per project convention. Option B risks leaving a dead keyframe in global.css if Hero's `.cursor-blink` is later removed. Recommend Option A; document choice in Plan 04-02 SUMMARY.
3. **Reduced-motion block structure (lines 140-153):** The `@media (prefers-reduced-motion: reduce)` block contains OTHER rules beyond `.typing-cursor` (scroll-behavior, animate-on-scroll). Only remove the `.typing-cursor::after { animation: none; }` child rule (150-152); leave the media query wrapper intact. For Option A inline cursor-blink in Hero, consider adding a reduced-motion override in Hero's `<style>` too: `@media (prefers-reduced-motion: reduce) { .cursor-blink { animation: none; } }`.

---

### `CLAUDE.md` (doc — surgical 1-word fix)

**Analog:** none needed — 1-word edit in doc.

**Current state** (CLAUDE.md §"Homepage Sections" #2):
```markdown
2. **About** — bio, skill pills, certifications (CNCF Kubernaut + all 5 K8s certs)
```

**Target state:**
```markdown
2. **About** — bio, skill pills, certifications (CNCF Kubestronaut + all 5 K8s certs)
```

**Diff intent:** Single-word fix: `Kubernaut` → `Kubestronaut` in §Homepage Sections. Part of D-04 atomic rename commit.

**Risk/landmine:**
1. **Case sensitivity:** Both `Kubernaut` AND `Kubestronaut` are PascalCase proper nouns. Grep must be case-sensitive. `grep -n 'Kubernaut' CLAUDE.md` should return exactly 1 line (the target) before the fix, 0 after.
2. **Do NOT touch `.planning/` references to historical "Kubernaut" mentions** — those capture the pre-fix state and are part of the audit trail.

---

## Shared Patterns

### Pattern A: Monolithic `.astro` component with i18n frontmatter

**Source:** `src/components/About.astro` (canonical Phase 3 pattern, 39 lines).

**Apply to:** `src/components/Hero.astro` (full rewrite).

**Pattern excerpt** (About.astro:1-11):
```astro
---
import { t, type Locale } from '../i18n/utils';
import { skills } from '../data/social';

interface Props {
  locale: Locale;
}

const { locale } = Astro.props;
const i = t(locale);
---
```

Convention: keep the component monolithic (no `<Pill>` sub-component extraction — reference 4 Hero pills have distinct href/aria/variant patterns, inline is clearer, matches Phase 3 About decision).

### Pattern B: Three-key i18n split with `<span>` accent (no `set:html`, no HTML in JSON)

**Source:** `src/components/About.astro:19-21` + `src/i18n/en.json:30-36` + `src/i18n/ru.json:30-36`.

**Apply to:** Hero tagline split (04-01 JSON mutation + 04-02 Hero.astro render).

**Pattern excerpt** (About.astro:20):
```astro
{i.about.bio_before}<span class="text-brand-primary">{i.about.bio_accent}</span>{i.about.bio_after}
```

Invariants:
- `*_before` ends with a trailing space (load-bearing).
- `*_accent` is the SAME string across locales when it's a term-of-art or brand (per Phase 3 D-07 book-title rule + Phase 4 D-15 `AI Engineer` rule).
- `*_after` carries any trailing punctuation (period for bio; empty reserve for tagline).
- Accent color differs by context: `text-brand-primary` for About bio (teal for book title), `text-text-primary` for Hero tagline (high-contrast white for "AI Engineer").

### Pattern C: Deep Signal tokens, zero hardcoded hex

**Source:** `CLAUDE.md §Deep Signal Design System` + `src/components/About.astro` (zero-hex proof).

**Apply to:** All Phase 4 files (Hero.astro, Header.astro observer CSS, design-tokens.css new token).

**Rule:** `grep -E '#[0-9A-Fa-f]{3,6}' src/components/Hero.astro src/components/Header.astro` returns zero matches. CSS variables may use hex in `design-tokens.css` (canonical source); component files may not.

**Forbidden hex (CLAUDE.md §Anti-Patterns):** `#06B6D4`, `#22D3EE`, `#7C3AED`, `#10B981`, `#FF9900`, `#232F3E`, `#000`, `#FFF`. Phase 4 does not introduce any.

### Pattern D: Inline `<script>` + `<style>` blocks per Astro 5 component semantics

**Source:** `src/layouts/BaseLayout.astro:63-88` (observer) + `src/components/Header.astro:129-173` (menu/scroll/search handlers).

**Apply to:** Header.astro append (nav-active observer + `.is-active` CSS).

**Convention:**
- Astro 5 renders inline `<script>` (no `is:inline`) tags in-place where authored (not hoisted to `<head>`). Place at end-of-file for safe DOM parse order.
- Multiple `<script>` blocks per file are fine; Astro processes each independently.
- `<style>` blocks in `.astro` files are scoped by default (to `.astro-cid-*`). For selectors like `header a.is-active` that match DOM nodes rendered by the SAME component, scoped styles apply correctly.

### Pattern E: Bilingual parity with English verbatim for terms-of-art

**Source:** Plan `03-01-i18n-keys-PLAN.md` Task 2 §rules (RU `bio_accent` = EN `bio_accent` = `«Cracking the Kubernetes Interview»`).

**Apply to:** `src/i18n/{en,ru}.json` Phase 4 mutations.

**Rules:**
- Every key added to en.json MUST be added to ru.json in the same plan.
- Values in `_accent` positions are locale-invariant when they represent brand, credential, or technical term-of-art (`AI Engineer`, `«Cracking the Kubernetes Interview»`, `CNCF Kubestronaut`).
- Values in `_before`/`_after` positions are translated per locale with trailing-space / punctuation conventions preserved.

### Pattern F: Atomic commit per phase, single push to main

**Source:** `CLAUDE.md §Publishing Workflow` + Phase 3 execution history (one commit closed Phase 3).

**Apply to:** Phase 4 final commit across all 7 files (Hero, Header, social.ts, en.json, ru.json, BaseLayout, design-tokens.css, global.css, CLAUDE.md).

**Plan sequencing** (RESEARCH.md §Primary Recommendation):
- Wave 1: Plan 04-01 — i18n mutations (both en.json + ru.json, covers hero.tagline split AND about.bio_before Kubestronaut fix).
- Wave 2: Plan 04-02 — Hero.astro full rewrite + design-tokens.css new token + global.css typing-cursor cleanup.
- Wave 2: Plan 04-03 — cross-file Kubestronaut rename (social.ts + BaseLayout.astro + CLAUDE.md) + Header.astro nav-active observer + optional scroll-margin-top global.

Single atomic commit at phase end after all plans + user visual verify.

## No Analog Found

None. Every file has a usable analog (either an exact pattern from Phase 3 or a surgical self-edit with a clear diff intent).

## Metadata

**Analog search scope:**
- `src/components/` (Header.astro, About.astro, Hero.astro current, BaseLayout.astro)
- `src/layouts/` (BaseLayout.astro)
- `src/data/` (social.ts)
- `src/i18n/` (en.json, ru.json)
- `src/styles/` (global.css, design-tokens.css)
- `.planning/phases/03-section-order-about/` (CONTEXT, 01-PLAN, 03-PLAN, SUMMARY — Phase 3 canonical reference)

**Files scanned:** 12 source files + 4 Phase 3 artifacts = 16 total.

**Key patterns identified:**
1. Monolithic `.astro` with `t(locale)` frontmatter (Pattern A) — universal across `src/components/`.
2. Three-key i18n split with inline `<span>` accent (Pattern B) — established Phase 3, reusable for any headline/body accent.
3. Deep Signal token-only rule (Pattern C) — enforced by `grep -E '#[0-9A-Fa-f]{3,6}'` zero-match check.
4. Inline `<script>` IntersectionObserver (Pattern D) — one canonical observer exists in BaseLayout.astro; Phase 4 adds a second in Header.astro with different semantics.
5. Bilingual-parity JSON mutation with term-of-art English-verbatim (Pattern E) — established Phase 3 for book titles; Phase 4 extends to "AI Engineer" and "CNCF Kubestronaut".
6. Atomic-commit-per-phase publishing workflow (Pattern F) — project convention; Phase 4 follows suit.

**Pattern extraction date:** 2026-04-19
**Consumed by:** `/gsd-plan-phase 4` → planner → `04-01-*-PLAN.md`, `04-02-*-PLAN.md`, `04-03-*-PLAN.md`.

---

*Phase: 04-hero-reference-match*
*Patterns mapped: 2026-04-19*
