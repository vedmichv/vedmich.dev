# Phase 1: Rich Media Primitives - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-05-02
**Phase:** 01-rich-media-primitives
**Areas discussed:** Embedding approach, Scope boundaries, Coordinate system, Reference model, VvNode API, VvStage API, Wire types, Packet palette, Packet variations, Animation timing, Loop behavior, Reduced-motion, Validation criteria, Icon library (late add), Icon tone interaction (late add)

---

## Initial Framing — User Asked "What Are We Actually Doing?"

User paused the API deep-dive and asked for a higher-level explanation of what the primitives solve and whether slides from `vv-slidev` could be embedded directly ("typa kak otdel'nom okne"). Claude presented three paths: (A) embed the whole slide (iframe / static export / Lottie), (B) primitives + rewrite in MDX, (C) preview + modal/lightbox link to `/slides/`.

## Embedding Approach

| Option | Description | Selected |
|--------|-------------|----------|
| B: Primitives + rewrite | VvStage/VvNode/VvWire/VvPacket in MDX. SMIL, zero JS, Deep Signal tokens. <10 min/slide target. | |
| A1: iframe live Slidev slide | After Phase 5, embed /slides/<slug>/ via iframe. Heavy (~400 KB JS), breaks SEO, separate scroll context. | |
| C: Preview + modal link to /slides/ | Static preview in post, click opens lightbox with live slide. Requires Phase 5. | |
| B+C hybrid | B for inline animations, C for optional open-in-modal. Modal adds ~50 LOC after Phase 5. | ✓ |

**User's choice:** B+C hybrid — but ONLY the B half (primitives) stays in Phase 1. C half (modal) recorded as deferred to Phase 5.

**Notes:** User wanted the ability to take ONE slide from a deck and drop it into a post — not embed an entire deck. This reshaped the discussion: primitives handle animated slides inline, modal (Phase 5) handles full-deck reference cases, static export (Phase 4) handles non-animated arch diagrams.

---

## Scope Boundaries (Phase 1 vs deferred)

| Option | Description | Selected |
|--------|-------------|----------|
| Only primitives | Phase 1 = VvStage/VvNode/VvWire/VvPacket + refactor. Static export → Phase 4, modal → Phase 5. | ✓ |
| Primitives + static export | Add `slidev-slide-to-svg.mjs` to Phase 1. +2-3h. | |
| Primitives + modal | Needs Phase 5 routes as prerequisite. | |
| Full spectrum | Everything in Phase 1. Blows scope to 12-15h. | |

**User's choice:** Only primitives — but record the deferred pieces in Phases 4/5 so they don't get lost.

**Notes:** "давай пойдем по примитивам пока НО хорошо запишем в фазы 4 и 5 что надобудет сделать"

---

## Coordinate System

| Option | Description | Selected |
|--------|-------------|----------|
| SVG user-space (1800×820) | One coordinate system for everything. Copy numbers 1:1 from Slidev slides. | ✓ |
| Percent units (like current PodLifecycle) | Nodes in %, wires/packets in SVG space. Two systems, manual conversion. | |
| Grid cells (16×9 like Slidev VvArchGrid) | Semantic for arch slides, bad for pixel-accurate layouts. | |

**User's choice:** SVG user-space 1800×820 — recommended option.

---

## Reference Model (Wire↔Node, Packet↔Wire)

| Option | Description | Selected |
|--------|-------------|----------|
| Refs by id | `from="kubectl" to="api"`, `wire="kubectl-api"`. Component looks up coords. | ✓ |
| Explicit coordinates | `x1/y1/x2/y2`, `path="M x y L x y"` in every element. Verbose, refactor-hostile. | |
| Hybrid (refs OR coords) | Both paths supported. More tests, more mental overhead. | |

**User's choice:** Refs by id — recommended option.

---

## VvNode API

| Option | Description | Selected |
|--------|-------------|----------|
| label prop + default slot + tone | Mirrors Slidev VvArchNode. `<VvNode label="…" tone="teal"><svg>…</svg></VvNode>` | ✓ |
| icon="kubectl|api|…" registry | Closed set. Easy to use, hard to extend, viewBox bugs. | |
| Named slots (icon + label) | Rich markup in labels but verbose MDX. | |

**User's choice:** label prop + default slot + tone — recommended.

---

## Wire Shapes

| Option | Description | Selected |
|--------|-------------|----------|
| Straight + dashed (MVP) | Covers current PodLifecycle. Tight scope. | |
| Straight + bezier curves + dashed | Adds mesh/network slide coverage. +1-2h. | |
| Straight + polyline waypoints + curves + dashed | Full spectrum. +3-4h. | ✓ |

**User's choice:** Full spectrum (straight + polyline waypoints + curves + dashed).

---

## Packet Variations

User chose ALL options in multi-select:

| Option | Selected |
|--------|----------|
| tone=teal/amber (brand defaults) | ✓ |
| Configurable radius and glow | ✓ |
| duration / delay props | ✓ |
| loop / pulse + repeat="indefinite" | ✓ |

**User's note:** "Цвета надо взять все те что есть у нас в палитре! У нас же там палитра намного богаче! Посмотри плиз что там есть это viktor vedmich brand скиле есть и в целом по нашему сайту есть"

Claude then inspected `src/styles/design-tokens.css` and presented 4 tone-palette sizes.

---

## Tone Palette

