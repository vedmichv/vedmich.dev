---
phase: 11-logo-favicon-refresh
plan: 01
subsystem: infra
tags: [assets, tooling, icons, favicon, pwa, sharp, png-to-ico, esm, webmanifest]

# Dependency graph
requires:
  - phase: 11-logo-favicon-refresh
    provides: "11-CONTEXT.md (D-01..D-13) + 11-PATTERNS.md (ESM analogs + verified filesystem state)"
provides:
  - "scripts/generate-icons.mjs — re-runnable, idempotent asset pipeline (sharp + png-to-ico)"
  - "public/vv-favicon.svg + vv-logo-primary.svg + vv-logo-inverse.svg (3 canonical Deep Signal SVGs, md5-authoritative from skill source)"
  - "public/vv-logo-hero.png — optimised 64x64 raster, 5,459 B (under 10 KB LCP budget)"
  - "public/favicon.ico — multi-size 16/32/48 regenerated from vv-favicon.svg (was 655 B stale pre-Deep-Signal)"
  - "public/apple-touch-icon.png (180x180), public/android-chrome-192x192.png, public/android-chrome-512x512.png"
  - "public/site.webmanifest — Deep Signal theme_color #14B8A6 / background_color #0F172A"
  - ".design-handoff/deep-signal-design-system/project/assets/ — 6 new derivatives mirrored (hero renamed vv-logo-hero-64.png; 1.87 MB canonical preserved)"
  - "sharp@0.34.5 + png-to-ico@3.0.1 in devDependencies (supply-chain pinned, registry.npmjs.org + sha512 integrity)"
affects: [11-02 (Header.astro + BaseLayout.astro component wiring)]

# Tech tracking
tech-stack:
  added:
    - "sharp@^0.34.5 (devDependency — resize + PNG encode, native libvips binding)"
    - "png-to-ico@^3.0.1 (devDependency — pure-JS multi-size .ico packager)"
  patterns:
    - "ESM one-shot Node CLI script at scripts/ (mirrors remark-reading-time.mjs conventions: import syntax, // @ts-check header, // Source: attribution)"
    - "sharp pipeline: resize(size, size, {fit: 'contain', background: alpha=0}) → png({compressionLevel: 9}) → toBuffer"
    - "Asset mirror convention: public/ + .design-handoff/ kept byte-identical for all derivatives via one-pass copy in generator script"
    - "Canonical preservation pattern: 1.87 MB archival vv-logo-hero.png and 5 KB optimised vv-logo-hero-64.png coexist in .design-handoff/ under distinct names"
    - "10 KB hard budget enforced in code (throws if sharp output exceeds LCP-safe threshold) — T-11-04 mitigation"

key-files:
  created:
    - "scripts/generate-icons.mjs — 158 LOC ESM asset generator"
    - "public/vv-favicon.svg — canonical Deep Signal favicon SVG (md5 60221f18…)"
    - "public/vv-logo-primary.svg — canonical primary logo (md5 f1aa2a15…)"
    - "public/vv-logo-inverse.svg — canonical inverse logo (md5 9531b416…)"
    - "public/vv-logo-hero.png — optimised 64x64 raster (5,459 B)"
    - "public/apple-touch-icon.png (180x180, 4,216 B)"
    - "public/android-chrome-192x192.png (4,569 B)"
    - "public/android-chrome-512x512.png (14,964 B)"
    - "public/site.webmanifest (402 B JSON)"
    - ".design-handoff/deep-signal-design-system/project/assets/vv-logo-hero-64.png (mirror, renamed)"
    - ".design-handoff/.../assets/{favicon.ico, apple-touch-icon.png, android-chrome-{192x192,512x512}.png, site.webmanifest} (5 mirrors)"
  modified:
    - "package.json — sharp + png-to-ico added to devDependencies (alphabetical, 4 total)"
    - "package-lock.json — 363 packages added (sharp transitive tree + png-to-ico); resolved URLs verified registry.npmjs.org, sha512 integrity pinned"
    - "public/favicon.ico — regenerated multi-size 16/32/48 (was 655 B single-size pre-Deep-Signal, now 15,086 B with ICO magic 00 00 01 00 03 00 → 3 entries)"

