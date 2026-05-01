---
phase: 11-logo-favicon-refresh
verified: 2026-05-01T16:26:05Z
status: passed
resolved: 2026-05-01T16:35:00Z
score: 19/19 must-haves verified
overrides_applied: 0
human_verification_resolution: "All 5 human verification items closed via 11-HUMAN-UAT.md on 2026-05-01 — 4 passed (user visually confirmed on live), 1 deferred (WR-01..WR-04 advisory warnings, user approved phase close without fix; documented in 11-REVIEW.md)."
human_verification:
  - test: "Browser tab favicon shows the Deep Signal teal V on vedmich.dev"
    expected: "After deploy + hard-reload, Chrome + Safari + Edge browser tabs render the teal-V glyph (not the stale pre-Deep-Signal favicon)"
    why_human: "Visual rendering of <link rel=\"icon\"> resolution across browser engines cannot be verified programmatically. ICO magic bytes + SVG md5 confirm the file is correct on disk; only a human can confirm the tab rendering."
  - test: "Header logo renders crisp at 1x and 2x retina"
    expected: "64x64 PNG rendered into 32x32 CSS slot shows no visible distortion, no aliasing, and remains crisp on retina displays. No layout shift on load."
    why_human: "Image quality perception (aliasing, sub-pixel rendering, retina fidelity) requires visual inspection."
  - test: "iOS 'Add to Home Screen' shows apple-touch-icon.png"
    expected: "iOS Safari Add-to-Home-Screen prompt renders the 180x180 teal V from /apple-touch-icon.png, not a page screenshot placeholder"
    why_human: "Requires an iOS device to trigger Add-to-Home-Screen flow; cannot be tested from local machine."
  - test: "No mixed-content warnings from webmanifest references"
    expected: "DevTools console shows no mixed-content / failed-resource warnings for /site.webmanifest or its declared icon sources on live vedmich.dev"
    why_human: "Requires live deployed site and browser DevTools to confirm."
  - test: "Decide on WR-01..WR-04 disposition (code review warnings)"
    expected: "User decides whether to fix WR-01 (stale-SVG fork), WR-02 (3 orphan SVGs in public/), WR-03 (missing mkdir -p), WR-04 (display=browser no-op) in-phase or defer to a Phase 11.1 / maintenance pass. All 4 are advisory, zero critical, no goal blocker."
    why_human: "Maintenance/cleanup prioritization is a human decision; these are warnings not blockers."
---

# Phase 11: Logo + favicon refresh Verification Report

**Phase Goal:** Adopt canonical Deep Signal brand assets as browser-surface icons — swap Header `<img>` from `/favicon.svg` to an optimised `/vv-logo-hero.png` (64×64, ≤10 KB, rendered 32×32 via CSS) with a11y `alt="Viktor Vedmich"`; regenerate multi-size `favicon.ico` (16/32/48) from Deep Signal SVG; add full icon coverage (apple-touch-icon 180×180 + android-chrome 192/512 + `site.webmanifest` with theme_color `#14B8A6` + background_color `#0F172A`); expand BaseLayout `<head>` to 5-tag icon+manifest+theme-color block; copy 3 canonical SVGs into `public/`; mirror all new derivatives to `.design-handoff/deep-signal-design-system/project/assets/` with hero renamed to `vv-logo-hero-64.png`. Generation via committed, re-runnable `scripts/generate-icons.mjs` (sharp + png-to-ico).

**Verified:** 2026-05-01T16:26:05Z
**Status:** human_needed
**Re-verification:** No — initial verification

## Goal Achievement

### Observable Truths

All 19 must-haves PASS programmatic verification. 5 items require human confirmation on live site.

