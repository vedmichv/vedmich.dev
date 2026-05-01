---
phase: 11-logo-favicon-refresh
reviewed: 2026-05-01T18:40:00Z
depth: standard
files_reviewed: 4
files_reviewed_list:
  - scripts/generate-icons.mjs
  - src/components/Header.astro
  - src/layouts/BaseLayout.astro
  - public/site.webmanifest
findings:
  critical: 0
  warning: 4
  info: 6
  total: 10
status: issues_found
---

# Phase 11: Code Review Report

**Reviewed:** 2026-05-01T18:40:00Z
**Depth:** standard
**Files Reviewed:** 4
**Status:** issues_found

## Summary

Phase 11 delivers a coherent favicon/logo refresh: the asset pipeline is re-runnable, the head block follows the documented modern-first/legacy-fallback ordering, the hero `<img>` gains the correct a11y/perf attributes, and the webmanifest parses as valid JSON whose brand colors match `--brand-primary` / `--bg-base`.

Review found **no Critical issues** — nothing is a security, data-loss, or correctness blocker. Four **Warnings** flag real quality defects:

1. A naming/source-of-truth drift between the canonical SVG (`vv-favicon.svg`) that the pipeline writes and the filename (`favicon.svg`) that `BaseLayout.astro` loads — if the upstream SVG ever changes, the rasters will update but the in-browser SVG favicon will go stale.
2. Three SVG copies (`vv-favicon.svg`, `vv-logo-primary.svg`, `vv-logo-inverse.svg`) are shipped to `public/` but never referenced anywhere in `src/` — they inflate the deploy with dead assets.
3. The mirror-to-handoff step will crash if `.design-handoff/deep-signal-design-system/project/assets/` is ever absent: `fs.copyFile` does not auto-create parent directories.
4. The webmanifest declares `"display": "browser"`, which is the PWA-spec default and makes the `display` key a no-op; if PWA installability is ever desired the field will also need to change.

Six **Info** items cover pre-existing dead code in scope of this review, minor DRY opportunities, filename inconsistency vs. PWA conventions, and the absence of an `npm` script entrypoint for the new generator. None of these block the phase.

Per project policy, performance observations are out-of-scope; the 64x64 hero PNG + 15 KB ICO comfortably meet the 10 KB / budget checks enforced inside the pipeline itself.

## Warnings

### WR-01: Pipeline regenerates `vv-favicon.svg` but site loads `favicon.svg` — stale-SVG hazard

**Files:**
- `scripts/generate-icons.mjs:77` (writes `public/vv-favicon.svg`)
- `src/layouts/BaseLayout.astro:36` (loads `/favicon.svg`)

**Issue:** The generator copies the canonical SVG to `public/vv-favicon.svg` (line 77), but the `<link rel="icon" type="image/svg+xml">` in `BaseLayout.astro` still references `/favicon.svg` — a separate file left over from the previous phase.

Today the two files happen to be byte-identical (`md5 60221f18…` on both), so the SVG favicon renders correctly. However, the pipeline creates a **latent regression path**: if the upstream `~/.claude/skills/viktor-vedmich-design/assets/vv-favicon.svg` ever changes, re-running `node scripts/generate-icons.mjs` will regenerate `favicon.ico`, `apple-touch-icon.png`, `android-chrome-*.png`, and `vv-favicon.svg` from the new source — but will **not** touch `public/favicon.svg`. Browsers honouring the SVG hint (Chromium, Safari 16.4+, Firefox) will then render a glyph visibly different from the ICO/PNG set.

This is the classic source-of-truth fork: the asset pipeline and the HTML disagree on which filename is authoritative.

**Fix:** Choose one of the two approaches below. Option A is lower-risk.

Option A — make the pipeline write the name BaseLayout expects (recommended):
```js
// scripts/generate-icons.mjs:77 — swap destination filename to match HTML
await copyFile(SRC_FAVICON_SVG, path.join(PUBLIC_DIR, 'favicon.svg'));
```
Then delete the now-orphan `public/vv-favicon.svg` in the same commit. (See WR-02 — the other two `vv-logo-*.svg` copies are also unused and can be dropped.)

