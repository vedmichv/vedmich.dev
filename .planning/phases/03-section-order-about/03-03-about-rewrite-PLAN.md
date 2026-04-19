---
phase: 03-section-order-about
plan: 03
type: execute
wave: 2
depends_on:
  - 03-01
files_modified:
  - src/components/About.astro
autonomous: false
requirements:
  - REQ-008
objective: >-
  Full rewrite of `src/components/About.astro` to match the reference `About`
  component (`app.jsx:400-421`): 2-column grid (`1.4fr 1fr` above md), bio
  paragraph left with the book title `«Cracking the Kubernetes Interview»`
  wrapped in a teal accent span, `Expertise` overline + skill pills right,
  certifications block removed entirely (duplicate of Hero cert bar). Implements
  REQ-008 and resolves decisions D-01..D-08 from CONTEXT.md in component form.

must_haves:
  truths:
    - About section renders a two-column grid (1.4fr / 1fr ratio) at md+ breakpoint, stacked single-column below md.
    - Bio paragraph is left column, with the book title visually distinguished (teal accent color).
    - Right column shows an `Expertise` overline (uppercase, small, text-text-secondary) above a flex-wrap row of skill pills.
    - No certification cards appear in the About section.
    - No `CNCF Kubernaut = all 5 Kubernetes certifications` callout appears in the About section.
    - Each skill pill uses the reference `Pill` style — rounded-full, bg-surface, border-border, text-text-primary, text-[13px], px-3.5 py-1.5 — with no hover effect.
    - Both EN and RU render without errors (typed `i.about.bio_before / bio_accent / bio_after / skills_title / title` access all resolve).
    - `npm run build` exits 0 after this plan; all previous pages still build.
    - No hardcoded hex colors in About.astro (grep `#[0-9A-Fa-f]{3,6}` returns no matches).
    - `certifications` import is removed from the component frontmatter (Hero still imports it from social.ts).
  artifacts:
    - path: src/components/About.astro
      provides: Rewritten About component with grid + bio + overline + pills layout
      min_lines: 20
      contains: 'md:grid-cols-[1.4fr_1fr]'
      exports: ['default component']
  key_links:
    - from: src/components/About.astro
      to: src/i18n/en.json / ru.json (via t(locale))
      via: typed i.about.bio_before / bio_accent / bio_after / skills_title / title access
      pattern: 'i\.about\.(bio_before|bio_accent|bio_after|skills_title|title)'
    - from: src/components/About.astro
      to: src/data/social.ts
      via: `import { skills } from '../data/social'` (named import, no `certifications`)
      pattern: "import \\{ skills \\} from '\\.\\./data/social'"
    - from: Tailwind @theme utilities
      to: design-tokens.css CSS vars
      via: text-brand-primary → --brand-primary, bg-surface → --bg-surface, border-border → --border, text-text-primary → --text-primary, text-text-secondary → --text-secondary
      pattern: 'text-brand-primary|bg-surface|border-border|text-text-primary|text-text-secondary'
---

<objective>
Replace `src/components/About.astro` with a new component matching the reference
`About` layout (`app.jsx:400-421`):

- `<section id="about" class="py-20">` wrapper (reference: `Section` primitive
  with 80px vertical padding, `app.jsx:102`).
- `<h2>` title (`i.about.title`) at `font-display text-3xl font-bold mb-12
  animate-on-scroll`.
- 2-col grid: `md:grid-cols-[1.4fr_1fr] gap-10 items-start` (40px gap per
  reference `gap: 40`, `app.jsx:403`).
- Left column: single `<p>` with bio text composed as `i.about.bio_before +
  <span class="text-brand-primary">{i.about.bio_accent}</span> +
  i.about.bio_after`. Para classes: `font-body text-lg leading-relaxed
  text-text-primary`. Wrap in `animate-on-scroll` for site-wide scroll fade
  parity.
- Right column: `animate-on-scroll` div containing:
  - Overline: `<div class="font-body text-[11px] font-semibold uppercase
    tracking-[0.08em] text-text-secondary mb-3">{i.about.skills_title}</div>`.
  - Pills wrapper: `<div class="flex flex-wrap gap-2">`.
  - Each pill: `<span class="inline-flex items-center rounded-full px-3.5 py-1.5
    text-[13px] font-medium bg-surface border border-border text-text-primary"
    >{skill}</span>` — exactly matching reference `Pill` default variant
    (`app.jsx:116-123`), no hover.
