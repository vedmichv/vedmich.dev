# Technology Stack — v1.0 Content Platform

**Project:** vedmich.dev v1.0
**Researched:** 2026-05-02

## Recommended Stack

### Core Framework (EXISTING — no changes)
| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| Astro | 5.17.1 | Static site generator | Zero-JS-default, fast builds (~800ms for 31 pages), Content Collections, MDX support |
| Tailwind CSS | 4.2.1 | Styling | `@theme` bridge over design tokens, prose typography, responsive utilities |
| Node.js | 22.x | Runtime | LTS, required for Astro build + scripts |

### Content & Rendering (EXISTING + additions)
| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| @astrojs/mdx | 4.3.14 | MDX support for blog posts | Allows importing Astro components into markdown (primitives, animations) |
| Shiki | (built into Astro) | Syntax highlighting | Compile-time highlighting, no runtime JS, transformers API for `// [!code highlight]` |
| **@shikijs/transformers** | ^1.0.0 (NEW) | Code block enhancements | `transformerMetaHighlight` for highlight-lines syntax |
| remark-reading-time | custom | Reading time calculation | Existing remark plugin, no changes |
| @astrojs/sitemap | 3.7.0 | XML sitemap generation | SEO, existing |

### Rich Media (NEW for v1.0)
| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| **@excalidraw/excalidraw** | ^0.17.0 (NEW dev dep) | Excalidraw JSON → SVG export | Static diagram export, no runtime bundle (dev-time only) |
| SMIL (SVG animations) | (web standard) | Packet animations in primitives | Zero-JS, declarative, works in all modern browsers, avoids CSS offset-path bugs |

### Slidev Integration (NEW infrastructure)
| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| Git submodule | (core git feature) | Reference `vedmichv/slidev` repo | Tracks pre-built Slidev SPA exports, no Slidev build in main site CI |
| Slidev | (in separate repo) | Presentation framework | Decks are pre-built, main site only copies static artifacts |

### Deployment (EXISTING — no changes)
| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| GitHub Actions | latest | CI/CD | Auto-deploy on push to main, ubuntu-latest runner |
| GitHub Pages | latest | Static hosting | Free, CDN, custom domain support |
| actions/upload-pages-artifact | v3 | Artifact upload | Standard GH Pages workflow step |
| actions/deploy-pages | v4 | Deployment | Standard GH Pages workflow step |

## New Dependencies to Add

### Wave 2 (Code Block Upgrades)
```bash
npm install -D @shikijs/transformers
```

**Package:** `@shikijs/transformers`
**Purpose:** Provides `transformerMetaHighlight` for `// [!code highlight]` syntax

### Wave 3 (Excalidraw Integration)
```bash
npm install -D @excalidraw/excalidraw
```

**Package:** `@excalidraw/excalidraw`
**Purpose:** `exportToSvg` utility for `.excalidraw.json → SVG` conversion
**Note:** Large package (~5 MB), but only used at diagram authoring time, not during site build

## Alternatives Considered

| Category | Recommended | Alternative | Why Not |
|----------|-------------|-------------|---------|
| Syntax highlighter | Shiki (built-in) | Prism | Shiki is Astro default, compile-time, better theme support |
| Diagram tool | Excalidraw (static SVG) | Mermaid | Excalidraw gives more visual control; Mermaid is code-based |
| Animation approach | SMIL (SVG standard) | CSS animations + JavaScript | SMIL is zero-JS, declarative, avoids CSS offset-path coordinate bugs |
| Slidev integration | Git submodule | Monorepo (Turborepo) | Monorepo is overkill for 2-3 decks; submodule is simpler |
| Slidev integration | Git submodule | Artifact fetch | Artifact fetch is slower (30-90s), more brittle |
| MDX | @astrojs/mdx | Astro markdown only | MDX allows component imports (primitives), required for rich media |

## Sources

- **Astro Shiki** — Context7 `/websites/astro_build_en` (HIGH confidence)
- **@shikijs/transformers** — Shiki official docs (HIGH confidence)
- **Git submodule** — Core git feature (HIGH confidence)
- **SMIL animations** — Web standard, MDN docs (HIGH confidence)
