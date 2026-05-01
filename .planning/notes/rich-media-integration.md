---
type: note
status: captured
captured: 2026-05-01
proposed_phase: 13 (or 09.1 decimal if inserted before 10-12)
related_requirements: [REQ-002]
related_skills: [vv-blog-from-vault, vv-slidev, excalidraw, mermaid-pro]
---

# Rich-media integration in blog posts

**Goal.** Make it trivial to lift Slidev slide content, vv-carousel assets,
Excalidraw diagrams, and copy-paste code blocks into MDX blog posts
**without rewriting them by hand each time**.

---

## What we already have (post Phase 9 + hotfix)

- ✅ MDX support (`@astrojs/mdx@4.3.14`) — can `import Component from '...'` in posts.
- ✅ `PodLifecycleAnimation.astro` — hand-ported from Slidev slide 84
  (`slidev-theme-vv/presentations/vv-demo/pages/10-complex-schemas.md`).
  Zero JS, inline SVG + SMIL `<animateMotion>`, respects `prefers-reduced-motion`.
- ✅ `CodeCopyEnhancer.astro` — wraps every `<pre>` in `.prose` with a
  localized copy button (EN/RU labels), Clipboard API + textarea fallback.
- ✅ Carousel PNG reuse path (D-39): copy from
  `~/Documents/ViktorVedmich/40-Content/45-Personal-Brand/45.20-Brand-Kit/carousel-templates/<name>/out/*.png`
  → `public/blog-assets/<slug>/*.png` with descriptive kebab-case rename.

## What's painful / open

### 1. Hand-porting Slidev → Astro (the big one)

Current path for slide animation reuse:

1. Read slide source HTML + `<style scoped>`
2. Rewrite icons (Iconify web-components → inline SVG)
3. Swap Slidev's `var(--vv-teal)` etc. for site tokens (`var(--brand-primary)`)
4. Replace CSS `offset-path` with SMIL `<animateMotion>` (the offset-path
   coord-space bug surfaced during Phase 9 hotfix — worth documenting)
5. Rewrite `width: 1800px; height: 820px` fixed design canvas as
   `aspect-ratio + percent positions` so it scales in prose
6. Copy 7+ node positions, 7+ wire coordinates, 7+ packet paths by hand
7. Test
8. Commit

Takes ~30 min per slide. For the ~100 slides in `vv-demo`, this is a
cliff, not a workflow.

**What we want:** a pipeline that lifts a single slide (or a carousel)
into a reusable Astro component with minimal manual work. Possible
shapes of a solution (NOT decided yet — this needs brainstorming):