key-decisions:
  - "D-01 hero PNG budget enforced programmatically — script throws if sharp output > 10240 B rather than shipping silently (T-11-04 DoS mitigation)"
  - "D-07 hero mirror renamed vv-logo-hero-64.png in .design-handoff/ — preserves 1.87 MB canonical source beside the 5 KB derivative (T-11-05 tampering mitigation; coexistence was ambiguous in CONTEXT.md — PATTERNS.md flagged the naming conflict, plan resolved with distinct names)"
  - "D-09 + D-10 tooling split — sharp handles PNG rasterisation (libvips quality), png-to-ico handles the multi-page ICO directory packaging (pure-JS, no native deps)"
  - "T-11-01 supply-chain controls locked — Task 1 acceptance criteria verify both deps resolve from registry.npmjs.org (not GitHub/forked tarballs) with sha512 integrity hashes in package-lock.json"
  - "npm audit vulnerabilities (4 moderate, 5 high) accepted without auto-fix — all in sharp's transitive dep tree, dev-only tooling, no prod runtime exposure per T-11-01 threat disposition; npm audit fix would risk semver-major bumps outside Plan 11-01 scope"
  - "Idempotence verified explicitly — md5 snapshot of 15 outputs before and after second run showed zero diff; re-runnable without side effects"

patterns-established:
  - "Build-time asset pipeline: one-shot ESM script committed under scripts/, output committed to public/ + mirrored to .design-handoff/, NOT run on every build (D-09 rationale — avoids native-dep build-time requirements, keeps CI deterministic)"
  - "Theme-color hex-literal exception: #14B8A6 and #0F172A hardcoded in site.webmanifest (JSON cannot reference CSS custom properties) — tracked as a REQ-007 exception in CLAUDE.md no-hardcoded-hex rule"
  - "Mirror pattern for archival assets: public/ = production runtime, .design-handoff/ = archival + source-of-truth (canonical full-res alongside optimised derivatives)"

requirements-completed: [REQ-007]

# Metrics
duration: 4m 38s
completed: 2026-05-01
---

# Phase 11 Plan 01: Asset Pipeline Foundation Summary

**Deep Signal brand-kit asset pipeline — sharp + png-to-ico pinned, 158-LOC idempotent ESM generator produces 3 canonical SVGs + 7 platform rasters + 1 webmanifest in public/, mirrored to .design-handoff/ with 1.87 MB canonical source preserved (renamed derivative coexists beside it).**

## Performance

- **Duration:** 4 min 38 s
- **Started:** 2026-05-01T16:01:51Z
- **Completed:** 2026-05-01T16:06:34Z
- **Tasks:** 2 / 2 complete
- **Files modified:** 18 (2 package meta + 15 new assets + 1 regenerated favicon.ico + 1 new script)

## Accomplishments

- **Two devDependencies pinned for supply-chain integrity** — `sharp@0.34.5` and `png-to-ico@3.0.1` added via `npm install --save-dev`; package-lock.json verified both packages resolved from `https://registry.npmjs.org/` with `sha512-…` integrity hashes (T-11-01 mitigation enforced in Task 1 verify block).
- **One-shot ESM asset pipeline authored** — `scripts/generate-icons.mjs` (158 LOC) renders 6 sharp-resized PNG buffers + packages a multi-size .ico + copies 3 canonical SVGs + writes a webmanifest + mirrors 6 derivatives to `.design-handoff/` in a single `node scripts/generate-icons.mjs` invocation.
- **11 public assets + 6 handoff mirrors materialised** — `public/vv-favicon.svg` / `vv-logo-primary.svg` / `vv-logo-inverse.svg` md5-match their skill-upstream sources byte-for-byte; `public/vv-logo-hero.png` is 5,459 B @ 64×64 (46% under the 10 KB LCP budget); `public/favicon.ico` regenerated as multi-size 16/32/48 (header bytes `00 00 01 00 03 00` + 3 image directory entries confirmed via xxd dump).
- **Canonical 1.87 MB archival source preserved** — `.design-handoff/.../vv-logo-hero.png` size stayed at exactly 1,957,873 B after two pipeline runs; the optimised derivative lives beside it as `vv-logo-hero-64.png` (T-11-05 tampering mitigation honoured).
- **Idempotence verified empirically** — md5 snapshot of all 15 pipeline outputs before and after a second `node scripts/generate-icons.mjs` run produced zero diff; the script is fully re-runnable with no side effects.
- **Astro build regression-free** — `npm run build` completed in 1.51 s (31 pages built, zero warnings) with all new `public/` assets copied verbatim into `dist/`.

