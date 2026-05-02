# Phase 1: Rich Media Primitives — Pattern Map

**Mapped:** 2026-05-02
**Files analyzed:** 13 new + 4 modified = 17
**Analogs found:** 10 / 13 new (3 are greenfield infrastructure with no prior analog)

Every existing analog is a file already in `vedmich.dev` (primary source of patterns). Slidev Vue components (`VvArchNode.vue`, `VvArchGrid.vue`) are referenced as **API-shape mirrors** only — not code to copy, because they are Vue, use CSS Grid, and live on a 1920×1080 canvas. Astro/SVG code must come from `PodLifecycleAnimation.astro`.

---

## File Classification

### NEW files

| New file | Role | Data Flow | Closest Analog | Match |
|----------|------|-----------|----------------|-------|
| `src/components/visuals/VvStage.astro` | component (container + SSR orchestrator) | build-time SSR, slot composition | `src/components/PodLifecycleAnimation.astro` (`<figure>` → `.pla-stage` → `<svg viewBox>` wrapper) | role-match |
| `src/components/visuals/VvNode.astro` | component (positioned card + icon slot) | build-time SSR, props + registry write | `src/components/PodLifecycleAnimation.astro` (§ `.pla-node` divs + `.pla-ic`) | exact |
| `src/components/visuals/VvWire.astro` | component (zero-output registrar) | build-time SSR, registry write only | `src/components/PodLifecycleAnimation.astro` (§ `<line class="pla-line">` inside `<svg class="pla-wires">`) | role-match (shape inverts: current inlines path, new is register-only) |
| `src/components/visuals/VvPacket.astro` | component (SMIL `animateMotion` circle) | declarative SVG animation | `src/components/PodLifecycleAnimation.astro` (§ `<circle>` with `<animateMotion>` + `<animate attributeName="opacity">`) | exact |
| `src/components/visuals/_vv-registry.ts` | utility (module-level stage registry) | build-time in-memory state | **no analog** — novel infrastructure for this codebase | n/a |
| `src/components/visuals/_vv-geom.ts` | utility (pure TS geometry) | pure function | `src/i18n/utils.ts` (pure-TS typed module with named exports) | partial (module shape match; domain new) |
| `src/components/visuals/_vv-path.ts` | utility (SVG path builder) | pure function | `src/i18n/utils.ts` | partial (module shape match) |
| `src/components/visuals/README.md` | docs (component-folder README) | n/a | **no analog** — first component-folder README in `src/components/` | n/a |
| `playwright.config.ts` | config (test infra) | n/a | **no analog** — greenfield test infrastructure | n/a |
| `tests/visual/pod-lifecycle-parity.spec.ts` | test (Playwright visual regression) | n/a | **no analog** — first Playwright test in repo | n/a |
| `tests/unit/vv-geom.test.ts` | test (`node --test`) | n/a | **no analog** — first unit test in repo | n/a |
| `tests/unit/vv-path.test.ts` | test (`node --test`) | n/a | **no analog** | n/a |

### MODIFIED files

| Modified file | Role | What Survives | What Gets Rewritten |
|---------------|------|---------------|---------------------|
| `src/components/PodLifecycleAnimation.astro` | component (refactor target) | Public import path (`src/components/PodLifecycleAnimation.astro` per D-24); `interface Props { title?: string; caption?: string }`; the exact coordinate numbers (60, 360, 660, 960, 1300 × 130, 330, 530, etc.) and delay values (300ms, 600ms, 900ms, 1.2s, 1.5s, 1.8s, 2.1s, 2.3s, 2.4s, 2.6s) per D-17 explicit-timing contract | Everything between `<figure>` and `</figure>`: replaced with `<VvStage>` + 7× `<VvNode>` + 7× `<VvWire>` + 7× `<VvPacket>`. The 113-line `<style>` block deleted (VvStage owns it). Target LOC ≤ 100 per D-20. |
| `astro.config.mjs` | config | Existing `site`, `i18n`, `markdown.remarkPlugins`, `vite.plugins [tailwindcss()]` blocks | `integrations: [mdx(), sitemap()]` extended to `integrations: [mdx(), sitemap(), icon()]`. Add `import icon from 'astro-icon';` at top. |
| `package.json` | config | All existing deps and scripts | Add `astro-icon` to `dependencies`; add 8 `@iconify-json/*` + `@playwright/test` to `devDependencies`; add `"test": "playwright test"` and `"test:unit": "node --test tests/unit/"` to `scripts`. |
| `src/content/blog/{en,ru}/2026-03-20-karpenter-right-sizing.mdx` | content (consumer) | Per D-24 — NOT modified. The `import PodLifecycleAnimation from '../../../components/PodLifecycleAnimation.astro'` line stays; internals of that component swap to primitives. | Nothing. |

---

## Pattern Assignments

### `src/components/visuals/VvStage.astro` (component, SSR container)

**Analog:** `src/components/PodLifecycleAnimation.astro`

**Props-interface pattern** (lines 11-19 — copy the SHAPE, extend with `viewBox`):

```astro
interface Props {
  caption?: string;
  title?: string;
}

const {
  title = 'Pod lifecycle · scheduler to Ready',
  caption = 'kubectl → API server → etcd · scheduler picks node · kubelet spawns pods',
} = Astro.props;
```

**What to keep:** `interface Props { ... }` + destructured defaults idiom.
**What to change:** Remove the PodLifecycle-specific default strings; add `viewBox?: string` with default `'0 0 1800 820'`. Title/caption become optional and render only when present (`{title && <div>...</div>}`).

---

**Outer-chrome pattern** (lines 22-24, 124, 128-152 — copy the wrapper shape + CSS shell):

