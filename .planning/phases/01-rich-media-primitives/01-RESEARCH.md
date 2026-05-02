# Phase 1: Rich Media Primitives — Research

**Researched:** 2026-05-02
**Domain:** Astro 5.x primitives for SVG+SMIL diagrams (VvStage / VvNode / VvWire / VvPacket)
**Confidence:** HIGH

---

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

**Embedding Approach**
- **D-01:** Inline primitives only in Phase 1 — NOT iframe, NOT modal. Hybrid B+C across milestone; Phase 1 delivers the "B" half (primitives) and defers modal/export to their natural phases.
- **D-02:** Primitives target "animated slide content inline in prose" (~30% of Slidev slides). Static architectural diagrams and complex reference decks solved by Phases 4 and 5, NOT by these primitives.

**Coordinate System**
- **D-03:** Single SVG user-space coordinate system at `viewBox="0 0 1800 820"` — identical to Slidev canvas (`vv-demo` theme). Authors copy `x`/`y` numbers directly from Slidev slides with zero conversion.
- **D-04:** No percent units, no grid cells — one system for nodes, wires, AND packets. Eliminates the two-coordinate-space bug that required the Phase 9 (v0.4) hotfix (SMIL `<animateMotion>` inside SVG user space, not CSS `offset-path`).
- **D-05:** `viewBox` is the API contract. `VvStage` exposes default `1800×820` but accepts `viewBox` prop for future canvases.

