# Architecture Patterns — v1.0 Content Platform Integration

**Project:** vedmich.dev v1.0
**Domain:** Astro 5 static site → content platform with rich media primitives
**Researched:** 2026-05-02
**Overall confidence:** HIGH

## Executive Summary

v1.0 Content Platform adds rich-media primitives, Slidev deck integration, and content-pipeline tooling to an existing, validated Astro 5 site. Key architectural principle: **integrate without disrupting** — the 800ms build time, zero-JS-default budget, and bilingual routing must remain intact.

**Critical finding:** Astro Shiki configuration is markdown-scoped and static at build time. Transformers, themes, and language badges must be configured in `astro.config.mjs` `markdown.shikiConfig`, NOT in individual components. This means Wave 2 (code block upgrades) is a **global config change** with regression risk across all 4 existing blog posts.

**Slidev integration decision matrix:** Option A (git submodule + build-time copy) wins on simplicity, build speed preservation, and locale-agnostic serving. Slidev decks already exist as pre-built static SPA exports — copy them into `dist/slides/<slug>/` during CI, no Slidev rebuild per-deploy required.

## Recommended Architecture

### File Tree Additions

```
vedmich.dev/
├── .github/workflows/
│   └── deploy.yml                      # MODIFIED — add Slidev fetch + copy step
├── astro.config.mjs                    # MODIFIED — shikiConfig + transformers
├── package.json                        # MODIFIED — add @shikijs/transformers dev dep
├── public/
│   └── blog-assets/<slug>/
│       └── diagrams/                   # NEW — Excalidraw SVG exports
├── scripts/
│   ├── slidev-to-astro.mjs            # NEW (Wave 4) — codegen slide → Astro component
│   └── excalidraw-export.mjs          # NEW (Wave 3) — .excalidraw.json → SVG
├── src/
│   ├── components/
│   │   ├── visuals/                    # NEW directory
│   │   │   ├── VvStage.astro          # NEW — 1800×820 viewBox container
│   │   │   ├── VvNode.astro           # NEW — positioned icon + label box
│   │   │   ├── VvWire.astro           # NEW — SVG line with fade-in
│   │   │   └── VvPacket.astro         # NEW — SMIL-animated circle
│   │   ├── PodLifecycleAnimation.astro # MODIFIED — refactor onto primitives
│   │   ├── BlogPreview.astro          # MODIFIED — add top CTA + bottom CTA
│   │   └── Presentations.astro        # MODIFIED — add top CTA + bottom CTA
│   ├── content/
│   │   └── blog/{en,ru}/
│   │       ├── 2026-03-15-mcp-intro.md            # EXISTING
│   │       ├── 2026-03-20-karpenter-right-sizing.mdx  # EXISTING
│   │       ├── YYYY-MM-DD-dkt-companion.mdx       # NEW (companion post)
│   │       └── YYYY-MM-DD-aws-companion.mdx       # NEW (companion post)
│   └── styles/
│       └── global.css                  # MODIFIED — code block badge styles
├── slidev/                             # NEW git submodule (vedmichv/slidev)
│   ├── slurm-prompt-engineering/       # Pre-built SPA export
│   └── slurm-ai-demo/                  # Pre-built SPA export
└── dist/ (build output)
    └── slides/                         # NEW — copied from slidev/ during CI
        ├── slurm-prompt-engineering/
        └── slurm-ai-demo/
```

### Component Architecture (Wave 1 Primitives)

**Design principle:** Mimic Slidev Vue primitives as Astro slot-based components with props. Slide authors compose primitives in MDX with explicit coordinates (same workflow as Slidev).

#### VvStage.astro

**Purpose:** Establishes the 1800×820 design canvas via CSS `aspect-ratio` and provides a positioned container for child nodes and an SVG overlay for wires/packets.

**API:**
```astro
---
interface Props {
  title?: string;
  caption?: string;
}
---
<figure class="vv-stage">
  {title && <div class="vv-stage-title">{title}</div>}
  <div class="vv-stage-canvas">
    <slot name="nodes" />  <!-- Positioned VvNode components -->
    <svg class="vv-stage-wires" viewBox="0 0 1800 820" preserveAspectRatio="none">
      <slot name="wires" />  <!-- VvWire + VvPacket components -->
    </svg>
  </div>
  {caption && <figcaption class="vv-stage-caption">{caption}</figcaption>}
</figure>
```

**Styling:** Inherits `aspect-ratio: 1800 / 820` from inline style, border/background from design tokens, respects `prefers-reduced-motion`.

#### VvNode.astro

**Purpose:** A positioned box with icon + label. Animates on entry (slide-x, pop, or drop).

