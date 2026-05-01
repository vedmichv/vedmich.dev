# Phase 12 — Footer match · CONTEXT

**Phase:** 12
**Name:** Footer match
**Date:** 2026-05-01
**Requirements:** NEW REQ-012 (ROADMAP.md:242-248)
**Status:** Context gathered

---

## Domain

Rewrite `src/components/Footer.astro` to match the Deep Signal reference UI kit footer
(`app.jsx:640-648`) — a minimal two-column layout used across every page via `BaseLayout.astro:72`.

**Reference source** (`app.jsx:640-648`):

```jsx
const Footer = () => (
  <footer style={{ padding: '32px 24px', borderTop: `1px solid ${VV.border}` }}>
    <div style={{ maxWidth: 1120, margin: '0 auto', display: 'flex', justifyContent: 'space-between',
      fontFamily: VV.fontBody, fontSize: 13, color: VV.muted }}>
      <span>© 2026 Viktor Vedmich</span>
      <span>Built with Astro</span>
    </div>
  </footer>
);
```

Last piece of the v0.4 reference-audit milestone (Phase 12 closes it).

---

## Phase Boundary

**In scope:**
- Delete 5 social-icon SVG blocks from `src/components/Footer.astro` (LinkedIn, GitHub, YouTube, X, Telegram).
- Drop `import { socialLinks } from '../data/social'` (unused after icon removal).
- Swap container to `max-w-[1120px]` to align with Hero + Presentations (v0.4 grid).
- Drop `bg-surface/30` background; reduce border alpha from `/50` to solid `border-border`.
- Switch font size to `text-[13px]` to match reference pixel-for-pixel.
- Preserve bilingual i18n (`i.footer.copyright` + `i.footer.built_with`) — bilingual constraint from REQUIREMENTS.md global-acceptance.
- Preserve dynamic `new Date().getFullYear()` — auto-updates past 2026.

**Out of scope:**
- `socialLinks` data/export in `src/data/social.ts` — still consumed by Contact section (Phase 10). Footer stops consuming it, but the export stays.
- New footer capabilities (nav links, legal, newsletter, sitemap) — would be their own phase.
- Hardcoded year literal (reference has `2026`, but living site needs dynamic).

---

## Implementation Decisions

### D-01 · Remove social icons entirely

The current footer renders 5 inline SVG social links (`Footer.astro:17-36`). Reference UI kit
(`app.jsx:640-648`) has NO social icons — just two text spans. Contacts already live in the
Contact section via Phase 10 letter-badges + working form.

**Action:** Delete the `<div class="flex items-center gap-4">...</div>` block containing the
5 SVG anchors. Remove the `import { socialLinks } from '../data/social';` line — unused after.

**Why:** Strict reference match + no capability loss (Contact section carries all 5 platforms).
Dead-code removal: the `socialLinks.map` path + 5 hardcoded SVG `<path>` blocks stop executing.

### D-02 · Container + padding + bg alignment

Footer wrapper currently: `<footer class="border-t border-border/50 bg-surface/30">` → inner
`<div class="max-w-6xl mx-auto px-4 sm:px-6 py-8">`.

Reference: `<footer style={{ padding: '32px 24px', borderTop: 1px solid border }}>` → inner
`<div style={{ maxWidth: 1120, ..., display: flex, justifyContent: space-between, color: muted }}>`.

**Action:**
- Wrapper: `<footer class="border-t border-border">` — drop `bg-surface/30`, drop `/50` alpha on border.
- Inner container: `<div class="max-w-[1120px] mx-auto px-4 sm:px-6 py-8">` — switch from `max-w-6xl` (1152px) to `max-w-[1120px]` (matches Hero, Presentations).
- **Keep `px-4 sm:px-6` mobile guard** — reference renders at 1440px only; 24px on 375px mobile is too tight.
- `py-8` = 32px vertical (already correct).

**Why:** Container width (`max-w-[1120px]`) aligns footer with every other v0.4 section. Dropping
`bg-surface/30` gives the base `--bg-base` gradient continuity to the edge of the page, matching
reference visual tone. Mobile `px-4` is not a reference-breaker — reference never rendered mobile.

