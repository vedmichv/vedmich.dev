# Research Summary: vedmich.dev v1.0 Content Platform

**Project:** vedmich.dev v1.0
**Domain:** Astro 5 static site enhancement — rich media primitives + Slidev integration
**Researched:** 2026-05-02
**Overall confidence:** HIGH

## Executive Summary

v1.0 Content Platform transforms vedmich.dev from a static portfolio site into a full content platform with three streams: blog posts, Slidev presentation decks, and podcast/talk companion posts. The core value proposition is **reducing Slidev slide porting from ~30 min/slide to <10 min/slide** through reusable primitives (VvStage/VvNode/VvWire/VvPacket Astro components), while adding Excalidraw diagram embedding, upgraded code blocks (language badges + `// [!code highlight]` syntax), and serving Slidev decks as first-party routes under `vedmich.dev/slides/<slug>/`.

**Critical architectural finding:** Astro's Shiki configuration is build-time and markdown-scoped. All code block enhancements (transformers, theme overrides, language badges) must be configured globally in `astro.config.mjs` `markdown.shikiConfig`, not per-component. This makes Wave 2 (code block upgrades) a **global change with regression risk** across all 4 existing blog posts — requires validation phase with screenshot comparison before shipping.

**Slidev integration decision:** Git submodule + build-time copy (Option A from ARCHITECTURE.md) is the clear winner over monorepo or artifact-fetch approaches. Slidev decks already exist as pre-built SPA exports in `vedmichv/slidev` repo. Main site CI checks out the submodule and copies built decks to `dist/slides/` during deploy. No Slidev rebuild per-deploy required; preserves existing 800ms Astro build time with only ~200ms overhead for directory copy. Locale-agnostic (`/slides/<slug>/` serves the SPA, no EN/RU mirroring needed). GitHub Pages serves SPAs correctly via 404-fallback-to-index pattern (already validated by existing `s.vedmich.dev` deployment).

**Top-3 most dangerous pitfalls identified:**
1. **Slidev base path asset resolution failure** (Phase 5 risk): Slidev decks built with wrong `--base` flag won't load assets. Prevention: Always build with `--base /slides/<slug>/` and test direct navigation to slide numbers.
2. **Shiki transformer silent failure on bash/yaml** (Phase 2 risk): `transformerMetaHighlight` may silently skip highlight comments in non-JS languages. Prevention: Test on all existing language types (yaml, bash, typescript, dockerfile) before shipping.
3. **CSS offset-path animation drift** (Phase 1 validation): Using CSS `offset-path` for packet animations causes coordinate-space bugs on responsive containers. Prevention: ALWAYS use SMIL `<animateMotion>` inside SVG viewBox (empirically validated in Phase 9 hotfix).

## Key Findings

### Recommended Stack (from STACK.md)

**Core framework:** Astro 5.17.1 (no changes), Tailwind CSS 4.2.1 (no changes), Node.js 22.x LTS (no changes).

**New dependencies for v1.0:**
- `@shikijs/transformers@^1.0.0` (Wave 2) — provides `transformerMetaHighlight` for `// [!code highlight]` syntax
- `@excalidraw/excalidraw@^0.17.0` (Wave 3, dev dependency only) — SVG export utility for `.excalidraw.json → SVG` conversion. **CRITICAL:** This package is large (~5 MB) and MUST remain a dev dependency, never imported in production components (breaks zero-JS budget). Use only in Node scripts (`scripts/excalidraw-export.mjs`).

**Note on Excalidraw package discrepancy:** ARCHITECTURE.md references `@excalidraw/excalidraw` as the export tool. User prompt mentions `@aldinokemal2104/excalidraw-to-svg` as an alternative. **Decision for roadmapper:** Research both packages during Phase 4 planning. If `@aldinokemal2104/excalidraw-to-svg` is lighter and CLI-based (no Node.js scripting needed), prefer it. If not available or incomplete, use `@excalidraw/excalidraw` as dev dependency only.

**Infrastructure (no npm deps):**
- Git submodule for `vedmichv/slidev` repo (Wave 5)
- SMIL (SVG standard) for packet animations (Wave 1)
- SVGO for diagram optimization (optional, not critical path)

**Alternatives considered and rejected:**
- Mermaid for diagrams (less visual control than Excalidraw)
- CSS animations for packets (coordinate-space bugs, rejected based on Phase 9 hotfix experience)
- Monorepo (Turborepo) for Slidev (overkill for 2-3 decks)
- Artifact fetch for Slidev (slower, more brittle than submodule)

