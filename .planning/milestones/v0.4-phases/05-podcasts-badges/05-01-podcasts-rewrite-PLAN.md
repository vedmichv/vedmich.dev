---
phase: 05-podcasts-badges
plan: 01
type: execute
wave: 1
depends_on: []
files_modified:
  - src/components/Podcasts.astro
autonomous: true
requirements:
  - REQ-004
tags:
  - astro
  - podcasts
  - tailwind
  - design-tokens
  - reference-match
objective: >-
  Full rewrite of `src/components/Podcasts.astro` to match reference
  (`app.jsx:423-453`) — replace current horizontal flex `[icon | {title, stats,
  desc}]` layout with a vertical stack per card (badge/logo → h3 title → body
  desc → mono stats → "Listen →" footer). DKT card keeps the existing
  `public/images/dkt-logo.png` with its white chrome (D-01 — brand asset over
  3-letter text badge). AWS RU card replaces the music-note SVG with an inline
  `AWS RU` amber text badge matching the reference `Badge` primitive
  (`app.jsx:125-129`) per D-02, D-06. Stats typography becomes ref-faithful
  `font-mono text-xs text-text-muted` — the current accent-colored `/70` tint
  is dropped (D-08). Whole-card `<a>` anchor + `card-glow` hover are preserved
  (D-05, D-10). The `podcasts[]` array, its `color` + `icon` fields, the
  `PodcastIcon` type, the music-note SVG block, the `group-hover:text-accent`
  tints on h3 + footer, and the ternary branch are all removed — two explicit
  card blocks per D-16 preferred option clarify the asymmetric branding. i18n
  keys (`podcasts.title`, `dkt_name`, `dkt_desc`, `dkt_stats`, `aws_name`,
  `aws_desc`, `aws_stats`, `listen`) are all reused unchanged. Badge text
  `AWS RU` is inline in the template (locale-invariant per D-14, matches Phase
  4 `CNCF Kubestronaut` pattern). Implements D-01 through D-17.

must_haves:
  truths:
    - "Podcasts section renders two cards in a grid md:grid-cols-2 gap-6 layout at 1440x900, each using the vertical stack structure (badge/logo slot then h3 then desc then stats then footer)."
    - "DKT card shows the existing DKT PNG logo at /images/dkt-logo.png in the badge slot with its white chrome classes w-14 h-14 rounded-xl bg-white/95 p-1 ring-1 ring-border preserved -- no teal DKT text badge is added (per D-01, D-15)."
    - "DKT logo img element keeps its accessibility alt text DevOps Kitchen Talks logo intact (per D-15)."
    - "AWS RU card shows an inline span amber text badge in the badge slot, replacing the previous music-note svg (per D-02)."
    - "The AWS RU badge span uses the exact Tailwind class string inline-block font-body text-[11px] font-semibold uppercase tracking-[0.08em] px-2 py-1 rounded text-brand-accent bg-brand-accent-soft border border-brand-accent/40 -- fallback to bg-brand-accent/10 allowed per D-06 note -- matching the reference Badge primitive in app.jsx lines 125 to 129 per D-06 and D-07."
    - "The AWS RU badge text is inline hardcoded in the Astro template and NOT in src/i18n/en.json or src/i18n/ru.json -- locale-invariant brand name per D-14, matches Phase 4 CNCF Kubestronaut pattern."
    - "Each card h3 title uses classes font-display text-[22px] font-semibold text-text-primary mt-3 mb-2 -- Space Grotesk 600, 22px, reference margin 12/0/8 mapped to mt-3 mb-2 per D-04."
    - "Each card description uses classes font-body text-[15px] text-text-muted leading-relaxed -- Inter 15px mute, line-height 1.625 Tailwind leading-relaxed approximating reference 1.6 per D-04."
    - "Each card stats line uses classes font-mono text-xs text-text-muted mt-4 -- mono 12px muted, 16px top margin per D-04 and D-08. The previous text-accent/70 DKT and text-warm/70 AWS RU colored tints are REMOVED."
    - "Each card footer Listen row uses classes mt-4 inline-flex items-center gap-1 text-sm text-text-muted group-hover:text-brand-primary-hover transition-colors per D-04 and D-11. Group hover teal affordance preserved. NOT wrapped in a nested anchor -- invalid HTML per D-11."
    - "Each card footer arrow is an inline svg with stroke-linecap round stroke-linejoin round path d M9 5l7 7-7 7 at 16px with group-hover:translate-x-1 transition-transform per D-12 -- existing arrow SVG preserved."
    - "Whole-card anchor pattern preserved with classes group block p-6 rounded-xl bg-bg border border-border card-glow animate-on-scroll -- Fitts law big target per D-05 and D-10."
    - "No nested anchor elements inside the Listen footer row per D-11 -- HTML invariant."
    - "The podcasts array, the color accent-or-warm field, the icon PodcastIcon field, the PodcastIcon type, and the podcast.icon ternary are all REMOVED from the frontmatter and template. Two explicit card blocks are used instead per D-16 preferred option and D-17."
    - "The music-note svg with path d M9 19V6l12-3v13M9 19c0 1.105 is REMOVED entirely."
    - "The group-hover:text-accent transition-colors on h3 from current line 73 and the group-hover:text-accent transition-colors on the footer from current line 84 are REMOVED -- reference uses group-hover:text-brand-primary-hover only on the footer as teal affordance, h3 stays text-text-primary steady."
    - "i18n keys reused unchanged -- src/i18n/en.json and src/i18n/ru.json are NOT modified by this plan. Keys referenced: i.podcasts.title, dkt_name, dkt_desc, dkt_stats, aws_name, aws_desc, aws_stats, listen."
    - "Section wrapper unchanged -- section id podcasts with classes py-20 sm:py-28 bg-surface/30, inner div with classes max-w-6xl mx-auto px-4 sm:px-6, plus h2 title per CONTEXT.md code_context preserve section-wrapper pattern."
    - "Both locales EN and RU render identically in terms of structure -- only the localized text inside h3, desc, stats, listen differs per REQ-004 acceptance Both locales render identically monograms are text not localized."
    - "No hardcoded hex colors anywhere in src/components/Podcasts.astro -- all colors via Tailwind utilities resolving to Deep Signal tokens bg-brand-accent-soft, text-brand-accent, border-brand-accent, text-text-primary, text-text-muted, bg-bg, border-border, text-brand-primary-hover per CLAUDE.md Deep Signal Anti-Patterns."
    - "npm run build exits 0 -- 7 pages built, both EN and RU pages render without TypeScript or Astro build errors."
  artifacts:
    - path: src/components/Podcasts.astro
      provides: Rewritten Podcasts component matching reference -- vertical stack with asymmetric badge slot DKT logo plus AWS RU amber text badge, mono muted stats, whole-card link, Listen footer with arrow
      min_lines: 60
      contains: "AWS RU"
      exports:
        - "default component"
  key_links:
    - from: src/components/Podcasts.astro
      to: src/i18n/en.json and ru.json via t(locale)
      via: typed i.podcasts access for title, dkt_name, dkt_desc, dkt_stats, aws_name, aws_desc, aws_stats, listen
      pattern: 'i\.podcasts\.(title|dkt_name|dkt_desc|dkt_stats|aws_name|aws_desc|aws_stats|listen)'
    - from: src/components/Podcasts.astro
      to: public/images/dkt-logo.png
      via: DKT card badge slot img src /images/dkt-logo.png
      pattern: '/images/dkt-logo\.png'
    - from: src/components/Podcasts.astro
      to: https://www.youtube.com/c/DevOpsKitchenTalks
      via: DKT whole-card anchor href external link new tab noopener noreferrer
      pattern: 'youtube\.com/c/DevOpsKitchenTalks'
    - from: src/components/Podcasts.astro
      to: https://podcasters.spotify.com/pod/show/awsnarusskom
      via: AWS RU whole-card anchor href external link new tab noopener noreferrer
      pattern: 'podcasters\.spotify\.com/pod/show/awsnarusskom'
    - from: Tailwind @theme utilities
      to: design-tokens.css CSS vars
      via: text-brand-accent maps to brand-accent, bg-brand-accent-soft maps to brand-accent-soft, border-brand-accent via /40 arbitrary opacity, text-text-primary maps to text-primary, text-text-muted maps to text-secondary shim alias, bg-bg maps to bg-base, border-border maps to border, text-brand-primary-hover maps to brand-primary-hover, bg-surface/30 maps to bg-surface at 30 percent opacity
      pattern: 'text-brand-accent|bg-brand-accent-soft|text-text-primary|text-text-muted|bg-bg|border-border|text-brand-primary-hover'
---

<objective>
Full rewrite of `src/components/Podcasts.astro` to match the reference
(`app.jsx:423-453`) structurally and visually, per locked decisions D-01
through D-17 in `05-CONTEXT.md`. Three tasks:

1. **Rewrite Podcasts.astro** — Replace the entire file with two explicit
   card blocks (D-16 preferred option) in a vertical stack layout
   (badge/logo → h3 → desc → stats → footer) per D-04. DKT card retains the
   existing PNG logo with white chrome (D-01, D-15). AWS RU card replaces
   the music-note SVG with an inline `AWS RU` amber text badge matching
   the `Badge` primitive (D-02, D-06, D-07). Stats become mono muted
   without color tint (D-08). Whole-card `<a>` + `card-glow` + Listen
   footer arrow all preserved (D-05, D-10, D-11, D-12). Cleanup: drop the
   `podcasts[]` array, `PodcastIcon` type, `color` + `icon` fields, the
   music-note SVG, and the `group-hover:text-accent` tints (D-16, D-17).

2. **Token/hex-hygiene + build gate** — Run the Deep Signal token
   enforcement check (`grep -E "#[0-9a-fA-F]{3,8}" src/components/Podcasts.astro`
   must return zero matches per CLAUDE.md) and `npm run build` (must exit
   0 with 7 pages) to confirm the rewrite compiles cleanly and respects
   design-tokens discipline.

Purpose: Land REQ-004 (Podcasts monogram badges — no music-note SVG
remains, badges sit top-left above title, both locales render identically)
via the asymmetric DKT-logo / AWS-RU-amber-badge treatment locked during
the Phase 5 discussion (see 05-DISCUSSION-LOG.md). This phase does NOT
add a `Badge.astro` component — inline span per D-07 (single consumer,
defer extraction until a second consumer appears, per CLAUDE.md
"No premature abstraction").

Output: One mutated file (`src/components/Podcasts.astro`), zero new
tokens, zero new components, zero new assets. `npm run build` passes.
Both EN and RU HTML render without regression. Visual verification on
live is out of scope for this plan and happens post-commit per the user's
established workflow.
</objective>

<execution_context>
@$HOME/.claude/get-shit-done/workflows/execute-plan.md
@$HOME/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@.planning/phases/05-podcasts-badges/05-CONTEXT.md
@.planning/phases/05-podcasts-badges/05-DISCUSSION-LOG.md

<interfaces>
<!-- i18n keys available via `const i = t(locale);` (unchanged from current) -->

