# Phase 11: Logo + favicon refresh — Pattern Map

**Mapped:** 2026-05-01
**Files analyzed:** 16 (2 modify, 14 create — 8 in `public/`, 6 mirror copies in `.design-handoff/`, 1 `scripts/generate-icons.mjs`)
**Analogs found:** 4 / 16 with strong in-repo analogs; remaining files are binary assets or greenfield tooling with no in-repo precedent (pattern sourced from RESEARCH/ecosystem instead).

---

## File Classification

### Files to modify

| File | Role | Data Flow | Closest Analog | Match Quality |
|------|------|-----------|----------------|---------------|
| `src/components/Header.astro` | component (layout/nav) | request-response (SSG render) | itself, line 39 (one-line `<img>` swap) | exact (self-patch) |
| `src/layouts/BaseLayout.astro` | component (HTML shell) | request-response (SSG render) | itself, line 35 + lines 39–41 (existing `<link rel="preload">` block for fonts) | exact (self-patch + sibling block pattern) |

### Files to create

| File | Role | Data Flow | Closest Analog | Match Quality |
|------|------|-----------|----------------|---------------|
| `scripts/generate-icons.mjs` | utility (build-time asset generator) | batch / file-I/O transform | `remark-reading-time.mjs` (root) + `astro.config.mjs` (root) | role-partial (ESM module shape) — no build-time asset script exists yet |
| `public/vv-logo-hero.png` (64×64, ≤10 KB) | static asset (raster) | file-I/O (dist-copy) | `public/favicon.svg` / `public/favicon.ico` (existing `public/` conventions) | role-match (static public asset) |
| `public/favicon.ico` (regenerated, multi-size 16/32/48) | static asset (raster) | file-I/O (dist-copy) | current stale `public/favicon.ico` (655 B, 2026-04-19) | exact (regenerate in place) |
| `public/apple-touch-icon.png` (180×180) | static asset (raster) | file-I/O (dist-copy) | `public/favicon.svg` | role-match |
| `public/android-chrome-192x192.png` | static asset (raster) | file-I/O (dist-copy) | `public/favicon.svg` | role-match |
| `public/android-chrome-512x512.png` | static asset (raster) | file-I/O (dist-copy) | `public/favicon.svg` | role-match |
| `public/site.webmanifest` | config (JSON manifest) | request-response (served static) | `public/CNAME` (only other non-code config in `public/`) | role-partial (both are static-served plain-file configs) |
| `.design-handoff/deep-signal-design-system/project/assets/vv-logo-hero.png` (optimised copy) | archival asset (mirror) | file-I/O (one-shot copy) | existing `vv-logo-hero.png` (1.87 MB) already in same directory | exact (overwrite-in-place) |
| `.design-handoff/.../favicon.ico` (mirror) | archival asset (mirror) | file-I/O (one-shot copy) | existing 4 canonical files (`vv-favicon.svg`, `vv-logo-primary.svg`, `vv-logo-inverse.svg`, `vv-logo-hero.png`) in same dir | exact (same mirror pattern) |
| `.design-handoff/.../apple-touch-icon.png` (mirror) | archival asset (mirror) | file-I/O (one-shot copy) | same as above | exact |
| `.design-handoff/.../android-chrome-192x192.png` (mirror) | archival asset (mirror) | file-I/O (one-shot copy) | same as above | exact |
| `.design-handoff/.../android-chrome-512x512.png` (mirror) | archival asset (mirror) | file-I/O (one-shot copy) | same as above | exact |
| `.design-handoff/.../site.webmanifest` (mirror) | archival asset (mirror) | file-I/O (one-shot copy) | same as above | exact |

---

## Corrections to CONTEXT.md assumptions

Verified against live filesystem — one inaccuracy in CONTEXT.md:176–178 ("Existing Code Insights"):

- **CONTEXT.md claims:** `public/vv-favicon.svg` (1.5 KB), `public/vv-logo-primary.svg` (1.7 KB), `public/vv-logo-inverse.svg` (1.8 KB), `public/vv-logo-hero.png` (2.0 MB) already exist in `public/`.
- **Actual state:** `public/` root contains **only** `CNAME` (12 B), `favicon.ico` (655 B, 2026-04-19), `favicon.svg` (1.5 KB, 2026-04-19) plus subdirs (`blog-assets/`, `fonts/`, `images/`). None of the 4 `vv-*` brand assets exist in `public/` yet.
- **Where they DO exist:** `.design-handoff/deep-signal-design-system/project/assets/` (all 4 present) and `~/.claude/skills/viktor-vedmich-design/assets/` (source of truth; `vv-favicon.svg` md5 `60221f18…` identical to `public/favicon.svg`).
- **Planner impact:** the phase creates `public/vv-logo-hero.png` (optimised) from scratch, not "replaces the 1.87 MB original". The 1.87 MB file is in `.design-handoff/`, not `public/`. D-08 "source assets stay" still holds for the design-handoff bundle but does NOT refer to files in `public/`.

