# Phase 3: Section order + About — Context

**Gathered:** 2026-04-19
**Status:** Ready for planning

<domain>
## Phase Boundary

Bring vedmich.dev homepage in line with the reference UI kit (`app.jsx`) on two fronts:

1. **Section order** — reorder homepage so that sections render as `Hero → About → Podcasts → Book → Speaking → Presentations → Blog → Contact` (Book moves up, before Speaking) in both `/en/` and `/ru/`. Header nav items mirror the new order (desktop + mobile menu).
2. **About component restyle** — rewrite `About.astro` to match reference layout (`app.jsx:400-421`): 2-col grid (`1.4fr 1fr` above md breakpoint, stacked below), bio left with teal-highlighted book title, `"Expertise"` overline + skill pills right, duplicate certifications block removed entirely.

Out of scope: adding new sections, rewriting other components, changing i18n for non-About keys, touching the Hero cert bar, styling Nav beyond reordering `navItems` array, adding a Projects section (deferred).

</domain>

<decisions>
## Implementation Decisions

### Bio copy structure
- **D-01:** Split bio across three i18n keys — `about.bio_before`, `about.bio_accent`, `about.bio_after`. Template wraps `bio_accent` in a `<span class="text-brand-primary">…</span>`. No HTML inside JSON values, no `set:html`, no in-component string parsing. Preserves translator-friendliness and matches the project's "JSON translations + typed helper" pattern.
- **D-07:** `about.bio_accent` = `"«Cracking the Kubernetes Interview»"` in BOTH EN and RU — the book is English-only, so name stays verbatim (with guillemets `«»` per RU punctuation convention retained across locales for visual consistency with the reference).

### Skill pill style
- **D-02:** Match reference `Pill` primitive (`app.jsx:116-123`) exactly. Classes: `rounded-full text-[13px] font-medium px-3.5 py-1.5 bg-surface border border-border text-text-primary`. Remove the current `hover:border-accent/50 hover:text-text` hover effect — reference has none; keeps the component a static visual element.

### Certifications block fate
- **D-03:** Remove the entire certifications block from `About.astro` — both the cert cards (`certifications.map(...)`) and the "CNCF Kubernaut = all 5 K8s certs" callout. Hero already shows all 6 badges. Also:
  - Drop the `certifications` import from `About.astro` frontmatter.
  - Remove `about.certs_title` key from BOTH `src/i18n/en.json` and `src/i18n/ru.json` (no longer referenced). Keep `certifications` export in `src/data/social.ts` untouched — Hero still consumes it.

### Header navigation order
- **D-04:** Reorder `navItems` in `src/components/Header.astro` to mirror the new section order: `about → podcasts → book → speaking → presentations → blog → contact`. Mobile menu reuses the same `navItems` array, so it picks up the change automatically. No i18n changes needed (all `nav.*` keys already exist).

### Token hygiene
- **D-05:** Replace deprecated shim utilities in `About.astro` with canonical Deep Signal tokens. Concrete mapping:
  - Section remains on default `bg-bg` (no explicit bg class).
  - "Expertise" overline: `text-text-secondary` (reference uses `VV.mute` which maps to `--text-secondary: #94A3B8`).
  - Pill text: `text-text-primary` (reference uses `VV.text` which maps to `--text-primary: #E2E8F0`).
  - Bio paragraph: `text-text-primary` (reference uses `VV.text` on bio at 18px / line-height 1.7).
  - Bio accent span: `text-brand-primary` (teal `#14B8A6`, matching `VV.teal` in reference).
  - The warm/amber callout disappears with the cert block, so `bg-warm/5` / `border-warm/20` / `text-warm` are not present in the new markup.

### Responsive layout
- **D-06:** Keep the existing breakpoint pattern: stacked single column below md (768px), 2-column grid above. Grid template becomes `md:grid-cols-[1.4fr_1fr]` (reference ratio). Gap between columns: `gap-10` (40px, matching reference `gap: 40`). On mobile, order is Bio → overline+pills (natural DOM order preserves semantic flow).

