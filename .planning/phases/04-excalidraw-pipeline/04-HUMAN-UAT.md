---
status: resolved
phase: 04-excalidraw-pipeline
source: [04-VERIFICATION.md]
started: 2026-05-04T19:50:00Z
updated: 2026-05-04T20:25:00Z
---

## Current Test

[all tests verified]

## Tests

### 1. Visual check of shipped MCP diagram on live site
expected: `<img src=/blog-assets/2026-03-02-mcp-servers-plainly-explained/diagrams/client-server.svg>` renders as 3 labeled boxes (Claude Code / MCP Server / docs / API) with bidirectional arrows, at line 21 of the MCP post; labels are legible on both 1440×900 desktop and 375px mobile; no layout shift around the embed.
result: pass
evidence: Playwright verification on dev server localhost:4321. Desktop 1440×900: diagram renders correctly at natural 820×100 with 3 labeled rectangles and bidirectional arrows. Mobile 375px: scaled to 343×42 via `max-width: 100%; height: auto`, aspect ratio preserved (display 8.17 vs natural 8.20). Explicit width=820 + height=100 attributes on `<img>` prevent CLS by reserving space before load.

### 2. Visual check of karpenter split-ownership diagram
expected: `<img src=/blog-assets/2026-03-20-karpenter-right-sizing/diagrams/split-ownership.svg>` renders as a 2-pool ownership diagram between the "split ownership" paragraph and "Technically" paragraph of the karpenter post. Helvetica fallback produces acceptable rendering on macOS (reviewer's platform) — WR-04 notes this is OS-dependent (Linux/Windows may fall back to Arial/sans-serif).
result: pass
evidence: Playwright verification on macOS + Chromium (Playwright-bundled). Diagram renders with EKS cluster → Cluster Autoscaler (system) + Karpenter (workloads) → system nodegroup / app nodepool A / app nodepool B, labeled arrows connecting the ownership flow. Natural 1020×520, displayed 720×367 with aspect preserved. Helvetica labels legible. WR-04 caveat: Linux/Windows viewers may render with Arial/sans-serif fallback instead of Helvetica — tracked as non-blocking future regression check.

### 3. Bilingual parity sanity check
expected: EN and RU posts both render the `<img>` in the same DOM position. Alt text is locale-appropriate on hover/screen-reader. No locale-specific layout breakage.
result: pass
evidence: Both MCP locales: same SVG src, same width=820/height=100, same loading=eager. Alt text differs correctly: EN "MCP client-server architecture: Claude Code connects to an MCP Server...", RU "Архитектура MCP клиент-сервер: Claude Code подключается к MCP-серверу...". Both Karpenter locales: same SVG src, same width=1020/height=520, same loading=lazy. Alt EN "Split ownership: Cluster Autoscaler owns system node groups...", alt RU "Разделение ownership: Cluster Autoscaler владеет system node groups...". RU posts verified via `document.documentElement.lang === 'ru'` and Cyrillic h1.

## Summary

total: 3
passed: 3
issues: 0
pending: 0
skipped: 0
blocked: 0

## Gaps

None. All 3 visual verification items passed. WR-04 (Helvetica OS-dependence in Karpenter diagram) is a non-blocking flag tracked in 04-REVIEW.md for future consideration, not a blocker for phase completion.
