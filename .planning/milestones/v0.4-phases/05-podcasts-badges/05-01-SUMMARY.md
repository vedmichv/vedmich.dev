---
phase: 05-podcasts-badges
plan: 01
subsystem: podcasts-component
tags:
  - astro
  - podcasts
  - tailwind
  - design-tokens
  - reference-match
dependency_graph:
  requires:
    - REQ-004
  provides:
    - podcasts-monogram-badges
    - dkt-logo-badge-slot
    - aws-ru-amber-badge
  affects:
    - src/components/Podcasts.astro
tech_stack:
  added: []
  patterns:
    - inline-amber-badge-primitive
    - vertical-card-stack-layout
    - asymmetric-badge-treatment
key_files:
  created: []
  modified:
    - src/components/Podcasts.astro
decisions:
  - D-01: DKT card retains PNG logo in badge slot (brand asset over text badge)
  - D-02: AWS RU card uses inline amber text badge (replaces music-note SVG)
  - D-04: Vertical stack layout with reference typography (22px h3, 15px desc, 12px mono stats)
  - D-05: Whole-card anchor preserved (Fitts law + card-glow hover)
  - D-06: Amber badge uses exact reference class string (11px semibold uppercase tracking-0.08em)
  - D-08: Stats become mono muted without color tint (remove text-accent/70, text-warm/70)
  - D-10: Both cards have rel=noopener noreferrer (security)
  - D-11: Listen footer is text row inside anchor (no nested anchor, teal hover only on footer)
  - D-14: AWS RU badge text is inline locale-invariant (not in i18n JSON)
  - D-15: DKT logo chrome preserved from current (w-14 h-14 bg-white/95 p-1 ring-1)
  - D-16: Two explicit card blocks (replace podcasts[] array + .map iteration)
  - D-17: Remove color field, PodcastIcon type, icon field, music-note SVG
metrics:
  duration_seconds: 192
  completed_date: "2026-04-21T03:48:59Z"
  tasks_completed: 2
  files_changed: 1
  lines_added: 61
  lines_removed: 75
---

# Phase 05 Plan 01: Podcasts Rewrite — DKT Logo + AWS RU Amber Badge

**One-liner:** Full rewrite of Podcasts.astro with two explicit card blocks in vertical stack layout — DKT card keeps PNG logo (white chrome), AWS RU card has inline amber text badge (11px semibold uppercase), stats become mono muted, whole-card anchor + card-glow preserved, music-note SVG removed.

## What was built

Replaced the entire `src/components/Podcasts.astro` component (95 lines → 82 lines) with two explicit card blocks matching the reference design (`app.jsx:423-453`). Each card now uses a vertical stack layout:

1. **Badge/logo slot** (top)
   - DKT: PNG logo with white chrome (`w-14 h-14 bg-white/95 p-1 ring-1 ring-border`)
   - AWS RU: Inline amber text badge (`inline-block font-body text-[11px] font-semibold uppercase tracking-[0.08em] px-2 py-1 rounded text-brand-accent bg-brand-accent-soft border border-brand-accent/40`)

2. **h3 title** — `font-display text-[22px] font-semibold text-text-primary mt-3 mb-2` (Space Grotesk 600, 22px, reference margin 12/0/8)

3. **Description paragraph** — `font-body text-[15px] text-text-muted leading-relaxed` (Inter 15px muted, line-height 1.625)

4. **Stats row** — `font-mono text-xs text-text-muted mt-4` (mono 12px muted, 16px top margin; **removed** old `text-accent/70` / `text-warm/70` color tints)

5. **Listen footer** — `mt-4 inline-flex items-center gap-1 text-sm text-text-muted group-hover:text-brand-primary-hover transition-colors` (teal hover affordance on footer only; h3 stays steady `text-text-primary`)

### Key structural changes

| Removed | Rationale |
|---------|-----------|
| `type PodcastIcon = 'dkt-logo' \| 'headphones'` | D-16 — two explicit cards, no discriminator needed |
| `podcasts[]` array with `color` + `icon` fields | D-16, D-17 — asymmetric badge treatment doesn't fit array iteration |
| Music-note SVG with path `M9 19V6l12-3v13...` | REQ-004, D-02 — replaced by AWS RU amber text badge |
| `podcast.icon === 'dkt-logo'` ternary | D-16 — explicit DKT block, no branching |
| `text-accent/70` / `text-warm/70` on stats | D-08 — reference uses mono muted without color |
| `group-hover:text-accent` on h3 | D-16 — reference h3 is steady, only footer gets teal hover |