### Vertical rhythm / spacing
- **D-08:** Match reference `Section` spacing (`app.jsx:102` — `padding: 80px 24px`). Component wrapper uses `py-20` (80px) — drop the `sm:py-28` bump we currently have. Inner spacing inside the right column: overline `mb-3` (12px), pills wrapper `gap-2` (8px) — reference values from `app.jsx:411-417`. Section title stays at current `mb-12` (matches reference `marginBottom: 40` approximately; acceptable since no regression flag).

### Claude's Discretion
- Whether to keep the outer `animate-on-scroll` class on the two columns (scroll fade-in) — reference has no animation; project has it on other sections. Suggest keeping for consistency within the site.
- Exact Tailwind util spelling when it differs trivially (e.g. `text-[13px]` vs a defined token) — prefer arbitrary value only when no `text-sm`/`text-base` fits within ±1px.
- Whether to translate `about.bio_before` to preserve the RU book-author sentence structure naturally around the (untranslated) book title — keep it idiomatic in each language, even if sentence structure differs slightly from EN.

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Reference design
- `/Users/viktor/.claude/skills/viktor-vedmich-design/ui_kits/vedmich-dev/app.jsx` §400-421 — `About` component: grid template, bio + overline + pills layout, teal accent span
- `/Users/viktor/.claude/skills/viktor-vedmich-design/ui_kits/vedmich-dev/app.jsx` §116-123 — `Pill` primitive: default variant styles, dimensions, font
- `/Users/viktor/.claude/skills/viktor-vedmich-design/ui_kits/vedmich-dev/app.jsx` §100-114 — `Section` primitive: padding, max-width, title/subtitle typography
- `/Users/viktor/.claude/skills/viktor-vedmich-design/ui_kits/vedmich-dev/app.jsx` §308 — nav item order in the reference `Header` (`about · podcasts · book · speaking · presentations · blog · contact`)
- `/Users/viktor/.claude/skills/viktor-vedmich-design/ui_kits/vedmich-dev/app.jsx` §670-684 — app composition root showing section render order

### Roadmap & Requirements
- `.planning/ROADMAP.md` §"Phase 3 — Section order + About: match reference" — phase scope, files list, verification steps
- `.planning/REQUIREMENTS.md` §"REQ-008" — "About: drop duplicate cert cards"
- `.planning/ROADMAP.md` §"Phase 3" introduces implicit REQ-009 (section order) and REQ-010 (Book before Speaking) — scope reference only

### Existing code to respect
- `src/components/About.astro` — current implementation (grid md:grid-cols-2, px-3 py-1.5 rounded-lg pills, cert cards, CNCF callout). Full rewrite target.
- `src/components/Header.astro` §12-20 — `navItems` array order; reordering here propagates to desktop + mobile nav since mobile reuses the same array.
- `src/pages/en/index.astro` §16-23, `src/pages/ru/index.astro` §16-23 — hard-coded section render order; both must be updated identically.
- `src/i18n/en.json` §"about" — `bio`, `title`, `skills_title`, `certs_title` keys. `bio` to be replaced with three-key split; `certs_title` removed.
- `src/i18n/ru.json` §"about" — same keys, identical mutation, with RU translations for `bio_before`/`bio_after`, shared untranslated accent.
- `src/data/social.ts` — exports `skills`, `certifications`. Only `skills` used in new About; `certifications` still exported for Hero.
- `src/styles/design-tokens.css` — canonical tokens (`--brand-primary`, `--text-primary`, `--text-secondary`, `--bg-surface`, `--border`). No new tokens needed.
- `src/styles/global.css` — `@theme` mapping that resolves `text-brand-primary`, `bg-surface`, etc.

