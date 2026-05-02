# Visuals primitives

Reusable Astro primitives for inline animated SVG diagrams in MDX blog posts. Ported from `slidev-theme-vv` Vue components with coordinate copy-paste parity. Zero runtime JS — build-time SSR + SMIL `<animateMotion>` for packet animations.

**Ship status:** Phase 1 (milestone v1.0). Consumers: `src/components/PodLifecycleAnimation.astro`. Future consumers: companion posts (Phase 6).

---

## Import block

Copy-paste these 5 lines at the top of any MDX post:

```astro
import VvStage from '../../../components/visuals/VvStage.astro';
import VvNode from '../../../components/visuals/VvNode.astro';
import VvWire from '../../../components/visuals/VvWire.astro';
import VvPacket from '../../../components/visuals/VvPacket.astro';
import { Icon } from 'astro-icon/components';
```

`astro-icon` is wired in `astro.config.mjs` and resolves icon names from 8 collections:
- `carbon:*` — Carbon Design System
- `logos:*` — Brand logos (AWS, Google Cloud, Docker, Kubernetes, etc.)
- `lucide:*` — Lucide icon set
- `ph:*` — Phosphor icons
- `simple-icons:*` — Simple Icons (brand marks)
- `solar:*` — Solar icons
- `streamline-flex:*` — Streamline icons
- `twemoji:*` — Twitter emoji

**Warning:** The icon `name` prop must be a **static string literal**. Dynamic `name={variable}` breaks tree-shaking at build time.

---

## Primitives API

### VvStage

The diagram container. All Vv\* children must be inside a `<VvStage>` — nested stages throw an error.

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `title` | `string?` | none | Optional diagram title (rendered above canvas) |
| `caption` | `string?` | none | Optional caption (rendered below canvas, monospace) |
| `viewBox` | `string?` | `"0 0 1800 820"` | SVG coordinate system. Format: `"minX minY width height"`. Override for custom aspect ratios. |

**Coordinate system:** SVG user-space, default 1800×820. Aspect-ratio computed from `viewBox`, so the canvas scales responsively while maintaining proportions.

### VvNode

Positioned node with icon + label. Register-only component — emits no markup itself. VvStage reads the registry and renders all nodes at the end.

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `id` | `string` | **required** | Unique node identifier. Used by VvWire's `from`/`to` props. |
| `x` | `number` | **required** | X coordinate in user-space (left edge of the node rect) |
| `y` | `number` | **required** | Y coordinate in user-space (top edge of the node rect) |
| `w` | `number?` | `220` | Node width in user-space units |
| `h` | `number?` | `160` | Node height in user-space units |
| `label` | `string` | **required** | Text label displayed below the icon |
| `tone` | `VvTone?` | `'teal'` | Color tone (controls border-left only; see Tone palette below) |
| `animation` | `'slide-x' \| 'pop' \| 'drop'?` | `'pop'` | Entry animation style |
| `delay` | `number?` | `0` | Animation delay in milliseconds |

**Default slot:** Accepts `<Icon name="..."/>`, inline `<svg>...</svg>`, or any renderable content. Tone controls **only** the node's left border color — icon colors are unaffected (multicolor logos keep their native brand colors).

### VvWire

Connects two nodes. Automatically computes the path from center-to-center with ray-to-rect-border intersection for edge points.

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `from` | `string` | **required** | Source node id |
| `to` | `string` | **required** | Target node id |
| `id` | `string?` | `"${from}-${to}"` | Wire identifier (auto-generated if omitted) |
| `curve` | `number?` | none | Bezier arc strength (0 = straight, 0.3 = gentle arc, 1 = strong arc; negative values arc the opposite direction) |
| `via` | `[number, number][]?` | none | Polyline waypoints `[[x1, y1], [x2, y2], ...]`. Overrides `curve` if present. |
| `dashed` | `boolean?` | `false` | Render as dashed line (8px dash, 5px gap) |
| `tone` | `VvTone?` | `'teal'` | Color tone |
| `delay` | `number?` | `0` | Fade-in animation delay in milliseconds |
| `fromPoint` | `[number, number]?` | none | **Escape hatch:** Override auto-computed start point `[x, y]` |
| `toPoint` | `[number, number]?` | none | **Escape hatch:** Override auto-computed end point `[x, y]` |

**Default geometry:** Ray from center-to-center of the two nodes, clipped to rect borders. Prefer this default for new diagrams. Use `fromPoint`/`toPoint` only when porting slides with pixel-exact midpoint-based endpoints from Slidev.

