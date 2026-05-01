---
phase: 04-hero-reference-match
plan: 02
type: execute
wave: 2
depends_on:
  - 04-01
files_modified:
  - src/styles/design-tokens.css
  - src/components/Hero.astro
  - src/styles/global.css
autonomous: true
requirements:
  - REQ-011
  - REQ-013
  - REQ-014
threat_refs:
  - T-04-01
tags:
  - astro
  - hero
  - tailwind
  - design-tokens
  - a11y
objective: >-
  Full rewrite of `src/components/Hero.astro` to match reference (`app.jsx:357-398`)
  pixel-for-pixel on 1440×900: (1) add new `--grad-hero-flat` design token;
  (2) replace Hero markup with reference-faithful structure — 2-block greeting
  (terminal prompt 14px teal + "Hi, I'm" 16px mute mono), h1 with `clamp(40px,8vw,64px)`
  font-size + `-0.03em` letter-spacing + `1.05` line-height + inline `<span>_</span>`
  cursor, role mono amber 18px, 3-key tagline with `text-text-primary` accent on
  "AI Engineer", 4-pill authority strip (re:Invent speaker, CNCF Kubestronaut
  external-teal with `rel="noopener"`, Author book, Host DKT+AWS RU), 2 CTAs,
  flat 160deg gradient background, inline cursor-blink keyframes; (3) remove
  the now-unused `.typing-cursor` + `@keyframes blink` blocks from global.css
  (grep pre-condition confirmed no other consumer). Implements D-02, D-03,
  D-05 through D-08, D-11 through D-14, D-17, D-18, D-19.

must_haves:
  truths:
    - Hero section on 1440×900 viewport renders with total computed height ≤ 560px (target ~520px, +40px tolerance for pill wrap and content padding per D-19 and REQ-014).
    - h1 computed styles at 1440×900 are fontSize=64px, fontWeight=700, letterSpacing=-1.92px (i.e. -0.03em of 64px), lineHeight=67.2px (1.05 of 64px), fontFamily resolves to Space Grotesk.
    - h1 computed fontSize at 375×667 is 40px (clamp floor hit, scales responsively).
    - Hero `<section>` has classes `pt-24 pb-16 px-6` (96/64/24 reference padding per D-18) — NO `min-h-[90vh]`, NO `flex items-center`, NO `pt-16`.
    - Hero contains exactly 4 `<a>` pills with hrefs `#speaking`, `https://www.cncf.io/training/kubestronaut/`, `#book`, `#podcasts` (per D-02, D-03).
    - The Kubestronaut pill has `target="_blank"`, `rel="noopener"`, and `aria-label="CNCF Kubestronaut program (opens in new tab)"` (per D-05, D-08, T-04-01 mitigation).
    - Kubestronaut pill uses teal-active variant classes `bg-brand-primary-soft border-brand-primary text-brand-primary-hover` + leading dot span (per D-06).
    - All 4 pills have a focus-visible outline (`focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand-primary`) for keyboard accessibility (per D-08).
    - Tagline renders with `{i.hero.tagline_before}<span class="text-text-primary">{i.hero.tagline_accent}</span>{i.hero.tagline_after}` — three-key split, no `set:html`, no HTML in JSON (per D-16).
    - h1 contains inline `<span class="cursor-blink text-brand-primary" aria-hidden="true">_</span>` cursor (not `.typing-cursor` pseudo-element) per D-14.
    - `src/styles/design-tokens.css` contains the new `--grad-hero-flat: linear-gradient(160deg, var(--bg-base), var(--brand-primary-soft));` token (per D-12).
    - Hero's scoped `<style>` block uses `background: var(--grad-hero-flat)` — NOT `var(--grad-hero-soft)` (per D-12 swap).
    - `.typing-cursor::after` block + `@keyframes blink` block + reduced-motion override are REMOVED from `src/styles/global.css` (per D-14 cleanup); `cursor-blink` + `@keyframes blink` are inlined into Hero's scoped `<style>` (Option A per RESEARCH.md §Open Question 1).
    - `certifications` import is REMOVED from Hero.astro frontmatter (per D-02 — Hero no longer maps over the cert array).
    - No hardcoded hex colors appear anywhere in Hero.astro (`grep -E '#[0-9A-Fa-f]{3,6}' src/components/Hero.astro` returns nothing).
    - `npm run build` exits 0 — 7 pages built (both EN and RU render without TypeScript type errors on `i.hero.tagline_*` access, because Plan 04-01 landed in Wave 1).
  artifacts:
    - path: src/styles/design-tokens.css
      provides: New canonical --grad-hero-flat gradient token
      contains: 'grad-hero-flat'
    - path: src/components/Hero.astro
      provides: Full rewritten Hero component matching reference + 4-pill authority strip + clamp h1 + inline cursor
      min_lines: 60
      contains: 'text-[clamp(40px,8vw,64px)]'
      exports: ['default component']
    - path: src/styles/global.css
      provides: Cleaned global CSS — .typing-cursor + @keyframes blink removed
      contains: 'animate-on-scroll'
      excludes: 'typing-cursor'
  key_links:
    - from: src/components/Hero.astro
      to: src/i18n/en.json / ru.json (via t(locale))
      via: typed i.hero.tagline_before / _accent / _after / greeting / name / role / cta / cta_secondary access
      pattern: 'i\.hero\.(tagline_(before|accent|after)|greeting|name|role|cta|cta_secondary)'
    - from: src/components/Hero.astro
      to: src/styles/design-tokens.css
      via: CSS variable var(--grad-hero-flat) referenced in scoped <style>
      pattern: 'var\(--grad-hero-flat\)'
    - from: src/components/Hero.astro
      to: https://www.cncf.io/training/kubestronaut/
      via: Kubestronaut pill href (external link, new tab, noopener)
      pattern: 'href="https://www.cncf.io/training/kubestronaut/"'
    - from: Tailwind @theme utilities
      to: design-tokens.css CSS vars
      via: bg-surface → --bg-surface, border-border → --border, text-text-primary → --text-primary, text-text-secondary → --text-secondary, text-brand-primary(-hover/-soft) → --brand-primary(-hover/-soft), text-warm → --brand-accent (shim), bg-brand-primary(-soft) → --brand-primary(-soft)
      pattern: 'bg-surface|border-border|text-text-primary|text-text-secondary|text-brand-primary|bg-brand-primary-soft|text-warm'
---

<objective>
Full rewrite of `src/components/Hero.astro` to match reference (`app.jsx:357-398`)
pixel-for-pixel on 1440×900. Three tasks:

1. **Add `--grad-hero-flat` token** to `src/styles/design-tokens.css` — a
   token-referenced flat 160deg gradient replacing the radial-blob
   `--grad-hero-soft` for Hero background (D-12). No existing token is removed
   (grad-hero-soft may still be used by other future surfaces).

2. **Rewrite `src/components/Hero.astro`** — replace the entire file with the
   reference-faithful structure: drop `min-h-[90vh] flex items-center pt-16`,
   use `pt-24 pb-16 px-6` + `max-w-[1120px]` container; render 2-block greeting
   (terminal prompt 14px teal + "Hi, I'm" 16px mute mono, two separate blocks
   per D-17, NOT a flex row); h1 with `clamp(40px,8vw,64px)` + `-0.03em` tracking
   + `1.05` line-height + inline `<span class="cursor-blink">_</span>` cursor
   per D-11, D-14; role mono amber 18px per D-18; tagline with 3-key split and
   `text-text-primary` accent wrapping `AI Engineer` per D-15, D-16; 4-pill
   authority strip (re:Invent, Kubestronaut external-teal, Author, Host) per
   D-02, D-03, D-05, D-06, D-07, D-08; 2 CTAs preserved with reference spacing;
   scoped `<style>` with `background: var(--grad-hero-flat)` + local
   cursor-blink keyframes (Option A per RESEARCH.md §Open Question 1).