### Expected Features (from FEATURES.md)

**Must have (table stakes):**
- Syntax-highlighted code blocks with language badge — readers expect to see `yaml`, `bash`, `typescript` at a glance (Complexity: 30 min)
- `// [!code highlight]` support via Shiki transformer — tutorial standard since ~2015 (Complexity: 15 min)
- Embedded diagrams — architecture posts need visuals (Complexity: Excalidraw pipeline 30 min)
- Copy code button — already exists (Phase 9), no changes

**Should have (differentiators):**
- Inline animated diagrams (system flow visualizations) — beats static diagrams, unique to vedmich.dev (Complexity: Primitives 6-8h, per-post usage 10 min after primitives exist)
- Slidev deck integration at `vedmich.dev/slides/<slug>/` — unified domain, better brand cohesion (Complexity: Submodule + CI 4-6h, first deck routing 60 min, subsequent decks 15 min)
- Zero-JS-by-default maintained — no compromise on performance
- Deep Signal brand consistency — every visual uses teal/amber palette (Complexity: Deep Signal Shiki theme 45 min CSS overrides)

**Defer (v2+):**
- RSS feed — table stakes but low urgency (not in v1.0 scope per PROJECT.md)
- Real-time search (Pagefind/Algolia) — anti-feature until >50 posts
- Interactive Excalidraw in posts — breaks zero-JS budget (anti-feature)
- Comments section — spam burden, readers engage on LinkedIn/X anyway (anti-feature)

**Feature complexity estimates (from FEATURES.md):**
- Language badge: 30 min
- Highlight transformer: 15 min
- Deep Signal Shiki theme (CSS overrides): 45 min
- Excalidraw pipeline: 30 min
- First Slidev deck integration: 90 min + 60 min routing = 150 min
- Companion post: 90 min each (via vv-blog-from-vault skill)
- UI polish (CTAs): 50 min total

### Architecture Approach (from ARCHITECTURE.md)

**7-phase structure with checkpoint-gated codegen:**

1. **Primitives (Wave 1):** 4 Astro components (VvStage, VvNode, VvWire, VvPacket) + refactor PodLifecycleAnimation as validation
2. **Code block upgrades (Wave 2):** Shiki config + transformers + language badge + Deep Signal theme override
3. **UI polish:** "See all →" CTAs for Blog + Presentations sections
4. **Excalidraw pipeline (Wave 3):** Node script + replace ASCII diagrams
5. **Slidev integration:** Git submodule + CI copy + DNS decision
6. **Companion posts:** 2+ posts validating pipeline (1 DKT + 1 AWS RU)
7. **Codegen (Wave 4, OPTIONAL):** Slidev → Astro transpiler, only if manual lift after primitives is still >15 min/slide

**Major components:**

| Component | Responsibility | Key Pattern |
|-----------|---------------|-------------|
| `VvStage.astro` | 1800×820 design canvas, viewBox container, responsive sizing | Slot-based composition (`slot="nodes"`, `slot="wires"`) |
| `VvNode.astro` | Positioned box with icon + label + entry animation | Explicit x/y props (no coordinate abstraction) |
| `VvWire.astro` | SVG line with fade-in | Lives inside VvStage SVG overlay |
| `VvPacket.astro` | SMIL-animated circle along path | `<animateMotion>` with looping + pause |
| `CodeCopyEnhancer.astro` | Wraps code blocks with copy button + language badge | Reads `data-language` from Shiki-rendered `<pre>` |
| `excalidraw-export.mjs` | `.excalidraw.json → SVG` converter | Node script, dev-time only |
| `slidev-to-astro.mjs` (optional) | Parses Slidev slide, emits Astro component | Wave 4 codegen, only if checkpoint passes |

**Data flow for blog post authoring (with rich media):**
1. Author writes MDX in `src/content/blog/{en,ru}/YYYY-MM-DD-slug.mdx`
2. Imports primitives: `import VvStage from '../../../components/visuals/VvStage.astro';`
3. Composes animation inline with explicit coordinates
4. Embeds Excalidraw SVG: `![Diagram](../../../public/blog-assets/<slug>/diagrams/arch.svg)`
5. Writes code block with highlight: `apiVersion: v1 // [!code highlight]`
6. Astro builds: MDX → Astro component, Shiki processes code, VvStage renders inline SVG
7. Output: static HTML with zero runtime JS (except scroll animations + menu toggle)

