# Visuals Routing — decision tree

**Source:** CONTEXT.md D-37 (visual signals), D-38 (asset storage), D-39 (reuse FIRST), D-40 (animations deferred).

## Priority 0 — Reuse FIRST (D-39)

Before routing to a generation skill, check the vault for existing assets that fit the section.

| Topic | Vault path to check | Notes |
|-------|---------------------|-------|
| Karpenter / cluster autoscaling | `~/Documents/ViktorVedmich/40-Content/45-Personal-Brand/45.20-Brand-Kit/carousel-templates/karpenter-1000-clusters/out/*.png` | 7 rendered slides (c01-cover through c07-cta), 1080×1350 @ 2× retina |
| Kubernetes interview | `~/Documents/ViktorVedmich/40-Content/45-Personal-Brand/45.20-Brand-Kit/carousel-templates/k8s-interview/out/*.png` | Available if topic overlaps (CKA/CKS prep) |
| S3 security | `~/Documents/ViktorVedmich/40-Content/45-Personal-Brand/45.20-Brand-Kit/carousel-templates/s3-security-8point/out/*.png` | Available if topic overlaps |
| AWS Summit talk diagrams | `~/Documents/ViktorVedmich/40-Content/44-Speaking/44.20-Talk-Materials/*/diagrams/` | Check per talk |
| DKT podcast visuals | `~/Documents/ViktorVedmich/30-Projects/32-DKT/` | Episode thumbnails + diagrams |

If a slide/diagram fits the section: copy to `public/blog-assets/{slug}/<descriptive-kebab-name>.png`, skip generation.

Rename on copy — turn raw filenames like `c03-mistake1.png` into descriptive kebab-case like `trap-1-speed.png` for maintainability.

## Priority 1 — Route to a skill (only if Priority 0 yielded nothing)

| Section content signal | Delegate to | Natural-language invocation |
|------------------------|-------------|------------------------------|
| "flow", "sequence", "pipeline", 3+ enumerated steps | `mermaid-pro` | "Use mermaid-pro to generate a flowchart showing X (palette: midnight, platform: astro)." |
| "architecture", component diagram, subgraphs | `mermaid-pro` | "Use mermaid-pro for an architecture diagram with subgraphs (palette: cloud if AWS content)." |
| Hand-sketched / whiteboard style | `excalidraw` | "Sketch X in excalidraw style." Then: `node scripts/excalidraw-to-svg.mjs diagrams-source/<slug>/<name>.excalidraw.json public/blog-assets/<slug>/diagrams/<name>.svg` (see `diagrams-source/README.md`). |
| Physical metaphor, hero illustration | `art` | "Use art to generate a prompt for NanoBanana showing X." |
| Brand-consistent Deep Signal palette | `viktor-vedmich-design` | "Generate visual using viktor-vedmich-design UI kit." |
| Opinion / reflection / pure prose section | (no visual) | — |

## Invocation pattern

Per RESEARCH.md Pattern 5 — natural-language references activate the target skill's description trigger. Do NOT use `Skill()` call syntax (agent-only pattern).

## Astro rendering

- PNG/JPG: markdown `![alt](/blog-assets/{slug}/file.png)`. Served from `public/` as-is, no `astro:assets` optimization (carousel PNGs are already web-optimized).
- SVG: inline in markdown or via `<img>`. Prefer inline for zero request overhead.
- Mermaid: not required for Phase 9 (D-39 reuse carousel PNGs). If a future post genuinely needs mermaid rendering, add `markdown.syntaxHighlight.excludeLangs: ['mermaid']` to `astro.config.mjs` and pre-render via `mermaid-pro` skill or inline the SVG directly.

## Asset storage

Every image committed atomically with the post markdown (D-44):

```
public/blog-assets/{YYYY-MM-DD-slug}/
├── cover.png              ← optional, for future cover_image field
├── <descriptive-name-1>.png
└── <descriptive-name-2>.png
```

## Image path rule

All inline images use root-absolute paths: `/blog-assets/{slug}/file.png`. Relative paths break at `/ru/blog/...` (RESEARCH.md Pitfall 5).

The `scripts/deploy-post.sh` grep gate enforces this — any `](blog-assets/` (relative) in `src/content/blog/**/*.md` blocks the deploy.

## Animations (D-40, deferred)

CSS/SVG animations are allowed in posts but not required in Phase 9. Zero JS. If a future post genuinely needs a motion element:
- Prefer `<svg>` with `<animate>` or CSS `@keyframes` — never a JS library.
- Respect `prefers-reduced-motion` (consistent with `.animate-on-scroll` utility in `src/styles/global.css`).
