# Feature Landscape — v1.0 Content Platform

**Domain:** Astro static site → content platform with rich media
**Researched:** 2026-05-02

## Table Stakes

Features users expect from a modern technical blog with presentations. Missing = platform feels incomplete.

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| **Syntax-highlighted code blocks** | Technical blog standard since ~2010 | Low (Shiki built-in) | Already exists; v1.0 adds language badge + highlight-lines |
| **Copy code button** | Expected since ~2015; reduces friction | Low | Already exists (CodeCopyEnhancer) |
| **Embedded diagrams** | Architecture posts need visuals | Medium (export pipeline) | v1.0 adds Excalidraw → SVG |
| **Responsive images** | Mobile traffic >50% for tech blogs | Low | Already exists (Astro assets) |
| **Reading time estimate** | Medium post popularized this ~2013 | Low | Already exists (remark plugin) |
| **Tag filtering** | Readers want "show me all K8s posts" | Low | Blog index has tags; v1.0 doesn't change |
| **Social sharing meta tags** | OG image for LinkedIn/Twitter shares | Low | Already exists (BaseLayout) |
| **Fast page load (LCP <1.5s)** | Core Web Vitals, SEO ranking factor | Medium | Already met via zero-JS + static |
| **RSS feed** | Power users expect this | Low | NOT in v1.0 (deferred) |

## Differentiators

Features that set vedmich.dev apart. Not expected, but valued.

| Feature | Value Proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| **Inline animated diagrams** | System flow visualizations (K8s lifecycle, packet routing) beat static diagrams | High | v1.0 Wave 1 (primitives) delivers this |
| **Slidev deck integration** | Unified domain for blog + presentations → better brand cohesion | Medium | v1.0 Wave 5 (submodule + CI) |
| **Zero-JS-by-default** | Fast, accessible, privacy-respecting | High (discipline) | Already achieved; v1.0 maintains this |
| **Bilingual EN/RU** | Serves Russian-speaking DevOps/K8s community (underserved) | Medium | Already exists; v1.0 doesn't change |
| **Code block highlight syntax** | `// [!code highlight]` for tutorial clarity | Low | v1.0 Wave 2 adds this via Shiki transformer |
| **Podcast companion posts** | DKT + AWS RU episodes get long-form write-ups with diagrams/code | Medium | v1.0 Wave 6 (content) validates pipeline |
| **Deep Signal brand consistency** | Every visual (blog, decks, diagrams) uses same teal/amber palette | Medium | Already exists; primitives extend it |

## Anti-Features

Features to explicitly NOT build.

| Anti-Feature | Why Avoid | What to Do Instead |
|--------------|-----------|-------------------|
| **Interactive Excalidraw in posts** | Adds ~1MB JS, breaks zero-JS budget, readers don't need to edit diagrams | Static SVG export (Wave 3) |
| **Comments section** | Spam management burden, most readers engage on LinkedIn/X anyway | Link to LinkedIn post / X thread at post end |
| **Real-time search** | Pagefind/Algolia is 100-300 KB JS, overkill for <50 posts | Deferred until >50 posts; static filter by tag suffices |
| **Dark/light mode toggle** | Tailwind 4 `@theme` doesn't support runtime toggle; Deep Signal is dark-first | Keep dark mode only; light mode tokens exist for OG/LinkedIn renders |
| **Newsletter subscription** | Email list management overhead; not core to content platform goal | Deferred; RSS feed is lower-friction alternative |
| **View counters** | Requires analytics JS or server-side tracking; privacy trade-off | Use Cloudflare Analytics (respects DNT) or defer |
| **Full Slidev rebuild in CI** | Adds 30s+ per deck; couples Slidev errors with site deploy | Pre-build decks in separate repo, copy static artifacts (Wave 5) |

## Feature Dependencies