```astro
<figure class="pod-lifecycle not-prose" aria-label={title}>
  <div class="pla-title">{title}</div>

  <div class="pla-stage">
    <!-- children here -->
  </div>

  <figcaption class="pla-caption">{caption}</figcaption>
</figure>
```

```css
.pod-lifecycle {
  margin: 2.5rem 0;
  width: 100%;
  max-width: 100%;
}

.pla-title {
  font-family: var(--font-display, 'Space Grotesk', sans-serif);
  font-weight: 700;
  font-size: 1.25rem;
  color: var(--text-primary);
  text-align: center;
  margin-bottom: 0.75rem;
}

/* Stage keeps the 1800×820 design ratio — ~2.195:1 */
.pla-stage {
  position: relative;
  width: 100%;
  aspect-ratio: 1800 / 820;
  background: var(--bg-base);
  border: 1px solid var(--border);
  border-radius: 12px;
  overflow: hidden;
}
```

**What to keep:** `<figure>` + `.not-prose` (unstyles prose for MDX embed), `aspect-ratio` computed from viewBox, `background: var(--bg-base)`, `border: 1px solid var(--border)`, `border-radius: 12px`, `overflow: hidden`.
**What to change:** Class prefix `pla-` → `vv-stage-` (component-folder convention). Aspect-ratio derives from the `viewBox` prop (e.g., `aspect-ratio: 1800 / 820;` for the default) — compute via `const [, , vbW, vbH] = viewBox.split(' ').map(Number);` then `style={\`aspect-ratio: ${vbW} / ${vbH};\`}`.

---

**Reduced-motion pattern** (lines 229-239 — copy as-is into VvStage `<style>`):

```css
/* Reduced-motion: freeze nodes/wires in final state, hide moving packets */
@media (prefers-reduced-motion: reduce) {
  .pla-node,
  .pla-line {
    opacity: 1;
    animation: none;
    transform: none;
  }
  .pla-line { opacity: 0.55; }
  .pla-pkts { display: none; }
}
```

**What to keep:** All three rules, byte-for-byte. D-18 locks this exact behavior.
**What to change:** Selector prefixes → `:global(.vv-node)`, `:global(.vv-wire)`, `:global(.vv-pkts)` because primitives render from child `.astro` files (different scoped CID) per Pitfall A in RESEARCH.md. Scoped `<style>` block must use `:global(...)` to reach child elements.

---

**Glow-filter pattern** (lines 65-73 — copy into VvStage `<defs>`):

```xml
<defs>
  <filter id="pla-glow" x="-50%" y="-50%" width="200%" height="200%">
    <feGaussianBlur stdDeviation="4" result="coloredBlur" />
    <feMerge>
      <feMergeNode in="coloredBlur" />
      <feMergeNode in="SourceGraphic" />
    </feMerge>
  </filter>
</defs>
```

**What to keep:** Whole filter definition (same `stdDeviation=4`, same merge graph).
**What to change:** Filter id `pla-glow` → `glow-${registry.uid}` (Pitfall G — per-stage unique id prevents collisions if two VvStage instances sit on one page).

---

### `src/components/visuals/VvNode.astro` (component, positioned card)

**Analog:** `src/components/PodLifecycleAnimation.astro`

**Node markup + styling pattern** (lines 27-35, 154-204 — current PodLifecycle inlines node+icon together):

```html
<div class="pla-node pla-slide-x" style="left: 3.33%; top: 40.24%; --delay: 0ms;">
  <svg class="pla-ic pla-ic-teal" viewBox="0 0 24 24" ...><polyline points="4 17 10 11 4 5"/>...</svg>
  <span>kubectl</span>
</div>

<div class="pla-node pla-pop" style="left: 20%; top: 40.24%; --delay: 300ms;">
  <svg class="pla-ic pla-ic-teal" viewBox="0 0 24 24" ...><polygon points="12 2 22 8.5 22 15.5 12 22 2 15.5 2 8.5"/>...</svg>
  <span>API server</span>
</div>
```

```css
.pla-node {
  position: absolute;
  /* Node is 220×160 on a 1800×820 canvas → 12.22% × 19.51% */
  width: 12.22%;
  height: 19.51%;
  border-radius: 12px;
  background: var(--bg-surface);
  border: 1px solid var(--border);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.35rem;
  font-family: var(--font-body, 'Inter', sans-serif);
  font-weight: 600;
  font-size: clamp(0.7rem, 1.2vw, 1rem);
  color: var(--text-primary);
  opacity: 0;
  animation-duration: 600ms;
  animation-timing-function: cubic-bezier(0.34, 1.4, 0.64, 1);
  animation-fill-mode: forwards;
  animation-delay: var(--delay, 0ms);
}

.pla-ic {
  width: clamp(22px, 3.2vw, 40px);
  height: clamp(22px, 3.2vw, 40px);
}
.pla-ic-teal  { color: var(--brand-primary); }
.pla-ic-amber { color: var(--brand-accent); }

.pla-slide-x { transform: translateX(-20px); animation-name: pla-slide-x; }
.pla-pop     { transform: scale(0.5); animation-name: pla-pop; animation-duration: 700ms; }
.pla-drop    { animation-name: pla-drop; }

@keyframes pla-slide-x { 0% {opacity:0;transform:translateX(-20px)} 100% {opacity:1;transform:translateX(0)} }
@keyframes pla-drop    { 0% {opacity:0;transform:translateY(-20px)} 100% {opacity:1;transform:translateY(0)} }
@keyframes pla-pop     { 0% {opacity:0;transform:scale(0.5)} 100% {opacity:1;transform:scale(1)} }
```