**API:**
```astro
---
interface Props {
  x: string;        // Left position as % (e.g., "20%")
  y: string;        // Top position as % (e.g., "40.24%")
  label: string;
  icon: string;     // Icon name (maps to inline SVG or slot)
  color?: 'teal' | 'amber';
  animation?: 'slide-x' | 'pop' | 'drop';
  delay?: number;   // Animation delay in ms
  slot?: string;    // For VvStage named slot routing
}
---
<div 
  class={`vv-node vv-anim-${animation} vv-ic-${color}`}
  style={`left: ${x}; top: ${y}; --delay: ${delay}ms;`}
  slot={slot}
>
  <slot name="icon">
    <!-- Default: inline SVG based on icon prop -->
  </slot>
  <span>{label}</span>
</div>
```

#### VvWire.astro

**Purpose:** SVG `<line>` element with fade-in animation. Used inside VvStage wire slot.

**API:**
```astro
---
interface Props {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  color?: 'primary' | 'accent';
  dashed?: boolean;
  delay?: number;  // Fade-in delay in ms
}
---
<line 
  class="vv-wire"
  style={`--wd: ${delay}ms;`}
  x1={x1} y1={y1} x2={x2} y2={y2}
  stroke={`var(--brand-${color || 'primary'})`}
  stroke-width="3"
  stroke-dasharray={dashed ? "8 5" : undefined}
/>
```

#### VvPacket.astro

**Purpose:** SMIL-animated circle along a path. Loops with pause between iterations.

**API:**
```astro
---
interface Props {
  path: string;     // SVG path data (e.g., "M 280 410 L 360 410")
  color?: 'primary' | 'accent';
  duration: string; // Animation duration (e.g., "1.4s")
  delay: string;    // Start delay (e.g., "1.2s")
  radius?: number;
  pauseDuration?: string; // Pause between loops (default: "4s")
}
---
<circle 
  r={radius || 10}
  fill={`var(--brand-${color || 'primary'})`}
  filter="url(#vv-glow)"
  opacity="0"
>
  <animateMotion 
    dur={duration}
    begin={`${delay};pkt${id}.end+${pauseDuration}`}
    repeatCount="1"
    id={`pkt${id}`}
    path={path}
  />
  <animate 
    attributeName="opacity"
    values="0;1;1;0"
    keyTimes="0;0.15;0.85;1"
    dur={duration}
    begin={`${delay};pkt${id}.end+${pauseDuration}`}
    repeatCount="1"
  />
</circle>
```

**Note:** Shared `#vv-glow` filter must be defined once in VvStage's SVG defs.

### Shiki Integration (Wave 2)

**Location:** `astro.config.mjs` `markdown.shikiConfig` block.

**Configuration shape (Context7-verified):**

```javascript
// astro.config.mjs
import { defineConfig } from 'astro/config';
import { transformerMetaHighlight } from '@shikijs/transformers';
import tailwindcss from '@tailwindcss/vite';
import sitemap from '@astrojs/sitemap';
import mdx from '@astrojs/mdx';
import { remarkReadingTime } from './remark-reading-time.mjs';

export default defineConfig({
  // ... existing config
  markdown: {
    remarkPlugins: [remarkReadingTime],
    shikiConfig: {
      theme: 'github-dark',  // Base theme; override with Deep Signal tokens in CSS
      wrap: true,
      transformers: [
        transformerMetaHighlight(),  // Enables // [!code highlight] syntax
      ],
      // Custom language aliases if needed
      langAlias: {},
    },
  },
  // ... rest
});
```

**Language badge implementation:**

- **NOT a Shiki transformer** — Shiki operates at token level, not DOM wrapper level.
- **Remark plugin approach:** Write `remark-code-badge.mjs` that wraps `<pre>` elements with a container div and injects a language label.
- **CSS positioning:** `.code-block-wrapper { position: relative; }` + `.code-lang-badge { position: absolute; top: 0.5rem; right: 0.5rem; }`
- **Existing CodeCopyEnhancer:** Currently wraps all `.prose pre` elements on DOM-ready. Needs coordination — either merge badge into CodeCopyEnhancer, OR have remark plugin emit badge alongside `<pre>`, and CodeCopyEnhancer respects it.

**Recommended approach:** Extend `CodeCopyEnhancer.astro` to also inject the language badge. Read `lang` attribute from `<pre>` element's `data-language` attribute (added by Shiki by default for fenced blocks with language tag).

**Deep Signal theme override:**

Shiki themes are JSON files. Creating a full custom theme is verbose. Instead:

1. Use `github-dark` base theme in config.
2. Override via CSS variables in `src/styles/global.css`:

```css
/* Code block Deep Signal overrides */
.prose pre {
  background: var(--bg-code) !important;
  border: 1px solid var(--border);
}

.prose code {
  color: var(--text-primary);
}

/* Shiki token overrides via CSS custom properties */
.shiki .token.keyword { color: var(--brand-primary); }
.shiki .token.string { color: var(--brand-accent); }
.shiki .token.comment { color: var(--text-muted); }
/* ... additional overrides as needed */
```