- `i.podcasts.title` — "Podcasts" (EN) / "Подкасты" (RU). Rendered in section h2.
- `i.podcasts.dkt_name` — "DevOps Kitchen Talks" (both locales — brand name). Rendered in DKT h3.
- `i.podcasts.dkt_desc` — EN: "Technical deep-dives into DevOps, Kubernetes, and infrastructure. Interviews with industry experts, mock interviews, and hands-on topics." RU: "Технические глубокие погружения в DevOps, Kubernetes и инфраструктуру. Интервью с экспертами, мок-интервью и практические темы.". Rendered in DKT card description.
- `i.podcasts.dkt_stats` — EN: "91+ episodes · 10K+ subscribers" RU: "91+ выпусков · 10K+ подписчиков". Rendered in DKT card stats row.
- `i.podcasts.aws_name` — "AWS на русском" (both locales — brand name stays Russian regardless of UI locale, that's the actual podcast name). Rendered in AWS RU h3.
- `i.podcasts.aws_desc` — EN: "AWS services, architectural patterns, AI applications, and IT careers — all in Russian. Vendor-agnostic perspective from inside AWS." RU: "Сервисы AWS, архитектурные паттерны, применение AI и IT-карьера — всё на русском. Независимый взгляд изнутри AWS.". Rendered in AWS RU card description.
- `i.podcasts.aws_stats` — EN: "65+ episodes · 70K+ listens" RU: "65+ выпусков · 70K+ прослушиваний". Rendered in AWS RU card stats row.
- `i.podcasts.listen` — "Listen" (EN) / "Слушать" (RU). Rendered in footer before the arrow SVG.

<!-- Reference Badge primitive (app.jsx:125-129) — INLINE this, do NOT extract -->
```jsx
const Badge = ({ children, color = VV.teal }) => (
  <span style={{ display:'inline-block', padding:'4px 8px', borderRadius:4,
    fontFamily: VV.fontBody, fontSize:11, fontWeight:600, letterSpacing:'0.08em',
    textTransform:'uppercase', color, background:`${color}1a`, border:`1px solid ${color}40` }}>{children}</span>
);
```

For AWS RU (amber variant): `color = VV.amber` (#F59E0B). Inline Tailwind mapping:
`inline-block font-body text-[11px] font-semibold uppercase tracking-[0.08em] px-2 py-1 rounded text-brand-accent bg-brand-accent-soft border border-brand-accent/40`

<!-- Reference Podcasts component (app.jsx:423-453) — structural source of truth -->
```jsx
const Podcasts = () => (
  <Section id="podcasts" title="Podcasts">
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
      <Card>
        <Badge color={VV.teal}>DKT</Badge>  {/* we use DKT PNG logo instead — D-01 */}
        <h3 style={{ fontFamily: VV.fontDisplay, fontSize: 22, fontWeight: 600, color: VV.text, margin: '12px 0 8px' }}>
          DevOps Kitchen Talks</h3>
        <p style={{ fontFamily: VV.fontBody, color: VV.mute, margin: 0, fontSize: 15, lineHeight: 1.6 }}>
          Technical deep-dives into DevOps, Kubernetes, and infrastructure. ...
        </p>
        <div style={{ fontFamily: VV.fontMono, fontSize: 12, color: VV.muted, marginTop: 16 }}>
          91+ episodes · 10K+ subscribers
        </div>
        <div style={{ marginTop: 16 }}><Button variant="ghost" href="#">Listen →</Button></div>
      </Card>
      <Card>
        <Badge color={VV.amber}>AWS RU</Badge>  {/* ← we inline this exact amber text badge — D-02 */}
        <h3 ...>AWS на русском</h3>
        <p ...>AWS services, architectural patterns, ...</p>
        <div style={{ fontFamily: VV.fontMono, fontSize: 12, color: VV.muted, marginTop: 16 }}>
          65+ episodes · 70K+ listens
        </div>
        <div style={{ marginTop: 16 }}><Button variant="ghost" href="#">Listen →</Button></div>
      </Card>
    </div>
  </Section>
);
```

Departures from reference (intentional, locked):
- DKT badge slot uses PNG logo, not text badge (D-01, D-15).
- Listen footer is not a `Button variant="ghost"` — it's a text row inside the whole-card `<a>` (D-11; Zero-JS + no nested anchors).
- Current Astro section wrapper `py-20 sm:py-28 bg-surface/30 + max-w-6xl` preserved (not rewritten to ref `padding: '80px 24px', maxWidth: 1120`) — CONTEXT.md §code_context confirms section wrappers are kept across all Phase 2-10 rewrites.

<!-- Tailwind utility resolutions (src/styles/global.css @theme block) -->
- `text-brand-accent` → `--brand-accent` (#F59E0B, amber)
- `bg-brand-accent-soft` → `--brand-accent-soft` (#451A03, deep amber) — D-06 NOTE: this is darker than the ref's `${amber}1a` (10% opacity ≈ #F59E0B1A). Both are acceptable on dark theme. Executor may fall back to `bg-brand-accent/10` arbitrary opacity during visual verify if the `-soft` variant reads too dim.
- `border-brand-accent/40` → `--brand-accent` @ 40% opacity (Tailwind arbitrary opacity) — matches ref's `border: 1px solid ${color}40`.
- `text-text-primary` → `--text-primary` (#E2E8F0, white text) — h3 title color.
- `text-text-muted` → `--text-secondary` (#94A3B8, secondary mute) per the shim alias in global.css line 49 (`--color-text-muted: var(--text-secondary)`). This is the correct token per REQ-004 "badge is top-left, muted stats" — AA-compliant at 5.3:1.
- `bg-bg` → `--bg-base` (#0F172A, card surface) — shim alias.
- `border-border` → `--border` (#334155, card border) — shim alias.
- `text-brand-primary-hover` → `--brand-primary-hover` (#2DD4BF, teal hover) — footer hover affordance.
- `bg-surface/30` → `--bg-surface` at 30% opacity — section backdrop, preserved.
- `bg-white/95` → white at 95% opacity — DKT logo chrome, preserved.

<!-- Current Podcasts.astro (full file — read in full) -->
Current structure is a map over `podcasts[]` array with horizontal flex
`[icon | {h3, stats, desc}]` layout. Lines 52-71 contain the ternary:
`{podcast.icon === 'dkt-logo' ? <DKT-logo-chrome> : <music-note-SVG>}`.
Lines 72-82 contain h3+stats+desc inside a sibling `<div>`. Line 84 has
the Listen footer row with current `group-hover:text-accent` tint.

**Full replacement target markup** (Astro syntax, two explicit card blocks):

```astro
---  (astro-frontmatter-delim)
import { t, type Locale } from '../i18n/utils';

interface Props {
  locale: Locale;
}

const { locale } = Astro.props;
const i = t(locale);
---  (astro-frontmatter-delim)

<section id="podcasts" class="py-20 sm:py-28 bg-surface/30">
  <div class="max-w-6xl mx-auto px-4 sm:px-6">
    <h2 class="font-display text-3xl font-bold mb-12 animate-on-scroll">{i.podcasts.title}</h2>

    <div class="grid md:grid-cols-2 gap-6">
      <!-- DKT card — PNG logo in badge slot per D-01, D-15 -->
      <a
        href="https://www.youtube.com/c/DevOpsKitchenTalks"
        target="_blank"
        rel="noopener noreferrer"
        class="group block p-6 rounded-xl bg-bg border border-border card-glow animate-on-scroll"
      >
        <div class="w-14 h-14 shrink-0 rounded-xl bg-white/95 p-1 flex items-center justify-center ring-1 ring-border">
          <img
            src="/images/dkt-logo.png"
            alt="DevOps Kitchen Talks logo"
            width="48"
            height="48"
            loading="lazy"
            decoding="async"
            class="w-full h-full object-contain"
          />
        </div>
        <h3 class="font-display text-[22px] font-semibold text-text-primary mt-3 mb-2">
          {i.podcasts.dkt_name}
        </h3>
        <p class="font-body text-[15px] text-text-muted leading-relaxed">
          {i.podcasts.dkt_desc}
        </p>
        <div class="font-mono text-xs text-text-muted mt-4">
          {i.podcasts.dkt_stats}
        </div>
        <div class="mt-4 inline-flex items-center gap-1 text-sm text-text-muted group-hover:text-brand-primary-hover transition-colors">
          {i.podcasts.listen}
          <svg class="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </div>
      </a>

      <!-- AWS RU card — inline amber text badge per D-02, D-06, D-14 -->
      <a
        href="https://podcasters.spotify.com/pod/show/awsnarusskom"
        target="_blank"
        rel="noopener noreferrer"
        class="group block p-6 rounded-xl bg-bg border border-border card-glow animate-on-scroll"
      >
        <span class="inline-block font-body text-[11px] font-semibold uppercase tracking-[0.08em] px-2 py-1 rounded text-brand-accent bg-brand-accent-soft border border-brand-accent/40">
          AWS RU
        </span>
        <h3 class="font-display text-[22px] font-semibold text-text-primary mt-3 mb-2">
          {i.podcasts.aws_name}
        </h3>
        <p class="font-body text-[15px] text-text-muted leading-relaxed">
          {i.podcasts.aws_desc}
        </p>
        <div class="font-mono text-xs text-text-muted mt-4">
          {i.podcasts.aws_stats}
        </div>
        <div class="mt-4 inline-flex items-center gap-1 text-sm text-text-muted group-hover:text-brand-primary-hover transition-colors">
          {i.podcasts.listen}
          <svg class="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </div>
      </a>
    </div>
  </div>
</section>
```
</interfaces>
</context>

<tasks>

<task type="auto">
  <name>Task 1: Full rewrite of Podcasts.astro — two explicit card blocks with asymmetric badge slot (DKT logo + AWS RU amber text badge), vertical stack, mono muted stats</name>
  <files>src/components/Podcasts.astro</files>
  <read_first>
    - src/components/Podcasts.astro (CURRENT state — read in full: you are REPLACING all 95 lines. Note the current imports (`t`, `type Locale`), the `PodcastIcon` type alias, the `podcasts[]` array with `color: 'accent' | 'warm'` + `icon: PodcastIcon` fields, the `flex items-start gap-4` horizontal layout, the `{podcast.icon === 'dkt-logo' ? ... : ...}` ternary, the music-note `<svg>` with path `M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2...`, the current h3 with `group-hover:text-accent transition-colors`, the current stats `<p>` with `text-accent/70` / `text-warm/70` tint, and the footer `<div>` with `group-hover:text-accent`. All of this is being replaced.)
    - /Users/viktor/.claude/skills/viktor-vedmich-design/ui_kits/vedmich-dev/app.jsx lines 125-129 (Badge primitive — color, background `${color}1a` (10% opacity hex), border `1px solid ${color}40` (25% opacity hex), fontSize 11, fontWeight 600, letterSpacing 0.08em, uppercase, padding 4px 8px, borderRadius 4)
    - /Users/viktor/.claude/skills/viktor-vedmich-design/ui_kits/vedmich-dev/app.jsx lines 423-453 (Podcasts component — two Card blocks, Badge → h3 (22px Space Grotesk 600, margin 12/0/8) → p (15px Inter 1.6 mute) → div stats (12px mono muted mt 16) → div Listen footer mt 16)
    - /Users/viktor/.claude/skills/viktor-vedmich-design/ui_kits/vedmich-dev/app.jsx lines 157-168 (Card primitive — surface bg, border, borderRadius 12, padding 24, teal hover border + 20px glow — maps to Tailwind `bg-bg border border-border card-glow` classes in our implementation, already used by the current Podcasts.astro and preserved)
    - .planning/phases/05-podcasts-badges/05-CONTEXT.md (D-01 through D-17 — the full decision set implemented here; pay close attention to D-01 DKT-logo-over-text-badge asymmetry, D-06 exact badge class string, D-11 no-nested-anchor invariant, D-16 preferred two-explicit-card-blocks layout, D-17 drop color field)
    - src/styles/design-tokens.css (confirm brand tokens exist: `--brand-accent` amber, `--brand-accent-soft` deep amber, `--brand-primary-hover` teal hover, `--text-primary`, `--text-secondary`, `--bg-base`, `--border`. No new tokens added by this plan.)
    - src/styles/global.css lines 7-56 (the `@theme` block — confirm the Tailwind utilities used in the rewrite all resolve to the intended Deep Signal tokens; see <interfaces> above for the mapping table)
    - CLAUDE.md §"Deep Signal Design System — LIVE" §"Anti-Patterns" (never hardcoded hex, never deprecated cyan `#06B6D4`/`#22D3EE`, never AWS orange `#FF9900`/`#232F3E` — keep amber `--brand-accent: #F59E0B`)
  </read_first>
  <action>
    Replace the ENTIRE contents of `src/components/Podcasts.astro` with exactly this file content (no additions, no omissions — this IS the full file; use the Write tool to overwrite):

    ```astro
    ---  (astro-frontmatter-delim)
    import { t, type Locale } from '../i18n/utils';

    interface Props {
      locale: Locale;
    }

    const { locale } = Astro.props;
    const i = t(locale);
    ---  (astro-frontmatter-delim)

    <section id="podcasts" class="py-20 sm:py-28 bg-surface/30">
      <div class="max-w-6xl mx-auto px-4 sm:px-6">
        <h2 class="font-display text-3xl font-bold mb-12 animate-on-scroll">{i.podcasts.title}</h2>

        <div class="grid md:grid-cols-2 gap-6">
          <!-- DKT card — PNG logo in badge slot per D-01, D-15 -->
          <a
            href="https://www.youtube.com/c/DevOpsKitchenTalks"
            target="_blank"
            rel="noopener noreferrer"
            class="group block p-6 rounded-xl bg-bg border border-border card-glow animate-on-scroll"
          >
            <div class="w-14 h-14 shrink-0 rounded-xl bg-white/95 p-1 flex items-center justify-center ring-1 ring-border">
              <img
                src="/images/dkt-logo.png"
                alt="DevOps Kitchen Talks logo"
                width="48"
                height="48"
                loading="lazy"
                decoding="async"
                class="w-full h-full object-contain"
              />
            </div>
            <h3 class="font-display text-[22px] font-semibold text-text-primary mt-3 mb-2">
              {i.podcasts.dkt_name}
            </h3>
            <p class="font-body text-[15px] text-text-muted leading-relaxed">
              {i.podcasts.dkt_desc}
            </p>
            <div class="font-mono text-xs text-text-muted mt-4">
              {i.podcasts.dkt_stats}
            </div>
            <div class="mt-4 inline-flex items-center gap-1 text-sm text-text-muted group-hover:text-brand-primary-hover transition-colors">
              {i.podcasts.listen}
              <svg class="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </a>

          <!-- AWS RU card — inline amber text badge per D-02, D-06, D-14 -->
          <a
            href="https://podcasters.spotify.com/pod/show/awsnarusskom"
            target="_blank"
            rel="noopener noreferrer"
            class="group block p-6 rounded-xl bg-bg border border-border card-glow animate-on-scroll"
          >
            <span class="inline-block font-body text-[11px] font-semibold uppercase tracking-[0.08em] px-2 py-1 rounded text-brand-accent bg-brand-accent-soft border border-brand-accent/40">
              AWS RU
            </span>
            <h3 class="font-display text-[22px] font-semibold text-text-primary mt-3 mb-2">
              {i.podcasts.aws_name}
            </h3>
            <p class="font-body text-[15px] text-text-muted leading-relaxed">
              {i.podcasts.aws_desc}
            </p>
            <div class="font-mono text-xs text-text-muted mt-4">
              {i.podcasts.aws_stats}
            </div>
            <div class="mt-4 inline-flex items-center gap-1 text-sm text-text-muted group-hover:text-brand-primary-hover transition-colors">
              {i.podcasts.listen}
              <svg class="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </a>
        </div>
      </div>
    </section>
    ```

    Rules (mandatory — each is an acceptance criterion below):

    **Frontmatter:**
    - Import is ONLY `import { t, type Locale } from '../i18n/utils';` — identical to current file frontmatter line 2, preserved (no new imports).
    - NO `type PodcastIcon = 'dkt-logo' | 'headphones';` type alias — REMOVED per D-16, D-17.
    - NO `const podcasts: Array<{...}> = [...]` array — REMOVED per D-16, D-17.
    - `Props`, `locale`, `i` stay exactly as shown (3 lines — interface, const destructure, const t-call).

    **Section wrapper (preserved):**
    - `<section id="podcasts" class="py-20 sm:py-28 bg-surface/30">` — byte-identical to current line 40 per CONTEXT.md §code_context ("Section wrapper pattern — matches other sections (About, Speaking, etc.) — keep as-is").
    - `<div class="max-w-6xl mx-auto px-4 sm:px-6">` — byte-identical to current line 41.
    - `<h2 class="font-display text-3xl font-bold mb-12 animate-on-scroll">{i.podcasts.title}</h2>` — byte-identical to current line 42.
    - `<div class="grid md:grid-cols-2 gap-6">` — byte-identical to current line 44 per D-05.

    **DKT card (first `<a>` block):**
    - Classes EXACTLY: `group block p-6 rounded-xl bg-bg border border-border card-glow animate-on-scroll` per D-05, D-10.
    - Attributes EXACTLY: `href="https://www.youtube.com/c/DevOpsKitchenTalks"`, `target="_blank"`, `rel="noopener noreferrer"` per D-10 (URL byte-identical to current line 25 `podcast.url` value).
    - Badge slot: DKT logo chrome div with `w-14 h-14 shrink-0 rounded-xl bg-white/95 p-1 flex items-center justify-center ring-1 ring-border` classes (byte-identical to current lines 53-54 per D-15 "prefer current chrome").
    - `<img>` attributes: `src="/images/dkt-logo.png"`, `alt="DevOps Kitchen Talks logo"`, `width="48"`, `height="48"`, `loading="lazy"`, `decoding="async"`, `class="w-full h-full object-contain"` — EXACTLY preserved from current lines 56-63 per D-15 (alt text preserved, logo asset reused).
    - h3 classes EXACTLY: `font-display text-[22px] font-semibold text-text-primary mt-3 mb-2` per D-04.
      - NOT `text-xl` (which is 20px in Tailwind defaults; ref is 22px via `text-[22px]` arbitrary).
      - NOT `mb-1` (current line 73 used mb-1; ref maps to `mt-3 mb-2` per D-04).
      - NO `group-hover:text-accent transition-colors` on h3 per D-16 (reference h3 is steady text-primary, only the footer gets the teal hover affordance).
    - h3 content: `{i.podcasts.dkt_name}`.
    - Description `<p>` classes EXACTLY: `font-body text-[15px] text-text-muted leading-relaxed` per D-04.
      - NOT `text-sm` (14px; ref is 15px via `text-[15px]` arbitrary).
    - Description content: `{i.podcasts.dkt_desc}`.
    - Stats `<div>` classes EXACTLY: `font-mono text-xs text-text-muted mt-4` per D-04, D-08.
      - NOT `<p class="text-sm font-medium mb-3 text-accent/70">` (current line 76; the color-tinted emphasis is REMOVED per D-08).
      - NOT `text-sm` (ref is 12px via `text-xs` which is 12px in Tailwind defaults).
    - Stats content: `{i.podcasts.dkt_stats}`.
    - Footer `<div>` classes EXACTLY: `mt-4 inline-flex items-center gap-1 text-sm text-text-muted group-hover:text-brand-primary-hover transition-colors` per D-04, D-11.
      - `mt-4` = 16px top margin (matches ref `marginTop: 16`).
      - `text-sm` = 14px (current line 84 used `text-sm` for footer — preserved).
      - `group-hover:text-brand-primary-hover` = teal hover on whole-card hover (was `group-hover:text-accent` on current line 84; upgraded to canonical token name).
      - NO nested `<a>` inside this `<div>` per D-11 (invalid HTML — parent `<a>` already wraps the whole card).
    - Footer content: `{i.podcasts.listen}` followed by the arrow SVG.
    - Arrow SVG EXACTLY: `<svg class="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7" /></svg>` per D-12 (byte-identical to current lines 86-88, preserved).

    **AWS RU card (second `<a>` block):**
    - Classes EXACTLY: `group block p-6 rounded-xl bg-bg border border-border card-glow animate-on-scroll` (same as DKT card per D-05).
    - Attributes EXACTLY: `href="https://podcasters.spotify.com/pod/show/awsnarusskom"`, `target="_blank"`, `rel="noopener noreferrer"` per D-10 (URL byte-identical to current line 33 `podcast.url` value).
    - Badge slot: inline `<span>` (NOT an SVG, NOT an image). Classes EXACTLY: `inline-block font-body text-[11px] font-semibold uppercase tracking-[0.08em] px-2 py-1 rounded text-brand-accent bg-brand-accent-soft border border-brand-accent/40` per D-06. Content is the literal text `AWS RU` (two words, single space between, capital letters) per D-02, D-14.
      - NOT a DKT-style chrome div with an inner icon.
      - NOT a music-note `<svg>` — the music-note SVG block is DELETED entirely (current lines 67-69).
      - NOT in i18n JSON — `AWS RU` is hardcoded in the template per D-14.
      - NOT `bg-brand-accent/10` by default — use `bg-brand-accent-soft` as the documented preferred per D-06. FALLBACK ALLOWED: if, during user-driven visual verify on live (post-commit, out of scope for this plan), the `-soft` variant reads too dim and the user requests, the executor may switch to `bg-brand-accent/10`. Document any fallback in SUMMARY if applied; otherwise use `bg-brand-accent-soft`.
      - The badge text `AWS RU` MUST appear literally in the rendered HTML (no HTML-encoding tricks; no `{'AWS RU'}` expression wrapping, just the plain text between the opening and closing `<span>` tags — whitespace around it is cosmetic).
    - h3 classes EXACTLY: `font-display text-[22px] font-semibold text-text-primary mt-3 mb-2` (same as DKT card per D-04).
    - h3 content: `{i.podcasts.aws_name}`.
    - Description `<p>` classes EXACTLY: `font-body text-[15px] text-text-muted leading-relaxed` (same as DKT card per D-04).
    - Description content: `{i.podcasts.aws_desc}`.
    - Stats `<div>` classes EXACTLY: `font-mono text-xs text-text-muted mt-4` (same as DKT card per D-04, D-08).
    - Stats content: `{i.podcasts.aws_stats}`.
    - Footer `<div>` classes EXACTLY: `mt-4 inline-flex items-center gap-1 text-sm text-text-muted group-hover:text-brand-primary-hover transition-colors` (same as DKT card per D-04, D-11).
    - Footer content: `{i.podcasts.listen}` followed by the arrow SVG (same as DKT card per D-12).

    **Forbidden content (must NOT appear anywhere in the file):**
    - NO `type PodcastIcon` type alias declaration.
    - NO `const podcasts: Array` or `podcasts.map(` — the array iteration is gone per D-16, D-17.
    - NO `color: 'accent' | 'warm'` field (or any reference to the `color` discriminator) per D-17.
    - NO `icon: 'dkt-logo' | 'headphones'` field per D-16, D-17.
    - NO `podcast.icon === 'dkt-logo'` ternary or `podcast.color === 'accent'` ternary per D-16, D-17.
    - NO music-note `<svg>` with path `d="M9 19V6l12-3v13M9 19c0 1.105..."` per REQ-004 acceptance ("No music-note SVG remains in Podcasts.astro").
    - NO `text-accent/70` or `text-warm/70` class on stats per D-08.
    - NO `group-hover:text-accent` on h3 (only on footer, and using canonical token `group-hover:text-brand-primary-hover`) per D-16.
    - NO nested `<a>` elements inside the Listen footer div per D-11.
    - NO hardcoded hex codes (`#06B6D4`, `#14B8A6`, `#F59E0B`, `#FFFFFF`, etc.) — all colors via Tailwind utilities per CLAUDE.md §Anti-Patterns.
    - NO deprecated cyan classes like `text-cyan-*` / `bg-cyan-*`.
    - NO AWS orange references (`#FF9900`, `#232F3E`, `text-aws-*`).
    - NO `DKT` visible text string in the DKT card (the PNG logo is the brand mark per D-15; the h3 is the full name `DevOps Kitchen Talks`).

    **File shape:**
    - File MUST end with a trailing newline.
    - Total line count ~80-90 (two explicit card blocks + section wrapper + frontmatter).
    - Valid Astro syntax — must compile without errors under `npm run build`.
  </action>
  <verify>
    <automated>set -e; TF="src/components/Podcasts.astro"; if ! grep -q 'import { t, type Locale }' "$TF"; then echo "FAIL: i18n import missing"; exit 1; fi; echo "OK: i18n import present"; if ! grep -q 'const { locale } = Astro.props' "$TF"; then echo "FAIL: locale prop destructure missing"; exit 2; fi; echo "OK: locale destructured"; if ! grep -q 'id="podcasts"' "$TF"; then echo "FAIL: section id missing"; exit 3; fi; echo "OK: section id preserved"; if ! grep -q 'grid md:grid-cols-2 gap-6' "$TF"; then echo "FAIL: 2-col grid wrapper missing"; exit 4; fi; echo "OK: 2-col grid wrapper present"; if ! grep -q '/images/dkt-logo.png' "$TF"; then echo "FAIL: DKT logo src missing"; exit 5; fi; echo "OK: DKT logo src present"; if ! grep -q 'alt="DevOps Kitchen Talks logo"' "$TF"; then echo "FAIL: DKT logo alt missing"; exit 6; fi; echo "OK: DKT logo alt preserved"; if ! grep -q 'https://www.youtube.com/c/DevOpsKitchenTalks' "$TF"; then echo "FAIL: DKT YouTube URL missing"; exit 7; fi; echo "OK: DKT YouTube URL present"; if ! grep -q 'https://podcasters.spotify.com/pod/show/awsnarusskom' "$TF"; then echo "FAIL: AWS RU Spotify URL missing"; exit 8; fi; echo "OK: AWS RU Spotify URL present"; if ! grep -q '>AWS RU<' "$TF"; then echo "FAIL: AWS RU badge text in span missing (must be inside <span>...</span>, not just a comment)"; exit 9; fi; echo "OK: AWS RU badge text present in span (not comment)"; if ! grep -q 'bg-brand-accent-soft' "$TF"; then echo "FAIL: amber soft bg token missing"; exit 10; fi; echo "OK: amber soft bg present"; if ! grep -q 'border-brand-accent/40' "$TF"; then echo "FAIL: amber 40% border token missing"; exit 11; fi; echo "OK: amber 40% border present"; if ! grep -q 'font-mono text-xs text-text-muted' "$TF"; then echo "FAIL: mono-muted stats styling missing"; exit 12; fi; echo "OK: mono-muted stats styling present"; if ! grep -q 'card-glow' "$TF"; then echo "FAIL: card-glow hover class missing"; exit 13; fi; echo "OK: card-glow preserved"; if ! grep -q 'M9 5l7 7-7 7' "$TF"; then echo "FAIL: arrow SVG path missing"; exit 14; fi; echo "OK: arrow SVG preserved"; if grep -q 'M9 19V6l12-3v13' "$TF"; then echo "FAIL: music-note SVG still present"; exit 15; fi; echo "OK: music-note SVG removed"; if grep -q 'type PodcastIcon' "$TF"; then echo "FAIL: PodcastIcon type alias still present"; exit 16; fi; echo "OK: PodcastIcon type removed"; if grep -q 'const podcasts:' "$TF"; then echo "FAIL: podcasts array declaration still present"; exit 17; fi; echo "OK: podcasts array removed"; if grep -Eq 'text-accent/70|text-warm/70' "$TF"; then echo "FAIL: old accent/warm tints still present on stats"; exit 18; fi; echo "OK: old stats tints removed"; echo "Task 1 automated verify: all checks pass"</automated>
  </verify>
  <acceptance_criteria>
    Presence (must exit 0):
    - `grep -q "import { t, type Locale } from '../i18n/utils'" src/components/Podcasts.astro`
    - `grep -q 'id="podcasts"' src/components/Podcasts.astro`
    - `grep -q 'class="py-20 sm:py-28 bg-surface/30"' src/components/Podcasts.astro`
    - `grep -q 'max-w-6xl mx-auto px-4 sm:px-6' src/components/Podcasts.astro`
    - `grep -q 'grid md:grid-cols-2 gap-6' src/components/Podcasts.astro`
    - `grep -q 'href="https://www.youtube.com/c/DevOpsKitchenTalks"' src/components/Podcasts.astro`
    - `grep -q 'href="https://podcasters.spotify.com/pod/show/awsnarusskom"' src/components/Podcasts.astro`
    - `grep -q 'target="_blank"' src/components/Podcasts.astro`
    - `grep -q 'rel="noopener noreferrer"' src/components/Podcasts.astro`
    - `grep -q 'group block p-6 rounded-xl bg-bg border border-border card-glow animate-on-scroll' src/components/Podcasts.astro`
    - `grep -q 'w-14 h-14 shrink-0 rounded-xl bg-white/95 p-1 flex items-center justify-center ring-1 ring-border' src/components/Podcasts.astro`
    - `grep -q 'src="/images/dkt-logo.png"' src/components/Podcasts.astro`
    - `grep -q 'alt="DevOps Kitchen Talks logo"' src/components/Podcasts.astro`
    - `grep -q 'inline-block font-body text-\[11px\] font-semibold uppercase tracking-\[0.08em\] px-2 py-1 rounded text-brand-accent bg-brand-accent-soft border border-brand-accent/40' src/components/Podcasts.astro`
    - `grep -q '>AWS RU<' src/components/Podcasts.astro` (matches the `AWS RU` text *inside* the `<span>` element, not in any HTML comment — robust against comments containing the same phrase)
    - `grep -q 'font-display text-\[22px\] font-semibold text-text-primary mt-3 mb-2' src/components/Podcasts.astro`
    - `grep -q 'font-body text-\[15px\] text-text-muted leading-relaxed' src/components/Podcasts.astro`
    - `grep -q 'font-mono text-xs text-text-muted mt-4' src/components/Podcasts.astro`
    - `grep -q 'mt-4 inline-flex items-center gap-1 text-sm text-text-muted group-hover:text-brand-primary-hover transition-colors' src/components/Podcasts.astro`
    - `grep -q 'i.podcasts.dkt_name' src/components/Podcasts.astro`
    - `grep -q 'i.podcasts.aws_name' src/components/Podcasts.astro`
    - `grep -q 'i.podcasts.dkt_desc' src/components/Podcasts.astro`
    - `grep -q 'i.podcasts.aws_desc' src/components/Podcasts.astro`
    - `grep -q 'i.podcasts.dkt_stats' src/components/Podcasts.astro`
    - `grep -q 'i.podcasts.aws_stats' src/components/Podcasts.astro`
    - `grep -q 'i.podcasts.listen' src/components/Podcasts.astro`
    - `grep -q 'd="M9 5l7 7-7 7"' src/components/Podcasts.astro`
    - `grep -q 'w-4 h-4 group-hover:translate-x-1 transition-transform' src/components/Podcasts.astro`

    Absence (must exit 1 — no match):
    - `grep -q 'type PodcastIcon' src/components/Podcasts.astro`
    - `grep -q 'const podcasts:' src/components/Podcasts.astro`
    - `grep -q 'podcasts.map' src/components/Podcasts.astro`
    - `grep -q 'podcast.icon' src/components/Podcasts.astro`
    - `grep -q 'podcast.color' src/components/Podcasts.astro`
    - `grep -Eq "color: 'accent' \\| 'warm'" src/components/Podcasts.astro`
    - `grep -q "'headphones'" src/components/Podcasts.astro`
    - `grep -q 'd="M9 19V6l12-3v13' src/components/Podcasts.astro` (music-note SVG path absent)
    - `grep -q 'text-accent/70' src/components/Podcasts.astro`
    - `grep -q 'text-warm/70' src/components/Podcasts.astro`
    - `grep -q 'group-hover:text-accent' src/components/Podcasts.astro` (old alias absent — only the canonical `group-hover:text-brand-primary-hover` should appear)
    - `grep -Eq '#[0-9A-Fa-f]{3,8}' src/components/Podcasts.astro` (no hardcoded hex)
    - `grep -q 'text-cyan-' src/components/Podcasts.astro` (no deprecated cyan)
    - `grep -q '#06B6D4' src/components/Podcasts.astro`
    - `grep -q '#22D3EE' src/components/Podcasts.astro`
    - `grep -q '#FF9900' src/components/Podcasts.astro`

    Structural:
    - Card count: `grep -c 'group block p-6 rounded-xl bg-bg border border-border card-glow animate-on-scroll' src/components/Podcasts.astro` prints `2` (exactly 2 cards).
    - Anchor count: `grep -cE '^\\s*<a$' src/components/Podcasts.astro` prints `2` (exactly 2 top-level `<a>` tags for the two cards; multi-line attributes).
    - External-link safety: every `target="_blank"` has a corresponding `rel="noopener noreferrer"`. Check: `awk '/target="_blank"/{tb++} /rel="noopener noreferrer"/{rn++} END{exit !(tb==rn && tb==2)}' src/components/Podcasts.astro` exits 0 (exactly two of each, matched).
    - Music-note SVG absent: `grep -q 'M9 19V6l12-3v13M9 19c0 1.105' src/components/Podcasts.astro` exits 1 (no match — entire music-note path absent).
    - DKT logo preserved: `grep -c '/images/dkt-logo.png' src/components/Podcasts.astro` prints `1`.
    - AWS RU text exactly once in an actual template context (matches only the `<span>` content, NOT the HTML comment `<!-- AWS RU card ... -->` that also contains the phrase — uses `>AWS RU<` anchor to bind to span delimiters): `grep -c '>AWS RU<' src/components/Podcasts.astro` prints `1` (exactly one occurrence inside the amber badge span).
    - Nested anchor check (HTML invariant per D-11): `node -e "const fs=require('fs'); const s=fs.readFileSync('src/components/Podcasts.astro','utf8'); const aOpens=(s.match(/<a\\s/g)||[]).length; const aCloses=(s.match(/<\\/a>/g)||[]).length; if(aOpens!==2||aCloses!==2){console.error('Expected exactly 2 <a> opens and 2 </a> closes, got',aOpens,aCloses); process.exit(1);} // Rudimentary nesting check: the first </a> should come BEFORE the second <a. const firstClose = s.indexOf('</a>'); const secondOpen = s.indexOf('<a', s.indexOf('<a')+1); if(firstClose > secondOpen || firstClose === -1 || secondOpen === -1){console.error('Anchors appear nested or malformed'); process.exit(2);} console.log('OK: 2 flat anchors, no nesting');"` exits 0.
  </acceptance_criteria>
  <done>Podcasts.astro is fully rewritten per reference app.jsx:423-453 as two explicit card blocks in a vertical stack layout; DKT card retains PNG logo + white chrome (D-01, D-15); AWS RU card has inline amber text badge `AWS RU` with exact reference class string (D-02, D-06, D-14); stats are mono muted without color tint (D-08); h3 stays text-primary without group-hover tint (D-16); footer keeps teal group-hover affordance via `group-hover:text-brand-primary-hover` (D-11); whole-card `<a>` preserved with `rel="noopener noreferrer"` on both (D-10); music-note SVG deleted; `podcasts[]` array + `PodcastIcon` type + `color`/`icon` fields all removed (D-16, D-17); zero hardcoded hex; zero deprecated cyan; zero AWS orange; both locales reference the same 7 unchanged i18n keys.</done>
</task>

<task type="auto">
  <name>Task 2: Token/hex-hygiene check + build gate — verify the rewrite compiles cleanly, produces both EN and RU HTML with the expected DOM shape, and leaves zero hardcoded hex</name>
  <files>src/components/Podcasts.astro</files>
  <read_first>
    - src/components/Podcasts.astro (confirm Task 1 produced the expected file — re-read only if the Task 1 automated verify failed; otherwise skip, to avoid unnecessary reads)
    - CLAUDE.md §"Deep Signal Design System — LIVE" §"Anti-Patterns" (token enforcement rules — no hardcoded hex, no deprecated cyan, no AWS orange; this task enforces them at the grep level)
    - .planning/phases/04-hero-reference-match/04-02-hero-rewrite-PLAN.md §Task 3 verify block (structural analog for the build gate — same approach, different file)
    - .planning/phases/05-podcasts-badges/05-CONTEXT.md §code_context (reuse of existing assets; i18n key list; no-new-tokens promise)
  </read_first>
  <action>
    This task is a verification-only gate — no file mutations. Run each of the following checks in sequence. If ANY check fails, fix Task 1 output (re-run Task 1 with corrected Astro markup) before proceeding. If ALL checks pass, the plan is complete.

    **Check 1 — Token/hex-hygiene (Deep Signal discipline per CLAUDE.md):**

    ```bash
    # Expected: ZERO matches (no hardcoded hex in Podcasts.astro).
    grep -En '#[0-9a-fA-F]{3,8}\\b' src/components/Podcasts.astro
    # Expected stdout: empty, exit code 1 (grep with no match).
    # If any line prints, FAIL: executor used a hex literal somewhere — fix Task 1 to use a Tailwind utility instead.
    ```

    **Check 2 — Forbidden classes/patterns:**

    ```bash
    # Expected: ZERO matches for each.
    grep -n '#06B6D4\\|#22D3EE\\|#FF9900\\|#232F3E\\|text-cyan-\\|bg-cyan-' src/components/Podcasts.astro
    # Expected stdout: empty, exit code 1.
    ```

    **Check 3 — Music-note SVG removed (REQ-004 acceptance):**

    ```bash
    grep -n 'M9 19V6l12-3v13M9 19c0 1.105' src/components/Podcasts.astro
    # Expected stdout: empty, exit code 1 (the music-note path must not appear).
    ```

    **Check 4 — AWS RU badge text is inline, not in i18n JSON (D-14):**

    ```bash
    # The badge text MUST be inline in the Astro template (inside the <span>, not only in a comment).
    grep -q '>AWS RU<' src/components/Podcasts.astro && echo "OK: AWS RU inline in Podcasts.astro span" || { echo "FAIL: AWS RU missing from Podcasts.astro span content"; exit 1; }

    # The badge text MUST NOT be in the i18n JSON files (no key named aws_badge or similar).
    grep -l 'aws_badge\\|AWS RU' src/i18n/en.json src/i18n/ru.json 2>/dev/null
    # Expected: empty output (no JSON file contains AWS RU as a key or value — locale-invariant per D-14).
    # Note: The existing `aws_name` key is "AWS на русском" (the podcast's actual name). This grep specifically checks for "AWS RU" string, which should only live in the template.
    ```

    **Check 5 — DKT logo asset still exists and is referenced:**

    ```bash
    # The DKT logo file must exist on disk.
    test -f public/images/dkt-logo.png || { echo "FAIL: public/images/dkt-logo.png missing"; exit 1; }
    # Podcasts.astro must reference it.
    grep -q 'src="/images/dkt-logo.png"' src/components/Podcasts.astro || { echo "FAIL: DKT logo reference missing"; exit 1; }
    echo "OK: DKT logo asset present and referenced"
    ```

    **Check 6 — Build gate (CRITICAL — `npm run build` must exit 0):**

    ```bash
    npm run build 2>&1 | tail -20
    # Expected output includes "7 pages built" or similar success indicator.
    # Expected exit code: 0.
    # If the build fails, read the error message:
    #   (a) Missing i18n key → verify Task 1 references exactly the 8 keys: title, dkt_name, dkt_desc, dkt_stats, aws_name, aws_desc, aws_stats, listen.
    #   (b) Tailwind arbitrary-value pattern hit → confirm `text-[11px]`, `text-[15px]`, `text-[22px]`, `tracking-[0.08em]`, `border-brand-accent/40` all have NO whitespace inside the brackets (Tailwind splits on spaces in arbitrary values; same pitfall as Hero plan).
    #   (c) Astro syntax error → validate `<svg>`, `<img>`, `<a>`, `<span>` tag closure (Astro is XML-strict; self-closing tags need `/>`, multiline attributes need careful indentation).
    #   (d) TypeScript error on `i.podcasts.*` access → confirm `src/i18n/utils.ts` typing still exposes these keys (they should be unchanged from pre-plan state).
    ```

    **Check 7 — Both locales render the expected DOM shape in built HTML:**

    Note: `>AWS RU<` (bound to span delimiters) is used for built-HTML `grep` counts to avoid false positives from HTML comments. Astro emits comments into the built output by default, so the phrase `AWS RU` would appear both in a comment and in the span — `>AWS RU<` matches only the span text.

    ```bash
    # Both dist/en/index.html and dist/ru/index.html must exist.
    test -f dist/en/index.html || { echo "FAIL: dist/en/index.html missing"; exit 1; }
    test -f dist/ru/index.html || { echo "FAIL: dist/ru/index.html missing"; exit 1; }

    # The Podcasts section in EN HTML contains:
    #   - DKT logo <img>
    awk '/<section id="podcasts"/{p=1} /<\\/section>/{if(p){p=0;exit}} p' dist/en/index.html | grep -c 'src="/images/dkt-logo.png"'
    # Expected: 1

    #   - AWS RU amber badge text with the expected class string
    awk '/<section id="podcasts"/{p=1} /<\\/section>/{if(p){p=0;exit}} p' dist/en/index.html | grep -cE 'text-brand-accent[^"]*bg-brand-accent-soft'
    # Expected: 1 (the amber badge span)

    #   - The literal text "AWS RU" inside the badge span (NOT counting the HTML comment that also contains the phrase)
    awk '/<section id="podcasts"/{p=1} /<\\/section>/{if(p){p=0;exit}} p' dist/en/index.html | grep -c '>AWS RU<'
    # Expected: 1 (inside the badge span)

    #   - No music-note SVG path
    awk '/<section id="podcasts"/{p=1} /<\\/section>/{if(p){p=0;exit}} p' dist/en/index.html | grep -c 'M9 19V6l12-3v13'
    # Expected: 0

    # Repeat the same checks for RU HTML:
    awk '/<section id="podcasts"/{p=1} /<\\/section>/{if(p){p=0;exit}} p' dist/ru/index.html | grep -c 'src="/images/dkt-logo.png"'
    # Expected: 1
    awk '/<section id="podcasts"/{p=1} /<\\/section>/{if(p){p=0;exit}} p' dist/ru/index.html | grep -c '>AWS RU<'
    # Expected: 1 (inline badge span, locale-invariant per D-14 — same text in EN and RU)
    awk '/<section id="podcasts"/{p=1} /<\\/section>/{if(p){p=0;exit}} p' dist/ru/index.html | grep -c 'M9 19V6l12-3v13'
    # Expected: 0

    # Both locales must have exactly 2 card <a> anchors in the Podcasts section.
    awk '/<section id="podcasts"/{p=1} /<\\/section>/{if(p){p=0;exit}} p' dist/en/index.html | grep -c 'rounded-xl bg-bg border border-border card-glow'
    # Expected: 2
    awk '/<section id="podcasts"/{p=1} /<\\/section>/{if(p){p=0;exit}} p' dist/ru/index.html | grep -c 'rounded-xl bg-bg border border-border card-glow'
    # Expected: 2
    ```

    **Check 8 — REQ-004 acceptance verified in built HTML:**

    REQ-004 says (from REQUIREMENTS.md §REQ-004):
    - "No music-note SVG remains in Podcasts.astro" → Check 3 + Check 7 cover this.
    - "DKT badge teal" → Per D-01 we use PNG logo (locked decision, documented in DISCUSSION-LOG). DKT logo renders (Check 5 + Check 7). Document the CONTEXT-driven deviation in plan summary.
    - "AWS RU badge amber" → AWS RU amber badge renders in both locales (Check 7, via `text-brand-accent bg-brand-accent-soft border border-brand-accent/40` class string resolving to amber tokens).
    - "Badges sit top-left of each card, above title" → The vertical stack order in Task 1 markup guarantees the badge slot is the first child inside the card `<a>`, above the h3. Visual verify on live is post-commit (not blocking this plan).
    - "Both locales render identically" → Check 7 confirms same DOM shape (2 cards, badge slot, h3, desc, stats, footer) in both dist/en and dist/ru; only the localized text content differs (dkt_name, dkt_desc, dkt_stats, aws_name, aws_desc, aws_stats, listen in each locale's JSON).

    If all checks pass, Task 2 and the plan are complete. Do NOT commit from within the plan — the atomic Phase 5 commit happens after visual verify on live per the user's established workflow (see `.planning/STATE.md` §Notes "User prefers sequential execution with visual verification on live after each phase.").
  </action>
  <verify>
    <automated>set -e; TF="src/components/Podcasts.astro"; grep -Eq '#[0-9a-fA-F]{3,8}\\b' "$TF" && { echo "FAIL: hardcoded hex present in $TF"; grep -En '#[0-9a-fA-F]{3,8}\\b' "$TF"; exit 1; } || true; grep -Eq '#06B6D4|#22D3EE|#FF9900|#232F3E|text-cyan-|bg-cyan-' "$TF" && { echo "FAIL: forbidden color reference"; exit 2; } || true; grep -q 'M9 19V6l12-3v13' "$TF" && { echo "FAIL: music-note SVG still present"; exit 3; } || true; grep -q '>AWS RU<' "$TF" || { echo "FAIL: AWS RU badge text missing from span (must be inside <span>...</span>, not only a comment)"; exit 4; }; grep -l 'AWS RU' src/i18n/en.json src/i18n/ru.json 2>/dev/null && { echo "FAIL: AWS RU leaked into i18n JSON — must be inline per D-14"; exit 5; } || true; test -f public/images/dkt-logo.png || { echo "FAIL: public/images/dkt-logo.png missing"; exit 6; }; grep -q 'src="/images/dkt-logo.png"' "$TF" || { echo "FAIL: DKT logo not referenced"; exit 7; }; npm run build 2>&1 | tail -10 > /tmp/gsd-05-01-build.log; if [ ${PIPESTATUS[0]} -ne 0 ]; then echo "FAIL: npm run build exited non-zero"; cat /tmp/gsd-05-01-build.log; exit 8; fi; test -f dist/en/index.html || { echo "FAIL: dist/en/index.html missing"; exit 9; }; test -f dist/ru/index.html || { echo "FAIL: dist/ru/index.html missing"; exit 10; }; EN_DKT=$(awk '/<section id="podcasts"/{p=1} /<\\/section>/{if(p){p=0;exit}} p' dist/en/index.html | grep -c 'src="/images/dkt-logo.png"'); [ "$EN_DKT" = "1" ] || { echo "FAIL: EN DKT logo count != 1, got $EN_DKT"; exit 11; }; RU_DKT=$(awk '/<section id="podcasts"/{p=1} /<\\/section>/{if(p){p=0;exit}} p' dist/ru/index.html | grep -c 'src="/images/dkt-logo.png"'); [ "$RU_DKT" = "1" ] || { echo "FAIL: RU DKT logo count != 1, got $RU_DKT"; exit 12; }; EN_AWSRU=$(awk '/<section id="podcasts"/{p=1} /<\\/section>/{if(p){p=0;exit}} p' dist/en/index.html | grep -c '>AWS RU<'); [ "$EN_AWSRU" = "1" ] || { echo "FAIL: EN AWS RU badge span count != 1, got $EN_AWSRU"; exit 13; }; RU_AWSRU=$(awk '/<section id="podcasts"/{p=1} /<\\/section>/{if(p){p=0;exit}} p' dist/ru/index.html | grep -c '>AWS RU<'); [ "$RU_AWSRU" = "1" ] || { echo "FAIL: RU AWS RU badge span count != 1, got $RU_AWSRU"; exit 14; }; EN_CARDS=$(awk '/<section id="podcasts"/{p=1} /<\\/section>/{if(p){p=0;exit}} p' dist/en/index.html | grep -c 'rounded-xl bg-bg border border-border card-glow'); [ "$EN_CARDS" = "2" ] || { echo "FAIL: EN card count != 2, got $EN_CARDS"; exit 15; }; RU_CARDS=$(awk '/<section id="podcasts"/{p=1} /<\\/section>/{if(p){p=0;exit}} p' dist/ru/index.html | grep -c 'rounded-xl bg-bg border border-border card-glow'); [ "$RU_CARDS" = "2" ] || { echo "FAIL: RU card count != 2, got $RU_CARDS"; exit 16; }; EN_MUSIC=$(awk '/<section id="podcasts"/{p=1} /<\\/section>/{if(p){p=0;exit}} p' dist/en/index.html | grep -c 'M9 19V6l12-3v13' || true); [ "$EN_MUSIC" = "0" ] || { echo "FAIL: EN music-note SVG still in built HTML, count $EN_MUSIC"; exit 17; }; RU_MUSIC=$(awk '/<section id="podcasts"/{p=1} /<\\/section>/{if(p){p=0;exit}} p' dist/ru/index.html | grep -c 'M9 19V6l12-3v13' || true); [ "$RU_MUSIC" = "0" ] || { echo "FAIL: RU music-note SVG still in built HTML, count $RU_MUSIC"; exit 18; }; EN_AMBER_CLASS=$(awk '/<section id="podcasts"/{p=1} /<\\/section>/{if(p){p=0;exit}} p' dist/en/index.html | grep -cE 'text-brand-accent[^"]*bg-brand-accent-soft'); [ "$EN_AMBER_CLASS" = "1" ] || { echo "FAIL: EN amber badge class absent, count $EN_AMBER_CLASS"; exit 19; }; echo "OK: all 8 checks passed — token hygiene, build green, DOM shape verified EN+RU"</automated>
  </verify>
  <acceptance_criteria>
    Token hygiene (must exit 1 — no match):
    - `grep -Eq '#[0-9a-fA-F]{3,8}\b' src/components/Podcasts.astro` (no hardcoded hex per CLAUDE.md §Anti-Patterns).
    - `grep -Eq '#06B6D4|#22D3EE' src/components/Podcasts.astro` (no deprecated cyan).
    - `grep -Eq '#FF9900|#232F3E' src/components/Podcasts.astro` (no AWS employer orange).
    - `grep -Eq 'text-cyan-|bg-cyan-' src/components/Podcasts.astro` (no deprecated cyan Tailwind utilities).

    REQ-004 acceptance (source):
    - Music-note SVG absent from source: `grep -q 'M9 19V6l12-3v13' src/components/Podcasts.astro` exits 1.
    - AWS RU badge text present in source *inside the span* (not only in a comment): `grep -q '>AWS RU<' src/components/Podcasts.astro` exits 0.
    - AWS RU badge NOT in i18n JSON: `grep -l 'AWS RU' src/i18n/en.json src/i18n/ru.json 2>/dev/null | wc -l` prints `0` (locale-invariant per D-14).
    - DKT logo asset present: `test -f public/images/dkt-logo.png` exits 0.
    - DKT logo referenced in Podcasts.astro: `grep -q 'src="/images/dkt-logo.png"' src/components/Podcasts.astro` exits 0.

    Build gate:
    - `npm run build` exits 0.
    - Build output includes "7 pages" or equivalent success indicator.
    - `dist/en/index.html` and `dist/ru/index.html` both exist.

    Built DOM verification (REQ-004 acceptance):
    - EN Podcasts section contains exactly 1 DKT logo `<img>` tag: `awk '/<section id="podcasts"/{p=1} /<\/section>/{if(p){p=0;exit}} p' dist/en/index.html | grep -c 'src="/images/dkt-logo.png"'` prints `1`.
    - RU Podcasts section contains exactly 1 DKT logo `<img>` tag: same command against `dist/ru/index.html` prints `1`.
    - EN Podcasts section contains exactly 1 `AWS RU` badge in a span (not counting the HTML comment that also contains the phrase): `awk '/<section id="podcasts"/{p=1} /<\/section>/{if(p){p=0;exit}} p' dist/en/index.html | grep -c '>AWS RU<'` prints `1`.
    - RU Podcasts section contains exactly 1 `AWS RU` badge in a span (locale-invariant, same selector as EN): same command against `dist/ru/index.html` prints `1`.
    - EN Podcasts section contains exactly 2 card anchors: `awk '/<section id="podcasts"/{p=1} /<\/section>/{if(p){p=0;exit}} p' dist/en/index.html | grep -c 'rounded-xl bg-bg border border-border card-glow'` prints `2`.
    - RU Podcasts section contains exactly 2 card anchors: same command against `dist/ru/index.html` prints `2`.
    - EN Podcasts section contains ZERO music-note SVG paths: `awk '/<section id="podcasts"/{p=1} /<\/section>/{if(p){p=0;exit}} p' dist/en/index.html | grep -c 'M9 19V6l12-3v13'` prints `0`.
    - RU Podcasts section contains ZERO music-note SVG paths: same command against `dist/ru/index.html` prints `0`.
    - EN Podcasts section contains exactly 1 amber-badge-class span: `awk '/<section id="podcasts"/{p=1} /<\/section>/{if(p){p=0;exit}} p' dist/en/index.html | grep -cE 'text-brand-accent[^"]*bg-brand-accent-soft'` prints `1`.
    - Built CSS contains the amber badge classes: `grep -l 'bg-brand-accent-soft' dist/_astro/*.css | wc -l` prints `1` or more (Tailwind generated the rule from the Podcasts.astro source).
  </acceptance_criteria>
  <done>All 8 verification checks pass: (1) no hardcoded hex in Podcasts.astro; (2) no forbidden color references (deprecated cyan, AWS orange, cyan utilities); (3) no music-note SVG path present in source; (4) `AWS RU` badge text inline in source span (not only in a comment), NOT in i18n JSON; (5) DKT logo asset present on disk and referenced in source; (6) `npm run build` exits 0 with 7 pages; (7) both `dist/en/index.html` and `dist/ru/index.html` contain exactly 2 card anchors with the DKT logo, exactly 1 `>AWS RU<` span (badge text inside the span element, not counting the comment that also contains the phrase), and zero music-note SVG paths; (8) the amber badge resolves to the expected Tailwind class string `text-brand-accent bg-brand-accent-soft border border-brand-accent/40` which Tailwind compiles into the built CSS.</done>
</task>

</tasks>

<verification>
- Both tasks' `<verify><automated>` commands exit 0.
- `npm run build` exits 0 with 7 pages built.
- Built HTML in both `dist/en/index.html` and `dist/ru/index.html` contains:
  - Exactly 2 card `<a>` elements inside `<section id="podcasts">`.
  - DKT card with `<img src="/images/dkt-logo.png" alt="DevOps Kitchen Talks logo" ...>` in the badge slot.
  - AWS RU card with `<span>AWS RU</span>` using classes resolving to amber tokens (`text-brand-accent bg-brand-accent-soft border-brand-accent/40`) in the badge slot.
  - Each card h3 rendering the localized name (`DevOps Kitchen Talks` / `AWS на русском`).
  - Each card stats row rendering as mono muted text (no color tint).
  - Each card footer row with `Listen` / `Слушать` + arrow SVG, teal hover via group.
  - No music-note SVG path `M9 19V6l12-3v13` anywhere in the HTML.
  - Both card anchors have `target="_blank"` and `rel="noopener noreferrer"`.
- Source file `src/components/Podcasts.astro` contains:
  - Zero hardcoded hex colors.
  - Zero deprecated cyan references.
  - Zero AWS orange references.
  - Zero references to removed artifacts (`PodcastIcon`, `podcasts.map`, `podcast.icon`, `podcast.color`, `text-accent/70`, `text-warm/70`, `group-hover:text-accent`, music-note path).
  - Two explicit card blocks (DKT + AWS RU).
  - Inline `AWS RU` badge text (locale-invariant per D-14).
- Visual verification on live via playwright-cli is deferred to post-commit per the user's established workflow (see STATE.md §Notes) — NOT blocking this plan's acceptance.
</verification>

<success_criteria>
- `src/components/Podcasts.astro` is fully rewritten as two explicit card blocks (DKT logo + AWS RU amber text badge) with vertical stack layout per reference `app.jsx:423-453` and CONTEXT.md D-01 through D-17.
- No hardcoded hex, no deprecated cyan, no AWS orange — Deep Signal token discipline per CLAUDE.md.
- No music-note SVG anywhere in source or built HTML (REQ-004 acceptance).
- `AWS RU` amber badge text rendered inline in the template (locale-invariant per D-14), with Tailwind classes `text-brand-accent bg-brand-accent-soft border border-brand-accent/40` resolving to Deep Signal amber tokens.
- DKT logo asset `public/images/dkt-logo.png` preserved and referenced (D-01, D-15).
- i18n keys unchanged (no edits to `src/i18n/en.json` or `src/i18n/ru.json`).
- Both EN and RU render identical DOM structure (monogram-position rule from REQ-004 satisfied).
- Whole-card `<a>` anchor pattern preserved with `rel="noopener noreferrer"` on both cards (D-10).
- `npm run build` exits 0 with 7 pages.
- Built HTML DOM shape verified in both locales.
</success_criteria>

<output>
After completion, create `.planning/phases/05-podcasts-badges/05-01-SUMMARY.md` recording:
- Final `src/components/Podcasts.astro` line count and shape (frontmatter ~9 lines, DKT card block ~30 lines, AWS RU card block ~30 lines, closing wrapper).
- Confirmation that the `podcasts[]` array + `PodcastIcon` type + `color`/`icon` fields + music-note SVG + `text-accent/70` / `text-warm/70` tints + `group-hover:text-accent` on h3 were all removed.
- Confirmation that the DKT PNG logo badge slot was preserved (D-01, D-15) and that the AWS RU amber text badge replaced the music-note SVG (D-02).
- Build result: "7 pages, ~Xs" with exit code 0.
- Built HTML verification: 2 card anchors in EN Podcasts section, 2 card anchors in RU Podcasts section, DKT logo present in both, `>AWS RU<` span present in both, zero music-note paths in both.
- Whether the executor used `bg-brand-accent-soft` (preferred per D-06) or fell back to `bg-brand-accent/10` (allowed fallback per D-06 note). Default expectation: the preferred variant was used.
- Note for post-commit visual verify: the user will run playwright-cli against live vedmich.dev after deploy to confirm (a) DKT logo renders with white chrome in both cards' top-left positions, (b) AWS RU amber badge is visually distinct from teal elements and reads as "brand name badge" not "status chip", (c) card hover shows `card-glow` teal ring + box-shadow, (d) "Listen →" footer arrow translates on hover.
- Note for Phase 6 (Book): if the inline amber badge pattern used here proves durable, the `PACKT` label in Book.astro (Phase 6, Reference app.jsx:496 — `style={{ fontFamily: VV.fontMono, fontSize: 10, color: VV.amber, letterSpacing: '0.1em' }}PACKT`) is a good candidate for the same inline treatment OR, if a third consumer surfaces there, extracting `src/components/Badge.astro` per D-07 deferred note.
</output>