**Data flow for Slidev deck deployment:**
1. Author builds deck locally in `vedmichv/slidev/<slug>/`: `slidev build --base /slides/<slug>/`
2. Commits built SPA to `vedmichv/slidev` repo main branch
3. In `vedmich.dev`: `git submodule update --remote slidev && git commit && git push`
4. GitHub Actions CI: checkout + build Astro (800ms) + copy `slidev/<slug>/` to `dist/slides/` (~200ms) + deploy
5. Result: `vedmich.dev/slides/<slug>/` serves Slidev SPA, client-side routing via Vue Router

### Critical Pitfalls (from PITFALLS.md)

**All 12 pitfalls with prevention strategies:**

#### Critical (cause rewrites or major issues)

1. **CSS `offset-path` for packet animations in responsive containers**
   - **What breaks:** Packets drift off wires on mobile/tablet viewports
   - **Why:** CSS coordinate space scales with container; SVG viewBox doesn't
   - **Prevention:** ALWAYS use SMIL `<animateMotion>` inside SVG with stable viewBox
   - **Detection:** Test animation on 375px, 768px, 1440px widths
   - **Evidence:** Empirically validated in Phase 9 hotfix, documented in `PodLifecycleAnimation.astro`

2. **Global Shiki config change without regression testing all posts**
   - **What breaks:** Code blocks render with wrong colors, highlight syntax ignored, or build fails
   - **Why:** Shiki is build-time and markdown-scoped; no per-post override
   - **Prevention:** Test on 3-5 existing posts, pin Astro version, screenshot comparison (Playwright)
   - **Detection:** Build succeeds but code blocks look wrong

3. **Rebuilding Slidev decks on every main site deploy**
   - **What breaks:** CI time balloons from 2 min to 5+ min; Slidev errors block site deploys
   - **Why:** Misunderstanding Slidev workflow (thinking decks must build from source)
   - **Prevention:** Pre-build in separate repo, commit artifacts, copy via submodule
   - **Detection:** CI takes >3 min; `package.json` has `@slidev/cli` or `vue` deps

4. **Hardcoding animation coordinates in component logic**
   - **What breaks:** Opaque components; can't tell layout from MDX call site
   - **Why:** Trying to be DRY by abstracting coordinates
   - **Prevention:** Accept explicit x/y/path props visible in MDX
   - **Detection:** Can't tell where a node is positioned by reading MDX

#### Moderate (painful but fixable)

5. **Not pinning Astro version during Shiki work**
   - **Prevention:** Pin to exact version in `package.json` during v1.0 (already `5.17.1`)

6. **Using `@excalidraw/excalidraw` in production bundle**
   - **Prevention:** Dev dependency only, never import in components
   - **Detection:** Bundle size +1MB, Lighthouse slow JS parse warning

7. **Forgetting to update git submodule after adding new deck**
   - **Prevention:** Document workflow in CLAUDE.md, add CI check for submodule drift
   - **Detection:** Deck exists in `vedmichv/slidev` but 404s on live site

8. **Language badge implementation as runtime JS**
   - **Prevention:** Remark plugin (build-time) OR SSR script via `is:inline`
   - **Detection:** Lighthouse warning, badge flickers on load (FOUC)

#### Minor (nuisances)

9. **Excalidraw SVG export without viewBox optimization**
   - **Prevention:** Zoom to fit before export, or post-process with SVGO
   - **Detection:** SVG file >500 KB for simple diagram

10. **Not testing Slidev client-side routing**
    - **Prevention:** Test direct navigation to `/slides/<slug>/5` (not just root)
    - **Detection:** Slide numbers return 404

11. **Shiki theme CSS overrides not scoped to `.prose`**
    - **Prevention:** Scope to `.prose .shiki` to avoid affecting non-blog code blocks
    - **Detection:** Homepage snippets (if any) have wrong colors

12. **Slidev base path asset resolution failure**
    - **Prevention:** Always build with `--base /slides/<slug>/`, test asset loading
    - **Detection:** Deck loads but images/CSS broken

**Phase-specific warnings (from PITFALLS.md):**

