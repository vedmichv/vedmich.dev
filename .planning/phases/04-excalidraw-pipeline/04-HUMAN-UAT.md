---
status: partial
phase: 04-excalidraw-pipeline
source: [04-VERIFICATION.md]
started: 2026-05-04T19:50:00Z
updated: 2026-05-04T19:50:00Z
---

## Current Test

[awaiting human testing]

## Tests

### 1. Visual check of shipped MCP diagram on live site
expected: `<img src=/blog-assets/2026-03-02-mcp-servers-plainly-explained/diagrams/client-server.svg>` renders as 3 labeled boxes (Claude Code / MCP Server / docs / API) with bidirectional arrows, at line 21 of the MCP post; labels are legible on both 1440×900 desktop and 375px mobile; no layout shift around the embed.
result: [pending]

### 2. Visual check of karpenter split-ownership diagram
expected: `<img src=/blog-assets/2026-03-20-karpenter-right-sizing/diagrams/split-ownership.svg>` renders as a 2-pool ownership diagram between the "split ownership" paragraph and "Technically" paragraph of the karpenter post. Helvetica fallback produces acceptable rendering on macOS (reviewer's platform) — WR-04 notes this is OS-dependent (Linux/Windows may fall back to Arial/sans-serif).
result: [pending]

### 3. Bilingual parity sanity check
expected: EN and RU posts both render the `<img>` in the same DOM position. Alt text is locale-appropriate on hover/screen-reader. No locale-specific layout breakage.
result: [pending]

## Summary

total: 3
passed: 0
issues: 0
pending: 3
skipped: 0
blocked: 0

## Gaps