## Task Commits

Each task was committed atomically with the verbatim action from the plan:

1. **Task 1: Install sharp + png-to-ico devDependencies** — `eb896ec` (`chore(11-01): install sharp + png-to-ico as devDependencies`)
   - 2 files changed (`package.json`, `package-lock.json`), +63 / -4 lines
   - Both deps registry.npmjs.org-resolved with sha512 integrity pinned
2. **Task 2: Author scripts/generate-icons.mjs and run it end-to-end** — `44d2de0` (`feat(11-01): asset pipeline + Deep Signal favicon/logo set (D-01, D-03, D-04, D-05, D-07, D-09, D-10, D-13)`)
   - 16 files changed, +287 lines (1 script source + 15 binary/JSON assets + 1 favicon.ico regeneration)
   - Covers 8 of the 13 Phase 11 decisions (remaining 5 belong to Plan 11-02 component wiring)

_Plan metadata commit (SUMMARY.md) will be created by the orchestrator after this agent returns (worktree mode — no STATE.md / ROADMAP.md writes in this agent per parallel-execution contract)._

## Files Created/Modified

**Scripts / tooling (created):**
- `scripts/generate-icons.mjs` — 158 LOC ESM asset generator. Pipeline: 3 SVG byte-copies → 4 sharp-resize PNG renders (64/180/192/512) → 3 sharp-resize ICO sources (16/32/48) → png-to-ico multi-page pack → webmanifest JSON write → 6 mirror copies to `.design-handoff/`. Hard 10 KB budget on hero PNG (throws if exceeded).

**Public assets (created — 10):**
- `public/vv-favicon.svg` — canonical Deep Signal favicon SVG (md5 `60221f18…`, matches skill source byte-for-byte)
- `public/vv-logo-primary.svg` — canonical primary logo SVG (md5 `f1aa2a15…`)
- `public/vv-logo-inverse.svg` — canonical inverse logo SVG (md5 `9531b416…`)
- `public/vv-logo-hero.png` — optimised 64×64 raster, 5,459 B (sharp `compressionLevel: 9`, alpha-preserving `fit: contain`)
- `public/apple-touch-icon.png` — 180×180, 4,216 B (iOS home-screen / Safari tab)
- `public/android-chrome-192x192.png` — 192×192, 4,569 B (Android home-screen standard)
- `public/android-chrome-512x512.png` — 512×512, 14,964 B (Android splash / PWA large)
- `public/site.webmanifest` — 402 B JSON (Deep Signal `theme_color: "#14B8A6"` + `background_color: "#0F172A"`, `display: browser`, 2-icon PWA list)

**Public assets (modified — 1):**
- `public/favicon.ico` — regenerated as multi-size 16/32/48 from vv-favicon.svg via sharp + png-to-ico pipeline; grew from 655 B (stale single-size pre-Deep-Signal) to 15,086 B (valid 3-entry ICO directory with magic bytes `00 00 01 00 03 00`)

**Design-handoff mirrors (created — 6):**
- `.design-handoff/deep-signal-design-system/project/assets/vv-logo-hero-64.png` — 5,459 B (renamed from the public-side filename to coexist with canonical `vv-logo-hero.png`)
- `.design-handoff/.../favicon.ico` (15,086 B)
- `.design-handoff/.../apple-touch-icon.png` (4,216 B)
- `.design-handoff/.../android-chrome-192x192.png` (4,569 B)
- `.design-handoff/.../android-chrome-512x512.png` (14,964 B)
- `.design-handoff/.../site.webmanifest` (402 B)

**Package meta (modified — 2):**
- `package.json` — devDependencies: `sharp: ^0.34.5`, `png-to-ico: ^3.0.1` added (alphabetical; total 4 entries)
- `package-lock.json` — 363 packages added across both deps' transitive trees; top-level `resolved` URLs both `https://registry.npmjs.org/…` with `sha512-…` integrity hashes

**Preserved unchanged (T-11-05):**
- `.design-handoff/deep-signal-design-system/project/assets/vv-logo-hero.png` — 1,957,873 B canonical archival source stays untouched (verified pre/post pipeline runs)

## Decisions Made