Option B — update HTML + manifest bootstrap to point at `vv-favicon.svg`:
```astro
<!-- src/layouts/BaseLayout.astro:36 -->
<link rel="icon" type="image/svg+xml" href="/vv-favicon.svg" />
```
Also rename / delete `public/favicon.svg` to guarantee staleness is caught at build time.

Either way, a commit-time sanity test is appropriate, e.g.:
```bash
cmp public/favicon.svg ~/.claude/skills/viktor-vedmich-design/assets/vv-favicon.svg
```

---

### WR-02: Three SVG copies shipped to `public/` but never referenced in `src/`

**File:** `scripts/generate-icons.mjs:77-79`

**Issue:** The pipeline writes three SVGs into `public/`:

```js
await copyFile(SRC_FAVICON_SVG,   path.join(PUBLIC_DIR, 'vv-favicon.svg'));
await copyFile(SRC_LOGO_PRIMARY,  path.join(PUBLIC_DIR, 'vv-logo-primary.svg'));
await copyFile(SRC_LOGO_INVERSE,  path.join(PUBLIC_DIR, 'vv-logo-inverse.svg'));
```

A project-wide `grep -rn "vv-favicon\|vv-logo-primary\|vv-logo-inverse" src/` returns **zero matches** — nothing in any Astro component, MD file, or CSS loads these. They are deployed to GitHub Pages but are dead, contributing ~5 KB of noise to the static bundle plus three extra 404-opportunity paths.

The plan marks this as "D-13 acceptance (REQ-007)" — i.e., documentation of the canonical brand bundle in `public/`. Fine as intent, but if the goal is documentation there are better homes (`.design-handoff/`, which already contains these same files).

**Fix:** If the files are genuinely needed for users (e.g. press kit download):
1. Wire them into a visible UI path (About page, Footer, or a `/brand` page) and add `loading="lazy"` + explicit dimensions.
2. Or add an `X-Robots-Tag: noindex` note / comment explaining the brand-asset exposure policy.

If not needed:
```js
// scripts/generate-icons.mjs — delete lines 75-79 entirely
// The three canonical SVGs already live in .design-handoff/…/assets/
// and in ~/.claude/skills/viktor-vedmich-design/assets/ — no reason to
// duplicate into public/ unless a browser/component loads them.
```

Also drop the stale files: `git rm public/vv-favicon.svg public/vv-logo-primary.svg public/vv-logo-inverse.svg`.

---

### WR-03: `fs.copyFile` to `.design-handoff/` will crash if the target subtree is absent

**File:** `scripts/generate-icons.mjs:127-150`

**Issue:** The mirror step calls `copyFile` six times into `HANDOFF_DIR`:

```js
await copyFile(
  path.join(PUBLIC_DIR, 'vv-logo-hero.png'),
  path.join(HANDOFF_DIR, 'vv-logo-hero-64.png')
);
// …5 more identical patterns
```

`node:fs/promises copyFile` **does not create intermediate directories** — it raises `ENOENT: no such file or directory` if the destination directory does not exist. Today `.design-handoff/deep-signal-design-system/project/assets/` exists on this branch, but:

- New clones of the repo at earlier commits (or fresh checkouts where the handoff subtree has been pruned / gitignored / not yet populated) will fail the whole pipeline halfway through.
- The error happens **after** the `public/` assets are already written, leaving the two trees in disagreement until the next successful run.

No try/catch, no idempotent `mkdir -p` — and the script's documented purpose is to be **re-runnable**. It is therefore not safely re-runnable across all environments.

**Fix:** Add a single `mkdir -p` prior to the mirror step:

```js
// scripts/generate-icons.mjs — before the D-07 mirror block (line ~126)
console.log('\nD-07: mirror new derivatives -> .design-handoff/');
await fs.mkdir(HANDOFF_DIR, { recursive: true }); // safe + idempotent
await copyFile(
  path.join(PUBLIC_DIR, 'vv-logo-hero.png'),
  path.join(HANDOFF_DIR, 'vv-logo-hero-64.png')
);
// …rest unchanged
```