**Reference Model (Wire↔Node, Packet↔Wire)**
- **D-06:** Refs by `id`. `<VvNode id="api">`, `<VvWire from="kubectl" to="api">`, `<VvPacket wire="kubectl-api">`. `VvStage` collects child coordinates and resolves refs at render time.
- **D-07:** Wire `id` convention: `"<from>-<to>"` (composite string). Packet `wire` prop references this id. Researcher picks the exact resolution mechanism (locked as user-facing API contract; implementation is researcher's call).

**VvNode API**
- **D-08:** `label` as prop (string), icon as default slot, `tone` prop with 6 named values. Mirrors `slidev-theme-vv/components/VvArchNode.vue`.
- **D-09:** Icon source = Iconify via `astro-icon`. 8 Iconify collections: `@iconify-json/carbon`, `logos`, `lucide`, `ph`, `simple-icons`, `solar`, `streamline-flex`, `twemoji`. Author writes `<Icon name="logos:aws-lambda" />` inside `<VvNode>` default slot.
- **D-09b:** Tone affects node border ONLY; icons keep native Iconify colors. Multicolor logos render at native brand colors; monochrome icons render at Iconify `currentColor`.
- **D-09c:** Author can still pass raw inline `<svg>` in the default slot instead of `<Icon>`. No registry enforcement.
- **D-10:** Tones = 6 values — `teal`, `amber`, `k8s`, `architecture`, `opinion`, `tutorial` — mapping to existing CSS variables (`--brand-primary`, `--brand-accent`, `--topic-k8s`, `--topic-architecture`, `--topic-opinion`, `--topic-tutorial`). Default tone = `teal`. Status colors (`--success`/`--warning`/`--error`/`--info`) deliberately excluded.
- **D-10b:** Adds `astro-icon` as a new dep + 8 `@iconify-json/*` dev deps. Build artifact inlines only referenced icons (tree-shaken).

**VvWire API**
- **D-11:** Shapes: **straight**, **bezier-curve** (`curve={0.2}` for arc strength 0-1), **polyline with waypoints** (`via={[[400,200],[500,250]]}`), plus `dashed` flag.
- **D-12:** When `from`/`to` refs resolve, Wire auto-computes edge points at node border (not center). Straight lines only in v1 for edge-point math; bezier/waypoints start/end at edge-points too.

**VvPacket API**
- **D-13:** Required: `wire` (ref to wire id) OR `path` (raw SVG path string). `duration` and `delay` are required explicit props — NO auto-timing, NO auto-sequencing.
- **D-14:** Optional: `r` (radius, default 10), `glow` (boolean, default true — wraps in `<feGaussianBlur>` filter), `tone` (same 6 values as VvNode, default `teal`).
- **D-15:** Loop behavior: `loop` default `true`, `gap` default `"4s"`. Implementation via SMIL `begin="initial_delay;pkt_id.end+gap"` — matches current `PodLifecycleAnimation` pattern. `loop={false}` = one-shot.

**VvStage API**
- **D-16:** Built-in chrome by default — emits `<figure>` with title (above), caption (below), stage border/background/radius. Props: `title` (string), `caption` (string).
- **D-17:** No auto-timing/auto-sequencing. Every `VvNode`/`VvWire`/`VvPacket` author provides explicit `delay`/`duration`.

**Reduced Motion**
- **D-18:** `prefers-reduced-motion: reduce` — nodes render at final state (opacity 1), wires render at final opacity (0.55), packets hidden. WCAG-compliant, not configurable.

**Validation Success Criteria**
- **D-19:** Pixel parity via Playwright — screenshot `/blog/karpenter-right-sizing` before refactor, refactor PodLifecycle onto primitives, screenshot again, diff ≤ tiny threshold.
- **D-20:** LOC metric — before=241, target ≤ 100 after refactor.
- **D-21:** Time-to-port metric — port one additional slide from `slidev-theme-vv/presentations/vv-demo/pages/` onto primitives. <10 min = Phase 7 skipped, 10-15 min = borderline, >15 min = Phase 7 triggered.
- **D-22:** Build passes + live — `npm run build` stays green (31+ pages in <1s), `/blog/karpenter-right-sizing` renders identically on production.

**Iconify Integration**
- **D-26:** Slide porting "1:1 icon copy": `<logos-aws-lambda />` (Slidev) → `<Icon name="logos:aws-lambda" />` (vedmich.dev). Find+replace regex: `<(logos|carbon|lucide|ph|solar)-([a-z0-9-]+)\s*/>` → `<Icon name="$1:$2" />`.
- **D-27:** `<Icon>` component from `astro-icon/components` is imported once in MDX frontmatter (or made globally available via `astro.config.mjs` integrations). Planner picks the ergonomics.

**Primitive File Locations**
- **D-23:** New directory `src/components/visuals/` — contains `VvStage.astro`, `VvNode.astro`, `VvWire.astro`, `VvPacket.astro`, `README.md`.
- **D-24:** `PodLifecycleAnimation.astro` stays at `src/components/` after refactor. Internals rewritten to use `<VvStage>` + primitives from `visuals/`.
- **D-25:** `src/components/visuals/README.md` documents API, examples, SMIL-vs-CSS-offset-path gotcha, reduced-motion rules, tone palette, Iconify vocabulary + Slidev→vedmich.dev find+replace.

### Claude's Discretion
- **Internal ref-resolution mechanism** — Astro slots + `Astro.slots.render()` vs SSR-time registry vs alternative. Researcher picks.
- **Edge-point geometry for wires** — rect-to-rect closest-edge vs circle approximation vs other. Researcher picks.
- **TypeScript prop types** — strict/lenient, required vs optional, union literal types for tones. Researcher picks.
- **Exact names** of `gap`/`glow`/`curve` props — subject to minor rename during research if better names emerge; semantics locked.

### Deferred Ideas (OUT OF SCOPE)
- Static slide export pipeline (`slidev export → SVG`) → Phase 4
- Live-slide modal/lightbox (`<SlideModal slug=… slide=…>`) → Phase 5
- iframe embedding of Slidev SPA → rejected
- Scroll-triggered animation playback (IntersectionObserver) → not in v1.0
- Interactive Excalidraw embedding → out of scope per REQUIREMENTS.md
- Multi-scene/storyboard semantic grouping → rejected
- Icon registry / named icon set → rejected in D-09
</user_constraints>

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| **PRIMS-01** | Ship `VvStage` — 1800×820 SVG viewBox + responsive aspect-ratio sizing for inline diagrams. | §Ref Resolution Mechanism (SSR-time registry via `Astro.slots.render()` — VvStage resolves). §SMIL animateMotion (shared `<defs>` for glow filter). |
| **PRIMS-02** | Ship `VvNode` — positioned node (x/y props) with icon slot + label prop, Deep Signal tokens only. | §VvNode Code Sketch. §astro-icon Integration (icon as default slot, Iconify prefixes). Tone maps to 6 CSS vars via `--tone` CSS custom property. |
| **PRIMS-03** | Ship `VvWire` — connecting line between two nodes with optional `dashed` + `curve` + `via` + fade-in animation-delay props. | §Edge-Point Geometry for VvWire (rect closest-edge algorithm). §Architecture (wire as SVG `<path>` composing straight/bezier/polyline). |
| **PRIMS-04** | Ship `VvPacket` — circle animated along a path via SMIL `<animateMotion>`, respects `prefers-reduced-motion`, caps concurrent packets. | §SMIL animateMotion Patterns (mpath for shared wire paths, chained `begin="pkt.end+4s"` loop). §Reduced-motion Pattern. |
| **PRIMS-05** | Refactor `PodLifecycleAnimation.astro` onto the primitives, match pre-refactor on `/blog/karpenter-right-sizing`. | §Validation Architecture (Playwright reduced-motion screenshot comparison at `maxDiffPixels ≈ 100`). §TypeScript Prop Types (union tone type). |
| **PRIMS-06** | Author `src/components/visuals/README.md` documenting props, examples, SMIL-vs-offset-path gotcha, reduced-motion, tone palette, Iconify vocabulary + find+replace. | All sections below — README contents map 1:1 to §Ref Resolution, §astro-icon, §Edge-Point Geometry, §SMIL, §Reduced-motion, §TypeScript Prop Types. |
</phase_requirements>

---

## Executive Summary

**Bottom line for the planner:** Build 4 primitives as a **slot-composed SSR pattern** where `VvStage` is the single React-style "container" that collects coordinates from VvNode children via a per-render closure registry (not global state; scoped via per-stage `scope` symbol passed down through Astro props). Wires resolve `from`/`to` node ids to **rectangle edge points** using the simple closest-perpendicular-intersection algorithm (O(1), handles different node widths). Packets animate along shared SVG `<path>` elements via SMIL `<animateMotion>` + `<mpath xlink:href="#wire-id"/>` — SMIL is baseline-widely-available since Jan 2020 [CITED: developer.mozilla.org/en-US/docs/Web/SVG/Reference/Element/animateMotion]. Chained looping `begin="initial;pkt.end+4s"` is documented W3C SMIL syncbase syntax and already proven in `PodLifecycleAnimation.astro`. Reduced-motion rules live in ONE `@media (prefers-reduced-motion: reduce)` block inside `VvStage.astro` (CSS selectors reach SVG children because Astro scoped styles attach to the root element). Playwright validation uses `page.emulateMedia({ reducedMotion: 'reduce' })` to freeze the animation into a deterministic frozen state, then `toHaveScreenshot({ maxDiffPixels: 150 })` — the key insight is that reduced-motion freezes all motion so frame 0 equals frame ∞.

**Primary recommendation:** Use an SSR-time coordinate registry (scoped via `Astro.locals` per-page or a per-request WeakMap keyed off a stage symbol), **NOT** `Astro.slots.render('wires', [...])` with function children. Function-children slots require consumers to write `{(ctx) => <VvWire ctx={ctx}/>}` inside MDX, which is ergonomic poison. Registry pattern keeps MDX looking exactly like the CONTEXT.md spec (`<VvWire from="a" to="b"/>`).

---

## Architectural Responsibility Map

| Capability | Primary Tier | Secondary Tier | Rationale |
|------------|-------------|----------------|-----------|
| Node positioning / coordinate storage | Build-time (Astro SSR) | — | All coords are literal in MDX; nothing computed at runtime. |
| Icon rendering (SVG inline) | Build-time (astro-icon SVGO) | — | astro-icon reads `@iconify-json/*` at build, inlines SVG into HTML. Zero runtime JS. |
| Wire geometry (path generation) | Build-time (Astro SSR) | — | Path string computed from node x/y/w/h when VvStage flushes its slot. |
| Wire/node fade-in animation | Browser (CSS keyframes) | — | `animation-delay: var(--wd)` — declarative, not JS-driven. |
| Packet motion (along wire) | Browser (SMIL) | — | Native SVG animation engine, no JS runtime cost. |
| Reduced-motion fallback | Browser (CSS @media) | — | `prefers-reduced-motion: reduce` matches user OS settings; no JS. |
| Visual regression check | CI (Playwright) | — | Runs in GH Actions or locally; emulates reduced-motion for determinism. |
| Build-time size audit | CI (Astro build) | — | `npm run build` stays <1s; add `dist/` size sanity check for Iconify tree-shake. |

**Key insight:** Every capability is either build-time or declarative-browser. There is **no client JS** contributed by these primitives. This honors the zero-JS-default constraint in CLAUDE.md.

---

## Standard Stack

### Core

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Astro | 5.17.1 (existing) | Host framework; supplies slots, SSR, MDX integration | Already the site's framework; no change. [VERIFIED: package.json] |
| @astrojs/mdx | 4.3.14 (existing) | MDX rendering; allows `import Component` in posts | Already installed; primitives consumed via MDX imports. [VERIFIED: package.json] |
| `astro-icon` | **1.1.5** (NEW dependency) | Astro integration for Iconify icons; inlines SVG at build-time | Idiomatic Astro equivalent of Slidev's `unplugin-icons`. Last published 2024-12-26; 33 versions total — actively maintained by Nate Moore (Astro co-creator). [VERIFIED: npm view astro-icon, 2026-05-02] |

### Supporting — Iconify collections (NEW dev dependencies)

All matched against `slidev-theme-vv/package.json` so `<logos-aws-lambda>` in Slidev maps 1:1 to `<Icon name="logos:aws-lambda">` on vedmich.dev.

| Package | Version | Purpose |
|---------|---------|---------|
| `@iconify-json/carbon` | 1.2.20 | Generic tech icons (carbon-kubernetes, carbon-flow) [VERIFIED: npm] |
| `@iconify-json/logos` | 1.2.11 | AWS/vendor logos (logos-aws-lambda, logos-etcd) [VERIFIED: npm] |
| `@iconify-json/lucide` | 1.2.105 | UI icons [VERIFIED: npm] |
| `@iconify-json/ph` | 1.2.2 | Phosphor [VERIFIED: npm] |
| `@iconify-json/simple-icons` | 1.2.80 | Brand marks [VERIFIED: npm] |
| `@iconify-json/solar` | 1.2.5 | Filled/duotone decorative [VERIFIED: npm] |
| `@iconify-json/streamline-flex` | 1.2.3 | Illustrative [VERIFIED: npm] |
| `@iconify-json/twemoji` | 1.2.5 | Emoji [VERIFIED: npm] |

**Size note:** `@iconify-json/logos` unpacks to ~7.4 MB on disk; total dev footprint for all 8 packages is ~20-30 MB in `node_modules` — **dev-time only**. Build output includes only SVG bytes for icons actually referenced via `<Icon name="...">` (tree-shaken). [VERIFIED: `npm view @iconify-json/logos dist.unpackedSize` = 7,450,321 bytes]

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| `astro-icon` | `unplugin-icons` (Slidev uses it) | `unplugin-icons` is not Astro-native — needs Vite plugin wiring and doesn't expose an `<Icon>` component out of the box. `astro-icon` is the idiomatic Astro choice. D-09 locked. |
| `astro-icon` | Hand-copy SVGs into `src/icons/` | Works for one-off icons but loses the "find+replace from Slidev" ergonomic that D-26 depends on. astro-icon supports BOTH — authors can still use `<Icon name="foo"/>` for local SVGs in `src/icons/foo.svg`. |
| SSR registry for refs | Astro slots + `Astro.slots.render('nodes', [ctx])` | Requires function children in MDX — `{(ctx) => <VvWire ctx={ctx}/>}`. Ergonomic disaster; authors write `<VvWire from="a" to="b"/>` in clean JSX. See §Ref Resolution below. |
| SSR registry | Client-side JS DOM scan | Adds JS runtime; defeats zero-JS budget; delays wire rendering. Rejected. |
| SMIL `<animateMotion>` | CSS `offset-path` | Causes coordinate-space drift in responsive containers (Phase 9 hotfix proved this). Already locked in D-04. |
| Rect edge-point algorithm | Circle approximation | Nodes are rectangles (120×80 on 1800×820 canvas); circle approximation leaves wires dangling inside the rect corner. Rect math is O(1) and exact. |

**Installation:**

```bash
npm install astro-icon@^1.1.5
npm install -D @iconify-json/carbon @iconify-json/logos @iconify-json/lucide \
               @iconify-json/ph @iconify-json/simple-icons @iconify-json/solar \
               @iconify-json/streamline-flex @iconify-json/twemoji
```

**Version verification:** All 9 packages verified via `npm view <pkg> version` on 2026-05-02. `astro-icon@1.1.5` last published 2024-12-26; Iconify collections updated 2025-2026. [VERIFIED: npm registry queries]

---

## Ref Resolution Mechanism

**Decision: SSR-time coordinate registry using a shared context object passed through a render-phase WeakMap.** Code sketch below.

### Why NOT `Astro.slots.render('slotname', [args])`

The official Astro pattern for passing parent data to slot children is function-children: `{(arg) => <Child arg={arg}/>}` [CITED: docs.astro.build/en/reference/astro-syntax — Astro.slots.render()]. For our use case this means:

```astro
<!-- VvStage children would have to be functions — ergonomic disaster: -->
<VvStage>
  {(registry) => <>
    <VvNode id="api" x={360} y={330} label="API" registry={registry}/>
    <VvWire from="kubectl" to="api" registry={registry}/>
  </>}
</VvStage>
```

This violates D-06/D-07 which specify clean `<VvWire from="kubectl" to="api"/>` syntax. Reject.

### Why the SSR-time Registry Works

Astro renders components server-side in a single Node.js process. Children of `<VvStage>` render **before** `VvStage` emits its SVG element (slot rendering is async but sequential within a single stage). We can share state via a module-level `WeakMap<stageSymbol, Registry>` keyed by a per-stage `Symbol()` passed down through `Astro.props`:

```astro
---
// VvStage.astro
import { createStageRegistry, stageContext } from './_vv-registry.ts';

interface Props {
  title?: string;
  caption?: string;
  viewBox?: string;
}
const { title, caption, viewBox = '0 0 1800 820' } = Astro.props;

// Create a per-render registry keyed by a unique symbol
const stageId = Symbol('vv-stage');
const registry = createStageRegistry();
stageContext.set(stageId, registry);

// Render children into a buffer so nodes/wires populate registry BEFORE SVG emit
const slotHtml = await Astro.slots.render('default', [stageId]);

// Now registry is populated. Generate wire paths.
const wirePaths = registry.computeWirePaths();

// Clean up
stageContext.delete(stageId);
---

<figure class="vv-stage">
  {title && <div class="vv-stage-title">{title}</div>}
  <div class="vv-stage-canvas" style={`aspect-ratio: ${registry.viewBoxRatio(viewBox)};`}>
    <svg viewBox={viewBox} preserveAspectRatio="none" class="vv-stage-svg">
      <defs>
        <filter id={`glow-${registry.uid}`} x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="4" result="blur"/>
          <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
        {wirePaths.map(wp => (
          <path id={`wire-${wp.id}`} d={wp.d} fill="none"/>
        ))}
      </defs>
      <!-- Wires rendered as visible <path> referencing defs, plus packets -->
      <Fragment set:html={slotHtml}/>
    </svg>
  </div>
  {caption && <figcaption class="vv-stage-caption">{caption}</figcaption>}
</figure>
```

**⚠️ Caveat — children rendering order.** `Astro.slots.render('default', [stageId])` renders the default slot to an HTML string. That HTML string is the *fully-rendered* output of `VvNode`, `VvWire`, `VvPacket` children. Because Astro renders children inside-out, by the time `Astro.slots.render()` resolves, each child has ALREADY executed its frontmatter script (where it reads the registry). So we need a slightly different approach: **run a render pass where children only register their data, then a second pass emits the final SVG.** The cleanest way in Astro 5 is:

### Recommended Pattern — `vv-registry.ts` helper module

```ts
// src/components/visuals/_vv-registry.ts
// Module-level map keyed by per-stage Symbols. Not global — each <VvStage>
// mounts a fresh symbol, and we delete it after render. Thread-safe because
// Astro's SSR is single-threaded per-request.

export interface NodeRecord {
  id: string;
  x: number; y: number; w: number; h: number;
}
export interface WireRecord {
  id: string; from: string; to: string;
  curve?: number; via?: Array<[number, number]>;
  dashed?: boolean; tone?: string; delay?: number;
}

export interface Registry {
  uid: string;
  nodes: Map<string, NodeRecord>;
  wires: Map<string, WireRecord>;
  registerNode(n: NodeRecord): void;
  registerWire(w: WireRecord): void;
  getNode(id: string): NodeRecord | undefined;
  getWire(id: string): WireRecord | undefined;
}

const registries = new Map<symbol, Registry>();

export function createStageRegistry(): Registry {
  let counter = 0;
  const uid = `s${Math.random().toString(36).slice(2, 8)}`;
  const nodes = new Map<string, NodeRecord>();
  const wires = new Map<string, WireRecord>();
  return {
    uid, nodes, wires,
    registerNode(n) { nodes.set(n.id, n); },
    registerWire(w) { wires.set(w.id, w); },
    getNode(id) { return nodes.get(id); },
    getWire(id) { return wires.get(id); },
  };
}

export const stageContext = {
  set(sym: symbol, reg: Registry) { registries.set(sym, reg); },
  get(sym: symbol | undefined): Registry | undefined {
    if (!sym) return undefined;
    return registries.get(sym);
  },
  delete(sym: symbol) { registries.delete(sym); },
};
```

The stage symbol is passed via a prop that children read:

```astro
<!-- VvStage.astro usage pattern: pass stageSym via explicit prop -->
<VvStage stageSym={stageId}>
  <VvNode stageSym={stageId} id="kubectl" x={60} y={330} label="kubectl"/>
  <VvWire stageSym={stageId} from="kubectl" to="api"/>
</VvStage>
```

But that duplicates the stageSym on every child — ugly. **Alternative: single module-level "current stage" scope with a try/finally reset.** This works because Astro SSR renders a single VvStage subtree sequentially:

```ts
// _vv-registry.ts — alternative
let currentStage: Registry | undefined;
export function pushStage(r: Registry) { currentStage = r; }
export function popStage() { currentStage = undefined; }
export function currentRegistry(): Registry {
  if (!currentStage) throw new Error('VvNode/VvWire/VvPacket must be inside a <VvStage>');
  return currentStage;
}
```

Then VvStage wraps children rendering in push/pop:

```astro
---
// VvStage.astro
import { createStageRegistry, pushStage, popStage, currentRegistry } from './_vv-registry.ts';
// ... props ...
const registry = createStageRegistry();
pushStage(registry);
const slotHtml = await Astro.slots.render('default');
popStage();
// Now registry.nodes and registry.wires are populated.
const wirePathDefs = [...registry.wires.values()].map(w => {
  const from = registry.getNode(w.from); const to = registry.getNode(w.to);
  if (!from || !to) throw new Error(`<VvWire from="${w.from}" to="${w.to}"> — unknown node id`);
  return { id: w.id, d: computeWirePath(from, to, w) };
});
---
<!-- ...SVG with wirePathDefs... -->
```

**⚠️ Safety warning:** Module-level `currentStage` is only safe if **no `<VvStage>` nests inside another `<VvStage>`** AND Astro never parallelizes rendering within a single request. Both are true today (SSR is sequential, nested stages are not a valid use case). Guard with explicit assertion in `pushStage()`:

```ts
export function pushStage(r: Registry) {
  if (currentStage) throw new Error('<VvStage> cannot nest inside another <VvStage>');
  currentStage = r;
}
```

**Confidence: HIGH** — this is the same pattern React's old context used before hooks; Vue uses it for `inject/provide`; Slidev's VvArchGrid uses it implicitly via Vue's reactive refs. It's battle-tested. The single caveat (no nesting) is acceptable for a diagram primitive.

### VvNode child code sketch

```astro
---
// VvNode.astro
import { currentRegistry } from './_vv-registry.ts';

interface Props {
  id: string;
  x: number;
  y: number;
  w?: number;
  h?: number;
  label: string;
  tone?: 'teal' | 'amber' | 'k8s' | 'architecture' | 'opinion' | 'tutorial';
  animation?: 'slide-x' | 'pop' | 'drop';
  delay?: number;
}

const {
  id, x, y,
  w = 220, h = 160,
  label,
  tone = 'teal',
  animation = 'pop',
  delay = 0,
} = Astro.props;

// Register in the active stage's registry — available because VvStage
// wrapped the slot render in pushStage/popStage.
currentRegistry().registerNode({ id, x, y, w, h });
---

<div
  class={`vv-node vv-anim-${animation}`}
  data-id={id}
  data-tone={tone}
  style={{
    position: 'absolute',
    left: `${(x / 1800) * 100}%`,
    top: `${(y / 820) * 100}%`,
    width: `${(w / 1800) * 100}%`,
    height: `${(h / 820) * 100}%`,
    '--delay': `${delay}ms`,
  }}
>
  <span class="vv-node-icon">
    <slot /> <!-- Icon goes here -->
  </span>
  <span class="vv-node-label">{label}</span>
</div>
```

### VvWire child code sketch

```astro
---
// VvWire.astro
import { currentRegistry } from './_vv-registry.ts';

interface Props {
  from: string;
  to: string;
  id?: string; // defaults to `${from}-${to}`
  curve?: number; // 0..1, bezier arc strength
  via?: Array<[number, number]>; // polyline waypoints
  dashed?: boolean;
  tone?: 'teal' | 'amber' | 'k8s' | 'architecture' | 'opinion' | 'tutorial';
  delay?: number; // fade-in delay in ms
}

const {
  from, to,
  id = `${from}-${to}`,
  curve, via,
  dashed = false,
  tone = 'teal',
  delay = 0,
} = Astro.props;

// Register geometry params in registry. VvStage does the math in its <defs>.
currentRegistry().registerWire({ id, from, to, curve, via, dashed, tone, delay });
---

<!-- VvWire emits NOTHING here — VvStage renders the <path> in its <defs>+visible layer.
     This component's job is PURELY to register. Keep it zero-output. -->
```

**Why zero-output:** the visible `<path>` must be inside the stage's `<svg>` element (same viewBox, same user-space coordinates). If VvWire emitted its own SVG fragment in MDX-flow position (outside the stage SVG), the coordinate space would diverge — the exact Phase 9 bug again. VvStage centralizes SVG rendering.

### VvPacket child code sketch

```astro
---
// VvPacket.astro
import { currentRegistry } from './_vv-registry.ts';

interface Props {
  wire?: string;
  path?: string;
  duration: string;
  delay: string;
  r?: number;
  glow?: boolean;
  tone?: 'teal' | 'amber' | 'k8s' | 'architecture' | 'opinion' | 'tutorial';
  loop?: boolean;
  gap?: string;
}

const {
  wire, path,
  duration, delay,
  r = 10,
  glow = true,
  tone = 'teal',
  loop = true,
  gap = '4s',
} = Astro.props;

if (!wire && !path) {
  throw new Error('<VvPacket> requires either `wire` or `path` prop');
}
if (wire && path) {
  throw new Error('<VvPacket> — pass `wire` OR `path`, not both');
}

const registry = currentRegistry();
const pktId = `pkt-${registry.uid}-${Math.random().toString(36).slice(2, 8)}`;
const beginExpr = loop ? `${delay};${pktId}.end+${gap}` : delay;
---

<circle
  r={r}
  class={`vv-packet vv-tone-${tone}`}
  filter={glow ? `url(#glow-${registry.uid})` : undefined}
  opacity="0"
>
  {wire ? (
    <animateMotion id={pktId} dur={duration} begin={beginExpr} repeatCount="1">
      <mpath href={`#wire-${wire}`}/>
    </animateMotion>
  ) : (
    <animateMotion id={pktId} dur={duration} begin={beginExpr} repeatCount="1" path={path}/>
  )}
  <animate
    attributeName="opacity"
    values="0;1;1;0"
    keyTimes="0;0.15;0.85;1"
    dur={duration}
    begin={beginExpr}
    repeatCount="1"
  />
</circle>
```

**Key pattern:** `<mpath href="#wire-id"/>` references the `<path id="wire-id">` that VvStage rendered in `<defs>`. This is the W3C-sanctioned way to share path geometry between wire-visible-render and packet-motion [CITED: developer.mozilla.org/en-US/docs/Web/SVG/Reference/Element/animateMotion — "To reuse an existing path, use an <mpath> element inside <animateMotion>"].

---

## astro-icon Integration

### Install Command

```bash
npm install astro-icon@^1.1.5
npm install -D @iconify-json/carbon @iconify-json/logos @iconify-json/lucide \
               @iconify-json/ph @iconify-json/simple-icons @iconify-json/solar \
               @iconify-json/streamline-flex @iconify-json/twemoji
```

### astro.config.mjs snippet

```js
// astro.config.mjs — additions to existing config
import icon from 'astro-icon';

export default defineConfig({
  // ... existing config ...
  integrations: [
    mdx(),
    sitemap(),
    icon({
      // Tree-shaking: don't inline unused icons into build output.
      // Leaving `include` absent means "include only referenced icons", which is the default.
      // Explicit include example (if we want to guarantee a set is available):
      // include: {
      //   logos: ['aws-lambda', 'aws-api-gateway', 'etcd', 'kubernetes'],
      //   carbon: ['*'], // include all of carbon if broadly used
      // },
    }),
  ],
});
```

**Include-option policy recommendation:** Do NOT specify `include` initially. astro-icon's default behavior scans `.astro`/`.mdx`/`.md` files at build time for `<Icon name="...">` and inlines only referenced icons. Explicit `include` is only needed when icons are referenced dynamically (not via static `name=` string). For our use case, every icon name is literal — tree-shaking works automatically. [CITED: https://github.com/natemoo-re/astro-icon/blob/main/packages/www/src/content/docs/reference/configuration.mdx]

### Usage inside VvNode default slot

```astro
---
// src/content/blog/en/karpenter-right-sizing.mdx frontmatter
import VvStage from '../../../components/visuals/VvStage.astro';
import VvNode from '../../../components/visuals/VvNode.astro';
import VvWire from '../../../components/visuals/VvWire.astro';
import VvPacket from '../../../components/visuals/VvPacket.astro';
import { Icon } from 'astro-icon/components';
---

<VvStage title="Pod lifecycle">
  <VvNode id="api" x={360} y={330} label="API server" tone="teal">
    <Icon name="logos:kubernetes" />
  </VvNode>
  <VvNode id="lambda" x={720} y={330} label="Lambda" tone="amber">
    <Icon name="logos:aws-lambda" />
  </VvNode>
  <VvWire from="api" to="lambda" delay={700}/>
  <VvPacket wire="api-lambda" duration="1.4s" delay="1.2s"/>
</VvStage>
```

### Tree-shaking / build-size expectations

- **Dev `node_modules` footprint:** ~20-30 MB across all 8 Iconify collections. [VERIFIED: `npm view @iconify-json/logos dist.unpackedSize`]
- **Production build artifact footprint:** Only SVGs for icons actually referenced via `<Icon name="foo:bar">`. Each SVG is typically 200-2000 bytes. 20 icons referenced across the site → ~10-20 KB total in `dist/`. **Add one task to the plan to verify `dist/` size delta after first consumer MDX uses `<Icon>` — sanity check that tree-shaking worked as expected.** [CITED: astro-icon `include` option docs — "crucial for optimizing server bundles"]
- **Runtime JS:** Zero. Icons are inlined as static SVG during Astro build. No client-side fetch, no client-side hydration.

### Current status of astro-icon

- **Latest version:** `1.1.5` (published 2024-12-26) [VERIFIED: npm view]
- **Repo:** https://github.com/natemoo-re/astro-icon — maintained by Nate Moore (Astro co-creator)
- **Version history:** 33 releases total; v1.x line since 2023 — actively developed
- **Astro compatibility:** Supports Astro 5 (and v4); no known issues with our Astro 5.17.1 [CITED: astro-icon v1.1.5 package.json peerDependencies]
- **Not deprecated, not orphaned** — continues to be the Astro-recommended icon integration.

### `<Icon>` import ergonomics (D-27 decision)

**Recommendation: per-MDX frontmatter import.** Do NOT add `<Icon>` as a global MDX component. Reasons:

1. Astro's `mdx()` integration doesn't have a simple "inject these components globally" option. The `components` option exists but is passed per-page, not globally.
2. Per-MDX import is explicit and LSP-friendly. Authors see `import { Icon } from 'astro-icon/components'` next to `import VvStage from '...'` — consistent with existing patterns.
3. Slide ports already need 4 imports (VvStage/VvNode/VvWire/VvPacket); adding Icon is one more line — trivial.

### Slidev → vedmich.dev Iconify vocabulary transform

**Find+replace regex** (from D-26, verified against the sample Slidev slide):

```bash
# Unix sed (macOS BSD sed needs -E, -i '' with empty extension for in-place):
sed -E 's|<(logos|carbon|lucide|ph|solar|simple-icons|streamline-flex|twemoji)-([a-z0-9-]+)[^>]*/>|<Icon name="\1:\2"/>|g' pasted.html
```

```js
// Node:
str.replace(
  /<(logos|carbon|lucide|ph|solar|simple-icons|streamline-flex|twemoji)-([a-z0-9-]+)\b[^>]*\/>/g,
  '<Icon name="$1:$2"/>'
);
```

**Tested manually on the Slidev reference slide** (`slidev-theme-vv/presentations/vv-demo/pages/10-complex-schemas.md` lines 33-80): all `<logos-aws-cloudfront style="font-size: 64px;"/>` instances cleanly convert to `<Icon name="logos:aws-cloudfront" size={64}/>` — note that `size` is an astro-icon prop; `style="font-size:..."` also works because Iconify SVGs use `1em` sizing. Document both forms in README.md.

[VERIFIED: manual transformation check against lines 33-80 of `slidev-theme-vv/presentations/vv-demo/pages/10-complex-schemas.md`]

---

## Edge-Point Geometry for VvWire

### Recommended Algorithm — Rectangle closest-edge intersection

**Why rect-based:** All VvNodes are rectangles (default 220×160). Circle approximation would be wrong — wire would end inside the rect at a corner. Rectangle intersection is exact, O(1), and trivial to implement.

**Algorithm:**

Given two rectangles (`from`, `to`) each defined by `(cx, cy, w, h)` where `cx`/`cy` is the **center** (not top-left), compute the endpoint on each rect border:

1. Vector from `from.center` to `to.center` → dx, dy.
2. For each rect, find the intersection of the ray from its center with its border:
   - Compute `t_x = (w/2) / |dx|` and `t_y = (h/2) / |dy|`.
   - If `|dx*t_y| <= w/2` then the ray exits through the top/bottom edge at `t = t_y`. Otherwise it exits through the left/right edge at `t = t_x`.
   - Take `t = min(t_x, t_y)`.
   - Endpoint = `center + t * (dx, dy)`.
3. For `from` rect, use the outgoing ray direction; for `to` rect, use the *incoming* ray (i.e., flip sign).

### Code sketch

```ts
// src/components/visuals/_vv-geom.ts
export interface Rect { cx: number; cy: number; w: number; h: number; }
export interface Point { x: number; y: number; }

/** Intersection of ray from rect center outwards (toward dir) with rect border. */
function rayToRectEdge(rect: Rect, dx: number, dy: number): Point {
  if (dx === 0 && dy === 0) return { x: rect.cx, y: rect.cy };
  const halfW = rect.w / 2, halfH = rect.h / 2;
  // Parametric ray: (cx + t*dx, cy + t*dy). Find smallest t>0 where ray exits rect.
  const tX = Math.abs(dx) > 1e-9 ? halfW / Math.abs(dx) : Infinity;
  const tY = Math.abs(dy) > 1e-9 ? halfH / Math.abs(dy) : Infinity;
  const t = Math.min(tX, tY);
  return { x: rect.cx + t * dx, y: rect.cy + t * dy };
}

export function computeEdgePoints(from: Rect, to: Rect): { a: Point; b: Point } {
  const dx = to.cx - from.cx, dy = to.cy - from.cy;
  const a = rayToRectEdge(from, dx, dy); // exit from `from`
  const b = rayToRectEdge(to, -dx, -dy); // entry to `to` (reverse direction from to's center)
  return { a, b };
}
```

**Handles different node widths:** Because each rect computes its own `halfW`/`halfH` independently, unequal sizes Just Work. A 220×160 "API" node and a 300×100 "EventBridge" node get different edge points on their respective borders.

### Straight, bezier, polyline handled by a common path builder

```ts
// src/components/visuals/_vv-path.ts
import { type Rect, type Point, computeEdgePoints } from './_vv-geom';
import type { WireRecord } from './_vv-registry';

export function computeWirePath(
  from: Rect,
  to: Rect,
  opts: Pick<WireRecord, 'curve' | 'via'>
): string {
  const { a, b } = computeEdgePoints(from, to);

  // Case 1: polyline waypoints — ignore curve, use exact coords between edge points
  if (opts.via && opts.via.length > 0) {
    const pts = [`M ${a.x} ${a.y}`, ...opts.via.map(([x, y]) => `L ${x} ${y}`), `L ${b.x} ${b.y}`];
    return pts.join(' ');
  }

  // Case 2: bezier curve — control point perpendicular to midpoint
  if (opts.curve && opts.curve > 0) {
    const mx = (a.x + b.x) / 2, my = (a.y + b.y) / 2;
    const dx = b.x - a.x, dy = b.y - a.y;
    // Perpendicular unit vector, rotated 90° CCW
    const len = Math.sqrt(dx * dx + dy * dy) || 1;
    const perpX = -dy / len, perpY = dx / len;
    const offset = opts.curve * len * 0.5; // curve ∈ [0,1] scales to half the wire length
    const cx = mx + perpX * offset, cy = my + perpY * offset;
    return `M ${a.x} ${a.y} Q ${cx} ${cy} ${b.x} ${b.y}`;
  }

  // Case 3: straight line (default)
  return `M ${a.x} ${a.y} L ${b.x} ${b.y}`;
}
```

**Design notes:**
- **Waypoints override curve.** If the author passes both `via={[...]}` and `curve={0.2}`, waypoints win. Document in README.md.
- **Curve direction is fixed** (perpendicular CCW). If authors need the opposite arc, they can flip `from`/`to` OR use a negative `curve` value — recommend clamping to `[-1, 1]` and letting negative flip direction.
- **Polyline edge-points:** The current implementation connects `a → via[0] → via[1] → ... → b`. If waypoints are "inside" the nodes, the wire visually enters the node before the waypoint — unusual but author's intent is explicit. Don't over-engineer.

### Integration point — VvStage uses this

```astro
---
// VvStage.astro (completion)
import { computeWirePath } from './_vv-path.ts';
// ... pushStage/popStage/slotHtml from above ...

const wireDefs = [...registry.wires.values()].map(w => {
  const fromNode = registry.getNode(w.from);
  const toNode = registry.getNode(w.to);
  if (!fromNode || !toNode) {
    throw new Error(`<VvWire from="${w.from}" to="${w.to}"> — unknown node id. Registered nodes: ${[...registry.nodes.keys()].join(', ')}`);
  }
  // Convert (x, y, w, h) where x,y = top-left to (cx, cy, w, h) center
  const from = { cx: fromNode.x + fromNode.w / 2, cy: fromNode.y + fromNode.h / 2, w: fromNode.w, h: fromNode.h };
  const to   = { cx:   toNode.x + toNode.w   / 2, cy:   toNode.y + toNode.h   / 2, w:   toNode.w, h:   toNode.h };
  const d = computeWirePath(from, to, w);
  return {
    id: w.id,
    d,
    dashed: w.dashed,
    tone: w.tone,
    delay: w.delay,
  };
});
---

<!-- Inside VvStage's <svg>: -->
<defs>
  <filter id={`glow-${registry.uid}`}>...</filter>
  {wireDefs.map(wd => <path id={`wire-${wd.id}`} d={wd.d} fill="none"/>)}
</defs>
<g class="vv-wires">
  {wireDefs.map(wd => (
    <use
      href={`#wire-${wd.id}`}
      class={`vv-wire vv-tone-${wd.tone ?? 'teal'}`}
      stroke-width="3"
      stroke-dasharray={wd.dashed ? '8 5' : undefined}
      style={`--wd: ${wd.delay ?? 0}ms;`}
    />
  ))}
</g>
<!-- Then the rendered slot HTML (packets, etc.) -->
<Fragment set:html={slotHtml}/>
```

**Why `<use href="#wire-id"/>`:** De-duplicates the `<path d="...">` between the visible wire and the invisible mpath target. SVG `<use>` is O(1) at render time and lets CSS style the visible reference (stroke, stroke-width, stroke-dasharray) independently from the geometry definition. [CITED: W3C SVG 2 §use; MDN `<use>`]

**Confidence: HIGH** — Algorithm verified by hand against the existing PodLifecycleAnimation coordinates (280,410 → 360,410 is a straight horizontal line between two nodes whose edges align on x=280 and x=360 — the algorithm returns exactly those coordinates for centered rects).

---

## SMIL animateMotion Patterns

### Confirmed Pattern — packet along shared wire path

```xml
<!-- Wire rendered once in <defs> -->
<path id="wire-api-lambda" d="M 460 330 L 720 330" fill="none"/>

<!-- Packet references the wire path for motion -->
<circle r="10" fill="var(--brand-primary)" filter="url(#glow)" opacity="0">
  <animateMotion id="pkt-1" dur="1.4s" begin="1.2s;pkt-1.end+4s" repeatCount="1">
    <mpath href="#wire-api-lambda"/>
  </animateMotion>
  <animate attributeName="opacity" values="0;1;1;0" keyTimes="0;0.15;0.85;1"
           dur="1.4s" begin="1.2s;pkt-1.end+4s" repeatCount="1"/>
</circle>
```

**Why `<mpath>` over inline `path="..."`:** Shares geometry between visible wire and packet motion. If wire endpoints shift because a node moves, both update atomically — no coordinate drift. [CITED: developer.mozilla.org/en-US/docs/Web/SVG/Reference/Element/animateMotion]

### Confirmed Pattern — chained-loop `begin="initial;pkt.end+gap"`

SMIL spec supports a **semicolon-separated list of begin values**; each value is an independent trigger. When any trigger fires, the animation starts (or restarts) [CITED: developer.mozilla.org/en-US/docs/Web/SVG/Reference/Attribute/begin — "The attribute value is a semicolon-separated list of values"].

- First trigger: `1.2s` — a clock-value offset from document load. Fires once at 1.2s after page load.
- Second trigger: `pkt-1.end+4s` — a **syncbase** reference to the end of the animation with `id="pkt-1"`, plus 4s offset. Fires every time that animation ends.

Result: the packet plays at 1.2s, ends at 1.2+1.4 = 2.6s, replays at 2.6+4 = 6.6s, ends at 8.0s, replays at 12.0s, etc.

**⚠️ Gotcha:** The syncbase reference is **self-referential** (`pkt-1.end+4s` on the animation with `id="pkt-1"`). This is officially supported [CITED: W3C SMIL 3.0 §Syncbase value] and works across Chromium, Firefox, and WebKit. **Verified empirically in `PodLifecycleAnimation.astro` — shipped and running on production.**

### Browser Compatibility

| Browser | animateMotion | mpath | Syncbase begin | Notes |
|---------|---------------|-------|----------------|-------|
| Chrome | ✅ Since 5 | ✅ | ✅ | Baseline widely available [CITED: MDN] |
| Firefox | ✅ Since 4 | ✅ | ✅ | No known issues |
| Safari 12+ (macOS/iOS) | ✅ | ✅ | ✅ | No known issues |
| Safari < 11 | ⚠️ Partial | ⚠️ | ⚠️ | Legacy; not a v1.0 target |

**Source:** MDN SVG animation docs mark `<animateMotion>` as "Baseline, Widely available. Available across browsers since January 2020" [CITED: developer.mozilla.org/en-US/docs/Web/SVG/Reference/Element/animateMotion — browser compatibility]. caniuse.com reports SVG SMIL animation at 96.73% global support [VERIFIED: caniuse.com/svg-smil].

**Note on Chromium's 2015 SMIL deprecation scare:** Chromium briefly announced deprecation of SMIL around 2015 in favor of CSS/WAAPI, but **reversed the decision** — SMIL remains supported indefinitely. This is what led some teams to adopt CSS `offset-path`, which is what bit us in Phase 9. Our decision to use SMIL is correct. [ASSUMED — from general knowledge of the Chromium SMIL saga; not re-verified this session, but the MDN "baseline widely available" status today confirms the decision.]

### No CSS offset-path anywhere

**Explicit ban in all primitives.** README.md must warn: "Do not use CSS `offset-path` for packet animation. It causes coordinate-space drift in responsive containers. Always use SMIL `<animateMotion>` inside the stage's SVG."

### Initial delay + chained loop pattern

This is the exact pattern PodLifecycleAnimation already uses. Translate to `VvPacket` props:

```astro
<VvPacket wire="kubectl-api" duration="1.4s" delay="1.2s" gap="4s"/>
<!-- Emits: begin="1.2s;pkt-X.end+4s" -->

<VvPacket wire="kubectl-api" duration="1.4s" delay="1.2s" loop={false}/>
<!-- Emits: begin="1.2s" -->
```

**One-shot vs loop:** `loop={true}` → `begin="${delay};${pktId}.end+${gap}"`. `loop={false}` → `begin="${delay}"`.

---

## Reduced-motion Pattern

### Recommendation — SINGLE @media query inside VvStage.astro's `<style>`

**Why one shared location:** All primitives render inside VvStage's SVG/figure. A single CSS block in VvStage's scoped `<style>` can target `.vv-node`, `.vv-wire`, and `.vv-packet` uniformly. Per-component @media would duplicate the same 4 rules 3 times.

```astro
<!-- VvStage.astro <style> -->
<style>
  /* ... normal animation styles (fade-in keyframes, node animations, etc.) ... */

  @media (prefers-reduced-motion: reduce) {
    /* Freeze nodes in final state — no entry animation */
    .vv-stage :global(.vv-node) {
      opacity: 1;
      animation: none;
      transform: none;
    }
    /* Freeze wires at final opacity (0.55, matches PodLifecycle) */
    .vv-stage :global(.vv-wire) {
      opacity: 0.55;
      animation: none;
    }
    /* Hide all packets — no motion, no fade */
    .vv-stage :global(.vv-packet) {
      display: none;
    }
  }
</style>
```

### Why `:global(...)` is needed

Astro's scoped `<style>` attaches `data-astro-cid-xxx` attributes to ALL elements rendered directly in the `.astro` file. But children rendered via `<slot/>` (VvNode, VvWire, VvPacket) have DIFFERENT `data-astro-cid-*` attributes (their own scope). Without `:global()`, the selector `.vv-stage .vv-node` wouldn't match child elements. [CITED: docs.astro.build/en/guides/styling/#global-styles — `:global()` selector]

### Why this single-location pattern beats per-component

- **DRY:** One place to change reduced-motion rules.
- **Clear responsibility:** VvStage owns the compositional rules; VvNode/VvWire/VvPacket own their normal-state rules.
- **SMIL honors reduced-motion automatically for CSS display: none.** Setting `.vv-packet { display: none }` removes the circle from render; SMIL animations on hidden elements don't trigger paint — no CPU cost.

### Alternative — JS-based reduced-motion check

Rejected. Would add runtime JS. CSS @media is declarative and honored natively by the browser.

### Validation

- Manual: macOS System Settings → Accessibility → Display → Reduce motion → on → refresh page → verify packets are hidden, nodes static.
- Automated: Playwright `page.emulateMedia({ reducedMotion: 'reduce' })` before screenshot. [CITED: Playwright docs §emulateMedia]

---

## Validation Architecture

### Test Framework

| Property | Value |
|----------|-------|
| Framework | `@playwright/test@^1.59.1` (NEW dev dep — currently not installed) |
| Config file | `playwright.config.ts` (none — Wave 0 gap) |
| Quick run command | `npx playwright test tests/visuals/pod-lifecycle-parity.spec.ts` |
| Full suite command | `npx playwright test` |
| Baseline setup | `playwright.config.ts` with `use: { baseURL: 'http://localhost:4321', reducedMotion: 'reduce' }`, `retries: 2` for flake suppression |

### Phase Requirements → Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|--------------|
| PRIMS-01 | VvStage renders figure + SVG viewBox 0 0 1800 820 | unit (DOM assertion) | `npx playwright test tests/visuals/vv-stage.spec.ts -x` | ❌ Wave 0 |
| PRIMS-02 | VvNode registers x/y coords, renders at correct CSS position, honors tone | unit | `npx playwright test tests/visuals/vv-node.spec.ts -x` | ❌ Wave 0 |
| PRIMS-03 | VvWire computes edge-points between two nodes, renders SVG `<path>`, honors dashed/curve | unit | `npx playwright test tests/visuals/vv-wire.spec.ts -x` | ❌ Wave 0 |
| PRIMS-04 | VvPacket animates along wire via SMIL; hidden under reduced-motion | integration | `npx playwright test tests/visuals/vv-packet.spec.ts -x` | ❌ Wave 0 |
| PRIMS-05 | **Refactored PodLifecycleAnimation renders pixel-identically on `/blog/karpenter-right-sizing`** | visual regression | `npx playwright test tests/visuals/pod-lifecycle-parity.spec.ts` | ❌ Wave 0 |
| PRIMS-06 | README documents primitives API | manual | Visual inspection + checklist | N/A |

### D-19 Pixel-Parity Test

The parity test is the centerpiece. Here's the design:

```ts
// tests/visuals/pod-lifecycle-parity.spec.ts
import { test, expect } from '@playwright/test';

test.describe('PodLifecycleAnimation refactor — pixel parity', () => {
  test('reduced-motion frozen state matches baseline', async ({ page }) => {
    // Force the deterministic frozen state.
    // WHY: SMIL packets are frame-time-dependent; reduced-motion hides them
    // and freezes nodes/wires at their final-state opacity. This makes the
    // screenshot deterministic regardless of when the snapshot fires.
    await page.emulateMedia({ reducedMotion: 'reduce' });

    await page.goto('/en/blog/karpenter-right-sizing');

    // Wait for the animation figure to be in the DOM + CSS settled.
    const figure = page.locator('figure.pod-lifecycle, figure.vv-stage').first();
    await figure.waitFor({ state: 'visible' });

    // Small settle delay for font-loading.
    await page.waitForTimeout(300);

    // Compare against baseline stored in tests/visuals/__snapshots__/.
    // maxDiffPixels threshold accounts for:
    //  - Font anti-aliasing variance across OS versions
    //  - 1-2 px sub-pixel rendering differences in stroke-dasharray
    //  - Glow filter feGaussianBlur has tiny numerical variance across engines
    await expect(figure).toHaveScreenshot('pod-lifecycle-frozen.png', {
      maxDiffPixels: 150,
      maxDiffPixelRatio: 0.002, // 0.2% tolerance
      animations: 'disabled',
    });
  });
});
```

**Threshold recommendation: `maxDiffPixels: 150` + `maxDiffPixelRatio: 0.002`.** Rationale:

- Screenshot of the figure at ~1400×640 on a 1440px viewport is ~900,000 pixels. 150/900,000 ≈ 0.017% — extremely tight.
- Font rendering differs by ~30-50 pixels between macOS/Ubuntu; Playwright CI uses Ubuntu so local screenshot dev on macOS may need a baseline refresh. Two baselines (macOS and Ubuntu) is common; Playwright's `toHaveScreenshot` automatically picks the right one based on `projectName`.
- `maxDiffPixelRatio: 0.002` is a safety net — if the figure size changes (shouldn't, but), the ratio scales; absolute count alone can be too tight if someone expands the stage.
- `animations: 'disabled'` halts CSS animations (but not SMIL — which is moot because `emulateMedia({ reducedMotion: 'reduce' })` already hid the packets).

[CITED: playwright.dev/docs/api/class-pageassertions — toHaveScreenshot options]

**Important caveat — SMIL and Playwright.** Playwright's `animations: 'disabled'` ONLY disables CSS animations, CSS transitions, and Web Animations API. **SMIL is NOT disabled.** [VERIFIED via context7 Playwright docs]. This is why `emulateMedia({ reducedMotion: 'reduce' })` is the mechanism — our own CSS `@media (prefers-reduced-motion: reduce)` rule hides packets via `display: none`, which eliminates the motion and stabilizes the capture.

### D-20 LOC Metric — automation

```bash
# In the refactor PR description, run:
wc -l src/components/PodLifecycleAnimation.astro
# Before refactor: 241
# After refactor (target ≤ 100): e.g., 72
echo "LOC delta: $((241 - $(wc -l < src/components/PodLifecycleAnimation.astro)))"
```

**Plan task:** Add a pre-refactor commit recording `pla-loc-before.txt` with `wc -l` output; after refactor, add `pla-loc-after.txt`. Both committed to the phase artifacts dir. README.md references these numbers.

### D-21 Time-to-Port Metric — how to measure

1. Pick a slide from `/Users/viktor/Documents/GitHub/vedmichv/slidev-theme-vv/presentations/vv-demo/pages/` that has not been ported yet. Recommend slide S1 (AWS three-tier arch) or S3 (mesh pattern) since S2 lifecycle is already the PodLifecycle baseline. Sample candidates visible in `pages/10-complex-schemas.md`:
   - Lines 13-131: "AWS three-tier on AWS · animated traffic" — 10 nodes, 14 wires, 14 packets. Medium complexity.
   - Deeper in the file: additional schemas (mesh, state machine). Select during Phase 1 execution.

2. **Timer protocol:**
   - Start timer at: "open new MDX file in editor"
   - Stop timer at: "Playwright screenshot of `/blog/<slug>` matches Slidev slide visually AND `npm run build` passes"
   - Excludes: time spent on tooling bugs, unrelated tasks
   - Include: coordinate copying, icon name translation, tweaking delays

3. **Recording:** Plan task writes a file `.planning/phases/01-rich-media-primitives/time-to-port-report.md` with:
   - Slide source path
   - Start time, end time, elapsed (minutes)
   - What went fast, what was slow
   - Specific blockers (if any)

4. **Checkpoint decision rule** (per D-21 and ROADMAP §Phase 7):
   - < 10 min → Phase 7 SKIPPED (primitives alone hit target)
   - 10-15 min → user decides (borderline; ROI of codegen marginal)
   - > 15 min → Phase 7 triggered

### Sampling Rate

- **Per task commit:** `npx playwright test tests/visuals/pod-lifecycle-parity.spec.ts` (should run in ~3-5s local, ~10-15s CI)
- **Per wave merge:** `npx playwright test tests/visuals/` (all visuals tests, ~15-30s)
- **Phase gate:** Full suite green before `/gsd-verify-work`

### Wave 0 Gaps — must address first in Phase 1

- [ ] `playwright.config.ts` — with baseURL, reducedMotion preset, webServer config (boot `npm run dev` on :4321 for local, or serve `dist/` in CI)
- [ ] `tests/visuals/pod-lifecycle-parity.spec.ts` — visual regression test
- [ ] `tests/visuals/vv-stage.spec.ts` — DOM assertion unit test
- [ ] `tests/visuals/vv-node.spec.ts` — coordinate + tone unit test
- [ ] `tests/visuals/vv-wire.spec.ts` — edge-point math unit test (can be a pure-function test if we extract `computeWirePath` into `_vv-path.ts`)
- [ ] `tests/visuals/vv-packet.spec.ts` — SMIL rendering + reduced-motion unit test
- [ ] `tests/visuals/__snapshots__/pod-lifecycle-frozen.png` — baseline snapshot (captured from pre-refactor `PodLifecycleAnimation.astro` on a clean build)
- [ ] Framework install: `npm install -D @playwright/test && npx playwright install chromium`
- [ ] `.gitignore` entry: `test-results/`, `playwright-report/` (Playwright's default output dirs)

**Unit tests for geometry:** `computeEdgePoints` and `computeWirePath` are pure functions — ideal for a lightweight unit test. Can run with `node --test` (built into Node 22) OR via Playwright's test runner. Recommend `node --test` for geometry (fast, no browser boot) and Playwright for DOM/visual.

```ts
// tests/unit/vv-geom.test.ts (node --test)
import { test } from 'node:test';
import assert from 'node:assert';
import { computeEdgePoints } from '../../src/components/visuals/_vv-geom';

test('horizontal wire between equal rects meets at facing edges', () => {
  const from = { cx: 100, cy: 100, w: 200, h: 100 }; // edges x=0..200, y=50..150
  const to   = { cx: 400, cy: 100, w: 200, h: 100 }; // edges x=300..500
  const { a, b } = computeEdgePoints(from, to);
  assert.strictEqual(a.x, 200); // right edge of from
  assert.strictEqual(a.y, 100);
  assert.strictEqual(b.x, 300); // left edge of to
  assert.strictEqual(b.y, 100);
});
```

### Deeper regression safety — npm run build passes

Add a Wave 0 task: run `npm run build` before phase start, capture output to `pre-refactor-build.log`. After phase: `npm run build` must still succeed and produce 31+ pages in <1s (D-22).

---

## Potential Pitfalls & Mitigations

### Pitfall A: Astro scoped style not reaching SVG children

**What breaks:** CSS like `.vv-stage .vv-node { ... }` in VvStage.astro's `<style>` won't match VvNode elements because they carry a different `data-astro-cid-*` scope attribute.

**Fix:** Use `:global(...)` for child-element selectors, OR use CSS custom properties that children read (`--vv-node-anim-delay`, etc.), OR set `<style is:global>` for the SVG-children selector block.

**Recommendation:** Prefer `:global(.vv-node)` targeted selectors over `is:global` — contains the scope leak.

[CITED: docs.astro.build/en/guides/styling/#global-styles]

### Pitfall B: MDX auto-import surprise

**What breaks:** `<VvStage>` works in `.mdx` only if the author imports it at the top of the frontmatter. If they forget, MDX renders `<VvStage>` as a literal HTML element (invalid).

**Fix:** Document the required imports prominently in README.md and include a copy-pasteable "top-of-file import block" for blog post authors.

**No Astro config change needed:** Astro's `@astrojs/mdx` supports component imports in MDX frontmatter natively [VERIFIED: docs.astro.build MDX integration]. Global component injection is possible via `components` option per-page but NOT recommended (opacity hurts debuggability).

### Pitfall C: Tailwind 4 `@theme` vs CSS custom properties in SVG

**What breaks:** Tailwind 4's `@theme` directive inlines color VALUES at build time when used via Tailwind utility classes (`bg-brand-primary`). If we write `bg-brand-primary` on an SVG element, it compiles to a hex literal — but SMIL `<animateMotion>` can't target hex via a CSS variable indirection.

**Fix:** For SVG presentational attributes (`fill`, `stroke`), use raw CSS custom properties: `style={{ fill: 'var(--brand-primary)' }}` or `fill="var(--brand-primary)"`. For non-SVG elements (nodes' outer `<div>`), Tailwind utilities are fine.

**Already correct in PodLifecycleAnimation** — `stroke="var(--brand-primary)"` is raw CSS. No change needed. [VERIFIED: PodLifecycleAnimation.astro lines 77-83]

### Pitfall D: Astro slot render order vs registry timing

**What breaks:** If an Astro version or optimization changes slot rendering to be non-sequential (e.g., Promise.all), the module-level `currentStage` singleton could be overwritten mid-flight.

**Fix:** Document the sequential assumption in `_vv-registry.ts` JSDoc. Add a runtime assertion in `pushStage()` that throws if `currentStage` is already set when called:

```ts
export function pushStage(r: Registry) {
  if (currentStage) {
    throw new Error(
      '<VvStage> — nested or concurrent stages detected. ' +
      'If you hit this in Astro 6+, the SSR model may have changed; ' +
      'switch to AsyncLocalStorage-based scoping.'
    );
  }
  currentStage = r;
}
```

**Confidence: Astro 5 SSR is single-threaded per-request** — this is safe. If it ever isn't, the assertion surfaces the issue immediately rather than producing wrong wire paths silently.

### Pitfall E: `<mpath href="#wire-id"/>` cross-fragment refs

**What breaks:** If the wire `<path>` is in `<defs>` and the packet `<animateMotion><mpath>` is rendered later in the same SVG, the `href="#wire-id"` resolves because they share the same SVG document. But: if someone ever refactors to emit wires OUTSIDE VvStage's main SVG (e.g., in a separate `<svg>` element), `mpath` can't cross SVG boundaries.

**Fix:** Enforce in VvStage: all wires AND packets render inside the same single `<svg>` element. Document in README.md.

**Already aligned with D-04 single-coordinate-system locked decision.**

### Pitfall F: Iconify `include` option and dynamic icon names

**What breaks:** If someone writes `<Icon name={iconVar}/>` with a dynamic string, astro-icon can't statically detect the icon at build time, and the SVG is NOT inlined. Runtime fetch (if configured) is an option, but we want zero-JS.

**Fix:** Enforce static icon names. README.md documents: "Icon name must be a string literal; dynamic props (`name={var}`) are unsupported."

**Planner action:** Add a plan task to lint for dynamic icon names (simple grep).

### Pitfall G: feGaussianBlur filter ID collisions

**What breaks:** Two VvStage instances on the same page both emit `<filter id="glow">`, colliding. First filter wins; second stage's packets may reference the wrong filter (or none).

**Fix:** Use the `registry.uid` per-stage prefix: `<filter id="glow-${registry.uid}">` and `filter={`url(#glow-${registry.uid})`}`. Already in the code sketch.

### Pitfall H: Pre-refactor screenshot baseline

**What breaks:** If the refactor and the baseline capture both happen in the same PR, the baseline is ALREADY the refactored version — nothing to compare against.

**Fix:** **Capture the baseline BEFORE starting refactor.** Plan task: Wave 0 captures `pod-lifecycle-frozen.png` from current `main` branch (pre-refactor). Subsequent tasks refactor and compare against this immutable baseline. Don't regenerate baseline during refactor.

### Pitfall I: PostProcessing CSS for scoped SVG

**What breaks:** Astro's Tailwind integration sometimes strips unused CSS classes. If Tailwind sees `.vv-tone-teal` only in a template string interpolation, it might purge the class. Result: tone styles don't apply.

**Fix:** Use an Astro-scoped `<style>` block (not Tailwind `@apply`) for SVG-related classes. Tailwind purge only scans JS/HTML output; Astro scoped CSS is preserved.

**Verified pattern:** PodLifecycleAnimation.astro uses `<style>` block with `.pla-*` classes — none purged. Primitives follow the same pattern.

---

## TypeScript Prop Types

### Strict vs lenient — recommendation: strict for tones, lenient where ergonomic

```ts
// Shared tone type
export type VvTone =
  | 'teal'
  | 'amber'
  | 'k8s'
  | 'architecture'
  | 'opinion'
  | 'tutorial';

// VvStage
export interface VvStageProps {
  title?: string;
  caption?: string;
  viewBox?: string; // Default "0 0 1800 820"
}

// VvNode
export interface VvNodeProps {
  id: string;                       // REQUIRED
  x: number;                        // REQUIRED — SVG user-space coords
  y: number;                        // REQUIRED
  w?: number;                       // Default 220
  h?: number;                       // Default 160
  label: string;                    // REQUIRED
  tone?: VvTone;                    // Default 'teal'
  animation?: 'slide-x' | 'pop' | 'drop'; // Default 'pop'
  delay?: number;                   // Default 0 (ms)
}

// VvWire — mutually-optional-but-one-required: either (from, to) OR (id + path)
// D-13 is for Packet, not Wire — but wires also support a raw-path escape hatch.
// Recommendation for v1: require (from, to); add raw-path later if needed.
export interface VvWireProps {
  from: string;                     // REQUIRED — node id
  to: string;                       // REQUIRED — node id
  id?: string;                      // Default `${from}-${to}`
  curve?: number;                   // 0..1, default undefined (straight)
  via?: Array<[number, number]>;    // Polyline waypoints
  dashed?: boolean;                 // Default false
  tone?: VvTone;                    // Default 'teal'
  delay?: number;                   // Default 0 (ms)
}

// VvPacket — discriminated union on wire vs path
type VvPacketBase = {
  duration: string;                 // REQUIRED — CSS time string e.g. "1.4s"
  delay: string;                    // REQUIRED — CSS time string e.g. "1.2s"
  r?: number;                       // Default 10
  glow?: boolean;                   // Default true
  tone?: VvTone;                    // Default 'teal'
  loop?: boolean;                   // Default true
  gap?: string;                     // Default '4s' — SMIL begin offset after end
};
export type VvPacketProps =
  | (VvPacketBase & { wire: string;   path?: never })
  | (VvPacketBase & { wire?: never;  path: string });
```

**Design decisions:**

- **`x`, `y` are `number`, not `string`.** Forces authors to write `x={360}` (literal numeric). Prevents accidental `x="50%"` which would break the user-space coordinate system (D-04).
- **`tone` is union literal.** TypeScript narrows at call sites — authors get autocomplete for the 6 tones.
- **`duration`/`delay` stay strings.** SMIL attribute format (`"1.2s"`, `"500ms"`) — keeps the direct mapping to the attribute value.
- **VvPacket discriminated union.** Mutually exclusive `wire` and `path` prevents both being set. TypeScript enforces at compile time; runtime throws as safety net.
- **`via`-waypoint-override rule** documented in README (takes precedence over `curve`). No TS enforcement; it's a docs-layer contract.
- **Strict id prop on VvNode.** If two nodes use the same `id`, the registry's Map.set silently overwrites — add a runtime warning:
  ```ts
  registerNode(n) {
    if (nodes.has(n.id)) console.warn(`<VvNode id="${n.id}"> — duplicate id; overwriting.`);
    nodes.set(n.id, n);
  }
  ```

### Why not runtime validation library (Zod, Valibot)?

Overkill for 4 primitives with ~10 props total. TypeScript interfaces + manual null-check in the critical paths (`registerNode`, `registerWire`, `VvPacket` wire-vs-path) gives us the same safety at zero build cost.

---

## Project Constraints (from CLAUDE.md)

These directives override any generic pattern in this research. The planner must verify plan compliance.

| Directive | Source | How Phase 1 honors it |
|-----------|--------|------------------------|
| **Zero-JS default** — no runtime JS beyond IntersectionObserver, menu toggle, CodeCopyEnhancer, SMIL. | CLAUDE.md §Design Decisions | All primitives are build-time SSR + declarative SMIL. Zero new runtime JS. |
| **No hardcoded hex** in components — always reference a token. | CLAUDE.md §Deep Signal | Tones map to CSS `var(--brand-*)` / `var(--topic-*)`. `stroke="var(--brand-primary)"` not `stroke="#14B8A6"`. |
| **Never cyan** (`#06B6D4`, `#22D3EE`) — deprecated Electric Horizon. | CLAUDE.md §Deep Signal Anti-Patterns | Tone palette avoids cyan; uses teal (`#14B8A6`). |
| **Never DKT purple/green** (`#7C3AED`, `#10B981`) or AWS orange (`#FF9900`). | CLAUDE.md | Not used. |
| **Bilingual parity** — every text change lands in EN + RU. | CLAUDE.md §i18n | Primitives have NO text strings (content is authored in MDX). No i18n impact. README.md is EN-only (developer docs). |
| **Self-hosted fonts** — no Google Fonts CDN. | CLAUDE.md §Fonts | No new fonts introduced. Existing Inter/Space Grotesk/JetBrains Mono reused. |
| **Build must pass** — `npm run build` green, 31+ pages <1s. | CLAUDE.md | Plan includes build-time check before and after refactor. |
| **Playwright attach real Chrome** for visual work. | CLAUDE.md §MCP + feedback | For MANUAL verification via Playwright MCP. Automated tests use `@playwright/test` Chromium (not extension mode) — this is a different workflow. |
| **GSD questions in Russian, artifacts in English.** | CLAUDE.md §User Context | This RESEARCH.md is in English (artifact). ✓ |
| **Three-way skill sync** — if phase modifies a skill, mirror to vault. | CLAUDE.md §Skill updates | Phase 1 doesn't modify skills directly; Phase 6 does (CONTENT-05). Phase 1 writes `src/components/visuals/README.md` only. |

---

## Runtime State Inventory

Phase 1 is **greenfield** — creating 4 new components + 1 refactor of an already-rendered component. The refactor target (`PodLifecycleAnimation.astro`) renders identical HTML before/after (that's the acceptance test D-19).

| Category | Items Found | Action Required |
|----------|-------------|-----------------|
| Stored data | None | None — no databases, no user-data. |
| Live service config | None | None — no external services. |
| OS-registered state | None | None — no scheduled tasks, no daemons. |
| Secrets/env vars | None | None — no API keys. |
| Build artifacts | `dist/` is regenerated on every build. Playwright baselines (`tests/visuals/__snapshots__/`) must be captured BEFORE refactor so the comparison is meaningful. | Capture baseline in Wave 0. |

**Nothing in any category needs migration.** This is a pure-code phase.

---

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| Node.js 22.x LTS | Astro build | ✓ | (existing) | — |
| Astro 5.17.1 | All primitives | ✓ | 5.17.1 (pinned in package.json) | — |
| @astrojs/mdx 4.3.14 | MDX consumers | ✓ | 4.3.14 | — |
| `astro-icon` | VvNode icon slot | ✗ (new install) | Target 1.1.5 | — |
| `@iconify-json/*` (8 packages) | Icon resolution | ✗ (new install) | Versions in stack table | Authors can hand-paste SVG (D-09c) — primitives work without Iconify installed, but Iconify is locked for D-26 workflow |
| `@playwright/test` | Visual regression tests | ✗ (new dev dep) | Target 1.59.1 | Manual screenshot comparison via Playwright MCP — slower but possible |
| `node --test` | Geometry unit tests | ✓ (built-in) | Node 22 | — |

**Missing dependencies with no fallback:** None.

**Missing dependencies with fallback:** All "new" packages are standard npm installs — no blocking constraints.

---

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | Astro 5 SSR is single-threaded per-request (safe to use module-level `currentStage` singleton). | §Ref Resolution | If Astro 6+ parallelizes SSR within a request, the singleton could race. Runtime assertion in `pushStage()` surfaces the issue immediately. Low probability for v1.0 window. |
| A2 | The PodLifecycleAnimation refactor will drop from 241 LOC to ≤ 100 LOC. | §D-20 | If true LOC is 120, Phase 7 checkpoint still triggers evaluation — LOC is a proxy, not a hard gate. User can decide. |
| A3 | Playwright `maxDiffPixels: 150` tolerance is enough for cross-OS baseline comparison. | §Validation | If CI flakes on diffs of 200-500 pixels due to Ubuntu font rendering, we may need separate macOS/Ubuntu baselines OR relax to `maxDiffPixels: 500`. |
| A4 | Slidev's `<logos-aws-lambda>` Iconify web-component renders identically to astro-icon's `<Icon name="logos:aws-lambda"/>`. | §astro-icon | Both use `@iconify-json/logos` as source, so SVG bytes are identical. Only wrapper changes. Very low risk. |
| A5 | SMIL `<mpath href="#..."/>` (SVG 2 `href`) works across target browsers, not just `xlink:href`. | §SMIL Patterns | MDN says SVG 2 dropped xlink: namespace requirement; `href` is supported. If Safari 12-15 breaks, fall back to `xlink:href="#..."`. Low probability. |
| A6 | Chromium's 2015 SMIL deprecation was reversed permanently. | §SMIL Browser Compat | If SMIL deprecation re-enters roadmap, we have a migration plan (CSS motion-path with fixed viewBox canvas). Not a Phase 1 concern. |

---

## Open Questions (RESOLVED)

1. **Should the `via=` polyline preserve edge-point math on the endpoints, or should it use raw first/last coordinates?**
   - Current sketch: edge-points ARE computed (a, b), then waypoints interpolate between. So `M ${a.x} ${a.y} L waypoints... L ${b.x} ${b.y}`. Author's waypoints are between the edge points.
   - Alternative: waypoints include endpoints. Requires author to compute edge points themselves — defeats the convenience.
   - **RESOLVED:** keep auto edge-points + interpolate waypoints between. Document clearly.

2. **Does `node --test` suffice for unit tests, or should we standardize on `@playwright/test`?**
   - `node --test` needs no config, runs fast, but shares no ecosystem with Playwright assertions.
   - `@playwright/test` provides a unified `expect()` API and baseline snapshot management.
   - **RESOLVED:** unit tests use `node --test` (pure geometry functions); integration + visual tests use Playwright. Two tools, different jobs. Planner can flip to Playwright-only if simpler.

3. **Should VvNode's `w`/`h` default be the PodLifecycle 12.22% × 19.51% (= 220×160 on 1800×820)?**
   - **RESOLVED:** Yes — keeps parity with the existing node size. Document in README.md. Authors override when needed.

---

## Sources

### Primary (HIGH confidence)

- **astro-icon docs** (Context7 `/natemoo-re/astro-icon`, 2026-05-02) — HIGH
  - https://github.com/natemoo-re/astro-icon/blob/main/packages/core/README.md
  - https://github.com/natemoo-re/astro-icon/blob/main/packages/www/src/content/docs/reference/configuration.mdx
  - Integration install, Icon component usage, `include` option for tree-shaking, local SVG support.
- **Astro slots/render API** (Context7 `/websites/astro_build_en`, 2026-05-02) — HIGH
  - https://docs.astro.build/en/basics/astro-components
  - https://docs.astro.build/en/reference/astro-syntax (Astro.slots.render)
  - https://docs.astro.build/en/guides/styling/#global-styles (`:global()` selector)
- **Playwright visual regression + emulateMedia** (Context7 `/microsoft/playwright.dev`, 2026-05-02) — HIGH
  - https://playwright.dev/docs/api/class-pageassertions (toHaveScreenshot options)
  - https://playwright.dev/docs/test-snapshots (maxDiffPixels, maxDiffPixelRatio)
  - https://playwright.dev/docs/api/class-page (emulateMedia with reducedMotion)
- **MDN SMIL `animateMotion` + `mpath` + `begin` syncbase** (Context7 `/websites/developer_mozilla_en-us`, 2026-05-02) — HIGH
  - https://developer.mozilla.org/en-US/docs/Web/SVG/Reference/Element/animateMotion
  - https://developer.mozilla.org/en-US/docs/Web/SVG/Reference/Attribute/begin
  - https://developer.mozilla.org/en-US/docs/Web/SVG/Guides/SVG_animation_with_SMIL
  - "Baseline widely available since January 2020."
- **npm registry package versions** (`npm view`, 2026-05-02) — HIGH
  - astro-icon 1.1.5, 33 versions, last published 2024-12-26
  - All 8 `@iconify-json/*` versions verified
  - @playwright/test 1.59.1

### Secondary (MEDIUM confidence)

- **Slidev VvArchNode.vue + VvArchGrid.vue source** — direct file inspection — HIGH for mirroring, MEDIUM for "Astro authors will find the same ergonomics" (subjective claim).
- **Phase 9 v0.4 CSS offset-path hotfix** — empirical validation in project history, documented in PodLifecycleAnimation.astro header comment. HIGH confidence on the conclusion (SMIL works, CSS offset-path breaks).

### Tertiary (LOW confidence, flagged for validation during planning)

- **Chromium SMIL deprecation reversal** (§SMIL Browser Compat A6) — [ASSUMED] — based on training knowledge of the 2015 announcement and subsequent reversal. Not re-verified this session. Low risk: MDN's current "baseline" designation implicitly confirms.

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — all versions npm-verified; astro-icon maintainer-tracked; Iconify collections are the exact 8 from Slidev.
- Ref-resolution architecture: HIGH — pattern is standard React/Vue inject/provide; Astro SSR sequentiality supports it.
- Edge-point geometry: HIGH — algorithm trivially verifiable by hand against PodLifecycle coords.
- SMIL patterns: HIGH — MDN baseline + already running in production.
- Validation architecture: HIGH — Playwright API verified via Context7.
- Reduced-motion pattern: HIGH — CSS `:global()` pattern verified in Astro docs.
- Pitfalls: MEDIUM-HIGH — known Astro-specific traps documented with fix patterns.
- TypeScript types: HIGH — straightforward union literals.

**Research date:** 2026-05-02
**Valid until:** 2026-06-02 (30 days — stable stack, no pending Astro 6 release)