**Confidence:** MEDIUM. CSS override works but is fragile if Shiki changes token class names. Full custom Shiki theme JSON would be HIGH confidence but 10× more verbose.

### Excalidraw Integration (Wave 3)

**Pattern:** Static SVG export only (no interactive React component).

**Workflow:**

1. Author diagram in Excalidraw desktop or web app.
2. Export as `.excalidraw.json` to vault or temp location.
3. Run export script:
   ```bash
   node scripts/excalidraw-export.mjs path/to/diagram.excalidraw.json public/blog-assets/<slug>/diagrams/<name>.svg
   ```
4. Reference in MDX:
   ```markdown
   ![MCP client-server diagram](../../../public/blog-assets/mcp-intro/diagrams/client-server.svg)
   ```
   OR inline via `<img>` tag for more control.

**Script implementation (excalidraw-export.mjs):**

- Use `@excalidraw/excalidraw` npm package's `exportToSvg` utility (exists in 0.17+).
- Reads `.excalidraw.json`, renders to SVG string, writes to target path.
- **Dependency:** Add `@excalidraw/excalidraw` as dev dependency (large, but only used at build/authoring time, not runtime).

**Alternative (lighter):** Use Excalidraw CLI if available, or Excalidraw web export → save SVG directly. Script is optional convenience.

**Confidence:** HIGH. Static SVG export is well-supported.

### Slidev Integration Architecture

**Goal:** Serve pre-built Slidev SPA exports under `vedmich.dev/slides/<slug>/` without rebuilding Slidev on every main site deploy.

#### Option A: Git Submodule + Build-Time Copy (RECOMMENDED)

**Structure:**

```
vedmich.dev/
├── slidev/  (git submodule → vedmichv/slidev)
│   ├── slurm-prompt-engineering/
│   │   ├── index.html
│   │   ├── assets/
│   │   └── theme/
│   └── slurm-ai-demo/
│       └── ...
└── .github/workflows/deploy.yml
```

**CI workflow addition:**

```yaml
# .github/workflows/deploy.yml
jobs:
  build:
    steps:
      # ... existing checkout + setup steps

      - name: Checkout submodules
        run: git submodule update --init --recursive

      - name: Build Astro
        run: npm run build

      - name: Copy Slidev decks to dist
        run: |
          mkdir -p dist/slides
          cp -r slidev/slurm-prompt-engineering dist/slides/
          cp -r slidev/slurm-ai-demo dist/slides/

      # ... existing upload-pages-artifact step
```

**Pros:**

- Slidev decks are pre-built SPA exports (static HTML/CSS/JS) — no Slidev build step in main CI.
- Git submodule tracks `vedmichv/slidev` repo state; update submodule pointer to pull new decks.
- Build time impact: ~200ms for `cp -r` of 2-3 decks (~5 MB each).
- Locale-agnostic: Slides live at `/slides/<slug>/`, not `/en/slides/` or `/ru/slides/`. Decks are typically single-language anyway (EN for most, RU for DKT-specific).

**Cons:**

- Submodule update is manual (`git submodule update --remote slidev && git commit`).
- Slidev repo must maintain a `main` branch with pre-built exports (not source `.md` slides). Requires a separate CI in `vedmichv/slidev` that builds and commits to `main` (or a `dist/` branch).

**Implementation steps:**

1. Refactor `vedmichv/slidev` repo:
   - Option 1: Keep source slides in `src/<slug>/slides.md`, build to `dist/<slug>/`, commit `dist/` to a `gh-pages` or `dist` branch, submodule vedmich.dev to that branch.
   - Option 2: Have `vedmichv/slidev` `main` branch contain ONLY pre-built exports (build artifacts are committed). Source slides live elsewhere or in a separate branch.
   - **Recommended:** Option 2 for simplicity — `main` branch of `vedmichv/slidev` is treated as a dist artifact repo.

2. Add submodule:
   ```bash
   cd vedmich.dev
   git submodule add https://github.com/vedmichv/slidev.git slidev
   git commit -m "Add Slidev decks as submodule"
   ```

3. Update `.github/workflows/deploy.yml` per above.

4. Document "add a new deck" workflow:
   - Build deck locally in `vedmichv/slidev/<new-slug>/` via `slidev build --base /slides/<new-slug>/`.
   - Commit built artifacts to `vedmichv/slidev` `main`.
   - In `vedmich.dev`, run `git submodule update --remote slidev && git commit`.
   - Push to trigger redeploy.

#### Option B: Reusable Workflow + Artifact Fetch

**Structure:**

- `vedmichv/slidev` repo has a GitHub Actions workflow that builds all decks and uploads as artifact.
- `vedmich.dev` CI calls that workflow (or fetches latest artifact), downloads into `public/slides/` before Astro build.