**via dominates curve:** If `via` is set, `curve` is ignored.

### VvPacket

Animated circle traveling along a wire path via SMIL `<animateMotion>`.

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `wire` | `string?` | none | Wire id (packet follows this wire's path). **Exactly one** of `wire` or `path` required. |
| `path` | `string?` | none | SVG path `d` string (packet follows this explicit path). **Exactly one** of `wire` or `path` required. |
| `duration` | `string` | **required** | SMIL time value (e.g., `"1.4s"`, `"200ms"`) |
| `delay` | `string` | **required** | SMIL time value (e.g., `"1.2s"`) |
| `r` | `number?` | `10` | Circle radius |
| `glow` | `boolean?` | `true` | Apply Gaussian blur glow filter |
| `tone` | `VvTone?` | `'teal'` | Fill color tone |
| `loop` | `boolean?` | `true` | Repeat animation after `gap` delay |
| `gap` | `string?` | `"4s"` | Loop gap (SMIL time value). Only used if `loop=true`. |

**Loop formula:** When `loop=true`, the SMIL `begin` expression becomes `"${delay};${packetId}.end+${gap}"`, creating an infinite chained loop.

**Reduced-motion:** Packets are hidden entirely (`display: none`) when `prefers-reduced-motion: reduce` is active.

---

## Tone palette

| Tone | CSS variable | Reference hex | Typical use |
|------|--------------|---------------|-------------|
| `teal` (default) | `--brand-primary` | `#14B8A6` | Brand primary, most content |
| `amber` | `--brand-accent` | `#F59E0B` | Highlighted / final-step nodes, accent wires |
| `k8s` | `--topic-k8s` | `#3B82F6` | Kubernetes-specific diagrams |
| `architecture` | `--topic-architecture` | `#818CF8` | System design / architecture posts |
| `opinion` | `--topic-opinion` | `#F43F5E` | Editorial / opinion pieces |
| `tutorial` | `--topic-tutorial` | `#22C55E` | Tutorial walkthroughs |

**Status colors excluded:** `--success`, `--warning`, `--error`, `--info` are reserved for UI status chips only. Do not use them for diagram tones.

---

## Examples

### Hello world (2 nodes, 1 wire, 1 packet)

```astro
<VvStage title="Client → API Gateway">
  <VvNode id="laptop" x={100} y={330} label="Laptop">
    <Icon name="carbon:laptop" />
  </VvNode>
  
  <VvNode id="gateway" x={500} y={330} label="API Gateway">
    <Icon name="logos:aws-api-gateway" />
  </VvNode>
  
  <VvWire from="laptop" to="gateway" />
  <VvPacket wire="laptop-gateway" duration="1.2s" delay="0.5s" />
</VvStage>
```

### Bezier curves + dashed wires

```astro
<VvStage>
  <VvNode id="a" x={100} y={300} label="Node A" />
  <VvNode id="b" x={500} y={300} label="Node B" />
  <VvNode id="c" x={900} y={300} label="Node C" />
  
  {/* Gentle arc upward */}
  <VvWire from="a" to="b" curve={0.3} />
  
  {/* Gentle arc downward */}
  <VvWire from="b" to="c" curve={-0.3} dashed />
</VvStage>
```

### Polyline waypoints

```astro
<VvStage>
  <VvNode id="start" x={100} y={100} label="Start" />
  <VvNode id="end" x={800} y={600} label="End" />
  
  {/* Wire with 2 intermediate waypoints */}
  <VvWire from="start" to="end" via={[[500, 300], [700, 400]]} />
</VvStage>
```

### Full example (7 nodes / 7 wires / 7 packets)

See `src/components/PodLifecycleAnimation.astro` — the refactored Pod lifecycle diagram (kubectl → API server → etcd → scheduler → kubelet → pods) is the canonical reference implementation.

---

## Iconify vocabulary + Slidev find+replace

**Slidev syntax:** `<logos-aws-lambda />` (unplugin-icons)  
**vedmich.dev syntax:** `<Icon name="logos:aws-lambda" />` (astro-icon)

Both resolve to identical SVG from `@iconify-json/logos`, but the import syntax differs. When porting slides, use this transform:

### Node regex (JavaScript)

```js
str.replace(
  /<(logos|carbon|lucide|ph|solar|simple-icons|streamline-flex|twemoji)-([a-z0-9-]+)\b[^>]*\/>/g,
  '<Icon name="$1:$2"/>',
);
```

### macOS BSD sed

```bash
sed -E 's/<(logos|carbon|lucide|ph|solar|simple-icons|streamline-flex|twemoji)-([a-z0-9-]+)[^>]*\/>/<Icon name="\1:\2"\/>/g' input.md > output.md
```

**Icon sizing:** Icons inside VvNode scale via `clamp(22px, 3.2vw, 40px)` by default (responsive). Override by wrapping in a `<span style="font-size: 48px;">` if larger icons are needed.

---

## SMIL vs CSS offset-path

**Rule:** Always use SMIL `<animateMotion>`. **Never** use CSS `offset-path`.

**Why:** Packets must share the same coordinate space as wires. SVG `<animateMotion>` + `<mpath href="#wire-...">` keeps them aligned when the responsive container resizes. CSS `offset-path` uses CSS box coordinates, which drift from SVG `viewBox` coordinates at non-1:1 aspect ratios.

This was the root cause of the Phase 9 (v0.4) hotfix — packets appeared 200-300px off-path on mobile widths because CSS `offset-path` computed positions in a different coordinate system than the SVG wires. The fix was to revert to SMIL.

**SMIL deprecation scare debunked:** SMIL `<animateMotion>`, `<mpath>`, and chained `begin="a;b.end+c"` are all W3C-standard and baseline widely available across browsers since January 2020. Chrome's brief deprecation warning (2016) was reversed in 2017. SMIL is stable and safe to use.

---

## Reduced-motion rules

When `prefers-reduced-motion: reduce` is active (WCAG 2.1 Level AA compliance):

1. **Nodes:** Opacity set to `1` immediately, no animation, no transform.
2. **Wires:** Opacity set to `0.55` immediately, no fade-in animation.
3. **Packets:** Hidden entirely via `display: none`.

**Not configurable.** This is the baseline accessibility behavior per D-18.

**Testing:**
- **macOS:** System Settings → Accessibility → Display → Reduce motion
- **Playwright:** `page.emulateMedia({ reducedMotion: 'reduce' })`

---

## Gotchas

1. **No VvStage nesting.** `<VvStage>` cannot be nested inside another `<VvStage>`. The registry uses a module-level singleton and throws immediately if a second stage is pushed before the first pops. If you need multiple diagrams on one page, use separate top-level `<VvStage>` wrappers for each.

2. **Icon names must be string literals.** `<Icon name="logos:aws-lambda" />` works. `<Icon name={myVariable} />` breaks tree-shaking at build time and throws a runtime error. astro-icon requires static analysis to bundle only the icons you use.

3. **fromPoint/toPoint is an escape hatch.** Prefer the default auto edge-points (ray-from-center-to-rect-border). Only use `fromPoint`/`toPoint` when porting slides that demand pixel-exact midpoint-based endpoints for visual parity.

4. **VvPacket requires exactly ONE of wire or path.** Setting both throws. Omitting both throws.

5. **Node id uniqueness.** Duplicate `id` values log a warning and overwrite the previous registration. The last node with a given `id` wins.

6. **Tailwind 4 `@theme` does not reach SVG attributes.** Inside inline `<svg>` elements (in VvNode's default slot), use `stroke="var(--brand-primary)"` literally. Tailwind utilities like `stroke-brand-primary` do not apply to inline SVG.

7. **`.not-prose` escape.** VvStage automatically wraps itself in `.not-prose` to prevent `@tailwindcss/typography` overrides inside `.prose` blog containers. If you place a VvStage outside a blog post (e.g., in a standalone page), the `.not-prose` is harmless.

---

## Further reading

- **PodLifecycleAnimation.astro** — canonical 7-node example with all features (slide-x, pop, drop animations; dashed wires; fromPoint/toPoint overrides; teal + amber tones; looping packets)
- **_vv-registry.ts** — VvTone + VvNodeAnimation type unions; Registry interface; SSR singleton pattern
- **_vv-geom.ts** — Ray-to-rect intersection math for auto edge-points
- **_vv-path.ts** — Wire path computation (bezier curves, polyline waypoints)
- **01-RESEARCH.md** — Phase 1 research (SMIL patterns, astro-icon integration, reduced-motion, pitfalls)
- **CLAUDE.md § Deep Signal** — Brand design system (color tokens, typography, spacing, motion)