3. **Clean up `src/styles/global.css`** — remove the `.typing-cursor::after`
   block (lines ~109-119), its reduced-motion override (lines ~150-152), and
   the `@keyframes blink` block (lines ~110-113 once `.typing-cursor` is gone).
   Grep pre-condition (performed during research 2026-04-19): zero consumers
   of `.typing-cursor` remain outside the about-to-be-rewritten Hero. Cursor
   blink animation is now component-scoped in Hero.astro's `<style>`.

Purpose: Land REQ-011 (Hero as primary pitch with 4-pill authority strip),
REQ-013 (reference typography), REQ-014 (Hero height ≤ 540px). Mitigate
T-04-01 (reverse tabnabbing on Kubestronaut external link via `rel="noopener"`).
Resolve D-02, D-03, D-05 through D-08, D-11 through D-14, D-17, D-18, D-19
from CONTEXT.md.

Output: Three mutated files. Hero.astro fully rewritten; design-tokens.css
gains one new token; global.css loses three CSS blocks. `npm run build`
passes; both EN and RU render without regression.
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

<interfaces>
<!-- i18n keys available AFTER Plan 04-01 lands in Wave 1 -->

Typed access via `const i = t(locale);`:
- `i.hero.greeting` — "Hi, I'm" (EN) / "Привет, я" (RU). Rendered in greeting Line 2 per D-17.
- `i.hero.name` — "Viktor Vedmich" (EN) / "Виктор Ведмич" (RU). Rendered inside h1 alongside cursor span.
- `i.hero.role` — "Senior Solutions Architect @ AWS" (both locales). Rendered in role block.
- `i.hero.tagline_before` — trailing-space-terminated string with two `·` separators, preceding the accent span. ENDS WITH SPACE (load-bearing).
- `i.hero.tagline_accent` — `"AI Engineer"` (byte-identical both locales). Wrapped in `<span class="text-text-primary">` per D-16.
- `i.hero.tagline_after` — empty string `""` in both locales. Reserve for future punctuation per D-15.
- `i.hero.tagline` — REMOVED by Plan 04-01; DO NOT reference.
- `i.hero.cta` — "Get in touch" (EN) / "Связаться" (RU). Primary CTA button text.
- `i.hero.cta_secondary` — "Read more" (EN) / "Подробнее" (RU). Ghost CTA button text.

<!-- Reference Hero component (app.jsx:357-398) -->
```jsx
const Hero = () => (
  <section style={{ padding: '96px 24px 64px', background: `linear-gradient(160deg,${VV.bg} 0%, ${VV.tealDark} 100%)`, borderBottom: `1px solid ${VV.border}` }}>
    <div style={{ maxWidth: 1120, margin: '0 auto' }}>
      <div style={{ fontFamily: VV.fontMono, fontSize: 14, color: VV.teal, marginBottom: 16 }}>~/vedmich.dev $ whoami</div>
      <div style={{ fontFamily: VV.fontMono, fontSize: 16, color: VV.mute, marginBottom: 4 }}>Hi, I'm</div>
      <h1 style={{ fontFamily: VV.fontDisplay, fontSize: 64, fontWeight: 700, letterSpacing: '-0.03em', lineHeight: 1.05, color: VV.text, margin: 0 }}>
        Viktor Vedmich<Cursor/>
      </h1>
      <div style={{ fontFamily: VV.fontMono, fontSize: 18, color: VV.amber, marginTop: 12 }}>Senior Solutions Architect @ AWS</div>
      <p style={{ fontFamily: VV.fontBody, fontSize: 18, lineHeight: 1.6, color: VV.mute, marginTop: 18, maxWidth: 640 }}>
        Distributed Systems · Kubernetes · <span style={{ color: VV.text }}>AI Engineer</span>
      </p>
      {/* 6 cert pills in reference — REPLACED by 4 authority pills in this phase per D-02 */}
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginTop: 28 }}>...</div>
      {/* 2 CTAs */}
      <div style={{ display: 'flex', gap: 12, marginTop: 32 }}>...</div>
    </div>
  </section>
);
```

<!-- Reference Cursor (app.jsx:394-398) — ported to CSS @keyframes per D-14 -->
```jsx
const Cursor = () => {
  const [v, setV] = useState(true);
  useEffect(() => { const id = setInterval(() => setV(x => !x), 500); return () => clearInterval(id); }, []);
  return <span style={{ color: VV.teal, opacity: v ? 1 : 0 }}>_</span>;
};
```

<!-- Phase 3 About pattern for 3-key accent (applied to Hero tagline here) -->
```astro
<!-- About.astro line 20 (canonical pattern) -->
{i.about.bio_before}<span class="text-brand-primary">{i.about.bio_accent}</span>{i.about.bio_after}
```

