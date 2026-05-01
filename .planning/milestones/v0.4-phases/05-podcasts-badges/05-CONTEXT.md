# Phase 5: Podcasts — DKT teal + AWS RU amber badges — Context

**Gathered:** 2026-04-20
**Status:** Ready for planning

<domain>
## Phase Boundary

Rewrite `src/components/Podcasts.astro` so the two podcast cards match the reference UI kit (`app.jsx:423-453`) structurally and visually:

1. **Vertical stack card structure** — Badge/logo slot → display-22 title (Space Grotesk 600) → Inter 15 muted body description → mono-12 muted stats → "Listen →" footer. Replaces current horizontal flex `[icon | {title, stats, desc}]` layout.
2. **Badge/logo treatment (asymmetric by design):**
   - **DKT card:** keep the existing PNG logo (`public/images/dkt-logo.png`) in the badge slot — brand recognisability is the stronger signal than a 3-letter text badge. No teal text badge added.
   - **AWS RU card:** replace the music-note SVG with an `AWS RU` amber text badge matching the `Badge` primitive (`app.jsx:125-129`).
3. **Stats typography** — ref-faithful: `font-mono text-xs text-text-muted` (was `text-sm` with accent-colored tint). Removes the teal/amber color emphasis on numeric social proof.
4. **Click interaction** — keep whole-card `<a href>` (Fitts's law, existing `card-glow` hover) but add a bottom-of-card "Listen →" text footer row (no Button component, no nested `<a>`). Reads as affordance without adding JS.
5. **Locale handling** — section title stays localized (`Podcasts` / `Подкасты`), cards stay localized (i18n keys unchanged), badge text `AWS RU` is locale-invariant (consistent with Phase 4 `CNCF Kubestronaut` / `re:Invent & Keynote Speaker` pattern).

**Out of scope:**
- Adding a Badge primitive Astro component. Podcasts is the only current consumer — inline the markup per CLAUDE.md "No premature abstraction" stance.
- Changing podcast URLs, stats copy, or descriptions (REQ-004 is visual/structural only).
- Adding an AWS-brand asset next to AWS RU (AWS orange is employer-brand, CLAUDE.md forbids; plain amber text badge is the decided replacement).
- Localizing the `AWS RU` badge text.
- Replacing `dkt-logo.png` asset — reuse as-is.

</domain>

<decisions>
## Implementation Decisions

### Badge/logo mapping (asymmetric)
- **D-01:** DKT card renders the existing PNG (`/images/dkt-logo.png`) in the badge slot — no additional teal text badge. Rationale: the DKT logo is a recognized brand mark; doubling it with a `DKT` text badge is redundant. Reference shows a text badge only because a logo asset wasn't available in the mockup.
- **D-02:** AWS RU card renders an `AWS RU` amber text badge in the badge slot — replaces the music-note `<svg>` currently there. Text is locale-invariant (matches Phase 4 pattern for brand names: Kubestronaut, DKT, AWS RU stay English in both EN and RU).
- **D-03:** Badge "slot" has a **consistent vertical position** across both cards (top-left of content). Both occupy the top rung of the vertical stack; subsequent title+desc+stats flow starts below. Logo and text-badge may differ in height (~48px vs ~24px) — that's acceptable; cards are not forced to equal-height visual mirrors.

### Card structure (vertical stack, ref-faithful)
- **D-04:** Replace current `flex items-start gap-4` horizontal layout with vertical stack. Order (top → bottom):
  1. Badge/logo slot (DKT logo ~48×48 OR `AWS RU` amber text badge).
  2. h3 title — `font-display text-[22px] font-semibold text-text-primary mt-3 mb-2` (reference `margin: '12px 0 8px'`).
  3. Description — `font-body text-[15px] text-text-muted leading-relaxed` (reference `fontSize: 15, lineHeight: 1.6, color: VV.mute`).
  4. Stats — `font-mono text-xs text-text-muted mt-4` (reference `fontFamily: mono, fontSize: 12, color: VV.muted, marginTop: 16`).
  5. "Listen →" footer — `text-sm text-text-muted group-hover:text-brand-primary-hover mt-4 inline-flex items-center gap-1` (existing i18n key `podcasts.listen` reused + arrow icon).
- **D-05:** Container card stays `group block p-6 rounded-xl bg-bg border border-border card-glow animate-on-scroll` — reuse existing `.card-glow` hover (teal ring + shadow) from previous phases. Same grid wrapper `grid md:grid-cols-2 gap-6` stays.

### Badge styling (amber, follows `Badge` primitive)
- **D-06:** Inline `<span>` matching reference `Badge` primitive literally (`app.jsx:125-129`). Tailwind classes:
  - `inline-block font-body text-[11px] font-semibold uppercase tracking-[0.08em] px-2 py-1 rounded`
  - Amber variant: `text-brand-accent bg-brand-accent-soft border border-brand-accent/40`
  - Preferred: use `/40` arbitrary opacity against `--brand-accent` token rather than inventing a new token, since the reference uses `${color}40` inline.
  - Note: `bg-brand-accent-soft` currently resolves to `#451A03` which is **darker** than the reference's `${amber}1a` (10% opacity). Acceptable on dark theme — visually readable. If executor finds contrast too dim during visual verify, fall back to `bg-brand-accent/10` arbitrary opacity.
- **D-07:** No new Badge component file. Podcasts is the sole consumer in v0.4 — inline the span. If Phase 6 (Book) or future phases need a second consumer, extract then (per CLAUDE.md "3 similar lines is better than a premature abstraction").

### Stats typography (ref-faithful, drop color emphasis)
- **D-08:** Stats line uses `font-mono text-xs text-text-muted mt-4`. Drop the current `text-accent/70` (DKT) / `text-warm/70` (AWS RU) tint — reference is muted mono, reads as tech metadata not social proof emphasis. User's preference: match reference exactly.
- **D-09:** Keep i18n keys `podcasts.dkt_stats` / `podcasts.aws_stats` unchanged. No content edit, just presentation.

### Click interaction
- **D-10:** Whole-card remains `<a href={podcast.url} target="_blank" rel="noopener noreferrer">` — no change. Fitts's law: big click target beats small button.
- **D-11:** Bottom-of-card "Listen →" row stays (footer, not Button). Structure matches current implementation line `podcasts.listen + arrow icon`. No JS added. Do NOT wrap the "Listen" span in a second `<a>` (invalid nested anchors). Reference's `Button variant="ghost"` is intentionally NOT used — reference is a React mockup with stoppable card interaction; we favor Zero-JS whole-card link here.
- **D-12:** Arrow icon: keep existing inline SVG (`M9 5l7 7-7 7`), 16px, transition `group-hover:translate-x-1 transition-transform`.

### Locale & i18n
- **D-13:** Section title `i.podcasts.title` — keep localized ("Podcasts" / "Подкасты"). No change to i18n files.
- **D-14:** `AWS RU` badge text is inline in the Astro template (hardcoded, locale-invariant). Matches Phase 4 `CNCF Kubestronaut` pattern — brand names stay English in both locales.
- **D-15:** `DKT` name is NOT rendered as a visible text string anywhere on the card (the PNG logo carries the brand). The `alt="DevOps Kitchen Talks logo"` stays for accessibility. DKT card's h3 is the full name `i.podcasts.dkt_name` = `"DevOps Kitchen Talks"`.

### Code organization & patterns
- **D-16:** Remove the `icon: PodcastIcon` conditional from the component TypeScript types and the `{podcast.icon === 'dkt-logo' ? ... : ...}` ternary. Both cards now render with the same vertical stack — the ONLY differentiator is the badge/logo slot content. Two clean options:
  - (Preferred) **Split into two explicit card blocks** — DKT and AWS RU are only two cards and will always be specific brand entries; hard-coding both clarifies intent (ref does this — `app.jsx:427-438` DKT block + `app.jsx:439-450` AWS RU block).
  - (Alt) Keep the `podcasts[]` map but make the badge slot a rendered string/element per entry (e.g., `badge: '<img>' | '<span>AWS RU</span>'`).
  - Executor's choice — prefer the first unless it produces ugly duplication (~20 lines repeated).
- **D-17:** Drop the now-unused `color: 'accent' | 'warm'` field from the podcast data. Stats are mono muted — no color branch. If executor keeps the array form (D-16 alt), drop this field anyway.

### Claude's Discretion
- Exact amber opacity for badge background (`bg-brand-accent-soft` token vs `bg-brand-accent/10` arbitrary) — visual verify during execute; both are valid.
- Whether to wrap the DKT logo in the same `w-14 h-14 rounded-xl bg-white/95 p-1 ring-1 ring-border` chrome it has now, or a slimmer chrome to better align heights with the text badge. Prefer current chrome (asset looks better on white).
- Whether `AWS RU` text badge gets `leading-none` or default line-height — executor picks the one that visually aligns with the mono stats baseline across cards.
- Padding tokens — ref uses `card padding: 24` which maps to Tailwind `p-6`; the current component already uses `p-6` so no change expected.

### Folded Todos
None.

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Reference design (source of truth)
- `/Users/viktor/.claude/skills/viktor-vedmich-design/ui_kits/vedmich-dev/app.jsx` §423-453 — `Podcasts` component: Section wrapper, 2-col grid, two Card blocks with Badge→h3→desc→stats→Button.
- `/Users/viktor/.claude/skills/viktor-vedmich-design/ui_kits/vedmich-dev/app.jsx` §125-129 — `Badge` primitive: amber/teal variant with `bg: ${color}1a, border: 1px solid ${color}40, fontSize: 11, fontWeight: 600, letterSpacing: '0.08em', textTransform: uppercase, padding: '4px 8px', borderRadius: 4`.
- `/Users/viktor/.claude/skills/viktor-vedmich-design/ui_kits/vedmich-dev/app.jsx` §157-168 — `Card` primitive: `background: surface, border: 1px solid border, borderRadius: 12, padding: 24, hover: teal border + teal-shadow glow`.
- `/Users/viktor/.claude/skills/viktor-vedmich-design/ui_kits/vedmich-dev/app.jsx` §131-155 — `Button` primitive (ghost variant for "Listen" reference; we do NOT use it — see D-11).
- `reference-1440-full.png` (project root) — visual reference screenshot.

### Roadmap & Requirements
- `.planning/ROADMAP.md` §"Phase 5 — Podcasts: DKT teal + AWS RU amber badges" — phase goal + files + verification criteria.
- `.planning/REQUIREMENTS.md` §REQ-004 — Podcasts monogram badges acceptance criteria (DKT teal + AWS RU amber, no music-note SVG, top-left badge position, both locales render identically).
- `.planning/PROJECT.md` §Constraints — no hardcoded hex, no deprecated cyan (`#06B6D4`/`#22D3EE`), AWS orange employer-brand stays out.
- `.planning/STATE.md` §"Pending todos" — Phase 5 status.

### Design system (tokens & patterns)
- `src/styles/design-tokens.css` §"Brand" (lines 78-85) — `--brand-primary` (teal), `--brand-primary-soft/hover`, `--brand-accent` (amber), `--brand-accent-soft: #451A03`, `--brand-accent-hover: #FBBF24`.
- `src/styles/global.css` §`@theme` (lines 8-48) — Tailwind utility mapping: `bg-brand-accent`, `text-brand-accent`, `bg-brand-accent-soft`, `bg-accent` (alias), `text-warm` (alias → accent). Both canonical and shim names are valid.
- `CLAUDE.md` §"Deep Signal Design System — LIVE" §"Anti-Patterns" — never hardcoded hex, never deprecated cyan, AWS orange stays employer-only.
- `CLAUDE.md` §"Architecture" §"Key Design Decisions" — Zero-JS default (only IntersectionObserver + mobile menu), i18n via JSON, tokens never hex.

### Prior phase context (carry-forward decisions)
- `.planning/phases/03-section-order-about/03-CONTEXT.md` — atomic-commit-per-phase pattern, no `set:html` in JSON (not applicable here, badge text is inline).
- `.planning/phases/04-hero-reference-match/04-CONTEXT.md` §D-03 — brand-name locale invariance (`CNCF Kubestronaut`, `DKT`, `AWS RU` stay English in both locales). §D-06 — Pill primitive inline styling precedent (no wrapper component for single-use primitives). §D-14 — ref-faithful decisions can deviate when a concrete reason exists (logos over text, chrome glow, noise overlay).

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- **`/images/dkt-logo.png`** (`public/images/dkt-logo.png`, 39KB) — DKT brand logo, 48×48 render target. Reused in D-01 badge slot. Already has `ring-1 ring-border` + `bg-white/95 p-1` chrome in current component.
- **`.card-glow` utility** (`src/styles/design-tokens.css`) — teal hover glow + border transition. Reused on both podcast cards.
- **`.animate-on-scroll` utility** + IntersectionObserver — reused for entrance animation. No change.
- **i18n keys** (`src/i18n/{en,ru}.json` §`podcasts`) — `title`, `dkt_name`, `dkt_desc`, `dkt_stats`, `aws_name`, `aws_desc`, `aws_stats`, `listen` — ALL reused unchanged. No i18n edits in this phase.

### Established Patterns
- **Inline brand-name constants** (Phase 4 D-03) — `AWS RU` and `DKT` are locale-invariant, hardcoded in templates not i18n.
- **Whole-card `<a>` links** (current Podcasts.astro, Presentations.astro, BlogPreview.astro) — cards are clickable links, not `<div>` + button. No JS click handlers.
- **Tailwind tokens over hex** (CLAUDE.md, Phase 3 D-05) — every color resolves to a `--brand-*` or `--text-*` token. Enforcement: `grep -E "#[0-9a-fA-F]{3,8}" src/components/` after execute.
- **Section wrapper pattern** — `<section id="podcasts" class="py-20 sm:py-28 bg-surface/30"><div class="max-w-6xl mx-auto px-4 sm:px-6">` matches other sections (About, Speaking, etc.) — keep as-is.

### Integration Points
- **`src/pages/{en,ru}/index.astro`** — imports `<Podcasts locale={locale} />` between About and Book. No change to import or position (REQ-009 section order locked in Phase 3).
- **`src/styles/design-tokens.css`** — ALL tokens needed already exist. No new token additions in Phase 5 (unlike Phase 4 which added `--grad-hero-flat`).
- **No JS module additions** — Podcasts remains Zero-JS. No observer, no handler.

</code_context>

<specifics>
## Specific Ideas

- **DKT logo over text badge** — User explicit: "важно быть в оригинале но не надо всё повторять - вот с лого на DKT кажется надо оставить". Ref is a mockup; real site has the logo asset already — use it.
- **Mono muted stats** — User wants ref-faithful styling for the stats row; drops the current colored tint on numeric social proof.
- **Two explicit card blocks over map** (D-16 preferred option) — matches the reference structurally; makes the asymmetric branding (logo vs text-badge) obvious in source. Planner can override if the duplication reads badly.

</specifics>

<deferred>
## Deferred Ideas

- **Badge primitive Astro component** — if a second consumer surfaces (Phase 6 Book's `PACKT` label is a likely candidate), extract the inline span into `src/components/Badge.astro`. Deferred until the second use case is concrete.
- **Podcast stats dynamic counts** — "91+ episodes · 10K+ subscribers" and "65+ episodes · 70K+ listens" are hand-maintained strings in i18n. A future milestone could wire YouTube/Spotify API counts or move to a `src/data/podcasts.ts` source of truth. Out of scope for v0.4.
- **Equal-height card sibling alignment** — logo (48px) vs amber text badge (~22px) make the badge slots different heights; title baselines in DKT/AWS RU may not align. If this reads as visual noise during verify, a follow-up (not blocking) could normalize slot height to `h-12` with `flex items-center`. Not committed in Phase 5 — user preference said "don't overdo ref".

</deferred>

---

*Phase: 05-podcasts-badges*
*Context gathered: 2026-04-20*
