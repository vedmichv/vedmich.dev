---
status: passed
phase: 05-podcasts-badges
requirements: [REQ-004]
verified: 2026-04-21
---

# Phase 5 Verification — Podcasts: DKT teal + AWS RU amber badges

## Goal

Rewrite `src/components/Podcasts.astro` to match reference `app.jsx:423-453` — two vertical-stack cards: DKT keeps the PNG logo with white chrome, AWS RU replaces the music-note SVG with an inline amber text badge. Drop the `podcasts[]` array + `PodcastIcon` type + stat color tints.

## REQ-004 Acceptance

| Criterion | Method | Result |
|---|---|---|
| No music-note SVG remains in Podcasts.astro | grep source + built HTML | PASS (0 occurrences) |
| DKT badge (teal intent via PNG logo per D-01) | logo asset + reference in source and built HTML | PASS (1 img per locale) |
| AWS RU badge amber | amber badge class in built HTML + inline `AWS RU` text | PASS (1 badge span per locale) |
| Badges sit top-left of each card, above title | vertical stack structure — badge slot is first child inside each card `<a>` | PASS (confirmed in source) |
| Both locales render identically (DOM shape) | built HTML section counts | PASS (2 cards, 1 DKT logo, 1 amber badge, 0 music-note SVG per locale) |

## Checks Performed

### Source hygiene (`src/components/Podcasts.astro`)

- ✓ No hardcoded hex colors
- ✓ No deprecated cyan (`#06B6D4`, `#22D3EE`, `text-cyan-*`, `bg-cyan-*`)
- ✓ No AWS employer orange (`#FF9900`, `#232F3E`)
- ✓ No `podcasts[]` array declaration
- ✓ No `PodcastIcon` type alias
- ✓ No `color` or `icon` fields
- ✓ No music-note SVG path `M9 19V6l12-3v13`
- ✓ No `text-accent/70` or `text-warm/70` stat tints
- ✓ No `group-hover:text-accent` on h3 (D-16 — only footer gets teal hover)

### Build gate

- ✓ `npm run build` exits 0 with 7 pages in ~795 ms
- ✓ `dist/en/index.html` and `dist/ru/index.html` both exist

### Built HTML DOM shape (both locales)

Verified via python-based section extraction (built HTML is minified so line-by-line awk fails; python regex handles it).

| Metric | EN | RU |
|---|---|---|
| DKT logo `<img>` tags in Podcasts section | 1 | 1 |
| Card anchors (`rounded-xl bg-bg border border-border card-glow`) | 2 | 2 |
| Amber badge class (`bg-brand-accent-soft`) | 1 | 1 |
| `AWS RU` text (excluding comments) | 1 | 1 |
| Music-note SVG paths | 0 | 0 |
| Teal hover affordances (`group-hover:text-brand-primary-hover`) | 2 | 2 |

### Schema drift

- ✓ `gsd-sdk query verify.schema-drift 05` returned `{"valid": true, "issues": [], "checked": 1}`

### Worktree merge

- ✓ Merged `worktree-agent-a0923fdf` back to `main` via `--no-ff` merge commit `d5bcf4e`
- ✓ SUMMARY.md restored after post-merge resurrection guard false positive (commit `b068745`)
- ✓ Worktree + branch removed cleanly

## Plan-level verification

- ✓ Plan 05-01 `must_haves.truths` (22 criteria) — all PASS (grep + build + DOM checks from executor's SUMMARY.md)
- ✓ Plan 05-01 `must_haves.artifacts` — `src/components/Podcasts.astro` 80 lines, contains `AWS RU`, default export preserved
- ✓ Plan 05-01 `must_haves.key_links` — i18n access preserved, YouTube + Spotify URLs preserved, Tailwind tokens resolve correctly

## Human Verification (deferred to post-deploy)

Per the user's established workflow (see `.planning/STATE.md` §Notes), live visual verification via playwright-cli against `https://vedmich.dev` after GitHub Pages deploy:

1. DKT card shows the DKT logo with white chrome in top-left above the title, card-glow teal ring on hover
2. AWS RU card shows the amber "AWS RU" badge in top-left above the title, visually distinct from teal elements
3. Stats row reads as mono muted (no color tint)
4. "Listen →" / "Слушать →" footer translates right on hover with teal color change
5. Both cards have functional outbound links (DKT → YouTube, AWS RU → Spotify)
6. RU locale renders with the same DOM shape (already confirmed in built HTML)

Status: **automated verification PASSED**. Phase goal achieved. Human visual verify happens post-commit/deploy per workflow.