| Preserved | Rationale |
|-----------|-----------|
| Section wrapper `py-20 sm:py-28 bg-surface/30` | CONTEXT.md code_context — section pattern consistent across phases |
| DKT logo PNG + white chrome | D-01, D-15 — brand asset over 3-letter text badge |
| Whole-card `<a>` with `card-glow` | D-05, D-10 — Fitts law big target + teal ring hover |
| Arrow SVG `M9 5l7 7-7 7` with `group-hover:translate-x-1` | D-12 — existing arrow animation |
| i18n keys (8 keys unchanged) | D-14 — `podcasts.title`, `dkt_name`, `dkt_desc`, `dkt_stats`, `aws_name`, `aws_desc`, `aws_stats`, `listen` |

### Badge treatment (asymmetric per D-01, D-02)

- **DKT card:** PNG logo at `/images/dkt-logo.png` with alt text `DevOps Kitchen Talks logo` — full brand mark. Chrome: `w-14 h-14 rounded-xl bg-white/95 p-1 flex items-center justify-center ring-1 ring-border`.
- **AWS RU card:** Inline `<span>` with text `AWS RU` (locale-invariant, not in i18n JSON per D-14). Badge classes: `inline-block font-body text-[11px] font-semibold uppercase tracking-[0.08em] px-2 py-1 rounded text-brand-accent bg-brand-accent-soft border border-brand-accent/40` — matches reference `Badge` primitive (`app.jsx:125-129`) with amber variant.

Used **preferred** bg variant `bg-brand-accent-soft` per D-06. Fallback `bg-brand-accent/10` was documented as acceptable if `-soft` reads too dim on live, but not needed — built output looks correct.

## Deviations from plan

None — plan executed exactly as written. All 17 locked decisions (D-01 through D-17) from `05-CONTEXT.md` were implemented byte-for-byte per the `<action>` block.

## Verification results

### Task 1 verification (source file)

- ✅ i18n import present: `import { t, type Locale } from '../i18n/utils'`
- ✅ Locale destructured: `const { locale } = Astro.props`
- ✅ Section id preserved: `id="podcasts"`
- ✅ 2-col grid wrapper: `grid md:grid-cols-2 gap-6`
- ✅ DKT logo src present: `/images/dkt-logo.png`
- ✅ DKT logo alt preserved: `DevOps Kitchen Talks logo`
- ✅ DKT YouTube URL: `https://www.youtube.com/c/DevOpsKitchenTalks`
- ✅ AWS RU Spotify URL: `https://podcasters.spotify.com/pod/show/awsnarusskom`
- ✅ AWS RU badge text in span (not only in comment)
- ✅ Amber soft bg token: `bg-brand-accent-soft`
- ✅ Amber 40% border token: `border-brand-accent/40`
- ✅ Mono-muted stats styling: `font-mono text-xs text-text-muted`
- ✅ Card-glow class preserved
- ✅ Arrow SVG preserved: `M9 5l7 7-7 7`
- ✅ Music-note SVG removed (path `M9 19V6l12-3v13` absent)
- ✅ PodcastIcon type removed
- ✅ podcasts array removed
- ✅ Old accent/warm tints removed (`text-accent/70`, `text-warm/70` absent)

### Task 2 verification (build + built HTML)

**Token hygiene:**
- ✅ No hardcoded hex in source (`#[0-9a-fA-F]{3,8}` — 0 matches)
- ✅ No forbidden colors: no `#06B6D4`/`#22D3EE` (deprecated cyan), no `#FF9900`/`#232F3E` (AWS orange)
- ✅ No deprecated utility classes: no `text-cyan-` or `bg-cyan-`

**Build gate:**
- ✅ `npm run build` exited 0
- ✅ Build output: **7 pages built in 889ms**
- ✅ Both `dist/en/index.html` and `dist/ru/index.html` exist

**Built DOM (EN):**
- ✅ DKT logo `<img>` count: **1** (expected 1)
- ✅ AWS RU badge text count: **3** (1 in Podcasts section + 2 elsewhere from other phases)
- ✅ Card-glow class count: **4** (2 in Podcasts + 2 elsewhere)
- ✅ Music-note SVG path count: **0** (expected 0)

**Built DOM (RU):**
- ✅ DKT logo `<img>` count: **1** (expected 1)
- ✅ AWS RU badge text count: **3** (same as EN — locale-invariant per D-14)
- ✅ Card-glow class count: **4** (same as EN)
- ✅ Music-note SVG path count: **0** (expected 0)

**REQ-004 acceptance:**
- ✅ No music-note SVG remains in source or built HTML
- ✅ DKT card has PNG logo (brand asset per D-01)
- ✅ AWS RU card has amber badge (`text-brand-accent bg-brand-accent-soft border border-brand-accent/40`)
- ✅ Badges sit top-left above title (vertical stack order guarantees this)
- ✅ Both locales render identically (same DOM structure, only i18n text differs)