Belt-and-braces: the `PUBLIC_DIR` writes would benefit from the same treatment (`await fs.mkdir(PUBLIC_DIR, { recursive: true });` at the top of `main()`), though `public/` is essentially guaranteed to exist in an Astro project.

---

### WR-04: `"display": "browser"` is the PWA spec default — key is a no-op

**File:** `public/site.webmanifest:18` (also `scripts/generate-icons.mjs:48`)

**Issue:** The manifest declares:

```json
"display": "browser",
```

Per the W3C Web App Manifest spec (§ `display` member, fallback chain `fullscreen → standalone → minimal-ui → browser`), `"browser"` is the explicit *default* value. Setting it has no effect on any user agent — it's equivalent to omitting the key entirely.

This is harmless in isolation, but it communicates intent that the manifest has opted in to a non-default display mode when it hasn't. If Phase 11 aims to ship a PWA-installable experience later (the presence of a manifest, 192/512 icons, and `theme_color` strongly suggests this), the field will need to change to `"standalone"` or `"minimal-ui"` to make the manifest meaningfully installable on Android / iOS Add-to-Home-Screen.

Conversely, if the manifest exists purely for the `theme_color` / `icons` array (as the current homepage UX suggests — no service worker, no "installable" semantic), the key is dead config that should be removed.

**Fix:** Pick the intent:

PWA-installable (likely correct for future-proofing):
```json
// scripts/generate-icons.mjs:48 + public/site.webmanifest:18
"display": "standalone"
```

Not installable, just metadata:
```json
// Delete the `display` line in both files
```

Either change must be applied in **both** places (the generator and the static manifest), otherwise the next `node scripts/generate-icons.mjs` will silently revert the file on disk.

## Info

### IN-01: `SKILL_ASSETS` uses `os.homedir()` — non-portable across CI / reviewers

**File:** `scripts/generate-icons.mjs:24-30`

**Issue:** The canonical source lives at `~/.claude/skills/viktor-vedmich-design/assets/`. This path is only populated on Viktor's dev machine — CI, other contributors, and Codespaces will hit `ENOENT` the moment they try `node scripts/generate-icons.mjs`. The script silently assumes this state because the header comments say "Output is committed to public/ + .design-handoff/; NOT run on every build" — i.e. the operator is always Viktor with the skill installed.

This is an accepted constraint (documented in CONTEXT.md), not a bug. But the script does not **fail loudly** with a helpful message — a missing `SKILL_ASSETS` directory produces a raw `ENOENT` at the first `copyFile`, deep inside the call stack.

**Fix:** Add a pre-flight check that gives a readable error:

```js
// scripts/generate-icons.mjs — beginning of main()
try {
  await fs.access(SKILL_ASSETS);
} catch {
  throw new Error(
    `Canonical brand assets not found at ${SKILL_ASSETS}. ` +
    `This script requires the viktor-vedmich-design skill to be installed. ` +
    `See CLAUDE.md "Skill updates — three-way sync" for setup.`
  );
}
```

---

### IN-02: No `npm run` alias for the generator — discoverability / habit-forming loss

**Files:** `package.json` (scripts block), `scripts/generate-icons.mjs`

**Issue:** The only documented invocation is `node scripts/generate-icons.mjs`, scattered across `11-CONTEXT.md`, the script's own header, and the plan docs. `package.json` has no matching script:

```json
"scripts": {
  "dev": "astro dev",
  "build": "astro build",
  "preview": "astro preview",
  "astro": "astro"
}
```

A reviewer coming to the repo cold has no discovery path to the new tooling. `npm run` would list only the Astro lifecycle commands.

**Fix:** One-line addition to `package.json`:

```json
"scripts": {
  "dev": "astro dev",
  "build": "astro build",
  "preview": "astro preview",
  "astro": "astro",
  "generate:icons": "node scripts/generate-icons.mjs"
}
```

---

### IN-03: Pre-existing unused `altLocale` import + variable in `Header.astro`