**Pros:**

- No git submodule complexity.
- Source slides stay in `vedmichv/slidev` without committing build artifacts.

**Cons:**

- GitHub Actions artifact retention is 90 days by default; artifact must be re-fetched or workflow must be triggered on every main site deploy (slower).
- Cross-repo workflow dependencies are brittle (auth, artifact download API).
- Build time increases by 30-90s (trigger remote workflow + wait + download).

**Verdict:** More complex, slower. Option A is simpler.

#### Option C: Monorepo (Turborepo / pnpm workspace)

**Structure:**

```
vedmich-monorepo/
├── apps/
│   ├── site/  (Astro vedmich.dev)
│   └── slides/  (Slidev multi-deck setup)
└── packages/
    └── visuals/  (shared VvStage/VvNode components?)
```

**Pros:**

- Single repo, unified CI, shared dependencies.
- Turborepo caching could skip Slidev rebuild if slides unchanged.

**Cons:**

- Heavy refactor (move existing vedmich.dev into `apps/site/`).
- Slidev multi-deck setup is not first-class — each deck is typically a separate repo or directory with its own `package.json`. Monorepo structure would need custom scripting.
- Overkill for 2-3 decks.

**Verdict:** Too heavy for current scope. Revisit if deck count exceeds 10.

#### Recommended: Option A

**Rationale:**

- Preserves existing 800ms Astro build time (only adds ~200ms for copy).
- Decks are pre-built, no Slidev dependency in main site `package.json`.
- Submodule update is explicit and versioned (main site always references a known state of decks).
- Locale routing is simple: `/slides/<slug>/` serves the SPA, no mirroring needed.

**Caveat:** Slidev SPA routes are client-side (Vue Router); GitHub Pages serves the SPA shell at `/slides/<slug>/index.html`, and Slidev handles sub-routes (`/slides/<slug>/1`, `/slides/<slug>/2`) client-side. This works because GitHub Pages serves index.html for 404s within a directory (standard SPA pattern). Verified by existing `s.vedmich.dev` deployment.

### Slidev → Astro Codegen (Wave 4, OPTIONAL)

**Goal:** Reduce slide-to-blog-post porting from ~30 min to ~10 min by automating the mechanical transforms.

**Input:** A single Slidev slide (`.md` file with frontmatter + body + scoped `<style>`).

**Output:** Astro component using VvStage/VvNode/VvWire/VvPacket primitives.

**Script contract (scripts/slidev-to-astro.mjs):**

```
node scripts/slidev-to-astro.mjs \
  path/to/slidev/deck/pages/10-complex-schemas.md \
  src/components/GeneratedSlideComponent.astro
```

**Transform steps:**

1. Parse Slidev slide markdown (extract frontmatter, HTML body, `<style scoped>`).
2. Identify node positions (look for `<div class="vv-node" style="left: X%; top: Y%">`).
3. Map Iconify web-component references to inline SVG or VvNode icon prop.
4. Extract wire coordinates from scoped `<style>` `.vv-wire-N` rules.
5. Extract packet paths from `offset-path` CSS or `<animateMotion>` if already converted.
6. Generate Astro component with:
   - `<VvStage>` wrapper
   - `<VvNode>` for each node (slot="nodes")
   - `<VvWire>` for each wire (slot="wires")
   - `<VvPacket>` for each packet (slot="wires")
7. Map Slidev token vars (`var(--vv-teal)`) to site tokens (`var(--brand-primary)`).

**Complexity:** HIGH. Requires HTML parsing, CSS parsing, coordinate extraction, heuristic matching (which icon maps to which node).

**Recommendation:** Start with Wave 1-3, validate by hand-porting `PodLifecycleAnimation` onto primitives. If primitives prove ergonomic and lift time drops to 15-20 min, codegen ROI is lower. If still painful, invest in Wave 4.

**Alternative (lower effort):** Instead of full codegen, build a **template generator** — emit a skeleton Astro file with placeholder props, slide author fills in coordinates/labels by hand. Still saves 10+ min vs copy-pasting the full HTML.

### Build Order & Wave Dependencies

**Wave dependency graph:**

```
Wave 1 (primitives) → Refactor PodLifecycleAnimation as validation
                   ↓
Wave 2 (Shiki)  ← no dependency on Wave 1, but MUST validate against existing posts
                   ↓
Wave 3 (Excalidraw) ← no dependency on Wave 1 or 2
                   ↓
Wave 4 (codegen) ← depends on Wave 1 (needs primitives to exist)
                   ↓
Slidev integration ← independent, but best after primitives (so new companion posts can use them)
                   ↓
Polish (CTAs) ← independent, low risk, can run in parallel with anything
                   ↓
Companion posts ← depends on primitives (if posts use animations) + Excalidraw (if posts use diagrams)
```