| Phase | Likely Pitfall | Mitigation |
|-------|---------------|------------|
| Wave 1 (Primitives) | Pitfall 4 (hardcoded coords) | Explicit API design review; validate on one slide first |
| Wave 2 (Shiki) | Pitfall 2 (global regression) | Test all 4 posts; pin Astro version; screenshot comparison |
| Wave 2 (Shiki) | Pitfall 8 (runtime JS badge) | Research spike: remark plugin first, fall back to SSR |
| Wave 3 (Excalidraw) | Pitfall 6 (prod bundle) | Keep as dev dep, only use in scripts |
| Wave 4 (Codegen) | Unknown parsing complexity | Timebox to 10-15h; abort if exceeds 20h |
| Wave 5 (Slidev) | Pitfall 3 (rebuilding in CI) | Pre-build in separate repo, copy static artifacts |
| Wave 5 (Slidev) | Pitfall 7 (submodule update) | Document workflow; add CI check |
| Wave 5 (Slidev) | Pitfall 10, 12 (routing/assets) | Test direct navigation + asset loading |
| Wave 6 (Companion posts) | Pitfall 1 (CSS offset-path) | Use primitives (SMIL-based); ban CSS offset-path |

## Implications for Roadmap

### Phase Sequence (7 phases, Wave 4 optional)

**Phases 1-6 deliver v1.0 exit criteria. Phase 7 (codegen) triggered only if checkpoint after Phase 1 shows manual lift still >15 min/slide.**

#### Phase 1: Rich Media Primitives (Wave 1) — 6-8h
**Rationale:** Foundational layer. New files + one refactor (PodLifecycleAnimation). Low regression risk. Validates API shape before dependent work (codegen, companion posts) builds atop it.

**Delivers:**
- `src/components/visuals/VvStage.astro`
- `src/components/visuals/VvNode.astro`
- `src/components/visuals/VvWire.astro`
- `src/components/visuals/VvPacket.astro`
- Refactored `PodLifecycleAnimation.astro` using primitives (validation test)

**Addresses features:**
- Inline animated diagrams (differentiator)
- Reduce Slidev → blog post lift from 30 min to <10 min (exit criterion)

**Avoids pitfalls:**
- Pitfall 1 (CSS offset-path) — SMIL primitives from the start
- Pitfall 4 (hardcoded coords) — explicit x/y props in API

**Validation gate:** Visual test PodLifecycleAnimation on `/blog/karpenter-right-sizing` (live) — packets, wires, nodes render identically to current version.

**Needs deeper research:** NO (pattern validated by Slidev Vue components + Phase 9 hotfix)

---

#### Phase 2: Code Block Upgrades (Wave 2) — 4-6h
**Rationale:** Global Shiki config change. Highest regression risk (affects all 4 existing posts). Run early while post count is low; easier to fix 4 posts than 20.

**Delivers:**
- `astro.config.mjs` markdown.shikiConfig with `transformerMetaHighlight` + theme override
- `package.json` add `@shikijs/transformers@^1.0.0`
- Language badge implementation (remark plugin OR extend CodeCopyEnhancer)
- `src/styles/global.css` add `.code-lang-badge` + Shiki token overrides for Deep Signal

**Addresses features:**
- Language badge on code blocks (table stakes, 30 min)
- `// [!code highlight]` syntax (table stakes, 15 min)
- Deep Signal Shiki theme (differentiator, 45 min CSS overrides)

**Avoids pitfalls:**
- Pitfall 2 (global Shiki regression) — test all 4 posts, screenshot comparison
- Pitfall 5 (Astro version drift) — pin version
- Pitfall 8 (runtime JS badge) — prefer remark plugin
- Pitfall 11 (CSS scope) — scope overrides to `.prose .shiki`

**Validation gate:**
- All 4 blog posts render without errors
- Language badges appear (if implemented)
- Copy button works
- `// [!code highlight]` comments highlight correctly (test in new post)
- Build time remains <1s
- Playwright screenshot comparison for one post

**Needs deeper research:** MAYBE (language badge implementation path)
- **Research spike:** Allocate 1h for "remark plugin for language badges" research during Phase 2 planning
- **Decision tree:** If spike reveals complexity >2h, fall back to extending CodeCopyEnhancer (SSR via `is:inline`)

---

#### Phase 3: UI Polish — CTAs — 1-2h
**Rationale:** Fast win. Improves homepage UX immediately. Independent of all other waves; can run in parallel with Phase 1 or 2, or as a breather between complex phases.

**Delivers:**
- `src/components/BlogPreview.astro` — add bottom "See all →" CTA
- `src/components/Presentations.astro` — add bottom "See all →" CTA
- i18n keys (reuse existing or add `_bottom` variants)

**Addresses features:**
- Discoverability for full blog + presentations index pages (UI polish, 50 min total per FEATURES.md)

**Avoids pitfalls:** None (low-risk component modifications)

