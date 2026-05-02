---
phase: 01-rich-media-primitives
plan: 04
subsystem: vedmich.dev visual primitives
status: complete
completed_date: 2026-05-02
duration_minutes: 7
tags:
  - astro
  - svg
  - smil
  - register-only-architecture
dependency_graph:
  requires:
    - 01-01-PLAN (Phase primitives base)
    - 01-02-PLAN (Geometry + Path utilities)
    - 01-03-PLAN (VvStage base)
  provides:
    - VvNode register-only primitive
    - VvWire register-only primitive
    - VvPacket register-only primitive
    - Registry with PacketRecord + enriched NodeRecord
    - VvStage node/packet rendering from registry
  affects:
    - PodLifecycleAnimation refactor (Plan 05)
tech_stack:
  added:
    - VvNode.astro (register-only node primitive)
    - VvWire.astro (register-only wire primitive)
    - VvPacket.astro (register-only packet primitive)
  patterns:
    - Register-only children (zero visible output)
    - Centralized emission in VvStage (HTML nodes + SVG packets)
    - Per-stage unique packet IDs (`pkt-{uid}-{random}`)
    - SMIL loop via `begin="{delay};{id}.end+{gap}"`
    - Astro.slots.render('default') → iconHtml string capture
key_files:
  created:
    - src/components/visuals/VvNode.astro (57 LOC)
    - src/components/visuals/VvWire.astro (37 LOC)
    - src/components/visuals/VvPacket.astro (53 LOC)
  modified:
    - src/components/visuals/_vv-registry.ts (137 LOC, was 103)
    - src/components/visuals/VvStage.astro (350 LOC, was 224)
    - tests/unit/vv-registry.test.ts (115 LOC, 10 tests total)
decisions:
  - decision: VvNode/VvWire/VvPacket emit zero markup — VvStage composes everything
    rationale: Eliminates div-inside-SVG anti-pattern; centralizes coordinate-space logic
    alternatives: Let each child emit its own markup (rejected — two-coordinate-space bug from Phase 9)
  - decision: VvPacket computes unique id as `pkt-{registry.uid}-{random6}`
    rationale: Prevents SMIL id collisions across multiple VvStage instances on same page
    alternatives: User-provided id prop (rejected — high collision risk)
  - decision: VvNode captures icon slot via `Astro.slots.render('default')` → iconHtml string
    rationale: Allows VvStage to inject icon HTML into node div via `set:html`
    alternatives: Pass icon as prop (rejected — limits flexibility, no multicolor Iconify logos)
metrics:
  tasks_completed: 3
  commits: 3
  files_created: 3
  files_modified: 3
  loc_added: 530
  test_count: 20
  build_pages: 31
  build_time_ms: 1060
---

# Phase 01 Plan 04: Registry Export API Summary

**One-liner:** VvNode, VvWire, VvPacket register-only primitives + VvStage registry-driven rendering (nodes as HTML divs, packets as SVG circles with SMIL)

## What Was Built

Shipped the three child primitives (VvNode, VvWire, VvPacket) as **register-only components** — each writes configuration into the active VvStage registry and emits NO visible markup. VvStage reads the complete registry after slot-render and composes the final output: HTML node divs (positioned via percent left/top) in `.vv-stage-canvas` and SVG packet circles (with `<animateMotion>` + `<mpath>`) inside `<g class="vv-packets">`. This architecture eliminates the "HTML div nested inside SVG" anti-pattern and centralizes emission in one place.

## Implementation Details

### Task 1: Registry Extension (TDD RED/GREEN)

**RED phase:**
- Added 3 new tests (registerPacket retrieval, enriched NodeRecord, packets isolation)
- Updated 7 existing tests to pass full NodeRecord shape (label/tone/animation/delay/iconHtml)
- Tests initially failed with "registerPacket is not a function" (expected RED state)

**GREEN phase:**
- Extended `_vv-registry.ts` with `VvTone` (6 values) and `VvNodeAnimation` (3 values) unions
- Enriched `NodeRecord` with `label: string`, `tone: VvTone`, `animation: VvNodeAnimation`, `delay: number`, `iconHtml: string`
- Added `PacketRecord` interface (wire/path XOR, duration, delay, r, glow, tone, loop, gap)
- Extended `Registry` with `packets: Map<string, PacketRecord>`, `registerPacket`, `getPacket`
- Implemented `registerPacket` with duplicate-id console.warn (same pattern as registerNode/registerWire)
- All 20 tests passed (10 registry + 5 geom + 5 path)

**File:** `_vv-registry.ts` grew from 103 LOC to 137 LOC (+34 LOC)

### Task 2: Register-Only Primitives

**VvNode.astro (57 LOC):**
- Props: `id, x, y, w=220, h=160, label, tone=teal, animation=pop, delay=0`
- Captures default slot via `Astro.slots.render('default')` → iconHtml string
- Calls `currentRegistry().registerNode({ id, x, y, w, h, label, tone, animation, delay, iconHtml })`
- Emits NO markup (HTML comment only)

