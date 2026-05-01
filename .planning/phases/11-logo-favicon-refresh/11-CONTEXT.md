# Phase 11 — Logo + favicon refresh · CONTEXT

**Phase:** 11
**Name:** Logo + favicon refresh
**Date:** 2026-05-01
**Requirements:** REQ-007 (logo/favicon brand-kit refresh — see REQUIREMENTS.md:142)
**Status:** Context gathered

---

## Phase Boundary

**In scope:**
- Adopt canonical Deep Signal brand assets as browser-surface icons (favicon + Header logo).
- Match reference UI-kit Header pattern (`app.jsx:320` → `<img src="vv-logo-hero.png" 32×32 radius:7 />`).
- Extend icon coverage for modern device surfaces (iOS home screen, Android, PWA).
- Keep `.design-handoff/` bundle aligned with `public/` as single-source-of-truth.

**Out of scope:**
- Brand-asset design changes (tokens are locked — see `src/styles/design-tokens.css`).
- Footer / About / Hero component rewrites (covered by prior phases).
- Full PWA feature-set (service worker, offline shell) — only webmanifest metadata for home-screen fidelity.
- Regenerating Obsidian vault assets at `~/Documents/ViktorVedmich/40-Content/45-Personal-Brand/45.20-Brand-Kit/logo/exports/` — those are upstream and already match.

---

## Implementation Decisions

### D-01 · Header logo format — Optimised PNG @2x

Header `<img>` switches from `/favicon.svg` to a new `/vv-logo-hero.png`. Source `~/.claude/skills/viktor-vedmich-design/assets/vv-logo-hero.png` is 2.0 MB — too heavy for a 32-px render.

**Action:** Resize source PNG down to **64×64** (2× retina for a 32-px display size) with `sharp` or equivalent. Target size: ≤10 KB. Rendered at `width=32 height=32` via CSS — keeps the raster-crisp teal-V that reference uses, without the 2 MB LCP penalty.

**Why:** pixel-fidelity match with reference UI-kit (`app.jsx:320`) + performance guard.

### D-02 · Header markup

`src/components/Header.astro:39` changes from:

```astro
<img src="/favicon.svg" alt="VV" width="32" height="32" class="w-8 h-8 rounded-[7px] shrink-0" />
```

to:

```astro
<img src="/vv-logo-hero.png" alt="Viktor Vedmich" width="32" height="32" class="w-8 h-8 rounded-[7px] shrink-0" loading="eager" decoding="sync" />
```