**Validation gate:** Visual test homepage `/en/` and `/ru/` — CTAs appear, link to correct routes.

**Needs deeper research:** NO (standard Astro component modification)

---

#### Phase 4: Excalidraw Integration (Wave 3) — 2-3h
**Rationale:** Independent of primitives and Shiki. Low risk (only adds new assets). Unblocks companion posts that need diagrams.

**Delivers:**
- `scripts/excalidraw-export.mjs` — Node script using `@excalidraw/excalidraw` OR `@aldinokemal2104/excalidraw-to-svg`
- Replace ASCII diagram in MCP post (`2026-03-15-mcp-intro.md`) with Excalidraw SVG
- Add 1-2 more diagrams in existing posts for stress-testing
- Convention: `public/blog-assets/<slug>/diagrams/<name>.svg`

**Addresses features:**
- Embedded diagrams (table stakes, 30 min pipeline setup)

**Avoids pitfalls:**
- Pitfall 6 (excalidraw in prod bundle) — dev dependency only, use in Node scripts
- Pitfall 9 (SVG bloat) — zoom to fit before export

**Validation gate:** MCP post renders with SVG diagram (not ASCII). Diagram readable on mobile + desktop.

**Needs deeper research:** NO (straightforward npm package usage)
- **Decision point:** Research both `@excalidraw/excalidraw` (5 MB, comprehensive) and `@aldinokemal2104/excalidraw-to-svg` (lighter, CLI-based?) during Phase 4 planning. Choose lighter option if feature-complete.

---

#### Phase 5: Slidev Integration — 4-6h
**Rationale:** Big infrastructure change (git submodule + CI modification). Isolated risk — doesn't touch Astro build or existing components. Best run after primitives + code blocks validated, so issues don't compound.

**Delivers:**
- Add `slidev/` git submodule (points to `vedmichv/slidev` repo main branch)
- `.github/workflows/deploy.yml` — add submodule checkout + copy `slidev/*/` to `dist/slides/`
- DNS decision for `s.vedmich.dev` (keep with 301 redirect OR remove CNAME)
- Document "add a new deck" workflow in `.planning/notes/slidev-workflow.md` or CLAUDE.md

**Addresses features:**
- Slidev deck integration at `vedmich.dev/slides/<slug>/` (differentiator, 90 min first deck + 60 min routing)
- Unified domain for blog + presentations (brand cohesion)

**Avoids pitfalls:**
- Pitfall 3 (rebuilding Slidev in CI) — pre-build in separate repo, copy static files
- Pitfall 7 (forgetting submodule update) — document workflow, add CI check
- Pitfall 10 (client-side routing broken) — test direct navigation to `/slides/<slug>/3`
- Pitfall 12 (base path assets broken) — document `--base /slides/<slug>/` flag in workflow

**Validation gate:**
- `npm run build` completes in <1s for Astro pages (Slidev copy is external)
- Total CI time < 2 min (build ~800ms + copy ~200ms + deploy ~60s)
- `vedmich.dev/slides/slurm-prompt-engineering/` serves SPA correctly
- Test client-side routing within SPA (`/slides/<slug>/1`, `/slides/<slug>/2`)
- Test asset loading (images, theme CSS)

**Needs deeper research:** MAYBE (DNS only)
- **Research task:** DNS audit during Phase 5 planning — check Route 53 records + external backlinks to `s.vedmich.dev` URLs
- **Decision tree:**
  - No external backlinks → remove CNAME, update internal references
  - External backlinks exist → keep CNAME, add 301 redirect in old repo's `index.html` to `vedmich.dev/slides/`

---

#### Phase 6: Companion Posts (content validation) — 3-4h per post
**Rationale:** Validates entire pipeline (primitives + diagrams + Slidev decks) on production content. Depends on primitives (if posts use animations) and Excalidraw (if posts use diagrams). Run after infrastructure is stable.

**Delivers:**
- 1 DKT companion post (e.g., DKT91 mock interview — uses PodLifecycleAnimation or new primitive-based animation)
- 1 AWS RU Podcast companion post (e.g., agentic AI patterns episode — uses diagrams)
- Both posts in EN + RU locales (total 4 MDX files)

**Addresses features:**
- Podcast companion posts (differentiator)
- Exit criterion: Ship ≥2 companion posts

**Avoids pitfalls:**
- Pitfall 1 (CSS offset-path) — use primitives for all animations

