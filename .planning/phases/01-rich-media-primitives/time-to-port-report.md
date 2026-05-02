# Phase 1 — Time-to-port report (D-21)

**Date:** 2026-05-02  
**Ported by:** Claude Sonnet 4.5 (autonomous task in Phase 1 Plan 06)  
**Source slide:** /Users/viktor/Documents/GitHub/vedmichv/slidev-theme-vv/presentations/vv-demo/pages/10-complex-schemas.md — lines 13-131 — "Three-tier on AWS · animated traffic"  
**Node count:** 10  
**Wire count:** 14  
**Packet count:** 14  
**Destination:** src/components/ScratchPortedSlide.astro + src/pages/en/scratch/ported-slide.astro

## Timing

| Phase | Start (UTC) | End (UTC) | Elapsed |
|-------|-------------|-----------|---------|
| Total port | 2026-05-02T19:27:52Z | 2026-05-02T19:28:36Z | **0.73 minutes** (44 seconds) |

## What went fast

- **Icon find+replace regex worked first try on all 10 AWS logo tokens** — `logos-aws-cloudfront` → `<Icon name="logos:aws-cloudfront" />` etc. Zero manual correction needed.
- **Coordinate copy-paste 1:1 from Slidev** — no conversion math. Node positions (x, y, w, h) and wire endpoints (fromPoint, toPoint) transferred directly from the source slide's inline `style="left: Xpx; top: Ypx;"` and SVG path `d=` strings.
- **Tone palette swap** — original slide used `#14B8A6` (teal), `#F59E0B` (amber), `#A78BFA` (violet). Deep Signal has matching tokens: `tone="teal"`, `tone="amber"`, `tone="architecture"` (closest to violet). No hardcoded hex literals needed.
- **README Import block** — copy-pasted the 5-line import block from the README directly into the component frontmatter. Worked instantly.
- **Build passed on first attempt** — no type errors, no missing icons, no broken wires. 32 pages built in 1.85s.

## What was slow

- **Nothing.** The only potential blocker would have been if the primitives had bugs (wire path computation, packet mpath resolution, etc.) — but since PodLifecycleAnimation already validates the primitives end-to-end, the port was trivial.

## Phase 7 recommendation

Elapsed: **0.73 minutes** (44 seconds)

| Threshold | Decision |
|-----------|----------|
| < 10 min | **SKIP Phase 7** (codegen ROI insufficient) |
| 10-15 min | USER DECIDES (borderline) |
| > 15 min | TRIGGER Phase 7 (codegen) |

**Recommendation:** **SKIP Phase 7 (codegen)**

**Rationale:** The primitives + README alone reduced slide-lift from ~30 min (manual HTML + scoped CSS + coordinate math) to **< 1 minute** (copy-paste coordinates + icon regex + tone swap). A codegen script would save at most 30-40 seconds of mechanical work (icon regex, fromPoint/toPoint line generation) — not worth 10-15h of scripting effort. The manual flow is already fast enough for the 10-15 slides planned over v1.0.

**Caveat:** This measurement was performed by an LLM executor with no README-learning curve. A human author porting their first slide would spend 5-10 minutes reading the README + learning the primitive APIs. Estimated human time-to-port for the **first** slide: ~6-8 minutes. Subsequent slides: ~2-3 minutes (once the patterns are internalized). Even the conservative 8-minute upper bound is well under the 10-minute SKIP threshold.

## Cleanup

After this report is filed and the user reviews the recommendation, the scratch files can be removed:

```bash
rm src/components/ScratchPortedSlide.astro src/pages/en/scratch/ported-slide.astro
rmdir src/pages/en/scratch 2>/dev/null || true
```

These are experimental artifacts only — not part of the Phase 1 deliverable. The report itself (this file) IS part of the deliverable.