| #   | Truth                                                                                                             | Status     | Evidence                                                                                                                                               |
| --- | ----------------------------------------------------------------------------------------------------------------- | ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 1   | `sharp` and `png-to-ico` in devDependencies of package.json                                                       | VERIFIED   | `package.json` lines 22-24: `"png-to-ico": "^3.0.1"` + `"sharp": "^0.34.5"`                                                                            |
| 2   | `scripts/generate-icons.mjs` exists, is ESM                                                                       | VERIFIED   | File exists (158 LOC). Contains `import sharp from 'sharp'` (1x) + `import pngToIco from 'png-to-ico'` (1x). Uses node: prefix for node builtins.      |
| 3a  | `public/vv-favicon.svg` md5 == `60221f18…`                                                                        | VERIFIED   | `md5 -q public/vv-favicon.svg` → `60221f182e245b949e707202ac2727c2` (exact match)                                                                      |
| 3b  | `public/vv-logo-primary.svg` md5 == `f1aa2a15…`                                                                   | VERIFIED   | `md5 -q public/vv-logo-primary.svg` → `f1aa2a1539a8a6d3aa29af5423cec9ac` (exact match)                                                                 |
| 3c  | `public/vv-logo-inverse.svg` md5 == `9531b416…`                                                                   | VERIFIED   | `md5 -q public/vv-logo-inverse.svg` → `9531b416e20e94b32d425c73df3c3b1d` (exact match)                                                                 |
| 4   | `public/vv-logo-hero.png` is 64×64 and ≤10 KB                                                                     | VERIFIED   | `sharp().metadata()`: width=64, height=64. `wc -c`: 5,459 B (46% under 10,240 B cap)                                                                   |
| 5   | `public/favicon.ico` is multi-size (ICO magic `00 00 01 00`)                                                      | VERIFIED   | `xxd -l 8 public/favicon.ico`: `00000000: 0000 0100 0300 1010` — magic `00 00 01 00` + 3 entries (`0300`) + first size 16 (`1010`)                     |
| 6   | `public/apple-touch-icon.png` is 180×180                                                                          | VERIFIED   | `sharp().metadata()`: 180x180, 4,216 B                                                                                                                 |
| 7   | `public/android-chrome-192x192.png` is 192×192                                                                    | VERIFIED   | `sharp().metadata()`: 192x192, 4,569 B                                                                                                                 |
| 8   | `public/android-chrome-512x512.png` is 512×512                                                                    | VERIFIED   | `sharp().metadata()`: 512x512, 14,964 B                                                                                                                |
| 9   | `public/site.webmanifest` has `theme_color: "#14B8A6"` and `background_color: "#0F172A"`                          | VERIFIED   | `jq -e '.theme_color == "#14B8A6" and .background_color == "#0F172A" and .name == "Viktor Vedmich"'` → `true`                                          |
| 10  | `.design-handoff/…/assets/` has 6 new derivatives (hero renamed `vv-logo-hero-64.png`)                            | VERIFIED   | Directory lists: `vv-logo-hero-64.png` (5,459 B) + favicon.ico + apple-touch-icon.png + android-chrome-{192,512}.png + site.webmanifest                |
| 11  | `.design-handoff/…/vv-logo-hero.png` (1.87 MB canonical) unchanged                                                | VERIFIED   | `wc -c`: 1,957,873 B (matches Plan 11-01 invariant exactly, pre + post re-run of generate-icons.mjs)                                                   |
| 12  | Header.astro serves `/vv-logo-hero.png` with `alt="Viktor Vedmich"`                                               | VERIFIED   | Line 39: `<img src="/vv-logo-hero.png" alt="Viktor Vedmich" … />` — byte-exact plan spec                                                               |
| 13  | Header has `loading="eager" decoding="sync"`                                                                      | VERIFIED   | Line 39 attributes: `loading="eager" decoding="sync"` (both present, 1 match each)                                                                     |
| 14  | BaseLayout head has full 5-tag icon block                                                                         | VERIFIED   | Lines 35-40: comment + SVG favicon + multi-size ICO + apple-touch-icon + manifest + theme-color meta (all 5 link/meta tags + comment header present)   |
| 15  | theme-color meta is exactly `#14B8A6`                                                                             | VERIFIED   | Line 40: `<meta name="theme-color" content="#14B8A6" />`                                                                                               |
| 16  | No deprecated cyan (`#06B6D4` / `#22D3EE`) in Header.astro or BaseLayout.astro                                    | VERIFIED   | `grep -E '#06B6D4\|#22D3EE'` → 0 matches (exit 1)                                                                                                      |
| 17  | No i18n keys mention favicon or vv-logo                                                                           | VERIFIED   | `grep -c 'favicon\|vv-logo' src/i18n/en.json src/i18n/ru.json` → 0 each (D-11 invariant honoured)                                                      |
| 18  | `npm run build` exits 0                                                                                           | VERIFIED   | Build completed in 1.16s. Output: `[build] 31 page(s) built`. Zero errors, zero warnings.                                                              |
| 19  | `dist/en/index.html` and `dist/ru/index.html` render the new logo + icon tags symmetrically                       | VERIFIED   | `vv-logo-hero.png`: EN=1, RU=1 · `theme-color`: EN=1, RU=1 · `apple-touch-icon`: EN=2, RU=2 · `site.webmanifest`: EN=1, RU=1 · `favicon.ico`: EN=1, RU=1 |

