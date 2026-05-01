---
status: partial
phase: 11-logo-favicon-refresh
source: [11-VERIFICATION.md]
started: "2026-05-01T16:20:00Z"
updated: "2026-05-01T16:20:00Z"
---

## Current Test

[awaiting human testing]

## Tests

### 1. Browser tab favicon shows Deep Signal teal V on vedmich.dev
expected: Live site favicon resolves to the new `vv-favicon.svg` in modern browsers (Chrome, Safari, Firefox, Edge) and falls back to the multi-size `favicon.ico` on legacy engines. Visual: teal V on dark background, matching `src/styles/design-tokens.css` `--brand-primary: #14B8A6` token.
result: [pending]

### 2. Header logo renders crisp at 1× and 2× retina
expected: The 32×32 `<img>` in `src/components/Header.astro:39` uses the 64×64 `/vv-logo-hero.png` source so 2× retina displays show no pixelation. `loading="eager" decoding="sync"` should prevent LCP delay on the first paint.
result: [pending]

### 3. iOS "Add to Home Screen" shows apple-touch-icon.png
expected: On iOS Safari, Share → Add to Home Screen produces a home-screen icon sourced from `/apple-touch-icon.png` (180×180, teal Deep Signal V). Verifies the `<link rel="apple-touch-icon">` in `src/layouts/BaseLayout.astro:38` is wired correctly.
result: [pending]

### 4. No mixed-content or manifest-fetch warnings in DevTools
expected: Open DevTools on live `vedmich.dev` → Console + Network tabs show no errors or warnings related to `/site.webmanifest`, `/android-chrome-*.png`, `/apple-touch-icon.png`, or `/favicon.ico`. All served from same HTTPS origin.
result: [pending]

### 5. User decision on code-review warnings WR-01..WR-04
expected: User reviews `.planning/phases/11-logo-favicon-refresh/11-REVIEW.md` and decides whether to fix advisory warnings in-phase (Phase 11.1) or defer:
- WR-01: source-of-truth fork (`/favicon.svg` in BaseLayout vs `vv-favicon.svg` copied by generator) — latent stale-SVG risk
- WR-02: 3 logo SVGs (`vv-favicon.svg`, `vv-logo-primary.svg`, `vv-logo-inverse.svg`) shipped to `public/` with zero references in `src/` — currently dead assets
- WR-03: `scripts/generate-icons.mjs` lacks `mkdir -p` for `.design-handoff/` subtree — breaks re-runnability if subtree absent
- WR-04: `public/site.webmanifest` has `"display": "browser"` which is PWA spec default (no-op) — unclear intent, prefer `"standalone"` or remove
result: [pending]

## Summary

total: 5
passed: 0
issues: 0
pending: 5
skipped: 0
blocked: 0

## Gaps