**Recommended phase sequence:**

1. **Phase 1 (Wave 1):** Primitives + refactor PodLifecycleAnimation. Validates primitives API.
2. **Phase 2 (Wave 2):** Shiki upgrades (config + language badge). Regression-test all 4 existing posts.
3. **Phase 3 (Polish):** Add "See all" CTAs. Independent, low risk, fast win.
4. **Phase 4 (Wave 3):** Excalidraw pipeline. Replace ASCII diagram in MCP post, add 1-2 more.
5. **Phase 5 (Slidev integration):** Submodule + CI + docs. Big infrastructure change, isolate it.
6. **Phase 6 (Companion posts):** Ship 2 companion posts using primitives + diagrams.
7. **Phase 7 (Wave 4, OPTIONAL):** Codegen script if manual porting is still painful.

**Rationale for ordering:**

- **Wave 1 first:** Primitives are foundational, low risk (only touch new files + one existing component). Validate before building atop them.
- **Wave 2 early:** Shiki config is global; catch regressions early before adding more posts. If it breaks, less content to fix.
- **Polish (CTAs) early:** Fast win, increases homepage UX immediately, unblocks nothing.
- **Excalidraw before companion posts:** Companion posts will likely want diagrams; have the pipeline ready.
- **Slidev integration standalone:** Big CI change; don't couple with other work.
- **Companion posts late:** Validate entire pipeline (primitives + diagrams + Slidev decks) are stable before using in production posts.
- **Wave 4 last (optional):** Only do if manual lift is still >15 min/slide after primitives.

### Regression Prevention Strategy

**Target:** Existing 4 blog posts + 7 speaking pages + 6 presentations must not break during Shiki / Slidev / primitives integration.

**Tactics:**

1. **Wave 1 (primitives):** Only new files + one component refactor. Risk: LOW. Mitigation: Visual test PodLifecycleAnimation before/after on `/blog/karpenter-right-sizing`.
2. **Wave 2 (Shiki):** Global config change. Risk: MEDIUM. Mitigation:
   - Local preview all 4 posts (`/blog/*`) after config change.
   - Check that existing code blocks (yaml, bash, typescript, dockerfile) render correctly.
   - Verify copy button still works (CodeCopyEnhancer reads `<pre>` structure).
   - Playwright screenshot comparison (before/after) for one post.
3. **Wave 3 (Excalidraw):** Only adds new assets. Risk: NONE unless script errors.
4. **Slidev integration:** Only touches CI + submodule. Astro build path unchanged. Risk: LOW. Mitigation: Verify `npm run build` still produces 31 pages in ~800ms.
5. **Polish (CTAs):** Modifies BlogPreview.astro + Presentations.astro. Risk: LOW. Mitigation: Visual test homepage sections.

**Key regression test checklist (run after Wave 2):**

- [ ] All 4 blog posts render without errors
- [ ] Code blocks show language badge (if implemented)
- [ ] Copy button works on all code blocks
- [ ] `// [!code highlight]` comments (if used in existing posts) highlight correctly
- [ ] PodLifecycleAnimation animates correctly (packets, wires, nodes)
- [ ] Build time remains <1s for 31 pages
- [ ] No console errors on any locale (`/en/`, `/ru/`)

## Component Boundaries

| Component | Responsibility | Communicates With |
|-----------|---------------|-------------------|
| `VvStage.astro` | Layout container, viewBox, animation context | Child VvNode (via slot), SVG overlay for VvWire/VvPacket |
| `VvNode.astro` | Positioned box with icon + label + entry animation | VvStage (via slot), CSS variables for animation timing |
| `VvWire.astro` | SVG line with fade-in | VvStage SVG slot, CSS animation |
| `VvPacket.astro` | SMIL-animated circle | VvStage SVG slot, SMIL timing references wire delay |
| `CodeCopyEnhancer.astro` | Wraps code blocks with copy button + language badge | Shiki-rendered `<pre>` elements, reads `data-language` attribute |
| `excalidraw-export.mjs` | Converts `.excalidraw.json` → SVG | Node script, reads file, writes SVG |
| `slidev-to-astro.mjs` (optional) | Parses Slidev slide, emits Astro component | Node script, reads `.md`, writes `.astro` |
| `BlogPreview.astro` | Homepage section with top + bottom CTA | Collection API, BlogCard, i18n |
| `Presentations.astro` | Homepage section with top + bottom CTA | Collection API, PresentationCard, i18n |

## Data Flow

### Blog Post Authoring (with rich media)

1. Author writes MDX in `src/content/blog/{en,ru}/YYYY-MM-DD-slug.mdx`.
2. Imports primitives at top:
   ```astro
   import VvStage from '../../../components/visuals/VvStage.astro';
   import VvNode from '../../../components/visuals/VvNode.astro';
   // ...
   ```