**Score:** 19/19 truths verified

### Required Artifacts

| Artifact                                                                | Expected                              | Status     | Details                                                                                           |
| ----------------------------------------------------------------------- | ------------------------------------- | ---------- | ------------------------------------------------------------------------------------------------- |
| `package.json`                                                          | `sharp` + `png-to-ico` in devDeps     | VERIFIED   | Both present in alphabetical order. Supply-chain: `registry.npmjs.org` + `sha512-…` integrity     |
| `scripts/generate-icons.mjs`                                            | ESM, sharp + png-to-ico pipeline      | VERIFIED   | 158 LOC. ESM imports, `// @ts-check`, `// Source:` attribution header, main()+catch() CLI pattern |
| `public/vv-favicon.svg`                                                 | Canonical Deep Signal favicon SVG     | VERIFIED   | md5 `60221f18…` matches skill source byte-for-byte                                                |
| `public/vv-logo-primary.svg`                                            | Canonical primary logo SVG            | VERIFIED   | md5 `f1aa2a15…` matches skill source byte-for-byte                                                |
| `public/vv-logo-inverse.svg`                                            | Canonical inverse logo SVG            | VERIFIED   | md5 `9531b416…` matches skill source byte-for-byte                                                |
| `public/vv-logo-hero.png`                                               | 64×64, ≤10 KB                         | VERIFIED   | 64x64, 5,459 B (46% under budget)                                                                 |
| `public/favicon.ico`                                                    | Multi-size 16/32/48                   | VERIFIED   | 15,086 B. ICO magic `00 00 01 00 03 00` (3 entries). First entry dimension `10 10` (16x16)        |
| `public/apple-touch-icon.png`                                           | 180×180                               | VERIFIED   | 180x180, 4,216 B                                                                                  |
| `public/android-chrome-192x192.png`                                     | 192×192                               | VERIFIED   | 192x192, 4,569 B                                                                                  |
| `public/android-chrome-512x512.png`                                     | 512×512                               | VERIFIED   | 512x512, 14,964 B                                                                                 |
| `public/site.webmanifest`                                               | Deep Signal theme_color + bg_color    | VERIFIED   | 402 B JSON. theme_color=#14B8A6, background_color=#0F172A, name=Viktor Vedmich, 2 icons           |
| `src/components/Header.astro`                                           | Logo swap with a11y + eager loading   | VERIFIED   | Line 39 byte-exact per D-02 spec                                                                  |
| `src/layouts/BaseLayout.astro`                                          | Full 5-tag icon+manifest+theme block  | VERIFIED   | Lines 35-40 byte-exact per D-06 spec                                                              |
| `.design-handoff/…/vv-logo-hero-64.png`                                 | 5 KB derivative (renamed per D-07)    | VERIFIED   | 5,459 B, byte-identical to public/vv-logo-hero.png                                                |
| `.design-handoff/…/favicon.ico`                                         | Multi-size mirror                     | VERIFIED   | 15,086 B, byte-identical to public/favicon.ico                                                    |
| `.design-handoff/…/apple-touch-icon.png`                                | 180×180 mirror                        | VERIFIED   | 4,216 B                                                                                           |
| `.design-handoff/…/android-chrome-192x192.png`                          | 192×192 mirror                        | VERIFIED   | 4,569 B                                                                                           |
| `.design-handoff/…/android-chrome-512x512.png`                          | 512×512 mirror                        | VERIFIED   | 14,964 B                                                                                          |
| `.design-handoff/…/site.webmanifest`                                    | JSON mirror                           | VERIFIED   | 402 B                                                                                             |
| `.design-handoff/…/vv-logo-hero.png` (canonical)                        | 1,957,873 B preserved                 | VERIFIED   | 1,957,873 B confirmed pre + post re-run (T-11-05 tampering mitigation intact)                     |