**What to keep:** Percent-position + `aspect-ratio` approach (matches D-04 single coord system because `%` is relative to the stage `<div>`, which itself carries `aspect-ratio: 1800/820` — so X% of 1800 reads directly). `flex` centering, font/color tokens, all three keyframe animations (`slide-x`, `pop`, `drop`), `var(--delay)` CSS-custom-property pattern for staggered entry.
**What to change:** Prefix `pla-` → `vv-node-`. Icon is now a `<slot/>` (D-08) not inline `<svg>`. Tone → `data-tone` attribute + CSS `[data-tone="teal"]` selector that sets `--tone: var(--brand-primary)`. Border-left accent added per VvArchNode.vue pattern (`border-left: 4px solid var(--tone)`) — D-09b.

**VvArchNode.vue API-shape mirror** (lines 22-29, 49-75 of Slidev component — for vocabulary parity ONLY, not code copy):

```ts
defineProps<{
  id: string
  col: string
  row: string | number
  label?: string
  tone?: 'navy' | 'teal' | 'amber'
  stack?: boolean
}>()
```
```css
.vv-arch-node {
  border-left: 4px solid var(--vv-teal);  /* ← tone accent on BORDER, not icon */
  background: var(--vv-bg-surface);
  border-radius: 14px;
}
.vv-arch-node.tone-teal  { border-left-color: var(--vv-teal); }
.vv-arch-node.tone-amber { border-left-color: var(--vv-amber); }
```

**What to mirror:** The tone-as-border-left-color pattern (per D-09b). Astro Props interface shape for `tone` union literal.
**What to change:** `col`/`row` (CSS Grid) → `x`/`y` (SVG user-space) — because we are NOT on a CSS Grid canvas, we are on a single 1800×820 SVG coordinate system (D-03). Add 6 tones (D-10) instead of Slidev's 3: `teal`, `amber`, `k8s`, `architecture`, `opinion`, `tutorial`.

---

**Registry-write pattern** (NO analog — new):

```astro
---
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
const { id, x, y, w = 220, h = 160, label, tone = 'teal', animation = 'pop', delay = 0 } = Astro.props;

currentRegistry().registerNode({ id, x, y, w, h });
---
```

**Source:** RESEARCH.md §Ref Resolution Mechanism, VvNode child code sketch, lines 361-409.

---

### `src/components/visuals/VvWire.astro` (component, zero-output registrar)

**Analog:** `src/components/PodLifecycleAnimation.astro`

**Current wire pattern** (lines 75-84 — what we are REPLACING; VvStage will render these centrally from registry data):

```xml
<g stroke-width="3" fill="none">
  <line class="pla-line" style="--wd: 700ms;"  x1="280"  y1="410" x2="360"  y2="410" stroke="var(--brand-primary)" />
  <line class="pla-line" style="--wd: 1000ms;" x1="580"  y1="410" x2="660"  y2="210" stroke="var(--brand-primary)" />
  <line class="pla-line" style="--wd: 1300ms;" x1="580"  y1="410" x2="660"  y2="610" stroke="var(--brand-primary)" />
  <line class="pla-line" style="--wd: 1600ms;" x1="880"  y1="210" x2="960"  y2="410" stroke="var(--brand-primary)" stroke-dasharray="8 5" />
  <line class="pla-line" style="--wd: 1600ms;" x1="880"  y1="610" x2="960"  y2="410" stroke="var(--brand-primary)" stroke-dasharray="8 5" />
  <line class="pla-line" style="--wd: 1900ms;" x1="1180" y1="410" x2="1300" y2="270" stroke="var(--brand-accent)" />
  <line class="pla-line" style="--wd: 2100ms;" x1="1180" y1="410" x2="1300" y2="550" stroke="var(--brand-accent)" />
</g>
```

```css
.pla-line {
  opacity: 0;
  animation: pla-wire-in 400ms ease-out var(--wd) forwards;
}
@keyframes pla-wire-in {
  to { opacity: 0.55; }
}
```

**What to keep:** `stroke-width="3"`, `fill="none"`, `stroke-dasharray="8 5"` pattern for dashed wires, the `--wd` CSS custom property for staggered fade-in, the 400ms `pla-wire-in` keyframe fading 0 → 0.55. These all move into VvStage's `<style>` block (retargeted to `:global(.vv-wire)`), and the `<line>` becomes a `<use href="#wire-id"/>` referencing the `<defs><path id="wire-id">` that VvStage computes from registry + `_vv-geom.ts` + `_vv-path.ts`.
**What to change:** `<line x1 y1 x2 y2>` (exact coords) → `<path d="M ... L ...">` (computed from edge-point geometry). Hardcoded `stroke="var(--brand-*)"` per line → `class="vv-tone-{tone}"` that sets stroke via CSS (tone palette per D-10). `stroke-dasharray` → conditional based on `dashed` prop.

**VvWire.astro itself emits NOTHING** — only registers (per RESEARCH.md §VvWire child code sketch, line 442-446: "VvStage centralizes SVG rendering").

**Registry-write pattern** (NO analog — new):

```astro
---
import { currentRegistry } from './_vv-registry.ts';

interface Props {
  from: string;
  to: string;
  id?: string;
  curve?: number;
  via?: Array<[number, number]>;
  dashed?: boolean;
  tone?: 'teal' | 'amber' | 'k8s' | 'architecture' | 'opinion' | 'tutorial';
  delay?: number;
}
const { from, to, id = `${from}-${to}`, curve, via, dashed = false, tone = 'teal', delay = 0 } = Astro.props;

currentRegistry().registerWire({ id, from, to, curve, via, dashed, tone, delay });
---
<!-- intentionally empty: VvStage emits the path -->
```

**Source:** RESEARCH.md §VvWire child code sketch, lines 413-446.

---

### `src/components/visuals/VvPacket.astro` (component, SMIL animateMotion)

**Analog:** `src/components/PodLifecycleAnimation.astro`

**SMIL packet pattern** (lines 89-120 — copy almost verbatim):