3. Composes animation inline:
   ```astro
   <VvStage title="Example" caption="...">
     <VvNode slot="nodes" x="20%" y="40%" label="API" icon="cube" color="teal" />
     <VvWire slot="wires" x1="280" y1="410" x2="360" y2="410" />
   </VvStage>
   ```
4. Embeds Excalidraw diagram:
   ```markdown
   ![Diagram](../../../public/blog-assets/slug/diagrams/arch.svg)
   ```
5. Writes code block with highlight syntax:
   ```yaml
   apiVersion: v1  // [!code highlight]
   kind: Pod
   ```
6. Astro builds:
   - MDX → Astro component render
   - Shiki processes code block, `transformerMetaHighlight` parses `// [!code highlight]`
   - VvStage/VvNode render to HTML + inline CSS
   - CodeCopyEnhancer wraps `<pre>` at render time (SSR via `is:inline` script, or client-side via DOM scan)
7. Output: static HTML page with inline SVG animations, syntax-highlighted code, copy buttons, diagrams.

### Slidev Deck Deployment

1. Author builds deck locally in `vedmichv/slidev/<slug>/`:
   ```bash
   cd vedmichv/slidev/<slug>
   slidev build --base /slides/<slug>/
   ```
2. Commits built SPA to `vedmichv/slidev` repo `main` branch.
3. In `vedmich.dev`:
   ```bash
   git submodule update --remote slidev
   git add slidev
   git commit -m "Update Slidev decks"
   git push origin main
   ```
4. GitHub Actions CI:
   - Checks out main + submodules
   - Builds Astro (800ms)
   - Copies `slidev/<slug>/` dirs to `dist/slides/`
   - Uploads `dist/` artifact
   - Deploys to GitHub Pages
5. Result: `vedmich.dev/slides/<slug>/` serves Slidev SPA.

## Patterns to Follow

### Pattern 1: Primitives Composition in MDX

**What:** Use VvStage + VvNode + VvWire + VvPacket to build animations declaratively in MDX.

**When:** Any blog post that needs a system diagram with labeled nodes and animated data flow.

**Example:**

```astro
---
import VvStage from '../../../components/visuals/VvStage.astro';
import VvNode from '../../../components/visuals/VvNode.astro';
import VvWire from '../../../components/visuals/VvWire.astro';
import VvPacket from '../../../components/visuals/VvPacket.astro';
---

<VvStage title="Kubernetes Pod Lifecycle" caption="kubectl → API → scheduler → kubelet">
  <VvNode slot="nodes" x="10%" y="40%" label="kubectl" icon="terminal" animation="slide-x" delay={0} />
  <VvNode slot="nodes" x="30%" y="40%" label="API" icon="cube" animation="pop" delay={300} />
  
  <VvWire slot="wires" x1="180" y1="410" x2="360" y2="410" delay={700} />
  <VvPacket slot="wires" path="M 180 410 L 360 410" duration="1.2s" delay="1.2s" />
</VvStage>
```

**Why:** Coordinates + labels are explicit (portable from Slidev or drawn fresh). No brittle HTML + CSS + JS inline soup.

### Pattern 2: Shiki Highlight Comments

**What:** Use `// [!code highlight]` inline in code blocks to emphasize specific lines.

**When:** Tutorial posts where a specific line matters (e.g., "notice this field").

**Example:**

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: my-pod  // [!code highlight]
spec:
  containers:
  - name: app
    image: nginx