- **D-07 mirror naming resolved via distinct filenames** — PATTERNS.md flagged an ambiguity in the CONTEXT.md wording about whether the optimised 64-px hero PNG should overwrite the 1.87 MB canonical `.design-handoff/.../vv-logo-hero.png` or coexist. The plan chose coexistence: `generate-icons.mjs` writes the derivative to `vv-logo-hero-64.png` (explicit rename in the mirror copy). This keeps archival fidelity + derivative both accessible with no data loss. Task 2 acceptance criteria enforce the 1,957,873 B canonical size post-run.
- **Supply-chain controls pinned explicitly** — Task 1 acceptance criteria included direct `jq` assertions against `.packages["node_modules/sharp"].resolved` and `.integrity` in `package-lock.json`. Both pass: resolution URLs are both `registry.npmjs.org/…` (no GitHub tarballs, no private registry), integrity prefix `sha512-…`. This makes the T-11-01 "mitigate" disposition from the threat model load-bearing and auditable.
- **10 KB hero budget enforced in code, not just policy** — script throws with a descriptive error if sharp PNG output exceeds 10240 B, rather than warning or silently shipping. Prevents a future source-SVG change from accidentally blowing the LCP budget. Current output is 5,459 B (46% under cap), giving healthy margin.
- **Script is idempotent by construction, proven empirically** — `fs.copyFile` + `fs.writeFile` semantics + deterministic sharp output (same input + same params + same compressionLevel) means reruns are byte-identical. Proven by pre/post md5 snapshot (see `/tmp/plan-11-01-md5-{before,after}.txt` during execution — zero diff across all 15 outputs).
- **npm audit vulnerabilities accepted, not auto-fixed** — `sharp@0.34.5` + `png-to-ico@3.0.1` install pulls a 363-package transitive tree that includes 9 audit findings (4 moderate, 5 high). Rule 4 threshold: `npm audit fix` could trigger semver-major bumps on transitive deps which is outside Plan 11-01's `files_modified` boundary. Per T-11-01 threat disposition ("accept" for dev-only tooling with no prod runtime exposure), this is documented here rather than forced into a follow-up fix. A focused audit-fix could be a deferred item for Plan 11-02 or beyond if desired.

## Deviations from Plan

None — plan executed exactly as written. Both tasks' verbatim action blocks were followed character-for-character, both tasks' automated verify blocks passed, and all plan-level `<success_criteria>` (9 bullets) + `<verification>` checks (7 numbered items) pass.

Minor observation (not a deviation, not a bug): Task 2 `<acceptance_criteria>` line reads `grep -c "vv-logo-hero-64.png" scripts/generate-icons.mjs returns 1 (mirror rename per D-07)`, but the verbatim `<action>` code block contains the string twice — once in an explanatory comment (`// Hero is renamed vv-logo-hero-64.png to preserve 1.87 MB canonical beside it.`) and once in the `path.join(HANDOFF_DIR, 'vv-logo-hero-64.png')` argument. The script is byte-verbatim from the plan's `<action>`; the `grep -c` value 2 reflects that faithful copy. The spirit of the acceptance criterion ("hero is renamed once in the mirror path") is fully satisfied — there is exactly one `path.join(...)` invocation that writes to `vv-logo-hero-64.png`. No action required; flagged for plan-author awareness only.

**Total deviations:** 0
**Impact on plan:** None — pipeline produced all expected outputs at expected sizes with md5 fidelity, idempotent, and Astro build is green.

## Issues Encountered

None — no blocking issues, no retries, no authentication gates. Both tasks completed on first attempt.

**npm install output noted:** `npm install --save-dev sharp png-to-ico` reported "9 vulnerabilities (4 moderate, 5 high)" in the transitive dep tree. These are expected for a sharp installation (libvips native binding dep chain is well-known to surface audit findings). Per T-11-01 threat disposition, these are `accept` for dev-only tooling with no prod runtime exposure. Documented under Decisions Made above; not fixed in this plan.

## Deferred Items

- **Consider focused `npm audit fix` review** in a dedicated tooling-maintenance pass. Outside Plan 11-01 scope (would modify transitive deps not listed in `files_modified`), but worth a periodic review — especially for any vulnerabilities that might surface in sharp's native libvips chain.

## User Setup Required

None — no external service configuration, no secrets, no environment variables required. The asset pipeline is fully local-compute: skill source SVG/PNG → `sharp` → `public/` + `.design-handoff/`. Deployment to GitHub Pages is automatic via the existing workflow when the commits are pushed to `main`.