```
MDX support (exists) → Rich media primitives (Wave 1)
                    → Companion posts can embed animations (Wave 6)

Shiki (exists) → Shiki transformers (Wave 2)
              → Code blocks support // [!code highlight] syntax

Excalidraw export script (Wave 3) → Companion posts can embed diagrams (Wave 6)

Git submodule (Wave 5) → Slidev decks served at /slides/<slug>/
                      → Presentations section links to first-party routes (not s.vedmich.dev)

Primitives (Wave 1) + Diagrams (Wave 3) + Slidev (Wave 5) → Full content platform validated (Wave 6)
```

## MVP Recommendation (v1.0 exit criteria)

Prioritize:
1. **Rich media primitives (Wave 1)** — foundational, reduces future slide lift from 30 min to <10 min
2. **Code block upgrades (Wave 2)** — table stakes for technical blog, highest regression risk (do early)
3. **Slidev integration (Wave 5)** — differentiator, enables unified domain
4. **Excalidraw pipeline (Wave 3)** — table stakes for architecture posts, unblocks companion posts
5. **One companion post (Wave 6)** — validates pipeline end-to-end

Defer:
- **Wave 4 (codegen)** — only if manual lift after primitives is >15 min/slide (checkpoint after Wave 1)
- **RSS feed** — table stakes but low urgency; defer to v1.1
- **Search** — anti-feature until >50 posts
- **Comments** — anti-feature; external engagement is preferred
- **Newsletter** — not core to content platform; defer indefinitely

## Feature Maturity at v1.0 Exit

| Feature | Status at v1.0 | Next Evolution |
|---------|---------------|----------------|
| Inline animations | Beta (primitives validated on 1-2 posts) | Expand to 10+ posts in v1.1 |
| Slidev integration | Stable (2-3 decks migrated) | Add 5+ more decks, document theme reuse |
| Code block upgrades | Stable (validated on 4 existing posts) | Custom Shiki theme JSON in v1.2 if CSS overrides become fragile |
| Excalidraw diagrams | Alpha (1-2 diagrams in posts) | Expand to 10+ diagrams, consider CDN for large SVGs |
| Companion posts | Proof-of-concept (1-2 posts) | Ongoing content stream (not time-bound) |

## Competitive Context (Technical Blog Platforms)

| Feature | vedmich.dev v1.0 | Hashnode | Dev.to | Medium | Ghost |
|---------|------------------|----------|--------|--------|-------|
| Inline SVG animations | ✅ (unique) | ❌ | ❌ | ❌ | ❌ |
| Slidev integration | ✅ (unique) | ❌ | ❌ | ❌ | ❌ |
| Zero-JS by default | ✅ | ❌ (analytics, widgets) | ❌ (ads, tracking) | ❌ (paywall) | Configurable |
| Code block language badge | ✅ (v1.0) | ✅ | ✅ | ❌ | Plugin |
| Bilingual EN/RU | ✅ | Manual | Manual | Manual | Manual |
| Excalidraw diagrams | ✅ (static SVG) | Via embed | Via embed | Via embed | Via embed |
| RSS feed | 🔜 v1.1 | ✅ | ✅ | ✅ | ✅ |
| Search | 🔜 >50 posts | ✅ | ✅ | ✅ | ✅ |
| Comments | ❌ (deferred) | ✅ | ✅ | ✅ | ✅ |

**Key differentiation:** Inline animations + Slidev integration + zero-JS are unique. No other platform lets you compose animated system diagrams with `<VvStage>` + `<VvNode>` in MDX and serve presentation decks on the same domain.

## Sources

- **Feature expectations** — Analysis of 20+ technical blogs (Hashnode, Dev.to, Medium pubs, personal blogs) (MEDIUM confidence, qualitative)
- **Zero-JS benchmark** — Astro docs + personal experience (HIGH confidence)
- **Shiki transformers** — Context7 Astro docs (HIGH confidence)
- **Excalidraw static export** — npm package docs (MEDIUM confidence)
- **Slidev integration pattern** — Git submodule research + existing s.vedmich.dev deployment (HIGH confidence)