```

**Why:** Readers' eyes are drawn to the highlighted line. More effective than "look at line 3" prose.

### Pattern 3: Excalidraw for Architecture Diagrams

**What:** Author complex multi-layer diagrams (AWS VPC, K8s control plane, MCP flow) in Excalidraw, export to SVG, embed inline.

**When:** Diagram has 5+ components with relationships that don't fit the grid-based VvNode layout (e.g., nested boundaries, bidirectional arrows, annotations).

**Example:**

1. Draw in Excalidraw web/desktop.
2. Export as `.excalidraw.json` to `~/Downloads/mcp-flow.excalidraw.json`.
3. Run:
   ```bash
   node scripts/excalidraw-export.mjs ~/Downloads/mcp-flow.excalidraw.json public/blog-assets/mcp-intro/diagrams/flow.svg
   ```
4. In MDX:
   ```markdown
   ![MCP client-server flow](../../../public/blog-assets/mcp-intro/diagrams/flow.svg)
   ```

**Why:** Excalidraw is faster for freeform diagrams than coding SVG by hand. Static SVG keeps zero-JS budget.

### Pattern 4: Submodule Update for New Deck

**What:** Add or update a Slidev deck by updating the git submodule pointer.

**When:** New presentation ready to publish, or existing deck content updated.

**Workflow:**

1. Build deck in `vedmichv/slidev/<slug>/` via `slidev build --base /slides/<slug>/`.
2. Commit to `vedmichv/slidev` repo.
3. In `vedmich.dev`:
   ```bash
   git submodule update --remote slidev
   git commit -m "Add <Deck Name> presentation"
   git push
   ```
4. CI deploys automatically.

**Why:** Git submodule gives explicit versioning; main site always references a known deck state.

## Anti-Patterns to Avoid

### Anti-Pattern 1: Hardcoding Animation Coordinates in Component Logic

**What:** Putting node positions or wire paths inside component JavaScript/TypeScript logic (e.g., computed from props).

**Why bad:** Makes the component opaque. Slide authors can't see the layout without reading code.

**Instead:** Accept explicit x/y props. Coordinates should be visible in the MDX call site.

### Anti-Pattern 2: CSS `offset-path` for Packet Animation

**What:** Using CSS `offset-path: path('M ...')` for animating packets along wires.

**Why bad:** `offset-path` coordinates are in the CSS coordinate space, which scales with the container. When VvStage uses `aspect-ratio`, percentage widths, and viewport scaling, the coordinate space is inconsistent. Result: packets drift off the wire path on certain screen sizes.

**Instead:** Use SMIL `<animateMotion>` inside the SVG viewBox. SVG user-space coordinates are stable across responsive sizing.

**Evidence:** Phase 9 hotfix for vedmich.dev hit this bug. SMIL fixed it. (Documented in `PodLifecycleAnimation.astro` header comment.)

### Anti-Pattern 3: Rebuilding Slidev Decks on Every Main Site Deploy

**What:** Running `slidev build` inside `vedmich.dev` CI for every deck on every push.

**Why bad:** Slidev build is ~10-30s per deck. For 10 decks, that's 100-300s (1.5-5 min) added to CI. Also requires Slidev as a dependency in main site `package.json`.

**Instead:** Pre-build decks in `vedmichv/slidev` repo, commit artifacts, reference via submodule. Main site CI only copies static files (~200ms).

### Anti-Pattern 4: Full Custom Shiki Theme JSON

**What:** Writing a 500-line Shiki theme JSON file to match Deep Signal tokens exactly.

**Why bad:** Brittle. Shiki theme format changes between versions. Maintaining token mappings is tedious.

**Instead:** Use a close built-in theme (`github-dark`) and override specific tokens via CSS. 90% of the visual match with 10% of the maintenance burden.

### Anti-Pattern 5: Interactive Excalidraw in Blog Posts

**What:** Embedding `@excalidraw/excalidraw` React component for live editing in blog posts.

**Why bad:** Breaks zero-JS-default budget. Adds ~1MB to page weight. Readers don't need to edit diagrams; they need to read them.

**Instead:** Static SVG export. If interactivity is truly needed (rare), link to a separate Excalidraw live link.

## Scalability Considerations

| Concern | At 10 posts | At 50 posts | At 200 posts |
|---------|------------|-------------|--------------|
| **Build time** | ~1s (current) | ~2-3s (Astro scales well) | ~8-12s (still fast; consider ISR if it grows) |
| **Slidev deck count** | 2-3 decks (~10 MB) | 10 decks (~50 MB) | 30+ decks (~150 MB) — submodule becomes heavy |
| **Excalidraw SVG assets** | ~5 diagrams (~500 KB) | ~25 diagrams (~2.5 MB) | ~100 diagrams (~10 MB) — consider CDN |
| **Code block rendering** | No issue (Shiki is fast) | No issue | No issue (Shiki is compile-time, not runtime) |
| **Primitives overhead** | Minimal (inline CSS + SVG) | Minimal | Consider extracting common animations to reusable components |

**Recommendations:**

- **At 50 posts:** Consider adding pagination or filtering to blog index page (not homepage BlogPreview — that stays top 3).
- **At 30 decks:** Slidev submodule becomes large. Consider splitting decks into a separate repo that publishes to a CDN, or use Option B (artifact fetch) instead.
- **At 100 diagrams:** Move `public/blog-assets/` to a separate CDN or git-lfs to keep main repo size manageable.
- **Build time ceiling:** Astro static builds scale linearly. If build time exceeds 30s at 200 posts, consider Astro's experimental Server Islands or SSR mode for blog routes (trade-off: loses GitHub Pages deploy simplicity).

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| **Primitives API** | HIGH | Validated pattern (Slidev uses it, PodLifecycleAnimation proves Astro can do it) |
| **Shiki config** | MEDIUM | Context7-verified config shape, but CSS override for theme is fragile |
| **Language badge** | MEDIUM | Requires custom remark plugin or extending CodeCopyEnhancer; not built-in |
| **Excalidraw export** | HIGH | Static SVG export is well-supported by `@excalidraw/excalidraw` package |
| **Slidev submodule** | HIGH | Standard git submodule + CI copy pattern, proven by countless projects |
| **Codegen (Wave 4)** | LOW | Not yet prototyped; complexity unknown until attempted |
| **Build time impact** | HIGH | Slidev copy is ~200ms, primitives are inline CSS (zero runtime JS) |
| **Regression risk** | MEDIUM | Shiki config change is global; needs testing against all existing posts |

## Open Questions

1. **Should language badge be per-block or global?**
   - Per-block: Author can opt out via frontmatter or prop.
   - Global: Always on, simpler implementation.
   - **Recommendation:** Global with CSS override (`.code-block-wrapper.no-badge .code-lang-badge { display: none; }`). Simpler, and opt-out is rare.

2. **How to handle Slidev decks with multiple themes?**
   - Current: All decks use `slidev-theme-slurm`.
   - Future: DKT decks use `slidev-theme-dkt` (purple + green).
   - **Answer:** Each deck's build includes its theme CSS. When copied to `dist/slides/<slug>/`, theme is self-contained. No conflict.

3. **Should primitives be in a separate package (for reuse in Slidev)?**
   - Pro: DRY if Slidev theme and Astro site share primitives.
   - Con: Adds complexity (monorepo or npm package).
   - **Recommendation:** Not yet. Wait until there's a third consumer. Current duplication (Slidev Vue + Astro components) is manageable.

4. **Do Slidev decks need i18n (EN + RU routes)?**
   - Current: Most decks are EN-only (conferences). DKT decks are RU-only.
   - **Answer:** No. Slidev SPA lives at `/slides/<slug>/`, language is baked into the deck content. If a deck needs both languages, author builds two separate decks (`<slug>-en` and `<slug>-ru`).

5. **Should CodeCopyEnhancer inject language badge or should it be a remark plugin?**
   - Remark plugin: Runs at build time, modifies AST, injects badge into HTML.
   - CodeCopyEnhancer: Runs at client-side or SSR, reads DOM, injects badge.
   - **Recommendation:** Remark plugin is cleaner (no runtime JS), but requires learning Astro's remark pipeline. If time-constrained, extend CodeCopyEnhancer (it's already SSR via `is:inline`). If Wave 2 is a dedicated phase, invest in remark plugin.

## Sources

- **Astro Shiki configuration** — Context7 `/websites/astro_build_en` (HIGH confidence)
  - https://docs.astro.build/en/reference/configuration-reference/#markdownshikiconfig
  - https://docs.astro.build/en/guides/syntax-highlighting/
- **Shiki transformers** — Context7 verified `@shikijs/transformers` package (HIGH confidence)
  - https://shiki.style/packages/transformers
  - `transformerMetaHighlight` for `// [!code highlight]` syntax