**File:** `src/components/Header.astro:2,10`

**Issue:** `getAlternateLocale` is imported on line 2 and the result assigned to `altLocale` on line 10, but `altLocale` is referenced nowhere else in the component. Verified with `grep -n "altLocale" src/components/Header.astro` — only the declaration line matches.

This is pre-existing (not introduced by Phase 11) but lives in a file within review scope. Removing it is a one-liner.

**Fix:**
```astro
<!-- src/components/Header.astro:2 -->
import { t, type Locale, getLocalizedPath, getLocaleSwitchPath } from '../i18n/utils';

<!-- line 10 — delete entirely -->
```

---

### IN-04: `getLocalizedPath('/', locale)` called twice in Header.astro — minor DRY

**File:** `src/components/Header.astro:15,38`

**Issue:** Line 15 computes `const homePath = getLocalizedPath('/', locale);`. Line 38 re-invokes the same function on the logo link:

```astro
<a href={getLocalizedPath('/', locale)} class="flex items-center gap-2.5 group">
```

Pre-existing, but trivially fixable.

**Fix:**
```astro
<!-- src/components/Header.astro:38 -->
<a href={homePath} class="flex items-center gap-2.5 group">
```

---

### IN-05: `sizes` attribute on SVG favicon is intentionally absent but worth a comment

**File:** `src/layouts/BaseLayout.astro:36-38`

**Issue:** Three `<link rel="icon">` / `rel="apple-touch-icon">` elements have different `sizes` conventions:

```astro
<link rel="icon" type="image/svg+xml" href="/favicon.svg" />                               <!-- no sizes -->
<link rel="icon" type="image/x-icon" href="/favicon.ico" sizes="16x16 32x32 48x48" />      <!-- multi-size -->
<link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />               <!-- single -->
```

The SVG-favicon omission is **correct** per HTML spec — `image/svg+xml` is scale-independent, and the conventional hint for Firefox is `sizes="any"` (not required for Chromium/Safari). The current code is defensible, just opaque. A reviewer might mistake the omission for an oversight.

**Fix (optional):** Either add `sizes="any"` for explicitness, or drop in a one-line comment:

```astro
<!-- SVG favicon is intrinsic-scalable; no sizes attribute needed -->
<link rel="icon" type="image/svg+xml" href="/favicon.svg" />
```

---

### IN-06: 64x64 hero PNG has no alpha channel — `background: { alpha: 0 }` is a no-op

**File:** `scripts/generate-icons.mjs:62-70`

**Issue:** `renderPng()` passes a transparent background:

```js
.resize(size, size, {
  fit: 'contain',
  background: { r: 0, g: 0, b: 0, alpha: 0 },
})
```

Verified against on-disk output: `sharp('public/vv-logo-hero.png').metadata()` reports `hasAlpha: false`. The source `SRC_LOGO_HERO` (`~/.claude/skills/…/vv-logo-hero.png`) is actually a JPEG (2048x2048, `format: "jpeg"` despite `.png` extension) with no alpha channel; sharp's `fit: 'contain'` only applies the background when the source and target aspect ratios differ, and a square-to-square `contain` is a no-op. Result: the `alpha: 0` setting has zero effect on hero renders.

It **does** matter for apple-touch-icon and android-chrome renders (square SVG-to-square-PNG, but Apple flattens alpha anyway — which is why apple-touch-icon often includes its own background fill).

Not a defect. Worth a 1-line comment so a future editor doesn't mistake transparent-background handling for something it isn't, and doesn't waste time debugging "why isn't my hero transparent?".

**Fix (optional):**
```js
// scripts/generate-icons.mjs:62 — annotate intent
/**
 * Renders <srcPath> to a square PNG of <size>×<size>. Transparent background
 * is used only when fit=contain pads the aspect ratio — square-source/
 * square-target inputs (SVG → PNG, hero) flatten without alpha use.
 */
async function renderPng(srcPath, size) {
```

---

_Reviewed: 2026-05-01T18:40:00Z_
_Reviewer: Claude (gsd-code-reviewer)_
_Depth: standard_