- Certifications block (cert cards + CNCF Kubernaut callout) REMOVED ENTIRELY.
- `certifications` import REMOVED from the frontmatter.
- Section spacing: `py-20` only (NOT `py-20 sm:py-28`) per D-08.

Purpose: Close REQ-008 (drop duplicate cert cards) and land D-01..D-08 in
component form. The cert bar in Hero already provides the 6 certification
badges, so About no longer duplicates them.

Output: Rewritten `src/components/About.astro` (full file replacement), no new
files, no new i18n keys (Plan 03-01 already landed them in Wave 1).
</objective>

<execution_context>
@$HOME/.claude/get-shit-done/workflows/execute-plan.md
@$HOME/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@.planning/phases/03-section-order-about/03-CONTEXT.md
@.planning/phases/03-section-order-about/03-01-SUMMARY.md

<interfaces>
<!-- i18n keys available AFTER Plan 03-01 lands (confirmed in 03-01 SUMMARY). -->

Typed access via `const i = t(locale);`:
- `i.about.title` — "About Me" (EN) / "Обо мне" (RU)
- `i.about.bio_before` — text before the book title, ends with a trailing space
- `i.about.bio_accent` — `«Cracking the Kubernetes Interview»` (SAME string in both locales, per D-07)
- `i.about.bio_after` — `.` (the trailing period)
- `i.about.skills_title` — "Expertise" (EN) / "Экспертиза" (RU)
- `i.about.certs_title` — REMOVED by 03-01; DO NOT reference.
- `i.about.bio` — REMOVED by 03-01; DO NOT reference.

<!-- Existing `skills` export from src/data/social.ts (unchanged by this phase) -->
```ts
export const skills = [
  'AI Engineering',
  'Distributed Systems',
  'Kubernetes',
  'AWS Cloud',
  'Platform Engineering',
  'API Design',
  'Observability',
  'GenAI / LLM',
  'Terraform',
  'Python',
  'Cost Optimization',
] as const;
```

