---
type: backlog-milestone
status: planned
version: v0.5
name: Content Platform
created: 2026-05-01
starts_after: v0.4 (pending Phases 10-12)
---

# Milestone v0.5 — Content Platform

**Goal.** Move vedmich.dev from "static site with handful of posts" to a
platform that lifts existing artifacts (Slidev slides, vv-carousel PNGs,
Excalidraw diagrams, vault notes, podcast episodes) into blog posts
with minimal manual work. Carousel/slide content should be
**integrated as-is** (no major rewrites) per user requirement.

## Phases (tentative)

| # | Phase | Scope | Est |
|---|---|---|---|
| **v0.5 Phase 1** | **Rich-media integration** | Primitives (`VvStage` / `VvNode` / `VvWire` / `VvPacket` Astro components mirroring Slidev Vue primitives) + Shiki language badge + `// [!code highlight]` transformer + Excalidraw `.json → SVG export → embed` pipeline. See `.planning/notes/rich-media-integration.md` for the 212-line design sketch. | 6-10h |
| **v0.5 Phase 2+** | **Podcast / talk companion posts** | Use `vv-blog-from-vault` skill to ship companion posts for new DKT + AWS-RU podcast episodes as they're recorded. Ongoing content work, not a fixed-scope phase — size per post. | TBD per post |
| **v0.5 Phase 3 (optional hotfix)** | **Phase 9.1 — Karpenter animation polish** | Only if the Phase 9 rich-media experiment (`PodLifecycleAnimation` + code-copy button) surfaces issues on live. Not a commitment. | TBD |

## Design notes (from Phase 9 hotfix experience)

- **Hand-porting Slidev → Astro is ~30 min/slide today.** Bottleneck: icons (Iconify web-components → inline SVG), tokens (`var(--vv-teal)` → `var(--brand-primary)`), animation (CSS `offset-path` doesn't survive percentage-scaled containers — use SMIL `<animateMotion>` inside the same SVG viewBox instead), layout (fixed px → `aspect-ratio + %`).
- **Primitives approach (Wave 1) wins long-term** — slide authors compose `<VvStage>` + `<VvNode>` + `<VvWire>` + `<VvPacket>` in MDX, only coordinates and labels transfer. Dramatically cheaper than porting each slide by hand.
- **Excalidraw decision: static SVG export only** — no interactive `@excalidraw/excalidraw` React component (breaks zero-JS-by-default budget).
- **Carousels stay PNG.** vv-carousel assets already live as rendered PNGs in the vault; current reuse path (`cp out/*.png → public/blog-assets/<slug>/*.png`) works. Don't need iframe or HTML inline.

## Related artifacts

- `.planning/notes/rich-media-integration.md` — full design note + open questions + recommended priorities (Wave 1 primitives → Wave 2 code blocks → Wave 3 Excalidraw → Wave 4 optional Slidev→Astro codegen)
- `src/components/PodLifecycleAnimation.astro` — first hand-port, proof-of-concept for Wave 1 primitives shape
- `src/components/CodeCopyEnhancer.astro` — already shipped in Phase 9 hotfix; Wave 2 adds language badge + highlight-lines
- `/Users/viktor/Documents/GitHub/vedmichv/slidev-theme-vv/` — upstream Slidev theme with the 100+ slides waiting to be lifted
- `.claude/skills/vv-blog-from-vault/` — skill consumed by Phase 2+ podcast/talk companion posts

## Entry criteria (when to start v0.5)

- [ ] v0.4 Phase 10 complete (Contact: letter badges + working form, ~60min)
- [ ] v0.4 Phase 11 complete (Logo + favicon refresh, ~15min)
- [ ] v0.4 Phase 12 complete (Footer match, ~10min)
- [ ] v0.4 milestone marked complete via `/gsd-complete-milestone`
- [ ] `/gsd-new-milestone` run with name "Content Platform" and version "v0.5"

## Exit criteria (v0.5 done)

- [ ] Slidev slide lift takes < 10 min per slide (down from ~30 min) — proved by re-porting `PodLifecycleAnimation` onto Wave 1 primitives
- [ ] At least 1 Excalidraw diagram embedded via the new pipeline in an existing or new blog post
- [ ] Code blocks show language badge + support `// [!code highlight]` comments
- [ ] At least 2 companion posts shipped (podcast/talk episodes → blog posts)

## Non-goals

- Full interactive Excalidraw (too heavy for zero-JS budget)
- Slidev-perfect fidelity for every slide (some slides won't port cleanly; accept selectivity)
- Replicating Slidev presenter UX in blog posts