### Key Link Verification

| From                         | To                                           | Via                                          | Status | Details                                                                                          |
| ---------------------------- | -------------------------------------------- | -------------------------------------------- | ------ | ------------------------------------------------------------------------------------------------ |
| Header.astro                 | public/vv-logo-hero.png                      | `<img src="/vv-logo-hero.png">`              | WIRED  | Single `<img>` on line 39, root-relative path resolves in both dist/en and dist/ru               |
| BaseLayout.astro             | public/favicon.svg                           | `<link rel="icon" type="image/svg+xml">`     | WIRED  | Line 36, renders in dist HTML (grep-confirmed)                                                   |
| BaseLayout.astro             | public/favicon.ico                           | `<link rel="icon" type="image/x-icon">`      | WIRED  | Line 37 with `sizes="16x16 32x32 48x48"`, renders in dist HTML                                   |
| BaseLayout.astro             | public/apple-touch-icon.png                  | `<link rel="apple-touch-icon" sizes="180x180">` | WIRED  | Line 38, renders in dist HTML                                                                    |
| BaseLayout.astro             | public/site.webmanifest                      | `<link rel="manifest">`                      | WIRED  | Line 39, renders in dist HTML                                                                    |
| BaseLayout.astro             | browser chrome (theme-color)                 | `<meta name="theme-color" content="#14B8A6">` | WIRED  | Line 40, renders in dist HTML                                                                    |
| generate-icons.mjs           | ~/.claude/skills/…/vv-favicon.svg            | `sharp().resize().toBuffer()` pipeline       | WIRED  | Line 33 SRC_FAVICON_SVG → lines 93/95/98/108-110 renderPng calls → 5 derived PNG outputs         |
| generate-icons.mjs           | ~/.claude/skills/…/vv-logo-hero.png          | `sharp resize 1957873 B → 64×64`             | WIRED  | Line 36 SRC_LOGO_HERO → line 83 renderPng(64) with 10 KB budget check                            |
| public/favicon.ico           | public/vv-favicon.svg                        | Generator pipeline (sharp + png-to-ico)      | WIRED  | Lines 108-112: 3 sharp PNG buffers (16/32/48) → pngToIco.pack → favicon.ico                      |
| .design-handoff/site.webmanifest | public/site.webmanifest                  | Byte-copy via fs.copyFile                    | WIRED  | Lines 147-149 mirror after main write                                                            |

### Data-Flow Trace (Level 4)

| Artifact                        | Data Source                                  | Produces Real Data | Status   |
| ------------------------------- | -------------------------------------------- | ------------------ | -------- |
| Header `<img>` (line 39)        | Static `/vv-logo-hero.png` asset (64x64, 5,459 B) | Yes (real PNG bytes) | FLOWING |
| BaseLayout icon block           | Static `/favicon.svg` + `/favicon.ico` + platform icons + webmanifest | Yes (real files + valid JSON) | FLOWING |
| site.webmanifest icons          | `/android-chrome-192x192.png` + `/android-chrome-512x512.png` | Yes (real PNG files present) | FLOWING |
| theme-color meta                | Static hardcoded `#14B8A6` (intentional per D-06) | Yes (valid hex, matches --brand-primary) | FLOWING |
| generate-icons.mjs output       | Skill source SVGs + PNG via sharp + png-to-ico | Yes (produces real bytes) | FLOWING |

All artifacts that render dynamic data trace to real sources (not empty fixtures). This is a static-asset phase — no runtime data fetching involved.

### Behavioral Spot-Checks

