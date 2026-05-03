---
status: partial
phase: 02-code-block-upgrades
source: [02-VERIFICATION.md]
started: 2026-05-03
updated: 2026-05-03
---

## Current Test

Awaiting live production verification on https://vedmich.dev after hotfix deploy `64e62c2`.

## Tests

### 1. Deep Signal palette renders on live vedmich.dev
expected: Open `/en/blog/2026-03-20-karpenter-right-sizing` — `.prose pre.astro-code` has background `#0D1117`, YAML keywords render teal `#14B8A6`, strings render amber `#F59E0B`. Badge "YAML" top-left, copy icon top-right.
result: [pending]

### 2. Copy UX + toast contrast (WR-01 fix)
expected: Click Copy on any code block → green toast "Copied to clipboard" slides in top-right. Text is dark-on-green, readable WCAG AA (`#0F172A` on `#10B981`, ~7.1:1). Toast auto-hides after ~2s. Paste in text editor → yaml content matches exactly including trailing newline (WR-02 fix).
result: [pending]

### 3. Russian locale parity
expected: `/ru/blog/2026-03-20-karpenter-right-sizing` — hover expands button to "КОПИРОВАТЬ", toast shows "Скопировано в буфер".
result: [pending]

### 4. Accessibility — reduced motion + keyboard focus
expected: Tab to Copy button → `:focus-visible` outline visible. DevTools → Rendering → toggle `prefers-reduced-motion: reduce` → Copy click → toast appears/disappears instantly without transition. VoiceOver announces toast text.
result: [pending]

## Summary

total: 4
passed: 0
issues: 0
pending: 4
skipped: 0
blocked: 0

## Gaps