**Validation gate:**
- Posts render correctly with animations + diagrams
- vv-blog-from-vault skill successfully routes visuals (PNG → reuse, complex → primitives, arch → Excalidraw)
- Reading time, tags, metadata all correct

**Needs deeper research:** NO (uses existing vv-blog-from-vault skill)

---

#### Phase 7 (OPTIONAL): Slidev → Astro Codegen (Wave 4) — 10-15h
**Rationale:** Only proceed if checkpoint after Phase 1 shows manual slide porting is still >15 min/slide. If primitives drop lift time to 10-12 min (within target), codegen ROI is marginal.

**Checkpoint condition:** After Phase 1 (primitives), re-port one slide from Slidev to Astro using primitives. If elapsed time >15 min, proceed with Phase 7. If <15 min, skip Phase 7 entirely.

**Delivers (if checkpoint passes):**
- `scripts/slidev-to-astro.mjs` — reads Slidev `.md` + scoped style, emits Astro component using primitives
- Handles at least 2 slide patterns (S1 arch-grid + S2 lifecycle)
- Documented limitations (which slides port cleanly, which need manual tweaks)

**Addresses features:**
- Automate mechanical transforms (Iconify → inline SVG, token swaps, coordinate extraction)

**Avoids pitfalls:**
- Over-engineering if manual porting is fast enough

**Validation gate (if phase runs):** Codegen script successfully ports one real slide (e.g., Pod lifecycle slide 84). Output Astro component renders identically to hand-ported version.

**Needs deeper research:** YES (complexity unknown until attempted)
- **Mitigation:** Timebox to 10-15h. If complexity exceeds 20h, abort and accept manual porting workflow.

---

### Phase Ordering Rationale

**Sequential dependencies:**
- Phase 1 → Phase 7 (codegen depends on primitives existing)
- Phase 1 + Phase 4 → Phase 6 (companion posts depend on primitives + diagrams)
- Phase 2 → Phase 6 (companion posts will have code blocks; Shiki config must be stable first)

**Parallel opportunities:**
- Phase 3 (Polish) can run in parallel with Phase 1 or 2 (different files, no dependencies)
- Phase 4 (Excalidraw) can run in parallel with Phase 3 (independent)
- Phase 5 (Slidev) should NOT run in parallel with Phase 2 (both modify CI / build paths — merge conflict risk)

**Critical path (longest dependency chain):**
Phase 1 → Phase 4 → Phase 6 = 11-15h

**Total effort estimates:**
- **Base (Phases 1-6, no codegen):** 20-27h
- **With codegen (if triggered):** 30-42h

**Why this order beats alternatives:**
1. **Primitives first** — low risk (new files), foundational for everything else
2. **Shiki early** — global change, easier to validate when post count is low (4 vs 20)
3. **Polish early** — fast win, morale boost, independent
4. **Excalidraw before companion posts** — companion posts will need diagrams
5. **Slidev isolated** — big CI change, don't couple with other work
6. **Companion posts late** — validates entire pipeline is stable
7. **Codegen last and optional** — only if manual lift is still painful

### Research Flags

| Phase | Needs Research? | Reason |
|-------|----------------|--------|
| Phase 1 (Primitives) | NO | Pattern validated (Slidev Vue + Phase 9 hotfix) |
| Phase 2 (Shiki) | MAYBE | Language badge implementation path unclear (remark vs CodeCopyEnhancer). **Action:** Allocate 1h research spike, timeboxed. |
| Phase 3 (Polish) | NO | Standard component modification |
| Phase 4 (Excalidraw) | NO | Straightforward npm package usage. **Action:** Compare two packages (`@excalidraw/excalidraw` vs `@aldinokemal2104/excalidraw-to-svg`) during planning. |
| Phase 5 (Slidev) | MAYBE (DNS) | Submodule + CI is standard. **Action:** DNS audit (15 min) — check Route 53 + external backlinks to `s.vedmich.dev`. |
| Phase 6 (Companion posts) | NO | Uses existing vv-blog-from-vault skill |
| Phase 7 (Codegen) | YES | Complexity unknown (HTML + CSS parsing). **Action:** Checkpoint after Phase 1 determines if phase runs. Timebox to 10-15h if triggered. |

## Confidence Assessment