```xml
<g class="pla-pkts">
  <!-- Teal packets -->
  <circle r="10" fill="var(--brand-primary)" filter="url(#pla-glow)" opacity="0">
    <animateMotion dur="1.4s" begin="1.2s;pkt1.end+4s" repeatCount="1" id="pkt1" path="M 280 410 L 360 410" />
    <animate attributeName="opacity" values="0;1;1;0" keyTimes="0;0.15;0.85;1" dur="1.4s" begin="1.2s;pkt1.end+4s" repeatCount="1" />
  </circle>
  <circle r="10" fill="var(--brand-primary)" filter="url(#pla-glow)" opacity="0">
    <animateMotion dur="1.4s" begin="1.5s;pkt2.end+4s" repeatCount="1" id="pkt2" path="M 580 410 L 660 210" />
    <animate attributeName="opacity" values="0;1;1;0" keyTimes="0;0.15;0.85;1" dur="1.4s" begin="1.5s;pkt2.end+4s" repeatCount="1" />
  </circle>
  <!-- ...5 more identical-shape packets... -->
  <!-- Amber packets (kubelet → pods) -->
  <circle r="11" fill="var(--brand-accent)" filter="url(#pla-glow)" opacity="0">
    <animateMotion dur="1.3s" begin="2.4s;pkt6.end+4s" repeatCount="1" id="pkt6" path="M 1180 410 L 1300 270" />
    <animate attributeName="opacity" values="0;1;1;0" keyTimes="0;0.15;0.85;1" dur="1.3s" begin="2.4s;pkt6.end+4s" repeatCount="1" />
  </circle>
</g>
```

**What to keep verbatim:**
- Outer `<circle r="..." opacity="0">` with `fill` and `filter` attrs
- Twin `<animateMotion>` + `<animate attributeName="opacity">` pair driving geometry and fade on the SAME `begin` expression
- `begin="${delay};${pktId}.end+${gap}"` chain-loop syntax — matches D-15 SMIL loop contract exactly
- `values="0;1;1;0" keyTimes="0;0.15;0.85;1"` fade curve
- `repeatCount="1"` (each cycle plays once; the `begin` chain restarts it)

**What to change:**
- `path="M 280 410 L 360 410"` (inline literal path) → `<mpath href="#wire-${wire}"/>` (shared with the visible wire, per D-07 ref-by-id + RESEARCH.md §SMIL animateMotion Patterns). Inline `path=""` still supported for the `path` prop escape hatch (D-13).
- `fill="var(--brand-primary)"` → `class="vv-tone-{tone}"` with CSS rule `.vv-tone-teal { fill: var(--brand-primary) }` etc.
- `filter="url(#pla-glow)"` → `filter="url(#glow-${registry.uid})"` (Pitfall G).
- Hardcoded `id="pkt1"` sequential numbering → `id="pkt-${registry.uid}-${randomSlug}"` to avoid collisions if multiple stages co-exist.
- `r="10"` / `r="11"` become the `r` prop (default 10, D-14).

**Packet code-sketch target** (from RESEARCH.md lines 450-511):

```astro
---
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
const { wire, path, duration, delay, r = 10, glow = true, tone = 'teal', loop = true, gap = '4s' } = Astro.props;

if (!wire && !path) throw new Error('<VvPacket> requires either `wire` or `path` prop');
if (wire && path)   throw new Error('<VvPacket> — pass `wire` OR `path`, not both');

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
  <animate attributeName="opacity" values="0;1;1;0" keyTimes="0;0.15;0.85;1"
           dur={duration} begin={beginExpr} repeatCount="1"/>
</circle>
```

---

### `src/components/visuals/_vv-registry.ts` (utility, module-level stage registry)

**Analog:** **NONE** — novel pattern for this codebase. No existing slot-collection or SSR-context pattern exists in `src/`. Nearest analog is the "module with typed exports" shape seen in `src/i18n/utils.ts` — see below.

**Module-export pattern** from `src/i18n/utils.ts` (lines 1-13 — shape to mirror):

```typescript
import en from './en.json';
import ru from './ru.json';

const translations = { en, ru } as const;

export type Locale = keyof typeof translations;
export const locales: Locale[] = ['en', 'ru'];
export const defaultLocale: Locale = 'en';

export function t(locale: Locale) {
  return translations[locale];
}
```

**What to keep:** Module-level `const` + named `export function` + named `export type` shape. No default export.
**What to change:** Domain is completely different — registry stores `NodeRecord`/`WireRecord` Maps keyed by id, plus a module-level `currentStage: Registry | undefined` with `pushStage(r)` / `popStage()` / `currentRegistry()` functions. See RESEARCH.md lines 252-354 for the exact interface.

**Required runtime assertion** (RESEARCH.md line 351, Pitfall D):

```typescript
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

---

### `src/components/visuals/_vv-geom.ts` (utility, pure TS geometry)

**Analog (module shape only):** `src/i18n/utils.ts` — same "pure-TS named exports, no runtime framework deps" pattern.

**Target structure** (RESEARCH.md §Edge-Point Geometry, lines 644-665):

```typescript
// src/components/visuals/_vv-geom.ts
export interface Rect { cx: number; cy: number; w: number; h: number; }
export interface Point { x: number; y: number; }

/** Intersection of ray from rect center outwards (toward dir) with rect border. */
function rayToRectEdge(rect: Rect, dx: number, dy: number): Point {
  if (dx === 0 && dy === 0) return { x: rect.cx, y: rect.cy };
  const halfW = rect.w / 2, halfH = rect.h / 2;
  const tX = Math.abs(dx) > 1e-9 ? halfW / Math.abs(dx) : Infinity;
  const tY = Math.abs(dy) > 1e-9 ? halfH / Math.abs(dy) : Infinity;
  const t = Math.min(tX, tY);
  return { x: rect.cx + t * dx, y: rect.cy + t * dy };
}

