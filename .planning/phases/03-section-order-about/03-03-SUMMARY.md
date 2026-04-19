---
phase: 03-section-order-about
plan: 03
status: complete
completed: 2026-04-19
files_changed:
  - src/components/About.astro
  - src/components/Header.astro  # expanded scope (B-path): header tokens + search + lang
---

# Plan 03-03 — About rewrite + Header token fidelity — SUMMARY

## What changed

### About.astro (planned scope)
- Full rewrite to match reference `app.jsx:400-421` — grid `1.4fr / 1fr`, bio + teal accent, Expertise overline + pills, cert cards removed.
- **Typography fidelity fixes:** `h2` size 30→**28px**, weight 700→**600**, margin-bottom 48→**40px**, bio line-height 1.625→**1.7**. These match reference `Section` primitive (`app.jsx:106`, `fontSize: 28, fontWeight: 600, marginBottom: 40`).
- Container: `max-w-6xl` (1152) → `max-w-[1120px]` to mirror reference `maxWidth: 1120`.
- Section padding: `px-4 sm:px-6` → `px-6` (reference uses a single 24px, not the 16→24 responsive bump).

### Header.astro (expanded scope — user request during 03-03 checkpoint)
Scope expanded mid-phase at user request ("B - пофиксим тут") — Header recreated to match reference `app.jsx:305-355` token-for-token. Specific changes:

| Element | Before | After (reference) |
|---|---|---|
| Container max-width | `max-w-6xl` (1152) | `max-w-[1120px]` |
| Container padding | `px-4 sm:px-6 h-16` | `px-6 py-[14px]` |
| Logo img | 28×28 `rounded-md` | 32×32 `rounded-[7px]` |
| Logo text | `font-semibold text-sm` | `font-bold text-base` |
| Nav link color | `text-text-muted` | `text-text-secondary` |
| Nav link hover | `hover:text-text` | `hover:text-brand-primary` |
| Search bg | `bg-bg-elevated/60 rounded-lg` | `bg-bg-base rounded-[7px]` |
| Search icon | SVG lens, `text-brand-primary-hover` | Mono `⌕` char, `text-brand-primary` |
| Kbd | 11px, bg-base, border-border | **10px, bg-surface**, rounded-[3px], px-1.5 |
| Lang switcher | Two inline links with dot separator | Single bordered mono button `EN · RU` (6px radius, border, active state = bg-surface) |

Mobile menu markup kept (out of scope for this reference audit).

## Verification

### Automated
- `npm run build` → exit 0, 7 pages built in 837ms.
- `dist/en/index.html` and `dist/ru/index.html` both contain:
  - `<span class="text-brand-primary">«Cracking the Kubernetes Interview»</span>` ✓
  - 11 pill spans with exact reference class string ✓
  - No cert-card markup inside `<section id="about">` ✓
  - `<section id="book"` byte-offset < `<section id="speaking"` byte-offset ✓

### Visual (Playwright, localhost:4321)
- `phase3-fix-en-about.png` — EN About at 1440px with `animate-on-scroll` forced visible → layout matches reference (2-col 1.4fr/1fr, teal accent, 11 pills, EXPERTISE overline).
- `phase3-fix-ru-about.png` — RU About matches with Russian bio + English book title in teal, ЭКСПЕРТИЗА overline.
- Header: logo 32px, nav in text-secondary medium, search trigger with `⌕ Search… ⌘K`, lang switcher as single bordered button — all present and rendered correctly.

## Task 3 checkpoint

User flagged three issues on initial visual review:
1. "About секция занимает слишком много места" → root cause was **screenshot-time `animate-on-scroll`** (opacity: 0 before observer fires), not a real spacing bug. Re-captured with `is-visible` forced → no empty gaps.
2. "Шрифты не такие, фон не такой" → real bug: h2 used `text-3xl font-bold` instead of reference `28px/600`. Fixed.
3. "Секция поиска и языка другая" → real bug: search pill used wrong bg/icon/kbd; lang switcher was dot-separated text instead of single bordered button. Fixed.

Awaiting user `approved` on final screenshots to proceed with phase-level atomic commit.

## Commit

Deferred to phase-level atomic commit after user sign-off.
