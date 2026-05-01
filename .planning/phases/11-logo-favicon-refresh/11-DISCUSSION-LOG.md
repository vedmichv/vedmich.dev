# Phase 11 — Discussion Log

**Date:** 2026-05-01
**Mode:** discuss (default)
**Duration:** single session

---

## Gray areas presented

1. **Header logo format** — PNG (raw vs optimised) vs SVG
2. **favicon.ico fate** — regenerate / delete / keep
3. **Extended icon coverage** — full PWA set / apple-touch only / SVG minimum
4. **Handoff bundle sync** — leave + add derivatives / skip

All 4 selected by user for discussion.

---

## Area 1 · Header logo format

**Context:** Reference `app.jsx:320` uses `<img src="vv-logo-hero.png" 32×32 radius:7>`. Current `Header.astro:39` serves `/favicon.svg`. Source PNG in vault/skill = 2.0 MB (1024×1024), way oversized for 32-px render.

**Options presented:**
- Optimised PNG 64×64 @2x (recommended — ~5–10 KB sharp-resize)
- PNG as-is (2.0 MB raw)
- Stay on SVG

**Selected:** Optimised PNG 64×64 @2x

**Rationale:** Pixel-fidelity with reference + no LCP penalty. Raw 2 MB is performance-indefensible on a 32-px render.

---

## Area 2 · favicon.ico fate

**Context:** `public/favicon.ico` (655 B, 2026-04-19) predates Deep Signal refresh. Modern browsers use SVG link, but legacy Safari / iOS / Edge still fallback to `.ico`.

**Options presented:**
- Regenerate from SVG (recommended — 16/32/48 multi-size)
- Delete file
- Keep as-is

**Selected:** Regenerate from SVG

**Rationale:** Cheap legacy compat + clears brand debt.

---

## Area 3 · Extended icon coverage

**Context:** iOS currently shows page screenshot on home-screen bookmark (no apple-touch-icon). Android shows default icon. Reference UI-kit is silent on this but personal-brand site conventions include full set.

**Options presented:**
- Full set: apple-touch + manifest (recommended)
- Apple-touch only
- SVG-only minimum

**Selected:** Full set: apple-touch + manifest

**Rationale:** Standard coverage for personal-brand site; fixes visible iOS bookmark gap; low cost once we're generating PNG derivatives anyway.

---

## Area 4 · Handoff bundle sync

**Context:** `.design-handoff/.../project/assets/` already md5-matches vault → skill → public for the 4 existing canonical files. New derivatives need a destination.

**Options presented:**
- Leave as-is, add new files (recommended)
- Skip handoff sync

**Selected:** Leave as-is, add new files

**Rationale:** Keep single-source-of-truth bundle complete. No refactor of existing sync structure.

---

## Follow-up · Logo a11y alt text

**Context:** Reference uses `alt="VV"`. A11y-preferred alternatives: `alt="Viktor Vedmich"` or `alt=""` (decorative, paired with adjacent "vedmich.dev" text link).

**Options presented:**
- `alt="VV"` (match reference, recommended)
- `alt="Viktor Vedmich"`
- `alt=""` (decorative)

**Selected:** `alt="Viktor Vedmich"`

**Rationale:** User chose a11y bump over strict reference parity. Proper noun — same in EN and RU, so no i18n key needed.

---

## Claude's discretion items (no user question)

- **Tooling:** `sharp` + `png-to-ico` for local generation. No online generators (opaque provenance).
- **Script location:** `scripts/generate-icons.mjs` — not a build-step, re-runnable when brand assets change.
- **Source PNG kept:** The 2.0 MB `public/vv-logo-hero.png` stays for OG/LinkedIn preview use-cases; Header serves an optimised derivative.
- **Icon `<link>` order:** SVG first (modern browsers stop at first match), .ico second (legacy fallback), apple-touch third, manifest fourth, theme-color meta last.
- **Theme-color hex literal:** `#14B8A6` in BaseLayout meta tag is unavoidable (HTML meta values can't reference CSS vars). Justified by REQ-007 + Deep Signal brand primary.
- **webmanifest `display: "browser"`:** Not a PWA — just home-screen branding. Avoids triggering "Install app" prompts.

---

## Deferred

- Lighthouse audit of icons (post-v0.4 quality pass).
- OG/Twitter card image refresh (separate phase after content stable).
- Maskable icon variant (only if display becomes `"standalone"`).
- Dark-mode favicon variant (no site light-theme toggle yet).

---

## Scope creep redirected

None — user stayed in scope.