export function computeEdgePoints(from: Rect, to: Rect): { a: Point; b: Point } {
  const dx = to.cx - from.cx, dy = to.cy - from.cy;
  const a = rayToRectEdge(from, dx, dy);
  const b = rayToRectEdge(to, -dx, -dy);
  return { a, b };
}
```

**What to keep from i18n/utils.ts pattern:** `export interface`, `export function`, no default export, strict types on all params/returns.
**What is new:** The math itself. No geometry utility exists in the codebase today.

---

### `src/components/visuals/_vv-path.ts` (utility, SVG path builder)

**Analog (module shape only):** `src/i18n/utils.ts`.

**Target structure** (RESEARCH.md §Straight, bezier, polyline — lines 671-703):

```typescript
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
    const len = Math.sqrt(dx * dx + dy * dy) || 1;
    const perpX = -dy / len, perpY = dx / len;
    const offset = opts.curve * len * 0.5;
    const cx = mx + perpX * offset, cy = my + perpY * offset;
    return `M ${a.x} ${a.y} Q ${cx} ${cy} ${b.x} ${b.y}`;
  }

  // Case 3: straight line (default)
  return `M ${a.x} ${a.y} L ${b.x} ${b.y}`;
}
```

---

### `src/components/visuals/README.md` (docs, component-folder README)

**Analog:** **NONE** — there is no component-folder README in `src/components/` today. `CLAUDE.md` at repo root is the closest precedent.

**Tone & shape to mirror** (from `CLAUDE.md` lines 1-100 observation):
- Heavy use of markdown tables for prop/API reference (see `CLAUDE.md` § Color Tokens, § Anti-Patterns, § Site Section → Vault Source)
- Code blocks fenced as `astro` / `ts` / `html` / `bash` for copy-paste snippets
- Short prose between tables; no narrative essays
- Section headings: `##` top-level, `###` subsection, no deeper nesting
- Inline `<code>` for prop names (`curve`, `via`), code blocks for full examples

**Required sections** (per D-25, RESEARCH.md §astro-icon Integration + §SMIL animateMotion Patterns + §Reduced-motion Pattern):

1. `# Visuals primitives` — one-line purpose
2. `## Import block` — the exact 5 MDX import lines authors paste at the top of a post
3. `## Primitives API` — one `##` subsection per primitive with a props table
4. `## Tone palette` — table: tone name → CSS var → hex (teal/amber/k8s/architecture/opinion/tutorial)
5. `## Examples` — minimal "hello world" VvStage example; the 7-node PodLifecycle example; a bezier + dashed wire example
6. `## Iconify vocabulary + Slidev find+replace` — D-26 transform regex, both `sed` and Node `.replace()` forms
7. `## SMIL vs CSS offset-path` — why we use SMIL (links to Phase 9 v0.4 hotfix rationale — RESEARCH.md §SMIL deprecation scare & coordinate drift)
8. `## Reduced-motion rules` — the exact @media rule (nodes opacity 1, wires 0.55, packets hidden) per D-18
9. `## Gotchas` — (a) `<VvStage>` cannot nest, (b) icon `name={var}` unsupported — must be string literal, (c) two packets on one page need separate `<VvStage>` wrappers

---

### `playwright.config.ts` (config, test infra)

**Analog:** **NONE** — no Playwright setup exists. Greenfield infrastructure.

**Target shape** (RESEARCH.md §Test Framework, lines 886-891):

```typescript
// playwright.config.ts
import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  retries: 2,
  use: {
    baseURL: 'http://localhost:4321',
    reducedMotion: 'reduce',
  },
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:4321',
    reuseExistingServer: !process.env.CI,
    timeout: 30_000,
  },
});
```

---

### `tests/visual/pod-lifecycle-parity.spec.ts` (test, Playwright visual regression)

**Analog:** **NONE** — first Playwright test in repo.

**Target shape** (RESEARCH.md §D-19 Pixel-Parity Test, lines 909-940):

```typescript
// tests/visual/pod-lifecycle-parity.spec.ts
import { test, expect } from '@playwright/test';

test.describe('PodLifecycleAnimation refactor — pixel parity', () => {
  test('reduced-motion frozen state matches baseline', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/en/blog/2026-03-20-karpenter-right-sizing');

    const figure = page.locator('figure.pod-lifecycle, figure.vv-stage').first();
    await figure.waitFor({ state: 'visible' });
    await page.waitForTimeout(300);

    await expect(figure).toHaveScreenshot('pod-lifecycle-frozen.png', {
      maxDiffPixels: 150,
      maxDiffPixelRatio: 0.002,
      animations: 'disabled',
    });
  });
});
```

**Baseline capture order (Pitfall H):** The baseline PNG must be captured from the PRE-refactor build (current `main`) in Wave 0. It is then the immutable fixture the refactor is validated against.

---

### `tests/unit/vv-geom.test.ts` + `tests/unit/vv-path.test.ts` (tests, `node --test`)

**Analog:** **NONE** — no unit tests exist.

**Target shape** (RESEARCH.md §Unit tests for geometry, lines 1010-1024):

```typescript
// tests/unit/vv-geom.test.ts
import { test } from 'node:test';
import assert from 'node:assert';
import { computeEdgePoints } from '../../src/components/visuals/_vv-geom';

test('horizontal wire between equal rects meets at facing edges', () => {
  const from = { cx: 100, cy: 100, w: 200, h: 100 };
  const to   = { cx: 400, cy: 100, w: 200, h: 100 };
  const { a, b } = computeEdgePoints(from, to);
  assert.strictEqual(a.x, 200);
  assert.strictEqual(a.y, 100);
  assert.strictEqual(b.x, 300);
  assert.strictEqual(b.y, 100);
});
```