| Behavior                                                   | Command                                                                        | Result                                                 | Status |
| ---------------------------------------------------------- | ------------------------------------------------------------------------------ | ------------------------------------------------------ | ------ |
| Build exits 0 and produces 31 pages                        | `npm run build`                                                                | `[build] 31 page(s) built in 1.16s`, zero warnings     | PASS   |
| favicon.ico has multi-size ICO magic bytes                 | `xxd -l 8 public/favicon.ico`                                                  | `00000000: 0000 0100 0300 1010` (magic + 3 entries)    | PASS   |
| Hero PNG is exactly 64x64                                  | `sharp().metadata()` via node -e                                               | width=64, height=64                                    | PASS   |
| Webmanifest is valid JSON with D-05 schema                 | `jq -e '.theme_color == "#14B8A6" and .background_color == "#0F172A" …'`     | `true` (exits 0)                                       | PASS   |
| Script is idempotent (md5 zero-diff across re-run)         | `md5 -q X > before && node scripts/generate-icons.mjs && md5 -q X > after && diff` | Empty diff — all 9 output md5s identical             | PASS   |
| dist/en/index.html + dist/ru/index.html render 5-tag block | `grep -oE 'rel="(icon\|apple-touch-icon\|manifest)"' dist/en/index.html`      | All 5 rendered in both locales                         | PASS   |
| Header logo rendered in both locales                       | `grep -c '<img src="/vv-logo-hero.png"' dist/{en,ru}/index.html`               | EN=1, RU=1 (symmetric)                                 | PASS   |

### Requirements Coverage

| Requirement | Source Plan        | Description                                            | Status    | Evidence                                                                                          |
| ----------- | ------------------ | ------------------------------------------------------ | --------- | ------------------------------------------------------------------------------------------------- |
| REQ-007     | 11-01-PLAN, 11-02-PLAN | Logo + favicon brand kit refresh (4 acceptance items) | SATISFIED | All 4 acceptance items met:<br>• 3 canonical SVGs in `public/` + `.design-handoff/` (md5-verified byte-identical to skill sources)<br>• Browser tab favicon regenerated multi-size 16/32/48 from Deep Signal SVG<br>• Header logo renders from new `/vv-logo-hero.png`<br>• `npm run build` passes (31 pages, 1.16s) |

**Note on REQ-007 mapping:** `REQUIREMENTS.md:146` maps REQ-007 to "Phase 7" but this is a stale mapping from the initial audit; the actual ROADMAP.md and both plan frontmatters (11-01-PLAN + 11-02-PLAN) map REQ-007 correctly to Phase 11. No orphaned requirements for Phase 11.

### Anti-Patterns Found