<!-- Tailwind utility resolutions (src/styles/global.css @theme block) -->
- `text-brand-primary` → `--brand-primary` (#14B8A6, teal)
- `text-brand-primary-hover` → `--brand-primary-hover` (#2DD4BF, teal hover)
- `bg-brand-primary` → `--brand-primary` (primary button fill)
- `bg-brand-primary-soft` → `--brand-primary-soft` (#134E4A, teal-active pill fill)
- `border-brand-primary` → `--brand-primary`
- `bg-surface` → `--bg-surface` (#1E293B, default pill fill)
- `border-border` → `--border` (#334155, default pill border)
- `text-text-primary` → `--text-primary` (#E2E8F0, white text)
- `text-text-secondary` → `--text-secondary` (#94A3B8, mute text)
- `text-warm` → `--brand-accent` (#F59E0B, amber — shim alias, role text color per D-18)
- `text-bg-base` → `--bg-base` (#0F172A, used inside primary button for text contrast)
- `hover:bg-brand-primary-hover/20` → 20% opacity teal hover bg (Kubestronaut pill hover per D-07)

<!-- Current Hero.astro scoped <style> block (lines 74-78) — to be REPLACED -->
```astro
<style>
  .hero-deep-signal {
    background: var(--grad-hero-soft);
  }
</style>
```

<!-- Current global.css blocks to be REMOVED -->
Lines 109-119 (produce .typing-cursor pseudo-element):
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
```

Lines 150-152 (inside `@media (prefers-reduced-motion: reduce)` block):
```css
  .typing-cursor::after {
    animation: none;
  }
```

<!-- CNCF Kubestronaut URL (assumption A1 from RESEARCH.md) -->
Target: https://www.cncf.io/training/kubestronaut/
Per RESEARCH.md §Assumptions Log A1: page reachability not verified during
research due to WebFetch content-size limit. Executor MUST verify the URL
returns HTTP 200 (not 404) before committing Task 2, via `curl -sI` or
playwright-cli navigate. If the URL is a 404, fall back to
https://kubestronaut.io/ and flag the divergence in the plan summary.
</interfaces>
</context>

<tasks>

<task type="auto">
  <name>Task 1: Add --grad-hero-flat token to design-tokens.css</name>
  <files>src/styles/design-tokens.css</files>
  <read_first>
    - src/styles/design-tokens.css (read in full — the `:root` block and the "Complex / layered gradients" section are what you're modifying; understand existing gradient declaration style and placement before adding)
    - .planning/phases/04-hero-reference-match/04-CONTEXT.md (D-12 — token specification)
    - .planning/phases/04-hero-reference-match/04-PATTERNS.md §`src/styles/design-tokens.css` (placement guidance — add after `--grad-hero-soft` block, before `--grad-aurora`)
  </read_first>
  <action>
    Add exactly ONE new CSS custom property declaration to `src/styles/design-tokens.css`, placed inside the `:root { ... }` block, inside the "Complex / layered gradients" section (lines 125-178 in current file), immediately AFTER the existing `--grad-hero-soft` multi-stop block (which ends on line 139 with `linear-gradient(160deg, #0B1220 0%, #0E1A2C 100%);`) and BEFORE the `--grad-aurora:` declaration on line 141.

    Add the following block (including the leading blank line for visual separation and the comment):

    ```css

      /* Flat hero gradient — reference-matched (Phase 4 D-12), no radial blobs.
         Pair with .noise-overlay to prevent banding on large surfaces. */
      --grad-hero-flat: linear-gradient(160deg, var(--bg-base), var(--brand-primary-soft));
    ```

    Rules (mandatory):
    - Do NOT remove or modify `--grad-hero-soft` — it remains defined in case any future consumer wants the radial-blob variant.
    - Do NOT remove or modify any other existing gradient token (`--grad-aurora`, `--grad-signal`, `--grad-code-glow`, etc.).
    - The new token value MUST use `var(--bg-base)` and `var(--brand-primary-soft)` — NOT literal hex. This is the canonical Deep Signal convention (per CLAUDE.md §Deep Signal Design System).
    - The gradient direction MUST be `160deg` (matches reference `linear-gradient(160deg, ...)` in app.jsx:358).
    - The color stops are: start = `var(--bg-base)` (#0F172A dark navy), end = `var(--brand-primary-soft)` (#134E4A deep teal). NO intermediate stops (flat 2-stop gradient per reference).
    - Indentation MUST match the surrounding `:root` block (2-space indent inside `:root`, matching existing gradient blocks).
    - The `.light` override block at lines 244-275 does NOT need a re-declaration for `--grad-hero-flat`; both referenced vars (`--bg-base`, `--brand-primary-soft`) have `.light` overrides, so the gradient auto-inverts under `.light` class.
    - Other sections of the file (`@font-face` blocks, `:root` brand/surface/text/border tokens, type scale, spacing, radius, shadows, motion, `.noise-overlay` utility) MUST be byte-identical to pre-plan state.
  </action>
  <verify>
    <automated>grep -q '^  --grad-hero-flat: linear-gradient(160deg, var(--bg-base), var(--brand-primary-soft));' src/styles/design-tokens.css && grep -q '^  --grad-hero-soft:' src/styles/design-tokens.css && grep -c '\-\-grad-hero-' src/styles/design-tokens.css | awk '$1>=2{exit 0} {exit 1}'</automated>
  </verify>
  <acceptance_criteria>
    Presence:
    - `grep -q 'grad-hero-flat' src/styles/design-tokens.css` exits 0 (new token exists).
    - `grep -q '\-\-grad-hero-flat: linear-gradient(160deg, var(--bg-base), var(--brand-primary-soft));' src/styles/design-tokens.css` exits 0 (exact shape).
    - `grep -q 'grad-hero-soft' src/styles/design-tokens.css` exits 0 (old token preserved).

    Absence:
    - No hardcoded hex inside the new `--grad-hero-flat` line: `grep '\-\-grad-hero-flat' src/styles/design-tokens.css | grep -E '#[0-9A-Fa-f]{3,6}' | wc -l` prints `0`.

    Structural:
    - `grep -c '\-\-grad-hero-' src/styles/design-tokens.css` prints `2` or more (at least grad-hero-soft + grad-hero-flat).
    - Running `node -e "const fs=require('fs'); const s=fs.readFileSync('src/styles/design-tokens.css','utf8'); if(!s.includes('--grad-hero-flat: linear-gradient(160deg, var(--bg-base), var(--brand-primary-soft));')) process.exit(1); if(!s.includes('--grad-hero-soft:')) process.exit(2); if((s.match(/--grad-hero-flat/g)||[]).length !== 1) process.exit(3); console.log('OK');"` exits 0.
    - File's existing structure is preserved: `grep -c '@font-face' src/styles/design-tokens.css` prints `9` (unchanged from pre-plan); `grep -q '\.light, \[data-theme="light"\]' src/styles/design-tokens.css` exits 0 (unchanged).
  </acceptance_criteria>
  <done>design-tokens.css has the new `--grad-hero-flat` token referencing Deep Signal vars; `--grad-hero-soft` and all other tokens are preserved byte-identical; file still parses as valid CSS (Astro/Tailwind build doesn't throw).</done>
</task>

<task type="auto" tdd="false">
  <name>Task 2: Full rewrite of Hero.astro — reference-match + 4-pill authority strip + clamp h1 + inline cursor + Kubestronaut URL verify</name>
  <files>src/components/Hero.astro</files>
  <read_first>
    - src/components/Hero.astro (CURRENT state — read in full: you are REPLACING all 78 lines. Note the current imports (`t`, `certifications`), the `min-h-[90vh] flex items-center pt-16` classes, the `max-w-6xl` + `max-w-3xl` container structure, the `certifications.map` cert-pill loop, the `typing-cursor` pseudo-class span, and the scoped `<style>` using `--grad-hero-soft`. All of this is being replaced.)
    - src/components/About.astro (the Phase 3 canonical monolithic `.astro` pattern — use its frontmatter structure, 3-key i18n split rendering on line 20, and pill class string as reference; Hero mirrors this scaled-up)
    - .planning/phases/04-hero-reference-match/04-CONTEXT.md (D-02, D-03, D-05 through D-08, D-11 through D-14, D-17, D-18, D-19 — the full decision set implemented here)
    - .planning/phases/04-hero-reference-match/04-RESEARCH.md §Code Examples §Example 2 (full Hero.astro rewrite — this is the target file content)
    - .planning/phases/04-hero-reference-match/04-PATTERNS.md §`src/components/Hero.astro` (pattern assignments, class-string copy sources, risk/landmine list)
    - .planning/phases/04-hero-reference-match/04-01-SUMMARY.md (confirmation that i.hero.tagline_before/_accent/_after keys are available and i.hero.tagline is removed — prerequisite for this rewrite to build)
    - /Users/viktor/.claude/skills/viktor-vedmich-design/ui_kits/vedmich-dev/app.jsx lines 357-398 (reference Hero component — visual source of truth); lines 116-123 (Pill primitive — default + teal variants); lines 131-155 (Button primitive — primary + ghost); lines 394-398 (Cursor component — `_` char, teal, blink)
    - src/styles/design-tokens.css (confirm --grad-hero-flat exists after Task 1 lands; confirm --brand-primary, --brand-primary-soft, --brand-primary-hover, --bg-base, --text-primary, --text-secondary, --border, --brand-accent tokens are all declared)
    - src/styles/global.css lines 7-56 (the `@theme` block — confirm the Tailwind utilities used in Hero (`bg-surface`, `border-border`, `text-text-primary`, `text-text-secondary`, `text-brand-primary`, `bg-brand-primary-soft`, `border-brand-primary`, `text-brand-primary-hover`, `text-warm`, `bg-brand-primary`, `hover:bg-brand-primary-hover`, `text-bg-base`) all resolve to the intended Deep Signal tokens)
  </read_first>
  <action>
    First, verify the Kubestronaut URL is reachable before locking it into markup:

    ```bash
    curl -sI -o /dev/null -w '%{http_code}\n' https://www.cncf.io/training/kubestronaut/
    # Expected: 200 (or 301/302 redirect — either is acceptable).
    # If the result is 404, fall back to https://kubestronaut.io/ and record the fallback in 04-02-SUMMARY.md.
    ```

    Then, replace the ENTIRE contents of `src/components/Hero.astro` with exactly this file content (no additions, no omissions — this IS the full file, ~70 lines):

    ```astro
    ---
    import { t, type Locale } from '../i18n/utils';

    interface Props {
      locale: Locale;
    }

    const { locale } = Astro.props;
    const i = t(locale);
    ---

    <section id="hero" class="hero-deep-signal noise-overlay relative overflow-hidden pt-24 pb-16 px-6">
      <div class="max-w-[1120px] mx-auto w-full">
        <!-- Greeting — two separate blocks per D-17 -->
        <div class="font-mono text-brand-primary text-sm mb-4">~/vedmich.dev $ whoami</div>
        <div class="font-mono text-text-secondary text-base mb-1">{i.hero.greeting}</div>

        <!-- H1 with inline _ cursor per D-11, D-14 -->
        <h1 class="font-display font-bold tracking-[-0.03em] leading-[1.05] text-text-primary m-0 text-[clamp(40px,8vw,64px)]">
          {i.hero.name}<span class="cursor-blink text-brand-primary" aria-hidden="true">_</span>
        </h1>

        <!-- Role mono amber 18px per D-18 -->
        <div class="font-mono text-warm text-lg mt-3">{i.hero.role}</div>

        <!-- Tagline with 3-key split + text-primary accent on AI Engineer per D-15, D-16 -->
        <p class="font-body text-lg text-text-secondary max-w-[640px] mt-4">
          {i.hero.tagline_before}<span class="text-text-primary">{i.hero.tagline_accent}</span>{i.hero.tagline_after}
        </p>

        <!-- Authority pills per D-02, D-03, D-05, D-06, D-07, D-08 -->
        <div class="flex flex-wrap gap-2.5 mt-7">
          <a
            href="#speaking"
            class="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-[13px] font-medium bg-surface border border-border text-text-primary font-body hover:border-brand-primary hover:text-brand-primary-hover transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand-primary"
          >
            re:Invent &amp; Keynote Speaker
          </a>
          <a
            href="https://www.cncf.io/training/kubestronaut/"
            target="_blank"
            rel="noopener"
            aria-label="CNCF Kubestronaut program (opens in new tab)"
            class="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-[13px] font-medium bg-brand-primary-soft border border-brand-primary text-brand-primary-hover font-body hover:bg-brand-primary-hover/20 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand-primary"
          >
            <span class="w-1.5 h-1.5 rounded-full bg-brand-primary-hover"></span>
            CNCF Kubestronaut
          </a>
          <a
            href="#book"
            class="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-[13px] font-medium bg-surface border border-border text-text-primary font-body hover:border-brand-primary hover:text-brand-primary-hover transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand-primary"
          >
            Author «Cracking the Kubernetes Interview»
          </a>
          <a
            href="#podcasts"
            class="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-[13px] font-medium bg-surface border border-border text-text-primary font-body hover:border-brand-primary hover:text-brand-primary-hover transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand-primary"
          >
            Host · DKT + AWS RU
          </a>
        </div>

        <!-- CTAs per D-18 (mt-8 from pills, gap-3 internal) -->
        <div class="flex flex-wrap items-center gap-3 mt-8">
          <a
            href="#contact"
            class="inline-flex items-center gap-2 px-5 py-2.5 bg-brand-primary hover:bg-brand-primary-hover text-bg-base font-medium rounded-lg transition-colors"
          >
            {i.hero.cta}
          </a>
          <a
            href="#about"
            class="inline-flex items-center gap-2 px-5 py-2.5 border border-border hover:border-brand-primary hover:text-brand-primary-hover text-text-primary font-medium rounded-lg transition-colors"
          >
            {i.hero.cta_secondary}<span aria-hidden="true">→</span>
          </a>
        </div>
      </div>
    </section>

    <style>
      .hero-deep-signal { background: var(--grad-hero-flat); }
      .cursor-blink { animation: blink 1s step-end infinite; }
      @keyframes blink { 50% { opacity: 0; } }
      @media (prefers-reduced-motion: reduce) {
        .cursor-blink { animation: none; }
      }
    </style>
    ```

    Rules (mandatory — each is an acceptance criterion below):

    **Frontmatter:**
    - Import is ONLY `import { t, type Locale } from '../i18n/utils';` — DO NOT import `certifications` (per D-02; the cert-pill loop is gone entirely).
    - No other imports. `Props`, `locale`, `i` stay exactly as shown.

    **Section wrapper:**
    - `<section id="hero" class="hero-deep-signal noise-overlay relative overflow-hidden pt-24 pb-16 px-6">` — the `id="hero"` is NEW (Plan 04-03's IntersectionObserver observes `section[id]`, so Hero must have one too; the observer uses header nav links with `href="#..."` so `#hero` isn't in the nav, but the id is still beneficial for Anchors and parity with other sections).
    - Classes are EXACTLY: `hero-deep-signal noise-overlay relative overflow-hidden pt-24 pb-16 px-6`.
    - NO `min-h-[90vh]`, NO `flex items-center`, NO `pt-16`.
    - NO `class="py-20"` or `class="min-h-screen"` — reference uses content-height only.

    **Container:**
    - Single container: `<div class="max-w-[1120px] mx-auto w-full">` — arbitrary Tailwind value, no `max-w-6xl` (Tailwind's default max-w-6xl = 1152px).
    - NO nested `max-w-3xl` wrapper. Reference is single-column at full container width (drops the 768px inner constraint that was in current Hero.astro).

    **Greeting (D-17):**
    - Line 1: `<div class="font-mono text-brand-primary text-sm mb-4">~/vedmich.dev $ whoami</div>` — teal 14px, `mb-4` = 16px gap. Text content is LITERAL (not i18n'd — terminal prompt is universal code-like element).
    - Line 2: `<div class="font-mono text-text-secondary text-base mb-1">{i.hero.greeting}</div>` — mute 16px, `mb-1` = 4px gap. Text is `{i.hero.greeting}`.
    - NO flex wrapper combining the two (not a single line with `flex items-center gap-2`).

    **H1 (D-11, D-14):**
    - Classes EXACTLY: `font-display font-bold tracking-[-0.03em] leading-[1.05] text-text-primary m-0 text-[clamp(40px,8vw,64px)]`.
    - CRITICAL — `text-[clamp(40px,8vw,64px)]` MUST have NO whitespace inside the parens (Tailwind splits on spaces in arbitrary values — Pitfall 1 in RESEARCH.md). Three comma-separated args, no spaces.
    - Content: `{i.hero.name}<span class="cursor-blink text-brand-primary" aria-hidden="true">_</span>` — inline `<span>_</span>` cursor, teal, with `aria-hidden="true"` so screen readers skip it.
    - NO `typing-cursor` class (pseudo-element approach retired per D-14).

    **Role (D-18):**
    - `<div class="font-mono text-warm text-lg mt-3">{i.hero.role}</div>` — amber (`text-warm` shim alias → `--brand-accent`), 18px (`text-lg` = 18px by Tailwind default), `mt-3` = 12px from h1.

    **Tagline (D-15, D-16):**
    - `<p class="font-body text-lg text-text-secondary max-w-[640px] mt-4">` — Inter 18px mute, 640px max-width, `mt-4` = 16px (≈ reference 18px per D-18 approved tolerance).
    - Content EXACTLY: `{i.hero.tagline_before}<span class="text-text-primary">{i.hero.tagline_accent}</span>{i.hero.tagline_after}`.
    - NO `set:html`. NO template-literal concat. NO HTML in JSON. Astro expressions inline per Phase 3 About pattern.

    **Pills (D-02, D-03, D-05 through D-08):**
    - Exactly 4 `<a>` elements, in this order (per CONTEXT.md §Claude's Discretion proposed order):
      1. `href="#speaking"` — label `re:Invent &amp; Keynote Speaker` (HTML-encode the `&` as `&amp;`).
      2. `href="https://www.cncf.io/training/kubestronaut/"` — external, with `target="_blank"`, `rel="noopener"`, `aria-label="CNCF Kubestronaut program (opens in new tab)"`, leading dot span `<span class="w-1.5 h-1.5 rounded-full bg-brand-primary-hover"></span>`, label `CNCF Kubestronaut`.
      3. `href="#book"` — label `Author «Cracking the Kubernetes Interview»` (guillemets `«»` are literal U+00AB / U+00BB — NOT `<<` or `>>` — matches Phase 3 book title convention).
      4. `href="#podcasts"` — label `Host · DKT + AWS RU` (middle dot is U+00B7 `·`; `+` is literal plus).
    - Default pill classes (for pills 1, 3, 4): `inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-[13px] font-medium bg-surface border border-border text-text-primary font-body hover:border-brand-primary hover:text-brand-primary-hover transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand-primary`.
    - Kubestronaut teal-active classes: `inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-[13px] font-medium bg-brand-primary-soft border border-brand-primary text-brand-primary-hover font-body hover:bg-brand-primary-hover/20 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand-primary`.
    - Wrapper: `<div class="flex flex-wrap gap-2.5 mt-7">` — 10px gap, 28px from role (D-18).

    **CTAs (preserved from current with minor spacing update):**
    - Wrapper: `<div class="flex flex-wrap items-center gap-3 mt-8">` — 12px internal gap, 32px from pills (D-18).
    - Primary button: `<a href="#contact" class="inline-flex items-center gap-2 px-5 py-2.5 bg-brand-primary hover:bg-brand-primary-hover text-bg-base font-medium rounded-lg transition-colors">{i.hero.cta}</a>`. NOTE: use `text-bg-base` (canonical) NOT the current `text-bg` (shim alias). Per CLAUDE.md §Deep Signal, prefer canonical tokens in new writes.
    - Ghost button: `<a href="#about" class="inline-flex items-center gap-2 px-5 py-2.5 border border-border hover:border-brand-primary hover:text-brand-primary-hover text-text-primary font-medium rounded-lg transition-colors">{i.hero.cta_secondary}<span aria-hidden="true">→</span></a>`.

    **Scoped `<style>`:**
    - EXACTLY this block:
      ```css
      .hero-deep-signal { background: var(--grad-hero-flat); }
      .cursor-blink { animation: blink 1s step-end infinite; }
      @keyframes blink { 50% { opacity: 0; } }
      @media (prefers-reduced-motion: reduce) {
        .cursor-blink { animation: none; }
      }
      ```
    - `var(--grad-hero-flat)` — NOT `var(--grad-hero-soft)`.
    - `@keyframes blink` is Hero-scoped (Option A per RESEARCH.md §Open Question 1 + Claude's Discretion).
    - Reduced-motion override included so keyboard-sensitive users aren't animated.
    - NO hardcoded hex.

    **File shape:**
    - File MUST end with a trailing newline.
    - Total line count roughly 70 (template ~65 + frontmatter 9 + style 7 = ~80 actual lines counting blank lines and formatting).
    - NO `import { certifications } from '../data/social'`.
    - NO `typing-cursor` class anywhere.
    - NO `<svg>` elements (Hero is icon-free; pills use text only).

    After writing, run the Kubestronaut URL verification (from above) one more time if not already done, and record the response code in 04-02-SUMMARY.md.
  </action>
  <verify>
    <automated>node -e "const fs=require('fs'); const s=fs.readFileSync('src/components/Hero.astro','utf8'); const checks=[[/import \{ t, type Locale \} from '\.\.\/i18n\/utils'/, 'i18n import'], [/id=\"hero\"/, 'section id'], [/class=\"hero-deep-signal noise-overlay relative overflow-hidden pt-24 pb-16 px-6\"/, 'section classes'], [/max-w-\[1120px\] mx-auto w-full/, 'container'], [/~\/vedmich\.dev \$ whoami/, 'terminal prompt'], [/i\.hero\.greeting/, 'greeting ref'], [/text-\[clamp\(40px,8vw,64px\)\]/, 'clamp font-size'], [/tracking-\[-0\.03em\]/, 'letter-spacing'], [/leading-\[1\.05\]/, 'line-height'], [/<span class=\"cursor-blink text-brand-primary\" aria-hidden=\"true\">_<\/span>/, 'inline cursor'], [/i\.hero\.name/, 'name ref'], [/font-mono text-warm text-lg mt-3/, 'role classes'], [/i\.hero\.role/, 'role ref'], [/i\.hero\.tagline_before/, 'tagline_before ref'], [/i\.hero\.tagline_accent/, 'tagline_accent ref'], [/i\.hero\.tagline_after/, 'tagline_after ref'], [/<span class=\"text-text-primary\">\{i\.hero\.tagline_accent\}<\/span>/, 'tagline accent span'], [/href=\"#speaking\"/, 'speaking pill'], [/href=\"https:\/\/www\.cncf\.io\/training\/kubestronaut\/\"/, 'kubestronaut pill href'], [/rel=\"noopener\"/, 'rel=noopener'], [/target=\"_blank\"/, 'target=_blank'], [/aria-label=\"CNCF Kubestronaut program \(opens in new tab\)\"/, 'aria-label'], [/bg-brand-primary-soft border border-brand-primary text-brand-primary-hover/, 'teal pill classes'], [/CNCF Kubestronaut/, 'Kubestronaut label'], [/href=\"#book\"/, 'book pill'], [/Author «Cracking the Kubernetes Interview»/, 'author pill label'], [/href=\"#podcasts\"/, 'podcasts pill'], [/Host \u00b7 DKT \+ AWS RU/, 'host pill label'], [/flex flex-wrap gap-2\.5 mt-7/, 'pills wrapper'], [/flex flex-wrap items-center gap-3 mt-8/, 'CTA wrapper'], [/href=\"#contact\"/, 'primary CTA'], [/bg-brand-primary hover:bg-brand-primary-hover text-bg-base/, 'primary CTA classes'], [/href=\"#about\"/, 'ghost CTA'], [/i\.hero\.cta/, 'cta ref'], [/i\.hero\.cta_secondary/, 'cta_secondary ref'], [/var\(--grad-hero-flat\)/, 'grad-hero-flat var'], [/\.cursor-blink \{ animation: blink 1s step-end infinite;? \}/, 'cursor-blink keyframe rule'], [/@keyframes blink \{ 50% \{ opacity: 0;? \} \}/, '@keyframes blink'], [/focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand-primary/, 'focus-visible outline'], [/prefers-reduced-motion: reduce/, 'reduced-motion override']]; for(const [re,name] of checks){ if(!re.test(s)){console.error('MISSING:',name);process.exit(1);} } const forbidden=[[/certifications/, 'certifications import/reference'], [/min-h-\[90vh\]/, 'min-h-[90vh]'], [/flex items-center pt-16/, 'old flex-center padding'], [/max-w-6xl/, 'max-w-6xl'], [/max-w-3xl/, 'max-w-3xl inner wrapper'], [/typing-cursor/, 'typing-cursor class'], [/var\(--grad-hero-soft\)/, 'old grad-hero-soft ref'], [/i\.hero\.tagline[^_]/, 'old i.hero.tagline (non-underscore)'], [/Kubernaut[^e]/, 'Kubernaut misspelling'], [/#[0-9A-Fa-f]{3,6}/, 'hardcoded hex'], [/text-4xl sm:text-5xl lg:text-6xl/, 'old responsive h1 sizes'], [/font-bold mb-4 tracking-tight/, 'old h1 classes']]; for(const [re,name] of forbidden){ if(re.test(s)){console.error('FORBIDDEN present:',name);process.exit(2);} } const pillCount = (s.match(/inline-flex items-center gap-1\.5 px-3\.5 py-1\.5 rounded-full text-\[13px\]/g)||[]).length; if(pillCount !== 4){ console.error('Pill count not 4, got:', pillCount); process.exit(3); } console.log('OK, 4 pills found');"</automated>
  </verify>
  <acceptance_criteria>
    Presence (must exit 0):
    - `grep -q "import { t, type Locale } from '../i18n/utils'" src/components/Hero.astro`
    - `grep -q 'id="hero"' src/components/Hero.astro`
    - `grep -q 'class="hero-deep-signal noise-overlay relative overflow-hidden pt-24 pb-16 px-6"' src/components/Hero.astro`
    - `grep -q 'max-w-\[1120px\] mx-auto w-full' src/components/Hero.astro`
    - `grep -q '~/vedmich.dev \$ whoami' src/components/Hero.astro`
    - `grep -q 'font-mono text-brand-primary text-sm mb-4' src/components/Hero.astro`
    - `grep -q 'font-mono text-text-secondary text-base mb-1' src/components/Hero.astro`
    - `grep -q 'text-\[clamp(40px,8vw,64px)\]' src/components/Hero.astro`
    - `grep -q 'tracking-\[-0.03em\]' src/components/Hero.astro`
    - `grep -q 'leading-\[1.05\]' src/components/Hero.astro`
    - `grep -q 'cursor-blink text-brand-primary' src/components/Hero.astro`
    - `grep -q 'aria-hidden="true">_</span>' src/components/Hero.astro`
    - `grep -q 'font-mono text-warm text-lg mt-3' src/components/Hero.astro`
    - `grep -q 'i.hero.tagline_before' src/components/Hero.astro`
    - `grep -q '<span class="text-text-primary">{i.hero.tagline_accent}</span>' src/components/Hero.astro`
    - `grep -q 'i.hero.tagline_after' src/components/Hero.astro`
    - `grep -q 'href="#speaking"' src/components/Hero.astro`
    - `grep -q 'href="https://www.cncf.io/training/kubestronaut/"' src/components/Hero.astro`
    - `grep -q 'target="_blank"' src/components/Hero.astro`
    - `grep -q 'rel="noopener"' src/components/Hero.astro`
    - `grep -q 'aria-label="CNCF Kubestronaut program (opens in new tab)"' src/components/Hero.astro`
    - `grep -q 'bg-brand-primary-soft border border-brand-primary text-brand-primary-hover' src/components/Hero.astro`
    - `grep -q 'href="#book"' src/components/Hero.astro`
    - `grep -q 'Author «Cracking the Kubernetes Interview»' src/components/Hero.astro`
    - `grep -q 'href="#podcasts"' src/components/Hero.astro`
    - `grep -q 'Host · DKT \+ AWS RU' src/components/Hero.astro`
    - `grep -q 'flex flex-wrap gap-2.5 mt-7' src/components/Hero.astro`
    - `grep -q 'flex flex-wrap items-center gap-3 mt-8' src/components/Hero.astro`
    - `grep -q 'href="#contact"' src/components/Hero.astro`
    - `grep -q 'bg-brand-primary hover:bg-brand-primary-hover text-bg-base' src/components/Hero.astro`
    - `grep -q 'href="#about"' src/components/Hero.astro`
    - `grep -q 'var(--grad-hero-flat)' src/components/Hero.astro`
    - `grep -q '@keyframes blink' src/components/Hero.astro`
    - `grep -q 'focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand-primary' src/components/Hero.astro`
    - `grep -q 'prefers-reduced-motion: reduce' src/components/Hero.astro`

    Absence (must exit 1):
    - `grep -q 'certifications' src/components/Hero.astro` (no import, no reference)
    - `grep -q 'min-h-\[90vh\]' src/components/Hero.astro`
    - `grep -q 'flex items-center' src/components/Hero.astro`
    - `grep -q 'max-w-6xl' src/components/Hero.astro`
    - `grep -q 'max-w-3xl' src/components/Hero.astro`
    - `grep -q 'typing-cursor' src/components/Hero.astro`
    - `grep -q 'var(--grad-hero-soft)' src/components/Hero.astro`
    - `grep -E 'i\.hero\.tagline[^_]' src/components/Hero.astro` (no reference to old `i.hero.tagline` single-key)
    - `grep -Eq 'Kubernaut[^e]' src/components/Hero.astro` (misspelling absent)
    - `grep -Eq '#[0-9A-Fa-f]{3,6}' src/components/Hero.astro` (no hardcoded hex)
    - `grep -q 'text-4xl sm:text-5xl lg:text-6xl' src/components/Hero.astro` (old responsive classes gone)

    Structural:
    - Pill count: `grep -c 'inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-\[13px\]' src/components/Hero.astro` prints `4` (exactly 4 pills).
    - Kubestronaut URL reachability verified: `curl -sI -o /dev/null -w '%{http_code}\n' https://www.cncf.io/training/kubestronaut/` prints `200`, `301`, or `302` (not `404`). If 404, executor must use fallback URL and record in SUMMARY.

    External-link safety (T-04-01):
    - Every `target="_blank"` in the file has a corresponding `rel="noopener"`. Check: `awk '/target="_blank"/{tb++} /rel="noopener"/{rn++} END{exit !(tb==rn && tb==1)}' src/components/Hero.astro` exits 0 (exactly one of each, matched).
  </acceptance_criteria>
  <done>Hero.astro is fully rewritten per reference app.jsx:357-398 with 4-pill authority strip replacing the 6 cert pills; clamp h1 + inline `_` cursor; flat gradient via `--grad-hero-flat` token; 3-key tagline with text-primary accent; Kubestronaut pill safely external with noopener; focus-visible rings on all pills; reduced-motion override for cursor; zero hardcoded hex; zero references to `certifications` or `typing-cursor`.</done>
</task>

<task type="auto">
  <name>Task 3: Clean up global.css — remove .typing-cursor + @keyframes blink + reduced-motion override + Astro build gate</name>
  <files>src/styles/global.css</files>
  <read_first>
    - src/styles/global.css (CURRENT state — read in full; target sections are lines 109-119 and lines 147-153)
    - src/components/Hero.astro (the rewritten version from Task 2 — confirm no `typing-cursor` class is referenced there anymore)
    - .planning/phases/04-hero-reference-match/04-CONTEXT.md (D-14 — pre-condition: grep confirms no other `.typing-cursor` consumer exists)
    - .planning/phases/04-hero-reference-match/04-PATTERNS.md §`src/styles/global.css` (pattern: pure deletion after grep confirms zero consumers)
    - .planning/phases/04-hero-reference-match/04-RESEARCH.md §Code Examples §Example 7 (exact blocks to delete)
  </read_first>
  <action>
    First, verify no other consumer of `.typing-cursor` remains (pre-condition per D-14):

    ```bash
    # Expected: ZERO matches in src/ (Hero.astro rewrite removed the only consumer in Task 2).
    # CLAUDE.md and .planning/ may contain doc mentions — those are allowed.
    grep -rn '\.typing-cursor\|typing-cursor' src/ 2>&1
    # If this returns ANY match in src/, STOP and investigate. Do not proceed with deletion.
    ```

    Then, perform three deletions in `src/styles/global.css`:

    **Deletion 1 — The `@keyframes blink` block (currently lines 109-113):**

    Remove these lines exactly (4 lines + the preceding comment line, total 5 lines):
    ```css
    /* Typing cursor animation — follows brand primary via shim alias */
    @keyframes blink {
      0%, 100% { opacity: 1; }
      50% { opacity: 0; }
    }
    ```

    **Deletion 2 — The `.typing-cursor::after` rule (currently lines 115-119):**

    Remove these lines exactly (5 lines):
    ```css
    .typing-cursor::after {
      content: "|";
      animation: blink 1s step-end infinite;
      color: var(--brand-primary-hover);  /* #2DD4BF — AA at small size */
    }
    ```

    Also remove the blank line between Deletion 1 and Deletion 2 if one exists (keep the file compact).

    **Deletion 3 — The reduced-motion override (currently lines 150-152, inside `@media (prefers-reduced-motion: reduce) { ... }` block):**

    Find the `@media (prefers-reduced-motion: reduce) { ... }` block around line 138. It contains multiple child rules (the universal `*` selector with animation-duration resets, the `.animate-on-scroll` override, the `.typing-cursor::after` override). Remove ONLY the `.typing-cursor::after` child rule:

    ```css
      .typing-cursor::after {
        animation: none;
      }
    ```

    KEEP the surrounding `@media (prefers-reduced-motion: reduce) { ... }` wrapper intact (it still contains the `*` and `.animate-on-scroll` child rules that are not Phase 4's concern).

    Rules (mandatory):
    - Do NOT delete any other CSS in global.css. The file still contains:
      - Tailwind import + @theme block (lines 1-56)
      - `html { scroll-behavior: smooth }` (line 58-60)
      - `body {}` (62-68)
      - `h1..h4, .font-display {}` (72-75)
      - `::selection {}` (77-80)
      - `:focus-visible {}` (83-87)
      - `@keyframes fadeInUp` (90-99) — **NOT removed**; used by `.animate-on-scroll`
      - `.animate-on-scroll {}` (101-107) — **NOT removed**
      - `.card-glow {}` (122-128) — **NOT removed**
      - `@keyframes drawLine` (131-134) — **NOT removed**
      - `@media (prefers-reduced-motion: reduce) { ... }` (138-153) — wrapper **NOT removed**, but its `.typing-cursor::after` child rule IS removed.
    - The `@keyframes blink` removal is safe because Hero.astro now declares its own local `@keyframes blink` inside its scoped `<style>` block (Task 2 added this).
    - File MUST remain valid CSS. Astro + Vite + Tailwind pipeline must build without parsing errors.
    - File MUST end with a trailing newline.

    After the three deletions, run `npm run build` to gate. This plan is the first Phase 4 plan where `npm run build` MUST pass (Plan 04-01 was expected to break build mid-wave; Plan 04-02's Hero rewrite should have restored the build; Plan 04-02 Task 3 confirms the cleanup didn't regress anything).

    Build check:

    ```bash
    npm run build 2>&1 | tail -20
    # Expected output includes "7 pages built" (en/, en/blog/, ru/, ru/blog/, + others).
    # Expected exit code: 0.
    # If the build fails, read the error message: typical culprits are (a) a missed `i.hero.tagline` reference still somewhere (shouldn't be — Plan 04-01 removed from JSON, Task 2 removed from Hero), (b) a Tailwind arbitrary-value underscore rule hit (Pitfall 1), (c) a syntax error in global.css from deletion (missing brace).
    ```

    Verify the expected DOM output of the built pages contains the new Hero markup:

    ```bash
    # Check that the 4-pill authority strip renders in both locales.
    awk '/<section id="hero"/{p=1} /<\/section>/{p=0; exit} p' dist/en/index.html | grep -c 'href="https://www.cncf.io/training/kubestronaut/"'
    # Expected: 1 (the Kubestronaut pill appears exactly once in Hero section).

    awk '/<section id="hero"/{p=1} /<\/section>/{p=0; exit} p' dist/ru/index.html | grep -c 'href="https://www.cncf.io/training/kubestronaut/"'
    # Expected: 1.

    # Check the tagline accent renders with AI Engineer wrapped in text-text-primary:
    grep -E 'text-text-primary[^"]*">AI Engineer</span>' dist/en/index.html
    grep -E 'text-text-primary[^"]*">AI Engineer</span>' dist/ru/index.html
    # Both expected to match (1 match each).

    # Check that no .typing-cursor class made it into built CSS:
    grep -l 'typing-cursor' dist/_astro/*.css
    # Expected: no output (0 files match).
    ```

    If all checks pass, Task 3 is complete. Do NOT commit from within the plan — the atomic Phase 4 commit happens after Plan 04-03 lands and user approves the visual checkpoint.
  </action>
  <verify>
    <automated>grep -rn 'typing-cursor' src/ 2>&1 | grep -v Binary; if [ ${PIPESTATUS[0]} -eq 0 ]; then echo "FAIL: typing-cursor still referenced in src/"; exit 1; fi; grep -q '@keyframes blink' src/styles/global.css && { echo "FAIL: @keyframes blink still in global.css"; exit 2; }; grep -q '\.typing-cursor' src/styles/global.css && { echo "FAIL: .typing-cursor still in global.css"; exit 3; }; grep -q 'animate-on-scroll' src/styles/global.css || { echo "FAIL: animate-on-scroll accidentally removed"; exit 4; }; grep -q '@keyframes fadeInUp' src/styles/global.css || { echo "FAIL: fadeInUp keyframe accidentally removed"; exit 5; }; grep -q 'prefers-reduced-motion: reduce' src/styles/global.css || { echo "FAIL: reduced-motion wrapper accidentally removed"; exit 6; }; npm run build 2>&1 | tail -5 > /tmp/gsd-04-02-build.log; if [ ${PIPESTATUS[0]} -ne 0 ]; then cat /tmp/gsd-04-02-build.log; echo "FAIL: build broke"; exit 7; fi; grep -q 'href="https://www.cncf.io/training/kubestronaut/"' dist/en/index.html || { echo "FAIL: Kubestronaut pill missing from EN HTML"; exit 8; }; grep -q 'href="https://www.cncf.io/training/kubestronaut/"' dist/ru/index.html || { echo "FAIL: Kubestronaut pill missing from RU HTML"; exit 9; }; grep -Eq 'text-text-primary[^"]*">AI Engineer</span>' dist/en/index.html || { echo "FAIL: Tagline accent missing EN"; exit 10; }; grep -Eq 'text-text-primary[^"]*">AI Engineer</span>' dist/ru/index.html || { echo "FAIL: Tagline accent missing RU"; exit 11; }; echo "OK: global.css cleaned + build green + HTML verified"</automated>
  </verify>
  <acceptance_criteria>
    Absence in source (must exit 1):
    - `grep -q '@keyframes blink' src/styles/global.css` (blink keyframe removed from global)
    - `grep -q 'typing-cursor' src/styles/global.css` (all typing-cursor rules removed, including reduced-motion override)
    - `grep -rn 'typing-cursor' src/ 2>&1 | grep -v '^.planning'` returns no matches (zero consumers in src/)

    Presence preserved (must exit 0):
    - `grep -q 'animate-on-scroll' src/styles/global.css` (animate-on-scroll preserved)
    - `grep -q '@keyframes fadeInUp' src/styles/global.css` (fadeInUp preserved)
    - `grep -q 'card-glow' src/styles/global.css` (card-glow preserved)
    - `grep -q '@keyframes drawLine' src/styles/global.css` (drawLine preserved)
    - `grep -q 'prefers-reduced-motion: reduce' src/styles/global.css` (reduced-motion wrapper preserved)
    - `grep -q '@theme' src/styles/global.css` (@theme block preserved)

    Build gate:
    - `npm run build` exits 0.
    - `dist/en/index.html` and `dist/ru/index.html` both exist.
    - Build output includes "7 pages" or similar success indicator.

    Built DOM verification:
    - `grep -c 'href="https://www.cncf.io/training/kubestronaut/"' dist/en/index.html` prints `1`.
    - `grep -c 'href="https://www.cncf.io/training/kubestronaut/"' dist/ru/index.html` prints `1`.
    - `grep -Eq 'text-text-primary[^"]*">AI Engineer</span>' dist/en/index.html` exits 0 (tagline accent renders EN).
    - `grep -Eq 'text-text-primary[^"]*">AI Engineer</span>' dist/ru/index.html` exits 0 (tagline accent renders RU).
    - `awk '/<section id="hero"/{p=1} /<\/section>/{p=0; exit} p' dist/en/index.html | grep -c 'rounded-full text-\[13px\] font-medium'` prints `4` (exactly 4 pills in Hero, EN).
    - `awk '/<section id="hero"/{p=1} /<\/section>/{p=0; exit} p' dist/ru/index.html | grep -c 'rounded-full text-\[13px\] font-medium'` prints `4` (exactly 4 pills in Hero, RU).
    - `grep -l 'typing-cursor' dist/_astro/*.css 2>/dev/null | wc -l` prints `0` (no typing-cursor in built CSS).
    - `grep -l 'CKA\|CKS\|CKAD\|KCNA\|KCSA' dist/en/index.html | xargs awk '/<section id="hero"/{p=1} /<\/section>/{p=0; exit} p' 2>/dev/null | grep -cE 'CKA|CKS|CKAD|KCNA|KCSA'` prints `0` (no CKA-family cert pills inside Hero section — REQ-011 acceptance).
  </acceptance_criteria>
  <done>global.css has `.typing-cursor::after` + `@keyframes blink` + reduced-motion override for typing-cursor removed; `animate-on-scroll`, `fadeInUp`, `card-glow`, `drawLine`, `@theme`, and the reduced-motion wrapper are all preserved intact; `npm run build` exits 0 with 7 pages; built HTML contains exactly 4 pills in Hero with Kubestronaut external link + noopener in both locales; tagline accent renders with `AI Engineer` wrapped in `text-text-primary`; no `typing-cursor` class appears in built CSS.</done>
</task>

</tasks>

<threat_model>
## Trust Boundaries

External link: Kubestronaut pill jumps from vedmich.dev (trusted origin) to
cncf.io (third-party origin). This introduces one new trust boundary at the
HTML attribute level.

## STRIDE Threat Register

| Threat ID | Category | Component | Disposition | Mitigation Plan |
|-----------|----------|-----------|-------------|-----------------|
| T-04-01 | Tampering | Hero.astro Kubestronaut pill (external `<a target="_blank">`) | mitigate | `rel="noopener"` attribute added to the external anchor. Prevents reverse tabnabbing (attacker-controlled cncf.io page cannot manipulate `window.opener` to redirect the vedmich.dev tab). ASVS V10 Malicious Code. Also implicit since Chromium 88+ defaults; explicit for Safari legacy + defense in depth [CITED: OWASP Top 10 2021 A05]. Verified via grep in Task 2 acceptance. |
| T-04-02 | Injection (XSS) | Hero.astro tagline render | mitigate | Render `{i.hero.tagline_accent}` as Astro expression (text content), NOT via `set:html`. Phase 3 established this invariant (03-01 plan); Hero continues it. No HTML in JSON, no innerHTML assignments. |
| T-04-03 | Denial of service | cursor-blink CSS animation | accept | CSS `@keyframes blink` runs in browser; `prefers-reduced-motion: reduce` override halts animation for sensitive users (WCAG 2.3.3). Low risk; single pseudo-element. |
| T-04-04 | Information disclosure | Hero copy | accept | Publicly intended content (name, role, bio, book title). No PII beyond what's already in `<meta>` description + LinkedIn. |
| T-04-05 | Spoofing | `href="#speaking"` / `#book` / `#podcasts` in-site anchors | accept | Same-origin anchor navigation. No new risk. |

**No new attack surface beyond T-04-01.** Single mitigation: `rel="noopener"`
on the one external link. Verified at acceptance_criteria level in Task 2.
</threat_model>

<verification>
- All three tasks' `<verify><automated>` commands exit 0.
- `npm run build` exits 0 with 7 pages built.
- Built HTML in both `dist/en/index.html` and `dist/ru/index.html` contains:
  - Exactly 4 pill `<a>` elements inside `<section id="hero">`.
  - Kubestronaut pill with `href="https://www.cncf.io/training/kubestronaut/"`, `target="_blank"`, `rel="noopener"`, and the `aria-label`.
  - Tagline with `<span class="text-text-primary">AI Engineer</span>` or equivalent (class ordering may vary by Astro's compiler — any class string containing `text-text-primary` with `AI Engineer` as the wrapped text is acceptable).
  - Terminal prompt `~/vedmich.dev $ whoami` line.
  - `{i.hero.greeting}` → `Hi, I'm` (EN) or `Привет, я` (RU) rendered.
  - No `typing-cursor` class in HTML or built CSS.
  - No CKA / CKS / CKAD / KCNA / KCSA cert pills inside the Hero section.
- `curl -sI https://www.cncf.io/training/kubestronaut/` returns 200 / 301 / 302 (URL reachable).
- Hero total height on 1440×900 viewport (via playwright-cli computed style in Plan 04-03's gate task) ≤ 540px — deferred to Plan 04-03 for runtime verification.
- h1 computed styles at 1440×900: fontSize 64px, fontWeight 700, letterSpacing -1.92px, lineHeight 67.2px — deferred to Plan 04-03 for runtime verification.
- h1 computed fontSize at 375×667 = 40px (clamp floor) — deferred to Plan 04-03.
</verification>

<success_criteria>
- `src/styles/design-tokens.css` has the new `--grad-hero-flat` token referencing `var(--bg-base)` and `var(--brand-primary-soft)`.
- `src/components/Hero.astro` is fully rewritten per reference app.jsx:357-398 with 4-pill authority strip, clamp h1, inline `_` cursor, 3-key tagline with text-primary accent, role mono amber, flat 160deg gradient, scoped cursor-blink keyframes + reduced-motion override, Kubestronaut external link safely labeled with `rel="noopener"` and `aria-label`.
- `src/styles/global.css` has `.typing-cursor`, `@keyframes blink`, and `.typing-cursor::after` reduced-motion override removed; `animate-on-scroll`, `fadeInUp`, `card-glow`, `drawLine`, `@theme`, and `prefers-reduced-motion` wrapper preserved.
- `npm run build` exits 0 with 7 pages.
- Built HTML (dist/en/index.html and dist/ru/index.html) contains the expected Hero DOM shape.
- No hardcoded hex in Hero.astro.
- No `Kubernaut` (misspelling) in Hero.astro.
- `certifications` import removed from Hero.astro.
- External link safety verified (T-04-01 mitigated).
</success_criteria>

<output>
After completion, create `.planning/phases/04-hero-reference-match/04-02-SUMMARY.md` recording:
- Final Hero.astro line count and shape (import block, markup block, style block).
- Confirmation that `--grad-hero-flat` was added to design-tokens.css at the correct location (line number relative to `--grad-hero-soft` and `--grad-aurora`).
- Confirmation that `.typing-cursor::after`, `@keyframes blink`, and the reduced-motion `.typing-cursor::after` override were removed from global.css.
- Build result: "7 pages, ~Xs" with exit code 0.
- DOM check results: 4 pills in EN Hero, 4 pills in RU Hero, Kubestronaut external link verified with `rel="noopener"`.
- Kubestronaut URL verification: HTTP status code received from `curl -sI https://www.cncf.io/training/kubestronaut/` (expected 200/301/302). If fallback URL was used, record the fallback and why.
- Note to Plan 04-03: Hero is now fully rewritten; 04-03 adds the Header nav-active observer + cross-file Kubestronaut rename (social.ts, BaseLayout.astro, CLAUDE.md) + optional `scroll-margin-top` global rule + REQ-011/013/014 inlining into REQUIREMENTS.md + final playwright-cli computed-style gate for REQ-013/014 acceptance.
</output>
</content>
