---
status: partial
phase: 03-ui-polish
source: [03-VERIFICATION.md]
started: 2026-05-03T14:22:35Z
updated: 2026-05-03T14:22:35Z
---

## Current Test

[awaiting human testing]

## Tests

### 1. Live-site scroll animation feel on Blog + Presentations grids
expected: Scroll to /en/#blog at desktop (1440×900). Three BlogCards fade in with visible 0/60/120ms stagger cascade (~780ms total reveal). Scroll to /en/#presentations: six PresentationCards cascade at 0..300ms (~900ms total). No motion feels laggy or jarring.
result: [pending]

### 2. Card hover affordance on BlogCard and PresentationCard
expected: Hover any BlogCard or PresentationCard at 1440×900. Border transitions to teal (#14B8A6), teal glow shadow appears (0 0 20px rgba(20,184,166,0.15)), title text shifts to brand-primary. Easing feels expo-out (fast start, smooth settle) — not linear, not bouncy. No translate-Y lift (per D-02 reference).
result: [pending]

### 3. Reduced-motion preference on live site
expected: Toggle System Preferences → Accessibility → Reduce Motion on macOS (or equivalent). Reload /en/. All .animate-on-scroll elements are immediately opacity:1 with no cascade. Cards on Blog and Presentations grids all appear simultaneously (no 60ms staggered delays).
result: [pending]

### 4. Mobile (375px) bottom CTA alignment under cards
expected: Open /en/ on real iPhone SE (1st gen, 320px) or browser devtools 375px viewport. Scroll to Blog section → 3 cards stack single-column, bottom 'All posts →' CTA visible under last card, mt-10 spacing feels right. Same for Presentations (6 cards stacked) → bottom 'All decks →' CTA visible. Speaking → 'All talks →' with matching quiet tone.
result: [pending]

### 5. Spacing/typography audit 'zero nits' assertion at 1440 + 375
expected: Compare live /en/ against reference app.jsx at both viewports. Per D-04 'light audit' scope, accept current state as ~98% reference match after 2 FIX commits (About sm:py-28 + Podcasts bg-surface/gap-5). Acknowledge 3 deferred findings (DEFER-1 H2 scale, DEFER-2 About Me casing, DEFER-3 max-w-6xl harmonization) as cross-cutting future work.
result: [pending]

## Summary

total: 5
passed: 0
issues: 0
pending: 5
skipped: 0
blocked: 0

## Gaps
