# Phase 1: Rich Media Primitives - Context

**Gathered:** 2026-05-02
**Status:** Ready for planning

<domain>
## Phase Boundary

Ship 4 Astro primitives — `VvStage`, `VvNode`, `VvWire`, `VvPacket` — at `src/components/visuals/` that enable inline animated SVG diagrams in MDX blog posts using Deep Signal tokens and SMIL animation. Primitives mirror the Slidev Vue components (`VvArchNode.vue`, `VvArchGrid.vue` in `slidev-theme-vv`) so slide content ports 1:1 with coordinate copy-paste. Validated by refactoring `src/components/PodLifecycleAnimation.astro` onto the primitives with Playwright pixel parity on `/blog/karpenter-right-sizing`.

**Not in this phase (explicit):**
- Static slide export pipeline (`slidev export → SVG`) → deferred to Phase 4
- Live-slide modal/lightbox (`<SlideModal slug=… slide=…>`) → deferred to Phase 5
- iframe embedding of Slidev SPA → rejected (breaks zero-JS + SEO budget)

</domain>

<decisions>
## Implementation Decisions

### Embedding Approach
- **D-01:** Inline primitives only in Phase 1 — NOT iframe, NOT modal. User confirmed hybrid B+C across milestone scope, but Phase 1 delivers the "B" half (primitives) and defers modal/export to their natural phases.
- **D-02:** Primitives target "animated slide content inline in prose" use case (~30% of Slidev slides). Static architectural diagrams and complex reference decks solved by Phases 4 and 5 respectively — NOT by these primitives.

### Coordinate System
- **D-03:** Single SVG user-space coordinate system at `viewBox="0 0 1800 820"` — identical to Slidev canvas size (`vv-demo` theme). Authors copy `x`/`y` numbers directly from Slidev slides with zero conversion.
- **D-04:** No percent units, no grid cells — one system for nodes, wires, AND packets. Eliminates the two-coordinate-space bug that required the Phase 9 (v0.4) hotfix (SMIL `<animateMotion>` inside SVG user space, not CSS `offset-path`).
- **D-05:** `viewBox` is the API contract. `VvStage` exposes default 1800×820 but accepts `viewBox` prop for future canvases.

### Reference Model (Wire↔Node, Packet↔Wire)
- **D-06:** **Refs by `id`**. `<VvNode id="api">`, `<VvWire from="kubectl" to="api">`, `<VvPacket wire="kubectl-api">`. `VvStage` collects child coordinates and resolves refs at render time. Reduces number of coordinates in MDX; refactors (moving a node) are local.
- **D-07:** Wire `id` convention: `"<from>-<to>"` (composite string). Packet `wire` prop references this id. Researcher/planner pick the exact resolution mechanism (Astro slots + AsyncIterable `Astro.slots.render()` or SSR-time registry). This is locked as user-facing API contract; implementation is researcher's call.

### VvNode API
- **D-08:** `label` as prop (string), icon as default slot, `tone` prop with 6 named values (below). Mirrors `slidev-theme-vv/components/VvArchNode.vue` so authors who know Slidev have zero learning curve.
- **D-09:** **Icon source = Iconify via `astro-icon`.** Install `astro-icon` (Astro-native, build-time, zero runtime JS) plus 8 Iconify collections matching `slidev-theme-vv/package.json`:
  - `@iconify-json/carbon` — generic tech icons (carbon-kubernetes, carbon-flow, etc.)
  - `@iconify-json/logos` — AWS / vendor logos (logos-aws-lambda, logos-etcd, logos-kubernetes, etc.)
  - `@iconify-json/lucide` — UI icons
  - `@iconify-json/ph` — Phosphor
  - `@iconify-json/simple-icons` — brand marks
  - `@iconify-json/solar` — filled/duotone decorative
  - `@iconify-json/streamline-flex` — illustrative
  - `@iconify-json/twemoji` — emoji
  Author writes `<Icon name="logos:aws-api-gateway" />` inside `<VvNode>` default slot — identical vocabulary to Slidev (Slidev uses `<logos-aws-api-gateway />` via `unplugin-icons`, vedmich.dev uses `<Icon name="logos:aws-api-gateway" />` via `astro-icon`; same underlying `@iconify-json/*` packages, same SVG output).