| Option | Description | Selected |
|--------|-------------|----------|
| Brand only (teal, amber) | 2 tones. Rejected as too narrow. | |
| Brand + topic (6 tones) | teal, amber, k8s, architecture, opinion, tutorial. Maps to existing CSS vars. | ✓ |
| Brand + topic + status (10 tones) | + success/warning/error/info. Status colors are reserved for UI chips per tokens comment. | |
| Brand + gradient fills | SVG gradients + SMIL have nuances (fill="url(#grad)"). Over-scope for Phase 1. | |

**User's choice:** Brand + topic (6 tones).

---

## Timing / Choreography

| Option | Description | Selected |
|--------|-------------|----------|
| Explicit delays (like current PodLifecycle) | Every element has explicit delay/duration. No magic. | ✓ |
| Auto-sequence + override | VvStage infers delays from DOM order. Author overrides per-element. | |
| Named scenes (scene="1", scene="2") | Semantic grouping for multi-phase animations. | |
| Auto-sequence + scene override | Both worlds. +2h. Two API surfaces. | |

**User's choice:** Explicit delays — matches today's mental model.

---

## Loop Behavior

| Option | Description | Selected |
|--------|-------------|----------|
| loop prop default true + gap="4s" | Equivalent to today's `begin="…;pkt.end+4s"` SMIL pattern. | ✓ |
| One-shot only | Remove loop. Visual regression from current PodLifecycle. | |
| Flexible (loop/one-shot/scroll-trigger) | Scroll trigger adds JS. +2h. | |

**User's choice:** loop prop default true + gap prop — recommended.

---

## Reduced-Motion Behavior

| Option | Description | Selected |
|--------|-------------|----------|
| Final state, packets hidden | Nodes opacity 1, wires 0.55, packets display:none. WCAG-compliant. | ✓ |
| Frozen packets at wire start | Packets visible but stationary. Looks odd — packets are motion by design. | |
| Configurable via prop | Over-engineering for Phase 1. A11y practice = one correct behavior. | |

**User's choice:** Final state without packets — matches current PodLifecycle exactly.

---

## Validation Success Criteria

User chose ALL options in multi-select:

| Option | Selected |
|--------|----------|
| Visual parity: Playwright screenshot diff on /blog/karpenter-right-sizing | ✓ |
| LOC metric: 241 → target ≤100 | ✓ |
| Time-to-port metric: port a Slidev slide, record elapsed (Phase 7 trigger) | ✓ |
| npm run build passes + live site renders | ✓ |

**All four validation criteria locked in.**

---

## Icon Library (raised by user after initial API discussion was "done")

**User question:** "как в slidev-theme-vv мы используем иконки… надобы их больше использвать также при рисовании схема такое можем как-то добавить?? Копируем иконки просто в наш сайт вот что я думал сделать"

Claude inspected `slidev-theme-vv/package.json` and found 8 Iconify collections (carbon, logos, lucide, ph, simple-icons, solar, streamline-flex, twemoji). Presented 4 integration options.

| Option | Description | Selected |
|--------|-------------|----------|
| astro-icon + 8 Iconify collections | Match Slidev exactly. `<Icon name="logos:aws-lambda" />`. Build-time tree-shake, zero runtime JS. +~30 MB dev deps. | ✓ |
| astro-icon + currentColor tone-awareness | Re-color logos. BUT breaks multi-color AWS logos. | |
| public/icons/*.svg manual copy via better-icons | Zero deps but no find+replace shortcut from Slidev, `<img>` prevents a11y patterns. | |
| Defer to Phase 6 | Keep Phase 1 scope tight; raw SVG copy only. Slows first slide port. | |

**User's choice:** astro-icon + 8 Iconify collections — the "closest to Slidev authoring experience" path.

---

## Icon Tone Interaction

| Option | Description | Selected |
|--------|-------------|----------|
| tone=border only, icon keeps native colors | logos-* multicolor stay multicolor, carbon-* monochrome stay default. Mirrors Slidev VvArchNode. | ✓ |
| tone recolors monochrome icons, logos stay native | Requires detection by prefix. Complexity for marginal gain. | |
| Explicit iconColor="tone\|native\|custom" prop | Author choice per node. More MDX boilerplate. | |

**User's choice:** tone=border only. Zero-config behavior identical to Slidev.

**Added decisions to CONTEXT.md:** D-09, D-09b, D-09c, D-10b, D-26, D-27. D-09 replaces original "raw inline SVG only" position.

---

## Claude's Discretion

- Ref-resolution mechanism (slots + context, SSR registry, `Astro.slots.render()`) — researcher picks the cleanest Astro 5 pattern.
- Edge-point geometry (rect-to-rect closest-edge algorithm) for wires connecting to node borders — planner picks during research.
- TypeScript types structure (required/optional, union literal types) — planner's call.
- Minor prop-name polish (`gap` vs `interval`, `glow` vs `halo`) — subject to research if better names emerge.

---

## Deferred Ideas

### To Phase 4 (Excalidraw Pipeline)
- `scripts/slidev-slide-to-svg.mjs` mini-script — static slide export for non-animated arch diagrams. Captured for Phase 4 discuss to pick up.

### To Phase 5 (Slidev Integration)
- `<SlideModal slug=… slide=…>` lightbox component — live slide in modal overlay. Requires `/slides/<slug>/` routes from Phase 5. Captured for Phase 5 discuss to add to deliverables (~50 LOC + i18n + Esc).

### Rejected / Not in v1.0
- Scroll-triggered playback — considered in timing discussion, rejected.
- Interactive Excalidraw embedding — out of v1.0 per REQUIREMENTS.md.
- Named-scene timing API — rejected in favor of explicit delays.
- Icon registry — rejected to keep primitives open.
</content>
</invoke>