- **(A) Pre-render slide → static SVG** via Slidev's SPA export
  (`slidev export --format svg`). Commit the SVG to `public/blog-assets/<slug>/`
  and reference via `<img>` or inline `<svg>`. Preserves the visual
  faithfully, but loses the animation (unless Slidev exports SMIL, which
  it doesn't).
- **(B) Pre-render to PNG/WebP + Lottie** for motion. Heavy, complex.
- **(C) Port the slide once into a **theme-agnostic** Astro component**
  and parameterize it (nodes, wires, packets). Then re-use for different
  topics with different `props`. This is what `PodLifecycleAnimation`
  is, one step — but it's still hand-coded.
- **(D) Slidev → Astro transpiler**: a codegen tool that reads a
  single slide (MD frontmatter + body + scoped style), emits an
  `.astro` component with swapped tokens. Ambitious but could handle
  the common shapes (S1 grid, S2 lifecycle, S3 mesh, chain reactions).
  Biggest win but highest effort.
- **(E) Shared primitives library**: build `VvArchNode`, `VvWire`,
  `VvPacket` as Astro components mirroring the Slidev Vue components
  (`VvArchNode.vue`, `VvArchGrid.vue`). Slide authors compose them in
  MDX with coords, same way Slidev does with Vue. This is the
  compromise — some porting, but coordinates + labels are all that
  needs to transfer.

Recommendation (my gut): **E + D hybrid** — build primitives first,
then codegen pipeline that emits MDX using primitives. But this needs
a proper brainstorm.

### 2. Excalidraw integration

Slidev theme uses `slidev-addon-excalidraw`. Astro side: zero support.

Open question: do we want **interactive** Excalidraw (editable in-browser) or just
**static rendered** (export to SVG/PNG and embed)?

- **Interactive:** `@excalidraw/excalidraw` React component. Heavy
  (~1MB). Breaks "zero JS by default."
- **Static:** use `excalidraw` skill to export `.excalidraw.json` →
  SVG, commit SVG to `public/blog-assets/<slug>/`, embed inline or
  via `<img>`. Lightweight. No interactivity but readable.

Recommendation: **static SVG export**. Interactive diagrams aren't
worth the JS cost for blog posts.

### 3. vv-carousel integration

Carousels live in the vault as HTML files with CSS/JS
(`karpenter-1000-clusters/c01-cover.html` through `c07-cta.html`).
Each renders as a 1080×1350 slide.

Currently we copy the **rendered PNG** (from `out/`) into
`public/blog-assets/`. That works but is static.

Could we do better? Options:

- **Iframe embed** — include the raw HTML in an iframe. Preserves
  animations, CSS interactions. Downsides: iframe styling is painful,
  breaks page zoom, separate scroll context, SEO-invisible.
- **HTML inline into MDX** — MDX allows arbitrary HTML. Could copy
  the carousel's HTML + scoped `<style>` directly. But carousel HTML
  uses external fonts, complex CSS, and sometimes JS for reveals.
  Likely conflicts.
- **Keep PNGs** (current). Simplest. Loses animation.

Recommendation: **stay with PNGs for carousels**. The use case ("show a
slide from a carousel in a blog post") doesn't require animation. The
D-39 reuse-first pattern already works.

### 4. Code copy button — can we do better?

Current implementation works but:

- Shiki renders code blocks with inline styles, no language label.
  Button shows only "Copy" — readers don't know `yaml` vs `bash` at a
  glance without the first line of code.
- No line numbers (sometimes needed for tutorial posts).
- No "highlight lines 3-5" syntax.

Possible improvements:

- Add a language badge (top-right of code block, small pill)
- Add line-number option via frontmatter flag
- Use Shiki's `transformers` API for `// [!code highlight]` comments
  (official Astro pattern since 5.0)

## What to add in CLAUDE.md / vv-blog-from-vault skill

Currently `references/visuals-routing.md` has Priority 0 (reuse PNG)
and Priority 1 (delegate to mermaid-pro / excalidraw / art /
viktor-vedmich-design). Need to add:

- **Priority 2 — inline Astro animation component**: reference
  `PodLifecycleAnimation.astro` as the shape. Document the hand-port
  workflow (until we build the pipeline). Document the SMIL vs CSS
  offset-path gotcha.
- **Code block conventions**: always use language-tagged fences
  (```yaml, ```bash), first line should not be a file path (it
  breaks copy-paste-run).

## Rough scope for the proposed phase

**Wave 1 — primitives (E from section 1):**
- `src/components/visuals/VvNode.astro` (positioned box with icon + label)
- `src/components/visuals/VvWire.astro` (SVG line with dashed option +
  fade-in timing var)
- `src/components/visuals/VvPacket.astro` (SMIL-animated circle along path)
- `src/components/visuals/VvStage.astro` (sets up the 1800×820 viewBox
  context, handles responsive sizing)
- Refactor `PodLifecycleAnimation.astro` to use primitives as a
  validation test.

**Wave 2 — code block upgrades:**
- Shiki language badge (small pill, top-right)
- `// [!code highlight]` support via Shiki transformers
- Keep the copy button (already built)

**Wave 3 — Excalidraw pipeline:**
- Add `public/blog-assets/<slug>/diagrams/` convention
- Document: `excalidraw export → SVG → commit → `<img>` or inline`
- One real example in MCP post (client ↔ server diagram currently
  described in ASCII)

**Wave 4 — (optional, ambitious) Slidev → Astro codegen:**
- Script that reads one slide's `.md` + scoped `<style>`, emits
  `.astro` component using VvStage + VvNode + VvWire + VvPacket
- Handle S1 arch-grid, S2 lifecycle, S3 mesh patterns
- Not for every slide — just the mechanical transforms

**Alternative scope (smaller):** just Wave 1 + 2 + 3. Skip Wave 4;
keep hand-porting for slide animations but make it faster via primitives.

## Non-goals

- Full interactive Excalidraw embedding (too much JS).
- Slidev-exact fidelity for every slide (some slides won't port cleanly;
  accept selectivity).
- Replicating Slidev's presenter/navigation UX in blog posts.

## Current production issues that the hotfix left behind

- ⚠ **Animation packets verified working in build** (SMIL paths match
  wire coords), **but not yet visually confirmed on live** due to
  deploy timing / browser cache. First task of the new phase should be
  Playwright verification of the live animation.
- ⚠ **Code copy button not yet live-tested.** `grep` confirms the
  script + styles shipped in dist. First task: click-test on live.
- ⚠ **Shiki dark theme with Deep Signal tokens is not configured.**
  Current code blocks probably render with default Shiki light/dark
  palette, not site-matched colors. Check and add Shiki theme config
  in `astro.config.mjs` markdown section.
- ⚠ **CodeCopyEnhancer uses `is:inline` script** — runs per-page on
  DOM ready. Works, but could be a single `<script>` tag in BaseLayout
  instead if we want it site-wide (not just blog posts).

## Related files / context

- Slidev theme: `/Users/viktor/Documents/GitHub/vedmichv/slidev-theme-vv/`
- Reference slide: `pages/10-complex-schemas.md` line 330+ (S2 Pod lifecycle)
- Ported component: `src/components/PodLifecycleAnimation.astro`
- Current MDX post: `src/content/blog/{en,ru}/2026-03-20-karpenter-right-sizing.mdx`
- Skill: `.claude/skills/vv-blog-from-vault/references/visuals-routing.md`