- **D-09b:** Tone vs icon color: **tone affects node border ONLY, icons keep native Iconify colors.** Multicolor `logos-aws-*` renders at native brand colors (orange Lambda, blue etcd). Monochrome `carbon-*`/`lucide-*` renders at default Iconify currentColor (Iconify fallback `#888`-ish). Mirrors `slidev-theme-vv/components/VvArchNode.vue` behavior (`border-left: 4px solid var(--tone)` + `:deep(svg)` untouched).
- **D-09c:** Author can still pass raw inline `<svg>` in the default slot instead of `<Icon>` for custom icons or copied-from-PodLifecycle icons. No registry enforcement — slot accepts any child content. Stays backward-compatible with current PodLifecycleAnimation icon extraction during refactor.
- **D-10:** Tones supported: **6 values** — `teal`, `amber`, `k8s`, `architecture`, `opinion`, `tutorial` — mapping to existing CSS variables in `src/styles/design-tokens.css`:
  - `teal` → `var(--brand-primary)` (#14B8A6)
  - `amber` → `var(--brand-accent)` (#F59E0B)
  - `k8s` → `var(--topic-k8s)` (#3B82F6)
  - `architecture` → `var(--topic-architecture)` (#818CF8)
  - `opinion` → `var(--topic-opinion)` (#F43F5E)
  - `tutorial` → `var(--topic-tutorial)` (#22C55E)
  - Default tone = `teal`.
  Status colors (`--success`/`--warning`/`--error`/`--info`) deliberately excluded — reserved for status UI per design-tokens.css §Status comment.
- **D-10b:** Adds `astro-icon` as a new dep + 8 `@iconify-json/*` dev deps (~30 MB in `node_modules`, dev-time only; build artifact inlines only icons referenced via `<Icon>` calls — tree-shaken). Build-time integration honors the zero-JS-runtime constraint. Verify with `npm run build` size check on first consumer post.

### VvWire API
- **D-11:** Support prescribed shapes: **straight**, **bezier-curve** (`curve={0.2}` for arc strength 0-1), **polyline with waypoints** (`via={[[400,200],[500,250]]}`), plus `dashed` flag. Full spectrum locked in — covers mesh/network slides from Slidev that need arcs, and complex multi-hop paths.
- **D-12:** When `from`/`to` refs resolve, Wire auto-computes edge points at node border (not center). Straight lines only in v1 for this; bezier/waypoints start/end at edge-points too. Planner picks geometry algorithm during research.

### VvPacket API
- **D-13:** Required props: `wire` (ref to wire id) OR `path` (raw SVG path string). `duration` and `delay` are required explicit props — NO auto-timing, NO auto-sequencing (D-17 below).
- **D-14:** Optional: `r` (radius, default 10), `glow` (boolean, default true, wraps in `<feGaussianBlur>` filter as in current PodLifecycle), `tone` (same 6 values as VvNode, default `teal`).
- **D-15:** Loop behavior: `loop` prop default `true`, `gap` prop default `"4s"` (time between end of one cycle and start of next). Implementation via SMIL `begin="initial_delay;pkt_id.end+gap"` — matches current `PodLifecycleAnimation` pattern exactly. `loop={false}` = one-shot animation.

### VvStage API
- **D-16:** Built-in chrome by default — emits `<figure>` with title (above), caption (below), stage border/background/radius, matching current `PodLifecycleAnimation.astro` wrapper. Props: `title` (string), `caption` (string). Keeps visual consistency across all primitives-based diagrams site-wide.
- **D-17:** No auto-timing/auto-sequencing. Every `VvNode`/`VvWire`/`VvPacket` author provides explicit `delay`/`duration` — preserves today's explicit choreography model. Trade-off accepted: more typing, but predictable output and direct port from PodLifecycle numbers. Author experience is "copy coordinates, copy delays" from source slide.

### Reduced Motion
- **D-18:** `prefers-reduced-motion: reduce` behavior matches current PodLifecycle exactly: nodes render at final state (opacity 1), wires render at final opacity (0.55), packets hidden (`.pla-pkts { display: none }` equivalent). Not configurable — WCAG-compliant single behavior.

### Validation Success Criteria
- **D-19:** **Pixel parity via Playwright** — screenshot `/blog/karpenter-right-sizing` before refactor, refactor PodLifecycle onto primitives, screenshot again, diff ≤ tiny threshold. Proves no visual regression.
- **D-20:** **LOC metric** — record LOC of `PodLifecycleAnimation.astro` before refactor (241 today) and after (target ≤ 100 MDX/Astro using primitives). Quantitative proxy for "easier porting."
- **D-21:** **Time-to-port metric** — port one additional slide from `slidev-theme-vv/presentations/vv-demo/pages/` onto primitives during phase. Record elapsed time. This is the **Phase 7 checkpoint trigger**: <10 min = Phase 7 skipped, 10-15 min = borderline (user decides), >15 min = Phase 7 (codegen) triggered.
- **D-22:** **Build passes + live** — `npm run build` stays green (31+ pages in <1s), `/blog/karpenter-right-sizing` renders identically on production after merge.

### Iconify Integration
- **D-26:** Slide porting workflow now has "1:1 icon copy" shortcut: `<logos-aws-lambda />` (Slidev) → `<Icon name="logos:aws-lambda" />` (vedmich.dev). Author runs find+replace on pasted slide HTML converting `<logos-X-Y>` → `<Icon name="logos:X-Y" />` (regex: `<(logos|carbon|lucide|ph|solar)-([a-z0-9-]+)\s*/>` → `<Icon name="$1:$2" />`). README.md documents this transform.
- **D-27:** `<Icon>` component from `astro-icon/components` is imported once in MDX frontmatter (or made globally available via `astro.config.mjs` integrations). Planner picks the ergonomics.

### Primitive File Locations
- **D-23:** New directory `src/components/visuals/` — contains `VvStage.astro`, `VvNode.astro`, `VvWire.astro`, `VvPacket.astro`, `README.md`.
- **D-24:** `PodLifecycleAnimation.astro` stays at `src/components/` after refactor (keeps existing import paths in MDX stable). Its internals rewritten to use `<VvStage>` + primitives from `visuals/`.
- **D-25:** `src/components/visuals/README.md` documents: primitive API (props, defaults), examples, SMIL-vs-CSS-offset-path gotcha (link to Phase 9 v0.4 hotfix rationale), reduced-motion rules, tone palette, **Iconify vocabulary + Slidev→vedmich.dev find+replace transform** (per D-26), how to port a Slidev slide step-by-step.

### Claude's Discretion
- Internal implementation mechanism for ref resolution (slots + context, SSR-time registry, or Astro 5 `Astro.slots.render()` passes) — researcher picks best pattern in Phase 1 research.
- Edge-point geometry for wires at node borders — planner researches cleanest math (rect-to-rect closest-edge, circle approximation, etc.) during planning.
- TypeScript prop types structure — planner decides how strict/lenient (required vs optional, union literal types for tones, etc.).
- Exact names of gap/glow/curve props are subject to minor rename during research if better names emerge; core semantics are locked.

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Phase scope & requirements
- `.planning/ROADMAP.md` §Phase 1 — 5 success criteria (user-composable primitives, PodLifecycle refactor, SMIL stable, reduced-motion, README)
- `.planning/REQUIREMENTS.md` §Rich-Media Primitives — PRIMS-01…PRIMS-06 (individual primitive specs)
- `.planning/notes/rich-media-integration.md` — scoping doc, lists 5 shapes of solution (A-E), current codebase state, pain points, Wave 1 scope confirming primitives approach

### Research artifacts (v1.0 kickoff, 2026-05-02)
- `.planning/research/SUMMARY.md` — v1.0 milestone synthesis
- `.planning/research/ARCHITECTURE.md` — integration patterns across the milestone
- `.planning/research/FEATURES.md` — feature landscape
- `.planning/research/PITFALLS.md` — domain pitfalls including Pitfall 1 (CSS offset-path coordinate-space bug) and Pitfall 4 (hardcoded coords)
- `.planning/research/STACK.md` — stack choices

### Code references (what to read / what to mirror)
- `src/components/PodLifecycleAnimation.astro` — the hand-ported baseline. Refactor target. Source of coordinates, delays, SMIL patterns. 241 LOC, 1800×820 viewBox already.
- `src/styles/design-tokens.css` — canonical token source. Tones map here (`--brand-*`, `--topic-*`).
- `/Users/viktor/Documents/GitHub/vedmichv/slidev-theme-vv/components/VvArchNode.vue` — Slidev Vue component to mirror for `VvNode` API shape (props, slots, tone-based border).
- `/Users/viktor/Documents/GitHub/vedmichv/slidev-theme-vv/components/VvArchGrid.vue` — Slidev grid parent, reference for `VvStage` chrome pattern.
- `/Users/viktor/Documents/GitHub/vedmichv/slidev-theme-vv/presentations/vv-demo/pages/10-complex-schemas.md` — slide 84 (S2 Pod lifecycle) is the reference source slide PodLifecycle was ported from. Time-to-port metric (D-21) uses another slide from this directory.
- `/Users/viktor/Documents/GitHub/vedmichv/slidev-theme-vv/package.json` — `dependencies` section names the 8 `@iconify-json/*` packages vedmich.dev must match (D-09). Iconify vocabulary (`<logos-aws-lambda />`) used by Slidev pages must transform 1:1 into `<Icon name="logos:aws-lambda" />` on vedmich.dev (D-26).

### Libraries
- `astro-icon` — https://www.astroicon.dev/ — Astro-native build-time Iconify wrapper. Alternative (`unplugin-icons`) is what Slidev uses but less idiomatic in Astro; researcher confirms `astro-icon` is the canonical Astro choice.

### Project constraints
- `CLAUDE.md` — Deep Signal constraints: no hex literals, no `#06B6D4`/`#22D3EE`, no `#7C3AED`/`#10B981` for DKT, no `#FF9900` for AWS, bilingual i18n parity, self-hosted fonts
- `.planning/PROJECT.md` — zero-JS budget, validated decisions, current state
- `.claude/skills/vv-blog-from-vault/references/visuals-routing.md` — current Priority 0/1 routing (PRIMS will add Priority 2 in Phase 6 via `references/primitives-usage.md`, per REQ CONTENT-05 — NOT in Phase 1 scope)

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- **`PodLifecycleAnimation.astro`** (241 LOC): Complete working implementation of all patterns primitives need — SMIL `<animateMotion>` with `begin="pkt_id.end+4s"` loop pattern, glow filter (`<feGaussianBlur>`), opacity keyTimes for fade-in/out, percent-positioned nodes overlaying SVG wires, reduced-motion media query. Every primitive can extract logic from here.
- **`src/styles/design-tokens.css`**: 6 tone-mapping CSS variables already exist (`--brand-primary`, `--brand-accent`, `--topic-k8s`, `--topic-architecture`, `--topic-opinion`, `--topic-tutorial`) — zero new tokens needed for D-10 palette.
- **`CodeCopyEnhancer.astro`**: Proven pattern for MDX-compatible Astro components with scoped style + `is:inline` — primitives follow same structure.

### Established Patterns
- **Astro 5.x + MDX 4.3.14**: MDX can `import Component from '...'` or auto-import via `astro.config.mjs` — researcher decides if auto-import is worth the complexity vs explicit imports in MDX frontmatter.
- **`interface Props` + destructured defaults** — all existing components use this shape (`Hero.astro`, `Podcasts.astro`). Primitives follow.
- **Scoped `<style>` block per component** — no global CSS leaks. Class names prefix (e.g., `pla-` for PodLifecycle) — primitives can use `vv-stage-`, `vv-node-`, etc. or unscoped within `:global()` for SVG children.
- **Zero runtime JS**: animation via SMIL + CSS keyframes, not JS. Continue this.

### Integration Points
- MDX posts import primitives and compose inline — e.g., `src/content/blog/{en,ru}/karpenter-right-sizing.mdx` → becomes consumer. Later, companion posts (Phase 6) consume.
- `PodLifecycleAnimation.astro` keeps public import path — internals rewrite only. No change to any `.mdx` file that currently imports it.
- `src/components/visuals/README.md` becomes the "primitive docs" single source — linked from vv-blog-from-vault skill's `visuals-routing.md` in Phase 6.

</code_context>

<specifics>
## Specific Ideas

- User explicitly referenced hybrid B+C approach (primitives + slide modal) across the whole milestone, with this phase delivering only the B half. Phases 4 and 5 must record the deferred halves (D-01, deferred section).
- User emphasized "палитра богаче" — explicitly rejected limited 2-tone palette, chose 6 tones mapping to both brand AND topic-accent CSS vars (D-10).
- User confirmed SVG user-space 1800×820 — copies the Slidev canvas size, which means slide content lifts with coordinate copy-paste.
- User locked full wire shape spectrum (straight + bezier + waypoints + dashed) in D-11 — accepts ~+2-3h research effort vs MVP "straight only".
- User kept explicit `delay`/`duration` per element (D-17) — no auto-sequencing magic. Matches current mental model of PodLifecycle.
- Reference Slidev theme source: `/Users/viktor/Documents/GitHub/vedmichv/slidev-theme-vv/` — authors of future slide ports will reference this directory directly.
- User explicitly asked (after initial API discussion) for the same Iconify library used in `slidev-theme-vv` — "Копируем иконки просто в наш сайт". Chose Iconify integration (D-09, D-09b, D-09c, D-10b, D-26, D-27) to enable literal icon-name copy from Slidev slides.

</specifics>

<deferred>
## Deferred Ideas

### To Phase 4 (Excalidraw Pipeline)
- **Static slide export** (`slidev-slide-to-svg.mjs` or similar): add a mini-script analogous to `excalidraw-to-svg.mjs` that exports a single Slidev slide to SVG/PNG for static (non-animated) use cases. Target ~50% of Slidev slides that don't need inline animation. Covers the "Type 2" case from discussion.
- **Action for Phase 4 discuss:** capture this as scope candidate — `scripts/slidev-slide-to-svg.mjs` + `public/blog-assets/<slug>/slides/*.svg` convention + usage example in MDX.

### To Phase 5 (Slidev Integration)
- **SlideModal component**: `<SlideModal slug="vv-demo" slide="84">` — lightbox that opens a live Slidev slide from `/slides/<slug>/` in a modal overlay over the post. Targets ~20% "reference/full-deck" use cases. Requires `/slides/<slug>/` routes from Phase 5 as prerequisite, therefore naturally belongs in or right after Phase 5.
- **Action for Phase 5 discuss:** capture `<SlideModal>` as additional deliverable (~50 LOC component + i18n labels + Esc-to-close interaction). Keep zero-JS budget in mind (modal adds ~30 LOC of lightweight JS).

### Not in v1.0
- Scroll-triggered animation playback (IntersectionObserver-driven packet start on viewport entry) — considered in D-15 alternatives, deferred. Today all animations start on page load.
- Interactive Excalidraw embedding — explicitly out of scope per REQUIREMENTS.md.
- Multi-scene/storyboard model (scene="1", scene="2" semantic grouping for timing) — considered in timing discussion, rejected in favor of explicit delays. Could be revisited if slide ports repeatedly duplicate delay math.
- Icon registry / named icon set — rejected in D-09 to keep primitives open. Revisit if post authors request a shared set.

</deferred>

---

*Phase: 1-rich-media-primitives*
*Context gathered: 2026-05-02*
</content>
</invoke>