**VvWire.astro (37 LOC):**
- Props: `from, to, id=\`${from}-${to}\`, curve?, via?, dashed=false, tone=teal, delay=0`
- Calls `currentRegistry().registerWire({ id, from, to, curve, via, dashed, tone, delay })`
- Emits NO markup

**VvPacket.astro (53 LOC):**
- Props: `wire?, path?, duration (required), delay (required), r=10, glow=true, tone=teal, loop=true, gap=4s`
- Guards: throws if `!wire && !path` OR `wire && path` (XOR enforcement)
- Generates unique id: `pkt-${registry.uid}-${Math.random().toString(36).slice(2, 8)}`
- Calls `currentRegistry().registerPacket({ id, wire, path, duration, delay, r, glow, tone, loop, gap })`
- Emits NO markup

**Verification:**
- Zero hex literals in all three files ✓
- Build passes with 31 pages in <1s ✓
- All 20 tests pass ✓

### Task 3: VvStage Registry-Driven Rendering

**Packet computation (after wireDefs):**
- Added `PacketDef` interface: `{ id, wireRef?, path?, duration, r, glow, tone, beginExpr }`
- Loop over `registry.packets.values()` to compute `beginExpr = loop ? \`${delay};${id}.end+${gap}\` : delay`
- Populate `packetDefs` array for SVG rendering

**Canvas body replacement:**
- **BEFORE:** `<div class="vv-stage-canvas"><svg>...<Fragment set:html={slotHtml}/></svg></div>`
- **AFTER:**
  ```astro
  <div class="vv-stage-canvas">
    {/* HTML node layer */}
    {[...registry.nodes.values()].map((n) => (
      <div class="vv-node vv-anim-{n.animation} vv-tone-{n.tone}"
           style="left: (n.x/vbW)*100%; top: (n.y/vbH)*100%; ...">
        <span class="vv-node-icon" set:html={n.iconHtml} />
        <span class="vv-node-label">{n.label}</span>
      </div>
    ))}
    
    {/* SVG layer */}
    <svg><defs>...</defs><g class="vv-wires">...</g>
      <g class="vv-packets">
        {packetDefs.map((pd) => (
          <circle r={pd.r} ...>
            {pd.wireRef ? (
              <animateMotion ...><mpath href="#wire-{pd.wireRef}"/></animateMotion>
            ) : (
              <animateMotion ... path={pd.path}/>
            )}
            <animate attributeName="opacity" .../>
          </circle>
        ))}
      </g>
    </svg>
  </div>
  ```

**CSS additions:**
- Node base: absolute positioning, flex column, border-left-width 4px, font clamps, opacity 0 → animation
- Node icon sizing: `clamp(22px, 3.2vw, 40px)` for both inline `<svg>` and `[data-icon]`
- Animation variants: `.vv-anim-slide-x`, `.vv-anim-pop`, `.vv-anim-drop`
- 3 keyframes: `vv-slide-x` (translateX), `vv-pop` (scale), `vv-drop` (translateY)

**File:** `VvStage.astro` grew from 224 LOC to 350 LOC (+126 LOC)

**Verification:**
- `registry.nodes.values()` ✓, `registry.packets.values()` ✓, `mpath href` ✓
- `Fragment set:html={slotHtml}` removed from markup ✓ (only in comment)
- 3 keyframes present ✓
- Zero hex literals ✓
- Build passes with 31 pages in 1.06s ✓
- All 20 tests pass ✓

## Deviations from Plan

None — plan executed exactly as written.

## Known Stubs

None. All primitives are fully functional with no placeholder logic.

## Threat Flags

None. No new security-relevant surface introduced — all components are SSR-only with no client-side JS.

## Verification

**Unit tests:** 20 tests pass (10 registry + 5 geom + 5 path)
- New registry tests verify PacketRecord storage/retrieval, enriched NodeRecord fields, packets map isolation
- Existing tests updated to pass full NodeRecord shape

**Build verification:**
- `npm run build` exits 0
- 31 HTML pages generated in 1.06s
- Zero build warnings or errors

**Architecture validation:**
- VvNode/VvWire/VvPacket emit zero visible markup (register-only) ✓
- VvStage iterates `registry.nodes`, `registry.wires`, `registry.packets` ✓
- Node divs rendered as HTML (outside SVG) with percent positioning ✓
- Packet circles rendered as SVG with `<mpath>` when wireRef set, inline path otherwise ✓
- SMIL `begin` expression computes loop formula correctly ✓
- Filter id uses per-stage unique uid (`#glow-{registry.uid}`) ✓