**Coverage matrix the planner should schedule** (from CONTEXT D-11 + D-12 edge-points):
- `_vv-geom.ts`: horizontal line (equal rects), vertical line (equal rects), diagonal (unequal widths — 220×160 vs 300×100), zero-distance (degenerate)
- `_vv-path.ts`: straight (no curve, no via) → `M ax ay L bx by`; bezier (curve 0.2) → contains `Q`; polyline (`via=[[400,200]]`) → `M ax ay L 400 200 L bx by`; `via` dominates `curve` when both set.

---

### `src/components/PodLifecycleAnimation.astro` (MODIFIED)

**What survives** (top of file, lines 11-19):

```astro
interface Props {
  caption?: string;
  title?: string;
}

const {
  title = 'Pod lifecycle · scheduler to Ready',
  caption = 'kubectl → API server → etcd · scheduler picks node · kubelet spawns pods',
} = Astro.props;
```

Everything else (lines 1-9 comment block, lines 22-125 markup, lines 127-240 `<style>`) gets rewritten to:

```astro
---
// PodLifecycleAnimation — Kubernetes pod lifecycle animation.
// After Phase 1 refactor: built on VvStage primitives from src/components/visuals/.
// Public import path unchanged (D-24); MDX consumers do not need updates.
import VvStage from './visuals/VvStage.astro';
import VvNode from './visuals/VvNode.astro';
import VvWire from './visuals/VvWire.astro';
import VvPacket from './visuals/VvPacket.astro';

interface Props {
  caption?: string;
  title?: string;
}
const {
  title = 'Pod lifecycle · scheduler to Ready',
  caption = 'kubectl → API server → etcd · scheduler picks node · kubelet spawns pods',
} = Astro.props;
---

<VvStage title={title} caption={caption}>
  <VvNode id="kubectl"   x={60}   y={330} label="kubectl"    animation="slide-x" delay={0}    tone="teal">
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="4 17 10 11 4 5"/><line x1="12" y1="19" x2="20" y2="19"/></svg>
  </VvNode>
  <VvNode id="api"       x={360}  y={330} label="API server" animation="pop"     delay={300}  tone="teal">
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 22 8.5 22 15.5 12 22 2 15.5 2 8.5"/><polygon points="12 6 18 9.5 18 14.5 12 18 6 14.5 6 9.5"/><line x1="12" y1="2" x2="12" y2="6"/><line x1="12" y1="18" x2="12" y2="22"/><line x1="2" y1="8.5" x2="6" y2="9.5"/><line x1="18" y1="9.5" x2="22" y2="8.5"/><line x1="2" y1="15.5" x2="6" y2="14.5"/><line x1="18" y1="14.5" x2="22" y2="15.5"/></svg>
  </VvNode>
  <VvNode id="etcd"      x={660}  y={130} label="etcd"       animation="drop"    delay={600}  tone="teal">
    <!-- D-09c: keep raw inline SVG for backward-compat during refactor -->
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M3 5v14a9 3 0 0 0 18 0V5"/><path d="M3 12a9 3 0 0 0 18 0"/></svg>
  </VvNode>
  <!-- scheduler, kubelet, Pod A, Pod B identically -->

  <VvWire from="kubectl" to="api"       delay={700}/>
  <VvWire from="api"     to="etcd"      delay={1000}/>
  <VvWire from="api"     to="scheduler" delay={1300}/>
  <VvWire from="etcd"    to="kubelet"   delay={1600} dashed/>
  <VvWire from="scheduler" to="kubelet" delay={1600} dashed/>
  <VvWire from="kubelet" to="podA"      delay={1900} tone="amber"/>
  <VvWire from="kubelet" to="podB"      delay={2100} tone="amber"/>

  <VvPacket wire="kubectl-api"     duration="1.4s" delay="1.2s"/>
  <VvPacket wire="api-etcd"        duration="1.4s" delay="1.5s"/>
  <VvPacket wire="api-scheduler"   duration="1.4s" delay="1.8s"/>
  <VvPacket wire="etcd-kubelet"    duration="1.5s" delay="2.1s"/>
  <VvPacket wire="scheduler-kubelet" duration="1.5s" delay="2.3s"/>
  <VvPacket wire="kubelet-podA"    duration="1.3s" delay="2.4s" r={11} tone="amber"/>
  <VvPacket wire="kubelet-podB"    duration="1.3s" delay="2.6s" r={11} tone="amber"/>
</VvStage>
```

**Coordinate conversion from current PodLifecycle** (verify during refactor — edge-point math must produce equivalent path endpoints to the existing hand-coded lines):

| Current line (source → target) | Current `x1,y1 → x2,y2` | Refactor equiv |
|--------------------------------|------------------------|----------------|
| line 77 kubectl → api          | 280,410 → 360,410      | `<VvWire from="kubectl" to="api"/>`, computed edge-points must return exactly these |
| line 78 api → etcd             | 580,410 → 660,210      | `<VvWire from="api" to="etcd"/>` |
| line 79 api → scheduler        | 580,410 → 660,610      | `<VvWire from="api" to="scheduler"/>` |
| line 80 etcd → kubelet (dashed)| 880,210 → 960,410      | `<VvWire from="etcd" to="kubelet" dashed/>` |
| line 81 scheduler → kubelet    | 880,610 → 960,410      | `<VvWire from="scheduler" to="kubelet" dashed/>` |
| line 82 kubelet → Pod A        | 1180,410 → 1300,270    | `<VvWire from="kubelet" to="podA" tone="amber"/>` |
| line 83 kubelet → Pod B        | 1180,410 → 1300,550    | `<VvWire from="kubelet" to="podB" tone="amber"/>` |

These numbers are the pixel-parity fixture — `computeEdgePoints()` must return them when the nodes' (cx, cy, w, h) are derived from the `x`/`y` + default `220×160` box.