| File                                 | Line   | Pattern                                          | Severity | Impact                                                                                                  |
| ------------------------------------ | ------ | ------------------------------------------------ | -------- | ------------------------------------------------------------------------------------------------------- |
| (none)                               | —      | No deprecated cyan in Header.astro/BaseLayout.astro | —        | VERIFIED clean — `grep -E '#06B6D4\|#22D3EE'` returns 0 matches                                         |
| (none)                               | —      | No hardcoded hex outside approved theme-color    | —        | VERIFIED clean — `theme-color="#14B8A6"` is D-06 exception (meta can't reference CSS vars)              |
| (none)                               | —      | No stub/placeholder/TODO in Phase 11 files       | —        | VERIFIED clean — scripts/generate-icons.mjs + Header/BaseLayout/webmanifest all fully implemented       |

### Operational Observation — `png-to-ico` missing from `node_modules` at verification time

| File                        | Context                                                   | Severity | Impact                                                                                                  |
| --------------------------- | --------------------------------------------------------- | -------- | ------------------------------------------------------------------------------------------------------- |
| node_modules/               | Initial verify run found `node_modules/png-to-ico` missing | INFO     | Recovered with `npm install`. Dependency is correctly declared in `package.json` + `package-lock.json`. Likely transient machine-state drift from pre-verify worktree activity. Post-`npm install`, script runs and is idempotent. Not a phase gap. |

### Human Verification Required

Five items cannot be verified programmatically and require human inspection on the deployed site or live device testing.

#### 1. Browser tab favicon shows Deep Signal teal V on vedmich.dev

**Test:** After commits land on `main` and GH Actions deploys, hard-reload vedmich.dev in Chrome, Safari, Firefox, and Edge in clean browser profiles. Observe the browser tab icon.
**Expected:** Teal-V glyph visible (matching Deep Signal `--brand-primary` #14B8A6). Clean tab color, no stale pre-Deep-Signal favicon shown.
**Why human:** Visual rendering across browser engines and cache states cannot be verified programmatically from local machine. The on-disk file is verified byte-correct via md5 + ICO magic bytes; only a human can confirm the rendered tab.

#### 2. Header logo renders crisp at 1× and 2× retina

**Test:** Open `https://vedmich.dev/en/` at 1440px viewport on a standard display and a retina display. Zoom in to the Header area. Verify the 32×32 logo rendering.
**Expected:** Crisp 32×32 teal V with no visible aliasing. No layout shift during image load (`loading="eager" decoding="sync"` should prevent any hop).
**Why human:** Image quality perception (aliasing, sub-pixel rendering, retina fidelity) is a visual evaluation.

#### 3. iOS "Add to Home Screen" shows apple-touch-icon.png

**Test:** On iOS Safari, navigate to `https://vedmich.dev/en/`, tap Share → Add to Home Screen.
**Expected:** The home-screen icon rendered is the 180×180 teal V from `/apple-touch-icon.png` — not a screenshot of the page.
**Why human:** Requires iOS device to trigger Add-to-Home-Screen flow.

#### 4. No mixed-content warnings from webmanifest references

**Test:** Open `https://vedmich.dev/en/` in Chrome DevTools → Console tab. Look for any "mixed-content" / 404 / CORS errors related to `/site.webmanifest` or `/apple-touch-icon.png` / `/android-chrome-*.png`.
**Expected:** Zero warnings related to icon or manifest resources.
**Why human:** Requires live deployed site + browser DevTools session.

#### 5. Decide on WR-01..WR-04 disposition (code review warnings)

The code-review (11-REVIEW.md) surfaced 4 warnings. None are critical or blockers; the phase goal is fully achieved. User should decide whether to fix in-phase (before tagging Phase 11 complete) or defer to a follow-up pass.

**Test:** Review each warning and decide: fix now in a small patch commit, OR accept as known technical debt and document in `11-SUMMARY.md` "Deferred Items".

- **WR-01 (stale-SVG fork):** Pipeline regenerates `public/vv-favicon.svg` but BaseLayout loads `public/favicon.svg`. Today byte-identical (both md5 `60221f18…`). If upstream skill SVG ever changes, re-running the pipeline will leave `/favicon.svg` stale. Lowest-risk fix: change pipeline line 77 to write `favicon.svg` and remove the orphan `vv-favicon.svg`.
- **WR-02 (3 orphan SVG copies):** `public/vv-{favicon,logo-primary,logo-inverse}.svg` have zero references in `src/` (dead-ship). ~5 KB of unused deploy bundle. Plan author noted intent was "D-13 REQ-007 acceptance documentation". Could move to a future `/brand` page OR trim from `public/`.
- **WR-03 (missing mkdir -p):** `generate-icons.mjs:126-150` mirror copy to `.design-handoff/` will `ENOENT` if the target dir is ever absent. Current working-copy has the dir; fresh clones could fail mid-pipeline. Fix: one-line `await fs.mkdir(HANDOFF_DIR, { recursive: true });` before the mirror block.
- **WR-04 (`display: browser` no-op):** PWA-spec default value. Has no effect. If future PWA installability is desired, change to `"standalone"` or `"minimal-ui"`; otherwise remove.

**Expected:** User signals fix-now / defer-to-phase-11.1 / defer-to-maintenance-pass for each warning.
**Why human:** Maintenance/cleanup prioritization is a human decision — not a goal blocker.

### Gaps Summary

**No blocker gaps.** The phase goal is fully achieved across all 19 observable truths:

- All 11 assets in `public/` are byte-correct (md5, dimensions, sizes within budget).
- All 6 design-handoff mirrors present at expected sizes.
- 1.87 MB canonical source preserved intact.
- Header `<img>` swap is byte-exact per D-02.
- BaseLayout icon block is byte-exact per D-06.
- Build exits 0, 31 pages built, symmetric EN/RU rendering.
- Zero i18n leakage, zero deprecated cyan.
- Script is idempotent (md5 zero-diff confirmed after full npm install).
- Supply-chain verified: both deps resolved from `registry.npmjs.org` with `sha512-…` integrity hashes.

**One operational observation (not a gap):** During verification, `node_modules/png-to-ico` was missing on the local machine. `npm install` restored it. This is a machine-state issue, not a phase defect — the dependency is correctly declared in both `package.json` and `package-lock.json`, so any fresh clone or CI environment will install it cleanly.

**Status = `human_needed`** — automated verification is complete; 4 items need live-site visual confirmation after deploy and 1 item needs a user decision on code-review warnings. All items are confirmatory, not corrective.

---

_Verified: 2026-05-01T16:26:05Z_
_Verifier: Claude (gsd-verifier)_
