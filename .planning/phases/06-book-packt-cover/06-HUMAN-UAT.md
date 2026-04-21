---
status: partial
phase: 06-book-packt-cover
source: [06-VERIFICATION.md]
started: 2026-04-21T10:30:00Z
updated: 2026-04-21T10:30:00Z
---

## Current Test

[awaiting human testing]

## Tests

### 1. Book section visual verification on localhost dev + live (post-push)
expected: Amber band extends edge-to-edge at 1440×900 (bg `#451A03`, amber/30 borders top/bottom). Inside the band, the card is ≤ 1120px wide, centered. Cover image displays PACKT label (top-left) and V. Vedmich emboss (bottom) as baked-into-JPG labels. Rating row shows "★★★★★ 4.8 · Amazon" with amber stars, mono 4.8, muted Amazon label. Solid amber CTA (bg `#F59E0B`, text `#0F172A`) visible on amber-soft band with high contrast (~11:1). At 375×667 the card stacks vertically: cover → text+rating → CTA, full-width amber band still edge-to-edge.
result: [pending]

### 2. Both locales render identically at 1440×900 and 375×667
expected: EN (/en/#book) and RU (/ru/#book) show structurally identical layout. Only text content differs: h2 "Book" / "Книга", h3 "Cracking the Kubernetes Interview" (same in both), description EN/RU variants, CTA "Get on Amazon" / "Купить на Amazon". Cyrillic text renders cleanly, no font fallback glitches, CTA + arrow SVG align correctly with longer "Купить на Amazon" label.
result: [pending]

### 3. No horizontal-scroll regression on live at 1440×900 and 375×667 after push to main
expected: Neither viewport shows a horizontal scrollbar. The full-bleed amber band must not exceed 100vw — this is the first full-bleed coloured section in the site so there's no precedent. Test on live https://vedmich.dev/en/#book and https://vedmich.dev/ru/#book after GH Pages deploys.
result: [pending]

## Summary

total: 3
passed: 0
issues: 0
pending: 3
skipped: 0
blocked: 0

## Gaps