---

## Pattern Assignments

### `src/components/Header.astro` (component, request-response)

**Analog:** itself (line 39) — this is a byte-precise one-line swap.

**Current markup** (line 39 verbatim):
```astro
      <img src="/favicon.svg" alt="VV" width="32" height="32" class="w-8 h-8 rounded-[7px] shrink-0" />
```

**Target markup** (per CONTEXT.md D-02):
```astro
      <img src="/vv-logo-hero.png" alt="Viktor Vedmich" width="32" height="32" class="w-8 h-8 rounded-[7px] shrink-0" loading="eager" decoding="sync" />
```

**Surrounding context to preserve** (lines 37–43 — do NOT touch):
```astro
    <!-- Logo -->
    <a href={getLocalizedPath('/', locale)} class="flex items-center gap-2.5 group">
      <img src="/favicon.svg" alt="VV" width="32" height="32" class="w-8 h-8 rounded-[7px] shrink-0" />
      <span class="font-display font-bold text-base text-text-primary group-hover:text-brand-primary transition-colors tracking-tight">
        vedmich.dev
      </span>
    </a>
```

**Reference-UI-kit parity** (source: `~/.claude/skills/viktor-vedmich-design/ui_kits/vedmich-dev/app.jsx:317-322`):
```jsx
        <a href="#" onClick={(e) => { e.preventDefault(); setCurrent('home'); }}
           style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
          <img src="../../assets/vv-logo-hero.png" alt="VV" style={{ width: 32, height: 32, borderRadius: 7 }}/>
          <span style={{ fontFamily: VV.fontDisplay, fontWeight: 700, fontSize: 16, color: VV.text, letterSpacing: '-0.01em' }}>vedmich.dev</span>
        </a>
```