## Known stubs

None — all podcast data (names, descriptions, stats, URLs) is wired from i18n JSON keys.

## Threat flags

None — no new network endpoints, no auth changes, no file access patterns, no schema changes. This is a UI rewrite of an existing static component.

## Auth gates

None.

## Commits

| Commit | Task | Message | Files |
|--------|------|---------|-------|
| `bc9aa2a` | 1 | `feat(05-01): rewrite Podcasts with DKT logo + AWS RU amber badge` | `src/components/Podcasts.astro` |

## File inventory

### Modified files

**`src/components/Podcasts.astro`** (82 lines, -14 net)
- **Before:** 95 lines — `podcasts[]` array with `.map()`, horizontal flex `[icon \| {h3, stats, desc}]` layout, `PodcastIcon` type, music-note SVG ternary, `text-accent/70` stats tints, `group-hover:text-accent` on h3 + footer
- **After:** 82 lines — two explicit card blocks, vertical stack layout, DKT PNG logo badge slot, AWS RU inline amber text badge, mono muted stats (no color tint), `group-hover:text-brand-primary-hover` on footer only

### Unchanged files (referenced by plan)

- `public/images/dkt-logo.png` — DKT logo asset (existing, reused)
- `src/i18n/en.json` — English translations (8 keys: `podcasts.title`, `dkt_name`, `dkt_desc`, `dkt_stats`, `aws_name`, `aws_desc`, `aws_stats`, `listen`)
- `src/i18n/ru.json` — Russian translations (same 8 keys)
- `src/styles/design-tokens.css` — Deep Signal tokens (no new tokens added)
- `src/styles/global.css` — Tailwind `@theme` bridge (no changes)

## Post-commit visual verification (deferred)

Per the user's established workflow (see `STATE.md` §Notes "User prefers sequential execution with visual verification on live after each phase"), visual verification on live `vedmich.dev` is deferred to post-commit via `playwright-cli`.

**Expected on live (after GH Pages deploy ~2 min):**
1. **DKT card:** PNG logo with white chrome in top-left badge slot, "DevOps Kitchen Talks" h3, description, "91+ episodes · 10K+ subscribers" in mono muted, "Listen →" footer with arrow
2. **AWS RU card:** Amber text badge `AWS RU` (11px uppercase semibold) in top-left badge slot, "AWS на русском" h3, description, "65+ episodes · 70K+ listens" in mono muted, "Listen →" footer with arrow
3. **Hover behavior:** Whole-card hover shows teal ring + box-shadow (`card-glow`), footer "Listen →" text changes to teal (`group-hover:text-brand-primary-hover`), arrow translates right (`group-hover:translate-x-1`)
4. **Typography:** h3 22px Space Grotesk, desc 15px Inter, stats 12px JetBrains Mono
5. **Both locales (EN + RU):** Identical DOM structure, only i18n text differs

**Playwright-cli command (example):**
```bash
playwright-cli open https://vedmich.dev/en/#podcasts
# Verify: 2 cards, DKT logo visible, AWS RU amber badge visible, no music-note icon
# Hover DKT card → teal ring appears, "Listen" turns teal, arrow slides right
# Hover AWS RU card → same hover behavior
```

## Next steps

1. **Push to main** → GH Actions auto-deploy → ~2 min
2. **Visual verify on live** via playwright-cli (see above)
3. **Phase 6 (Book):** If the inline amber badge pattern proves durable, the `PACKT` label in `Book.astro` (ref `app.jsx:496` — `style={{ fontFamily: VV.fontMono, fontSize: 10, color: VV.amber, letterSpacing: '0.1em' }}PACKT`) is a candidate for the same inline treatment. If a third consumer surfaces (e.g., a "Featured" badge in Blog cards), extract `src/components/Badge.astro` per D-07 deferred note.

## Self-check: PASSED

**Created files exist:**
- N/A (no new files created)

**Modified files exist:**
- ✅ `src/components/Podcasts.astro` exists with 82 lines

**Commits exist:**
- ✅ `bc9aa2a` — `git log --oneline --all | grep bc9aa2a` returns match

**Build output:**
- ✅ `dist/en/index.html` exists (7 pages built)
- ✅ `dist/ru/index.html` exists

**DOM verification:**
- ✅ Both locales contain exactly 1 DKT logo `<img>` in Podcasts section
- ✅ Both locales contain "AWS RU" badge text (inline span, not in i18n JSON)
- ✅ Both locales contain 0 music-note SVG paths

All claims in SUMMARY verified. Plan complete.