<!-- Tailwind utilities resolved via src/styles/global.css @theme block -->
- `text-brand-primary` → `--brand-primary` (#14B8A6, teal)
- `bg-surface` → `--bg-surface` (#1E293B)
- `border-border` → `--border` (#334155)
- `text-text-primary` → `--text-primary` (#E2E8F0)
- `text-text-secondary` → `--text-secondary` (#94A3B8)

<!-- Reference About component (app.jsx:400-421) -->
```jsx
const About = () => (
  <Section id="about" title="About me">
    <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 40, alignItems: 'start' }}>
      <p style={{ fontFamily: VV.fontBody, fontSize: 18, lineHeight: 1.7, color: VV.text, margin: 0 }}>
        Solutions Architect and AI Engineer with 15+ years designing and evolving distributed systems at scale.
        Currently at AWS, owning end-to-end architecture for enterprise clients across hybrid cloud,
        Kubernetes, and GenAI / agentic platforms. CNCF Kubernaut and author of
        <span style={{ color: VV.teal }}> "Cracking the Kubernetes Interview"</span>.
      </p>
      <div>
        <div className="overline" style={{ fontFamily: VV.fontBody, fontSize: 11, fontWeight: 600,
          color: VV.mute, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 12 }}>
          Expertise
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {skills.map(s => <Pill key={s}>{s}</Pill>)}
        </div>
      </div>
    </div>
  </Section>
);
```

<!-- Reference Pill primitive (app.jsx:116-123) default variant -->
```jsx
const Pill = ({ children, variant = 'default' }) => {
  const st = { default: { bg: VV.surface, fg: VV.text, bd: VV.border } }[variant];
  return <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6,
    padding: '6px 14px', borderRadius: 9999, fontSize: 13, fontWeight: 500,
    fontFamily: VV.fontBody, background: st.bg, color: st.fg, border: `1px solid ${st.bd}` }}>{children}</span>;
};
```
Translation: `inline-flex items-center rounded-full px-3.5 py-1.5 text-[13px] font-medium bg-surface border border-border text-text-primary`.
(`px-3.5 py-1.5` = `14px 6px` — matches reference `padding: '6px 14px'`.)

<!-- Section primitive padding (app.jsx:102) -->
`padding: '80px 24px'` → `py-20 px-6` in Tailwind; project's About wrapper uses
`py-20` on the `<section>` and `max-w-6xl mx-auto px-4 sm:px-6` on the inner
div, which is equivalent in outcome.
</interfaces>
</context>

<tasks>

<task type="auto" tdd="false">
  <name>Task 1: Full rewrite of About.astro — grid + bio + overline + pills, drop cert block</name>
  <files>src/components/About.astro</files>
  <read_first>
    - src/components/About.astro (CURRENT state — read in full so you know what you are replacing, especially the existing cert block JSX, the `certifications` import, and the current `i.about.bio` / `i.about.certs_title` references)
    - .planning/phases/03-section-order-about/03-CONTEXT.md (D-01..D-08 — the full decision set this rewrite implements)
    - .planning/phases/03-section-order-about/03-01-SUMMARY.md (confirmation that bio_before/bio_accent/bio_after keys are live and certs_title is removed — required for TypeScript typed access to succeed)
    - /Users/viktor/.claude/skills/viktor-vedmich-design/ui_kits/vedmich-dev/app.jsx (lines 400-421 for About, lines 116-123 for Pill, lines 100-114 for Section primitive)
    - src/data/social.ts (confirm `skills` is still exported as `readonly string[]` — no data change needed)
    - src/i18n/en.json and src/i18n/ru.json (spot check that bio_before ends with a trailing space and bio_after is just `.`, per 03-01 spec)
    - src/styles/design-tokens.css (confirm the tokens exist: `--brand-primary`, `--text-primary`, `--text-secondary`, `--bg-surface`, `--border`)
    - src/styles/global.css (confirm `@theme` maps `text-brand-primary`, `bg-surface`, `border-border`, `text-text-primary`, `text-text-secondary` — visual spot check)
  </read_first>
  <action>
    Replace the ENTIRE contents of `src/components/About.astro` with exactly this file content (no additions, no omissions — this is the full file):

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

    <section id="about" class="py-20">
      <div class="max-w-6xl mx-auto px-4 sm:px-6">
        <h2 class="font-display text-3xl font-bold mb-12 animate-on-scroll">{i.about.title}</h2>

        <div class="grid md:grid-cols-[1.4fr_1fr] gap-10 items-start">
          <!-- Bio (left) -->
          <p class="font-body text-lg leading-relaxed text-text-primary animate-on-scroll">
            {i.about.bio_before}<span class="text-brand-primary">{i.about.bio_accent}</span>{i.about.bio_after}
          </p>

          <!-- Expertise (right) -->
          <div class="animate-on-scroll">
            <div class="font-body text-[11px] font-semibold uppercase tracking-[0.08em] text-text-secondary mb-3">
              {i.about.skills_title}
            </div>
            <div class="flex flex-wrap gap-2">
              {skills.map((skill) => (
                <span class="inline-flex items-center rounded-full px-3.5 py-1.5 text-[13px] font-medium bg-surface border border-border text-text-primary">
                  {skill}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
    ```

    Rules (mandatory):
    - `import { skills } from '../data/social';` — NO `certifications` in the import (the entire cert block is gone).
    - The bio `<p>` expression MUST be `{i.about.bio_before}<span class="text-brand-primary">{i.about.bio_accent}</span>{i.about.bio_after}`. No `set:html`, no template-literal string concat. Astro renders children of `<p>` including Astro expressions and nested elements inline — exactly what we need.
    - The bio paragraph must have NO margin-bottom (`mb-8` or similar) because there's nothing below it in the left column now. Keep it at Astro's default margin (it's a direct child of the grid cell).
    - Section spacing is `py-20` ONLY — NOT `py-20 sm:py-28`. Per D-08, drop the `sm:py-28` bump.
    - The grid uses an arbitrary value `md:grid-cols-[1.4fr_1fr]` — this is valid Tailwind 4 syntax. At breakpoints below `md` (< 768px), the grid collapses to a single column (default grid behavior with one explicit column definition), stacking bio on top of overline+pills in natural DOM order. That's the desired mobile behavior per D-06.
    - Overline text is `text-[11px] font-semibold uppercase tracking-[0.08em] text-text-secondary` — arbitrary pixel value because 11px is smaller than Tailwind's `text-xs` (12px); explicit and matches reference exactly.
    - Pills use `text-[13px]` (arbitrary — reference 13px, between Tailwind `text-xs` 12 and `text-sm` 14). `px-3.5` = 14px horizontal; `py-1.5` = 6px vertical. Matches reference `padding: '6px 14px'` exactly.
    - NO hover effect on pills. The old `hover:border-accent/50 hover:text-text transition-colors` classes are DROPPED per D-02.
    - NO hardcoded hex codes anywhere in the file — use utility tokens only.
    - Do NOT add extra wrapper divs, data attributes, aria labels beyond what's shown. Keep the markup minimal.
    - The file MUST end with a trailing newline (standard POSIX).

    After writing, verify the file by running `grep -qv 'certifications' src/components/About.astro` (should exit 0 — no stray references). If the build fails, diagnose from the Astro error message — typed access to `i.about.bio_before` will fail only if 03-01 hasn't landed, which is a depends_on violation.
  </action>
  <verify>
    <automated>node -e "const fs=require('fs'); const s=fs.readFileSync('src/components/About.astro','utf8'); const checks=[[/import \{ skills \} from '\.\.\/data\/social'/,'skills import'],[/md:grid-cols-\[1\.4fr_1fr\]/,'grid template'],[/gap-10/, 'gap-10'],[/items-start/, 'items-start'],[/text-brand-primary/,'teal accent class'],[/i\.about\.bio_before/, 'bio_before ref'],[/i\.about\.bio_accent/, 'bio_accent ref'],[/i\.about\.bio_after/, 'bio_after ref'],[/i\.about\.skills_title/, 'skills_title ref'],[/i\.about\.title/, 'title ref'],[/font-body text-\[11px\] font-semibold uppercase tracking-\[0\.08em\] text-text-secondary mb-3/, 'overline classes'],[/inline-flex items-center rounded-full px-3\.5 py-1\.5 text-\[13px\] font-medium bg-surface border border-border text-text-primary/, 'pill classes'],[/py-20\"/, 'section py-20'],[/skills\.map/, 'skills.map loop']]; for(const [re,name] of checks){ if(!re.test(s)){console.error('MISSING:',name);process.exit(1);} } const forbidden=[[/certifications/, 'certifications reference'],[/certs_title/, 'certs_title reference'],[/CNCF Kubernaut = all/, 'CNCF callout'],[/sm:py-28/, 'sm:py-28 class'],[/i\.about\.bio[^_]/, 'old i.about.bio reference (non-underscore)'],[/hover:border-accent/, 'hover on pill'],[/#[0-9A-Fa-f]{3,6}/, 'hardcoded hex']]; for(const [re,name] of forbidden){ if(re.test(s)){console.error('FORBIDDEN present:',name);process.exit(2);} } console.log('OK');"</automated>
  </verify>
  <acceptance_criteria>
    Presence checks (must be present):
    - `grep -q "import { skills } from '../data/social'" src/components/About.astro` exits 0.
    - `grep -q 'md:grid-cols-\[1\.4fr_1fr\]' src/components/About.astro` exits 0.
    - `grep -q 'gap-10' src/components/About.astro` exits 0.
    - `grep -q 'items-start' src/components/About.astro` exits 0.
    - `grep -q 'text-brand-primary' src/components/About.astro` exits 0.
    - `grep -q 'i.about.bio_before' src/components/About.astro` exits 0.
    - `grep -q 'i.about.bio_accent' src/components/About.astro` exits 0.
    - `grep -q 'i.about.bio_after' src/components/About.astro` exits 0.
    - `grep -q 'i.about.skills_title' src/components/About.astro` exits 0.
    - `grep -q 'i.about.title' src/components/About.astro` exits 0.
    - `grep -q 'text-\[11px\] font-semibold uppercase tracking-\[0.08em\] text-text-secondary' src/components/About.astro` exits 0.
    - `grep -q 'rounded-full px-3.5 py-1.5 text-\[13px\] font-medium bg-surface border border-border text-text-primary' src/components/About.astro` exits 0.
    - `grep -q 'class="py-20"' src/components/About.astro` exits 0 (section class exactly `py-20` with no `sm:` bump).
    - `grep -q 'skills.map' src/components/About.astro` exits 0.
    - `grep -q 'text-lg leading-relaxed text-text-primary' src/components/About.astro` exits 0 (bio paragraph uses text-text-primary, not the old text-text-muted).
    - `grep -q 'animate-on-scroll' src/components/About.astro` exits 0 (scroll animation preserved on headings + columns per Claude's Discretion note in D §Claude's Discretion).

    Absence checks (must NOT be present):
    - `grep -q 'certifications' src/components/About.astro` exits 1 (no import, no reference).
    - `grep -q 'certs_title' src/components/About.astro` exits 1 (old key gone).
    - `grep -q 'CNCF Kubernaut = all' src/components/About.astro` exits 1 (callout gone).
    - `grep -q 'sm:py-28' src/components/About.astro` exits 1 (spacing bump dropped).
    - `grep -E 'i\.about\.bio[^_]' src/components/About.astro` returns nothing (no reference to old `i.about.bio` key — only the three new split keys).
    - `grep -q 'hover:border-accent' src/components/About.astro` exits 1 (pill hover effect removed).
    - `grep -q 'bg-warm' src/components/About.astro` exits 1 (warm/amber callout gone with cert block).
    - `grep -q 'grid md:grid-cols-2' src/components/About.astro` exits 1 (old 2-col template replaced by 1.4fr/1fr template).
    - `grep -E '#[0-9A-Fa-f]{3,6}' src/components/About.astro` returns nothing (no hardcoded hex).
    - `grep -q 'rounded-lg text-sm bg-surface' src/components/About.astro` exits 1 (old pill classes gone).
    - `grep -q '<svg' src/components/About.astro` exits 1 (no SVG — the old cert checkmark SVG is gone).
  </acceptance_criteria>
  <done>`About.astro` contains only the grid+bio+overline+pills markup; cert block and its amber callout are gone; `certifications` import removed; bio uses the three i18n keys with teal `<span>` around the accent; no hover on pills; no hardcoded colors.</done>
</task>

<task type="auto">
  <name>Task 2: Phase build + visual gate — Astro build passes, output verified</name>
  <files></files>
  <read_first>
    - src/components/About.astro (should be the rewritten version after Task 1)
    - src/pages/en/index.astro (should have new section order after Plan 03-02 landed in Wave 1)
    - src/pages/ru/index.astro (same)
    - src/components/Header.astro (should have new nav order after Plan 03-02 landed)
  </read_first>
  <action>
    Run `npm run build` from the repo root. The build MUST exit 0.

    Then, without committing, do the following DOM-level checks on the built HTML:

    1. EN rendered bio contains the teal accent span:
       `grep -E '<span class="[^"]*text-brand-primary[^"]*">«Cracking the Kubernetes Interview»</span>' dist/en/index.html`
       → exits 0 with a match.
    2. RU rendered bio contains the same accent span with the same book title (per D-07):
       `grep -E '<span class="[^"]*text-brand-primary[^"]*">«Cracking the Kubernetes Interview»</span>' dist/ru/index.html`
       → exits 0 with a match.
    3. No certification cards remain in the About block in either built page:
       `grep -A 100 '<section id="about"' dist/en/index.html | grep -B1 -A1 '</section>' | grep -i 'kubernaut\|CKA\|CKS\|CKAD\|KCNA\|KCSA'` → should only match the bio paragraph's "CNCF Kubernaut" inline text (which IS expected in the bio, NOT in cert cards). Count of matches should be 1 (bio mention), NOT 6 (cards). A simple check: `dist/en/index.html` should NOT contain the cert checkmark SVG path inside the about section. Easier assertion: `awk '/<section id="about"/{p=1} /<section id="podcasts"/{p=0} p' dist/en/index.html | grep -c 'rounded-lg bg-accent'` → 0.
    4. Section order in the DOM: `<section id="book"` appears before `<section id="speaking"` in both EN and RU built HTML (already validated in Plan 03-02, re-confirm here).
    5. Pill DOM sanity: EN built page has at least 11 `<span class="inline-flex items-center rounded-full` entries (one per skill in `src/data/social.ts:skills`). `awk '/<section id="about"/{p=1} /<section id="podcasts"/{p=0} p' dist/en/index.html | grep -c 'inline-flex items-center rounded-full px-3.5 py-1.5 text-\[13px\]'` → >= 11.

    If any check fails, diagnose and fix Task 1; do not proceed to the phase commit.

    After all checks pass, STOP. Do NOT run `git commit` from within the plan — the atomic phase commit happens via the orchestrator / execute-phase step after all three plans complete and the user approves visual verification on live (per CLAUDE.md §Publishing Workflow: push to main after manual sign-off).
  </action>
  <verify>
    <automated>npm run build 2>&1 | tail -15 > /tmp/gsd-03-03-build.log; if [ ${PIPESTATUS[0]} -ne 0 ]; then cat /tmp/gsd-03-03-build.log; exit 1; fi; grep -q '<span class="[^"]*text-brand-primary[^"]*">«Cracking the Kubernetes Interview»</span>' dist/en/index.html || { echo "EN accent span missing"; exit 2; }; grep -q '<span class="[^"]*text-brand-primary[^"]*">«Cracking the Kubernetes Interview»</span>' dist/ru/index.html || { echo "RU accent span missing"; exit 3; }; awk '/<section id=\"about\"/{p=1} /<section id=\"podcasts\"/{p=0} p' dist/en/index.html | grep -q 'rounded-lg bg-accent' && { echo "Cert cards still in About"; exit 4; }; pills=$(awk '/<section id=\"about\"/{p=1} /<section id=\"podcasts\"/{p=0} p' dist/en/index.html | grep -c 'inline-flex items-center rounded-full'); if [ "$pills" -lt 11 ]; then echo "Not enough pills: $pills"; exit 5; fi; book_pos=$(grep -b '<section id="book"' dist/en/index.html | head -1 | cut -d: -f1); spk_pos=$(grep -b '<section id="speaking"' dist/en/index.html | head -1 | cut -d: -f1); if [ -z "$book_pos" ] || [ -z "$spk_pos" ] || [ "$book_pos" -ge "$spk_pos" ]; then echo "Book not before Speaking in EN: book=$book_pos spk=$spk_pos"; exit 6; fi; echo "ALL OK"</automated>
  </verify>
  <acceptance_criteria>
    - `npm run build` exits 0.
    - `dist/en/index.html` and `dist/ru/index.html` both exist.
    - Each built locale HTML contains the teal accent span wrapping `«Cracking the Kubernetes Interview»`.
    - The built About section contains NO cert card markup (no `rounded-lg bg-accent/10` or cert checkmark SVG inside the section).
    - The built About section contains >= 11 skill pills with the exact class string.
    - `<section id="book"` byte offset < `<section id="speaking"` byte offset in both built locale HTML files.
    - No console errors or warnings from the Astro build that reference About.astro or the i18n JSON files.
  </acceptance_criteria>
  <done>Build passes; both locales render the About with grid+bio-with-teal-accent+overline+pills and no cert cards; section order confirmed in built DOM.</done>
</task>

<task type="checkpoint:human-verify" gate="blocking">
  <name>Task 3: User visual gate — confirm About renders correctly on local preview</name>
  <what-built>
    A full rewrite of About.astro matching reference `app.jsx:400-421`: 2-column
    grid (1.4fr/1fr on desktop), bio with teal-highlighted book title on left,
    Expertise overline + skill pills on right, no certification cards, no CNCF
    callout. Section order and nav also updated (Book before Speaking) by Plan
    03-02.

    Files changed across Phase 3:
    - src/i18n/en.json (03-01)
    - src/i18n/ru.json (03-01)
    - src/components/Header.astro (03-02)
    - src/pages/en/index.astro (03-02)
    - src/pages/ru/index.astro (03-02)
    - src/components/About.astro (03-03)
  </what-built>
  <how-to-verify>
    1. Start the dev server if not already running: `npm run dev` (localhost:4321).
    2. Open http://localhost:4321/en/ at viewport 1440px. Scroll to the About section.
       - Expected: Title "About Me" above a two-column grid. Left col has a paragraph ending with `«Cracking the Kubernetes Interview».` where the book title is teal. Right col has an "EXPERTISE" uppercase overline and 11 rounded skill pills (AI Engineering, Distributed Systems, Kubernetes, AWS Cloud, Platform Engineering, API Design, Observability, GenAI / LLM, Terraform, Python, Cost Optimization).
       - NOT expected: any certification card (CKA/CKS/etc), any amber "CNCF Kubernaut = all 5..." callout, any hover color change on the pills.
    3. Scroll further. The order must be: About → Podcasts → **Book** → Speaking → Presentations → Blog → Contact. Book CTA ("Get on Amazon") must appear BEFORE the Speaking timeline.
    4. Open http://localhost:4321/ru/ at the same viewport. Verify the same layout with Russian text in the bio and "ЭКСПЕРТИЗА" overline. The book title in the bio must stay English — `«Cracking the Kubernetes Interview»` in the middle of an otherwise Russian sentence (per D-07).
    5. Narrow the viewport to 375px (mobile). The grid must stack: bio on top, overline+pills below. No horizontal scrollbar should appear. Text should remain readable.
    6. Open the Header nav. The desktop link order must be `About · Podcasts · Book · Speaking · Slides · Blog · Contact` (EN) or equivalent in RU. Click "Book" — it should smooth-scroll to the Book section (below Podcasts, above Speaking).
    7. Open DevTools Console. There should be no errors referencing `bio`, `certs_title`, or `certifications`.

    If any check fails, describe the specific mismatch and the executor will loop back to Task 1 or 2. If all pass, type `approved` to proceed to the phase-level atomic commit + push.
  </how-to-verify>
  <resume-signal>Type "approved" to confirm visual parity with reference, or describe any mismatch (layout, copy, color, order, mobile stacking, console errors).</resume-signal>
</task>

</tasks>

<threat_model>
## Trust Boundaries

No new trust boundary. Changes are static JSX + static skills array from
compile-time imports.

## STRIDE Threat Register

| Threat ID  | Category       | Component           | Disposition | Mitigation Plan                                                     |
|------------|----------------|---------------------|-------------|---------------------------------------------------------------------|
| T-03-05    | Tampering      | About.astro markup  | accept      | Build-time static render; no user input; no data handling.          |
| T-03-06    | Info disclosure | Bio text, skill list | accept     | Public bio + public skills list, intentionally published.           |
| T-03-07    | Denial of service | Skill map render  | accept     | 11 elements compile-time, no loops over user input.                 |

No new attack surface introduced.
</threat_model>

<verification>
Phase-level verification is split across all three plans; Plan 03-03 is the
final gate:

- `npm run build` exits 0 with no warnings referencing About.astro.
- Built `dist/en/index.html` and `dist/ru/index.html` both contain the teal
  accent span around the book title.
- Built About section DOM contains exactly 11 skill pills with the reference
  class string.
- Section order in built HTML: Book before Speaking in both locales.
- Nav order in built HTML: `#about → #podcasts → #book → #speaking → #presentations → #blog → #contact`.
- No hardcoded hex colors in any Phase 3-touched file.
- User visual approval via Task 3 checkpoint before the phase-level atomic
  commit + push.

Post-push verification (outside this plan, on live):
- Wait ~2 min for GitHub Actions to deploy.
- Playwright-cli screenshot https://vedmich.dev/en/ at 1440px and 375px;
  screenshot https://vedmich.dev/ru/ at 1440px and 375px; visually compare to
  `reference-1440-full.png`.
</verification>

<success_criteria>
- About.astro matches reference layout (grid 1.4fr/1fr, bio with teal accent,
  overline + pills, no cert cards).
- Build passes; both locales render correctly; mobile stacks properly.
- Section + nav order matches reference (REQ-009, REQ-010).
- No hardcoded hex, no deprecated shim utilities (per D-05).
- Bilingual parity: both EN and RU render the three-key bio split + shared
  English book title (per D-01, D-07).
</success_criteria>

<output>
After completion, create `.planning/phases/03-section-order-about/03-03-SUMMARY.md` recording:
- Final About.astro line count and file shape (import block, markup block).
- Build result and pages count.
- User checkpoint outcome (approved / changes requested).
- Any minor deviation from the planned Tailwind classes (unlikely, but record if
  any arbitrary-value class was swapped for an equivalent named util).
- A prompt to the orchestrator: "Phase 3 ready for atomic commit + push to main;
  await user `approved` signal on the Task 3 checkpoint before proceeding."
</output>
</content>
</invoke>