**Acceptance criteria (from PLAN.md):**
- [x] All three child primitives exist at `src/components/visuals/{VvNode,VvWire,VvPacket}.astro`
- [x] Each imports `currentRegistry` (and relevant types) from `./_vv-registry.ts`
- [x] VvNode captures icon slot via `Astro.slots.render('default')` and calls `registerNode` with iconHtml
- [x] VvNode default props: `w=220, h=160, tone='teal', animation='pop', delay=0`
- [x] VvWire computes `id = \`${from}-${to}\`` when `id` prop absent
- [x] VvWire default props: `dashed=false, tone='teal', delay=0`
- [x] VvPacket throws on `!wire && !path` with exact message "VvPacket requires either `wire` or `path` prop"
- [x] VvPacket throws on `wire && path` with exact message containing "pass `wire` OR `path`, not both"
- [x] VvPacket default props: `r=10, glow=true, tone='teal', loop=true, gap='4s'`
- [x] VvPacket computes `pktId = \`pkt-${registry.uid}-<random>\`` for id uniqueness
- [x] Zero hex literals in any of the three primitive files
- [x] `npm run build` exits 0 with 31+ pages
- [x] VvStage iterates `registry.nodes.values()` and emits HTML `<div class="vv-node ...">` blocks
- [x] Each node div uses `set:html={n.iconHtml}` to inject the captured icon slot
- [x] VvStage iterates `registry.packets.values()` and emits `<circle>` with `<animateMotion>` + paired `<animate attributeName="opacity">`
- [x] Packet circles use `<mpath href="#wire-{wireRef}"/>` when wireRef is set; fall back to inline `path={pd.path}` when wire is absent
- [x] `beginExpr` formula is `loop ? '{delay};{id}.end+{gap}' : '{delay}'` — matches D-15 contract
- [x] The old `<Fragment set:html={slotHtml}/>` line has been REMOVED from markup
- [x] The three keyframes `vv-slide-x`, `vv-pop`, `vv-drop` are present
- [x] Zero hex literals outside comments in VvStage.astro

## Commits

1. **f8ca1a4** `test(01-04): extend registry with PacketRecord + enriched NodeRecord`
   - Added VvTone (6 values), VvNodeAnimation (3 values) type unions
   - Enriched NodeRecord with label/tone/animation/delay/iconHtml
   - Added PacketRecord interface + packets Map + registerPacket/getPacket
   - Updated all 7 existing tests + added 3 new tests
   - 20 tests pass (TDD GREEN)

2. **f8e20e9** `feat(01-04): add VvNode, VvWire, VvPacket register-only primitives`
   - Created VvNode (57 LOC), VvWire (37 LOC), VvPacket (53 LOC)
   - All three emit zero markup, register via `currentRegistry()`
   - Zero hex literals
   - Build passes with 31 pages

3. **e7abfda** `feat(01-04): update VvStage to emit nodes + packets from registry`
   - Added packetDefs computation with beginExpr formula
   - Replaced Fragment with node divs + SVG packet circles
   - Added node CSS (base, icon sizing, 3 animations + keyframes)
   - Build passes, 20 tests pass

## Files Modified

| File | Before | After | Δ LOC |
|------|--------|-------|-------|
| `_vv-registry.ts` | 103 | 137 | +34 |
| `VvStage.astro` | 224 | 350 | +126 |
| `vv-registry.test.ts` | 75 | 115 | +40 |
| `VvNode.astro` | — | 57 | +57 |
| `VvWire.astro` | — | 37 | +37 |
| `VvPacket.astro` | — | 53 | +53 |
| **Total** | — | — | **+347** |

## Metrics

- **Duration:** 7 minutes 28 seconds
- **Tasks completed:** 3/3 (100%)
- **Commits:** 3
- **Files created:** 3 (VvNode, VvWire, VvPacket)
- **Files modified:** 3 (_vv-registry, VvStage, vv-registry.test)
- **LOC added:** 347 (147 primitives + 34 registry + 126 VvStage + 40 tests)
- **Test count:** 20 (all pass)
- **Build pages:** 31
- **Build time:** 1.06s

## Next Steps

**Immediate (Plan 05):** Refactor `PodLifecycleAnimation.astro` onto the new primitives. This validates the register-only architecture end-to-end and proves that Slidev slide lift has been reduced from ~30 min to <10 min.

**Dependencies unblocked:**
- Plan 05 (PodLifecycle refactor) can now consume VvNode/VvWire/VvPacket
- Plan 06 (validation + demo page) can use the full primitive set

## Self-Check: PASSED

**Created files exist:**
```bash
[ -f src/components/visuals/VvNode.astro ] && echo "✓ VvNode.astro"
[ -f src/components/visuals/VvWire.astro ] && echo "✓ VvWire.astro"
[ -f src/components/visuals/VvPacket.astro ] && echo "✓ VvPacket.astro"
```
All three files exist ✓

**Commits exist:**
```bash
git log --oneline HEAD~3..HEAD
e7abfda feat(01-04): update VvStage to emit nodes + packets from registry
f8e20e9 feat(01-04): add VvNode, VvWire, VvPacket register-only primitives
f8ca1a4 test(01-04): extend registry with PacketRecord + enriched NodeRecord
```
All three commits present ✓

**Build verification:**
```bash
npm run build
# 31 pages in 1.06s ✓
```

**Test verification:**
```bash
npm run test:unit
# 20 tests pass ✓
```

All self-check criteria passed.