- `alt="Viktor Vedmich"` (user preferred a11y-first over reference's `alt="VV"`).
- Keep `rounded-[7px]` (matches reference `borderRadius: 7`).
- `loading="eager" decoding="sync"` — above-the-fold logo, don't lazy-load.

### D-03 · favicon.ico — Regenerate from canonical SVG

Current `public/favicon.ico` (655 B, dated 2026-04-19 same day as SVG but content NOT regenerated from Deep Signal SVG — md5 distinct from the SVG baseline).

**Action:** Generate fresh `favicon.ico` from `public/vv-favicon.svg` as a **multi-size `.ico` (16/32/48 px)** using a deterministic tool (`sharp` + `to-ico`, or `png-to-ico` on sharp-rendered pngs, or `@realfavicongenerator/cli`).

**Why:** Safari on older iOS/macOS and Edge legacy still prefer `.ico` fallback when `<link rel="icon" type="image/svg+xml">` parsing fails. Brand debt: current .ico predates Deep Signal migration.

### D-04 · Extended icon coverage — Full set

Add to `public/`:

| File | Size | Purpose |
|------|------|---------|
| `favicon.ico` | 16/32/48 multi-size | Legacy-browser fallback |
| `favicon.svg` | any (existing, identical to vv-favicon.svg) | Modern browsers (already wired) |
| `apple-touch-icon.png` | 180×180 | iOS home screen / Safari tab / iPadOS |
| `android-chrome-192x192.png` | 192×192 | Android home screen standard |
| `android-chrome-512x512.png` | 512×512 | Android splash / PWA large |
| `site.webmanifest` | — | PWA manifest: name, short_name, theme_color, icons |

Corresponding `<link>` + `<meta>` tags added to `src/layouts/BaseLayout.astro` after line 35.

**Why:** Site bookmarking on iOS currently shows a screenshot (no apple-touch-icon). Android home-screen pin shows default icon. Both are cheap brand-leak fixes and standard for a personal-brand site.

### D-05 · webmanifest content

```json
{
  "name": "Viktor Vedmich",
  "short_name": "vedmich.dev",
  "icons": [
    { "src": "/android-chrome-192x192.png", "sizes": "192x192", "type": "image/png" },
    { "src": "/android-chrome-512x512.png", "sizes": "512x512", "type": "image/png" }
  ],
  "theme_color": "#14B8A6",
  "background_color": "#0F172A",
  "display": "browser",
  "start_url": "/"
}
```

- `theme_color` = `--brand-primary` (#14B8A6, Deep Signal teal).
- `background_color` = `--bg-base` (#0F172A, Deep Signal dark).
- `display: "browser"` — not a PWA app, just home-screen branding.
- `start_url: "/"` — root redirects auto-detect locale → `/en/` or `/ru/`.

### D-06 · BaseLayout `<link>` + `<meta>` block

Replace current `src/layouts/BaseLayout.astro:35` (single `<link>`) with full set:

```html
<link rel="icon" type="image/svg+xml" href="/favicon.svg" />
<link rel="icon" type="image/x-icon" href="/favicon.ico" sizes="16x16 32x32 48x48" />
<link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
<link rel="manifest" href="/site.webmanifest" />
<meta name="theme-color" content="#14B8A6" />
```

Note: `theme-color` hex literal is OK here — meta-tag values can't reference CSS variables, and this is the Deep Signal brand primary (tracked by REQ-007).

### D-07 · .design-handoff/ sync — Mirror new derivatives

Every new file produced (`vv-logo-hero.png` optimised, `favicon.ico` regenerated, `apple-touch-icon.png`, `android-chrome-192x192.png`, `android-chrome-512x512.png`, `site.webmanifest`) is ALSO copied to `.design-handoff/deep-signal-design-system/project/assets/`.

**Why:** `.design-handoff/` is the archival single-source-of-truth. Existing 4 files already md5-match vault → skill → public. Keeping new derivatives in the bundle prevents divergence later.

### D-08 · Source assets stay

The 4 canonical files already in `public/` (`vv-favicon.svg`, `vv-logo-primary.svg`, `vv-logo-inverse.svg`, `vv-logo-hero.png` @ 2.0 MB) STAY — they are brand source-of-truth at full resolution. Only the Header rewires to the optimised derivative.

**No rename/delete** — the heavy `vv-logo-hero.png` remains available for OG/LinkedIn previews and future full-res contexts.

### D-09 · Build tooling — inline script, not a dependency

PNG derivatives generated via a one-shot Node script using `sharp` (available transitively through Astro's image pipeline, or add as devDep). Script committed under `scripts/generate-icons.mjs`. NOT run on every build — output committed to `public/`.

**Why:** Avoid introducing a build-time image pipeline dependency for static assets that change rarely. Script-in-repo + committed output = reproducible + cacheable + no CI surprise.

### D-10 · `favicon.ico` generation — sharp + multi-page encoder

Preferred pipeline: `sharp` to render 16/32/48 PNG buffers from `vv-favicon.svg`, then `png-to-ico` (or equivalent) to pack into multi-size `.ico`. Alternative acceptable: use realfavicongenerator CLI if available in dev shell.

**Not acceptable:** online favicon generators (opaque provenance, no reproducibility).

### D-11 · Bilingual parity

No i18n strings change in this phase. Only alt text is affected (D-02) and `alt="Viktor Vedmich"` is a proper noun — same in EN and RU.

**Check:** `grep -n "favicon\|vv-logo" src/i18n/en.json src/i18n/ru.json` should return 0 matches pre- and post-phase.

### D-12 · Cache invalidation

GitHub Pages serves static with `Cache-Control: max-age=600`. After deploy:
- Hard-reload browser tab to pick up new `favicon.svg` / `favicon.ico`.
- iOS home-screen bookmarks require re-adding (iOS caches apple-touch-icon per URL aggressively).
- No cache-busting query string needed — new filenames (`vv-logo-hero.png` vs `favicon.svg`) naturally bypass cache.

---

## Canonical References

MANDATORY reads for planner and executor:

- `src/components/Header.astro:39` — current logo markup (target of D-02 change)
- `src/layouts/BaseLayout.astro:35` — current `<link rel="icon">` (target of D-06 expansion)
- `/Users/viktor/.claude/skills/viktor-vedmich-design/ui_kits/vedmich-dev/app.jsx:320` — reference Header logo pattern
- `/Users/viktor/.claude/skills/viktor-vedmich-design/assets/vv-logo-hero.png` — source for optimised 64×64
- `/Users/viktor/.claude/skills/viktor-vedmich-design/assets/vv-favicon.svg` — source for favicon.ico regeneration
- `~/Documents/ViktorVedmich/40-Content/45-Personal-Brand/45.20-Brand-Kit/logo/exports/` — upstream vault assets (already md5-match skill + public)
- `.planning/REQUIREMENTS.md:142-161` — REQ-007 acceptance criteria
- `.planning/ROADMAP.md:215-220` — Phase 11 scope
- `.design-handoff/deep-signal-design-system/project/assets/` — handoff bundle target (D-07)

---

## Existing Code Insights

### Current surface

- `public/favicon.ico` (655 B, 2026-04-19) — **stale**, predates Deep Signal refresh.
- `public/favicon.svg` (1.5 KB) — byte-identical to `public/vv-favicon.svg` (both md5 `60221f18…`). Currently active via BaseLayout:35.
- `public/vv-logo-primary.svg` (1.7 KB), `public/vv-logo-inverse.svg` (1.8 KB), `public/vv-favicon.svg` (1.5 KB) — canonical Deep Signal, md5-match vault + skill.
- `public/vv-logo-hero.png` (2.0 MB) — high-res source, NOT referenced by any component currently.
- `src/components/Header.astro:39` — serves `/favicon.svg` (NOT the reference's `vv-logo-hero.png`).
- `src/components/Footer.astro` — no logo/favicon usage (only social-icon SVG paths inlined).
- `src/layouts/BaseLayout.astro:35` — only `<link rel="icon" type="image/svg+xml">`, no apple-touch-icon, no manifest, no theme-color.

### Reference pattern

From `app.jsx:319-323`:
```jsx
<a href="#" className="flex items-center gap-2.5 group">
  <img src="../../assets/vv-logo-hero.png" alt="VV" style={{ width: 32, height: 32, borderRadius: 7 }}/>
  <span className="font-display font-bold text-base text-text-primary ...">vedmich.dev</span>
</a>
```

Matches current Header structure byte-for-byte except for the `<img src>` attribute.

### Reusable

- `sharp` CLI or programmatic API — already a common dep via Astro ecosystem; if not in devDeps, `npm i -D sharp` is acceptable.
- `.design-handoff/deep-signal-design-system/project/assets/` directory exists and contains the same 4 canonical files → mirror pattern established.

---

## Folded Todos

None — no pending todos matched Phase 11 scope.

---

## Deferred Ideas

### Not in Phase 11 scope — propose for future:

- **Lighthouse audit for icons** — verify apple-touch-icon loads correctly on iOS, webmanifest parses on Android DevTools. Belongs to a post-v0.4 quality pass, not this asset-swap phase.
- **OG/Twitter card image refresh** — reference uses `og:image`, but that's a different asset (`vv-logo-hero.png` at 1200×630 layout). Belongs to a dedicated social-preview phase after content is stable.
- **Maskable icon variant** — Android PWA adaptive-icon safe-area rendering. Only relevant if display becomes `"standalone"` (not in scope here).
- **Dark-mode favicon** — `<link rel="icon" media="(prefers-color-scheme: dark)">` for browsers that honor media queries in icon links. vv-favicon.svg already renders Deep Signal teal on any background, so low ROI until the site adds a light theme toggle.

---

## Verification Checklist (handoff to planner)

A successful Phase 11 means:

- [ ] `public/vv-logo-hero.png` exists at ≤10 KB (not the original 2 MB).
- [ ] `public/favicon.ico` regenerated from `vv-favicon.svg`, multi-size 16/32/48.
- [ ] `public/apple-touch-icon.png` (180×180), `public/android-chrome-192x192.png`, `public/android-chrome-512x512.png` exist.
- [ ] `public/site.webmanifest` exists with content per D-05.
- [ ] `src/components/Header.astro:39` serves `/vv-logo-hero.png` with `alt="Viktor Vedmich"`.
- [ ] `src/layouts/BaseLayout.astro:35` has the full `<link>` + `<meta theme-color>` block per D-06.
- [ ] Header computed rendered size is 32×32 at 1440 viewport (no distortion, no layout shift).
- [ ] Browser tab favicon shows the Deep Signal teal V on hard-reload in Chrome + Safari.
- [ ] Adding the site to iOS home screen shows the teal-V logo, not a page screenshot.
- [ ] `npm run build` exits 0, 7 pages emit, no asset warnings.
- [ ] All new/regenerated artifacts mirrored into `.design-handoff/deep-signal-design-system/project/assets/`.
- [ ] No hex literals added to `src/` (only `theme-color` meta tag contains `#14B8A6`, justified by D-06).
- [ ] `scripts/generate-icons.mjs` committed; re-runnable.
- [ ] Both `/en/` and `/ru/` render unchanged except for the Header logo swap.

---

## Next Steps

`/clear` then: `/gsd-plan-phase 11`