---

### `astro.config.mjs` (MODIFIED)

**Current structure** (lines 1-26 — what survives):

```javascript
// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import sitemap from '@astrojs/sitemap';
import mdx from '@astrojs/mdx';
import { remarkReadingTime } from './remark-reading-time.mjs';

export default defineConfig({
  site: 'https://vedmich.dev',
  i18n: {
    defaultLocale: 'en',
    locales: ['en', 'ru'],
    routing: {
      prefixDefaultLocale: true,
      redirectToDefaultLocale: false,
    },
  },
  markdown: {
    remarkPlugins: [remarkReadingTime],
  },
  vite: {
    plugins: [tailwindcss()],
  },
  integrations: [mdx(), sitemap()],
});
```

**Minimal diff required:**

```javascript
import icon from 'astro-icon';            // NEW line
...
integrations: [mdx(), sitemap(), icon()], // NEW third integration
```

No further config needed — per RESEARCH.md lines 540-552, the default `include`-less config tree-shakes icons automatically. Do not add an `include: {...}` block unless dynamic names appear (Pitfall F).

---

### `package.json` (MODIFIED)

**Current shape** (lines 1-27 — what survives): all existing keys + dep values. `type: "module"`, `scripts.{dev,build,preview,astro}`, all 7 existing `dependencies`, all 4 existing `devDependencies`.

**Target diff** (additions only):

```json
{
  "scripts": {
    "dev": "astro dev",
    "build": "astro build",
    "preview": "astro preview",
    "astro": "astro",
    "test": "playwright test",
    "test:unit": "node --test tests/unit/"
  },
  "dependencies": {
    "astro-icon": "^1.1.5"
  },
  "devDependencies": {
    "@iconify-json/carbon": "^1.2.20",
    "@iconify-json/logos": "^1.2.11",
    "@iconify-json/lucide": "^1.2.105",
    "@iconify-json/ph": "^1.2.2",
    "@iconify-json/simple-icons": "^1.2.80",
    "@iconify-json/solar": "^1.2.5",
    "@iconify-json/streamline-flex": "^1.2.3",
    "@iconify-json/twemoji": "^1.2.5",
    "@playwright/test": "^1.59.1"
  }
}
```

Versions from RESEARCH.md §Standard Stack (npm-verified 2026-05-02).

---

## Shared Patterns

### 1. Astro component — `interface Props` + destructured defaults

**Source:** `src/components/Hero.astro` lines 1-10, `src/components/Podcasts.astro` lines 1-10, `src/components/PodLifecycleAnimation.astro` lines 11-19, `src/components/CodeCopyEnhancer.astro` lines 9-21, `src/components/BlogCard.astro` lines 1-11.

**Apply to:** All 4 new primitive `.astro` files.

**Canonical form:**

```astro
---
interface Props {
  required: string;
  optional?: number;
}
const { required, optional = 42 } = Astro.props;
---
```

**Rules:**
- `interface Props` (not `type`) per existing convention
- Destructured defaults in the second statement
- No runtime validation library (Zod etc.) — pure TypeScript types per RESEARCH.md §Why not runtime validation library
- Required props first, optional after

### 2. Scoped `<style>` with component-prefix class names

**Source:** `src/components/PodLifecycleAnimation.astro` lines 127-240 uses prefix `.pla-*` (PodLifecycleAnimation).

**Apply to:** Every `.astro` primitive file gets its own scoped `<style>` block. Prefix convention:
- `.vv-stage-*` → VvStage.astro
- `.vv-node-*` → VvNode.astro (but children target via `:global()` due to scope leak, Pitfall A)
- `.vv-wire-*` → VvWire emits no markup, but VvStage hosts `.vv-wire` styles
- `.vv-packet-*` → same, hosted in VvStage
- `.vv-tone-{name}` → cross-primitive tone classes, declared in VvStage's `:global` block

**Scoped-style caveat** (RESEARCH.md §Pitfall A): VvStage's scoped style does NOT reach VvNode/VvWire/VvPacket children automatically. Use `:global(.vv-node)` explicit global selectors inside VvStage `<style>`. Do NOT use `<style is:global>` — it leaks site-wide.

### 3. NO hardcoded hex — always `var(--brand-*)` / `var(--topic-*)`

**Source:** CLAUDE.md §Deep Signal Anti-Patterns + §Color Tokens. `PodLifecycleAnimation.astro` line 77 shows correct pattern: `stroke="var(--brand-primary)"` not `stroke="#14B8A6"`.

**Apply to:** All primitives.

**Tone palette (D-10 locked)** — maps to existing CSS vars in `src/styles/design-tokens.css`:

| Tone | CSS Variable | Current Hex (NEVER hardcode) | Source line |
|------|--------------|------------------------------|-------------|
| `teal` (default) | `var(--brand-primary)` | `#14B8A6` | `design-tokens.css` (brand block) |
| `amber` | `var(--brand-accent)` | `#F59E0B` | `design-tokens.css` (brand block) |
| `k8s` | `var(--topic-k8s)` | `#3B82F6` | `design-tokens.css` line 114 |
| `architecture` | `var(--topic-architecture)` | `#818CF8` | `design-tokens.css` line 115 |
| `opinion` | `var(--topic-opinion)` | `#F43F5E` | `design-tokens.css` line 116 |
| `tutorial` | `var(--topic-tutorial)` | `#22C55E` | `design-tokens.css` line 117 |

Status colors (`--success`, `--warning`, `--error`, `--info`) are deliberately EXCLUDED from tones per D-10. Also never use: `#06B6D4` / `#22D3EE` (deprecated cyan), `#7C3AED` / `#10B981` (DKT brand), `#FF9900` / `#232F3E` (AWS brand). Anti-patterns per CLAUDE.md.