## Next Phase Readiness

**Plan 11-02 (component wiring) prerequisites satisfied:**

- `public/vv-logo-hero.png` exists at 64×64, 5,459 B — ready for `src/components/Header.astro:39` to swap its `<img src="/favicon.svg">` → `<img src="/vv-logo-hero.png">` (D-02).
- `public/favicon.ico`, `apple-touch-icon.png`, `android-chrome-{192x192,512x512}.png`, `site.webmanifest` all exist — ready for `src/layouts/BaseLayout.astro:35` to expand its single `<link rel="icon">` into the full `<link>` + `<meta name="theme-color">` block per D-06.
- 3 canonical Deep Signal SVGs are in `public/` (closes REQ-007 acceptance — no follow-up phase needed for OG/LinkedIn preview templates or light/dark logo variants).

**Blockers for downstream work:** None.

**Rerun instructions (for future brand-asset updates):**
```bash
# Prerequisite: skill source at ~/.claude/skills/viktor-vedmich-design/assets/ is up-to-date
node scripts/generate-icons.mjs
# Output is committed to public/ + .design-handoff/ — rerun after any source-SVG update
# Rerun is idempotent — if skill sources didn't change, output md5s stay identical
```

## Threat Flags

No new security-relevant surface introduced beyond the plan's `<threat_model>`. All 5 threats (T-11-01 through T-11-05) have their mitigations applied and auditable:

- T-11-01 (supply-chain on `sharp`) — mitigated via Task 1 acceptance checks asserting `registry.npmjs.org` resolution + `sha512-…` integrity hashes in `package-lock.json`.
- T-11-02 (supply-chain on `png-to-ico`) — accepted per threat disposition (pure-JS, <200 LOC, dev-only).
- T-11-03 (webmanifest public-brand disclosure) — accepted (no PII, only public brand tokens).
- T-11-04 (hero PNG DoS budget) — mitigated in script code: `if (heroBuf.length > 10 * 1024) throw …`.
- T-11-05 (canonical 1.87 MB tampering) — mitigated by distinct-name mirror write (`vv-logo-hero-64.png`) + Task 2 acceptance criterion asserting `1957873` B canonical size post-run.

## Self-Check: PASSED

All claims in this summary were verified before write:

- **Files exist:**
  - `scripts/generate-icons.mjs` — FOUND
  - `public/vv-favicon.svg` — FOUND (md5 60221f18…)
  - `public/vv-logo-primary.svg` — FOUND (md5 f1aa2a15…)
  - `public/vv-logo-inverse.svg` — FOUND (md5 9531b416…)
  - `public/vv-logo-hero.png` — FOUND (5,459 B, 64×64)
  - `public/favicon.ico` — FOUND (15,086 B, multi-size)
  - `public/apple-touch-icon.png` — FOUND (180×180)
  - `public/android-chrome-192x192.png` — FOUND (192×192)
  - `public/android-chrome-512x512.png` — FOUND (512×512)
  - `public/site.webmanifest` — FOUND (D-05 schema)
  - `.design-handoff/.../vv-logo-hero-64.png` — FOUND (5,459 B)
  - `.design-handoff/.../favicon.ico` — FOUND
  - `.design-handoff/.../apple-touch-icon.png` — FOUND
  - `.design-handoff/.../android-chrome-192x192.png` — FOUND
  - `.design-handoff/.../android-chrome-512x512.png` — FOUND
  - `.design-handoff/.../site.webmanifest` — FOUND
  - `.design-handoff/.../vv-logo-hero.png` (canonical) — FOUND (1,957,873 B unchanged)
- **Commits exist:**
  - `eb896ec` — FOUND (Task 1: chore(11-01): install sharp + png-to-ico)
  - `44d2de0` — FOUND (Task 2: feat(11-01): asset pipeline + Deep Signal favicon/logo set)
- **Build regression:** `npm run build` → 31 pages in 1.51 s, zero warnings — FOUND in build log.
- **Idempotence:** second `node scripts/generate-icons.mjs` run produced md5-zero-diff across all 15 outputs — VERIFIED.
- **`npm run build` post-pipeline:** 31 pages in 1.51s, zero warnings — PASS.

---
*Phase: 11-logo-favicon-refresh*
*Plan: 01*
*Completed: 2026-05-01*