### Project rules
- `CLAUDE.md` §"Deep Signal Design System" — token hygiene, anti-patterns (no deprecated cyan, no hardcoded hex, DKT/AWS colors forbidden in Deep Signal context)
- `CLAUDE.md` §"Content Workflow" — bilingual edits land in BOTH `src/i18n/en.json` and `src/i18n/ru.json`
- `CLAUDE.md` §"Publishing Workflow" — small visual changes push straight to main, no PR
- `CLAUDE.md` §"GSD workflows" — ask in RU, record artifacts in EN (applied during this discussion)

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- **i18n pipeline** — `src/i18n/utils.ts → t(locale)` returns a typed object. Extending `about.*` keys is a one-line change per JSON file; the component consumes via `const i = t(locale); i.about.bio_before` — typed access is automatic once JSON changes, but TypeScript may need a tsc/astro check pass after the JSON mutation.
- **Tailwind `@theme` utilities** — `text-brand-primary`, `bg-surface`, `border-border`, `text-text-primary`, `text-text-secondary` are all resolved via `src/styles/global.css`. No new CSS needed.
- **`skills` array** — already imported/mapped in About; keep identical pattern (`skills.map(s => <span>{s}</span>)`).
- **`animate-on-scroll`** — existing IntersectionObserver hook applies fade-in. Reuse on both columns.

### Established Patterns
- **Zero-JS default** — About is a purely static Astro component. No client scripts needed. (Consistent with Phase 2 constraint: only SearchPalette + mobile menu + scroll observer use JS.)
- **Atomic commit per phase** — single commit that touches `About.astro` + both `index.astro` pages + `Header.astro` + both i18n JSON files, push straight to main.
- **Design tokens only** — utility class names resolve to token CSS vars; no hardcoded hex in the markup.
- **Bilingual parity** — every text/structure change lands in both EN + RU (D-07 clarifies that the book title stays English in both).

### Integration Points
- **`src/pages/{en,ru}/index.astro`** — swap the lines that import + render components: move `<Book locale={locale} />` above `<Speaking locale={locale} />` in both files.
- **`src/components/Header.astro`** `navItems` array — single edit reorders desktop and mobile menu simultaneously.
- **`src/components/About.astro`** — full component rewrite: new imports (`{ skills }` only, drop `certifications`), new JSX structure (grid + bio + overline + pills), new class lists.
- **`src/i18n/{en,ru}.json`** — `about.bio` → `about.bio_before` + `about.bio_accent` + `about.bio_after`; remove `about.certs_title`.

</code_context>

<specifics>
## Specific Ideas

- Section wrapper: `<section id="about" class="py-20">`. Title: `<h2 class="font-display text-3xl font-bold mb-12 animate-on-scroll">`.
- Grid: `grid md:grid-cols-[1.4fr_1fr] gap-10 items-start`.
- Bio paragraph: `<p class="font-body text-lg leading-relaxed text-text-primary animate-on-scroll">`.
- Bio accent span: `<span class="text-brand-primary">«Cracking the Kubernetes Interview»</span>` inline inside the paragraph.
- Right column: `<div class="animate-on-scroll">` wraps the overline + pills.
- Overline: `<div class="font-body text-[11px] font-semibold uppercase tracking-[0.08em] text-text-secondary mb-3">Expertise</div>` (EN) / `Экспертиза` (RU) — reuses existing `about.skills_title` key.
- Pills: `<div class="flex flex-wrap gap-2">` → `<span class="inline-flex items-center rounded-full px-3.5 py-1.5 text-[13px] font-medium bg-surface border border-border text-text-primary">{skill}</span>`.
- Reference punctuation: RU keeps `«»` guillemets around the book title (already standard RU quoting, matches visual consistency with EN reference).

</specifics>

<deferred>
## Deferred Ideas

- **Projects section** — new capability: showcase GitHub projects, OSS contributions, or side projects in a dedicated section. Needs its own phase to decide data source (GitHub API? curated `social.ts` array?), card format, placement in section order (likely between Book and Speaking, or after Presentations), and whether to pull live metrics (stars, last commit) at build time. Not Phase 3 scope.
- **"Expertise" overline copy variation per locale** — current `about.skills_title` key ("Expertise" / "Экспертиза") is reused. If a richer overline is wanted later (e.g., "Core stack"), revisit in a dedicated micro-copy pass.
- **Pill hover interactions** — could add subtle teal border on hover for interactive feedback. Skipped per D-02 to match reference exactly.
- **Section transition animations** — current `animate-on-scroll` works; reference has no animations. Could revisit to match reference more literally later (low value).

</deferred>

---

*Phase: 03-section-order-about*
*Context gathered: 2026-04-19*