**CSS custom-property pattern for tone application** (RESEARCH.md §TypeScript Prop Types + VvNode code sketch):

```css
[data-tone="teal"]         { --tone: var(--brand-primary); }
[data-tone="amber"]        { --tone: var(--brand-accent); }
[data-tone="k8s"]          { --tone: var(--topic-k8s); }
[data-tone="architecture"] { --tone: var(--topic-architecture); }
[data-tone="opinion"]      { --tone: var(--topic-opinion); }
[data-tone="tutorial"]     { --tone: var(--topic-tutorial); }

.vv-node { border-left: 4px solid var(--tone); }
.vv-wire { stroke: var(--tone); }
.vv-packet { fill: var(--tone); }
```

### 4. Zero runtime JS (SMIL + CSS only)

**Source:** CLAUDE.md §Key Design Decisions — "Zero JS by default — Astro islands. Only JS: scroll animations (IntersectionObserver) + mobile menu toggle." PodLifecycleAnimation.astro is 100% SMIL + CSS, no `<script>` tag.

**Apply to:** All 4 primitives. No `<script>` tag. No client hydration directives (`client:load` etc.). Animation via SMIL `<animateMotion>` and CSS `@keyframes` only.

**Exception acknowledged:** `CodeCopyEnhancer.astro` uses `<script is:inline>` — but it is a separate optional component, not a primitive. Primitives are strictly zero-JS.

### 5. SMIL over CSS `offset-path`

**Source:** RESEARCH.md §No CSS offset-path anywhere + header comment of `PodLifecycleAnimation.astro` line 86 ("SVG user space — no offset-path scaling bug"). This is the Phase 9 (v0.4) hotfix lesson.

**Apply to:** Every packet animation. Never use CSS `offset-path`. Always SMIL `<animateMotion>` with either `<mpath href="#wire-id"/>` or inline `path="..."`. D-04 coordinate system + SMIL together eliminate the two-coordinate-space class of bugs.

### 6. Build-time SSR slot composition (ref resolution via registry)

**Source:** **NEW pattern for this codebase.** Closest precedent in wider ecosystem is Vue's `provide/inject`; RESEARCH.md §Ref Resolution Mechanism rejects Astro's `Astro.slots.render('name', [arg])` function-children API on ergonomic grounds.

**Apply to:** VvStage ↔ VvNode ↔ VvWire ↔ VvPacket coupling. Module-level `currentStage: Registry | undefined` in `_vv-registry.ts` is set via `pushStage()` at VvStage frontmatter-start, read via `currentRegistry()` inside every child, cleared via `popStage()` before VvStage emits its SVG. Runtime assertion forbids nesting (Pitfall D).

### 7. Reduced-motion single-location @media rule

**Source:** PodLifecycleAnimation.astro lines 229-239 (current pattern — repeated per-component would violate DRY, so consolidate into VvStage only).

**Apply to:** VvStage.astro `<style>` only — uses `:global(.vv-node)`, `:global(.vv-wire)`, `:global(.vv-packet)` selectors to reach children. Other primitive files do NOT re-declare @media rules for reduced motion. Per D-18, behavior is NOT configurable.

### 8. `.not-prose` escape class for MDX embeds

**Source:** `PodLifecycleAnimation.astro` line 22 — `<figure class="pod-lifecycle not-prose">`. Without `.not-prose`, the `@tailwindcss/typography` plugin inside `.prose` (blog post container) would override figure/caption styling.

**Apply to:** VvStage's outer `<figure>` — `class="vv-stage not-prose"`.

---

## New Patterns Introduced (no prior analog)

Phase 1 introduces four things the codebase has never had before. Planner must call these out explicitly in plan actions.

### 1. Module-level Stage registry (`_vv-registry.ts`)

Novel SSR state pattern. Safe because Astro 5 SSR is single-threaded per-request (RESEARCH.md assumption A1). Protected by runtime assertion against nesting (Pitfall D). Future Astro 6+ parallel-SSR scenario would require migrating to `AsyncLocalStorage`.

### 2. Rectangle closest-edge geometry utility (`_vv-geom.ts`)

Novel algorithm for this codebase. O(1), handles unequal node sizes. Verified by hand against PodLifecycle coordinates (RESEARCH.md line 761).

### 3. Component-folder README (`src/components/visuals/README.md`)

First component-folder README in `src/components/`. Sets precedent — future primitive folders (e.g., `src/components/embeds/` in Phase 5) may follow.

### 4. Test infrastructure (`playwright.config.ts`, `tests/visual/`, `tests/unit/`)

First tests in repo. Two runners: `@playwright/test` for visual regression, `node --test` for pure-TS unit tests. Two new npm scripts (`test`, `test:unit`). `.gitignore` must add `test-results/` + `playwright-report/` (RESEARCH.md line 1005).

---

## Metadata

**Analog search scope:**
- `src/components/*.astro` (15 files scanned; 5 closest: PodLifecycleAnimation, Hero, Podcasts, CodeCopyEnhancer, BlogCard)
- `src/i18n/utils.ts` (pure-TS module shape)
- `src/styles/design-tokens.css` (tone CSS vars)
- `astro.config.mjs`, `package.json` (config files)
- `/Users/viktor/Documents/GitHub/vedmichv/slidev-theme-vv/components/VvArchNode.vue` + `VvArchGrid.vue` (API-shape mirrors only — no code copy, Vue != Astro)
- `/Users/viktor/Documents/GitHub/vedmichv/slidev-theme-vv/package.json` (Iconify version reference)

**Files scanned:** 15 `.astro` components + 3 Slidev Vue files + 4 config/style files = 22

**Pattern extraction date:** 2026-05-02
**Valid until:** phase 1 is shipped. Re-map if external analogs (Slidev theme) change significantly.