- **Astro MDX integration** — Project `package.json` + `astro.config.mjs` (HIGH confidence)
- **Slidev build command** — vedmichv/slidev repo inspection + Slidev docs (MEDIUM confidence, not Context7-verified)
  - `slidev build --base /path/` is documented Slidev CLI usage
- **Git submodule CI pattern** — Standard GitHub Actions pattern (HIGH confidence, widely used)
- **Excalidraw SVG export** — `@excalidraw/excalidraw` npm package docs (HIGH confidence)
- **SMIL vs CSS offset-path** — Phase 9 hotfix experience, documented in `PodLifecycleAnimation.astro` (HIGH confidence, empirical)
- **Astro build performance** — Empirical (current 31 pages in 800ms) + Astro architecture (HIGH confidence)
- **Content Collections** — `src/content.config.ts` inspection (HIGH confidence)

## Next Steps for Roadmapper

1. **Confirm Wave sequence** — validate dependency graph above matches milestone goals.
2. **Estimate per-phase effort:**
   - Wave 1 (primitives): 6-8h (4 components + refactor)
   - Wave 2 (Shiki): 4-6h (config + remark plugin/CodeCopyEnhancer extension + regression test)
   - Wave 3 (Excalidraw): 2-3h (script + 1-2 diagram placements)
   - Wave 4 (codegen): 10-15h (parsing + codegen logic + testing) — OPTIONAL
   - Slidev integration: 4-6h (submodule + CI + docs)
   - Polish (CTAs): 1-2h
   - Companion posts: 3-4h per post (using `vv-blog-from-vault` skill)
3. **Identify risky phases:**
   - Wave 2 (Shiki) — global config change, highest regression risk.
   - Slidev integration — CI change, but isolated risk.
4. **Plan validation gates:**
   - After Wave 1: Visual test PodLifecycleAnimation on live.
   - After Wave 2: Regression test all 4 existing posts.
   - After Slidev: Verify build time + test one deck route.
5. **Document "add a new deck" workflow** in Slidev integration phase plan.