| Area | Confidence | Reason |
|------|------------|--------|
| **Primitives API** | HIGH | Slidev pattern validated; Astro slot-based composition is idiomatic; Phase 9 hotfix proves it works |
| **Shiki config** | MEDIUM | Context7-verified config shape, but CSS override for theme is fragile (Shiki may change token classes) |
| **Language badge** | MEDIUM | Two implementation paths (remark vs CodeCopyEnhancer); neither prototyped yet. Research spike needed. |
| **Excalidraw export** | HIGH | `@excalidraw/excalidraw` has documented SVG export utility; static export is well-supported |
| **Slidev integration** | HIGH | Git submodule + CI copy is standard pattern; GitHub Pages SPA serving proven by existing `s.vedmich.dev` deployment |
| **Build time impact** | HIGH | Slidev copy is ~200ms (empirical), primitives are zero-JS inline CSS/SVG (no runtime cost) |
| **Regression risk** | MEDIUM | Shiki config is global; needs validation against all existing posts (screenshot comparison required) |
| **Codegen (Wave 4)** | LOW | Not prototyped; complexity unknown; flagged as optional checkpoint (may not run) |

**Overall confidence:** HIGH (for Phases 1-6); LOW for Phase 7 (unknown unknowns in codegen)

### Gaps to Address During Planning

#### Gap 1: Language Badge Implementation Path
**Nature:** Two approaches (remark plugin vs extend CodeCopyEnhancer), neither validated yet.

**Impact:** Phase 2 timing uncertainty (4h vs 6h).

**Mitigation:**
- Add "research spike: remark plugin for language badges" as first task in Phase 2 plan
- Timebox to 1h
- If spike reveals complexity >2h, fall back to extending CodeCopyEnhancer (known pattern, SSR via `is:inline`)

#### Gap 2: DNS for `s.vedmich.dev`
**Nature:** Operational decision — keep legacy CNAME (with 301 redirect) or remove it?

**Impact:** Phase 5 completeness. If CNAME removal breaks external links, needs redirect setup.

**Mitigation:**
- Add "DNS audit" as first task in Phase 5 plan
- Check Route 53 records + external backlinks to `s.vedmich.dev` URLs
- **Decision tree:**
  - No external backlinks → remove CNAME, update internal references
  - External backlinks exist → keep CNAME, add 301 redirect in old repo's `index.html` to `vedmich.dev/slides/`

#### Gap 3: Excalidraw Package Choice
**Nature:** Two packages available (`@excalidraw/excalidraw` 5 MB vs `@aldinokemal2104/excalidraw-to-svg` lighter?).

**Impact:** Dev dependency size, script complexity.

**Mitigation:**
- Research both packages during Phase 4 planning (15 min)
- **Prefer:** `@aldinokemal2104/excalidraw-to-svg` if it's CLI-based and feature-complete (lighter, simpler)
- **Fall back:** `@excalidraw/excalidraw` if alternative is incomplete (proven, documented)

#### Gap 4: Shiki Theme Deep Signal Fidelity
**Nature:** CSS overrides are fragile; Shiki may change token class names between versions.

**Impact:** Visual regression risk on code blocks after Astro upgrade.

**Mitigation:**
- Pin `astro` version in `package.json` during v1.0 (already done: `5.17.1`)
- Document in CLAUDE.md: "When upgrading Astro, re-test code block rendering on all posts"
- Consider creating full Shiki theme JSON in future maintenance phase if CSS overrides become painful (not v1.0 scope)

#### Gap 5: Codegen Complexity (Wave 4)
**Nature:** Unknown unknowns in HTML + CSS parsing for slide coordinates.

**Impact:** Phase 7 may be 10-15h (estimated) or 20-30h (if parsing harder than expected).

**Mitigation:**
- Wave 4 is OPTIONAL
- Checkpoint after Phase 1: if primitives drop manual lift to <15 min/slide, skip codegen entirely
- If codegen proceeds, timebox to 10-15h and accept it may expand to 20h
- This is why it's last — doesn't block other work

## Exit Criteria Validation (from PROJECT.md)

v1.0 milestone defines 6 exit criteria. Research confirms path to each:

| Exit Criterion | How Research Addresses It |
|----------------|---------------------------|
| **1. Slidev slide lift < 10 min/slide** (down from ~30 min) | Phase 1 primitives deliver reusable components with explicit coordinates. FEATURES.md estimates 10 min per-post usage after primitives exist. Validation: re-port PodLifecycleAnimation using primitives as proof. |
| **2. At least 1 Excalidraw diagram embedded** (MCP post minimum, 2-3 desirable) | Phase 4 pipeline delivers export script + replaces ASCII diagram in MCP post + adds 1-2 more. FEATURES.md estimates 30 min pipeline setup. |
| **3. Code blocks render language badge + support `// [!code highlight]`** | Phase 2 Shiki upgrades deliver both. FEATURES.md estimates 30 min badge + 15 min transformer + 45 min theme. |
| **4. Slidev decks served under `vedmich.dev/slides/<slug>/`** | Phase 5 submodule + CI copy delivers this. FEATURES.md estimates 90 min first deck + 60 min routing. |
| **5. "See all →" CTAs at top and bottom of Blog + Presentations sections** | Phase 3 polish delivers this. FEATURES.md estimates 50 min total. |
| **6. ≥ 2 companion posts shipped (1 DKT + 1 AWS RU)** | Phase 6 content work delivers this. FEATURES.md estimates 90 min per post via vv-blog-from-vault skill. |

**All exit criteria achievable within Phases 1-6 (20-27h base effort).**

## Open Questions for Orchestrator

1. **Is Phase 7 (codegen) in scope for v1.0, or defer to v1.1?**
   - **Pro of including:** Completes the "reduce slide lift to <10 min" goal if primitives alone don't hit target
   - **Pro of deferring:** Reduces v1.0 scope by 10-15h; codegen can be a separate tool milestone
   - **Recommendation:** Keep as OPTIONAL Phase 7 with checkpoint after Phase 1. If checkpoint fails (manual lift still >15 min), proceed. If checkpoint passes, defer to v1.1.

2. **Should Phase 6 (companion posts) be in v1.0 or a separate ongoing content milestone?**
   - **Observation:** v1.0 deliverables are infrastructure (primitives, Shiki, Slidev, diagrams). Companion posts validate the pipeline but aren't infrastructure.
   - **Recommendation:** Keep 2 companion posts in v1.0 as validation (proves pipeline works end-to-end). Move "ongoing companion post stream" to a separate content milestone (not time-bound).

3. **DNS policy for `s.vedmich.dev` subdomain?**
   - **Options:** (A) Keep CNAME with 301 redirect, (B) Remove CNAME entirely
   - **Recommendation:** Defer decision to Phase 5 planning after DNS audit. If external backlinks exist, keep with redirect. If none, remove.

4. **Should Phase 3 (Polish CTAs) be v1.0 or quick follow-on?**
   - **Observation:** 1-2h, improves UX, independent of content platform features
   - **Recommendation:** Keep in v1.0 — it's fast, low risk, and a visible win

5. **Excalidraw font strategy?**
   - **Question:** Excalidraw uses Virgil font for handwritten look. Self-host Virgil WOFF2 or use system fonts?
   - **Recommendation:** Defer to Phase 4 planning. Test exported SVG first — if Virgil is embedded in SVG (likely), no action needed. If SVG references external font, either (A) self-host Virgil, (B) convert text to paths in export, or (C) accept system font fallback.

## Sources

### Primary (HIGH confidence)
- **Astro Shiki configuration** — Context7 `/websites/astro_build_en`
  - https://docs.astro.build/en/reference/configuration-reference/#markdownshikiconfig
  - https://docs.astro.build/en/guides/syntax-highlighting/
- **Shiki transformers** — Context7 verified `@shikijs/transformers` package
  - https://shiki.style/packages/transformers
- **Astro MDX integration** — Project `package.json` + `astro.config.mjs` inspection
- **Git submodule CI pattern** — Standard GitHub Actions pattern (widely used)
- **SMIL vs CSS offset-path** — Phase 9 hotfix experience, documented in `PodLifecycleAnimation.astro` (empirical validation)
- **Astro build performance** — Empirical (current 31 pages in 800ms) + Astro architecture

### Secondary (MEDIUM confidence)
- **Excalidraw SVG export** — `@excalidraw/excalidraw` npm package docs + alternative `@aldinokemal2104/excalidraw-to-svg` (not Context7-verified)
- **Slidev build command** — `vedmichv/slidev` repo inspection + Slidev docs (not Context7-verified)
  - `slidev build --base /path/` is documented Slidev CLI usage
- **Feature expectations** — Analysis of 20+ technical blogs (Hashnode, Dev.to, Medium) — qualitative assessment of table stakes

### Tertiary (LOW confidence)
- **Codegen complexity (Wave 4)** — Inferred from problem description, not prototyped (HIGH uncertainty)

---

*Research completed: 2026-05-02*  
*Ready for roadmap: YES*  
*Total estimated effort: 20-27h (base, Phases 1-6) / 30-42h (with optional Phase 7 if triggered)*