Notes for planner:
- `width="32" height="32"` intrinsic attrs prevent CLS; keep both. Image is resized 2×-retina (64→32 via CSS), so intrinsic-32 remains valid.
- `loading="eager" decoding="sync"` per D-02 — above-the-fold logo.
- `alt="Viktor Vedmich"` per D-02 (overrides reference's `alt="VV"` for a11y).
- `rounded-[7px]` (Tailwind arbitrary-value radius) matches reference `borderRadius: 7`; keep as-is.

---

### `src/layouts/BaseLayout.astro` (component, request-response)

**Analog:** itself (line 35) for the line being replaced; lines 39–41 as the **sibling block pattern** (one `<link>` per line, progressive indent).

**Current single-line markup** (line 35 verbatim):
```astro
    <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
```

**Sibling block pattern** (lines 38–41, follow this indentation / comment-above style):
```astro
    <!-- Fonts: self-hosted from /public/fonts/ via design-tokens.css (@font-face) -->
    <link rel="preload" href="/fonts/inter-latin-400-normal.woff2" as="font" type="font/woff2" crossorigin />
    <link rel="preload" href="/fonts/space-grotesk-latin-600-normal.woff2" as="font" type="font/woff2" crossorigin />
    <link rel="preload" href="/fonts/jetbrains-mono-latin-400-normal.woff2" as="font" type="font/woff2" crossorigin />
```

**Target block** (per CONTEXT.md D-06, replaces line 35):
```astro
    <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
    <link rel="icon" type="image/x-icon" href="/favicon.ico" sizes="16x16 32x32 48x48" />
    <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
    <link rel="manifest" href="/site.webmanifest" />
    <meta name="theme-color" content="#14B8A6" />
```

Notes for planner:
- Keep 4-space indent (matches existing lines 31–36).
- Optional: add `<!-- Icons + PWA manifest -->` comment above the block to match the font-preload comment style (line 38).
- `theme-color="#14B8A6"` hex literal is **explicitly allowed** per D-06 (meta tags can't use CSS vars; value is `--brand-primary`; REQ-007 tracks this exception).
- Leave `<link rel="sitemap" href="/sitemap-index.xml" />` on line 36 untouched.

---

### `scripts/generate-icons.mjs` (utility, batch/file-I/O)

**Analog:** `remark-reading-time.mjs` (repo root) — the only in-repo `.mjs` module that demonstrates the project's ESM script style. Plus `astro.config.mjs` for default-export + top-level await patterns. Neither is a perfect match (both are Astro-runtime plugins, not one-shot CLIs) — but they define the project's ESM conventions.

**Analog 1 — `remark-reading-time.mjs`** (full file, lines 1–11):
```javascript
// Source: docs.astro.build/en/recipes/reading-time
import getReadingTime from 'reading-time';
import { toString } from 'mdast-util-to-string';

export function remarkReadingTime() {
  return function (tree, { data }) {
    const textOnPage = toString(tree);
    const readingTime = getReadingTime(textOnPage);
    data.astro.frontmatter.minutesRead = Math.ceil(readingTime.minutes);
  };
}
```

Patterns to copy:
- ESM `import` (no CommonJS `require`).
- Single `// Source:` comment at top attributing external recipe.
- Named export, no default.
- No `"use strict"`, no shebang.

**Analog 2 — `astro.config.mjs`** (lines 1–7, imports pattern):
```javascript
// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import sitemap from '@astrojs/sitemap';
import mdx from '@astrojs/mdx';
import { remarkReadingTime } from './remark-reading-time.mjs';
```

Patterns to copy:
- `// @ts-check` as the top line for tooling that supports TS in JS (optional but consistent).
- `import` from named packages + relative `./` paths both appear; both styles valid.

**New patterns to introduce** (no in-repo analog — source from RESEARCH.md + CONTEXT.md D-09/D-10):
- Node.js CLI entry (`node scripts/generate-icons.mjs` → re-runnable one-shot).
- `sharp` for raster rendering (PNGs 64/180/192/512 from SVG input).
- `png-to-ico` or `to-ico` for multi-page `.ico` packaging (16/32/48).
- `fs.writeFileSync` + `path.join` for deterministic output paths.
- Must also copy outputs into `.design-handoff/.../assets/` per D-07 (can be inline in same script).

Notes for planner:
- `scripts/` directory does NOT exist yet — planner must `mkdir scripts` before writing.
- No `scripts.generate-icons` entry in `package.json` needed per D-09 ("NOT run on every build — output committed"). If desired, add as a convenience `"generate:icons": "node scripts/generate-icons.mjs"` under the existing `"scripts"` block (lines 5–10 of `package.json`).
- `sharp` + `png-to-ico` must be added to `devDependencies` — currently only `mdast-util-to-string` and `reading-time` there (line 20–23 of `package.json`).
- Script inputs: `~/.claude/skills/viktor-vedmich-design/assets/vv-favicon.svg` (1,504 B, md5 `60221f18…`) and `~/.claude/skills/viktor-vedmich-design/assets/vv-logo-hero.png` (1,957,873 B). These are the canonical upstream sources.

---

### `public/vv-logo-hero.png` (static asset, file-I/O)

**Analog:** `public/favicon.svg` (1,504 B, already in place) — closest existing static asset served from `public/` root.

**Existing sibling files in `public/` root** (verified via filesystem):
```
public/CNAME          12 bytes (2026-04-19)
public/favicon.ico    655 bytes (2026-04-19) ← stale pre-Deep-Signal
public/favicon.svg    1,504 bytes (2026-04-19) ← Deep Signal (md5 60221f18…)
```

Notes for planner:
- All files in `public/` root are copied verbatim to `dist/` by Astro — no processing.
- Target spec (per D-01): 64×64 raster, ≤10 KB, sourced from `~/.claude/skills/viktor-vedmich-design/assets/vv-logo-hero.png` (1.87 MB source → resize via `sharp`).
- Header markup references `/vv-logo-hero.png` (root-relative, per D-02) — must be at `public/vv-logo-hero.png`, not a subdirectory.

---

### `public/favicon.ico` (static asset, file-I/O) — regenerate in place

**Analog:** itself (655 B, dated 2026-04-19) — stale pre-Deep-Signal ico that must be replaced.

Notes for planner:
- Source: `public/favicon.svg` (Deep Signal, md5 `60221f18…`) → render 16/32/48 PNG buffers via `sharp` → pack via `png-to-ico` (per D-10).
- Target is multi-size `.ico` (not single-resolution) — critical for legacy Safari / Edge.
- Overwrites the existing 655 B file — git diff will show binary change, which is expected.

---

### `public/apple-touch-icon.png`, `public/android-chrome-192x192.png`, `public/android-chrome-512x512.png`

**Analog:** `public/favicon.svg` (static public asset convention).

Notes for planner:
- All three generated in the same `generate-icons.mjs` pass from `vv-favicon.svg` (or `vv-logo-hero.png` for consistency — recommend favicon.svg since it's vector and scales deterministically).
- Sizes per D-04: 180×180 · 192×192 · 512×512.
- Filenames are **exact standards** (iOS expects `apple-touch-icon.png`; Android PWA expects `android-chrome-{192x192,512x512}.png` via the webmanifest). Do NOT rename.

---

### `public/site.webmanifest` (config, request-response)

**Analog:** `public/CNAME` (12 bytes, only other non-code static config in `public/`).

**`public/CNAME` contents** (12 bytes):
```
vedmich.dev
```

Pattern: flat text file, committed verbatim, served as-is by GitHub Pages. `site.webmanifest` follows the same pattern (JSON body served as `application/manifest+json`).

**Target contents** (per CONTEXT.md D-05, verbatim):
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

Notes for planner:
- `theme_color` = `--brand-primary` (#14B8A6, Deep Signal teal).
- `background_color` = `--bg-base` (#0F172A, Deep Signal dark).
- `display: "browser"` — NOT `"standalone"` (D-05: "not a PWA app, just home-screen branding").
- `start_url: "/"` — root redirects auto-detect locale → `/en/` or `/ru/` (existing `src/pages/index.astro` behaviour).
- Hex literals here are explicitly allowed (same exception as `theme-color` meta tag in BaseLayout — JSON can't reference CSS vars).

---

### `.design-handoff/deep-signal-design-system/project/assets/{vv-logo-hero.png, favicon.ico, apple-touch-icon.png, android-chrome-192x192.png, android-chrome-512x512.png, site.webmanifest}` (archival mirror)

**Analog:** existing 4 files in the **same directory** (established mirror pattern):

Current contents (verified via filesystem):
```
.design-handoff/deep-signal-design-system/project/assets/
  vv-favicon.svg         1,504 B   (md5 60221f18… — matches public/favicon.svg)
  vv-logo-hero.png     1,957,873 B (1.87 MB — full-res source)
  vv-logo-inverse.svg    1,767 B
  vv-logo-primary.svg    1,731 B
```

Notes for planner:
- The mirror bundle currently holds **source-of-truth** at full fidelity (see `vv-logo-hero.png` at 1.87 MB).
- D-07 adds the new derivatives alongside the existing canonical source files — does NOT replace them.
- `vv-logo-hero.png` in `.design-handoff/` is the **1.87 MB full-res version**. The mirror copy of the optimised 64×64 `vv-logo-hero.png` from this phase would **overwrite** it.
  - **Planner decision-point:** does D-07 actually mean overwriting the 1.87 MB canonical source? Re-read CONTEXT.md D-08 ("Source assets stay") — that clause applies to `public/`, but the wording is ambiguous for `.design-handoff/`. Safest interpretation: name the optimised copy differently in `.design-handoff/` (e.g. `vv-logo-hero-64.png`) OR explicitly confirm overwrite with the user before mirroring.
- Mirror script should copy 5 files (not 6 — the optimised `vv-logo-hero.png` naming conflict is open) after `generate-icons.mjs` finishes — ideally inline in the same `.mjs` script (see D-07 "Every new file produced … ALSO copied").

---

## Shared Patterns

### No-hardcoded-hex rule (CLAUDE.md enforcement)

**Source:** `CLAUDE.md` → "Never add hardcoded hex colors to components — always reference a token".

**Apply to:** All source-code changes in this phase.

**Exceptions explicitly granted** (both tracked by REQ-007):
1. `<meta name="theme-color" content="#14B8A6" />` in BaseLayout.astro — meta tag values cannot reference CSS custom properties.
2. `"theme_color": "#14B8A6"` and `"background_color": "#0F172A"` in `site.webmanifest` — JSON cannot reference CSS vars.

No other hex literals may be introduced.

### Asset mirror convention

**Source:** Existing 4 canonical files already md5-matched across three layers:
```
~/.claude/skills/viktor-vedmich-design/assets/vv-favicon.svg (1,504 B, md5 60221f18…)
public/favicon.svg (1,504 B, md5 60221f18…)
.design-handoff/deep-signal-design-system/project/assets/vv-favicon.svg (1,504 B, md5 60221f18…)
```

**Apply to:** All new binary assets produced in this phase — maintain 3-layer parity where applicable (source-skill / public / design-handoff). For derivatives generated in this phase, only 2 layers apply (public + design-handoff), since derivatives don't flow back to the source skill.

### ESM module conventions

**Source:** `remark-reading-time.mjs`, `astro.config.mjs` (both at repo root).

**Apply to:** `scripts/generate-icons.mjs`.

Patterns:
- `import` (ESM) — no `require`.
- Named exports OR default export (both seen in repo); for a CLI entry, use a top-level `async function main() { … }; main();` pattern since neither analog shows CLI usage.
- `// @ts-check` at top (optional) for editor TS support.

### Astro `<link>` / `<meta>` indent + comment style

**Source:** `src/layouts/BaseLayout.astro:31-41`.

**Apply to:** BaseLayout edit at line 35.

Pattern:
- 4-space indent from `<head>`.
- Single `<!-- Section comment -->` line before a block of related `<link>` tags (line 38: `<!-- Fonts: self-hosted from /public/fonts/ via design-tokens.css (@font-face) -->`).
- One tag per line, no inline grouping.

---

## No Analog Found

Files with no close match in the codebase — planner should source patterns from **RESEARCH.md / CONTEXT.md D-09 & D-10** instead:

| File | Role | Data Flow | Reason |
|------|------|-----------|--------|
| `scripts/generate-icons.mjs` (full CLI entry logic — `sharp` + `png-to-ico` pipeline) | utility | batch / transform | No existing build-time raster generation script in repo. `remark-reading-time.mjs` covers ESM syntax but not `sharp` / `png-to-ico` API. Planner uses RESEARCH.md for `sharp().resize().toBuffer()` + `pngToIco()` pipeline specifics. |
| `public/site.webmanifest` (schema / keys) | config | request-response | No other JSON manifest in repo. Schema fully specified by CONTEXT.md D-05 — planner copies verbatim. |
| `.design-handoff/.../site.webmanifest` (mirror) | archival | file-I/O | Same as above; mirror is byte-copy. |
| `public/vv-logo-hero.png` (64×64 optimised) | binary | file-I/O | No existing raster asset in `public/` root — only SVG/ICO. Generation via `sharp` (CONTEXT.md D-01, D-10). |
| `public/favicon.ico` (multi-size 16/32/48) | binary | file-I/O | Existing `favicon.ico` is single-resolution, stale. Multi-size packaging via `png-to-ico` (D-10). |
| `public/apple-touch-icon.png`, `android-chrome-{192,512}.png` | binary | file-I/O | No Apple / Android icons exist yet — first of their kind. Sizes fixed by platform specs (D-04). |

---

## Metadata

**Analog search scope:**
- `/Users/viktor/Documents/GitHub/vedmich/vedmich.dev/src/` (Astro components + layouts)
- `/Users/viktor/Documents/GitHub/vedmich/vedmich.dev/public/` (root + subdirs)
- `/Users/viktor/Documents/GitHub/vedmich/vedmich.dev/.design-handoff/deep-signal-design-system/project/assets/`
- `/Users/viktor/Documents/GitHub/vedmich/vedmich.dev/` (root `.mjs` files)
- `/Users/viktor/Documents/GitHub/vedmich/vedmich.dev/package.json`
- `/Users/viktor/.claude/skills/viktor-vedmich-design/` (reference UI kit + source assets)

**Files read for pattern extraction:**
- `src/components/Header.astro` (220 lines, full file)
- `src/layouts/BaseLayout.astro` (99 lines, full file)
- `remark-reading-time.mjs` (11 lines, full file)
- `astro.config.mjs` (26 lines, full file)
- `package.json` (24 lines, full file)
- `.planning/phases/11-logo-favicon-refresh/11-CONTEXT.md` (242 lines, full file)
- `~/.claude/skills/viktor-vedmich-design/ui_kits/vedmich-dev/app.jsx:317–325` (targeted — reference Header markup)

**Filesystem facts verified:**
- `public/` root contents: `CNAME`, `favicon.ico`, `favicon.svg` (only 3 files; CONTEXT.md:176–178 inaccurate).
- `public/favicon.ico` = 655 B, mtime 2026-04-19 12:59:35 (stale per D-03).
- `public/favicon.svg` md5 `60221f18…` = `.design-handoff/.../vv-favicon.svg` md5 (identical).
- `~/.claude/skills/viktor-vedmich-design/assets/vv-logo-hero.png` = 1,957,873 B (~1.87 MB, CONTEXT.md rounds to 2 MB).
- `scripts/` directory does NOT exist in repo — must be created.
- `package.json` devDependencies: `mdast-util-to-string`, `reading-time` only. Neither `sharp` nor `png-to-ico` installed.

**Pattern extraction date:** 2026-05-01