### D-03 · Dynamic copyright year (i18n preserved)

Reference hardcodes `© 2026 Viktor Vedmich`. Current uses `i.footer.copyright.replace('{year}', String(new Date().getFullYear()))`.

**Action:** Keep the current dynamic `{year}` + i18n-template pattern. No change.

**Why:** Static `2026` requires manual update every January. Dynamic year auto-scrolls without
touching the codebase. The reference artifact was a 2026-snapshot — it wouldn't age gracefully.
i18n template stays intact: EN `"© {year} Viktor Vedmich"` / RU `"© {year} Виктор Ведмич"`.

### D-04 · Font size `text-[13px]` + bilingual i18n preserved

Reference `fontSize: 13`. Current `text-sm` = 14px. Bilingual: EN `"Built with Astro"` /
RU `"Создано на Astro"` (already exists in `src/i18n/{en,ru}.json` → `footer.built_with`).

**Action:**
- Replace `text-sm` with `text-[13px]` (Tailwind arbitrary value) on the inner `<div>`.
- Keep `text-text-muted` (Deep Signal token, equivalent to reference `VV.muted` = `#78909C`).
- Keep bilingual `i.footer.built_with` — do NOT revert to EN-only.

**Why:** 13px = pixel-match with reference. Bilingual is a v0.4 global constraint
(REQUIREMENTS.md: "Bilingual edits — every text change must land in BOTH `src/i18n/en.json`
and `src/i18n/ru.json`"). Hard-coding EN "Built with Astro" breaks RU reader UX.

### D-05 · Final Footer.astro target shape

```astro
---
import { t, type Locale } from '../i18n/utils';

interface Props {
  locale: Locale;
}

const { locale } = Astro.props;
const i = t(locale);
const year = new Date().getFullYear();
---

<footer class="border-t border-border">
  <div class="max-w-[1120px] mx-auto px-4 sm:px-6 py-8 flex items-center justify-between text-[13px] text-text-muted">
    <span>{i.footer.copyright.replace('{year}', String(year))}</span>
    <span>{i.footer.built_with}</span>
  </div>
</footer>
```

**LOC delta:** 43 → ~14 lines (remove 5 SVG blocks + socialLinks import + wrapping divs).

---

## Code Context

### Primary target

- `src/components/Footer.astro` — full rewrite (43 → ~14 lines). Referenced once by
  `src/layouts/BaseLayout.astro:72` (`<Footer locale={locale} />`). Props contract unchanged:
  still takes `{ locale }`, still uses `t(locale)` helper.

### i18n keys used (no changes needed)

- `src/i18n/en.json:96-99` — `footer.built_with: "Built with Astro"`, `footer.copyright: "© {year} Viktor Vedmich"`
- `src/i18n/ru.json:96-99` — `footer.built_with: "Создано на Astro"`, `footer.copyright: "© {year} Виктор Ведмич"`

Both already present — no `i18n` migration needed.

### Reusable tokens (design-tokens.css — no changes needed)

- `--text-muted` = `#78909C` (matches reference `VV.muted`)
- `--border` = `#334155` (matches reference `VV.border`)
- `--bg-base` gradient (shows through after `bg-surface/30` removal)

Tailwind utilities via `@theme` bridge in `global.css`: `text-text-muted`, `border-border`.

### Removed / dead after this phase

- `import { socialLinks } from '../data/social'` in `Footer.astro` — removed.
- 5 SVG `<path>` blocks (LinkedIn, GitHub, YouTube, X/Twitter, Telegram) — removed.
- `bg-surface/30` class, `border-border/50` alpha, `max-w-6xl` class — replaced.
- `text-sm` → `text-[13px]`.

`src/data/social.ts` `socialLinks` export stays — consumed by Contact section (Phase 10).

### Global constraints (from REQUIREMENTS.md + CLAUDE.md)

- No hardcoded hex in `Footer.astro` (tokens only).
- No deprecated cyan (`#06B6D4` / `#22D3EE`).
- Bilingual parity — every text change in BOTH `en.json` and `ru.json`. (Already symmetric.)
- `npm run build` must pass with 7 pages.

---

## Canonical Refs (MANDATORY reading for downstream agents)

| Path | Purpose |
|---|---|
| `~/.claude/skills/viktor-vedmich-design/ui_kits/vedmich-dev/app.jsx` | Reference source, lines 640-648 define target footer |
| `.planning/ROADMAP.md` | Phase 12 scope (line 242-248), REQ-012 definition |
| `.planning/REQUIREMENTS.md` | Global acceptance (line 285-292): bilingual, no-hex, build-passes |
| `.planning/PROJECT.md` | Current milestone v0.4 state, Phase history |
| `src/components/Footer.astro` | Current implementation (target for rewrite) |
| `src/layouts/BaseLayout.astro` | Consumer — line 72 `<Footer locale={locale} />` |
| `src/styles/design-tokens.css` | Token definitions (`--text-muted`, `--border`, `--bg-base`) |
| `src/i18n/en.json` | `footer.copyright` + `footer.built_with` (lines 96-99) |
| `src/i18n/ru.json` | Russian mirrors (lines 96-99) |
| `.planning/phases/10-contact-letter-badges-working-form/10-CONTEXT.md` | Prior decision: contacts moved into Contact section (letter-badges), footer no longer primary home for socials |
| `.planning/phases/11-logo-favicon-refresh/11-CONTEXT.md` | Prior phase context style reference (mature CONTEXT.md pattern) |

---

## Prior Decisions Carried Forward

**From PROJECT.md (validated decisions):**
- Tokens never hex (strict) — all color references via CSS variable tokens.
- Bilingual parity — every text change lands in both `en.json` + `ru.json`.
- Small changes push straight to main (no PR for sub-15min fixes).
- Zero-JS default — Footer has no JS, this is safe.

**From Phase 10 (Contact):** Contacts moved into Contact section as letter-badges (L/G/Y/X/T) + working form. Footer no longer needs to duplicate social links.

**From Phase 4 + 8 (Hero + Presentations):** v0.4 container width = `max-w-[1120px]`. Footer aligns with this pattern.

**From CLAUDE.md (communication):**
- Interactive questions in Russian (GSD rule) — applied during this discuss.
- Artifacts in English — this CONTEXT.md is in English.

---

## Deferred Ideas

None. Footer is intentionally minimal; no scope creep was proposed.

**Noted for future (not this phase):** a Phase X could add "back to top" button, social row
restored with letter-badges (mirror Contact), legal links, or newsletter signup — all separate
capabilities that would need their own phases.

---

## Acceptance Criteria (derived for planner)

1. `src/components/Footer.astro` contains NO `socialLinks` import and NO `<svg>` tags.
2. `src/components/Footer.astro` wrapper uses `border-t border-border` (solid, no alpha).
3. Inner container uses `max-w-[1120px]` (not `max-w-6xl`) and `text-[13px]`.
4. Dynamic year via `new Date().getFullYear()` preserved; `i.footer.copyright` + `i.footer.built_with` preserved.
5. No `bg-surface/30` class on footer wrapper.
6. `npm run build` passes with 7 pages.
7. Both `/en/` and `/ru/` dist HTML render symmetric footer markup (text content differs, structure identical).
8. No hardcoded hex in `Footer.astro`.
9. Computed font-size of footer `<div>` at 1440px = 13px.
10. LOC delta: `Footer.astro` shrinks from 43 lines to ~14 lines.

---

## Est. Effort

~10 min (single-plan phase, one file rewrite).

---

## Next Steps

1. `/gsd-plan-phase 12` — create `12-01-PLAN.md` for the Footer rewrite.
2. Execute plan → atomic commit → push to main.
3. Visual verify live via `playwright-cli` (EN + RU at 1440px + 375px).
4. Close v0.4 milestone after Phase 12 ships.
